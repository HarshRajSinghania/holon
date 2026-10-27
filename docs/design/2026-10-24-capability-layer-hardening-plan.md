# The capability-layer hardening plan

**Written:** 2026-10-24
**Source:** `docs/design/2026-10-24-identity-operationalizability-redteam.md`, whose final section
classified the five findings into capability-architecture gaps (any unit inherits them) and our
setup gaps (identity only). **This plan is the capability half only.** The two identity-half items
(create the `identity-core` department; give `identity validate` a non-proposer principal) are
listed at the end as out of scope here, with the reason.

**Why this order:** every finding was reproduced against a real tree with a control, and in each
case the control proved the defect belongs to the layer and not to identity. So the iteration is
scoped to the layer: five fixes, each testable without identity existing.

**How to red-team this after execution:** each fix below names the *negative control* — the
assertion that must FAIL on the pre-fix code. If the control does not fail, the test is not
testing the fix. Every fix's test was written to fail first; the doc records that it did.

---

## Fix 1 — health applies to every unit category, not only surfaces

**Gap:** `holon/integrity/doctor.py:164-178` is C3 and does exactly the right thing: it reads a
smoke result named `<unit>:<service>` and reports
`WARN surface.down — its health probe failed (exit N) — pooled by: <depts>`. But `:170` is
`if u["category"] != "surface": continue`, so every `service`-category unit is invisible to the
only mechanism that reports a dead capability. Measured with a control clone differing only in
that field: the surface clone warned, the `service` original stayed silent, same exit-127 command.

**Change:**
- Drop the category guard. The check is about a *declared health probe failing*, which is
  category-independent.
- Rename the finding key from `surface.down` to `unit.down`, keeping `surface.down` accepted as
  an alias so any existing operator tooling or test matching the old key still passes.

**Acceptance:** a `service`-category unit whose `<unit>:<service>` smoke check fails produces a
finding naming the unit, the exit code, and every department that pools it.

**Negative control:** on the pre-fix code the same scenario yields zero findings (proven).

## Fix 2 — a service command must resolve

**Gap:** `holon/bylaws/units.py:143-172`'s `validate()` requires a service to have an `id` and a
`command`, but never checks the command is executable. A manifest can declare a dead capability
and pass `bylaws sync`, `bylaws draft`, `bylaws promote` and `holon lint` clean. Meanwhile
`holon/execution/briefs.py:48-53` resolves `holon` with `shutil.which` to decide what to put in
the agent's environment, so "installed on PATH" is the assumption — it is just never verified.

**Change:** add a resolvability check to `units.validate()`, reported as a lint problem (not a
sync-refusing parse problem, since a command can legitimately be absent on the machine running
`lint`):
- If the command's first token contains a path separator, resolve it against the filesystem.
- Else `shutil.which()` it.
- A declared `health` command gets the same treatment: it is a command that must exist.

**Acceptance:** a manifest declaring `command = "definitely-not-installed-xyz"` fails lint with
a finding naming the service and the token; a manifest declaring a path to a real executable
passes.

**Negative control:** on the pre-fix code the dead command produced no finding (proven: `lint`
returned 0 errors for a unit whose `identity get` fails).

## Fix 3 — a unit's service binary gets reach, not just a fence slot

**Gap:** `holon/execution/isolation.py:362-377` grants a binary's parent directory as a read so
the agent can execute it, but the loop iterates `drivers.available()` (harness runtimes) and
never a unit's services. The fence half already exists — `holon/execution/service.py:1946` puts
the service's first token into the department's `commands`/`act_commands`, and BYLAWS:225/467
documents that pooled services' entry-point binaries join that fence. So the architecture grants
a unit's binary the right to *run* while granting no ability to *find* it.

**Change:** in `isolation.reach`, for each service of each unit pooled into some department (or
pooled by `*`), take the command's first token; if it resolves (via `which` or an absolute path),
add its parent directory to `reads`. Deliberately read-only: a capability's binary is executable
code the agent runs, the same reasoning already written down for a harness binary at `:367-374`.

