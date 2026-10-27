---
status: proposed
date: 2026-10-17
description: "The KB integration design: how every kind of knowledge store on the B-side organism (venture md corpora, the flight-ledger logbook, KosmOS, relationship-crm journals, arch AD/RG records, the Paperclip registry, skills stores, memory-wire function banks) lands in Holon — one target shape per KB type, the boundary invariants that keep it non-fragmenting, and the verification each seam owes. Expands the capability audit's KB-class table into an approvable design."
tags: [design, knowledge-base, integration, ventures-import, memory-wire, flight-ledger, boundary]
---

# 2026-10-17: the KB integration design — how the organism's knowledge lands in Holon

Status: **proposed** — the expansion the Chair asked for before approving execution (§1-§5
are the context, §6 is what approval unlocks, §7 is the ask). It builds on
`2026-10-17-organism-kb-capability-audit.md` (the terrain) and
`2026-10-17-kb-implementation-ontology.md` (the work), and crosses the boundary law once
more: A = the Holon agentic-OS, B = the organism production system. The kernel-side
counterpart of its memory boundary is the universal repo's
`docs/design/2026-10-17-kb-architecture-audit.md` (scrubbed; its addendum holds the
memory-wire findings referenced here as KB-7/8/9/10).

## 1. The layering — three memory tiers, one each per consumer (confirmed as-built)

| Tier | Store | Owner/writer | Consumer | Evidence |
|---|---|---|---|---|
| **Body working memory** | memory-wire bank inside `$HOLON_HOME/adapters/operant/home/memory` | the body (operant's only memory engine) | the body, its session | `adapters/operant/install.py` (`[memory] enabled`, memory_dir inside HERMES_HOME); `memory_wire.rs:248` (file-backed, `DEFAULT_BANK`) |
| **Institutional memory** | holon `memory.db` — scoped items, episodes, project_state, links | the kernel (one writer law); seeded by results, promotion, Chair | every run via the bundle; agents via CLI/MCP | universal audit §0 |
| **External/domain stores** | trajectory + logbook (dormant today: files absent on the live instance), Paperclip's embedded PG (B's scheduler), each pool's own KB | external (per store) | the kernel joins read-only (bundle/recall); pools join their own | paths.py; PAPERCLIP docs; capability audit §1 |

The boundary is **already decided** (runtime = the body's working memory; kernel =
institutional, boundary doc S1/S3) and it is a *layer* distinction, not a duplication:
memory-wire brings measured retrieval (R@5 benchmarks, fusion, rerank — its eval corpus)
over the body's own context; Holon brings scope, promotion, supersession and the audited
institutional record. They duplicate only where writes go unenforced — which is exactly
the red-team finding: **KB-9** (an institutional lesson can be retained into the body bank
where nothing promotes, audits or supersedes it), with **KB-8** (one shared `DEFAULT_BANK`
for every body — no per-employee scoping or portability) and **KB-7** (the body store sits
outside `holon backup`'s trees) as its two structural causes. Those close on the A side,
before any wave inherits the leak — they are in the universal record's §1 now.

## 2. The one rule that prevents a fragmented KB at import

**Nothing migrates by bulk copy.** A domain store keeps its writer, its format, and its
schema; what crosses into Holon crosses through a sanctioned path only: result
consolidation (`learnings`/`decisions`/`terrain`), evidence-based promotion
(`emp:→dept:→org`, lessons), or the Chair (`memory promote`, pinned constraints). The
counter-example is already on record — B's 704-duplicate skill incident (bulk import,
reverted same day) and the two drifted `kb.py` forks. A copy without scope, provenance or
supersession is not integration; it is a second source of truth.

## 3. Per-KB-type mechanics (what approval covers)

