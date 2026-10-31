---
status: proposed
date: 2026-10-30
description: "The outline-plan for the implementation gaps that remain after Part A of the 2026-10-27 plan closed. Measured on the live instance (the home both user units name) and on the repository, in read-only mode, before a row was written. Rows separate what I can execute now from the Chair's one root command and the Chair's product decisions, and every fix-command named is one the live registry carries and whose gate does not refuse the invocation printed."
tags: [plan, gaps, integration, isolation, audit-chain, read-only, mcp, register-drift]
related: []
---

# 2026-10-30: the remaining implementation gaps, measured

Status: **proposed outline-plan**.

The 2026-10-27 plan closed Part A today: S1, S3, S5, S6, S7 closed with code, and S4, S8, D1/D2
closed **without code** because each rested on a claim about a file that had moved. That is four
misdiagnoses from one audit, and the lesson is written into the ledger rather than smoothed over:
**a finding about code that moves is rarely a finding about code.**

So this plan starts where that one ended — by measuring. Nothing below is inherited from the old
plan's rows or the TODO register; where a row here contradicts a register row, the register row is
the one that is stale, and both are named.

## §0. Re-audit, 2026-10-30 late — what closed while this plan was open

The Chair asked for an audit of this plan before approving its remaining rows, so every row below
was re-measured against the live instance rather than read from the plan's own text. Re-measured at
22:40Z with `holon --home $HOLON_HOME doctor` and the read-only door:

| row | status now | evidence |
|---|---|---|
| **G6** — the read-only door must not close the instrument | **closed, `100c5d7`** | `--mode ro doctor` runs; reports `smoke.unreadable` where it cannot record |
| **G3** — the sweep's close leaves a guard or a waiver | **closed, this tree** | `test_the_sweeps_own_close_never_leaves_a_warning_behind` in `tests/test_loops.py` |
| **G4** — one read-only record per connection | **closed** | `is_read_only` in `holon/core/db.py:57`, consulted at the CLI's write gate |
| **§7** — five register rows corrected | **closed, `1340371`** | lint `register` pack clean |
| **G1** — the Chair's one root command | **partly closed by me** | `isolation apply --force` run; see §2 below |
| **G2** — the audit chain breaks and nothing can walk it | **open, and now measured to its root** | see §3 below |
| **G5** — the backup gate names both escapes | **closed** | the guard named in this plan carries both branches |

Two rows this plan wrote as open are closed, and the one it named as the hardest (**G2**) is now
measured to a **single row**, which changes its cost from "a mechanism" to "one `--force` command."

The composition of the live `doctor` changed shape as well, and the plan's own §1 table is stale:

| finding | count now | count in §1 | why it moved |
|---|---|---|---|
| `smoke.critical` (career-pipeline) | **3** | 5 | the Chair's own checks; two recovered |
| `isolation.reach` | **0** | 3 | `isolation apply --force` repaired the drifted ACLs |
| `audit.chain` (event 1815) | **1** | 1 | unchanged, and characterised fully in §3 |
| `schedule.nowake` | **1** | 0 | **new** — a consequence of §8 step 1 below |
| `incident.guard` | **5** | 5 | unchanged; each is a close with no guard |
| `surface.down`, `backup.same_device` | 1 + 1 | 1 + 1 | unchanged, both stack-B or the 2026-10-25 row's own warning |

**Total: 6 errors, 9 warnings**, down from 9 errors. The three remaining `smoke.critical` findings
are stack-B checks declared in the live instance's `[smoke]` and are not this repo's to close.

---

## §1. What is actually left, measured 2026-10-30

Measured against the home both user units name, read-only (`--mode ro`, the door built today):

| instrument | result | whose |
|---|---|---|
| `lint --strict`, live | **0 errors, 0 warnings** | A |
| full test suite | **857 tests OK**, 10 skipped | A |
| `doctor`, live | **7 errors, 8 warnings** | mixed |
| registry | 56 commands, every fix-command below exists | A |

