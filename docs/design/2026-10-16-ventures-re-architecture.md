---
status: proposed
date: 2026-10-16
description: "The ventures half of the architecture pair: TWO segregated hierarchies — venture departments (career, freelance, arch-leads, quant, brand, the cold four) over a capability layer (surface units, service units, platform-ops as its operating department, external systems), with the segregation law: ventures consume capabilities; a venture never owns a shared surface. Six decisions open."
tags: [ventures, architecture, departments, capability-layer, segregation]
pair: 2026-10-16-platform-ops-capability-system.md
---

# 2026-10-16: the ventures re-architecture — the hierarchy the organism's pools would take on Holon

> **Scope note (2026-10-20).** This record is a **proposal about a future bridge**, not a statement
> about either stack's present. The organism's pools run on the other stack (Paperclip, its only
> scheduler); this repository (Holon + the project-genome governance layer) is a **separate
> program**, and nothing in it waits on that bridge. See
> `2026-10-20-the-a-side-program-boundary-and-solutions.md`.

Status: **proposed** (an architecture decision record for the Chair; supersedes the department
mapping in `2026-10-15-ventures-gap-investigation.md` §5 and the 1-pool-1-department assumption
in `2026-10-14-ventures-migration-plan.md`; their wave order and decommission rule stand unless
amended below). **Refined later the same day**: the capability layer got its own design — the
C-track, `2026-10-16-platform-ops-capability-system.md` — which supersedes §2's first-cut
placement of platform-infra as a plain department and §3's platform-infra row wherever they
differ. This record is now the VENTURES half of one architecture; the C-track is the CAPABILITY
half. Evidence: four parallel surveys of `~/.hermes/organism/` on 2026-10-16 (all 10 venture
pools' crons/status/engines/sub-systems, the four strata, the nine foundations, archive/
and graveyard/), read against the landed kernel (`0106308`: units manifests U1, pooling U2,
registry U3, secrets G8, pilot floor I5, import fidelity I1).

## 1. What the terrain actually is (2026-10-16)

**The organism has four strata, not two.** `cortex/` (meta-governance: 68 ADs, arch CLI, derived
registry), `swarm/` (agent-fabric, task-grid, workforce-ops — the organism managing its own agent
workforce), `foundations/` (9 service pools incl. platform-infra), `ventures/` (the 10 pools).
Plus `archive/` (12 tombstoned pools) and `graveyard/` (9 retired organs).

**Active load is ~30 crons, concentrated in four pools:**

|Pool|Active|Paused/superseded|The active work|
|---|---|---|---|
|career-pipeline|13|p4-outreach + p9-followup **paused today (operator-hold)**; inbox-scanner superseded (moved to freelance)|job flywheel p1–p8 + recover, company-kb ×3, role-market-research, daily-apply-digest|
|freelance-agency|11|p3-outreach, p4-negotiate, p9-followup paused; inbox-scanner paused (IMAP = G8 gate)|flywheel p1/p2/p5–p8 + recover, demand-market-research, reddit hiring ×2 + karma ×2|
|architectural-leads|3|6 superseded (listener, progression, digests ×2, feedback); materials-refresh paused|builder-intel (weekly), rd-daily, strategist-daily (WhatsApp to Rakesh — the ONLY sanctioned sender, `saathi_send.py`)|
|quant-trading|2|monthly-retrain + weekly-reconciliation superseded|daily-live-monitor (reads the live trading system), weekly-saas-metrics|
|credibility-funnel|0|all 6 paused (drift-watchdog, state-repair, ta-research ×4)|cold|
|brand-integrating, brand-polarizing|0|1 superseded + 1 paused each|cold since mid-September|
|community-loo, saas-studio, vitality-research|0|all paused|cold (vitality untouched 2 weeks)|

**Both outreach pairs are already off.** The operator paused career p4/p9 **today**; freelance
p3/p4/p9 have been paused. The pilot's standing rule (no outreach) matches the terrain as it
stands — import must preserve it (I1: outside-reach imports land disabled).

