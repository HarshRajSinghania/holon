---
status: executed
date: 2026-10-15
description: "The integration/installation audit: 14 H-series gaps in the landed-but-inert integration, executed as waves 0–8 (H-01..H-14) plus the genome track and pilot safety — all landed 2026-10-15, every wave re-verified against its acceptance criteria 2026-10-16, the four security gaps closed and verified."
tags: [integration, install, audit, H-series, waves]
verified-by: 2026-10-16-red-team-verification.md
---

# 2026-10-15: audit — the Operant integration as built, the local installation, the kernel gaps

Status: **audit + implementation plan** for the next iterations. Nothing in either repository was
changed by the audit.

This record holds Holon's side:
- §2: kernel bugs found by tracing the integration;
- §3: the local installation (`holon-personal`);
- §4: the kernel-level gaps against the legacy organism, checking
  `2026-10-15-cortex-foundations-audit.md`;
- §5: the one cross-repo wave order.

Operant's side, with its findings O-01 … O-32 and its work packages W1–W8, is
`operant/docs/agentic-os/AUDIT-2026-10-15.md`. Read that file's §1 first: it holds the verdict.

Audited:
- Holon public `c20d63d` (264 tests OK; `lint --strict` 0/0);
- `holon-personal` `personal` at `b59e9b4`;
- Operant `origin/main` `4d9b9adb`;
- the live workstation (`~/holon`, `~/.operant`, the user units).

Live probes:
- a scratch-instance smoke of operant's supervisor;
- the personal checkout run against a restored copy of `~/holon`;
- the installer run into a fake `HOME`;
- the cast import as a dry run.

## 1. Verdict

1. **The integration is landed as code and inert as a system.**
   - Every Holon package H1–H10 is in, and the operant side has matching code. But the two sides
     disagree on the run directory's variable (`HOLON_BRIEF_DIR` exported, `HOLON_RUN_DIR`
     read). So in a real run there is no enforcement, trajectory or usage.
   - The native tools are not registered for bodies, and two of them call the kernel with
     arguments it rejects.
   - The Chair channel and event intake are not wired.
   - The live instance has never run an operant-bodied stage, and the workstation gateway is in
     personal mode. This is why STATUS could say "every package is in" without anything having
     failed.
2. **Four security defects** must close before org mode is turned on (O-07 … O-10). Two have
   Holon halves (H-05, H-06).
3. **`holon-personal` is not the installed Holon.**
   - The launcher and both user units run the public checkout.
   - The personal checkout's code is 9 commits behind it and lacks H4–H10.
   - The installer cannot tell two checkouts apart.

   §3 has the fix and the owner-run steps.
4. **The cortex/foundations audit is accurate** on the genome layer (U1–U5). Two of its mapping
   rows are corrected here (§4.1). Six more kernel-level gaps are added (§4.2), led by:
   - a database-newer-than-code guard (a live hazard today, §3 I-02);
   - retention;
   - regression guards as records.

## 2. Holon kernel findings

**H-01: the run directory's variable (with operant O-01).**
- CONTRACT §1 and `run_env` (`holon/execution/drivers.py:154-157`) export `HOLON_BRIEF_DIR`.
- Operant reads `HOLON_RUN_DIR` in four places.
- Fix: export `HOLON_RUN_DIR` (same value) in `run_env`, and list it in CONTRACT §1 as the name
  for "this run's directory" (policy.json, trajectory.json, refusals, usage).
  `HOLON_BRIEF_DIR` stays as the alias.
- Accept: `holon lint`'s contract pack checks every CONTRACT §1 variable is exported, and the
  supervisor conformance suite (H-10) asserts it in a body's environment.

**H-02: the operant adapter's `HERMES_HOME` is the literal `{holon_home}`.**
- In `adapters/operant/driver.toml:27`. Driver `[env]` values are not templated, and
  `install.py` replaces only `{operant}` and `{ohome}`.
