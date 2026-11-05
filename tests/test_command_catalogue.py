"""The command catalogue a remote surface reads: the manifest, and the configuration surface.

The Command Center's console (adapters/deepseek-harness/dashboard) builds its forms and its
argv from `holon help --json`, which is `cli.manifest()`. That makes the manifest a CONTRACT, not
a convenience: what it says about an argument is what a browser is allowed to send.

Two things are pinned here:

- **the danger markers.** A `path` argument names a file or directory the kernel opens, a `shell`
  argument is a command line the kernel executes, and a `text` argument may be resolved as
  `@file` or stdin. A browser must never be able to supply one, so every argument the kernel
  resolves that way has to carry the marker. The guard walks the kernel for the places these
  resolutions happen and checks each one is marked.
- **the configuration surface.** `holon config show` publishes every key the kernel reads;
  `holon config set` changes one, typed by the value already in force, and never writes a file
  that does not parse.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from holon import cli
from holon.core.paths import Home
from holon.execution import config as config_mod

REPO = Path(__file__).resolve().parents[1]


def _run(home: Path, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, "-m", "holon", "--home", str(home), "--json", *args],
        capture_output=True, text=True, cwd=REPO, timeout=120,
    )


class ManifestTest(unittest.TestCase):
    """The manifest is what a remote surface reads: it must carry the types and the fences."""

    def test_the_manifest_carries_the_typed_arguments_a_form_is_built_from(self) -> None:
        rows = {row["command"]: row for row in cli.manifest()}
        hire = rows["hr hire"]
        by_name = {arg["name"]: arg for arg in hire["args"]}
        self.assertEqual(by_name["name"]["kind"], "string")
        self.assertTrue(by_name["name"]["required"])
        self.assertEqual(by_name["max_concurrency"]["kind"], "integer")
        self.assertFalse(by_name["max_concurrency"]["required"])
        self.assertEqual(by_name["status"]["choices"], ["probation", "active"])
        self.assertEqual(by_name["head"]["kind"], "boolean")
        self.assertEqual(by_name["driver"]["required"], True)

    def test_the_manifest_does_not_publish_a_credential_or_an_impersonation_flag(self) -> None:
        for row in cli.manifest():
            names = {arg["name"] for arg in row["args"]}
            self.assertNotIn("as_", names, f"`holon {row['command']}` publishes --as to a remote surface")
            self.assertNotIn("intake_key", names,
                             f"`holon {row['command']}` publishes --intake-key to a remote surface")

    def test_the_console_never_offers_the_runtime_s_own_seat(self) -> None:
        """`kernel` is the heartbeat's seat: a browser must not drive it."""
        for row in cli.manifest():
            if row["actor"] == "kernel":
                self.assertFalse(row["offerable"],
                                 f"`holon {row['command']}` is the runtime's own seat and must not be "
                                 f"offered to a browser")

    def test_a_command_that_prints_a_credential_is_not_offered(self) -> None:
        for row in cli.manifest():
            if row["command"] in ("hr key", "intake key", "init", "mcp"):
                self.assertFalse(row["offerable"],
                                 f"`holon {row['command']}` prints or mints a credential; a browser "
                                 f"must not reach it")

    def test_every_argument_the_kernel_resolves_as_a_file_is_marked(self) -> None:
        """The `_text_arg` calls are where a value becomes a file read or stdin.

        Measured 2026-11-05: `holon task add --intent @/etc/passwd` pasted a file into the work
        graph. The console refuses a `@`-prefixed value, but only if the manifest says the argument
        is file-resolvable — so every `_text_arg` call site has to carry the marker.
        """
        source = (REPO / "holon" / "cli.py").read_text()
        marked = set()
        for row in cli.manifest():
            for arg in row["args"]:
                if arg["text"]:
                    marked.add((row["command"], arg["name"]))
        # every `_text_arg(args.X)` in a command body has a marked argument of that name
        import re
        for match in re.finditer(r"_text_arg\(args\.(\w+)\)", source):
            name = match.group(1)
            self.assertTrue(
                any(command and arg_name == name for command, arg_name in marked),
                f"holon/cli.py resolves args.{name} as a file or stdin, but no argument of that "
                f"name carries the `text` marker; the console would accept a value the kernel "
                f"reads as a file",
            )

    def test_every_argument_the_kernel_executes_is_marked(self) -> None:
        """A `shell` argument is a command line. The D-01 red team made one of these reachable."""
        marked = {(row["command"], arg["name"]) for row in cli.manifest() for arg in row["args"] if arg["shell"]}
        self.assertIn(("adapter test", "supervisor"), marked,
                      "`holon adapter test --supervisor CMD` runs CMD through a shell; it must carry "
                      "the `shell` marker")
        self.assertIn(("operation add", "command"), marked,
                      "`holon operation add --command` is the script lane: the kernel runs it")

    def test_every_argument_that_names_a_path_is_marked(self) -> None:
        marked = {(row["command"], arg["name"]) for row in cli.manifest() for arg in row["args"] if arg["path"]}
        for command, name in (("backup", "to"), ("dept export", "to"), ("restore", "path"),
                              ("dept import", "archive"), ("skill fork", "file"),
                              ("contract schemas", "write"), ("isolation plan", "write")):
            self.assertIn((command, name), marked,
                          f"`holon {command} --{name}` names a path; it must carry the `path` marker")


