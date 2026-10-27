---
status: executed
date: 2026-10-16
description: "Red-team audit of holon × operant as one agentic OS, read against the C-track and the ventures re-architecture: 20 findings (R-01…R-20) — the C-track's browser premise is stale (operant made sourcehound the only engine), the capability render skips planners, pooled roots are writable and grade as in-bounds (segregation law broken in mechanism), operant never reads the unit registry, observers cannot run any declared CLI, two extra prompt injectors; plus the kernel gaps the ventures need (holarchy is depth-1, no document KB, no service contract, a thin system-design skill) and the Notion dashboard's coverage, inbound and scale gaps. A revised C1+C2 package and five decisions."
tags: [red-team, audit, C-track, operant, platform-ops, ventures, knowledge-base, notion, holarchy]
refines: [2026-10-16-platform-ops-capability-system.md, 2026-10-16-ventures-re-architecture.md]
---

# 2026-10-16: red-team audit — holon × operant as one agentic OS

Status: **executed** (an audit; its open items belong in the register). It is read against the
two halves of the architecture pair (`2026-10-16-platform-ops-capability-system.md`, the C-track;
`2026-10-16-ventures-re-architecture.md`) and changes neither until the Chair decides §6.

**Evidence base, measured first-hand today:** the universal repo at `a513f4b`; operant's source
(`crates/operant-{core,os,cli}`) and its `docs/agentic-os/`; the deployed operant binary (built
2026-10-16 17:09, `operant-gateway.service` up since then, `operant doctor` green: clock ticked
61 s ago, read API reachable); the live instance `~/holon` (migrations through `0014`, departments
`executive` + `tools`, 4 employees, 35 runs — **6 of them on the operant driver today**, 0 units,
76 memory items, Notion mirror active with 104 pages); and the organism under `~/.hermes/organism/`.
Each finding says **CONFIRMED** (reproduced from code or live state) or **PLAUSIBLE** (the
mechanism is there, the consequence was not observed).

**Published work lists (same R-numbers, for agents in each repo):** the universal repo's
`docs/design/2026-10-16-capability-layer-audit.md` (scrubbed: kernel and adapter items, the
cross-repo order, the method) and operant's `docs/agentic-os/AUDIT-2026-10-16-capability-layer.md`
(runtime items with acceptance tests). The organism-specific evidence (R-02's browser chain,
R-12's terrain, R-14's legacy KBs) stays here.

## 1. The verdict in five lines

1. The C-track's **shape is right** (the unit manifest is the registry; the brief renders it; a
   department owns it) — but it was designed against the organism's browser chain, and operant
   has since **replaced that chain** with sourcehound (R-02).
2. It assumes three kernel mechanisms that do not behave as written: the pooled render reaches
   only execute/verify (R-01), pooled roots are **writable** and **grade as in-bounds** (R-06),
   and the commands fence is inert unless a department lists commands (R-05).
3. The runtime **ignores the registry**: operant reads no `api_units`/`api_services`, and its
   tool index defers only MCP tools — so "the index" the Chair wants does not see a single
   declared capability (R-04). Observers cannot run any CLI at all (R-03).
4. The single-injector law (C6) is already broken twice inside operant, before any adapter
   documents anything (R-07, R-08).
5. For the ventures, the kernel holds the **lifecycle** well and the **substance** poorly:
   config does not inherit down the department tree (R-13), there is no document KB (R-14), no
   service contract (R-15), and the design skill knows a third of what a complete system needs
   (R-16). The Notion mirror works but covers four tables of a much larger operating surface
   (R-17…R-20).

## 2. Platform-ops as a kernel capability system: the C-track against operant

### R-01 — the capability render skips every stage that chooses a route · CONFIRMED

`holon/capabilities/context.py:246` (`if task_dept and stage in ("plan", "execute", "research",
"shape", "verify")`) sits **inside** `if stage in ("execute", "verify"):` at `context.py:227`. The
pooled-units block therefore renders at execute and verify only; plan, research and shape never
see it. The C-track's §2 row cites this exact block as rendering for all five stages. The only
guard (`tests/test_genome.py:87`) asserts presence for the executor.
**Consequence:** the planner — the stage that picks tools and grades the work — plans
surface-blind, and the executor inherits a plan made without knowing what exists.
**Fix (C2 must do it anyway):** dedent the block; guard test asserting the block at plan and
research.

