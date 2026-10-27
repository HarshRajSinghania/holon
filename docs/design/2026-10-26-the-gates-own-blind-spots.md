---
status: proposed (an audit of the 2026-10-25 operationalization gates, measured 2026-10-26)
date: 2026-10-26
description: "An outline-plan for the two defects the operationalization gates themselves carry, found by auditing the shipped work rather than reading it: the refusal message names a hire command that cannot work in the profile it fires for, and the staffing backstop covers recurring schedules only, so the instance's seven employees who never wake are invisible to every surface. Both are confirmed by reproduction, not by reading; three further candidates were measured and dismissed, and this record says so rather than claiming them."
tags: [outline, plan, gaps, staffing, schedules, remediation, doctor]
related: [the 2026-10-25 remaining-gaps outline, which owns the live instance's operational rows]
---

# 2026-10-26: the gates' own blind spots — an outline-plan for what is left

Status: **proposed outline-plan**. Scope: A only (the Holon kernel). Every finding below was
**measured on 2026-10-26** against the shipped code (the commit the live launcher resolves) and
reproduced on a scratch instance; nothing here is about the other stack.

This record is the audit of the 2026-10-25 operationalization work, run the way that work itself
was run: by measurement, on the shipped code, with the gates' own promises as the test. The
question was narrow — **do the gates I shipped hold under the conditions the live instance will
actually meet?** — and the answer is: mostly yes, with **two defects in the gates themselves**.

## 0. Decisions requested

Two rows, both universal kernel changes, both small, both with a guard that proves them:

1. **G1** — the staffing gate's refusal message must name a hire command that **works** in the
   department's own profile (§2). One file (`holon/execution/schedules.py`), one message.
2. **G2** — doctor must report an active employee that no wake schedule can dispatch (§3). One
   file (`holon/integrity/doctor.py`), one check.

Neither row changes what the organization may do; each changes what a surface **says**. That is
the same standard the 2026-10-25 gates were held to, applied to the gates themselves. The
Chair's own items (C1, C2 in §4) are named and not waited on.

---

## 1. What was audited, and how

The 2026-10-25 work landed seven operationalization gates (F1–F7) plus the repr-leak fix, and
closed with 15 guards, a green suite and a clean strict lint. Those guards prove the gates
behave as **specified**. They cannot prove the gates **specify the right thing**, and that is
the seam this audit walked.

Six candidates were raised. Each was measured, and the record states the verdict for all six —
including the four that did not survive contact with the code.

| # | Candidate | Verdict | How it was settled |
|---|---|---|---|
| 1 | the refusal message names a hire command that may not work | **CONFIRMED** | reproduced below (§2) |
| 2 | the staffing backstop misses wake schedules | **CONFIRMED** | measured below (§3) |
| 3 | an enabled schedule's lane can drift after the gate ran | **dismissed** | a recurring template's plan stage is terminal (`work._set` refuses), and no writer adds a newer output row to it — so `instantiate_recurring` reads the same body the gate read |
| 4 | `scrub.path` walks `.git` and could fire on git internals | **dismissed** | git forbids a ref name starting with `/`, and the rule needs a delimiter before `/home/` — a branch named `fix-/home/x/bug` does not fire; the walk is 3,875 wasted reads, not a false positive |
| 5 | `LANE_STAGES["full"]` omits `approve`, so a full firing is under-gated | **dismissed** | an `approve` stage is claimed by its **named approver**, not by pool reach (`work.claim`'s branch `t.stage='approve' AND t.approver=?`), so it is not a staffing question |
| 6 | the predicate's executive-reach line is a tautology | **CONFIRMED, behavior-neutral; fixed 2026-10-27** | `(dept_id is None or True)` is always true; the branch below it carries the real semantics, so nothing misbehaved. It was removed (the reach is named in a comment above the line) and the gates module re-ran green -- a cleanup, not a repair, and it is recorded here because a tautology in the one shared predicate three consumers trust is where a future edit drifts |

---

## 2. The remediation that cannot work (CONFIRMED)

**The gate.** `schedules.staffing_note` is the single refusal message every consumer shares —
the proposal's grade reasons, the enable gate, the approval transaction, doctor's backstop. It
ends with the act that fixes the problem:

```
(hire: `holon hr hire --dept <slug> --slot maker --driver <driver> …`, or --force for the
Chair's explicit word)
```

**The defect.** `--slot maker` names a slot that exists only in the **light** profile. The
profiles' slots, measured from the distribution:

| Profile | Slots |
|---|---|
| `light` | lead, **maker**, checker |
| `standard` | head, researcher, planner, executor, verifier, steward |
| `executive` | ceo, strategy, audit, charter |

A department's profile is its **charter's bylaws blob**, not a column — measured on the live
instance: `executive` carries `{"name": "executive", …}` (397 bytes) and `tools` carries
`{"name": "light", …}` (373 bytes). Five of the six live departments are `light`, so the
message is right for them. **Executive Office is `executive`, and it has no `maker`.**

**The reproduction** (scratch instance, the executive profile's own charter loaded into a
department):

```
profile: executive slots: ['ceo', 'strategy', 'audit', 'charter']
NOTE: no employee in execdept performs execute, plan, verify: the firing will wait with nobody
      to claim it (hire: `holon hr hire --dept execdept --slot maker --driver <driver> …`, …)
HIRE --slot maker FAILS: OrgError department execdept (profile executive) has no slot 'maker';
      slots: ['ceo', 'strategy', 'audit', 'charter']
```

So the Chair, refusing a schedule because Executive Office cannot run it, is told to run a
command that **refuses**. The gate is right about the problem and wrong about the fix.

**Why it matters more than a wording bug.** This is the same defect class the ledger records
twice already — *"a message that names the fix must name the fix that works"* — and it is worse
here than in the earlier instances, because **this message is the gate's only remediation**: it
is the difference between a Chair who knows what to do and one who meets a second refusal with
no way to guess the next step.

**The fix.** The note must name the hire that would actually cover the missing stage, derived
from the department's own slots. The mapping is not a constant: `make`/`maker` covers execute in
`light`; `executor` covers it in `standard`; **in `executive` no slot covers execute at all**,
and the honest answer there is a **role** (`--roles executor`), not a slot. Three cases, one
rule: *name the act that covers the missing stage, in the department's own vocabulary, and say
so when the profile has no slot for it.*

**The gate (a command, verified against the registry).**

| Row | Fix | Gate |
|---|---|---|
| **G1** | `staffing_note` derives the hire from the department's charter slots/roles and names `--roles executor` when no slot covers the missing stage | `python3 -m unittest tests.test_operational_gates -v` — a guard per profile, asserting the named command **hires successfully** on a scratch instance of that profile (not that the message contains a string) |

**Discipline.** The guard must run the command it names. A guard that asserts the message
mentions `executor` would pass while the command still refused — the exact failure being fixed.
Law 9 (tests first): the guard is written red against the shipped code before the note changes.

**Ledger row.** One row in `AGENTS.md`'s regression ledger, in the same commit as the guard,
naming it. The row states the measured fact (the executive profile has no `maker`) and the
reproduction (the hire's `OrgError`).

---

## 3. The wake hole (CONFIRMED)

**The gate.** `doctor`'s `schedule.unstaffed` check (the backstop that reaches the Chair
whenever an enabled schedule's lane has nobody) reads:

```sql
… WHERE s.kind='recurring' AND s.enabled=1
```

**The defect.** `vocab.SCHEDULE_KINDS = ("wake", "recurring")` — a wake schedule is a first-class
kind, and a wake schedule is **the** mechanism that makes an employee run at all. **No doctor
check in the distribution reads a wake schedule**: the word `wake` appears in no file under
`holon/integrity/`.

**The live instance, measured read-only:**

```
wake schedules: 0
recurring schedules enabled: 1
active employees: 7
```

**Seven active employees and zero wake schedules.** No employee can be dispatched a stage by a
clock, because nothing wakes them. This is the most direct possible instance of the condition
the 2026-10-25 work was commissioned to make visible — *a system that cannot operate, with no
surface naming it* — and the backstop built for exactly that purpose is silent about it, because
it filters on `kind='recurring'`.

Note what the 2026-10-25 audit *did* cover: the *recurring* schedule's lane and its department's
staffing. It never asked whether the employees who would staff that lane **ever wake**. The
gap is one filter wide, and it is the filter that hid the live instance's most basic
non-operating condition.

**The fix.** A doctor check for the wake condition: an active employee with **no enabled wake
schedule** (and no other dispatch path) is an error, because the department cannot act. This is
the same predicate family as `schedule.unstaffed`, and it must land in the same file, sharing
the note helper so the message names the act that fixes it.

**The gate (a command, verified against the registry).**

| Row | Fix | Gate |
|---|---|---|
| **G2** | doctor reports an active employee that no wake schedule can dispatch (error), naming the command that fixes it | `python3 -m unittest tests.test_operational_gates -v` — a guard that hires an employee with no wake schedule and asserts doctor reports it by name, and a guard that a scheduled employee is silent |

**Discipline.** The check must distinguish "no wake schedule" from "a wake schedule that cannot
fire" (a wake schedule whose `stage` is one the employee does not perform is as dead as no
schedule at all), or it will report an instance as staffed that is not. That distinction is the
guard's second half, and it is the part that is easy to get wrong.

**Ledger row.** One row, same commit as the guard: what was found, what the live instance
measures (0 wake, 7 active employees), and the guard's name.

---

## 4. The Chair's items (not mine, and not waited on)

Two things in this audit are the Chair's, and neither blocks G1 or G2.

**C1 — the pushed history still carries the phantom paths.** The 2026-10-25 repr-leak fix removed
the two phantom files from every tracked tree and pushed the removal (public `main`
`fe0e408`). The paths remain in the **history** of `5b5b367`, which is on the public remote:
the file names carry a host's home directory and scratch instance ids, and the file content
names the operator and a per-instance agent user. `PERSONAL.md`'s publish runbook carries the
history-squash recipe. This is a public-repo history rewrite: the Chair's call, on a day of the
Chair's choosing. **Nothing else in the kernel waits on it.**

**C2 — the live instance's zero wake schedules.** G2 makes the condition *visible*. It does not
make the seven employees run: that needs wake schedules, each one a decision about which
employee runs which stage and how often (the 2026-10-25 outline's row B1). G2's job is to make
the Chair's next act obvious, not to make it.

---

## 5. What this record does not claim

- It does not claim the 2026-10-25 gates are wrong. They are right about the condition they
  test, and 15 guards plus a green suite stand behind them. **Two of their messages and one of
  their filters are incomplete**, which is a different statement.
- It does not claim the live instance is broken *because* of these two defects. The live
  instance's zero-wake condition predates this work; what the work changed is that **nothing
  said so**.
- It does not claim a lane can drift after an enable (§1, row 3: checked and dismissed).
- It does not claim `scrub.path` can fire on git internals (§1, row 4: checked and dismissed).
- It does not claim the predicate mis-models the claim's reach (§1, row 5: checked against the
  claim's own SQL, and correct).
- It does not touch the other stack, and it does not report the live instance's other
  operational rows (A1, A2, B1–B3, C1, D1, D2, E1, E2, F1) — those belong to the 2026-10-25
  outline, which still owns them.

---

## 6. The order

```
G1 (the remediation that cannot work)  →  G2 (the wake hole)  →  C1/C2 when the Chair says
```

**Why G1 first.** It is a message, one file, and the fix's shape is already decided by the
profiles on disk. It is also the defect most likely to cost the Chair a step: the gate refuses
correctly and then names a command that refuses.

**Why G2 second.** It needs a decision the 2026-10-25 work did not make — what counts as "a
wake path" beyond a wake schedule (an event-driven routine? a manual dispatch? the script lane,
whose runner is the kernel?). Get that wrong and the check cries wolf on a healthy instance, which
is the failure mode the ledger records most often.

**What is parallel.** C1 (the squash) and C2 (the wake schedules themselves) are the Chair's and
move independently of both rows.

---

## 7. The measure of done

| Row | Done when |
|---|---|
| G1 | a guard **runs** the hire command the note names, on a scratch instance of each profile, and it succeeds; the same guard fails against the shipped note; the ledger row lands in the same commit |
| G2 | doctor names an active employee with no wake path, and stays silent for one that has a live one; both halves guarded; the ledger row lands in the same commit |
| C1 | the public history carries no home path (the Chair's squash) — **not claimed by this record** |
| C2 | the live instance's wake schedules exist and the employees they name are the ones the Chair means (the Chair's act) — **not claimed by this record** |
