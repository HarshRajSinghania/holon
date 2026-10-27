---
status: active
date: 2026-10-21
description: "The jcode ACP investigation, measured: what the Agent Client Protocol surface offers Holon, where the integration gaps are (both the kernel's and jcode's), what was fixed today, and what stands between jcode and 5/5 — so jcode can be the operational harness while operant is finished."
tags: [jcode, acp, harness, conformance, integration, gaps]
supersedes: []
---

# 2026-10-21: jcode through ACP — the integration gaps, measured

Status: **active**. Scope: A only. Every claim here was measured on 2026-10-21 against
jcode v0.99.0 (`774613c90`), the live instance, and scratch conformance runs.

---

## 1. What ACP is, and what it would give Holon

`jcode acp` runs jcode as an **Agent Client Protocol** adapter (JSON-RPC on stdio), backed by
the jcode daemon. Probed directly:

- `initialize` answers: `protocolVersion 1`, `loadSession`, `sessionCapabilities {close, resume}`,
  `mcpCapabilities {http: false, sse: false}`, `promptCapabilities {embeddedContext, image}`.
- `session/new` takes `cwd` and **`mcpServers`** — a stdio server spec (command, args, env) — so
  the Holon MCP server can be mounted *per session*, in the protocol.
- The agent asks the **client** to read and write files (`fs/read_text_file`): ACP inverts the
  filesystem. A kernel-side ACP driver would hold the workdir itself and could enforce the
  read-only posture *in the protocol* — no harness policy to trust.
- `session/update` streams structured events (turn boundaries, tool calls, message chunks): a
  driver would see the body's progress as first-class events instead of scraping stdout.

**What an ACP driver would change.** The current `jcode run` driver is one-shot and blind: it
renders a command, waits, then parses stdout for the envelope. An ACP driver would (a) serve
the fs itself, enforcing the posture; (b) mount the Holon MCP server per session; (c) read
turn updates as they happen, so a budget cap could count turns and stop the body in-protocol;
(d) take the final message as the envelope directly.

## 2. The ACP integration gaps (measured, in order of severity)

### Gap A1 — `jcode acp` lacks `--provider-profile` (critical, jcode-side)

`jcode run` has `--provider-profile <name>` — the kernel's whole provider isolation rests on it:
the `holon` profile in the isolated `JCODE_HOME` names the gateway, the model, the key. **`jcode
acp` does not have the flag.** Its `-p` takes a builtin provider enum (`openai-compatible`,
`claude`, …), not a config profile name.

Measured: under the isolated `JCODE_HOME`, an ACP prompt dials the **user's own** paid Kilo
endpoint (`402 Payment Required, balance 0`) — the profile is ignored and the fallback is the
operator's personal config. Even `-p openai-compatible` does not read the isolated
`[providers.holon]`. A throwaway-`JCODE_HOME` probe confirmed `acp` answers with the user's own
model list. The persistent daemon (`jcode serve`, running as the user) is the likely carrier of
the user's config into ACP sessions; `server stop` without `--force` did not stop it.

**Fix (jcode upstream):** add `--provider-profile` to the `acp` subcommand, mirroring `run`.

### Gap A2 — the daemon breaks `JCODE_HOME` isolation (critical, jcode-side)

`acp` is "backed by the Jcode daemon" — a *persistent* server owned by the user. Even with
`JCODE_HOME` pointed at the kernel's isolated home, sessions resolve providers through the
shared daemon's config. For Holon this is a **trust-boundary defect**: an employee's body must
never reach the operator's own provider profile, keys or session history. Measured: the model
list under a throwaway home was the user's own (`claude-opus-5-5`, …), not the throwaway's.

**Fix (jcode upstream):** either the daemon honors the client's `JCODE_HOME` per session, or
`acp` spawns a per-home daemon like `run` does.

### Gap A3 — jcode's dynamic tool wrapper maps named MCP properties to flags (high, jcode-side)