**Acceptance:** with the identity unit pooled, `holon isolation plan` (or `reach`) lists
identity-core's `bin` directory among the agent's reads.

**Negative control:** pre-fix, the pooled unit contributed roots (already a read via `read_roots`)
but the loop granted no binary directory, and a bare command resolved to `FileNotFoundError`.

## Fix 4 — a plan's declared reads get a staleness fingerprint

**Gap:** `holon/execution/work.py:481-488` re-hashes the plan's declared `writes` at execute time
and compares to the stored `writes_fingerprint`; `:486` returns not-stale when there is no
`writes_fingerprint`. No reads fingerprint concept exists anywhere (`grep -rn
"reads_fingerprint|read_fingerprint"` → nothing). `service.py:1961-1963`'s `scope_fingerprint`
hashes the *declaration* of roots, not their contents. So a plan that reads mutable state is
never invalidated when that state changes — the exact degradation mode for a capability whose
purpose is to change.

**Change:** mirror the writes mechanism for reads.
- Plan output gains `reads` (declared) and `reads_fingerprint` (computed by `staleness.fingerprint`
  over those reads at plan submission).
- `_stale` recomputes and compares, so a plan whose declared reads changed is sent back to
  planning.
- Fail-open only when a plan declares no reads at all, which stays true for genuinely
  read-free work.

**Acceptance:** a plan declaring `reads = ["<path>"]`; the path changes between approval and
claim; the claim is refused as stale and the plan returns to planning.

**Negative control:** pre-fix, the identical sequence claimed and ran normally.

## Fix 5 — a read-effect route may not name a write-capable binary

**Gap:** `effect` is read in exactly one behavioral place in the whole tree
(`holon/capabilities/context.py:312`, which hides a write route from an observe posture). It
never constrains the command. So `effect = "read"` on a service whose command is a binary that
also mutates is a lie the kernel transmits to agents, and identity's write safety currently rests
on the store's own CLI rather than on the capability layer.

**Change:** the rule that shipped is the narrow form, not the general one described first:
- **As shipped (2026-10-24):** a service declaring `effect = "read"` whose `command` is a bare name
  with no verb after the head is refused by lint. A command that names a verb (`identity get`)
  passes; a command that is a path (absolute or relative) passes, because an operator-addressed
  file has no verb to name. That is `bylaws/units.py`'s `validate()` plus the `bylaws.command`
  family, and it is what caught the identity manifest.
- **Not built, and said plainly:** the general form I first described names a `writes` key on a service — the
  list of verbs the command *can* mutate — so that lint can agree `effect` with the declared verb
  set. **No such key exists anywhere in the tree.** Every `writes` in the codebase is a *plan*
  body's path list, not a service's verb list. The narrow rule was built instead, and it is a
  proxy for the general one: it catches a bare command and cannot catch a command that names a
  read verb while sharing its binary with a write verb.
- The narrower, honest form for identity is to declare verb-pinned services
  (`identity get`, `identity overview`) rather than the bare `identity`, which this plan adopts
  as the recommended manifest shape and records in the acceptance criteria.

**Acceptance:** a unit declaring `effect = "read"` with `command = "identity"` and no verb pin
fails lint naming the route and the reason; a unit declaring `command = "identity get"` passes.

**Negative control:** pre-fix, the bare-command read service passed every gate (proven: the
identity manifest synced, linted and promoted clean).

**Corrected 2026-10-24T18:26Z, and this correction is the reason the remaining-gaps outline-plan
carries a row zero.** The narrow rule fires on any command-group CLI, which is the same shape
`identity` is and the opposite of what it was written for: `sourcehound` and `identity` both take
a subcommand from the user at call time, so a bare head is the *correct* form for a group entry
point and the refused form for `identity`. The evidence that separates them is already in the
manifest — `args` documents the verb set a route may take, while `identity get` hard-codes one
verb. So the rule must read `args`, not token-count, and that is the generalization the outline
plan's row 0 carries.

---

## What this plan deliberately does not do

