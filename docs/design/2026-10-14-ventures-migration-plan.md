---
status: proposed
date: 2026-10-14
description: "The original ventures migration: 10 pools / 61 crons → departments, career-pipeline as pilot, five waves, the decommission rule (3 verified firings + one clean week). Its §8 approval and decommission rule still stand; the per-venture SHAPE is superseded by the 2026-10-16 re-architecture."
tags: [ventures, migration, waves, pilot, decommission]
superseded-by: 2026-10-16-ventures-re-architecture.md
---

# 2026-10-14: the ventures migrate into Holon

Status: **proposed** (awaiting the Chair; closes the open decision "which venture moves first",
STATUS §5). Scope: `~/.hermes/organism/ventures/` (10 pools, 61 cron jobs) becomes Holon
departments of routines on the workstation instance, then the VPS. The organism's data stays
where it is; what moves is the *protocol* — cron jobs become recurring plans, smoke becomes
checks, the pool becomes a department.

The mechanism mapping is `2026-10-13-paperclip-contrast.md` §5; the gap ranking is its §4. This
record sequences the move against what is actually built today.

## 1. What moves (inventory, 2026-10-14)

| Venture | Crons | Scripts | Size | Notes |
|---|---|---|---|---|
| career-pipeline | 15 | 80 | 433M | job search; pilot-eligible (standing rule) |
| freelance-agency | 15 | 139 | 33M | client comms; outreach-sensitive |
| architectural-leads | 9 | 22 | 30M | |
| credibility-funnel | 6 | 0 | 3.5M | pure agent crons |
| quant-trading | 4 | 8 | 20M | exchange credentials (G8) |
| vitality-research | 4 | 2 | 276K | |
| brand-integrating | 2 | 2 | 300K | |
| brand-polarizing | 2 | 3 | 276K | |
| community-loo | 2 | 10 | 2.1M | |
| saas-studio | 2 | 0 | 720K | |

Every pool has `_org.yaml` (services consumed → cross-department `msg request`) and `smoke.yaml`
(→ `[checks.dept.<slug>]`). Data directories stay in place; `[scope.dept.<slug>] roots` grants
each department its pool directory.

## 2. Readiness as of today

Built and verified: lanes + routines + rubrics + the routine import command (G3), the agent
user / runner / broker (G1 — but the workstation root setup is still an open decision), per-run
budgets and `policy.json` at claim (phase C, `0d69b71`), the read API (phase B).

Not built (each is universal Holon work, made in the **public** repo first, then pulled):

| Gap (paperclip §4) | What it is | Gates which wave |
|---|---|---|
| G4 intake keys | Chair-key-free filing of external work, scoped to a department and task class | Wave 1 (scanners file leads) |
| G8 department secrets | `[secrets.dept.<slug>]`: credentials bound per department, never inherited | Waves 2–3 (client comms, exchange APIs) |
| G2 Notion mirror window | open work + last N days; full passes at 61 crons ≈ 10k pages/month | Wave 1 (dashboard cost) |
| G12 department packages | export/import of a whole department (profile, classes, checks, scope, skills, plans) | Waves 2+ (each onboarding), and VPS move |

Also open (Chair, STATUS §5): the workstation root isolation setup, the workstation heartbeat
(`holon-tick.timer`), the VPS redeploy.

## 3. The pilot: career-pipeline

The standing rule says job and freelance pools may run as pilots, never sending outreach. Of
the two, career-pipeline is the better first move: freelance-agency's client channels
(WhatsApp to a client is a true outside-reach job) make it the harder security case, while
career-pipeline's 15 crons are mostly scanners and digests — the lanes the live classification
run already showed classify cleanly.

Its 9 outside-reach jobs (applications, follow-ups) stay **paused at intake** in Holon: imported
as routines, `enabled = false`, activated one at a time only with the pilot guard (lanes §4.1)
and a Chair approval per job. The 6 internal ones (boards scan, profile digest, pipeline
report) run in their classified lanes.

