---
status: archived (2026-11-05: every row is closed or carried forward — G7 closed by the steps implementation (register H13), the Chair's four items carried by H15–H18, and the Command Center's gap list by H18–H19. The outline's own §7 claim, "what is left is the Chair's four decisions and nothing else", was true only after the steps reader existed; it did not when this was written.)
date: 2026-10-31
description: "The outline of the remaining implementation gaps after the operations upgrade, with its re-audit of 2026-10-31 and 2026-11-03. Archived 2026-11-05: its rows are closed or carried by the register, and the kernel work it prescribed (G7, the operations' steps) was rebuilt in full on 2026-11-05 — the validator had shipped, the reader had not."
tags: [gaps, outline, operations, steps, superseded]
supersedes: [2026-10-30-remaining-implementation-gaps.md]
archived-by: 2026-11-05
---

> **Archived 2026-11-05.** Every row of this outline is closed or carried forward, and the register
> (`TODO.md`) is where the open ones live: **G7** (an operation's steps) by **H13**, closed on
> 2026-11-05 by the implementation that added the writer and the reader this outline's §4 asked for
> — the outline's own §7 marked G7 done on a commit that had wired only the *validator*; the
> **Chair's four items** by **H15–H18**; and the **Command Center's gap list** (the red-team of
> 2026-11-05) by **H18–H19**. Two of its readings were corrected in place by the re-audits it
> carries: the isolation path set GREW from two to four, and G9's gate count is 26, not 37, 39 or 52.
> Do not follow its procedure from this copy; read the register.

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
| G14 | the `career-pipeline` smoke gates run scripts from another stack's tree | A's alarm surface | closed 2026-11-04 — the outline's "not A's to fix" read was wrong; see §6 |

## §2. G10 — the heartbeat died, and the instrument only noticed on the next run

**Status today: HEALTHY, measured 2026-11-04 13:02Z — the plan's own premise is stale.**

Three stamp samples over a window longer than the cadence: 1793797221, then 1793797344, then
1793797344 — 123 seconds between the first two, and the stamp 11 seconds old at read time. The
cadence is 120 seconds by the ledger's own record, so this clock is alive and on cadence. The
`inactive` timer is not the defect: the clock organ is another stack's, and it drives `holon tick`
without the kernel's unit — the arrangement the code's comment already names.

**Why the row is kept rather than deleted.** The premise "dead 568 minutes" is false today, but
the *gap* it recorded is real and is what the row is for: a dead clock costs silence, because
`heartbeat.stale` ran on the same heartbeat that stopped — the instrument that names a dead clock
is the clock. That was closed 2026-11-03 (the staleness now reaches a surface that does not
require the tick: any path that runs doctor, including the broker's request loop and the
heartbeat's own doctor phase, escalates it as an error and opens an incident). The guard holds
both directions of the threshold, so an edit cannot make a live clock read as dead or a dead one
read as alive.

**The sampling lesson this row's first measurement got wrong, recorded because it cost two rounds:**
the first probe sampled the stamp 45 seconds apart, saw no change, and reported DEAD. The cadence
is two minutes and the threshold six, so a sub-cadence window reports death on a live clock
exactly as it reports life on a dead one. Three samples at a window at or above the cadence settle
it; anything shorter cannot answer the question and should say so rather than pick a direction.

**Gate:** already met — a stale heartbeat reaches a surface without a tick, and a healthy one is
silent (measured today: zero heartbeat findings).

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

**Status today: 7 active employees across 2 departments; 26 ready approval gates across 3 — re-measured 2026-11-04.**

The outline's own figures were wrong in both directions: it said 37 gates across 3 departments,
and a later pass said 39. Live, the count of `stage='approve' AND status='ready'` is **26** — 11
Career Pipeline, 11 Freelance Agency, 4 Architectural Leads. The extra rows in the earlier counts
were terminal and non-ready ones, which are not gates anyone can decide. The department split below
is measured and current.

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
| G14 | twelve `career-pipeline` smoke gates, not three | closed 2026-11-04. The outline's mechanism was measured false: the agent user reads those scripts with `rc=0` and every failing check reproduces for the **kernel** user identically, so it was never a permission. The finding was that the kernel graded a check with no concept of its provenance, so another system's dead path became A's `smoke.critical` and an incident that sat open from 2026-10-30. `Kernel._check_elsewhere` derives it from the department's own reach |

The outline's G14 diagnosis was wrong in its mechanism, and the cost was real: it read as
"the boundary is working" on an instance whose Chair's board carried a five-day-old open incident
naming those very checks. Two things it got wrong, both measured rather than read:

- **the count.** three `smoke.critical` findings were named; there are twelve checks whose
  scripts live outside that department's declared reach, and the six that failed include three
  the readability reading never saw.
- **the cause.** "denied by design" was the wrong shape for every one of them. A check that
  names a path that does not exist fails identically for the kernel user and the agent user,
  which is a broken reference and this organization's own import, not a boundary working.

What A owes is not a grant and not silence: a check about somewhere else is reported as a
warning that names the reach it is outside, so the Chair can still see it and no incident opens
for it. Law 10 is honoured by not welding the two stacks together — never by letting one stack's
dead path consume the other's alarm surface.

## §7. Order of work

| Order | Row | Cost | Who |
|---|---|---|---|
| — | G12 (skill export) | **done 2026-11-04** (`86bbe07`) | me |
| — | G7 (operation steps) | **done 2026-11-04** (`7e9ee30`) | me |
| — | G10 (heartbeat staleness) | **done 2026-11-03** (`1583cf0`); the clock itself is healthy | me |
| — | G14 (smoke provenance) | **done 2026-11-04** (`f1b498c`) | me |
| 1 | G11 (`apply --force`) | one command | Chair |
| 2 | G9 (the 26 gates) | the Chair's approve/reject | Chair |
| 3 | G8 (hire per department) | no tokens, but **blocked on the clock**: no employee has a live wake schedule, so a hire cannot be fired | me, after G9 |
| 4 | G13 (the re-link) | the Chair's signed act | Chair |

What is left is the Chair's four decisions and nothing else. The kernel work this outline
prescribed is closed, and the one row it left for "me" (G7, operation steps) is the one that
turns the Chair's token-budget discipline into a property of the work — its gate is one test
crossing the seam with the other side's real artifact, not a stub, because a steps field that
validates but never runs is the same defect class as the `_step_problems` reader this session
found: written, and called by nothing.

One correction for whoever picks this up next: **G8 is not actionable today.** Measured
2026-11-04, no active employee has a live wake schedule (`schedule.nowake`, an error on the
board), and the Chair disabled both `wake` schedules on 2026-10-30 with no note. Hiring into a
department nothing can fire spends the Chair's budget on a body that cannot be woken. The clock
must be armed first, and that is a decision, not a bug.

## §8. Re-measurement, 2026-11-05 — the rows that moved, and the one that did not

**This section supersedes nothing above it and is not a second plan.** It is a re-audit of §1's
eight rows against measured evidence, recorded here because the question that asked for it
("is everything done, so this can be archived?") is a question this document can only answer
with a measurement. The measurements are from the live home, the distribution at HEAD, and a
scratch copy of the live home; every figure below names its source.

### The claim this section tests, stated before measuring

**"What is left is the Chair's four decisions and nothing else."** Measured, that claim is
**false in one direction**: G7 is a kernel-build gap, not a Chair decision, and §7's own table
calls it "me". The four Chair rows are also all still open. Nothing here converts an operator
decision into a closed gap by relabelling it.

### Per-row re-measurement

| # | §1's row | measured today | verdict |
|---|---|---|---|
| G7 | steps have no writer and no reader | **not delivered as §4 describes it.** `7e9ee30` wired one validator into `validate` (`contract._step_problems`), which the ledger already records; the writer (`--steps`) and the DAG reader do not exist, and the floor's priced kind `agent` is **not in `STEP_KINDS`**, so the gate's own envelope is refused at submit | **open — kernel work** |
| G8 | revenue departments have no employees | unchanged and **still blocked**: 0 employees in career-pipeline, freelance-agency and architectural-leads; both `wake` schedules `enabled=0`; `schedule.nowake` is a live error | **open — needs the clock armed first** |
| G9 | 26 approval gates, all `lane=full` | unchanged: 26 ready `approve` gates, 11 + 11 + 3+1 across the three revenue departments, 25 at G3 and 1 at G2, all `source=kernel`, `approver=chair` | **open — Chair** |
| G10 | a dead heartbeat says nothing | **closed and guarded.** Both branches escalate to `error`; the check runs with no tick; three guards assert severity and both threshold directions | closed |
| G11 | isolation.reach names two paths | **open, and wider: five paths.** Derived right, applied stale — and the grant does not stick | **open — Chair** |
| G12 | skills.export_stale | **closed and guarded**; four guards pass. The §7 citation `86bbe07` is an orphan (not an ancestor of HEAD); the in-history commit is `ef30adb` | closed (citation stale) |
| G13 | audit.chain's one break at 1815 | **open, unchanged:** 3578 events, 0 hash-recompute mismatches, 1 linkage break at seq 1815, nothing attested | **open — Chair** |
| G14 | smoke gates from another stack's tree | **closed and guarded**; two guards pass | closed |

### What G7 actually needs, so the row is not re-closed by a smaller one

§4's four parts were measured one at a time. What shipped is part of part 1.

1. **The contract's `steps` field** — exists as `F("text_or_list")` on the plan variant; `kind`
   and `depends_on` are validated, `command`/`retry`/`stop_if` are validated nowhere.
2. **A writer** — `holon operation add` has no `--steps`; `Kernel.add_operation` has no `steps`
   parameter; `service.py`'s operation builder wraps *prose* in a one-element list.
3. **A reader that materializes a DAG** — the only `task_needs` writers are driven by the
   decompose branch's `children`/`after`, never by `steps`.
4. **A live input to the floor** — 0 of the live instance's 52 plan outputs carry step dicts;
   every one is a one-element list of prose.

**And the defect that makes 1 and 4 contradict each other, which no amount of §4 work will
fix on its own:** `vocab.STEP_KINDS` omits `agent`, while `grading._complexity_floor` prices
`kind == "agent"`. `contract.validate` therefore refuses the very step the grader prices and
the gate names. The vocabulary and the grade disagree on the one word that carries the budget.

**The gate is not met.** No test adds an operation with a script step and a `branch_one`
fallback and asserts the grade or behaviour. The nearest guard
(`test_operations.py:128-160`) is a contract-level unit test on a hand-written dict: no
operation, no script, no body, no DAG, no grade — and AGENTS.md's own law requires a test
crossing the seam with the other side's real artifact.

### G11's five paths, and why one command is not enough

Measured host-side through the isolation runner (the only namespace-independent view; see the
trap below):

| path | cause |
|---|---|
| the harness build's version directory and its `jcode` binary | the parent `~/.jcode` is mode 700 with `mask::---`, so the traversal grant is masked away |
| `~/.local/bin/operant` | mode 700, `mask::---`: its own named `r-x` grant reads `#effective:---` |
| the mise-installed `claude` version directory and its binary | a stale `user:<agent>:---` on `~/.local/share`, inherited from an apply run before the reach grew |

`reach()` returns these paths and `setup_plan` grants them, so the derivation is right and the
applied set is stale. **But the grant does not stick:** `~/.local/bin/operant` was
rewritten at 05:54 UTC today as a mode-700 ELF (its older copies are 755). A `chmod 700` on an
ACL-bearing path rewrites the mask and zeroes `other`, so every apply is undone by the next
harness install. The plan contains 249 `setfacl` commands and **zero `chmod`** — nothing
re-establishes a mode the harness erased.

### A measurement trap this re-audit hit, recorded because it cost a wrong conclusion

An early reading of these paths said the ACLs carried *no* agent user at all, that `setfacl`
refused them as `Malformed access ACL ... Duplicate entries`, and that `apply --force` would
therefore report FAILED. **All three were wrong, and all three came from the instrument.**
This session runs in a user namespace that maps only uid 1000 (`/proc/self/uid_map` → `1000 0 1`),
so every other uid collapses to `-1` and two distinct agent accounts (955 and 956) look like a
duplicate entry. Run host-side through the runner, the same paths show the agent user's entry
by name, and `setfacl` fails at **permission**, not at **parse**. The rule this session's own
§2 already records now has a second instance: **a probe observes through its own namespace, and
a probe that cannot name the uid it is asking about is not measuring the live filesystem.**

### What this means for "archive this document"

§7's table would need four rows rewritten and one closed to be true. The document's own
archive convention (`AGENTS.md:97`, `docs/archive/INDEX.md`) requires a successor record
naming what replaced it. This section is a re-measurement, not a successor: it names no new
plan, so the rows above are still live. **The honest state is: kernel work closed for 3 of 8
rows, 1 row (G7) unbuilt, and 4 rows awaiting Chair acts.** Archiving now would retire a
register whose rows still have owners and work attached.

---

> **Annotated 2026-11-05, after the re-measurement above was written.** The §8 closes with
> "kernel work closed for 3 of 8 rows, 1 row (G7) unbuilt, and 4 rows awaiting Chair acts" and
> "Archiving now would retire a register whose rows still have owners and work attached". Both
> were true of the measurement as taken — G7 was unbuilt at that hour. It was built the same day
> (the writer, the reader and the seam test; ledger row in `AGENTS.md`), and this outline was
> archived afterwards, with every row it names carried into the register where its owner and its
> work live: **H13** (G7, done), **H15–H18** (the four Chair rows), **H19–H20** (the Command
> Center's gap list and its four decisions). So the archive retires the *plan*, and the register
> keeps the *rows* — which is what §8's own condition asked for.
