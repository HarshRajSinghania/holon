# Red-team: identity as an operational capability for autonomous venture work

**Date:** 2026-10-24
**Subject:** `identity` (the unit proposed in `2026-10-23-identity-unit-and-migration.md`) read
for one purpose only: can an autonomous agent in a venture/project department consume WHO Ishan
is, and can what it learns flow back so the capability improves itself, without a human in the
loop and without the store being damaged.

**Method:** the holon source in this repo plus a live instance (a scratch home at
`/tmp/holon-live-2Esw` where the identity unit is promoted and pooled by `*`; it is identified
by a ULID instance id, not a friendly name). Every finding names `file:line`. What I could not
verify is listed at the end rather than assumed.

**Verdict up front:** the *reads* are sound and the *boundary* holding them read-only is real. The
*evolution* half of the mandate is not built: there is no path by which a signal an agent learns
about identity reaches the store, and one path that exists (`identity propose` + `identity
validate`) lets an agent ratify its own change because the CLI has no notion of a principal.

---

## What holds up (so the fixes are not a rewrite)

1. **The pooled root is read-only, structurally.** `holon/bylaws/units.py:1945` joins a pooled
   unit's roots into the department's `read_roots`, never its writable `roots`. Measured on the
   live instance: a venture department's computed scope puts identity-core into `read_roots` and
   contributes nothing writable.

2. **That classification is enforced at the filesystem, not by trust.**
   `holon/execution/isolation.py:352-379` splits reach into `writes` (`rwX`) and `reads` (`rX`),
   and `:419` emits `setfacl` targets in that order. `isolation.py` contains no reference to
   grade, task class, or authority anywhere, so **no autonomy widening can ever convert a pooled
   root into a writable one.** Widening who may approve a change is orthogonal to what a process
   may write. That is the property the whole design rests on and it holds.

3. **A rogue write is caught twice.** `holon/execution/grading.py:62` floors any `writes` entry
   inside a `read_roots` path at G3 ("work for its owner, msg request"), and `:84` does the same
   for a claimed durable `artifact`. Plus the existing mutation-verified guard
   `tests/test_isolation_redteam.py:273` asserts the plan's *last* `setfacl` for a path never
   grants a write that `reach()` classifies as read-only. I ran it: green.

4. **An unknown owner fails loudly.** `holon/execution/org.py:114-117` raises
   `LookupError: no department <ref>`. Work is never silently dropped into a void.

5. **The CLI's own write guard is real.** `foundations/identity-core/bin/identity:363-365`
   refuses a dialectical change through `set` ("Dialectical changes require: identity propose →
   identity validate (Rule 7)") and `:367-370` runs an antithesis collision guard. I probed
   `identity set --path values.creativity --value 9.9` from an arbitrary cwd and it was refused.
   A careless write is not possible; only a *ratified* one.

---

## Findings

### R1 — an agent can ratify its own identity change (the self-evolution mandate is unguarded)

`foundations/identity-core/bin/identity` has **no principal, token, or auth check anywhere**
(grep for `principal|auth|token|uid` in that file returns nothing but the `uuid` import).
`cmd_propose` (`:389`) writes a proposal file and `cmd_validate` (`:436`) calls
`_apply_proposal` (`:407`, "Only mutation path into the dialectic (Rule 7)") and marks it applied.

So the two halves of Rule 7, designed as *proposal* then *human validation*, are reachable by the
same actor. A venture agent that learns "the candidate should only target 200k+" roles can file
the proposal and apply it. It needs only `--reason`.

The dual-writer rule this was meant to encode (ID-AD-003, single writer) is not enforced by any
mechanism, and holon's `owner` field is **documentation only**: `holon/bylaws/units.py:73` stores
it, `context.py:309` renders "kept true by {owner}" into the brief, `lint.py:637` exposes it, and
no code anywhere branches on it. There is no owner-side gate.

*Demonstrated and reverted:* I filed a probe proposal into the canonical store, confirmed the
shape of the gap, then removed both the proposal file and its `changelog.jsonl` line.
`git status` on `identity-core/data/` is clean. This was a read of the mechanism, not a defect I
introduced.

**Fix:** make `validate` require a principal that is not the proposer. The pieces already exist:
`holon/execution/drivers.py:192` puts `HOLON_RUN_TOKEN` into the agent's environment and
`holon/execution/isolation.py:226` passes the run environment through to the agent process. An
agent therefore *does* carry an authenticated identity, and `identity` can require it:
`identity validate --as <principal>` where the principal is resolved through the broker, and a
proposal whose `source == <the validating principal>` is refused as self-ratification. Minimum
viable version: `identity validate` refuses unless the caller passes `--reviewer`, and the
changelog records reviewer separately from source.

### R2 — the service command cannot resolve, so the capability is dark for isolated agents

The manifest declares `command = "identity"` (`identity.toml`, both services). That is a bare
name. The isolated runner's PATH is
`isolation.py:472` → `%h/bin:%h/.local/bin:/usr/local/bin:/usr/bin:/bin`. The organism's
`identity-core/bin` is in none of those.

Proven: `env -i PATH=/usr/local/bin:/usr/bin:/bin sh -c 'identity get'` →
`FileNotFoundError: 'identity'`. The declared `health` (`identity get >/dev/null`) fails the same
way. So an agent in an isolated department gets a route in its brief that cannot execute.

Note the non-obvious part: the reach loop that grants a binary's directory
(`isolation.py:362-377`) iterates **`drivers.available()` only**, i.e. harness runtimes. It never
covers a unit's service commands. The identity *tree* is readable (it is a pooled read_root, so
`bin/identity` is inside it and gets `rX` recursively), but nothing puts it on PATH.

