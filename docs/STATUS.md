---
status: living
date: 2026-10-16
description: "The operator's live index: where Holon sits, deployments, standing decisions (do not re-open), rules, open decisions, what is next. Update in the same commit as any change it describes."
tags: [status, index, living]
---

# Status, context and standing decisions

## Contents

- [1. Where Holon sits](#1-where-holon-sits) — the two stacks, and which one this file is about
- [2. Deployments](#2-deployments)
- [3. Standing decisions (Chair)](#3-standing-decisions-chair) — do not re-open
- [4. Rules for anyone working on Holon](#4-rules-for-anyone-working-on-holon)
- [5. Open decisions for the Chair](#5-open-decisions-for-the-chair)
- [6. What is next](#6-what-is-next)
- [7. Reading order for a new agent](#7-reading-order-for-a-new-agent)

Read this after INTENT. It says where Holon sits in the Chair's wider system, what is deployed,
which decisions the Chair has already made (do not re-open them), and what comes next. Update it
in the same commit as any change it describes. Hosts, ids and keys stay out of it (AGENTS.md).
The emitted decision/regression registry is [`docs/RECORDS.md`](RECORDS.md) (`scripts/genome`).

Last updated: 2026-11-03 (**the post-upgrade plan's nine gaps re-validated live**: G12's
skills export confirmed correct — 11 skills, agent-owned mode 664, only the intended
`$holon` → `${HOLON:-holon}` substitution in a raw diff; G11's mask-erasure cause confirmed
unchanged on `~/.jcode` with probe and doctor naming the identical two paths, so
`holon isolation apply` `--force` stays the Chair's ruling; G7's defect closed at the submit
seam plus a second defect it exposed — `contract._step_problems` defined twice, the later
binding winning and the earlier one dead text, fixed by deletion because the lost original is
unrecoverable and no executor reads `depends_on`. Suite 933 tests, 3 failures + 17 errors
against a 4 + 18 baseline; gate `lint --strict` 0/0.) The 2026-10-20 block
below is left as written, because it says what was true then.

## 1. Where Holon sits

> **Two stacks, never one system.** This file describes **A** — the `holon` kernel, this overlay
> and the `project-genome` skill. The Chair's production venture runtime (**B**: Paperclip,
> ZeroClaw, the Hermes organism, the VPS) is a **separate program** that this one does not depend
> on. They share vocabulary ("departments", "operations", "employees", "ventures") and nothing else;
> a finding about one is never evidence about the other. The bridge between them — the ventures
> import — is Chair-gated and is **not** on A's critical path. Law 10 in `AGENTS.md`;
> `docs/design/2026-10-20-the-a-side-program-boundary-and-solutions.md` is the scope statement and
> the A-side gap list.

- **A — this program.** A documentation-governance layer (**project-genome**: role→path maps, a
  card per repo, a federation across the portfolio) over an **agentic-OS kernel** (**Holon**:
  departments, persistent employees, one work graph, approvals, learning loops, a harness contract).
  It runs on the Chair's workstation (`~/holon`). Its live state on 2026-10-20: 64 federated
  venture cards, lint 0 errors / 0 warnings; the kernel at 379 tests; the instance carrying
  **2 departments, 4 employees and 1 unit manifest** — a finished engine with no freight on it.
  The instance's **doctor is clean** (0 errors, 1 warning — `isolation.off`, which needs root)
  after the operant library symlink was repointed, the jcode provider was repointed to the live
  gateway, the skill exports were refreshed and seven stale incident plans were cancelled.
  **No venture function runs on it yet**: 0 KBs, 2 operations (neither from a venture), 0 of 71 tasks carrying
  a `project_ref` — and as of 2026-10-24, the ventures import has landed its **proposals** (26
  unapproved `Operation:` tasks across 3 new departments, every one OFF), which is freight staged,
  not freight running. `docs/design/2026-10-20-the-genomic-os-operationalized.md` §3 has the
  measured migration state.
- **B — a different program.** The Chair's production venture runtime: the Hermes **organism**
  (system pools under `cortex`, `swarm`, `foundations`, `ventures`), **Paperclip** as its only
  scheduler, **ZeroClaw** bodies on the VPS model gateway, delivery through Telegram lanes. It runs
  on the VPS and is healthy. **Nothing in A waits on it, and nothing in A's state describes it.**
- **The relationship is a proposal, not a fact.** B's venture pools were *designed* to move into A
  as departments — that is the Chair's intent, recorded in the ventures re-architecture and the
  import ontology, and it waits on the Chair's rulings. Until it happens they are separate systems
  that use the same words (`docs/design/2026-10-13-system-red-team.md` §5). Do not describe A as
  "the organism's OS" in the present tense: A does not run the organism, and no venture function
  runs on A today — the 2026-10-24 import staged 26 proposals, and they run nothing until the
  Chair approves each one and enables it.
- **Harnesses** are the employees' bodies. **Operant** is the one A runs today (`adapters/operant`,
  boundary plan phase A; it carries native `holon_*` tools, so its bodies submit without the MCP
  mount) — its driver was repinned to the current binary on 2026-10-20 (it had been pinned to a
  stale root-owned copy that could not start). **Hermes** and **jcode** are alternatives.
  **Both operant and jcode currently score 1/5 in conformance, for the same reason: the body
  does not stop.** jcode ran 10 min 21 s / 19 turns / 36 tool calls / 0 submits; operant ran
  66 tool calls / 40 iterations / 0 submits. The run token *was* re-proved to reach the MCP
  server, falsifying the earlier diagnosis
  (`docs/design/2026-10-20-the-genomic-os-operationalized.md` §2). **ZeroClaw is B's production
  body, not A's.** Claude Code is deferred. All run models through a local OpenAI-compatible
  gateway; it is the only model pipeline.
- **Operant** (`agentic-harness/operant`, Rust) is the Chair's own harness, and carries a native
  port of the legacy organism's org layer (nine cast seats). The proposal is that Holon becomes its
  organization as a sidecar kernel, and Operant becomes Holon's primary body and the Chair's
  Telegram channel: `docs/design/2026-10-14-operant-integration.md` (audit) and
  `docs/design/2026-10-14-holon-operant-boundary.md` (what is Rust in Operant, what is Python in
  Holon, and the interfaces); Operant's side is its `docs/agentic-os/` (awaiting the Chair).
- **The Chair's dashboard** is Notion: `adapters/notion` mirrors departments, employees, work and
  runs, and takes the Chair's decisions, notes, answers and new work back.
- **Goals** live in the Compass strategy system (`trajectory.db`, read-only to Holon); work links to a
  goal through `project_ref`.

## 2. Deployments

| Instance | Role | State |
|---|---|---|
| VPS | production; canonical for the organism's data | ZeroClaw adapter; first supervised wave since 2026-10-12; heartbeat on; runs the build from the morning of 2026-10-13. Later fixes are **not deployed**: the redeploy is deferred by the Chair. |
| Chair's workstation | development and validation | `~/holon`, **current** (re-measured 2026-10-17: 14/14 migrations, api_version 3; the launcher `~/bin/holon` runs the public checkout at HEAD); **org mode on since 2026-10-16** (operant `[holon]`; 15 operant-driver runs of 44); jcode + operant adapters; Notion mirror with webhooks as user services; heartbeat installed but **off**. Doctor 2026-10-17: standing `isolation.off`; **the org model-gateway smoke fails** (the local free-stack endpoint is down — every agent waits until it passes); 5 incident `plan` tasks sit unstaffed in `executive` (its only member is the Chair). No venture-import config exists yet (no bylaws manifests, 0 units, no `[pilot]`/`[secrets]`/`[scope.dept]` stanzas). **Re-measured 2026-10-23 during the isolation red-team**: the live instance is `01m4sf0wr27mgs9e1327aqxp1z` (3 departments, 7 employees, 166 tasks, 1530 events, work.db at `~/holon/execution/runtime/work.db`, `$HOLON_HOME=<the instance home>` (operator-context.md §Paths) — the only config path is `$HOLON_HOME/holon.toml`, which **exists** at that home (3906 bytes, 2026-10-23 10:24) and carries no `[isolation]` section — the first pass of this audit said the file itself was absent, and re-measuring it corrected that). **Re-measured 2026-10-24 after the ventures import**: 6 departments (executive, pioneer, tools + the imported career-pipeline, freelance-agency, architectural-leads), 26 unapproved `Operation:` proposals awaiting the Chair (each OFF until approved **and** enabled per job), 0 schedules created by the import, doctor at the pre-import baseline. The scratch-home bootstrap during the import's dry run left orphan Chair keys in the real key dir (the known test-process defect class); `holon keys gc --apply` collected 78 orphans into quarantine, the live key kept and re-verified (`holon whoami` → chair). The boundary is therefore absent, and `isolation.off` is now an **error** the heartbeat turns into an incident (`tsk_01M5M5Y37RB8Q5ZS7N7A8B7B32`, open). The installed tick unit names a **scratch** instance (`<a jcode-scratch tmp dir>`, 5 events) and is disabled; what actually writes this instance every ~2 minutes is an **undocumented** heartbeat. A broker unit exists (`~/.config/systemd/user/holon-broker.service`, disabled, inactive, also pointing at the scratch home). Activation order in §5. |

Deploying to an instance: pull, run the tests there, `holon doctor`, re-run any adapter installer
whose inputs changed (AGENTS.md).

## 3. Standing decisions (Chair)

| Date | Decision |
|---|---|
| 2026-10-12 | Org vocabulary is intentional (CEO, heads, employees, hire/fire, reviews); every term binds to a mechanism. No contractor agents. |
| 2026-10-12 | One holarchic work graph (tasks, parent, needs); six roles; `light` profile for small departments; safe-default autonomy. |
| 2026-10-12 | Job and freelance work run only as a temporary pilot department, for testing. Divisions are not canonicalized until the core OS is done. |
| 2026-10-13 | Keep hermes-agent until the ZeroClaw cron migration is done; never modify it on the VPS. Legacy organism migration starts only after the Chair validates Holon. |
| 2026-10-13 | First wave in supervised mode; per-department scope. |
| 2026-10-13 | free-stack is the only model pipeline; Claude Code is deferred. |
| 2026-10-13 | Work locally until robustness is verified; the VPS redeploy waits for the Chair. |
| 2026-10-13 | Notion is the dashboard: SQLite and Notion stay in sync both ways, schema typed (selects, relations), webhooks through a tunnel on the Chair's domain, with the edited-since poll as the fallback. |
| 2026-10-13 | The workstation instance runs the Notion sync and tunnel; the heartbeat stays off until the Chair turns it on. |
| 2026-10-13 | Trust boundary (G1): separate Unix users and a kernel broker, not per-harness filesystem confinement. |
| 2026-10-13 | Lanes (G3): script, then a fast single session, then the full pipeline, cheapest first and enforced at intake by a classifier; each operation has a rubric, and its last verified run is its gold standard. |
| 2026-10-14 | Operation architecture approved. Fast and full lanes are coupled to playbooks that refine their protocol and rubric after verification; objectives decompose into pools of work and operations that review themselves; smoke checks gate departments as in the legacy organism. |
| 2026-10-14 | Clef (`api.experientiallabs.ai/v1/systemone`) is a decision-model endpoint; it answers in ~274 s, so it is the patient fallback (rubric judging), not the first endpoint. Key rotation deferred: trusted environment. |
| 2026-10-13 | Decision models (classifiers) run on OpenRouter's decisions endpoint (`[classifier]`), outside free-stack; free-stack stays the only pipeline for generative models. |
| 2026-10-27 | **One repo. The two-repo split is folded in and holon-personal is deprecated.** Today's ruling supersedes the 2026-10-26 row above, whose three reasons each failed measurement: the 60 MB fits easily; the "3 live sessions rooted in the overlay" are three agent sessions, not uncommitted work (the overlay's last commit landed before this migration and its tree is clean); and `sync-public.sh` is **archived, not needed** — it moved work between two trees that now agree by construction, and its last run passed its own check, so no work is stranded by retiring it. Measured mechanically, not by reading: `personal` held **71 files this repo lacked and 0 the reverse** (a strict superset, so the fold-in is a one-way content import: no merge, no clobber, and history stays where it is as the rollback — `origin/personal` @ `501d281`). The repo stays **public**, unchanged: `visibility=public, private=False`, and `origin/main`'s history already carried the host paths and the Chair's channel (`c2d4ddc`, `70f55d7`, `d84dc95`), so folding the corpus in leaks nothing new — and `lint.py` disables `scrub.*` on an overlay by design, so the split was never mechanically enforcing anything it claimed. What moves: the corpus (docs/design/**, docs/archive/**, STATUS.md, RECORDS.md, TODO.md, PERSONAL.md as the deprecation record). What stays out: private facts, now cited by role from `$HOLON_HOME/config/operator-context.md` (paths, the Chair's telegram id, the live instance id). Commits: `4c53a96` (docs + pointers), `026d6bc` (the archive INDEX rows the fold-in's own gate demanded), `4b27ce9` (README link — D003 had been hidden by pointer_ignore), `453b9ec` (the corpus). Gates: **843 tests OK, 10 skipped; `lint --strict` 0 errors, 0 scrub findings; docs-check ok on all four checks.** The overlay checkout keeps existing full as the rollback; it is deprecated at the architecture level, not deleted. |

## 4. Rules for anyone working on Holon

- Never print, log or commit a secret. Read keys from files into the environment or a 0600 file.
  No agent ever gets the Chair key.
- Never delete data that cannot be regenerated or is not backed up.
- Pilot tasks never send outreach, applications or email.
- Anything outward-facing or hard to reverse (deploys, tunnels, DNS, enabling timers, changes on
  the VPS) needs the Chair's approval first.
- `pgrep -f` / `pkill -f` match the calling shell's own command line; use a bracket pattern
  (`[h]olon …`).
- **Universal work is committed on the public repo first, then synced** — never the other way
  round. On 2026-10-23 the sync reported "universal drift on personal" for four files carrying two
  real kernel defects (29 of 62 corpus protocols importing as live, and a status skip swallowing the
  cadence refusal that was the reason to look at the row). Neither had ever been pushed, so both
  lived only in this overlay. They were cherry-picked into the public repo the same day
  (`70f55d7` then `62d7a1d`, `a2c4ba5` upstreamed); the lesson belongs in the runbook — after
  `scripts/sync-public.sh` reports drift on a **universal** file, check whether that file carries a
  fix the public repo lacks, and upstream it rather than resolving the drift by overwriting it

## 5. Open decisions for the Chair

- Redeploy the VPS with everything since the morning of 2026-10-13.
- Turn on the workstation heartbeat (`holon-tick.timer`).
- Run the one-time isolation setup on the workstation (root creates the agent user and its
  runner unit; `docs/design/2026-10-13-trust-boundary.md` §3). Until then `holon doctor` reports
  `isolation.off`. **As of 2026-10-23 the boundary is an error, not a warning, so the heartbeat
  reaches the Chair about it** — an open incident (`tsk_01M5M5Y37RB8Q5ZS7N7A8B7B32`) names the
  exposure. The red-team audit
  (`docs/design/2026-10-23-isolation-red-team-audit.md`) re-measured the sequence end to end and
  repaired seven kernel defects in it, one of which (the plan proposing a user with no step 1, and
  the plan reading an id from a stray tree) would have made the root command fence a phantom
  instance. The order, now proven on a scratch instance and re-numbered:
  **(1)** remove the stray tree the audit itself created (re-measured 2026-10-24: three
  directories under `~/holon/execution/runtime/` — `execution/runtime/`, `capabilities/` with a
  second empty `memory.db`, and `config/drivers/` — created because a probe constructed a
  `Kernel` at the wrong home. They are all under `…/execution/runtime/` and none exists at the
  real home, so the live instance's own `capabilities/`, `config/` and `execution/runtime/` are
  untouched), then
  `holon isolation plan --write /tmp/holon-isolation.sh` — it proposes
  `holon-agent-01m4sf0wr27mgs9e1327aqxp1z` when `HOLON_HOME` resolves to the real instance;
  **(2)** `sudo sh /tmp/holon-isolation.sh` (root: the user and the runner unit);
  **(2.5)** write the `[isolation]` block the plan prints into `$HOLON_HOME/holon.toml`;
  **(3)** `holon isolation apply` `--force` (29 setfacl commands); **(4)**
  `python3 install.py --systemd` (the tick and broker units, which nothing wrote before);
  **(5)** `holon doctor`. Separately: the tick unit still names a scratch home
  (`<a jcode-scratch tmp dir>`) rather than the live instance, and an undocumented
  heartbeat is what writes the real one — repoint it or the "off" heartbeat stays on.
- Decision-model quota: OpenRouter's free tier allows 50 decisions a day (1000 after a one-time
  10-credit top-up); the Cline API cannot serve these models.
- Agent model throughput: on free-stack a refinement planner's model call took 878 s (16.8k tokens out) and a
  plan run hit the 60-minute driver timeout twice. Loops that rewrite playbooks need a faster model for
  plan and execute stages (`docs/design/2026-10-14-playbooks-objectives-smoke.md` §4).
- Holon on Operant: the boundary (`docs/design/2026-10-14-holon-operant-boundary.md`), the phase
  order (Operant `docs/agentic-os/IMPLEMENTATION-PLAN.md`, phases A–I), and Operant's global
  `unattended_posture` (now `yolo`).
- Which venture moves first: **proposed — career-pipeline**, now inside the 2026-10-16
  re-architecture (`docs/design/2026-10-16-ventures-re-architecture.md`): five live venture
  departments over a segregated capability layer; its six decisions (two-hierarchy adoption,
  brand merge, platform-ops, the supersession list, the §8 pilot approval, C-track adoption)
  are the open list — now with a 2026-10-17 execution state appended (the record's §7: red-team
  findings, the Paperclip-era terrain, the critical path). The C-track itself —
  `docs/design/2026-10-16-platform-ops-capability-system.md` — makes platform-ops the
  first-class capability system (surfaces as manifests, the capability block in every brief,
  health probes); C1+C2 is the next kernel package, pre-pilot, **as revised by the red-team
  audit** (`2026-10-16-agentic-os-red-team-audit.md` §5: the browser surface is sourcehound,
  the block renders per posture, `api_pool`; R-01/R-05/R-06 already landed).

## 6. What is next

> **2026-11-03, validation of the post-upgrade plan's nine gaps** — G12 (skills export) is
> live-measured correct: 11 skills export, agent-owned at mode 664, fresh mtime, and a raw
> diff shows only the intended `$holon` → `${HOLON:-holon}` substitution. G11's cause is
> confirmed live and unchanged (`~/.jcode` carries `mask::---`, erasing every traversal
> grant; both probe and doctor name the identical two paths) and its remedy,
> `holon isolation apply` `--force`, is the Chair's to run — a hire into a masked tree spends budget on an
> unreachable harness. G7's real defect was found and closed at the seam that rejects a plan
> (`contract._step_problems`, which nothing called), and a second defect it exposed is now
> fixed: the module carried that rule **twice**, so the later binding won and the earlier one
> was dead text; a green suite could not see it because nothing reads the source for a rule
> declared twice. The lost original is unrecoverable from any git object, and no executor
> reads `depends_on` at all, so the honest fix was deletion over reconstruction. Suite 933
> tests, 3 failures + 17 errors against a baseline of 4 + 18 at `4a7c8dd` — all 18 shared
> failures are pre-existing, my tree adds none and fixes four. Gate: `lint --strict` 0/0.
>
> **G9's count is corrected, and the earlier figure was mine and wrong.** A previous session
> recorded "39 gates across five departments, 26 G3 outside-reach". Re-measured through
> `holon task list --stages --stage approve` and `Work.list`/`Work.counts`: **52 approve-stage
> rows exist, of which 19 done, 7 cancelled and 26 ready** — so the number the kernel reports
> (`ready_stages.approve`, and `awaiting_approval("chair")` = 26) counts only `status='ready'`,
> and counting every stage row is the sampling error that produced 39/52. Those 26 sit in
> **three** departments — career-pipeline 11, freelance-agency 11, architectural-leads 4 — not
> five, all `requested_by: chair`, all `source: kernel`: **25 at grade 3 and 1 at grade 2**, the
> grade-2 exception being `dad-arch-materials-refresh` (the one row the kernel starts on
> approval rather than leaving OFF, which is what §1's 2026-10-24 entries describe). The 13
> non-ready rows are terminal (`done`/`cancelled`) incident work, not unruled gates. G9's real
> requirement — the Chair's approve/reject is surfaced, not assumed — holds: all 26 are
> `awaiting YOUR approval` and the kernel starts none of them.
>
> **Three items re-confirmed rather than assumed.** G10: both `heartbeat.stale` branches in
> `holon/integrity/doctor.py` escalate to `add("error", ...)`, and the threshold guard pair in
> `tests/test_integrity.py` (`a_stamp_younger_than_the_threshold_is_not_stale` and
> `an_unreadable_stamp_is_reported_not_ignored`) passes 10/10 in its class — the clock is
> healthy at the documented cadence, so the plan's "dead 568 minutes" was the sampling error
> of a window shorter than the cadence it judges. E309: `.genome/*` ignored with
> `!.genome/overrides/` negated, and `RECORDS_TPL.md` still tracked because `apply_overrides`
> reads it from the working tree; `tests/test_ad.py` `AdIndex` 8/8 holds both halves by name.
> G13: `holon audit walk` on the live instance reports 3559 events, one break at seq 1815
> (`re-linked`), three skipped rows (1812-1814), last verifying event 3559 — a concurrency
> fork where both branches claim 1811 as parent, not tampering. G14: no holon smoke gate
> asserts the organism tree's state, and `test_the_boundary_lint_pack_catches_a_conflated_doc`
> passes, so stack A's gates cannot silently report stack B.
>
> **Three of those "mutation-verified" claims did not survive a second mutation round, and all
> three were closed on 2026-11-04.** The discipline that found them: mutate the RULE the
> guard reads, not the assertion inside it, and treat a mutation that passes as a hole until
> proven otherwise. **(1) E309:** the exemption was asserted on the TRACKED
> `RECORDS_TPL.md`, and `check-ignore` answers "not ignored" for a tracked path whatever
> the rules say — so that assertion could never fail, and with the exemption commented out
> entirely it stayed green while a fresh clone LOST the override, which is the exact failure
> the row exists to prevent. It now seeds the file into a scratch repo as an untracked path
> and asks git there; both mutations (commenting it out, and replacing the negation with a
> positive ignoring rule) now fail with `AssertionError: 0 != 1`. **(2) G11:** the ACL-mask
> guard asserted `assertFalse(erased.endswith("x"))`, and a mask-erased entry ends in
> `#effective:---`, which also fails to end with "x" — so rewriting `effective_bits` to
> return the raw entry and ignore the mask left the guard green. It now asserts the bits
> POSIX computed (`"---"`) and fails with `'--x\t#effective:---' != '---'`. **(3) G10:** the
> stale branch asserted only that the CHECK was reported, never its severity, so downgrading
> it from `error` to `warning` left all ten tests in its class green; it now asserts
> `["error"]`. The rule for the next round: **a green guard is evidence of nothing until
> something has been broken in front of it**, and the thing to break is what the guard reads.

> **The execution order is `my-projects/docs/plans/2026-10-20-the-bridge.md`** (the
> federation repo) — one plan for the whole A-side program: R the codebase repairs → M
> the migration mechanism (import fidelity, G4 intake, G12 export/import, the venture
> builder) → the Chair-gated pilot → the waves, every row gated. **Nothing in R or M1–M4
> waits on a ruling.** This section is left as written below, because it says what was
> true when it was written.

The ranked list is `docs/design/2026-10-13-paperclip-contrast.md` §4. G3 is built (lanes, operations,
rubrics, decision models: `2026-10-13-lanes-and-decision-models.md`) and so is G1 (the agent user,
runner and broker: `2026-10-13-trust-boundary.md`; its root setup waits for the Chair). In order:
intake keys (G4), department secrets (G8), the Notion mirror
window (G2), then one venture as a pilot department of operations. The full migration plan — ten
ventures, 61 cron jobs, readiness and waves — is `docs/design/2026-10-14-ventures-migration-plan.md`;
the terrain survey and the implementation-gap investigation plan that supersedes its §2 gap table
(is it waves 1–3 actually need G8 secrets, delivery routing, import fidelity, the pilot guard)
is `docs/design/2026-10-15-ventures-gap-investigation.md`.

**The consolidated register of everything still open** — both repositories, the bylaws track,
the ventures gates, the C-track, the owner steps, and the shortest critical path to a supervised
org — is `TODO.md` (one row per item, updated in place). The register that stood here from
2026-10-15 to 2026-10-20 is `docs/archive/2026-10-16-remaining-implementation-gaps.md`; it was
superseded by `docs/design/2026-10-20-the-a-side-program-boundary-and-solutions.md`, which
separates this program's own gaps from the other program's. The **subsystem
question** — the cortex/foundations audit (47 bylaws units, the AD-060/061 law) and the bylaws
upgrade (U1 manifests, U2 pooling, U3 derived registry, U5 port rule — U1–U3 landed in
`8693854`) — is `docs/design/2026-10-15-cortex-foundations-audit.md`; it supersedes the
ventures record §5's "task classes" mapping for foundation-type sub-systems. The
**architecture pair** — the ventures hierarchy over the segregated capability layer — is
`2026-10-16-ventures-re-architecture.md` (the ventures half) and
`2026-10-16-platform-ops-capability-system.md` (the capability half; the C-track). All four
await the Chair.

**2026-10-23, the identity unit is drafted and the store is fit to carry it.** The bylaws layer is
what a migration of WHO Ishan is should use, and the design plus the validated manifest is
`docs/design/2026-10-23-identity-unit-and-migration.md`: a `service`-category unit whose two
services are both `effect = "read"`, and whose write verbs are deliberately *not*
offered as routes: the migration grants reads, not the pen (BYLAWS §14, enforced in
`execution/service.py:1945`). It waits on the Chair's promotion the same as the four above,
and what was fixed to make it fit is the store's own surface, not Holon's: `identity overview`
crashed reading a retired `values.md` while the pool's gate passed, the four repo-count families now
have a freshness ladder, and both venture fit-specs finally read the `source_of_truth.profile` they
have always declared. **Nothing here changes the B-side store's ownership**, which remains the
organism's until a Tier D/E ruling.

**2026-10-24, the identity unit is red-teamed for autonomous use, and the write-back half is not
built.** `docs/design/2026-10-24-identity-operationalizability-redteam.md` reads the capability for
one question: can an autonomous agent in a venture department consume WHO Ishan is, and can what it
learns flow back. The structural half passes — a pooled unit's roots join `read_roots` and never the
writable `roots` (`bylaws/units.py:1945`), the classification becomes real POSIX ACLs
(`execution/isolation.py:352-379,419`), `execution/isolation.py` has **no** reference to grade or
authority anywhere so no autonomy widening can ever make a pooled root writable, and a rogue write is
floored at G3 by `execution/grading.py:62` and caught again by the mutation-verified guard
`tests/test_isolation_redteam.py:273`. What fails is the loop the mandate asks for: the sanctioned
channel `msg request --service identity:identity` resolves to `LookupError: no department
identity-core` because there is no such department; the declared `command = "identity"` is a bare
name the isolated runner's PATH does not contain (`execution/isolation.py:472`), so the route an
agent is offered cannot execute; and the store's `identity` CLI has **no principal check at all**, so
`propose` then `validate` are reachable by the same actor and an agent can ratify its own change.
The health-gate that would have caught the second one automatically exists and works —
`integrity/doctor.py:164-178`, C3 — but is gated to `category = "surface"` (`:170`), and identity
was declared `category = "service"`, so it is skipped; proven with a control clone that differed
only in that field. All five findings are small fixes; the receiving end and a trusted reviewer are
what the loop is missing.

**2026-10-26, the staffing gates audited against themselves: two blind spots, both confirmed by
reproduction.** `docs/design/2026-10-26-the-gates-own-blind-spots.md` walks the 2026-10-25
operationalization work with the standard that work was held to — measure, don't read. Two
defects in the gates themselves: **G1**, the shared refusal message names
`holon hr hire --slot maker`, and `maker` exists only in the `light` profile — the live
**Executive Office** is on the `executive` profile (`ceo`/`strategy`/`audit`/`charter`), so the
gate refuses a schedule and then names a hire command that refuses too (reproduced: `OrgError
… has no slot 'maker'`); **G2**, doctor's staffing backstop filters `kind='recurring'`, and no
check anywhere reads a **wake** schedule — the live instance has **7 active employees and 0 wake
schedules**, so nobody can be dispatched by a clock and no surface says so. Four further
candidates were measured and **dismissed** (lane drift after an enable, a `scrub.path` false
positive on git internals, `LANE_STAGES` omitting `approve`, and the `.git` walk), and the
record says so rather than claiming them. Both rows are one-file changes with a guard that
**runs** the command it names. The Chair's own items are named and not waited on: the **history
squash** for the phantom paths the 2026-10-25 fix removed from the trees but not from the
public history, and the **wake schedules themselves** (the 2026-10-25 outline's row B1).

**2026-10-24, the scoping answer on those five findings: three are capability-layer gaps, two are
ours.** `docs/design/2026-10-24-identity-operationalizability-redteam.md` classifies each by
whether it reproduces for any unit or only for identity. R5 (`effect` never constrains the command;
`capabilities/context.py:312` is its only behavioral reader), R4 (no `reads` fingerprint exists
anywhere, and `execution/work.py:486` fails open for any plan whose declared inputs are reads) and
the reach half of R2 (`execution/isolation.py:362-377` grants binary directories for
`drivers.available()` only; `bylaws/units.py:validate()` never checks a command resolves) are
**capability-architecture gaps**: any unit declared the documented way ships with them. R3 (no
identity-core department) and R1 (identity's CLI has no principal, so propose→validate is
self-ratification) are **ours**, though R1's shape is architectural by design — C5 says "discovery
is entitlement … no new kernel enforcement surface is built", the kernel only ever renders a unit's
command as text (`capabilities/context.py:320`), and the broker routes `holon` commands only, so a
unit's own CLI is *expected* to carry its own gate. The next iteration is therefore not
identity-shaped: hardening the capability layer (command resolvability, health for every category,
reads fingerprints) earns the whole venture fleet, not one pool.

**2026-10-19, the legacy kb tooling is retired.** The pre-genome `kb.toml` and
`scripts/kb` are gone from both this overlay and the universal repo: the role→path
map lives in `genome.toml` alone, and every command the old `kb` CLI offered
(`status`, `claim-register`, `ad`, `rg`, `wf`, `claim`, `done`, `post`, `feed`,
`doctor`, `handoff`, `lint`, `plan`, `audit`, `archive`, `log`) is now
`scripts/genome`. The `2026-10-17` entry below records what the KB wave shipped
at `411679d`; that entry is left as written, because it says what was true then.

**2026-10-17 (later), the v4 capability package + the KB wave landed.** The pre-pilot kernel
package is in the universal repo and pushed: `4208c29` capability surfaces v4 (C1–C3 — unit
`owner`, per-service `effect`/`note`/`args`/`output`/`health`, the per-posture Capabilities
block with prefer-notes and `(down)` marks, `doctor surface.down`, the `api_pool` view,
`pack_api` v4; the api_version is now 4), `3bf99f3` its BYLAWS §14/CONTRACT §9 docs, `6ffe78b`
the api_memory drift-repair guard, `411679d` the KB wave (KB-1 recall floor + gaps lead,
KB-2 `memory episodes`, KB-3 the fence carries playbook/events/skill path, KB-4 the DRIFT lint
pack, KB-5 source weight in search, KB-6 the promote edge) with the register (`TODO.md`),
the kb tooling (`scripts/kb`, `kb.toml`), and the KB architecture audit, `d55b591` the
PROTECTED_TITLES exemption (the floor never sacrifices steering), `ab3792b` KB-8 (per-run
body memory — `OPERANT_MEMORY_DIR = {run_memory}`, one memory-wire bank per run). Gates at the
tip: **350 tests, `lint --strict` 0/0**. The B-side KB work sits in the overlay's two new
records (`kb-implementation-ontology`, `kb-integration-design`) and the organism capability
audit. The instance (`~/holon`) still runs the pre-v4 launcher state until the next
pull+restart; the Chair's R-0..R-6 KB rulings and D1/D5 remain open.

**2026-10-17, capability audit executed + ventures red-team.** The capability-layer audit's
§1 defects are executed and red-team-verified at `bee3bbb` (339 tests, `lint --strict` 0/0):
pooled roots read-only end to end (R-06), the pooled render at plan/research/shape (R-01),
pooled binaries in whichever fence exists (R-05 + the act_commands residual), per-run
department skills (R-09); its §2 design items wait on the Chair (C1/C2 revised, R-04, R-13,
R-14, R-16, N-1). The ventures re-architecture is red-teamed (its §7): all six decisions
stay open, and §1's terrain is superseded by the **Paperclip era** — hermes-cron is dead
(2026-10-16), Paperclip is the only scheduler (68 venture operations, 34 live), so the import's
live-set source is the Paperclip registry, the decommission rule disables Paperclip operations,
and the cutover runs one scheduler per pool. The workstation instance is re-measured
**current** (14/14 migrations, api_version 3, org mode on) — this supersedes every pre-wave
line in this file. Standing ops debt: the local model-gateway smoke fails (free-stack down on
the workstation) and 5 incident `plan` tasks sit unstaffed in `executive` (the Chair's
department; zero employees — three are stale hermes-era failures, one is the gateway, one
the unstaffed report itself). The internal systems, probed live the same day: platform-ops
exists as **machinery** (org-wide + per-dept smoke, doctor, the incident loop, notify, one
live test operation) with **no owning department** — `tools` is the e2e validation org, not
ops; the knowledge base is the atomic `memory.db` (76 items, live) plus versioned playbooks —
the document/collection layer (K-KB, R-14) is not built. See the ventures record's §7.5.

**2026-10-16, verification and execution** (`docs/design/2026-10-16-red-team-verification.md`):
the red-team pass re-verified every landed wave against its acceptance criteria — H-03's back
half was missing (refused executes could close unverified through sampling/skip/judge paths)
and the test process leaked Chair keys into the operator's real key dir; both fixed with
guards in `e8a2021`. The execution pass closed the ready kernel gaps in `0106308`: **K-2**
(a guard names a Chair-authored `[checks.class]` entry — the heartbeat never runs an
employee's shell), the **retention nudge** (gc:last_run + doctor `retention.overdue`), and
**G8 department secrets** (`[secrets.dept.<slug>]` 0600 key-file refs → execute env at claim;
unreadable = clean refusal; lint `secrets.plaintext`; observe stages carry none). 333 tests,
lint 0/0. The four security gaps of the 2026-10-15 audit are closed and verified; the
workstation **instance** still runs pre-wave code (the sync moved the checkout, not the
instance — `install.py --home ~/holon --bin-dir ~/.local/bin` migrates it; outward-facing,
waits for the Chair; this supersedes the "instance is migrated" line above, which described
the 10-14 state).

The Operant integration is executing (its `docs/agentic-os/IMPLEMENTATION-PLAN.md`, phases A–I;
owner order "full-scale execution"). Holon-side: phase A (H1 adapter) and phase B (H2 read API)
landed; phase C (H3+H5: policy.json, refusals, budgets) landed; phase D's Holon package (H4:
trajectory gold standard, result.usage) landed 2026-10-15; phase E's (H6: the supervisor
protocol — `dispatch --prepare`, `run finish`) and phase F's (H7 event triggers + api_version 2;
H8 `[chair] channels` + per-event Notion `apply`) landed 2026-10-15; phase G's (H9:
`adapters/operant/import-cast.py`) landed 2026-10-15; phase H's (H10: builds recorded per run,
judgments grouped by build, regression → incident work) landed 2026-10-15. **Every Holon-side
package H1–H10 is in.** What remains is operant-side (D trajectory writer + usage; E supervisor
conformance; F gateway chair channel + event firing; G archive org stores, RETIRE org modules,
disable the cast crons once their operations are approved; G+1 delete the retired modules) — in
its repository, under its iteration protocol. The workstation instance is migrated and runs
this HEAD (Notion sync restarted on it); the VPS redeploy still waits for the Chair, as does
the workstation heartbeat.

**Audit, 2026-10-15** (`docs/design/2026-10-15-integration-install-kernel-audit.md`; operant's
half is `docs/agentic-os/AUDIT-2026-10-15.md` there). The packages above are landed as code, but
the integration is **inert in a real run**:
- operant reads `HOLON_RUN_DIR`, and the kernel exports `HOLON_BRIEF_DIR`, so there is no
  enforcement, trajectory or usage;
- the native tools are unregistered and partly broken;
- the Chair channel and event intake are not wired.

Four security gaps must close before org mode is turned on anywhere:
- the supervisor passes its environment to bodies;
- the Notion token can be rotated on a public path;
- `@file` expansion of relayed text;
- mutating HTTP in the observe posture.

What is next is the audit's §5 wave order. Waves 1 (engage) and 2 (safety) come first, each
with one test that crosses the Holon/operant seam with real artifacts. "Landed" in this file
now means "landed and exercised on <instance>" unless it says otherwise.

**Audit waves, executed 2026-10-15** (Holon side; the record's §6 outline):
- **wave 0** — `holon-personal` synced to public HEAD and the gates run on it.
- **wave 1 Engage** (`91ab713`): `HOLON_RUN_DIR` exported beside its alias; the operant
driver's `HERMES_HOME` templated; a database newer than the code refuses to open. AGENTS.md
gained the seam law and three ledger rows.
- **wave 2 Safety** (`8eff8b7`): relayed text is literal (`--payload-file`, `--literal`) and
event payloads render as external data; `apply` refuses token rotation off the secret path;
`policy.json` is 0640 so enforcement can fail closed; `--prepare` refuses a supervisor that
will not run the body as the agent user; skips exit 3.
- **wave 3 Enforce** (`011efbe`): refusals are blockers before the judge; usage recorded for
every stage (execute before its judge), `usage.json` wins, driver `build_cmd` is the fallback.
- **wave 4 Resident** (`8b647ab`): `holon adapter test --supervisor '<cmd>'` — the supervisor
conformance suite (prepare/env/finish/lease/timeout) with a reference supervisor; operant's
W4 acceptance runs it with its own supervisor. Owner gate after W4: archive the org stores,
set `[holon]`, run one operation supervised.
- **wave 7 One org** (`09b8ca2`): the cast import checks departments, `--dept-map`, `--stagger`,
cadence warnings.
- **wave 8 Hardening** (`1ddf4fe`): CONTRACT renumbered 1-13; `[retention]` + `holon gc`
(backup-first, gold/judged files kept) + `holon keys list --orphans`; installer launcher
ownership (`--repoint`) + PATH-aware `--bin-dir` + `--no-notion` + `settings.code_root`/doctor
drift; the 60s-vs-60s result-poll knife-edge fixed to 15s.
- **wave 5 Channel** (notify-through-runtime) is deferred behind operant W5 residency;
**wave 6 Capture** is operant-only; **`--runtime operant`** waits for operant's `[holon]`
section to land in its W-packages.
- The **bylaws track and the gateless kernel items are landed** (2026-10-15, after the waves):
  K-2 the incident→guard loop (`920213b`); the bylaws layer U1+U2+U3 with K-4/K-5 — units
  declared in manifests, pooled into briefs and reach, consumed through typed requests, read
  API v3 (`8693854`); and the pilot safety I1+I5 — imported outside-reach operations land
  disabled, and `[pilot]` departments floor outside-reach at the Chair (`234d6b6`).
  319 tests, lint --strict clean. The pilot approval now only gates the pilot itself: its
  first real bylaws manifests (the foundations career-pipeline pools) can be authored when it
  starts.

The workstation instance still runs the pre-wave code (the wave-0 sync moved the checkout,
not the instance: `install.py --home ~/holon --bin-dir ~/.local/bin` + unit restart migrates
it — outward-facing, so it waits for the Chair). Org mode stays off until operant's W1/W2
halves land and the four security gaps close on both sides.

## 7. Reading order for a new agent

0. `docs/design/README.md` — how the design corpus works: the frontmatter status vocabulary
   (`proposed → accepted → executing → built/executed`, `register`, `superseded`, `living`)
   and where each kind of document lives. Every record's frontmatter says what it is before
   you open it.
1. `docs/INTENT.md`: what Holon is and the laws.
2. This file.
3. `AGENTS.md`: the code map, the laws lint enforces, the regression ledger.
4. `docs/BYLAWS.md` (departments, roles, configuration) and `docs/CONTRACT.md` (the harness
   contract).
5. `docs/design/` newest first: `2026-10-18-remaining-gaps-handoff.md` (**the fresh-agent
   handoff — start here when taking over**: current state, the one unblocked build item, the
   Chair-gated items, the ops queue, the hazards),
   `2026-10-17-ventures-import-ontology.md` (the implementation
   outline for the port: the entity tree, the organism→Holon mapping, the cutover state machine,
   the build order — waits on the eleven decisions),
   `2026-10-16-ventures-re-architecture.md` (with its 2026-10-17
   §7 execution state) and `2026-10-16-platform-ops-capability-system.md` (the architecture pair:
   ventures over a segregated capability layer), `2026-10-16-agentic-os-red-team-audit.md` and
   `2026-10-16-capability-layer-audit.md` (the red-team audit and its executed work list),
   `docs/archive/2026-10-16-remaining-implementation-gaps.md` (the register, archived),
   `2026-10-16-red-team-verification.md`, `2026-10-15-integration-install-kernel-audit.md` (what is
   actually working, and the wave order), `2026-10-15-cortex-foundations-audit.md`,
   `2026-10-15-ventures-gap-investigation.md`, `2026-10-14-holon-operant-boundary.md`, `2026-10-14-operant-integration.md`, `2026-10-14-playbooks-objectives-smoke.md`, `2026-10-13-trust-boundary.md`, `2026-10-13-lanes-and-decision-models.md`, `2026-10-13-paperclip-contrast.md`, then
   `2026-10-13-system-red-team.md`; older records explain why things are the way they are.
6. The README of the adapter you touch (`adapters/<name>/README.md`), which records what the real
   harness does.
