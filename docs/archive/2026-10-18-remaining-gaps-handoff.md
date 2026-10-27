---
status: superseded
date: 2026-10-18
description: "The handoff for a fresh agent: the complete remaining-gaps outline with current state, the one unblocked build item (operant's deferred-tool index), the Chair-gated items, the ops queue, the import waves, and every hazard and law a new agent must hold. Verify every claim against the pointers before acting."
tags: [handoff, gaps, execution, ventures-import]
refines: [2026-10-17-ventures-import-ontology.md, 2026-10-16-remaining-implementation-gaps.md]
superseded-by: 2026-10-20-the-a-side-program-boundary-and-solutions.md
---

> **Superseded 2026-10-20** by `2026-10-20-the-a-side-program-boundary-and-solutions.md`.
> Its §0 states the two-stack boundary correctly and is kept for that. But its §3.4 mixes this
> program's ops queue with the other program's, and its §3.5 is entirely about the import waves —
> so a fresh agent reading it would conclude the program *is* the ventures migration. That is the
> conflation the superseding record removes. Read the new record for the A-side scope and gaps.

# 2026-10-18: the remaining-gaps handoff — for a fresh agent

You are a new agent taking over an in-flight program. This record is your map: what is
finished, what remains, what is gated on the Chair, and what will bite you if you don't read
it. **Verify, don't trust**: every claim below names its evidence (a commit, a file, a command).
Where this record and the live state disagree, the live state wins — probe it, then fix this
record.

## 0. The program in one paragraph

Two infrastructures exist. **A — the Holon agentic-OS × Operant stack**: the `holon` kernel
(universal repo `~/Documents/github/my-projects/holon` + this private overlay), Operant as its
body, the workstation instance `~/holon`, the Notion mirror. **B — the organism × ZeroClaw ×
Paperclip stack**: the live production system running the Chair's ventures (`~/.hermes/organism/`
+ the VPS; Paperclip is the ONLY live scheduler). **Never conflate them.** The only bridge is
the ventures import: B's venture pools move into A wave by wave, after the Chair's decisions,
one scheduler per pool at cutover. Your job is to finish A's side of that bridge — everything
buildable without a ruling is built; what remains is one operant iteration, four Chair-gated
kernel builds, the Chair's decision queue, an ops queue, and the import waves themselves.

## 1. Read this first (in order)

1. The universal repo's `AGENTS.md` — the map, the laws lint enforces, the regression ledger
   (every row names a guard test; never delete one).
2. `docs/INTENT.md`, `docs/GENOME.md` (§14 = unit manifests incl. surfaces), `docs/CONTRACT.md`
   (§9) — in the universal repo.
3. `docs/STATUS.md` (this overlay) — deployments and the dated log.
4. `docs/design/2026-10-17-ventures-import-ontology.md` — the implementation ontology: entity
   tree, mapping table, cutover state machine, build order, duplication audit (§9).
5. `TODO.md` (universal) — the register: one row per work item, status+verdict, supervised
   transitions via `scripts/genome status`.
6. `docs/design/2026-10-16-agentic-os-red-team-audit.md` (R-series definitions) and
   `2026-10-16-capability-layer-audit.md` (§1 executed; §2 design items pending).
7. `docs/decisions/` (AD-NNN) and `PERSONAL.md` (the sync and publish runbooks).

## 2. Current state (probe these, don't take my word)

