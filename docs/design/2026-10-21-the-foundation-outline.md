---
status: proposed
date: 2026-10-21
description: "The survey and red-team of the system after the 5/5 conformance pass, and the outline of what remains before the venture migration: the migration machinery WORKS (measured), the 5/5 claim has enumerated blind spots, the trust boundary is off, and the one run of real work died on the free provider's response cap."
tags: [outline, gaps, survey, red-team, migration, foundation]
supersedes: [2026-10-21-jcode-acp-integration-gaps.md]
---

# 2026-10-21: the post-5/5 survey, and the outline to the foundation

Status: **proposed outline**. Scope: A only. Every claim measured on 2026-10-21 against the live
instance (`~/holon`, read-only unless stated), scratch instances, and the real venture corpus.
Where this record revises an earlier one, that is said plainly.

---

## 1. The survey: where the system actually stands

| Layer | State | Measured |
|---|---|---|
| Repos | Clean, synced, pushed | universal `76740ae`, overlay `1330bac`; 477 tests; `lint --strict` 0/0; `genome lint` clean on both |
| Harnesses | **Both 5/5** | jcode and operant each passed the full conformance pipeline (driver, plan, approve, execute, verify) |
| Doctor | **0 errors, 1 warning** | `isolation.off` only; skills re-exported today |
| Organization | Staffed, but half dead on paper | executive: Ava (CEO), Uma, Vik — operant, active. tools: Oto active, **Tess/Milo/Cara bound to `hermes`, which is not installed** |
| Real work | **One run, and it failed** | Ava's plan run (00:50) died on the provider cut; 16 operant runs total, all conformance or that one |
| Board | 10 open, all stale | 3 executive incidents (conditions fixed); 7 tools items from the Oct 13–16 hermes era |
| KBs seeded | **Zero** | no `~/holon/kb/` — the genome layer still never touches the kernel |
| Ventures | **Zero of ten imported** | 62 protocols still outside the kernel |
| Heartbeat | Off | `holon-tick.timer` inactive → the one enabled routine's 2026-10-22T08:00 firing will pass silently |
| Broker | Inactive | no agent-user path is live |
| Backups | Working | nightly `holon-backup-*` dirs, the last at 2026-10-21T10:14 |
| Chair keys | **250 files, 4 orphans, all readable** | the key dir is world-readable and the orphans date from Oct 17–20 |

## 2. The red-team: what the 5/5 does NOT prove (measured)

**The gate is met and it is not sufficient.** `conformance.run` exercises **zero** isolation,
broker, lane or KB surface — `grep -c "isolation\|broker\|agent_user"` returns 0, it drives
drivers directly as the kernel's user, in one scratch department, on one stage type. So 5/5
proves the *pipeline* and not the *system*.

| Seam conformance never exercises | State (measured) | Risk when migration starts |
|---|---|---|
| **Isolation + broker** | off; the broker is inactive; the agent user does not exist | an agent with a shell can read the Chair key (250 readable key files) and write work.db |
| **The fast lane** | not run by the suite; unit-tested only | a routine routed `fast` runs unattended with no real-run evidence |
| **The script lane** | one script run in the instance's whole history (2026-10-13) | the cheapest lane — the one a migrated corpus leans on — is the least exercised |
| **KB runtime** | zero KBs exist; `kb list` → "no knowledge bases" | the KB-wake-in-brief path has never run on a real brief |
| **Multi-department** | one scratch dept | cross-department requests and funnel-out routing are unproven |
| **The vetoed env** | no `HOLON_BROKER` anywhere | agents would talk to the DB directly |

## 3. The trust boundary, probed

1. **isolation.off** — the one doctor warning, and now measured as 250 world-readable Chair keys,
   **4 of them orphans** dating from the Oct 17–20 conformance era. Each orphan is a live
   principal if any harness on this machine ever sees one.
2. **The shared jcode daemon** (`jcode serve`, running since 08:39 as the user) is still up — the
   ACP isolation defect recorded 2026-10-21 (`jcode acp` inherits the operator's own provider
   under any `JCODE_HOME`). Not on the dispatch path (we drive `jcode run`), but it must be
   stopped or made per-home before ACP is used.
3. **The 64KB response cut is real but intermittent.** A 50KB real answer completed cleanly;
   two filler prompts 504'd; Ava's run died mid-parse at exactly 65536. Consistent with a
   free-tier stream limit, not a harness bug. Both harnesses share the route.