### R-02 — the browser surface the C-track would declare does not exist; operant replaced it · CONFIRMED

- `browser-fallback.py` is **not on disk** anywhere (`~/.hermes`, `~/.local`, `~/bin`). It is
  named as `~/.local/bin/browser-fallback.py` only in prose: the hermes skill
  `~/.hermes/skills/browser-fallback-chain/SKILL.md` and `platform-infra/AGENTS.md:12`. The same
  skill gives Obscura's port as both 9222 and 9224. (C-G6's registry rot, live today.)
- Operant made **sourcehound the only browser and web engine**: `browser_provider.rs:1-6` ("every
  value lands on the sourcehound browser … over MCP, CDP-capable"), `web_tools.rs:15` (search is
  sourcehound-only), `browser_provider.rs:468` (the `obscura` provider name is retired). The live
  gateway warns `[browser] provider = "obscura" is ignored`. sourcehound carries 25 tool groups
  and 150 tools, cloakctl's stealth profiles among them (58 tools, the "canonical interactive
  surface" per the same hermes skill).
- Two environment names for one CDP endpoint: career's `scripts/apply_job.py` reads
  `OBS_CDP_URL`; operant's `browser_tool.rs:170` reads `BROWSER_CDP_URL`. The `obscura` binary is
  still at `~/.local/bin`.

**Consequence:** a `browser.toml` written to the C-track's spec would point every brief at a
missing CLI, while the body's native, always-loaded `web_*`/browser tools route elsewhere: the
exact wrong-tier picking C-G1 was meant to end.
**Fix:** the browser surface **is sourcehound**: its route is the native tools for operant bodies
(`web_search`/`web_fetch`/`web_scrape`/browser) and `sourcehound <group> …` for CLI harnesses; Obscura
CDP stays as the apply engine's tier, under one variable name. This supersedes the C-track's §1
browser row.

### R-03 — observers cannot run any declared service · CONFIRMED

Operant's observe posture allows no shell: `terminal` is absent from `OBSERVE_ALLOW`
(`operant:crates/operant-os/src/policy.rs:37`) and present in the adapter's denied
`WRITE_TOOLS` (`adapters/operant/install.py:46`). Research, plan, shape and verify all run in
observe. Every `[[services]] command` line — `kosmos …`, career's `kb.py search`, `identity …` —
is unreachable in exactly the stages that research and plan; the observer has only the native
tools (sourcehound `web_*`, AFT readers, file reads).
**Consequence:** the capability block would advertise routes the body is refused at the first
call, and every refusal becomes a blocker (CONTRACT §10): a self-inflicted rework loop.
**Fix:** a service declares its `effect` (`read` | `write`); the block renders per posture
(observe shows only routes the harness can take there); and read services become callable
tools in observe (R-04). Unrestricted `terminal` for observers is not the fix.

### R-04 — operant never reads the registry, and its index cannot see it · CONFIRMED

No operant source reads `api_units` or `api_services` (grep across `crates/`: 0 hits).
`api_services` (`holon/migrations/work/0013_genome_units.sql`) has no pool edge either, so a runtime
could not tell which department may use what. Operant's progressive disclosure
(`tool_search.rs:67`, `is_deferrable`) defers only `mcp_*` tools; native tools are always eager.
**Consequence:** the "index" the Chair asked for — `tool_search` / `tool_describe` / deferred
materialisation, the mechanism already built to make *many* tools cheap — indexes nothing the
organization declares. The brief's prose block is the only path, and it is static, unbudgeted
by the runtime, and invisible to `tool_search`.
**Fix — the native tooling upgrade (operant side, after C1):** a view `api_pool(unit, dept)`;
operant registers each service the run's department pools as a **deferred tool**
(`svc_<unit>_<service>`, schema from `accepts`/`returns`/`args`), executed as argv through the
existing commands fence, allowed in observe when `effect = "read"`. The kernel's brief keeps
a one-line-per-surface summary (sourcehound's tier-2 shape: name, note, health); the full
schemas live in the runtime's index. **That is the single-injector law stated correctly:**
the kernel declares; the runtime indexes what the kernel declared and nothing else (C6 revised).

### R-05 — the hard half of entitlement (C5) is inert · CONFIRMED

`holon_policy_commands` returns `None` for an empty list
(`operant:crates/operant-core/src/org/mod.rs:106`: "ungoverned, not deny-all"); the live
`holon.toml` sets no `[scope]` commands, so on the live box every command is allowed. Pooled
services' entry points never join `policy.json` (`holon/execution/policy.py:39` reads only
`[scope]`; `service.py:1685` merges pooled *roots*, not commands). So the C-track's "the runbook
grants each consuming dept the surface's CLI via `[scope.dept] commands`" is a second, hand-kept
copy of the manifest — and the day a department does list commands, its pooled CLIs are refused.
**Fix:** derive policy `commands` from the pooled services' binaries; lint warns a department
that pools units but lists no commands (its fence is open).

