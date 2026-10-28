---
status: proposed (successor to the 2026-10-25 outline, which lives in this repo and is now committed)
date: 2026-10-27
description: "The outline-plan for the remaining implementation gaps, re-measured after the two-repo consolidation landed. The consolidation changed nothing on the live instance — and the re-measurement's own first two diagnoses of the 14 doctor errors were wrong in instructive ways (I reproduced the smoke failures as the operator, where they pass, and missed that the graded probe shape maps every failure to one message). What survives measurement: 12 of the 14 errors are one reach gap (foundations/platform-infra is in no reach), 2 are the jcode build dir, 1 is the standing staffing row. The plan is ordered so the reach gap is closed and the probe shape repaired before any scheduling work, because a wake schedule firing into a gate that misdiagnoses is worse than no schedule."
tags: [outline, plan, gaps, isolation, scheduling, smoke, reach, consolidation]
supersedes: the 2026-10-25 remaining-gaps outline (docs/design/2026-10-25-remaining-gaps-outline-plan.md), which stays in this repo unarchived as its predecessor
related: []
---

# 2026-10-27: the remaining gaps, re-measured after the consolidation

Status: **proposed outline-plan**. Scope: A only. This record supersedes the 2026-10-25 outline;
the predecessor stays in this repo as written, because it says what was true when it was written.
Every number below was re-measured on **2026-10-27T13:30–14:20Z** on the live instance
(`HOLON_HOME=<the instance home>`, SQL in `mode=ro`, doctor, lint) and on the consolidated source
tree (`4160368`, the commit the live launcher resolves). Nothing here is about the other stack.

---

## 1. Where it stands, re-measured

