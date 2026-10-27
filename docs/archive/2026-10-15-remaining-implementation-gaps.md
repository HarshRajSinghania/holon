---
status: superseded
date: 2026-10-15
description: "The first consolidated register of open items, superseded the next day by the 2026-10-16 register (written after the red-team verification and the execution pass). Kept for history."
tags: [register, history]
superseded-by: 2026-10-16-remaining-implementation-gaps.md
---

# 2026-10-15: the remaining implementation gaps — a consolidated register

Status: **register, superseded** by `2026-10-16-remaining-implementation-gaps.md` (the post-red-team state; kept for history). As of 2026-10-15: K-2, genome U1+U2+U3 with K-4/K-5, I1, I5 are landed — see §2a; the rest is unchanged). It consolidates the four
records — `2026-10-15-integration-install-kernel-audit.md` (executed through wave 8),
`2026-10-15-cortex-foundations-audit.md`, `2026-10-15-ventures-gap-investigation.md`,
`2026-10-14-ventures-migration-plan.md` — plus operant's `AUDIT-2026-10-15.md` (their W-packages)
and the deployment state. Each row: what, what gates it, who.

## 1. The dependency picture

```
operant W1 Engage ──► W2 Safety ──► W3 Enforce ──► W4 Resident ──► ORG MODE ON (owner gate)
   (their H-deps — H-01..H-14 — are all landed on Holon's side now)
        │                                                       │
        │                                                       ├─► W5 Channel ──► Holon wave 5 (notify-through-runtime)
        │                                                       ├─► W6 Capture
        │                                                       └─► W7 One org ──► W8 Hardening
        └── (in parallel, gated on the Chair, not on W)
            ventures plan approval ──► pilot (career-pipeline) ──► genome track U1-U3 ──► waves 2-4 ventures
```

Nothing operant-side is blocked on Holon anymore. Everything else is blocked on either
org-mode residency (W4) or the Chair's approvals, not on more Holon waves.

## 2. Holon kernel gaps (open)