**The WA fleet is genuinely decommissioned** (verified on disk): `saathi_listen.py` retired to
archive today; `whatsapp_digest.py` carries a hard `VETOED_SENDER`; only `saathi_send.py` sends
(warm leads only), `wacli_sync_guard.py` + `feedback_scanner.py` are read-only sync. Nothing to
port as engagement automation.

**Ventures are not self-contained.** Every pool reaches foundations by symlink + CLI:
`identity-core` (career, freelance, saas, brand, arch via `identity`), `research-vault`/kosmos
(arch, credibility, vitality), `content-campaigns` (career, freelance, brand ×2, credibility),
`relationship-crm` + `site-factory` (arch, brand), `strategy-incubator` (career, freelance,
brand, credibility). Pools also carry native engines: career's `applications` (own service
contract: `lead_ref` → `funnel_state`) + `role-market-intelligence`; freelance's
`demand-market-intelligence` + `delivery`; arch's `engagement-engine` + `lead-orchestration` +
`materials-kb`; credibility's `pipeline/proof-architecture/showcase/topic-anchors/webdev`.

**Delivery is per-job Telegram threads** (`deliver: telegram:<id>:<thread>`): career 69475,
freelance 69476, career-market 69476, arch 128835 — through the hermes gateway, not a command
the job runs. Holon's per-department delivery (I2) is still the open piece.

**The brand pools are a holonic pair, not two brands.** brand-integrating = Ishan's therapeutic
personal brand (Agape); brand-polarizing = The Undercurrent, attributed institutional research
(Eros); PBI-RG-001 explicitly forbids cross-contamination; the dependency link is one-way
(integrating → polarizing); brand-polarizing publishes through a per-piece operator approval
gate (`approval_gate.py`), never auto-publish.

**Machine secrets**: `~/.hermes/.env` (0600, NOTION_*) is the machine-level choke point; pool
`.env` files hold IMAP, anti-bot (`OBS_CDP_URL`), wacli, exchange creds — exactly what
`[secrets.dept.<slug>]` (G8, landed) is for.

## 2. The re-architecture: two hierarchies, cleanly segregated

The 1-pool-1-department mapping was the wrong default: a department is a *lifecycle unit*
(people, pipeline, authority, budgets). Most of what the organism calls a pool is a **service**
(data + CLI, no work of its own) or a **cold strategy**. And the org is not one tree: it is a
**venture hierarchy** (business units that pursue outcomes) running on a **capability layer**
(substrate). One law joins them: **ventures consume capabilities; capabilities never pursue a
venture; a venture never owns a shared surface.** Holon has all the primitives this needs,
landed at `0106308` (U1–U3) plus the C-track's proposed ones.

### A. The ventures — business departments (pursue outcomes; consume the layer below)

```
Chair (S5 identity)
└─ executive department (CEO · Audit · Charter)                      [governance, exists]
   ├─ career         ← career-pipeline                          [wave 1, pilot]
   ├─ freelance      ← freelance-agency                        [wave 2]
   ├─ arch-leads     ← architectural-leads                      [wave 2]
   ├─ quant          ← quant-trading                            [wave 3]
   ├─ brand          ← brand-integrating + brand-polarizing     [wave 4: ONE dept, 2 classes]
   └─ community · saas-studio · vitality                        [cold: created at activation]
```

### B. The capability layer — the substrate every venture runs on (owns no venture outcome)

```
   ├─ SURFACE UNITS  — harness-level capabilities as manifests (C-track C1,
   │   category = "surface"): the browser chain, MCP mounts, delivery channels, tunnels;
   │   health-probed (C3), rendered into every entitled brief with a prefer-this note (C2)
   ├─ SERVICE UNITS  — foundation CLIs as U1 manifests: identity-core, research-vault,
   │   relationship-crm, content-campaigns, site-factory, presentation-engine,
   │   flight-ledger, strategy-incubator (grounding/insights/trajectory)
   │   (pool_of = entitlement; reads by roots, writes by msg request --service)
   ├─ OPERATED BY TWO INTERNAL DEPARTMENTS (the layer's only departments):
   │   ├─ it             — the kernel's own machinery: instances, migrations, incidents [exists]
   │   └─ platform-ops   — the surfaces: the ops fleet, surface health probes,
   │                      surface-change proposals                [wave 2, C-track C4]
   └─ EXTERNAL SYSTEMS  — watched, never ported: the live trading system (quant reads its
       logs), the KosmOS tree (vitality reads), the hermes gateway (until operant W5/phase F),
       Rakesh's WhatsApp channel (arch sends via saathi_send; outside-reach, gated)
```

