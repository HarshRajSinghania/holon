# The collaboration-injection upgrade: a plan with a token ledger

**Written 2026-10-24T02:15Z, as the plan the audit named.** The Chair asked for an
architectural-upgrade plan closing the audit's gaps — "in the most effective and
non-redundant manner, ensuring that the agents operationalize with maximum token/tooling
efficiency from the context injections."

Every number below was measured on this machine today, on scratch instances, through the
real dispatch path. Nothing is asserted. Nothing has been built; **this is a plan, and
the Chair's approval gates every move in it.**

The design law it follows: **one writer per surface, one join per question, and every new
token spent must buy a body something it could not otherwise see.**

---

## The token ledger (measured 2026-10-24)

What one executor run receives today, and what each proposed move adds or removes:

| Surface | Today (chars) | After this plan | Delta |
|---|---|---|---|
| L1 identity card | 608 | 691 | **+83** (one line: the inbox pointer) |
| L2 context (`context.md`) | ~1,400–5,000 | + unread section when non-empty | **+0 to +260**, capped |
| L3 skills export (all 11 skills) | 50,325 (23,134 auto-load `SKILL.md` + 27,191 references) | role-filtered: **13,303** for a plain executor | **−37,022** |
| L2 unread section (2–3 msgs) | — | 190–213 when present, absent when empty | +0.79–0.89% of the 24,000 budget |
| **Net per executor run** | ~52,400–56,300 brief-side | ~14,400–19,300 | **−37,000 ≈ −65%** |

The move that *adds* tokens (the unread section) costs less than 1% of the context
budget, is **zero when the inbox is empty**, and the move that *removes* tokens
(role-filtered exports) gives back ~37K per run — roughly 175× the unread section's
worst case. The plan is net-negative in tokens while making the organization strictly
better informed. That asymmetry is the whole design.

---

## M1 — Unread messages in the brief (the dispatch-time join)

**Closes audit gaps 1, 2, 3, 4. One seam, one section, one ack.**

**The seam.** `compile_context` (`context.py:346`) has one message query, by `task_id`.
The move adds a *second* query at the same site — the one `Kernel.inbox` already
computes — and renders it as one new section, placed **immediately after "Your role"**
so it is read before the work:

```python
# after the role section, before the task section:
unread = work.messages(to_refs=refs)            # the same fan-in inbox() computes
unread = [m for m in unread if m["acked_at"] is None]
if unread:
    b.add(f"Messages waiting for you ({len(unread)} unread)",
          "\n".join(f"- [{m['kind']}] {m['sender']}: {m['body'][:160]}" for m in unread[:cap])
          + f"\n+{len(unread)-cap} older (`$holon msg inbox`)" if len(unread) > cap else "")
```

**The three rules that keep it non-redundant and bounded:**

1. **Ack-on-render, not ack-on-read.** The section's messages are marked `acked_at` the
   moment the brief is *compiled* — at dispatch, before the body runs. The guarantee is
   "it reached the brief", the same guarantee `needs_input`'s answer already carries, and
   it means the section is **self-emptying**: the next dispatch shows only what arrived
   since. No unread backlog can ever accumulate into an unbounded section. (Probe
   confirmed `ack` already exists and works this way on individual ids.)
2. **Cap + pointer.** At most 3 lines render (measured 213 chars for 3); the rest is a
   count and the `msg inbox` pointer. A body that wants more pulls it — the pull surface
   stays, it just stops being the *only* surface.
3. **Empty inbox, empty section.** `Bundle.add` already drops falsy bodies, so the
   common case costs nothing.