### R-06 — pooled roots are writable and grade as in-bounds: the segregation law fails in mechanism · CONFIRMED

GENOME §14: pooling grants reads, "never the pen". Mechanically:
- `Kernel.scope()` adds pooled roots to `roots` (`service.py:1685`);
- grading counts writes inside `roots` as in-bounds (`holon/execution/grading.py:59`), so a
  career plan writing into identity-core's directory escapes the G3 floor (and, in a `[pilot]`
  department, the G4 floor that depends on it);
- `policy.json` carries the same `roots`, and operant's write fence treats roots as **writable**
  (`operant:crates/operant-core/src/tools/file_tools.rs:183`).

**Consequence:** "a venture never owns a shared surface" is enforced only by the kernel's
after-the-fact fingerprints, if at all.
**Fix:** split reach into `roots` (read) and `write_roots` (workdir, the department's own
`[scope.dept]` roots, the plan's `writes`); pooled roots are read-only in policy and in grading,
and a write into one floors at G3 ("writing to a unit is work for its own owner"). Guard test +
ledger row.

### R-07 — operant injects workspace context the kernel never chose · CONFIRMED

Every turn's volatile suffix carries `<workspace_context>`
(`operant:crates/operant-core/src/agent/run.rs:2412`): files from `~/.config/operant/context/`
(the operator's global context, resolved through `dirs::config_dir()`, **not** under the run's
`HERMES_HOME`) and the first `AGENTS.md`-class file found walking up from the workdir
(`context_files.rs:135`). Nothing gates it on `is_holon_run`. All ten venture pools carry a
legacy `AGENTS.md`.
**Consequence:** at migration, a career body working in its pool receives the hermes-era
protocol (browser-fallback.py, cron rules, AD/RG references) beside the kernel's brief: two
instruction sets, one of them stale. This is the C-G7 double injection, already live, from the
runtime rather than an adapter.
**Fix (operant):** in a Holon run, load no global context, and workspace files only when the
kernel lists them in `brief.json`. The CONTRACT clause (C6) names the runtime, not only adapters.

### R-08 — the adapter's memory isolation no longer applies · CONFIRMED (the pin) / PLAUSIBLE (the leak)

The posture configs pin `[memory] provider = "builtin"` (`adapters/operant/install.py:113`); the
deployed operant ignores the key ("memory-wire is the only memory engine now",
`memory_provider.rs:353-366`, logged by the live gateway). The per-turn retain
(`run.rs:1528`, `submit_sync_turn`) has no Holon-run gate, and invariant 4's test
(`operant-core/tests/holon_capture.rs`) covers the tool writes, not this path. Production code
never opens a `Seat` bank (only tests do), so every Holon employee would share one bank.
**Not observed:** the operator's personal `~/.operant/memory_wire.sqlite` holds no Holon content
(0 rows matching `tsk_` / `HOLON_` / "result envelope"), and the adapter home holds no store,
after today's 6 operant runs. Where those runs' memory went was not traced.
**Fix:** in a Holon run operant opens no memory provider (the kernel's bundle is the memory
injector) or a `Seat{HOLON_EMPLOYEE_ID}` bank; the installer drops the dead key; a test pins it.

### R-09 — two versions of the same skill in one prompt · CONFIRMED

The installer exports skills once, organisation-wide (`install.py:207`, no `--dept`), into the
one `HERMES_HOME` every department shares; operant lists them in its frozen prefix. Department
forks and playbooks reach a body only through `BRIEF.md`. A tailored role skill therefore
appears twice — the standard version in operant's skill list, the department's in the brief.
**Fix:** the supervisor (or the driver) exports the run's department layer into the run
directory and points `[skills] root_dir` there; or operant hides its skill list in Holon runs
and the brief stays the only render.

### R-10 — the continual-harness lane would read the operator's store · PLAUSIBLE (off by default)

`injection_block` (`tools/kernel/mod.rs`) injects `[continual harness]` lessons whenever
`[kernel] enabled`, from a `state_dir` that defaults to `~/.local/share/operant/kernel/harness`
— outside `HERMES_HOME`. Default off; the posture configs do not pin it.
**Fix:** the installer writes `[kernel] enabled = false`.

### R-11 — two status truths · CONFIRMED

The overlay register (`2026-10-16-remaining-implementation-gaps.md`) says org mode waits on
W1–W4, W5 notify is open, and `~/holon` runs pre-wave code. Measured today: `operant.toml` says
"org mode ON 2026-10-16"; operant's `2026-10-18-REMAINING-GAPS.md` closes G2 (notify), G3 and G10; the
live database is at migration `0014` (current); 6 runs used the operant driver. The adapter's
`README.md:48` and `driver.toml:8` still describe the MCP mount on both postures and
policy enforcement as "a planned phase" (superseded by `38ae9e9` and operant W3).
**Fix:** the overlay register is the one place open work lives (README rule); operant's
`2026-10-18-REMAINING-GAPS.md` links it instead of keeping a parallel closure log; the adapter README is
corrected at the next installer change.

## 3. Can the kernel hold the ventures? (the five areas named by the Chair)

### R-12 — the organism's real terrain, measured

13,365 Markdown files, 2,259 YAML files, 9 SQLite files (8 in pools, plus cortex's
`ad_rg_index.db`) across the nine foundations and ten ventures; career-pipeline alone holds 4,470
MD files, 66 scripts, 7 sub-systems (`applications`, `campaigns`, `content-campaigns`, `identity`,
`identity-core`, `role-market-intelligence`, `strategy`) and 16 cron protocols. Only `arch`,
`living-arch`, `qf` and `qf-sync` are on `PATH`; `kosmos` lives at
`foundations/research-vault/bin/kosmos` and is not on it.

### R-13 — holarchic scaling: the department tree carries no configuration · CONFIRMED

`departments.parent_id` exists and is used for escalation only (`holon/execution/org.py:135`).
Every config stanza — `[scope.dept]`, pooling, `[secrets.dept]`, `[budget.dept]`,
`[autonomy.dept]`, `[checks.dept]`, `[smoke.dept]` — is keyed by a flat slug with no inheritance,
and memory scopes run `emp → dept → org`, skipping ancestor departments (`context.py` scope list;
promotion lifts dept → org).
**Consequence:** a venture's sub-systems have two homes, both poor: task classes inside the
venture (no own reach, budget or checks) or a child department that must copy every stanza
and whose lessons skip the venture.
**Fix (decide, then small):** (a) the ancestor chain inherits additive stanzas (roots, pooling,
checks, secrets refs) and joins the memory scope list — lists add, never replace, the rule
`[scope]` already uses; and (b) an engine with data and a CLI but no lifecycle of its own
(career's `applications`, arch's `engagement-engine`) is a **unit owned by the venture**
(`owner = "career"` in the manifest), not a department. `owner` is the same field the C-track
needs for platform-ops' surfaces (C4).

### R-14 — knowledge base: atomic memory only, no document layer · CONFIRMED

- Holon's KB is `memory.db`: atomic items (fact, decision, lesson …) with FTS, dedup and
  promotion. Research `terrain` lands there as items. There is no document, no collection and no
  lifecycle (a lead moving new → applied → closed).
- The organism's real KB is **Markdown items with frontmatter** plus per-venture domain CLIs
  (career's `kb.py`: create, upsert, promote, link, sanitize, reindex, search, find-similar,
  dedup-check, run-log … 20 verbs) over a shared `kb_base.py` that lives **outside every pool**
  (`~/.hermes/research/`, imported through `sys.path`, requires PyYAML). Career's and freelance's
  `kb.sqlite` files have **zero tables**. Flight-ledger's `logbook.db` has **zero entries**, yet the
  kernel's `_logbook` (`context.py:71`) searches `home.logbook_db` in every brief.
- After a straight migration, knowledge would sit in five places: memory.db, MD under scope
  roots (reachable only by file search, unindexed, not promoted), legacy SQLite, operant's
  memory-wire (R-08), and Notion.

**Proposal — K-KB, a `kb` capability (the stdlib, one-writer version of kb_base):**
Markdown with frontmatter stays the source of truth (agents and the Chair can read and diff it);
a derived `kb.db` (FTS5 + links + status) is rebuilt from it by `holon kb sync`, exactly as
`genome sync` rebuilds units — the files are the source, the database is a view, one writer.
Collections are declared in the owning unit's manifest with a status vocabulary (the
lifecycle); `holon kb search|get|upsert|promote|link` gives every venture the same 6 verbs
instead of one `kb.py` each; the context bundle adds a "Knowledge base" section beside
"Relevant memory"; memory items may cite a KB document; the native tool `holon_kb_search` puts
it in the runtime's index. The frontmatter parser is stdlib (law 1: no PyYAML). The empty
`logbook.db` is either imported into it or dropped from the bundle.

