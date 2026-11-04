#!/usr/bin/env bash
# Re-vendor holon's genome CLI onto a new upstream release WITHOUT losing the F1
# rules, and without letting the checksum pin drift.
#
# WHY THIS EXISTS. holon/vendor/genome.py is a patched copy of an upstream build:
# it carries the W00A/W00B suppression audit, its helpers, and the W006 date
# strip — none of which upstream has. A plain re-vendor replaces the file and
# drops all three silently. Measured 2026-11-03 in holon: the strict lint still
# reported 0 errors while 21 of 27 tests.test_kb failed.
#
# The tree already carries the remedy (scripts/genome_apply_f1.py, idempotent,
# with --check) and the guard (tests/test_kb.py::
# test_a_re_vendor_has_not_wiped_the_local_rules). This script wires the three
# steps that the commit message names but no single command did:
#
#   1. copy the new upstream build over the vendored file
#   2. re-apply the F1 rules          (scripts/genome_apply_f1.py)
#   3. re-pin the sha256              (holon/capabilities/kb.py GENOME_SHA256)
#
# Step 3 is the one that is easy to miss and that makes every test RED: the KB
# capability refuses to load a vendored CLI whose bytes do not match the pin.
#
# Usage: scripts/revendor_genome.sh <path-to-upstream-genome>
#   Exits non-zero if the F1 rules are still absent after step 2, or if the
#   pin does not match the bytes on disk after step 3.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${1:-}"
[ -n "$SRC" ] && [ -f "$SRC" ] || { echo "usage: $0 <path-to-upstream-genome>" >&2; exit 2; }
VENDOR="$REPO/holon/vendor/genome.py"
PIN="$REPO/holon/capabilities/kb.py"

cd "$REPO"
echo "1/3 vendor: $SRC -> $VENDOR"
cp "$SRC" "$VENDOR"
chmod +x "$VENDOR"

echo "2/3 re-apply the F1 rules"
python3 scripts/genome_apply_f1.py

echo "3/3 re-pin the sha256"
NEW="$(python3 -c "import hashlib,sys;print(hashlib.sha256(open(sys.argv[1],'rb').read()).hexdigest())" "$VENDOR")"
python3 - "$NEW" "$PIN" <<'PY'
import re, pathlib, sys
new, pin = sys.argv[1], pathlib.Path(sys.argv[2])
t = pin.read_text()
out = re.sub(r'GENOME_SHA256 = "[0-9a-f]{64}"', f'GENOME_SHA256 = "{new}"', t, count=1)
if out == t:
    print("pin pattern not found — refusing to guess", file=sys.stderr)
    sys.exit(1)
pin.write_text(out)
print(f"pinned {new}")
PY

# VERIFY, do not trust. The F1 rules must be present and the pin must match.
python3 scripts/genome_apply_f1.py --check
python3 - "$VENDOR" "$PIN" <<'PY'
import hashlib, re, sys
from pathlib import Path
v, pin = Path(sys.argv[1]), Path(sys.argv[2])
want = re.search(r'GENOME_SHA256 = "([0-9a-f]{64})"', pin.read_text()).group(1)
got = hashlib.sha256(v.read_bytes()).hexdigest()
if want != got:
    print(f"pin {want} != bytes {got}", file=sys.stderr)
    sys.exit(1)
print("pin matches the bytes on disk")
PY
echo "done: holon/vendor/genome.py is $(python3 "$VENDOR" --version)"