**Fix (either is sufficient, the first is smaller):**
- declare `command` as an absolute path in the manifest, so no PATH resolution is needed; or
- grant the binary's directory explicitly for pooled units: in `isolation.reach`, for each unit
  service whose `command`'s first token has no `/`, resolve it and add its parent to `reads`.

And regardless: **the one mechanism that would catch a dead service command is gated to `category
= "surface"`.** `holon/integrity/doctor.py:164-178` is C3, and it does exactly what this needs:
it takes a smoke result named `<unit>:<service>`, and on failure reports
`WARN surface.down — its health probe failed (exit N) — pooled by: <depts>`. But `:170` is
`if u["category"] != "surface": continue`, so a `service`-category unit is skipped entirely.

**Measured with a control, not inferred:** I cloned the identity manifest to a second unit
identical except `category = "surface"`, added one `[[smoke.checks]]` named
`identity-probe:identity` with the body's own failing `identity get >/dev/null`, and ran doctor.
The surface clone reported `WARN surface.down ... (exit 127) — pooled by: every department`; the
`service` original reported **nothing**. Same unreachable command, opposite outcome, decided by
one line. (Both probe artifacts were then removed; the scratch instance is back to 2 errors /
0 warnings.)

So the fix for the health half is not "build health" — it is to extend an existing, working check
one category: drop the `category` guard, or lint-require that every pooled `service`-category unit
has a `<unit>:<service>` smoke check in its owner department's config.

**Is this a capability-architecture gap or an identity gap?** It straddles, and the split matters
for planning:

- **Architecture** — the reach loop that grants a binary's directory (`isolation.py:362-377`)
  iterates `drivers.available()` only, so no unit's service binary is ever granted on its own
  merits; and `bylaws/units.py:validate()` checks a service has a `command` but never that the
  command resolves. Any unit declared like this ships dark. BYLAWS:225/467 even says pooled
  services' entry-point binaries join the terminal fence, so the intent exists and the reach half
  of it is missing.
- **Doc-convention, not my drafting error** — `holon/bylaws/units.py:19` teaches the bare-name form
  (`command = "kosmos --query"`), and `briefs.py:48-53` assumes installed tools are `which`-able
  (it resolves `holon` that way for the env it hands agents). `kernel_env`
  (`briefs.py:55-58`) sets only `HOLON_HOME`, `PYTHONPATH` and `HOLON`, never PATH. So the
  documented convention *requires* the operator to have the tool on PATH, and nothing in the
  architecture verifies that happened.
- **Identity setup** — identity was declared `category = "service"`, which places it outside the
  health gate that already exists.

### R3 — the write-back channel has no destination

`identity-core` is named as the unit's `owner`, but there is no such department. On the live
instance `SELECT slug FROM departments` returns only `executive`. So the sanctioned channel
("writes go through `msg request`", `units.py:182`) resolves to
`LookupError: no department identity-core` for every agent that tries it.