| # | Gap | What it is | Gated on | Size |
|---|---|---|---|---|
| **Genome U1** | ~~unit manifests~~ **landed 2026-10-15** (`8693854`): manifests + `holon genome sync` (migration 0013) + read API v3 + lint genome pack (bind.service, bind.pool) | — | done |
| **Genome U2** | ~~pooling semantics~~ **landed with U1**: presence in briefs, roots join the reach, writes stay `msg request` | — | done |
| **Genome U3** | ~~derived registry~~ **landed with U1**: `holon genome emit`; doctor `genome.stale`/`genome.registry` | — | done |
| **Genome U4** | graduation | a genome:graduation review routine per tier gate | later; ventures arrive graduated | small, later |
| **K-4** | ~~`api_memory`~~ **landed with U1** — on memory.db (views cannot cross databases), migration `memory/0003` | — | done |
| **K-5** | ~~typed service requests~~ **landed with U1**: `msg request --service unit:service`, validated, entry point named | — | done |
| **K-2** | ~~incident→guard loop~~ **landed 2026-10-15** (`920213b`): `guard` on a fix's result, heartbeat runs registered guards, a failure reopens the incident; doctor guard-or-waiver; `holon incident waive`, `holon guards` | — | done |
| **wave 5** | notify-through-runtime | `--deliver` routes per `[notify.dept]` through the resident runtime's channel (supersedes the ventures record's I2 shape) | operant **W5** | small, after W5 |
| **--runtime operant** | installer mode | `install.py --runtime operant`: writes `[holon]`, owns clock/webhook, skips tick/notion units | operant's `[holon]` section landing in W-packages | small, after W4 |
| **I1** | ~~import fidelity~~ **landed 2026-10-15** (`234d6b6`): imported G3+ routines land disabled; `holon schedule enable` is the per-job word | — | done |
| **I5** | ~~pilot guard~~ **landed 2026-10-15** (`234d6b6`), built as the lanes record proposed: `[pilot] depts` — outside-reach floors at G4 (the Chair), for routines and one-off plans alike | — | done |
| **G8** | department secrets | `[secrets.dept.<slug>]`: 0600 key-file refs resolved into the run env at claim, clean-refusal failure, broker path | pilot week (build against career's real `.env`s) | the big one |
| **G4** | intake | scoped Chair-key-free filing, dedup — or H7 events + `msg request` already cover it | pilot week's evidence | decide, maybe build |
| **G2** | Notion window | measure page churn during the pilot week; implement the window only if the reconcile costs | pilot week | measure first |
| **G12** | department packages | export/import a department — **only if** the VPS is a second organization rather than a second instance of this one | the Chair's VPS topology decision | blocked on that |

Closed this session, for the record: K-1 (H-09 newer-database refusal), K-3 (H-14 retention/gc),
I2's old shape (superseded by wave 5), the four audit security gaps on Holon's side (wave 2),
the supervisor conformance suite (H-10), the CONTRACT renumber (H-12), `--literal`/`--payload-file`
(H-06), policy 0640 (H-07), the gated handoff (H-08).

## 3. Operant-side (their repository, their iteration protocol — H-deps all landed)

| W | Package | Their acceptance |
|---|---|---|
| **W1 Engage** | run_dir helpers, native tools from one definition, registration | real `prepare` env → `operant run` → policy mounted, trajectory, usage, `holon_submit` ingests |
| **W2 Safety** | env allowlist, observe without mutating HTTP, Notion arm on the secret path, stdin payloads, refusing isolated instances | env-dump test, forged verification POST rejected, observer POST refused |
| **W3 Enforce** | refusal recorder, roots/writes/commands guards, provider usage + budget cap, build string, `usage.json` | phases C and D acceptance as written |
| **W4 Resident** | supervisor as gateway task, clock task, org-mode doctor, config fixes | **Holon's supervisor conformance passes against operant**; two concurrent bodies; no orphan after timeout |
| **W5 Channel** | Chair path (verify/classify/confirm/run/reply), notify outbound, event intake | approve-by-chat; webhook fires once per cooldown; `holon-notion.service` unnecessary |
| **W6 Capture** | org-mode annotations for skill_manage, curator, memory_store, review, advisor | operant home byte-identical after a Holon run |
| **W7 One org** | gate every RETIRE writer, cast crons off after approval, WAL-safe archive, then G+1 rewires | a day in org mode adds no row to any archived table |
| **W8 Hardening** | test hygiene, doc truth, feature-gate decision, runner/broker after isolation, TUI panels | invariants 1-6 each have a default-suite test |

## 4. Owner/ops gaps (the Chair, not code)

1. **Workstation instance migration** — `~/holon` still runs pre-wave code: `install.py --home
   ~/holon --bin-dir ~/.local/bin`, restart `holon-notion`, re-run adapter installers, doctor.
2. **The live bot token** (operant live state, 2026-10-14 probe): `operant.toml` **and**
   `~/.operant/.env` hold the **testing** bot's token (8889773233, @ip_operant_testing_bot),
   not the live bot's; the gateway reads `operant.toml` (no `EnvironmentFile=`), so no seat can
   deliver until the live token is placed and the gateway restarted. Gates W5's Chair channel.
3. **Isolation root setup** (K-6/G1) — the supervisor protocol and org mode both assume it;
   doctor still warns `isolation.off`.
4. **Org mode on** — only after W1-W4 and both sides' security gaps are closed live; W4's gate
   includes `holon adapter test --supervisor '<operant supervisor cmd>'` passing.
5. **Ventures plan approval** — the pilot (career-pipeline), the wave order, the decommission
   rule; unlocks I1, I5, then G8 during the pilot, genome track after it.
6. **VPS topology decision** — second instance of one organization (backup/restore covers it)
   or a second organization (needs G12).
7. **Public repo publish** — the squash runbook (overlay `PERSONAL.md`); the working history
   still predates the split.
8. **Workstation heartbeat + VPS redeploy** — standing decisions, unchanged.

## 5. The shortest critical path to a supervised org

```
W1 → W2 → W3 → W4 ── (owner gate: instance migrated, root isolated, bot token live,
                      supervisor conformance green) ──► org mode on
   then W5 (unblocks Holon wave 5) → W6 → W7 (cast import --apply, crons off) → W8
   and in parallel, on the Chair's word: ventures pilot → genome track → the rest
```

**Executed 2026-10-15** (K-2 `920213b`, genome U1+U2+U3 + K-4/K-5 `8693854`, I1+I5 `234d6b6`;
319 tests, lint --strict clean): the kernel gaps that had no dependency are all closed. What
remains open on Holon's side is exactly the gated set: G8 (pilot week), wave 5 (operant W5),
`--runtime operant` (their `[holon]`), G4/G2 (pilot week's evidence), G12 (the VPS topology
decision) — and the ventures pilot itself, whose approval now also unblocks the genome track's
first real use: manifesting the foundations career-pipeline pools.

## 6. 2026-10-16 red-team pass (detail: `docs/design/2026-10-16-red-team-verification.md`)

Every row above marked done was re-verified against its acceptance criteria first-hand. Result:

- **H-03's back half was missing** — refused executes could still close with no decision when
  verification was sampled out, skipped on the script lane, or passed by the rubric judge.
  **Fixed** (blockers keep the verify stage; 2 guards + ledger row, in the universal repo).
- **Test processes could write Chair keys into the operator's real key dir** (~170 orphans
  found; H-14e had pinned the conformance suites, not the wider test process). **Fixed**
  (`tests/helpers.py` pins the key file process-wide; guard + ledger row).
- **H-13 and H-06 were untested at the CLI boundary** — guards added (exit 3 with the skip
  reason; `--payload` literal).
- **Open decision for the Chair (K-2's trust path)**: a guard's `cmd` is a free-form shell string
  from the fixer's execute result; under isolation it runs as `holon-agent`, but on this
  workstation (isolation off, ops gap 3) the heartbeat runs it **as the kernel user**, which can
  read the Chair key file. The audit's design wanted a bounded `[checks.class]` reference.
  Options (a) check-class reference [recommended], (b) refuse guards while isolation is off,
  (c) Chair confirmation per guard.
- Notes: gc is manual (the org never collects by itself); K-5 landed narrower than the audit's
  wording (validates the service exists; no payload schema — a message request has no typed
  payload); only H-01/H-02/H-09 carry integration-audit ledger rows.