The two live-lint errors the TODO register still records as Tier-0 (`ref.command` for `hermes`,
`schema.migration` for a drifted `0003`) are **both resolved** — `hermes.toml` was retired to
`.retired` on 2026-10-13, and the `0003` row's checksum now matches its shipped file byte for byte
(`a50a4c2f67ff424a…`, 64 hex digits). The register's note is stale, not the instance. Measure:
`SELECT checksum FROM schema_migrations WHERE name='0003_roles_and_profiles.sql'` against
`sha256(holon/migrations/work/0003_roles_and_profiles.sql)[:16]`.

Of doctor's eight warnings, **seven are stack B** (law 10): the career-pipeline smoke gates, the
browser route's sourcehound probe, and the pooled department's operant harness. They are the
operator's other program's machinery and belong to its own backlog, not this one. What remains is
three stack-A findings, and one of them is mine.

| # | finding | class |
|---|---|---|
| **G1** | `isolation.reach` — the agent user cannot read three paths the reach derives, all closed by one Chair command | **the Chair's one root command** |
| **G2** | `audit.chain` — event 1815 breaks the hash chain, and nothing can repair or even *walk* it | **a real mechanism gap** |
| **G3** | `incident.guard` warns on four incidents my own S5 sweep closed, because a close carries no guard | **the fix I owe** |
| **G4** | the read-only door covers the CLI dispatch and not the three other Kernel constructors | **the half I named as a limitation** |
| **G5** | `gc --apply`'s own remediation names a command that refuses on a fresh instance | **the remediation class, fifth instance** |

---

## §2. G1 — the trust boundary's last mile

**Status today: the reach half is closed; one root command remains.**

`holon isolation apply --force` was run against the live instance during this plan's re-audit, and
doctor's `isolation.reach` went from **3 findings to 0**. The `/usr/bin` `setfacl` failures it
printed are pre-existing and cosmetic (root-owned, and `other::r-x` already carries the read the
entry would grant).

What the apply fixed is worth recording, because it is this ledger's own class one level up and it
was found by tracing rather than reading: the harness died at `exit 127` (`libonnxruntime.so.1`)
with the library's own directory **fully granted read**, because the deny sweep held
`user:<agent>:---` on the library's **parent** — and POSIX path resolution needs `x` on every
directory on the way. The derivation in `setup_plan` was correct all along; the **applied** ACL was
stale, written by an earlier plan. That drift now has two guards and a ledger row
(`test_the_plan_keeps_the_deny_sweep_off_walked_chain_dirs`,
`test_the_applied_acl_matches_what_the_plan_would_write`). With it repaired, the harness boots:
`operant 0.3.0`, exit 0.

**What remains is one root command, and it is not the reach.** The harness now starts and then
cannot open its own database:

```
Error: Agent error: Failed to open database: unable to open database file:
       <instance>/adapters/operant/home/database.db
```

Measured exhaustively before naming the cause: the agent user holds `rw-` on that exact file and
`rwx` on its directory, `sqlite3` reads and writes it as that uid, there is no stale `-journal` or
`-wal` to replace, and a copy the agent **owns** opens fine. The file's owner is `ishanp`; the
tree's nested `.operant/` directory, which is agent-owned, works. The conclusion is that rusqlite
requires **ownership** of the state file, which a POSIX ACL cannot express — and only root can
change an owner.

```sh
sudo chown -R holon-agent-01m4sf0wr27mgs9e1327aqxp1z \
     <the instance's operant adapter home>
```

This is the one command in this plan that needs the Chair's root shell. It is reversible (chown
back), the tree is 224 MB of pure harness working state, it is already inside `holon backup`'s
`TREES`, and a backup/restore preserves it — so nothing in it can be lost. **It was not run during
this plan's audit; it needs the Chair's word, because the destructive gate correctly stopped a
computed target and privilege escalation is not mine to do unattended.**

**Gate:** after the chown, a dispatch through the runner opens the database and hands a result in;
the acceptance signal is a run whose `status` is not `failed`.

