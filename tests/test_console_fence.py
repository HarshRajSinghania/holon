"""The Command Center's console: the fence between a browser and the kernel's command line.

The dashboard used to hand-maintain a switch of nineteen actions while the kernel registered 130
commands, so 86 of them were unreachable from the browser. The console replaces the twin: it
builds its forms and its argv from the kernel's own manifest (`holon help --json`), and refuses
the arguments the manifest marks as a path, a command line, or a file reference.

These guards are the D-01 class, applied to the mechanism that replaced the switch: a value in a
browser must never become a file read, a shell command, or an option injection.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

BUNDLE = Path(__file__).resolve().parents[1] / "adapters" / "deepseek-harness" / "dashboard"

CONSOLE_GUARD = r"""
import { buildArgv, consoleCommands } from '__LIB__/console.js';

const failures = [];
const check = (name, ok, detail) => { if (!ok) failures.push(name + (detail ? ' — ' + detail : '')); };
const refused = (name, row, values) => {
  try { buildArgv(row, values); check(name + ' must be refused', false, 'it built argv'); }
  catch (e) { check(name + ' refused: ' + e.code, e.code === 'invalid_request', e.code); }
};
const row = (over) => Object.assign({
  command: 'task add', actor: 'chair', mutates: true, help: '', offerable: true,
  args: [
    { name: 'title', flag: 'title', kind: 'string', positional: true, required: true, choices: null },
    { name: 'intent', flag: '--intent', kind: 'string', positional: false, required: true, choices: null, text: true },
    { name: 'lane', flag: '--lane', kind: 'string', positional: false, required: false, choices: ['auto', 'fast', 'full'] },
    { name: 'priority', flag: '--priority', kind: 'integer', positional: false, required: false, choices: null },
    { name: 'head', flag: '--head', kind: 'boolean', positional: false, required: false, choices: null },
  ],
}, over);

// The happy path: every declared kind reaches argv in the form the kernel parses.
const argv = buildArgv(row(), { title: 'A title', intent: 'do it', lane: 'fast', priority: 3, head: true });
check('the argv is built', JSON.stringify(argv) === JSON.stringify(
  ['A title', '--intent=do it', '--lane=fast', '--priority=3', '--head']), JSON.stringify(argv));

// A missing required argument.
refused('a missing required argument', row(), { intent: 'x' });

// An argument the command does not declare: the browser cannot invent a flag.
refused('an undeclared argument', row(), { title: 't', intent: 'x', supervisor: 'id' });

// The D-02 class: a value the kernel resolves as a FILE or as stdin.
refused('a file reference', row(), { title: 't', intent: '@/etc/passwd' });
refused('stdin', row(), { title: 't', intent: '-' });

// The D-01 class: a positional that argparse would read as an option.
refused('an option in a positional', row(), { title: '--help', intent: 'x' });

// A value outside the declared choices, and a value of the wrong type.
refused('a value outside the choices', row(), { title: 't', intent: 'x', lane: 'nope' });
refused('a value of the wrong type', row(), { title: 't', intent: 'x', priority: 'abc' });

// The arguments the manifest marks as a path or a command line.
refused('a path argument', row({ args: [{ name: 'to', flag: '--to', kind: 'string', positional: false, required: false, choices: null, path: true }] }), { to: '/etc/x' });
refused('a shell argument', row({ args: [{ name: 'cmd', flag: '--cmd', kind: 'string', positional: false, required: false, choices: null, shell: true }] }), { cmd: 'id' });

// A free-form tail (`argparse.REMAINDER`) would let the browser pass anything.
refused('a free-form argument', row({ args: [{ name: 'tokens', flag: 'tokens', kind: 'array', positional: true, required: false, choices: null, freeform: true }] }), { tokens: 'x' });

// The catalogue: the runtime's own seat and the credential-minting commands are not offered.
const rows = [
  { command: 'status', actor: 'any', mutates: false, help: '', offerable: true, args: [] },
  { command: 'dispatch', actor: 'kernel', mutates: true, help: '', offerable: false, args: [] },
  { command: 'hr key', actor: 'chair', mutates: true, help: '', offerable: false, args: [] },
  { command: 'kb run', actor: 'any', mutates: true, help: '', offerable: true,
    args: [{ name: 'tokens', flag: 'tokens', kind: 'array', positional: true, required: false, choices: null, freeform: true }] },
];
const offered = consoleCommands(rows).map((c) => c.command);
check('the runtime seat is not offered', !offered.includes('dispatch'), JSON.stringify(offered));
check('a credential command is not offered', !offered.includes('hr key'), JSON.stringify(offered));
check('a free-form command is not offered', !offered.includes('kb run'), JSON.stringify(offered));
check('an ordinary command is offered', offered.includes('status'), JSON.stringify(offered));

