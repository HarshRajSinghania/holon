# The port, answered in three parts

**Written 2026-10-24T00:17Z, after the Chair's rulings.** Three questions were asked and
they are answered in three parts, then joined at the end.

**Ruled: the blueprint is approved for the OPERATIONAL migration of the selected
ventures. The knowledge-base migration waits for later phases.** This document does not
reverse that. What follows is: how AD/RG, the KB and logging will land once operations
run (Part 1), what in this architecture already prevents systemic regression (Part 2),
and how the work is divided among jcode-native swarm agents without redundancy (Part 3).

**One correction to the premise, made by measurement rather than argument.** The Chair
wrote that the KB *"would comprise of the intelligence gathered by each system like
leads, company-data, etc, which would be a part of the operational system itself."*
That is right, and it is the reason the operational and knowledge ports cannot be fully
separated — see Part 4. It does **not** delay the approved operational work; it changes
what gets built in Phase 1 alongside it.

---

## Part 1 — How AD/RG, the KB and logging integrate

Three different things with three different homes. They are not one framework, and
conflating them is the error the last plan made.

### AD/RG — the organization's own decision record

| | |
|---|---|
| What it is | an immutable record: `Context → Decision → Consequences`. A regression adds `Symptom → Root cause → Law → Detection` |
| Where it lives | `docs/decisions/AD-NNN.md` and `docs/regressions/RG-NNN.md`, minted by `genome ad "<title>"` |
| **Who enforces it** | **`holon lint`'s `ref.guard` pack — and this is the load-bearing part** |

The mechanism, read from `holon/integrity/lint.py:355`: lint reads AGENTS.md's
**Regression ledger**, and for every row it demands a `` `test_<name>` `` that exists in
`tests/`. It also scans every doc for any named guard and fails if that test is gone.
**So deleting a guard fails lint, and a ledger row without a guard fails lint.** The
ledger cannot drift from the tests, and the tests cannot be deleted while a row cites
them.

For a migrated system this is the direct replacement of its `core/decisions/` + `core/
regressions/` — the 42 + 34 records. And the supersession convention is already
identical: the OS supersedes *by name, never an edit*, and `LO-AD-001` already does this
(`**AMENDMENT 2026-09-01 (LO-AD-002 §1)**` inline, `Related` naming it as *"amends §3"*).

**What is genuinely new, and it is the answer to the legacy system's limitation:** the
legacy AD/RG was *documentation about* the system. In this architecture an AD is a row
with a **guard test the distribution runs on itself**, retroactively refused if the guard
is deleted. A legacy AD could be ignored; an AD here has a mechanical consequence.

### The KB — an operational system's own intelligence, bound to its department

| | |
|---|---|
| What it is | one git repository, typed kinds with a lifecycle, states enforced by the kernel, one commit per write |
| How it binds | **`holon kb seed --dept <slug>`** — the KB belongs to a department |
| How it reaches an agent | its `genome wake`, cut to **1500 chars**, rendered in every brief of that department's employees |
| Who writes | the department's employees, through `holon kb run <slug> <verb>`; `--human` moves are the operator's |

**This is the part that answers "leads, company-data".** The Chair is right that this
intelligence is part of the operational system, and the architecture agrees with them:
the KB *is* bound to the department that produces it, and its `wake` cut is the only
knowledge section that reaches that department's agents. So `venture-pipeline`'s
`application`, `gig`, `lead` and `contact` kinds **are** the leads and company data —
typed entities with a lifecycle, not a JSON pile.

**The consequence for phasing, stated plainly:** the operational approval and the KB are
not fully separable, because **a rebuilt revenue lane with no `lead`/`gig` kinds is not
the same operational system.** What is separable is *the knowledge of the other systems*
(the LoO ontology, the credibility research corpus), which is what the Chair deferred.
The outcome ledger and the lane entities are not deferrable; they are the system.

### Logging — three stores, two machine-written and one human-written

Each has exactly one writer, and the kernel never writes the operator's.

| Mechanism | Written by | When | What it answers |
|---|---|---|---|
| **Episodes** | `memory.consolidate`, automatically, at every `execute` result | every run | *"what happened last time on work like this?"* — `holon memory episodes`, FTS5-searchable |
| **The hash-chained audit trail** | `Work._set`, on every status change | every state change | *"who changed this, and was it tampered with?"* — `holon events` is its read surface, and `holon doctor` verifies the chain |
| **The logbook** | **the operator, not the kernel** — `capabilities/logbook/logbook.db` is *"human evidence (read-only to the kernel)"* | whenever the human records something | *"what does the human's own record say about this?"* — it reaches a brief as *"Related logbook entries (human evidence)"* |

