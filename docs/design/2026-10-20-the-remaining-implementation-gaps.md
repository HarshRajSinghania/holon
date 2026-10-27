---
status: active
date: 2026-10-20
description: "The identified implementation gaps, measured: why both harnesses score 1/5 (it is NOT the body exploring — the body submits correct work and the MCP client corrupts it), and what is left before the ventures' migration can start."
tags: [gaps, conformance, harness, migration]
---

# The implementation gaps, and what stands between here and the migration

Status: **active**. Date: 2026-10-20. Scope: A only (the kernel and this overlay).

This is the outline of the gaps that remain, measured today — and it **corrects the
diagnosis in the earlier records**. The earlier records said the harnesses score 1/5
*because the body does not stop*. That is half true and it is the less important half.
The decisive finding is below.

---

## 1. The headline: the body was never the problem

Measured on 2026-10-20, from the conformance run's own session journal and the kernel's
rejection message.

### 1.1 What the conformance suite says now

```
pass  driver     reaches the brief via {briefing}; serves every stage
FAIL  plan       no approval stage after the plan (work open)
FAIL  approve    no approval was routed to the CEO (did the plan clause pass?)
FAIL  execute    no execute stage was claimable (was the plan approved?)
FAIL  verify     no verify stage was claimable
```

Compare with the earlier measurement, before R1 and the schema fix:

```
FAIL  plan       no result.json and no JSON output
```

**The message changed.** Before, the kernel found no envelope at all. Now it finds an
envelope and rejects *its contents*. That is R1 and the schema fix working: the body is
now handing something in.

### 1.2 What the body actually did

The session journal for the conformance run (`session_penguin_…`):

| Measure | Value |
|---|---|
| assistant turns | 21 |
| tool calls | 33 (23 `bash`, 8 `mcp_call`, 1 `read`, 1 `skill_manage`) |
| MCP calls | 8 — `holon_dept_roles` ×2, `holon_emp_card` ×2, `holon_playbook_list`, `holon_playbook_show`, `holon_law_show` ×2 |
| `holon_submit` calls | **1** |
| the body's own words, before it submitted | *"I have everything I need. Grading reference, policy contract, org chart, work item, and target directory state are all confirmed. **Submitting the plan now.**"* |

The body **read the brief, used the MCP server correctly, produced a plan, and
submitted it.** It did not explore forever. It did not need to.

### 1.3 Why the kernel rejected it

The submit came back with:

```
'steps' must be a non-empty string or list
'writes' must be a list
'external_effects' must be a list
'context_refs' must be a list
'learnings' must be a list
'decisions' must be a list
'proposals' must be a list
```

Seven fields, all lists — and the body *had* sent lists. The tool call the client
actually transmitted:

```json
{"result": {
  "steps":           {"item": ["Confirm the target directory before writing: …"]},
  "writes":          {"item": ["…/work/conformance.txt"]},
  "external_effects":{"item": []},
  "context_refs":    {"item": ["…/context.md", "…/policy.json", …]},
  "learnings":       {"item": [{…}]},
  "decisions":       {"item": {…}},
  "proposals":       {"item": {…}]}}}
```

**Every list was wrapped in `{"item": …}`.** Proved against the contract directly:

```
the body's envelope (correct lists):  VALID
the same envelope as jcode sent it:   REJECTED — 'steps' must be a non-empty string or list; …
```

### 1.4 The cause, and it is in the kernel's hands

`holon_submit`'s published schema (`holon/mcp.py`):

```json
{"name": "holon_submit",
 "inputSchema": {"type": "object", "required": ["result"], "properties": {
   "result": {"type": "object", "description": "the result envelope (see the brief's Output section)"},
   "run_id": {"type": "string", …}}}}
```

`result` is a free-form object with **no `properties`** — so the client is told nothing
about which fields are lists. A client that coerces an untyped array to a typed object
wraps it as `{"item": …}`; that is exactly what happened.

