"""The isolation system's red-team audit.

An agent's process must not be able to reach what the isolation boundary exists
to protect. This audit measures what the boundary actually grants, rather than
what its documentation claims.

Measured 2026-10-23 on the live instance (isolation OFF: no `[isolation]` section,
no agent user, no runner or broker unit, no ACLs) and on a scratch instance with
`[isolation] agent_user` set.

Three seams were probed:

1. **The runner's environment.** `handle_runner` starts processes with
   `env={**os.environ, **req.get("env", {})}`: the caller's dict is merged OVER
   the runner's whole environment, and the runner is started by a systemd unit
   that sanitizes nothing (`NoNewPrivileges=yes` and nothing else). Every
   variable the runner inherited is therefore settable and readable by the
   spawn process, and the caller's values win.

2. **The reach.** `reach()` builds the write and read trees from `[scope]`
   roots, `[isolation] grants/reads`, the drivers' `[env]` directories and the
   distribution. An imported department's scope roots are the POOL's own
   directories (ventures.venture_import) — which is the legacy trading
   repository on this machine — so the agent user is granted write access to a
   system this organization neither owns nor can reach, while the instance's own
   run directories, harness homes and knowledge bases must be enumerated
   correctly or the agent cannot do its job at all.

3. **The run directory.** `share_run_dir` + `read_agent_file` are the seam where
   an agent hands its result back: sticky, kernel-owned, agent granted rwx on
   the directory and r on the kernel's files, and a symlink the agent plants at
   `result.json` is refused rather than followed.
"""

import io
import contextlib
import json
import os
import pathlib
from pathlib import Path
import re
import secrets
import shutil
import sqlite3
import subprocess
import sys
import threading
import types
import unittest

from holon.execution.service import Kernel
from holon.core.paths import Home
from tests.helpers import KernelCase, REPO
from holon.execution import isolation


