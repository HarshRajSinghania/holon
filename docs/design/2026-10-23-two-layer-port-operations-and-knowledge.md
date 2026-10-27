# The five systems, ported in two layers — v4

**Written 2026-10-23T23:49Z, red-teaming v3.** The Chair's correction:

> *"the knowledge-base, and operational systems in holon agentic-os are different things.
> Do not conflate the two."*

v3 (`2026-10-23-rearchitecture-into-holon.md`) was right about one thing — the
blueprints exist — and wrong about the shape of the port. It presented a single
phase list in which a reader would seed a knowledge base before creating a department,
treated the outcome ledger as the port's most valuable artifact without noticing it is
the *operational* layer's only knowledge dependency, and mapped two systems to
knowledge blueprints without first asking what they did operationally.

The red-team below names those errors and the reason they are dangerous, then splits
the port in two.

---

## 1. The architecture already separates them, and the numbers show it

Measured against `holon/cli.py` at HEAD: **124 commands. 86 are operational, 22 are
knowledge.** They are not two halves of one system; they are two layers with one seam.

| Layer | What it is | Its machinery |
|---|---|---|
| **Operational** | *who does the work, how it runs, what it may reach* | departments, employees, profiles, roles, the work graph (`plan → approve → execute → verify`), lanes, routines, objectives, units and surfaces, scope fences, the trust boundary, leases and heartbeat |
| **Knowledge** | *what the organization knows, and how it is kept true* | `memory` (scoped, 8 kinds, FTS5, one writer), **KB** (one git repo, typed kinds, a lifecycle), `skills`, `law`, `playbooks`, decisions (AD) and regressions (RG) |

**The seam is exactly one place.** `compile_context`'s `_kb` section: each KB's
`genome wake`, cut to a char cap, lands in the agent's brief beside its task. It is
**additive and degrades to nothing** — with no KB seeded the section simply does not
render. Nothing operational waits on the knowledge layer, and nothing in the knowledge
layer can start, dispatch or approve work.

**So the dependency is one-directional and optional.** The operational layer runs with
zero knowledge bases. That is the fact v3 missed, and it is what makes the two ports
separable rather than merely distinguishable.

## 2. The red-team: four errors in v3

**R1 — v3 would have built the layers in the wrong order.** Its phase list put
"Phase 1 — the records" (42 ADs, 34 RGs) and "Phase 2 — the department, with the
pipeline empty" in sequence, so a reader seeds records into a repository that no
department can reach and no employee works in. Records are knowledge; a department is
operational. **The correct order is operational first, then knowledge bound to it** —
`holon kb seed --dept <slug>` needs a department to exist, and `memory` scopes are
`dept:<slug>` and `emp:<id>`. Get this backwards and every knowledge artifact is
unreachable, which is the same failure the reachability audit (F1–F8) already found in
this distribution.

**R2 — v3 called the outcome ledger "the single most valuable thing this migration
produces."** True, and dangerously framed. The blueprint says the outcome ledger is
the lane score's only input — but the *lane score is a document* (`docs/PIPELINE.md`,
written weekly by a script). **A score in a markdown file is knowledge; the routine
that writes it and the application the row is about are operational.** v3 put the most
operational artifact in a knowledge plan, and a reader would have ported 17,510 rows
before any department existed to hold them.

**R3 — v3 mapped `community-loo` and `credibility-funnel` to knowledge blueprints and
never asked what they did.** The blueprint entries are inferences by *shape* — that was
already flagged as the weakest claim — but the deeper error is the question. Both were
operational systems, and reading their two protocols makes it concrete:
`community-loo` was a **Google Calendar → Telegram notifier gateway** — `loo-events-
notify` scans a Google Calendar every 10 minutes and posts reminders to topic 43, and
`quo-community-pulse` (every 2 hours) is a *"wrapper-script prompt injection pattern"*
whose own skills directory documents the architecture of injecting a cron prompt. Its
`cli/loo-search` is a service the pulse calls. `credibility-funnel` was a **research
engine with six cron protocols** and 8 smoke checks. Their *knowledge* fits `ontology`
and `literature-research`. **Their operations are routines, a surface and a unit — none
of which is a blueprint.** A knowledge blueprint cannot tell you which channel to post
to or what cadence to run.

