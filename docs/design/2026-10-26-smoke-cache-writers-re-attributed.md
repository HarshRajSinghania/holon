---
status: executed
date: 2026-10-26
description: "Retraction of two cache-writer attribution clauses in the archived 2026-10-24 outline's 7.2 (committed 3b10040): the 18:50Z recovery write attributed to the heartbeat tick is journal-disproven (every tick in that window ran ~0.14s; a tick that fast never re-ran the smoke battery), and the 14:18Z failing write attributed to the audit's own first doctor is unsupported by the session's own recorded timings (its first completed doctor, 14:26:45Z, found the stamp eight minutes fresh, and a fresh cache is read, never rewritten). The mechanism both clauses rode on stands proven; only the writer identities were wrong. The day's writers re-measured by class: slow ticks (3.4s and 4.9s against the usual 0.15s) re-run the battery under the tick unit's own PATH and stamp doctor_ts tens of milliseconds after the smoke write; fast ticks stamp doctor_ts without touching a fresh cache; CLI-class smoke writes move the smoke stamp and never doctor_ts. The operator consequence stands, sharpened: a doctor reading inherits whichever shell last ran the battery, and the heartbeat's healing doctor self-heals the cache within about 30 minutes."
tags: [audit, correction, retraction, smoke, cache, provenance]
supersedes: []
related: [docs/archive/2026-10-24-remaining-gaps-outline-plan.md]
---

# 2026-10-26: the smoke-cache writers, re-attributed — two 7.2 clauses retracted

Status: **executed** (a one-time correction body of work; the open items live in the register).
This record retracts two attribution clauses the predecessor's 7.2 committed in `3b10040` and
replaces them with what the stamps, the journal, and the kernel's own code actually support. The
predecessor is archived (`docs/archive/2026-10-24-remaining-gaps-outline-plan.md`, superseded by
`2026-10-25-remaining-gaps-outline-plan.md` in the public distribution) and is never edited past
its tombstone, so the correction travels as this successor-class record plus a note on its
archive INDEX row — the same remedy the 2026-10-22 falsification used.

Every instrument is named: the tick windows are `journalctl --user -u holon-tick.service`
(-o short-precise), the stamps are the `settings` rows read `mode=ro` from the live instance's
`work.db`, the writer-class rules are the kernel's own code paths (`service.run_smoke`,
`service.smoke_results`, `service._doctor` — identical in both trees), and the session timings
are the audit's own recorded account. The stamps carry no history (`INSERT OR REPLACE`, one row
each for `smoke` and `doctor_ts`), which is the first lesson of this record: **identity that
cannot be re-proven from state must not be claimed as if it were.**

## 1. The two retractions

**Retraction 1 — "until the tick's 18:50Z run (systemd PATH carries `~/.local/bin`) overwrote
the cache and the probe read ok again": journal-disproven.** The recovery write the predecessor
placed at 18:50Z cannot have come from the heartbeat. Every tick in that window (18:48:12Z,
18:50:12Z, 18:52:13Z — all journal-visible) ran in ~0.14s and printed its `swept` line without
re-running anything; a tick re-runs the smoke battery only when the cache is stale, and such
ticks run for seconds (four observed this same night: 3.41s, 4.87s, 4.25s, 4.01s — section 2). A tick that
fast cannot write a smoke cache. The recovery write is therefore CLI-class — a smoke-class call
from some shell with a full PATH — and its writer, like the 14:18Z writer below, is not
re-provable from state. The clause it replaced was wrong in the direction that mattered: it told
the operator the instance heals this contamination on its own 2-minute cadence, when the
observed healing runs on the healing-doctor's own ~30-minute cadence and only re-runs the
battery when the cache has gone stale.

**Retraction 2 — "the audit's own first `doctor` at 14:18Z re-ran the `browser:sourcehound`
probe exit-127, wrote that failure into the cache": unsupported by the session's own recorded
evidence, and retracted.** The predecessor's own re-reading (carried in its session account, and
the basis of its `cbbe4af` corrections) records its first **completed** doctor at 14:26:45Z
finding the failing stamp **eight minutes fresh** — and the kernel's own staleness rule
(`smoke_results`: a cache younger than `[smoke] every_min = 30` is read, never re-run) means that
doctor could only have *read* the 14:18Z cache, not written it. If the audit's first completed
doctor postdates the stamp and found it fresh, the write came from before the audit was
measuring at all; if there was some earlier 14:18Z smoke-class call of the audit's, the record
cannot produce evidence for it — and a claim the record cannot produce evidence for is exactly
what this repo's own law refuses ("a claim without evidence in a record is history's claim, not
today's truth"). What remains true and supportable: the failing probe was written by a
**CLI-class smoke call from a stripped-PATH shell** (the probe reads exit-127 only without
`~/.local/bin`, where `cloakctl` lives — the two-arm experiment proved the sensitivity, and that
part of 7.2 stands), on a live instance a concurrent red-team session was probing all day.
Identity beyond class: unproven, and now unclaimed.

The same commit message (`3b10040`: "the audit's own doctor readings were cache-contaminated")
carries the retracted story; history is not rewritten, it is corrected here.

## 2. The writers, measured by class

Three writer classes are distinguishable from state plus journal, and the day's stamps sort
cleanly into them:

