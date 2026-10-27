# Porting the five systems — core and information, recreate the rest

**Written 2026-10-23T22:59Z, from measurement, not inference.** This supersedes the
import plan's approach for the five pools the Chair named. The instruction changed,
and so the plan changes: **move the core systems and their information, and recreate
the routines, agents and infrastructure on the OS's own primitives, with permission to
redesign naming and functions entirely.**

The previous plan (`2026-10-23-five-pool-import-plan.md`) ported *machinery*: it
would have created 14 routines, 12 of them retired twins. That plan is not wrong about
the hazards — those measurements stand — it is answering a question the Chair has now
withdrawn.

---

## 1. What is actually in these five pools

Measured by directory, not by the pools' own description of themselves.

| Pool | Total | KB (the information) | Skills | Scripts | Data |
|---|---|---|---|---|---|
| career-pipeline | **439M** | 43M (32M without archives) | **372M** | 2.1M | 568K |
| freelance-agency | 37M | 24M | — | 3.4M | 8.2M |
| architectural-leads | 31M | 4.9M | 12K | 436K | 16M |
| community-loo | 2.2M | — | 1.1M | 216K | 60K |
| credibility-funnel | 3.5M | — | — | — | 1.2M |

**85% of the largest pool is browser screenshots.** `career-pipeline/skills/
job-application-automation/screenshots/` is **372M** of a 439M pool. Screenshots are
neither the core system nor its information — they are the exhaust of one old browser
automation run. They are the first thing left behind, and they are what made the pool
look unportable.

## 2. The separation the Chair asked for

**Port (information and core):**

| Artifact | Size | What it is |
|---|---|---|
| `*/kb/index.md` | 8K–34K | the system's own description of its domain and its state |
| `*/skills/*/SKILL.md` | 12K–16K each | **the core system**, as prose: purpose, trigger, data flow, components |
| `*/kb/compound_learning.json` | 8K | distilled learning |
| `*/kb/acquisition_strategy.json` | 28K | the domain strategy |
| `*/kb/source_quality.yaml` | 4K | which sources are trustworthy |
| `*/kb/ARCHETYPES.md`, `market/`, `candidates/` | — | architectural-leads' domain knowledge |
| **`*/core/decisions/` — 42 files, 186K** | 186K | **the core system's architectural decisions** (§3) |
| **`*/core/regressions/` — 34 files, 87K** | 87K | **the incidents that produced those decisions** (§3) |
| `*/core/compass-bridge.yaml` | 4K | the pool's alignment to its parent compass |
| `community-loo/skills/*` (4 skills) | 1.1M, mostly prose | the LoO community system |
| `~/organism/research/kb_base.py` | 21K | the shared KB runtime — **capture it, then replace it** (§3)

**Leave behind (recreate):**

| Artifact | Why it is not ported |
|---|---|
| 372M screenshots, `kb/__pycache__`, `tmp_*`, `*_backup_*`, `repair_backup_*` | exhaust and debris |
| `cron-jobs/*.md` (48 protocols) | the scheduling layer — **recreated as routines on the OS** |
| `kb/archives/` (2635 + 1633 + 92 stale items) | resolved job postings; the decision they led to is the knowledge, not the posting |
| 341 `scripts/*.py` | hand-rolled orchestration; the OS's work graph replaces it |
| `kb/research/` — **301 files, 14 distinct artifacts** | near-duplicate snapshots, 21x duplication |
| `decisions.db`, `freelance_kb.db`, `freelance.sqlite` — **all 0 bytes** | dead; the decisions live in the JSON files |

The one number that should reset expectations: **the whole portable set is under 5MB,**
and the part that carries the thinking — `core/` plus the skills' prose, minus the
screenshots — measures **1,585K (1.55M)**: 273K of decisions and regressions, 1,290K
of skill prose, and 21K of `kb_base.py`. Three of these systems are ~30KB of prose
plus a decision history. They are not 439M systems. They were never the size they
looked.

## 3. THE CORE: `core/` — 76 files, 273K, and the thing that was invisible

