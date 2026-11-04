# 2026-10-31: the remaining implementation gaps, after the operations upgrade

**A finding about code that moves is rarely a finding about code.** The plan that was open
(2026-10-30) closed its own G1–G6 rows while it was open; what follows is the re-measurement
after the Chair's three-way upgrade landed (`1ae2037`: routines → operations, the step-kind
vocabulary, the complexity floor). Every row below names its home — the distribution, the live
instance, or the operator's overlay — because a claim about live state measured against a
scratch home is the defect the predecessor's §7.2.1 recorded.

This outline supersedes [2026-10-30's](2026-10-30-remaining-implementation-gaps.md), whose
G1–G6 rows closed while it was open. It is kept in place, not archived: its §1 table is the
measurement the re-audit below is compared against.

## §0. Re-audit, 2026-10-31 — what closed, and what the upgrade opened

**Measured against the live home** (`$HOLON_HOME`, the one both units name), read-only:

| Check | 2026-10-30 | 2026-10-31 | Why |
|---|---|---|---|
| strict lint | 0 errors / 0 warnings | **0 errors / 0 warnings** | the repair migrations held; the schema drift regenerated |
| audit.chain | 1 break at 1815 | 1 break at 1815 (characterized) | the re-link is the Chair's signed act, not the kernel's |
| isolation.reach | 3 paths | **2 paths** | measured below: this is drift, not a gap |
| isolation.runner | connection refused | **gone** | the runner is up |
| smoke.critical | 3 | **3** | stack-B: three `career-pipeline` gates against scripts that live in the organism tree |
| heartbeat.stale | absent | **new, 568 minutes** | the clock organ stopped mid-afternoon; see §2 |
| schedule.nowake | 1 error | 1 error | the Chair's deliberate stop, un-reversed |
| skills.export_stale | 4 files | **10 files** | the rename changed 5 skill files, so the export is one command behind |

**Total: 8 errors, 11 warnings** — the same error count as 2026-10-30 with a different
composition, and every one of them is either the Chair's call or a one-command fix.

**Re-audit, 2026-11-03** (measured read-only against the live home, two days later):

| Check | then | now | Why it moved |
|---|---|---|---|
| heartbeat.stale | **new, 568 min** | **clean** | the clock is alive: two samples 120 s apart (1793718774 → 1793718894), stamp 7 s old at read time, doctor silent. G10 needs no kernel work. §2's *instrument* gap is still the honest finding — `heartbeat.stale` is a warning on the same heartbeat it names — but the dead clock it was written about has recovered. |
| skills.export_stale | **10 files** | **clean** | G12 closed: the export now routes the write through the boundary's runner as the agent user, verified live (11 skills, mode 664, only `$holon` substituted). |
| isolation.reach | 2 paths | **2 paths** | G11 characterized, not closed: the derivation is right, the applied ACL is stale, and `apply --force` is the Chair's to run. The live cause is measured — the harness's own `chmod 700` resets the ACL mask, erasing the grant. |
| strict lint | 0/0 | **0/0** | held. |

One measurement trap recorded, because it flipped twice before settling: a 45-second
observation window **cannot** decide this check. The cadence is two minutes and the threshold
is six, so a sub-cadence sample reads "unchanged" and reports death on a healthy clock. A
sampling window shorter than the cadence it judges is not an instrument for that question.

**G8 and G9 re-measured, 2026-11-03** (read-only, the live home, counted from the DB rather
than from the table above):

| Row | plan said | measured now | What it means |
|---|---|---|---|
| G8 | 7 active employees across 2 departments | **unchanged — and now a dependency, not a hire** | The blocker is not the hire. `schedule.nowake` reports 7 active employees with **no live wake schedule**, and the event trail names the actor: **both `wake` schedules were disabled by the Chair at 2026-10-30T18:48**, with no note. A hire into a clockless department spends the Chair's budget on a body nothing can fire. Arm the clock, then hire. |
| G9 | 37 gates, all `lane=full`, "the Chair's approve/reject" | **re-measured live 2026-11-04 (read-only, counted from the DB): 26 ready `approve` gates, all `lane=full`, all `source=kernel`, 25 at G3 and 1 at G2, across 3 departments — `career-pipeline` 11, `freelance-agency` 11, `architectural-leads` 4 — and all 26 with `approver=chair`. The earlier "39 across five departments" was wrong: the extra 13 are unstaffed research/retro *stages*, not approval gates, and `executive`/`tools` are not among them** | The kernel's `lane="full"` default is **not** the defect: an ungraded task cannot take the fast lane, because `_expand` consults `fast_refusal` and the fast lane is granted against a grade floor the kernel has computed — an incident is filed ungraded by construction, since its grade is what the cause-finding would determine. They are a dependency (a head for `executive`, or grade the intake), not a lane default to change. |

Both rows were re-derived from the live DB, and G9's premise was wrong enough that a fix
written against it had to be **reverted**: the guard written for that fix was a null test,
because with no classifier configured the rule answers `full` and a defaulted filing produces
the same row. The lesson is in the ledger; what stands here is the corrected count.

### The upgrade's own debt, measured before it is claimed as done

The rename and the vocabulary landed. **The vocabulary has no reader.** Measured: `STEP_KINDS`
is defined in `vocab.py` and named nowhere else in the kernel — an operation cannot yet
*declare* steps, so `branch_one` cannot yet spare a body. That is not a defect (the rename is
complete and guarded); it is the next piece of work, and it is §1's G7.

## §1. What is actually left, measured 2026-10-31

| # | Gap | Where it lives | Blocked on |
|---|---|---|---|
| G7 | an operation's `steps` have no writer and no reader | distribution | nothing — this is the upgrade's own tail |
| G8 | the Chair's revenue departments have no employees | live instance | the Chair (a hire, per department) |
| G9 | the three imported departments hold 37 approval gates, all `lane=full` | live instance | the Chair's approve/reject |
| G10 | the heartbeat is dead and nothing said so for 4 hours | live instance | one restart — but see §2, the instrument is the gap |
| G11 | `isolation.reach` names two paths the ACLs do not carry | live instance | one `apply --force` |
| G12 | skills.export_stale, 10 files | live instance | one `skill export` |
| G13 | audit.chain's one break at seq 1815 | live instance | the Chair's signed re-link |
| G14 | the `career-pipeline` smoke gates test scripts in the organism tree | both stacks | law 10 — these are not A's to fix |

## §2. G10 — the heartbeat died, and the instrument only noticed on the next run

**Status today: dead 568 minutes; the stamp is 4 hours stale; the timer is `inactive`.**

The ledger's 2026-10-22 row records that the operant gateway's clock organ runs
`holon tick` every 2 minutes and stamps `.clock/last_tick`, and that doctor reads that stamp.
Measured 2026-10-31 22:30Z: the stamp is from **18:29Z**, the timer is `inactive`, and no user
unit exists. So the clock organ stopped, and `heartbeat.stale` is exactly the right finding.

**The gap this row records is not the dead clock.** It is that a dead clock costs four hours of
silence: `heartbeat.stale` is a doctor *warning*, and doctor runs on the same heartbeat that
stopped. The instrument that names a dead clock is the clock. This is the same structural
shape as the 2026-10-23 row (an absent trust boundary was a warning the heartbeat never
escalated), one layer over: the check is correct, and it cannot run when it is needed.

**What is required, and what is not.** Restarting the clock organ is the operator's, not the
kernel's. What the kernel can do is make the staleness reach a surface that is not the thing
that died — the same way `schedule.nowake` reaches the Chair as an error while no clock fires.
Concretely: a `heartbeat.stale` threshold that is also checked by a path that does not require
the heartbeat (the broker's request loop, or the tick's own `systemd` unit's `OnFailure`), so a
long-dead clock escalates rather than waiting for the next tick that will never come.

**Gate:** the finding appears on a surface within one stale threshold without a tick, and a
restarted clock clears it.

## §3. G11 — `isolation.reach` is drift, and the fix is one command

**Status today: measured, and the plan's own check agrees with the ACLs.**

`reach()` claims both paths (the harness build's version directory and its `jcode` binary
— measured, 19 reads total). So the kernel's derivation is right and the applied ACL is
behind. This is the ledger's 2026-10-31 row exactly: `reach()` is correct, the applied set is
stale, and `holon isolation apply --force` repairs it. Nothing to build; one command, and the
Chair can run it.

## §4. G7 — an operation's steps, the upgrade's own tail

**Status today: the vocabulary exists and has no reader.** `vocab.STEP_KINDS` carries
`script | shell | branch_one | branch_all | sleep | call`; no writer, no reader, no contract
field. An operation is still a single task with prose in `intent`.

**Why this is the highest-value remaining gap, measured.** The Chair's objective is lead
generation on a token budget, and the measurement is unambiguous: an agent run spends ~173K
input tokens, the importable revenue operations declare 37.4 agent fires a day (~13M/day), and
five script-only operations cost nothing. `branch_one` is the construct that closes the gap —
run the free script, wake a body only on the days the script came back empty. Without a writer,
that construct cannot be declared, so the budget the Chair asked for stays a manual discipline
rather than a property of the work.

**What is required, in the smallest piece that works:**

1. A `steps` field in the contract (`core/contract.py`) — a list, each item a `kind` from
   `vocab.STEP_KINDS` plus `depends_on`, `command`, `retry`, `stop_if`.
2. A writer: `holon operation add --steps @file` (or a documented JSON block), validated
   against the vocabulary so a step kind outside it is refused at submit.
3. A reader: the kernel materializes the steps into a task DAG through the existing
   `task_needs`, which already enforces "a node is ready only when everything it needs is done."
   No new ordering engine.
4. The complexity floor then has a live input — it is already written (`grading._complexity_floor`)
   and is silent today because no operation carries steps.

**What is explicitly not in this row.** Loops (`for_loop`, `while_loop`), with the recorded
reason: the DAG and a schedule already repeat work, and a step with no ceiling is the one that
spends. They wait for a measurement from a real run.

**Gate:** an operation with a `script` step and a `branch_one` falling back to an `agent` step
runs the script for free on the days it succeeds, wakes a body only when it does not, and the
grade reflects it — one test crossing the seam with the other side's real artifact, not a stub.

## §5. G8 and G9 — the revenue departments, and the Chair's two decisions

**Status today: 7 active employees across 2 departments; 37 ready approval gates across 3.**

| Department | Employees | Ready work | Ready approve gates |
|---|---|---|---|
| Tools | 4 | 4 | 0 |
| Executive Office | 3 | 7 | 0 |
| **Career Pipeline** | **0** | **11** | **11** |
| **Freelance Agency** | **0** | **11** | **11** |
| **Architectural Leads** | **0** | **4** | **4** |

Nothing is spending budget: the only enabled schedule is `0 6 * * *` recurring (script lane, no
agent), both `*/15` wake schedules remain disabled by the Chair's instruction, and every one of
the 26 gates is `lane=full`, which needs a head or the Chair.

**Decision 1 — G9:** approve selectively on objectives, reject on the rest. Every one of the 26
is `source=kernel` work the kernel itself filed (25 at G3, 1 at G2), so approving them approves
the kernel's own cause-finding, and 25 of 26 are G3 — they land disabled on approval anyway, so
approving buys the record of intent rather than a firing loop. This is the Chair's to make.

**Decision 2 — G8:** one hire per surviving department. The 2026-10-26 lesson applies — the hire
command must name a slot the department's own profile carries, or it refuses. Career Pipeline is
`light`, so `maker` covers planner+executor; the gate that closes the shared-note class is
already in and holds.

**Order:** G9 before G8. Hiring into a department whose objectives are not decided buys a body
with nothing to do.

## §6. G12, G13, G14 — the one-command fixes and the ones that are not A's

| Row | What | Why it is not a kernel gap |
|---|---|---|
| G12 | `holon skill export` again | the rename changed 5 library files; the adapter homes are 10 files behind. One command |
| G13 | the 1815 re-link | the Chair's signed act. The walker works; the break is characterized; the repair is a deliberate edit to the audit trail |
| G14 | three `career-pipeline` smoke gates | their scripts live in the organism tree (`gmail_ops.py`, `apply_job.py`, `forge`) and the agent user is denied there by design. Law 10: these are not A's to fix, and the finding is stack-B noise on A's doctor |

G14 is the row most likely to be mis-read, so it is stated plainly: the three `smoke.critical`
findings are **not** a reason to grant the agent user read reach into the organism tree. That
would weld A to B against law 10. They are the correct consequence of the boundary working.

## §7. Order of work

| Order | Row | Cost | Who |
|---|---|---|---|
| 1 | G12 (skill export) | one command, zero tokens | me |
| 2 | G11 (`apply --force`) | one command, the Chair's | Chair |
| 3 | G10 (restart the clock organ) | one restart | Chair |
| 4 | G9 (the 26 gates) | the Chair's approve/reject | Chair |
| 5 | **G7 (operation steps)** | kernel: contract + writer + reader, tests first | me |
| 6 | G8 (hire per department) | no tokens | me, after G9 |
| 7 | G13 (the re-link) | the Chair's signed act | Chair |

Steps 1–3 are the whole of the live instance's gap list outside the Chair's two decisions. Step
5 is the only kernel work left, and it is the one that turns the Chair's token-budget discipline
into a property of the work.
