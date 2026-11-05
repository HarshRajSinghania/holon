"""DeepSeek Harness adapter: the driver, the bundle, the posture guard, and the live seam.

The last two tests are the point of the file. One drives the real plugin through the real kernel
CLI against a scratch instance's SQLite; the other installs the real profile with the real `dsh`.
A unit test that stubs either side would call the phase landed without it having run.
"""

import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET
from contextlib import redirect_stdout
from pathlib import Path

from holon.core import vocab
from holon.execution.drivers import Driver
from tests.helpers import KernelCase

ROOT = Path(__file__).resolve().parents[1]
ADAPTER = ROOT / "adapters" / "deepseek-harness"
PLUGIN = ADAPTER / "plugin"
NODE = shutil.which("node")
DSH = shutil.which("dsh")


def node_run(script: str, env: dict[str, str]) -> dict:
    p = subprocess.run([NODE, "--input-type=module", "-e", script], capture_output=True, text=True,
                       cwd=str(ROOT), env=env, timeout=180)
    if p.returncode != 0:
        raise AssertionError(f"node failed ({p.returncode}): {p.stderr[-3000:]}\n{p.stdout[-2000:]}")
    return json.loads(p.stdout)


class Shipped(unittest.TestCase):
    def test_driver_loads_and_serves_every_stage(self):
        d = Driver.from_toml((ADAPTER / "driver.toml").read_text(), "deepseek-harness")
        self.assertEqual(d.name, "deepseek-harness")
        self.assertEqual(d.stages, list(vocab.STAGES))
        self.assertIn("{briefing}", d.command, "the identity card and brief must reach the first message")
        self.assertEqual(d.result, "file", "the result is the file the native submit tool writes")
        self.assertFalse(d.read_only_enforced, "the kernel's workdir guard must stay on")
        self.assertEqual(d.env.get("DSH_PERMISSION_MODE"), "danger-full-access")

    def test_installer_dry_run_prints_a_driver_and_writes_nothing(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = subprocess.run([sys.executable, str(ADAPTER / "install.py"), "--holon-home", tmp,
                                "--dsh", "/bin/true", "--dry-run"],
                               capture_output=True, text=True)
            self.assertEqual(p.returncode, 0, p.stderr)
            self.assertIn('name = "deepseek-harness"', p.stdout)
            self.assertIn("{briefing}", p.stdout)
            self.assertIn("DSH_HOME", p.stdout)
            self.assertFalse((Path(tmp) / "config").exists(), "a dry run creates no instance state")


class Bundle(unittest.TestCase):
    def test_manifest_and_display_resources(self):
        pkg = json.loads((PLUGIN / "package.json").read_text())
        self.assertEqual(pkg["name"], "holon-native")
        self.assertEqual(pkg["dsh"]["bundle"]["patch"], "./cordis.patch.yml")
        self.assertIn("./locale/*.json", pkg["exports"])
        self.assertIn("./icon", pkg["exports"])
        self.assertIn("lib/*.js", pkg["files"])
        patch = (PLUGIN / "cordis.patch.yml").read_text()
        self.assertIn("id: holon-native", patch)
        self.assertIn("name: holon-native", patch)
        meta = json.loads((PLUGIN / "locale" / "en.json").read_text())["meta"]
        self.assertTrue(meta["title"].strip())
        self.assertTrue(meta["description"].strip())
        icon = PLUGIN / "icon.svg"
        self.assertLessEqual(icon.stat().st_size, 256 * 1024)
        self.assertEqual(ET.parse(icon).getroot().tag, "{http://www.w3.org/2000/svg}svg")

    @unittest.skipUnless(NODE, "node is not installed")
    def test_every_module_imports(self):
        for js in [PLUGIN / "index.js", *sorted((PLUGIN / "lib").glob("*.js"))]:
            p = subprocess.run([NODE, "--input-type=module", "-e",
                                f"import({json.dumps(js.as_uri())}).then(()=>process.exit(0))"],
                               capture_output=True, text=True, cwd=str(PLUGIN), timeout=60)
            self.assertEqual(p.returncode, 0, f"{js.name}: {p.stderr[-2000:]}")


@unittest.skipUnless(NODE, "node is not installed")
class RealSeam(KernelCase):
    def test_the_bundle_reads_a_real_instance_through_the_real_cli(self):
        """Plugin → HolonCli → `python -m holon --json` → the scratch instance's SQLite."""
        script = r'''
import { apply } from %s;
const reg = new Map();
const ctx = {
  effect: (fn) => fn(),
  inject: (deps, cb) => cb({ effect: (fn) => fn(), skills: { register: () => () => {} } }),
  logger: { info() {}, warn() {} },
  tools: { register: (d) => { reg.set(d.name, d); return () => {}; }, guard: () => () => {} },
  systemPrompt: { section: () => () => {}, context: () => () => {} },
};
apply(ctx, { command: JSON.parse(process.env.TEST_COMMAND) });
const identity = await reg.get("holon_identity").execute({}, {});
const status = await reg.get("holon_status").execute({}, {});
const tasks = await reg.get("holon_tasks").execute({ limit: 3 }, {});
console.log(JSON.stringify({ tools: [...reg.keys()], identity, status, tasks }));
''' % json.dumps((PLUGIN / "index.js").as_uri())
        env = {**os.environ,
               "HOLON_HOME": str(self.home.root),
               "HOLON_CHAIR_KEY_FILE": str(self.tmp / "chair.key"),
               "PYTHONPATH": str(ROOT),
               "DSH_HOME": str(self.tmp / "dsh-home"),
               "TEST_COMMAND": json.dumps([sys.executable, "-m", "holon"])}
        out = node_run(script, env)
        self.assertEqual(out["identity"]["principal"], "chair")
        self.assertEqual(out["identity"]["home"], str(self.home.root))
        self.assertIn("holon_status", out["tools"])
        self.assertIsInstance(out["status"]["work"].get("open", 0), int)
        self.assertLessEqual(out["tasks"]["count"], 3)

class Posture(unittest.TestCase):
    def test_a_run_registers_its_skills_and_refuses_observe_writes(self):
        if NODE is None:
            self.skipTest("node is not installed")
        with tempfile.TemporaryDirectory() as tmp:
            run = Path(tmp) / "run"
            (run / "skills" / "holon-employee").mkdir(parents=True)
            (run / "skills" / "holon-employee" / "SKILL.md").write_text(
                "---\nname: holon-employee\ndescription: The employee protocol.\n---\n\n# Protocol\n\nDo the stage.\n")
            brief = {"run_id": "run_test", "task_id": "tsk_test", "stage": "plan", "posture": "observe",
                     "employee_id": "emp_test", "employee_name": "Tess", "workdir": str(run),
                     "result_path": str(run / "result.json"), "skills": str(run / "skills"),
                     "brief_md": str(run / "BRIEF.md"), "identity_md": str(run / "identity.md")}
            (run / "brief.json").write_text(json.dumps(brief))
            (run / "policy.json").write_text(json.dumps(
                {"version": 1, "stage": "plan", "posture": "observe", "roots": [str(run)],
                 "read_roots": [], "writes": [], "commands": ["cat", "ls"], "deny": [],
                 "budget": {"tokens": None, "cost": None}}))
            (run / "BRIEF.md").write_text("# Brief\n\nDo the stage.\n")
            (run / "identity.md").write_text("# Identity\n\nTess.\n")
            script = r'''
import { apply } from %s;
const reg = new Map();
let guard;
const skills = [];
const ctx = {
  effect: (fn) => fn(),
  inject: (deps, cb) => cb({ effect: (fn) => fn(),
    skills: { register: (s) => { skills.push(s.name); return () => {}; } } }),
  logger: { info() {}, warn() {} },
  tools: { register: (d) => { reg.set(d.name, d); return () => {}; },
           guard: (g) => { guard = g; return () => {}; } },
  systemPrompt: { section: () => () => {}, context: () => () => {} },
};
apply(ctx, {});
const cases = {
  write: guard({ name: "write", arguments: { file_path: process.env.RUN_DIR + "/x" } }),
  cat: guard({ name: "bash", arguments: { command: "cat BRIEF.md" } }),
  rm: guard({ name: "bash", arguments: { command: "rm -rf /" } }),
  redirect: guard({ name: "bash", arguments: { command: "cat x > y" } }),
  find: guard({ name: "bash", arguments: { command: "find . -delete" } }),
  background: guard({ name: "bash", arguments: { command: "cat BRIEF.md & rm -rf /" } }),
  fd: guard({ name: "bash", arguments: { command: "ls 2>&1" } }),
};
console.log(JSON.stringify({ tools: [...reg.keys()], skills, cases }));
''' % json.dumps((PLUGIN / "index.js").as_uri())
            env = {**os.environ, "HOLON_RUN_DIR": str(run), "HOLON_RUN_TOKEN": "hrt_test",
                   "HOLON_STAGE": "plan", "HOLON_POSTURE": "observe", "HOLON_HOME": str(Path(tmp) / "home"),
                   "DSH_HOME": str(Path(tmp) / "dsh-home"), "RUN_DIR": str(run)}
            out = node_run(script, env)
            self.assertIn("holon_submit", out["tools"])
            self.assertIn("holon_msg", out["tools"])
            self.assertEqual(out["skills"], ["holon-employee"])
            self.assertTrue(out["cases"]["write"], "observe refuses the write tool")
            self.assertFalse(out["cases"].get("cat"), "a read-only command is allowed")
            self.assertTrue(out["cases"]["rm"])
            self.assertTrue(out["cases"]["redirect"])
            self.assertTrue(out["cases"]["find"])
            self.assertTrue(out["cases"]["background"], "a background command is checked too")
            self.assertFalse(out["cases"].get("fd"), "an fd redirect is not a write")


@unittest.skipUnless(DSH, "dsh is not installed")
class Installed(KernelCase):
    def test_the_installer_builds_a_real_profile_that_selects_the_bundle(self):
        profile = "holon-e2e"
        p = subprocess.run([sys.executable, str(ADAPTER / "install.py"), "--holon-home", str(self.home.root),
                            "--dsh", DSH, "--profile", profile, "--model", "deepseek-flash"],
                           capture_output=True, text=True, timeout=300)
        self.assertEqual(p.returncode, 0, p.stdout[-3000:] + p.stderr[-3000:])
        adapter_home = self.home.root / "adapters" / "deepseek-harness"
        dsh_home = adapter_home / "home"
        self.assertTrue((dsh_home / "holon.json").exists())
        cfg = json.loads((dsh_home / "holon.json").read_text())
        self.assertEqual(cfg["home"], str(self.home.root))
        manifest = json.loads((dsh_home / "profiles" / profile / "package.json").read_text())
        self.assertIn("holon-native", manifest["dsh"]["profile"]["bundles"])
        patch = (dsh_home / "profiles" / profile / "cordis.patch.yml").read_text()
        self.assertIn("id: agent-default-model", patch)
        driver_path = self.home.root / "config" / "drivers" / "deepseek-harness.toml"
        d = Driver.from_toml(driver_path.read_text(), str(driver_path))
        self.assertEqual(d.env["DSH_HOME"], str(dsh_home))
        self.assertIn(f"--profile {profile}", d.command)
        self.assertIn("{briefing}", d.command)
        self.assertFalse((dsh_home / ".env").exists(), "no key file means no .env is written")


class Tokenless(unittest.TestCase):
    def test_a_run_without_its_token_refuses_to_submit_as_the_chair(self):
        """A lost run token must fail closed, not become the Chair (the 2026-10-20 seam)."""
        if NODE is None:
            self.skipTest("node is not installed")
        with tempfile.TemporaryDirectory() as tmp:
            run = Path(tmp) / "run"
            run.mkdir()
            (run / "brief.json").write_text(json.dumps(
                {"run_id": "run_test", "task_id": "tsk_test", "stage": "plan", "posture": "observe",
                 "workdir": str(run), "result_path": str(run / "result.json")}))
            (run / "policy.json").write_text(json.dumps(
                {"posture": "observe", "roots": [str(run)], "commands": ["cat"], "writes": []}))
            script = r'''
import { apply } from %s;
import { existsSync } from "node:fs";
const reg = new Map();
const ctx = {
  effect: (fn) => fn(),
  inject: (deps, cb) => cb({ effect: (fn) => fn(), skills: { register: () => () => {} } }),
  logger: { info() {}, warn() {} },
  tools: { register: (d) => { reg.set(d.name, d); return () => {}; }, guard: () => () => {} },
  systemPrompt: { section: () => () => {}, context: () => () => {} },
};
apply(ctx, {});
let error = null;
try { await reg.get("holon_submit").execute({ result: { kind: "plan" } }, {}); }
catch (e) { error = e.message; }
console.log(JSON.stringify({ error, wrote: existsSync(process.env.RUN_DIR + "/result.json") }));
''' % json.dumps((PLUGIN / "index.js").as_uri())
            env = {**os.environ, "HOLON_RUN_DIR": str(run), "HOLON_STAGE": "plan",
                   "HOLON_POSTURE": "observe", "HOLON_HOME": str(Path(tmp) / "home"),
                   "DSH_HOME": str(Path(tmp) / "dsh-home"), "RUN_DIR": str(run)}
            env.pop("HOLON_RUN_TOKEN", None)
            out = node_run(script, env)
            self.assertIn("refusing", out["error"])
            self.assertIn("token", out["error"].lower())
            self.assertFalse(out["wrote"], "a refused submit writes no envelope")


@unittest.skipUnless(DSH and shutil.which("setfacl") and shutil.which("getfacl"),
                     "dsh and the acl tools are required")
class AgentReach(KernelCase):
    def test_the_installer_grants_the_agent_user_its_harness_home(self):
        """Measured live 2026-11-04: the new adapter directory inherited a deny, so the agent
        user could neither traverse to nor write its DSH_HOME; doctor's isolation.reach failed
        and a dispatch would have died on its first session write. The grant is the installer's.
        A numeric uid is used so the guard proves a grant to *another* principal, not the owner."""
        with open(self.home.config_file, "a") as fh:
            fh.write('\n[isolation]\nagent_user = "424242"\n')
        p = subprocess.run([sys.executable, str(ADAPTER / "install.py"), "--holon-home", str(self.home.root),
                            "--dsh", DSH, "--profile", "holon-reach"],
                           capture_output=True, text=True, timeout=300)
        self.assertEqual(p.returncode, 0, p.stdout[-3000:] + p.stderr[-3000:])
        adapter_home = self.home.root / "adapters" / "deepseek-harness"
        home_acl = subprocess.run(["getfacl", "-p", str(adapter_home / "home")],
                                  capture_output=True, text=True, check=True).stdout
        self.assertIn("user:424242:rwx", home_acl, "the agent user must be able to write its DSH home")
        self.assertIn("default:user:424242:rwx", home_acl, "new session files must inherit the grant")
        dir_acl = subprocess.run(["getfacl", "-p", str(adapter_home)],
                                 capture_output=True, text=True, check=True).stdout
        self.assertIn("user:424242:--x", dir_acl, "the adapter directory must be traversable")
        plugin_acl = subprocess.run(["getfacl", "-p", str(adapter_home / "plugin" / "holon-native" / "index.js")],
                                    capture_output=True, text=True, check=True).stdout
        self.assertIn("user:424242:r", plugin_acl, "the bundle must be readable")


@unittest.skipUnless(NODE, "node is not installed")
class RealRun(KernelCase):
    def test_the_plugin_submits_a_real_prepared_run_into_the_kernel(self):
        """The full push seam: a real prepared run's artifacts → the real bundle → the native
        submit tool → `holon submit` → the kernel's own graph advances to approve."""
        work = self.add(dept="eng")
        c = self.k.claim("plan", self.hod, task_id=work["id"])
        self.assertIsNotNone(c, "a plan stage was claimable")
        run_dir = self.home.run_dir(c.run["id"])
        envelope = self.plan_env()
        script = r'''
import { apply } from %s;
const reg = new Map();
const ctx = {
  effect: (fn) => fn(),
  inject: (deps, cb) => cb({ effect: (fn) => fn(), skills: { register: () => () => {} } }),
  logger: { info() {}, warn() {} },
  tools: { register: (d) => { reg.set(d.name, d); return () => {}; }, guard: () => () => {} },
  systemPrompt: { section: () => () => {}, context: () => () => {} },
};
apply(ctx, { command: JSON.parse(process.env.TEST_COMMAND) });
const identity = await reg.get("holon_identity").execute({}, {});
const submit = await reg.get("holon_submit").execute({ result: JSON.parse(process.env.ENVELOPE) }, {});
console.log(JSON.stringify({ identity, submit }));
''' % json.dumps((PLUGIN / "index.js").as_uri())
        env = {**os.environ, "HOLON_RUN_DIR": str(run_dir), "HOLON_RUN_TOKEN": c.token,
               "HOLON_HOME": str(self.home.root), "HOLON_STAGE": "plan", "HOLON_POSTURE": "observe",
               "HOLON_CHAIR_KEY_FILE": str(self.tmp / "chair.key"), "PYTHONPATH": str(ROOT),
               "DSH_HOME": str(self.tmp / "dsh-home"),
               "TEST_COMMAND": json.dumps([sys.executable, "-m", "holon"]),
               "ENVELOPE": json.dumps(envelope)}
        env.pop("HOLON_KEY", None)
        out = node_run(script, env)
        self.assertEqual(out["identity"]["employee_id"], self.hod)
        self.assertEqual(out["identity"]["run"]["run_id"], c.run["id"])
        self.assertTrue(out["submit"]["submitted"], out["submit"])
        self.assertEqual(json.loads((run_dir / "result.json").read_text()), envelope)
        approval = self.k.work.latest(work["id"], "approve")
        self.assertIsNotNone(approval, "the plan was ingested and routed to an approver")


class ReadOnlyRecall(KernelCase):
    def test_recall_works_through_the_read_only_door(self):
        """Measured live 2026-11-04: recall computed its answer, then wrote the sensor row and
        failed against the read-only connection, so the native tool returned a traceback instead
        of the answer. The sensor is telemetry; the read-only door skips it."""
        from holon import cli as holon_cli

        self.k.memory.add_item("org", "fact", "the harness runs headless", "test", confidence="high")
        before = self.k.mconn.execute("SELECT count(*) FROM recall_log").fetchone()[0]
        buf = io.StringIO()
        with redirect_stdout(buf):
            rc = holon_cli.main(["--home", str(self.home.root), "--mode", "ro", "recall", "headless"])
        self.assertEqual(rc, 0, buf.getvalue())
        self.assertTrue(buf.getvalue().strip(), "recall answered")
        after = self.k.mconn.execute("SELECT count(*) FROM recall_log").fetchone()[0]
        self.assertEqual(before, after, "a read-only session writes no sensor row")