Measured from the verify body's own record: `holon_submit` "failed twice with `holon: error:
unrecognized arguments: run_...`". The kernel's MCP submit path is **correct** — proved
directly: a live run token, an explicit `run_id`, the real server, and the submit succeeded.
The failure is in **jcode's dynamic tool bridge** (`register_dyn`): it derives a CLI flag from
the property *name* instead of passing the property's *value*. This is the same defect class
the 2026-10-20 ledger row already caught (`a positional's name published as the MCP property;
a runtime derived --slug from it`), and it is jcode's to fix. The kernel's published schema
for `run_id` is a plain `{"type": "string"}` — nothing about it invites flag derivation.

### Gap A4 — the 64KB provider cut (high, provider-side)

Ava's operant plan run died with `EOF while parsing a string at line 1 column 65536` — the
free-tier model's response cut at exactly 64KB. Both harnesses route `large-stack` through
the same free provider, so both are exposed. Not a harness defect; a paid or self-hosted route
removes it. (Not ACP-specific, but it caps any long result.)

## 3. What was fixed in the kernel today (from the deepest jcode run yet)

The 03:44 conformance run reached **plan: pass** for the first time on v0.99.0 (2/5). A
parallel scratch completed **plan → approve → execute**, with the verify stage producing a
complete, correct pass verdict — the kernel then rejected it over proposal objects. The body's
own proposals named all three defects; the refinement loop works.

| Fix | Where | Guard |
|---|---|---|
| A content-only proposal `{"content": …}` is repaired into `{title, intent}` — the first clause becomes the title, the whole text stays the intent, nothing is invented | `contract._repair_untyped_lists` | `test_a_content_only_proposal_is_repaired_not_rejected` |
| The verify brief now teaches the proposal shape, with an example of both accepted forms | `holon-verifier/briefs/verify.md` | the rubric (dry packs) |
| Every brief said "write to `result.json`" — impossible under a lockdown seat (`file_write` denied, measured in `refusals.jsonl`). The rule now lives in the employee skill: `holon_submit` (or the JSON as the final message) **is** the primary route under lockdown; each brief carries one short pointer | `holon-employee/SKILL.md` + all seven briefs | the rubric (dry packs) |

## 4. What stands between jcode and 5/5 (the honest list)

1. **The conformance suite's own timing (kernel-side, small).** The clause harness dispatches
   synchronously, but a body that self-submits via MCP closes the run early; `run_driver`
   returns and the clause reads state that the deferred submit is still writing. Two runs
   showed approve/execute completing *after* the suite reported. The clause should re-read
   after the deferred submit settles (or the suite should poll the stage to done with a
   bound).
2. **jcode's tool bridge (A3)** — `holon_submit` with an explicit `run_id` fails in the
   harness's dynamic wrapper. The kernel path is proved correct; jcode must fix the mapping
   upstream. Workaround already in the brief: submit without `run_id` (the token binds the
   run).
3. **The provider cut (A4)** — any plan or verify whose final message crosses 64KB dies
   mid-stream on the free tier. Not fixable in either repo.
4. **The approve clause's grade.** The 03:44 plan was graded G2 — outside the CEO's G1
   authority in `supervised` mode — so the approval may route to the Chair rather than the
   conformance CEO. The conformance harness sets the CEO's authority to G4 (`set_authority
   … 4`), so this should not bite; if the approve clause fails on routing, that is where to
   look.

**The kernel's share of the remaining 3 clauses is small and known.** The rest is jcode's
upstream (A1–A3) — and A1/A3 are the two that gate a *real* dispatch, since the conformance
suite does not exercise ACP at all: it drives `jcode run`.

## 5. The recommendation

- **Now:** use the `jcode run` driver (not ACP) for real dispatches. It is the mode the
  conformance suite exercises, and today it reached plan: pass. The kernel-side fixes above
  are landed and guarded.
- **The 5/5 path:** fix the conformance suite's timing (kernel, small), then re-run. If the
  approve clause still fails, read its returned `breach` — the kept-workdir run (in flight)
  will show it.
- **For ACP:** file A1 and A2 upstream in jcode (the `--provider-profile` flag and the
  per-home daemon). Until both land, **do not drive employees through `jcode acp`** — a body
  would run on the operator's own provider. That is not a posture Holon can fence from its
  side.
- **Operant comparison:** operant reached the same depth (plan → approve → execute) with the
  same provider cut. Neither harness is blocked by its own code today; both are capped by the
  free-tier provider and their own tool bridges.

## 6. See also

- `adapters/jcode/README.md` — the recorded contract, including the corrected 2026-10-20 diagnosis.
- `docs/CONTRACT.md` §7 — the adapter shape.
- The kept-workdir conformance run's output (in flight at writing).
