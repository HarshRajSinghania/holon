# Ventures survey audit and migration plan

**Scope:** read-only survey of the B-side ventures corpus plus the Paperclip live
registry, then a migration plan that routes around three measured fidelity gaps
and one retracted claim.
No migration was executed. Each system's migration is a packet for a specialized
subagent; this document is the audit they inherit, not the doing.

**Survey window:** 2026-10-23. Live registry snapshot: `swarm/task-grid/data/
routine-logs/routine-latest.json` (generated 2026-10-21, 102 routines, 50 active,
52 paused). Every number below is measured from a file, not from a claim.

**A note on this document's own history:** the claims below were written in the
order they were measured, and a number of my first readings were corrected by a
later measurement — several *after* the packet set was already written. Each
correction is left visible rather than silently replaced, because a survey whose
claims never moved is a survey that was not measuring. The most consequential:

- the §2.2 count went from 4 to **29** protocols, corpus-wide;
- my "architectural-leads has a rename hazard" claim was wrong (no rename there);
- my "quant-trading is the hazard-free pilot" claim was wrong;
- a §2.4 quoting defect I asserted confidently was **disproved by the real import**
  and is retracted in place;
- and the biggest: running all ten pools through the real import (this session's
  final pass) found a **second cadence refusal** (`dad-arch-strategist-listener`,
  26 firings/day) that the first survey never saw, and disproved my "community-loo
  has zero outside reach" claim. §4 is now measured across all ten pools rather
  than five.

See §2.4 for the lesson the retraction taught about tracing a value to its parse
site, and §3 for why skip counts must never be reported without their reasons.

Two further corrections were made after the plan was first written, both by
re-measuring rather than re-reading: the counts in §2.1 (**14** live protocols
lost, **12** dead resurrected) are larger in both directions than the survey's
per-row reading, and §3 records that my own §2.2 fix **temporarily hid both
cadence refusals** behind the status skip — closed same-session, tests-first.

---

## 1. What the terrain is

The corpus at `organism/organism/ventures` carries **10 live pools** and an
`archive/` tree. **62 protocol files** (`cron-jobs/*.md`) across them — 61
protocols plus `architectural-leads/cron-jobs/EXECUTION-SURFACE.md`, which is
documentation with no `status:` field and is counted separately:

| Pool | Protocol files | Charter (abridged) |
|---|---|---|
| architectural-leads | 10 | Lead intelligence and outreach for the architecture practice |
| career-pipeline | 15 | Job application pipeline: ATS auto-apply, outreach, inbox scan, lead scoring |
| freelance-agency | 15 | Freelance pipeline: gig scouting, proposals, client scoring |
| credibility-funnel | 6 | Agentic-engineering authority: public proof and monetization surface |
| quant-trading | 4 | Autonomous trading system |
| vitality-research | 4 | Ailments to healing; methodologies to optimization |
| brand-integrating | 2 | Integrating personal brand surface |
| brand-polarizing | 2 | Polarizing brand surface |
| community-loo | 2 | Law-of-One community facilitation, sacred space |
| saas-studio | 2 | Productized-offering studio layer |

The destination is `$HOLON_HOME` (`~/holon`): **3 departments** (executive,
pioneer, tools), **7 employees, all bound to `operant`**, and no ventures
department. `holon venture import` is the only entry point and it is a dry run
unless `--apply`, with every routine landing **unapproved** — an import is not an
approval. That gate is what makes a per-system packet plan possible.

---

## 2. Six findings — all resolved: three closed, one answered as a shape, one in the kernel's favour, one retracted

### 2.1 Corpus `status:` fields are wrong in BOTH directions — SHAPE ANSWERED (a migration step, not a kernel change); the 14 and 12 are now counted

The obvious reading is "the corpus is stale, trust Paperclip". It is worse than
that, and the direction matters:

- `career-pipeline/cron-jobs/company-kb-dossier.md` — declares
  `status: superseded`, yet `company-kb-dossier` is **active in Paperclip**.
  Same for `company-kb-growth`, `company-kb-regrade`, `inbox-scanner-daily`.
- `career-pipeline/cron-jobs/job-loop-p4-outreach.md` — declares `status:
  superseded`, and is **paused** in Paperclip. Here the corpus and the registry
  agree, which is why the pattern needs reading per-row rather than as a rule.
- `freelance-agency/cron-jobs/freelance-loop-p4-negotiate.md` — declares `paused`
  while `freelance-negotiate-close` is **active** in Paperclip.
- `architectural-leads` — eight protocols declare `superseded` and one `paused`,
  while four of them (`dad-arch-builder-intel`, `dad-arch-rd-daily`,
  `dad-arch-strategist-daily`, `dad-arch-materials-refresh`) are **active** in
  Paperclip. The pool's own files retire the pool; the registry runs it.
- `credibility-funnel` — `drift-watchdog-weekly` and `state-repair-daily` declare
  `paused` and are **active**; the four `ta-research-*` declare `paused` and are
  agreed-paused. Because bare `paused` *does* match the tuple, the importer would
  skip all six, losing two live jobs.

So the field is not merely stale: it contradicts the live registry in both
directions at once. Any import that reads it as truth will both resurrect dead
work and retire live work in the same pass.

#### The fix's shape, now answerable

The survey could not say how the importer should honour the banner, because the
banner names a registry the kernel has no path to. That is now resolved by the
topology, and it resolves it against a kernel change:

- **The corpus is not the kernel's data.** The ventures tree lives at
  `$organism` (operator-context.md §Paths), which is a **separate git repository** from the
  A-side (its remotes are `origin` on GitHub and `peer` at the VPS). It is the
  B-side venture runtime's own tree (law 10: two stacks, never one system).
- **Therefore a kernel change that reads it would make the distribution depend on
  the B-side layout** — the path, the JSON shape, the file's presence — which is
  exactly what the boundary law forbids, and it would break on the VPS, where the
  A-side runs but this checkout's text says the tree is elsewhere.
- **So §2.1 is not a kernel change.** It is a **migration-script step**, owned by
  the migrating subagent: read the registry snapshot once, and use it as the
  liveness source for the pool it is importing.

This is the same conclusion the register drift row reached, and it is why §2.1
sits with the packets rather than in `holon/`. It also bounds the fix: the
registry is a *snapshot*, generated 2026-10-21, so it is evidence about the
migration day, not a live binding. After a migration, liveness is the kernel's
`schedules` table, and a routine that should run is re-proposed on the kernel's
own terms.

