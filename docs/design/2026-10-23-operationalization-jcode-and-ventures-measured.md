# The four questions, answered by measurement — operationalization, jcode, ventures, migration

Status: 2026-10-23T23:45Z. Live instance `$HOLON_HOME` (166 tasks, 1544 events), read `mode=ro`.
Universal repo `d84dc95` · 653 tests OK · lint 0 errors / 0 warnings.

Revised twice after the first draft. The first said the migration was at "zero
effective coverage" and that the two cancelled routines were hand-written jobs
proving a Chair ruling. Both were wrong: the two are quant-trading's watch jobs
that predate the ruling, and the pilot pool is staged on the instance with 15
protocols reading clean. A verdict written once and never re-measured is the
failure mode this repo's own register pack names.

The Chair's request had four parts. The ventures survey record answers part of
the migration question and gets one of its claims wrong (§8 says no department
or routine was created on the live instance; `Pioneer` and its six tasks exist,
created 2026-10-21). Parts 1, 2 and 3 were unmeasured. Each question below is
answered with the interface it was measured through and the observed number.

**What I inferred.** "Operational" and "efficacious in agentic workflows" point at
whether a body can *work through* the boundary, not only whether the boundary
holds — so the harness question (2) and the deployment question (1) are both in
scope, and the security half (does the fence hold?) is the one part that was
already sound. The ventures question is answered from the live instance and the
on-disk corpus, not from a plan, because a plan is what §7 of the survey record
already is.

---

## 1. Is the OS operationalized? — Partially. The kernel is sound; the boundary is absent.

| Question | Interface measured | Observed |
|---|---|---|
| does the distribution hold its own rubric? | `python3 -m unittest discover -s tests -t .`, then `holon lint --strict` | 653 tests OK (9 skipped), 0 errors, 0 warnings |
| is the trust boundary deployed? | `holon doctor` on the live instance; the config; the user table; `systemctl --user list-unit-files` | **no** `[isolation]` section, `id holon-agent` → no such user, no runner unit |
| does an absent boundary signal anybody? | the real `Kernel.tick()` on a scratch instance, and the live instance's own `tasks` | before this session: `WARN`, no incident, unattended. Now: `ERRO`, and the live `tasks` table holds `Incident: doctor reports isolation.off`, status **open** |

So: **mechanism sound, system not on.** Four defects stood between them and all
four are fixed with guards (the runner leaked the agent's whole environment; the
harness launcher was granted without the payload beside it; an absent boundary
was a warning the heartbeat drops; `isolation plan` refused to run from the state
it exists to fix). What remains is one root command the Chair runs.

## 2. Can jcode be integrated for all workflows? — Installed and wired, and never dispatched.

| Question | Interface measured | Observed |
|---|---|---|
| is the adapter installed and configured? | the live instance's `adapters/jcode/home/config.toml` and `config/drivers/jcode.toml` | yes — isolated home, the kernel's provider profile, the Holon MCP server, memory/swarm/ambient/updates off |
| has the kernel ever dispatched it? | `select driver,status,count(*) from runs` on the live `work.db`, `mode=ro` | **0 jcode run rows**. drivers present: hermes 28, operant 19, script 5 |
| which harness do employees actually use? | `select name,driver,status from employees` | **7 of 7 bind to `operant`** |
| do the jcode logs prove otherwise? | the three log files under `adapters/jcode/home/logs/` | **no** — and this is the trap. Their first lines name `exe=…/.jcode/builds/…` and `Changed working directory to: …/.jcode/scratch/holon-conformance-*`. They are *my own* local jcode sessions and a scratch conformance instance, since deleted. They are not kernel dispatches |

The honest answer to "for all workflows": **capable and untested in production.**
jcode's conformance suite passes and the driver's flags still exist on the pinned
binary, but no employee runs on it, so "all workflows" is an unproven claim — the
one adapter never exercised by the organization is the one whose gaps would be
found by exactly this integration.

## 3. How would it operationalize the ventures? — Through the vocabulary, with a pilot department standing up the shape.

