---
status: register
date: 2026-10-16
description: "THE consolidated register of everything open: kernel gaps (K-2 closed, C-track, wave 5, --runtime operant, G-series, U4), operant-side W-packages, owner/ops gaps, and the shortest critical path. Living — updated with every pass; supersedes the 2026-10-15 register."
tags: [register, open-items, living]
supersedes: 2026-10-15-remaining-implementation-gaps.md
---

# 2026-10-16: the remaining implementation gaps — the post-red-team register

Status: **register** (supersedes `2026-10-15-remaining-implementation-gaps.md`, kept for history;
the red-team verification of everything claimed landed is `2026-10-16-red-team-verification.md`).
State: universal repo at `bee3bbb` (339 tests, `lint --strict` 0/0; the capability-layer audit's
§1 executed and red-team-verified there). Every kernel gap that had no dependency is closed and
verified. What remains is exactly the gated set.

## 1. The dependency picture (unchanged in shape)

```
operant W1 Engage ──► W2 Safety ──► W3 Enforce ──► W4 Resident ──► ORG MODE ON (owner gate)
   (H-01..H-14 landed AND red-team verified on Holon's side; W-03/06/07 sequenced by them)
        │                                                       │
        │                                                       ├─► W5 Channel ──► Holon wave 5 (notify-through-runtime)
        │                                                       ├─► W6 Capture
        │                                                       └─► W7 One org ──► W8 Hardening
        └── (in parallel, gated on the Chair, not on W)
            K-2 guard trust path (ready now) ──► ventures plan approval ──► pilot (career-pipeline)
                                              └──► pilot week ──► G8 secrets ──► genome track (U4 graduation)
```

## 2. Kernel gaps (open)

| # | Gap | What it is | Gated on | Size |
|---|---|---|---|---|
| **K-2 trust** | ~~guard commands are agent-supplied shell~~ **CLOSED 2026-10-16 (`0106308`), option (a) executed** | a guard's `check` now names a `[checks.class.<name>]` entry: submit refuses a name that does not resolve, the heartbeat runs the Chair's command in the fix's workdir, a dead class is a failure (migration 0014 renames the column) | — | landed |
| **wave 5** | notify-through-runtime | `--deliver` routes per department through the resident runtime's channel; the **routing config is a `channels` surface unit** (C-track C1 shape), so the mechanism and the manifest land together | operant **W5** | small, after W5 |
| **C1+C2** | **surface units + the capability block** — **the revised package** (`2026-10-16-agentic-os-red-team-audit.md` §5): manifests with `category = "surface"`, `pool_of = ["*"]`, `owner`, per-service `effect`/`note`/`args`/`output`/`health`; the block renders per posture (observe shows only reachable routes) and for department-less work; an `api_pool` view; the browser surface is **sourcehound | browseros-neo** (the Chair's local-machine law, 2026-10-17: browser-fallback.py, the standalone Obscura CDP tier and the dead `[browser] provider` key are purged; the obscura binary remains only as sourcehound's internal engine); the v4 migration + `pack_api` v4 (operant already accepts "4"). R-01/R-05/R-06 are already landed | **the Chair adopting the revised C-track** (re-architecture decision 6) | small — the next kernel package, pre-pilot |
| **C3** | surface health | a surface manifest's `health` command probed by `[smoke.dept.platform-ops]`; doctor reports `surface.<slug> down — pooled by`; the block marks `(down)` so planners route around a dead tier before spending — the probe mechanism already exists (org-wide + per-dept smoke, live); the new code is the doctor line and the `(down)` render | platform-ops dept at wave 2 (C4) | small, wave 2 |
| **--runtime operant** | installer mode | `install.py --runtime operant`: writes `[holon]`, owns clock/webhook, skips tick/notion units | operant's `[holon]` section landing in W-packages | small, after W4 |
| **G8** | department secrets — **mechanism landed 2026-10-16 (`0106308`)** | `[secrets.dept.<slug>]`: 0600 key-file refs resolved into the execute stage's env at claim; unreadable key file = clean refusal; observe stages carry none; lint flags plaintext values and world-readable key files; broker/runner lane tested. What remains is **validation against the pilot's real `.env`s** (pilot week) | pilot week (validation only) | small, during pilot week |
| **G4** | intake | scoped Chair-key-free filing, dedup — or H7 events + `msg request --service` already cover it | pilot week's evidence | decide, maybe build |
| **G2** | Notion window | measure page churn during the pilot week; implement the window only if the reconcile costs | pilot week | measure first |
| **G12** | department packages | export/import a department — **only if** the VPS is a second organization rather than a second instance of this one | the Chair's VPS topology decision | blocked on that |
| **Genome U4** | graduation | a genome:graduation review routine per tier gate | after the pilot (ventures arrive graduated) | small, later |
| ~~optional~~ | ~~retention nudge~~ **landed 2026-10-16** | gc records `gc:last_run`; doctor `retention.overdue` warns when configured retention is past its window | — | landed |

**Added 2026-10-16 — the R-series** (`2026-10-16-agentic-os-red-team-audit.md`): the universal
repo's defect list — R-01, R-05 (+ the act_commands residual), R-06, R-08/R-10, R-09, R-11, R-20 —
is **executed and red-team-verified at `bee3bbb`** (2026-10-17; the audit record's execution
block). Still waiting on the Chair: C1/C2 revised (the §2 row above), R-04 registry indexing,
R-13 holarchy, R-14 K-KB (the atomic memory capability is live — the document/collection
layer is the gap), R-16 skills, N-1 Notion. Operant-side: R-02/03/04 after the kernel
publishes v4; R-07/08/09 the runtime's context/memory/skills injectors. Work lists: universal
`docs/design/2026-10-16-capability-layer-audit.md`, operant
`docs/agentic-os/AUDIT-2026-10-16-capability-layer.md`. The audit found §4 items 2 and 5 stale
(the instance at migration 0014, org mode on) — confirmed live 2026-10-17; item 2 is marked
resolved below.

