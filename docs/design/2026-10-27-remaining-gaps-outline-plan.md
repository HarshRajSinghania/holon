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
(`HOLON_HOME=/home/ishanp/holon`, SQL in `mode=ro`, doctor, lint) and on the consolidated source
tree (`4160368`, the commit the live launcher resolves). Nothing here is about the other stack.

---

## 1. Where it stands, re-measured

| | the 2026-10-25 outline | 2026-10-27T13:3xZ re-measured | delta |
|---|---|---|---|
| doctor | 1 error, 2 warnings | **14 errors, 5 warnings** — see §2a; **12 of the 14 are one reach gap** | **13 errors, and almost all of them are one defect the boundary's landing exposed** |
| strict lint on the live home | 0/0 on scratch, 2 on live | **0 errors, 1 warning** on the consolidated tree; the live home carries the 2026-10-25 record's **F1/E2** rows (see §2b) | E2/F1 still open, both the Chair's one commands |
| `[isolation]` | absent | **present**, `agent_user` + runner set, and **11 smoke errors trace to it** | the boundary exists and is *stricter than the venture trees were prepared for* |
| employees | 7 active, all `operant` | **7 active, all `operant`** (read by column name, not position — the predecessor's own §1 correction) | unchanged |
| schedules | 3 recurring, 1 enabled, **0 wake** | **3 recurring, 1 enabled, 0 wake** | unchanged — the engine's clock is not the systemd one, see §2a |
| runs, ever | 55, 0 jcode | **55, 0 jcode** | unchanged |
| ready stages | 29 (26 approve, 1 research, 2 retro) | **34** (26 approve, 6 research, 1 retro, 1 verify) | +4 research, +1 verify: the ventures import's items aged in |
| departments | 6 | **6** | unchanged |
| source repos | 2 (public + private overlay) | **1** (`4c53a96`…`4160368`, the corpus landed) | **the consolidation the 2026-10-26 row rejected, executed and gated** |
| live `[isolation] reads` | — | names the deprecated overlay; **the canonical checkout's ACLs are not applied** | new seam, see §2c |

The headline changes today, and it changes *against* the predecessor's hope: **the engine runs, and
the health gate fails louder than the plans do.** But the 13 new errors are neither the
predecessor's rows returning nor a new engine failure — 12 of them are **one reach gap** whose
landing between the two records is what exposed it. The boundary now exists (`[isolation]` present,
`agent_user` set), the venture trees carry their ACLs, and the *foundation* trees the smoke probes
read were never granted. §2a is the record's most important section, because the first two
diagnoses of that gap were wrong and the reasons they were wrong are the operational lesson.

---

## 2. What this re-measurement found

### 2a. 12 of the 14 errors are one reach gap — and I misdiagnosed it twice first

**Two corrections to my own first answer, because both were wrong in ways this record must not
carry forward.** My first read said "11 smoke errors, one path defect: the probes `cd
ventures/<dept>` relative to `$HOLON_HOME`". **Wrong.** The `cd ventures/…` form lives in the
venture source trees' `smoke.yaml` (the imported artifact); the live `$HOLON_HOME/holon.toml`
carries the same probe with an **absolute** `cd /home/ishanp/organism/organism/ventures/<dept>`,
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
| **foundation reach** | 12 | 11 `smoke.critical` across career-pipeline/freelance-agency/architectural-leads (the `genome doctor` contract probes and career-pipeline's `engine_lib.py` FSM probes) + 1 `smoke.critical` career-pipeline clone — all fail because `foundations/platform-infra/**` is in **no** reach: not in any `[scope.dept.*] roots`, not in `[isolation] reads`, and `reach()` grants only scopes, `reads`, `grants`, `distro`, KBs and pooled roots |
| **stale register** | 1 | `schedule.nowake` — 7 employees, no wake schedule (unchanged from the predecessor) |
| **jcode reach** | 2 | `isolation.reach` on `~/.jcode/builds/versions/0.99.1` and its binary — granted for `drivers.available()`, which does not include this build path |

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

---

## 3. The plan, in tiers

| # | Gap | Fix (a command, verified against the live registry) | Gate (a command) |
|---|---|---|---|
| **A1** | **12 errors**: `foundations/platform-infra/**` is in no reach, so the agent user can traverse to it but not read it — and every `genome doctor` contract probe plus career-pipeline's `engine_lib.py` FSM probes live there | declare the foundation as a **read-only root** the ventures pool, at the one place reach already reads it: `[scope.dept.<dept>] read_roots` (writable roots stay the venture's own), or `[isolation] reads` if it is fleet-wide. **The narrow fix first**: add `read_roots = ["/home/ishanp/organism/organism/foundations/platform-infra"]` to career-pipeline's scope, measure, then decide whether the other two departments need the same or a narrower root | re-run live: `holon smoke run --dept career-pipeline` then `holon doctor` — the 12 `smoke.critical` errors clear, and the gate that misdiagnosed gets a true reading |
| **A2** | the live `[isolation] reads` names the deprecated overlay; the canonical checkout's ACLs are not applied | `holon isolation plan` (writes `$HOLON_HOME/isolation/setup.sh` durably), review, `sudo sh` it if the agent user is correct, then `holon isolation apply --force`; then flip `reads` to `/home/ishanp/Documents/github/my-projects/holon` | `holon doctor` prints no `isolation.reach` for the source checkout; the reach's declared tree and the launcher's tree are one path |
| **A3** | `isolation.reach` on `~/.jcode/builds/versions/0.99.1` — the build path is not in `drivers.available()`, so the reach never grants it while an employee is jcode-bound | either bind no employee to jcode (current state: 0 of 7) and **note the reach gap explicitly** in `holon.toml`, or extend the reach's driver-grant to cover the pinned build dir | `holon doctor` prints no `isolation.reach` lines at all, either by the gap being closed or by it being declared and out of the way |
| **B1** | 7 active employees, **0 wake schedules**, so no clock wakes an employee to a stage | `holon schedule add --as <emp> --kind wake --cron "*/15 * * * *" --stage <stage>` per department, highest-risk last. **This row does not claim** a wake schedule makes bodies dispatch — the gateway's clock already runs routines (see §2c) | a `ready` stage is claimed inside one cron window; a `runs` row with a user-facing stage appears |
| **B2** | 34 ready stages: 26 ventures-import approves, 6 research, 1 retro, 1 verify | the 26 are the Chair's per-job approval (`holon task approve`); the 6 research + retro + verify are legacy — one `holon dispatch --as <id> --task <stage>` each, or `holon task cancel <id> --note "…"` | `ready` counts drop by disposition, not by timeout |
| **C1** | 0 of 7 employees bound to jcode; 0 jcode runs of 55 | `holon hr set-driver <emp> --driver jcode --reason "…"`, one employee at a time, **after A3 and B1** — a driver whose build dir is unreachable and which has no wake schedule changes nothing | one `runs` row with `driver=jcode` |
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
