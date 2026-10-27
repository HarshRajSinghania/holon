---
status: proposed
date: 2026-10-20
description: "The outline for making Holon a fully operational agentic-os: every gap measured on the live instance on 2026-10-20, ordered so each step unblocks the next, with the gate that says done and the two decisions that are the Chair's."
tags: [outline, plan, agentic-os, operations, harness, migration, gaps]
supersedes: [2026-10-17-remaining-implementation-gaps.md]
---

# 2026-10-20: the outline — from a built engine to an operating one

Status: **proposed outline** (the working order). Every number here was measured on the live
instance on 2026-10-20, not read from a record. Where a record's claim turned out to be wrong,
that is said plainly.

Scope: **A only** (Project-Genome + Holon-Personal + this kernel). Nothing here is about the
other stack (Paperclip, ZeroClaw, the Hermes organism) — a finding about one is never evidence
about the other.

---

## 0. Where the system actually stands

Measured, 2026-10-20, against `~/holon` (read-only) and a scratch instance:

| Layer | State | The number that says it |
|---|---|---|
| **Federation** | Complete | 63 of 64 repos on genome CLI `2026.10.20-1`; `genome lint` 0/0 |
| **Kernel** | Built, nearly empty | 2 departments, 4 employees, 47 tasks, 44 runs, **last run 2026-10-16** |
| **Genome KB** | Machinery proven, **nothing seeded** | no `kb/` directory on the instance; 0 KBs; 1 unit |
| **Doctor** | Clean | **0 errors, 1 warning** (`isolation.off`, which needs root) |
| **Tests** | Green | 444 pass; `lint --strict` 0/0; `genome lint` clean on both repos |
| **Harness conformance** | **Not passing** | `adapter test jcode` scores 1/5: the plan is submitted and then rejected on its shape (Tier B) |

**The honest summary.** The engine is finished and the freight is not loaded. The kernel runs
44 runs' worth of work with two departments and four employees; it has been idle for four days
because two of its four seats cannot plan and the one that can is on probation. The genome
layer — 63 repos, clean lint — never touches the kernel, because no knowledge base has ever
been seeded. And the venture corpus (62 protocols across ten pools) is entirely outside it.

**Two corrections to the record.** The 2026-10-20 operationalized record measured the kernel as
"2 departments, 4 employees, 67 tasks, 44 runs" and the migration as "zero of ten". Those hold.
But it also said `adapter test jcode` scores **1/5** because *the body does not stop*. Re-measured
today, that is wrong in the more useful direction: the body **does** submit — it produced a
complete plan and called `holon_submit` — and the **client corrupted the arrays** on the way
(Tier B). The earlier reading put the fault in the harness's behavior; it was in the kernel's
MCP schema all along.

---

## 1. The gaps, in the order that unblocks the most

Each row names the defect, the evidence, the fix, and **the gate that says done**. Ordered so
that a step's gate is reachable with the steps above it done.

### Tier A — the kernel runs work (nothing else matters until this)

