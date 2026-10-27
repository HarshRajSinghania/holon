---
status: living
date: 2026-10-16
description: "How to read the design corpus: the frontmatter status vocabulary, where each kind of document lives, and the reading path for a fresh agent."
tags: [meta, reading-order, conventions]
---

# The design corpus — how to read it

Everything an agent needs to place a record before opening it is in its **YAML frontmatter**:
`status`, `date`, `description`, `tags`, and where applicable `closes` / `refines` /
`superseded-by` / `verified-by` / `pair`.

## The status vocabulary

|Status|Meaning|What a fresh agent should do with it|
|---|---|---|
|`proposed`|A decision plan awaiting the Chair. Nothing is built from it|Do not implement without the Chair's approval; the "decisions requested" section is the ask|
|`accepted`|The Chair approved the direction; work may proceed|Treat as direction; the mechanism may not exist yet|
|`executing`|Approved and under way, partially landed|Read for the phase map; check the register for what is actually open|
|`built`|The designed mechanism has landed in the universal repo|The law docs (`GENOME.md`, `CONTRACT.md`) are now the operative reference; this record is the *why*|
|`executed`|A one-time body of work (an audit, a verification, a hardening pass) is done|Read for evidence and history; its open items live in the register|
|`register`|A living index of open items|The **only** place open work is tracked; superseded registers say so|
|`superseded`|Wholly replaced by a later record|Read only for history; act on the successor named in `superseded-by`|
|`living`|A maintained document, not a dated record|Always current as of its `date`; update it in the same commit as the change it describes|

Partial supersession (a record whose §X was refined but whose rest stands) is said **in the
record's own status prose** — the frontmatter keeps the record's overall status, the prose names
the sections that moved on. No `deprecated` status exists yet: nothing has been withdrawn
without a replacement; if something ever is, mark it `superseded` with no successor named plus
a `deprecated: true` line.

## Where things live

- **`docs/design/`** — dated records: proposals, audits, verification passes, registers. History
  is append-only; a record's content is never rewritten after the fact — corrections travel as
  status-line notes and successor records.
- **`docs/STATUS.md`** — the live index (deployments, standing decisions, what is next).
- **`PERSONAL.md`** — the overlay's runbooks (sync, publish gate).
- **The universal repo** carries no design records — only law and reference docs
  (`AGENTS.md`, `docs/INTENT.md`, `docs/GENOME.md`, `docs/CONTRACT.md`), which are *living* by
  nature and carry no status. If a record's universal lesson is enforced somewhere, it is
  enforced there.

## The reading path (2026-10-20)

1. `AGENTS.md` (universal) → `docs/INTENT.md` → `docs/GENOME.md` → `docs/CONTRACT.md` — the law.
2. `docs/STATUS.md` — where the project actually stands.
3. `TODO.md` — the register: everything open, one row per item.
4. `docs/design/2026-10-20-the-a-side-program-boundary-and-solutions.md` — what this program
   owes, and what it is not.
5. The architecture pair, both `proposed`: `2026-10-16-ventures-re-architecture.md` (the
   ventures half) and `2026-10-16-platform-ops-capability-system.md` (the capability half).
6. Then newest-first by date; a `superseded` record is safe to skip unless you need the history,
   and an archived one lives in `docs/archive/` with a row in its `INDEX.md`.

## Conventions

- A record named `YYYY-MM-DD-*.md` is dated by when the *work* happened, not by when you read it.
- Every record names its evidence (surveys, commits, test names). A claim without evidence in a
  record is history's claim, not today's truth — the register and STATUS.md own the present.
- A defect found by a real run gets a guard test and a ledger row in the same commit (AGENTS.md
  law); design records are where the *reasoning* lives, the ledger is where the *guarantee* lives.