| class | signature | observed instances (this night) |
|---|---|---|
| **organic slow tick** | tick window of seconds (not tenths); smoke write and `doctor_ts` stamp tens of milliseconds apart, both inside the window; battery re-run under the tick unit's own `Environment=PATH` | 3.41s tick → pair 20:20:55.785/.821Z (36ms apart); 4.87s tick → pair 23:22:04.733/.797Z (64ms apart); 4.01s tick → pair 01:22:47.704/.754Z (50ms apart, the cache the 01:42Z doctor below inherited); 4.25s tick → `doctor_ts` 23:52:11.47Z inside its window |
| **fast tick** | ~0.15s window; `doctor_ts` stamped by `_doctor` only when 30 minutes have passed; a fresh cache is read, never rewritten | every other tick in the journal; e.g. the 22:14:13Z CLI doctor below inherited a 23-minute-fresh cache and ran in 0.186s — no battery re-run |
| **CLI-class smoke write** | smoke stamp moves, `doctor_ts` does not; whatever shell ran it lent the battery its PATH | 20:51:07.727Z (smoke moved, `doctor_ts` stayed at 20:20:55.821Z); the predecessor's own full-PATH probe at 19:38:31Z; the 14:18Z and 18:50Z writes (per the predecessor's recorded stamps) |

Two consequences follow, both measured:

1. **A doctor reading is only trustworthy with its cache stamp's provenance named.** This
   session's own readings demonstrate it: the 22:14:13Z doctor printed "1 errors, 2 warnings"
   from the 21:51:21Z cache (23 minutes fresh — written by a between-ticks, tick-class actor
   whose identity is again unprovable; the stamp pair sat 12s before the next fast tick), and
   the 01:42Z doctor printed "1 errors, 3 warnings" from the 01:22:47Z pair (50ms apart — an
   organic slow tick). Neither reading ran a battery; both inherited a writer's environment.
2. **The instance self-heals on the healing-doctor's cadence, not the heartbeat's.** The two
   slow ticks above are `_doctor` re-running a stale battery under the unit's PATH (which
   carries `~/.local/bin` — the 2026-10-23 lesson, still standing in the unit file), so a
   contaminated cache ages out within about 30 minutes and the next healing pass overwrites it.
   That is the corrected version of the retracted clause's promise.

One number moved while this correction was being measured, and provenance explains it: the
third warning in the 01:42Z reading (`backup.same_device`) arrived with `93974e2` (public tree,
04:33 IST), which postdates the universal successor's own 21:3xZ measurement — its "1 error,
2 warnings" table row was true when measured and needs no correction, only this footnote.

## 3. What stands, unchanged

- **The verdicts.** Gap 0 done and holding; A1–E2 all open, none started. Re-measured at
  22:14Z against the successor's own gates; the successor's re-measured table agrees.
- **The mechanism.** `run_smoke` inherits the caller's environment and caches for
  `[smoke] every_min = 30`; the probe is PATH-sensitive (exit-127 without `~/.local/bin`,
  exit-0 with); the pre-import cache passed and the import-added career-pipeline checks fail
  deterministically (`invariants-clean-job`, `scanner-active`) in **every** writer's cache —
  14:18Z CLI, 20:20Z tick, 20:51Z CLI, 21:51Z between-ticks, 23:22Z tick, and this session's
  inherited 22:14Z reading alike. B-side pool facts, not A-side rows.
- **The rest of 7.2.** Item 2 (the `scope.stray` artifact, removed and verified gone) and the
  7.3 fix-command verifications are untouched by this retraction.
- **The operator consequence, sharpened rather than withdrawn:** a smoke probe whose result
  depends on which shell last ran it is a flapping gate. The corrected form: any CLI-class
  actor (agent shell, manual tick, cron) with a different PATH writes verdicts every subsequent
  doctor inherits for up to 30 minutes, and the heartbeat's healing doctor overwrites them on
  its own cadence. A doctor that printed the smoke cache's stamp age beside its smoke warnings
  would make that inheritance visible instead of inferable — a register candidate for the
  Chair, not this record's work.

## 4. The lesson, in the repo's own register style

The predecessor's arc ran: pass one recorded an inherited reading as instance state; pass two
corrected the mechanism but claimed a writer identity it could not re-prove from state; this
pass retracts the identity and keeps the mechanism. Each pass was right about one more layer —
reading, then mechanism, then provenance — and each pass's defect was found by re-asking the
same question with a better instrument (re-run the doctor; read the code; read the journal
against the stamps). The durable rule, joining the repo's other measurement laws: **name the
writer class you can prove, and stop there** — on a shared live instance, three actors' work
met in one `settings` row, and the row kept only the last hand that touched it.

## 5. The 11 remaining `smoke.critical` errors are stack B's, measured 2026-10-26T20:12Z

Replying to the count anyone will ask about after the boundary went on: `holon doctor` on
`$HOLON_HOME` (operator-context.md §Paths) reports **11 errors, all `smoke.critical`, zero A-side**. They are the
smoke gates of the six departments' *imported pools* — `career-pipeline`'s
`engine_lib.py`/`cli-reachable`/`drift-clean`/`apply_job.py`/`outreach_veto`/`forge` gates,
the three pools' `genome doctor (genome.toml contract)`, and the freelancer/leads variants.
Every one fails inside the isolated runner with `Permission denied` (or `not found on PATH`)
against paths **outside A's reach**, because the boundary now correctly denies what A has no
business reading: the operator's career-pipeline and venture trees.

So the honest reading of the number is 11 errors that exist because the boundary works. They
are not A's defects and A's work does not wait on them (AGENTS.md law 10): closing them is
either a `[scope]`/`[isolation] reads` decision for the A-side gates that genuinely need those
trees, or B-side work in the operator's other program. The one A-side error that was real —
`isolation.reach` naming the operator's overlay checkout — is closed in `1881362`
(`test_every_distribution_checkout_reaches_the_agent`), and its ledger row is in the universal
repo. Nothing in this count is reported to the Chair as an A finding.
