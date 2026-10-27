# Red-team audit — the Chair-facing interaction surface (buttons, channels, remote operation)

Status: 2026-10-24T00:31Z. Kernel `d84dc95` · live instance `$HOLON_HOME` (166 tasks, 1544 events),
read `mode=ro`. Every claim below is measured against code, the live config, or the live
database, and labelled where it is inference rather than observation.

The request: red-team the bot-facing interface so the Chair can operate the organization
from a phone — buttons, navigation, on-the-fly alignment, remote work — and audit the
surface-area map and the channel adapter's architecture for what it would take to
operationalize each aspect for daily use. Two constraints were stated: jcode must be the
harness until the operant agent matures, and the audit must name gaps, implementation
gaps, fragmentation, redundancy and over-engineering.

**What I inferred.** "Not in touch with my machine" and "on the fly" point at a *phone-first
control surface*: a small screen, intermittent network, and no shell. That reframes the
central question from "can we add buttons" to "what is the smallest set of verbs that lets
the Chair resolve each thing the kernel can ask them", because a 116-item menu on a phone is
not a surface, it is a search box.

---

## 1. The measured surface area

The registry is the source of truth, so it was read rather than described.

**124 commands, five actor classes:**
`chair` 55 · `any` 48 · `employee` 13 · `kernel` 7 · `intake` 1

**`chair_actions()`** (kernel `holon/cli.py:101`) derives what a chat channel may offer:
**116 actions** — `chair` + `any` + `employee`. Of those, measured from the registry's own
`mutates` flag: **65 mutate, 51 are read-only**. Four declare `--force`:

```
gc · isolation apply · keys gc · restore
```

**`holon status` already renders the exact shape a small screen needs** — 7 lines, every
number a button could carry:

```
work: cancelled=41, done=10, open=1
ready stages: retro=2
awaiting YOUR approval: 0   awaiting CEO/HOD approval: 0
needs your input: 0   audit samples to judge: 0
organization: 3 departments, 7 employees · auth: configured
```

**`digest_rows()`** (`service.py:2098`) is the machine-readable twin of the prose digest,
*derived from* `pending_for_chair()` lines rather than restated, so order, dedupe and count
cannot drift from what the Chair reads. `chair_action_meta()` gives each action its actor,
mutates flag, help text, options and positionals. So the kernel has already published intent
— step 1 and step 2 of the design record are landed, and this audit verifies them rather than
re-deriving them.

**Three independent Chair surfaces exist today**, each built separately:

| Surface | Carrier | State | Buttons |
|---|---|---|---|
| Telegram digest | `[notify] command` → `operant org holon notify` → the operant gateway | **live, delivering** (`1 sent, 0 failed`) | none |
| Notion mirror | `adapters/notion/holon_notion.py serve` | **live, active unit** | n/a (web) |
| MCP tools | `holon mcp` (stdio) | available | n/a |

The kernel is correctly harness-agnostic (law 2 holds: no `telegram` under `holon/`), and
`pending_for_chair` is single-sourced, which is the one part of this picture with no
duplication in it.

---

## 2. The red-team findings

Ordered by what blocks the request, not by size.

### R1 — The live notification path runs through a *different* harness than the one being adopted

The live `[notify] command` is:

```
operant org holon notify --reason heartbeat --text {message}
```

The message reaches Telegram **via the operant gateway** (`operant-gateway.service`, active),
which owns the bot token in `$operant-config[gateway]` (operator-context.md §Paths). So the Chair
channel's transport is the harness the request says to stop using, and it is the one thing
between the kernel and the Chair's phone. This is not a code defect — it works — but it is a
**structural dependency**: every improvement to the Chair surface (buttons, navigation,
free-text replies) would have to be built into or around the operant gateway, which is
precisely the wrong place under the stated constraint.

Severity: **blocking for the request's intent.** The fix is not "port the gateway" but "put a
jcode-owned adapter in the transport seat", which is also step 3–4 of the existing design
record.

Measured, not assumed: `operant channel send --help` offers **plain text only** — `--channel-id`,
`--recipient`, `<MESSAGE>`. There is no keyboard, markup, reply or callback option anywhere in
it, and `operant channel` as a whole has `send`, `delete-message`, `bind-telegram`, `list`,
`start`, `doctor`, `add`, `remove` and nothing that polls an inbound tap. The gateway's own
contract line says the split plainly: "the kernel's `[notify]` delivery seam. The kernel computes
what is new for the Chair ... and shells `[notify].command` with `{message}` substituted;
operant's half is to post that message to each Chair channel. No polling, no local state — the
kernel owns both."

So the constraint the Chair stated — jcode until operant matures — is not merely a preference
here. The transport that would have to grow buttons is the one being retired, and it cannot
grow them: its send command takes a string and posts a string.

### R2 — There is no bot-UI primitive anywhere, and no inbound direction at all

