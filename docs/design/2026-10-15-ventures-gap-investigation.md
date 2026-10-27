---
status: executed
date: 2026-10-15
description: "The ventures terrain as measured (61 crons, the engine, delivery threads, the pilot's real machinery) and the I-series gap plan. Its open-item tracking lives on in the 2026-10-16 register; its §5 per-venture porting table is superseded by the 2026-10-16 re-architecture."
tags: [ventures, terrain, investigation, I-series]
superseded-by: [2026-10-16-remaining-implementation-gaps.md, 2026-10-16-ventures-re-architecture.md]
---

# 2026-10-15: ventures terrain and the gap investigation plan

Status: **proposed** (the investigation plan; `2026-10-14-ventures-migration-plan.md` still
governs the wave order — this record replaces its §2 gap table with what the terrain actually
shows, post H1–H10). **Superseded in part 2026-10-16**: §5's porting table is superseded by
`2026-10-16-ventures-re-architecture.md` (two-hierarchy segregation, brand merge, platform-ops
as the capability layer's operator), and its I-numbers' status is tracked in
`2026-10-16-remaining-implementation-gaps.md` (I1, I5 landed; G8's mechanism landed; I2 now
rides the C-track's `channels` surface unit). Evidence: a full survey of
`~/.hermes/organism/ventures/` (61 cron files,
10 `_org.yaml` + `smoke.yaml`), the runtime engine, and the pilot pool's scripts, 2026-10-15.

## 1. The terrain, as measured

**The engine.** The organism's crons are hermes-agent cron jobs: live state in
`~/.hermes/cron/jobs.json`, per-employee memory under `~/.hermes/cron/employee-memory/`. Each
`.md` in `cron-jobs/` is the protocol (aligned to jobs.json at edit time); the frontmatter is
richer than the legacy import reads: `deliver: telegram:<user>:<thread>` (a per-job Telegram
thread), `enabled_toolsets` (terminal/web/browser), `skills`, `agent_type` (session/service),
`continuity`, `registers_on_spawn`, budget-gate resume notes.

**Load, by status.** 61 jobs: ~35 active — career-pipeline 14 (the job loop p1–p9, company-kb
×3, digests), freelance-agency 14 (the freelance loop p1–p9, reddit lanes ×4,
demand-market-research), architectural-leads 3, quant-trading 2. Everything else is paused
(brand pools, community-loo, credibility-funnel, vitality-research), superseded, or
decommissioned. Migration load ≈ what waves 1–3 already name; the paused pools are cold.

**Delivery.** Every active job delivers into a specific Telegram thread of the Chair
(`telegram:<the Chair's telegram id>` (operator-context.md §Channel) …), executed by the hermes gateway — not a command the job runs.

**Dependencies.** Ventures are not self-contained: `_org.yaml` `depends_on` names foundations
(`content-campaigns`, `relationship-crm`, `research-vault`, `identity-core`,
`strategy-incubator`, `site-factory`, `flight-ledger`), reached by per-pool CLIs (`campaigns`,
`contacts`, `kosmos`, `medres`, `saas`, `forge`, `community_ops`…) and symlinks. The
foundations exist on disk under `~/.hermes/organism/foundations/`.

**The pilot's real machinery.** career-pipeline scripts are outbound systems:
`apply_job.py`/`engine_apply.py`/`bos_apply.py` (ATS auto-apply with captcha scoring and an
anti-bot browser via `OBS_CDP_URL`), `outreach-engine.py`/`dm_lane.py`, `inbox-scanner.py`
(IMAP — email credentials), `p1_acquire_*` (board scraping). Keys load from `.env` files
inside the pool (15 references) and `os.environ`.

## 2. What Holon already covers (post H1–H10)

| Terrain mechanism | Holon |
|---|---|
| `no_agent` + script jobs | script lane (`routine import` reads it) |
| rubric per job, gold standard | rubrics + playbooks; H4: trajectory gold standard |
| `skills: [name]` | department skills / playbook protocol section |
| budget-gate resume, per-job spend | `[budget] tokens_per_run`/`cost_per_run` per dept/employee (H5) |
| enabled_toolsets per job | `policy.json` posture per run (H3) — kernel-declared, harness-enforced |
| smoke.yaml | `[checks.dept.<slug>]` (commands as-is) |
| kb/, data/, decisions/ dirs | `[scope.dept.<slug>] roots` |
| `agent_type: session` | fast/full lanes per firing |
| events (webhooks, replies) | H7 event triggers (`routine fire`) — the runtime (operant gateway) matches |
| Chair approvals from chat | H8 `[chair] channels` — the gateway is the runtime (operant phase F) |
| per-employee memory | memory capability + briefs; runs are stateless |

## 3. Gap register — what to investigate, in order

Each gap: the evidence, the open question, the investigation step, and the acceptance that
closes it. Gaps G2/G4/G8/G12 keep their names from the migration plan; new ones are numbered
by what the terrain showed.

**I1 — import fidelity for wave 1 (kernel-side, small, blocks the pilot).**
Evidence: career-pipeline's outreach stages (p4-outreach, p6-convert, p9-followup) are
`status: active` in the files, and `routine import` skips only *paused* jobs. The standing rule
says outreach never runs in a pilot without per-job Chair activation.
Open: does `routine import --apply` today import an active outside-reach routine as an *active*
schedule? (The classifier floors it G3 and the approver decides — but the schedule starts on
approval, which is one bulk approval away from a mass outreach fleet.)
Investigate: read `cmd_routine_import` and `_apply_routine`; confirm what happens to an
active outside-reach job on approval.
Accept: importing the career-pipeline files yields *no* active outreach schedule — either
import forces `--deliver`-less disabled schedules for G3+ outside-reach routines pending
per-job activation, or the runbook demonstrably never bulk-approves them. Guard test in the
same commit if the kernel changes.

**I2 — per-routine delivery routing (kernel-side, small).**
Evidence: `deliver: telegram:<user>:<thread>` is per job; Holon's `[notify]` is one org-wide
command, and `--deliver` goes "to the Chair" through it.
Open: how does a career digest land in thread 69475 and a freelance digest in another?
Investigate: read the notify path (`Kernel` heartbeat → `[notify]` command) and the zeroclaw
installer's `--notify-channel/--notify-recipient` output; decide the smallest shape:
`[notify.dept.<slug>] command` (per-department), with the routine's `--deliver` picking its
department's route. Thread ids are instance specifics → config, never code.
Accept: two departments' `--deliver` routines deliver through different configured routes in
one test instance; nothing personal in the universal repo (the mechanism is generic).

**G8 — department secrets (kernel-side, the big one).**
Evidence: `.env` in pools with IMAP credentials, wacli session, `OBS_CDP_URL` anti-bot tokens;
quant's monitor and any direct exchange calls; freelance's client channels.
Open: where do per-department credentials live so a career-pipeline run can read its IMAP key
but a brand run cannot? The three probes from the identity-warden law apply here too (never
trust the first read: `.env` is read *twice* in some scripts — dotenv and os.environ).
Investigate: design `[secrets.dept.<slug>]` — 0600 key-file *references* in config, resolved
into the run's environment only at `policy.json` compile (claim time), never logged, never in
Notion; broker path for pull-mode agents. Check the failure mode: a secret an employee lacks
must be a clean refusal, not an empty string.
Accept: a run in dept A sees its dept's secret env vars and not dept B's; `holon lint` flags
plaintext secrets in config; works through the broker; guard tests for both lanes.

**G4 — intake for external events (kernel-side, medium).**
Evidence: leads, job postings, replies, and invoices today enter as *files/databases the
scrapers own*. Holon's law: only employees (and the Chair) file work. The scanners-as-scripts
pattern (script lane, no agent) fits, but anything external that wants to *file* work needs a
path that is not the Chair key.
Open: does wave 1 actually need it (career scanners run as script-lane routines, no intake),
or is it wave 2+ (freelance client replies, quant events via H7)? The duplicate question
(lanes §4.2) stands.
Investigate: sketch `holon intake` — scoped tokens (dept + task class + rate limit), dedup by
caller-supplied key; decide if H7 event triggers + `msg request` already cover 80%.
Accept: an external script can file a lead into a department as work (or an event fires a
routine) with no Chair key, scoped, deduped — or a recorded decision that wave 1–3 needs
nothing new.

**I3 — foundations: scope roots now, departments later (decision, no code).**
Evidence: active crons call foundations' CLIs (identity-core for career/freelance/saas;
research-vault for arch/credibility/vitality; relationship-crm and content-campaigns for
arch).
Open: for each wave, grant `[scope.dept] roots` into the specific foundation dirs it touches
(read/exec), or migrate that foundation as a department first? Holon has no foundation-shaped
mechanism for symlink+CLI sharing — scope roots cover it.
Investigate: per active cron, list the foundation paths actually touched (one scripted pass);
verify a run under the agent user can execute those CLIs (isolation root setup is a standing
decision — G1 prerequisite anyway).
Accept: each wave's dept config names its foundation roots; doctor's scope check passes under
isolation; a recorded decision on which foundations ever become Holon departments (my
recommendation: none before the ventures are in; they are services, not work).

**I4 — continuity vs stateless firings (decision, no code).**
Evidence: `agent_type: service, continuity: true` jobs (strategist-daily, rd-daily) — the
organism kept a session alive across fires.
Open: Holon fires are stateless; state lives in pool files (the scripts update KB/dbs) — which
is exactly what those jobs' scripts do. Likely nothing to build.
Investigate: read strategist-daily's script — confirm all state persists in pool files
(broadcast status files), so each firing is independent.
Accept: a one-line decision per service-type job in the import runbook: stateless with pool
files = fine; anything genuinely session-bound stays on hermes until phase F/G.

**G2 — the Notion window (adapter-side, measure first).**
Evidence: concern was full-pass cost at ~10k pages/month with 61 crons; the paused pools mean
real waves 1–3 carry ~33 jobs.
Investigate: instrument the live workstation sync (it runs the new code since 2026-10-15):
pages pushed per day during the pilot week. If the reconcile stays cheap, G2 drops to a
monitoring line; if not, implement the window (open work + last N days) in
`adapters/notion`.
Accept: a week of measured page churn under the pilot, with the window decision recorded.

**G12 — department packages (kernel-side, can wait).**
Evidence: needed for the VPS wave (wave 5) and for exporting a department to another machine.
Open: is the VPS a *second instance of the same organization* (then backup/restore covers
moves and G12 is only for selling/sharing departments), or a separate org needing package
import?
Investigate: none yet — blocked on the Chair's VPS topology decision. Do not build speculatively.
Accept: the topology decision recorded here; G12 scheduled only if a package import is real.

**I5 — the pilot guard as a mechanism (config + check).**
Evidence: the standing rule (job/freelance never send outreach in a pilot) is enforced today
only by operator care + the classifier's G3 floor.
Investigate: make it a `[checks.dept]` gate: a smoke-style command that fails while any
outreach-schedule is enabled in a pilot department (reads `api_triggers` read-only — no new
kernel surface), wired per the lanes record §4.1.
Accept: enabling p4-outreach's schedule in the pilot turns the department's check red at the
next tick, and the Chair hears about it — without touching the universal repo beyond the check
mechanism that already exists.

## 4. Sequence

```
now (pre-pilot)   I1 import fidelity  ·  I2 delivery routing  ·  I5 pilot guard check
                   I3 foundations roots for career  ·  I4 service-job decision  ·  G1 isolation root
pilot week        G8 dept secrets (build against career's IMAP first)  ·  G2 measure Notion churn
                   G4 intake sketch vs H7 (decide build/defer)
wave 2 (freelance) G8 client-channel secrets in anger  ·  G4 only if replies arrive as events
wave 3 (quant)     G8 exchange credentials  ·  I3 scope into the trading system's logs
wave 5 (VPS)       G12 only if the topology decision says package import
```

Wave 0 of the migration plan grows by I1, I2, I5 (small, universal-repo work, tests first);
G8 moves from "before wave 2" to "during the pilot, against the pilot's real secrets" — the
pilot is the investigation. G4 and G12 become explicit deferrals unless the pilot week says
otherwise.

## 5. How each venture ports

Holon's nesting primitives: `departments.parent_id` (a sub-system becomes a child department,
approver authority climbs the parent chain), the holarchic work graph (`tasks.parent`, any
depth, any department), and per-slug config namespaces (`[scope|checks|budget|secrets|notify]
.dept.<slug>`). Every nested level that needs its own boundary is its own slug; nothing is
inherited implicitly. Porting rule: **depth-1 pool → department (slug = pool name); depth-2
sub-systems → task classes first, child departments only when they need their own
scope/secrets/head; deeper nesting stays as data (scope roots)**. Paused pools stay on the
organism until their wave is activated — a paused organism cron carries zero load, and
importing early only doubles the surface.