**The corpus already states the rule.** 55 of the 62 protocols carry a
`PAPERCLIP-ERA STATUS` banner reading, in essence: *the fields above
(`cron_id`, `schedule`, `status`) are historical intent, NOT live config. Check
the live Paperclip routine registry before acting on this file. If a matching
Paperclip routine exists, IT is authoritative.* The importer does not honour that
banner.

#### The two directions, counted (re-measured 2026-10-23 against the live registry)

The survey asserted the contradiction from a handful of rows. Re-measured against
`routine-latest.json` on disk, corpus-wide, 62 protocols:

| | rows | effect of reading the file's `status:` as truth |
|---|---|---|
| **A.** file says off (`superseded`/`paused`), registry says **active** | **14** | live work silently lost |
| **B.** file says active or nothing, registry says **paused** | **12** | dead work resurrected |
| **C.** file and registry agree it is off | 21 | correct either way |
| **D.** no registry routine by that name | 12 | not a conflict |

The 14 in **A** are the ones that matter most, because §2.2 made the importer
*honour* them: `career-pipeline` alone loses `company-kb-dossier`,
`company-kb-growth`, `company-kb-regrade` and `inbox-scanner-daily` — all four
**active** in the registry. The three `reddit-hiring-lane-*` /
`reddit-karma-lane-*` in `freelance-agency` and two in `credibility-funnel`
(`drift-watchdog-weekly`, `state-repair-daily`) are also live and would be lost.

The 12 in **B** are the eight `job-loop-p*` in `career-pipeline` plus four
`freelance-loop-p*`: the corpus declares them `active`, the live system has paused
every one. These the importer would import and schedule.