Loud, not silent, which is the right failure mode, but it means the feedback loop the mandate
asks for has no receiving end. An agent with a genuine correction has: (a) `msg request`, which
errors; (b) the direct CLI, which works and is unguarded (R1). It will pick (b).

**Fix:** create an `identity-core` department (or map the owner to an existing steward
department) with an employee whose stages include the review of identity proposals. Then R1's
principal check has somewhere to route: a proposal lands there, that employee validates it, and
the changelog records two distinct actors.

### R4 — a change to identity does not invalidate a plan that relied on it (fail-open)

`holon/execution/work.py:481-488`: staleness is detected by re-hashing the plan's **`writes`** at
execute time and comparing to the stored `writes_fingerprint`. `:486` returns `False`
(not stale) when there is no `writes_fingerprint`. An agent whose job is "draft this application
using the candidate's profile" declares *reads* of identity data, so it has no fingerprint, so an
identity change between plan approval and execution is invisible. This is the exact failure mode
for a capability whose whole point is that it changes.

`service.py:1961-1963` `scope_fingerprint` hashes `self.scopes()` (the *declaration* of roots and
read_roots), not their content, so it does not cover this either.

**Fix:** fingerprint reads too. The clean form is to include the pooled units' declared
`health`/content digest in the fingerprint, or simpler: hash the identity store's
`data/NUMBER-FAMILIES.md` + candidate profile mtimes (the freshness ladder's own inputs) and compare
at claim. The staleness module already handles "path is a directory" (`staleness.py:114-115`) and
already fails open on unhashable entries, so this is a data-source change, not new machinery.

### R5 — the manifest's `effect` does not constrain the binary

Both services are declared `effect = "read"`, and `capabilities/context.py:312-313` correctly
withholds a write route from an `observe` stage. But `effect` only filters which *stage* sees the
route; the declared `command` is still the whole `identity` binary, whose verb list includes `set`,
`propose`, `validate`, `reject`. In an `execute` posture the route is offered, and a bare
`identity` invocation can carry any verb.

The CLI's own guard (finding "what holds up" #5) is what actually stops a careless change here,
which is load-bearing and should be said plainly: **identity's write safety currently rests on the
store's own CLI, not on holon.** That is the wrong layer for a capability being promoted into an
autonomous org.

**Fix:** declare read-only verbs as separate, narrower services whose commands pin the verb
(`identity get`, `identity overview`), and do not offer a service for any mutating verb. That way
`effect` and the command agree, and a write becomes impossible through the capability surface
rather than merely discouraged.

---

## Priority

| # | Finding | Blocks the mandate? | Fix size |
|---|---|---|---|
| R1 | self-ratification via `propose`→`validate` | **yes** | small, needs a principal in the CLI |
| R3 | no owning department | **yes** | small, one department + one employee |
| R2 | command unresolvable + `health` inert | **yes** (capability is dark) | small |
| R4 | reads are fail-open for staleness | no, but it is the "evolves" half degrading | small |
| R5 | `effect` does not constrain the command | no (CLI guard covers it today) | small |

All five are small. The conclusion is that identity is *close* to operationalizable as an
evolving capability: the hard structural part (a pooled root that no autonomy setting can make
writable) is already correct and mutation-verified. What is missing is the receiving end (R3) and
a trusted reviewer (R1), after which the loop closes: agent learns → `msg request identity-core`
→ that department's employee validates → `identity validate --as <employee>` → changelog records
two actors → the next plan's fingerprint (R4) sees the change.

---

## Architecture gap or our setup gap?

The question that decides the next iteration's scope, answered by testing whether each finding
reproduces for *any* unit or only for identity. The test is a control, not a judgement.

### Capability-layer gaps (any unit declared the documented way inherits these)

**R5 — `effect` never constrains the `command`.** `effect` is read in exactly one behavioral
place in the whole codebase: `capabilities/context.py:312`, which hides a write route from an
observe posture. It is stored (`bylaws/units.py:134`), required on surfaces
(`:155`), rendered (`:232`) and emitted (`:286`) — and never used to restrict execution. A unit
declaring a read service on a write-capable binary is unconstrained for every category. This is
not identity's shape; it is the layer's.

**R4 — reads have no staleness fingerprint.** `grep -rn "reads_fingerprint|read_fingerprint"` over
the whole tree returns nothing: the concept does not exist. `execution/work.py:486` returns
not-stale when a plan carries no `writes_fingerprint`, and a plan whose declared inputs are reads
has none. `service.py:1961-1963`'s `scope_fingerprint` hashes the *declaration* of roots, not their
contents. Any task whose work depends on reading a mutable source — every venture task that reads
the candidate profile — is affected.

**R2's reach half — a unit's service binary is never granted on its own merits.**
`execution/isolation.py:362-377` grants a binary's parent directory as a read, but it iterates
`drivers.available()` (harness runtimes) and never a unit's services. And
`bylaws/units.py:validate()` requires a service to have a `command` but never checks that the
command resolves. So a manifest can declare a dead capability and pass every gate. Note the
architecture already *intends* the other half: `service.py:1946` puts the service's first token
into the department's terminal command fence, and BYLAWS:225/467 documents that pooled services'
entry-point binaries join that fence. The fence half exists; the reach half does not.

### Our setup gaps (they stop at identity)

**R3 — no identity-core department.** Nothing in the architecture is broken; the org simply has
no department standing behind this unit. Creating it is configuration.

**R1 — identity's CLI carries no principal.** Also configuration, in the sense that it is this
pool's code rather than the kernel's. But its *shape* is architectural and worth stating plainly:
**C5 (`docs/design/2026-10-16-platform-ops-capability-system.md:105-108`) says "Discovery is
entitlement … Hard enforcement stays boring and existing … No new kernel enforcement surface is
built."** The kernel renders a unit's command as text into a brief
(`capabilities/context.py:320`) and never executes it, and the broker only ever runs `holon`
commands (`isolation.py handle_broker` → `cli.main`), with the forwarding hook living inside
`holon`'s own CLI (`cli.py:1967-1973`). So a unit's own binary is *structurally outside* the
kernel's principal model, and the design deliberately leaves authentication to the unit.
Which means: the kernel's principal model (`execution/security.py`: run tokens, employee keys,
Chair key) is available to a unit that wants it — `drivers.py:192` puts `HOLON_RUN_TOKEN` in the
run environment and `isolation.py:226` passes it through — but nothing requires a unit to look.