| # | Type | Live example | Target shape in Holon | Writer after cutover | What crosses | What stays | Verification (the seam's real-artifact test) |
|---|---|---|---|---|---|---|---|
| A | md corpus + domain CLI | career-pipeline `kb/` (items/, decisions/, worklogs jsonl, 24-cmd `kb.py`); freelance-agency (15-cmd fork); architectural-leads | **pooled unit**: `kb.py` becomes the manifest service's entry binary; the corpus root is a read-only pooled root (the R-06 pattern) for every other department | the owning department (kb.py) | the department's distilled lessons/constraints via results; its active decisions as dept: items | the md corpus and its CLI; the jsonl state | a claim on another department's task: brief shows the pooled unit + the corpus is read-only in policy.json and isolation |
| B | single-writer sqlite + Chair mirror | flight-ledger `logbook.db` (Notion = the Chair's DB) | **bridge as-is**: the schema *is* the kernel's `capabilities/logbook` seam (column-compatible today); activation = a writer on an A instance | flight-ledger (its single writer stays) | nothing — the kernel joins read-only | the DB, its writer, the Notion mirror | a real logbook row (any entry) found in a compiled bundle; `api_version` accepted; an unknown version refused (R-6's contract) |
| C | md+YAML vault, gated CLI | KosmOS / research-vault (`research-kb`, KOSMOS-AD-008) | **pooled unit**: research stays a declared *service consumption* (its existing law — reads through its CLI, not pooling) | research-vault | nothing structural | the vault, its gates | a consumer department's brief renders the service; a direct write into the vault root is refused |
| D | journals + ontology-as-code | relationship-crm (`ontology/edges.py`, journals canonical) | **stays-B until its wave**; at wave: journals → same shape as A (pooled md), the ontology → the department's **skills layer** (procedural knowledge), never memory.db | the pool | its lessons via results | journals; ontology | deferred to its wave |
| E | decision + guard records | arch AD/RG (263 + 202, `arch validate`-linted) | **active items + history docs**: an ACTIVE decision/guard that constrains work becomes a dept: memory item (`kind=decision`/`constraint`, provenance `ad:<id>`) — the steering path the bundle already renders; the full record set rides as an **instance docs layer**, readable via the law-surface generalized per instance (R-5), searchable, never bundled wholesale | the kernel (for the dept: items, via Chair/consolidation); the docs layer stays a copy under the instance | the *active* subset only | the md record set | a dept-scoped bundle renders a promoted AD constraint as steering; an archived AD is absent from bundles, present in the docs layer |
| F | scheduler registry | Paperclip routines (PG); `cron-jobs/*.md` protocols | **routines become Holon schedules/plans** (the re-architecture §7 — unchanged); the KB dimension only: the protocol md becomes the routine's **playbook** (the copy that IS sanctioned — versioned, rubric'd, refined), and the import reads the live registry, never the file's historical `status`/`schedule` frontmatter | the kernel (schedules); the owning department (playbook) | protocol content → playbook; nothing else | — | a routine fires from a Holon schedule on the imported cron; its playbook renders in the brief; the Paperclip twin is disabled after 3 verified firings + a clean week (the decommission rule) |
| G | skills | organism pools' `skills/`, the `~/.hermes/skills` symlink farm, Skill Studio (79 assigned) | **the department skill layer**: pool skills become `@dept` skills; the symlink farm dissolves into the 3-layer resolution; Skill Studio assignments become the employees' `skills` lists | the department (steward loop) / kernel | skill content as md (skills ARE md — no conversion) | — | a run's exported skills dir holds exactly one copy of each skill (R-09); the bridge-v2.5 injection problem disappears — holon exports per run |
| H | function memory banks | memory-wire banks `talent`/`growth`/`rd`/`ops`/`org` | **per-function, one load-bearing store**: at that function's wave, its bank's durable content (the lessons the retro writes) moves to `dept:` scope; memory-wire keeps body working memory only (KB-8's per-employee banking is what makes the split clean) | the kernel (dept: items); the body (its own bank) | bank charters become the first dept: items (provenance: charter); future lessons via consolidation | nothing in memory-wire | a wave-cutover test: a lesson retained once, then recalled from the dept scope by a different harness — portability is the proof |

## 4. The join layer stays the OS's

Cross-KB integration happens in exactly three kernel-owned places, forever: the **context
bundle** (push, per run — with P0's KB-1 recall floor so cross-scope recall survives
budget pressure), **`holon recall`** (pull, if R-1 is adopted), and the **api_pool
registry** (what each department offers and consumes — the C1+C2 manifest package).
Domain KBs never query each other directly; they declare services and the kernel's seam
fuses. This is the single structural answer to the Chair's opening question — why our
integrated KB can synthesize what the fragmented B-side stores cannot.

## 5. Invariants (the approval criteria — all seven must hold at every wave)

1. **One writer per store** (kernel law 3): each imported KB keeps exactly one; the kernel
   never writes an external store; other departments read via pooled roots or the CLI.
2. **No bulk copies** (§2): institutional knowledge crosses only via consolidation,
   promotion, or the Chair; the one sanctioned copy is playbooks (versioned, evidenced).
3. **Pooled roots are read-only** to non-owners — already the R-06 fix in the kernel
   (policy.json `read_roots`, grading floors, isolation grants); no wave re-litigates it.
4. **The working/institutional boundary is enforced before wave 1** — KB-7 (backup
   scope), KB-8 (per-employee banking), KB-9 (write routing) land on A first; the first
   imported department inherits the closed boundary, not the leak.
5. **Every seam gets its real-artifact test** (kernel law "an interface is done only when
   one test crosses the seam"): the flight-ledger join, the pooled-unit claim, the AD
   constraint render, the routine-from-schedule firing, the portability recall — one each.
6. **Steering kinds stay authority-ratified**: a decision/constraint reaching a shared
   scope has an approver's provenance (Chair, head, or consolidated) — R-0's fence holds
   identically for imported content, so an AD import cannot launder a constraint into org
   law.
7. **History stays reachable but not bundled**: full record sets live in read-only docs
   layers (searchable via the law surface), never in every run's context.

## 6. What approval unlocks, and the sequencing

Approval of §3 + §5 lets the wave plan assign each pool its row (the capability audit's
§4 table already seeds it: career/freelance = A, arch-leads/KosmOS = C, flight-ledger = B,
relationship-crm = D) and lets P0's kernel fixes and the P4 hygiene (husk purge,
pc-audit check, kb.py fork decision) proceed independently — neither waits on a wave. The
boundary closures (KB-7/8/9) gate wave 1; everything else rides the existing migration
gates (the Chair's six decisions + this design).

## 7. Decisions requested

1. **The per-type table (§3)** as the standing mapping: approve, or reassign any type
   (e.g. a pool's corpus argued to be a capability rewrite instead of a pooled unit).
2. **Invariant 6's stance on the AD import**: active-decisions-as-dept-items via the
   steward's curation (recommended) vs a mechanical status-filter at cutover.
3. **Wave 1's pair order** once the six re-architecture decisions land — the
   recommendation from the capability audit stands: career-pipeline or architectural-leads
   first (both have a real CLI to exercise seam A/C against).
4. Confirm the P4 hygiene (husk purge + pc-audit check + no kb.py unification investment)
   proceeds now rather than waiting for the waves.