Episodes are the replacement for the legacy `kb/runs/` and `kb/worklogs/` — but written
**without an agent being asked to write them**, with a digest and the outcome attached,
and searchable. The legacy system's 213 + 199 run files were read by nothing.

**How the three join.** An episode records that a run happened; the KB's kinds hold what
the run learned as typed entities with a lifecycle; an AD/RG records the rule the run
established, with the guard test that keeps it. One run can produce all three, and only
the first is automatic.

*Correction, recorded rather than silently fixed — and this one matters because the first
fix was also wrong. My first draft listed "the hash-chained audit trail" and
"`holon events` / the logbook" as two rows, implying three mechanisms where the audit
trail and `events` are one thing. I then described the logbook as "the kernel's own event
log", which is also wrong: measured in `holon/core/paths.py`, the logbook is
**"human evidence (read-only to the kernel)"** and no path under `holon/` writes it. So
there are exactly **two machine-written logging mechanisms** (episodes, and the
hash-chained audit trail) plus **one human-written** store the kernel may only read. A
migrated system's `kb/runs/` maps to episodes; the operator's own notes map to the
logbook; nothing maps to a kernel event log, because the audit trail already is it.*

---

## Part 2 — What already prevents systemic regression

The question was: *what system-architecture ensures systemic regression does not happen,
and how does the OS evolve and heal?* It has **seven named loops**, each a sensor, an
actuator, and a mechanism — read from INTENT.md:

| Loop | Sensor | Actuator | Mechanism |
|---|---|---|---|
| **Heal** (minutes) | leases, driver exits, schedule failures | stage back on the board; **incident work for IT** | `holon tick` |
| **Rework** (per work) | verdicts, decisions | `execute#n` / `plan#n` with the feedback in its context | `Work.verify` |
| **Employee** (per run) | every stage's learnings and decisions | memory; record; **earned authority** | `Memory.consolidate` |
| **Department** (on failure, periodically) | rework, failures, colleagues' proposals, metrics | **a retro whose actions become department work** | `holon metrics` |
| **Playbook** (per job, after verified runs) | rubric judgments, verifier failures, judge/verifier disagreement | **refinement work that rewrites the protocol and rubric; the next version is judged** | `_playbook_refinements` |
| **Objective** (per cycle) | results against the key results | new work, new routines, refinement, or closing | `_objective_reviews` |
| **Company** (on request) | department metrics, audit samples, promoted lessons | bylaws and charter changes, **approved like any work** | `holon audit samples` |

**And the regression nets, which are the direct analogue of the legacy AD/RG guard:**

1. **The ledger + `ref.guard`** (Part 1): a defect found by a real run gets a guard test
   and a ledger row *in the same commit*, and deleting either fails lint.
2. **Machine checks a command decides** — `[checks]`, `[checks.dept.<slug>]`,
   `[checks.class.<task_class>]`. After an execute succeeds the **kernel** (never the
   agent) runs them; a failure is recorded as a failed verification, the work goes to
   rework, and **no verifier is spent**. This is "does it still work" decided by a
   command rather than an opinion.
3. **Smoke checks** — `[smoke.checks]` and `[smoke.dept.<slug>]`, run by `holon doctor`
   on a cadence, as the agent user under isolation. A failed critical check **blocks that
   department's agents** until it passes. This is "is the infrastructure there".
4. **The gold standard** — the last verified result of the same job, shown to the
   executor *and* the judge. A regression in output is visible against the artifact that
   was previously accepted.
5. **Doctor + the heartbeat** — every `doctor_every_min`, a failing check becomes an
   incident that reaches the Chair. Doctor is not run only when a person runs it.
6. **`holon lint --strict` and the test suite as the distribution's own gate** — the CI
   runs both on every push.

**The honest difference from the legacy AD/RG.** In the legacy system an AD was a
document an agent might read. Here the same record has a test the gate runs, a command
that decides acceptance, a doctor check that raises an incident, and a retro whose
actions become work. **The rules these five systems discovered over 2026-08 to 2026-10
become, on migration, machinery rather than prose.** That is the whole of the
"evolve and heal" answer, and it is not a promise — it is `ref.guard`, `post_execute`
and `smoke_blocked`.

---

## Part 3 — The swarm: non-redundant jcode-native subagents