- Loading the driver gives `{'HERMES_HOME': '{holon_home}'}`.
- Every operant body uses `./{holon_home}` under its work directory as its state home. That is a
  false read-only breach on observe stages, and none of the isolation the adapter promises
  (operant O-06).
- Fix: `HERMES_HOME = "{ohome}"`.
- Accept: a guard test in `tests/test_adapters.py` that renders the installed driver and asserts
  every `[env]` value is absolute and has no braces, plus a regression-ledger row.

**H-03: refusals become blockers after the result is stored and judged.**
- `submit()` stores the execute output (`service.py:565`) and runs `post_execute` (checks, then
  the judge; `:577`) *before* the refusal block (`:589`) appends `blockers`.
- The stored output keeps the raw `refusals`, but never the blockers CONTRACT §9 promises, so an
  execute that the harness partly refused can pass verification as `success`.
- Fix:
  - fold refusals into `env["blockers"]` right after `contract.validate`, before any `submit_*`;
  - a `success` with refusals routes to rework, or the verifier sees the blockers in its brief.
- Accept: a test in which an execute with `outcome: success` and one refusal does not verify
  without either rework or a recorded verifier decision on the blocker.

**H-04: usage is recorded only for execute.**
- `set_run_usage` is called only in the execute branch (`service.py:566`). Usage for research,
  shape, plan, verify and retro is dropped, so "cost per verified result" undercounts every
  pipeline stage.
- The build arrives only through the envelope's `usage.build`. Bodies that hand in through
  `holon_submit` report no usage, and no driver supplies a build, so H10's regression detection
  has no input.
