# Packet — career-pipeline (Phase 3)

**Pool:** `organism/organism/ventures/career-pipeline`
**Charter:** Job application pipeline: ATS auto-apply, outreach, inbox scanning,
lead scoring (path-002).
**Protocols:** 15 files. **Scripts:** 183 (the most of any pool). **Checks:** 16.
**Outside reach:** 15 of 15 (measured).

## The measured dry run — 7 skipped, 8 import (re-measured 2026-10-23 after `62d7a1d`)

Measured 2026-10-23 against the live corpus: **`protocols: 15, with_skills: 15,
skipped: 7, outside_reach: 15, scripts: 183, checks: 16`**.

The earlier survey recorded `skipped: 0` — that was **before** `62d7a1d` taught
the importer to honour `status: superseded`. With the fix, 7 of the 15 files skip:
`company-kb-dossier`, `company-kb-growth`, `company-kb-regrade`,
`inbox-scanner-daily`, `job-loop-p4-outreach`, `job-loop-p9-followup`,
`job-loop-recover`.

**Four of those seven are live work**, and that is the defect §2.1 names at its
sharpest: the registry runs all four `company-kb-*`/`inbox-scanner-daily` while the
corpus retires them. The other three (`job-loop-p4-outreach`, `job-loop-p9-followup`,
`job-loop-recover`) are genuinely paused in the registry, so the corpus and the
registry agree there — that trio is the control case proving the tuple is now
doing the right thing.

So the pool's `outside_reach: 15 of 15` still stands, and that matters for the
shape ruling: whichever way the Chair groups departments, **career-pipeline and
freelance-agency are the two pools whose every protocol reaches outside the
organization**, so whichever lane the Chair assigns them governs the most work.

## Already staged — verify before you redo anything

`~/holon/ventures/career-pipeline` **already holds this pool**, and the survey
confirmed the dry run reads **15 of 15 protocols with their skills** from it. H20
records the pilot as "staged and dry-run clean, `--apply` awaits the Chair". So
this packet is **not** a fresh import. Its first job is to reconcile the staged
tree against the corpus and the registry, and say which of the three is the
source of truth for each disagreement.

## The three hazards, all in one pool

| Hazard | Where it bites |
|---|---|
| **§2.1 status lies both ways** | `company-kb-dossier`, `company-kb-growth`, `company-kb-regrade`, `inbox-scanner-daily` all declare `status: superseded` while **all four are active in Paperclip** |
| **§2.2 tuple gap** | those same four, plus `job-loop-p4-outreach`, `job-loop-p9-followup`, `job-loop-recover` |
| **§2.3 rename family** | 6 of 15 live routines are `talent-*`, the rename of `job-loop-p*` |

### The registry carries both families too — measured

Every corpus name is present in the live registry, with a clean split:

**Active in the registry (5):** `company-kb-dossier`, `company-kb-growth`,
`company-kb-regrade`, `inbox-scanner-daily`, `daily-apply-digest` — the first four
of these declare `status: superseded` in the corpus, which is the survey's §2.1 in
its sharpest form: **the corpus retires exactly the jobs the registry runs.**

**Paused in the registry (10):** `job-loop-p1-discover` through
`job-loop-p9-followup`, plus `job-loop-recover`.

So the `talent-*` family is the active successor of a `job-loop-*` series the
registry has paused **name by name**, not in bulk. That is a supersession trail,
and it means the correct import is: the `talent-*` names as work, the
`job-loop-*` corpus files as their provenance.

The five `company-kb-*`/`inbox`/`daily-apply` protocols are live under their
**corpus** names and need no rename at all — only a status correction that the
importer cannot make on its own.

## Deliver

1. The reconciliation table: for each of the 15 protocols, the **staged** tree's
   status, the **corpus** file's status, and the **live registry** status, with the
   registry `generatedAt` date quoted. Three columns, not one.
2. A ruling on the rename: import the live `talent-*` names with the superseded
   corpus files recorded as provenance, or import the corpus names and let the
   registry's pause state carry. State which, why, and what it costs.
3. The `talent-weekly-retro` case: it is live, it has a KB decision trail
   (`kb/decisions/decisions-2026-10-*.jsonl`), and it has **no protocol file**.
   Is a protocol derivable from the decision log, or is this a routine that must
   be re-briefed rather than migrated? A migration that fabricates a brief to make
   the count match is the failure mode here.
4. Whether the 183 `scripts/` files survive staging intact, and whether any of
   them reference `$HOME//home/...` or an absolute VPS path (that corruption class
   was measured in two other pools; it is worth confirming its absence here).
5. The 16 checks: how many map onto the kernel's `[checks.class]` vocabulary.
6. The KB-federating question the Chair owes an answer on, restated as a concrete
   choice: federate `career-pipeline/kb` as its own department KB, fold it into an
   org-scope KB, or leave it outside the kernel.

## Stop conditions

- Stop if the staged tree and the corpus disagree on any protocol's content, not
  just its status. Two copies of one truth is how the import silently favors a
  stale one.
- Stop rather than generating a protocol file for `talent-weekly-retro`.
- Never `--apply`. The staged tree already exists; an apply here is the Chair's
  call, and it is the pilot ruling H20 is waiting on.
