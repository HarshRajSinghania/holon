# Context injection at routine runtime: how critical intelligence reaches a body

**Written 2026-10-24, after the integration-and-evolution outline.** The Chair's follow-up
question, asked of the rebuilt system: *how does critical intelligence get context-injected
at routine runtime, and does the swarm have collaboration features (feed/DM surfaces)?*

This is an **audit, not a proposal**. Every claim below was probed against a real
`Kernel` on a scratch instance, through the same code paths a live dispatch uses
(`Kernel.claim` → `dispatch` → `briefs.build` → `compile_context`), not by reading
docstrings. Findings are labelled **confirmed** (probed) or **plausible** (read, not run).

---

## The three injection layers, measured

A body receives intelligence in exactly three layers. Which layer a fact lands in
determines whether the body *must* see it or merely *may* see it.

| Layer | File | Written when | Reach |
|---|---|---|---|
| **L1 — identity** | `identity.md` (in the run dir; also the system prompt) | once per dispatch | the employee's name, roles, task classes, authority, memory scope, job description |
| **L2 — context** | `context.md` (compiled by `compile_context`) | once per dispatch, before the body runs | the work, its plan, its history, its **task-scoped** conversation, pooled units, recall floors, department material |
| **L3 — skills** | `skills/` (exported into the run dir) | once per dispatch, never refreshed mid-run | the full role library, `holon-employee`, `holon-collaboration`, `holon-memory` |

**Confirmed by probe.** A scratch instance with one employee (`Bob`, all roles) and one
work item; every stage claimed in turn; each brief read back from the run dir the real
dispatch wrote. The sections present in an execute brief were exactly:
`## Your role`, `## Task`, `## Approved plan …`, `## Conversation on this work` (when
task-scoped messages exist), `## Your budget`, `## Your reach`.

The critical asymmetry is in L2's conversation query (`context.py:346`):

```python
msgs = work.messages(task_id)          # ← the ONLY message query in compile_context
```

It selects **by task id**, never by recipient. Everything else a message can mean —
a DM to an employee, a post to a department channel, a broadcast to the org — is invisible
to this query.

---

## What reaches a body at runtime, and what does not

### Reaches (confirmed)

1. **Task-scoped messages** — anything sent with `--task <work id>` lands in the
   brief's `## Conversation on this work`, in plan, execute, verify and retro briefs
   alike. Probed: a Chair DM with `task_id` set appeared in the next execute brief.
2. **The Chair's answer to a `needs_input` question.** The full loop was probed
   end to end: a planner's `needs_input` sets the work `needs_input`; the question lands
   in the Chair's digest (`pending_for_chair`); the Chair's answer goes to `task:<id>`;
   `Kernel.answer` reopens a plan stage; the reopened plan brief **carries the answer**,
   and it is still present in the later execute brief. The question/answer loop is the one
   messaging path that is genuinely context-injected end to end.
3. **Pending department proposals, to a steward's retro only.** Unacked `proposal`
   messages on `dept:<slug>` are rendered in a retro brief whose work has
   `task_class="retro"` (`context.py:332`) — the department-retro loop's consumption path.
   Probed with a retro opened exactly the way the cadence loop opens it (`expand=False`
   plus an explicit retro stage): the proposal appeared under
   `## Pending proposals from the department`.
4. **Everything the department pools** — units, services, skills, `policy.json`'s
   reach — confirmed present in execute briefs (covered by earlier probes and the
   capability-layer audit; not re-probed here).

### Does not reach (confirmed — this is the finding)

**A DM addressed to an employee (`msg send emp:<id>`) never appears in that employee's
brief. Not at any stage. Ever.** Probed with the message in the inbox before every claim
of every stage in a full pipeline: plan, execute, verify — absent from all of them. The
inbox query exists (`Kernel.inbox`, `work.messages(to_refs=…)`), but its only caller is
the CLI's `msg inbox` command. Nothing in the kernel reads it at dispatch time.

