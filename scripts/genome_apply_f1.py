#!/usr/bin/env python3
"""Re-apply the F1 rules a genome re-vendor wipes.

WHY THIS EXISTS. The vendored CLI (holon/vendor/genome.py) is a copy of an upstream
build, and it carries three rules that upstream does not: the W00A/W00B suppression
audit, its helpers, and the W006 date strip. A re-vendor (measured: 5e443ee, 51b36ff,
4a7c8dd inside three hours) replaces the file and drops all three silently, because
`holon lint` never opens holon/vendor/ -- so the distribution's own strict gate stays
0/0 while tests.test_kb goes red. Measured 2026-11-03: 21 of 27 failed on a tree the
strict lint called clean.

The blocks are taken verbatim from 9510b35 ("genome: read the raw config for the
suppression audit, and match globs as globs"), the last build that carried them.

ONE resolved difference: the 2026-10-28 audit read the raw config through
`cfg.cfg_file`, an attribute the current Cfg no longer carries. Grafting that call
verbatim leaves `raw_cfg` empty on every run -- exempting nothing, so the rule fires
on every live repo, the exact false-positive class it was written to end. It resolves
the file by the names Cfg itself documents (genome.toml, then the legacy kb.toml).

Usage:  python3 scripts/genome_apply_f1.py [--check]
  --check  report only, change nothing (exit 1 when the rules are absent)
"""
from __future__ import annotations

import pathlib
import subprocess
import sys

REPO = pathlib.Path(__file__).resolve().parents[1]
VENDOR = REPO / "holon" / "vendor" / "genome.py"
SOURCE_COMMIT = "9510b35"  # the last build carrying all three rules

MARKERS = ("_reasoned_entries", "_is_reasoned", "_PI_KEY", "_QSTR", "W00A", "W00B")


def source_text() -> str:
    return subprocess.run(
        ["git", "show", f"{SOURCE_COMMIT}:holon/vendor/genome.py"],
        capture_output=True, text=True, cwd=REPO, check=True,
    ).stdout


def blocks(text: str) -> tuple[str, str, str, str]:
    """(constants, helpers, rule, w006) each lifted verbatim from the source build."""
    lines = text.splitlines(keepends=True)

    def upto_next_def(ls: list[str], start: int) -> int:
        end = start + 1
        while end < len(ls) and not ls[end].startswith(("def ", "class ")):
            end += 1
        return end

    i_reasoned = next(i for i, l in enumerate(lines) if l.startswith("def _reasoned_entries("))
    i_is = next(i for i, l in enumerate(lines) if l.startswith("def _is_reasoned("))
    helpers = ("".join(lines[i_reasoned:upto_next_def(lines, i_reasoned)]).rstrip("\n") + "\n\n\n"
               + "".join(lines[i_is:upto_next_def(lines, i_is)]).rstrip("\n") + "\n\n\n")

    consts = []
    for i, l in enumerate(lines):
        if l.startswith(("_PI_KEY", "_QSTR", "_QSTR1")):
            block = l
            j = i + 1
            while j < len(lines) and not lines[j].lstrip().startswith(("def ", "class ")) \
                    and (lines[j].startswith(" ") or not lines[j].strip()):
                block += lines[j]
                j += 1
            consts.append(block.rstrip("\n"))
    constants = "\n\n".join(consts) + "\n\n\n"

    # the rule lives in lint_core, and its own following comment is its end. The extracted
    # block therefore STOPS at that comment's line start and does not include it -- measured
    # 2026-11-03: taking the anchor inside the block duplicated the `if cfg.has("agents")`
    # header and left the original one with no body, an IndentationError at import, and the
    # script "succeeded" while shipping a broken CLI.
    start = next(i for i, l in enumerate(lines) if "A suppression with no expiry" in l)
    while not lines[start].lstrip().startswith("#"):
        start -= 1
    end = next(i for i, l in enumerate(lines) if i > start and "agent contract pointers" in l)
    rule = "".join(lines[start:end])

    # the W006 block, taken with its comment so the reason travels with the code
    w = next(i for i, l in enumerate(lines) if "The dates are not part of the question" in l)
    we = next(i for i, l in enumerate(lines)
              if i > w and "a-z]{4,}" in l)
    w006 = "".join(lines[w:we + 1])
    return constants, helpers, rule, w006


