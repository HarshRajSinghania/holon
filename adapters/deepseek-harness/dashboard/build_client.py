#!/usr/bin/env python3
"""Assemble the browser half from small source fragments.

The Harness client loader accepts one lazy factory module. Keeping the fragments separate keeps
each piece reviewable; this script only wraps them in that module and never rewrites their text.
"""
from pathlib import Path

root = Path(__file__).parent
parts = sorted((root / "src").glob("*.js"))
header = """window.__ModuleLoader__.load({
  id: '@local/holon-dashboard',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
"""
footer = """
    return FACTORY_RETURN;
  },
});
"""
out = [header]
for part in parts:
    out.append(f"\n// ---- {part.name} ----\n")
    out.append(part.read_text())
out.append(footer)
(root / "client.js").write_text("".join(out))
print(f"wrote client.js from {len(parts)} fragments ({sum(len(p.read_text()) for p in parts)} bytes)")
