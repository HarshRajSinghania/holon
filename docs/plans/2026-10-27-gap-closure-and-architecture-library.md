---
status: proposed
date: 2026-10-27
description: "The outline-plan for the remaining implementation gaps (S1-S8, D1-D2 from the 2026-10-26 two-repo ponytail audit) and for the documentation library that depicts the system's mastery: the multi-agent orchestration layer that today has zero vocabulary in the four law docs. Every fix-command named here was verified against the live registry and the live instance before it was written down."
tags: [plan, gaps, integration, documentation, orchestration, memory, knowledge-base, automation, portfolio]
related: []
---

# 2026-10-27: closing the integration gaps, then a library that shows the architecture

Status: **proposed outline-plan**.
Because the audit found gaps, this plan does both things the request asked for, in the order that
makes them true: **Part A closes the measured gaps**, and **Part B writes the documentation library**
so that what it depicts is a system that runs, not one whose docs outpace it.

Every number below was measured on **2026-10-26T22:00–23:31Z** and re-checked at 2026-10-27T00:30Z
against the live instance (`mode=ro`, `holon doctor`, direct `sqlite3`) and the `operant` checkout.
The seam's acceptance test is one command — `holon adapter test operant` completing all five
clauses — which today fails at `plan`.

---

## Part A — the implementation gaps (ordered)

The audit is `docs/design/2026-10-26-two-repo-ponytail-audit.md`. Eight integration findings and
two deletable ones. Ordered so that each row's *cause* closes before its *symptom*, because two of
these rows are symptoms of the third and fixing a symptom first hides the cause.