|What|State at handoff|Verify with|
|---|---|---|
|Universal repo|tip `7839681` on `main` (red-team 2026-10-18: was `10b3f0b`; `77116ff` and `7839681` follow it), pushed; **361 tests OK, `lint --strict` 0 errors / 0 warnings** (re-run 2026-10-18)|`python3 -m unittest discover -s tests -t .` and `python3 -m holon --home "$(mktemp -d)" lint --strict` in the universal checkout|
|Kernel API|api_version 4, 15 work migrations; `api_pool` view live; v4 package shipped at `4208c29` + follow-ons|`sqlite3 :memory: '.read holon/migrations/work/0015_capability_surfaces.sql'`; fresh-instance probe|
|Live instance `~/holon`|current code; org mode on; **the first live surface is synced** (`genome/units/browser.toml`: unit `browser`, owner `executive`, services `sourcehound` (read) + `browseros-neo` (write), pool edge `browser→*`); the Capabilities block renders in plan-stage briefs and the write route is withheld from observe (per-posture filter verified live)|`~/bin/holon --home ~/holon status`; read-only sqlite probes only (`mode=ro`)|
|Live-instance red (KNOWN, escalated)|`memory/0003` was edited after being applied (instance checksum `d3d6c14…` vs shipped `d747bd0…`) — lint row stays red **until the Chair rules** (overlay register item, escalation `a35b073`). Do NOT fix, bless, or edit the migration|`~/bin/holon --home ~/holon lint` shows exactly this one error|
|Live-instance red (ops)|the workstation free-stack gateway (`127.0.0.1:20129`) is down → the org model-gateway smoke fails → **no A-side run can start**; 3 stale executive incidents wait behind it; heartbeat is off|`~/bin/holon --home ~/holon doctor`|
|Operant|iter-907 `dc0be01b` (an ancestor of `origin/main`; red-team 2026-10-18: `origin/main` is now `be6d6f21`, iter-926, by the peer "Sisyphus"): the read-API client (`api_units`+`owner`, `api_services`+v4 contract, `api_pool` edges, mini-v4-kernel guard). `KNOWN_API_VERSIONS` includes "4" (iter-885). A peer session ("Sisyphus") works the SAME tree and pushes ungate-checked — `org_reason` tests fail on `main` **pre-existing**, flagged in iter-907's message|`git -C ~/Documents/github/my-projects/agentic-harness/operant fetch origin && git log --oneline -5 origin/main`; `cargo test` (with the env below)|
|This overlay|`personal` pushed; `main` mirrors universal (ff-only)|`git -C ../holon-personal status -sb`|
|B (do not touch its live set)|Paperclip on the VPS: 68 venture routines, 34 live (arch 4, career 14, freelance 15 + the lane watcher); delivery via the bot's DM lanes; hermes-cron is dead|`~/.hermes/organism/ventures/PAPERCLIP-OPERATIONS.md`|

## 3. The remaining work, in execution order

### 3.1 H2 — the ONE unblocked build item (yours to do first)

**The operant deferred-tool index** (R-04's second half; the register's H2 is `in-progress`).
The client half is shipped; build the index on top of it:

- Register each pooled service from `api_pool`/`api_services` as a **deferred tool**
  `svc_<unit>_<service>`; schema from the v4 contract (`args`/`output`, falling back to
  `accepts`/`returns`); activation on demand; execution routed through the commands fence.
- `effect = "read"` services must be callable from the **observe posture** (plan/research/
  shape/verify) — that is the point: today the observe posture can run no declared CLI.
- The brief's Capabilities block stays a one-line summary; the index is the runtime's half.
- Existing machinery (red-team 2026-10-18, not in the original spec): operant already has deferred-tool
  plumbing: `operant-core/src/tools/tool_search.rs` and `tool_search/deferred.rs` (turn-driven
  re-injection), and `operant-tools/src/mcp_deferred.rs` and `operant-tools/src/tool_search.rs`
  (model-driven `tool_search` bridge for `mcp_*` tools). Extend or reuse these; a second, parallel
  mechanism is the duplication this program's ontology §9 warns against. `api.rs` only mentions the
  future index in comments (`crates/operant-os/src/api.rs:352,371,453`); nothing registers `svc_*` yet.
- Spec sources: `2026-10-16-agentic-os-red-team-audit.md` (R-04),
  `2026-10-16-capability-layer-audit.md` §3 step 3, the operant boundary doc
  (`docs/agentic-os/`), and iter-907's client layer.
- **Peer protocol (mandatory)**: `git fetch origin` first; expect the peer's dirty
  `Cargo.lock`/untracked dirs — never clean or commit them; run the suite at tip; if
  `org_reason` failures were retired in `a26b1f36` (iter-908); if a different suite fails, confirm
  it fails on `main` *without* your change before proceeding, and flag it in your commit message. Build env: `LIBCLANG_PATH=<repo>/local/libclang`,
  `ORT_LIB_LOCATION=$operant-lib` (operator-context.md §Paths). Test+build gate, push, deploy per the
  iteration protocol.