**R4 — v3 left the strongest evidence out of the document.** The legacy systems were
not merely two things awkwardly adjacent; they were **actively fused**, and the fusion
is measurable in the artifact:

- **60 of 62** cron protocol files shell into a knowledge base by absolute path
  (`python3 ~/organism/organism/ventures/career-pipeline/kb/companies/company_kb.py`).
- `career-pipeline/cron-jobs/job-loop-p1-discover.md` carries its whole operational
  config (cron, employee, toolsets, model, provider, deliver) **and then instructs the
  agent, inline in the prompt body**: *"Company Intelligence KB Seeding (JE-AD-005) —
  DO THIS FIRST"*, followed by those absolute paths.
- The coupling runs the other way too: the KB's own scripts encode the cron loop's
  phases (`p1_acquire`, `p2_nuance`).

**This is exactly the anti-pattern the new architecture removes.** `compile_context`
compiles the brief; the KB's `wake` cut arrives as one section. An employee is never
handed an absolute path and told "DO THIS FIRST". **So the port is not "move both
layers" — it is un-fuse them, and the operational layer is the half that stops being
coupled.**

## 3. The two ports

### Port A — the operational port (the real migration)

Asked: *what does each system DO, and who does it, on the new machinery?*

| The legacy system's operations | The new machinery | Notes |
|---|---|---|
| `cron-jobs/*.md` — 48 protocols, 60 of them fused to a KB | **routines**, one per real job, lane chosen by the classifier | the 12 `*-loop-p*` twins are not created (measured); the 2 cadence refusals are preserved as records |
| 341 `scripts/*.py` (5.5M) — hand-rolled orchestration | **the work graph**: `plan → approve → execute → verify`, lanes, delegation | *do not port.* The scripts were a re-implementation of this |
| one employee per cron job, each with its own inline brief | **employees in the six roles**, with a job description and a memory scope | a routine's work enters at execute with a standing plan; a full routine plans each firing |
| `deliver: telegram:…` in every protocol | **`--deliver`, and `[notify]`** | a dropped send is now detected, not silent |
| `enabled_toolsets: [terminal, web]`, `model`, `provider` per protocol | **the driver and the isolation fence** | the fence is structural, not per-prompt |
| `community-loo`'s calendar→telegram notifier and pulse + `cli/loo-search` | **a routine + a `surface` unit** (category `surface`: the channels an MCP mount, with a per-service contract) | a surface declares `owner`, `effect`, `note`, `args`, `output`, `health` |
| the pools' reach through absolute paths | **`[scope.dept.<slug>]` roots and commands**, pooled units **read-only** | the fence the legacy systems never had |
| `smoke.yaml` checks (2, 16, 2, 8, 2) | **`[smoke.dept.<slug>]`**, unchanged in meaning | a critical failure stops that department's agents |

*Correction, recorded not silently fixed: the first draft of the two rows above said
"telegram pulse every 30 minutes" and listed the smoke counts as (2, 2, 16, 8, 2).
Both were wrong, and both came from writing from memory instead of reading the file.
Measured: the notifier runs **every 10 minutes** and the pulse **every 2 hours**;
the kernel's own `read_venture` gives checks = 2, 16, 2, 8, 2 in pool order. It is the
same defect class this survey has corrected repeatedly — a confident number written
from recall rather than from the artifact.*

**Blocker A1 (the only hard one): Phase 0's department topology.** These five pools
span three operational shapes, not one: three revenue lanes, one calendar→telegram
gateway, one research engine. One department per lane is the natural reading and it is
the Chair's call, not mine.

