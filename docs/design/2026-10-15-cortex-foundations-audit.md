---
status: executing
date: 2026-10-15
description: "The subsystem question: the organism's 47 genome units against Holon's grain. U1–U3 (unit manifests, pooling semantics, derived registry) are built (8693854, read API v3); U4 (graduation) is post-pilot; U5's port rule governs; its platform-infra ruling is refined by the C-track."
tags: [cortex, foundations, genome-track, U-series, AD-060]
refined-by: 2026-10-16-platform-ops-capability-system.md
---

# 2026-10-15: the cortex/foundations audit — the subsystem question and Holon's genome upgrade plan

Status: **proposed** (an architecture-upgrade plan for the Chair's decision). **Update
2026-10-16: U1, U2 and U3 are built and landed** (`8693854` — manifests, pooling semantics,
derived registry, read API v3); U4 remains post-pilot. U5.1's platform-infra ruling (a
department) is refined by the C-track
(`2026-10-16-platform-ops-capability-system.md`): platform-ops is the capability layer's
operating department — surfaces as manifests (C1), the capability block (C2), health probes
(C3) — not merely the ops fleet. Method: full survey of `~/.hermes/organism/cortex` and
`~/.hermes/organism/foundations` (47 genome
instances: 10 unit roots, 36 sub-systems, 1 deeper in archive), the AD-060/AD-061 law read in
full, canonical organs read (`forge`, `professional`, `cron-management`, `living-architecture`),
68 ADs + 26 RGs in cortex, pooling symlinks enumerated, 2026-10-15.

## 1. The concession

The 2026-10-15 ventures record mapped sub-systems to "task classes, child departments only when
they need their own head" — that conflates two different things. The organism's sub-system is a
**recursive genome instance**, not an org/work construct:

```
pool:            name, type, tier (foundational/compass-graduate/project/native-organ),
                 category, parent, ad_scope, role, domain
surface_registry: what the unit exposes, gated
services_offered: id, entry_point (executable verbatim), accepts, returns
services_consumed: provider, purpose, access (cli|symlink)
pooled_sub_systems / shared_services: what it extends (symlinks, exact-name rule)
relationships: depends_on
directories:     the structural contract (suffix/prefix/frontmatter per dir, RG-027:
                 every directory declared — the routing contract for pooling)
required_files / forbidden
department:      charter, class
+ core/decisions/AD-<prefix>-*.md, core/regressions/RG-*.md per unit (own prefix)
+ cron-jobs/, smoke.yaml, skills/*/SKILL.md, bin/ CLIs, data/ — per unit, at every depth
```

A Holon child department with `parent_id` carries none of that: no services registry, no
structural contract, no per-unit governance prefix, no pooling. Task classes are protocol
groupings inside one department's work. Neither is a sub-system. The organism's law (AD-060/061):