## 3. Operant-side (their repository, their iteration protocol — H-deps all landed and verified)

| W | Package | Their acceptance |
|---|---|---|
| **W1 Engage** | run_dir helpers, native tools from one definition, registration | real `prepare` env → `operant run` → policy mounted, trajectory, usage, `holon_submit` ingests |
| **W2 Safety** | env allowlist, observe without mutating HTTP, Notion arm on the secret path, stdin payloads, refusing isolated instances | env-dump test, forged verification POST rejected, observer POST refused |
| **W3 Enforce** | refusal recorder, roots/writes/commands guards, provider usage + budget cap, build string, `usage.json` | phases C and D acceptance as written |
| **W4 Resident** | supervisor as gateway task, clock task, org-mode doctor, config fixes | Holon's supervisor conformance passes against operant; two concurrent bodies; no orphan after timeout |
| **W5 Channel** | Chair path (verify/classify/confirm/run/reply), notify outbound, event intake | approve-by-chat; webhook fires once per cooldown; `holon-notion.service` unnecessary |
| **W6 Capture** | org-mode annotations for skill_manage, curator, memory_store, review, advisor | operant home byte-identical after a Holon run |
| **W7 One org** | gate every RETIRE writer, cast crons off after approval, WAL-safe archive, then G+1 rewires | a day in org mode adds no row to any archived table |
| **W8 Hardening** | test hygiene, doc truth, feature-gate decision, runner/broker after isolation, TUI panels | invariants 1-6 each have a default-suite test |

## 4. Owner/ops gaps (the Chair, not code)

1. **~~K-2 option call~~ RESOLVED 2026-10-16** — option (a) executed in `0106308`: a guard names a
   Chair-authored `[checks.class]` check. Existing guards (none in the wild — the live instance
   predates the guards table) would need re-registering after the migration renames the column.
2. **~~Workstation instance migration~~ RESOLVED (re-measured live 2026-10-17)** — the
   instance is current: 14/14 migrations (api_version 3), the launcher runs the public
   checkout at HEAD, org mode on since 2026-10-16, Notion mirror active, 15 operant-driver
   runs. The pre-wave claim was the audit's R-11 staleness. Code-side nothing remains; the
   standing `isolation.off` is item 4.
3. **The live bot token** — `operant.toml` and `~/.operant/.env` hold the **testing** bot's
   token, not the live bot's; the gateway reads `operant.toml` (no `EnvironmentFile=`), so no
   seat can deliver until the live token is placed and the gateway restarted. Gates W5's Chair
   channel.
4. **Isolation root setup** (K-6/G1) — the supervisor protocol and org mode both assume it;
   doctor still warns `isolation.off`. Also the honest fix for K-2's exposure if (b) is chosen.
5. **Org mode on** — only after W1-W4 and both sides' security gaps are closed live; W4's gate
   includes `holon adapter test --supervisor '<operant supervisor cmd>'` passing.
6. **Ventures plan approval** — the pilot (career-pipeline), the wave order, the decommission
   rule; unlocks the pilot week (G8, G4, G2) and after it the genome track's first real use:
   manifesting the foundations career-pipeline pools. The 2026-10-16 re-architecture
   (`2026-10-16-ventures-re-architecture.md`) refines the shape this approves: five live
   departments over a segregated capability layer — its six decisions (hierarchy, brand merge,
   platform-ops, supersessions, §8, C-track adoption) are the open list. The import's terrain
   moved (the re-architecture's §7, 2026-10-17): hermes-cron is dead, **Paperclip is the only
   scheduler** (68 venture routines, 34 live) — the live-set source is the Paperclip registry,
   the decommission rule disables Paperclip routines, and the cutover runs one scheduler per
   pool.
7. **VPS topology decision** — second instance of one organization (backup/restore covers it)
   or a second organization (needs G12).
8. **Public repo publish** — the squash runbook (overlay `PERSONAL.md`); the working history
   still predates the split.
9. **Orphan Chair keys** — the red-team pass measured ~169 unclaimed key files in
   `~/.config/holon/keys` (the live instance claims one). `holon keys list --orphans` names
   them; deletion is the Chair's, by hand, by design.
10. **Workstation heartbeat + VPS redeploy** — standing decisions, unchanged.
11. **The workstation model gateway is down (2026-10-17)** — the org-wide smoke fails (the
    local free-stack endpoint is refused): every agent waits until it passes; nothing runs on
    the workstation instance until it is restored. Also live: 5 incident `plan` tasks sit
    unstaffed in `executive` (the Chair's department, zero employees by design — three are
    stale hermes-era run failures, one is the gateway smoke, one is the unstaffed report
    itself; the Chair closes them, and platform-ops takes incident ownership structurally at
    wave 2).

## 5. The shortest critical path to a supervised org

```
Chair adopts the revised C-track ──► C1+C2 + v4 (pre-pilot kernel package) ──► pilot import unblocked
W1 → W2 → W3 → W4 ── (owner gate: ~~instance migrated~~ ✓ 2026-10-17, root isolated, bot token live,
                       supervisor conformance green) ──► org mode stays on honestly (on since 2026-10-16)
   then W5 (unblocks Holon wave 5; channels surface unit rides C1) → W6 → W7 (cast import
   --apply, crons off) → W8
   and in parallel, on the Chair's word: ventures pilot (career dept over the capability
   layer) → pilot week (G8, G4, G2) → wave 2 (freelance, arch-leads, platform-ops C4 + C3)
```
