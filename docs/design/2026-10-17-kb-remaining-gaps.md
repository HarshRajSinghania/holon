---
status: register
status: register (closed by execution: the KB/R wave + R-6 + the sensor + the dept scan all landed; universal at 7839681, overlay at 1154f67, live instance migrated with recall_log present — this record is now history; the open residue lives in TODO.md rows H2-H6, the B-side census, and the 2026-10-18 gaps outline)
date: 2026-10-17
description: "The register of remaining implementation gaps for the KB work: what landed (and what landed inert), what is open by phase with its evidence, the verification debt the peer-commit created, and the re-run required for the organism hygiene slice. Supersedes the phase status in 2026-10-17-kb-implementation-ontology.md, whose order and mechanics still stand."
tags: [register, knowledge-base, worklist, execution-state]
---

# 2026-10-17: the KB work — remaining implementation gaps (register)

Status: **register** (the only place open work is tracked for this program). Written at
the execution boundary after a harness deadlock interrupted the P0 run; every row cites
its evidence in the tree at HEAD `6ffe78b`. Companion records: the universal audit
(defects + rulings), the capability audit (B-side terrain), the implementation ontology
(phases + terms), the integration design (wave mechanics).

## 0. What actually landed — and how

The kernel tree's HEAD moved under this work: a peer session in the same tree committed
my in-flight `holon/capabilities/context.py` rewrite together with its own live-instance
`api_memory` repair (`memory` migration `0004_api_memory_view_repair.sql`, ledger row,
guard — all verified). Consequences the register must carry:

| Landed at HEAD | State | Notes |
|---|---|---|
| context.py: recall floor mechanism + gaps-first render (KB-1 bundle half) | **inert** | `recall_floor` parameter exists but defaults to 0; no config key and no call site passes it, so the behaviour is unchanged until KB-1's remainder lands |
| context.py: `_fmt_items` with confidence/provenance (KB-5 bundle half) | **live** | renders in every compiled bundle; the CLI half of KB-5 is still open |
| memory migration 0004 + guard + ledger (peer's work) | **live, guarded** | migrations are now 15, `api_version` still 3; the universal audit record's "14/14" line is stale and corrected by this row |

**Verification debt:** the peer's commit was not gate-checked for my code (per the
shared-tree hazard: never assume a peer's push was gated). The bundle rewrite compiles
(`py_compile` clean) and the pre-existing `test_missing_sources_degrade_not_fail` still
passes on it ("Context gaps" now leads), but the full suite has not run since. The
close-out gate (below) must re-run everything against HEAD before any of this is
trusted, and the KB-1 guard is among the open items — nothing is guarded yet.

## 1. Open — kernel P0 (tests-first, ledger row each)

| # | Gap | Next concrete action | Guard to land with it |
|---|---|---|---|
| KB-1r | the recall floor is inert: no `[context] recall_floor_chars` default, neither call site passes it | `service.py` DEFAULT_CONFIG (`recall_floor_chars: 3600`); both `compile_context` call sites (service.py:524, cli.py:934) pass `recall_floor=int(...)` | oversized stage material keeps "Relevant memory"/"Possibly relevant"; gaps block precedes the Task section |
| KB-2 | no episode search surface | `memory episodes <query> [--scope] [--limit]` over `search_episodes`; add to `AGENT_COMMANDS` + `BROKER_EXTRA` | cross-scope episode found; `--scope` respected; tool listed in `mcp.tools()`, broker accepts |
| KB-3 | agent fence incomplete | add `playbook list`, `playbook show`, `events`, `skill path` to both lists | all four in `tools()`, broker accepts each |
| KB-4 | no drift check between law copies and their source | `pack_kb` (or extend `pack_ref`): distilled copies vs `vocab`/INTENT tables, structural only | a mutated `organization.md` fails lint; clean tree passes `--strict` |
| KB-5c | CLI search strips source weight | `cmd_memory_search` renders confidence + provenance (bundle half already landed) | the text line carries both fields |
| KB-6 | chair promote loses the graph edge | `cmd_memory_promote` writes the `derived_from` link | promote → links row exists |

## 2. Open — P0a (the memory-infra boundary, per the red-team addendum)

| # | Gap | Next concrete action |
|---|---|---|
| KB-7 | body store outside backup scope | `integrity/backup.py` TREES: add `adapters/*/home` **or** declare the store disposable and gc it; decide which before wave 1 |
| KB-8 | one shared `DEFAULT_BANK` for every body | `adapters/operant/install.py` banks the provider per employee (the runtime's scoped seam exists; recommended shape) |
| KB-9 | two memory surfaces, unenforced routing | brief-level routing rule + `holon-memory` skill's write section names what belongs where; guard rides KB-4's pack |
| KB-10 | isolation reach vs the body-store path | a doctor clause when isolation lands (R-08); nothing to do while isolation is off |

## 3. Open — the rulings-gated phases

P1 (R-0 scope fence: hybrid write rules, reads stay open), P2 (R-1 `holon recall`,
R-4 `memory show`, R-5 `holon law show`, INTENT mechanism rows), P3 (R-6 the
trajectory/logbook contract: CONTRACT schemas, api_version check, doctor clause, lint
pack) — all still exactly as the ontology defines them; none started. The Chair's
full-scale execution instruction reads as ratification of the packet's recommendations;
R-0 remains the first ruling that matters and it gates only P1.

## 4. Open — the organism hygiene (P4): a clean re-run, not a repair

The delegated slice died from context overrun mid-investigation (model input limit),
**verified to have caused zero side effects**: all ten husk files intact, `kb.py` md5
`20acc33b…` unchanged, the organism repo's working tree clean (no git status/diff
output), no reference doc written, `pc-audit` untouched. Nothing to undo. The re-run
must carry a tighter brief: name the files, cap the reading (do not cat `kb.py` — grep
it), and skip both `kb.py` forks' full contents. The slice's four deliverables (husk
purge + writer fix, pc-audit empty-DB check, single-writer-db reference, root AGENTS.md
pointer) remain as the contract specified.

## 5. Close-out gate (what "done" owes)

1. `python3 -m unittest discover -s tests -t .` green against HEAD (clears the peer's
   commit debt for my code as well).
2. `python3 -m holon --home "$(mktemp -d)" lint --strict` — zero errors, zero warnings.
3. One AGENTS.md regression-ledger row per KB-n item, each naming its guard test.
4. GENOME §6 rows for every new config key; INTENT law-3 rows for every new command
   (recall / memory show / law show / memory episodes).
5. Register seeding through the supervised `scripts/genome status` transition (the
   operator's step; this program's row shapes are in the ontology §4).

## 6. Method note for the re-auditor

The boundaries that moved under this work: the shared tree (HEAD advanced by a peer; the
in-flight rewrite was swept into their commit — verify against `git show HEAD:<path>`,
never against memory of what you last wrote), the live instance (a 15th migration
exists), and the session itself (the harness deadlock is not a project fact and is not
recorded here; its residue was one inert feature and repo litter, both resolved).