- **Unified genome (P1–P6)**: a unit's `sub-systems/` tree is its complete operational genome —
  NATIVE organs it owns (own lifecycle, data, CLI; recursive to sub-sub-genome) + POOLED organs
  (relative symlinks to foundations, exact-name, read-only presence; writes via the owner's CLI).
  Own natively what has a lifecycle; extend by pooling what is a capability (P6).
- **Registry derived, never registered (AD-061)**: every unit's `_org.yaml` is the single source;
  `arch emit` regenerates the unified registry, category taxonomy, and each unit's AGENTS.md;
  the linter enforces prefix drift, registry staleness, undeclared dirs.
- **Auto-emitted agent routing (AD-070)**: every unit's AGENTS.md carries its services table,
  fleet map, and `arch route` ownership resolution — generated, not written.
- **Living architecture (AD-074)**: `living-architecture` compiles the whole OS's live structural
  state (`_org.yaml` × `jobs.json` × `ad_rg_index.db` × relations) into registry views, on the
  15-minute sync cycle.
- **Graduation**: projects pass a 5-stage pipeline (Seedling→Sprouted→Operative→Hardened→Sovereign)
  against genome-template gates (G1–G9) evaluated per unit.

## 2. The measured terrain (what would have to be ported)

| Stratum | Units | Notable |
|---|---|---|
| cortex/meta-governance | 1 root + `living-architecture` + archive | the law itself: 68 ADs (63 active), 26 RGs, `arch` CLI, `living-arch` compiler, the derived `architecture-registry.yaml` |
| content-campaigns | 1 + 7 organs | 8 services (campaigns/audiences/content/research-protocols/seeds/templates/feedback/alignment); the plan/execute/feedback engine trio |
| identity-core | 1 + 5 organs | identity CLI; `professional` (candidate-profile + resumes — pooled by career/freelance), `platforms`, `subjective`; 4 smoke gates |
| platform-infra | 1 + 7 organs | **15 crons — the ops fleet** (VPS, tunnels, browser stack, gateway, smoke); `cron-management` (AXE awareness injection), `hermes-platform`, `mcp-integration` |
| relationship-crm | 1 + 2 organs | contacts + outreach CLIs |
| site-factory | 1 + 4 organs | web-sites/deploy/quality/scaffold; consumed by every web property |
| strategy-incubator | 1 + 9 organs | forge (task engine), grounding, insights, trajectory, forecast, alignment, graduates, ceo-office |
| research-vault | 1 (leaf) | kosmos CLI — the research substrate pooled by 5 ventures |
| presentation-engine, flight-ledger | 2 leaves | render/validate/list/doctor; logbook + journal canonicalization |

Pooling direction is one-way (foundations never pool; graduates pool foundations); a foundation
organ can itself be contributed canonically into a foundation (`professional` is stored in
identity-core, generated by job-engine — ID-AD-004).

## 3. What Holon has, honestly

| Organism concept | Holon today |
|---|---|
| recursive genome unit | none — departments (parent_id, mission, profile) carry no unit contract |
| services registry | `msg request` (ad-hoc cross-dept work); no declared interfaces, no binding check |
| pooling (presence + discovery) | scope roots (filesystem grant) + skills; nothing renders a pooled capability into the consumer's briefs |
| derived registry + structural lint | read API (runtime state) + `holon lint` (kernel laws); nothing derives the org's structural genome or lints unit contracts |
| auto-emitted agent routing | briefs + context bundles (per-run, excellent) — but no standing per-unit map an entering agent reads |
| tiers + graduation | none (departments are created, not graduated) |
| per-unit governance registries | hash-chained events (kernel-level); AD/RG files only as data under scope roots |
| smoke gates per unit | `[checks.dept]` — per department, flat, not per organ |

## 4. The upgrade plan (proposed; the Chair decides)

A **genome layer** in the kernel, in the Holon grain — not a port of `arch`, none of its
symlinks. Everything below is standard Holon work: vocab + migration + lint bindings + tests.

**U1 — unit manifests.** `$HOLON_HOME/genome/units/<slug>.toml`, one per department *and* per
service unit (a foundation that stays a service): charter, category, tier, `[[services]]`
(id, command, accepts/returns as documentation), `consumed = ["…"]`, `pooled = ["…"]`,
`roots`, `smoke` refs. The manifest is instance data (fits law 10); the kernel syncs it into a
small `units`/`unit_services` migration at init/tick and the read API gains `api_units` +
`api_services` views. `holon lint` gains the bindings the organism's linter proved out:
`bind.service` (a consumed service must resolve to a unit that offers it), `bind.pool` (a pooled
ref must name an existing unit), undeclared-roots, manifest staleness.

**U2 — pooling semantics.** `pooled = ["identity-core"]` in a department's manifest has three
runtime effects, replacing symlinks with declared references: the pooled unit's service map and
charter render into the consumer's briefs (presence + discovery); its roots join the consumer's
read scope automatically; writes still go through `msg request` to the owning department (the
organism's "read-only integration, writes via the owner's CLI" maps to "reads by scope, writes
by work"). One mechanism per relationship holds: pooled ≠ consumed.

**U3 — derived registry + emitted views.** `holon genome emit` regenerates
`$HOLON_HOME/genome/registry.md` (the unit tree, services graph, genome status) from the
manifests — the living-architecture role, in the Holon grain. Doctor warns on staleness. No
per-unit AGENTS.md emission: briefs already do that job per run.

**U4 — tiers and graduation.** Manifests carry `tier`; graduation becomes what the organism's
gates really were — a review task per unit (`class = genome:graduation`) whose rubric is the
gate checklist, judged and verified like any Holon work. The 5 stages collapse to Holon's own
vocabulary (probation → verified track record). Not urgent; the ventures arrive already
graduated.

**U5 — the port rule for the 47 units (replaces "task classes" for sub-systems).** Three
destinations, by what the unit is:
1. **Units with a lifecycle (own state machine, real work)** → Holon departments or routines:
   `platform-infra` (15 crons — genuine operational load) becomes a **department** (the it
   department's sibling: platform ops) with its crons as routines and its smoke as checks;
   `forge` collapses into Holon's own work graph (it *is* one — superseded by the kernel's plan/
   execute/verify); `cron-management` collapses into the kernel's schedule + sync mechanisms
   (Holon's `routine import` is the --sync-cron pipeline, provenance-tracked).
2. **Service units (data + CLI, no work of their own)** → **U1 manifests, not departments**:
   identity-core (professional/platforms/subjective), relationship-crm, research-vault
   (kosmos), site-factory, content-campaigns, presentation-engine, flight-ledger. Employees
   never work "in" them; departments pool/consume them, their CLIs run under the consumer's
   scope, their smoke gates join `[checks.dept]` of the consuming department.
3. **Governance scaffolding (decisions/RG registries, templates, standards)** → stays as files
   under the unit roots (readable in scope); the AD/RG *content* that still governs this
   migration (AD-060/061, RG-027/028) is honored by the port itself and recorded here.

`strategy-incubator` is the test case: `grounding`/`insights`/`trajectory` are data+CLI services
(U5.2); `forge` is U5.1 (collapsed); `graduates`/`ceo-office` map onto Holon's executive
department and metrics loops — nothing to build.

## 5. Sequencing

```
now → wave 1    nothing: career-pipeline pools only identity-core/professional → scope roots (I3)
wave 1 → wave 2 U1+U2+U3 as one kernel package (tests first, lint bindings, GENOME §6 rows,
               read API v3 with api_units/api_services) — before arch-leads and the brand
               pools, which pool 3–5 foundations each
wave 2         platform-infra ports as a department (U5.1) — its 15 crons are real ops load
later          U4 graduation routines when a new venture incubates inside Holon
```

Cost: U1–U3 is one focused kernel package (a migration, two manifest readers, lint clauses,
two API views, brief rendering) — the same order as H4–H10 packages, not a rewrite. U4 is a
routine + rubric, not code. Nothing in wave 1 waits on any of it.

## 6. What this corrects in the records

- `2026-10-15-ventures-gap-investigation.md` §5's sub-system row ("task classes first") is
  superseded by U5 for foundation-type sub-systems; venture-native sub-systems that own a
  lifecycle (career's apply engine, saas's sourcehound-api-rd) remain the child-department or
  class cases as recorded.
- The gap register gains: **U1 unit manifests**, **U2 pooling semantics**, **U3 derived
  registry** (build, wave 1→2), **U5 port rule** (the rule itself), replacing the informal
  "I3 roots" as the foundations story. I3's per-cron roots pass remains the wave-1 expedient.
