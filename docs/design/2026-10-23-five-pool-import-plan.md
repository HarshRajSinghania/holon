# Import plan — the five pools the Chair named

**Prepared 2026-10-23T22:36Z, read-only, nothing applied.** Every number below was
measured at HEAD `cf0ff9c` against the live corpus, on scratch `--home`s with no
`--apply`. This document is the terrain and the gate. It is not an execution log.

Named by the Chair: `architectural-leads`, `career-pipeline`, `community-loo`,
`credibility-funnel`, `freelance-agency`.

---

## 1. The terrain, measured

Five pools, 48 protocol files, 34 of them skipped by the importer, and the 13 that
would survive are not the 13 that matter.

| Pool | Protocols | Skipped | Would create | Routines already live in the registry | Live work an apply would drop |
|---|---|---|---|---|---|
| architectural-leads | 10 | 9 | **1** | 4 | **4** |
| career-pipeline | 15 | 7 | **8** | 4 | **4** |
| community-loo | 2 | 2 | **0** | 0 | 0 |
| credibility-funnel | 6 | 6 | **0** | 2 | **2** |
| freelance-agency | 15 | 10 | **5** | 4 | **4** |
| **total** | **48** | **34** | **14** | **13 distinct** | **14 rows (13 distinct)** |

Two of the five pools (`community-loo`, `credibility-funnel`) would create **nothing
at all**. Both cadences that refuse (`LoO Events Notifier`, `Q'uo Community Pulse`,
both 12-or-more firings a day with no decision model) are in `community-loo`.

## 2. The finding that decides the order

**The importer's skip rule and the live registry disagree, and in the direction the
plan predicted: 13 routines that are `active` on the live instance would be silently
dropped, and the 14 routines an apply would create are 13 retired corpses plus one
documentation heading.**

### 2a. The 13 that would be lost

Each of these declares `status: paused` or `superseded` in its corpus file, so the
importer skips it — while the live Task-Grid registry runs it as **active**:

| Pool | Routine | Registry | Corpus says |
|---|---|---|---|
| architectural-leads | `dad-arch-builder-intel` | active | superseded |
| architectural-leads | `dad-arch-materials-refresh` | active | paused |
| architectural-leads | `dad-arch-rd-daily` | active | superseded |
| architectural-leads | `dad-arch-strategist-daily` | active | superseded |
| career-pipeline | `company-kb-dossier` | active | paused |
| career-pipeline | `company-kb-growth` | active | paused |
| career-pipeline | `company-kb-regrade` | active | paused |
| career-pipeline | `inbox-scanner-daily` | active | superseded |
| credibility-funnel | `drift-watchdog-weekly` | active | paused |
| credibility-funnel | `state-repair-daily` | active | paused |
| freelance-agency | `reddit-hiring-lane-tier1-daily` | active | paused |
| freelance-agency | `reddit-hiring-lane-tier2-weekly` | active | paused |
| freelance-agency | `reddit-karma-lane-weekly-hod-audit` | active | paused |

**Correction on the count, recorded rather than silently changed:** the first draft
of this table said "13" in both totals and described it as 12 distinct. Measured, it
is **14 rows covering 13 distinct routines**: `inbox-scanner-daily` is declared by
**two** of the five pools (`career-pipeline` and `freelance-agency`), as `superseded`
in both, and is `active` in the registry — so the same live job is at risk twice,
once per pool. The 14-row figure is what an apply must protect; the 13-distinct
figure is how many live jobs are at stake. The first draft came from summing the
per-pool rows without noticing a name appearing under two pools, which is the same
headline-versus-columns error this survey has now corrected three times (§2.3's 26,
§4's 21, §7.5's ratio claim).

This is §2.1 direction A, and it is the whole of it. **Re-derived corpus-wide on the
same registry snapshot, direction A is exactly 14 rows — and all 14 of them are
inside the five pools the Chair named; none sits anywhere else in the corpus.** The
14 the plan counted in aggregate are not spread across the 62 protocols: they are
precisely the set this import would drop. That is why the aggregate number felt
survivable ("14 of 62") and the per-pool number is not.

### 2b. The 14 that would be created

| Pool | Routine | Cron | Registry says |
|---|---|---|---|
| architectural-leads | **`EXECUTION-SURFACE`** | *(none)* | — |
| career-pipeline | `daily-apply-digest` | `0 11 * * *` | **active** ✓ |
| career-pipeline | `job-loop-p1-discover` … `p8-recovery` (7) | `*/4`, daily, weekly | **all paused** |
| freelance-agency | `freelance-loop-p1-discover`, `p2-score`, `p6-convert`, `p7-compound`, `p8-recovery` (5) | `*/6`, weekly | **all paused** |

Two separate defects, both measured:

**`EXECUTION-SURFACE` is not a routine.** It is a documentation file with no
`status:` field, so it does not parse as paused and the importer treats it as live
work. It would be created as a routine with **no cron, no command and no skills**,
and its `intent` is a markdown heading: *"# Execution surface: paperclip routines
(2026-10-16)"*. The live work it describes **already moved** — its own text says
execution moved from legacy hermes-agent crons to the Paperclip routine registry.
Importing it would schedule a body against a stub.