## 4. The migration machinery: what works (measured, dry)

This is the good half of the survey — and it removes the biggest unknown from the plan.

- **G4 (Chair-key-free intake): WORKS end to end.** On a scratch instance with
  `[intake.dept.career]` configured, an intake key issued, and a "scanner" filed a lead with it
  and *no Chair key*: `source = 'intake'`, filed into the right department and task class.
- **G12 (department export/import): WORKS.** `export_department` writes a timestamped archive
  (`pilot-20261021T122156/`) with `department.json`; `import_department` reads it into a fresh
  instance and refuses to overwrite an existing department. The round trip closes.
- **The venture import `--apply`: WORKS.** On a live-shaped scratch config: 15 protocols read,
  **15 with skills**, 8 routines proposed, **15 smoke checks written**, scope roots written and
  **valid** (the `~/.hermes` symlink resolves to `~/organism/organism` — the roots are real).
  `holon.toml` still parses as TOML afterwards.
- **Outside-reach floor: WORKS by construction.** `_external_by_name` floors an import at G3 on
  the protocol's own verbs regardless of the classifier, and an import with *no* opinion from
  anywhere lands OFF (fail closed), the Chair enabling per job. 15 of 15 career protocols read
  as outside-reach — which is exactly the Chair's standing rule, enforced at the record level.
- **The refusals seam (H-03): works, but from one path.** Refusals arrive in the *envelope*
  (`env["refusals"]`); `refusals.jsonl` on disk is written by the harness and **read by nothing
  in the kernel** (grep: zero readers). If a body records a refusal on disk and does not mirror
  it into the envelope, it is lost. That is a real, unexercised seam.

## 5. The outline to the foundation (ordered, with gates)

### Tier A — the instance runs real work (nothing else matters until this)

| # | Gap | Measured | Fix | Gate |
|---|---|---|---|---|
| **A1** | The stale board: 3 executive incidents (conditions fixed) + 7 hermes-era items | today's cancellation attempt was interrupted mid-pass | cancel them with reasons naming the fix that closed them | the board holds only current work |
| **A2** | Tess/Milo/Cara are bound to a driver that is not installed — **and the kernel has no driver-change path** (`grep set_driver` → nothing) | three of seven employees cannot run | retire the three (their roles are re-hired onto operant), **and add `holon hr set-driver`** so this never again means losing a person | no employee on an uninstalled driver; the new command has a guard |
| **A3** | **A4 intake keys are fine but the heartbeat is off**, so nothing fires and the one enabled routine's next firing passes silently | `is-active` → inactive; `next_run_at` 2026-10-22T08:00 | `systemctl --user enable --now holon-tick.timer` (Chair) | a doctor failure opens an incident within one tick |
| **A4** | The provider cut caps any long result | 50KB real answer OK; one run died at 64KB | point `large-stack` at a non-free route, or accept the cap and let the budget rule hold the body under it | one real plan run closes without a parse error |
| **A5** | The one run of real work never closed | Ava's 00:50 run | after A4, re-dispatch it — this is the milestone | one work item closes plan → approve → execute → verify on the live instance |

### Tier B — the trust boundary (the Chair's, and a Chair-key hygiene item)

| # | Gap | Fix | Gate |
|---|---|---|---|
| **B1** | isolation.off | the one-time `holon isolation plan` (root) | doctor reports no `isolation.off`; the broker answers |
| **B2** | 250 Chair keys, 4 orphans, world-readable dir | **mine to fix now**: a keys-hygiene command (`holon keys gc`) or a doc note; plus chmod the dir 0700 | no orphan key; the dir is 0700 |
| **B3** | the shared jcode daemon | stop it, or make it per-home (jcode upstream) | no daemon serving the operator's config |

### Tier C — the seams conformance never exercises (build)

| # | Gap | Fix | Gate |
|---|---|---|---|
| **C1** | `refusals.jsonl` has no kernel reader | the kernel reads the file and folds it into the envelope's refusals (or the harness stops writing it) | a refusal written by the harness reaches the blockers |
| **C2** | the fast lane and the script lane have no real-run evidence | run one of each on the live instance after A1/A3 and record the outcome | one fast and one script run close |
| **C3** | the KB runtime has never carried a wake cut | seed the pilot's KB (C3 below) and drive one stage in that department | the run's brief carries the KB's wake |
| **C4** | conformance itself never exercises the isolated/broker path | the supervisor-conformance path exists (`--supervisor`) — run it once against the reference supervisor, then against operant's | a supervisor-conformance run passes |