The same is true of **department-channel posts** (`msg send dept:<slug>` with the default
`channel` kind) and **org broadcasts**: probed, absent from every brief of every employee
of that department. The department channel has exactly one kernel-side consumer, and it
consumes only `kind="proposal"` and only in retros.

So the collaboration surface exists, is fully fenced and reachable (below), records
everything, threads and acks correctly — and **reaches its recipient only if the recipient
asks**. A body that never runs `msg inbox` never learns the staging key rotated.

---

## The read surfaces: four sites, one seam

Counting every caller of the messages table in the kernel:

| Site | Query | What it reads | Who it serves |
|---|---|---|---|
| `cmd_msg_inbox` (CLI) | `to_refs=[emp:…, dept:…, org]` | everything addressed to the caller | the caller, if it asks |
| `cmd_msg_thread` (CLI) | by `thread_id` | one conversation | the caller, if it asks |
| `compile_context` | **by `task_id`** | the work's own conversation | every body, always |
| `pending_for_chair` + retro proposals | `to_ref='chair'` / `dept:<slug>`, unacked, kinds filtered | questions, requests, proposals | the Chair's digest; the steward's retro |

**There is no fifth site.** No schedule, trigger, doctor check or heartbeat path reads an
employee's inbox (`grep` over `tick`, `triggers`, `_deliver`, `notify`, doctor: zero
callers). The digest's ack loop is one-directional — owed *to the Chair* — and the
heartbeat re-sends an unacked Chair question, but **no heartbeat path re-sends or even
counts an employee's unread messages**.

