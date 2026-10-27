---
status: proposed
date: 2026-10-17
description: "Capability audit of the organism's knowledge-base infrastructure: every KB/DB system on the B-side (arch governance, flight-ledger logbook, per-venture kb.py stores, relationship-crm, KosmOS, Paperclip, memory-wire banks, skill stores) assessed for CRUD capacity over tables/schemas/md-files and lint validatability — toward the Chair's goal of custom DBs per use case. Companion to the universal repo's docs/design/2026-10-17-kb-architecture-audit.md (the A-side audit and decision packet); the two are one seam, never conflated."
tags: [audit, knowledge-base, organism, arch, flight-ledger, kb, ventures-import, paperclip]
---

# 2026-10-17: the organism KB capability audit

Status: **proposed** (an executed survey whose recommendations wait on the Chair). Evidence
base: the local organism tree (`~/.hermes/organism`, in sync with the VPS copy per the
Chair's 2026-10-17 ruling) — every sqlite DB opened `mode=ro`, every claim from code or a
registry, not from prose. VPS-only state (Paperclip's embedded PG, zeroclaw's `brain.db`)
is cited from `ventures/PAPERCLIP-*.md` and the system registry and labeled
*from-doc*. The A-side counterpart is the universal repo's
`docs/design/2026-10-17-kb-architecture-audit.md` (scrubbed, mechanism-only, with the
ruling packet R-0..R-6); nothing there names anything here.

## 1. The inventory — CRUD capacity per system

| System | Format | Create/Read/Update/Delete | Schema management | Lint / validation |
|---|---|---|---|---|
| **cortex/meta-governance** (`arch` CLI, `bin/arch`) | md AD/RG records (263 AD + 202 RG) + `_org.yaml` per pool + derived `architecture-registry.yaml`, `relations.yaml`, `external-workspaces.yaml` + `ad_rg_index.db` (464 rows, FTS5 porter) | full: `arch pool create` scaffolds, `arch emit --all` derives, `arch route <path>` resolves ownership, records are git-versioned md | **the strongest on either stack**: `_org.yaml` *is* the schema — per-directory suffix/prefix/`frontmatter_required` (e.g. `JE-AD-` records require Status/Date/Deciders/Description), `services_offered` with accepts/returns, `pooled_sub_systems`, `required_files`, `forbidden` | **`arch validate` 0/0 required** + stale-registry warning (AD-061); ownership via `arch route` (AD-057); smoke.yaml per pool |
| **flight-ledger** (`bin/logbook` + `core/db.py`) | sqlite canonical (`data/logbook.db`, WAL) + Notion mirror (`notion.json`) | full via `logbook` CLI over `core/db.py` (get_db/query/search/get_by_id/stats/upsert); FTS trigger on insert | single-writer declared, **mutations gated on `--reason`** (AD-032) — the B-side analogue of the kernel's hash-chained events; **no schema versioning** (no `api_version`/migration analogue); local mirror has **0 entries** (db 45 KB, wal 0 B; -shm touched 2026-10-17 06:40 — read recently, never written here) | AD-032 rule enforced in the CLI; smoke.yaml; `arch validate` via `_org.yaml` |
| **venture `kb/` stores** (career-pipeline, freelance-agency, architectural-leads) | md corpus (`items/`, `decisions/`, `worklogs/` jsonl, `index.md`, `pipeline-state.md` 54 KB) + json/jsonl state + **nine+ zero-byte sqlite husks** | rich but **per-venture forked**: career `kb.py` 24 subcommands (create/update/upsert/get/list/search/find-similar/link/promote/dedup-check/reindex/sanitize/archive/decisions/worklog/runs/report/stats/win/pipeline/…) vs arch-leads `kb.py` 15 (a drifted subset); `.bak-t_*` copies in-tree | **none**: 11 zero-byte files in career-pipeline/kb alone (`decisions.db`, `job-intel.db`, `job_intel.db`, `jobs.db`, `kb.db`, `kb.sqlite`, plus bare-name accidents `it1`, `job_intel`, `jobs`, `kb`, `sqlite`) — four name variants for one concept, regenerated as recently as 2026-10-17 04:23 by kb.py runs; freelance-agency's four DBs likewise present zero tables | ad-hoc only (`test_upsert_identity_guard.py`, `test_stale_check.py`); no contract, no lint pack; `kb/` is `allow_any: true` in `_org.yaml` — deliberately ungoverned |
| **relationship-crm** (the live rel-intel; campaigns/content deprecated to graveyard 2026-08-23) | md/yaml/json reports + **ontology-as-code** (`ontology/edges.py`, `stages/`, `pathologies.md`, `scale.md`) | domain CLIs + report writers; journals canonical (RI-AD-035) | ontology expressed in python, not data-declared | `arch validate` via `_org.yaml`; domain rules unverified |
| **research-vault (KosmOS)** | md + YAML KB, gated per-engine CLI (KOSMOS-AD-008) | served as `research-kb` to consumers (content-campaigns, venture graduates, site-factory) — **consumption via declared services, not pooling** | md convention | `arch validate` |
| **Paperclip** (VPS, *from-doc*) | embedded PG (routines/issues/projects/goals), zeroclaw `jobs.db` (record-only, 0 enabled crons), task-router `state.json`, `~/bridge-runs.log` | full API CRUD (routine PATCH: assigneeAgentId/projectId/goalId/status/env/activityGatePolicy/concurrencyPolicy; project workspaces; skills; tasks) — the "hard-won semantics" live in root AGENTS.md (env `{"value":…}` wrapper, `originKind` discriminator, release-takes-no-status) | **product-owned schema** — we consume it, never manage it; `jobs.db` is record-only by invariant | **`pc-audit`** (exit 0 required before/after any config change): workspaces/leads/goals/env, DELIVER lanes vs live v2 lanes, env wrappers, task-router lane guard + state size, bridge token, zeroclaw scheduling-off, board-key expiry |
| **memory-wire function banks** (talent/growth/rd/ops/org) | MCP bank memories | retain/recall per bank; writers = that function's routines + retro; org bank = coo recon; charters as first memory | bank-isolated, tags | no bank-level lint; working state deliberately stays in venture `kb/pipeline-state.md` |
| **skill stores** (TANDEM model) | organism md skills (canonical), `~/.hermes/skills` symlink farm, Skill Studio (Paperclip-native only) | create via pools; improvement via ratified [improve] tasks only | frontmatter SKILL.md per skill | organism `arch`; **but the execution path never reads Skill Studio assignments** (see §3) |

## 2. What the evidence says the KB infrastructure can actually do

1. **md + frontmatter under a declared contract, with a linter and a derived registry —
   works, maturely.** `arch` is the proof: `_org.yaml` schemas records, pools, services
   and pooling; `arch validate` enforces; `emit` derives the registries; `ad_rg_index.db`
   adds FTS over the md corpus. Holon's skills/playbooks + lint packs are the same pattern
   (both stacks converged on it independently).
2. **single-writer sqlite with a reason-gated mutation trail — works, once.**
   flight-ledger is the only B-side system doing it; it matches holon's one-writer law
   and the A-side `capabilities/logbook` seam is column-compatible with its `entries`
   schema (`date/channel/title/body` + `entries_fts`) — the bridge is already built.
3. **bespoke per-domain KB engines — fails predictably.** Two divergent `kb.py` forks,
   `.bak` files in-tree, eleven zero-byte DB husks in four name variants, regenerated
   by routine runs. Nothing was ever lost (the md corpus is the real KB) but nothing
   tabular was ever gained either: **B-side has zero functioning custom sqlite DB**, and
   no schema for one has ever survived contact with a writer.
4. **the cross-store join is an accident on both stacks.** B: the bridge builds the
   agent prompt from the issue title; skill assignment is cosmetic until bridge v2.5
   (§2 of the gaps doc: 79 skills assigned, execution path never reads them; fix =
   inject ≤2 skills/run by keyword overlap). The ACP audit (§8) confirms it is a
   **topology gap, not a bug**: Paperclip's materialized skills/memory are
   native-runtime-only features; the process-adapter bridge structurally bypasses them
   (zeroclaw has no native adapter; `openclaw_gateway` ships
   `supportsInstructionsBundle: false`). Ranked paths: (1) bridge-side injection
   (cheapest, skills only), (2) gateway protocol verification (no materialized skills),
   (3) zeroclaw adapter plugin (full parity, real work). Working memory today = zeroclaw
   `brain.db` (2.2 MB, actively written) + native session continuity (*from-doc*).

## 3. The custom-DB verdict (the Chair's goal)

"Custom DB per use case, lint-validatable" should **not** mean a new engine per domain —
the kb.py forks are the counter-example. Both stacks have already validated the
three-part pattern; the work is to make it uniform, not to invent:

1. **A domain KB is born with a declared contract, not a script.**
   - On A (the target): a new capability module (single writer) + `migrations/<db>/`
     (checksummed, append-only) + `api_*` read views + `api_version` + a lint pack +
     GENOME §6 row for any config key — consumed by other departments only through
     genome manifests (services) or `msg request`. This is exactly the pre-pilot
     C1+C2 package's shape.
   - On B (until import): the flight-ledger pattern — single-writer sqlite CLI,
     `--reason` on mutation, smoke.yaml, `_org.yaml` declaration with
     `services_offered`. Never a new `kb.py` fork.
2. **md carries protocol and review knowledge** (AD/RG, skills, playbooks, cron
   protocols) with frontmatter as schema and a linter as enforcer — never bare free md.
   The cron-jobs frontmatter (`cron_id`/`schedule`/`status`/`deliver`/`skills`…) is the
   live example: the fields are historical in the Paperclip era, and the import contract
   says so — a lint-able md schema with a versioned caveat.
3. **The join layer belongs to the OS, not the domain KB.** B: bridge/CLI; A: the
   context bundle (+ `holon recall` if R-1 is adopted). Domain KBs never join each
   other directly; they declare services and let the OS's seam do the integration.
   That seam is where both stacks are weakest (B's bridge prompt; A's bundle priority
   — KB-1 in the universal record) and it is where the cross-domain synthesis the
   Chair wants actually happens.

## 4. Import implications (the ventures migration's KB dimension)

Each migrating pool's KB needs a **class decision** — this record adds that dimension to
the re-architecture's open list:

| Pool's KB | Evidence-based class candidate |
|---|---|
| career-pipeline (`items/` corpus, `decisions/`, worklogs, applications.jsonl, pipeline-state.md) | **capability rewrite** (memory-style items with scopes; the corpus is the asset; the husks are not) |
| freelance-agency (same shape) | **capability rewrite** (same reasoning) |
| architectural-leads (md corpus + `market/` + `kb.py` over md) | **pooled-unit wrap** (kb.py's read/search surface as the entry binary, declared in the manifest, fenced read-only for other departments) |
| flight-ledger | **bridge as-is**: holon's `capabilities/logbook` seam already reads its schema; the decision is only whether an A-instance writer gets stood up (universal record R-6) |
| research-vault (KosmOS) | **pooled-unit wrap** (research-kb CLI stays the interface; consumption-as-service is its existing law, KOSMOS-AD-008) |
| relationship-crm (journals, ontology) | **stays B until its wave**; journals-as-canonical has no A-side counterpart yet |

Hygiene that should not wait for the waves: delete the zero-byte husks and remove the
connect-without-write path in `kb.py` that regenerates them (or add the empty-DB check
to `pc-audit`); do **not** invest in unifying the two `kb.py` forks if the import is
near — that is rewrite effort spent twice.

## 5. Decisions requested

1. **The KB-class table above** (per-pool: capability rewrite vs pooled-unit wrap vs
   stays-B) — rules each wave's KB work.
2. **Bridge v2.5 skill injection** stays top of the build queue (gaps doc §2) given the
   ACP audit's conclusion that paths 2–4 do not deliver materialized skills: confirm.
3. **The flight-ledger bridge**: stand up an A-instance logbook writer now, or leave the
   seam dormant under the universal record's R-6 contract ruling.
4. **memory-wire function banks vs holon `dept:` scopes at import**: both are
   function-level memory; only one should be load-bearing per function after cutover.
   Defer to the wave that moves each function, but note the overlap now.
5. **Husk cleanup + pc-audit check** (§4 hygiene): cheap, reversible, do it this week.

## 6. Method

Opened every sqlite `mode=ro` with row counts; compared the two `kb.py` command
surfaces by parsing `add_parser` calls; read `_org.yaml`, the pool registry table, the
logbook CLI and both PAPERCLIP gap sections (§2 skill access, §8 ACP audit); verified
the holon `capabilities/logbook` seam against flight-ledger's actual schema;
distinguished "no tables" from "0 rows" (the husks are the former); and checked file
mtimes to date the husk regeneration (2026-10-17 04:23 — a live routine still creates
them). VPS-only state is labeled *from-doc* and was not probed live.