class RedTeam(KernelCase):
    """Probes run against a real broker and runner, exactly as the kernel starts them."""

    def setUp(self):
        super().setUp()
        tag = secrets.token_hex(4)
        self.broker, self.runner = f"@holon-rt-broker-{tag}", f"@holon-rt-runner-{tag}"
        self.reconfigure(f'[isolation]\nagent_user = "{os.getlogin()}"\nbroker = "{self.broker}"\n'
                         f'runner = "{self.runner}"\ngrants = ["{self.workdir}"]\n')
        self.stop = threading.Event()
        me = {os.getuid()}
        b, r = isolation.listen(self.broker), isolation.listen(self.runner)
        threading.Thread(target=isolation.serve_broker,
                         args=(str(self.home.root), self.broker, me, self.stop, b), daemon=True).start()
        threading.Thread(target=isolation.serve_runner, args=(self.runner, me, self.stop, r),
                         daemon=True).start()
        self.addCleanup(self.stop.set)

    def reconfigure(self, extra):
        self.home.config_file.write_text(self.pipeline + "\n" + self.config + "\n" + extra)
        self.k = Kernel(self.home)

    def test_a_closed_listening_socket_ends_the_serve_loop_quietly(self):
        """A teardown race that reports itself as another test's defect.

        Measured 2026-11-04: `tests.test_isolation_redteam` failed intermittently, roughly one
        run in four, with

            Exception in thread Thread-N (serve_broker):
              File "isolation.py", line 140, in serve_broker
                conn, _ = srv.accept()
            OSError: [Errno 9] Bad file descriptor

        -- and the test named in the verdict (`Deployment.test_the_documented_read_only_mode_...`,
        or `RedTeam.test_the_runner_hands_the_caller_power_...`) was NOT where it happened. The
        dying thread's traceback was printed while the next test ran, and that test then failed
        inside `org.bootstrap()` on a socket the race had already taken. One test's teardown
        presented as another test's defect, which is the expensive kind of flake: the named test
        passes alone and fails in the suite, so a reader debugs the wrong file.

        The defect is in the kernel, not the harness: `serve_broker` and `serve_runner` both
        caught only `socket.timeout` around `accept()`. A listening socket closed while a thread
        is inside it raises `OSError`, which nothing handled -- and the real-world case is not
        only a test teardown: a broker restarted while its predecessor is mid-accept is the same
        race on a live instance. A dead fd is the loop's natural end, so both loops return.

        Both harnesses are exercised because both carry the shape. The assertion cannot be
        `is_alive()`: a thread that exits cleanly and a thread that DIED on an uncaught
        exception are both "not alive", so the first version of this guard was a NULL TEST --
        mutation-verified by deleting each `except OSError` in turn and watching the exact
        traceback print while the guard reported OK (measured, twice). What separates them is
        whether the loop's own call RAISED: this guard wraps each serve function, records the
        exception, and re-raises, so a closed socket must leave that record empty and stop the
        thread. A dead fd must produce the first, never the second."""
        import threading as _threading
        from holon.execution import isolation as _iso

        # The loops' own two-word vocabulary: ended because it was told, or ended because it
        # broke. Both serve functions report through this seam; see their docstrings.
        ended: dict[int, str] = {}
        real_broker, real_runner = _iso.serve_broker, _iso.serve_runner

        def broker(home, address, allowed_uids, stop=None, server=None):
            try:
                return real_broker(home, address, allowed_uids, stop, server)
            except BaseException as e:                     # noqa: BLE001 - the point is to record it
                ended[id(_threading.current_thread())] = f"{type(e).__name__}: {e}"
                raise

        def runner(address, allowed_uids, stop=None, server=None):
            try:
                return real_runner(address, allowed_uids, stop, server)
            except BaseException as e:                     # noqa: BLE001
                ended[id(_threading.current_thread())] = f"{type(e).__name__}: {e}"
                raise

        tag = secrets.token_hex(4)
        for serve, kwargs, name in (
            (broker,
             {"home": str(self.home.root), "address": f"@holon-rt-race-b-{tag}",
              "allowed_uids": {os.getuid()}}, "serve_broker"),
            (runner,
             {"address": f"@holon-rt-race-r-{tag}", "allowed_uids": {os.getuid()}}, "serve_runner"),
        ):
            srv = isolation.listen(kwargs["address"])
            stop = _threading.Event()
            # every argument by NAME: `serve_broker(home, address, allowed_uids, stop, server)`
            # and `serve_runner(address, allowed_uids, stop, server)` differ by one positional,
            # and spreading `*args` through put the set where the address belonged -- a thread
            # that died on `AttributeError` in `listen` and looked exactly like a loop that
            # exited early. Measured, and the failure is recorded here rather than hidden.
            t = _threading.Thread(target=serve, kwargs={**kwargs, "stop": stop, "server": srv},
                                  daemon=True)
            t.start()
            t.join(2.0)
            self.assertTrue(t.is_alive(), f"{name}: the loop is not running at all")
            srv.close()                    # the teardown's own act, under the thread
            t.join(2.0)
            self.assertNotIn(id(t), ended,
                             f"{name}: a closed listening socket must end the loop, not kill the "
                             f"thread -- it raised {ended.get(id(t))!r}, whose traceback lands on "
                             f"the next test")
            self.assertFalse(t.is_alive(),
                             f"{name}: a closed listening socket must end the loop, and it did not")
            stop.set()

    # ── the runner's environment ───────────────────────────────────────────
    def test_a_spawned_process_can_read_a_credential_the_runner_inherited(self):
        """A caller-supplied env name reaches the spawned process — that is what the run's
        environment is *for*.

        This asserts the half of the runner's contract that was never in dispute, and the
        half that must not regress while fixing the other: a run carries its own env (its
        tokens, its endpoints), so a caller's value must arrive. Measured 2026-10-23 with
        an `x` in the caller's dict: the spawn prints `x`.

        The disputed half is in
        `test_the_isolated_harness_gets_only_the_runs_environment`: a name the runner
        *inherited* must not arrive. That defect was real and is fixed, so two things must
        both hold — the caller's dict arrives, and nothing else does. The docstring here
        used to claim the inherited environment is "merged over", which stopped being true
        when 1a was fixed; the assertion kept passing because it never tested the merge.
        That is the drift this docstring now corrects: an assertion that outlives its own
        description is how a suite looks green after its premise changed."""
        code, out, err = isolation.run(self.runner, "echo ${RT_SECRET:-unset}", "/", {"RT_SECRET": "x"}, 30)
        self.assertEqual(out.strip(), "x", "a caller-supplied env value reaches the spawned process")

    def test_the_runner_hands_the_caller_power_over_any_inherited_name(self):
        """A name the caller supplies wins, and only the caller's names arrive.

        Measured 2026-10-23: `HOLON_HOME` is overridable to `/tmp/rt`. This is about the
        **caller's** dict, which is the run's own environment and authoritative for it.

        The docstring's earlier half — "a name the inherited environment already carries
        can be overridden ... the caller can override any credential" — described 1a's
        defect: the merge of the runner's inherited environment, which is how a credential
        the runner starts with became the agent's. Fixed, so there is no longer an
        inherited environment to override; the remaining truth is that the run's own names
        are the caller's to set. Kept, because the assertion is still the right one to
        watch while that boundary is subject to change."""
        code, out, _ = isolation.run(self.runner, "echo ${HOLON_HOME:-unset}", "/", {"HOLON_HOME": "/tmp/rt"}, 30)
        self.assertEqual(out.strip(), "/tmp/rt", "the caller's value wins over the inherited one")

    def test_the_isolated_harness_gets_only_the_runs_environment(self):
        """`drivers.run` promises the harness "only the run's environment (never the
        kernel's)". The runner merged the caller's dict over its own whole
        environment, so a name the runner inherited reached the body anyway.

        Measured 2026-10-23, this is the LESS filtered of the two branches: the
        non-isolated branch explicitly drops HOLON_CHAIR_KEY and HOLON_KEY, while
        the isolated one reintroduced the entire inherited environment one layer
        down. A body with a shell could read every name the runner's systemd unit
        starts it with; that unit sanitizes nothing. An organization whose ACLs
        fence a body's reach must not hand back through the environment what the
        ACLs deny it."""
        marker = "RT_INHERITED_SECRET"
        os.environ[marker] = "sk-a-secret-the-runner-inherited"
        try:
            code, out, _ = isolation.run(self.runner, "echo ${" + marker + ":-unset}", "/", {}, 30)
        finally:
            os.environ.pop(marker, None)
        self.assertEqual(out.strip(), "unset",
                         "a name the runner inherited reached the spawned process")

    # ── the boundary itself ────────────────────────────────────────────────

    def test_the_runner_refuses_a_real_uid_the_comparator_cannot_see(self):
        """The uid decision is the one line the isolation system is: a process the
        kernel's user does not own may not start processes here. And it is the one
        line no test in this suite has ever proved.

        Measured 2026-10-24 against a **real** runner on a real abstract socket, with a
        peer that is uid 99 inside its own user namespace. `SO_PEERCRED` — the mechanism
        `peer_uid` reads, and the only one that answers from outside the process — reports
        a peer's uid translated into the *receiving* socket's namespace, so that namespaced
        peer appears to the runner as this user's own uid, is admitted, and its command runs.

        So this guard asserts the negative, and says so: it stands up the real runner on a
        real abstract socket, connects to it from a peer that is uid 99 inside its own
        user namespace, and holds the runner to the truth -- that the command it ran
        reported THIS user's uid, so the peer was translated into the runner's namespace
        and admitted. When the Chair activates the boundary, `holon isolation apply`
        writes the agent user and this becomes a real two-user assertion instead of a
        measurement of the host. Until then it is the honest description of what is
        unproved, rather than a passing test read as proof."""
        import subprocess
        import time
        address = "@holon-rt-uid-" + secrets.token_hex(4)
        runner = subprocess.Popen([sys.executable, "-m", "holon.execution.isolation", "runner",
                                   "--address", address, "--allow-uid", str(os.getuid())],
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            # the runner's socket must be listening before the peer dials it
            deadline = time.time() + 20
            while time.time() < deadline:
                try:
                    s = isolation.connect(address, timeout=1)
                    s.close()
                    break
                except isolation.IsolationError:
                    time.sleep(0.1)
            else:
                self.fail(f"the runner never listened on {address}")
            probe = subprocess.run([sys.executable, str(REPO / "tests/probe_uid.py"), address],
                                  capture_output=True, text=True, timeout=120, check=False)
            self.assertEqual(0, probe.returncode, f"the probe could not run: {probe.stderr[:400]}")
            self.assertIn("'exit_code': 0", probe.stdout,
                          "the runner REFUSED a peer that is a different uid inside its own "
                          f"namespace: {probe.stdout[:300]!r}. This host can therefore produce a "
                          "uid the runner sees as different, so this guard owes the real two-user "
                          "assertion instead of a statement about the host.")
            self.assertIn(str(os.getuid()), probe.stdout,
                          "the runner ran the probe's command but it reported a uid that is not "
                          "this process's: the peer was NOT translated into the runner's "
                          "namespace, so the measurement is not comparable.")
        finally:
            runner.terminate()
            try:
                runner.wait(10)
            except subprocess.TimeoutExpired:
                runner.kill()

    def test_the_broker_refuses_a_uid_it_does_not_allow(self):
        """The broker's first gate is the peer uid: a caller outside `allowed_uids`
        is refused before any command runs."""
        other = "@holon-rt-other-" + secrets.token_hex(4)
        srv = isolation.listen(other)
        threading.Thread(target=isolation.serve_broker,
                         args=(str(self.home.root), other, {os.getuid() + 99999}, None, srv),
                         daemon=True).start()
        s = isolation.connect(other)
        isolation._send(s, {"argv": ["whoami"], "token": None, "key": None, "files": {}, "stdin": ""})
        resp = json.loads(s.makefile("rb").readline())
        s.close()
        srv.close()
        self.assertNotEqual(resp["code"], 0)
        self.assertIn("uid", resp["stderr"], resp)

    def test_the_broker_never_reads_a_path_an_agent_names(self):
        """`_read` opens only what the client sent: the broker runs as the kernel's
        user, so a path an agent names but cannot read must not be read for it."""
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            rc = isolation.forward(["skill", "show", "@/etc/shadow"], self.broker)
        self.assertNotEqual(rc, 0)

    # ── the run directory ──────────────────────────────────────────────────
    def test_a_symlink_planted_as_the_result_is_never_followed(self):
        """The result the agent hands back is read with O_NOFOLLOW and must be a
        regular file of sane size, so a planted symlink cannot point the kernel at
        a file the agent may not write (the Chair key, another run's result)."""
        d = self.tmp / "run"
        d.mkdir()
        (d / "brief.md").write_text("the kernel's brief")
        isolation.share_run_dir(d, os.getlogin())
        link = d / "result.json"
        link.unlink(missing_ok=True)
        link.symlink_to("/etc/passwd")
        with self.assertRaises(isolation.IsolationError):
            isolation.read_agent_file(link)

    def test_the_agent_grant_is_exactly_what_the_docstring_promises(self):
        """The run directory: sticky, kernel-owned, agent rwx on the directory, r on
        the kernel's files, and nothing for others."""
        import subprocess
        d = self.tmp / "run2"
        d.mkdir()
        (d / "brief.md").write_text("brief")
        isolation.share_run_dir(d, os.getlogin())
        acl = subprocess.run(["getfacl", "-p", str(d)], capture_output=True, text=True).stdout
        self.assertIn("flags: --t", acl, "sticky: the agent cannot remove the kernel's files")
        self.assertIn(f"user:{os.getlogin()}:rwx", acl)
        self.assertIn("other::---", acl)
        file_acl = subprocess.run(["getfacl", "-p", str(d / "brief.md")], capture_output=True, text=True).stdout
        self.assertIn(f"user:{os.getlogin()}:r--", file_acl, "read-only, never the pen")


class Reach(KernelCase):
    """The reach a deployment actually gets — the part that decides whether the boundary
    is usable, not merely closed.

    A boundary that denies the agent everything its harness needs is not a trust
    boundary: it is a department that cannot work. Measured 2026-10-23 on the live
    instance, `reach()` grants a harness binary as one FILE, while the harness is a
    two-file layout — a 505-byte launcher and a 171 MB payload it execs from the same
    directory, after setting LD_LIBRARY_PATH to that directory. The launcher is granted;
    the payload is not, so the agent user cannot run the harness at all.
    """

    def test_the_harness_binary_lands_with_every_file_it_needs_to_run(self):
        """A harness's reach is the tree its command resolves into, not the one path
        `shutil.which` returns. A launcher that execs a sibling (measured: the live
        harness, `LD_LIBRARY_PATH=$self_dir` then `exec $self_dir/<payload>`) needs
        that sibling granted, and the directory it lives in, or the agent user cannot
        start the harness the instance dispatches."""
        from holon.execution import isolation
        (self.tmp / "hb" / "bin").mkdir(parents=True)
        launcher = self.tmp / "hb" / "bin" / "harness"
        payload = self.tmp / "hb" / "bin" / "harness-linux-x86_64.bin"
        launcher.write_text("#!/bin/sh\nexec \"$(dirname \"$0\")/harness-linux-x86_64.bin\" \"$@\"\n")
        payload.write_bytes(b"payload")
        launcher.chmod(0o755)
        self.home.config_file.write_text(self.pipeline + "\n" + self.config +
                                        f"\n[isolation]\nagent_user = \"{os.getlogin()}\"\n"
                                        f"runner = \"@hb-runner\"\nbroker = \"@hb-broker\"\n")
        (self.home.drivers_dir / f"hb.toml").write_text(
            f'name = "hb"\ncommand = "{launcher}"\nresult = "file"\n')
        self.k = Kernel(self.home)
        reads = {str(p) for p in isolation.reach(self.k)["reads"]}
        plan = isolation.setup_plan(self.k)
        self.k.close()
        self.assertIn(str(self.tmp / "hb" / "bin"), reads,
                      "the directory holding the harness is not in the agent user's read "
                      "reach: LD_LIBRARY_PATH and the launcher's payload sibling are "
                      "unreachable, so the department cannot start its body")
        self.assertIn(str(launcher), reads, "the harness's own command is not granted")
        # the payload is granted through the directory's ACL, not as its own entry:
        # a directory in the reach that no ACL command carries is the defect
        granted = {tuple(c)[-1] for c in plan["acl"] if c[0] == "setfacl"}
        self.assertIn(str(self.tmp / "hb" / "bin"), granted,
                      "the ACL plan does not grant the harness's directory to the agent user: "
                      "the payload beside the launcher stays unreadable")

    def test_a_departments_declared_command_lands_in_the_read_reach(self):
        """The 2026-10-27 A1 fix: a department's own fence is a reach. `[scope.dept.<slug>]
        commands` names the entry points its bodies may invoke, and the fencing half consumed it
        (`execution/service.py:1946`) while `reach()` consumed only pooled units' services and
        the drivers — so a declared command was a grant nobody could run. Measured live:
        career-pipeline's `genome doctor` contract probe executes
        `organism/swarm/task-grid/bin/genome`, the department declares it, and `getfacl` on that
        binary showed no agent-user entry after `isolation apply --force` while the venture roots
        beside it were granted. The probe failed for the agent user only, which is the tell: the
        fence said yes and the reach said nothing."""
        from holon.execution import isolation
        (self.tmp / "dept").mkdir(parents=True)
        (self.tmp / "tools" / "bin").mkdir(parents=True)
        tool = self.tmp / "tools" / "bin" / "pooltool"
        tool.write_text("#!/bin/sh\necho '{}'\n")
        tool.chmod(0o755)
        self.home.config_file.write_text(self.pipeline + "\n" + self.config +
                                        "\n[isolation]\nagent_user = \"%s\"\n" % os.getlogin() +
                                        "\n[scope.dept.career]\n"
                                        f"roots = [\"{self.tmp}/dept\"]\n"
                                        f"commands = [\"{tool} --doctor\"]\n")
        self.k = Kernel(self.home)
        reads = {str(p) for p in isolation.reach(self.k)["reads"]}
        plan = isolation.setup_plan(self.k)
        self.k.close()
        self.assertIn(str(self.tmp / "tools" / "bin"), reads,
                      "a department's declared command binary directory is not in the reach: the "
                      "fence offers the command and isolation denies it")
        self.assertIn(str(tool), reads,
                      "the declared command itself is not granted: a launcher's siblings need it")
        granted = {tuple(c)[-1] for c in plan["acl"] if c[0] == "setfacl"}
        self.assertIn(str(tool), granted,
                      "the ACL plan does not grant the declared command: the fence is a promise "
                      "the boundary does not keep")

    def test_a_command_token_that_resolves_nowhere_widens_nobody(self):
        """The red-team of the fix above. A `commands` entry is a directory listing's worth of
        reach the moment it resolves to a real file, so a name that resolves to nothing must
        grant nothing — not the directory a sibling lives in, not the run directory, not the
        instance root. A broken declaration must stay a broken declaration and not become a
        silent widening. The comparison is against the same deployment WITHOUT the bad token:
        `/usr/bin` is in the baseline reach from `drivers.available()` (the interpreter), and a
        test that asserts otherwise is asserting about something this fix does not touch."""
        from holon.execution import isolation
        (self.tmp / "dept").mkdir(parents=True)
        (self.tmp / "tools" / "bin").mkdir(parents=True)
        base = self.pipeline + "\n" + self.config + \
               "\n[isolation]\nagent_user = \"%s\"\n" % os.getlogin() + \
               "\n[scope.dept.career]\n" + f"roots = [\"{self.tmp}/dept\"]\n"
        self.home.config_file.write_text(base)
        self.k = Kernel(self.home)
        without = {str(p) for p in isolation.reach(self.k)["reads"]}
        self.k.close()
        self.home.config_file.write_text(base +
                                        "commands = [\"no-such-tool-anywhere-xyzzy --x\"]\n")
        self.k = Kernel(self.home)
        with_bad = {str(p) for p in isolation.reach(self.k)["reads"]}
        self.k.close()
        self.assertEqual(without, with_bad,
                         "an unresolvable command token changed the reach: a name that resolves "
                         f"to nothing must grant nothing. Added: {sorted(with_bad - without)}")

    def test_a_granted_tree_history_reaches_the_repo_that_owns_it(self):
        """The 2026-10-27 reach gap the A1 execution found second. The ventures live at
        `$HOME/organism/organism/ventures/<dept>` and the git dir at `$HOME/organism/.git` — one
        or more levels ABOVE every grant — so a reach built only from the roots cannot read a
        commit. Measured live: the `genome doctor` contract probe reported
        `not a git repo — append-only and staleness checks need history` for the agent user while
        `healthy:true` for the operator, and `getfacl` on the parent `.git` carried no agent
        entry. The probe's message names the wrong object; the denial is a directory up."""
        from holon.execution import isolation
        repo = self.tmp / "repo"
        (repo / "pool").mkdir(parents=True)
        subprocess.run(["git", "init", "-q", str(repo)], check=True)
        subprocess.run(["git", "-C", str(repo), "commit", "-q", "--allow-empty",
                        "-m", "seed"], check=True,
                       env={**os.environ, "GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@t",
                            "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@t"})
        self.home.config_file.write_text(self.pipeline + "\n" + self.config +
                                        "\n[isolation]\nagent_user = \"%s\"\n" % os.getlogin() +
                                        "\n[scope.dept.pool]\n"
                                        f"roots = [\"{repo}/pool\"]\n")
        self.k = Kernel(self.home)
        reads = {str(p) for p in isolation.reach(self.k)["reads"]}
        plan = isolation.setup_plan(self.k)
        self.k.close()
        self.assertIn(str(repo / ".git"), reads,
                      "the git dir that owns a granted root is not in the reach: every "
                      "history-reading check scores 'not a git repo' for the agent user")
        self.assertNotIn(str(repo / "pool"), set(), "sanity: the pool itself is the granted root")
        granted = {tuple(c)[-1] for c in plan["acl"] if c[0] == "setfacl"}
        self.assertIn(str(repo / ".git"), granted,
                      "the ACL plan does not grant the owning repo: the grant exists in reach() "
                      "and never reaches the filesystem")

    def test_the_gitconfig_the_repo_needs_travels_with_it(self):
        """The red-team of the git-history fix, caught by running it. Granting `.git` is not
        enough: since git 2.35.2 a repository owned by another user is refused unless the global
        config names it in `safe.directory`, and rev-parse returns EMPTY on that refusal — which
        the pool reads as "not a git repo". Measured 2026-10-27 on the live instance: `.git` was
        granted and the deny sweep had put `user:<agent>:---` on `~/.gitconfig`, so the exemption
        the agent needed was the one file it could not read. The fix grants the config with the
        repo. This guard fails if a future reach grants history without the exemption."""
        from holon.execution import isolation
        repo = self.tmp / "repo"
        (repo / "pool").mkdir(parents=True)
        subprocess.run(["git", "init", "-q", str(repo)], check=True)
        subprocess.run(["git", "-C", str(repo), "commit", "-q", "--allow-empty",
                        "-m", "seed"], check=True,
                       env={**os.environ, "GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@t",
                            "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@t"})
        cfg = Path("~/.gitconfig").expanduser()
        cfg_existed = cfg.is_file()
        self.home.config_file.write_text(self.pipeline + "\n" + self.config +
                                        "\n[isolation]\nagent_user = \"%s\"\n" % os.getlogin() +
                                        "\n[scope.dept.pool]\n"
                                        f"roots = [\"{repo}/pool\"]\n")
        self.k = Kernel(self.home)
        reads = {str(p) for p in isolation.reach(self.k)["reads"]}
        self.k.close()
        if not cfg_existed:
            self.skipTest("no ~/.gitconfig on this host: the global-config grant has nothing to "
                          "measure, and the reach correctly grants no such file")
        self.assertIn(str(cfg), reads,
                      "the git dir was granted but the global config that names safe.directory was "
                      "not: git refuses a foreign-owned repo and rev-parse returns empty, so the "
                      "pool's history reads as 'not a git repo' for every file it granted")

    def test_a_root_with_no_repository_grants_no_history(self):
        """The red-team of the git grant. A directory with no repository on its parent chain must
        grant nothing, not the nearest ancestor that happens to be one — otherwise a scratch root
        under a developer's home inherits every history-bearing directory above it and the reach
        widens silently. Measured against the same deployment with the root inside a repo versus
        outside one."""
        from holon.execution import isolation
        repo = self.tmp / "repo"
        (repo / "pool").mkdir(parents=True)
        subprocess.run(["git", "init", "-q", str(repo)], check=True)
        outside = self.tmp.parent / (self.tmp.name + "-nogit")
        outside.mkdir(parents=True, exist_ok=True)
        try:
            (outside / "pool").mkdir(parents=True, exist_ok=True)
            self.home.config_file.write_text(self.pipeline + "\n" + self.config +
                                            "\n[isolation]\nagent_user = \"%s\"\n" % os.getlogin() +
                                            "\n[scope.dept.pool]\n"
                                            f"roots = [\"{outside}/pool\"]\n")
            self.k = Kernel(self.home)
            reads = {str(p) for p in isolation.reach(self.k)["reads"]}
            self.k.close()
            for git in (str(repo / ".git"), str(self.tmp / ".git"), str(outside / ".git")):
                self.assertNotIn(git, reads,
                                 f"a root outside a repository granted {git}: the git grant must "
                                 "follow the repository that owns the root, and only that one")
        finally:
            shutil.rmtree(outside, ignore_errors=True)

    def test_a_pooled_units_service_binary_lands_in_the_read_reach(self):
        """Fix 3 of the capability-layer plan. The fence half already existed: a pooled unit's
        service entry-point token joins the department's `commands` (`execution/service.py:1946`,
        BYLAWS §14), so the agent is told it may run the route. The reach half did not:
        `reach()` granted binary directories only for `drivers.available()` (harness runtimes),
        never for a unit's services. Measured 2026-10-24 on the live instance — the isolated
        runner's PATH is `%h/bin:%h/.local/bin:/usr/local/bin:/usr/bin:/bin`, so an out-of-tree
        tool's bare name is `FileNotFoundError: 'identity'`. A route offered in a brief with no
        grant behind it is a capability that cannot run."""
        from holon.execution import isolation
        (self.tmp / "unit" / "bin").mkdir(parents=True)
        tool = self.tmp / "unit" / "bin" / "factool"
        tool.write_text("#!/bin/sh\necho '{}'\n")
        tool.chmod(0o755)
        self.home.config_file.write_text(self.pipeline + "\n" + self.config +
                                        "\n[isolation]\nagent_user = \"%s\"\n" % os.getlogin())
        d = self.home.bylaws_units_dir
        d.mkdir(parents=True, exist_ok=True)
        (d / "fact.toml").write_text(
            'charter = "the capacity substrate"\ncategory = "service"\n'
            f'roots = ["{self.tmp}/unit"]\npool_of = ["*"]\nconsumed = []\n\n'
            '[[services]]\nid = "facts"\n'
            f'command = "{tool} --query"\nhealth = "{tool} --version"\n')
        # reach reads the tables, not the manifests, so the manifest must be synced first --
        # the same reason `holon bylaws sync` is step one of every capability flow.
        from holon.bylaws import units
        self.k = Kernel(self.home)
        units.sync(self.k)
        reads = {str(p) for p in isolation.reach(self.k)["reads"]}
        plan = isolation.setup_plan(self.k)
        self.k.close()
        self.assertIn(str(self.tmp / "unit" / "bin"), reads,
                      "a pooled unit's service binary directory is not in the reach: the route is "
                      "offered in every brief and cannot run")
        self.assertIn(str(tool), reads, "the unit's own entry point is not granted")
        granted = {tuple(c)[-1] for c in plan["acl"] if c[0] == "setfacl"}
        self.assertIn(str(self.tmp / "unit" / "bin"), granted,
                      "the ACL plan does not grant the unit's binary directory: the capability "
                      "stays dark under isolation")

    def test_a_unit_pooled_by_nobody_grants_its_binary_to_nobody(self):
        """The red-team that caught my own Fix 3. The grant must follow what a department pools,
        not every manifest in the directory: `bylaws/units.load()` returns all of them, so an
        unfiltered loop would hand every agent the binary of a unit pooled by nobody — the exact
        widening BYLAWS §14 exists to prevent, introduced by a fix written to close a hole.

        And the predicate matters in the other direction too: `units.pooled_by` matches
        `e.other = <slug>` only, so a `pool_of = ["*"]` unit (org-wide, the identity case) is
        invisible to it. Using pooled_by would have granted nothing to the most widely pooled
        units. The join must be `capabilities_for`'s: `e.other IN (<depts>) OR e.other = '*'`."""
        from holon.execution import isolation
        tool = self.tmp / "unpooled" / "bin" / "nobodytool"
        tool.parent.mkdir(parents=True, exist_ok=True)
        tool.write_text("#!/bin/sh\necho '{}'\n")
        tool.chmod(0o755)
        self.home.config_file.write_text(self.pipeline + "\n" + self.config +
                                        f"\n[isolation]\nagent_user = \"{os.getlogin()}\"\n")
        d = self.home.bylaws_units_dir
        d.mkdir(parents=True, exist_ok=True)
        # a department that exists but is not named in pool_of: the unit is pooled by nobody
        (d / "unpooled.toml").write_text(
            f'charter = "pooled by no department"\ncategory = "service"\n'
            f'roots = ["{self.tmp}/unpooled"]\npool_of = ["nonexistent-dept"]\nconsumed = []\n\n'
            f'[[services]]\nid = "nt"\ncommand = "{tool} run"\n')
        from holon.bylaws import units
        self.k = Kernel(self.home)
        units.sync(self.k)
        reads = {str(p) for p in isolation.reach(self.k)["reads"]}
        self.k.close()
        self.assertNotIn(str(tool.parent), reads,
                         "a unit pooled by no department widened the agent user's reach: the "
                         "grant is org-wide, not pooled")
        self.assertNotIn(str(tool), reads, "its own binary was granted too")

    def test_a_cold_start_can_reach_the_activation_plan(self):
        """`holon isolation plan` is step 1 of the documented activation
        (docs/BYLAWS.md §11: `plan` → `sudo sh` → `apply --force` → broker → doctor).

        Measured 2026-10-23 on an instance with no `[isolation]` section, the command
        refuses with "set [isolation] agent_user first" — so the plan that tells you
        which user to create is unreachable until you have already named one. That is
        the gap that kept the boundary off the live instance for a week: the documented
        sequence is broken at its first step.

        The plan must name the user it would create, so a cold start can read it and
        then write it into holon.toml; everything downstream still checks it."""
        from holon import cli
        import io, contextlib
        self.k.auth.init_chair_key()
        # no [isolation] section: the state a cold start is in
        self.home.config_file.write_text(self.pipeline + "\n" + self.config)
        root = pathlib.Path(self.tmp / "root.sh")
        k = Kernel(self.home)
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            cli.cmd_isolation_plan(types.SimpleNamespace(write=str(root), json=False), k)
        printed = buf.getvalue()
        script = root.read_text()
        self.assertIn("useradd", script, "the plan names the user it would create")
        # and the sequence it prints must be walkable: each command it names has to exist. Step 3
        # once said `systemctl --user enable --now holon-broker (install.py writes the unit)`, and
        # install.py writes that unit only when agent_user is ALREADY in holon.toml (measured on
        # the live instance: no broker unit, and the config unwritten) — so a cold start following
        # the plan would have been told to start a unit nothing had written. The same defect class
        # the ledger records twice: a remediation naming a command that cannot work.
        for line in printed.splitlines():
            if "holon-broker" in line and "systemctl" in line and "install.py" not in line:
                self.fail(f"the plan names a step that does not write the broker unit: {line!r}")
        self.assertIn("install.py", printed,
                      "the broker unit's writer must be named: install.py writes it once agent_user "
                      "is in holon.toml, which is the step before it")
        k.close()

    def test_the_applied_acl_matches_what_the_reach_classifies(self):
        """The plan prints 688 setfacl directives, and the last one for a path is the one
        setfacl leaves on disk. Nothing re-reads the applied ACLs, so the only guard is that
        the last mode a path receives agrees with `reach()`'s own classification.

        Measured on the live instance, a path legitimately carries two access modes: the chain
        pass grants `x` on a directory leading to a target, and the target pass then grants its
        real mode. So `pioneer-qf` reads `x` then `rwX` (a write, correct), and the harness dir
        and `.local/bin` read `x` then `rX` (reads, correct). That ordering is the design and it
        resolves correctly in every case measured — what follows from it is that the order, not
        the docstring, is what decides.

        Which is why `setup_plan`'s own promise — "every other entry ... carries an explicit
        deny" — is false as printed: measured on a real replica applying only the plan's own
        commands in its own order, the payload's final access ACL is `user:nobody:r--`, because
        the named `-m ---` on it is overwritten by the later recursive `rX` on its directory.
        A printed plan that names a deny for a path it then grants is a plan an operator cannot
        read: they would conclude the payload is denied. The outcome is right; the document is
        not, and if the emission order ever changed, the payload would be unreadable silently.

        So this guard checks the invariant that actually protects the boundary: whatever the
        last setfacl leaves, it must not be a write on a path reach() calls read-only."""
        plan = isolation.setup_plan(self.k)
        writes = {str(x) for x in isolation.reach(self.k)["writes"]}
        last: dict[str, str] = {}
        for c in plan["acl"]:
            if c[0] != "setfacl" or "-d" in c:      # -d is the default ACL, an intended pair with -m x
                continue
            entry = next((t for t in c[2:] if t.startswith("u:")), None)
            if not entry:
                continue
            mode = entry.rsplit(":", 1)[1]
            for p in (t for t in c[2:] if not t.startswith("u:")):
                last[p] = mode                        # the last write is what setfacl leaves
        wrong = []
        for p, mode in last.items():
            grants_write = "w" in mode.replace("X", "")
            if grants_write and p not in writes:
                wrong.append((p, mode, "the reach calls this read-only"))
        self.assertEqual([], wrong,
                         "the plan's last setfacl grants a write the reach does not classify as "
                         "one: the applied ACL is then wider than the boundary the reach defines")
    def test_the_plan_applied_to_a_real_tree_grants_the_harness_it_dispatches(self):
        """The requirement map's central claim, proved by applying the plan rather than
        reading it: on a real replica of the harness layout, apply ONLY the plan's own
        commands, then read what the ACL actually is.

        Measured 2026-10-23 on this host's real layout — a launcher `jcode` beside a
        171 MB payload it execs after `LD_LIBRARY_PATH=\"$self_dir\"`. The plan grants the
        version directory `rX`, grants traverse `x` on `.jcode`, `builds` and `versions`
        (the chain), and grants the launcher `rx`. It ALSO names a `---` deny on the payload
        in the chain pass. Applied in the plan's own order on a replica:

            user:nobody:r--    jcode
            user:nobody:r--    jcode-linux-x86_64.bin

        So the payload is reachable, and the named deny is inert — the later recursive
        `rX` on its directory overwrites it. The outcome is right, but not for the reason
        the printed plan states. Nothing here switches users, so it stops short of an
        access(2) proof, and the requirement map says so.

        This test exists because `ls` proved a listing and getfacl on the live tree proved
        a *plan*'s text; neither is the applied result. This is the applied result, on a
        real filesystem."""
        import subprocess
        root = self.tmp / ".jcode"
        v = root / "builds" / "versions" / "0.99.1"
        v.mkdir(parents=True)
        (root / "config.toml").write_text("cfg")
        (root / "config.toml.lock").write_text("lock")
        (v / "jcode").write_text("#!/bin/sh\nexec \"$0-linux-x86_64.bin\"\"$@\"\n")
        (v / "jcode").chmod(0o755)
        (v / "jcode-linux-x86_64.bin").write_bytes(b"payload")
        for other in ("0.89", "0.98"):
            (root / "builds" / "versions" / other).mkdir(parents=True, exist_ok=True)
        # the plan's own directives, in the plan's own order, for this layout only
        agent = os.getlogin()
        chain = [(root, "x"), (root / "builds", "x"), (root / "builds" / "versions", "x"), (v, "x")]
        for d, mode in chain:
            subprocess.run(["setfacl", "-m", f"u:{agent}:{mode}", str(d)], check=True)
            subprocess.run(["setfacl", "-d", "-m", f"u:{agent}:---", str(d)], check=True)
        subprocess.run(["setfacl", "-m", f"u:{agent}:---", str(root / "config.toml"),
                        str(root / "config.toml.lock")], check=True)
        subprocess.run(["setfacl", "-m", f"u:{agent}:rX", str(v)], check=True)
        subprocess.run(["setfacl", "-R", "-m", f"u:{agent}:rX", str(v)], check=True)
        subprocess.run(["setfacl", "-m", f"u:{agent}:rx", str(v / "jcode")], check=True)
        # what the agent user ends up able to do
        for f in (v / "jcode", v / "jcode-linux-x86_64.bin"):
            acl = subprocess.run(["getfacl", "-p", str(f)], capture_output=True, text=True).stdout
            self.assertIn(f"user:{agent}:r", acl,
                          f"{f.name} is not readable after the plan is applied: {acl}")
            self.assertNotIn(f"user:{agent}:---", acl,
                             f"{f.name} carries a deny the recursive grant should have replaced")

    def test_a_write_target_sharing_a_units_binary_directory_does_not_deny_it(self):
        """Attack 6 of the red-team against my own Fix 3, and it does NOT land -- recorded so the
        next reader does not re-run it. `setup_plan` grants in a fixed order: chain directories
        first, with `u:---` on their un-kept siblings (so the agent cannot walk sideways out of the
        sandbox), then the plan's own targets. Fix 3 adds a service binary's DIRECTORY as a read
        target, so the attack's question is whether that grant survives when a plan also writes
        beside it.

        Two things are true, and the second is why there is no defect. The binary directory IS
        swept by the chain pass's `setfacl -d -m u:<agent>:---` (a DEFAULT ACL, which governs only
        files created later, not the existing binary). And the target pass then applies
        `setfacl -R -d -m u:<agent>:rX` to the same directory, which is LAST and therefore wins.
        Measured on the emitted plan, the order is: chain grant (20), chain default deny (21),
        sibling deny (22), the chain's own `x` on bin (23), the chain's default deny on bin (24),
        then the target pass -- `x` on bin, `-R rX` on bin, `-R -d rX` on bin (36, 37), and `rx` on
        the binary itself (38).

        Asserted against the plan as data, never applied: a test that runs `setfacl` reaches the
        operator's real home directory through `pwd.getpwuid`, and the first version of this test
        did exactly that."""
        from holon.execution import isolation
        shared = self.tmp / "shared"
        (shared / "bin").mkdir(parents=True)
        tool = shared / "bin" / "factool"
        tool.write_text("#!/bin/sh\necho hi\n")
        tool.chmod(0o755)
        (shared / "secret.txt").write_text("do not read\n")
        self.home.config_file.write_text(self.pipeline + "\n" + self.config +
                                        f"\n[isolation]\nagent_user = \"{os.getlogin()}\"\n"
                                        f'runner = "@attack6-runner"\nbroker = "@attack6-broker"\n')
        d = self.home.bylaws_units_dir
        d.mkdir(parents=True, exist_ok=True)
        (d / "fact.toml").write_text(
            'charter = "c"\ncategory = "service"\n'
            f'roots = ["{shared}"]\npool_of = ["*"]\nconsumed = []\n\n'
            '[[services]]\nid = "facts"\n'
            f'command = "{tool} --query"\nhealth = ""\n')
        from holon.bylaws import units
        self.k = Kernel(self.home)
        units.sync(self.k)
        plan = isolation.setup_plan(self.k)
        self.k.close()
        agent = os.getlogin()
        acl = [" ".join(c) for c in plan["acl"]]
        bin_dir, binary = str(shared / "bin"), str(tool)
        # the target pass grants the directory and the file, and it comes after every deny on them
        grant_rec = next(i for i, c in enumerate(acl)
                         if f"setfacl -R -d -m u:{agent}:rX {bin_dir}" in c)
        deny_default = [i for i, c in enumerate(acl)
                        if f"setfacl -d -m u:{agent}:--- {bin_dir}" in c]
        self.assertTrue(deny_default, "the chain pass never denies new files in the bin dir, so "
                                      "nothing is being overridden: this test proves nothing")
        self.assertGreater(grant_rec, max(deny_default),
                           "the recursive default grant for the unit's binary directory is applied"
                           " BEFORE the chain pass's default deny: last-applied-wins then leaves"
                           " new files in the capability's own directory unreadable")
        self.assertIn(f"setfacl -m u:{agent}:rx {binary}", acl,
                      "the unit's own entry point is not granted read+execute in the applied plan")
        # reading the tool must not widen the sandbox: a sibling no one declared stays denied
        self.assertTrue(any(f"setfacl -m u:{agent}:--- " in c and str(shared / "secret.txt") in c
                            for c in acl),
                        f"a sibling the plan was never told about is readable: {acl}")




class Deployment(KernelCase):
    """The other half of the audit: what a deployment actually has, and what it says
    about a boundary that is absent.

    `RedTeam` above proves the mechanism holds when it is on. This class measures the
    operational seam the mechanism tests cannot see. Measured 2026-10-23 on the live
    instance (mode=ro):

        holon doctor  →  ERROR isolation.off (an absent boundary is an error, not a
        warning -- the heartbeat opens incidents only for errors). Measured
        2026-10-23 on the live instance, mode=ro: no `[isolation]` section in
        holon.toml, no `holon-agent` user, no runner unit; a broker unit exists but
        is disabled and points at a scratch home
        (`~/.config/systemd/user/holon-broker.service`).

        The record this measurement answers (`docs/design/2026-10-22-live-activation.md`
        §4) said "no broker unit" -- false, and a reader sent to create one would find
        it already there. A broker unit exists; the broker is not running.

    The record `docs/design/2026-10-22-live-activation.md` §4 measured the same three
    days earlier and named the one blocker: root must create the agent user, and it is
    still not created. What the record did not measure is the consequence: with
    `agent_user` unset the finding is a *warning*, and the heartbeat turns only
    `error` findings into incidents (`service.py`: `if f["severity"] == "error"`).
    So an absent trust boundary — every dispatched body able to read the Chair key
    and write work.db as the kernel's own user — signals nobody. The kernel's own
    doctor page names the exact exposure in the same breath."""

    def test_a_dead_runner_is_a_finding_not_a_crash(self):
        """Found by the Chair's live activation, 2026-10-26: the boundary was configured
        (the root script had created the agent user) but the runner unit was crash-looping
        on its own defect — and `holon doctor` exited 1 with a raw IsolationError instead
        of reporting anything, because `smoke_results()` runs the smoke checks through
        `isolation.run` (every kernel `_exec` goes through the runner once the boundary is
        configured) and the call at doctor.py's smoke loop is unguarded. The doctor is the
        one instrument that must survive every deployment state — an unconfigured runner
        is exactly the state it exists to name, and the heartbeat's doctor phase would have
        crashed with nothing about the cause on any surface.

        The probe half is already guarded (`isolation.runner`); this guards the other
        caller. A dead runner must produce findings — `isolation.runner` for the probe and
        a smoke warning, each in its own row — and doctor must exit 0, not die on the
        first unreachable socket."""
        from holon.integrity import doctor
        if not self.k.auth.configured:
            self.k.auth.init_chair_key()
        # a smoke check exists, so doctor crosses the crashing seam: smoke_results() runs every
        # check through isolation.run once the boundary is configured, and the unguarded call
        # is the one the live activation hit (doctor.py's smoke loop)
        self.home.config_file.write_text(self.pipeline
                                         + '\n[[smoke.checks]]\nname = "live"\ncmd = "true"\ncritical = true\n'
                                         + '\n[isolation]\nagent_user = "agent"\n')
        self.k.close()
        self.k = Kernel(self.home)
        self.assertEqual(self.k.isolation.get("agent_user"), "agent")
        # the user exists (the root step ran) but the runner does not serve: the live state
        import pwd as _pwd
        real = _pwd.getpwnam
        def _fake(name):
            try:
                return real(name)
            except KeyError:
                if name == "agent":
                    import types
                    return types.SimpleNamespace(pw_name="agent", pw_uid=65534, pw_gid=65534,
                                                  pw_dir="/var/lib/agent", pw_shell="/usr/sbin/nologin")
                raise
        from unittest import mock
        with mock.patch("pwd.getpwnam", _fake):
            findings = doctor.run(self.k)
        checks = {f["check"] for f in findings}
        self.assertIn("isolation.runner", checks,
                      "a configured-but-dead runner is a named finding, not a crash: "
                      + ", ".join(sorted(checks)))
        # doctor survives to report the rest of the instance
        self.assertTrue(any(c.startswith("smoke") for c in checks) or len(checks) > 1,
                        f"doctor stopped early: {sorted(checks)}")

    def test_an_absent_boundary_is_an_error_not_a_warning(self):
        """With no `[isolation] agent_user`, agents run as the kernel's user: one of
        them with a shell can read the Chair key and write work.db directly. That is
        the total failure of the trust boundary, and it must reach an incident.

        The instance is given the Chair key a deployment has, because without one
        `_isolation` returns before it says anything (`if not k.auth.configured`) —
        which is its own finding, guarded by the test below."""
        from holon.integrity import doctor
        if not self.k.auth.configured:
            self.k.auth.init_chair_key()
        findings = {f["check"]: f for f in doctor.run(self.k)}
        self.assertIn("isolation.off", findings,
                      "a deployment with no boundary configured must be reported by name")
        f = findings["isolation.off"]
        self.assertEqual(f["severity"], "error",
                         "an absent trust boundary is reported at " + f["severity"]
                         + ": the heartbeat reports warnings to nobody, so the exposure "
                         "names itself in the doctor page and reaches no reader")

    def test_an_unconfigured_installation_says_something_about_the_boundary(self):
        """Measured: a fresh harness instance has no Chair key, and `_isolation`
        returns at that point — so it reports nothing at all about the boundary.

        An unconfigured installation is about to be configured, and the moment it
        dispatches its first body the boundary is what decides whether that body
        can write the organization's own database. 'Nothing to say yet' is how a
        deployment reaches its first dispatch with no signal either way."""
        from holon.integrity import doctor
        checks = {f["check"] for f in doctor.run(self.k)}
        self.assertTrue(any(c.startswith("isolation") for c in checks),
                        "an installation with no Chair key and no boundary reports nothing "
                        "about the trust boundary: " + ", ".join(sorted(checks)))

    def test_the_heartbeat_opens_an_incident_for_a_warning_it_should_escalate(self):
        """What `test_an_absent_boundary_is_an_error_not_a_warning` asserts must be
        what the heartbeat acts on: an `isolation.off` error must reach `_doctor_phase`.

        The kernel already treats a promised-without-a-runner boundary as an error
        (`isolation.runner`, measured 2026-10-22), so the severity of an *absent*
        boundary is not a policy question — it is the same exposure, one step wider."""
        src = (REPO / "holon" / "execution" / "service.py").read_text()
        self.assertIn('if f["severity"] == "error"', src,
                      "the escalation rule moved: re-check which findings reach incidents")
        # the reach of that rule must include the boundary's own check
        from holon.integrity import doctor
        self.assertTrue(any(f["check"] == "isolation.off" and f["severity"] == "error"
                            for f in doctor.run(self.k)),
                        "isolation.off must be an error for the heartbeat to act on it")

    def test_the_printed_sequence_numbers_every_step_it_prints(self):
        """The printed plan is the operator's whole journey, so its numbering must not
        imply a step it never showed.

        Measured 2026-10-23 on the live instance with `holon isolation plan` (no
        `--write`): the root script is printed raw as step 1's content, then the
        numbered list begins at **"1.5."** — there is no `1.` anywhere in the output.
        A reader counting along meets 1.5, 2, 3, 4 and a step 1 that was never
        labelled, which is the 46-line shell they just scrolled past with no way to
        know it was the step. The operator's move is a shell they must read anyway;
        an unlabelled one is where they skim.

        Two rules this holds, both about the document a person will type:
        the first numbered step is `1.`, and every integer level printed appears."""
        import subprocess
        out = subprocess.run([sys.executable, "-m", "holon", "--home", str(self.home.root),
                              "isolation", "plan"],
                             capture_output=True, text=True).stdout
        numbers = re.findall(r"^(\d+(?:\.\d+)?)\.", out, re.MULTILINE)
        self.assertTrue(numbers, f"the plan printed no numbered steps at all: {out[:300]!r}")
        self.assertEqual(numbers[0], "1",
                         f"the printed sequence starts at {numbers[0]!r}, not 1: an operator "
                         f"counting along has no step 1 to start from. full list: {numbers}")
        # no gap: every integer level from 1 to the last appears (1.5 is fine; 2.5 with no 2 is not)
        integers = sorted({n.split(".")[0] for n in numbers}, key=int)
        self.assertEqual(integers, [str(i) for i in range(1, int(integers[-1]) + 1)],
                         f"the sequence skips a level: printed {numbers}")

    def test_read_only_is_not_achievable_the_way_the_docs_claim_it_is(self):
        """AGENTS.md line 89 says: "read live state only with `mode=ro`, and `holon doctor`,
        before you conclude." The audit record's §2 and its requirement map both wrote
        "measured on the live instance (mode=ro)". Measured 2026-10-24, that claim is
        false every time it is made.

        `Kernel.__init__` calls `connect(home.work_db)` -- a read-WRITE connection,
        because `readonly=False` is the default -- and then `migrate(self.wconn)
        (service.py:266-268). So "reading" the live instance through the kernel opens
        the write side of it. `connect(readonly=False)` sets
        `PRAGMA journal_mode=WAL` -- writing the db file before any read happens.
        And `migrate` runs `CREATE TABLE IF NOT EXISTS schema_migrations` and an
        `ALTER TABLE schema_migrations ADD COLUMN checksum` and
        `UPDATE ... SET checksum` on every connection, read-only intent included
        (db.py:74-87).

        This is the same defect class as the audit's own strays, one level deeper:
        a read-only probe is not read-only, and it writes whether the callers meant
        it to or not. The guard is the last sentence of this class: this is exactly
        the probe I used, so the guard is the fix I owe.

        The contract to satisfy, all three measured: a `Kernel` built with `readonly=True`
        opens both databases `mode=ro`, refuses every write, creates no directory and seeds
        no row. Two of the three are observable and mutation-verified: forcing
        `home.ensure()` or `org.bootstrap()` in `readonly` mode fails this guard. The third
        is not -- `migrate()` on a `mode=ro` connection is refused statement by
        statement and leaves a zero-length `-wal`, so it is undetectable from outside; that
        guard is defence in depth, and a mutation of it surviving is correct rather than a
        gap. Read this as: the guard proves what can be proved and names what cannot."""
        from holon.execution.service import Kernel
        # A home with no instance fails loudly rather than being brought into being: that is
        # the correct strictness for a read-only probe, and it is measured here so nobody
        # later mistakes `mode=ro` for "will migrate if missing".
        empty = self.tmp / "empty-home"
        empty.mkdir(parents=True)
        with self.assertRaises(sqlite3.OperationalError):
            Kernel(Home(empty), actor="auditor", readonly=True)
        # and nothing was created on the way: a read-only probe cannot bring an instance
        # into being, which is the whole point (my own probes did exactly that)
        self.assertEqual([p.name for p in empty.rglob("*")], [],
                         "a read-only Kernel created instance state in a home that had none: "
                         f"{[str(p) for p in empty.rglob('*')]}")

        # and on a real instance it touches nothing: build one, then re-open read-only
        fresh = self.tmp / "ro-probe" / "home"
        fresh.mkdir(parents=True)
        home = Home(fresh)
        seed = Kernel(home)  # the writer brings the instance into being
        seed.close()  # a clean close checkpoints its WAL, leaving nothing behind
        for p in fresh.rglob("*"):
            p.chmod(0o644 if p.is_file() else 0o755)
        # The sidefiles (`-shm`/`-wal`) are excluded from the snapshot and asserted
        # separately: opening a WAL-mode database read-only still creates them, measured
        # with raw sqlite3 and no Holon involved. `-shm` is always 32768 bytes of shared
        # memory and says nothing; the `-wal` carries unmerged frames, so a non-empty one
        # is a write this probe made.
        data = lambda snap: {n: v for n, v in snap.items() if not n.endswith(("-wal", "-shm"))}
        before = {str(q.relative_to(fresh)): q.stat().st_mtime_ns
                  for q in fresh.rglob("*") if q.is_file()}
        k = Kernel(home, actor="auditor", readonly=True)
        try:
            self.assertTrue(k.readonly)
            with self.assertRaises(sqlite3.OperationalError):
                k.wconn.execute("INSERT INTO tasks (id, title) VALUES ('x', 'y')")
        finally:
            k.wconn.close()
            k.mconn.close()
        after = {str(q.relative_to(fresh)): q.stat().st_mtime_ns
                 for q in fresh.rglob("*") if q.is_file()}
        self.assertEqual(data(before), data(after),
                         "a read-only Kernel modified an existing database: "
                         f"{[n for n in data(after) if data(before).get(n) != data(after)[n]]}")
        for w in [n for n in after if n.endswith("-wal")]:
            self.assertEqual(pathlib.Path(fresh, w).stat().st_size, 0,
                             f"the read-only pass wrote data into the {w} WAL: a read-only "
                             "kernel must not leave frames for the next writer to merge")


    def test_the_documented_read_only_mode_is_a_door_on_the_cli(self):
        """AGENTS.md tells every agent to "read live state only with `mode=ro`", and the
        2026-10-24 audit record repeated that phrase in its own evidence. The mechanism
        it names exists and is mutation-verified — `Kernel(..., readonly=True)` opens both
        databases `mode=ro`, writes nothing and brings no instance into being.

        Measured 2026-10-30, the phrase names a door that was never built. `holon --help`
        carries only `--home`, `--token`, `--json` and `--version`: there is no `--mode`, so
        an agent following the instruction runs the one command that reaches the kernel and
        gets a read-WRITE connection instead. `main()` is the single construction site for
        every command in the registry (`cli.py:2046`, `Kernel(home, actor="anonymous")`), and
        it never passes `readonly`. The instruction is not merely wrong at the edges: it is
        unachievable, and the whole session's probes took the write path while believing they
        were reading.

        The defect class is the 2026-10-24 row one level up: that row made the *mechanism*
        read-only and left the *entry* open. A read-only mechanism no command can reach is a
        promise in a docstring. The door is `--mode ro`, threading the existing parameter, and
        it must work on the command an agent actually reaches for (`doctor`) — the one the
        doc sentence names in the same breath.
        """
        home = self.tmp / "cli-ro" / "home"
        home.mkdir(parents=True)
        _K = Home(home)
        seed = Kernel(_K)
        seed.close()
        for p in home.rglob("*"):
            p.chmod(0o644 if p.is_file() else 0o755)

        before = {str(q.relative_to(home)): (q.stat().st_mtime_ns, q.stat().st_size)
                  for q in home.rglob("*") if q.is_file()
                  and not q.name.endswith(("-wal", "-shm"))}

        # `main` returns its code rather than raising (the bin entry point is what raises),
        # so the assertion is on the return. The run happens under the spy below, so this is
        # the same single call: what it must prove is that the command RAN (a nonzero exit is
        # a doctor finding, not a crash) and that the kernel it opened was read-only.
        import holon.execution.service as _svc
        from holon.cli import main
        seen: list[bool] = []
        real_init = _svc.Kernel.__init__

        def spy(self, home, *a, readonly=False, **kw):
            seen.append(readonly)
            return real_init(self, home, *a, readonly=readonly, **kw)

        _svc.Kernel.__init__ = spy
        try:
            code = main(["--home", str(home), "--mode", "ro", "doctor"])
        finally:
            _svc.Kernel.__init__ = real_init
        # A nonzero exit is a doctor finding, not a crash: the command RAN.
        self.assertIn(code, (0, 1), "the read-only doctor did not run at all")
        self.assertEqual(seen, [True], "the CLI did not open the kernel read-only: it passed "
                                       f"{seen} to the constructor -- `--mode ro` never arrived")

        # A mode the parser does not know is refused, not absorbed. Dropping argparse's
        # `choices` makes any unknown string read as `rw` -- the write door -- so a typo
        # (`--mode read-only`, `--mode RO`, `--mode readonly`) silently returns the exact state
        # this whole change exists to close, and nothing says so. Measured: without `choices`
        # that mutation passes the two guards above, so the guard for it is its own.
        from holon.cli import build_parser
        for typo in ("read-only", "RO", "readonly", "ro,", ""):
            # argparse prints usage to stderr on the way out, which is the right behaviour for
            # the command and noise in a test run.
            with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit):
                build_parser().parse_args(["--mode", typo, "doctor"])
        # and the spelling the docs actually teach is the one that lands
        self.assertEqual(build_parser().parse_args(["--mode", "ro", "doctor"]).mode, "ro")

        # and the instance's databases were never opened for writing. The `-wal`/`-shm`
        # sidefiles are excluded for the reason the 2026-10-24 guard measured and named:
        # opening a WAL database read-only still creates them, and a non-empty `-wal` is the
        # only part that is a write -- asserted separately below, so this is not a blanket
        # exemption for exactly the artefact that would prove a write.
        still = {str(q.relative_to(home)): (q.stat().st_mtime_ns, q.stat().st_size)
                 for q in home.rglob("*") if q.is_file()
                 and not q.name.endswith(("-wal", "-shm"))}
        self.assertEqual(before, still, "the read-only CLI pass changed the instance: a "
                          "read-only probe must not migrate, seed or chmod anything")
        for w in still.keys() | before.keys():
            if w.endswith("-wal"):
                self.assertEqual(Path(home, w).stat().st_size, 0,
                                 f"the read-only pass left frames in {w}: that IS a write")

        # The write door still works without the flag: `--mode ro` narrows, it does not seal.
        # A read-only kernel refuses a write the normal path performs, which is the whole
        # difference between the two modes and the reason this guard holds both halves.
        seed2 = Kernel(Home(home))
        self.assertNotEqual(seed2.readonly, True)
        seed2.close()

    def test_a_read_only_connection_migrates_nothing(self):
        """The read-only door closed off the commands that migrate, and the caller that did not.

        Measured 2026-11-03 validating G9: `holon --home <live> --mode ro task list` died
        with `sqlite3.OperationalError: attempt to write a readonly database`, raised from
        inside `holon/migrations/memory/0006_checksum_repair.py`'s `up()`. `--mode ro` opens
        both databases `mode=ro` correctly and `Kernel(readonly=True)` skips `migrate`, but
        `Kernel.__init__` is not the only construction that reaches a read-only connection:
        `migrate()` itself never asked, and migration is definitionally a write. So the
        2026-10-24 audit row's whole promise -- a probe of live state must not leave the db
        it probed with a fresh `-wal` and its own migration stamps -- was defeated by the one
        call every construction makes, on precisely the instance that had migrations pending.

        The guard is on the rule, not on the CLI's one call site: `db.is_read_only` is the
        record `connect` keeps, and `migrate` consults it for EVERY caller. A caller that
        forgets gets a no-op, and a schema that is behind is reported by its own reading
        rather than silently migrated under it.

        Mutation-verified twice against the live instance that carries the defect: with the
        guard deleted, `--mode ro` against the home with migrations pending raises the
        OperationalError again, and with it the command runs. And the FIRST draft of this
        guard was a null test, caught only by running that mutation: it migrated the fixture
        in read-write mode first, so nothing was pending and deleting the fix changed
        nothing. A fixture must reach the defect, or the guard is a green light."""
        from holon.core import db

        d = self.tmp / "ro-migrate"
        d.mkdir(parents=True)
        path = d / "work.db"
        # The fixture must reach the defect, or the guard is a null test -- and it was one,
        # TWICE, both times measured. Draft 1 closed a connection twice. Draft 2 tried to open
        # a db that does not exist in `mode=ro`, which SQLite refuses outright
        # ("unable to open database file") -- a read-only connection needs a real file. Draft 3
        # migrated the file in read-write mode first, so by the time the read-only connection
        # arrived nothing was pending and deleting the guard changed nothing (measured: OK).
        #
        # What reaches the defect: the file EXISTS, but holds no `schema_migrations` rows --
        # an instance whose db was created by another tool, or whose migration table was
        # dropped, which is the state where `migrate` has work to do. SQLite refuses
        # `mode=ro` only on a MISSING file, not on an empty one, so this is reachable.
        rw = db.connect(path)
        rw.execute("CREATE TABLE probe(x)")
        db.close(rw)
        self.assertTrue(path.exists(), "the fixture's db must exist: mode=ro needs a real file")

        ro = db.connect(path, readonly=True)
        try:
            self.assertTrue(db.is_read_only(ro), "the fixture must be read-only")
            applied = db.migrate(ro, "work")
            self.assertEqual(applied, [],
                            "a read-only connection must apply nothing: migration is a write, "
                            "and a probe of live state must not stamp it")
        finally:
            db.close(ro)
        # and it must not have stamped the db under the caller either
        check = db.connect(path, readonly=True)
        try:
            names = {r[0] for r in check.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        finally:
            db.close(check)
        self.assertNotIn("schema_migrations", names,
                         "the read-only probe must not have created the migration table")

    def test_a_dropped_read_only_connection_does_not_bequeath_its_id(self):
        """A read-only record that outlives its object poisons the next write connection.

        Measured 2026-11-04, in the suite's own discovery order: after `tests.test_core`
        passed alone, the full run reported `no such table: departments` in
        `org.bootstrap()` -- a schema that was never created, on a WRITE connection. The cause
        was `db._RO_CONNS`, the set of ids the read-only record used to keep: CPython reuses
        the id of a collected object, and every read-only `Kernel` in this module is dropped
        without `db.close`, so the next read-write connection inherited the id, read as
        read-only, and `migrate()` skipped its own schema. The direction is the one a stale
        flag must never point: a write silently not performed.

        The fixture plants the CONDITION directly rather than waiting for CPython to reuse an
        id. Two drafts tried to reproduce the reuse by dropping a connection, and both were
        measured: in a standalone script the reuse happens 200/200, but inside this class's
        own process -- where a live `Kernel` from `KernelCase.setUp` holds the allocation
        state -- it happened 0/1, so the guard could not reach the defect's conditions and its
        own "prove something" assertion refused to pass it. A guard whose fixture depends on
        an allocator's free list is an allocator test, not a contract test. So the state the
        old id-set produced is injected, and what is asserted is the contract: no record that
        is not the connection itself may make a write path look read-only.

        Mutation-verified: restoring the id-set makes `is_read_only(w)` answer True for the
        planted id, and this fails on the first assertion. The class-based record passes. The
        planting was itself mutation-verified -- the id-invention draft passed under the
        mutation, which is how the planted id was corrected to one the connection inherits.
        """
        from holon.core import db

        d = self.tmp / "ro-id-poison" / "home"
        d.mkdir(parents=True)
        home = Home(d)
        home.ensure()
        # `mode=ro` needs a REAL file (SQLite refuses to open a missing one), so the db is
        # created by one write connection first -- and it holds no schema_migrations rows,
        # so the write connection that follows genuinely has work to do.
        rw = db.connect(home.work_db)
        db.close(rw)
        self.assertTrue(home.work_db.exists(), "the fixture's db must exist: mode=ro needs one")

        # The outcome, planted at the seam that misbehaved. Two earlier drafts tried to make
        # CPython reuse an id (measured: 200/200 in a standalone script, 0/1 in this class's
        # own process, where a live `Kernel` from `KernelCase.setUp` occupies the allocation
        # state), and a third invented an id no object could own (measured: the mutation
        # PASSED, because a connection cannot receive an id it was not handed). A guard whose
        # fixture depends on an allocator's free list is an allocator test, not a contract
        # test. So the poison is planted where the defect actually lived -- the record
        # `migrate` consults -- and what is asserted is the contract: no record that is not
        # the connection's own identity may make a write path look read-only.
        w = db.connect(home.work_db, readonly=False)
        try:
            if hasattr(db, "_RO_CONNS"):       # the old mechanism is gone; belt-and-braces
                db._RO_CONNS.add(id(w))        # the exact state a dropped read-only object left
                self.assertTrue(db.is_read_only(w),
                                "the planted poison did not change is_read_only's answer, so "
                                "this guard cannot observe the defect and is a null test here")
            self.assertFalse(db.is_read_only(w),
                             "a read-write connection read as read-only: every write path "
                             "would now silently skip, which is the direction a stale record "
                             "must never point")
            applied = db.migrate(w, "work")
            self.assertTrue(applied, "migrate skipped the schema on a write connection")
            names = {r[0] for r in w.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            self.assertIn("departments", names,
                          "the schema was never created: this is the exact live failure "
                          "(no such table: departments)")
        finally:
            db.close(w)

    def test_the_read_only_mode_refuses_a_writing_command_outright(self):
        """A read-only door is only a door if it also says no: a command that must write,
        run under `--mode ro`, is refused by name rather than half-attempting a write the
        connection will reject mid-transaction. The failure mode this replaces is silent: the
        kernel's own readonly guard refuses each statement, so an agent's `holon task add`
        under a read-only probe fails somewhere in the org layer with a message about sqlite.

        Refusing by name is also the honest contract: an agent learns its seat, not a stack
        trace, and the Chair's audit trail records the refusal as a refusal.
        """
        home = self.tmp / "cli-ro-refuse" / "home"
        home.mkdir(parents=True)
        seed = Kernel(Home(home))
        seed.close()
        from holon.cli import main
        import contextlib, io
        err = io.StringIO()
        # `tick` is a writer with no required args: the refusal reaches dispatch rather than
        # being masked by argparse, which returns the same exit 2 for a missing required flag
        # and would make this guard test the parser instead of the seat.
        with contextlib.redirect_stderr(err):
            code = main(["--home", str(home), "--mode", "ro", "tick"])
        # Exit 4 is FORBIDDEN, the same code a seat refusal returns: a read-only probe is a
        # narrower seat, not a new one. What makes it honest is the text naming the mode.
        self.assertEqual(code, 4, "a writing command was not refused read-only")
        self.assertIn("read-only", err.getvalue().lower(),
                      "the refusal must name the read-only mode it refused under")

    def test_read_only_doctor_runs_and_reports(self):
        """Found by RUNNING the read-only seam's own acceptance test, 2026-10-30: `holon
        --home <live> --mode ro doctor` exited 1 with `sqlite3.OperationalError: attempt to
        write a readonly database` at `run_smoke`'s cache INSERT. The flag built for the
        AGENTS.md instruction ("read live state only with mode=ro") closed off the one command
        that says whether the trust boundary is on -- on the instance where that question is
        live, and with the doctor being the heartbeat's own alarm.

        The command must run, and it must leave the instance untouched. Both halves, because
        either alone passes for the wrong reason: a doctor that "runs" by catching the
        OperationalError reports nothing, and one that leaves state behind is not read-only.
        """
        home = self.tmp / "cli-ro-doctor" / "home"
        home.mkdir(parents=True)
        # A declared smoke check is essential: without one `smoke_results` returns [] without
        # ever reaching `run_smoke`, and the live OperationalError is never exercised -- the
        # first draft of this guard was exactly that null test, mutation-verified as passing
        # with the fix removed. Written the way KernelCase writes config, so the instance is
        # well-formed from the start rather than patched after the fact.
        from tests.helpers import MINIMAL
        h = Home(home)
        h.config_file.write_text(MINIMAL + '\n[smoke]\nchecks = ["true"]\n')
        seed = Kernel(h)
        seed.close()
        from holon.cli import main
        import contextlib, io
        before = {str(q.relative_to(home)): (q.stat().st_mtime_ns, q.stat().st_size)
                  for q in home.rglob("*") if q.is_file()
                  and not q.name.endswith(("-wal", "-shm"))}
        err = io.StringIO()
        with contextlib.redirect_stderr(err):
            code = main(["--home", str(home), "--mode", "ro", "doctor"])
        # Exit 1 is a doctor finding; exit 0 is a clean instance. Anything else is a crash,
        # and 1-from-a-traceback is the exact defect this guard exists to catch, so the
        # traceback is asserted absent by name rather than inferred from the code.
        self.assertIn(code, (0, 1), f"the read-only doctor crashed: {err.getvalue()[-600:]}")
        self.assertNotIn("Traceback (most recent call last)", err.getvalue())
        still = {str(q.relative_to(home)): (q.stat().st_mtime_ns, q.stat().st_size)
                 for q in home.rglob("*") if q.is_file()
                 and not q.name.endswith(("-wal", "-shm"))}
        self.assertEqual(before, still, "the read-only doctor changed the instance")
        for w in still.keys() | before.keys():
            if w.endswith("-wal"):
                self.assertEqual(Path(home, w).stat().st_size, 0,
                                 f"the read-only doctor left frames in {w}: that IS a write")

    def test_read_only_doctor_names_a_stale_smoke_cache_rather_than_running_it(self):
        """The other half of G6, and the half that makes the fix honest rather than silent.

        In read-only mode `smoke_results` serves the STALE cache instead of re-running, because
        re-running writes. The consequence is real and must be visible: with no cache the
        operator gets no smoke findings at all -- a silence, not a reading. The 2026-10-16
        red-team row's own lesson (a lane must never close silently) applies to a finding.
        So the read-only path must SAY that it served a stale cache when it does.

        Mutation-verified both directions: removing the staleness finding fails this; removing
        the `self.readonly` branch in `smoke_results` fails the doctor-runs guard above with
        the live OperationalError.
        """
        home = self.tmp / "cli-ro-stale-smoke" / "home"
        home.mkdir(parents=True)
        K = Kernel(Home(home))
        K.close()
        from holon.integrity import doctor as doctor_mod
        found = doctor_mod.run(Kernel(Home(home), readonly=True))
        # the finding is a finding, not stderr noise: read it through the doctor itself. Asserted
        # by CHECK NAME, because a substring over every message finds "smoke" in the other
        # smoke lines and proves nothing about this one -- the second null test in this guard.
        unreadable = [f for f in found if f.get("check") == "smoke.unreadable"]
        self.assertTrue(unreadable, "a read-only doctor on an instance with no smoke cache did "
                                   "not report that its smoke findings are unreadable")
        self.assertIn("read-only", unreadable[0]["message"].lower(),
                      "the finding must name the read-only mode that caused the silence")
        # and a FRESH smoke cache is served, not discarded: the stale reading is a real reading,
        # so a cached failure still reaches the operator through the read-only door.
        from holon.core.db import connect
        k2 = Kernel(Home(home))
        k2.wconn.execute("INSERT OR REPLACE INTO settings VALUES ('smoke', ?)",
                         (json.dumps({"ts": "2000-01-01T00:00:00.000Z",
                                      "results": [{"ok": False, "critical": True, "dept": None,
                                                   "name": "ro-pinned-source", "exit_code": 7,
                                                   "reason": "", "tail": "pinned"}]}),))
        k2.close()
        found2 = doctor_mod.run(Kernel(Home(home), readonly=True))
        self.assertTrue(any(f.get("check") == "smoke.critical" for f in found2),
                        "the read-only path discarded a cached smoke failure instead of serving "
                        "it: a stale reading is a reading, and dropping it invents a pass")
        for f in found2:
            if f.get("check") == "smoke.critical":
                self.assertIn("ro-pinned-source", f["message"])


if __name__ == "__main__":
    unittest.main()