Divided by **ownership of a disjoint artifact set**, so no two agents can touch the same
file, and each carries its own verification it runs before reporting. The division is by
*layer of the migration*, not by pool — because pools share structure and pool-parallel
agents would each re-derive the same answers (which is exactly what happened to this
survey's counts three times).

| # | Agent | Owns (exclusive) | Delivers | Its own check |
|---|---|---|---|---|
| **1** | `kernel-guard` | `holon/execution/ventures.py`, `holon/cli.py`'s import path, `tests/test_venture_status.py`, `AGENTS.md` | **the live-work guard**: a dry-run comparator that refuses an apply while any skipped protocol is `active` in a registry snapshot, + ledger row + tests | 2 new guards green; `holon lint --strict` 0/0; mutation-proved |
| **2** | `ops-topology` | `$HOLON_HOME/bylaws/units/*.toml`, `docs/design/*ops*.md` | the department topology for the three revenue lanes + the calendar→telegram gateway: profiles, slots, `--dept` slugs, reach roots | `holon bylaws sync` clean; `holon dept roles` shows the six |
| **3** | `ops-routines` | `holon/personal`'s routine-import dry-run outputs, `docs/design/*routines*.md` | per-lane the routine list *recreated by lane*, with the 12 twins named as not-created and the 2 refusals preserved | a dry-run comparator run showing twins absent |
| **4** | `records-port` | `docs/decisions/`, `docs/regressions/` | the 42 AD + 34 RG records with supersession edges, each row carrying its guard | `genome show <id>` on every record; `holon lint --strict` 0/0 |
| **5** | `kb-bootstrap` | `$HOLON_HOME` KB repos, `genome/blueprints/` | the `venture-pipeline` KB bound to each lane, kinds verified against one real item | `holon kb list`; a `lead` in `trigger` refuses `contacted` |

**The non-redundancy contract, stated so it is checkable:**

- **Disjoint writes, and the one real overlap is named.** Verified against the instance
  layout in `holon/core/paths.py`: KBs live at **`$HOLON_HOME/kb/<slug>/`** and unit
  manifests at **`$HOLON_HOME/bylaws/units/<slug>.toml`** — different trees, so agents 2
  and 5 cannot collide on a file. The one shared path is **`$HOLON_HOME/holon.toml`**,
  which both write (an import adds `[scope.dept.*]` roots; a KB may add config). That
  is resolved by sequence rather than by locking: **agent 2 holds the config for its
  department-creation step, and agent 5's `kb seed` appends after it.** Stated plainly:
  no two agents append to `holon.toml` in the same step.
- **One writer per path**, which is the sync's own contract and the law this repository
  already enforces for its databases.
- **Each agent's check is run before it reports**, not by a reviewer afterwards — the
  swarm guidance in this repository is explicit that reviewers are not spawned.
- **Sequencing is a dependency, not an order:** 2 → 3 and 2 → 5 (a department must exist
  before its routines or its KB); 1 is independent and can run first, because it is the
  guard everything else needs.
- **No agent runs `--apply`.** Agent 1's guard is exactly what makes that safe, and it
  lands first for that reason.

**What is deliberately not delegated:** the department-topology ruling (the Chair's,
Part 4), and the judgement call inside the outcome-ledger mapping (`no_reply` at 4,289
rows has no single blueprint state — it is a design call, not a mechanical one).

---

## Part 4 — The one consequence of the Chair's own correction

The Chair said the KB *is part of the operational system*. Measured, that is the case,
and it changes one thing in the approved phasing:

**A rebuilt revenue lane with no typed `lead`/`gig`/`application` and no outcome ledger
is not the same operational system — it is a department that cannot do the work.** So
within the approved operational migration, the minimum knowledge surface travels with
it: the `venture-pipeline` kinds and the two append-only jsonl ledgers (measured: 56 and
17,510 rows), bound with `--dept`.

**What stays deferred**, as ruled: the `ontology` knowledge of `community-loo`, the
`literature-research` corpus of `credibility-funnel`, and the 76 AD/RG records as a bulk
port. Those are knowledge *about* the systems, not the systems' own operating
intelligence.

**The rule this gives, which is what makes the deferral clean:** *an artifact travels
now if the rebuilt system cannot do its work without it; it is deferred if it is the
system's knowledge about itself.* Leads and outcomes are the former. Ontologies and AD
ledgers are the latter.

## What this document does not claim

- **Nothing has been created.** No department, no routine, no KB, no record, no swarm
  agent. Read-only throughout.
- **The 42+34 AD/RG count is measured; the mapping of each record is not done.** Agent 4
  would do that, and `LO-AD-001` is the one record read in full.
- **The seven loops are read from INTENT.md's table, not from exercising each one.** The
  mechanisms are named with their code sites; none has been run end to end here.
- **The swarm table is a proposed division, not a launched plan.** It is shaped so the
  writes are provably disjoint, but the actual spawning is the Chair's call.