**The 12 `*-loop-p*` routines are the retired generation.** They are `paused` in the
live registry under exactly these names, because §2.3 measured that `talent-*` and
`freelance-*` are renames **the registry itself records as supersessions**. Applying
an import of `career-pipeline` or `freelance-agency` would create 12 paused twins of
routines that already exist in their renamed form, and would **not** create the
`talent-*` / `freelance-*` names that are actually live.

**So an apply of all five would net: drop 13 live routines, add 12 dead twins, add 1
documentation stub, and add 1 routine (`daily-apply-digest`) that is already live.**
The one correct outcome in the whole set is a duplicate of something that exists.

## 3. What the destination looks like

- **The local instance is empty, and is not the destination for this work.**
  `~/.local/state/holon` has one department (`executive`), **0 tasks**, **0
  schedules** and **0 routines**. The live work the registry describes runs on the
  VPS.
- The registry snapshot every number above is measured against is
  `~/organism/organism/swarm/task-grid/data/routine-logs/routine-latest.json`, a
  committed file last written **2026-10-21** and synced from the VPS. It is the best
  available evidence of live state; it is **four days stale** and must be refreshed
  before any apply, because "which of these 13 are really live" is the entire
  question.
- No migration table is behind: 18 applied, all current.

## 4. The gate: what must be ruled before an apply

Three things, in order. None is code.

**G1 — Phase 0, still unanswered.** The plan names the department-shape ruling as
blocking Phase 1 onwards, and these five pools span all three charter clusters
(Acquisition: career-pipeline, freelance-agency; Acquisition: architectural-leads;
Content surfaces: community-loo, credibility-funnel). `--dept` is **not** a cosmetic
argument: it creates a department permanently, the apply **refuses to replace an
existing one**, and each import also writes `[scope.dept.<dept>]` roots and
`[smoke.dept.<dept>]` checks into the instance's config. Getting the shape wrong is
not undone by a later ruling. §7.5 holds the three options with their measured
costs; the decision is the Chair's.

**G2 — the live-work guard, which does not exist yet and is the single highest-value
piece of code in this migration.** The importer's skip is silent about the registry
because it does not read one. §2.1 answered this as a *shape* question — the corpus is
a separate git repo, so the kernel must not read the registry — and concluded the
reconciliation is a migration-script step. This plan makes that step concrete: a
**dry-run comparator** that, for each pool, prints the set of protocols the importer
would skip *and* the registry's status for each, and refuses to let an apply proceed
while any skipped protocol is `active` in the registry snapshot. That is a small,
testable, read-only piece of work, and until it exists every apply is a coin flip on
13 live routines.

**G3 — the `*-loop-p*` rename direction, which is decided already and must simply be
authorised.** The registry records the supersession. Importing the paused names
creates twins; importing the renamed names is the correct action but requires
corpus edits (or a rename step in the script) because the corpus files still carry the
old `name:` fields.

## 5. Recommended sequence

Not the plan's phase order, because the plan's phase order was written before this
measurement. This order is chosen by *risk per pool*, not by charter size.

**Step 0 — refresh the registry snapshot.** Re-copy `routine-latest.json` from the
VPS and record its `generatedAt`. Every judgement below inherits its staleness.

**Step 1 — `community-loo` (2 protocols, 0 routines, both cadences refusing).** The
safe pilot: nothing to lose, the refusal machinery is the thing under test, and it
exercises the department-creation path with zero routine side effects. Apply only
after G1.

**Step 2 — the live-work comparator (G2).** Tests first. This is the gate every later
apply depends on, and it is worth more than any single import.

**Step 3 — `credibility-funnel` and `architectural-leads`**, both pools where the
apply would create **nothing** (`credibility-funnel`) or **one stub**
(`architectural-leads`). They are the cleanest test of the comparator refusing for the
right reason: the comparator should block `architectural-leads` on 4 live rows and on
the stub, and block `credibility-funnel` on 2 live rows.

**Step 4 — `career-pipeline`, with the comparator green.** 8 routines would import, 7
of them retired twins; the comparator's job is to say so and to name the 4 live ones
that must survive. Expect this to be the pool that proves the comparator works.

**Step 5 — `freelance-agency`,** the same shape as career-pipeline plus a cross-pool
hazard: **`inbox-scanner-daily` is declared by both `career-pipeline` and
`freelance-agency`**, as `superseded` in both, and is `active` in the registry. Today
that collision is **latent** — both are skipped, so neither reaches `add_routine` — but
any future edit that un-pauses either file makes it a duplicate-title failure in the
second pool. It is recorded here so it is not discovered by an apply.

## 6. What this plan does not claim

- **No apply has been performed and none is authorised by this document.** Every
  command shown is a dry run. `--apply` writes a department, `[scope.dept.*]` roots,
  `[smoke.dept.*]` checks and unapproved routines, and refuses to replace a department.
- **The 13 "live" routines are live in a 4-day-old snapshot**, not necessarily live
  now. This is the reason Step 0 precedes everything and is not negotiable.
- **Whether the local empty instance or the VPS is the destination is not settled
  here.** It has to be, before Step 1: an apply into the local instance would create
  a department on a machine that runs no work, and an apply into the VPS needs the
  migration script to run there.
- **The pool ordering here differs from the survey's phase order deliberately**, and
  the reason is measurement rather than preference. The survey's order was sound when
  it was written; it did not know that 13 live routines sat behind the skip.