**What it does NOT do** (the non-redundancy discipline): it does not duplicate
task-scoped messages (those stay in "Conversation on this work"); it does not re-send
anything (the digest's Chair loop is untouched); it does not add a heartbeat nudger —
the brief join makes one unnecessary, because the *next dispatch* is the nudge, and a
wake schedule already exists for employees that must hear about messages with no work
waiting. **No new table, no new migration** (`acked_at` exists, `api_messages` view
already reads it): the move is ~20 lines at one seam plus the identity-card line below.

**The identity-card line (gap 3's other half).** One sentence, appended to
`identity_card`'s footer (+83 chars): *"You have an inbox: unread messages render in
your brief and `$holon msg inbox` reads them."* This is the discovery fix — the one
document every body reads first now names the surface.

**Config.** One key, in `[context]` where the budget already lives:
`unread_cap` (default 3, 0 = off). BYLAWS §6 gains one row. This is the entire config
surface of M1.

**Guards (tests first, per law 9).** Two guard tests, one per failure the audit found:
- `test_an_unread_dm_reaches_the_recipients_next_brief` — the audit's probe, made
  permanent: DM before claim → section present → acked after compile.
- `test_an_empty_inbox_adds_no_section_and_no_tokens` — the budget claim's guard.
Plus a ledger row citing both.

**Efficiency argument, measured.** The section is 0.79–0.89% of the context budget when
present, 0% when absent, and replaces the *actual alternative* the pull-only design
forces on a body: discovering the inbox by loading `holon-collaboration` (1,422 chars) or
polling `msg inbox` from the shell (a tool round-trip per check, on every stage, forever).
Pushing 3 lines into the brief is cheaper than teaching 3 lines through a skill every
run.

---

## M2 — Role-filtered skill exports (the 65% saving)

**Closes the L3 redundancy. One filter, already written, applied at the export seam.**

**The seam.** `Library.export` (`skills.py:214`) takes a `names` list and today is
called with `None` — "export the whole library". But `cmd_skill_list` (`cli.py:1393`)
*already computes* the per-employee set: `{"holon-employee", "holon-collaboration",
"holon-memory"} | {holon-<role>} | e["skills"]`. The move is to compute that same set
at `briefs.build`'s export call (which already receives `employee`) and pass it as
`names`.

**Measured effect.** A plain executor (roles `[executor]`) receives 13,303 chars
instead of 50,325 — **−37,022 per run (−74% of L3)**. A head with five roles still
drops the two Chair-side skills (`holon-operator`, `holon-system-design` are tagged
`roles: [head, steward]`, so a head *keeps* them — the filter only removes skills the
employee's roles do not hold, which for a head-of-everything is 16,062). The run-dir
snapshot stays the mechanism (R-09: one copy per run, never refreshed mid-run); only
the copy list narrows.

**What it does NOT do.** It does not touch the harness-side `$JCODE_HOME/skills` export
(that one is deliberately whole-library: a human's jcode session may claim as any
employee); the filter applies to the **per-run** export `briefs.build` writes. It does
not break `skill show`/`skill invoke` — those resolve from the library, not the export,
so an employee can still read any skill on demand. `dept` forks still win: the filter is
by name, so a department's `@dept` fork of its own role skill is the copy that survives.

**Guard.** `test_a_run_carries_only_the_skills_its_roles_hold` — assert the run dir's
`skills/` contains `holon-executor` + the three protocol skills and does *not* contain
`holon-researcher` for an executor-only employee; assert a head still sees the head
skill. Ledger row.

**Why this is safe where a "trim the skills" refactor would not be.** The filter reuses
the exact membership rule `skill list --as` already ships and tests — it introduces no
new policy, only applies an existing one at one more site. A skill an employee is denied
by the filter is reachable by name through `skill show`, so nothing is lost, only
un-auto-loaded.

---

## M3 — One read surface, one feed bridge (the structural close)

**Closes audit gaps 6, 7. Two small moves, both behind existing fences.**

**3a — The single read query.** Four sites read `messages` today with four different
queries (`context.py:346` audit table). After M1, the brief join and `msg inbox` share
one fan-in (`to_refs` + unacked); `msg thread` remains the thread reader (a different
question); `pending_for_chair` remains the Chair's (a different principal, with its own
tested ack loop — deliberately untouched). The consolidation is: **the
`compile_context` unread query and `Kernel.inbox` call one helper** — `_unread(refs)`
on `Work` — so the two surfaces cannot drift. Two calls, one query, one writer
(the messages table's writer is already `Work._message` alone).

**3b — The KB feed bridge.** The audit found two collaboration vocabularies with no
bridge: Holon `msg` (in the kernel, agent-reachable) and genome `post`/`feed` (in the
KB, refused by `kb run`'s verb allowlist). For the ventures migration this is not
optional: a lane's KB *is* its operating intelligence, and its feed is where its
genome-organized agents coordinate. The move, in order of least new surface:

1. **Add `"post"` and `"feed"` to `kb.run`'s `READ_VERBS`** (`kb.py:30`) — they are
   reads of an append-only file, no more dangerous than `view`, and they close the
   "cannot read your own feed" half. `feed --to <you>` becomes agent-reachable
   through the existing `kb run` fence. *(Write-side `post` stays operator-only
   until the Chair rules otherwise: appending through the kernel would need a
   `[kb] writes` policy with a provenance row, which is a Chair decision, not a
   plan default.)*
2. **One pointer, not a copy.** The brief's unread section (M1) does not learn about
   KB feeds. Instead the identity card's new line names both surfaces:
   `msg inbox` for the organization, `kb run <slug> feed` for a lane's own KB. One
   line, both vocabularies, no duplication machinery. The **genetic rule from the
   ventures plan applies**: a lane's KB is that system's own operating intelligence
   and travels with it; the bridge is discovery, not sync.

**Guard.** `test_the_kernels_kb_run_reaches_the_feed_of_its_own_kbs` — seed a KB with
the `agents` module, `kb run <slug> feed` returns the feed's lines, and a body
(agent principal) may run it. Ledger row.

---

## What this plan deliberately does not build

Recorded so the non-redundancy is checkable, not just claimed:

- **No `post`/`feed` CLI commands in the kernel** — the genome feed stays genome-side;
  the bridge is `kb run`'s allowlist, not a parallel implementation. Two vocabularies
  would become three.
- **No heartbeat nudger for employees** — the brief join makes one redundant; a wake
  schedule covers the "message waiting, no work" case the join cannot (and that case is
  rare enough to be the Chair's `schedule add --kind wake` call, not new machinery).
- **No unread-count in doctor or the digest** — after ack-on-render, unread count is a
  transient between two dispatches, not a health signal. Watching it would be watching
  a number designed to go to zero.
- **No per-message importance routing** ("urgent" DMs injected, chatty ones not) —
  the sender already has the importance signal: a `question` with `ack_required` reaches
  the work's brief *today* via `needs_input`; a DM worth interrupting for is a DM
  worth task-scoping. Adding a priority field would re-derive a signal the protocol
  already has.
- **No change to the Chair's digest** — it is the one loop that works end to end, is
  tested, and its ack cursor is the pattern M1 borrows. Untouched.

## Sequencing, ownership, and the ventures interlock

| Move | Depends on | Size | Its own check |
|---|---|---|---|
| M1 | nothing | ~20 lines at `context.py:346` + 1 line in `identity_card` + 1 config key + 2 guards | the two guard tests + `lint --strict` |
| M2 | nothing (parallel-safe: different file) | 1 line at the `briefs.build` call + 1 guard | the filter test + `lint --strict` |
| M3a | M1 (shares the helper) | small refactor, no behavior change beyond dedupe | existing msg tests stay green |
| M3b | nothing | 2 verbs in a tuple + 1 guard + 1 BYLAWS row | the feed test |

M1 and M2 are disjoint writes (`context.py`+`org.py`-side identity vs `briefs.py`), so
they fit the swarm's two-lane discipline: **one agent per move, each running its own
guards before reporting** — and per the audit's meta-finding, each agent's brief must
carry the *exact* probe invocation (the audit's failed-attempt list: wrong lane, wrong
role set, wrong envelope kind, wrong signature), not just the intent.

**Interlock with the ventures migration.** M1 must land **before** the outreach fleet's
routines are imported (a lane that runs once and exits must not depend on pull-only
messaging); M2 should land with it (the lanes are cron-heavy, and 37K/run × 288
firings/day for one `*/5` routine is the difference between a lane that fits its budget
and one that does not); M3b lands with the KB bootstrap (agent 5's packet), because a
bound KB whose feed its own agents cannot read is half a KB.

## What this plan does not claim

- The 37K saving is measured on the standard library as of this commit; a department
  that forks many role skills will save less. The mechanism, not the number, is the
  claim.
- The unread section's 213 chars is a 3-message simulation; a real backlog's size
  depends on senders' behaviour, and ack-on-render bounds it to *messages since the
  employee's last dispatch* by construction.
- M3b's write-side (`post` through the kernel) is named as a decision, not designed:
  it needs a provenance policy the Chair owns.
- No performance claim beyond token counts: the extra query at dispatch is one indexed
  read on a table the kernel already touches in the same transaction window.

*All measurements from scratch instances under `tempfile.mkdtemp`, discarded after
reading. Nothing was applied, imported, or created. The plan gates on the Chair's
approval move by move.*