// A command whose REQUIRED argument is fenced can never run from a browser: the console used to
// offer it, and every attempt ended in the kernel refusing the one argument the browser may not
// name. It is not offered, and an optional fenced argument is published with its fence.
const dead = { command: 'backup', actor: 'chair', mutates: true, help: '', offerable: true,
  args: [{ name: 'to', flag: '--to', kind: 'string', positional: false, required: true, choices: null, path: true }] };
const optional = { command: 'dept create', actor: 'chair', mutates: true, help: '', offerable: true,
  args: [{ name: 'slug', flag: 'slug', kind: 'string', positional: true, required: true, choices: null },
    { name: 'profile', flag: '--profile', kind: 'string', positional: false, required: false, choices: null, path: true }] };
const offered2 = consoleCommands([dead, optional]).map((c) => c.command);
check('a command whose required argument is fenced is not offered', !offered2.includes('backup'), JSON.stringify(offered2));
check('a command with an optional fenced argument is offered', offered2.includes('dept create'), JSON.stringify(offered2));
const fenced = consoleCommands([optional])[0].args.find((a) => a.name === 'profile');
check('the fenced argument is published with its fence', fenced && fenced.fenced === 'path', JSON.stringify(fenced));

if (failures.length) { console.error('FAILED: ' + failures.join(' | ')); process.exit(1); }
console.log('CONSOLE GUARD OK');
"""


CATALOGUE_GUARD = r"""
import { readFileSync } from 'node:fs';
import { consoleCommands } from '__LIB__/console.js';

const failures = [];
const check = (name, ok, detail) => { if (!ok) failures.push(name + (detail ? ' — ' + detail : '')); };

// A command whose REQUIRED argument is fenced can never run from a browser: the console used to
// offer it, and every attempt ended in the kernel refusing the one argument the browser may not
// name. It is not offered, and an optional fenced argument is published with its fence.
const dead = { command: 'backup', actor: 'chair', mutates: true, help: '', offerable: true,
  args: [{ name: 'to', flag: '--to', kind: 'string', positional: false, required: true, choices: null, path: true }] };
const optional = { command: 'dept create', actor: 'chair', mutates: true, help: '', offerable: true,
  args: [{ name: 'slug', flag: 'slug', kind: 'string', positional: true, required: true, choices: null },
    { name: 'profile', flag: '--profile', kind: 'string', positional: false, required: false, choices: null, path: true }] };
const offered = consoleCommands([dead, optional]).map((c) => c.command);
check('a command whose required argument is fenced is not offered', !offered.includes('backup'), JSON.stringify(offered));
check('a command with an optional fenced argument is offered', offered.includes('dept create'), JSON.stringify(offered));
const fenced = consoleCommands([optional])[0].args.find((a) => a.name === 'profile');
check('the fenced argument is published with its fence', fenced && fenced.fenced === 'path', JSON.stringify(fenced));

// And the same holds for the kernel's own registry: nothing that could never run is offered.
const rows = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const catalogue = consoleCommands(rows);
const names = catalogue.map((c) => c.command);
const unreachable = rows
  .filter((r) => r && r.offerable && !(r.args || []).some((a) => a && a.freeform))
  .filter((r) => (r.args || []).some((a) => a && a.required && (a.path || a.shell)))
  .map((r) => r.command);
for (const command of unreachable) {
  check('a command that could never run is not offered: ' + command, !names.includes(command), JSON.stringify(names));
}
check('the registry has commands the browser may run', names.length > 50, String(names.length));

if (failures.length) { console.error('FAILED: ' + failures.join(' | ')); process.exit(1); }
console.log('CATALOGUE GUARD OK');
"""


MANIFEST_GUARD = r"""
import { readFileSync } from 'node:fs';
import { consoleCommands, entityCatalogue } from '__LIB__/console.js';

const failures = [];
const check = (name, ok, detail) => { if (!ok) failures.push(name + (detail ? ' — ' + detail : '')); };

const rows = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const commands = consoleCommands(rows);