| Venture (dept slug) | Wave | Active crons → port | Sub-system mapping | Config stanzas to add |
|---|---|---|---|---|
| career-pipeline (`career`) | 1 (pilot) | job-loop p1/p2/p3, p7/p8/recover, company-kb ×3, role-market-research, daily-apply-digest → fast/script routines; **p4-outreach, p6-convert, p9-followup imported disabled (I1), activated one job at a time with the pilot guard (I5)** | company-kb + the apply engine → task classes `career:company-kb`, `career:apply` | roots: pool + identity-core professional data; checks from smoke; budget caps; `[notify.dept]` thread 69475; `[secrets.dept]` when G8 (anti-bot tokens, apply transport creds) |
| freelance-agency (`freelance`) | 2 | freelance-loop p1/p2 (discover/score), p5–p9, recover, demand-market-research → fast/script; reddit hiring lanes ×2 (no_agent → script); **p3-outreach, p4-negotiate disabled at intake (client comms)**; inbox-scanner stays paused (IMAP creds = G8 gate) | reddit lanes + the funnel engine → classes `freelance:reddit`, `freelance:funnel` | roots: pool + identity-core; checks; `[secrets.dept]` (IMAP, reddit) before anything outbound |
| architectural-leads (`architectural-leads`) | 2 | builder-intel (weekly), rd-daily, strategist-daily → fast; materials-refresh + all superseded WA jobs stay unimported | lead-orchestration, materials-kb → classes; the WA fleet is already decommissioned — stays so | roots: pool + relationship-crm + content-campaigns + research-vault (I3 pass); `[notify.dept]` thread 78956; `[secrets.dept]` for wacli only if WA ever returns |
| quant-trading (`quant`) | 3 | daily-live-monitor → fast (reads the live trading system's logs — scope roots into it, no agent touches execution); weekly-saas-metrics → script; retrain/reconciliation superseded | the trading system itself is NOT ported — it is an external system the department watches | roots: pool + the trading system's logs + saas-studio data (read); `[secrets.dept]` exchange read-only keys if the monitor calls APIs |
| credibility-funnel (`credibility`) | 4 | all 6 paused: drift-watchdog + state-repair (no_agent) port as **[checks.dept] entries, not routines** — they guard state; ta-research-* (the KosmOS 4-cron lifecycle) import disabled until activated | ta-research lifecycle → one class `credibility:research` consuming research-vault (kosmos CLI) | roots: pool + research-vault; checks absorb the two watchdogs |
| brand-integrating (`brand-integrating`) | 4 | paused/superseded only: import the healing content cycle as a disabled fast routine when activated; superseded pipelines not imported | content pipeline → class `brand:content`; a `brand` parent department is the nesting demo if approver routing wants it — otherwise two direct depts | roots: pool + identity-core + site-factory + content-campaigns + strategy-incubator (I3 pass) |
| brand-polarizing (`brand-polarizing`) | 4 | same shape as brand-integrating (Undercurrent cycle, disabled) | as above | as above |
| community-loo (`community`) | 4 | Q'uo pulse + events notifier, paused: pulse → fast routine on activation; events notifier → an **H7 event trigger** (`event:community:*`) if the gateway watches the calendar, else a cron | the sacred-space boundary (no personal counseling) → dept skill + task class language, enforced by rubric | roots: pool; `[notify.dept]` thread |
| saas-studio (`saas-studio`) | 4 | Studio Status (paused) → fast on activation; content pipeline superseded. The studio's real surface is its CLIs and data, run by scripts | sourcehound-api-rd → **child department** (`saas-studio/sourcehound`) or class — it has its own gates; product CLIs stay scripts under scope | roots: pool (+ the three product dirs); **checks are a direct port**: saas CLI parses, unit tests, structure gates (critical=true) |
| vitality-research (`vitality`) | 4 | 4 paused med-research-* (KosmOS lifecycle) import disabled; shared kosmos-vault-maintain stays with research-vault (foundations) until that pool ports | the 13 KosmOS sub-holons are an external knowledge tree — **scope roots, never departments**; medres CLI + queue dirs are data | roots: pool + research-vault queue + ~/KosmOS subtree (read); checks absorb medres status/AXI gates |

Per venture, the port itself is the migration plan's §5 runbook: dept create (parent only where
the table says) → routine import (I1-fixed) → stanzas above → skills from the pool's
`skills/*/SKILL.md` imported as department skills → approve (outreach stays off) → 3 verified
firings per active routine → decommission that pool's organism crons → one clean week.
Naming: department slugs keep the organism pool names for traceability; ad_scope prefixes and
the decisions/regressions dirs stay in the pool directories as data (roots), not ported into
Holon's vocabulary.