**The kernel already knows the right shape.** `holon/core/contract.py` holds it, and
R1's schema fix renders it *beside every brief* as `envelope.schema.json` — a complete
JSON Schema with `"steps": {"type": "array", …}`, `"writes": {"type": "array", "items": {"type": "string"}}`,
and so on. The body read it (it cited it in `context_refs`).

**The gap is that the MCP tool does not publish the schema the body already has.**
The body gets the contract from a file it must find; the *tool* gives the client
nothing, so the client guesses. The two paths disagree, and the client wins.

### 1.5 What this changes

| | earlier records said | measured today |
|---|---|---|
| why 1/5 | the body does not stop | the body **submits** correct work; the **client corrupts the arrays** and the kernel rejects it |
| the fix | a turn cap, a budget | **publish the contract in `holon_submit`'s schema** — and make the server tolerant of the wrapper |
| where | the harness | the kernel's MCP tool schema, and its result reader |

The budget (R2) and the schema beside the brief (R1's schema fix) are both right and
both landed. They are not sufficient, because the tool call is the *other* way in, and
that way is still unguarded.

### 1.6 The two repairs, and which is which

- **A. The tool publishes the contract.** `holon_submit`'s `inputSchema` names the
  stage's real envelope schema — the same one `contract.schema_text(stage)` renders
  beside the brief. The server knows the stage: it resolves the run before it needs the
  result, and the run knows its stage. A client that coerces then has the field types
  to coerce *to*, and cannot invent `{"item": …}`.
- **B. The server accepts the wrapper.** A list that arrives as `{"item": [...]}` is
  unwrapped before validation. This is belt-and-braces for A: it makes the seam tolerant
  of a client that coerces anyway, and it means **a body that spent twenty minutes
  producing a plan does not lose it to a shape detail**.

B alone would unblock the migration today. A alone would prevent the next occurrence.
**Both are small; B is the one that matters now, A is the one that stops it recurring.**

---

## 2. The full gap outline

Every row: what it is, how it was measured, and the gate that closes it. Ordered by
what unblocks the migration, not by what is easiest.

### 2.1 Tier 0 — the harnesses cannot complete a stage (the migration's gate)

| # | Gap | Measured | Repair | Gate |
|---|---|---|---|---|
| **0.1** | The MCP client wraps every list in `{"item": …}`, and the kernel rejects the result | conformance: `no approval stage after the plan`; the session's tool call shows all seven fields wrapped; the contract rejects the wrapped shape and accepts the body's | **B**: unwrap `{"item": …}` in the submit path; **A**: publish the stage's envelope schema in `holon_submit`'s `inputSchema` | `holon adapter test jcode` reaches **2/5**; `holon adapter test operant` reaches **2/5** |
| **0.2** | The body still explores before it submits | 21 turns, 33 tool calls, 8 MCP calls before one submit | **B** removes the incentive to keep looking (a rejected plan means starting over); the budget (R2) already says "at most three more sources" | the plan stage submits within N tool calls on both harnesses |
| **0.3** | The operant harness's own client may coerce the same way | measured today: 1/5, 66 tool calls, 40 iterations, 0 submits — but the *reason* is not yet traced the way jcode's was, because operant's tool surface is native (`holon_*`) rather than the MCP client | trace it with the same probe as 0.1 | `holon adapter test operant` reaches 2/5 |
| **0.4** | The conformance suite cannot see *why* a clause failed | the clause says "no approval stage after the plan" — the rejection's own reasons are in the run, not in the clause | the clause reports the envelope's rejection reasons | a failing clause names the contract violation |

### 2.2 Tier 1 — the kernel's own gaps (the foundation must be sound)

| # | Gap | Measured | Repair | Gate |
|---|---|---|---|---|
| **1.1** | An agent's correct work is discarded over a shape detail | the rejection voided a complete plan | the submit path repairs an untyped list before validating, and **names what it repaired** in the run's log | a wrapped list is accepted and the log says so |
| **1.2** | The live instance was locked out by a renamed migration | `RuntimeError: this instance was migrated by a newer Holon (unknown work migrations: 0017_intake_source.py)` | the record was renamed to match what ships; **the lesson**: a migration's *name* is part of its identity, so renaming one is a breaking change | the live instance and the checkout agree on every migration name |
| **1.3** | A kernel rebuild of a table that others reference needs its foreign keys off | the runner now defers them for every migration | already done | `test_pre_graph_instance_converts` passes |
| **1.4** | The kernel's own lint and the genome lint disagree about where a file lives | `E010 register V-51: evidence 'adapters/install_lib.py' missing` — the file is in the *other* repo | evidence paths name the repo they are in | `genome lint` clean |

### 2.3 Tier 2 — the Chair's decisions (nothing else waits on these)

| # | Gap | Measured | Why it blocks |
|---|---|---|---|
| **2.1** | `executive` has **no CEO** | `dept roles executive` → all four slots vacant; the `ceo` slot (head+planner) is the only plan-capable seat in the organization | **nothing is claimable.** Every stage in the migration needs a planner |
| **2.2** | The heartbeat is off | the timer is installed and disabled | `doctor` runs only when a person runs it, so the incidents this work opens never open themselves, and no routine fires on a timer |
| **2.3** | Isolation is off | `WARN isolation.off` — agents run as the kernel's user, so one with a shell can read the Chair key | needs root; the safety floor, not a blocker for the migration |

### 2.4 Tier 3 — the migration's own remaining work (the mechanism is built; the population is not)

| # | Gap | Measured | Gate |
|---|---|---|---|
| **3.1** | No venture runs | 0 of 10 migrated; 0 KBs; the instance's 2 routines are the operator's own, not a venture's; **0 of 95 tasks carry a `project_ref`** | the pilot's gate (the bridge plan's M5) |
| **3.2** | No venture has a knowledge base | 0 KBs seeded; the `venture-pipeline` blueprint exists and is verified but is bound to no department | a KB per venture, its ladder carrying a real record |
| **3.3** | No venture has an intake key | the mechanism (M2) is built; no key is issued | `holon intake list` shows a floor per department |
| **3.4** | The Chair has approved no routine | the builder lands every routine **unapproved** — by design | one approval per routine, the Chair's |
| **3.5** | The organism's 116 runtime jobs are a *different* migration | 116 jobs, 50 enabled, across 15+ pools: they carry a `prompt`, not a protocol | out of scope for this plan; sequenced after the 62 |

### 2.5 Tier 4 — what the earlier records got wrong (so it is not repeated)

| # | The claim | What is true |
|---|---|---|
| **4.1** | "jcode v0.99.0 does not pass the run token to the MCP child" | **false** — proved three ways: a synthetic probe, the real server with a real minted token (`principal: employee`), and a live run's 8 successful MCP calls. The earlier probe used an unreal token, and an unreal token falls back to the chair principal, which looks identical to a missing token |
| **4.2** | "the body does not stop" | **true but secondary** — the body now submits; it was rejected for a shape reason, and the earlier measurement (before R1) conflated "no result" with "no submission" |
| **4.3** | "the operant library is the wrong version" | **false** — 1.24.4 is what the operant repo pins (AD-017). The stale thing was the *binary* |
| **4.4** | "the agent's own source code is not an input, so the body must not read it" | **the schema was both visible and forbidden** — the body spent 66 tool calls hunting a file that existed. Now the schema is beside the brief |

---

## 3. What is left before the migration can start

The short answer, in order:

1. **Fix the shape gap (0.1) and re-measure both harnesses.** Until a plan stage
   completes, every claim about the migration is untested — a venture's routine would
   fail the same way.
2. **Hire the executive CEO (2.1).** Without a plan-capable seat, nothing is
   claimable. This is one command and the Chair's.
3. **Turn on the heartbeat (2.2).** Otherwise a routine never fires and an incident
   never opens.
4. **Then the pilot (3.1–3.4).** The mechanism is built and verified against the real
   corpus: one command reads a venture's four artifacts, 62 protocols land with their
   skills intact, the YAML reader matches a real YAML library on every pool file, and
   the outside-reach check finds **15 of 15** of career-pipeline's protocols reaching
   outside — so all 15 would land disabled, waiting for the Chair. That is the standing
   rule working mechanically.

**And the isolation setup (2.3) can run in parallel** — it needs root, it is the safety
floor, and it is not on the migration's critical path.

### The gate that says "the migration can start"

```
holon adapter test jcode    → 2/5 (the plan stage completes)
holon adapter test operant  → 2/5
holon dept roles executive  → the ceo slot is filled
holon doctor                → 0 errors
```

### The gate that says "the migration is done"

```
10 venture departments exist, each with a KB, a scope, an intake key and its protocols
62 protocols are running or explicitly retired
every venture's ladder carries its real records
the three zeros, all measured: 0 KBs bound to a department, 0 venture-owned routines
(the instance's 2 routines are the operator's own), 0 tasks carrying a project_ref
```

---

## 4. The measurements this outline rests on (2026-10-20)

| Probe | Result |
|---|---|
| `holon adapter test jcode` (live) | 1/5 — `no approval stage after the plan (work open)` |
| the conformance session's journal | 21 turns, 33 tools, 8 MCP calls, **1 submit**, the body's own words *"Submitting the plan now"* |
| the tool call as transmitted | all seven list fields wrapped in `{"item": …}` |
| `contract.validate("plan", body_envelope)` | **VALID** |
| `contract.validate("plan", wrapped_envelope)` | **REJECTED** — seven field complaints |
| `holon_submit`'s published `inputSchema` | `result` is a free-form object with no `properties` |
| `envelope.schema.json` (rendered beside the brief) | the complete JSON Schema, with each list's `type: array` |
| `holon adapter test operant` (live) | 1/5 — same failure mode, 66 tool calls, 40 iterations |
| `holon doctor` (live) | 0 errors, 1 warning (`isolation.off`) |
| `holon lint --strict` | 0 errors, 0 warnings |
| the test suite | 444 tests OK |
| `genome lint` | clean |

---

# Addendum, measured 2026-10-21: the shape repair is not why 1/5

Status: **active**. This addendum **corrects the headline above.** The shape defect was real and is
now repaired, but it is not what fails the conformance suite today. Measured again on the live
instance, with every artifact kept (`/var/tmp/ishanp-agentic/keep-conf`).

## A. The decisive run

```
$ jcode run --json --trace … --disabled-tools write,edit,multiedit,patch,apply_patch,replace,bg,selfdev,swarm
…
tool_input  write { "file_path": "…/run_…/result.json", "content": "<a complete, contract-valid plan>" }
Error: Tool 'write' is disabled
[exit] 1
```

`driver.log` is 1214 lines. stdout is 31 bytes. There is no `result.json`, and **zero** Holon tool
calls — the MCP server is mounted and healthy (`tools/list` returns `holon_submit` with the repaired
schema, and a run token reaches it), the body just never reached for it, because the brief named
`$result_path` first and its first attempt at that path was refused.

**So the cause is not the MCP client's coercion. It is that the observe posture removed the only
hand-in path the brief named first**, and the body had no second path in front of it.

## B. A second, separate defect (the operant body's own lesson)

A second real run's body recorded, in its `refusals[]` and its `learnings[]`:

- `aft_bash … neither an allow entry nor a standing grant and the seat is in lockdown mode` — the
  observe policy carried `commands: []`, so even a read-only probe was refused, and the kernel then
  read that refusal as a blocker.
- `holon_task_show`, `holon_memory_search`, `holon_dept_roles` and `holon_submit`'s `run_id` all fail
  with `unrecognized arguments` — a runtime builds `--slug` from the property name the MCP schema
  publishes, and the CLI takes it positionally.

## C. What was repaired, in this order

| Gap | The defect, measured | The repair | Guard |
|---|---|---|---|
| **G-d** | an observe policy carried `commands: []`; a read-only probe was refused and read as a blocker | `policy.observe_commands()` — a fixed read-only vocabulary (`ls`, `cat`, `stat`, …) rendered into the observe posture's `policy.json`; a department's own `[scope] commands` and `act_commands` are ignored, so no scope edit can widen an observer into a writer. The brief renders the same list under "Reading what you plan", so the machine policy and the prose cannot disagree | `test_an_observe_stage_can_probe_what_it_reads`, `test_the_observers_commands_are_the_read_only_vocabulary_and_nothing_else`, `test_a_read_only_command_list_is_enforced_nothing_else_is_an_act`, `test_a_brief_tells_the_observer_it_may_read`, `test_an_act_stage_brief_does_not_promise_read_only_commands` |
| **G-b** | `_result_schema()` read only `oneOf`, so every stage except `plan` published a free-form object — and the stage-less server (no run token, the one a hand probe hits) published nothing at all | `_properties_of(stage)` flattens both renderings of the contract (a single object and a `oneOf` over variants); `_result_schema_for_stage(None)` publishes the union of every stage's, so a server that cannot tell its stage still tells the client the field types | `test_the_published_schema_names_the_envelopes_fields`, `test_a_list_field_is_published_as_an_array`, `test_the_stage_less_server_publishes_types_too`, `test_a_real_submit_call_is_accepted_against_the_published_schema`, `test_the_field_a_body_declares_empty_is_published` |
| **G-c** | the kernel publishes `slug` as the property name, and a runtime derives `--slug` from it; the CLI took it positionally and answered `unrecognized arguments` | `cli._positional_flags()` rewrites `--name value` to the bare value where the invoked command names `name` as a positional. An unknown flag, and a name belonging to another command, are left to fail — the tolerance is scoped to what the command itself declares | `test_a_named_property_sent_as_a_flag_is_accepted`, `test_a_property_that_is_not_a_positional_keeps_failing`, `test_the_submit_run_id_flag_is_normalized` |
| **G-a** | the observe posture disabled every file tool while the brief named `$result_path` first | the jcode driver keeps the file tools in observe. The fence is not the tool list, it is the kernel's own working-directory guard, which snapshots the workdir and **excludes the run directory** — proven, not asserted. `read_only_enforced` stays `false`, so the guard still runs. The planner brief now names `holon_submit` first and the file path second | `test_a_body_writing_its_own_result_is_not_a_read_only_breach`, `test_the_driver_keeps_a_write_path_in_the_observe_posture` |

## D. What this changes about the earlier claims

| the earlier record said | measured 2026-10-21 |
|---|---|
| the MCP client corrupts the arrays and that is why 1/5 | real, repaired, **not the cause** of the suite score |
| "the body does not stop" | it stops because its hand-in path was removed |
| the operant failure is the same as jcode's | false: operant adds a refusal and a broken argument mapping |
| jcode's 1/5 → 2/5 after the shape fix | correct but transient: a reproducer reached the approval queue, the suite itself still 1/5 |

## E. The gates

The A-side program's gate was **2/5 on both**. Measured 2026-10-21 after these four repairs (plus the
fifth, §H): **jcode reaches 5/5 and operant reaches 5/5** — the full pipeline on both, plan graded
and the working directory untouched, an approval that gives reasons, an execute that writes and
proves the file, and a verify that closes the work. The gate is met with margin on both.

## F. What was measured after the four repairs

With G-a through G-d deployed (the installers re-run, not hand copies), both harnesses ran the whole
pipeline rather than dying at `plan`.

### jcode: 5/5, measured 2026-10-21

```
pass  driver     reaches the brief via {briefing}; serves every stage
pass  plan       valid plan, graded G0, working directory untouched
pass  approve    decision: approve (…)
pass  execute    conformance.txt written; outcome success
pass  verify     verdict pass; work done
```

The approve decision is a real one, not a rubber stamp: it names what it checked against the work's
own acceptance criterion, the context's constraints and the plan's grade. The two hand-in paths in
use were `final message` (plan) and `result.json` (approve, execute) — the body used more than one,
which is what the reordered brief now asks for.

### The measurement's own ceiling, and why a false 1/5 was recorded

A caller whose shell budget is shorter than four stages of real work gets the harness killed
mid-clause and the run reads `FAIL plan — no result.json`. On the way here that produced a false
"1/5" for a harness whose plan, approve and execute stages had all completed and whose verify stage
was simply still running — a measurement of the caller's patience mistaken for a measurement of the
contract.

So `holon adapter test` now carries its own budget (3600 s, above any single clause's needs — a plan
stage's lease alone is 1800 s), and `--timeout S` lets a caller with less room say so. A clause past
the budget reports `out of time` rather than pretending to have judged the harness. The guard is
`test_a_slow_harness_is_not_reported_as_a_broken_one`.

**What still limits the score, and it is the suite, not the kernel:** the suite's scratch instance
has no `[providers.holon]`, because the driver's profile lives in the adapter home the installer
pins. That is correct — an instance path must never be committed — but it means the suite can only
be run against an instance that has been installed, and that should be stated in the suite's output
rather than discovered by reading a body's driver log.

A reproducibility note for whoever measures next: the first operant runs after the repair read
`4/5`, reporting `no result.json and no JSON output` for the verify clause while the body's own
`result.json` was already on disk and contract-valid (`verdict: pass`). The clause read an earlier
attempt's state and raced the run. Given the suite's full budget the same command reports `5/5`.

### operant: 5/5, measured 2026-10-21

```
pass  driver     reaches the brief via {briefing}; serves every stage
pass  plan       valid plan, graded G1, working directory untouched
pass  approve    decision: approve (…)
pass  execute    conformance.txt written; outcome success
pass  verify     verdict pass; work done
```

The gate is met on **both** harnesses. §H records the fifth gap the operant run exposed, and what a
real body did when three of its hand-in paths were closed to it.

## G. A deploy fault recorded, so it is not repeated

A hand copy of `adapters/jcode/driver.toml` over an installed driver drops the instance's
`JCODE_HOME = "$HOLON_HOME/adapters/jcode/home"` that `install.py` appends. Every run then dies
immediately with `Unknown provider profile 'holon'`, which reads as a harness fault and is a deploy
fault. **Re-run the installer; the installed driver is the artifact the runs use.** The adapter's
README carries the law.

## H. The fifth gap (G-e), and what a real body did about three of them

A live operant observer, measured 2026-10-21, recorded in its own `refusals[]`:

1. `aft_bash` — a read-only probe refused under lockdown. Fixed by G-e (the observe posture's
   allow entry, drawn from the kernel's own read-only vocabulary).
2. `file_write` — its own result hand-in refused under the same gate. Fixed by G-e.
3. `holon_submit` — **both attempts failed with `unrecognized arguments: run_…`**, so the MCP submit
   path was closed to it. The kernel's CLI accepts the positional, so the mismatch is inside that
   binary's native-tool argv builder (see §C); the same class as G-c, one layer deeper, and it
   cannot be repaired from `holon/`.

The body then did the thing the brief now asks for: it handed the envelope in as its **final
message**, and the kernel salvaged it (`[envelope from] stdout-json`, `plan` stage `done`, the
`approve` stage `ready`). Two of the three blocked paths were repaired; the third the body routed
around through the kernel's own tolerance. That is the contract working as designed — and it is
also why the brief must name `holon_submit` first and the final-message path last, rather than
pretending any one path is always available.