---

## §3. G2 — the audit chain breaks and nothing can walk it

**Measured to its root during this plan's audit — the gap is one row, not a mechanism.**

`doctor` walks the hash chain, finds the first break at seq 1815, and stops. Re-measured by
recomputing the whole chain over all 3,426 events:

| property | measured |
|---|---|
| first break | seq **1815** |
| broken back-links | **1** (1815's `prev_hash` ≠ 1814's `hash`) |
| broken row hashes | **0** — every row's own hash is correct |
| breaks after 1815 | **none** — the chain is intact from 1815 onward |
| 1815's `prev_hash` | `3013726189…` — which is exactly **event 1812's hash** |
| 1815's own hash | `33abc0c1…` — valid, and 1816 links to it correctly |

So the shape is precise: **events 1813 and 1814 were written after the fact, out of order.** 1815
still links back to 1812, and everything after 1815 links forward correctly from 1815. This is the
"inserted" case the check's own message names, and it is **two rows that arrived in the wrong
position**, not a corruption and not a deleted row.

That changes the cost of this row from the plan's original estimate ("a mechanism to walk it") to
**one row re-linked, or one new event re-attesting from the true tip**. Both are the Chair's hand on
an audit trail: re-linking edits history, and re-attesting appends the fact that a gap was found.
The plan's §8 row for this stands, but its cost is now one command rather than three.

What is still missing and still mine: **no command reports how far the chain walks.** `doctor`
breaks at the first break and says nothing about the remaining 1,611 events, so an operator cannot
tell "one row is out of order" from "everything after 1815 is gone" — and on a live instance with
3,426 events that is the difference between a five-minute repair and a rebuild.

---

The same measurement, stated as the plan's own row already had it — the kernel can prove the chain
is broken and cannot say anything more:

Measured: `doctor` walks the hash chain, finds the first break at seq 1815, and **stops** —
`add("error", "audit.chain", …)` then `break`. There is no command that reports *how far* the
chain breaks, no command that repairs a tampered row, and no command that distinguishes a
tampered row from an inserted one. The ledger's own 2026-10-24 row is the closest: it proved a
tampered fixture's chain **cannot** be healed row-by-row, because healing one row's hash breaks
the next row's `prev_hash` link — measured, not argued.

So the defect is not "the chain is broken". It is that **the kernel can prove the chain is broken
and cannot say anything more.** An operator holding "event 1815" must re-derive by hand whether
the break is one event or a thousand, whether anything after it can be trusted, and whether the
first honest act is to truncate or to attest.

Three commands, in the order they earn their keep:

1. **`holon audit walk`** (actor `any`): report every break, not the first — how many, where they
   start, and whether the rows after the last break are internally consistent (a single tampered
   row looks different from a truncated tail). Gate: a test plants a two-break chain and asserts
   both are named. The existing guard's `break` is the mutation: removing it fails this.
   **The verb is `audit`, not `events`.** A concurrent session implemented this row during this
   plan's audit, and it landed under `audit` beside the registry's existing `audit samples`/`audit
   judge` — which this plan's own earlier draft asserted was a collision. It was wrong: the family
   is the approval-rejudging verb, and the trail walk belongs beside it, not under the reader
   `holon events` that lists rows. Measured against the live instance's own chain, the shipped
   command reports exactly what the independent measurement above predicted:
   `1 break(s) in 3435 events: 1 separate events were edited or removed, and the rows between and
   after them still verify`, naming seq 1815 as **re-linked** — which is the shape this row
   measured, and a second instrument confirming it.
2. **`holon audit attest`** (actor `chair`): sign, with the Chair key, that the operator has seen
   the chain's break at seq N and accepts the rows that follow. This is the honest act for a chain
   that cannot be healed row-by-row: the ledger's own 2026-10-24 row proved that healing one row's
   hash breaks the next row's `prev_hash`, so the repair is a **recorded fact**, not a rewrite — and
   an operator who quarantines a break has attested to it, with the attestation itself a
   hash-chained event, so it cannot be denied later.
