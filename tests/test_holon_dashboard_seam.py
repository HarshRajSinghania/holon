"""The dashboard's Host half against the SHIPPED connection service.

The repo's law: "an interface package is done only when one test crosses the seam with the other
side's real artifact." The other side here is `@deepseek-ai/dsh-client-connection` — the shipped
package that owns the exact Fetch-route registry, the owner-peer fence and the shared `/api`
handler. These tests drive that real package against this adapter's real Host module, so the
route's shape, its reach and the client's URL are checked by the code that will actually serve
them, not by a stub.
"""

from __future__ import annotations

import glob
import json
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUNDLE = ROOT / "adapters" / "deepseek-harness" / "dashboard"


def find_shipped_modules() -> Path | None:
    """Locate the shipped Harness packages without naming a machine's home directory.

    The npx cache is the usual home for a launched `dsh`; the environment may point at a
    checkout too. A path that does not exist is simply "this machine has no shipped copy",
    and the seam test skips rather than guessing.
    """
    candidates: list[Path] = []
    for pattern in (
        os.path.join(os.environ.get("HOME", "~"), ".npm", "_npx", "*", "node_modules"),
        os.path.join(os.environ.get("XDG_CACHE_HOME", ""), "dsh", "node_modules"),
    ):
        if not pattern or pattern.startswith("~"):
            continue
        candidates.extend(Path(p) for p in glob.glob(pattern))
    for base in candidates:
        if (base / "@deepseek-ai" / "dsh-client-connection").is_dir():
            return base
    return None


SEAM_SCRIPT = r"""
import { createRequire } from 'node:module';

const require = createRequire(process.argv[2] + '/');
const { Context } = require('@deepseek-ai/cordis');
const { HostConnectionService } = require('@deepseek-ai/dsh-client-connection');
const dashboard = await import(process.argv[3]);

const failures = [];
const check = (name, ok, detail = '') => {
  if (!ok) failures.push(name + (detail ? ' — ' + detail : ''));
};

const root = new Context({});
const auth = { secret: new Uint8Array(32).fill(7), launchToken: 'test', maxAgeMilliseconds: 86400000 };
const connection = new HostConnectionService(root, [], auth);

dashboard.apply(root, {
  holonHome: process.env.HOLON_HOME_FOR_SEAM,
  command: [process.env.HOLON_BIN_FOR_SEAM],
  allowActions: true,
});
await new Promise((r) => setTimeout(r, 50));

const handler = connection.createSharedFetchHandler('/api');
const owner = connection.browserPeer;

const ownerResponse = await handler.fetch(
  new Request('http://127.0.0.1:3080/api/holon-dashboard?resource=overview'), owner);
const ownerText = await ownerResponse.text();
check('owner peer: 200', ownerResponse.status === 200, String(ownerResponse.status));
let overview = null;
try { overview = JSON.parse(ownerText); } catch { /* reported below */ }
check('owner peer: JSON', Boolean(overview), ownerText.slice(0, 200));
check('owner peer: instance home', Boolean(overview?.instance?.home), JSON.stringify(overview?.instance));
check('owner peer: heartbeat', typeof overview?.heartbeat?.ageSeconds === 'number');

const stranger = connection.createPeer({ principal: { kind: 'agent', id: 'emp_someone' }, interactions: 'none' });
const strangerResponse = await handler.fetch(
  new Request('http://127.0.0.1:3080/api/holon-dashboard?resource=overview'), stranger);
check('non-owner peer: 403', strangerResponse.status === 403, String(strangerResponse.status));

const noHeader = await handler.fetch(
  new Request('http://127.0.0.1:3080/api/holon-dashboard', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'doctor.run' }),
  }), owner);
check('POST without the dashboard header: 400', noHeader.status === 400, String(noHeader.status));

const missing = await handler.fetch(
  new Request('http://127.0.0.1:3080/api/holon-dashboard?resource=nope'), owner);
check('unknown resource: 404', missing.status === 404, String(missing.status));

const fs = await import('node:fs');
const clientSource = fs.readFileSync(process.argv[3].replace(/\/index\.js$/, '/client.js'), 'utf8');
const clientPath = clientSource.match(/const API_BASE = '([^']+)'/)?.[1];
check('the client fetches the registered path', clientPath === '/api/holon-dashboard', String(clientPath));

await stranger.dispose?.();
if (failures.length) { console.error('FAILED: ' + failures.join(' | ')); process.exit(1); }
console.log('SEAM OK');
"""


class SeamTest(unittest.TestCase):
    """Cross the seam with the shipped connection package and a real Holon instance."""

    def test_the_dashboard_route_serves_the_shipped_connection_service(self) -> None:
        node = shutil.which("node")
        if node is None:
            self.skipTest("node is not installed")
        modules = find_shipped_modules()
        if modules is None:
            self.skipTest("the shipped Harness packages are not on this machine")

        # The operator's own launcher can name its home; `$HOLON_HOME` is the same fact.
        holon_bin = os.environ.get("HOLON_BIN") or shutil.which("holon") or str(ROOT / "bin" / "holon")
        holon_home = os.environ.get("HOLON_HOME")
        if not holon_home and "holon" in os.path.basename(holon_bin):
            config = Path(os.environ.get("DSH_HOME", str(Path.home() / ".dsh"))) / "holon.json"
            if config.is_file():
                try:
                    holon_home = json.loads(config.read_text()).get("home")
                except ValueError:
                    holon_home = None
        if not holon_home:
            holon_home = str(Path.home() / "holon")
        if not Path(holon_home).is_dir() or not Path(holon_bin).exists():
            self.skipTest("no Holon instance to read")

        with tempfile.TemporaryDirectory(prefix="holon-dashboard-seam-") as tmp:
            script = Path(tmp) / "seam.mjs"
            script.write_text(SEAM_SCRIPT)
            env = {
                **os.environ,
                "HOLON_HOME_FOR_SEAM": holon_home,
                "HOLON_BIN_FOR_SEAM": holon_bin,
            }
            result = subprocess.run(
                [node, str(script), str(modules), str(BUNDLE / "index.js")],
                capture_output=True, text=True, env=env, timeout=180,
            )
        self.assertEqual(result.returncode, 0, result.stderr[-3000:])


class ManifestTest(unittest.TestCase):
    """The bundle's own shape: what the loader and the Plugin Manager read."""

    def test_the_client_declares_the_route_the_host_registers(self) -> None:
        client = (BUNDLE / "client.js").read_text()
        self.assertIn("const API_BASE = '/api/holon-dashboard'", client)
        host = (BUNDLE / "index.js").read_text()
        self.assertIn("path: '/api/holon-dashboard'", host)

    def test_the_client_refuses_a_write_without_the_dashboard_header(self) -> None:
        client = (BUNDLE / "client.js").read_text()
        self.assertIn("'x-holon-dashboard': '1'", client)

    def test_the_actions_are_named_not_arbitrary(self) -> None:
        actions = (BUNDLE / "lib" / "actions.js").read_text()
        # Every action is a case in one switch; the browser never names a kernel command.
        for name in ["plan.approve", "plan.reject", "task.cancel", "hr.setDriver",
                     "schedule.enable", "msg.send", "tick.run", "backup.run"]:
            self.assertIn(f"case '{name}'", actions)
        self.assertNotIn("exec(", actions)
        self.assertNotIn("spawnSync", actions)


if __name__ == "__main__":
    unittest.main()