Measured: `grep -rn "inline_keyboard|callback_query|editMessageText|answerCallback"
holon/ adapters/` → **no matches**. The gateway likewise has none. So the Chair receives
prose and cannot press anything — the exact symptom reported.

The outbound seam is `[notify] command` with `{message}` substituted, run with `shell=True`.
It is **one string out, nothing back in**: there is no `callback_query` handling, no
`getUpdates` poll, no way for the kernel to learn that the Chair tapped something. This is the
single structural fact that makes buttons genuinely new work rather than a config change, and
it is worth stating because it bounds every estimate in this audit.

R2a (a smaller defect inside it): `adapters/telegram/` **does not exist**, so step 3 of the
design record is not started. `chair_actions()` and `digest_rows()` are landed, which means
the kernel is ready and the adapter is the missing half.

R2b — **and this is the finding that governs the whole build: an inbound Chair message cannot
be authorized at all.** `Kernel.chair_channels()` (`service.py:1737`) promises exactly the
mechanism, in its own docstring: *"A runtime that fronts a channel (a gateway) may run Chair
commands only for a message from one of these identities."* Measured, that promise has **no
implementation**: `grep -rn "chair_channels" holon/ adapters/` finds the definition, the
display command `holon chair-channels`, and **nothing else**.

And `security.Auth.principal()` (`security.py:222`) is the **sole** path from any credential to
a principal, in this order: a run token, an employee key, the Chair key, else `anonymous`.
There is no branch that turns a *channel sender* into a principal, so the docstring's "a runtime
... may run Chair commands only for one of these identities" describes a rule nothing enforces.
A button surface holding no run token and no key authenticates as **`anonymous`**, and
`_allowed` refuses every chair command to it. So the gap is not cosmetic: today a Chat reply
cannot authorize at any price — it can only be *carried* to a shell that already holds the Chair key.