// Every object the dashboard shows is bound to the commands that act on it, and to the command
// that previews it. The binding is derived, so it holds for whatever the kernel registers.
const catalogue = entityCatalogue(commands);
const bound = [
  ['task', 'task_id', 'task show'],
  ['plan', 'ref', 'plan show'],
  ['memory', 'item_id', 'memory show'],
  ['hr', 'employee', 'hr review'],
  ['emp', 'employee', 'emp show'],
  ['dept', 'slug', 'dept roles'],
  ['skill', 'name', 'skill show'],
  ['playbook', 'name', 'playbook show'],
  ['run', 'run_id', 'run show'],
  ['msg', 'message', 'msg thread'],
  ['schedule', 'schedule_id', null],
];
for (const [family, idName, preview] of bound) {
  const actions = (catalogue.entities[family] || {})[idName] || [];
  check('the ' + family + ' object has commands', actions.length > 0, JSON.stringify(catalogue.entities[family] || {}));
  check('the ' + family + ' object previews with ' + preview, preview === null || (catalogue.previews[family] || {})[idName] === preview,
    JSON.stringify(catalogue.previews[family] || {}));
}

// A creation is not an action on an existing object: `task add` names a new title, `dept
// create` a new slug, and neither acts on the work or the department that already exists.
for (const [family, idName, verb] of [['task', 'title', 'task add'], ['dept', 'slug', 'dept create']]) {
  const actions = (catalogue.entities[family] || {})[idName] || [];
  check('a creation is not an action on an object: ' + verb, !actions.includes(verb), JSON.stringify(actions));
}

if (failures.length) { console.error('FAILED: ' + failures.join(' | ')); process.exit(1); }
console.log('MANIFEST GUARD OK');
"""


class ConsoleFenceTest(unittest.TestCase):
    """The generic console's own guards, exercised against the real module."""

    def _run(self, script: str, *args: str) -> subprocess.CompletedProcess:
        node = shutil.which("node")
        if node is None:
            self.skipTest("node is not installed")
        with tempfile.TemporaryDirectory(prefix="holon-console-guard-") as tmp:
            path = Path(tmp) / "guard.mjs"
            path.write_text(script.replace("__LIB__", (BUNDLE / "lib").as_uri()))
            return subprocess.run([node, str(path), *args], capture_output=True, text=True, timeout=120)

    def test_the_console_refuses_what_the_kernel_would_resolve_as_a_file_or_a_command(self) -> None:
        result = self._run(CONSOLE_GUARD)
        self.assertEqual(result.returncode, 0, result.stderr[-3000:])

    def test_a_command_the_browser_could_never_run_is_not_offered(self) -> None:
        """The catalogue must not promise what the fence forbids.

        Traced 2026-11-05 (the entity-surface round): the console listed every command the
        kernel offered, including eight whose REQUIRED argument is a file or a command line —
        `dept export`, `dept import`, `venture import`, `operation import`, `skill export`,
        `backup`, `bylaws draft` and `restore`. Every attempt ended in the kernel refusing the
        one argument the browser is not allowed to name, so the page offered a button that could
        only fail. A command the browser could never run is not offered.
        """
        from holon import cli
        with tempfile.TemporaryDirectory(prefix="holon-catalogue-guard-") as tmp:
            manifest = Path(tmp) / "manifest.json"
            manifest.write_text(json.dumps(cli.manifest()))
            result = self._run(CATALOGUE_GUARD, str(manifest))
        self.assertEqual(result.returncode, 0, result.stderr[-3000:])

    def test_every_object_is_bound_to_the_commands_that_act_on_it(self) -> None:
        """The binding between an object and the kernel's commands is derived, not written.

        Traced 2026-11-05 (the entity-surface round): the dashboard's pages were previews. A
        work item, a department, a skill or a memory item showed what the kernel held and offered
        nothing to do with it, so the commands that act on those objects were reachable only by
        typing their names in the console. The catalogue now derives which commands act on which
        object, and this guard holds that binding against the real registry.
        """
        from holon import cli
        with tempfile.TemporaryDirectory(prefix="holon-manifest-guard-") as tmp:
            manifest = Path(tmp) / "manifest.json"
            manifest.write_text(json.dumps(cli.manifest()))
            result = self._run(MANIFEST_GUARD, str(manifest))
        self.assertEqual(result.returncode, 0, result.stderr[-3000:])


class ConsoleResourceTest(unittest.TestCase):
    """The console's catalogue comes from the kernel's manifest, not from a list in the adapter."""

    def test_the_console_reads_its_catalogue_from_the_kernel(self) -> None:
        source = (BUNDLE / "lib" / "console.js").read_text()
        self.assertIn("['help']", source,
                      "the console's catalogue must be the kernel's own manifest")
        resources = (BUNDLE / "lib" / "resources.js").read_text()
        self.assertIn("consoleCommands", resources)

    def test_the_manifest_the_console_reads_carries_the_fences(self) -> None:
        from holon import cli
        rows = {row["command"]: row for row in cli.manifest()}
        self.assertIn("args", rows["task add"])
        self.assertIn("offerable", rows["task add"])
        self.assertFalse(rows["dispatch"]["offerable"])


if __name__ == "__main__":
    unittest.main()
