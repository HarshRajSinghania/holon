---
status: active
date: 2026-10-20
description: "What the genomic-os actually is, measured: the three layers (federation → kernel → genome) and how a venture becomes an operating department; whether jcode can serve every workflow (it cannot yet, and the reason is not the one the 2026-10-20 record named); and the measured migration state — 62 importable cron protocols, 2 live routines, 0 project_ref."
tags: [genome, operationalization, jcode, ventures, migration]
supersedes: 2026-10-20-the-a-side-program-boundary-and-solutions.md §2 Tier 1
---

# 2026-10-20: the genomic-os, operationalized — and the migration, measured

Status: **active**. Scope: A only (Project-Genome + Holon-Personal). Nothing here is
about B (Paperclip + ZeroClaw + Organism), and nothing here waits on B.

This record answers three questions with measurements, not readings:
**what the genomic-os is and how it operates; whether jcode can serve every workflow
of it; and whether the ventures are migrated into it.** It also **falsifies one claim**
in the earlier record of the same date (§1.1: "jcode does not pass its own environment
to a stdio MCP server child") and replaces it with the measured truth.

---

## 0. The boundary (unchanged)

A finding about one stack is never evidence about the other. This record's every
number comes from A's live state: `$HOLON_HOME` (`~/holon`), the `my-projects`
federation, and the kernel's own SQLite (read with `mode=ro`).

---

## 1. What the genomic-os actually is: three layers, and where the seams are

The name is singular but the system is three cooperating layers. Confusing them is
what makes "operationalize everything" sound like one job when it is three.

| Layer | What it is | Where it lives | Its state (2026-10-20) |
|---|---|---|---|
| **The federation** | 63 of 64 repositories on genome CLI `2026.10.20-1`, `schema_version 2`. Each repo's `genome.toml` declares its modules, its role→path map, its gate command, and its register. | `my-projects/**` | **Complete.** 79 `genome.toml` files; `genome lint` 0 errors; the 64th repo (`EXPERIMENTAL/kali-mahabali`) is an intentional fixture excluded by `[federation] exclude`. |
| **The kernel** | The organization: departments, employees, a work graph, a hash-chained audit trail, memory, playbooks, routines, units, a notifier. | `holon/` (the public distribution) + `$HOLON_HOME` | **Functioning but thin.** 2 departments, 4 employees, 67 tasks, 44 runs, 2 routines. The kernel is the *substrate*, not the population. |
| **The genome KB** | A genome repository with a lifecycle, bound to one department. Its `genome wake` cut enters **every brief** that department's employees receive. | `$HOLON_HOME/kb/<slug>/` | **Empty.** No `kb/` directory exists in the live home. Zero KBs seeded, zero bound. |

### 1.1 The seam that makes it a *system* rather than three projects

The genome layer is not a document store that happens to be organized. It is bound
to the kernel by one mechanism, and that mechanism is what makes a venture's own
records reach the agents who work on it:

```
holon kb seed <slug> --dept <slug> --blueprint <name>
   → creates $HOLON_HOME/kb/<slug>/ as a genome repo (genome init + lint + commit)
   → writes the binding into the KB registry
   → adds a memory artifact so the binding is discoverable
holon/capabilities/context.py:390  _kb(home, task_dept, b)
   → every context bundle for that department carries the KB's `genome wake` cut
   → capped at kb.WAKE_CAP = 1500 chars per KB
```

`holon kb seed` works today; `holon kb run <slug> <verb>` exposes every genome verb
to an agent; `holon kb blueprint draft|check|promote` is the governance path (an
employee drafts, the Chair promotes). The built-in blueprints are `ontology`,
`mind-topology`, `intersubjective`, `literature-research`, and — the one that matters
here — **`venture-pipeline`**, which is already modelled for exactly this portfolio:
three ladders (`application`, `gig`, `lead`), a shared `contact`, an append-only
`outcome` ledger, `human-only` states on the winning transitions, and views that
drive the lane score.

**So the design for venture operationalization exists and is not used.** That is the
single most important finding in this record.

### 1.2 What "operationalize" would concretely mean

A venture stops being a *repository of protocols* and becomes a *department that
runs*. Concretely, five things change:

| Venture artifact | Becomes | Mechanism (all exist) |
|---|---|---|
| the pool directory | a department | `holon dept create <slug> --profile light` |
| `cron-jobs/<job>.md` (62 of them) | a recurring routine | `holon routine import <files> --dept <slug>` |
| `smoke.yaml` | the department's health checks | `[smoke.dept.<slug>]` in `holon.toml` |
| the venture's own records | a genome KB in the department's brief | `holon kb seed <slug> --dept <slug> --blueprint venture-pipeline` |
| the venture's pipeline (leads → applications → outcomes) | the KB's ladders | `genome` verbs: `add`, `move`, `ask` |
| the pool's scripts | the script lane | `routine add --command` (a routine with a command runs in the `script` lane) |
| credentials | department-scoped secrets | `[secrets.dept.<slug>]` (G8, built) |
| the venture directory | the department's reach | `[scope.dept.<slug>] roots` |
| cross-pool dependencies | cross-department requests | `holon msg request` |

The mapping was designed in `2026-10-13-paperclip-contrast.md` §5 and has not
changed. What has changed is that the kernel can now do most of it.

---

## 2. Is jcode fit to serve every workflow? Measured: not yet, and the reason is new

### 2.1 What was measured

| Probe | Result |
|---|---|
| `holon adapter test jcode` (before fixes) | **1/5** — `driver` passes; `plan`, `approve`, `execute`, `verify` fail: *"no result.json and no JSON output"* |
| `holon adapter test jcode` (after repointing the provider to the live gateway) | **1/5** — unchanged |
| A synthetic MCP server that reports whether it can see `HOLON_RUN_TOKEN`, mounted by jcode v0.99.0 | **`TOKEN_VISIBLE:probe-token-`** — the token **is** propagated |
| The **real** `holon mcp` server, mounted through jcode with a **real minted run token** and the driver's exact environment (`HOLON_HOME` + `HOLON_RUN_TOKEN`), using the **live `mcp.json` shape** (`args: ["mcp"]`, no `--home`) | **`{"principal": "employee", "employee_id": "emp_…", "run_id": "run_live01", …}`** — the token reaches the server and authenticates the seat |
| The same server with a **dummy** token | `{"principal": "chair"}` — it falls back to the chair principal, which is why the failure looked like "the token does not arrive" |

### 2.2 The correction: §1.1 of the 2026-10-20 record was wrong

The earlier record claimed, as a proven defect, that *"jcode v0.99.0 does not pass
its own environment to a stdio MCP server child"*, and that the Holon MCP server
therefore authenticates as `chair` and `holon_submit` fails.

**That claim is false, and it is falsified by direct measurement.** jcode v0.99.0
*does* pass the environment to a stdio MCP child. The real Holon server, mounted
exactly as the adapter installs it, saw a real token and answered `principal:
employee` with the correct `employee_id` and `run_id`.

The earlier observation (the server answering `chair`) was an artifact of the
*probe*, not the harness: a token that was never real falls back to the chair
principal, which looks identical to "the token did not arrive". Two errors — an
unreal token and an inference from its fallback — produced a confident diagnosis of
a defect that does not exist. **This is why the AGENTS.md law says to trace a seam
by following a value, not by reading a claim about one.**

The correct statement is narrower and still actionable: *a harness that loses the
token does not fail loudly — it silently becomes the chair.* That is a
**fail-open** defect and it is worth a guard of its own (§2.4).

### 2.3 What actually blocks jcode: the body does not stop

With the token plumbing proven good, the remaining failure is behavioral, and it
is now measured precisely. The plan-stage reproducer (a real dispatch of a real
`plan` stage to a real jcode-driven employee in a scratch instance):

| Measure | Value |
|---|---|
| Wall clock before the kernel's own timeout | **10 min 21 s** (the run never ended on its own) |
| Assistant turns | **19** |
| Tool calls | **36** (33 `bash`, 2 `read`, 1 `skill_manage`) |
| `holon_submit` calls | **0** |
| `mcp_call` invocations | **0** |

What the body *did* do is worth recording, because it shows the brief is not the
problem: it loaded the planner skill, read the org chart, the task, the memory,
the scope, the guards, the plan queue, `whoami`, `status` — and it **explicitly
reasoned its way to the right answer**:

> "My tool list has: bash, read, ls, agentgrep, etc. **No write/edit/apply_patch
> tool.** So I don't have a file-write tool → use `holon_submit`… I'll use mcp_call
> to holon_submit with the result envelope."

It then kept verifying facts ("Let me verify the remaining facts I'll assert in the
plan") and was still exploring when the run was cut. A second session ended the
same way, mid-`read` of the kernel's `staleness.py` — the body was reading
Holon's own source to understand the grading floor, which the brief explicitly
forbids ("Holon's own source code is not an input, so do not read it to plan").

**So the jcode seam is one behavioral defect, not a plumbing one:** the body
explores indefinitely and never commits. The fixes are:

1. **A turn/iteration budget in the driver** — the kernel already kills a harness
   whose result is already in (`drivers.run`'s `alive` hook); what is missing is a
   cap that stops a body that has *not* produced a result, and hands in whatever
   it has.
2. **A budgeted brief** — name the exploration budget ("read the context, the
   skill, and at most three more sources, then submit"), so "reviewable in under
   two minutes" (which the brief already says) becomes enforceable.
3. **A submit-first contract** — the driver already accepts `stdout-json`; the
   plan stage's envelope could be produced from the final message alone. The body
   would then have a path that requires no file-write tool, which is exactly the
   path it identified and then did not take.

### 2.4 The guard this record adds

Two guards, per the repo's law that a defect found by a real run gets a test and a
ledger row in the same commit:

- **`test_the_run_token_reaches_an_mcp_server`** — the token reaches a stdio MCP
  child through a harness. It fails if a harness upgrade silently drops the
  environment. This is the guard the earlier record asked for; it now guards the
  *true* invariant rather than a false defect.
- **`test_a_harness_without_the_token_is_refused_not_promoted_to_chair`** — a
  missing token must not silently authenticate as the chair. Fail-closed, not
  fail-open.

### 2.5 The same defect is in operant, A's *primary* harness

The operant conformance was re-run on 2026-10-20, after the driver was repinned to the
current binary. It scores **1/5** as well — and the trajectory says why, in the same words:

| Measure | operant (plan stage) | jcode (plan stage) |
|---|---|---|
| tool calls | **66** | 36 |
| iterations | **40** (the driver's `--max-iterations 40` cap) | — |
| tokens | 38 188 | — |
| `holon_submit` | **0** | 0 |
| result | `success: false` | no result |

The operant body's own reasoning, at the cut: *"Zero matches — the operant runtime isn't
there… the schema `schemas/plan-result.schema.json` likely lives inside the holon python
package, which I can't locate easily… I'll try one list and one search, then finalize."*

**It was looking for a schema file that the brief had already told it not to look for.**
The brief names the exact path to write (`…/runs/<run_id>/result.json`), gives the exact
JSON shape, and says *"No file-write tool? Call the `holon_submit` tool with it, or end
your final message with that JSON object."* The body spent 66 tool calls searching the
filesystem for a schema instead.

This is the same defect as jcode's, in a different harness: **the body does not read the
brief it was given, and it does not stop.** It is a property of the *body*, not of the
seam, and it now has two independent reproductions.

The fix is the same in both, and it is the same two things:

1. **A turn/iteration cap that hands in what the body has.** operant already has one
   (`--max-iterations 40`) — but hitting it is a *failure* (`success: false`), not a
   submission. The kernel should take the body's final message as the envelope when the
   cap is reached, because the brief already permits that path.
2. **A brief that names the exploration budget**, so "read the context, the skill, and at
   most three more sources, then submit" is a rule the body can follow rather than a
   suggestion it can ignore.

### 2.6 The verdict on "all workflows"

| Workflow class | jcode fit | operant fit | Why |
|---|---|---|---|
| observe stages (research, shape, plan, approve, verify, retro) | **No, not yet** | **No, not yet** | The body does not stop (§2.3, §2.5). |
| execute stage (act posture) | **Unknown** | **Unknown** | Never reached: the plan stage fails first, so the execute clause has not run once against either harness. |
| script lane | **Yes** | **Yes** | No model involved; `holon run-script` runs an approved command. |
| the kernel's own commands (`recall`, `memory`, `events`, `skill`, `playbook`) | **Yes** | **Yes** | The CLI path, already proven in both. |
| `holon_submit` via MCP | **Yes** | **Yes** | Proven for jcode (the real server authenticated the seat); operant carries native `holon_*` tools. |

**Answer: both harnesses can serve every workflow of the genomic-os in principle — the
MCP seam, the CLI seam and the script lane are all proven — but neither can serve any
*model-driven* workflow today, because the body does not stop.** It is one behavioral fix
away from the observe stages, and the execute stage cannot be measured until the observe
stages pass. **This is now a body problem, not a harness problem: two independent
harnesses, one shared failure mode.**

---

## 3. Are the ventures migrated? Measured: no. Here is the exact number.

### 3.1 The corpus

Ten venture pools under `~/.hermes/organism/ventures/`, each with `_org.yaml`,
`smoke.yaml`, `scripts/`, `data/`, and `cron-jobs/*.md`:

| Venture | cron protocols | files |
|---|---|---|
| career-pipeline | 15 | 7350 |
| freelance-agency | 15 | 3600 |
| architectural-leads | 10 | 3328 |
| credibility-funnel | 6 | 264 |
| quant-trading | 4 | 1093 |
| vitality-research | 4 | 42 |
| brand-integrating | 2 | 48 |
| brand-polarizing | 2 | 46 |
| community-loo | 2 | 274 |
| saas-studio | 2 | 69 |
| **total** | **62** | ~16 100 |

A twelfth corpus exists: the organism's own `cron/jobs.json` holds **116 jobs, 50
enabled**, across 15+ `system_pool`s (freelance-engine, job-engine,
design-aesthetics, career-pipeline, hermes-agent-infra, campaigns, medical-research,
architecture, quant-finance, …). These are *runtime jobs with prompts*, not
protocol files — a different migration shape (each needs its intent extracted from
its `prompt`, `skills` and `workdir`, not read off a markdown protocol).

### 3.2 What is actually in the kernel today

| Measure | Value |
|---|---|
| Departments | 2 (`executive`, `tools`) — **neither is a venture** |
| Employees | 4 (Tess, Milo, Cara in `tools`; Oto on probation) — **no venture employees** |
| Routines | 2 (`Disk usage report`, `Notes digest`) — **neither came from a venture** |
| Tasks | 67, of which 14 `incident`, 9 `playbook-refinement`, 7 `python-helper`, 7 `notion-test` — **zero are venture work** |
| `project_ref` set | **0 of 71 tasks** — the key that binds work to a venture/Compass path has never been used |
| KBs | **0** — the genome layer is not bound to any department |
| Runs | 44, last one **2026-10-16** — the kernel has been idle for four days |

**So: zero of ten ventures are migrated. Not partially — zero.** The migration
plan (`2026-10-14-ventures-migration-plan.md`) is still in `proposed` status, and
its five waves never started. The mechanism it depends on — `routine import` —
works: a dry run over career-pipeline's 15 protocols parsed all 15 cleanly,
distinguishing 6 script routines from 9 agent routines and marking the paused ones.

### 3.3 The pilot, as it would actually go

The Chair's standing rule: job and freelance work stay pilot-only, never sending
outreach. The 62 protocols split by that rule:

- **Pilot-eligible now:** career-pipeline (15), freelance-agency (15),
  architectural-leads (10) — 40 protocols, and `job-loop-p4-outreach` is already
  marked `paused` in its own protocol.
- **Pure-agent pools with no outreach:** credibility-funnel (6), quant-trading (4),
  vitality-research (4), brand-* (4), community-loo (2), saas-studio (2) — 22.

The `venture-pipeline` blueprint's `human-only` states (`closed-won` on all three
ladders) encode exactly the Chair's rule at the *record* level, which is stronger
than a cron flag: a won application cannot be recorded by an agent at all.

### 3.4 The gap between "the mechanism exists" and "it is migrated"

| Layer | Ready? | Missing |
|---|---|---|
| Federation (genome) | **Yes** | Nothing. 63/64 on the current CLI, lint clean. |
| Kernel substrate | **Yes** | Nothing structural. Doctor was clean before this session's fixes (8 errors, all stale incidents). |
| Department per venture | **Yes** (`dept create --profile light`) | 10 hires' worth of Chair decisions. |
| Routine import | **Yes** — 15/15 parsed in a dry run | The `--apply` pass, and the `[secrets.dept.<slug>]` keys for the pools that need credentials (G8, built but unwired). |
| Genome KB per venture | **Yes** (`kb seed --blueprint venture-pipeline`) | 10 `kb seed` calls and 10 bindings. **Zero done.** |
| Scope roots | **Yes** (`[scope.dept.<slug>] roots`) | 10 config entries. |
| Smoke checks | **Yes** (`[smoke.dept.<slug>]`) | 10 config entries; the venture `smoke.yaml` files are not in the kernel's format yet. |
| **G4 — Chair-key-free external intake** | **No** | Not built. Without it, a scanner cannot file a lead without the Chair key. |
| **G12 — department export/import** | **No** | Not built. Every venture must be onboarded by hand. |

G4 and G12 are the two that make the migration *repeatable* rather than a
once-only manual effort. They are the recommended build order after the pilot
proves the shape.

---

## 4. What this session changed, and what it did not

> **Later the same day (2026-10-20, evening): the bridge plan's Layer R and Layer M were
> executed** — `docs/plans/2026-10-20-the-bridge.md` in the federation repo, commits
> `2246fe6`, `09ac632`, `9a2807f`. Seven items landed, each with a guard test:
> the body hands in what it produced (R1); the exploration budget is rendered once by the
> kernel into every stage's brief (R2); one adapter-installer seam that refuses a binary
> that cannot start (R3); the import carries 28 of 33 frontmatter fields and drops none
> (M1); the Chair-key-free intake key (M2); the department archive (M3); and the venture
> department builder, which reads a venture's four artifacts in one command (M4).
> **The harnesses still score 1/5 each** — the body does not stop — and the live
> instance's doctor is 0 errors / 1 warning. What remains is the Chair's two decisions
> and the pilot.

### 4.1 Applied (measured, reversible, and each with a passing check)

| # | Change | Check |
|---|---|---|
| 1 | **The operant driver was pinned to a stale binary.** `/usr/local/bin/operant` (root-owned, 2026-10-17) was built against ONNX Runtime `1.20.1`; the current binary, `~/.local/bin/operant` (2026-10-20, `memory-wire 384e238`), needs `1.24.4` — the version the operant repo pins (AD-017) and installs. Both the driver and the smoke check pointed at the stale copy, so **every** operant run died at the loader and the Tools department waited. The fix was to re-run the adapter installer (which pins the binary it is given) and to point the smoke check at the same binary — **not** to downgrade the library, which was correct all along. | `holon adapter test operant --clauses driver` → `pass`; the installer's own verify → `operant 0.2.1 (memory-wire 384e238)`; `holon smoke` → `ok operant harness` |
| 2 | The jcode adapter's provider profile repointed from the dead `127.0.0.1:20129` to the live `127.0.0.1:20128`, and `free-stack` → `large-stack` (the model the gateway routes; the backup is `config.toml.bak-20261020`) | `jcode` reaches the model and answers |
| 3 | `holon skill export` re-run for the jcode and operant adapter homes | `skills.export_stale` cleared (16 → 0) |
| 4 | The `browser` unit manifest moved to `bylaws/units/` | `bylaws.orphan` cleared |
| 5 | Seven stale incident plan stages cancelled, each with a note naming its resolved cause | `graph.unstaffed` cleared |
| 6 | `holon doctor` on the live instance | **8 errors / 2 warnings → 0 errors / 1 warning** |

The remaining warning is `isolation.off` — agents run as the kernel's user, so one
with a shell can read the Chair key. It needs root to fix (`holon isolation plan`
prints the one-time setup). **It is the Chair's action, not mine.**

### 4.2 Not applied, and why

- **`executive` is empty.** Its `ceo` slot (head+planner) is the only plan-capable
  seat in the organization. Hiring the CEO is the Chair's call, and until it
  happens no plan stage can be claimed by anyone. This is now the *only* thing
  between the kernel and running work.
- **Isolation.** Needs root.
- **The heartbeat.** The timer is installed but off, so `doctor` never runs on a
  timer and incidents never open on their own. The Chair's decision.
- **The 62 routine imports.** A dry run is safe; `--apply` creates 62 proposals
  that each go to an approver. That is a population decision, and the Chair's
  standing rule says job and freelance work is pilot-only. Not mine to apply.

### 4.3 The false diagnosis, and what it cost

The earlier record asserted a proven harness defect that does not exist. It
survived a day because it was written in the same confident voice as the measured
facts around it, and because the synthetic probe had used an unreal token. The
correction is §2.2. The generalizable lesson, which the repo already encodes and
which this session re-learned: **a fallback identity is not evidence of a missing
credential** — prove the credential is real before concluding it did not arrive.

---

## 5. The execution order

> **Superseded as an ordering on 2026-10-20 by `2026-10-20-the-bridge.md`** — one plan for
> the whole A-side program, in the federation repo at
> `my-projects/docs/plans/2026-10-20-the-bridge.md`, every row gated. This section's
> measurements stand; its ordering does not.

**Tier A — the kernel runs work (Chair's two decisions, then everything else).**
A1 hire the CEO of `executive` (the only plan-capable seat; without it no stage is
claimable). A2 turn on the heartbeat timer. A3 (root) apply the isolation plan.

**Tier B — the harnesses become usable (build, in this repo).**
B1 **a cap that hands in what the body has**: when a harness reaches its iteration cap
(or the kernel's timeout) with no result, take the body's final message as the envelope
— the brief already permits that path (*"end your final message with that JSON object"*).
Today, hitting operant's `--max-iterations 40` is a *failure*, and jcode's timeout is a
failure; both should be a submission. B2 a **budgeted brief** that names the exploration
budget ("read the context, the skill, and at most three more sources, then submit"), and
that forbids hunting for a schema the brief already contains. B3 the two guards of §2.4.
**Gate:** `holon adapter test jcode` **and** `holon adapter test operant` each reach 2/5,
then 5/5. **Both harnesses must pass — one passing proves nothing about the body.**

**Note on priority.** B1 and B2 are the *only* items on this list that no decision gates,
and they are the only thing between A and running work at all. They should be done before
Tier C, not after: a pilot venture whose harness cannot complete a plan stage proves
nothing about the migration.

**Tier C — the pilot venture (Chair's ruling D5, then execution).**
C1 `dept create career-pipeline --profile light`, three hires, one KB
(`kb seed --blueprint venture-pipeline`), scope roots, smoke checks.
C2 `routine import` its 15 protocols (10 agent + 5 script), approve the agent ones.
C3 wire `[secrets.dept.<slug>]` for the pool's credentials.
**Gate:** the pool's 15 protocols fire as Holon routines, and the KB's ladder
carries the pool's real leads.

**Tier D — the rest of the corpus, in waves.**
D1 the other 9 venture departments (47 protocols), by pool.
D2 the organism's 116 runtime jobs — a different shape (prompt extraction, not
protocol parsing), sequenced after the protocol corpus is proven.
D3 **G4** (Chair-key-free intake) so scanners can file leads unaided.
D4 **G12** (department export/import) so a new venture is one command, not a day.

**Tier E — the governance closure.**
E1 the overlay's `[federation]` block (V-25). E2 re-measure the four proof sets
and write the ledger. E3 build the outreach machinery (`tools/deslop.py`,
`tools/cleanse.sh`, the prospect store) — the three Chair fields (price band,
approval threshold, sample size) are blanks, not guesses.

---

## 6. The probes this record rests on (2026-10-20, all re-runnable)

| Probe | Command | Result |
|---|---|---|
| Doctor | `holon --home ~/holon doctor` | 8 errors/2 warnings → **0 errors/1 warning** |
| Smoke | `holon --home ~/holon smoke` | `ok model gateway`, `ok operant harness` (after the driver was repinned to the current binary) |
| jcode conformance | `holon --home ~/holon adapter test jcode` | **1/5** (driver passes; plan/approve/execute/verify fail) |
| operant conformance | `holon --home ~/holon adapter test operant` | **1/5** — same failure mode, 66 tool calls, 40 iterations, 0 submits |
| Token propagation | a synthetic MCP server under jcode v0.99.0 | `TOKEN_VISIBLE` — the token reaches a stdio MCP child |
| Token propagation (real) | the real `holon mcp` server, live `mcp.json` shape, a real minted run token | `principal: employee`, correct `employee_id` and `run_id` |
| Token propagation (control) | the same with a dummy token | `principal: chair` — the fail-open fallback |
| Body behavior | a real `plan` dispatch to a jcode employee, session journal | 10 m 21 s, 19 turns, 36 tool calls, 0 submits |
| Body behavior (operant) | the operant trajectory of the conformance plan stage | 66 tool calls, 40 iterations, 38 188 tokens, `success: false`, 0 submits |
| Routine import (dry) | `holon routine import <career-pipeline protocols> --dept tools` | 15/15 parsed; 6 script, 9 agent, 6 paused |
| Migration state | `work.db` read `mode=ro` | 2 departments, 4 employees, 2 routines, 67 tasks, **0 project_ref**, 0 KBs |
| Federation | `genome lint` in `my-projects` | 0 errors, 8 pre-existing W006 warnings |

## 7. What this record supersedes

**`2026-10-20-the-a-side-program-boundary-and-solutions.md` §2 Tier 1**, whose §1.1
is falsified above and whose §1.3 is superseded by §2.3's measurement. That
record's Tier 0 (§2.1 here — items 1, 2, 3, 5 and the incident cleanup — is now
**applied**), Tier 2 (the governance layer) and Tier 3/4 stand unchanged.

The **2026-10-14 ventures migration plan** and the **2026-10-13 paperclip contrast
§5** mapping stand: the mechanism mapping has not changed; only the state's
moved — the kernel can now do most of it, and none of it has been done.