**Every one of the five pools carries the same `core/` tree.** This is the shared
architecture, and it is what "the core systems and their information" actually means.
I did not see it at first because the search kept landing on `kb/` and `skills/`.

```
<pool>/core/
├── decisions/     42 files, 186K   architectural decisions (JE-AD-001, LO-AD-001, …)
├── regressions/   34 files,  87K   the incidents that produced them (LO-RG-001, …)
├── compass-bridge.yaml              the pool's alignment to the parent compass
└── worklogs/      one per pool
```

**42 decisions and 34 regressions, 273K total, are the entire intellectual content of
these five systems.** Compare: `career-pipeline/skills/job-application-automation/
screenshots/` is **372M**. The portable knowledge is 0.07% of the bytes it was buried
in.

The substance is real. `LO-AD-001` is not a note — it is a decision with an audit
that found a defect, the specific incident that motivated it (a member's vulnerable
post answered without grounding), a contradictory-protocol conflict it resolved, a
numbered resolution with a pre-send gate, a trade-off named ("slightly more processing
per pulse: loo-search adds 1-2 CLI calls per pulse"), and **a later amendment by a
newer decision that superseded part of it** (`LO-AD-002 §1`, removing the citation
reward after a 66%-citation-rate audit produced channel-register voice). That last
part is exactly the failure mode `LO-AD-001 §3` itself was written to prevent.

### The landing zone already exists

**These records were written in the OS's own decision format.** `LO-AD-001` carries
`Context`, `Decision`, `Consequences`, `Related`, a `Status`, `Deciders` and a `Date`.
The kernel's `scripts/genome` mints exactly that shape, and it mints **both kinds**:

```
AD_BODY = # {{ID}}: {{TITLE}}
  ## Context
  ## Decision
  ## Consequences

RG_BODY = # {{ID}}: {{TITLE}}
  ## Symptom
  ## Root cause
  ## Law
  ## Detection
```

So the core ports natively, with no new primitive: 42 decisions become AD records
(appended, immutable, superseded by name — which is the amendment behaviour they
already use), and 34 regressions become RG records. `genome ad "<title>"` mints the
next number from the template into `docs/decisions/`, and `docs/regressions/` takes
the RG records.

**And the supersession convention is already identical in both places.** The OS's
`docs/decisions/README.md` states it: *"Correcting a decision means minting a new AD
that supersedes the old one by name — never an edit."* `LO-AD-001` does exactly that,
twice: it carries an inline `**AMENDMENT 2026-09-01 (LO-AD-002 §1):**` note where the
amending text lives, and a `Related` block naming `LO-AD-002` as *"amends §3".* The
record and its amendment both survive. A port that flattens this would be a port that
loses the thing these documents are best at.

### The blocker nobody has named: `kb_base.py`

**All three KB runtimes import a shared library that lives outside the corpus.**

```
architectural-leads/kb/kb.py  →  sys.path.insert(0, ~/organism/research)
                              →  from kb_base import parse_frontmatter, write_item,
                                  apply_lifecycle, generate_domain_views, ...
```

`~/organism/research/kb_base.py` is **527 lines** and is the entire KB runtime:
front-matter parsing, item lifecycle, view generation, index generation, run logging.
`research/` contains only that file, its `__pycache__`, and `car-suv-2026`.

This is a genuine port blocker with three consequences:

1. **A KB moved without `kb_base.py` is inert.** The `kb.py` wrappers are thin by
   their own design — "All domain-specific logic lives here; shared infrastructure
   comes from `kb_base.py`." Porting only what is inside `ventures/` ports an
   unloadable file.
2. **`~/organism/research` is not in the sync's trees**, so it is a fourth location
   that must be captured, and it is the one place the three pools share.
3. **The KB runtime is replaceable, and that is the opportunity.** 527 lines of
   hand-rolled file-and-json plumbing exists to answer questions the OS already
   answers natively: *what do we know*, *what did we decide*, *what did we learn*.
   The OS has `memory` with an FTS5 index, eight memory kinds including `decision`,
   `lesson` and `open_question`, scoping, one writer, and provenance. **The correct
   port is not `kb_base.py` — it is the KB's *content*, laid onto memory.**

## 4. The map: hand-rolled → native

| The pool built | The OS already has | The port |
|---|---|---|
| `kb_base.py` + `kb.py` + JSON item store | `holon memory` (FTS5, scoped, provenance, 8 kinds) | items → memory items at `dept:<slug>` scope; decisions keep their `reasoning` |
| `cron-jobs/*.md` (48 files) | `holon routine add` (script/fast/full lanes, event triggers) | **recreate**: one routine per real job, chosen by lane, not by cron syntax |
| `skills/*/SKILL.md` | `holon skill` (versioned, forked per department, `skill new/check/export`) | **port as-is**: the SKILL.md is already the right format. Fork to the department layer |
| **`core/decisions/`, `core/regressions/`** | **`genome ad` / `genome rg`** — the OS's own AD and RG kinds, at `docs/decisions/` and `docs/regressions/` | **port natively**: 42 ADs + 34 RGs, already in the target format (§3) |
| `scripts/*.py` (358 files across the five: 169+172+10+7) | the work graph: `task` → `plan` → `execute` → `verify` → `grade` | **do not port**. The scripts were orchestration; the graph is orchestration |
| `sub-systems/*` (lead-orchestration 8.1M) | departments + routines + the work graph | **recreate** the behaviour, not the tree |
| `community-loo/core/` (decisions, feeds, regressions) | AD/RG records + routines | **port the decisions**, recreate the rest |
| `pipeline-state.md`, `compass-alignment.json` | `holon status`, objectives and key results | **recreate**: state is a view over the graph, not a file to sync |
| one employee per script | `holon hr hire` + employees with `--task-classes` | **recreate** agents against classes, one reuse in place of one-per-script |

## 5. What the OS gives that the old systems could not

This is the token-efficiency argument, and it is measurable rather than rhetorical:

- **A KB search costs an FTS5 query.** `memory.search` over 8 kinds with scope
  filtering replaces loading a 24M tree.
- **A skill render is one call.** `skill invoke` renders the skill for the employee
  and records the use, replacing 341 scripts' worth of "read this file, then that
  one".
- **A job is a lane, chosen by the classifier.** `routine add` picks script/fast/full
  by what the job actually is, instead of a cron line plus a hand-written prompt.
- **A playbook is refined by the kernel.** `holon/capabilities/playbooks.py` gives a
  routine a protocol + rubric that improves from verified outcomes — the thing
  `compound_learning.json` was a static, hand-maintained imitation of.
- **The work graph does the orchestration.** `plan → execute → verify → grade` is
  what `p1_acquire_batch2.py`, `p2_nuance_score_run.py` and their 23 dated siblings
  were reimplementing.

## 6. The phased port — information first, always

**Phase A — capture the information (read-only, no OS writes).**
Copy `kb_base.py` and the portable set into one place: 76 `core/` records, the skill
prose, the KB indices and the distilled JSON. Record which KB items are live vs
archived, and parse every AD's supersession edges (`LO-AD-001`'s `Related` block is
where they live). Nothing is deleted from the corpus; nothing is written to an
instance. Deliverable: a manifest of what ports, with counts.