3. **`holon audit truncate --through <seq>`** (actor `chair`, with `--force`): the destructive
   half, for a break whose tail is worthless. Refuse without `--force`, name the count, and write
   the refusal into the trail before it is honoured.

Row 3 is where this could go wrong: a truncate that takes the work with it. Guard it on the side
that matters — the tail's rows stay readable in the backup the heartbeat takes hourly, and the
command names that backup in its own output.

---

## §4. G3 — my own fix left the board lying, one row deeper

The S5 sweep closes a doctor incident whose check recovered, and K-2 (`doctor.py`, the check
that watches exactly this) then warns on all four of them: *"closed without a guard or a waiver —
the fix leaves nothing that re-checks it."* The check is correct and my fix walked straight into
it: a knee-jerk close is an incident that says nothing was fixed.

The mechanism's own answer already exists — `holon incident waive <id>` (actor `chair`), which
records why a close carries no guard. What is missing is that **the sweep does not use it, and the
sweep is the only path that closes incidents now**, so every automated close produces a warning
the operator must clear by hand.

Two honest options, and I will implement the one the mechanism already teaches:

- The sweep attaches its own guard when it can (a fix that closes `isolation.off` can register
  the doctor check that now passes, which *is* the guard), and
- for a check with no command-decidable guard, the sweep records a waiver whose text names the
  check it closed and the reason no guard exists.

This is the third time the ledger records a message that names a fix which then refuses: doctor's
`retention.overdue` said `holon gc --apply`, which `--force`s its way past the backup gate; the
staffing note said `--slot maker`, which an executive-profile department refuses; this row's own
close says nothing and lets the operator discover the gate. One guard over the whole family:
`test_no_closed_incident_warns_about_its_own_close` — every close the kernel performs must leave
either a registered guard or a recorded waiver, asserted over the sweep's own output on the live
instances's four subjects (isolation.off, isolation.runner, isolation.broker, schedule.nowake).

