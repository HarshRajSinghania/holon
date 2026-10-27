---
status: active
date: 2026-10-20
description: "The A-side program, restated: Project-Genome + Holon-Personal is a self-contained program with its own gaps, its own gate and its own register — it is NOT the Paperclip+Zeroclaw+Organism stack, and nothing in it depends on that stack. This record states the boundary as a law, lists the A-side gaps as solutions to execute with their gates, and supersedes every doc that let the two be read as one."
tags: [boundary, scope, gaps, solutions, program, de-conflation]
supersedes: [2026-10-18-remaining-gaps-handoff.md, 2026-10-17-remaining-implementation-gaps.md]
---

# 2026-10-20: the A-side program — what Project-Genome + Holon-Personal owes, and what it is not

Status: **active** (the operating scope statement for this program). It states a boundary, names the
solutions to execute, and supersedes the two gap registers it replaces. It is grounded in live probes
of 2026-10-20 (recorded in §5), not in a reading of the records.

---

## 0. The boundary (the rule this program runs under)

**Two stacks exist. They are not one system. This program is one of them.**

| | **A — this program** | **B — a different stack** |
|---|---|---|
| Name | **Project-Genome + Holon-Personal** | Paperclip + ZeroClaw + Organism |
| Repos | `holon` (public) + `holon-personal` (this overlay); the `project-genome` skill | `~/.hermes/organism/`, the VPS, the `agentic-utility`/`agentic-harness` trees |
| What it is | a **documentation-governance layer** (genome) over an **agentic-OS kernel** (Holon) | the Chair's **production venture runtime** — 68 routines, a 25-role agent org, Telegram delivery |
| Where it runs | the Chair's workstation, `~/holon` | the VPS, `paperclip.ishanparihar.com` |
| Its gate | `genome lint` + `genome close`; `holon lint --strict` + 374 tests | Paperclip's own control plane; `PAPERCLIP-OPERATIONS.md` |
| Its register | `TODO.md` in this overlay and in `holon` | Paperclip's embedded PG |
| Live state (2026-10-20) | 2 departments, 4 employees, 1 unit manifest, 67 tasks, 44 runs | 34 live routines; the only production scheduler |

**The law.** A statement about A is never evidence about B, and a defect in B is never a defect in
A. The two share *vocabulary* — "departments", "routines", "employees", "ventures" — and nothing
else. Shared words are not shared systems.

**Consequences, in the order they bite:**

1. **A is not blocked by B.** Every A-side gap in §2 is buildable now. None of them waits on a
   Paperclip decision, a VPS change, or a venture routine. (The 2026-10-18 handoff already said
   this in §0 — but its own §3 and §4 spent most of their length on the import waves, which made
   the program read as "the ventures migration" rather than "the OS and its governance".)
2. **A's completion is not B's migration.** A can be complete — kernel, governance, gates, harness
   conformance, KB layer — while every venture still runs on B. Those are different claims.
3. **B's health is not A's health.** The workstation gateway being down blocks A's runs; B on the
   VPS is unaffected. The converse is also false.