**Pilot done means:** every active career-pipeline routine has one verified firing in its
lane, gold standards exist, smoke checks are green, the Notion window holds, and the organism's
career-pipeline crons have been off for a week with nothing missed.

## 4. Waves

```
Wave 0  kernel gaps G4, G8, G12, G2 (public repo)  +  root isolation, heartbeat on
Wave 1  career-pipeline (pilot)                    decommission its organism crons
Wave 2  freelance-agency, architectural-leads       (G8: client + lead credentials)
Wave 3  credibility-funnel, quant-trading           (G8: exchange APIs; highest care)
Wave 4  brand-integrating, brand-polarizing, community-loo, saas-studio, vitality-research
Wave 5  VPS: the same departments there, via G12 packages
```

## 5. The per-venture runbook (one venture, one sitting)

```sh
holon dept create <slug> --name "<Name>" --mission "<mission>" --profile light
holon routine import ~/.hermes/organism/ventures/<slug>/cron-jobs/*.md --dept <slug>   # dry run
holon routine import ~/.hermes/organism/ventures/<slug>/cron-jobs/*.md --dept <slug> --apply
holon routine list --dept <slug>      # approve each proposal; keep outside-reach ones off
```

Then in `holon.toml`: `[scope.dept.<slug>] roots = ["~/.hermes/organism/ventures/<slug>"]`,
`[checks.dept.<slug>]` from `smoke.yaml`, `[budget.dept.<slug>]` caps, and (once G8)
`[secrets.dept.<slug>]`. Services consumed from `_org.yaml` become cross-department requests
(`msg request`). Watch the first firing of each routine (`holon status`, verify + grade), then
stop the organism cron for that pool. Decommission a pool's crons only after **3 consecutive
verified firings** of every active routine and one clean week with no organism-side misses.

## 6. Where Operant fits (dependency, not blocker)

ZeroClaw (the VPS body) and jcode run the departments today; nothing in waves 0–4 waits on
Operant. The integration plan (`operant docs/agentic-os/IMPLEMENTATION-PLAN.md`, executing)
changes the migration's substrate as it lands:

- **Phase C (landed)** — `policy.json` budgets give the per-run token/cost caps this
  migration needs against the throughput risk (878 s planner calls on free-stack).
- **Phase D (H4, next)** — gold standards carry trajectories; richer learning for migrated
  routines.
- **Phase E (H6)** — Operant's supervisor replaces `holon tick`; the clock becomes one
  `no_agent` cron. Migrated departments should switch drivers to operant here, per department.
- **Phase F (H7/H8)** — the owner's Telegram becomes the Chair channel (approve from chat);
  event triggers replace some scan crons with webhooks; `holon-notion.service` retires.
- **Phase G (H9)** — Operant's own cast crons import the same way
  (`holon org import-operant`); the ventures plan and the cast plan converge on one mechanism.

## 7. Risks

| Risk | Handling |
|---|---|
| Outreach from a pilot (standing rule breach) | pilot guard check (lanes §4.1); outside-reach routines stay disabled at intake; Chair approves each activation |
| Secret exposure (client, exchange) | G8 before wave 2; runs get department-scoped secrets, never inherited environment; isolation root setup before wave 1 |
| Notion cost at 61 crons | G2 window before wave 1; verify page growth in the pilot week |
| Model throughput | `[budget]` caps per run; lanes keep most firings script/fast; faster plan/execute model is the standing open item |
| Approval load (61 plans) | one sitting per venture; recurring plans approve once, firings reuse them |
| Duplicate intake as scanners multiply | G4's duplicate question (lanes §4.2) lands in wave 0 |

## 8. Decision requested

Approve: the wave order, career-pipeline as the pilot, the decommission rule (3 verified
firings + a clean week), and the standing budget caps per department. Everything in wave 0 is
public-repo work and follows the usual law (tests first, lint --strict).