And there is **no `post`/`feed` command**: the 124-command registry has no feed surface
at all (`grep` for feed/post/channel commands: only `chair-channels`, which is the
Chair's digest config, and `post-execute`). A feed *does* exist — `docs/kb/feed.md`, the
append-only mentions channel, with `genome post` / `genome feed --to <you>` as its
verbs (`holon/vendor/genome.py:2834,2842`) — but it is **genome-side, not
kernel-side**, and the kernel's own `kb run` deliberately refuses it:
`holon/capabilities/kb.py:30-31` allows only `find, view, ask, wake, show, lint`
(read) and `new, move, set, link` (write). `post` and `feed` are not in either list,
so no employee — and not even the Chair — can reach the mentions feed through `holon
kb run`. The feed is a convention of genome-organized repositories (measured: the
template seeds `docs/kb/feed.md` when the `agents` module is on), usable only by an
operator or a body that runs `genome` directly in the KB tree. **Two collaboration
vocabularies, one kernel** — `msg` inside Holon, `post`/`feed` inside a genome KB —
with no bridge between them, and only one of the two reachable by an employee at
runtime.

## What teaches a body to check its inbox

| Surface | Says what | Says "check your inbox"? |
|---|---|---|
| identity card (L1) | roles, classes, authority, memory scope | **no** — probed, the word `inbox` does not appear |
| `holon-employee` (L3) | the protocol, budgets, hand-in | **no** — "inbox" appears nowhere in it |
| `holon-collaboration` (L3) | send/ask/request protocol table | **yes** — `$holon msg inbox` is row four of its table |
| stage briefs | `msg send` for asking (outbound) | **no** — the execute brief names `msg send`, never `msg inbox` |

So the instruction that tells a body to read its messages lives in a skill the body must
choose to load, in a library where the identity card and the employee protocol — the two
documents a body reads *first* — never mention that an inbox exists. **The pull-only
collaboration surface depends on a body discovering a skill whose existence nothing
advertises.**

## Fences: does the surface even survive isolation?

**Confirmed yes.** All five `msg` commands are actor `employee`, so all five cross the
derived MCP fence (`agent_commands()`: 54 commands, `msg send/inbox/reply/thread/request`
all present — probed) and the broker's fence (which derives from the same list, plus
`BROKER_EXTRA` — probed all five). The skill exports with every run dir (probed: 11
skills in the execute brief's `skills/`, `holon-collaboration` among them).

One seam worth naming, because the ventures systems are being rebuilt onto lanes that
run under it: **`policy.json`'s `commands` list carries the read-only shell vocabulary
and the department's `[scope] commands` — and `holon` is not in it by default.** An
observe-stage body under a harness that enforces `commands` strictly can read files but
cannot run `holon msg inbox` at all. The ZeroClaw installer adds `holon` to both its
observer and worker fences (`adapters/zeroclaw/install.py:39-41`) and operant reaches the
kernel through its mounted MCP tools instead of the shell, so the shipped adapters bridge
this themselves — but a department whose `[scope] commands` does not name `holon` (or a
harness stricter than ZeroClaw's) leaves an observer with an inbox it can read only by
shell, and no shell permission to read it with. **Plausible, not probed end to end under
isolation** — named here because agent 2 (ops-topology) writes exactly those
`[scope] commands` lists.

---

## Answering the Chair's two questions directly

**1. How does critical intelligence get context-injected at routine runtime?**

Through `compile_context`, once per dispatch, into `context.md` — with the recall floor,
the department's pooled material, the plan, the history, and **only the work's own
task-scoped conversation**. Anything task-scoped is guaranteed to arrive. The
`needs_input` question and the Chair's answer are the one loop where asking and answering
are both guaranteed: the question is pushed to the Chair's digest until answered, and the
answer is pushed into every later brief of that work. **Everything else — memory, skills,
the KB — is the same guarantee: recalled by floor, never by importance.**

**2. Does the swarm have collaboration features — feed/DM surfaces?**

**The primitives exist and are complete: DMs, department channels, org broadcasts,
threads, acks, cross-department work requests that become real work. All five commands
cross every fence the kernel ships. But the surfaces are pull-only for employees: nothing
injects an employee's inbox into its brief, nothing counts unread messages, no
heartbeat re-sends them, no feed command exists, and the one skill that teaches
`msg inbox` is never named by the identity card or the employee protocol.** The
Chair-facing half is fully push (digest until answered); the employee-facing half is
fully pull. An organization where the Chair always hears and an employee only hears
when it remembers to ask is not symmetric, and for the rebuilt ventures lanes — whose
cron bodies run once and exit — pull-only means *never*: a routine run has no
colleagues to ask and no reason to poll an inbox it was never told about.

## What this audit does not decide

Whether the pull-only design should change is the Chair's call, and this document does
not make it. If it is decided, the seam is named: `compile_context`'s single message query
(at `context.py:346`) is the one place an inbox join would go, the identity card and the
employee protocol are the two documents that would need to name the inbox, and
`pending_for_chair` is the working precedent for an owed-until-read loop — the Chair's
own digest ack pattern could be inverted for employees at a small fraction of its cost,
since it already exists and is already tested. The measurement a decision would want
(the live instance's unread-DM count) is one query away and was not run: this audit was
performed on scratch instances only, per the session's read-only rule.

## Corrections to my own earlier claims, recorded rather than replaced

- In the outline's Part 3 I wrote the swarm agents "each carry their own verification" —
  this audit's retro probe needed the *exact* claim path (`task_id` on `claim`, the
  cadence loop's `expand=False`) before the claim worked at all; my first four probe
  attempts failed on wrong lane, wrong role set, wrong envelope kind and a wrong
  `add_work` call signature. **Any agent whose "own verification" is a probe it has not
  rehearsed will report a false negative** — the exact failure mode the ledger's
  `test_a_slow_harness_is_not_reported_as_a_broken_one` row describes from the other side.
- Earlier in this session I described `Kernel.inbox()` as "called only by the CLI" as a
  forming gap. That claim survives the probes and is upgraded to **confirmed finding**,
  with its scope corrected: `inbox` is also the query behind `msg inbox`'s department and
  org fan-in, so the right description is *"no dispatch-time reader"*, not *"no reader"*.

*Probe scripts: seven scratch instances under `tempfile.mkdtemp`, all discarded; no
instance, live tree or registry state was touched. Nothing was applied anywhere.*