### R-15 — system-specific CLIs: declared verbatim, with no contract · CONFIRMED

A unit service is `command`, `accepts`, `returns` — free text. Nothing says whether a call
reads or writes, how arguments are shaped, what it prints, or how an agent learns its verbs
without running `--help` (the discovery cost the Chair wants gone).
**Fix:** four optional manifest fields per service — `effect` (read | write), `args` (a small
schema rendered into the runtime's tool schema, R-04), `output` (toon | json | text), `note`
(the C-track's prefer-this-route) — with lint requiring `effect` and `note` on surface
services. Writes keep `msg request --service` (K-5). A kernel dispatcher (`holon svc …`) is
skipped until a harness without native tools needs one.

### R-16 — the system-design skill covers a third of a complete system · CONFIRMED

`holon/skills/holon-system-design/SKILL.md` has eight steps: requirements, profile, create, job
descriptions, hire, check roles, fork skills, autonomy. It says nothing about the elements the
ventures plan depends on: `[scope]` (roots, commands, act_commands), unit manifests and pooling,
the segregation law, `[secrets.dept]`, `[checks.dept]` / `[smoke.dept]`, routine import with
lanes and the disabled-by-default rule (I1), playbooks per task class and their rubrics,
objectives, `[budget.dept]`, delivery channels, cold-at-activation. There is no skill for
routines, for authoring units, for platform-ops' job (C4), or for migrating a legacy pool.
**Fix:** the skill becomes the checklist of a complete system, each step pointing to a
reference: `references/genome-units.md` (units, pooling, owner, surfaces, the segregation law),
`references/routines-and-lanes.md` (classify, lanes, I1, staggering, decommission rule),
`references/reach-secrets-checks.md`, `references/migration.md` (the re-architecture §3 decision
table: department, unit, check or data); a `holon-platform-ops` role skill at wave 2. The
machine half is `holon lint`'s existing `ref.smoke`-style warnings extended to "a department with
pooled units and no commands", "a task class with no playbook", "an outside-reach routine
enabled in a `[pilot]` department".

## 4. The Notion dashboard

What works (verified live, and on 2026-10-13): four data sources — Departments, Employees, Work,
Runs — with dual relations, vocab-built selects, a 20 s push, webhooks on a secret path, a
1-minute poll, a 15-minute reconcile, hourly verify, self-repairing schema. `holon-notion.service`
and its tunnel are active; the last push was 12:04Z today.

### R-17 — coverage: four tables of the operating surface · CONFIRMED

Not in Notion: approvals as a queue (only a filter the Chair builds by hand), incidents,
routines and schedules (including the disabled imports I1 leaves for the Chair to activate),
playbooks with their versions and scores, objectives and key results, metrics, memory and the
KB, units / services / surface health, messages and proposals, budget and usage rollups, the
doctor and smoke state. `UNMIRRORED` (`holon_notion.py:364`) records "the goals tree is not
mirrored".

### R-18 — inbound: three actions · CONFIRMED

The Chair can approve/reject, answer, and file new work. The ventures plan needs more Chair
actions than that: activate or pause a routine (every outside-reach import lands disabled), pause
or resume an employee, regrade, acknowledge an incident, accept or reject a department proposal.
All of these are CLI-only or chat-only today.

### R-19 — scale arrives with wave 1, not later · PLAUSIBLE (estimate)

Every work node, stage and run is a page, and the reconcile scans all of them. With ~30 active
crons, each firing creating one work node, one to four stages and one or more runs, the mirror
gains on the order of 100–150 pages a day (~3–4.5k a month) before any full-lane work: an
estimate from the lane shapes, not a measurement. The register's G2 ("measure first") would
measure it during the pilot week; the window should land before wave 2 multiplies it.

### R-20 — two receivers, one pusher · CONFIRMED

Operant's gateway can host the Notion webhook (`gateway_runner.rs:1716`, `holon_notion_hook`),
but Notion's subscription points at the `holon-notion` tunnel, and the **push** loop lives only
in the Python daemon. W5's acceptance "`holon-notion.service` unnecessary" cannot be met as
designed: retiring the daemon would stop the outbound mirror. Either operant's clock also runs
`holon_notion.py push` (a `no_agent` job beside `holon tick`), or the daemon stays and the gateway
arm is removed — one receiver, not two.

### What a complete dashboard needs (in order of value per effort)

1. **A "What needs you" page** rendered from `holon status` on every push: the queue, failures,
   incidents, routines waiting for activation. One page, no new data source, no hand-built views.
2. **Three data sources:** Routines (the schedule, lane, enabled ☑ as a Chair input: activation
   becomes a checkbox), Incidents (acknowledge as a Chair input), Capabilities (units and surfaces
   with health from C3 — the platform-ops view).
3. **The window** (R-19) before wave 2.
4. Playbooks/objectives and the KB (R-14) once they carry real data.

## 5. The revised C1+C2 package (what "pre-pilot" should contain)

```
kernel (universal repo, one package, tests first)
  R-01  pooled render at plan/research/shape (dedent) ...................... guard test
  R-06  roots split read/write; pooled roots read-only; grading floors them  guard test + ledger
  R-05  policy commands derived from pooled services; lint for open fences
  C1    manifest fields: category="surface", pool_of=["*"], owner, and per service
        effect, note, args, output, health (lint: surface services need effect+note)
  C2    "Capabilities" block per posture (observe shows only reachable routes), no-dept tasks
        get ["*"] surfaces; api_pool view
  R-02  browser.toml = sourcehound (native-tool route + CLI route), not browser-fallback.py
operant (their repo, after the kernel lands)
  R-04  register pooled services as deferred tools from api_services + api_pool
  R-07  no global/workspace context in a Holon run unless brief.json lists it
  R-08  no personal memory provider in a Holon run (or a Seat bank); test the sync path
  R-09  skills from the run's department layer, or no skill list in Holon runs
adapter
  R-08/R-10 drop the dead memory key, pin [kernel] enabled=false; README truth (R-11)
```

Then, before wave 2: R-13 (decide inheritance and `owner`), R-14 (K-KB), R-15 (service
contract — mostly landed by C1's fields), R-16 (skill + lint), R-17/R-18 items 1–2, R-20.

## 6. Decisions requested (Chair)

1. **Adopt the revised C1+C2 package** (§5) as the pre-pilot kernel work, superseding the
   C-track's §1 browser row and its C5/C6 wording (C5's hard half derives from the manifest;
   C6 binds the runtime too).
2. **The runtime indexes the registry** (R-04): declared services become operant's deferred
   tools, the brief keeps a one-line summary. Or keep the prose block as the only path.
3. **Holarchy** (R-13): additive inheritance down the department tree, and venture-owned units
   for engines without their own lifecycle — or flat departments with copied stanzas.
4. **K-KB** (R-14): Markdown as source, a derived `kb.db`, collections declared in manifests —
   or keep the legacy KBs as data under roots, readable by file search only.
5. **Notion** (§4): the "What needs you" page and the Routines / Incidents / Capabilities data
   sources before the pilot week; one webhook receiver (R-20).