The units are departments (the org unit), routines (scheduled work), employees
(the people) and the ventures corpus (the pools). The live instance shows the
shape working: a `Pioneer` department, `slug: pioneer`, `mission: pioneer-qf`,
`profile: light`, parented to the executive office, created 2026-10-21.

What that department **does not** have is the part that makes it real: **zero
employees and no scope roots.** It is a container, not a department that can
work — and its only tasks (below) are not the pilot pool's work either.

The migration is therefore one step further along than "nothing happened" and
several steps short of "landed": the pilot's 15 protocols are staged on the
instance with their KB, core and data, and the real dry run reads them 15 of 15.
What is missing is the step that makes them the organization's — a department
holding their scope roots, a routine for each, and an employee bound to run them.
And every one of the 15 reaches outside the organization, so that step is a
ruling about reach, not a copy.

## 4. Are the ventures migrated effectively? — No. Nothing has landed, and the one attempt was a different venture's work.

| Question | Interface measured | Observed |
|---|---|---|
| how much venture work exists? | the 10 pools on disk, each `cron-jobs/*.md` | **62 protocols** (career-pipeline 15, freelance-agency 15, architectural-leads 10, credibility-funnel 6, quant-trading 4, vitality-research 4, brand-integrating 2, brand-polarizing 2, community-loo 2, saas-studio 2) |
| how much is in the live instance? | `tasks` in the `Pioneer` department | 2 routines — `daily-live-monitor` and `weekly-reconciliation` |
| is the pilot pool staged? | `ls $HOLON_HOME/ventures/`, then the real `venture import … --dry-run` on a scratch home | **yes, and this is the number my first draft missed**: `career-pipeline` is staged with all **15** protocols, its `core`, `data`, `kb`, `_org.yaml` and `genome.toml`. It is the only pool there. The dry run reads 15 of 15 with skills, 16 checks, 183 scripts — and **outside reach 15 of 15** |
| what does "outside reach 15 of 15" mean for the answer? | the same survey record's §4, which counts the cadence refusals | every one of the pilot's protocols reaches outside the organization, so an import binds departments to paths this kernel does not serve. That is why the dry run is clean and the apply is not a rubber stamp |
| whose work are they? | their `intent` fields | **quant-trading's**, not career-pipeline's. One pulls a VPS logcheck summary and tails a trade-events CSV; one reconciles the live tape against an expectation band. They watch a live trading system — the shape the re-architecture record already names as `quant:watch` / `quant:metrics` |
| are they running? | their `status` | **both `cancelled`**, created 2026-10-21T15:43Z, the same minute the department was |

So the migration is at **zero running coverage**: 62 protocols on disk, one pool
(15 of them) staged on the instance and reading clean in a dry run, 2 routines
ever created in the live graph, both cancelled, and neither is the pilot's. The
two that were tried are quant-trading's watch jobs, parked in a department whose
mission is the pilot pool — the one attempt that reached the live instance was a
different venture's work, landed in the pilot's container.

`add_routine` now refuses a job whose protocol declares a runtime this kernel
does not serve, the survey predicts its own refusals, and the workdir is
deliberately **not** the gate — an imported department's scope roots are the
pool's own directories, so a pool outside the instance is the normal, correct
case.

## What this record does not claim

- It does not claim the two cancelled routines prove the Chair's ruling. They
  predate it (2026-10-21 against a 2026-10-23 ruling) and they are a different
  venture's work, so they are evidence that nothing has landed — not evidence
  about why. What *did* follow the ruling is `add_routine` refusing a job whose
  protocol declares a runtime this kernel does not serve, with the survey
  predicting its own refusals rather than printing a clean line for a file the
  apply would drop.
- It does not claim the survey record's §8 is wrong to say no department or
  routine was created. It is: `Pioneer` and its six tasks exist on the live
  instance, created 2026-10-21, two days before that record was written. A
  "nothing was created" claim on a live instance is exactly the drift the
  register pack exists to catch, measured from the database rather than from
  the record.
- It does not claim jcode is production-ready. It claims the adapter is
  installed and that the organization has never used it.
- It does not measure whether the boundary *holds against a real agent user*,
  because the agent user does not exist and creating it needs root. That seam is
  the Chair's one command and is recorded as externally blocked rather than
  claimed.