So the field is wrong in exactly the two ways a single-value reading cannot
survive, and the counts are large enough that per-row reasoning (the survey's method)
would not have found them: **both directions were substantially larger than the rows
I had looked at.** The registry file is present on this host and readable, so this is
a live re-measurement, not a claim.

#### How these counts were validated (2026-10-23, after the fact)

Two checks, because a count is only as good as the code that produced it:

1. **The reader agrees with the kernel's.** The re-measurement used my own
   front-matter parser, so every one of the 62 files was re-parsed with the
   kernel's own `legacy_cron` and compared per file: **0 status disagreements and
   0 name disagreements**, and recounting direction A and B from the *kernel's*
   `paused` flag and the *kernel's* title reproduces **14 and 12 exactly**. So the
   numbers are not an artifact of my parsing.
2. **The registry has duplicate rows, and they do not change the counts.**
   `routine-latest.json` holds 102 routines of which **three titles appear twice**
   — `freelance-loop-p1-discover`, `freelance-loop-p3-outreach`,
   `freelance-loop-p4-negotiate`. A dict keyed on title takes the last row
   silently, so this was checked: every duplicate pair agrees on `status` (all
   three `paused`), and only `freelance-loop-p1-discover` appears in either
   direction (B). The 14 and 12 are therefore stable as measured, but a
   migrating subagent matching on title should know the registry can carry a name
   twice, and should match on `id` when it can.
3. **The shape conclusion was traced, not assumed.** `venture_import` resolves only
   the pool path its caller passes — no environment variable, no registry read, no
   sibling path — and the corpus sits in a **separate git repository** whose toplevel
   is `$organism` (operator-context.md §Paths) (no submodules, and it does not track `holon-personal`).
   Post-migration liveness is the kernel's own `schedules` table
   (`migrations/work/0001_init.sql` line 163: `enabled`, `next_run_at`). So the
   three claims the shape rests on — the corpus is external, the kernel cannot read
   it, the kernel has its own liveness — each correspond to a line of code.
4. **Re-derived a third time (18:22Z, at merged HEAD) from the kernel's own reader.**
   62 protocols, `A=14 B=12 C=21 D=12` — all four unchanged, and the A-set and
   B-set reproduced row for row.
5. **A probe bug this validation pass caught in its own first attempt.** The second
   re-derivation reported `D=15`, which contradicted the plan's 12 and looked like
   a measurement change. It was not: that probe used an `else:` bucket, so it
   caught every row outside A/B/C — including rows that agree on **both** sides
   and have no conflict at all (`daily-live-monitor`, `weekly-saas-metrics`,
   `daily-apply-digest` are corpus-`active` *and* registry-`active`). The lesson
   is the same one the audit records elsewhere: **a catch-all bucket is not a
   measurement, it is an unclassified remainder**, and three extra rows came from
   the classifier's shape rather than from the corpus. The plan's figures stand;
   the probe was wrong and is recorded rather than quietly fixed.
   The one genuinely undocumented row the pass surfaced is
   `architectural-leads/cron-jobs/EXECUTION-SURFACE.md`, which carries **no
   front matter at all** — it is the venture's own README that `legacy_cron`
   counts as a protocol (`title = path.stem`), and it is the tenth file in that
   pool's count of 10. §2.3's "10 files parsed as protocols" is measured that way,
   so the packet's number is right, but a reader should know one of the ten is
   documentation.
### 2.2 The importer's status vocabulary omits `superseded` — **CLOSED, `62d7a1d`**

**Status: fixed, tests-first, mutation-proved, 624 tests OK, strict lint clean.** The
number below is the defect as measured before the fix, kept as the record of why it
was fixed.

`holon/cli.py`'s skip flag derived liveness from the protocol's `status:` field
against a tuple that omitted `superseded`:

```python
"paused": str(meta.get("status", "active")).strip().strip("'").lower()
          in ("paused", "decommissioned", "disabled", "off", "retired", "archived",
              "false", "no", "0"),
```

`superseded` is **not** in that tuple. Measured against the corpus, **29 of the
62 protocol files declare `status: superseded`** — and all 29 would therefore
import as **active**. (My first reading of this gap said "4 protocols"; that was
measured from one pool and was wrong by a factor of seven. The 29 is the
corpus-wide count, taken 2026-10-23.) Combined with §2.1 this is the dangerous
path: the file-level banner and the registry both say most of those 29 are wrong.

### 2.3 Live families with no local protocol file, and the rename they record

Matching the 50 live routine titles against the 62 corpus files, **34** active
routines have **no local protocol** — corrected 2026-10-23T19:20Z from this
section's earlier headline of 26, which was a stale number: the section's own
buckets below already sum to 34, and `daily-org-audit` was listed twice (once in
the `[ops]` block, once in the "also protocol-less" block). The buckets:

- **[ops] families (16)** — `axe-execution-tick`, `ceo-efficacy-digest`,
  `daily-org-audit`, `engine-dep-smoke`, `engine-digest-6h`,
  `hermes-fork-drift-watchdog`, `hermes-fork-watchdog-heartbeat`,
  `kosmos-vault-maintain`, `li-auth-audit-monitor`, `repo-bloat-sentinel-weekly`,
  `smoke-gate-healer`, `swarm-synthesis`, `thread-routing-healer`,
  `tools-dep-restore`, `vps-health-watchdog`, `waiting-on-ishan-digest`.
  These are **kernel-infrastructure jobs, not Ventures work** — they operate the
  organism's own body (Task-Grid, Hermes, smoke gates, sync, vault). They belong
  to a separate migration question, and conflating them with the ventures import
  is how a "62-protocol" number gets built from half-infrastructure work.
- **`talent-*` (7)** — `talent-source-sweep`, `talent-qualify-sweep`,
  `talent-outreach-wave`, `talent-convert-desk`, `talent-track-and-recover`,
  `talent-followup-compound`, `talent-weekly-retro`. **Corrected 2026-10-23T19:54Z**: as
  first written this bullet said the names "appear only in `career-pipeline/kb/decisions/
  decisions-2026-10-*.jsonl`" — that was wrong. Measured, `talent-source-sweep` appears
  in **28 files** across the corpus: 2 in `kb/decisions/`, and 26 more elsewhere in
  `career-pipeline/` — 8 in `kb/runs/2026-10-1[5-9]` and `2026-10-2[13]`, and 16 in
  `career-pipeline/scripts/*.py` (the sweep's own tooling: `_pc_ish653_sweep.py`,
  `_ish716_close.py`, `_ish977_{post,log,commit,patch_state}.py`,
  `_ish1003_update_state.py` and others). The conclusion that follows is unchanged and
  is the one that matters — **none of those 28 files is a protocol**: a protocol
  declares a `title:` and a `status:` in one of the pool directories, and no such file
  exists for `talent-*` anywhere. Their briefs live only on the VPS. What the corpus
  *does* hold is the pool's own implementation history, which is where the 7 names were
  recoverable from at all.
- **`freelance-*` (6)** — `freelance-source-sweep`, `freelance-qualify-sweep`,
  `freelance-outreach-wave`, `freelance-track-deliver`, `freelance-compound`,
  `freelance-negotiate-close` (the registry records this alongside a **paused**
  `freelance-loop-p4-negotiate`, so the rename pair holds here too).
  (`reddit-karma-lane-2h-drain-then-draft` is also protocol-less and lives beside
  them, but it is a `reddit-karma-lane-*` name, so it is counted in the last group
  below rather than folded into a prefix-labelled bucket.)
- **`organism-sync-2h`** — the repo sync trigger itself, whose machinery is what
  the repair in §5 touched.
- The remaining four: `governance-config-audit`, `org-recon-digest`,
  `lane-silence-detector-12h`, `reddit-karma-lane-2h-drain-then-draft`.

Counted, that is 16 + 7 + 6 + 1 + 4 = **34**. The correction note below explains
why this section used to say 26.

**The `talent-*` / `freelance-*` families are renames, and the registry records the
supersession itself.** Both families are present in the live registry under both
names, with the old corpus names **paused** and the new ones **active**:

- `job-loop-p1-discover` … `p9-followup` and `job-loop-recover` are **all ten
  paused** in the registry, while `talent-source-sweep`, `talent-qualify-sweep`,
  `talent-outreach-wave`, `talent-convert-desk`, `talent-track-and-recover`,
  `talent-followup-compound`, `talent-weekly-retro` are **active**.
- The same split holds for `freelance-loop-p*` (paused) and
  `freelance-source-sweep` … `freelance-compound` (active).

So this is not an inference from naming conventions: it is a recorded supersession.
The corpus protocol files describe jobs that really did run and really were
superseded; their `status:` fields simply disagree with the registry about which
side of the rename they sit on. **Importing the corpus names as well as the live
names would create the same pipeline twice.** That is the highest-risk error
available in this import, and it is silent.

Meanwhile `company-kb-dossier`, `company-kb-growth`, `company-kb-regrade`,
`inbox-scanner-daily` and `daily-apply-digest` are live **under their corpus
names** and need no rename — only a status correction the importer cannot make
for itself.

### 2.4 A retracted claim, kept as the audit's own correction (disproven by the real import)

**One quoted-status hypothesis was disproven by the real import, and is retracted
here.** While writing the packets I concluded that a double-quoted
`status: "paused"` would fail to normalize and import as active, because `holon/cli.py`
line 846 chains `.strip().strip("'")`. Driving the real `venture import` over
`vitality-research` disproved it: all four of that pool's `"paused"` protocols are
**correctly skipped**, and the dry run reports `skipped: 4`, reason *"the protocol
declares itself paused"*. The reason is one layer up. The front-matter parser at
`holon/cli.py:847` stores the value as `v.strip().strip("'")` — **it strips both
quote kinds** — so line 846 only ever sees an already-normalized `paused`.

The correct reading of the tuple, with quoting resolved by the parser, is:

| Corpus value | Reaches the tuple as | In the paused tuple? |
|---|---|---|
| `paused` (bare or quoted) | `paused` | yes — correctly skipped |
| `superseded` (bare or quoted) | `superseded` | **no** — the one real defect |

The lesson is recorded rather than hidden: my test read line 846 in isolation and
never traced the value to its parse site, which is precisely the seam-audit
failure this repository's own guidance warns against. **§2.2 stands and is the
only defect on that line.**

### 2.5 A fifth finding, now measured to closure: 18 nested protocols the kernel does not read — **RESOLVED, the kernel is right**

**Added 2026-10-23T20:04Z and closed the same day at 20:08Z**, from this round's
validation.

While re-proving §1's "62 protocol files" figure I found the corpus carries **80**
`cron-jobs/*.md` files in total, not 62. That is not an error in the plan: the 62
figure is the count of the **top-level** `cron-jobs/` directory per pool, and it
reproduces pool-by-pool against a plain `ls` (10+2+2+15+15+2+6+4+2+4 = 62). The
remaining 18 live in **nested** directories:

| Pool | Nested protocols | Path | Their titles |
|---|---|---|---|
| `career-pipeline` | 9 | `core/cron-jobs/` | `revenue-loop-p1-acquire` … `p7-compound`, `p8-retro`, `revenue-loop-recover` |
| `freelance-agency` | 9 | `core/cron-jobs/` | `freelance-loop-p1-discover` … `p8-retro`, `freelance-loop-recover` |

The cause is one line — `holon/execution/ventures.py:354`:

```python
protocols = sorted((pool / "cron-jobs").glob("*.md")) if (pool / "cron-jobs").is_dir() else []
```

`glob`, not `rglob`: it reads exactly one directory level, so those 18 files are
invisible to the importer.

**First reading (20:04Z): a possible silent-omission defect, held open for the
Chair.** All 18 carry `status: paused`, and I read the pause as the operator's
announcement of intent rather than as evidence about location. An `rglob` fix
would have moved career-pipeline and freelance-agency from 15 to 24 protocols each
and would also have swept `archive/`, `.git/` and any vendor tree containing a
`cron-jobs/` directory — an unbounded reach change over a directory the operator
owns. So I recorded it as open and did not touch the glob.

**Second reading (20:08Z), which closes it: the operator said why, on all 18
files.** Each one declares the same line:

```
status: paused  # non-canonical duplicate of the pool cron-jobs/ copy (AD-026); superseded by that doc
```

That is the corpus recording **the supersession itself, in its own words**: these
are marked non-canonical copies of the canonical top-level protocols, superseded by
them, with an architectural-decision id naming the decision. So:

- The kernel's blindness to `core/cron-jobs/` is **correct behaviour**, and the
  "fix" I had been weighing would have imported 18 already-duplicated paused
  routines. The highest-cost mistake available in this survey was the one I
  declined to make.
- **Nothing is silently lost.** The corpus, the kernel and the registry agree that
  these 18 are not live work; an `rglob` change would have manufactured
  disagreement.
- The gap I could not measure — "which of the two readings is right" — was
  answerable, and the answer was on disk in the first 8 lines of every file. My
  first reading failed because I checked the `status:` *value* and not the
  *reason* beside it, which is the same seam-audit error §2.4 records: reading a
  field without tracing what the operator wrote next to it.

**Residual finding, not a defect: the operator has a canonicalization rule the
kernel cannot see.** `AD-026` is a corpus-side decision naming a canonical location;
nothing in the kernel or in this survey's tooling reads, checks or reports it. It
is recorded here as evidence for §7.5's charter question rather than as work.

---

## 3. The two measured cadence refusals

There are **two** cadence refusals, both measured 2026-10-23, both arriving as a
**skip reason** rather than under a `refusals` key:

| Pool | Protocol | Cadence | Refusal text |
|---|---|---|---|
| freelance-agency | `reddit-karma-lane-2h-draft-post` | `23 */2 * * *` (12/day) | *"no decision model is available and this job fires on `23 */2 * * *` (12 times a day): a full lane would dispatch a body on every firing. Configure the classifier, give it as a script with `--command`, or say `--why` an agent must do it."* |
| architectural-leads | `dad-arch-strategist-listener` | `*/30 9-21 * * *` (26/day) | *"no decision model is available and this job fires on `*/30 9-21 * * *` (26 times a day): a full lane would dispatch a body on every firing…"* |

The second was **absent from the first survey entirely** — it surfaced only when
the real import was run over `architectural-leads`. At 26 firings a day it is the
more aggressive of the two, and a packet that counted `skipped: 2` and reported
"both paused" would hand it back to the Chair looking clean.

The other skips alongside them are correct `paused` skips
(`freelance-loop-p4-negotiate`, `dad-arch-materials-refresh`).

**Corrected 2026-10-23:** `dad-arch-materials-refresh` is **not** a correct skip — the
registry runs it as active. It is one of the four live-work losses in
`architectural-leads`, and of the 14 in §2.1 direction A. This sentence recorded the
survey's first reading and is kept as the correction's evidence.

Both protocols' own banners say the hermes cron was removed 2026-10-19 and the job
lives on in the Paperclip routine registry. The kernel's rule is correct: an
unattended cadence the kernel cannot justify must not buy a body 12 or 26 times a
day. **These refusals must be preserved, not worked around**; they are the guard
working, and they recur for any protocol whose live cadence is faster than the
lane allows with the decision model down.

**Both refusals are now INVISIBLE in the dry run, and that is a regression this
session's own fix caused.** Re-measured 2026-10-23 after `62d7a1d`:
`reddit-karma-lane-2h-draft-post` and `dad-arch-strategist-listener` both report
`skipped` with the reason *"the protocol declares itself paused"* — not the
cadence refusal. The cause is one line: `_would_refuse` starts from the status
skips already collected, and its loop opens with `if r["title"] in named:
continue`, so a protocol the status tuple already skipped is never reach the
cadence check at all. The guard still exists and still fires; it is simply
shadowed by the earlier, coarser skip.

The consequence is exactly the failure the survey was written to prevent: the dry
run reports a clean-ish skip list, and the two jobs needing the Chair's attention
look like routine `paused` rows. **A migrating subagent must not take a
`skipped` reason at face value** — re-derive the cadence for every skipped protocol whose
corpus `schedule:` is faster than the lane allows.

**Closed the same session, tests-first.** `_would_refuse` now predicts a refusal
for a row the status tuple has already skipped, and appends it beside the skip
(`…declares itself paused; ALSO: no decision model is available and this job fires
on '23 */2 * * *' (12 times a day)…`). Re-measured on the real corpus: both
refusals are visible again, with the status skip preserved as the kernel's decision.
Mutation-proved (reinstating the `continue` turns exactly that guard red) and
closed with two guards in `tests/test_venture_status.py`, one of them a control
proving the cadence machinery itself still fires. Ledger row added per law 9.

---

## 4. Measured dry-run baselines (the adjudication's evidence table)

Every number in the packets' hazard tables should be checkable against this table.
All measured against a scratch `--home` with `--json`, none with `--apply`.

**Two passes, and the difference between them is the point.** The first pass
(2026-10-23, commit `13b9a9f`'s parent) is what the importer did while
`superseded` was absent from its skip tuple. The second is after the fix
(`62d7a1d`) added it:

| Pool | protocols | skipped BEFORE | skipped AFTER | What changed |
|---|---|---|---|---|
| quant-trading | 4 | 0 | 2 | its 2 `superseded` files, which have no live routine, now skipped |
| saas-studio | 2 | 1 | 2 | `Studio Content Pipeline Daily` now skipped |
| vitality-research | 4 | 4 | 4 | unchanged (bare `paused`) |
| freelance-agency | 15 | 2 | 10 | 8 more `superseded` files skipped, including the refusal |
| career-pipeline | 15 | **0** | **7** | 7 files skipped — **4 of which are LIVE** |
| architectural-leads | 10 | 2 | 9 | 7 more skipped, including the refusal |
| brand-integrating | 2 | 1 | 2 | content pipeline now skipped |
| brand-polarizing | 2 | 1 | 2 | content pipeline now skipped |
| community-loo | 2 | 2 | 2 | unchanged |
| credibility-funnel | 6 | 6 | 6 | unchanged |
| **total** | **62** | **19** | **46** | **16 importing, down from 43** |

### What the second pass proves, and what it costs

Before: 19 skipped, 43 importing, and the over-import included genuinely dead work.

**Corrected 2026-10-23T20:33Z:** the totals row above first read "21 skipped, 41
importing", which cannot be derived from its own column. Every row of the BEFORE
column was re-measured against the pre-fix importer itself — extracted
read-only with `git archive 13b9a9f^ holon/` and run against the live corpus on a
scratch home — and all ten rows reproduced exactly (0,1,4,2,0,2,1,1,2,6). Those
ten rows sum to **19**, and 62 − 19 = **43**, so "21 / 41" was wrong by two in both
figures. The `superseded` token's absence from that commit's tuple was also
verified directly at `holon/cli.py:888`, so the mechanism and the corrected
numbers agree. The AFTER column is unaffected: its rows sum to 46, matching the
46 measured at HEAD.

After: 46 skipped, **16 importing**, and the corpus's word is honoured.

The cost is measured and specific. `career-pipeline` loses **four live
protocols** — `company-kb-dossier`, `company-kb-growth`, `company-kb-regrade`
and `inbox-scanner-daily` are all **active in the live registry** and all declare
`superseded` in the corpus. They now skip. This is §2.1 in its purest form, and it
is the direct consequence of closing §2.2 without also making the registry
authoritative.

So the two gaps are not independent, and the fix's comment says so. **The remaining
step is §2.1, not another word in the tuple** — but §2.1 is **not a kernel
change**: the registry it needs lives in the B-side's own git tree, so the kernel
must not read it (§2.1, "the fix's shape"). It is a step the migration script
owns, per pool: read the registry snapshot once, and use it as the liveness
source. Until that lands, the correct reading of `skipped` is "not live
**according to the corpus**", and every packet reconciles its rows against the
registry itself. The 14 live protocols in §2.1 direction A are the ones the
packets must not lose.

Two rows are unchanged by the fix and remain the control cases:
`credibility-funnel` (6 skipped, 2 of them live — the same §2.1 loss) and
`vitality-research` / `community-loo` (all correctly dead).

---

## 5. The sync repair, completed — with three rounds of correction on its verdict

Corroborating the user's ask to run their sync script, the git layer's HOLD is
closed:

- **Diagnosis (verified):** every 2h cycle since 2026-10-21 17:07 UTC failed its
  rebase and published nothing. The only conflicts were **three machine-owned
  files** — a regenerated `flight-ledger/AGENTS.md` and two `notion.json` sync
  cursors — written by timers on **both** hosts every 15 minutes. That is two
  writers on one path, which violates the sync's own contract (its header states
  it: *one writer per path*).
- **Two aborted approaches, both recorded because they look plausible and are
  wrong:** `filter-branch` to rewrite the three paths back to the merge-base
  produced "refusing to merge unrelated histories" (the rewrite broke the chain's
  relationship), and a rebase of 98 commits cannot apply the 2026-10-17
  single-snapshot restart onto a chain that already contains it.
- **What worked:** a **merge** (`ed8d379b6a`, two parents), with the three
  machine-owned paths taking **peer's** version and 8 conflicting cron protocols
  where the VPS had expanded `$HOME` into a literal `$HOME` path taking
  **local's** portable form. Verified afterwards: peer's tip is an ancestor of
  HEAD, every peer commit is present in the local object store, and the next
  cycle ran clean — rebased without conflict and pushed to origin
  (`2941e6e270..3bbc1387d8`).
- **Durable fix:** the three paths were added to `FILE_LAYER_PATHS` in
  `repo-sync.sh` with the reason, so they travel only via the file layer.
- **One remaining item is peer-side and pre-existing:** pushes to the peer are
  refused by `receive.denyCurrentBranch=updateInstead` because that host's
  worktree has 10 unstaged files from its own timers. Its own log records 26 such
  rejections (originally "branch is currently checked out"), so this predates the
  repair and is not caused by it. It needs the peer host's own attention — either
  its timers stop committing those paths, or it runs the sync against a bare
  mirror. **Do not fix this by force-pushing.**

#### Re-verified 2026-10-23T13:30Z, and the record is more mixed than the above

"The next cycle ran clean" was true of **origin only**, and a later re-read of
`organism/logs/repo-sync.log` sharpens it into a measured verdict. Three rounds of
correction are recorded below in the order they happened, because the second one
was wrong and the log's wording invites it:

- **The machine-owned conflict class is fixed.** The repair merge landed
  **2026-10-23T02:40Z**. The `conflict rebasing onto peer/main` HOLDs that had held
  since 2026-10-22T17:07Z recurred once more (03:07Z — the cycle already in
  flight when the merge landed) and then **stopped permanently**. The last HOLD of
  any kind was 05:07Z, and its cause was different and transient — `ff-only merge
  from peer/main refused` and `ff-only merge from origin/main refused`, both
  remotes momentarily ahead. Since then **three consecutive clean cycles**
  (09:07, 11:07, 13:07Z): rebased without conflict and pushed. No `conflict
  rebasing` has occurred since 03:07Z. (There is no 07:07Z cycle because the
  `*/2` cron runs on odd hours; a log with a missing even hour is the schedule,
  not a defect.)
- **Origin has published every cycle since.** Confirmed by comparing tips, not
  by reading the log: local `main` and `origin/main` are the same commit
  (`2b149fcfc0`, 13:07Z), so the pushes land.
- **The peer push is often refused, per attempt.** Two cycles today (11:07,
  13:07) logged `remote rejected] main -> main (Working directory has unstaged
  changes)`. **This is not a blocker — see the correction below** — but a reader
  who takes the log's wording at face value concludes the VPS is unreachable,
  which is false.
- **Do not force-push.** The peer's own dirty worktree is real state belonging
  to that host's timers; force-pushing would resolve a conflict the host cannot
  see, which is the failure the sync's contract forbids.

#### Corrected again, 13:45Z — my first correction was wrong, and the original reading was closer to right

The "6 commits behind / only remaining blocker" claim above came from a
remote-tracking ref I had not refreshed, and the ascent to that claim went: the
original plan said *pre-existing noise* (right), I "corrected" it to *blocker*
(wrong), and the refreshed measurement restores the original conclusion with the
evidence the plan lacked. Recorded in that order, because that is how it happened:

- **`peer/main` holds every commit the sync has broadcast**, including
  `2b149fcfc0` — the very commit the 13:07Z cycle's own log line calls *"push
  peer refused"*. So the peer rejection is **per-attempt noise that a later
  attempt lands**: `peer/main`'s reflog shows `5125bd66a2 ... update by push`,
  and `3bbc1387d8` (the 02:49Z refused cycle's commit) is on peer too.
- **What is not on peer is work another session is committing right now.** Between
  two `git fetch peer` calls in this same session (13:39Z and 13:54Z),
  `peer/main` moved `2b149fcfc0 → 3cfb8bc696` while local `main` moved to
  `980e60ee34`. The unbroadcast set went from 1 commit to **3**, all three
  authored by `ishan-parihar` in the last hour — `6d342bed45` (flight-ledger F8),
  `c4360d0770` and `980e60ee34` (opportunity-recon). None is mine; this repo is
  being written by an active session while it is being measured.
- **So the original plan's reading stands: pre-existing per-attempt noise, not a
  blocker.** What is genuinely open is narrower than either of my corrections
  said: a **moving** few-commit lag on a host this checkout cannot drive, and a
  log whose wording reports a rejection where a retry succeeds. The count itself
  is not a stable number to report, which is the real lesson.

**The measurement that corrected me, recorded because the middle reading was the
wrongest:** an unfetched remote-tracking ref reports a stale tip, and the log's
per-cycle line describes one attempt rather than the outcome. Both were read as
settled. The truth lives in `git fetch` plus the peer's reflog — and neither is a
snapshot here, because another writer is live. Any claim of the form "`peer/main`
is N commits behind" is only true for the second it was measured.

#### Settled, 17:22Z — all three refs converge, and this is the outcome not a snapshot

The moving-lag reading above was itself only true for its moment, and the next
cycle proved it. At **17:07Z** the log again recorded `push peer refused`, and at
17:22Z a fresh fetch showed:

- **local `main`, `origin/main` and `peer/main` are the same commit**
  (`743600d8e5`), so the unbroadcast set is **0 in both directions**.
- `743600d8e5` is precisely the commit the 17:07Z cycle's own log line calls
  refused — the same causal shape as 13:07Z, now for the third time. So the
  per-attempt rejection in the log is **not** the cycle's outcome.
- One honest caveat on the mechanism: the convergence is measured, but *how* the
  commit reached peer is **not proven by this host alone**. My own `git fetch`
  calls (the 20:26Z, 22:37Z and 22:49Z reflog entries) advanced what I can *see*;
  the earlier `update by push` entry for `5125bd66a2` is the one clear evidence
  the peer's own git accepted a push. The peer acting as its own writer (running
  its own cycle that pulls) is consistent with everything measured but is not
  observable from here. **Established: the state is converged. Inferred: which
  side's push delivered it.**
- **The sync repair is therefore complete, and this section's earlier hedging
  ("substantially but not wholly bidirectional", "moving few-commit lag") is
  retired.** Both were measurements of transient states in a repo another session
  is actively writing, not descriptions of the sync layer.

So the verdict on the user's ask — *sync the local and VPS organism trees with
each other* — is **achieved and measured**, at one converged commit, with the
day-long HOLD broken by the merge. What remains is a **log wording defect**, not
a sync defect: `repo-sync.sh` reports a per-attempt refusal as though it were the
cycle's outcome, which is what misled me twice. Recording it as a candidate fix
for its owner rather than patching another session's script.

---

## 6. What the destination already is, and what it is not

`~/holon` is an **instance**, not a source checkout. The kernel source is at
`~/Documents/github/my-projects/holon-personal`. Verify that reading before
editing any file under `~/holon/` — it holds live state (`holon.db`, `work.db`,
`kb/`, `ventures/`), and the kernel is the only writer of its databases.

`career-pipeline` is **already staged** in `~/holon/ventures/career-pipeline` and
its dry run reads **15 of 15 protocols with their skills** (recorded in H20). The
pilot is dry-run clean and awaits the Chair's ruling on department shape and
whether its KB federates — that ruling is the gate on every packet below, because
the shape ruling sets the pattern the other nine inherit.

The ledger of incidents on the live instance is worth reading before voting on
cadence: `unstaffed`, `smoke.critical`, `runs keep failing`, `classes.unstaffed`
recurred often enough to fill a page. Those are the failure mode a 62-protocol
import will hit at scale if anything lands approved.

---

## 7. Migration plan, per system

**Standing rules for every packet** (these are what the survey established):

1. **The live registry is authoritative over `status:`** — always. Every routine
   lands **unapproved**, and its live cadence comes from the registry snapshot
   whose `generatedAt` date the packet names.
2. **Never import a protocol whose live routine is paused or superseded**, and
   never import the `job-loop-*`/`freelance-loop-*` corpus copies of a family
   that is live under a `talent-*`/`freelance-*` name. Import the live name, note
   the superseded corpus file as provenance.
3. **Treat `[ops]` routines as a separate program**, not as Ventures. They are
   kernel-infrastructure work with no ventures charter.
4. **A refused import stays refused.** If `venture_import` declines a cadence
   without a decision model, that is the answer for that protocol until the Chair
   supplies one or re-rules its cadence. **Two such refusals exist** (§3), and both
   arrive inside the `skipped` list with a long reason string rather than under a
   `refusals` key — so `skipped: 2` can mean "two paused" or "one paused plus a
   refusal". Read every reason in full; a packet that reports only a count loses the
   item that most needs the Chair's attention.
5. **Dry-run first, always**, on a scratch `--home`, with `--json`. The apply is
   a separate Chair-gated step.
6. **Read every skip reason in full, never a count.** The two refusals and the
   correct pauses arrive in the same list (§3); a packet reporting `skipped: 2`
   without quoting the reason strings has not done the adjudication.
7. **Map a routine to its file by the file's own `name:` field, never by filename
   resemblance.** `brand-polarizing` is the counterexample that proves it: filename
   similarity put `Undercurrent Research + Content Cycle Daily` against
   `-content-pipeline.md` when it actually belongs to `-cycle-daily.md`. Verified
   corpus-wide on 2026-10-23 that the other pools' `name:` fields do match their
   filenames — but that is a checked fact, not an assumption.

### Sequencing

**Phase 0 — the Chair's two rulings (blocking, no code).** Department shape
(one department per pool, one for all ten, or three by charter) and KB
federating per pool. Everything below inherits these. The shape ruling is what
H20 is waiting on.

**Phase 1 — `quant-trading` (pilot the pattern, 4 protocol files).** Smallest
complete pool with a non-trivial charter and no rename hazard — but **not
hazard-free**, and the quant-trading packet carries the correction. Measured:
`daily-live-monitor` and `weekly-saas-metrics` are **active** in the registry;
`monthly-retrain` and `weekly-reconciliation` declare `status: superseded` **and
have no routine in the registry at all** — they are not paused, they are absent.
So two of four files describe work the live system no longer carries, and the §2.2
tuple gap would import both as active. That is exactly why this pool goes first:
it is the smallest candidate that still reproduces the defect.

**Phase 2 — `saas-studio` (2 protocol files) and `vitality-research` (4), both
declared dead by every source.** `saas-studio`: `studio-content-pipeline` declares
`superseded` and has **no live routine**; `Studio Status Daily` is paused on both
sides. `vitality-research`: all four declare `"paused"` (double-quoted, §2.4) and
are paused in the registry. These two pools are the cleanest reproductions of §2.2
and §2.4 respectively, because in each the corpus and the registry do **not**
disagree — the kernel is simply wrong on its own. Neither has a rename hazard.

**Phase 3 — `career-pipeline` (already staged, 15 protocol files).** The pilot the
Chair already ruled dry-run clean for. Its measured dry run, **after `62d7a1d`**, is
now **7 skipped, 8 importing** — 7 files declare `superseded`, of which **4 are live**
under their corpus names and 3 are the retired `job-loop` tail. The earlier survey's
`skipped: 0` was measured before the fix and is superseded by this row. Its
`outside_reach: 15 of 15` is joint-highest in the corpus (with `freelance-agency`),
so whichever lane the Chair's shape ruling gives this pool governs the most
outside-reaching work. The packet must import the live names and record the
superseded corpus files as provenance, not as work. **The four live ones
(`company-kb-dossier`, `company-kb-growth`, `company-kb-regrade`,
`inbox-scanner-daily`) must not be lost to the skip — that is §2.1, and it is this
pool that pays the full cost of the fix.**

**Phase 4 — `architectural-leads` (10 files parsed as protocols, 1 with no
skills) and `freelance-agency` (15).** The two hardest, for different reasons.
`architectural-leads` has **no rename hazard** — its corpus `dad-arch-*` names match
the registry exactly — but 9 of its 10 files declare themselves dead (`superseded`
or `paused`) while four are active in the registry, and it holds the **more
aggressive of the two cadence refusals** (`dad-arch-strategist-listener`, 26
firings a day, §3). `freelance-agency` holds the rename family, 9 `superseded`
files, `outside_reach: 15 of 15`, and the other refusal
(`reddit-karma-lane-2h-draft-post`, 12 firings a day). Run each with a fresh
subagent and compare their findings.

**Phase 5 — the four surface pools (`brand-integrating`, `brand-polarizing`,
`community-loo`, `credibility-funnel`, 12 protocols).** These are the Chair-facing
surfaces; they carry the most judgement and the least machinery, and they are
where a wrong shape ruling shows up publicly.

**Phase 6 — `[ops]` families as a separate program, with its own packets.** 16
active routines with no ventures charter. The survey deliberately does not
recommend importing them through `venture_import`; they need a decision about
whether they are Ventures work at all.

### Each packet's contract

A subagent receives, at minimum:

- one pool's path in `organism/organism/ventures/<pool>/`;
- the registry snapshot path **and its `generatedAt` date**, so its claims are
  falsifiable;
- the dry-run command and the scratch `--home` to run it in;
- the five standing rules above;
- a required output listing: protocols imported, protocols skipped with the
  reason, **refusals preserved verbatim**, routines landing unapproved, and every
  place the live registry and the corpus file disagree — naming both values.

A packet that reports no disagreement has not done the audit: §2.1 guarantees
disagreement exists.

---

## 7.5 The Phase 0 ruling, prepared for the Chair (measured 2026-10-23)

Two questions, both blocking. They are separable: the department shape can be
decided without the KB answer, and the KB answer is the narrower of the two.

### Question 1 — department shape

Ten charters, measured as three clusters that do not overlap and answer to
different owners:

| Cluster | Pools | What they share |
|---|---|---|
| **Acquisition** | `career-pipeline`, `freelance-agency`, `architectural-leads` | outbound to people outside the organization; the only three pools carrying **8 or more** outbound protocols (career and freelance 15 each, leads 8 of 10) |
| **Content surfaces** | `brand-integrating`, `brand-polarizing`, `saas-studio`, `credibility-funnel`, `community-loo` | publishing and audience, mostly low protocol counts (2, 2, 2, 6, 2) |
| **Research** | `quant-trading`, `vitality-research` | self-contained domain knowledge, 4 protocols each |

**Corrected 2026-10-23T20:53Z:** the table row above first described Acquisition as
"the *only* three pools at 15/15 outside reach (career and freelance) or 8/10
(leads)". Read literally that is false — **five other pools also sit at 100% of
their own protocols** (`quant-trading` 4/4, `vitality-research` 4/4,
`brand-integrating` 2/2, `brand-polarizing` 2/2, `saas-studio` 2/2). The claim
survives only as a volume claim, which is the one that carries the argument: these
are the only three pools carrying **8 or more** outbound protocols. A ratio on a
denominator of 2 proves nothing about exposure, and the sentence as first written
would have let a reader dismiss the Acquisition cluster as unremarkable.

The options, with what each costs:

- **One department per pool (10 departments).** Fidelity is perfect — each
  venture keeps its charter, its reach and its KB. Cost: ten departments for a
  machine where five of them run 2 protocols, and five of those ten are
  Chair-facing surfaces whose only live work is 0 or 2 importing routines.
- **Three by charter.** Matches the measured clusters, keeps the
  pilot-department rule (`[pilot] depts`: outside-reach is the Chair's call,
  job by job) pointed at one place, and gives the two 15/15 pools a shared
  boundary. Cost: a pool's charter is a sub-page rather than a department's own.
- **One department for all ten.** Cheapest to stand up; cost: every pool's
  charter collapses into one, and outside-reach becomes an organization-wide
  property rather than a department one, which is exactly what
  `[pilot] depts` exists to avoid.

**Proposed (not ratified — this is the Chair's ruling):** three departments by
the measured clusters, because the clusters are already the shape the corpus
organizes itself into, and because the two highest-outside-reach pools then
share one boundary for the Chair's per-job approval to govern.

### Question 2 — KB federating, and why the question was wrong

**Only four of the ten pools carry a `kb/` at all**, and measuring them shows
they are not four instances of one thing:

| Pool | Size | What it actually is |
|---|---|---|
| `career-pipeline` | **43 MB** | an application's own datastore: 5 SQLite DBs, 31 Python modules, `applications.jsonl` with live job records |
| `freelance-agency` | **24 MB** | same class: 2 DBs, 9 modules, its own decision log |
| `architectural-leads` | 4.9 MB | a candidate pipeline: `candidates/`, `items/`, an `index.md` |
| `quant-trading` | **64 KB** | prose: 8 markdown documents, no code, no data |

So "federate as a department KB / org-scope KB / leave outside" is not one
decision. **`career-pipeline/kb` and `freelance-agency/kb` are live application
databases with a writer** — importing them as a kernel KB would make the kernel
the reader of an app it does not own, with two writers on one store and the
`scope.stray` placement hazard the artifacts audit already records. The right
answer for those two is **leave them where they are**, with a pointer: the
department's charter names the path, and nothing is imported.

**`quant-trading/kb` and `architectural-leads/kb` are the real KB candidates** —
prose and a candidate index respectively, no live writer, no app behind them.
Those two *can* be seeded (`kb seed --dept` for a department-scoped KB), and
`quant-trading`'s 8 markdown documents are exactly the shape a department KB is
for.

**Proposed (not ratified):** seed only `quant-trading` and `architectural-leads`
as department KBs; leave the other two outside with a charter pointer, and
record the decision as an AD so a later agent does not re-ask it.

Both proposals die by the same measurement if the Chair disagrees, and nothing
in the plan's Phases 1-6 depends on which way the ruling goes: each phase names
its own pool-specific hazards. The ruling decides *where the work lands*, not
*whether it is safe to move*.

## 8. What was done, and what was not

### Done

- **§2.2 closed, tests-first** (`62d7a1d`). `tests/test_venture_status.py` guards the
  status vocabulary: two tests were red on the defect and are green, two pin the
  behaviour that already worked. Mutation-proved (removing `superseded` turns
  exactly those two red).
- **The shadowed-refusal regression that fix caused, closed tests-first**
  (`a2c4ba5`). `_would_refuse`'s `continue` hid both corpus cadence refusals
  behind the status skip; a status-skipped row is now predicted, and a refusal
  found beside it is appended to that row's reason. Two more guards, one a
  control, mutation-proved. Ledger row per law 9.
- **§2.1's shape answered, and it is not a kernel change** (§2.1 "the fix's
  shape"). The registry lives in the B-side's own git repository, so a kernel
  that read it would bind the distribution to a layout the boundary law forbids.
  §2.1 is a migration-script step, per pool, owned by the migrating subagent.
- **§2.1's two directions counted** against the live registry: 14 live
  protocols lost, 12 dead resurrected (§2.1). Validated by re-parsing all 62
  files with the kernel's own `legacy_cron` and recounting from the kernel's
  `paused` flag, which reproduces the same 14 and 12.
- All ten pools measured through the real import, before and after (§4), and the
  counts re-confirmed independently after both fixes.
- **The organism sync is complete and measured.** local `main`, `origin/main` and
  `peer/main` are the same commit (`743600d8e5`): 0 unbroadcast in both
  directions. The day-long HOLD was broken by the repair merge at 02:40Z, and the
  `conflict rebasing` class has not recurred since 03:07Z. §5 records the four
  rounds this verdict took, including the one that was wrong and the one that
  over-corrected it: the log's "push peer refused" line is a per-attempt
  rejection, not the outcome, and that wording is the remaining candidate fix for
  that script's owner. Nothing was force-pushed, and nothing was committed to
  `organism/` by this session.
- **The suite is green: 626 tests at the two commits, and 648 tests OK on the
  merged `personal` HEAD the other session landed** (their `isolation.off` work
  plus 22 of theirs); `holon lint --strict` 0 errors 0 warnings throughout. An
  earlier pass reported "red on one test that is not this session's" —
  `tests/test_loops.py`, edited mid-flight by another session while the kernel
  still pinned `isolation.off` a warning. They landed the kernel half and the
  test, so that claim is **obsolete**; it is kept in §5 as the record of why the
  gate looked blocked.
- **The Phase 0 ruling prepared** (§7.5): three clusters measured from the
  charters, and the KB question resolved into its two real answers by measuring
  the four KBs.

### Not done

- No `venture_import --apply` anywhere.
- No department, employee, or routine created on `~/holon`.
- **The Phase 0 ruling itself is the Chair's, and is not made here.** §7.5
  carries the measurement and a proposal marked as such; nothing in this session
  ratifies it, and no AD is minted for it.
- **§2.3's rename families** (`talent-*` / `job-loop-p*`, and the
  `freelance-loop-*` / `freelance-*` pair) are still only named, not resolved:
  the corpus files are the superseded side and the registry carries both
  families, so the migration must import the live names with the corpus files as
  provenance. No mechanism change was made for it.
- **§2.1's cost is recorded but not eliminated.** The 14 live protocols are
  still skipped by any import that defers to the corpus's `status:`; a migrating
  subagent must read the registry snapshot itself, per pool.
- **Nothing was done by this session to the dirty paths in `organism/`.** The
  count is not stable (13 at first reading, 26 later — another session is
  committing to that repo), so the count is the point rather than the number.
  They include real work (`OR-AD-005-...`, `market-intel-board-refresh.md`) and
  the three machine-owned paths are excluded by the sync layer, so they are clean
  to publish; they are not this session's to commit.
- **My kernel work sits on branch `personal`,** not on `public/main`: upstreaming
  it is the history-squash runbook's call (the overlay's `PERSONAL.md`), not a
  push to be improvised.
- No decision on the `[ops]` families beyond naming them as a separate program.