def main() -> int:
    check = "--check" in sys.argv
    src = VENDOR.read_text()
    present = [m for m in MARKERS if m in src]
    date_stripped = "The dates are not part of the question" in src
    if len(present) == len(MARKERS) and date_stripped:
        print(f"F1 rules present ({len(present)}/{len(MARKERS)} markers) and the W006 date "
              f"strip is in place: nothing to do")
        return 0
    if check:
        print(f"F1 rules ABSENT: markers {present} of {MARKERS}; date strip: {date_stripped}")
        return 1

    constants, helpers, rule, w006 = blocks(source_text())
    changed = []

    if not date_stripped:
        anchor = '            titles.append((f.name, set(re.findall(r"[a-z0-9]{4,}", h.lower()))))'
        if anchor not in src:
            print("the W006 tokenizing line is not where this script reads it -- the vendor "
                  "changed shape; lift the block by hand from " + SOURCE_COMMIT, file=sys.stderr)
            return 1
        src = src.replace(anchor, w006.replace(
            're.findall(r"[a-z]{4,}", bare)', 're.findall(r"[a-z]{4,}", bare)'), 1)
        changed.append("W006 date strip")

    if len(present) != len(MARKERS):
        anchor = "def pointers(text: str, ignore: set[str], prefixes: tuple[str, ...] = ()) -> list[tuple[int, str]]:"
        if anchor not in src:
            print("the pointers() anchor moved -- lift the helpers and constants by hand from "
                  + SOURCE_COMMIT, file=sys.stderr)
            return 1
        src = src.replace(anchor, constants + helpers + anchor, 1)
        rule_anchor = "    # agent contract pointers"
        if rule_anchor not in src:
            print("the suppression-audit anchor moved -- lift the rule by hand", file=sys.stderr)
            return 1
        raw_cfg_fix = rule.replace(
            '    raw_cfg = cfg.cfg_file.read_text() if getattr(cfg, "cfg_file", None) else ""',
            '    raw_cfg = ""\n'
            '    for _name, _legacy in (("genome.toml", False), ("kb.toml", True)):\n'
            '        if (cfg.root / _name).is_file():\n'
            '            raw_cfg = (cfg.root / _name).read_text()\n'
            '            break')
        assert "read_text()" in raw_cfg_fix, "the raw-config repair did not apply"
        src = src.replace(rule_anchor, raw_cfg_fix + rule_anchor, 1)
        # the source build passes `maxsplit` positionally, which Python deprecates: a graft
        # that reintroduces it reintroduces stderr noise into every lint run, and a warning on
        # the gate's output reads as a defect to whoever runs it. Repaired on the way in.
        positional = 're.split(r"[*?\\[]", rel, 1)'
        if positional in src:
            src = src.replace(positional, 're.split(r"[*?\\[]", rel, maxsplit=1)', 1)
            changed.append("positional maxsplit -> keyword")
        changed.append("W00A/W00B audit plus helpers")

    # the re-vendor keeps reintroducing `_git_sha`, dead in the upstream build as shipped and
    # correctly reported by tests/test_no_dead_private.py -- so every re-vendor turns that
    # suite red until it is removed by hand. Removed here, in the same pass, because a repair
    # that leaves the tree red is a repair the next reader does not trust.
    orphan = '''def _git_sha(path: Path) -> str:
    """For skills roots: the checked-out commit, or '-' when the copy has no .git (rsync copies)."""
    try:
        r = subprocess.run(["git", "-C", str(path), "rev-parse", "--short", "HEAD"],
                           capture_output=True, text=True, timeout=10)
        return r.stdout.strip() if r.returncode == 0 else "-"
    except (OSError, subprocess.TimeoutExpired):
        return "-"


'''
    if orphan in src:
        src = src.replace(orphan, "", 1)
        changed.append("orphan _git_sha removed")
    elif "_git_sha" in src:
        changed.append("WARNING: _git_sha present but its shape changed; remove it by hand")

    VENDOR.write_text(src)
    print("applied: " + ", ".join(changed) + f" (vendor now {len(src.splitlines())} lines)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