**Phase B — land the core in the OS's own kinds.**
42 decisions → AD records via `genome ad "<title>"` (they land in `docs/decisions/`),
34 regressions → RG records (`docs/regressions/`). The skill prose → `skill fork`
into the department layer. **Verify by reading back through the OS's own surface** —
`genome show <id>`, `genome find decision`, `skill show`, `memory search` — not by
diffing files. A record that exists but is not reachable through those commands has
not ported.

**Phase C — recreate the core system's behaviour on the graph.**
One pool at a time, starting with **`community-loo`**: it is the smallest (2.2M), its
core is 3 decisions and 7 regressions rather than a 24M KB, it has **0 routines that
would import**, and its two cron jobs both refuse on cadence — so there is nothing to
lose and the whole surface is the recreation. Build the department, the routines by
lane, one employee per real function, and the LoO skill set forked in. Then measure:
the old system's own run records are in `kb/runs/`, so the port's token cost per job
is comparable rather than merely asserted.

**Phase D — retire the machinery that is now redundant.**
Only after C is green for a pool: the pool's `scripts/`, its `cron-jobs/`, and its KB
runtime. The corpus stays intact as the archive of record; nothing is deleted.

## 7. The blockers, ranked

1. **`kb_base.py` lives outside the corpus and outside the sync's trees.** Until it is
   captured, no KB ports. This is the only blocker that is purely mechanical.