### 3.2 Chair-gated kernel builds (blocked until the named ruling lands)

|Register id|Work|Ruling|Design source|
|---|---|---|---|
|H3|R-13 holarchic config: additive inheritance down the department tree (roots, pooling, checks, secrets refs — lists add, never replace; ancestors join the memory scope); venture-owned units via `owner`|**D8**|audit §2; ontology §2|
|H4|R-14 the document KB: markdown-with-frontmatter source, derived `kb.db` (FTS, links, status), `holon kb` verbs, a bundle section, manifest-declared collections; supersedes the script-lane `kb.py` bridge at wave 2|**D9**|`kb-integration-design`; `2026-10-17-kb-architecture-audit.md`|
|H5|R-16 the complete system-design skill (units/pooling, reach, routines, playbooks; two lint warnings)|Chair|audit §2|
|H6|N-1 Notion surfaces: "What needs you" page from `holon status`; Routines (enable checkbox — `schedule enable/disable` already exist, no new verb), Incidents (ack), Capabilities; the G2 mirror window before wave 2|**D10**; before the pilot week|`adapters/notion/`; audit N-1|

### 3.3 The Chair's decision queue (the import's gate — present, don't decide)

The ten import decisions: **D1** two-hierarchy segregation · **D2** brand merge (one dept, two
classes) · **D3** platform-ops at wave 2 (a creation over live machinery — see ontology §7.5) ·
**D4** the supersession list · **D5** the §8 pilot approval (wave order, career pilot,
decommission rule = 3 verified firings + a clean week then one PATCH + trigger-disable on the
Paperclip routine, per-department budget caps) · **D6** C-track adoption as revised — **its
code is shipped and live; the ratification is the open formality** · **D7** R-04's shape ·
**D8/D9/D10** (the H3/H4/H6 gates above). Plus: the `memory/0003` checksum ruling, the KB
rulings (R-2/R-6), and R-20's owner choice (Notion push via the gateway clock vs the daemon —
recommendation on record: keep the daemon, remove the gateway arm).
**D1 + D5 + D6 are the critical path** — with them, wave 1 starts.

### 3.4 Ops queue (the Chair's or yours-with-permission; blocks all A-runs)

1. **Restore the workstation free-stack gateway** (`127.0.0.1:20129`) — the org smoke fails
   closed; nothing on A runs until it passes. B is unaffected.
2. Close the 3 stale hermes-era executive incidents after the restore (the other two close
   with it).
3. Isolation root setup (kills the standing `isolation.off`); ~169 orphan Chair keys in
   `~/.config/holon/keys`; the live bot token (gates wave 5); the standing VPS redeploy +
   workstation heartbeat decision.

### 3.5 The import waves (post-ruling; the ontology record is the law here)

