# /ponytail-audit: the two repos and their integration seam

Status: **audit only — nothing applied.**
Scope: the `operant` runtime (the operator's `agentic-harness/operant` checkout,
396,747 Rust lines across 7 crates) + the `holon` kernel (this distribution,
21,984 Python lines across 51 modules) + the seam between them.
Every number below was measured on **2026-10-26T22:00–23:31Z**. Where I first measured something
wrongly I say so in the row, because a measurement that contradicts its own probe is the finding.
Stack-B paths under `~/organism/` are named as owners, not audited (AGENTS law 10).

---

## 0. The headline, and why it is not "over-engineering"

The single biggest blocker to operationalizing the agentic-OS is **not** bloat. Both trees are
disciplined: `cargo check --all-targets` reports **zero** dead-code warnings across 396K lines, and
operant's config surface has exactly **one** declare-only field in 18. The kernel's lint is 0/0 on a
scratch home. There is no significant over-engineering to cut.

What blocks the system is **one regression in the seam that makes a body unable to hand its work
in**, plus a handful of unmaintained promises. Ranked accordingly: the integration findings lead,
and the genuine `delete:` findings are small.

| # | finding | class | cost |
|---|---|---|---|
| S1 | `holon_submit` is published **twice** and the second copy strips `result` | `duplicate` | **every body** |
| S2 | `holon_whoami` is published twice (both empty-schema) | `duplicate` | cosmetic, same root cause |
| S3 | the events suite's fixture predates the staffing guard and **fails** when run live | `stale` | it has never run since 2026-10-25 |
| S4 | 35 of 58 agent tools are unreachable to an operant body | `gap` | the body's knowledge surface is 40% |
| S5 | 4 of 5 live incidents never closed when their cause was fixed | `unmaintained` | the Chair's board lies |
| S6 | `vendor/holon-tools.json` drifted 23 vs 58, and 3 shared schemas differ | `drift` | S1's symptom |
| S7 | three integration guards silently `SKIP` when `HOLON_REPO` is unset | `dead guard` | S1 and S3 both hid here |
| S8 | the observe posture denies every shell tool: no observer can read | `policy gap` | the plan clause cannot complete |
| D1 | `PlatformAdapter::handle_update` is dead for all 9 adapters | `delete:` | ~200 lines |
| D2 | `pre-reads.bak` / `holon.toml.pre-isolation.bak` | `delete:` | 2 files |
| D3 | 139K of 188K CLI lines are the TUI | `keep` | **not a cut — see note** |

---

## S1. `holon_submit` is published twice, and the surviving copy cannot carry a result

**The seam that operationalization runs on is broken, and the brief tells the body to walk it.**

`holon/mcp.py` `tools()` hard-codes the correct entry at L190-196 (`result` + `run_id`, with the
full envelope schema), then falls into a loop at L197+ over `agent_commands()` that derives one entry
per CLI command — and `agent_commands()` **contains `submit`**, because commit `112d95d` unified the
fence so `AGENT_ALWAYS` restores `whoami`/`submit` over `AGENT_BLOCKLIST`. The loop was never taught
to skip a name already emitted, so:

```
index  1: holon_submit props=['result', 'run_id']     <- correct, hard-coded
index 55: holon_submit props=['run_id', 'file']       <- derived from argparse, WRONG
```

Measured what a real client resolves — the normal `{t['name']: t for t in tools()}` pattern, last
wins:

```
client resolved holon_submit props: ['run_id', 'file']
=> a schema-validating client CANNOT send result: True
```

Meanwhile `mcp.call("holon_submit")` at L247 reads `arguments.get("result")`, operant's native path
(`operant-os/src/tools.rs:243` `submit()`) **refuses outright** without `result`, the vendored schema
advertises `result`, and `holon/skills/holon-employee/SKILL.md` line 34 teaches `result`. So the
contract the brief gives a body, the tool's own reader, and the shipped vendor all agree on `result`
— and the kernel's published schema is the one dissenter.

**I watched this happen live.** A conformance run's plan body was handed: *"`holon_submit` … Call it
with the JSON object below as `result`. If you have the Holon tools, this is the way."* Capping the
driver's wait at 110s and capturing its stdout, the body:

```
Holon run detected — policy.json enforcement mounted, seat: emp_01M5XA5…
Starting agent run with model: large-stack
WARN Tool call escalated by seat policy — no interactive approver attached: deny, tool: aft_bash
(driver timed out — no result.json was ever written)
```

The body reads its context, makes one tool call, is refused, and never hands a result in. Two
independent causes measured in that transcript: this schema defect (S1), and a body whose every shell
tool is denied under lockdown with no read path left (S8). Both must close before the plan clause
completes.

**Why it was never caught: `tests/test_mcp.py:272`.** `_submit_tool()` does
`next(t for t in mcp.tools() if t["name"] == "holon_submit")` — it takes the **first** match and
asserts on the correct copy. The `SubmitSchema` guard that exists precisely to protect this contract
is blind to the duplicate standing behind it.

**Fix (one line):** the derived loop skips a name already emitted. Verified by emulation — the tool
list drops 60 → 58 (the correct count) and the surviving `holon_submit` regains `result`.
**Guard:** a test that asserts tool names are unique AND that the `holon_submit` a *dict-resolving*
client sees carries `result`.

## S2. `holon_whoami` duplicated

Same root cause, same loop: index 0 (correct, empty properties) and index 59 (derived, also empty).
Harmless today because both are empty, but it is the same missing dedupe and should fall to the
same fix and guard.

---

## S3. The events suite's fixture predates the staffing guard

Running `operant-os`'s tests **with `HOLON_REPO` set** — the state the repo intends, and the only
state where they do anything — fails:

```
test a_matching_event_fires_once_per_cooldown_and_the_payload_survives FAILED
ValueError: the approval would start an unstaffed schedule:
no employee in eng performs execute
```

`crates/operant-os/tests/events.rs:39-43` creates a routine in `eng` with `lane='fast'` and approves
it with **no employee hired**. The kernel's staffing gate landed 2026-10-25 (`7941b1f`, per TODO
H10) and now correctly refuses. So this suite has not executed against a real kernel since that
landing — it skips by default (S7) and fails when told to run.

**Fix:** hire an `eng` executor in the fixture. One line; the kernel's refusal is right.

## S4. 35 of 58 agent tools are unreachable to an operant body

The live binary registers exactly **23** native `holon_*` tools (measured with `HOLON_RUN_DIR=/probe`
set, which is the only way they appear). The kernel's `agent_commands()` carries **58**. None of the
35 missing are on `AGENT_BLOCKLIST`, so the kernel considers all 58 agent-reachable.

The missing set is not peripheral — it is the knowledge surface the kernel's own reading order
requires: `holon_recall`, `holon_kb_list`/`holon_kb_run`, `holon_playbook_list`/`holon_playbook_show`,
`holon_law_show` (the law the body is judged against), `holon_task_list`, `holon_plan_queue`,
`holon_status`, `holon_dept_list`, `holon_emp_show`, `holon_msg_reply`/`holon_msg_thread`,
`holon_objective_show`, `holon_scope`, `holon_route`, `holon_hr_review`, `holon_bylaws_draft`.

Worse, the live posture configs **drop the MCP fallback**: `adapters/operant/home/{observe,act}.toml`
carry `[mcp] autoload = true` with **no `[[mcp.servers]]` entry**, because `install.py` omits the
mount when it detects native tools (correct — it probed them successfully at install). The body
therefore has exactly the 23, and no path to the other 35.

**My first reading was wrong and I am recording it.** I grepped `operant tools list` for `holon_`
without `HOLON_RUN_DIR` set, got `0`, and briefly concluded the binary carried no native tools and
the live driver was unmounted. Registration keys on `HOLON_RUN_DIR` (operant iter-854). The probe
was wrong, not the kernel — the same failure mode the ledger records under "check the probe before
the kernel". Re-measured: 23 tools, mount intentionally absent, defect is coverage not wiring.

**Fix decision needed:** either extend the native tool set to the kernel's agent-reachable list, or
keep the MCP mount alongside. This is the one finding I would put in front of the owner, because 35
tools is a product decision, not a mechanical one.

## S5. Four of five live incidents never closed when their cause was fixed

Measured on the live instance:

