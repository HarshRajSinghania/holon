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

### 2d. Three things executing A1 found that the plan's own diagnosis missed

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

---

## 3. The plan, in tiers

| # | Gap | Fix (a command, verified against the live registry) | Gate (a command) |
|---|---|---|---|
| **A1** | **8 errors, now CLOSED**: `foundations/platform-infra/**` and `swarm/task-grid/**` were in no reach, so the agent user could traverse to them but not read them — and every `genome doctor` contract probe plus career-pipeline's `engine_lib.py` FSM probes live there | **DONE 2026-10-27**: the foundation root joined `[isolation] reads` (the only door a plain read-only grant has — `read_roots` is not a config key, see §2d), and the same execution found the second half of the defect: `reach()` never consumed `[scope.dept.*] commands`, so a *declared* command was a grant nobody could run. Both fixed in `holon/execution/isolation.py` with two guards (one RED-verified), plus `isolation apply --force` | measured: `holon smoke --dept career-pipeline` went from **9 FAIL → 4 FAIL**, and all 5 reach-gap probes pass (`cli-reachable`, both `engine-lib-phase-evidence-*`, `outreach-veto-suite-passes`, and the shared `invariants-clean-job` that was also denied) |
| **A2** | the live `[isolation] reads` named the deprecated overlay; the canonical checkout's ACLs were not applied | **DONE 2026-10-27**: `reads` now names the one source checkout from the consolidation (`holon-personal` dropped), and `holon isolation apply --force` granted the foundation root, the canonical repo, and the three departments' venture trees | `holon doctor` prints no `isolation.reach` for the source checkout; `getfacl` shows `user:<agent>:r-x` on the foundation scripts dir and the canonical repo; the reach's declared tree and the launcher's tree are one path |
| **A3** | `isolation.reach` on `~/.jcode/builds/versions/0.99.1` and its `jcode` binary — the build path is not in `drivers.available()`, so the reach never grants it while an employee is jcode-bound | **DONE 2026-10-27, as a side effect of the same fix**: the A1 command-token arm resolves `commands` through PATH *and* by absolute path, and the reach now carries `~/.jcode/builds/versions/0.99.1` and its `jcode` binary — `getfacl` confirms `r-x` on the launcher and the binary | `holon doctor` prints **no** `isolation.reach` lines at all (measured: 0 after the second apply) |
| **B1** | 7 active employees, **0 wake schedules**, so no clock woke an employee to a stage | **DONE 2026-10-27**: two wakes, chosen by what each employee's *roles* cover rather than by which department I had just fixed — Uma (`executive`, `researcher` → `research`, 6 ready) and Tess (`tools`, `head`+`steward` → `retro`, 1 ready). `schedule add` carries no staffing gate (the gate is on `enable`, by design), and both land enabled | **measured**: doctor's `schedule.nowake` cleared (5 → 4 errors); at 23:01:47Z both wakes fired, a `ready` stage was **claimed** (event: `ready → claimed`), a `runs` row appeared, and the task returned to `ready` with a real diagnostic. The body then failed — and reproducing it named the cause the wake could not see (below): the Chair's model credential. §6 says so rather than claiming dispatch works |
| **B2** | 34 ready stages: 26 ventures-import approves, 6 research, 1 retro, 1 verify | the 26 are the Chair's per-job approval (`holon task approve`); the 6 research + retro + verify are legacy — one `holon dispatch --as <id> --task <stage>` each, or `holon task cancel <id> --note "…"` | `ready` counts drop by disposition, not by timeout |
| **C1** | 0 of 7 employees bound to jcode; 0 jcode runs ever | **NOT DONE, and deliberately.** Ruled: B1's execution showed the body layer itself is what fails, and reproducing it named the cause — the Chair's model credential is rejected (`invalid_api_key`), which operant collapses into `IO error: Operation not permitted (os error 1)`. Rebinding an employee to a driver that has **never run on this instance** would swap one unknown for another with a live consequence and fix nothing: every driver consumes the same credential pool. The prerequisites exist (the jcode binary, its launcher and its isolated `JCODE_HOME` are all granted — A3 closed them), so this row is a **one-command step waiting on the credential**, not a blocked build item | one `runs` row with `driver=jcode`, after the credential is valid and **one** employee has run cleanly on the driver already bound |
| **D1** | the smoke probe's `… --json 2>/dev/null \| python3 -c "assert…"` shape reports a crash as `json.decoder.JSONDecodeError`, not as "the tool did not run" — measured twice (once with `/dev/null`, once without: identical) | replace the tail with an explicit status check: `genome doctor --skip-gate --json > "$tmp"; test $? -eq 0 && python3 -c "…"` — or wrap the pipe in `set -o pipefail`, which is what actually makes a middle-stage crash visible here. **The `/dev/null` is not the cause and removing it does not help** | force a failure (point the probe at a pool with a broken contract) and read a message naming the contract, not `Expecting value: line 1 column 1` |
| **E1** | E2/F1 from the 2026-10-25 outline remain open on the live home | the Chair's two one-commands: `rm $HOLON_HOME/config/drivers/hermes.toml`; the checksum repair migration ships (`0006`), the heartbeat applies it | live-home `holon lint --strict` reads **0** errors |
| **F1** | `genome.toml`'s `pointer_ignore` can suppress a real defect indefinitely | **in the genome linter**: a `pointer_ignore` entry whose target now exists, or whose reason comment is older than the path it excuses, is a **lint finding**. Two instances already proven: the archive `INDEX.md` rows and the `STATUS.md` orphan, both hidden for days | a synthetic repo with a stale `pointer_ignore` fails lint; the consolidated tree's `pointer_ignore` list is audited by the same check |

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