**Blocker A2: the live-work guard.** 14 rows behind the skip, snapshot 4 days stale.
Refresh before Port A's Phase 4.

**Blocker A3: the 60 fused prompts must be read, not ported.** Every absolute-path
instruction is a coupling to be *dropped*, and each one is a place an agent was told to
reach somewhere the new fence would refuse. Read them for intent; do not carry them.

### Port B — the knowledge port (a separate, later, smaller port)

Asked: *what does the organization know, and where does it stay true?*

| The legacy knowledge | The new machinery | Notes |
|---|---|---|
| `*/core/decisions` (42) + `regressions` (34), 273K | **AD / RG records** via `genome ad` / `genome rg` | supersession edges preserved — `LO-AD-001` is amended in part by `LO-AD-002 §1` |
| the distilled `kb/*.json` + `index.md` | **a KB seeded from the right blueprint**, or memory items at `dept:<slug>` | which of the two is a per-system decision, not a global one |
| 76 core records | **an employee's memory and its playbook** | the rules these systems discovered become what the next run is graded on |
| `kb/runs/`, `kb/worklogs/` | **episodes** (`memory episodes`, searchable run digests) | this is the "what happened last time" that KB-2 found missing |
| `kb/archives` (4,360), `kb/research` (301/14), 372M screenshots, 3 dead `.db` | **the archive of record, in the corpus** | nothing deleted; nothing ported |

**Blocker B1: the blueprint-to-system mapping is now two questions, not one.** For each
system: which blueprint, *and* is this knowledge or operational? Resolved above for the
three revenue lanes (operational first, `venture-pipeline` knowledge second), and open
for `community-loo` / `credibility-funnel`, whose shapes suggest `ontology` /
`literature-research` but whose operations are a gateway and a research engine.

### The seam, stated once

**Port B's artifacts become reachable through Port A's one seam: `holon kb seed --dept
<slug>`, which puts that KB's `genome wake` cut into every brief of that department's
employees.** If a knowledge artifact is not bound to a department, no employee ever sees
it — which is precisely the failure mode the reachability audit's F-rows documented. So
the answer to "when do we do Port B" is: **after Port A's department exists and before
any agent is expected to know anything.**

## 4. The corrected order

| Step | What | Layer | Gate |
|---|---|---|---|
| A0 | the Chair's department-topology ruling | operational | the Chair |
| A1 | create the three revenue departments (profiles, slots, reach) | operational | A0 |
| A2 | hire employees into the six roles; one per real function, with a job description | operational | A1 |
| A3 | recreate the routines by lane; the twins and the refusals handled | operational | A2 + live-work guard |
| A4 | `community-loo`'s surface and `credibility-funnel`'s engine, as a routine + a unit | operational | A0 |
| **B1** | **the 76 records into AD/RG** | knowledge | **A1** (a department to bind to) |
| B2 | the KBs seeded from the right blueprints, bound with `--dept` | knowledge | A1 + B1 |
| B3 | the outcome ledger re-expressed; the lane score produced | both | A3 (the routines) + B2 |
| B4 | retire the fused machinery, per system, only once its department runs | both | all above |

## 5. What this document does not claim

- **Nothing has been created.** No department, no employee, no routine, no KB, no
  record. Read-only throughout.
- **The 86/22 split is a count of commands by name**, a proxy for the layer boundary,
  not a formal taxonomy. The architecture's own separation is INTENT.md's mechanism
  table and BYLAWS §1–§14; the count corroborates it.
- **The "60 of 62 fused protocols" figure counts files containing an absolute kb path
  or a home-relative path**, not the depth of each coupling. One protocol's coupling is
  the whole job; another's is a comment.
- **Port A's mapping is a proposal.** Which systems become which departments, and
  whether `community-loo` is a department or a surface owned by one, is the Chair's
  ruling. v3's blueprint finding stands; it just applies to Port B, not to the whole
  port.