```
tsk_01M5V20RQ…  Incident: doctor reports isolation.off      created 2026-10-26T02:53  open
tsk_01M5VNASY…  Incident: doctor reports isolation.runner   created 2026-10-26T08:30  open
tsk_01M5VTHY0…  Incident: doctor reports isolation.reach    created 2026-10-26T10:02  open
tsk_01M5VTHY0…  Incident: doctor reports isolation.broker   created 2026-10-26T10:02  open
tsk_01M5VTHY0…  Incident: doctor reports smoke.critical     created 2026-10-26T10:02  open

live doctor: isolation.off 0, isolation.runner 0, isolation.reach 0, isolation.broker 0, smoke.critical 11
```

The isolation boundary is genuinely fixed and live — the agent user exists (`holon-agent-01m4sf…`,
uid 956), the broker and notion units are `active running`, and `[isolation]` is fully configured in
`holon.toml`. All four isolation incidents are stale and still `open`.

The kernel **promises** the closure and does not implement it: `_doctor()` at `service.py:2593` says
*"the incident is done when doctor is clean for this check."* `_incident()` opens; `_incident_open()`
only dedupes; no `grep` over the kernel finds any code that closes an incident when its condition
recovers. `task cancel` (chair) is the only path, and nobody runs it.

**Fix:** `_doctor()` closes the stage-less incident whose check came back clean. Guard: a test that
opens one and watches a clean doctor close it.

## S6. `vendor/holon-tools.json` drifted

23 vendored vs 58 kernel tools (0 stale, 35 missing) and 3 shared schemas differ:
`holon_msg_request`, `holon_msg_send`, `holon_submit`.

The three schema differences are S1 — the vendored file was captured before `submit`/`whoami` were
pulled into the derived loop. So the drift is a *symptom*, and regenerating without fixing S1 would
write the broken schema into the vendor and make the native path's required `result` argument
**undiscoverable to a validating client**.

## S7. Three integration guards skip silently

`native_tools.rs`, `api.rs`, `events.rs` and `e2e.rs` all open with
`let Some(repo) = holon_repo() else { eprintln!("SKIPPED …"); return; }`. `HOLON_REPO` is set by
**neither** `.github/workflows/test.yml` nor `ci.yml` (it appears nowhere under `.github/`). So the
guard exists, prints a skip, and reports `ok`. Measured:

```
unset:    test vendored_tool_list_matches_the_kernel_registry ... ok     (with SKIPPED printed)
set:      FAILED — vendor/holon-tools.json is stale: regenerate with …
```

This is how S1 and S3 stayed invisible: the guards that would have caught them never ran in CI.
**Fix:** set `HOLON_REPO` in both workflows (or vendor the tool list into the repo and assert
against it in-tree).

---

## S8. The observe posture denies every shell tool, leaving the observer no read path

Measured on the live instance, from the conformance body above. Three lists disagree about what an
observe-stage body may run:

| source | `aft_bash` | `aft_read` | basis |
|---|---|---|---|
| kernel `policy.py` `observe_commands()` | **absent** | **absent** | the 31 read-only commands |
| harness `observe.toml` `command_allowlist` | **present** | **present** | G-e's kernel-derived list + AFT tools |
| harness `seat_policy.rs` `decide()` | **Escalate** | **Escalate** | `Lockdown` escalates anything unclassified |

The outcome is the strictest one, by design: `seat_policy` refuses `aft_bash` because the lockdown
seat has no allow entry for it, `permission_tx.is_none()` (headless `operant run` builds no
permission channel) turns that Escalate into a **deny**, and the kernel's `policy.json` independently
agrees it is outside reach. The refusal is recorded to `result.refusals[]` and the body is told to
report it — that part is correct contract behavior, not a bug.

The consequence is the defect: **an observe body has no shell at all.** Its only tools are `cat`-
class commands it cannot invoke (they are shell words, not tools) and AFT tools the lockdown seat
denies. To read the working directory it is briefed on — the one thing an observer exists to do — it
must call `aft_read`, which is denied. The brief then tells it to hand in a plan it could not
research.

This is why the conformance `plan` clause runs to its full 3600s budget with no `result.json`: the
body is refused once, reports the refusal, and has nothing else to try. It is not stall, and it is
not S1 alone.

**Fix:** the kernel's `observe_commands()` and the harness's `OBSERVE_TOOLS` must name the same read
surface. Either the kernel adds the AFT read tools to `observe_commands()`, or the observe posture's
seat geography admits them. Guard: a conformance plan clause that completes, which requires both S1
and S8 closed.

---