The two identity-half findings from the red-team report are **out of scope** here, on purpose:

1. **Create the `identity-core` department** (R3). This is the Org Chair's staffing decision, not
   a kernel change, and no amount of capability hardening substitutes for it.
2. **Give `identity validate` a non-proposer principal** (R1). This belongs in
   `foundations/identity-core/bin/identity`, in the B-tree, under the program boundary that keeps
   the store in the organism until the Chair's Tier D/E ruling. It cannot be fixed from this repo.

Both are recorded in the red-team report's table with "who it earns: identity", and both are the
right next step *after* this iteration, because the capability-layer fixes they depend on (a
reachable binary, a health gate that catches a dead one) are what this plan builds.

## Definition of done for the whole iteration

- All five fixes implemented, each with a test whose negative control fails on pre-fix code. *(Re-proved 2026-10-24T21:30Z–22:12Z by removing each fix and watching exactly its own guard fail — see the gaps record §6. Fix 5 has TWO sites and they discriminate differently, which is worth knowing before anyone re-runs the probe: removing the *core rule* (`if rest and not rest[0].startswith('-')`) fails `test_a_read_route_may_not_name_the_whole_mutation_surface`, its own control; removing the *verb-set exemption* fails the two Gap 0 tests instead, because with no exemption a bare name fails always, which breaks the positive case while the negative control still passes. A probe against the wrong site therefore looks like a false pass.)*
- `holon lint` reports 0 errors on a scratch instance with units of both categories. *(Re-verified 22:04Z: read routes naming a verb pass for BOTH a `surface`-category and a `service`-category unit, which is the claim. The live instance's 2 errors are `ref.command` (hermes not on PATH) and `schema.migration` (a migration edited post-apply), both pre-existing and neither a unit-category finding — the claim is about a scratch instance, and it holds.)*
- The full `python3 -m unittest` suite is green. *(Verified 2026-10-24T22:09Z under that exact runner: `Ran 704 tests in 424.875s`, `OK (skipped=10)`. The pytest reading of this same tree is `703 passed, 10 skipped, 4 subtests` — the one-test difference is the four subtests, which pytest counts separately and unittest folds into their parent. Both are green at `650ed71`; a suite number has to name its runner.)*
- This doc is updated in place with the measured outcome per fix — including anything that turned
  out to be wrong, since the standing rule is that validation must be able to withdraw the work.

---

## Measured outcome, written after execution

Every fix below was implemented with its test first failing on pre-fix code, then passing after.
The negative control is stated per fix, and each one was run by reverting the specific change in
the working tree and watching the test fail.

| # | Fix | Where it landed | Negative control (pre-fix) |
|---|---|---|---|
| 1 | health for every category | `integrity/doctor.py`: the `category != "surface"` guard is gone; a surface keeps `surface.down`, every other category reports `unit.down` | `FAIL: ... reported nothing: []` |
| 2 | a dead command is a finding | `bylaws/units.command_problems()` + `integrity/lint.py` rule `bylaws.command` (warning) | `FAIL` |
| 3 | a unit binary gets reach | `execution/isolation.reach()` grants the service binary's directory | `FAIL` |
| 4 | reads get a fingerprint | `execution/work.py`: `reads_fingerprint` at plan submit, compared in `_stale` | `FAIL` |
| 5 | `effect` must agree | `bylaws/units.validate()` refuses a bare command under `effect = "read"` | `FAIL` |

**Tests added** (fail-first, each with a control): `test_a_dead_unit_of_any_category_is_reported_not_only_a_dead_surface`,
`test_a_declared_command_that_resolves_to_nothing_is_reported` (test_bylaws.py, 15 → 17),
`test_a_pooled_units_service_binary_lands_in_the_read_reach` (test_isolation_redteam.py, 16 → 17),
`test_a_plan_whose_declared_reads_changed_is_replanned` and
`test_a_plan_that_declares_no_reads_still_fails_open` (test_pipeline.py, 51 → 53).

**Two things I got wrong on the way, recorded because the standing rule is that validation has to
be able to withdraw the work:**

1. **I first "fixed" Fix 2 by pointing the test fixture's command at an invented absolute path**
   (`<tmp>/bin/kosmos --query`), which made three existing fence tests fail — they assert the
   fence names the entry-point *token* (`["git", "kosmos"]`), and correctly so. That was me
   bending a fixture to silence a finding rather than the finding being wrong. Reverted; the
   fixture keeps its documented bare-name form (`units.py:19` teaches it) and the two
   zero-finding assertions now exclude `bylaws.command` explicitly, with a comment saying why.
2. **My first Fix 1 draft claimed an alias that did not exist.** I wrote in the comment that
   `surface.down` was "kept as an alias" while the code emitted only `unit.down`. The honest
   shape turned out to be cheaper than the alias: keep `surface.down` for surfaces (operator
   tooling matches it) and `unit.down` for everything else. The comment now says that, and the
   test asserts both keys.

**The full suite, measured:** **663 tests OK, 10 skipped** (437s), vs the 657 baseline. The +6
is accounted for exactly, which mattered because a bare count would have implied I added six and I
added five: `test_bylaws.py` 14 → 17, `test_isolation_redteam.py` 16 → 17, `test_pipeline.py`
51 → 53, all mine. The sixth is `a12ed78`, the parallel session's isolation test committed at
06:27 while the suite was still running, so the run picked it up. No failure in either set.

**Live confirmation, not just unit tests:** fixes 2 and 3 were also exercised against the scratch
instance where the identity unit is promoted and pooled by `*`. For fix 3, a probe whose command
pointed at `/usr/bin/git` produced `reads: ..., /usr/bin, /usr/bin/git` in `holon isolation plan`,
proving the grant lands in the applied-ACL plan, not only in a return value. The probe was
reverted and the manifest restored from a saved copy.

**The acceptance criterion caught my own artifact, which is the point of having one.** With all
five fixes in place, `holon lint` on that instance reported **1 error**: the identity manifest
*I had drafted* declared `effect = "read"` with the bare `command = "identity"`, which Fix 5 now
refuses. That is not a false positive — it is the same defect the red-team found, surviving in the
one manifest written before the rule existed. The manifest's `identity` service now narrows to
`identity get` and the instance is back to **0 errors**
(the residual `bylaws.command` warnings are Fix 2 correctly reporting that `identity` is not on
this machine's PATH: the operator install the plan names, not a kernel defect).

**The red-team's own original findings, re-run against the patched code.** A plan that passes its
own unit tests can still fail the attack that produced it, so the original probes were repeated on
the live instance rather than trusted:

| Finding | Pre-fix | Post-fix, measured |
|---|---|---|
| R5: a read route carries write verbs | `command = "identity"` under `effect = "read"` | both routes are verb-narrowed (`identity get`, `identity overview`); the bare binary appears in no route |
| R2: a dead service unit is silent | a `service`-category unit with an exit-127 probe reported **nothing** | `WARN unit.down identity:identity: its health probe failed (exit 127) — pooled by: every department` |
| R2 control: a healthy unit | n/a | a passing `identity:identity` probe reports **no** finding, so the gate is not simply noisy |
| R4: reads have no fingerprint | `grep reads_fingerprint` → nothing | set at plan submit (`work.py:601`), compared in `_stale` (`:490-496`) |

The dead-unit probe was planted directly in the settings table and reverted immediately; the
instance is back to its pre-probe state (2 errors, 1 warning, all pre-existing).

**What is deliberately still open, from the red-team report's own table:** R3 (create the
`identity-core` department, so the sanctioned write-back channel has a destination) and R1 (give
`identity validate` a non-proposer principal, which lives in the B-tree under the Chair's Tier D/E
ruling). Neither is fixable from this repo, and this iteration was scoped to exclude them.

---

## The red-team against the plan itself, written 2026-10-24 (same day)

Seven attacks against my own five fixes. Two landed and were corrected (attacks 1 and 2, recorded
in the git log of `3b12071` and `bc840a5`); attack 5 landed and needed a new producer rather than
a correction; attacks 3, 4, 6 and 7 are recorded here with what they established. A red-team that
only finds things I already knew when I wrote the code is not a red-team.

| # | Attack | Verdict |
|---|---|---|
| 1 | Fix 3's pooling loop | **Landed.** It looped over `units.load()` (every manifest), so a unit pooled by nobody granted its binary to everyone; and `pooled_by` matched `e.other = <slug>` only, so a `pool_of = ["*"]` unit got *nothing*. Replaced with the `capabilities_for` predicate. |
| 2 | Fix 5's token count | **Landed.** `len(tokens) > 1` refused `/usr/bin/browseros-neo` (a path, no verb needed) and accepted `kosmos --query` (a flag is not a verb). Replaced with: exempt a path, accept head + a non-flag argument. |
| 3 | Does anything emit `reads`? | **Landed.** `grep` found no caller anywhere: every `reads` hit was the `[isolation] reads` config or the reach dict. Fix 4 shipped a mechanism with no user. Corrected by teaching the plan brief (`holon/skills/holon-planner/briefs/plan.md`) to declare `reads`, so the fingerprint is reachable. |
| 4 | Fix 2's token resolution | **Landed.** `command_problems` and `isolation.reach` each carried their own copy of the resolution logic and they had already drifted, so a **relative** command resolved against whatever cwd the caller had. Measured: `bin/tool` present in the repo root was runnable from the root and not runnable from `/tmp`, same manifest. One `units.resolve_token` now answers both. |
| 5 | Is a declared `health` ever probed? | **Landed, and it is the deepest one.** C3 read `smoke_results()` looking up `failed.get("<unit>:<service>")` and `capabilities/context` marked a route `(down)` from the same name. Nothing wrote it: smoke checks came only from the instance config's `[smoke]` block. Fix 1 fixed a consumer that had no producer, and the docstring at `doctor.py:166` had asserted a `[smoke.dept.platform-ops]` convention that did not exist. The producer now exists in `smoke_checks`, derived from the manifest's own `health` field. |
| 6 | Does Fix 3's grant survive ACL ordering? | **Did not land, recorded so it is not re-run.** The chain pass does deny new files in the binary directory (`-d -m u:---`), but the target pass then applies `-R -d -m rX` to the same directory, and last-applied wins. The test asserts the ordering, and only inspects the plan as data. |
| 7 | Re-audit this doc | **Landed.** One withdrawn claim: `doctor.py`'s comment (and by implication this plan) implied Fix 1 made health work by dropping a guard. It did not; nothing ran the probe. See attack 5. |

**Three things I got wrong in this pass, recorded against the same standing rule:**

1. **My first attack-6 test ran `setfacl`.** It applied the plan's ACL list to a real tree, and
   `setup_plan` resolves the agent's home through `pwd.getpwuid`, so the test reached
   `/home/ishanp` and its `.jcode` sibling. Fortunately no `holon-attack6` user existed, so every
   command failed and `getfacl` confirms the directory's ACL is unchanged (no named-user entry).
   The test was withdrawn and rewritten to inspect `plan["acl"]` as data. The lesson is not "be
   careful": a test that mutates the operator's home has no place in a suite that runs unattended.
2. **My attack-6 assertion was wrong about what a deny is.** I classified any command containing
   `u:<agent>:---` as a deny, which caught the chain pass's *default* ACL. A default ACL governs
   only files created later, and the target pass overrides it anyway. The test now asserts the
   ordering that actually settles it.
3. **Attack 3's fix was initially cosmetic.** I added "declare `reads`" to the plan brief's rule
   text but not to its JSON shape, so an agent applying the rule would have emitted a plan with
   `reads` in it that nothing downstream parsed. Both the rule and the shape were changed.

**Suite, after the red-team:** **683 tests OK, 10 skipped** (407s). `test_bylaws` 19,
`test_isolation_redteam` 20. The two tests added in this pass are
`test_a_declared_health_probe_is_run_by_something` (attack 5: the producer — verified to fail when
the emitting block is deleted) and
`test_the_reachable_command_question_does_not_depend_on_the_cwd` (attack 4: verified to fail when
the resolver is downgraded to its `exists()`-only form).

**An earlier draft of this section listed a third test, `test_one_token_resolver_serves_lint_and_the
_reach_grant`, and it was removed: it passed on the pre-fix code too, so it proved nothing. A test
that cannot fail is decoration, and listing it would have overstated what this pass established.**

---

## Gap 0, executed the same day (2026-10-24T19:11Z), commit `fcfd820`

Row zero of `2026-10-24-remaining-gaps-outline-plan.md` is done, so it is recorded here with its
measurement rather than left as a prescription.

**What changed.** `holon/bylaws/units.py`'s read-route rule now asks the manifest for what it
already declares: a **bracketed** `|`-alternation in the service's `args` — `<a|b>` or `[a|b]` —
exempts a bare command, because that alternation is the verb set the route may be given. A bare name
whose `args` is absent, or names only flags (`tool [--json]`), still fails.

**And what its own red-team narrowed afterwards.** My first pattern accepted an `|`-alternation
*anywhere* in `args`, in any of three shapes including a bare `a | b`. Measured against
near-misses that was a silent hole in the exact rule meant to prevent one:
`… --json then | jq`, `--sep "|" for the field separator`, and `<query> (a|b as a regex)` all
contain a pipe and none names a verb set, so a manifest could exempt a mutation surface by
mentioning a pipe in prose. The exemption is now the bracketed form only — how a call shape writes a
choice and how nothing else is written. The unbracketed run is refused, which costs a documentation
style nobody uses and closes the hole. Guarded by
`test_a_pipe_in_prose_is_not_a_verb_set`, which fails on the wider pattern.

**Measured on a scratch instance, with `browser.toml`'s `sourcehound` service written verbatim:**

| the same service, three `args` | result |
|---|---|
| `sourcehound <search|read|news|papers|social> <query|url> [--json]` (the live value at 19:11Z) | **CLEAR** |
| `args` removed entirely (the original defect) | **refused** |
| `sourcehound [--json]` (a flag bracket, not a verb set) | **refused** |
| `sourcehound --json then | jq` (a pipe in prose) | **refused** |

**And measured again on the live instance at 19:38Z, which corrects a hedge in the first version of
this section.** I had written that the live count would not change because "the instance's own copy
of the kernel is what would have to move". That was wrong: `readlink -f ~/.local/bin/holon`
resolves to `my-projects/holon/bin/holon`, whose ROOT is this checkout, so **the live instance's
lint runs this working tree.** `holon --home ~/holon lint --strict` now reports **2 errors, 1
warning** and the missing one is `sourcehound`. The scratch instance is what proves the *hole* cases
without anyone editing the live manifest to demonstrate them.

**The disproof.** Deleting the exemption fails exactly
`test_a_read_route_whose_args_name_its_verbs_is_not_refused_for_a_bare_command`.

**The suite, stated without borrowing the number.** The full run at `fcfd820` was **688 tests, 3
failures, 10 skipped**, and the 3 failures are all in `tests/test_integrity` — a
`docs/COMMANDS.md` drift the parallel session owns. Proved pre-existing rather than assumed: the
same 3 fail with `HEAD~1`'s `units.py` restored in place of mine. My commit added exactly **+1**
test to `test_bylaws` (14 → 21 there over the whole iteration) and touched one rule, so the 688 is
not mine to claim and is not claimed here.

**And one thing this pass got wrong about its own predecessor, recorded because the standing rule
is that validation has to be able to withdraw the work:** the hardening plan above describes a
`writes` service key as Fix 5's "concretely and minimally" form. **No such key exists anywhere in
the tree** — every `writes` in the codebase is a *plan* body's path list, not a service's verb
list. What shipped was the narrow bare-command rule, which catches a bare command and cannot catch
a command that names a read verb while sharing its binary with a write verb. The doc above now
says which of the two exists, and the general form stays unwritten rather than implied done.