So the design as written has an unbuilt seam at its centre. The four layers in the design record
(render, session, transport, and the kernel's intent list) cover what a button *looks like* and
how it is *pressed*; none of them says who is allowed to press it. Under law 2 that seam cannot
be a telegram import in the kernel — it must be a kernel-owned *principal kind* that any channel
front-end resolves into, which is the same shape the run token and the employee key already
use, not a fourth bespoke rule.

### R3 — The button set as currently derived is unusable on a phone

Measured from the registry: **124** commands registered, **116** offered to the Chair —
**65** mutating and **51** read-only. (The design record's "the Chair's 55 commands" is also
correct and measures a different set: `chair`-actor commands only, 53 of them mutating. This
audit's 116 adds the `any` and `employee` commands a channel offers — `status`, `msg reply`,
`task list` — which is what a rendered menu must bound. Neither number is the other's error.)
On a phone, a 116-item menu is not a control surface, and a `chair_actions()` list that includes
`backup`, `bylaws emit`, `charter authority` and `gc` as flat peers of `status` gives the Chair
no way to tell "navigate" from "act", nor "safe" from "destructive" without reading help text.

This is the clearest **over-engineering** in the present state: a complete, correct,
derived-from-the-registry list that is far larger than any surface should render. The
derivation is right and must not be hand-pruned (that reintroduces the MCP-fence drift
defect), so the fix belongs in the *rendering* layer: group by noun, sort by
`mutates`, and gate `--force` behind a second tap.

### R4 — The one destructive class is button-reachable with no second gate

Measured: **exactly four** commands in the registry declare `--force`, and **all four** are
offered to the Chair — `gc`, `isolation apply`, `keys gc`, `restore`. (The record's `isolate apply
had no gate` is **closed** — `7518afa` added the flag, and my first probe of this count read zero
because it checked the wrong side of the arg tuple; the four above is the re-measured value.)

`chair_action_meta()` deliberately does not compute a `confirm` flag, deferring it to the
adapter — which does not exist. So the design currently says "destructive confirmation is the
adapter's job" while nothing implements it, and the ledger already records (`test_isolate_
apply_refuses_without_force`, AGENTS.md) that `isolation apply` needed an explicit `--force`
gate because a one-tap button would have re-fenced the organization with no second look.
A button surface must not be the thing that walks that back.

Severity: **the highest-consequence finding in this audit.** `restore` in particular overwrites
live instance state from a backup, and `gc` collects directories a pinned artifact points into.

### R5 — Fragmentation: two Chair identity stores, and the adapter that reads neither applies the guard that makes them matter

Measured, and narrower than first written:

- the kernel holds one key: `[chair] channels` (`service.py:1738`, H8) — a `<platform>:<user id>`
  list; the operant gateway's transport `[gateway] telegram_enabled/token` lives in *its* own
  `operant.toml`, and the operant adapter (stack B) is not part of this kernel's config;
- the **notion** adapter carries a second Chair identity: `--chair-user` → `chair_users`
  (`holon_notion.py:457,606`), a Notion-account-id list that decides which edits are the
  Chair's. That is a genuinely separate identity store with a genuinely separate meaning
  ("whose Notion edits count as Chair direction") and no relation to `[chair] channels`.

So this is **two** stores, not three, and only the second is a real duplication: nothing
reconciles a Notion account id with a channel ref, so a Chair action taken in either place is
the Chair's in that place alone. (The third I first named was the operant gateway's transport
config, which is stack B, not a second copy of this kernel's identity — corrected here rather
than in the ledger.)

What makes this more than tidiness: the kernel's `dropped_marker` guard is the piece that makes
a failed delivery visible (measured 2026-10-22: an exit-0 "no channels configured" had been
silently marking the digest delivered), and it is doing real work — but it is compensating for a transport the
kernel does not own.

### R6 — Redundancy is low, and that is worth recording

`pending_for_chair()` has exactly one implementation (`service.py`), and `chair_actions()`,
`digest_rows()` and `holon status` all derive from the registry and the same digest. The one
duplication found is `service.py` and `build/lib/holon/execution/service.py` — a build
artifact carrying a stale copy, which is a packaging concern, not a design one.

So the request's "fragmentation, redundancy" concern is **real for transport and identity
(R1, R5) and largely absent for intent and rendering**. That distinction matters because it
says the fix is a new adapter, not a refactor.

### R7 — The isolation boundary is the hard blocker on the whole surface

The button surface must run as a process that holds the Chair key **outside every sandbox**,
and it must long-poll Telegram. The live instance has **no `[isolation]` section, no agent
user, no runner unit** (measured). So today any adapter that could hold buttons would run as
the kernel's own user with the Chair key in reach — which is exactly the exposure the
isolation.off work made an error rather than a warning.

Severity: **ordering constraint, not a defect.** It means steps 3 and 5 of the design record
cannot be verified end-to-end until the boundary is applied, and it is why "make it real"
(step 4: one test crossing the seam with the real artifact) needs the boundary first.

---

## 3. What was claimed in the request, and what the measurement says

| The Chair said | Measured |
|---|---|
| "no inline buttons" | correct, and there is no bot-UI primitive anywhere in the distribution or the gateway |
| "it does not interact with me" | correct — the seam is outbound-only, `{message}` → shell |
| "so that work can be provided to the system remotely" | **partly already true**: `msg send`/`msg reply`/`msg request` exist, so a body can be given work by text; what is missing is a *button* route and free-text inbound |
| "alignment can be provided on the fly" | the kernel already asks (`pending_for_chair`), and `msg reply` answers threads; the gap is the phone ergonomics |

---

## 4. What I have not built, and the order I would build it in

This is an audit, not an adapter. Nothing was created. The order below keeps each step
verifiable and is the same order the design record carries, with the gates re-stated from
this audit's findings:

| # | Step | Gate it owes | Status |
|---|---|---|---|
| 0 | **the inbound authorization seam**: a kernel-owned principal kind resolved from a channel identity, with `chair_channels()` read by something | `tests/test_core.py::ChairChannels::test_an_inbound_channel_identity_can_be_authorized_as_the_chair` — written today, **skipping with the finding as its message**: no `Auth.channel_principal()`, so no inbound identity can authorize | **guard landed as a named gap; the mechanism is not built** |
| 1 | `chair_actions()` derived from `REGISTRY` | a guard pinning both halves of the derivation | landed |
| 2 | `digest_rows()` structured beside the prose | the digest still renders for a plaintext `[notify] command` | landed |
| 3 | `adapters/telegram/` — render + session, long-poll only | `tests/fake_telegram.py` with the same shape as `tests/fake_notion.py` | **not started** |
| 4 | wire it as the live `[notify] command` | **one test crosses the seam with a real artifact**: a real prepared digest rendered into a real `sendMessage` | not started, and blocked by R7 |
| 5 | `--force` gating for destructive buttons | a guard that the adapter never passes `--force` on a first tap | not started; R4 says this must precede step 4, not follow it |
| 6 | **render-time grouping** of the 116 actions | a guard that the rendered menu is a bounded set (nouns first, mutating flagged, `--force` behind a confirm) | new in this audit — R3 |

Step 0 is this audit's main contribution, and step 6 is its second. Steps 1–2 proved the
kernel can publish intent; step 0 is where that intent becomes *authorized* rather than merely
expressed, and it belongs in the kernel because it is a principal question, not a telegram one.
Step 6 is where the intent becomes usable on a phone, and it belongs in the renderer, not in
`chair_actions()`, so the derivation stays complete and drifting-free.

## 5. What this audit does not claim

- It does not claim the operant gateway is *wrong*, only that it is the wrong transport for
  the stated constraint (jcode until operant matures). It works and should keep working until
  a replacement crosses the seam.
- It does not claim 116 actions is wrong in the kernel. It is right there. It is wrong only as
  a rendered menu.
- It does not measure the gateway's own interaction capabilities beyond its lacking
  `callback_query`/`inline_keyboard` support; that is its owner's surface, not A's.
- It does not close R7. No guard on this host can, without the agent user existing.
