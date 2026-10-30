---
status: deprecated
date: 2026-10-27
description: "The two-repo overlay split is DEPRECATED at the architecture level. `holon-personal` was folded into this checkout on 2026-10-27; this file records the deprecation, where each former overlay role moved, and the rollback."
tags: [overlay, deprecated, consolidation, migration]
---

# The personal overlay — deprecated

**The overlay split ended 2026-10-27.** There was one canonical source checkout — this one —
and the private `holon-personal` repository (`origin/personal`, sha `501d281`) is the rollback
copy and nothing more. Do not resume the split: re-creating it reintroduces every defect this
migration closed (the two launchers that resolved to different trees, the `main`-must-not-be-
checked-out constraint in `scripts/sync-public.sh`, and the curriculum of "which checkout did
that reading measure").

## What this repo was, and where each role went

| Former overlay role | Where it lives now |
|---|---|
| `main` = an exact copy of the universal repo | retired. `main` is gone; `origin/main` is the published history and `personal`'s content is folded into it |
| `personal` carried what must never be public | retracted. The scrub law was **never a publish gate** — `lint.py` deliberately disables `scrub.*` on an overlay ("a gate that always fails on them is a gate nobody reads"). What actually kept private material private was that it was simply never committed here. The chat id and host paths are already in `origin/main`'s history via `c2d4ddc`, `70f55d7` and `d84dc95` |
| `scripts/sync-public.sh` (fetch → ff `main` → merge → gates → push both) | archived. The invariant it enforced ("personal equals `main` outside OVERLAY") passed on its last run; the friction it created — a gate that trips whenever kernel work and corpus land in the same session — is gone |
| `docs/STATUS.md`, `docs/design/**`, `docs/RECORDS.md` (operator corpus) | **now in this repo**, published. Instance-specific values are cited by role, not inlined |
| Private facts — the Chair's channel, host paths, instance ids | **`$HOLON_HOME/config/operator-context.md`** — instance state, which is where they always belonged. See `docs/design/2026-10-27-*.md` for the consolidation record |
| The history-squash publish runbook (before any visibility flip) | still applies **if** you ever want the already-published host paths out of `origin/main`. Note: a rewrite does not un-leak a repo that has been cloneable. Chair-sized decision, not mechanically required |

## What a reader should do instead

- **Instance state** → `$HOLON_HOME` (`holon.toml`, `config/`, `execution/runtime/`, `kb/`, `backups/`).
- **Source** → this checkout, one tree, `main` = `origin/main`.
- **The law** → `docs/INTENT.md` law 10 and `AGENTS.md` ("This is the kernel source, not an
  instance: no state lives here, and instances live at `$HOLON_HOME`"). That law never named a
  second source checkout; the split was an overlay of practice, and it is withdrawn.

## Rollback

`git clone <private remote>` and check out `personal` at `501d281`; that tree plus its
`replace holon-personal → <that tree>` in the launcher and the `[isolation]` reach restores the
pre-migration arrangement exactly. It carries no data this repo lacks.

**The local tree was purged 2026-10-30T01:01:53Z**, and the rollback now lives on disk as well as
at the remote: `~/holon/backups/pre-purge-holon-personal-20261030/` holds `holon-personal.tar.gz`
(the whole tree, 4,681 entries) and `holon-personal.bundle` (every ref, including the local
`personal` HEAD `1aa2dd1`, which was **one commit ahead of `origin/personal`** and so was never
pushed — the bundle is the only copy of it). Restoring from the bundle is `git clone
holon-personal.bundle holon-personal`; restoring the tree is `tar -xzf holon-personal.tar.gz -C
<parent>`.

**What the purge did not lose, measured:** the legacy tree's vendored `genome.py` was canonical
*minus* the suppression-audit work (`cfg_file`, `_reasoned_entries` — 127 diff lines, every one of
them canonical's addition), so it held nothing unique; the peer's uncommitted `outline` module
(`VERSION 2026.10.27-13`, `OUTLINE_ZONE`) is already in canonical's copy and in the global
`project-genome` binary the fleet is pinned to. The live instance named only this checkout
(`[isolation] reads`), the launcher resolved here, and the legacy tree held a *deny* ACL
(`---`) for the agent user. The wider portfolio's references to the path are prose and historical
records — a measured row in `scripts/measure.py`, a regression doc's citation, worklog entries —
and no executable line anywhere ran it.