**What is deliberately NOT ported (superseded by Holon's own mechanisms):**

|Organism thing|Superseded by|
|---|---|
|`swarm/` (agent-fabric, task-grid, workforce-ops)|Holon's org layer: employees, roles, authority, hiring, schedules. The swarm stratum *is* an org-management system; Holon is one.|
|`strategy-incubator/forge`|the work graph itself (cortex audit U5.1 already ruled: forge collapses into plan/execute/verify)|
|`cortex/cron-management`|Holon's schedules + `routine import` (provenance-tracked)|
|symlink pooling|declared pooling (U2: `pool_of`, roots join reach, services render in briefs, writes via `msg request --service`, lint `bind.service`/`bind.pool`)|
|`arch emit` / living-architecture|`holon genome sync` + `holon genome emit` (U3, landed)|
|`_org.yaml` governance scaffolding (AD/RG files)|stay as data under scope roots; the *operative* rules port into mechanisms (below)|
|graduation tiers|manifest `tier` (documentation today); U4 routines later, post-pilot|

**Rule for the strata:** cortex → data (readable in scope) + the derived-registry role (done);
swarm → superseded; foundations → the capability layer (service units; platform-infra → its
operating department); ventures → the venture hierarchy, cold ones only at activation.

## 3. Per-unit destination table

|Unit (organism)|Destination|Task classes (playbooks)|Lane of its active crons|Config stanzas|
|---|---|---|---|---|
|career-pipeline|**dept `career`** (wave 1 pilot)|`career:discover` (p1/p2/p3, market-research), `career:company-kb` (dossier/growth/regrade), `career:apply` (the applications engine: state + ATS + anti-bot), `career:digest` (daily-apply-digest), `career:hygiene` (p7 compound, p8 recovery, recover, p5 track)|p1 acquire/regrade → script; sessions → fast; p4/p9 → **full + disabled** (I1; `[pilot]` G4 floor)|roots: pool + identity-core professional; secrets: IMAP, OBS_CDP_URL, apply transport; checks: smoke.yaml + pilot guard; notify: 69475 (I2 pending)|
|freelance-agency|**dept `freelance`** (wave 2)|`freelance:discover` (p1/p2, demand-market-research), `freelance:reddit` (hiring ×2 + karma ×2 — engine + audit class), `freelance:funnel` (p5–p8, recover), `freelance:inbox` (when IMAP un-pauses)|reddit no_agent-able parts → script; sessions → fast; p3/p4/p9 → **full + disabled**|roots: pool + identity-core; secrets: reddit, IMAP, client channels (before anything outbound); checks: smoke + pilot guard|
|architectural-leads|**dept `arch-leads`** (wave 2)|`arch:signals` (builder-intel, rd-daily → engagement-engine stages), `arch:deliver` (strategist-daily — WhatsApp, **outside-reach, per-send gate**), `arch:materials` (paused; materials-kb)|rd-daily/engine → script+fast; strategist-daily → full + disabled until the WA decision|roots: pool + relationship-crm + content-campaigns + research-vault; secrets: wacli only if WA returns; notify: 128835|
|quant-trading|**dept `quant`** (wave 3)|`quant:watch` (daily-live-monitor — reads the live system's logs), `quant:metrics` (weekly-saas-metrics, reads saas-studio data)|monitor → fast; saas-metrics → script|roots: pool + trading logs (read-only) + saas data (read); secrets: exchange read-only keys if the monitor calls APIs|
|brand-integrating + brand-polarizing|**ONE dept `brand`** (wave 4) with **two task classes** — the holonic pair keeps its regression: separate feeds/audiences/products, no cross-posting (class boundary + rubric enforce PBI-RG-001)|`brand:agape` (healing cycle), `brand:eros` (Undercurrent; **per-piece chair gate** — `approval_gate.py` becomes Holon's own gate, publishing never auto)|both cycles → fast when activated; publishing → full + chair gate|roots: pool ×2 + identity-core + site-factory + content-campaigns + relationship-crm; pooled in manifests|
|community-loo|dept `community` (cold — create at activation)|`community:pulse`, `community:events` (H7 event trigger if the gateway watches the calendar, else cron)|pulse → fast|roots: pool; the sacred-space boundary → class rubric|
|saas-studio|dept `saas-studio` (cold)|product CLIs stay scripts under scope; `sourcehound-api-rd` decides class vs child dept at activation|—|roots: pool + product dirs; **checks are a direct port**: saas CLI parses, unit tests, structure gates (critical=true)|
|vitality-research|dept `vitality` (cold)|`vitality:research` (KosmOS ta-research lifecycle ×4, consumes kosmos CLI)|→ fast when activated|roots: pool + research-vault queue + ~/KosmOS subtree (read); checks absorb medres status gates|
|credibility-funnel|**no department yet** (cold)|when activated: `credibility:research` (ta-research ×4); **drift-watchdog + state-repair port as `[checks.dept]` entries, not routines** — they guard state|—|roots: pool + research-vault; its native organs (pipeline/proof-architecture/showcase/topic-anchors/webdev) stay data under roots until the funnel lives|
|platform-infra|**the capability layer's operating department** (`platform-ops`, wave 2, per the C-track C4) — NOT a venture: it owns the surface units (browser chain, MCP, channels, tunnels — C1 manifests), their health probes (C3), the ops fleet's 15 crons as its routines (cron-management's Holon-superseded parts are not imported at all), and the `platform:surface-change` class that proposes manifest edits through the normal pipeline|`platform:surface-change` (propose surface/manifest edits), `platform:heal` (fleet ops)|fleet crons → script|its smoke checks are the surface health probes (C3); the surfaces themselves are declared in `genome/units/` manifests it proposes and the Chair applies via `genome sync`|
|identity-core, research-vault, relationship-crm, content-campaigns, site-factory, presentation-engine, flight-ledger, strategy-incubator (data organs)|**service units** (U1 manifests + [[services]]: `identity`, `kosmos`, `contacts`, `campaigns`, `site`, `render`, `logbook`, `grounding`/`insights`/`trajectory`)|—|—|`pool_of` names the consuming departments; their CLIs run under the consumer's scope; their smoke gates join consuming depts' checks; writes via `msg request --service` (bind.service)|
|the live trading system, KosmOS, hermes gateway, Rakesh's WA|**external systems**|—|—|watched by scope roots (read-only), never departments|

## 4. Operationalization (the rules that make it run)

1. **Lanes by what the job is**, not by habit: deterministic scrapers/processors/regrades →
   `script` (the kernel runs the command; no agent session); one-session judgment jobs
   (dossiers, discovery digests, monitors, strategist reads) → `fast` (G0, sampled verify);
   anything that **sends** (DMs, emails, applications, WhatsApp, publishing) → `full` with the
   pilot floor at **G4** (`[pilot] depts = ["career", "freelance"]`, landed) and per-job
   activation by the Chair.
2. **Import preserves the current operator-hold**: outside-reach jobs import **disabled**
   (I1, landed), staggered dailies, dry-run first, dept-checked.
3. **Checks per department**: `smoke.yaml` → `[checks.dept]` as-is; credibility's two state
   guardians → checks; saas's three CLI gates → checks (critical); the pilot guard = the `[pilot]`
   floor (already a mechanism) — no bespoke check needed.
4. **Secrets** (G8, landed): `[secrets.dept.<slug>]` 0600 key-file refs per the table above; the
   pilot week validates against career's real `.env`s; exchange keys stay read-only.
5. **Budgets**: `[budget.dept]` caps per the migration plan's standing decision; script-lane
   firings cost no agent sessions at all — the flywheel's p1/regrade/digest legs are nearly free
   on Holon.
6. **Delivery** (the one real kernel gap left for the ventures): per-job Telegram threads need
   `[notify.dept.<slug>]` routing (I2) — small, universal-repo work, but its natural home is
   wave 5 (notify-through-runtime) once operant W5 lands; until then `--deliver` rides the
   org-wide route into the Chair's default thread.
7. **Governance ports as mechanism, not text**: PBI-RG-001 (no brand cross-contamination) →
   two task classes with disjoint rubrics; `approval_gate.py` → Holon's chair gate;
   the decommission rule (3 verified firings + one clean week) stays the runbook's exit
   criterion; the AD/RG corpora stay readable under roots for provenance.
8. **Cold pools stay cold**: a paused organism cron carries zero load; importing early only
   doubles the surface. Create the cold departments **at activation**, not before.
9. **The segregation law** (the C-track's other half): a capability — surface or service unit —
   never pursues a venture; a venture never owns a shared surface. A surface's liveness is
   `platform-ops` work; a surface's use is venture work. Every capability a run may use renders
   in its brief with its preferred route and health (C1–C3), so no session is spent searching
   the filesystem for viable options.

## 5. What this changes in the standing records

- **10 departments → 5 live** (career, freelance, arch-leads, quant + the new platform-ops),
  1 merged (brand), 4 cold (created at activation), credibility deferred as checks+data until
  its funnel lives. Slugs keep pool names for traceability.
- **The org is two segregated hierarchies** (ventures over a capability layer), per the C-track;
  the ventures' wave plan below consumes the layer's mechanisms (C1–C3) but never owns them.
- **platform-infra becomes the capability layer's operating department at wave 2** (the cortex
  audit's U5.1 ruling, refined by the C-track's C4: fleet + surfaces + health, not just crons).
- **The swarm stratum is declared superseded** (not in any prior record explicitly).
- The `2026-10-15` record §5's per-venture table rows are superseded by §3 here where they
  differ (brand merge, credibility deferral, platform-ops); its waves, I-numbers and runbook
  stand.

## 6. Sequencing and decisions requested

```
pre-pilot       C-track C1+C2 lands first (surfaces as manifests + the capability block):
                career's apply engine needs the browser surface the day it runs;
                channels.toml rides the same shape (closing I2's config gap)
wave 1 (pilot)   career dept + career's foundations roots; brand stays cold
wave 2           freelance + arch-leads depts; platform-ops dept (C4) + surface
                health probes (C3); U-manifests for the foundations those three pool
                (identity-core, relationship-crm, content-campaigns, research-vault,
                strategy data organs)
wave 3           quant dept (external trading system watched)
wave 4           brand dept (one, two classes) · then the cold four at activation
wave 5           VPS — unchanged (G12 only if topology says second organization)
```

Decisions requested (Chair):

1. Adopt the two-hierarchy segregation (ventures over a capability layer) and the
   five-live-department shape, with cold pools created at activation.
2. Merge the brand pools into one `brand` department with two task classes (the holonic pair's
   regression enforced by class boundaries), or keep them separate departments.
3. Port platform-infra as `platform-ops` — the capability layer's operating department — in
   wave 2 (C-track C4), or leave the fleet on hermes cron and defer.
4. Confirm the supersession list (swarm, forge, cron-management, symlinks, arch emit) — anything
   on it that you still want ported should be named now.
5. The 2026-10-14 plan's §8 approval still stands open: wave order, career-pipeline as the
   pilot, the decommission rule, per-department budget caps.
6. Adopt the C-track itself (surfaces as manifests, the capability block pre-pilot, health
   probes, platform-ops as owner, the single-injector law) — decision 6 of
   `2026-10-16-platform-ops-capability-system.md`; C1+C2 is the first package under it.


## 7. Red-team and execution state (2026-10-17)

Verified against the kernel at `bee3bbb` (339 tests, `lint --strict` 0/0), the live instance and
the organism (all read-only), after the capability-layer audit's §1 execution and the red-team
audit (`2026-10-16-agentic-os-red-team-audit.md`, which `refines` this record). **Nothing in
§3–§6 has been executed yet**: the record is still `proposed`, all six decisions are open, and
the live instance carries no venture-import config (no `genome/` manifests, 0 units, no
`[pilot]`, `[secrets]` or `[scope.dept]` stanzas — probed 2026-10-17).

### 7.1 The substrate this record depends on — landed and now holding

|Claim|State at `bee3bbb`|
|---|---|
|U1–U3 manifests, pooling, registry|landed (`genome sync`/`emit`, `bind.service`/`bind.pool`, api_version 3)|
|"reads by roots, writes by msg request"|**now true in mechanism**: the R-06 fix splits pooled roots into `read_roots` (policy, a G3 grading floor, isolation reads)|
|pooled services' CLIs reach the fence|R-05 plus the act_commands residual: entry binaries join whichever fence exists|
|the brief renders what the dept pools|R-01: the pooled block reaches plan/research/shape, not only execute/verify|
|one version of a skill per run|R-09: the prepared run exports its department's resolved skills|
|G8 secrets, I1 import fidelity, I5 pilot floor|landed (`[secrets.dept]`; `routine import` dry-run + `imported=True` with outside-reach disabled; `[pilot]` floors outside-reach at G4)|
|supersession targets|every mechanism exists (schedules + import, the org layer, `genome sync`/`emit`, declared pooling)|

### 7.2 Findings against this record

1. **§2B/§3's "external systems watched by scope roots (read-only)" is wrong post-R-06.**
   `[scope.dept]` roots are the **writable** reach; read-only reach exists only through
   pooling. The trading logs (quant) and the KosmOS subtree (vitality) must be declared as
   **unit manifests with `pool_of = ["quant"]` / `["vitality"]` and no services**, so their
   roots join `read_roots`. Adding them as scope roots re-introduces the R-06 defect through
   config.
2. **§4.1's lane assignments assume in-session CLI use, which operant cannot do yet.**
   Plan/research/shape/verify run in the observe posture, which has no terminal (R-03); a
   service becomes observe-callable only through R-04, which waits on the kernel's read API
   v4. Until then, a job that must run a foundation CLI mid-session runs on the script lane
   (the kernel runs the command) or on a CLI harness — §3's lane column must carry the
   constraint.
3. **The browser surface is settled by the Chair (2026-10-17): on this machine a browser is
   ONLY sourcehound or browseros-neo.** The C-track §1 tiered chain (browser-fallback.py,
   BrowserOS-behind-a-tunnel, standalone Obscura CDP) and the audit's R-02 fix line ("Obscura
   CDP stays as the apply engine's tier") are superseded: the obscura binary is not a route,
   it is **sourcehound's internal stealth engine** (cloakctl's `defaultEngine`, 20+ profiles
   run on it — deleted, sourcehound would break), and the dead `[browser] provider` key is
   purged from the operant config. The pre-pilot `browser.toml` declares exactly two routes:
   sourcehound (native `web_*`/browser tools for operant bodies; the sourcehound/cloakctl CLI
   for CLI harnesses) and browseros-neo (the local browser — the apply engine's interactive
   tier at import). career's `OBS_CDP_URL` references are superseded at wave-1 import by the
   one variable name the body reads (`BROWSER_CDP_URL`); the organism-side files that still
   teach the dead chain (the browser-fallback-chain skill, platform-infra's AGENTS.md,
   career's `apply_job.py` and p3/p4 protocols) are B-side, synced with the live VPS production
   copy, and are adapted at import — or purged in a B-side pass that mirrors the VPS.
4. **§3's platform-ops row inherits the ops-fleet list unexamined.** The 15 fleet crons
   reference the retired chain (browser health, the hermes gateway); wave 2 re-baselines the
   fleet against the current surfaces (sourcehound, the operant gateway, R-20's
   one-receiver rule) before import.
5. **§4.5's "budgets … per the migration plan's standing decision"** — the caps are part of
   the still-open §8 approval, not a standing decision. Wording only.
6. **Credibility's state guardians need a home that exists.** `[checks.dept.<slug>]` needs a
   department; credibility is deferred as "no department yet". Until activation its two
   guardians sit in org-level `[[smoke.checks]]`, not `[checks.dept]`.
7. **Dependencies this record predates, all landing before wave 2:** R-13 (holarchy/`owner` —
   decides where career's `applications` engine and arch's `engagement-engine` live: task
   classes inside the venture vs venture-owned units), R-14 (K-KB — decides whether career's
   `kb.py`/company-kb and arch's materials-kb port as services or are superseded by
   `holon kb`), R-16 (the system-design skill), N-1 (the Notion "What needs you" page +
   Routines/Incidents data sources — routine **activation** is otherwise CLI-only during the
   pilot week), and the G2 window (R-19: wave-1 load ≈ 100–150 Notion pages/day; the window
   lands before wave 2).

### 7.3 The terrain moved under §1: the Paperclip era

§1's load table described hermes-cron; that scheduler is **dead since 2026-10-16**
(PAPERCLIP-ERA banners on every protocol; hermes-agent stopped 2026-10-14). The live scheduler
is **Paperclip on the VPS**: 68 venture routines — 34 live (architectural-leads 4,
career-pipeline 14, freelance-agency 15, plus the lane watcher), a 25-role agent org, delivery
through the Paperclip bot's DM lanes, zeroclaw bodies on the VPS model gateway. Consequences:

- **The import's live-set source is the Paperclip registry, not the protocol frontmatter.**
  The `cron-jobs/*.md` files remain the intent definitions `routine import` reads, but their
  `status` fields are historical. Reconcile protocol × registry at import.
- **The decommission rule changes target**: "3 verified firings + one clean week" then one
  PATCH + trigger-disable on the Paperclip routine — the hermes crons need no decommissioning.
- **One scheduler per pool during cutover**: a pool's routines run on exactly one scheduler at
  a time — the Holon routine activates as the Paperclip routine disables, pool by pool (the
  recurring-plan double-fire lesson).
- **Import §3's class shape, not the live registry 1:1.** Paperclip's own consolidation
  (`PAPERCLIP-ARCHITECTURE-GAPS.md`: 23 career + 24 freelance routines ≈ 8 job types → ~10
  state-driven routines, create-then-pause) matches §3's task classes; migrating the redundant
  phase-cron families 1:1 would import what both sides already ruled dead.
- **quant's live-money rule** (board approval, enable last) stands in front of wave 3;
  **community-loo's cadence defect** (events at `*/10` = 144 runs/day) is fixed at activation,
  not imported as-is.
- **The substrate question is closed**: the local organism tree and the VPS tree are in sync
  (Chair, 2026-10-17); the choice between them is deferred, and `routine import` reading the
  local protocols is mechanics, not a substrate ruling.

### 7.4 What is left to execute

Unchanged in shape from §6 and the register's §5; the gates, in order:

1. **Chair decisions** — this record's six (two-hierarchy, brand merge, platform-ops,
   supersessions, §8 pilot approval, C-track adoption), where decision 6 is now the red-team's
   **revised** C1+C2 package (`2026-10-16-agentic-os-red-team-audit.md` §5–§6), plus its
   decisions 2–5 (R-04 runtime indexing, R-13 holarchy, R-14 K-KB, N-1 Notion).
2. **Pre-pilot kernel package** (small; unblocks the pilot): C1 manifest fields + the C2
   capability block + the `api_pool` view + the v4 migration (`pack_api` taught v4; operant
   already accepts "4") + `browser.toml` declaring the two Chair-ruled routes (sourcehound,
   browseros-neo). R-01/R-05/R-06 are already in.
3. **Owner/ops**: restore the workstation model gateway (the org smoke fails closed on it —
   nothing runs until it passes), resolve the 5 unstaffed incident tasks in `executive` (§7.5:
   three stale hermes-era failures, one the gateway smoke, one the unstaffed report itself),
   isolation root setup, the ~169 orphan Chair keys, the live bot token (gates wave 5).
4. **Wave 1 (career)** per the runbook: the department + `[scope.dept]` roots + task
   classes/playbooks + unit manifests (identity-core pooled; external watches per finding 1)
   + G8 secrets + `routine import` (protocols × the Paperclip live-set; outreach lands
   disabled, I1; `[pilot]` floor, I5) + the one-scheduler-per-pool cutover + the pilot week
   (G8 validation, G4 intake decision, G2 window measurement) + decommissioning career's
   Paperclip routines.
5. **Waves 2–5** as sequenced, with R-13/R-14/R-16/N-1 decided before wave 2 and I2 riding
   wave 5 (operant W5).

### 7.5 The internal systems, probed live (2026-10-17)

The Chair asked whether a platform-ops-like system and a knowledge base already exist. Probed
read-only on the live instance and the kernel at `bee3bbb`:

1. **Platform-ops exists as machinery, not as a department.** Live today: org-wide and
   per-department smoke checks (the model-gateway probe and the operant-harness probe, both
   critical — a failed critical check blocks the department's agents), `holon doctor`
   (isolation, genome staleness, retention, unstaffed reporting), the incident→work loop (the
   kernel files incident tasks with plan stages; K-2's guards name Chair-authored checks),
   `[notify]` and delivery, backup/gc, keys, adapter installers + the conformance suite, the
   heartbeat (installed, off), and one live test routine (a fast-lane notes digest; a
   disk-usage-report routine is disabled). **No department owns any of it.** The live
   instance's two departments are `executive` (the Chair's; zero employees) and `tools` — the
   e2e validation org (`hired_reason: e2e`; its 42 done tasks are validation runs: Notion live
   tests, playbook refinements, retros, digests, the operant body pilot). Incidents file into
   `executive`, where their plan stages are reported unstaffed — by design, the Chair being the
   only member. Consequences: decision 3 (platform-ops) **creates the owning department over
   machinery that already exists** — the wave-2 port is a department plus routines, not new
   machinery; C3's probe half is the existing smoke mechanism (a surface's health = a smoke
   check entry + a doctor line), leaving only the `(down)` render in the capability block as
   new code; and the standing unstaffed-incidents pattern is resolved structurally when
   platform-ops takes incident ownership. Of the five standing incidents: three are
   hermes-era run failures now moot, one is the gateway smoke, one is the unstaffed report
   itself — restore the gateway and close the stale three. This supersedes §2B's "`it`
   [exists]" tag: no `it` department exists on any instance.
2. **The knowledge base exists at the atomic layer, and it is live.** `memory.db`: 76 items
   (fact 20, lesson 24, constraint 11, decision 8, preference 8, open question 5) with FTS,
   jaccard dedup, pin/retire/promote (dept → org), 5 episodes, project state; the `memory`
   CLI and the bundle's "Relevant memory" section. Playbooks are versioned protocol/rubric
   documents per routine and task class. **The document/collection layer does not exist**:
   no Markdown-source collections, no status lifecycles, no derived `kb.db`, no `holon kb`
   verbs (R-14's K-KB). Consequence: decision 9 (K-KB) extends a live capability on two
   in-repo patterns (genome sync's manifest → derived view; memory's FTS items) — an
   extension, not a new subsystem; until it lands, career's company-kb routines run their own
   `kb.py` on the script lane.
3. **C1's manifest shape is half-expressible today.** `category` is already a free-form
   manifest field synced through `units`/`api_units`, so a surface unit
   (`category = "surface"`, `pool_of`, services with command/accepts/returns) can be declared
   with no code change and renders as a pooled unit. The v4 package is exactly the remaining
   delta: per-service `effect`/`note`/`args`/`output`/`health`, `owner`, the `api_pool` view,
   and the per-posture render.