class ConfigSurfaceTest(unittest.TestCase):
    """`holon config show` and `holon config set`: the configuration the Chair cannot otherwise see."""

    def setUp(self) -> None:
        self.tmp = Path(tempfile.mkdtemp(prefix="holon-config-"))
        self.home = Home(self.tmp / "home")
        self.home.root.mkdir(parents=True)
        self.home.config_file.write_text(
            "# the operator's comments must survive a change\n"
            "[context]\nbudget_chars = 24000\n\n"
            "[notify]\ndropped_marker = \"\"\n"
            "[autonomy]\n# supervised | delegated | autonomous\nmode = \"supervised\"\n"
            "[chair]\nchannels = []\n")

    def tearDown(self) -> None:
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_every_key_the_kernel_reads_is_published_with_its_source(self) -> None:
        value = config_mod.read(self.home)
        self.assertEqual(value["sections"]["context"]["budget_chars"]["source"], "file")
        self.assertEqual(value["sections"]["context"]["budget_chars"]["value"], 24000)
        self.assertEqual(value["sections"]["retention"]["runs_days"]["source"], "default")
        self.assertIn("autonomy", value["sections"])

    def test_a_key_the_file_carries_and_the_kernel_does_not_read_is_reported(self) -> None:
        self.home.config_file.write_text("[context]\nbudget_chars = 24000\nnonsense = 1\n")
        value = config_mod.read(self.home)
        unknown = {(row["section"], row["key"]) for row in value["unknown"]}
        self.assertIn(("context", "nonsense"), unknown,
                      "a key the kernel does not read is a typo or a setting from another version; "
                      "the Chair must be able to see it")

    def test_a_nested_table_is_not_reported_as_an_unknown_key(self) -> None:
        """[scope.dept.<slug>] is a table the kernel reads, not a typo."""
        self.home.config_file.write_text(
            "[scope]\nroots = []\n\n[scope.dept.eng]\nroots = [\"/srv/eng\"]\n")
        value = config_mod.read(self.home)
        self.assertEqual(value["unknown"], [],
                         "a nested table was reported as an unknown key")
        self.assertIn("scope.dept.eng", value["nested"])
        self.assertEqual(value["sections"]["scope"]["dept"]["type"], "table")

    def test_a_data_section_is_not_reported_as_an_unknown_key(self) -> None:
        """[classes] maps a department slug to a list: the keys are data, not settings."""
        self.home.config_file.write_text("[classes]\norg = [\"research\"]\n")
        value = config_mod.read(self.home)
        self.assertEqual(value["unknown"], [])

    def test_a_change_is_typed_by_the_value_already_in_force(self) -> None:
        config_mod.set_key(self.home, "context", "budget_chars", "32000")
        self.assertIn("budget_chars = 32000", self.home.config_file.read_text())
        with self.assertRaises(config_mod.ConfigError):
            config_mod.set_key(self.home, "context", "budget_chars", "abc")
        self.assertIn("budget_chars = 32000", self.home.config_file.read_text())

    def test_a_change_keeps_the_comments_of_the_file(self) -> None:
        config_mod.set_key(self.home, "autonomy", "mode", "delegated")
        text = self.home.config_file.read_text()
        self.assertIn("# supervised | delegated | autonomous", text)
        self.assertIn('mode = "delegated"', text)

    def test_a_key_the_kernel_does_not_read_is_refused(self) -> None:
        with self.assertRaises(config_mod.ConfigError):
            config_mod.set_key(self.home, "context", "nonsense", "1")
        with self.assertRaises(config_mod.ConfigError):
            config_mod.set_key(self.home, "nonsense", "key", "1")

    def test_a_nested_table_is_not_settable_from_the_command(self) -> None:
        """[scope.dept.<slug>] belongs to a department's archive, not to one key edit."""
        self.home.config_file.write_text("[scope.dept.eng]\nroots = []\n")
        with self.assertRaises(config_mod.ConfigError):
            config_mod.set_key(self.home, "scope.dept.eng", "roots", "[]")

    def test_the_command_answers_json_and_changes_the_file(self) -> None:
        out = _run(self.home.root, "config", "show")
        self.assertEqual(out.returncode, 0, out.stderr)
        payload = json.loads(out.stdout)
        self.assertIn("sections", payload)
        self.assertIn("context", payload["sections"])
        out = _run(self.home.root, "config", "set", "context", "budget_chars", "32000")
        self.assertEqual(out.returncode, 0, out.stderr)
        self.assertIn("budget_chars = 32000", self.home.config_file.read_text())


class SkillForkTraversalTest(unittest.TestCase):
    """`skill fork --file` copied a file from OUTSIDE the skill library into the instance.

    Measured 2026-11-05 while auditing the argument surface: `resolve` refuses a file name that
    climbs out of the skill, but `fork` built the paths by hand and did not — so the one reader
    that checked names did not check files, and `holon skill fork x --file ../../SECRET` copied
    whatever the kernel user could read.
    """

    def test_a_file_name_that_climbs_out_of_the_skill_is_refused(self) -> None:
        from holon.capabilities.skills import Library, SkillError
        tmp = Path(tempfile.mkdtemp(prefix="holon-fork-"))
        try:
            home = Home(tmp / "home")
            home.root.mkdir(parents=True)
            library = Library(home)
            # a stdlib of its own: the shipped library is the repository's own skills directory,
            # and a test must never write into it
            library.stdlib = tmp / "stdlib"
            (library.stdlib / "demo").mkdir(parents=True, exist_ok=True)
            (library.stdlib / "demo" / "SKILL.md").write_text("---\nname: demo\n---\nhello\n")
            (tmp / "SECRET.txt").write_text("not a skill\n")
            with self.assertRaises(SkillError):
                library.fork("demo", None, "../../SECRET.txt")
            self.assertFalse((home.root / "SECRET.txt").exists(),
                             "a file outside the library was copied into the instance")
            self.assertFalse((home.root / "skills" / "SECRET.txt").exists(),
                             "a file outside the library was copied into the instance")
        finally:
            shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