### Tier D — the pilot venture (the Chair's ruling, then execution)

| # | Gap | Fix | Gate |
|---|---|---|---|
| **D1** | clean the board (A1) so the import lands on an empty square | done as A1 | — |
| **D2** | import the pilot: `holon venture import career-pipeline --dept career --apply` | measured: writes the dept, 15 checks, 8 routine *proposals*, valid TOML | doctor clean; `holon routine list` shows 8 unapproved |
| **D3** | the Chair approves the 8 routines (outside-reach ones land at the G3 floor, disabled) | approval is the Chair's act, per job | the floor is enforced on approval (guarded) |
| **D4** | `kb seed career-kb --dept career --blueprint venture-pipeline` | measured: ~1s, wake reaches the brief | `kb list` shows it; career's brief carries its wake |
| **D5** | three firings, then a clean week | the heartbeat must be on (A3) | 3 firings, 0 unexpected incidents |

### Tier E — the rest of the corpus, repeatable

| # | Gap | Fix | Gate |
|---|---|---|---|
| **E1** | 9 venture departments (47 protocols) | repeat D2–D5 by wave | each pool's protocols fire |
| **E2** | the organism's 116 runtime jobs (a different shape: prompt extraction) | after the protocol corpus is proven | each job's intent extracted and reviewed |
| **E3** | G4 now works — bound `[intake.dept.<slug>]` per venture and issue scanners' keys | records + keys | a scanner files a lead per department, no Chair key |

### Tier F — the foundation's bookkeeping

| # | Gap | Fix | Gate |
|---|---|---|---|
| **F1** | The README's "treat as unverified" line for jcode is now stale (5/5 landed) | state the current state and the two open upstream gaps | the README matches the measured state |
| **F2** | `[chair] channels` unconfigured — notify reports "nobody to reach" | configure the Chair's platform ref | `holon chair-channels` resolves |
| **F3** | The overlay's `[federation]` block (V-25) | add it, or record the exclusion | `genome doctor` resolves the card |

## 6. The order, and why

```
Tier A   real work         A1 clean board → A2 retire/rehire + set-driver → A3 heartbeat (Chair)
                         → A4 model route → A5 re-dispatch Ava's plan ← THE MILESTONE
Tier B   trust boundary     B1 isolation (Chair, root) → B2 key hygiene (mine) → B3 the daemon
Tier C   unexercised seams  C1 refusals file → C2 fast+script runs → C3 KB wake → C4 supervisor conformance
Tier D   the pilot          D1 → D2 import → D3 approve → D4 KB → D5 3 firings
Tier E   the corpus, repeatable  E1 nine depts → E2 116 runtime jobs → E3 G4 keys
Tier F   bookkeeping         F1 README truth → F2 Chair channels → F3 the federation
```

**Why A before everything.** The engine is proven and the freight is not loaded. One real work
item closing on the live instance is the difference between "the harness works" and "the
organization works" — and A1/A2/A3 are a day's work, not a project.

**Why B before C and D.** The migration puts *ten* departments' credentials and scopes inside
the kernel. Doing that with isolation off, a shared daemon, and 250 readable Chair keys is
building the second floor before the first.

**Why D before E.** The pilot proves the shape on one pool where the Chair's standing rule
(job/freelance pilot-only, no outreach) is already encoded in the records.

## 7. What is the Chair's, and what is not

**The Chair's:** A3 (heartbeat), A4 (model route), B1 (isolation, root), B3 (the daemon),
D3 (approving the 8 routines), F2 (the Chair's channels).

**Mine, now:** A1, A2 (including the new `hr set-driver` command), B2, C1–C4, F1.

**Both:** D1, D2, D4, D5 (I stage and run them; you approve the routines and the pilot scope).

## 8. How this outline stays true

Every row names its measurement and its gate (a command). A row claimed done without its gate
is not done. The register in `TODO.md` carries the transitions; the regression ledger in
`AGENTS.md` carries the guards. Nothing here is about the other stack.