## The over-engineering findings (small, honest)

**D1. `PlatformAdapter::handle_update` is dead for all 9 adapters — ~200 lines.**
The code says so itself at `gateway/mod.rs:14` and each adapter repeats it. Slack, WhatsApp, Email
and SMS have full inbound parsers nothing reaches; Telegram, Discord and webhook use their own paths.
`handle_update` has no production caller. *Remove the trait method and the four unreachable parsers.*
Leaving them is the dangerous direction: a reader concludes Slack receives messages, and the adapters
each carry a comment saying they cannot.

**D2. `pre-reads.bak` / `holon.toml.pre-isolation.bak` — 2 files.** `pre-isolation.bak` was removed
in Tier 0 (proven a strict subset, 0 unique keys, isolation provably live). `pre-reads.bak` is a
second one and is untouched because a parallel session is editing it. *Remove when that lands.*

**D3. The TUI is 139K of 188K CLI lines — but do not cut it.** `crates/operant-cli/src/tui/` is
119,959 production lines across 8 submodules, with 19,340 lines of its own tests. It is unreachable
from the headless Holon path (the driver's command is `operant run --no-stream -q`, and
`run_non_tui` is the entry), but it is operant's primary human surface — this is the *product*, not
cruft. **Recommendation: leave it.** If binary size or build time ever matters, gate it behind a
feature, but nothing here justifies deletion.

### Explicitly not findings (measured, so nobody re-raises them)

- **Dead code:** `cargo check --workspace --all-targets` → **0** dead-code warnings. Nothing to cut.
- **Speculative config:** exactly **1** declare-only field (`config.rs:max_output_tokens`) in 18.
  The earlier `config check` cleanup drove warnings 3 → 0 and it held.
- **Single-implementation traits:** 21 exist, but 8 are trivial derives (`Send`/`Sync`/`Serialize`/
  `Display`) and the rest have real separation (`ContextEngine`/`LcmContextEngine`). Only `Vad`/
  `NoopVad` is genuinely a no-op waiting for a second impl — 12 lines, not worth a commit.
- **Dependencies:** 47 workspace deps, all earning their place (a multi-platform gateway + TUI).
- **Duplicated org layers:** operant carries 2,878 lines of its own org layer against the kernel's
  436 — but the live postures *deliberately* disable it (`observe.toml` `disabled_tools` names
  `cron`, `kanban`, `learning_mutation`, `learning_refine`). This is seam discipline, not duplication.
- **The `genome` CLI entropy finding** (AGENTS ledger, 2026-10-24) is properly closed: one real copy
  at `holon/vendor/genome.py`, `scripts/genome` a symlink to it, verified byte-identical.
- **The run-directory variable seam** is consistent: `drivers.py:188` exports `HOLON_RUN_DIR`,
  `platform.rs:246` reads `HOLON_RUN_DIR`/`HOLON_BRIEF_DIR`.

---

## Ordered work list

| order | item | gate |
|---|---|---|
| 1 | **S1+S2:** dedupe `tools()`; guard name uniqueness + dict-resolved `holon_submit` carries `result` | tests first |
| 2 | **S7:** set `HOLON_REPO` in `test.yml` + `ci.yml` | nothing else stays hidden |
| 3 | **S3:** hire an `eng` executor in `events.rs`'s fixture | events suite goes green live |
| 4 | **S5:** `_doctor()` closes an incident whose check is clean | the Chair's board stops lying |
| 5 | **S6:** regenerate `vendor/holon-tools.json` **after** 1, not before | vendor-is-stale test goes green |
| 6 | **S8:** make `observe_commands()` and `OBSERVE_TOOLS` name the same read surface | an observer can read again |
| 7 | **S4:** decide the tool-coverage policy (extend natives, or keep the MCP mount) | **owner decision** |
| 8 | **D1/D2:** remove the dead trait method + unreachable parsers + the second `.bak` | small, safe |

Items 1-5 and 8 are mechanical. Item 6 is a one-line policy decision on which side owns the read
surface; item 7 is a product decision. The acceptance test for the whole seam is one command: the
operant conformance suite (`holon adapter test operant`) completing all five clauses — today the
`plan` clause never finishes, and it needs 1 and 6 both closed.

`net: -1,150 lines possible (D1 -200, D2 -2), -0 deps, one seam repaired.`
