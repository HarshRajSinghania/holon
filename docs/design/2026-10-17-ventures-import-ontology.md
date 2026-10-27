---
status: proposed
date: 2026-10-17
description: "The implementation ontology for the ventures import: the entity tree that exists when the port proceeds (pre-pilot kernel package, wave-1 career, then waves 2-5), the organism→Holon mapping, the per-routine cutover state machine, field-level shapes with today-vs-v4 markers, naming laws, invariants and acceptance markers. Built on the 2026-10-17 ground-truth probes and the eleven open decisions."
tags: [ventures, import, ontology, implementation, mapping]
refines: [2026-10-16-ventures-re-architecture.md, 2026-10-16-platform-ops-capability-system.md, 2026-10-16-agentic-os-red-team-audit.md]
---

# 2026-10-17: the ventures import ontology — what gets implemented now

Status: **proposed** (the working outline; the build waits on the Chair's eleven decisions — D1 the
two-hierarchy, D6 the revised C1+C2 package, D5 the pilot approval are the first three gates).
The 2026-10-16 re-architecture §3 stays the decision authority; this outline refines it into
field-level shapes, migration states and build order. Ground truth: the probes of record §7.5
(platform-ops exists as machinery, no owning department; the KB is the live atomic memory.db;
C1's manifest shape is half-expressible today).

## 0. Scope and laws

- **A-side work**: what Holon (× operant) must implement to receive B's ventures (organism ×
  ZeroClaw × Paperclip) wave by wave. Two infrastructures, one bridge: until a pool crosses, B
  keeps running it and A runs nothing for it.
- The bridge's unit is a **routine, then a pool** — the cutover is per-routine dispatch, and a
  pool is done when its routines are done (§4).

## 1. The entity tree (what will exist)

```
Chair (S5 identity)
└─ executive                    governance; the Chair; receives incidents until platform-ops exists
   ├─ career                    wave 1 (pilot)  ← career-pipeline
   ├─ freelance                 wave 2           ← freelance-agency
   ├─ arch-leads                wave 2           ← architectural-leads
   ├─ quant                     wave 3           ← quant-trading
   ├─ brand                     wave 4           ← brand-integrating + brand-polarizing (ONE dept, two classes)
   └─ platform-ops              wave 2           the capability layer's operating department
                                                    owns surface units' truth + health; takes incidents at wave 2

CAPABILITY LAYER (consumed; never pursues a venture)
   ├─ surface units             browser (two routes: sourcehound | browseros-neo), channels (wave 5),
   │                            mcp, tunnel          [C1; today: category + pooled render]
   ├─ service units             identity-core, research-vault, relationship-crm, content-campaigns,
   │                            site-factory, presentation-engine, flight-ledger, strategy-incubator
   ├─ watch units (read-only)   trading logs (quant), KosmOS subtree (vitality)
   └─ venture-owned engines     career/applications, arch/engagement-engine, arch/materials-kb
                                 (owner = the venture; data + CLI, no own lifecycle)

COLD — created at activation, not before: community, saas-studio, vitality, credibility
                                 (credibility deferred as checks + data until its funnel lives)
```

**Roles** are the existing six (planner, executor, researcher, verifier, head, steward); the
hermes-era employee identities do **not** migrate — Paperclip's role org stays on B's side, and
each Holon department hires its own with `hired_reason` naming the wave.

## 2. Entity shapes (fields; ✓ today, v4 = the package)