4. **A defect found in B's territory is B's to fix.** The 2026-10-18 handoff's §3.4 ops queue
   listed "restore the workstation free-stack gateway" as an A blocker. That was correct in effect
   (A's smoke fails closed) but wrong in framing: it is an A-side ops item, not a B-side one, and
   it must never be reported as a B outage.

**Where the boundary was already stated, and why it did not hold.** Three records state it
correctly — `2026-10-17-ventures-import-ontology.md` §0 ("Two infrastructures, one bridge: until a
pool crosses, B keeps running it and A runs nothing for it"),
`docs/archive/2026-10-18-remaining-gaps-handoff.md` §0 ("**Never conflate them**"), and
`2026-10-16-ventures-re-architecture.md` §7.3. Each is a *design record* — a document an agent
finds after it has already formed a model. The failure is not that the boundary was unstated; it
is that **nothing enforced it**: no law in `AGENTS.md`, no pointer on the entry path, no check in
`holon lint`, and `docs/STATUS.md` §1 — which every fresh agent reads early — opening with
"the Chair runs a personal agentic ecosystem, the Hermes organism" and "Holon is the operating
system meant to run that organization". That sentence is what invites the merge. It is the
organism's *future*, not its present, and the present tense of a record must not describe a
system that does not exist.

---

## 1. What A is, operationally (the honest description)

**A has two layers, and they are at very different stages.**

**A1 — Project-Genome (documentation governance). Complete and measured.**

- 64 venture cards federate from the `my-projects` root; 63 of 64 repos on CLI `2026.10.20-1`
  at `schema_version 2` (the 64th, `EXPERIMENTAL/kali-mahabali`, is an evaluation fixture
  excluded by `[federation] exclude`).
- Every card class resolves: intent, architecture, operate, decisions 63/63; status 62 (holon's is
  `overlay:` by law).
- `genome lint`: 0 errors, 0 warnings. `genome doctor`: 0 findings. `genome federate`: 64 cards.
- The five doc classes answer the portfolio's five questions without opening 64 trees.

**A2 — Holon (the agentic-OS kernel). Built, tested, and nearly empty.**

- 374 tests pass; `holon lint --strict` clean.
- The live instance `~/holon`: **2 departments** (Executive Office, Tools), **4 employees**,
  **1 unit manifest** (`browser`), 67 tasks, 44 runs — of which 28 hermes, 15 operant, 1 script,
  **0 jcode**.
- `holon doctor` (2026-10-20): 6 errors, 2 warnings — `isolation.off`, the operant harness smoke
  failing, 5 unstaffed `plan` stages, stale skill exports.
- `holon status`: 12 open tasks, all of them A-side self-improvement (incidents, retros, playbooks,
  Notion tests). **No venture work.**
- Harness conformance: `operant` carries native `holon_*` tools and works; **`jcode` scores 1/5**
  (see §3).

**A is a finished engine with no freight on it.** That is the whole of A's remaining work: prove
the engine on real work, and close the last gates.

---

## 2. The A-side gaps, as solutions to execute

Every row is A-side. None depends on B. Each names its gate — the thing that says "done".

### Tier 0 — the instance cannot run anything until these clear (measured 2026-10-20)

**Status as of 2026-10-20, after this session: items 0.1, 0.2, 0.3, 0.5 are APPLIED.
0.4 and 0.6 need root or the Chair.** See
`2026-10-20-the-genomic-os-operationalized.md` §4 for what was applied and its check.

| # | Gap | Solution | Gate |
|---|---|---|---|
| **0.1** | **CORRECTED on 2026-10-20 — the diagnosis here was wrong.** The *symptom* was right (`/usr/local/bin/operant` refused to start: `libonnxruntime.so.1: version 'VERS_1.20.1' not found`), but the *cause* was not the library. `~/.local/lib/operant/libonnxruntime.so.1` pointed at `.1.24.4`, which is **correct**: the operant repo pins ONNX Runtime 1.24.4 (AD-017) because `ort` needs API 24. The stale thing was the **binary**: `/usr/local/bin/operant` is root-owned, dated 2026-10-17, and built against 1.20.1 — and both the driver and the smoke check pinned it. The current binary is `~/.local/bin/operant`. | Re-run the adapter installer with the current binary (it pins what it is given), and point the smoke check at the same binary. **Downgrading the library to 1.20.1 would have satisfied the stale binary and broken the current one.** | `holon adapter test operant --clauses driver` → `pass`; `holon smoke` → `ok operant harness` |
| **0.2** | The jcode adapter's provider profile points at a port nothing binds (`127.0.0.1:20129`); the live gateway is `20128`. The pinned model `free-stack` no longer exists on that gateway (routable now: `glm-5.3, large-stack, small-stack, claude-opus-5-5, …`). | Repoint the provider to the live gateway and pin a live model; re-run the adapter installer | `holon adapter test jcode` reaches past the `driver` clause (i.e. the plan clause runs a real model turn) |
| **0.3** | 5 `plan` stages sit unstaffed in `executive` — the department's only member is the Chair, so nobody can claim them. Three are stale hermes-era failures; one is the gateway smoke; one is the unstaffed-report itself. | After 0.1, close the stale incidents and staff `executive` (a head who can plan) | `holon doctor` reports no `graph.unstaffed` |
| **0.4** | `isolation.off`: agents run as the kernel's user, so one with a shell can read the Chair key and write `work.db`. | The one-time isolation setup (root creates `holon-agent` and its runner) — Chair's action, needs root | `holon doctor` reports no `isolation.off` |
| **0.5** | 16 exported skill files differ from the library (the jcode adapter home is one of them). | `holon skill export` again, after every adapter installer | `holon doctor` reports no `skills.export_stale` |
| **0.6** | The heartbeat is installed but **off**, so `holon doctor` never runs on a timer and incidents never open on their own. | Turn on `holon-tick.timer` — Chair's decision | a `doctor` failure opens an incident within one tick |

**Tier 0 is the whole of "A cannot currently do anything".** It is six items, five of them
one-command fixes, none of them needing a decision. It should be done before any other A work,
because every later gate depends on runs actually starting.

### Tier 1 — the harness seam (jcode)

Measured, not inferred: `holon adapter test jcode` scores **1/5** — `driver` passes; `plan`,
`approve`, `execute`, `verify` fail with *"no result.json and no JSON output"*.

Three independent defects, each proven by direct probe on 2026-10-20:

| # | Defect | Evidence | Solution | Gate |
|---|---|---|---|---|
| **1.1** | **FALSIFIED on 2026-10-20 — see `2026-10-20-the-genomic-os-operationalized.md` §2.2.** The original claim, *"jcode v0.99.0 does not pass its own environment to a stdio MCP server child"*, is **false**. Direct measurement with a **real minted run token**, the **live `mcp.json` shape** and the driver's exact environment showed the real Holon MCP server answering `{"principal": "employee", "employee_id": "emp_…", "run_id": "run_live01"}`. The token **does** reach the child. The original probe used an unreal token, and an unreal token falls back to the chair principal — which looks exactly like "the token did not arrive". | The corrected finding, which is real and worth a guard: **a harness that loses the token does not fail loudly — it silently becomes the chair** (fail-open). | A guard on the true invariant (the token must reach the child), plus a fail-closed guard on the chair fallback. Both landed 2026-10-20. | `test_the_run_token_reaches_a_stdio_mcp_server` and `test_a_harness_without_the_token_is_refused_not_promoted_to_chair` |
| **1.2** | The adapter README's claim *"An MCP server started with `shared: false` sees the run's environment (probe: a variable set for the run reached the server)"* was true on **jcode v0.93** (the version that passed 5/5, commit `f437a5d`). On **v0.99.0** it was re-proved by measurement on 2026-10-20: the token reaches the child. The README was stale about the *version*, not about the *behaviour*. | The README says "verified on a real jcode (v0.93)"; `jcode --version` says `v0.99.0`. | Correct the README to state the version it holds for and what was re-proved on which. | the README and the guard test agree on the version |
| **1.3** | The body does not stop. Measured on 2026-10-20 with the gateway fixed: a real `plan` dispatch to a real jcode-driven employee ran **10 min 21 s**, **19 assistant turns**, **36 tool calls** (33 `bash`, 2 `read`, 1 `skill_manage`), and **0 submits** — it was cut by the kernel's own timeout, still verifying facts. The body *did* reason its way to the right answer ("No write/edit/apply_patch tool → use `holon_submit`… I'll use mcp_call to holon_submit") and then kept exploring. A second session died the same way, reading the kernel's own source for the grading floor the brief forbids. | The session journal of the reproducer (`/var/tmp/ishanp-agentic/repro_plan.py`): turn count, tool count and the absence of any submit, counted from the journal. | A turn/iteration cap in the driver, and a brief that says "produce the envelope, then submit" with the exploration budget named. | the plan clause passes with the body submitting within the cap |

**1.1 was falsified on 2026-10-20 and its guards were rewritten to guard the true
invariant**; see `2026-10-20-the-genomic-os-operationalized.md` §2.2 and §2.4. The
lesson is the repo's own: *a fallback identity is not evidence of a missing
credential* — prove the credential is real before concluding it did not arrive.

### Tier 2 — the governance layer's remaining surface

| # | Gap | Solution | Gate |
|---|---|---|---|
| **2.1** | `holon-personal`'s `genome.toml` does not point at the federation (V-25), so the overlay is not a federation member. | Add the `[federation]` block, or record the exclusion as a decision. It is the hand-off point for the outbound protocol (V-14). | `genome doctor` resolves the overlay's card against the federation |
| **2.2** | 3 repos have no remote — `my-portfolio` (4 commits), `android-webcam-suite` (1), `omarchy-social-inbox` (1). Their commits exist only on this machine. | Create the remotes and push. | `git remote -v` resolves and the branch is tracked, in all three |
| **2.3** | The revenue plan's proof-set numbers are stale: it claims operant has 2291 passing tests (measured 4743) and tdg-rust 449 lib tests (its README says 626 total). Gate A requires a re-measured number with the commit that produces it. | Re-measure each of the four proof sets at a committed state and write the ledger (`Offer \| Repo \| Gate command \| HEAD sha \| Result \| Measured at \| The claim it replaces`). | every number in the ledger maps to a sha |
| **2.4** | The outreach machinery does not exist: no `tools/deslop.py`, no `tools/cleanse.sh`, no prospect store, no angle log, no outcome ledger. | Build the two scripts and the four-table store. The three fields the Chair must fill (price band, approval threshold, sample size) belong there as blanks, not guesses. | `tools/deslop.py --selftest` passes; a draft scores 5/5 |
| **2.5** | The register is stale in places (V-27 to V-31) and the portfolio's goals are unwritten (V-12). | Close each row with its evidence; write the goals (the input to the lane ranking). | `genome wake` shows a register whose every row is true |

### Tier 3 — the Chair-gated kernel builds (blocked, and correctly so)

These wait on a ruling; they are listed so nothing is silently dropped, not because they are
actionable now. From `TODO.md`: **H3** R-13 holarchic config (D8) · **H4** R-14 a document knowledge
base (D9) · **H5** R-16 the complete system-design skill · **H6** N-1 Notion surfaces (D10).
Plus the outstanding rulings: D1 the two-hierarchy segregation, D2 the brand merge, D3 platform-ops,
D4 the supersession list, D5 the pilot approval, D6 C-track ratification (its code is shipped and
live — the ratification is the open formality), D7 R-04's shape.

### Tier 4 — the one unblocked build item

**H2 — the operant deferred-tool index** (R-04's second half). The client half shipped (iter-907);
the index does not exist: pooled services are not registered as `svc_<unit>_<service>` deferred
tools, and the observe posture still cannot call any declared CLI. This is the only A-side build
item with **no** decision gate — it can be done now, in the operant repo, under that repo's own
iteration protocol. It is also the item that makes the capability layer actually usable, and it is
in a *different repository* from this one — so it needs its own checkout, its own peer protocol
(`git fetch origin` first; the peer "Sisyphus" pushes ungate-checked; confirm a pre-existing suite
failure on clean `main` before claiming it) and its own build env
(`LIBCLANG_PATH=<repo>/local/libclang`, `ORT_LIB_LOCATION=~/.local/lib/operant`).

---

## 3. What this record supersedes, and what it does not

**Supersedes** (both were registers that mixed the two programs' work into one list):

- `docs/archive/2026-10-18-remaining-gaps-handoff.md` — its §0 states the boundary correctly, but
  §3.4 mixes A's ops queue with B's and §3.5 is entirely about the import waves. A fresh agent
  reading it would conclude the program *is* the ventures migration.
- `docs/archive/2026-10-17-remaining-implementation-gaps.md` — same shape; its §3.1 calls the Chair's
  gates "the only things before wave 1", which is true of the import and false of A.

**Does not supersede**, and keeps its full force:

- The import's own machinery — `2026-10-17-ventures-import-ontology.md`, `2026-10-17-wave1-decision-packet.md`,
  `2026-10-16-ventures-re-architecture.md`. They remain the law *for the bridge*, when and if the
  Chair opens it. They are simply **not on A's critical path**, and this record is where that
  becomes unambiguous.
- `2026-10-13-paperclip-contrast.md` — a historical contrast, not a dependency.

**One open question this record does not answer.** Whether A's completion should *precede* the
bridge, or run in parallel with it. The evidence says parallel is safe (A's gaps do not depend on
B), but the Chair's intent is not recorded, and it matters for sequencing: if the bridge is the
priority, Tier 0 and Tier 4 still come first, because the bridge needs a kernel that runs.

---

## 4. The execution order, as a single list

> **Superseded as an ordering on 2026-10-20 by `2026-10-20-the-bridge.md`** — one
> plan for the whole A-side program, living in the federation repo at
> `my-projects/docs/plans/2026-10-20-the-bridge.md`, with every row gated. This
> section's *content* still stands (Tier 0's items are applied; Tier 1's §1.1 is
> falsified above); only the ordering is this file's no longer.

```
Tier 0  the instance runs again        0.1 operant lib  → 0.2 jcode provider → 0.3 staff executive
                                      → 0.5 re-export skills → 0.4 isolation (Chair, root)
                                      → 0.6 heartbeat on (Chair)
Tier 1  the harness seam               1.1 jcode MCP token (wrapper or CLI-primary)
                                      → 1.2 README truth + guard test + ledger row
                                      → 1.3 the body stops and submits
Tier 2  the governance layer           2.1 the overlay joins the federation → 2.2 three remotes
                                      → 2.3 the proof ledger → 2.4 the outreach machinery
                                      → 2.5 the register tells the truth
Tier 3  the Chair's rulings            H3 H4 H5 H6 · D1..D10
Tier 4  the one unblocked build        H2 — the operant deferred-tool index
```

Tier 0 and Tier 1 are the shortest distance to an A that can be *demonstrated*: after them, a
jcode body plans, gets approved, executes and is verified inside Holon. That is the program's
first honest proof, and it needs no ruling and no venture.

---

## 5. The probes this record rests on (2026-10-20)

All read-only against the live instance unless stated; the scratch runs built their own
organizations in temp directories and touched nothing of the operator's.

| Claim | How it was measured |
|---|---|
| 64 cards federate; lint 0/0 | `genome federate` → "64 card(s)"; `genome wake` → doctor 0 findings, lint 0 errors 0 warnings |
| 2 departments, 4 employees, 0 jcode runs | `sqlite3 file:work.db?mode=ro` on `~/holon/execution/runtime/work.db`; runs grouped by driver |
| 1 unit manifest | `units` table → one row, `browser` |
| 374 tests pass | `python3 -m unittest discover -s tests -t .` → `Ran 374 tests … OK` |
| jcode scores 1/5 | `python3 -m holon --home ~/holon adapter test jcode` → `1/5 passed` |
| The jcode provider port is dead | `ss -ltnp` → nothing on 20129; the gateway answers on 20128 |
| `free-stack` is not routable | the gateway's own error: `model "free-stack" is not a configured combo; routable models are: …` |
| jcode works on the live gateway | a probe run against `20128` + `large-stack` returned `{"text": "PONG", "usage": {…}}` |
| The MCP server gets no run token | a probe MCP server printing its environment received **no** `HOLON_RUN_TOKEN`; the real server answered `{"principal": "chair"}` |
| The body produces a correct envelope | the session journal's `tool_input` carried a well-formed `{"kind": "plan", …}` and a `holon_submit` call |
| That submit was rejected | the same journal: `Error: no run: pass run_id, or call from a run (HOLON_RUN_TOKEN)` |
| The operant library mismatch | `/usr/local/bin/operant --version` → `libonnxruntime.so.1: version 'VERS_1.20.1' not found`; with a `.1.20.1` symlink on the library path → `operant 0.2.1` |
| The instance's own doctor findings | `holon doctor` → 6 errors, 2 warnings, quoted in §1 |

**What was not measured.** The B stack's live state was read from its own record
(`~/.hermes/organism/ventures/PAPERCLIP-OPERATIONS.md`), not probed: it is on the VPS, and this
record makes no claim about it beyond what that document says. No A-side change was applied to the
live instance — the Tier 0 fixes are the Chair's to make, and one of them (0.1) touches a symlink
under `~/.local/lib`.

---

## 6. The law this record adds

**The two stacks are separate programs.** A finding about one is never evidence about the other.
Shared vocabulary is not shared infrastructure.

This law is enforced, not merely stated:

- `AGENTS.md` carries it as a numbered law, so every agent that opens the repo reads it.
- `docs/INTENT.md` gains the boundary in its own terms (it is the document that defines what
  Holon is, and it must say what it is *not*).
- `docs/STATUS.md` §1 is rewritten so its present tense describes only what exists.
- `holon lint` gains a check that a doc does not assert A and B are one system.
- The regression ledger gains a row per guard, so no guard can be deleted silently.
