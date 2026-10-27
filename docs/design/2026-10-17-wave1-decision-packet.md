---
status: proposed
date: 2026-10-17
description: "The D1+D5 decision packet: the exact wave-1 artifacts the Chair reviews to rule — the career department stanzas, the two unit manifests, the class/playbook shape, the import commands with their dry-run gate, the cutover sequence and the budget caps — plus two evidence-backed corrections to the re-architecture's career row (no IMAP secret at wave 1; career's checks depend on platform-infra's engine_lib)."
tags: [ventures, decision-packet, career, pilot, wave-1, import]
pair: 2026-10-17-remaining-implementation-gaps.md
---

# 2026-10-17: the wave-1 decision packet — what D1+D5 approve, concretely

Status: **proposed** (the Chair's review copy; nothing here is applied to the instance). Ruling
D1 (the two-hierarchy segregation) and D5 (the §8 pilot approval) on this packet authorizes
wave 1 exactly as written — every stanza below is the literal config that would land, so the
ruling is a review, not an act of faith. Ground truth: the C1–C3 package is live (`4208c29`),
wave 0 is executed (smoke green, `browser.toml` synced and rendering), the instance is at
migration `0015` + memory `0004`, api_version 4.

## 0. Two corrections the recon forced (both confirmed on disk)

1. **Career has no IMAP secret at wave 1.** The re-architecture's §3 career row lists "secrets:
   IMAP, OBS_CDP_URL, apply transport" — stale: career's inbox-scanner was superseded into
   freelance-agency (its protocol says so), and no `.env` exists anywhere under career-pipeline.
   The protocol corpus references exactly two secret shapes: the CDP variable and a password
   field. **Wave-1 secrets: the CDP var (`BROWSER_CDP_URL`, superseding `OBS_CDP_URL` per the
   Chair's browser law) + the apply transport's credential.** Nothing else.
2. **Career's smoke checks cross the layer boundary.** All four of career's `smoke.yaml` gates
   invoke platform-infra's `engine_lib.py` (the shared FSM library, at
   `~/.hermes/organism/foundations/platform-infra/scripts/`). At wave 1 that path is watched
   read-only (no owner yet); the checks port as-is (they are read-only probes) but their
   subject belongs to platform-ops at wave 2 — the packet records the dependency, it does not
   resolve it.

## 1. The department (`~/holon/holon.toml` — the exact stanzas)

```toml
# --- wave 1: the career department (D1's venture hierarchy; D5's pilot) ---

[scope.dept.career]
roots = ["~/.hermes/organism/ventures/career-pipeline"]   # the pool itself: writable
commands = ["python3", "identity", "sourcehound", "kb"]    # the fence exists from day one

[[smoke.dept.career.checks]]      # the pool's own gates, ported verbatim from smoke.yaml
name = "engine-lib reachable"
cmd = "python3 ~/.hermes/organism/foundations/platform-infra/scripts/engine_lib.py --help > /dev/null"
critical = true
timeout = 15
reason = "engine_lib is the shared FSM library; if it can't be imported, the job engines fail"

# (+ the three phase-evidence/drift checks, same shape, same reasons as smoke.yaml)

[pilot]
depts = ["career"]                # I5: outside-reach work floors at G4 while the pilot runs

[secrets.dept.career]             # G8: 0600 key-file refs; no values, ever
BROWSER_CDP_URL = "~/.config/holon/secrets/career-browser-cdp.key"
APPLY_TRANSPORT_PASS = "~/.config/holon/secrets/career-apply-transport.key"

[budget.dept.career]              # D5's fourth approval — proposed numbers
max_running_per_dept = 2          # one engine leg + one judgment job at a time
```

## 2. The unit manifests (`~/holon/genome/units/` — drafts)

`identity-core.toml` — the foundation as a service unit (U1), pooled by career:

```toml
charter = "the Chair's professional identity: values, positioning, application materials"
category = "service"
tier = "foundation"
roots = ["~/.hermes/organism/foundations/identity-core"]
pool_of = ["career"]
consumed = []

[[services]]
id = "identity"
command = "~/.hermes/organism/foundations/identity-core/bin/identity"
accepts = "a subcommand: get, values, propose, validate, emit-values, overview, ..."
returns = "the identity record (json/text)"
effect = "read"        # wave-1 use is reads; writes stay manual until K-KB/owner rules land
note = "the one source of truth for who the Chair is professionally — prefer it over hand-copied materials"
health = "~/.hermes/organism/foundations/identity-core/bin/identity overview > /dev/null"
```

`applications.toml` — the venture-owned engine (R-13's `owner` field, live at v4):

```toml
charter = "career's applications engine: lead_ref → funnel_state, the ATS and apply flow"
category = "service"
tier = "engine"
roots = ["~/.hermes/organism/ventures/career-pipeline/sub-systems/applications"]
owner = "career"       # a venture-owned unit, not a shared surface (the segregation law)
pool_of = ["career"]
consumed = ["identity-core:identity", "browser:sourcehound", "browser:browseros-neo"]

[[services]]
id = "apply"
command = "python3 ~/.hermes/organism/ventures/career-pipeline/sub-systems/applications/apply_job.py"
accepts = "a prepared application (state + materials)"
returns = "the submitted application and its funnel state"
effect = "write"       # act-stage only; observe stages never see the route (R-03)
note = "the apply flow's write path; reaches anti-bot pages through the browser surface at BROWSER_CDP_URL"
health = "python3 -c 'import sys; sys.path.insert(0, \"~/.hermes/organism/ventures/career-pipeline/sub-systems/applications\")'"
```

## 3. The task classes and playbooks (five, per the re-architecture §3)

|Class|Playbook protocol (from the pool's own `cron-jobs/*.md`, the intent definitions)|Lane default|
|---|---|---|
|`career:discover`|job-loop p1/p2/p3: acquire, score, enrich — the flywheel's intake|script (deterministic legs) / fast (the enrich judgment)|
|`career:apply`|the applications engine: state + ATS + the apply flow|full, **G4 floor** (it sends) — `[pilot]` while enabled|
|`career:company-kb`|company-kb ×3: dossier, growth, regrade — the pool's `kb.py` verbs on the script lane until K-KB lands|script|
|`career:digest`|daily-apply-digest (`no_agent` script — already the script lane in Paperclip)|script|
|`career:hygiene`|p5 track, p6 convert, recover|script|

Playbooks are versioned per class (the existing playbook mechanism); their protocol text ports
from the protocol files at import, their rubrics from each job's `acceptance`-equivalent.

## 4. The import (the exact commands, dry-run first)

```sh
# the live-set reconciliation: protocols are the intent, the Paperclip registry is the truth
holon routine import --dept career ~/.hermes/organism/ventures/career-pipeline/cron-jobs/*.md
#    → dry run: prints the proposed routines, their lanes, and which land DISABLED (I1:
#      p4-outreach and anything outside-reaching). Review the table; nothing is created.
holon routine import --dept career --apply <same files>   # only after the dry run reads true
holon schedule disable <p4-outreach-id>                   # the Chair's explicit act, when
```

The recon already fixed the map for the 14 live routines: p1/p2/p3/p5/p6 + digest active →
import enabled; **p4-outreach imports disabled** (I1; the Paperclip-era re-enable note in its
protocol is historical); company-kb ×3 dormant → import as disabled-with-schedule (they are the
kb.py legs; enable when K-KB or the Chair says). The dry-run table it prints is the
authoritative per-routine record — this packet does not fabricate what the tool computes.

## 5. The cutover (one scheduler per pool — the state machine)

Per routine: pause the Paperclip routine → enable the Holon routine → 3 verified firings + a
clean week → one PATCH + trigger-disable on the Paperclip side. Order: digest first (script,
`no_agent`, lowest blast radius), then p1/p2/p3 legs, then p5/p6, **apply last and only on the
Chair's word**. Rollback at any window: re-enable Paperclip, disable Holon — no data moves.

## 6. What D1 and D5 actually authorize

- **D1** — the hierarchy: career exists under executive as a venture department consuming the
  capability layer (identity-core pooled, browser surface org-wide); applications is
  career-owned; nothing here creates a shared-surface exception.
- **D5** — the pilot: career as wave 1, this cutover sequence, the decommission rule, and the
  budget caps above. Approving the caps as proposed, or naming different numbers, is part of
  the ruling.

**Not authorized by this packet** (stays with the Chair regardless): enabling p4-outreach;
enabling the company-kb legs; any wave-2 work; the two standing escalations (the 0003
checksum ruling; review of the live-instance edits) — see the gaps register §6.
