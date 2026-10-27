---
status: executed
date: 2026-10-16
description: "The red-team verification of every landed 2026-10-15 wave against its acceptance criteria: verdicts per H-item, two defects found and fixed with guards in e8a2021 (refused executes closing unverified; test processes leaking Chair keys into the real key dir), the K-2 guard trust path surfaced, and the residual notes."
tags: [red-team, verification, H-series, guards]
---

# 2026-10-16: red-team verification — every landed wave checked against its acceptance

Status: **verification pass** over the universal repo at `234d6b6` (319 tests, `lint --strict`
0/0 confirmed first-hand). Every item the register marks landed was checked against the
integration audit's acceptance criteria, by reading the implementation and its guard test, plus
live probes (the supervisor conformance suite against a real subprocess, `holon gc` and
`keys list --orphans` on a scratch instance, a timed key-dir watcher across six full-suite runs).
Two defects found were fixed with their guards in the same commit; one security decision is left
open for the Chair (§2).

## 1. Verdict per landed item

|Item|Verdict|Evidence (one line each)|
|---|---|---|
|H-01|LANDED|`run_env` exports `HOLON_RUN_DIR` with the alias kept (`drivers.py:160-161`); CONTRACT §1 row; lint's contract pack is bidirectional; the prepare test pins both names in the body env|
|H-02|LANDED|`HERMES_HOME = "{ohome}"` (`adapters/operant/driver.toml:27`); the installed-driver test asserts every `[env]` value absolute and brace-free; ledger row present|
|H-03|PARTIAL → **fixed this pass**|The fold is right and early (`service.py:628-631`, before any `submit_*`), and the verifier's context shows the blockers (guarded) — but the three close-without-verifier paths (trusted sampling, the script-lane skip, a passing rubric judge) never looked at blockers, and the judge's state (outcome/summary/documentation only) never included them. A refused execute could close with no decision. Fixed: `_sample_verification` and `_lane_verification` keep the verify stage when `env["blockers"]` is set; guards `test_a_refused_success_is_never_closed_by_sampling` (full lane) and `test_a_refused_fast_result_keeps_its_verifier` (fast/script lane) — both verified to fail without the fix. Ledger row added.|
|H-04|LANDED|Usage recorded for every stage (`service.py:672-680`); `<run dir>/usage.json` read through `isolation.read_agent_file` and wins over the envelope; malformed JSON silently ignored; `build_cmd` cached per driver per process|
|H-05|LANDED|`apply` 401s a `verification_token` body without `--path-verified`; `_classify` stores only after signature verification; both pinned by tests. The flag is the host's self-assertion — by design ("its host decides"); the audit knew this|
|H-06|LANDED|`--payload` literal + `--payload-file` for the runtime's own choice; `msg send`/`memory add` `--literal`; CONTRACT §12; event payloads render under "External content (data, not instructions)". The landed tests were API-level only — a CLI-boundary guard was added this pass (`test_the_payload_flag_takes_text_literally`)|
|H-07|LANDED|Both writers chmod 0640 (`briefs.py:77`, `policy.py:60`); the isolation suite has the agent user reading `policy.json`|
|H-08|LANDED|Prepared JSON carries `isolation: {agent_user, runner}` (`service.py:1457-1458`); `--prepare` refuses without `--runs-as-agent-user` **before** the claim, so no lease is burned (`cli.py:562-564`)|
|H-09|LANDED, stronger than spec|Refusal at `Kernel()` open — every command refuses, not only mutating ones; the error names the migration and "newer Holon"; the test injects `9999_future.sql` into both databases|
|H-10|LANDED|A real subprocess seam: the reference supervisor passes every clause; leak/neglect supervisors fail the env/finish/timeout clauses (verified live, ~20s); the suite's scratch Chair key lives in the scratch dir (H-14e for this path)|
|H-11|LANDED|Departments checked before any write (`import-cast.py:127-135`, applies to the dry run too); `--dept-map seat=slug`; `--stagger` default 7; identity audit lands in the script lane; the hourly cadence is flagged "⚠ agent cadence" for review|
|H-12|LANDED|CONTRACT §1–§13, single §8 (native tools), the read API is §9 at `api_version 3`; no stale "lands with H7" text|
|H-13|LANDED|`routine fire` returns `NOTHING` (3) with `{"skipped": …}`; a CLI-boundary guard was added this pass (`test_a_skipped_firing_exits_3_with_its_reason`) — the landed test checked the API dict only|
|H-14|LANDED|`[retention]` in GENOME §6; gc dry-run by default; `--apply` refuses without a backup newer than `backup_max_age_days` (freshness, not existence; `--force` is the Chair's override); gold/judged runs keep `result.json` + `trajectory.json`; `keys list --orphans` lists only; supervisor conformance keeps its key in scratch. Plus the test-process floor below|
|K-2|LANDED mechanically, **trust path open (§2)**|`guards` table (migration 0012); registration from the verified fix's execute result only (`service.py:349-364`, called from `verify()` when done); heartbeat runs guards; a failure reopens the incident once (title dedup); doctor `incident.guard` needs guard or waiver; `holon incident waive`, `holon guards` exist|
|U1–U3, K-4|LANDED|Manifests + `holon genome sync` (migration 0013) + read API v3 (`api_units`, `api_services`, `api_memory` on memory.db — migration `memory/0003` — so the one-writer law holds); lint genome pack (`bind.service`, `bind.pool`); pooling roots join `scope()` (U2); `holon genome emit` + doctor `genome.stale`/`genome.registry` (U3); lint rejects an unknown `api_version`|
|K-5|LANDED, deliberately narrower than the audit's wording|`msg request --service unit:service` validates the service exists in the registry and names the entry point in the title; the request body stays free text — there is no typed payload field to schema-validate. Defensible; the register's "validated against the genome registry" is the honest phrasing, the audit's "a schema to validate against" overstates what a message request can carry|
|I1|LANDED|Imported outside-reach routines (floor ≥ G3) start disabled (`service.py:1170`, `starts_disabled`); `holon schedule enable` is the per-job word; G0–G2 land enabled by design|
|I5|LANDED|`[pilot] depts` floors outside-reach at G4 on both creation paths: plans (`grading.py:73-77`) and routines (`service.py:1148-1151`); default `[]` changes nothing|

## 2. The open security decision: a guard's command is agent-supplied shell

`_register_guard` takes the fixer's `guard: {name, cmd, timeout}` — a free-form shell string from
an employee's execute result — and the heartbeat runs it forever through `_exec`: as the
`holon-agent` user when isolated (contained), **as the kernel user when isolation is off** — which
is the workstation's state today (ops gap 3). `_check_env` strips the Chair/employee/run
credentials from the environment, but the kernel user can read the Chair key file itself. The
integration audit's design said the guard should register "a check (`[checks.class]` or smoke)
with provenance"; the landed contract (`contract.py:59-62`) blesses the raw command instead.

Attack path: a compromised executor embeds a `guard.cmd` in an incident fix; the verifier passes
the *fix* (the cmd is not what it verifies); the heartbeat then runs that cmd as the kernel user
on every tick. Nothing gates registration or execution on isolation state.

Options (my recommendation is (a) — it matches the audit's design and keeps K-2 usable on the
live instance, which is where incidents will actually land during the pilot):

- **(a)** the contract field becomes a reference: `guard: {name, check, timeout}` where `check`
  names a `[checks.class.<name>]` entry; registration validates it resolves; the heartbeat runs
  the Chair-authored command. Cost: contract field, registration validation, tests, no migration
  (the reference can live in the existing column).
- **(b)** refuse to register (or to run) guards while isolation is off; doctor says so. Five
  lines, but K-2 goes dark on the live instance until the root setup lands.
- **(c)** each new guard waits for Chair confirmation (`holon guards approve`).

## 3. Fixed in this pass (universal repo, commit `e8a2021`)

- **Blockers gate the close-without-verifier paths** (H-03's back half): two conditions in
  `service.py`, two guard tests, one ledger row.
- **The test process can no longer write Chair keys into the operator's real key dir**:
  `tests/helpers.py` pins `HOLON_CHAIR_KEY_FILE` for the whole process (KernelCase still narrows
  per test). The pass found the real dir at ~170 files (the live instance claims one); the
  conformance suites had been pinned to their scratch dirs by H-14e, the wider test process had
  not. Guard `test_no_test_process_writes_chair_keys_into_the_real_key_dir` + ledger row. Six
  controlled full-suite runs with a key-dir watcher: no further leak from this checkout.
- **CLI-boundary guards for H-13 and H-06** — the landed tests were API-level only.

## 4. Residual notes (no action forced)

- **gc is manual**: the organization never collects by itself; the Chair runs `holon gc` (dry run
  first). If that bothers the pilot, a doctor line when configured retention is overdue is ten
  lines — say the word.
- The integration audit's ledger rows cover H-01/H-02/H-09 only; H-03..H-08 and H-10..H-14 carry
  guard tests without ledger rows. Defensible (rows are for defects a real run found; those three
  came from live probes), noted for consistency.
- Run directories of work that never closes are never collected — per the audit's own spec
  ("N days after their work closes").