2. **The core's 76 records are not yet in the OS, and the port must not flatten them.**
   `LO-AD-001` is superseded *in part* by `LO-AD-002 §1` — the amendment pattern is
   load-bearing, and a naive copy would either lose the amendment or overwrite the
   original. The OS's AD kind is immutable and supersedes by name, which is the right
   model, but the 42 records need their supersession edges ported as relations, not
   just their text. The kernel's ledger row discipline (`AGENTS.md`) is the precedent.
3. **Nothing reconciles the KB's item model to memory's eight kinds.** A KB item has
   `status`, `phase`, `loop`, `item_id`, `decision`, `reasoning`, `signals`, `outcome`.
   Memory has `fact/decision/constraint/preference/lesson/open_question/glossary/
   artifact` with confidence and scope. **The mapping is a design decision the Chair
   must make**, and it is where the token-efficiency is won or lost: map a score
   adjustment to a `decision` with its `reasoning` as content, and it is searchable and
   cheap; map it to a raw JSON blob and the KB's cost is reproduced exactly.
3. **The 13 live routines still have no guard.** Every "recreate as routines" decision
   needs to know which of the old jobs are still live, and the registry snapshot is
   four days stale. `2026-10-23-five-pool-import-plan.md` §2 names all 14 rows.
4. **Phase 0's department-shape ruling is still unanswered**, and it now matters more
   than before: the Chair has said naming and function are open to redesign, so the
   shape ruling is the *first* creative act of this port rather than a gate on it.
   §7.5 of the survey holds the three options with measured costs.
5. **There is no measured baseline for "token efficient".** The claim needs a number.
   `kb/runs/` and the registries hold per-run records; measuring one old job end to
   end, then the same job on the graph, is what makes Phase C a comparison instead of
   an assertion.

## 8. What this document does not claim

- **Nothing has been ported.** This is the architecture and the gates; no file has
  moved, no instance has been written to, and no `--apply` has run.
- **`kb_base.py` has not been read in full** — only its import surface and its own
  docstring. Whether its 527 lines contain domain knowledge worth keeping, or only
  plumbing the OS replaces, is Phase A's first measurement.
- **The 372M of screenshots are assumed to be exhaust, not evidence.** That
  inference rests on the directory name and the fact that the rest of the skill is
  500K of prose. Phase A confirms it before anything is left behind.
- **The 0-byte `.db` files are assumed dead.** Three of them, all zero bytes, beside
  live JSON directories that carry the same decisions.
- **I have not read all 76 core records** — one (`LO-AD-001`) in full, and the
  front-matter of two others. That they are uniformly this substantive, and that the
  other four pools' ADs carry the same amendment discipline, is Phase A's second
  measurement, not a finding of this document.
- **The `core/` tree is described as "the core system" on structural evidence**: it
  is the one tree all five pools share, it holds decisions and regressions rather than
  data, and its records are already in the OS's AD/RG format. Whether the Chair means
  this by "core systems", or means the *functional* core (what `job-application-
  automation` does), is the one thing this document cannot decide for them. Both are
  portable and both are small; the second is §2's skill prose.
- **`archive/` was not measured.** Each pool carries an `archive/` tree and the
  corpus root carries one with 53 `.bak` protocol files. Whether it holds anything not
  in `core/` or `kb/` is Phase A's third measurement.