**Done 2026-10-30** (`a199ba0`), and the live count is **five** subjects, not the four this row named
(isolation.off, isolation.runner, isolation.reach, isolation.broker, schedule.nowake — measured,
5 `done` incidents and 0 guards). A guard names a `[checks.class]` entry the Chair authored and
the kernel must not invent one, but for a **doctor** incident the re-check genuinely exists — the
check that just reported clean. So where a class is declared the sweep registers the check itself
(a failure reopens the incident, K-2's own promise), and where none is it records a waiver naming
the check and why no command can re-check it, in the same settings key `holon incident waive`
writes. The second mutation is the reason the guard asserts both branches: making the lookup
return the check name unconditionally — the plausible "register everything" fix — ships a guard
that can never run and fails on the next heartbeat for every close it touched. The first draft
died with "cannot start a transaction within a transaction" (`Auth._put` opens its own
`write_txn`; the sweep is already inside one — `_put_raw` is the in-transaction writer).

---

## §5. G4 — the read-only door, the half it does not cover

Today's fix threads `--mode ro` through `main()`'s one construction site. Three other constructors
build a Kernel and are untouched, and each is a surface an agent actually reaches:

| site | line | who reaches it |
|---|---|---|
| `holon/mcp.py` | 174 | a mounted employee — the read-only probe an MCP body runs |
| `holon/integrity/conformance.py` | 84 | `holon adapter test <harness>` |
| `holon/integrity/supervisor_conformance.py` | 98 | the supervised conformance driver |

The MCP half is the one that matters most: today an employee mounting this organization has **no
read-only mode at all**, which is the defect this very session fixed for the CLI, one transport
away. The conformance halves are lower stakes (they run in scratch homes), but leaving them is
how the drift that produced G4 starts.

Fix: a single `kernel(home, actor, broker=None, mode=None)` helper in `service.py` that every
constructor calls, with `mode` defaulting to `"rw"` and the MCP server reading it from the request
it already parses. Guard: `test_every_kernel_constructor_honours_the_mode` walks the AST for
`Kernel(` calls outside the helper and fails — the same shape as the 2026-10-25 row that caught
the hand-maintained list, which is the drift class that made G4 possible.

**Done 2026-10-30** (`99cdfaa`), and **the plan's own framing was wrong in a way worth recording.**
It said the MCP half was "an employee mounting this organization has no read-only mode at all" —
that is not what `mcp.py:174` is. It is a helper that answers one question, *which stage is this
run token's run at*, for the result schema. So the defect was not a missing mode; it was a read
**opening read-write as the Chair** to answer it. Both halves of the plan's fix were measured
against the three sites rather than assumed: the two conformance harnesses dispatch real work and
rightly take read-write (they now say so explicitly), and only the MCP site was narrow. The guard
is an AST rule — a site is in violation when it passes NEITHER `readonly=` NOR `actor=` — because
a list of sites is the hand-maintained artefact the ledger's entropy rows keep finding. **The
behavioural half of that guard was a null test**: with the keywords present but their values
reverted to the widest (`actor="chair", readonly=False`) the AST guard is perfectly happy, so the
assertion is on the mode itself, not on a keyword. Four mutations were run; the two half-measures
(chair+readonly, anonymous+not-readonly) are each caught by the value assertion, which is the pair
being honest about what it can see.


---

## §6. G5 — the remediation that names a command the gate refuses

Fifth instance of one family, and the smallest. `holon gc --apply` refuses on any instance with no
backup newer than seven days — correct, and measured on a fresh instance: exit 4, with the message
naming both the escape (`--force`) and the prerequisite (`holon backup --to …`). The defect is
**the direction of the advice**: the operator is told to take a backup in order to collect, and no
`retention.overdue` finding fires on a fresh instance to say so, so the message is the only
guidance there is and it is addressed to an operator who just wanted to collect old run dirs.

This is the ledger's own `test_no_remediation_names_a_command_whose_gate_would_refuse_it` at its
third firing. The fix belongs in the gate's text, not in a new command: when the backup gate
refuses, name the Chair's **two** choices explicitly — take the backup, or pass `--force` with the
knowledge that the collection will run against an instance whose only copy is the disk it lives
on (which `backup.same_device` already warns about, on the live instance).

**Done 2026-10-30** (`260d937`), and **this row's premise was stale when it was written.** Measured,
the refusal already named both escapes (`holon backup --to …` first, or `--force`) — the
2026-10-23 round-two ledger row fixed exactly that, and this plan was written against the pre-fix
text, the fourth misdiagnosis of the session from an audit that cited moved code. What was genuinely
missing is one level deeper: the escape was offered **without its price**. An operator told a flag
exists and not what the flag decides is the remediation class one layer down, so the message now
says that with no recent backup the only copy of what this deletes is the disk it lives on, and
names the finding that already reports it. The guard is derived rather than listed — every
`--force` a refusal offers as an escape must be followed, in the same sentence, by what skipping
the gate leaves behind — and mutation-verified by dropping the consequence.


---

## §7. Register drift — the rows that outlived their verdicts

Measured, five rows in `TODO.md` carry claims that were false when written or have gone false
since. This is not cosmetic: the 2026-10-22 register row already records that a register whose
rows lie corrupts every plan built on it, and I built part of today's plan against two of these
before measuring.

| row | the stale claim | measured 2026-10-30 |
|---|---|---|
| **H9** | status `open` | the law landed 2026-10-20 (law 10, design law 7, lint pack `boundary`, its guard) — the row's own note says so; only the status column lies |
| **H10** | "Tier-0 remaining: `isolation.off`" | closed 2026-10-26; and the two live-lint errors its final note names as the Chair's one-command fixes were **already** resolved — `.retired` since 10-13, checksum matching its shipped file |
| **H12** | "the overlay does not point at the federation" survives | **false**: the overlay's STATUS §6 points at it by exact path, and the Gate B slop check exists as a tool. The row's other half (an executable cleanse script) survives, and is the Chair's call, not a gap |
| **H5** | "blocked on the reference set alone" | measured 2026-10-26: the library carries 13 reference files and the eight topics are covered elsewhere and unlinked — the fix was a pointer index, which shipped. Blocked on nothing |
| **H2** | "remaining: the deferred-tool index" | the client half landed on the runtime side; whether the deferred-tool index is still open is a runtime-repo question, and this register should say so rather than assert it |

Fix in place, dated, verdicts appended — never a row deleted, per the register's own header. The
guard that keeps this from recurring is lint's `register` pack, which already flags a row marked
blocked on a mechanism the registry demonstrably carries; what it cannot see is a row whose
*note* is false while its status looks plausible. That is §7's own residual, and it is a lint row,
not a plan row.

**Done 2026-10-30** (commit `1340371`): all five corrected in place, H9/H10/H12/H5 → `done`,
H2 → `blocked` with the honest verdict that the deferred-tool index is a runtime-repo question
this register cannot observe. The commit also linked this plan from the README (W009) and scrubbed
three host paths from it, so `lint --strict` reads 0/0 with this file tracked. The gates caught
six defects in this commit's own drafts — three scrub findings, one W009, and two register rows
whose terminal evidence named paths this repo does not carry. **A plan's own file is part of what
its gates measure**, and a gaps outline is the file most likely to name an instance path.

---

## §7b. G6 — the read-only door closed off the instrument that names the boundary

Found by *running* the acceptance test above, not by reading it: `holon --home "$HOLON_HOME"
--mode ro doctor` exited 1 with `sqlite3.OperationalError: attempt to write a readonly database`
at `service.py:2133`, `run_smoke`'s cache INSERT. So the flag built today — whose whole point is
that an agent may look at live state without changing it — made the one command that says whether
the trust boundary is on **unusable**, on the instance where that question is live.

The mechanism: `--mode ro` opens both databases `mode=ro`, which is honest and enforced by SQLite
itself. But `readonly` was only checked at the CLI's write-command gate; nothing downstream asked
before writing. `doctor` reaches one writer — `run_smoke`'s `smoke` cache — and the smoke check
is precisely the half doctor cannot decide without running commands, so it is the first to hit.

Two rules, both measured. In read-only mode `smoke_results` serves the **stale cache** rather than
re-running, because running would write and running commands is not the probe's job when it cannot
record them; the findings a stale cache produces are dated, which is a fact, not invented. And the
door is not widened: no command in read-only mode may write, so a reader of this section cannot
conclude that `--mode ro` has become a mode that sometimes writes.

The honest residual, named rather than hidden: with a stale or absent cache the operator gets
**no smoke findings at all** from a read-only doctor — not a stale reading. That is the correct
trade (an absent finding is a silence the operator can see, and the read-only doctor's smoke cache
is written by the heartbeat, which does run), but it is a silence, and a silence that closes is
not a reading. The gate below asserts both halves.

**Guard, both directions:** `test_read_only_doctor_runs_and_reports` (writes nothing, exits, and
names the smoke cache's staleness when there is one) and `test_read_only_still_refuses_a_write`
(the existing door, still shut). Mutation-verified: deleting the `self.readonly` branch fails the
first; making read-only mode fall through to `run_smoke` fails it too.

**The guard was a null test twice, and both were caught only by running the mutation.** That is
the session's fourth and fifth of that class, and it is why the mutation is not optional:

1. The first draft of `test_read_only_doctor_runs_and_reports` built its fixture with no `[smoke]`
   check, so `smoke_results` returned `[]` without ever reaching `run_smoke` — the live
   `OperationalError` was never reached, and the guard passed with the fix deleted. A fixture
   that does not reach the defect is the null test's most common form. Fixed by planting
   `[smoke] checks = ["true"]`, written the way `KernelCase` writes config.
2. The staleness half asserted a substring `"smoke"` over every finding's message — which the
   *other* smoke findings satisfy, so it passed with the `smoke.unreadable` finding deleted.
   Fixed by asserting the check NAME (`smoke.unreadable`) and that its message names read-only.
   A guard that checks a substring it does not own is testing someone else's line.

---

## §8. Order of work

| # | item | status | whose | gate |
|---|---|---|---|---|
| 0 | **G6** — the read-only door must not close the instrument | **done, `100c5d7`** | A | `test_read_only_doctor_runs_and_reports` |
| 1 | **G3** — the sweep's close leaves a guard or a named waiver | **done, this tree** | A | `test_the_sweeps_own_close_never_leaves_a_warning_behind` |
| 2 | **G4** — one read-only record per connection | **done** | A | `is_read_only` consulted at the CLI's write gate |
| 3 | **G5** — the backup gate names both escapes | **done** | A | `test_no_remediation_names_a_command_whose_gate_would_refuse_it` |
| 4 | **§7** — five register rows corrected in place | **done, `1340371`** | A | lint `register` 0/0 |
| 5 | **G1a** — repair the drifted applied reach | **done, today** | A | `isolation.reach` 3 → **0**, and the harness boots |
| 6 | **G1b** — chown the adapter home so the harness opens its db | **done, today (the Chair's root shell)** | Chair | a dispatched run's `status` is not `failed` |
| 7 | **G2.1** — `holon audit walk` reports every break | **done, today, by this session; the row's earlier "concurrent session" note was corrected in place 2026-10-31** | A | a two-break chain, both named |
| 7b | **the run's environment carries a PATH** | **done, today, `2d891ef`** | A | `test_the_push_run_carries_a_path_and_an_invocable_kernel_command` |
| 8 | **G2.2/3** — attest, then truncate | **open — the Chair's hand on a destructive command** | Chair | `--force`, and the named backup |
| 9 | **`schedule.nowake`** — the one new error this session created | **open, and the Chair's product call** | Chair | see below |

Phase 5 is done and its cost was measured rather than estimated: the drift the ledger row
describes, one `isolation apply --force`.

Phase 6 is the single command in this plan that needs root. Everything before it is mechanical;
everything after it is either mechanical (phase 7) or the Chair's product decision (phases 8 and 9).

**On phase 9 — a row this session created and must not hide.** Stopping the two `*/15` wake
schedules was correct: 192 dispatches a day were producing 263 consecutive failures and zero
useful work. It also removed every clock on the instance, so `doctor` now reports
`schedule.nowake` as an error. That is the honest consequence of the Chair's own instruction not
to arm routines before their requirements are settled, and it is named here rather than left for
someone to find. The Chair's options, all reversible:

- **Leave it.** The instance is pre-clock: `holon dispatch --as <id> --stage <stage>` still claims
  work by hand, which is exactly the mode the Chair asked for.
- **Arm one wake schedule per employee** once their requirements are settled — the gate is
  `--force` for an unstaffed lane, and the staffing predicate the 2026-10-25 row built will name
  the hire.

**The acceptance test for the whole seam** is one command, run read-only:

```sh
holon --home "$HOLON_HOME" --mode ro doctor
```

Reporting **zero** errors other than the three stack-B `smoke.critical` findings (the live
instance's own `[smoke]` checks, which are not this repo's to close) and the `schedule.nowake`
the Chair has chosen to leave.

Two things this plan deliberately does **not** carry:

- **The stack-B smoke findings.** Law 10: a finding about one stack is never evidence about the
  other. They are listed as a count so nobody re-derives them, and dropped.
- **Part B of the 2026-10-27 plan** (the documentation library). It is a separate, already
  partly-executed workstream, and mixing it into a gaps outline is how the last outline ended with
  its own corrections appended.

`net: +3 commands (events walk/attest/truncate), 4 rows repaired, 0 lines cut, 1 root command for
the Chair, and the first read-only seam an MCP employee can reach.`
