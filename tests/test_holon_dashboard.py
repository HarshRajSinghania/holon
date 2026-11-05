"""The Holon Command Center bundle: manifest, slots, host route and display resources."""

from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUNDLE = ROOT / "adapters" / "deepseek-harness" / "dashboard"


class BundleTest(unittest.TestCase):
    def test_manifest_declares_a_bundle_and_a_web_client(self) -> None:
        manifest = json.loads((BUNDLE / "package.json").read_text())
        self.assertEqual(manifest["name"], "@local/holon-dashboard")
        self.assertEqual(manifest["type"], "module")
        self.assertEqual(manifest["dsh"]["bundle"]["patch"], "./cordis.patch.yml")
        self.assertEqual(manifest["dsh"]["client"]["platform"], "web")
        self.assertIn("./client", manifest["exports"])
        self.assertIn("./icon", manifest["exports"])
        self.assertIn("client.js", manifest["files"])
        self.assertIn("lib/*.js", manifest["files"])

    def test_patch_inserts_the_dashboard_row(self) -> None:
        patch = (BUNDLE / "cordis.patch.yml").read_text()
        self.assertIn("id: holon-dashboard", patch)
        self.assertIn("name: '@local/holon-dashboard'", patch)
        self.assertIn("refreshMs:", patch)

    def test_host_registers_one_owner_only_api_route(self) -> None:
        source = (BUNDLE / "index.js").read_text()
        self.assertIn("ctx.connection.fetch.register", source)
        self.assertIn("path: '/api/holon-dashboard'", source)
        self.assertIn("methods: ['GET', 'POST']", source)
        self.assertIn("requestBody: 'buffered'", source)

    def test_client_registers_every_dashboard_surface(self) -> None:
        source = (BUNDLE / "client.js").read_text()
        self.assertIn("window.__ModuleLoader__.load", source)
        self.assertIn("id: '@local/holon-dashboard'", source)
        for slot, key in [
            ("main", "key: 'holon'"),
            ("sidebar.panellist", "id: 'holon'"),
            ("settings.section", "id: 'holon'"),
            ("conversation.composer.dock", "id: 'holon-dock'"),
        ]:
            self.assertIn(f"'{slot}'", source)
            self.assertIn(key, source)
        self.assertIn("ctx.slots.inject", source)

    def test_client_does_not_import_a_harness_client_package(self) -> None:
        source = (BUNDLE / "client.js").read_text()
        self.assertNotIn("@deepseek-ai/dsh-client-ui-primitives", source)
        self.assertNotIn("document.body.appendChild", source)
        self.assertIn("--dsw-alias-", source)

    def test_locale_metadata_is_complete(self) -> None:
        for locale in ("en", "zh"):
            data = json.loads((BUNDLE / "locale" / f"{locale}.json").read_text())
            meta = data.get("meta") or {}
            self.assertTrue(meta.get("title"))
            self.assertTrue(meta.get("description"))

    def test_icon_is_svg_inside_the_package(self) -> None:
        icon = BUNDLE / "icon.svg"
        self.assertEqual(icon.parent, BUNDLE)
        root = ET.fromstring(icon.read_text())
        self.assertTrue(root.tag.endswith("svg"))
        self.assertLessEqual(icon.stat().st_size, 256 * 1024)

    def test_javascript_parses_when_node_is_available(self) -> None:
        node = shutil.which("node")
        if node is None:
            self.skipTest("node is not installed")
        for path in [BUNDLE / "index.js", BUNDLE / "client.js", *sorted((BUNDLE / "lib").glob("*.js"))]:
            result = subprocess.run([node, "--check", str(path)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, f"{path.name}: {result.stderr}")

    def test_the_dashboard_client_registers_its_locale_inside_an_effect(self) -> None:
        """The locale dictionary must have a disposer, or a reload kills the client half.

        Live defect (2026-11-04): the registration ran outside any effect, so it owned no
        disposer. A disable/enable cycle re-applied the factory, the namespace was still
        registered, `ctx.locale.register` threw, and every surface (page, sidebar icon,
        settings section, composer signal) silently disappeared while the bundle stayed enabled.
        """
        node = shutil.which("node")
        if node is None:
            self.skipTest("node is not installed")
        source = (BUNDLE / "client.js").read_text()
        self.assertIn("ctx.locale.register(NS", source)
        register_at = source.index("ctx.locale.register(NS")
        # The registration must sit inside an effect callback: the effect's body is the only
        # place whose return value becomes the disposer.
        effect_at = source.rindex("ctx.effect(", 0, register_at)
        self.assertLess(effect_at, register_at)
        effect_block = source[effect_at:]
        self.assertIn("holon-dashboard: locale dictionary", effect_block[:1200])
        # The effect must return a cleanup that disposes the registration.
        after_register = source[register_at:]
        self.assertIn("return () => { dispose();", after_register)
        # And a stale namespace must not take the plugin down.
        self.assertIn("already registered", after_register)

SYMLINK_GUARD = r"""
import { Holon } from '__LIB__/holon.js';
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const failures = [];
const check = (name, ok, detail) => { if (!ok) failures.push(name + (detail ? ' — ' + detail : '')); };

// A run directory is writable by the body that ran in it, so a symlink can be planted where the
// kernel later reads. The dashboard reads with the kernel user's privileges: following such a
// link serves any file on the machine — the Chair key among them — to the browser.
const home = mkdtempSync(join(tmpdir(), 'holon-symlink-'));
const dir = join(home, 'execution', 'runtime', 'runs', 'run_probe');
mkdirSync(dir, { recursive: true });
symlinkSync('/etc/hostname', join(dir, 'result.json'));
symlinkSync('/etc/passwd', join(dir, 'BRIEF.md'));

const holon = new Holon({
  home, command: ['/bin/true'], timeoutMs: 1000, actionTimeoutMs: 1000, cacheTtlMs: 0,
  allowActions: false, refreshMs: 20000, dshHome: home, configPath: join(home, 'holon.json'),
}, process.env);

const result = holon.readJsonFile(join(dir, 'result.json'));
check('a symlinked result.json is refused', result.ok === false, JSON.stringify(result).slice(0, 120));
const brief = holon.tailFile(join(dir, 'BRIEF.md'));
check('a symlinked BRIEF.md is refused', brief.ok === false, JSON.stringify(brief).slice(0, 120));

// A real file inside the instance still reads.
writeFileSync(join(dir, 'driver.log'), 'a real log line\n');
const log = holon.tailFile(join(dir, 'driver.log'));
check('a real file still reads', log.ok === true && String(log.text).includes('a real log line'), JSON.stringify(log).slice(0, 160));

if (failures.length) { console.error('FAILED: ' + failures.join(' | ')); process.exit(1); }
console.log('SYMLINK GUARD OK');
"""

ACTION_GUARD = r"""
import { runAction } from '__LIB__/actions.js';

const calls = [];
const holon = {
  json: async (args) => { calls.push(args); return { ok: true }; },
  text: async (args) => { calls.push(args); return ''; },
};
const config = { allowActions: true, actionTimeoutMs: 30000 };
const failures = [];
function check(name, ok, detail) { if (!ok) failures.push(name + (detail ? ' — ' + detail : '')); }

async function refused(name, payload) {
  return runAction(holon, config, name, payload).then(
    () => check(name + ' must be refused', false, 'it ran'),
    (error) => check(name + ' refused: ' + error.code, error.code === 'invalid_request', error.code),
  );
}

// The RCE: a free-text `driver` carried `--supervisor=...`, and `holon adapter test --supervisor`
// runs that string through a shell. The driver must be a plain name and the clauses the driver's.
await refused('conformance.run', { confirm: 'CONFORMANCE', driver: '--supervisor=touch /tmp/pwned', clauses: 'env' });
await refused('conformance.run', { confirm: 'CONFORMANCE', driver: 'fake; rm -rf /', clauses: 'driver' });
await refused('conformance.run', { confirm: 'CONFORMANCE', driver: 'real', clauses: 'prepare' });

// The file read: `holon task add` resolves a value starting with '@' as a file path, so a
// payload could paste any file the kernel user can read into the work graph and back to the browser.
await refused('task.add', { title: 'probe', intent: '@/etc/hostname' });
await refused('task.add', { title: 'probe', intent: 'fine', acceptance: '@/etc/passwd' });

// The option injection: a positional starting with '-' is read as a flag, not as text.
await refused('task.add', { title: '--help', intent: 'fine' });
await refused('task.add', { title: '--dept=executive', intent: 'fine' });
await refused('task.answer', { id: 'tst_abc', text: '--note=x' });

// The command must not have run for any of the refusals above.
check('no kernel process started', calls.length === 0, JSON.stringify(calls));

// And the well-formed payload still reaches the kernel, byte for byte.
const ok = await runAction(holon, config, 'task.add', { title: 'A real title', intent: 'A real intent' });
check('task.add runs', ok && ok.action === 'task.add');
const args = calls[0];
check('task.add argv', JSON.stringify(args) === JSON.stringify(['task', 'add', 'A real title',
  '--intent=A real intent', '--lane', 'auto', '--risk', 'normal', '--priority', '2']), JSON.stringify(args));

if (failures.length) { console.error('FAILED: ' + failures.join(' | ')); process.exit(1); }
console.log('ACTION GUARD OK');
"""

ERROR_PATH_GUARD = r"""
import { createApi } from '__LIB__/api.js';
import { existsSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const home = mkdtempSync(join(tmpdir(), 'holon-error-path-'));
const failures = [];
const check = (name, ok, detail) => { if (!ok) failures.push(name + (detail ? ' — ' + detail : '')); };

// A command that exits non-zero: the defect used the child's EXIT CODE as the HTTP status, so
// `Response.json(body, { status: 1 })` threw a RangeError inside the error responder and the Chair
// got an empty 400 with no reason at all.
const api = createApi({ holonHome: home, command: ['/bin/false'], allowActions: true }, {});
const owner = 'unused';
const session = await api.handle(new Request('http://127.0.0.1:3080/api/holon-dashboard?resource=session'), owner);
const nonce = String(JSON.parse(await session.text())?.nonce || '');
const res = await api.handle(new Request('http://127.0.0.1:3080/api/holon-dashboard', {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-holon-dashboard': '1', 'x-holon-write': nonce },
  body: JSON.stringify({ action: 'task.cancel', id: 'tsk_abcdefgh', note: 'probe' }),
}));
const body = await res.text();
check('a failed action answers JSON', res.status >= 500 && res.status <= 599 && body.includes('"error"'), String(res.status) + ' ' + body.slice(0, 120));
check('the reason travels', body.includes('command_failed') || body.includes('failed'), body.slice(0, 200));

// A kernel that cannot run at all: the dashboard must say DEGRADED, not show a healthy zero.
const broken = createApi({ holonHome: home, command: ['/nonexistent/holon-binary'], allowActions: true }, {});
const overview = await broken.handle(new Request('http://127.0.0.1:3080/api/holon-dashboard?resource=overview'), owner);
const json = JSON.parse(await overview.text());
check('a broken kernel is 200', overview.status === 200, String(overview.status));
check('a broken kernel is degraded', json.degraded === true && json.failures.length > 0, JSON.stringify(json.failures).slice(0, 200));

if (failures.length) { console.error('FAILED: ' + failures.join(' | ')); process.exit(1); }
console.log('ERROR PATH GUARD OK');
"""


WRITE_TOKEN_GUARD = r"""
import { createApi } from '__LIB__/api.js';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const home = mkdtempSync(join(tmpdir(), 'holon-write-token-'));
const failures = [];
const check = (name, ok, detail) => { if (!ok) failures.push(name + (detail ? ' — ' + detail : '')); };

const api = createApi({ holonHome: home, command: ['/bin/false'], allowActions: true }, {});
const owner = 'unused';
const write = (headers) => api.handle(new Request('http://127.0.0.1:3080/api/holon-dashboard', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-holon-dashboard': '1', ...headers },
  body: JSON.stringify({ action: 'doctor.run' }),
}));

// The token: the Host mints it and hands it out over a GET. A page on another origin can ask
// for it and cannot read the answer, so it cannot write.
const session = await api.handle(new Request('http://127.0.0.1:3080/api/holon-dashboard?resource=session'), owner);
const nonce = String(JSON.parse(await session.text())?.nonce || '');
check('the session hands out a write token', nonce.length >= 32, String(nonce).slice(0, 40));

// The static header alone is not enough. Before the token, any page the Chair opened could file
// work, hire, fire, cancel and retire in the organization.
const noToken = await write({});
check('a write without the token is refused', noToken.status === 403, String(noToken.status));
const wrongToken = await write({ 'x-holon-write': 'not-the-token' });
check('a write with the wrong token is refused', wrongToken.status === 403, String(wrongToken.status));
const withToken = await write({ 'x-holon-write': nonce });
check('a write with the token is not refused for the token', withToken.status !== 403, String(withToken.status));

if (failures.length) { console.error('FAILED: ' + failures.join(' | ')); process.exit(1); }
console.log('WRITE TOKEN GUARD OK');
"""


RENDER_GUARD = r"""
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { consoleCommands, entityCatalogue } from '__LIB__/console.js';

const failures = [];
const check = (name, ok, detail) => { if (!ok) failures.push(name + (detail ? ' — ' + detail : '')); };

// The client half, rendered. React is not installed here, so a stand-in stands in for it: the
// point is not to test React but to prove that the components the pages are made of actually
// run, and that the kernel's commands reach the object they belong to.
const React = {
  useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
  useEffect: () => {},
  useCallback: (fn) => fn,
  useRef: (value) => ({ current: value }),
  useMemo: (fn) => fn(),
  useReducer: (_reducer, init) => [init, () => {}],
};
// React's createElement does not render a component; the renderer does. The stand-in renders
// eagerly, so the tree the assertions read is the tree the browser would show.
const h = (type, props, ...children) => {
  const merged = { ...(props || {}), children: children.flat(Infinity) };
  if (typeof type === 'function') return type(merged);
  return { type, props: merged };
};
const text = (node) => {
  if (node === null || node === undefined || node === false || node === true) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(text).join(' ');
  if (node && node.props) {
    return Object.entries(node.props).map(([, value]) => text(value)).join(' ');
  }
  return '';
};

const bundle = process.argv[4];
const src = join(bundle, 'src');
const code = readdirSync(src).filter((name) => name.endsWith('.js')).sort()
  .map((name) => readFileSync(join(src, name), 'utf8')).join('\n');

const sandbox = {
  React, h, console,
  document: {
    head: { appendChild: () => {} }, createElement: () => ({ setAttribute: () => {}, remove: () => {} }),
    addEventListener: () => {}, querySelectorAll: () => [], activeElement: null,
  },
  location: { origin: 'http://127.0.0.1:3080' },
  navigator: { clipboard: { writeText: async () => {} } },
  fetch: async () => ({ ok: true, status: 200, text: async () => '{}' }),
  setTimeout, clearTimeout, setInterval, clearInterval,
};
const context = vm.createContext(sandbox);
vm.runInContext(code, context);

// The kernel's own catalogue: the same rows the Host publishes.
const rows = JSON.parse(readFileSync(process.argv[3], 'utf8'));
const commands = consoleCommands(rows);
const catalogue = { commands, ...entityCatalogue(commands) };

const payloads = {
  commands: catalogue,
  org: { departments: [{ id: 'd1', slug: 'engines', name: 'Engines', mission: 'We build.', profile: 'light', employees: [] }], employees: [], drivers: [] },
  knowledge: { skills: [{ name: 'maker', kind: 'role', version: 1, source: 'lib', roles: [], files: [] }], playbooks: [], kbs: {} },
  work: { rows: [], filters: { departments: [], employees: [] }, pipeline: [], work: {} },
  runs: { rows: [], counts: {} },
  ops: { doctor: { groups: [] }, schedules: { rows: [] }, operations: [], drivers: [], backups: [] },
  messages: { rows: [], counts: {} },
  overview: { stats: {}, heartbeat: {} },
};
context.useSharedApi = (resource) => ({ data: payloads[resource] || null, error: null, loading: false, reload: () => {} });
context.useApi = (resource) => ({ data: payloads[resource] || null, error: null, loading: false, reload: () => {} });

// The object carries the kernel's commands for it.
const workCommands = text(context.EntityCommands({ families: ['task', 'memory'], values: { task_id: 'tsk_1' }, title: 'Commands', onAction: () => {} }));
check('a work item carries its own commands', workCommands.includes('task cancel') && workCommands.includes('task supersede'), workCommands.slice(0, 200));
check('a work item carries the memory it was bound', workCommands.includes('memory context'), workCommands.slice(0, 200));
const employeeCommands = text(context.EntityCommands({ families: ['hr', 'emp'], values: { employee: 'emp_1' }, title: 'Commands', onAction: () => {} }));
check('an employee carries its own commands', employeeCommands.includes('hr fire') && employeeCommands.includes('hr reassign'), employeeCommands.slice(0, 200));
const memoryCommands = text(context.EntityCommands({ families: ['memory'], values: { item_id: 'itm_1' }, title: 'Commands', onAction: () => {} }));
check('a memory item carries its own commands', memoryCommands.includes('memory retire') && memoryCommands.includes('memory promote'), memoryCommands.slice(0, 200));
check('a creation is not offered as an action on an object', !workCommands.includes('task add'), workCommands.slice(0, 200));

// The drawer that previews an object runs, and names the command it previews with.
const drawer = text(context.EntityDrawer({ title: 'Engines', sub: 'engines', families: ['dept'], values: { slug: 'engines' }, facts: [], onClose: () => {}, onAction: () => {} }));
check('the drawer names the preview command', drawer.includes('dept roles'), drawer.slice(0, 240));

// Every family the pages own has a way to create one.
const org = text(context.OrgPage({ onAction: () => {} }));
check('the organization page creates a department', org.includes('New department'), org.slice(0, 200));
check('the organization page hires an employee', org.includes('Hire employee'), org.slice(0, 200));
const knowledge = text(context.KnowledgePage({ onAction: () => {} }));
check('the knowledge page creates a skill', knowledge.includes('New skill'), knowledge.slice(0, 200));
check('the knowledge page writes a memory', knowledge.includes('New memory'), knowledge.slice(0, 200));
check('the knowledge page seeds a knowledge base', knowledge.includes('Seed knowledge base'), knowledge.slice(0, 200));
const work = text(context.WorkPage({ focus: null, onClearFocus: () => {}, onAction: () => {}, onOpenRun: () => {} }));
check('the work page files an objective', work.includes('New objective'), work.slice(0, 200));
const ops = text(context.OpsPage({ onAction: () => {} }));
check('the operations page creates a schedule', ops.includes('New schedule'), ops.slice(0, 200));
check('the operations page creates an operation', ops.includes('New operation'), ops.slice(0, 200));

if (failures.length) { console.error('FAILED: ' + failures.join(' | ')); process.exit(1); }
console.log('RENDER GUARD OK');
"""


class ActionLayerTest(unittest.TestCase):
    """The write path's own guards, exercised against the real action module.

    Live defects (2026-11-05, red-team of the installed Command Center):
      - a free-text `driver` reached `holon adapter test --supervisor CMD`, which runs CMD
        through a shell: a browser POST was remote command execution as the kernel's user;
      - a payload beginning with '@' was resolved by the kernel as a file path, so any file the
        kernel user could read could be pasted into the work graph and read back;
      - a child's exit code was used as the HTTP status, so every failed action answered an
        empty 400 and the Chair could not see why;
      - a kernel that could not be read at all produced a healthy-looking dashboard of zeros.
    """

    def _run(self, script: str, *args: str) -> subprocess.CompletedProcess:
        node = shutil.which("node")
        if node is None:
            self.skipTest("node is not installed")
        with tempfile.TemporaryDirectory(prefix="holon-dashboard-guard-") as tmp:
            path = Path(tmp) / "guard.mjs"
            path.write_text(script.replace('__LIB__', (BUNDLE / 'lib').as_uri()))
            return subprocess.run(
                [node, str(path), str(BUNDLE / "lib"), *args],
                capture_output=True, text=True, timeout=120,
            )

    def test_the_dashboard_refuses_a_payload_the_kernel_would_read_as_a_command(self) -> None:
        result = self._run(ACTION_GUARD)
        self.assertEqual(result.returncode, 0, result.stderr[-3000:])

    def test_a_write_without_the_session_token_is_refused(self) -> None:
        """The write route was guarded by a static header every page could send.

        Traced 2026-11-05 (the entity-surface round): the write surface grew from nineteen
        hand-written actions to every command the kernel offers that a browser may run, so the
        static `x-holon-dashboard` header was the only thing standing between any page the Chair
        opened and filing work, hiring, firing, cancelling and retiring in the organization. The
        Host now mints a token, hands it out over a GET a page on another origin cannot read, and
        refuses a POST that does not carry it.
        """
        result = self._run(WRITE_TOKEN_GUARD)
        self.assertEqual(result.returncode, 0, result.stderr[-3000:])

    def test_the_client_renders_the_commands_that_belong_to_the_object(self) -> None:
        """Render the client half with a React stand-in.

        The object's commands are derived on the Host (see test_console_fence.py), so the client
        side only has to render them — and rendering is where a broken copy lands: a component
        that throws, a prop that is never passed, a page whose head renders but whose body does
        not. React is not installed here, so the stand-in stands in: the components run, and the
        tree carries the kernel's own command names for the object it is showing.
        """
        from holon import cli
        with tempfile.TemporaryDirectory(prefix="holon-render-guard-") as tmp:
            manifest = Path(tmp) / "manifest.json"
            manifest.write_text(json.dumps(cli.manifest()))
            result = self._run(RENDER_GUARD, str(manifest), str(BUNDLE))
        self.assertEqual(result.returncode, 0, result.stderr[-3000:])

    def test_a_failed_action_answers_a_readable_error_and_a_broken_kernel_is_degraded(self) -> None:
        result = self._run(ERROR_PATH_GUARD)
        self.assertEqual(result.returncode, 0, result.stderr[-3000:])

    def test_the_dashboard_refuses_a_symlink_that_points_out_of_the_instance(self) -> None:
        """A run directory is writable by the body that ran in it.

        The dashboard reads run logs, briefs and results with the kernel user's privileges, so a
        symlink planted in a run directory must not become a file read outside the instance.
        """
        result = self._run(SYMLINK_GUARD)
        self.assertEqual(result.returncode, 0, result.stderr[-3000:])
    def test_the_dashboard_keeps_the_keyboard_and_announces_its_state(self) -> None:
        """The page is a control surface: a keyboard must be able to drive it.

        Traced 2026-11-05 (client audit): the dialog was `role="dialog"` but took no focus and
        let Tab walk out of it into the page behind; the tab strips carried no `aria-selected`,
        so a screen reader could not say which tab was open; an icon-only button had only a
        tooltip for a name; the toast and the composer dock announced nothing.
        """
        source = (BUNDLE / "client.js").read_text()
        self.assertIn("useDialogFocus", source)
        self.assertIn("previous.focus()", source)
        self.assertIn("'aria-selected'", source)
        self.assertIn("'aria-label': name", source)
        self.assertIn("'aria-live': 'polite'", source)
        self.assertIn("role: 'alert'", source)

    def test_the_dashboard_offers_the_console_and_the_configuration(self) -> None:
        """The management surface: the console (every command the kernel offers) and the
        configuration (every key the kernel reads).

        Traced 2026-11-05 (the management-surface round): the dashboard was a status surface —
        the board, the org chart, the run ledger — with nineteen hand-written actions against the
        kernel's 130 commands, four of 87 configuration keys visible, and one editable. The
        console and the configuration tab are what closed that, so their wiring is pinned here:
        a page that renders but is never reached is not a management surface.
        """
        source = (BUNDLE / "client.js").read_text()
        self.assertIn("ConsolePage", source)
        self.assertIn("ConfigPanel", source)
        self.assertIn("'console'", source)
        self.assertIn("'config'", source)
        # the console reads its catalogue from the kernel and the configuration from the kernel
        self.assertIn("apiPost('command.run'", source)
        self.assertIn("apiPost('config.set'", source)
        # a write asks for a typed confirmation; a read does not
        self.assertIn("Type ${command.command} to confirm", source)


    def test_the_dashboard_offers_the_commands_of_the_object_it_shows(self) -> None:
        """The management surface, one level down: the object and the kernel's commands for it.

        Traced 2026-11-05 (the entity-surface round): the pages were previews. A work item, a
        department, a skill, a memory item and a run showed what the kernel held and offered
        nothing to do with it — the commands that act on those objects were reachable only by
        typing their names into the console, which is a status page with a terminal attached. The
        objects now carry the kernel's own commands, and every family the pages own has a way to
        create one. The binding is derived on the Host (see test_console_fence.py); this guard
        holds that the client renders it.
        """
        source = (BUNDLE / "client.js").read_text()
        for marker in ["EntityDrawer", "EntityCommands", "entityCommands(", "previewCommand("]:
            self.assertIn(marker, source)
        # the objects that carry their commands
        for families in ["['task', 'memory']", "['hr', 'emp']", "['dept']", "['skill']",
                         "['playbook']", "['memory']", "['run']", "['msg']", "['plan']"]:
            self.assertIn(f"families: {families}", source)
        # the creations the pages own
        for command in ["dept create", "hr hire", "skill new", "memory add", "kb seed",
                        "schedule add", "operation add", "objective add"]:
            self.assertIn(f"command: '{command}'", source)
        # a write carries the session token the Host mints
        self.assertIn("'x-holon-write'", source)


if __name__ == "__main__":
    unittest.main()