| # | Gap | Evidence (2026-10-20) | Fix | Gate |
|---|---|---|---|---|
| **A1** | **`executive` has no employees.** The `ceo` slot (head + planner) is the only plan-capable seat in the organization. The other three seats are in `tools`; two of them are `executor`/`verifier`, and `Milo`/`Oto` are `planner` but on a probationary employee and a tools department. | `executive|0` employees; `tools|4` | Hire the CEO (the Chair's call — a person with a Chair key). | `holon doctor` reports no `graph.unstaffed`; a plan stage in `executive` is claimable |
| **A2** | **No harness passes conformance.** `adapter test jcode` exceeds 10 min and returns nothing. | measured above | The body's turn budget and the driver's stop path (Tier B). | `holon adapter test jcode` and `… operant` each return **5/5** |
| **A3** | **`isolation.off`** — agents run as the kernel's user, so one with a shell can read the Chair key and write `work.db`. | the one doctor warning | The one-time isolation setup (root). | doctor reports no `isolation.off` |
| **A4** | **The heartbeat is off** — doctor never runs on a timer, so incidents never open on their own. | `holon-tick.timer` installed but disabled | Turn it on (the Chair's call). | a doctor failure opens an incident within one tick |

**Why A1 before A2.** A conformance run *creates work* in the instance (it did so during this
session: three incident nodes opened, one for each `graph.unstaffed` finding, all in the empty
`executive`). With nobody able to plan, every failure becomes an incident that nobody can
work on. Staffing `executive` is one decision and it makes every later measurement meaningful.

### Tier B — the harness submits work the kernel rejects (measured 2026-10-20)

**This tier's diagnosis changed during the session, and the earlier one was wrong.** The
records said both harnesses score 1/5 *because the body does not stop*. The measured truth is
better and narrower, and it is in the kernel's hands:

**The body was never the problem.** A real jcode run read the brief, used the MCP server
correctly (8 calls: `holon_dept_roles`, `holon_emp_card`, `holon_playbook_list`,
`holon_playbook_show`, `holon_law_show`), produced a complete plan, and said *"I have
everything I need… Submitting the plan now."* — then called `holon_submit` once.

**The client corrupted it.** Every list arrived wrapped: `{"steps": {"item": [...]}}`,
`{"writes": {"item": [...]}}`, and so on for seven fields. Proved against the contract
directly: the body's own envelope is **VALID**; the same envelope wrapped is **REJECTED** with
seven field complaints. The cause: `holon_submit` published `result` as a free-form object
with no `properties`, so a client that coerces an untyped array to a typed object had no
types to coerce *to* and guessed.

| # | Gap | Fix | Gate |
|---|---|---|---|
| **B1** | The kernel rejects a correct plan because the client wrapped its lists. | **Repair B**: unwrap `{"item": [...]}` where it is unambiguous, before validation. **Repair A**: publish the stage's real envelope schema in `holon_submit`'s `inputSchema`. | `holon adapter test jcode` reaches **2/5**; `… operant` reaches **2/5** |
| **B2** | Repair A was itself broken: the schema lookup called `Path(...)` without importing it, and the bare `except` turned the `NameError` into "no stage" — so the contract was never published, silently. | Import `Path`; the guard now sets a run token and asserts the typed form. | the guard fails if the schema stops being published |
| **B3** | **One harness is not a proof.** operant's tool surface is native (`holon_*`), not the MCP client, so its failure has a different cause — not yet traced the way jcode's was. | Trace operant with the same probe. | `… operant` reaches 2/5 |
| **B4** | The body still explores before it submits (21 turns, 33 tool calls). | The budget (in `holon-employee`) plus the fact that a rejected plan means starting over. | the plan stage submits within N tool calls on both harnesses |

Both repairs for B1 landed on 2026-10-20 (`10080fc`, upstreamed from the overlay). The
budget and the schema beside the brief landed earlier (`2246fe6`) and were right, but not
sufficient: the tool call is the other way in, and that way was unguarded.

### Tier C — the pilot venture (the Chair's ruling, then execution)

Measured today on a scratch instance, the whole path already works:

| Step | Measured result |
|---|---|
| `venture_import career-pipeline --dry-run` | **15 protocols read, 15 with skills, 13 checks, 182 scripts** |
| outside-reach | **15 of 15** correctly flagged (the deterministic word rule, not the model) |
| `venture_import --apply` | department created with the pool's charter, reach, and smoke checks |
| routines | **8 created as unapproved proposals**; 0 approved — *"an import is not an approval"* |
| `kb seed career-kb --dept career --blueprint venture-pipeline` | **seeded in ~1s** |
| the KB's wake in career's brief | **568 chars**, the genome wake cut |

| # | Gap | Fix | Gate |
|---|---|---|---|
| **C1** | No venture department exists. | `dept create career-pipeline --profile light`, three hires. | doctor clean; career's stages claimable |
| **C2** | The 8 imported routines await approval. | The Chair approves the agent ones (the script ones need a command). | career's protocols fire as Holon routines |
| **C3** | The pilot's KB is not seeded on the instance. | `kb seed career-kb --dept career-pipeline --blueprint venture-pipeline`. | career's brief carries the KB's wake; `kb list` shows it |
| **C4** | `[secrets.dept.career-pipeline]` is unwired. | The Chair's keys, at 0600. | the pool's credentials resolve at claim |
| **C5** | The pilot's smoke checks are not in the kernel's format. | The import translates `smoke.yaml` → `[smoke.dept.<slug>]`; verify against the real file. | `holon smoke` reports career's checks |

**C is nearly free.** Every mechanism is built and measured; what is missing is a ruling and
some hires.

### Tier D — the rest of the corpus (repeatable, then one command)

| # | Gap | Fix | Gate |
|---|---|---|---|
| **D1** | The other 9 venture departments (47 protocols). | Repeat C for each pool, by wave. | each pool's protocols fire |
| **D2** | The organism's 116 runtime jobs — a different shape (prompt extraction, not protocol parsing). | Sequenced after the protocol corpus is proven. | each job's intent is extracted and reviewed |
| **D3** | **G4** (Chair-key-free intake) — built (`intake` is a real actor class, `0017` adds the schema, `portability.py` exists) but **unwired**: no intake key has ever been issued. | Issue the key, bind `[intake.dept.<slug>]`. | a scanner files a lead with no Chair key, and can never approve |
| **D4** | **G12** (department export/import) — built (`export_department`/`import_department`) but unexercised. | Export career-pipeline, re-import it as a second department, compare. | a new venture is one command, not a day |

### Tier E — the governance closure

| # | Gap | Fix | Gate |
|---|---|---|---|
| **E1** | The overlay's `[federation]` block (V-25). | Add it, or record the exclusion as a decision. | `genome doctor` resolves the overlay's card |
| **E2** | Three repos have no remote; their commits exist only on this machine. | Create the remotes and push. | every repo's branch is tracked |
| **E3** | The revenue plan's proof-set numbers are stale (operant 2291 claimed vs 4743 measured; tdg-rust 449 vs 626). | Re-measure at a committed state and write the ledger. | every number maps to a sha |
| **E4** | The outreach machinery does not exist (`tools/deslop.py`, `tools/cleanse.sh`, the prospect store). | Build the two scripts and the four-table store; the Chair's three fields are blanks, not guesses. | `tools/deslop.py --selftest` passes |

### Tier F — the KB layer becomes the core capability

This is the question that most needs an honest answer, because the KB layer is **built,
proven, and empty**.

| # | Gap | Evidence | Fix | Gate |
|---|---|---|---|---|
| **F1** | **No KB is seeded.** The layer's whole point — a department's own records reaching its agents — has never happened. | no `kb/` dir on the instance | Seed one per department (C3 is the first). | every department's brief carries its KB's wake |
| **F2** | **A KB is not yet a *synced* genome.** A KB is a genome repository, but nothing ties its `genome.toml` to the federation's card: `genome lint` checks the repo's own rules, and the federation's card for that repo is separate. | `holon/vendor/genome.py` and `scripts/genome` are byte-identical (the pin holds), but no KB is a federation member | Decide: a KB *is* a federation repo (join the federation, carry a card), or it is a departmental genome outside the federation (say so in the law). | one KB, federated or explicitly out — with the choice written down |
| **F3** | **The KB's blueprint is a one-time import.** `kb seed` copies a blueprint into a repo; a *new* blueprint (a new venture's ladder) needs an employee to draft and the Chair to promote — exercised in tests, never in practice. | `kb blueprint draft|check|promote` — the seat policy is proven | Seed a KB from a *drafted* blueprint once, end to end. | a promoted blueprint seeds a KB that lints |
| **F4** | **The KB's records are not the organization's memory.** A KB is a repo; `memory.db` is what the organization learned. A lead recorded in a KB is not recallable by `holon recall`, and a lesson promoted into memory is not in the KB. | the two stores are separate by design (`docs/plans/2026-10-19-holon-knowledge-layer.md` §0) | Decide the boundary in the law, or bridge it: a KB record promoted to `dept:` scope, and a KB queryable from recall. | a round trip: a KB record surfaces in a run's recall |
| **F5** | **The KB layer has no run on the instance.** Zero real KBs means zero real `genome wake` cuts in real briefs. | 0 KBs | C3 | one KB's wake in a real brief |

**F2 and F4 are the two real design questions.** Everything else in Tier F is execution.

---

## 2. The order, and why

```
Tier A   the kernel runs work        A1 hire the CEO → A2 conformance → A3 isolation → A4 heartbeat
Tier B   the harness submits work the kernel rejects   B1 unwrap + publish → B2 the schema lookup → B3 both harnesses
Tier C   the pilot venture          C1 dept+hires → C2 approve the routines → C3 seed the KB → C4 secrets → C5 smoke
Tier D   the corpus, repeatably     D1 nine more departments → D2 the 116 runtime jobs → D3 G4 → D4 G12
Tier E   the governance closure     E1 federation → E2 remotes → E3 proof ledger → E4 outreach machinery
Tier F   the KB layer as the core   F1 seed per department → F2 federation or not → F3 a promoted blueprint
                                        → F4 the memory boundary → F5 a KB in a real brief
```

**Why B before C.** A pilot venture whose harness cannot complete a plan stage proves nothing
about the migration: the protocols would be imported, the department staffed, the KB seeded,
and then nothing would run. The harness is the gate on the pilot, not the other way round — and
B is now much closer than it looked: the body already submits, so the two repairs in B1 may be
the whole of it.

**Why A1 before A2.** Conformance creates work in the instance. With `executive` empty, every
failure becomes an incident nobody can plan. Staffing first makes the measurement mean
something.

**Why F2 and F4 are decisions, not work.** They change what the KB layer *is*: a departmental
genome inside the federation, or a departmental repo beside it; and whether its records are
memory or merely records. Both change the law, so both are the Chair's.

---

## 3. What is the Chair's, and what is not

**Two decisions gate everything above:**

1. **A1 — hire the CEO of `executive`.** A person, with a Chair key. Without it, no plan stage
   in the organization is claimable and every failure becomes an unworked incident.
2. **A3 — the isolation setup** (needs root; the kernel prints the one-time plan).

**Two rulings shape the corpus:**

3. **C — the pilot's shape:** which pool is first (career-pipeline is the natural one: 15
   protocols, the `venture-pipeline` blueprint already models it, and the Chair's standing rule
   makes job and freelance work pilot-only).
4. **F2/F4 — what a KB is:** federation member or not; and whether its records are memory.

**Everything else is build work with no decision in it:** B1, B2, C2–C5, D1–D4, E1–E4, F1, F3, F5.

---

## 4. How this document stays true

- Every number is measured, and the measurement is in the row.
- A row that claims done without a gate is not done: the gate is a command, and the command's
  output is what goes in the register.
- A defect found by a real run gets a guard test and a regression-ledger row in the same
  commit, per the repo's law. The gates above are written so each can fail.
- The universal repo is committed first and the overlay takes it through the sync; the sync's
  invariant (personal equals main outside the overlay) is checked by the sync itself, and it
  has caught real drift twice.
- Nothing here is about the other stack.

---

## 5. See also

- `docs/design/2026-10-20-the-genomic-os-operationalized.md` — the three layers and the
  migration, measured (this outline supersedes its ordering where they differ, and records
  the one measurement it got wrong).
- `docs/design/2026-10-20-the-a-side-program-boundary-and-solutions.md` — the boundary.
- `docs/plans/2026-10-19-holon-knowledge-layer.md` — what a KB is, as built.
- `TODO.md` — the register; `AGENTS.md` — the regression ledger and the laws.