- **Wave 1 — career (the pilot)**: dept + `[scope.dept.career]` roots + `[secrets.dept.career]`
  (G8; the pilot week validates against career's real `.env`s) + unit manifests
  (identity-core pooled; `applications` as `owner = "career"`; external watches as **pooled
  read-only units, never scope roots** — R-06) + five task classes/playbooks
  (`career:discover/apply/company-kb/digest/hygiene`) + `routine import` reconciling the
  protocol files × **the Paperclip registry** (the registry is the live-set truth; outreach
  lands disabled per I1; `[pilot]` floor per I5) + the pilot week (G8 validation, G4 intake
  decision, G2 window measurement — H6's page first) + the one-scheduler-per-pool cutover +
  decommission of career's 14 Paperclip routines.
- **Waves 2–5** per ontology §5: freelance + arch-leads + platform-ops (+C3 probes, R-13, K-KB)
  → quant (live-money board gate LAST) → brand (the per-piece chair gate; the cold four at
  activation) → VPS + the channels surface unit (I2, operant W5).
- **B-side adaptations at import** (never edit B's live set directly): career's
  `OBS_CDP_URL` → `BROWSER_CDP_URL`; the browser-chain teachings in
  `~/.hermes/skills/browser-fallback-chain`, platform-infra's `AGENTS.md`,
  career's `apply_job.py` + p3/p4 protocols are superseded — adapt at import or purge in a
  B-side pass mirrored to the VPS (the organism tree is a git repo; the local and VPS trees
  are in sync per the Chair, 2026-10-17 — the choice between them is deferred).

## 4. Hazards (what bites a fresh agent)

1. **Peer sessions share trees.** The operant repo carries "Sisyphus" pushing ungate-checked
   (label collisions: leave both, note in your commit; a pre-existing suite failure is theirs,
   not yours — verify on clean `main` before claiming). The universal checkout carries the
   peer's uncommitted `.gitignore` edit — do not commit or revert it. It also has an untracked
   `docs/install-script-patterns-2026-10-17.md` (red-team 2026-10-18; owner not recorded here).
2. **The `memory/0003` red line.** Live instance checksum ≠ shipped file. Escalated; the
   ruling is the Chair's. Editing the applied migration (law 6) or re-blessing the checksum
   would destroy the audit trail.
3. **Two infrastructures.** A's outage never touches B; B's scheduler (Paperclip) is live
   production — the cutover pauses a B routine BEFORE enabling A's, or you double-fire
   (a standing ledger row).
4. **The browser law.** On this machine a browser is ONLY sourcehound or browseros-neo. The
   `obscura` binary is sourcehound's internal cloakctl engine — NOT a route, NEVER delete.
   `browser-fallback.py` never existed; `[browser] provider` is purged from
   `~/.operant/operant.toml`.
5. **Instance specifics stay out of the repo** — no hosts, paths, chat ids, keys, model-gateway
   names in code/skills/docs. Ops context lives here (the overlay) only; instance state in
   `$HOLON_HOME`.
6. **Read live state only through `mode=ro` + `holon doctor`** on `~/holon`. The heartbeat is
   off; nothing heals by itself.
7. **Publishing** requires the history-squash runbook (PERSONAL.md). Instances move only via
   `holon backup --to` / `restore`, never git.

## 5. The laws every change keeps (lint enforces; read AGENTS.md for all)

Stdlib-only under `holon/`; no harness named under `holon/`; one writer per database; status
changes through `Work._set`; enumerations from `vocab.py`, shapes from `contract.py`; schema
changes are NEW migration files; every org term binds to a mechanism; every command declares
its actor; **tests first** for graph/contract/security/driver changes; a real-run defect gets a
guard test + a ledger row in the same commit; a new config key is documented in
`docs/GENOME.md` §6 or lint fails.

## 6. Verification (run these before you claim anything)

```sh
# universal repo — the two gates
python3 -m unittest discover -s tests -t .
python3 -m holon --home "$(mktemp -d)" lint --strict     # expect 0 errors / 0 warnings

# live instance — read-only
~/bin/holon --home ~/holon doctor                          # known reds: gateway smoke, 0003 ruling, isolation.off
~/bin/holon --home ~/holon lint                            # exactly one error: the escalated 0003 row

# operant (iter protocol)
git fetch origin && cargo test                             # env: LIBCLANG_PATH=<repo>/local/libclang, ORT_LIB_LOCATION=$operant-lib (operator-context.md §Paths)
```

Ship flow: commit universal → push origin → overlay `scripts/sync-public.sh` (ff main, merge
personal, gates `|| exit 1`, push both). Design records carry YAML frontmatter; superseded
records move to `docs/archive/` with a tombstone — never edited past their status line.

## 7. The do-not list

- Don't run the import waves or touch B's Paperclip registry before D1+D5+D6.
- Don't "fix" the 0003 lint row or the peer's files.
- Don't create cold departments (community, saas-studio, vitality, credibility) before
  activation — a paused routine carries zero load; importing early only doubles the surface.
- Don't add scope roots for external watches (trading logs, KosmOS) — pooled read-only units
  or you re-introduce R-06 through config.
- Don't deploy anything to the live instance without the gates green and the AGENTS.md
  post-deploy steps (pull, tests, doctor, re-run changed installers).
- Don't answer a Chair-decision question by deciding it — present options with evidence and a
  recommendation, wait for the ruling, then execute.

*Handoff written 2026-10-18 from the execution pass that closed at universal `10b3f0b`,
overlay `1986a70`, operant iter-907 `dc0be01b`. Update this record's §2 table as state moves;
when an item completes, move it to a "done" line in §3 with its evidence — this file is the
live handoff until the import lands.*