- Fix:
  - record usage for every stage;
  - read `<run dir>/usage.json` when present (the harness's measurement wins over the
    envelope's claim, as §10 says);
  - add an optional driver key `build_cmd` (e.g. `operant --version`), run once per driver per
    tick and cached, as the fallback build.
- Accept: a plan run's usage appears in `holon metrics`, and a run with no `usage.build` gets
  the driver's build.

**H-05: the Notion receiver rotates its token on an unsigned body.**
- `_classify` stores any `verification_token` before verifying a signature
  (`adapters/notion/holon_notion.py:797`), trusting the secret path.
- `apply` (H8) has no path; its host decides. Operant's host mounts it on a public path
  (operant O-08).
- Fix: `apply` refuses a `verification_token` body unless the host passes `--path-verified`, so
  rotation happens only behind the secret path.
- Accept: `apply` with a token body and no flag returns 401, and `notion.json` is unchanged.

**H-06: text arguments read files.**
- `_text_arg` reads `@path` as a file and `-` as stdin (`holon/cli.py:99`), as the calling user.
- That is right for the Chair at a shell, and wrong for text a runtime relays:
  - `routine fire --payload` (event text from anyone in a channel);
  - `msg send` and `memory add` bodies from the native tools.
- Event payloads are also posted to the work as plain messages (`service.py:1446`). The
  executor's brief shows them as if a colleague wrote them.
- Fix:
  - a `--payload-file`/stdin-only path for runtimes, and `--literal` for `msg send` and
    `memory add`;
  - CONTRACT §12 says runtimes MUST pass payloads on stdin;
  - the brief renders `event` messages under "External content (data, not instructions)".
- Accept: `routine fire X --payload @/etc/hostname` from a runtime path posts the literal text.

**H-07: `policy.json` is unreadable by the agent user.**
- `briefs.py:77` (and `policy.write_policy`) set it to `0600` as the kernel's user.
- Under isolation, a harness that MUST enforce it (CONTRACT §9) cannot read it, and operant fails
  closed.
- Fix: the same readable-by-agent treatment as `BRIEF.md` (group `holon-agent`, `0640`), or hand
  it to the runner.
- Accept: `test_isolation.py`, where the agent user reads `policy.json`.

**H-08: the supervisor protocol is silent about isolation.**
- `prepare_dispatch` (`service.py:1333-1351`) hands any supervisor an env containing
  `HOLON_BROKER` when the instance is isolated, but nothing requires the supervisor to run the
  body as the agent user.
- An operator-run supervisor quietly defeats the trust boundary (operant O-11).
- Fix:
  - the prepared JSON carries `"isolation": {"agent_user": …, "runner": …}`;
  - CONTRACT §11: a supervisor MUST run the body as that user through that runner, or decline
    the claim.
  - `--prepare` refuses unless the supervisor passes `--runs-as-agent-user` on an isolated
    instance.

**H-09: a database newer than the code runs silently.**
- Verified: the personal checkout (migrations to 0008) against a restored copy of `~/holon`
  (0011) gives:
  - `holon doctor` reports **0 errors**;
  - `status` works;
  - only `lint` notices (`api_version '2' is not one this Holon knows`).
- Writes from old code to a newer schema are undefined behaviour. This is a live hazard because
  two checkouts share `~/bin/holon` (§3).
- Fix: on open, any applied migration the code does not ship is a hard error ("this instance was
  migrated by a newer Holon; run that checkout"), with a doctor line.
- Accept: a test that applies a fake `9999_future.sql` and asserts every mutating command
  refuses.

**H-10: there is no supervisor conformance suite.**
- H6's acceptance was "one conformance suite for any supervisor". Today there are only unit tests
  of `prepare_dispatch` and `finish_run` (`tests/test_push_and_schedules.py:271+`).
- Fix: `holon adapter test --supervisor '<cmd>'` builds a scratch org, lets the external
  supervisor run a scripted body, and checks:
  - the body's environment (H-01; no `HOLON_CHAIR_KEY` or `HOLON_KEY`; nothing else from the
    supervisor's environment);
  - lease renewal at most every lease/3;
  - the timeout kills the process group;
  - finish and salvage;
  - refusals, trajectory and usage pickup;
  - isolation honored (H-08).
- Operant's W4 acceptance runs it.

**H-11: the cast import does not fit this instance.**
- `adapters/operant/import-cast.py:59` maps identity-warden into department `it`, which the live
  instance lacks. `--apply` should check that departments exist first.
- The dry run proposes an **hourly** agent routine (24 runs a day on a model that takes minutes
  per call) and four routines at 09:00.
- Recommend:
  - identity audit in the script lane;
  - stagger the daily ones;
  - a `--dept-map seat=slug` override.

**H-12: CONTRACT nits.**
- Two sections numbered 8 ("8. Native tools" and "§8 The read API"), with mixed `§` style.
- §8 still says event triggers "land with H7".

  Renumber, and point the read-API section at `api_version` 2.

**H-13: a skipped firing reports success.**
- `routine fire` exits 0 when it skips for cooldown or open work. Runtimes count skips as firings
  (operant O-15).
- Fix: exit 3 (the kernel's NOTHING code) with `{"skipped": …}`.

**H-14: nothing is ever collected.**
- No retention exists for:
  - run directories (about 114 KB per run here; 61 crons a day reach gigabytes a year);
  - events, messages and delivered notifications;
  - Notion pages of closed work;
  - Chair keys of deleted instances (six of the seven files in `~/.config/holon/keys/` belong to
    no instance: conformance scratch orgs).
- Fix:
  - `[retention]` (runs N days after their work closes, keeping gold-standard and judged runs'
    `result.json` and `trajectory.json`);
  - `holon gc` (dry run by default, a backup check first; never deletes un-backed data);
  - `holon keys list --orphans` (lists only, deletion by the Chair);
  - conformance writes its scratch Chair key inside the scratch directory
    (`HOLON_CHAIR_KEY_FILE`).

## 3. The local installation (`holon-personal`)

The intended model (`PERSONAL.md`): this repository tracks `personal`; its `main` mirrors the
public repository; the instance never goes through git.

| # | Finding | Evidence |
|---|---|---|
| I-01 | **The installed Holon is the public checkout, not this one.** No instance or launcher comes from `holon-personal`. | `~/bin/holon` → `…/my-projects/holon/bin/holon`; `holon-tick.service` and `holon-notion.service` `ExecStart` point into `…/my-projects/holon/` |
| I-02 | **This checkout's code is stale.** `main` is 9 commits behind `public/main` (H4–H10, README), and `personal` has not merged it: 33 code files and about 1.1k lines are missing. STATUS §2 says the workstation "runs HEAD … H4–H10", which is true only of the public checkout. Run against the live data, this code passes doctor and fails only lint (H-09). | `git log main..public/main`; probe on a restored copy |
| I-03 | An uncommitted STATUS hunk (the cortex-audit pointer, the companion of `b59e9b4`) | `git status` |
| I-04 | **Two checkouts, one launcher.** Each checkout's `install.py` silently repoints `~/bin/holon` to itself (`install.py:160`); the last run wins. The units, adapter configs (`adapters/operant/install.py` pins `REPO/bin/holon` for `holon mcp`) and driver paths follow whichever checkout installed them. | code |
| I-05 | **`holon` is on no PATH.** `~/bin` is in neither fish's nor bash's `PATH`. The kernel copes (`HOLON` falls back to `python3 -m holon`). Operant's native tools and `[holon] bin` default look up `holon` and fail (O-04). The installer never warns. | `fish -c 'command -v holon'` is empty |
| I-06 | `PERSONAL.md` documents `holon backup <dest>`; the CLI is `holon backup --to DIR` | CLI usage error |
| I-07 | **The installer has no Operant-runtime mode.** It always writes `holon-tick`, and `holon-notion` when the mirror is set up. It never writes operant's `[holon]` section, hands the clock or the webhook over, or installs the operant adapter. | `install.py` |
| I-08 | The public-to-personal sync is manual, and nothing reports drift | `PERSONAL.md` |
| I-09 | Switching checkouts requires re-running every adapter installer (pinned paths). Doctor does not check that pinned paths exist or match the active checkout. | adapter installers |
| I-10 | Six orphan Chair keys from scratch instances (H-14) | `~/.config/holon/keys/` against `settings.instance_id` |
| I-11 | A stray untracked `agent:/FoundationsSurvey` in the public checkout: a harness wrote an `agent:` URI as a relative path. Leave it for the owner to remove. | `git status` |

**Installer changes (universal repo, tests first):**
1. **Launcher ownership.**
   - If `--bin-dir/holon` is a symlink into a *different* checkout, stop and name both. Only
     `--repoint` replaces it.
   - Default `--bin-dir` becomes the first of `~/.local/bin` or `~/bin` that is on `PATH`.
   - Warn when the chosen directory is not on `PATH`.
2. **Checkout identity.** The instance records which checkout last migrated it
   (`settings.code_root` and the git revision). Doctor warns when the running checkout differs,
   and H-09 refuses when the code is older.
3. **`--runtime operant`.** Writes operant's `[holon]` section (absolute `home` and `bin`,
   `clock`, `supervise`). It also:
   - skips `holon-tick.timer` and `holon-notion.service` when operant owns the clock and the
     webhook;
   - installs the operant adapter;
   - prints the archive step (`operant org holon archive`).
4. **Overlay drift.** A `scripts/sync-public.sh` in the overlay performs PERSONAL.md's three
   steps, and the overlay's doctor smoke check warns when `personal` is behind `public/main`.
5. Fix the documented commands (`backup --to`, `restore <dir>`).

**Owner-run steps to make `holon-personal` the installation.** These were not done by the audit;
they repoint live services.
```sh
cd ~/Documents/github/my-projects/holon-personal
git add docs/STATUS.md && git commit -m "STATUS: cortex audit pointer"   # or include it in the next STATUS commit
git fetch public && git checkout main && git merge --ff-only public/main
git checkout personal && git merge main                  # conflicts only on overlay files: keep ours
python3 -m unittest discover -s tests -t . && python3 -m holon --home "$(mktemp -d)" lint --strict
python3 install.py --home ~/holon --bin-dir ~/.local/bin  # repoints the launcher here; ~/.local/bin is on PATH
python3 install.py --home ~/holon --systemd --no-start    # rewrites the units against this checkout
systemctl --user daemon-reload && systemctl --user restart holon-notion.service
# re-run any adapter installer whose pinned paths point at the public checkout (operant, jcode, hermes)
holon doctor && holon lint
```
Then `rm ~/bin/holon` (the stale link) once nothing references it.

Caveat: `install.py` on an instance that already has the Notion mirror (`notion.json`) also
runs `check --repair` and `push` against Notion (step 4). That is outward-facing. Run it when a
re-push is acceptable, or add the `--no-notion` flag in installer change 3 first.

## 4. Kernel-level gaps against the legacy organism

### 4.1 The cortex/foundations audit, checked

Its §3 "what Holon has" table matches the code:
- no unit contract, services registry, pooling or derived structural registry;
- no graduation;
- governance only as the hash-chained event trail.

Its U1–U5 plan stands. Two of its mapping rows, and one in the ventures record, need
correcting:
- **Per-unit smoke gates map to `[smoke.dept.<slug>]`** (GENOME §13, `service.py:81`), not
  `[checks.dept]`. `[checks.dept]` holds the post-execute machine checks (GENOME §9). The
  ventures record §2's "smoke.yaml → `[checks.dept.<slug>]`" row has the same slip.
- **The ventures record §2 overstates three rows.** Each is true of the kernel's contract, but
  not yet of a running harness:
  - "enabled_toolsets → policy.json, harness-enforced";
  - "events → H7, the operant gateway matches";
  - "Chair approvals from chat → H8".

  They become true with operant W1, W3 and W5 (§5).

### 4.2 Gaps the audit does not list

| ID | Gap | Legacy mechanism | Holon today | Package |
|---|---|---|---|---|
| K-1 | **Code older than its database** | `arch validate` refuses drift | silent (H-09) | H-09, now |
| K-2 | **Regression guards as records** | `RG-*` per unit, each with a guard, linted | a regression ledger for the *repository* (AGENTS.md); incidents and lessons in the instance, but a fixed incident leaves no executable guard | `guards` table (or `[[guards]]` in unit manifests): an incident's verified fix registers a check (`[checks.class]` or smoke) with provenance; lint flags a closed incident with neither a guard nor a waiver; a guard that fails reopens its incident |
| K-3 | **Retention** | notice GC caps, archive dirs | none (H-14) | H-14 |
| K-4 | **Decision records per unit** | `AD-*` with status and supersession, per prefix | memory kind `decision` with fingerprint supersession; no per-department decision index and no read-API view (`api_memory` was in the boundary plan and not shipped) | `api_memory` (decisions and constraints by scope) in read API v3, together with U1's `api_units`/`api_services` |
| K-5 | **Typed cross-unit requests** | `services_offered` with `accepts`/`returns`, called verbatim | `msg request` free text | U1's `[[services]]` gives `msg request --service <id>` a schema to validate against; until U1, nothing |
| K-6 | **Isolation as the default for org mode** | per-pool sandboxes | isolation off on the workstation (`isolation.off`); the supervisor protocol ignores it (H-08) | owner's root setup; H-07, H-08; operant O-11/O-30 |

Ventures-facing kernel gaps keep their register in `2026-10-15-ventures-gap-investigation.md`:
- I1: import fidelity;
- I2: delivery routing;
- G8: department secrets;
- G4: intake;
- I5: the pilot guard;
- G12: department packages.

None is duplicated here. One interaction: G8's "secrets resolved into the run's environment at
`policy.json` compile" depends on H-01, H-07 and operant O-07. The body's environment must be
exactly the prepared environment, or department secrets leak across runs through the
supervisor's own environment.

## 5. One wave order across both repositories

```
wave 0 (now, no code)   sync holon-personal (§3 owner steps) · commit STATUS · keep org mode OFF
wave 1  Engage          Holon: H-01, H-02, H-09            Operant: W1 (O-01..O-05)
wave 2  Safety          Holon: H-05, H-06, H-07, H-08      Operant: W2 (O-07..O-11)
wave 3  Enforce         Holon: H-03, H-04                  Operant: W3 (O-17..O-21)
wave 4  Resident        Holon: H-10, H-13                  Operant: W4 (O-12, O-13, O-25, O-26)
        → owner gate: archive operant's org stores, set [holon] on the workstation, run one
          routine supervised end to end; heartbeat stays the owner's call
wave 5  Channel         Holon: notify-through-runtime      Operant: W5 (O-14..O-16)
wave 6  Capture         —                                  Operant: W6 (O-22)
wave 7  One org         Holon: H-11                        Operant: W7 (O-23, O-24, then G+1 / O-32)
wave 8  Hardening       Holon: H-12, H-14, installer (§3)  Operant: W8 (O-27..O-31)
genome  (parallel, kernel-only, per the cortex audit §5) U1+U2+U3 with K-4/K-5 as read API v3;
        K-2 guards; U4 later
```

Each wave lands both sides' halves with one end-to-end acceptance on a scratch instance. Waves 1
and 2 are the minimum before any live org-mode run. Wave 1's acceptance is the test that would
have caught this audit's headline: a real `prepare` env through a real operant body.

**Process lesson** (for AGENTS.md's ledger):
- Both sides marked phases "landed" on unit tests that stubbed the seam between them.
- An interface package is done only when one test crosses the seam with the other side's real
  artifact: the kernel's real `prepare` output into the runtime, and the runtime's real files
  into the kernel's `submit`.
- STATUS should say "landed and exercised on <instance>" or "landed, not yet exercised".

## 6. Holon-side implementation outline (how each wave gets built)

Discipline for every wave: **tests first**, one commit per finding (H-xx) with its guard test and
its ledger row when a real run found it, `lint --strict` + full suite green at each commit, and
the wave's end-to-end acceptance on a scratch instance *through the other side's real artifact*
(§5's process lesson). The ledger row lands in the same commit as the guard (AGENTS.md law).

**Wave 0 — now, no code.** §3's owner-run steps (you): sync `holon-personal` (ff-merge main,
merge into personal, gates, repoint the launcher to `~/.local/bin`, restart the Notion unit,
re-run adapter installers, doctor + lint), commit the STATUS hunk, **keep org mode off**. My
cleanup: the stray `agent:/` directory is already removed (this audit's I-11).

**Wave 1 — Engage (H-01, H-02, H-09).**
- H-01: `drivers.run_env` also exports `HOLON_RUN_DIR` (same value, alias kept); CONTRACT §1
  row; extend the lint contract pack to assert it; supervisor suite asserts it in a body's env.
- H-02: `HERMES_HOME = "{ohome}"` in `adapters/operant/driver.toml`; guard test renders the
  installed driver and asserts every `[env]` value is absolute, brace-free.
- H-09: `db.open` refuses an applied migration the code does not ship (hard error naming the
  newer checkout) + doctor line; test applies a fake `9999_future.sql` and asserts refusal.
- Acceptance: a real `--prepare` env runs through a real operant body once (with operant W1).

**Wave 2 — Safety (H-05, H-06, H-07, H-08).**
- H-05: `apply` refuses `verification_token` bodies unless `--path-verified` (401); test asserts
  `notion.json` unchanged.
- H-06: `--payload-file`/stdin for `routine fire`, `--literal` for `msg send`/`memory add`;
  CONTRACT §12 wording; event messages render in briefs under "External content (data, not
  instructions)"; test: `--payload @/etc/hostname` from the runtime path posts the literal text.
- H-07: `policy.json` written group-readable (0640, holon-agent) like `BRIEF.md`;
  `test_isolation.py` extends to the agent user reading it.
- H-08: prepared JSON carries `isolation` (agent_user, runner); CONTRACT §11 MUST clause;
  `--prepare` refuses without `--runs-as-agent-user` on an isolated instance.
- Acceptance: G8's prerequisite surface is ready (the prepared environment is exactly the
  body's environment); no org-mode run before this wave is green.

**Wave 3 — Enforce (H-03, H-04).**
- H-03: refusals fold into `blockers` right after `contract.validate`, before any `submit_*`;
  success-with-refusals routes to rework or a verifier decision recorded on the blocker.
- H-04: usage recorded for every stage; `<run dir>/usage.json` read when present (harness
  measurement wins); optional driver `build_cmd`, cached per driver per tick, as the build
  fallback; `holon metrics` shows a plan run's usage; a no-build run gets the driver's build.
- Acceptance: a partly-refused execute cannot verify clean; H10's regression has real input.

**Wave 4 — Resident (H-10, H-13).**
- H-10: `holon adapter test --supervisor '<cmd>'` — scratch org, scripted body, checks: env
  (H-01; no chair/key leakage; nothing else inherited), lease renewal ≤ lease/3, process-group
  timeout kill, finish/salvage, refusals + trajectory + usage pickup, isolation honored (H-08).
- H-13: `routine fire` exits 3 with `{"skipped": …}` on cooldown/open-work skips.
- **Owner gate after this wave:** archive operant's org stores, set `[holon]` on the
  workstation, run one routine supervised end to end; heartbeat stays your call.

**Wave 5 — Channel (Holon: notify-through-runtime; operant W5).**
- Design note: this supersedes the ventures record's I2 shape — `--deliver` routes through the
  resident runtime's channel (per-dept `[notify.dept]` config holds the route), not a
  org-wide command. Implement after the runtime is the delivery path in production.

**Wave 6 — Capture:** operant-only (W6); nothing on Holon's side.

**Wave 7 — One org (H-11).** Cast import: `--apply` checks departments exist; script lane for
the identity audit; stagger the dailies; `--dept-map seat=slug` override; re-run against this
instance after wave 4's owner gate.

**Wave 8 — Hardening (H-12, H-14, installer §3).**
- H-12: CONTRACT renumber + §8 v2 pointer.
- H-14: `[retention]` (runs N days after close; gold/judged runs keep result+trajectory),
  `holon gc` (dry run default, backup-first, never un-backed), `holon keys list --orphans`,
  conformance scratch keys inside the scratch dir.
- Installer: launcher ownership + `--repoint`, PATH-aware `--bin-dir` default + warning,
  `settings.code_root` + revision + doctor drift check, `--runtime operant` (writes `[holon]`,
  owns clock/webhook, skips tick/notion units, installs the adapter, prints the archive step),
  `--no-notion` flag, `backup --to`/`restore <dir>` doc fixes, overlay `scripts/sync-public.sh`.
- Acceptance: fake-HOME installer probe again; two-checkout launcher conflict refuses.

**Genome track (parallel, kernel-only, after wave 1, per the cortex audit §5):**
U1 manifests + `api_units`/`api_services` + `bind.service`/`bind.pool` lint; U2 pooling
semantics (brief presence + scope grant + msg-request writes); U3 `holon genome emit`; K-4
`api_memory` and K-5 `--service` schema land with read API v3; K-2 guards (`[[guards]]` or
table, provenance from incidents, lint: closed incident needs guard or waiver, failing guard
reopens its incident). Nothing in waves 1–4 depends on it; wave-2+ venture ports do.

**AGENTS.md process row (first Holon commit of wave 1):** the §5 lesson becomes law —
"an interface package is done only when one test crosses the seam with the other side's real
artifact" — with the wave-1 supervisor acceptance as its guard.
