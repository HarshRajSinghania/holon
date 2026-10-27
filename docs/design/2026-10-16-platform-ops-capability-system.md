---
status: proposed
date: 2026-10-16
description: "The capability half of the architecture pair — the C-track: platform-ops as a first-class capability system. Surfaces (browser chain, MCP, channels, tunnels) as unit manifests (C1), the token-budgeted capability block in every entitled brief (C2), health probes with (down) marking (C3), platform-ops as the owning department (C4), entitlement without new enforcement (C5), the single-injector law (C6). C1+C2 is the next kernel package, pre-pilot."
tags: [platform-ops, capability-system, C-track, surfaces, platform-infra]
pair: 2026-10-16-ventures-re-architecture.md
---

# 2026-10-16: platform-ops as a first-class capability system — the gaps and the plan

Status: **proposed** (a plan for the Chair). This record and `2026-10-16-ventures-re-architecture.md`
(revised the same day) are the **two halves of one architecture**: that record is the ventures
hierarchy — business departments over a segregated capability layer, with the segregation law
(ventures consume capabilities; capabilities never pursue a venture; a venture never owns a
shared surface); this record is the capability layer itself — the C-track below. It supersedes
the re-architecture's first-cut placement of platform-infra as a plain wave-2 department: it is
that AND the kernel-level capability layer beneath it. Evidence: surveys of
`~/.hermes/organism/foundations/platform-infra/` (the `_org.yaml`
services, the 8 organs, the browser chain, the ops crons) and of the kernel's capability-exposure
machinery at `0106308` (briefs, context bundle, units/pooling, policy.json, adapters), 2026-10-16.

The Chair's framing: the agentic-OS does not operate in isolation — it provides surface area
(browser, MCP, CLI tools, channels). **platform-ops is the system that tells every agent what
surfaces exist, which ones THIS agent may use, and which route to prefer — token-efficiently —
so no session is wasted searching the filesystem for viable options or picking wrong tools.**

## 1. The surface, as measured (what platform-infra actually provides)

`platform-infra` (foundations, HI- prefix) — 8 organs, 15 ops crons, 21 scripts. What it
exposes to *consumers*:

