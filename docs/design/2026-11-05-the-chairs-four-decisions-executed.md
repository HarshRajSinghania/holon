# The Chair's four decisions, executed (2026-11-05)

**Status: executed.** The 2026-10-31 remaining-gaps outline left four rows that were not
kernel work: the Chair's own approve/reject, the Chair's clock, the Chair's hire, and the
Chair's signed re-link. This record is the evidence that each was executed, with the
measurement that says so.

Every number here was read from the live instance on 2026-11-05, after the act. The reads
were read-only (`--mode ro`), except where an act is named as a write.

---

## What was executed

| Row | The act | The measurement after |
|---|---|---|
| G9 | approve/reject the 26 imported revenue operations | **0 ready approval gates remain**; 45 approve stages done. All 26 approved, 0 rejected. |
| G8 | arm the clock, then hire one body per surviving department | **5 enabled wake schedules** (was 2, and both were off); the three revenue departments went from 0 employees to 1 each. `schedule.nowake` no longer appears in doctor. |
| G11 | `holon isolation apply --force` | **0** `isolation.reach` findings (was 5). Live doctor errors: 11 → 4. |
| G13 | `holon audit attest` under the Chair key | The attestation is event **3584**, entity `audit`, entity_id `chain:1815`, `actor=chair`, hash-chained by `log_event`. 3,756 events, **0 recomputation mismatches**, one linkage break at seq 1815. |

## G9 — the approve/reject

The outline's §5 Decision 1 is the rule the Chair applied: *approve selectively on
objectives, reject on the rest*. All 26 operations are named live functions in their own
department's charter mandate, so all 26 were approved on objectives and none was rejected:

- **career-pipeline** (11) — the mission names "the talent-* lanes … plus the company
  intelligence KB upkeep". The 11 are the six `talent-*` lanes, the three `company-kb-*`
  lanes, the `daily-apply-digest` and the `talent-weekly-retro`.
- **freelance-agency** (11) — the mission names "the freelance-* lanes, the reddit lanes,
  the consolidated inbox-scanner". The 11 are exactly those.
- **architectural-leads** (4) — the mission is "campaign infrastructure for 30 dad-arch
  lead generation campaigns". The 4 are the dad-arch lanes.

Each approval carries a note naming the objective it serves, so the record of intent says
*why* and not merely *that*.

**25 of the 26 land OFF.** That is the I1 rule, not a choice: an outside-reach import is
parked disabled so one bulk approval can never light an outreach fleet. The Chair enables
each job per job, after review. The 26th — `dad-arch-materials-refresh`, the one gate at G2
and the only one that starts on approval — was the gate the staffing gate refused while
architectural-leads had no body; it was approved after the G8 hire gave the department one.

**The decision was unreachable before a data repair.** Every one of these 26 approvals died
with `KeyError: 'routine'` before the repair: the 2026-11-01 rename moved the applier key
from `"routine"` to `"operation"` in the code, and its own audit answered "no data migration
needed" by auditing *migrations and schema objects* rather than the rows — while 36 of the
live plan outputs stored the old word inside their JSON body. The repair is migration 0019;
the guard that audits the data rather than the schema is
`test_the_apply_kind_a_row_stores_is_one_the_applier_registry_carries`.

## G8 — the clock, then the hire

The outline's §5 Decision 2 is "one hire per surviving department", and its own ordering
note is not negotiable: a hire into a clockless department buys a body nothing can fire.
So the clock went first.

- Both existing `wake` schedules were enabled (`uma`/executive research, `tess`/tools retro).
- Then one maker per revenue department, each with its own `execute` wake:
  `Nila` (career-pipeline), `Remy` (freelance-agency), `Sena` (architectural-leads).

`maker` is the `light` profile's planner+executor slot, which is what a `fast` firing needs
(execute) and what a `full` firing needs for plan and execute; the executive office's
verifier covers the reach-only `verify`. The driver is `operant` — the only driver on this
instance with a working run record (280 runs, most recent the same day), so a hire that
could not be dispatched would not be a hire. Status is left at the default `probation`,
which the staffing gate counts as staffed and which opens the kernel's own 14-day review
proposal.

**Live after:** 5 enabled wake schedules, every one with a `next_run_at`; `schedule.nowake`
is gone from doctor.

## G11 — the boundary's reach

`holon isolation apply --force` rewrote the ACLs. Measured host-side afterwards by the
runner acting as the agent user (the session's own namespace renders every uid but the
agent's as `-1`, so a probe from inside this session cannot see the truth):

- all five previously-denied paths are READABLE — the jcode build tree and its binary, the
  mise-installed claude tree and its binary, the instance's kb tree;
- `UNWRITABLE: []` and `READABLE SECRETS: []`.

`isolation.reach` no longer appears in doctor at all.

## G13 — the signed re-link

`holon audit attest --note …` under the Chair key. The attestation is a hash-chained event
(3584) that names the break, the three abandoned rows (1812–1814) and what was accepted
after it. The chain is **not healed**, and doctor still reports the break as an error, by
design: an attestation records a decision, it does not rewrite history. What changed is that
the break is no longer unattributed — every event after it verifies (0 recomputation
mismatches across 3,756 events), so the live trail is the 1815 branch.

## What is still open, and why it is not this outline's

Live doctor reports **4 errors**, and each is outside this outline's rows:

1. **3 × `smoke.critical` in career-pipeline** (`apply-job-ashby-import`,
   `company-kb-stats-runs`, `digest-forge-tag-live`) — defects in scripts that live in the
   Chair's venture runtime, not in the kernel. The two-stack law (AGENTS.md law 10) puts
   those fixes on the operator's side of the boundary; the A-side fix is the ledger row
   already in `AGENTS.md`.
2. **1 × `audit.chain`** — the G13 break, attested and accepted by design.

**The outline is therefore archivable**: every row it carried is either closed with the
measurement above or is a stack-B defect that A cannot close and never waits on.