### The borderline, and why it is the interesting one

R2's health half is a shared-mechanism gap that only *looks* identity-specific. C3
(`integrity/doctor.py:164-178`) implements exactly the right check — it reads a smoke result named
`<unit>:<service>` and reports `WARN surface.down … its health probe failed (exit N) — pooled by:
<depts>` — but `:170` is `if u["category"] != "surface": continue`. Measured with a control
clone that differed only in that one field: the surface clone produced the warning, the
`service` original produced nothing, same dead command. So this is a one-line architecture fix
whose blast radius is every `service`-category unit, of which identity is simply the first.

### What the scope means for the next iteration

| Fix | Layer | Who it earns |
|---|---|---|
| health for every unit category (doctor.py:170) | capability | every unit |
| require a service command to resolve (validate/lint) | capability | every unit |
| grant a unit service binary's directory in `reach` | capability | every unit |
| fingerprint a plan's reads for staleness | capability | every task that reads mutable state |
| make `effect` agree with the command (verb-pinned services) | capability + manifest | every unit |
| identity-core department exists | ours | identity |
| identity `validate` requires a non-proposer principal | ours | identity |

The first five are the capability layer and are the ones that earn the whole venture fleet. The
last two are what make identity specifically work — and they are small enough to land in the same
iteration, but they should not be the point of it.

## What I did not verify

- **Live isolated execution.** No `agent_user` is configured on this instance, so I could not
  exercise a real ACL-applied, broker-mediated run. R2's PATH failure is proven by reproducing the
  runner's exact PATH from `isolation.py:472`, and the reach/boundary claims are proven from the
  code plus the ACL invariant test, but "an isolated agent runs `identity` and fails" is a
  reproduction, not an observation.
- **Whether a venture department actually declares identity in its scope on a production
  instance.** I used a computed scope for a hypothetical department plus the live `pool_of=["*"]`.
- **The Chair's Tier D/E ruling** on promoting the unit, which is still pending and is what makes
  any of this live.