|Surface|How a consumer reaches it|State|
|---|---|---|
|**The browser chain** — tiered fallback behind ONE CLI: `browser-fallback.py health\|scrape\|screenshot\|fetch\|cdp` (deployed `~/.local/bin/`)|Tier 3: `mcporter call browseros.scrape url=` → BrowserOS behind a Cloudflare tunnel (VPS-allowlisted). Tier 4: local Obscura CDP (`obscura serve -p 9222`, pinned via `OBS_CDP_URL=http://127.0.0.1:9222` — the var career's apply engine already reads). BrowseFleet decommissioned HI-AD-074; Obscura resurrected per HI-RG-027.|live; a `health` command exists per tier|
|**Cloudflare tunnel** (`cloudflared` at `/usr/local/bin`)|host binary + `cloudflare-tunnel` skill; declared service: accepts `tunnel_config, dns_record, auth_token`, returns `tunnel_status, dns_status, public_url`|live (the BrowserOS route depends on it)|
|**Notion bridge** — `ntn` CLI + `NOTION_API_TOKEN`|declared service (`query, page_op` → `page_json`) but **deprecated as canonical source** (HI-RG-026: logbook-sync bridge only)|legacy bridge|
|**Comms/gateway** (communication organ)|the hermes gateway: Telegram delivery threads, WA transport (saathi_send)|live; superseded at operant W5/phase F|
|**MCP integration** (organ)|MCP server mounts per harness|live|
|**infra-utilities**|`sys.path.insert(…, platform-infra/scripts)` — 21 shared scripts as a library|live|
|**smoke-testing organ**|the smoke gates the fleet runs|live|
|**vps-operations**|the ops fleet's crons: tunnels, browser health, gateway, smoke|the 15 crons|

**Precedent inside the organism**: `cron-management` **injects AXE-awareness blocks into cron
jobs** (HI-AD-040) — the organism already knew agents need generated capability context; the
execution-error feedback loop (`axe_feedback.py`, AD-048) fed back into it. And the
`_org.yaml` itself is honest about the gap: its `directories` contract omits `scripts/`
(the declared `infra-utilities` entry point) — the registry had already begun to drift from
the surface.

## 2. What the kernel already has (measured, with the seams)

|Mechanism|What it does today|File|
|---|---|---|
|**U1 unit manifests**|`$HOLON_HOME/genome/units/<slug>.toml`: charter, category, tier, roots, pool_of, consumed, `[[services]]` (id, command, accepts, returns); `genome sync` → `units`/`unit_services`/`unit_edges` + `api_services` view; lint `bind.service`/`bind.pool`|`holon/genome/units.py`|
|**U2 pooling render**|for a department task at plan/execute/research/shape/verify: a "**Pooled units (declared capabilities…)**" block — charter + one line per service (`slug:service — command (accepts; returns)`); pooled roots join the dept reach automatically|`holon/capabilities/context.py:246-255`, `service.py:1684-1685`|
|**"Your reach"** brief section|the dept's granted roots + commands, in prose, with "anything else is outside scope — say so"|`briefs.py:68-74`|
|**policy.json**|machine reach per run: roots, writes, commands, budget; one definition rendered three ways|`policy.py`|
|**Budgeted context bundle**|sections in priority order within `budget_chars` (24k), truncation logged, "**Context gaps**" reported to the agent — degradation is visible, never silent|`context.py:330-351`|
|**[smoke]/[checks.dept]**|per-dept health commands, cached every_min, critical failures block the dept's agents|GENOME §13|
|**Adapters**|per-harness tool reality (allowlists, MCP mounts, forbidden_paths, browser tools)|`adapters/*/`|

## 3. The gaps (what platform-ops-as-first-class is missing)

|#|Gap|Evidence|Cost if unfixed|
|---|---|---|---|
|**C-G1**|**Harness-level surfaces have no registry home.** Units manifests model foundation CLIs; nothing declares the browser chain, MCP mounts, channels, tunnels — the surfaces every consumer actually needs. The `note`-style routing knowledge ("use `browser-fallback scrape`, never raw curl; Obscura first, tunnel fallback") lives in skills and AD prose, not in the registry that renders into briefs.|no `category = "surface"` unit exists; the browser chain is documented in pool prose + `OBS_CDP_URL` env folklore|agents re-discover the surface every session; wrong-tier usage (raw curl where the fallback chain belongs) burns sessions|
|**C-G2**|**No "prefer this route" field.** The service line says what exists, never which to prefer or when — the exact anti-waste guidance the Chair asked for.|`unit_services` columns: service, command, accepts, returns — nothing else|the agent knows kosmos exists but not that it beats ad-hoc web_search for research|
|**C-G3**|**No surface health in the run's context.** Smoke exists per dept; a run never learns "the tunnel is down, Tier 3 unavailable" — it discovers by failure mid-execute.|`browser-fallback.py health` exists but only the ops fleet calls it|failed executes, rework, incidents — the expensive kind of discovery|
|**C-G4**|**Org-level work sees nothing.** The pooled render is dept-gated (`task_dept` required) — executive/Chair-side tasks (research, audit) get no capability block at all.|`context.py:246` `if task_dept and …`|executive agents work surface-blind|
|**C-G5**|**Entitlement is implicit at the harness layer.** If an adapter mounts a tool, every run of that harness gets it; no per-department binding of surfaces (which dept may use the browser, which may send) except `[scope] commands/roots`.|adapters mount tools globally; policy.json has no tool concept|a brand agent can reach a surface reserved for career|
|**C-G6**|**Nobody owns the surface manifests' upkeep + health.** Registry drift already happened in the organism (`scripts/` missing from its own `_org.yaml`); Holon has no department whose job is the capability layer's truth.|the platform-infra `_org.yaml` drift; Holon has no `platform-ops` dept|the registry rots exactly as the organism's did|
|**C-G7**|**Double-injection risk.** The organism's AXE-awareness blocks were injected by cron-management into job protocols; in Holon the context bundle is the single injector — adapters that also inject capability docs would double the tokens and fork the truth.|HI-AD-040 precedent; CONTRACT has no "the bundle is the only capability surface" clause|duplicated/conflicting guidance|

## 4. The plan — the C-track (boring: the registry primitive IS the unit manifest)

**C1 — surface units.** A surface is declared exactly like a foundation, as a unit manifest with
`category = "surface"`, `pool_of = ["career", "freelance", …]` (or `["*"]` = every brief, the
org-wide surfaces: browser, comms), and one new manifest field per service:
`note = "when to prefer this route"` (C-G1, C-G2). Surfaces declare no `roots` unless they
truly own a directory. First manifests to write at adoption: `browser.toml` (the fallback chain,
entry `browser-fallback.py`, note naming the tier order + `health`), `mcp.toml` (the mounts,
per harness), `channels.toml` (delivery routes — closing I2's config gap in the same shape),
`tunnel.toml`. `genome sync` needs no change; lint learns `bind.pool` accepts `*`.

**C2 — the capability block.** Rename/extend the pooled-units render to
"**Capabilities (what this run may use — prefer the named route)**": surfaces first, then pooled
units, one line per service + the note; render for `["*"]` surfaces even when the task has no
department (C-G4); keep the stage gating (plan/execute/research/shape/verify — the stages that
choose and use tools). It rides the existing budget-priority machinery — degradation stays
visible. Kernel package: manifest field + render + tests + GENOME §6 rows. Small.

**C3 — health in the block.** A surface manifest may declare `health = "<command>"`;
`[smoke.dept.platform-ops]` runs each surface's health on the fleet's interval. Doctor reports
`surface.<slug> down — pooled by: <depts>`. The capability block marks a surface `(down)` from
the last smoke result — a planning agent routes around it before spending anything (C-G3).

**C4 — the platform-ops department (wave 2).** The operator of the layer: the ops-fleet
routines (tunnels, browser maintenance, gateway health) as its scripts/checks crons — minus
cron-management's Holson-superseded parts (schedules); `platform:surface-change` as its task
class for proposing manifest edits through the normal pipeline (the manifest is Chair-owned
config; the department proposes, the Chair or delegated authority applies via `genome sync`);
its smoke checks are C3's probes. This is the re-architecture's wave-2 platform-ops port, now
with a defined job: own the capability layer's truth and liveness.

**C5 — entitlement without new enforcement.** Discovery is entitlement: the block renders only
what the dept pools (C-G5's soft half). Hard enforcement stays boring and existing: the
runbook grants each consuming dept the surface's CLI via `[scope.dept.<slug>] commands`
(policy.json already names commands per run; adapters keep their allowlists). No new kernel
enforcement surface is built.

**C6 — the single-injector law.** CONTRACT gains one sentence: the kernel's context bundle is
the only capability guidance a harness may add to a run; adapters mount tools but do not
document them into the run (C-G7). Adapter READMEs get the line at port time.

## 5. Sequencing

```
pre-pilot (with wave 0)   C1+C2 (one small kernel package) — career's pilot NEEDS the browser
                          surface block the day its apply engine runs; channels.toml rides I2
wave 2 (ventures)         C4: the platform-ops department + its 15-cron fleet port
                          C3: surface health probes + doctor line
at adapter installer runs C6: the single-injector clause per harness README
later                     C5 hardening only if a real breach demands it (nothing speculative)
```

Sizes: C1+C2 ≈ a manifest field, a render change, GENOME §6, tests — the H-14 scale. C3 ≈ a
smoke convention + a doctor line. C4 is the wave-2 department port (already sequenced). Nothing
here waits on operant; the browser surface's Tier-3 route's gateway/tunnel delivery interacts
with W5 only for channels.

## 6. Decision requested

Adopt the C-track: surfaces as unit manifests (C1/C2 pre-pilot), platform-ops as the owning
department at wave 2 (C4), health probes (C3), the single-injector law (C6). One open naming
call: `category = "surface"` vs folding surfaces into existing units by pool naming — I
recommend the explicit category (lint can then require a note on surface services).