|Entity|Fields|State of implementation|
|---|---|---|
|**Department**|slug (pool name for traceability), parent (executive), roles/employees, reach (`[scope]` roots writable; pooled units in `read_roots`), `commands`/`act_commands` fence, checks, smoke, secrets, budget, autonomy floor, task classes, playbooks, notify route|✓ holon/execution/org.py + config stanzas; pooling ✓ (U2); `read_roots` split ✓ (R-06)|
|**Unit manifest**|charter, category, tier, `pool_of`, `consumed`, roots; services per unit|✓ `$HOLON_HOME/genome/units/<slug>.toml` + `genome sync`/`emit` (U1–U3)|
|** — surface additions**|`category = "surface"`, `pool_of = ["*"|depts]`, `owner`; per service `effect` (read\|write), `note` (prefer-this-route), `args`, `output`, `health`|**v4** (the half-expressible truth: `category` is free-form today and already renders as a pooled unit; the columns, `owner`, `api_pool` and the per-posture render are the delta — D6)|
|**Task class**|`<dept>:<class>` namespace, playbook (versioned protocol + rubric), default lane, grade floor, budget|✓ classes/playbooks; authoring is data, not code|
|**Routine**|title, dept, cron\|event, lane, `command` (script lane), rubric, task class, deliver, enabled|✓ `routine add`/`routine import`; I1 imports land disabled; I5 pilot floor|
|**Reach/policy**|`roots` (writable), `read_roots` (pooled), `commands`, per-run budget|✓ policy.json + isolation; the segregation law holds in mechanism (R-06)|
|**Checks**|`[checks.dept]`, `[smoke.dept]`, guards naming `[checks.class]`|✓ machinery live; platform-ops becomes the owning department (D3)|
|**Secrets**|`[secrets.dept.<slug>]` VAR = 0600 key-file ref → execute-stage env at claim|✓ G8 (pilot week validates against career's real `.env`s)|
|**Delivery**|org-wide `[notify]` today; per-thread routing via a **channels surface unit** at wave 5|✓ org-wide; I2 deferred (operant W5)|
|**Knowledge**|memory.db atomic items (live: 76, FTS, promotion); playbooks; the document/collection layer (K-KB)|atomic ✓; **K-KB not built** (D9; wave-1 career bridges with script-lane `kb.py`)|

**The first manifest, concretely** (`browser.toml`, per the Chair's two-route law):

```toml
charter = "The web and browser surface every entitled run may use."
category = "surface"
pool_of = ["career", "freelance", "arch-leads", "platform-ops"]
owner = "platform-ops"                                     # keeps it true (C4); v4 field

[[services]]
id = "sourcehound"
note = "prefer this route for any body: native web_search/web_fetch/web_scrape tools are always loaded; CLI harnesses run `sourcehound <group> …`; the cloakctl browser is the interactive tier"
effect = "read"                                            # v4
health = "cloakctl doctor --json"                          # v4

[[services]]
id = "browseros-neo"
note = "the apply engine's tier: pages that need a real local browser session (anti-bot), reached at BROWSER_CDP_URL"
effect = "write"                                           # v4
health = "browseros-neo --version"                         # v4
```

No obscura, no `browser-fallback.py`, no `OBS_CDP_URL` anywhere: the obscura binary is
sourcehound's internal engine (record §7.2 finding 3). career's `apply_job.py` reads the one
name the body reads (`BROWSER_CDP_URL`) from wave 1 on.

## 3. The mapping table (organism → Holon)

|B (organism/Paperclip)|A (Holon) entity|Shape and timing|
|---|---|---|
|cron-job protocols (`cron-jobs/*.md`)|the intent definitions `routine import` reads|frontmatter historical; reconcile with the Paperclip registry at import|
|Paperclip registry (34 live of 68)|the import's **live-set** source per pool|`routine import --dept <slug>` from the live set, not the corpus|
|job-loop p1–p3, recover, digests|`career:` **routines** — legs on their lanes|script lane for deterministic legs (scrapers/regrades); fast for one-session judgment|
|job-loop p4/p9 (outreach)|same routines, **imported disabled** (I1)|the Chair activates when the pilot proves; `[pilot]` floor G4 (I5) while enabled|
|applications engine|**venture-owned unit** `owner = "career"`|roots under the pool; the browser surface's interactive tier; consumed by `career:apply`|
|company-kb ×3, `kb.py`|`career:company-kb` routine running `kb.py` on the script lane|owns its verbs until K-KB lands (D9); then the same verbs via `holon kb`|
|delivery threads (Jobs 128831 …)|`--deliver` → org-wide `[notify]` (Chair's default thread)|per-thread routing waits for the channels surface unit at wave 5 (I2, operant W5)|
|foundations (identity-core, research-vault, relationship-crm, campaigns, site, render, logbook, strategy)|**service units**, `pool_of` = the consuming departments|reads join `read_roots`; writes via `msg request --service`; smoke gates join the consumers' checks|
|the trading system, KosmOS, the hermes gateway, Rakesh's WA|**watch units** (read-only roots, no services) + gated routines|quant/vitality read them; the WA send stays a per-send Chair gate (outside-reach)|
|platform-infra (fleet crons, organs)|`platform-ops` dept (D3) + its surface units + `platform:surface-change`/`platform:heal` classes|wave 2, re-baselined: the fleet's 15 crons reference the retired hermes chain|
|drift-watchdog, state-repair (credibility)|`[checks.dept.credibility]` at activation|org-level `[[smoke.checks]]` until the department exists|
|AD/RG corpora, `_org.yaml`|readable data under scope roots|provenance; no mechanism ports from them (operative rules already ported: the PBI-RG-001 class split, the chair gate)|
|swarm/, forge, cron-management, symlinks, arch emit|**not ported** (D4 supersessions)|Holon's org layer, the work graph, schedules + import, declared pooling, genome sync/emit replace them|
|Paperclip bot DM lanes (bridge v2.4)|delivery on B until wave 5|the lanes are the fallback route for a pool still on B|

## 4. The cutover state machine (one scheduler per pool)

```
Per routine:  B-live ──pause B routine──► verification ──3 verified firings + clean week──► A-live
                                                                      │                    (B disabled: one PATCH + trigger-disable)
                                        meanwhile the A routine is enabled and fires
```
- Never both enabled for the same work: B's routine is paused **before** A's is enabled (the
  recurring-plan double-fire lesson is a standing ledger row).
- Pool done = every routine in the `A-live` state + the Paperclip routines disabled + the
  decommission recorded (the runbook's exit criterion).
- Rollback mid-window = re-enable the B routine, disable A's; no data moved in the first place
  (routines are declarations, not migrations).

## 5. The build order (the actual work)

```
[Chair rulings: D1 → D6 → D5]                                   gate — nothing lands before D1/D6
Kernel package (universal repo, tests first):
   C1    manifest fields (surface additions) + `genome sync` v4 (migration 0015) + lint: surfaces need effect+note
   C2    the capability block: per posture, ["*"] surfaces for department-less work; api_pool view; pack_api v4
   browser.toml — the two routes above; sources from the live machine, authored post-decision
   operant half (D7/R-04, after v4): pooled services as deferred tools; read services callable in observe
[A-side ops, parallel, Chair-owned]:
   restore the workstation free-stack gateway (unblocks every A-run; B is unaffected)
   close the 3 stale executive incidents after the restore; the gateway and self-report ones close with them
   isolation root setup; ~169 orphan Chair keys
WAVE 1 (career, after D5):
   dept create career; [scope.dept.career] roots; [secrets.dept.career] (IMAP, apply transport, the CDP var)
   unit manifests: identity-core (service), applications (owner=career)
   task classes + playbooks: career:discover, career:apply, career:company-kb, career:digest, career:hygiene
   routine import (the live set; p4/p9 disabled; [pilot] floor); stagger the dailies
   pilot week: G8 validated against the real .envs; G4 intake decided; G2 window measured (N-1 page + Routines source first)
   cutover per §4; decommission career's 14 Paperclip routines
WAVE 2: freelance + arch-leads depts; platform-ops dept (D3 — a creation over live machinery: incidents, smoke, fleet);
        C3 (the doctor line + the (down) render); R-13 holarchy (D8); K-KB (D9)
WAVE 3: quant (watch units: trading logs read-only; exchange keys read-only; live-money board gate stands)
WAVE 4: brand (one dept, two classes, the chair gate on publishing); then the cold four at activation
WAVE 5: VPS posture; channels surface unit (I2) with operant W5; Notion window before wave-2 load (R-19)
```

## 6. Naming laws

- Department slugs keep the pool names (career, freelance, arch-leads, quant) for traceability;
  brand is the one merge (`brand`, classes `brand:agape`/`brand:eros`).
- Task classes namespaced `dept:class` (career:apply), one playbook per class.
- Unit slugs = the foundation's own name (identity-core) — pooled by declaration, not symlink.
- Routine titles keep the job's name from its protocol (the import's provenance).
- No harness is named under `holon/` (law 2); the browser surface routes are named in the manifest,
  not in code.

## 7. Invariants the implementation must keep

- **Segregation**: ventures consume capabilities; a venture never owns a shared surface; pooled
  roots are `read_roots`, a write into one floors at G3 (owner: `msg request`).
- **One scheduler per pool** during cutover; imports land disabled when they reach out (I1);
  the `[pilot]` floor (I5) while a pool is in its pilot window.
- One writer per database; status changes through `Work._set`; enumerations from `vocab.py`;
  migrations are new files (v4 = 0015, additive); tests first for graph/contract/security/driver
  changes, each fix with a guard test and a ledger row.
- Secrets never in config (G8); the Chair key never reaches a harness (isolation — the standing
  root setup); the context bundle is the only capability guidance injected (C6, both sides).
- Instance specifics stay out of the repo; the organism and the pilot week's real data stay on
  their machines.

## 8. Acceptance markers (how we know each piece is real)

1. **Kernel package**: a plan-stage brief on a fresh instance shows "Capabilities" with the two
   browser routes, notes and a `(down)`-capable health read; `pack_api` publishes v4 with
   `api_pool`; operant reads v4 and refuses an unknown version; the suite green.
2. **Wave 1**: career's five classes have playbooks; the import report shows p4/p9 disabled;
   the pilot week's runs deliver digests to the Chair through `[notify]`; three verified
   firings per routine; career's Paperclip routines disabled; a clean week.
3. **Wave 2**: platform-ops files its first surface-change proposal (a manifest edit) and the
   heartbeat carries its health probes; a write into a pooled root from any grade floors G3.
4. **Waves 3–4**: quant's monitor runs in fast/script lanes reading watch units only; brand's
   eros publishes nothing without a Chair decision on the piece.

## 9. The duplication audit (against paperclip × zeroclaw × organism) and the collapse rules

The stack is not duplicated — B is live production on the VPS, A is the target architecture; the
real risk is two implementations of one function on the same data during the port. Verdict per
function:

|Function|B's implementation|A's side|Verdict|
|---|---|---|---|
|Scheduler|Paperclip (the only live one)|routines + schedules (existing)|the replacement itself; **nothing built**|
|Bodies|zeroclaw|operant (existing)|B's bodies stay B's; **no zeroclaw work in the plan**|
|Workforce management (swarm/)|agent-fabric, task-grid, workforce-ops|the org layer + work graph (existing)|**not ported** (D4) — the anti-duplication ruling is made|
|Registry|`arch` CLI, living-architecture|`genome sync`/`emit` (U3, existing)|**not ported** (D4)|
|Delivery|bot DM lanes, bridge v2.4|org-wide `[notify]`; channels unit at wave 5|a bridge, bounded: B delivers for pools on B, A for A-side runs; unified at wave 5|
|Venture KBs|`kb_base.py` + per-pool `kb.py` (20 verbs), `kb.sqlite`|K-KB (D9) with the script-lane bridge|**real risk — one implementation**: `kb.py` imports as script-lane jobs only until K-KB lands; then the same data is expressed as collections + the 6 verbs; the overlap window ends at wave 2, not at "sometime"|
|Intent hierarchy|strategy-incubator grounding/insights/trajectory, Compass|objectives + key results (existing) over the pool's own data|**mapped, not imported**: the CLIs enter as read-only service units; the role (goals/intent) is A's objectives — no second intent engine|
|Ops fleet|platform-infra's 15 crons + its smoke organ|platform-ops dept over A's live smoke/doctor machinery|**folded, not paralleled**: the fleet's smoke gates become `[smoke.dept.platform-ops]` entries; the B-side copies decommission under the one-scheduler-per-pool rule|
|Skills|Skill Studio's 79 (injection broken)|the skills library + per-run dept export (R-09)|imported once as department forks; Skill Studio dies with B's stack per pool|
|Governance text|cortex ADs/RGs|A's own `docs/decisions/`|different corpora; A's decisions govern A|

**The collapse rules that keep "no duplication" true:**

1. One scheduler per pool at cutover: B's routine is paused **before** A's is enabled; the
   verification window (3 firings + clean week) never runs two.
2. Shadow imports (I1) are declarations, not a second execution.
3. Until a foundation's pool crosses, its data is written only by its B-side CLIs, invoked by A
   as script-lane jobs; A reads through pooled `read_roots` and never becomes a second writer.
4. K-KB is the single knowledge implementation: `kb.py` is a bridge, and its overlap window
   closes at wave 2.
5. Objectives are the single intent implementation: strategy CLIs stay read-only services.
6. platform-ops folds the fleet's checks into the live smoke machinery; probe duplication ends
   with the decommission.