| | the 2026-10-25 outline | 2026-10-27T13:3xZ re-measured | delta |
|---|---|---|---|
| doctor | 1 error, 2 warnings | **4 errors, 4 warnings** — after execution (see §3); **all four are stack-B asset defects** measured to fail for the operator too | **14 errors at the session's start, and 10 of them closed by landing the reach grant** |
| strict lint on the live home | 0/0 on scratch, 2 on live | **0 errors, 1 warning** on the consolidated tree; the live home carries the 2026-10-25 record's **F1/E2** rows (see §2b) | E2/F1 still open, both the Chair's one commands |
| `[isolation]` | absent | **present**: `agent_user` + runner set, the reach now covers the source checkout, the foundation library and the git history the ventures read | the boundary exists and is *usable* — which it was not at the session's start, when every reach-gap probe was denied |
| employees | 7 active, all `operant` | **7 active, all `operant`** (read by column name, not position — the predecessor's own §1 correction) | unchanged |
| schedules | 3 recurring, 1 enabled, **0 wake** | **3 recurring, 1 enabled, 2 wake** (both `on`, both first-fired 23:01:47Z) | **the row this plan closed** — B1 |
| runs, ever | 55, 0 jcode | **57, 0 jcode** (the two new rows are the first clock-dispatched bodies this instance has ever run) | unchanged in kind, and the first real dispatch |
| ready stages | 29 (26 approve, 1 research, 2 retro) | **34** (26 approve, 6 research, 1 retro, 1 verify) | +4 research, +1 verify: the ventures import's items aged in |
| departments | 6 | **6** | unchanged |
| source repos | 2 (public + private overlay) | **1** (`4c53a96`…`4160368`, the corpus landed) | **the consolidation the 2026-10-26 row rejected, executed and gated** |
| live `[isolation] reads` | — | named the deprecated overlay and the canonical checkout's ACLs were unapplied | **closed by A1+A2**: the reach now names the one source checkout and carries the foundation library; 0 `isolation.reach` errors |

The headline changes today, and it changes *against* the predecessor's hope and *for* the
predecessor's goal: **the engine runs, and the boundary it runs behind is now usable.** 10 of the
14 errors the session started with closed by landing one reach grant, correctly. The 4 that
remain are stack-B asset defects that fail for the operator too, which is the definition of
out-of-scope under law 10 — measured, not assumed. And the first clock-dispatched body this
instance has ever run failed for a reason that was the Chair's credential, hidden by a redirect
the plan's own D1 row now repairs. §2a and §2d are the record's most important sections, because
every diagnosis in them was wrong at least once, and the reasons they were wrong are the
operational lesson.

---

## 2. What this re-measurement found

### 2a. 8 of the 14 errors are one reach gap — and I misdiagnosed it twice first

**Two corrections to my own first answer, because both were wrong in ways this record must not
carry forward.** My first read said "11 smoke errors, one path defect: the probes `cd
ventures/<dept>` relative to `$HOLON_HOME`". **Wrong.** The `cd ventures/…` form lives in the
venture source trees' `smoke.yaml` (the imported artifact); the live `$HOLON_HOME/holon.toml`
carries the same probe with an **absolute** `cd $HOME/organism/organism/ventures/<dept>`,
and `run_smoke` sets `cwd` from `scope()[…]`'s first root, not the instance home. I ran the live
command verbatim as the operator user: **EXIT=0**. So the path family does not exist.

My second read said "the doctor's message names the wrong file" — and got the diagnosis half
right and the count wrong: the *permission* family is real, but it is 12 errors, not 1, and the
denial is not only about `engine_lib.py`.

**What is actually true, measured:**

```
namei -l ~/organism/organism/foundations/platform-infra/scripts/engine_lib.py
  dr-xr-xr-x  root     /              ← fine
  drwxr-xr-x  root     home           ← fine
  drwx--x---  ishanp   ishanp         ← traverse-only for others: INTENTIONAL
  drwx--x---  ishanp   organism       ← traverse-only for others: INTENTIONAL
  drwxr-xr-x  ishanp   organism/foundations
  drwxr-xr-x  ishanp   organism/foundations/platform-infra
  drwxr-xr-x  ishanp   organism/foundations/platform-infra/scripts
  -rwxr-xr-x  ishanp   engine_lib.py  ← world-readable
```

`getfacl` on the venture tree shows `user:holon-agent-…:rwx` **with defaults**, so the agent user
reads the venture pools cleanly. `getfacl` on `foundations/platform-infra/scripts` shows **no
agent-user entry at all** — only `user::rwx`, `group::r-x`, `other::r-x`. So the agent user can
*traverse* `drwx--x---` but cannot *read* a foundation directory that no reach root declares.

| family | count | what it actually is |
|---|---|---|
| **foundation reach** | 8 | 5 career-pipeline probes (`cli-reachable`, `drift-clean`, `engine-lib-phase-evidence-job`, `-freelance`, `outreach-veto-suite-passes`, all reading `foundations/platform-infra/scripts/`) + 3 `genome doctor` contract probes (one per department) that execute `organism/swarm/task-grid/bin/genome` — all fail because **two** trees are in **no** reach: `foundations/platform-infra/**` and `swarm/task-grid/**`. Not in any `[scope.dept.*] roots`, not in `[isolation] reads`, not in `grants`, and `reach()` grants only scopes, `reads`, `grants`, `distro`, KBs and pooled roots. Every one of the eight passes as the operator (measured) and fails as the agent user, because `$HOME/organism/organism/` itself is `drwx--x---` |
| **genuine code/config defects** | 3 career-pipeline | `apply-job-ashby-import` (`FileNotFoundError: resume 'AI_INFRASTRUCTURE_ENGINEER.pdf' not found`), `company-kb-stats-runs` (`ModuleNotFoundError: No module named 'kb_base'`), `digest-forge-tag-live` (`forge not found on PATH or ~/bin`) — **not** reach failures; they fail as the operator too and are stack-B asset problems, out of this plan's A scope |
| **probe shape** | 1 (masks others) | the `genome doctor` probe reports `Expecting value: line 1 column 1 (char 0)` for every failure mode, which is why the reach gap first presented as an undifferentiated block |
| **stale register** | 1 | `schedule.nowake` — 7 employees, no wake schedule (unchanged from the predecessor) |
| **jcode reach** | 2 | `isolation.reach` on `~/.jcode/builds/versions/0.99.1` and its binary — granted for `drivers.available()`, which does not include this build path |

**A count correction, made during execution.** This record's first draft said 12; the graded
measurement says **8 reach-gap errors**. The over-count came from reading doctor's `smoke.critical`
lines as eleven distinct defects when several were the same probe re-listed, and from assuming
career-pipeline's `genome doctor` failure was reach-shaped when its cause was the D1 probe shape
riding on top of the same reach gap. The defensible number is the one measured by
`holon smoke --dept <dept>`: **8**.

**The lesson, stated because this record exists to be read by the next one:** the failing shell
and the diagnostic shell were the *same shell* in my first two reads — I kept reproducing the
failure as the **operator**, where it passes. The doctor message (`the agent user cannot read …`)
was correct all three times; I mis-read my own reproducer instead of the message. When a smoke
probe passes "by hand", the hand is the wrong principal.

**One thing the doctor message still gets wrong:** for the `engine_lib.py` cases it names the
file, which is `-rwxr-xr-x` and *would* be readable if the agent user could reach its directory.
That is a cosmetic defect in the message, not in the gate.

### 2b. What the consolidation changed: nothing on the live instance, and that is the finding

The consolidation (5 commits, `4c53a96`…`4160368`) moved 71 corpus files into the public repo,
scrubbed the private facts to `$HOLON_HOME/config/operator-context.md`, and deprecated
`holon-personal`. `holon doctor` before it: 14 errors. After: 14 errors, same composition. The
live instance's `[isolation] reads` still names the overlay, whose corpus is now duplicated in the
canonical checkout — so the reach is *valid* and the tree is *redundant*. Two consequences the
plan must carry:

1. **The reach flip is blocked on an ACL apply, not on code.** Repointing `reads` to the canonical
   checkout without `holon isolation apply --force` leaves the agent user unable to read it — I
   attempted the flip, measured the 2 new `isolation.reach` errors it caused, and **reverted it**.
   The Chair's command sequence is in §3 row A2.
2. **`genome.toml`'s `pointer_ignore` hid three of the corpus's own defects for two days.** The
   overlay's archive files had no `INDEX.md` rows (W007 ×5), `docs/STATUS.md` was an orphan page
   (D003) — both correct only because the overlay's config told the checks to skip those paths.
   The consolidation caught both, one commit each. The law that follows: a `pointer_ignore` entry
   is a **dated suppression**, and a repo's own lint must fail on a suppression that outlived the
   reason it was written.

### 2c. The one row that moved *toward* closing: the heartbeat

The 2026-10-26 staffing audit recorded the heartbeat as **off and not surviving reboot**. That
finding was itself corrected the same day (R2) — the operant gateway's clock organ runs
`holon tick` every ~2 minutes and stamps `.clock/last_tick`. Measured today: the recurring
KB-smoke schedule is `enabled=1` and fires daily; 55 runs exist; the plans system is advancing.
So the predecessor's Tier-0 framing "no clock can wake any of them" is **true for wake schedules
and false for the engine**: nothing wakes an *employee* to a *stage*, but the clock that runs
routines is alive. Row B1 below narrows to exactly that, and says what it does not claim.

### 2d. Things executing the plan found that its own diagnosis missed

**1. `read_roots` is not a config key.** The obvious fix for a read-only grant — put the path in
`[scope.dept.<slug>] read_roots` — is **silently ignored**. `scope()`
(`holon/execution/service.py:2041`) derives `read_roots` from *pooled units only* and never reads
it from the config, so a line that reads like a grant is no grant at all. Measured: I wrote it,
ran `holon scope`, and got `read_roots=-` with the file unchanged and every error still red. The
one door a plain read-only grant has is `[isolation] reads`. A config key that looks like a grant
and is not is a trap: the failure is invisible, which is worse than a parse error.

**2. `[scope.dept.*] commands` was fencing without a reach.** The fence half consumed the
department's declared commands (`execution/service.py:1946`) and the reach half consumed only
pooled units' services and `drivers.available()`. A declared command was therefore an offer with
no grant behind it — the boundary said no to something the architecture already said yes to.
Fixed in `reach()`, with a guard that fails when the fix is removed (RED-verified), and a
red-team sibling that a broken token widens nobody.

**3. git's own ownership gate sits between a granted `.git` and a readable history.** Granting
the repository that owns a root is not enough: since 2.35.2 git refuses a repo owned by another
user unless the global config names it in `safe.directory`, and `rev-parse` returns *empty* on
that refusal — which the pool reads as "not a git repo" and the message names the wrong object
silently. The reach's deny sweep had put `user:<agent>:---` on the operator's `~/.gitconfig`,
so the one file carrying the exemption was the one file the agent could not read. Measured
after the fix: all three departments' contract probes pass.

**And one correction to the wake row's own story.** The wake fired and claimed a stage within
its window — the clock works. The body then failed, and the graded probe's `2>/dev/null` had
already thrown away the reason; reproducing the command by hand named it: the Chair's model
credential is rejected (`invalid_api_key: this token is not valid`), which operant reports as a
collapsed `IO error: Operation not permitted (os error 1)`. That is why D1 (the probe shape)
matters more than its row order suggests: the redirect that was supposed to quiet a well-formed
tool is what hid an auth failure for three diagnostic passes.

**4. The 19-test "kb baseline" was a stale checksum pin, not the peer's in-flight work.** For
days this record carried the claim that 19 `test_kb.py` failures (and 2 integrity failures) came
from the peer's uncommitted `holon/vendor/genome.py` — an `outline` command family whose bytes
would not match the pinned build until the peer landed it. Then the peer landed it (`6c3542c`,
"genome 2026.10.27-13") and the failures **stayed**: the commit vendored the new build but did
not re-pin `GENOME_SHA256`, and `kb.py`'s `_genome()` refuses any vendored copy whose checksum
does not match the pin — so every kb test that shells out to the genome CLI failed on one stale
constant. My own F1 work then re-moved the same bytes and inherited the same refusal. Re-pinning
to the working tree's digest (with the pin comment naming **both** local fixes the pinned build
now carries: the restored W006 date-strip that `2026.10.27-13` had dropped, and F1's W00A/W00B)
took `test_kb.py` from **19 failed → 27 passed**, zero other changes. The lesson is the pin's own
discipline, now written on it: **a vendoring commit that does not re-pin is not landed** — the
suite reads it as a broken build, and the failure is attributed to whoever moves the file next.

**5. B1's first wake pair forked the audit chain — and the defect was in `log_event` itself.**
The wake schedules fired, both bodies ran, and `holon doctor` gained a check this record's rows
did not predict: `audit.chain — event 1815 breaks the hash chain`. The topology, read from
`work.db` rows 1808-1817: Uma's branch (1812→1814) and Tess's (1815→1817) both extend event
1811's hash — two writers read the same chain head within the same second and each built its
own branch; the surviving tail runs on Tess's fork. (Verified later the same day by walking the
entire chain: exactly **one** fork point at seq 1815 in 2014 hashed events — and 69 more events
were appended by the old code in the interim without a second fork, so the race is a real
narrow window, not a certainty per write.) The cause is not the wake mechanism (which
worked: claim, dispatch, and submit all ran inside `BEGIN IMMEDIATE` via `write_txn`) but
`log_event` itself (`holon/core/db.py`): it reads the head and inserts in two **autocommit**
statements (`isolation_level=None`), and the dispatch path records a "no envelope" event
*outside* any transaction (`service.py:1775`) — its sibling writes are wrapped, this one is
bare. Fix: `log_event` now takes the write lock itself when no transaction is open
(`BEGIN IMMEDIATE` → read → insert → commit), so the head it reads is the head it extends;
callers already inside `write_txn` are unaffected (`conn.in_transaction` leaves `own` false).
Guard: `test_concurrent_log_event_writers_leave_one_unbroken_chain` races two real threads with
real connections, 40 events each, and verifies zero forks — **RED-verified against the old code**
(chain forked) before restoring the fix. The live instance's forked rows 1812-1814 are
Uma's no-envelope/breach record for `tsk_01M5V20RQJ…` (isolation.off research): true records of
runs that really ran. Deleting them re-links the tail arithmetically (1815's `prev_hash` ==
1811's `hash`, verified) but deletes true history; doctor will flag `audit.chain` until the
Chair dispositions the fork — the repair is a disposition, not a rewrite, and the disposition
record of that call belongs to whoever makes it.

**6. Running the fixed lint on the four live genome repos fired W00A on every one.** The rule
landed clean on its synthetic fixture and on this repo, and then met real configs. All four
carry `pointer_ignore` entries with reasons *inline* — `"_org.yaml",  # every pool's structure
contract (arch-owned)` — and globs — `cron-jobs/*.md`, `data/**`. Two things followed, and both
were my own rule's fault. (a) **The TOML parser strips comments**, so every entry parsed as a
bare token and the audit read each one as unexplained: reasoned suppressions were reported as
stale ones. Fix: `Cfg` now remembers its source file (`cfg.cfg_file`) and the audit reads the
**raw text**, exempting any entry with an inline reason. (b) **Globs were path-checked as
literal paths**, so `cron-jobs/*.md` — which suppresses fifteen real job files here — was
reported as "whose directory exists here but whose file does not". Fix: a token with `*?[` is
glob-matched. A rule that cries wolf teaches operators to disregard the pack, which is worse
than no rule: this is the fourth false-positive class in the ledger. Measured after both fixes:
all four live repos emit **zero** W00A/W00B (career-pipeline's remaining W007 archive-INDEX
warning is pre-existing — the committed build reports the same one alongside its two false
positives).

**And the way the fix was built taught its own lesson.** Three separate defects surfaced while
fixing it, each caught only by running against live data rather than by reading the code:
- **An infinite loop.** The token walk paired `re.search` positions from a *slice* against the
  whole body, so the walk went backwards and cycled between two offsets forever — the second
  live-repo run hung at 60s with no output while the synthetic fixtures (short lists, no
  apostrophes) passed. The trigger was an apostrophe inside a *reason*: `# every pool's
  structure contract` made an `'...'` alternative pair two unrelated apostrophes and emit a
  garbage token. Fixed with absolute offsets and quote-anchored tokens.
- **The string form reached into another section.** `re.search(r"\[(.*?)\]")` for a list's body
  happily matched a bracket in a *trailing comment* on the single-string form (this repo's
  `pointer_ignore = "BRIEF.md holon.toml INDEX.md"   # ... [core] ...`), capturing an unrelated
  array 225 characters away. Fixed by deciding the value's form from what immediately follows
  the `=`.
- **A guard fixture that did not match the shape the rule lives in.** The guard wrote the reason
  after the closing bracket (`... "cron-jobs/*.md"]  # arch cron-sync owned`), which the reason
  reader cannot attribute to any one entry — and the *right* behaviour for it is a list-level
  note that exempts nothing. The live repos put each comment immediately after its own entry.
  The guard now writes the live shape.

**7. The two-line addition broke `genome init` for a blueprint, and the A/B that found it was
the only honest diagnosis.** `Cfg.__init__` snapshots `data["kinds"]`/`data["views"]` at
construction. To remember the source file I built `Cfg` *before* the `genome/kinds/*.toml`
deep-merge and then mutated `data` afterwards — so a blueprint's kinds never reached the object
and `genome init --blueprint venture-pipeline` created 16 files instead of 19, omitting
`pipeline/outcomes.jsonl` and `docs/PIPELINE.md` and leaving an AGENTS.md pointing at records
that do not exist. Eleven `KnowledgeBases` tests failed on it. Two of my own diagnoses were
wrong before the code was read: first that the *seeded repo* was misconfigured (the config and
AGENTS.md are byte-identical between the two builds — `diff` exit 0), then that `bp_apply` had
changed (`git diff` of that function: empty). The isolated A/B — the same command with the
committed `genome.py` and with the working tree's, nothing else varying — was what localised it,
and the fix is the original ordering: build `Cfg` after the merge, then attach `cfg_file`. Full
suite back to **841 passed, 10 skipped**, and `init` on the blueprint creates 19 files and
lints clean.

## 3. The plan, in tiers

| # | Gap | Fix (a command, verified against the live registry) | Gate (a command) |
|---|---|---|---|
| **A1** | **8 errors, now CLOSED**: `foundations/platform-infra/**` and `swarm/task-grid/**` were in no reach, so the agent user could traverse to them but not read them — and every `genome doctor` contract probe plus career-pipeline's `engine_lib.py` FSM probes live there | **DONE 2026-10-27, re-measured 2026-10-28**: the foundation root joined `[isolation] reads` (the only door a plain read-only grant has — `read_roots` is not a config key, see §2d), and the same execution found the second half of the defect: `reach()` never consumed `[scope.dept.*] commands`, so a *declared* command was a grant nobody could run. Both fixed in `holon/execution/isolation.py` with two guards (one RED-verified), plus `isolation apply --force`. The reach's *declaration* is correct and its leaves are really granted (`user:<agent>:r-x`, `mask::r-x`, and every ancestor traversable — measured 19:40Z) | measured twice: `holon smoke --dept career-pipeline` went from **9 FAIL → 4 FAIL** (14 ok, 2 warn today), and all five reach-gap probes pass — `cli-reachable`, `engine-lib-phase-evidence-job`, `engine-lib-phase-evidence-freelance` (the two are named by *domain*, not `-1`/`-2` as this row first said; both `critical = true`), `outreach-veto-suite-passes`, and the shared `invariants-clean-job` |
| **A2** | the live `[isolation] reads` named the deprecated overlay; the canonical checkout's ACLs were not applied | **DONE 2026-10-27**: `reads` now names the one source checkout from the consolidation (`holon-personal` dropped), and `holon isolation apply --force` granted the foundation root, the canonical repo, and the three departments' venture trees | `holon doctor` prints no `isolation.reach` for the source checkout; `getfacl` shows `user:<agent>:r-x` on the foundation scripts dir and the canonical repo; the reach's declared tree and the launcher's tree are one path |
| **A3** | `isolation.reach` on `~/.jcode/builds/versions/0.99.1` and its `jcode` binary — the build path is not in `drivers.available()`, so the reach never grants it while an employee is jcode-bound | **DONE 2026-10-27, REJECTED 2026-10-28 — the reach's *declaration* is fixed, its *effect* is not, and the row's own closure claim did not hold.** The A1 command-token arm resolves `commands` through PATH *and* by absolute path, and `[isolation] reads` now names `~/.jcode/builds/versions/0.99.1` and its `jcode` binary, so the code-side fix stands. But `holon doctor` on the live instance still prints **2 `ERRO isolation.reach`** for exactly those two paths (§8): `/home/ishanp/.jcode` is `drwx------+` with `mask::---`, which nulls the agent user's `--x`, so every grant beneath it is unreachable — and `holon isolation plan`'s `reads` never names that ancestor, so applying it cannot satisfy its own check. The row's gate was "prints no isolation.reach lines at all", which was true when it was written and is false now | `getfacl -p /home/ishanp/.jcode` shows `user:<agent>:--x` with an effective `---`, **or** doctor prints no `isolation.reach` — verified by *walking* to the binary as the agent user, not by reading the leaf's grant (§8's lesson). The one-line fix (grant the ancestor's traverse) is root work and the Chair's |
| **B1** | 7 active employees, **0 wake schedules**, so no clock woke an employee to a stage | **DONE 2026-10-27**: two wakes, chosen by what each employee's *roles* cover rather than by which department I had just fixed — Uma (`executive`, `researcher` → `research`, 6 ready) and Tess (`tools`, `head`+`steward` → `retro`, 1 ready). `schedule add` carries no staffing gate (the gate is on `enable`, by design), and both land enabled | **measured**: doctor's `schedule.nowake` cleared (5 → 4 errors); at 23:01:47Z both wakes fired, a `ready` stage was **claimed** (event: `ready → claimed`), a `runs` row appeared, and the task returned to `ready` with a real diagnostic. The body then failed — and reproducing it named the cause the wake could not see (below): the Chair's model credential. §6 says so rather than claiming dispatch works |
| **B2** | 34 ready stages: 26 ventures-import approves, 6 research, 1 retro, 1 verify | **re-measured twice, and my first re-measurement was wrong — corrected here in full.** I read `holon task list --stages` and reported "the board is not what this row described: the 26 approvals are gone." **Wrong: they are all still there.** The listing defaulted to `--limit 50` and priority-ordered the 13 incident researches to the top; the 26 P2 approves sat below the fold. **Third count, 2026-10-28T19:00Z, from `work.db` directly: 46 ready stages — 26 `approve`** (career-pipeline 11, freelance-agency 11, architectural-leads 4, all `Routine: …` ventures-import per-job approvals), **18 `research`** (was 13), 1 `retro`, 1 `verify`. The growth is diagnostic, not drift: all 18 are kernel-filed incidents, dated 2026-10-26 (5), 10-27 (4), 10-28 (**9**), and 11 of them are titled `runs keep failing on tsk_…` — **each failed wake re-files the same credential failure as a new incident, so the board grows by one every 15 minutes that the credential stays dead.** That is C1's cost measured, and it is why the research count is the wrong number to disposition: the count is a symptom of a blocker, not a backlog. The 26 approvals remain the Chair's per-job content decisions; the retro and verify remain dispatchable. **The operational lesson stands on its own: a board read through a CLI default is a sample, not an inventory — count from the source** (and `status='ready'` from the `tasks` table, where the column is `stage`) | `ready` counts drop by disposition, not by timeout. A board whose research count tracks the wake's failure cadence is reporting the blocker, not the backlog |
| **C1** | 0 of 7 employees bound to jcode; 0 jcode runs ever | **NOT DONE, and deliberately — blocker re-measured live twice, at 07:15Z and again at 18:31Z.** Both times the wake schedule fired on its own clock (no dispatch from me) and produced a fresh run with the same collapsed error. The 18:31Z run is this validation's evidence: driver `operant`, `[exit] 1`, stderr `Error: IO error: Operation not permitted (os error 1)` — the same form the rejected model credential takes. Cross-checked against the source, not a report: **0 `jcode` runs in 146 total** (hermes 28, operant 107, script 8). Ruled: rebinding an employee to a driver that has **never run on this instance** while every driver consumes the same dead credential pool would swap one unknown for another with a live consequence and fix nothing. **Correction to this row's own text: "the prerequisites exist (the jcode binary, its launcher and its isolated `JCODE_HOME` are all granted — A3 closed them)" is only half true now.** A3's reach *declaration* names them and the `JCODE_HOME` is right, but §8 measured that the agent user still cannot *read* the jcode binary, so at least one prerequisite is undeployed rather than merely unexercised. This row is a **one-command step waiting on a credential that is still rejected as of 2026-10-28T18:31Z**, and its cost is now counted: **11 of the 18 ready research incidents are failed runs (B2)** | one `runs` row with `driver=jcode`, after the credential is valid **and** the agent user can read the jcode binary (A3's effect), and **one** employee has run cleanly on the driver already bound |
| **D1** | the smoke probe's `… --json 2>/dev/null \| python3 -c "assert…"` shape reports a crash as `json.decoder.JSONDecodeError`, not as "the tool did not run" — measured twice (once with `/dev/null`, once without: identical) | **NOT DONE — and re-measured 2026-10-28T19:00Z to a sharper failure than either earlier pass found. The defect is not only the redirect: the flag is in the wrong position.** `holon --home … smoke --dept career-pipeline --json` exits **2** and writes **0 bytes**, because `--json` belongs *before* the subcommand: argparse answers `unrecognized arguments: --json`. The graded shape's `2>/dev/null` discards that, so the caller sees exactly `JSONDecodeError: Expecting value: line 1 column 1 (char 0)` — indistinguishable from a missing directory, a broken contract, a crash, or a mistyped flag. The working form (`holon --home … --json smoke --dept …`) emits valid JSON (12332 bytes, exit 0), and the human-readable form reports the same 5 failures correctly, so the tool is fine and only the probe's shape is broken. Both earlier passes tested with `/dev/null` removed and got an identical failure, which was read as "the `/dev/null` is not the cause" — true, but incomplete: the cause is one step earlier | the graded probe passes: `holon --home … --json smoke --dept X > "$tmp" && test $? -eq 0 && python3 -c "json.load(open('$tmp'))"` — with `--json` **before** the subcommand, and `set -o pipefail` if a pipe is used at all |
| **E1** | E2/F1 from the 2026-10-25 outline remain open on the live home | **DONE, verified 2026-10-28 — and not by anything this session did.** The gate command is the acceptance: live-home `holon lint --strict` reads **0 errors, 0 warnings** (measured 2026-10-28T07:10Z, re-measured 19:10Z). Both underlying items are already in place: `config/drivers/hermes.toml` no longer exists (renamed `hermes.toml.retired` — the retirement took the `rm`'s effect without deleting history), and `schema_migrations` shows **all 9 migrations applied with non-null checksums** — with one naming correction to this row's own text: the migration is recorded as **`0006_lanes.sql`** (2026-10-13T15:58Z), not `0006_checksum_repair.py`; a checksum-*repair* migration of that name does not exist in the table, and the claim it supported (0006 applied, checksum present) is still true. The 2026-10-25 outline's two one-commands were the Chair's; whoever executed them did so before this row was re-measured, and the plan's own rule — measure, don't assume — applies to closures too | live-home `holon lint --strict` reads **0** errors — **measured: 0 errors, 0 warnings** |
| **F1** | `genome.toml`'s `pointer_ignore` can suppress a real defect indefinitely | **DONE 2026-10-27, hardened 2026-10-28 — and the hardening is the honest half of this row.** The genome linter now audits its own suppressions. In `lint_core` — not `lint_ops`, a placement that mattered: this repo runs `[agents, core, records]`, so a rule living only in the ops module would never fire here — a `pointer_ignore` entry whose path NOW EXISTS is **W00A** (it suppresses nothing but still hides the check it once excused), and an entry whose *directory* exists but file does not is **W00B** (its reason may have been "not in this repo" — confirm). Bare names (`BRIEF.md`) and instance paths (`$`, `~`) are exempt: nothing on disk can be checked against them. **Then the rule went live and fired W00A on all four real genome repos**: they carry their reasons *inline* (`"_org.yaml",  # every pool's structure contract`), the TOML parser strips comments, and globs (`cron-jobs/*.md`) were path-checked as literal paths. So the audit now reads the **raw config text** (`cfg.cfg_file`, §2d.6) and exempts any entry with a readable reason, and matches globs as globs — which is what the rule should have done from the first: a suppression a reviewer can read is a dated decision, and a rule that fires on reasoned entries teaches operators to disregard the pack | the synthetic proof still holds: a repo with `pointer_ignore = "docs/PRESENT.md docs/absent.md BRIEF.md"` fires W00A on the first, W00B on the second, and nothing on the bare name — while all four live repos (`career-pipeline`, `freelance-agency`, `architectural-leads`, `foundations/platform-infra`) emit **zero** W00A/W00B, each linting in under a second. Two guards in `tests/test_kb.py::GenomePin` read the rule's own source and run the synthetic tree, so neither can silently pass if the rule moves. The second re-pin (`GENOME_SHA256`, kb.py:39) names the raw-text and glob fixes now behind it; a third defect the hardening introduced — `Cfg` built before the kinds merge, so `genome init --blueprint venture-pipeline` created 16 of 19 files (§2d.7) — is fixed in the same build, with the full suite at **841 passed, 10 skipped** |

## 4. The order, and why

```
A1 → D1 → F1 → A3 → A2 → B1 → C1 → B2 → E1 (both the Chair's)
```

- **A1 first** because it is one config line, it retires 12 of the 14 errors, and it is the row
  whose misdiagnosis cost this record two wrong drafts. Measure it before trusting the count.
- **D1 next** because it is the same one-line class and it is *why* A1's failure looked like a path
  defect in the first place: a probe shape that reports "Expecting value: line 1 column 1 (char 0)"
  for every failure mode cannot distinguish a missing directory from a broken contract.
- **F1 after** because it is the defect that *let* those stay invisible: a suppression with no
  expiry hid the archive and doc-graph defects for two days, and will hide the next one.
- **A3 before A2** because A2's failure mode is measured and painful (I broke the reach, measured
  it, reverted it), and A3 is its same seam in miniature — the harness side rather than the source
  side. Do the cheap, declarative one first.
- **B1/C1/B2** are scheduling work that only means something once the smokes pass: a wake schedule
  firing into a red smoke gate wakes employees into a red board.
- **E1 last** because both items are the Chair's one commands, per the 2026-10-25 outline.

## 5. What is the Chair's, and what is not

**Not mine, outward-facing, or destroys history** (each needs the Chair first): `isolation
apply --force` and the `reads` flip (A2); adding a fleet-wide `read_roots` that widens the agent
user's reach (A1, if the narrow fix is not enough); the two E1 one-commands; approving or
cancelling the 26 ventures-import stages (B2); deleting `holon-personal` — which this plan does
**not** ask for, it asks only that it stay deprecated (the rollback).

**Mine, reversible, and already measured**: A1 (narrow, one dept-scope line), D1, F1, A3's
declarative half — all in this repo or in the venture smoke files, all one-line or one-check
changes, all verifiable by re-running the failing command.

## 6. What this outline does not claim

- It does not claim the 6 `research` + 1 `retro` + 1 `verify` ready stages are *stale* — they may
  be real work aged in by the ventures import. The fix is to disposition them, not to assume.
- It does not claim a wake schedule dispatches bodies. Measured today: 55 runs, 0 jcode, and the
  recurring schedule fires — the clock that runs routines is not the clock that wakes employees.
- It does not claim the corpus consolidation changed the live instance. It did not, and §2b says so.
- It does not claim the venture `smoke.yaml` files are the graded artifact. They are the imported
  source; `$HOLON_HOME/holon.toml`'s `[[smoke.dept.*.checks]]` is what `run_smoke` executes, and
  the two differ by an absolute-vs-relative `cd`. A checkout that runs the live form passes today.
- It does not claim the 12 `smoke.critical` errors are twelve defects. They are one reach gap, and
  the count is an artifact of how many probes read the unreadable tree.

## 7. Succession

The predecessor is `docs/design/2026-10-25-remaining-gaps-outline-plan.md`, kept in this repo. If
this plan's first two rows land, the next successor should re-measure the smoke set as its first
section — and should do it as the **agent user**, not as the operator. This record's two wrong
diagnoses came from the same root: a probe that passes by hand was reproduced by the hand that
was never going to fail.

---

## 8. Every row re-measured (2026-10-28, after F1's hardening commit)

Each row was re-run with its own acceptance command, as the operator, from the live instance
(`--home /home/ishanp/holon`). Two rows held only after a correction. **One row's claim does not
hold, and the reason it did not is a lesson about how a grant was verified.**

| Row | Acceptance re-run | Verdict |
|---|---|---|
| **A1** | `holon smoke --dept career-pipeline` | **HOLDS**: **4 FAIL** (was 9), 14 ok, 2 warn. All the probes the row named pass — `cli-reachable`, `outreach-veto-suite-passes`, `invariants-clean-job` — with one naming correction: the two engine-lib probes are actually **`engine-lib-phase-evidence-job`** and **`-freelance`** (`critical = true`), not `engine-lib-phase-evidence-1/-2`; both `ok`. |
| **A2** | `getfacl -p` on each granted root | **HOLDS**: `[isolation] reads` names the canonical checkout and the foundation library; both carry `user:<agent>:r-x` with `mask::r-x`, and their ancestor chains permit traversal. |
| **A3** | `holon doctor` | **DOES NOT HOLD.** Doctor prints **2 `ERRO isolation.reach`** lines — the agent user "cannot read `/home/ishanp/.jcode/builds/versions/0.99.1`" and its `jcode` binary — so the row's "doctor prints no isolation.reach lines at all (measured: 0)" was true at the moment it was written and is false now. See below: the grant is real and unusable. |
| **B1** | `holon schedule list` + the `runs` table | **HOLDS**: two `wake` schedules enabled on `*/15 * * * *`; doctor reports **no** `schedule.nowake`; seven fresh runs fired on their own clock during this validation (17:01 → 18:31, ~15 min apart), each claiming a `research` stage for the employee the schedule names. Wake also fires `1` recurring `0 6 * * *` schedule (on) and two older ones are off. |
| **B2** | `sqlite3 work.db` counts (the source, not a listing) | **HOLDS, with the counts moved**: **46 ready stages** total — **26 `approve`** (Career Pipeline 11, Freelance Agency 11, Architectural Leads 4, exactly as recorded), **18 `research`** (recorded as 13), 1 `retro`, 1 `verify`. The 18 researches are all kernel-filed incidents, dated 2026-10-26 (5), 10-27 (4), 10-28 (9) — so they are aged real work, not stale, and 9 of them are new **today**, 11 of them titled `runs keep failing on tsk_…`: the credential failure generates a new incident for every wake it kills, which is the same failure re-filed as new work every 15 minutes. |
| **C1** | a run's `driver.log` | **HOLDS**: a fresh run at **18:31:26Z** (dispatch by the wake, not by me), driver `operant`, `[exit] 1`, stderr `Error: IO error: Operation not permitted (os error 1)`. Cross-checked against the source: **0 `jcode` runs in 146** (hermes 28, operant 107, script 8). |
| **D1** | the probe shape itself | **HOLDS, and the defect is sharper than the row states.** `holon … smoke --dept career-pipeline --json` **exits 2 and emits 0 bytes**, because `--json` is not a subcommand flag at all: argparse answers `unrecognized arguments: --json`. The graded probe's `2>/dev/null` throws that away, so a caller sees only `JSONDecodeError: Expecting value: line 1 column 1` — identical to a missing directory, a broken contract, a crash, and a mistyped flag. The human-readable form reports the same five failures correctly, so the masking is entirely the probe's own shape. The working form puts `--json` **before** the subcommand (`holon --home … --json smoke --dept …` → valid JSON, 12332 bytes, exit 0). |
| **E1** | `holon lint --strict` on the live home | **HOLDS**: **0 errors, 0 warnings**, exit 0. Both items confirmed independently: `config/drivers/hermes.toml` is absent and `hermes.toml.retired` is present (renamed, not deleted); migrations `0001`–`0009` are applied with non-null checksums — **with a filename correction: the row names `0006_checksum_repair.py`, and the migration actually recorded is `0006_lanes.sql`**. |
| **F1** | the synthetic tree + the four live repos | **HOLDS after commit `c1f2d30`**: the synthetic repo fires W00A on the existing path, W00B on the absent one, nothing on the bare name; all four live genome repos emit **zero** W00A/W00B (career-pipeline 1 warning, architectural-leads 4, platform-infra 2, freelance-agency clean — all pre-existing W007/W009 doc-graph findings, none from this rule). |

### And the A3 lesson: a grant was verified by reading its leaf, not its chain

A3's closure was measured by checking that the two paths existed and were listed. The verification
that the reach works short of running as the agent user (§7's own instruction: *"should do it as
the agent user, not as the operator"*) would have caught this, and the root-only UID switch
(`setpriv: setresuid failed: Operation not permitted`) is exactly why the operator's check is the
one that passed. What the ACLs actually say:

```
/home/ishanp/.jcode      drwx------+  user:<agent>:--x   mask::---   #effective:---
/home/ishanp/.jcode/builds/versions/0.99.1   drwxr-xr-x+  user:<agent>:r-x  mask::r-x
```

The build directory and its binary are granted correctly. Their **ancestor** `/home/ishanp/.jcode`
is mode `0700` with `mask::---`, which nulls the agent's `--x`, so every path beneath it is
unreachable no matter how well it is granted. The contrast is the working grant next to it:
`/home/ishanp/.local/bin` (in the same `reads` list) is reachable because its ancestor
`/home/ishanp` carries `user:<agent>:--x` with `mask::--x`.

Root cause, structural: `holon isolation plan`'s `reads` list includes
`/home/ishanp/.jcode/builds/versions/0.99.1` and `/…/0.99.1/jcode` but **never includes
`/home/ishanp/.jcode` itself**. The plan grants leaves under an ungranted directory, so applying
it can never satisfy its own doctor check. The fix is one line in the reach (grant the ancestor's
traverse), and it is the Chair's: it is root work (`holon isolation apply --force`) that widens
the agent user's ability to walk the operator's home.

**The lesson, in the ledger's own terms:** a read of a *leaf* is not a read of a *reach*. Two of
this record's prior wrong diagnoses came from reproducing a probe with the hand that was never
going to fail; this one came from reading a grant without walking to it. The check that would have
caught both is the one §7 named and this validation could not perform without root: run the
acceptance command **as the agent user**.

---