| # | finding | why it ranks here |
|---|---|---|
| S7 | three integration guards `SKIP` when `HOLON_REPO` is unset | **first**: until this is fixed, nothing below can be verified |
| S1 | `holon_submit` published twice; the surviving copy cannot carry `result` | the seam every body walks |
| S8 | observe posture denies every shell tool: no observer can read | the plan clause's second cause |
| S3 | events fixture predates the staffing guard and fails live | stale, one line |
| S5 | 4 of 5 live incidents never close when their cause recovers | the Chair's board lies |
| S6 | `vendor/holon-tools.json` drifted (S1's symptom) | **after** S1, or the drift is written in |
| S4 | 35 of 58 agent tools unreachable to an operant body | product decision, not mechanical |
| D1/D2 | dead `handle_update` trait + unreachable parsers + a second `.bak` | safe, small |

### A1 (S7) — make the live-checked guards actually live

`HOLON_REPO` appears **nowhere** in `.github/workflows/` (measured: grep over `test.yml`, `ci.yml`,
`build.yml`, `release.yml`, `gitleaks.yml`). So `crates/operant-os/tests/{native_tools,api,events,
e2e}.rs` print `SKIPPED (HOLON_REPO unset)` and report `ok`. Proven both directions on the live
checkout: unset → `ok` with a skip line; set → the vendor test **FAILS** naming 60 vs 23.

Steps: add `HOLON_REPO: ${{ github.workspace }}/../holon` (or a checkout step) to `test.yml` and
`ci.yml`, guarded so a missing sibling fails the job loudly rather than skipping. Guard: a test that
fails when `HOLON_REPO` is unset *and* the repo is a sibling, so the skip becomes impossible to ignore.

### A2 (S1+S2) — dedupe `tools()`, and make the guard see the duplicate

`holon/mcp.py` `tools()` hard-codes `holon_whoami` (L188) and `holon_submit` (L190-196), then loops
`agent_commands()` (L197+) which contains both — `AGENT_ALWAYS = ("whoami", "submit")` restores them
over `AGENT_BLOCKLIST` (the `112d95d` unification). The loop never skips an emitted name.

Measured: `mcp.tools()` returns **60** with `holon_whoami` and `holon_submit` each listed **twice**
(indexes 0/59 and 1/55). A client resolving by name — the normal `{t["name"]: t for t in tools()}` —
gets the derived copy: `run_id` + `file`, **no `result`**.

Steps: the derived loop skips a name already emitted. Verified by emulation — count returns
60 → 58 and the surviving `holon_submit` has `result` + `run_id`.
Guard (two clauses, mutation-verified both directions):
1. tool names are unique across `mcp.tools()`;
2. the `holon_submit` a **dict-resolving** client sees has `result` in its properties — which is what
   `tests/test_mcp.py:272`'s `next(...)` cannot see today.

### A3 (S8) — one read surface for an observer

Three lists disagree, measured live: kernel `policy.observe_commands()` = 31 read-only words, no
`aft_*`; harness `observe.toml` `command_allowlist` = those 31 **plus** `aft_bash`, `aft_read`,
`file_write`, `file_list`, `file_search`; harness `seat_policy.decide()` escalates the unclassified
under `Lockdown`. Strictest wins, so the conformance body was refused `aft_bash`, recorded the
refusal correctly, and handed in nothing.

Steps: `observe_commands()` and operant's `OBSERVE_TOOLS` must name the **same** surface. Either the
kernel admits the AFT read tools, or the observe posture's seat geography does — the decision is which
side owns it, and the kernel is the authority that `policy.json` enforces. Guard: a conformance plan
clause that completes, which requires A2 and A3 both closed.

### A4 (S3) — staff the events fixture

`crates/operant-os/tests/events.rs:39-43` approves an `eng` routine with `lane='fast'` and no
employee. The kernel's staffing gate (2026-10-25, `7941b1f`) correctly refuses. One hire line in the
fixture; the kernel needs no change.

### A5 (S5) — close an incident whose check recovered

`_doctor()` (`service.py:2574-2598`) opens `Incident: doctor reports <check>` and its own text says
*"the incident is done when doctor is clean for this check."* No code closes it; `_incident_open()`
only dedupes; the only close path is `task cancel` (chair). Measured live: **4 of 5** open incidents
name checks that now report **0**.

Steps: after the doctor run, close stage-less incidents whose check came back clean (through
`Work._set`, so it is hash-chained). Guard: a test that opens one and watches a clean doctor close it.

### A6 (S6) — regenerate the vendor, **after** A2

23 vendored vs 58 kernel tools, 0 stale, 35 missing, and 3 shared schemas drifted
(`holon_msg_request`, `holon_msg_send`, `holon_submit`). The 3 schema drifts **are** S1. Regenerating
before A2 stamps the broken schema into the vendor and makes the native path's required `result`
argument undiscoverable to a validating client.

### A7 (S4) — the tool-coverage decision (owner)

An operant body has 23 native tools; the kernel considers 58 agent-reachable, none of the missing 35
blocked. The missing set is the knowledge surface: `holon_recall`, all `holon_kb_*`,
`holon_playbook_*`, `holon_law_show`, `holon_task_list`, `holon_plan_queue`, `holon_status`,
`holon_dept_list`, `holon_msg_reply`/`_thread`, `holon_scope`, `holon_route`, `holon_hr_review`,
`holon_bylaws_draft`, and 21 more. The live posture drops the MCP mount when it detects natives, so
there is no fallback.
**Decision:** extend the native set to the agent-reachable list, or keep the MCP mount beside it.

### A8 (D1/D2) — the small safe cuts

`PlatformAdapter::handle_update` has no production caller for any adapter (`gateway/mod.rs:14` says
so); Slack/WhatsApp/Email/SMS carry inbound parsers nothing reaches. ~200 lines. Plus
`holon.toml.pre-reads.bak` (untouched while a parallel session edits it).

---

## Part B — the documentation library

### B0. What the library is for, and the measured reason it is missing

The request is a portfolio library demonstrating mastery of the system's architecture. The kernel
already has strong law docs — INTENT (99), BYLAWS (522), CONTRACT (378), ARCHITECTURE (222),
COMMANDS (219, generated from the registry), 17 design records (3,248 lines) and an 11-skill
library. But a grep over the four law docs for the vocabulary of the multi-agent layer scores:

```
multi-agent   0   orchestrat   0   delegation   3 total   holarchy   3
```

**"multi-agent" and "orchestration" appear zero times in every law doc.** The system *is* a
multi-agent orchestrator — it is the thing the README's first line claims. The architecture exists in
the code, the audit trail and the design records; it is simply not written down as *architecture*.
That is the gap the library closes, and it is why B1 leads the docs.

### B1. The spine: eight architecture chapters under `docs/architecture/`

Each chapter answers one question an interviewer, contributor or future maintainer would ask, and
each cites the mechanism's real file and its guard test. A chapter with no citation is a claim, and
the repo's own `citations` lint pack refuses those.

| chapter | the question it answers | cites |
|---|---|---|
| `multi-agent-orchestration.md` | how work is decomposed, routed, claimed and leased | `execution/work.py`, `bylaws.py`, drivers |
| `roles-and-delegation.md` | departments, slots, authority earned from verified results | `execution/org.py`, `vocab.py` |
| `work-graph-and-holarchy.md` | parent/child work, retries as stages, decomposition | `execution/work.py` |
| `lanes-and-cost.md` | script / fast / full, cheapest-first, the lane gate | `execution/lanes`, CONTRACT |
| `knowledge-and-memory.md` | memory scopes, episodes, consolidation, the KB, recall | `capabilities/memory.py`, `kb.py`, `context.py` |
| `feedback-loops.md` | metrics → retros → playbook refinement → new work | `execution/triggers`, `playbooks.py` |
| `automation-and-scheduling.md` | routines, schedules, cron, triggers, the staffing gate | `execution/schedules.py`, `cron.py` |
| `security-and-trust-boundary.md` | isolation, broker, run tokens, the Chair key | `execution/isolation.py`, `security.py` |

Shipped with a `docs/architecture/README.md` index and a mermaid system diagram, so the library
renders as one navigable object.

### B2. The narrative layer: five operator/design narratives

The chapters say *how*; these say *why, and what it cost* — what a portfolio is actually for.

1. `why-an-organization.md` — the org-as-runtime thesis, extracted from the README's "Why an
   organization" and INTENT, with the comparison table against task-runner agent systems.
2. `the-learning-organization.md` — the full loop, end to end: a plan → execution → verified result →
   learnings → memory → a better next run. With one real instance's numbers.
3. `checking-not-trusting.md` — the verification story: hash-chained audit, rubric grading, earned
   authority, `doctor` on every heartbeat, guards named in the ledger.
4. `the-seams.md` — the harness-agnostic contract and what each real harness does (drawn from the
   adapter READMEs), plus the trust boundary.
5. `operating-it.md` — the runbook: install, hire, approve, read the board, and what to do when a
   stage keeps failing.

### B3. Make the law docs name the vocabulary

Four new rows in INTENT's mechanism table and a §11-equivalent in BYLAWS: **multi-agent
orchestration**, **delegation**, **holarchy**, **lanes**. Law 7 binds every org term to a mechanism,
so the vocabulary earns its place or the lint refuses it.

### B4. The showcase: `docs/architecture/DEMOS.md`

Three reproducible walkthroughs, each with the exact commands and the expected state transition, so a
reader can run them:
1. hire a department, give it work, watch the pipeline (the README's flow, with `task tree` output);
2. a failing run → an incident → a guard → the ledger row (the full self-healing loop);
3. playbook refinement: a verifier failure opening refinement, whose verified change is v2.

### B5. Keep it a library, not a pile

- `docs/PAGE-INDEX.md` gains the architecture section (genome already validates links).
- New records declare genome frontmatter (status/date/description/tags) or lint fails.
- `holon lint --strict` 0/0 and `scripts/genome lint` clean are the gate, and the `tables`, `scrub`
  and `citations` packs all apply — so a chapter that names a file this repo does not carry fails,
  which is what keeps B1 honest.
- No instance or operator specifics anywhere (AGENTS.md law + the overlay rule).

---

## Order of work

| phase | rows | gate |
|---|---|---|
| 1 | A1 (S7) | a live-checked test fires in CI |
| 2 | A2 (S1+S2), A3 (S8) | **the operant conformance plan clause completes** |
| 3 | A4 (S3), A5 (S5) | events suite green live; the Chair's board is true |
| 4 | A6 (S6) | `vendor-is-stale` green with `HOLON_REPO` set |
| 5 | A7 (S4) | owner decision |
| 6 | A8 (D1/D2) | full suite green, `-1,150` lines |
| 7 | B1 spine + index | lint 0/0, genome clean |
| 8 | B2 narratives | genome clean, scrub clean |
| 9 | B3 vocabulary rows | `lint --strict` 0/0, law-7 binding |
| 10 | B4 demos | each command copy-paste-clean |

Phases 1-4 and 6 I can execute now. Phase 5 needs the Chair. Phase 7-10 are writing work whose
*source* is the live system — which is why Part A precedes Part B: the library should depict a seam
that runs.

`net: 8 seams repaired, ~1,150 lines cut, one portfolio library (~1,400 new doc lines across 13 files).`
