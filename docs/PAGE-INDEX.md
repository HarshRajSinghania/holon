# Page index — every active doc, the question it owns

This index answers one question: which document holds the answer to what. Every row
below names a file and the single question that file owns, so a reader arriving with a
question can go straight to the one document that answers it instead of opening five and
guessing. A file that is not listed here is either new and unclassified, or deliberately
out of scope. When a document is superseded it moves to `docs/archive/` with a tombstone
at its old path, and this index is updated to point at the archive rather than keeping a
row for a file that no longer holds a live answer.

The distinction that matters most here is between a law and a record. `BYLAWS.md` and
`CONTRACT.md` state rules that are enforced by tooling; a `design/` record states what
was decided on a date and why, and is frozen once written. A dated record under
`design/` is never edited in place — it is superseded by a later dated record that names
the one it replaces, and the earlier record is left readable so the reasoning survives.

| File | Status | Owns | Not for |
|---|---|---|---|
| [`BYLAWS.md`](BYLAWS.md) | LIVE | Bylaws: roles, stages, profiles, skills, autonomy | — |
| [`COMMANDS.md`](COMMANDS.md) | LIVE | Every command the distribution registers, generated from the registry | — |
| [`CONTRACT.md`](CONTRACT.md) | LIVE | The harness contract | — |
| [`INTENT.md`](INTENT.md) | LIVE | Intent | — |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | LIVE | How the kernel fits together, for an agent changing it | — |
| [`architecture/README.md`](architecture/README.md) | LIVE | The architecture map: which doc owns which question, and the whole system in one diagram | — |
| [`architecture/against-a-task-runner.md`](architecture/against-a-task-runner.md) | LIVE | Why this is an organization, not a task runner with agents | — |
| [`architecture/the-learning-organization.md`](architecture/the-learning-organization.md) | LIVE | The six feedback loops, joined into one system | — |
| [`architecture/security-and-trust-boundary.md`](architecture/security-and-trust-boundary.md) | LIVE | The trust boundary: why it is shaped so, and why it is off by default | — |
| [`2026-10-16-capability-layer-audit.md`](design/2026-10-16-capability-layer-audit.md) | LIVE | 2026-10-16: the capability-layer audit — a work list for this repository | — |
| [`2026-10-17-kb-architecture-audit.md`](design/2026-10-17-kb-architecture-audit.md) | LIVE | 2026-10-17: the knowledge-base audit — a work list for this repository | — |
| [`2026-10-19-holon-knowledge-layer.md`](plans/2026-10-19-holon-knowledge-layer.md) | LIVE | The knowledge layer: what a knowledge base is, and phases K1 to K4 | — |
| [`install-script-patterns-2026-10-17.md`](install-script-patterns-2026-10-17.md) | LIVE | Install Script Patterns — Compressed Findings | — |
| [`RECORDS.md`](RECORDS.md) | LIVE | Records — decisions (AD) and regressions (RG) — Generated zones below are written by genome rec emit; never hand-edit them. Topic → governing record… | — |
| [`ASKS.md`](kb/ASKS.md) | LIVE | Operator questions and rulings — genome q add "<question>" · genome q rule Q1 "<ruling>" --applied <owner path>. A ruling is done onl… | — |
| [`2026-10-26-two-repo-ponytail-audit.md`](design/2026-10-26-two-repo-ponytail-audit.md) | LIVE | 2026-10-26: the two-repo ponytail audit — the integration seam's defects, measured | — |
| [`2026-10-27-gap-closure-and-architecture-library.md`](plans/2026-10-27-gap-closure-and-architecture-library.md) | LIVE | Closing the seam's gaps, then the architecture library that depicts the system | — |
