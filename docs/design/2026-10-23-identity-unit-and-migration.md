# The identity unit: how WHO Ishan is enters Holon

**Date:** 2026-10-23. **Owner:** `docs/design/` (this document).
**Supersedes:** nothing. **Feeds:** `docs/STATUS.md` §6, and the Chair's promotion ruling.

## The question

Holon describes people through the bylaws layer: one manifest per unit at
`$HOLON_HOME/bylaws/units/<slug>.toml`, declared not registered, derived into a registry
(`bylaws sync` → `bylaws emit`) and checked by lint. Exactly one unit exists today — `browser`,
a *surface*. The question this document answers is what an identity unit looks like, and what
must be true before it is promoted.

**The short answer: it is a `service`-category unit, its services are all `effect = "read"`,
and its `roots` are the store's absolute path — so nothing about the migration is a data move.**

## Why the bylaws layer is the right shape, and not merely the available one

Three mechanisms already encode exactly what identity needs. They are not incidental; they were
built for this class of problem and they are enforced in code, not prose.

| the law | where it lives | what it does for identity |
|---|---|---|
| a pooled unit's roots join `read_roots`, never the writable `roots` | `holon/execution/service.py:1945` (BYLAWS §14: "presence and reads, never the pen"; doctrine prose at :1937-1938) | consumers get the store for free and cannot write it. Identity's single-writer rule (ID-AD-003) becomes structural rather than conventional. |
| `effect = "write"` services are offered to act stages only; an `observe` posture skips them | `holon/capabilities/context.py:312` (R-03) | the CLI's write verbs cannot appear in a read posture at all |
| an empty `commands` list means *ungoverned*, not deny-all | `service.py:1947`, `test_bylaws.py:173` | a department that pools this unit is not silently fenced |

The third matters because it was the premise of my own first reading of the importer defect:
I had claimed the CLI would become unreachable after import. It does not, and the kernel's own
test says why.

## The manifest

Proposed as `identity`, drafted via the sanctioned employee path (`units.draft`, which writes to
`bylaws/drafts/` and changes nothing until the Chair promotes it). **Validated on a scratch home:
`bylaws sync` reports 1 unit / 2 services, `holon lint` reports 0 errors.**

The `roots` below are written in the repo's tilde convention (`~/.hermes/organism/…`, the same form
`2026-10-17-wave1-decision-packet.md` uses for this same pool), because a doc that names an
instance's home path trips lint's `scrub.home` warning. On this machine the store resolves at
`~/organism/organism/foundations/identity-core`, which is what `roots` must hold when promoted.

```toml
charter = "WHO Ishan is: the canonical aspect store, its single-writer CLI, and the three projections consumers read. Reads only - every mutation goes through the CLI in identity-core, the owning pool (BYLAWS §14: presence and reads, never the pen)."
category = "service"
tier = "foundation"
roots = [
  "~/.hermes/organism/foundations/identity-core",
  "~/.hermes/organism/foundations/identity-core/sub-systems",
]
pool_of = ["*"]
consumed = []
owner = "identity-core"

[[services]]
id = "identity"
command = "identity"
accepts = "an aspect name, or a verb: get/aspects/dialectic/purpose/vision/history, and overview for the cross-domain self-model"
returns = "json on stdout; the aspect's current contents"
effect = "read"
note = "the sole mutation surface for WHO Ishan is. Read it, do not copy it: a projection that mirrors these facts goes stale silently"
health = "identity get >/dev/null"

[[services]]
id = "identity-overview"
command = "identity overview"
accepts = "nothing; the cross-domain self-model"
returns = "the rendered overview: contact, active values, dialectic counts, roles, services, subjective verdict"
effect = "read"
note = "the single call that answers 'who is the candidate' for a brief; its smoke check is cli-overview-live (V-89)"
health = "identity overview >/dev/null"
```

Two deliberate choices in it:

- **`pool_of = ["*"]`.** The real consumers are four pools (`career-pipeline`, `freelance-agency`,
  `credibility-funnel`, `strategy-incubator` — measured across 7 symlinks), and lint requires every
  `pool_of` name to be an existing department. Only `tools` and `pioneer` exist today, so naming
  them would fail lint for the wrong reason. `["*"]` is honest: org-wide reads, and the Chair can
  narrow it when the venture departments exist.
- **`consumed = []`.** The identity pool already declares `logbook` as a consumed service, but no
  `logbook` unit exists yet, and `bind.service` lint refuses a `consumed` ref no unit offers. The
  binding is left unwritten rather than wrong.

**The write verbs are deliberately absent from the manifest.** `set`, `propose`, `validate`,
`reject`, `values add/amend/deprecate` and `emit-*` stay in the owning pool and are reached by the
CLI there, not offered as routes. That is the point: the migration grants reads, not the pen.

## What must be true before the Chair promotes this

In dependency order. The first three are done, on 2026-10-23; the last is the Chair's.

1. **The store's cross-domain verb must work.** It did not: `identity overview` crashed reading a
   retired `values.md` on every call, and `smoke.yaml`'s check ran only `identity get`, so the
   pool's gate passed with the crash in place. Fixed, and a `cli-overview-live` check added. A dead
   verb imported as a unit would have been reported healthy.
2. **The count families must have an ordering.** Four documents quote a repository count under
   three counting rules, measured on four days. `identity-core/data/NUMBER-FAMILIES.md` holds the
   ordering (freshest dated row wins: 104 total / 67 public, 2026-10-05) and the A-side pointer is
   in `docs/CV-VARIANTS.md`'s status rule.
3. **The consumer chain must read its declared source.** Both fit-specs declared
   `source_of_truth.profile` and nothing opened it. `core/fit.py` now resolves it, and the
   seniority/experience reasons cite the profile instead of hardcoded literals.
4. **The Chair's Tier D/E ruling.** Identity-core stays in B until then. A consumes by absolute
   cross-tree reference, which is what this manifest's `roots` is.

Note what is *not* on the list: no copy of the store, no A-side identity KB (the plan's Phase 4.4
says do not seed one), and no merge of the engine scripts.

## What the migration is not

The store stays byte-identical across four pools and seven symlinks. Pooling is the organism's own
pattern; this manifest is the same pattern in Holon's terms. Copying the store would break it twice,
once in the organism and once here.

## Verification record

| check | result |
|---|---|
| `identity overview` | exits 0, renders 7 active values from `values.yaml` |
| `identity get/aspects/dialectic/purpose/vision/values list/emit-values` | all exit 0 |
| identity-core smoke (9 checks) | all green, including the new `cli-overview-live` |
| negative control (retired path restored) | `overview` exits 1, so the new check catches the regression |
| opportunity-recon suite | 232 tests OK (was 229; 3 new, 1 pre-existing skip) |
| `holon bylaws sync` on a scratch home | 1 unit, 2 services |
| `holon lint` | 0 errors (5 pre-existing scrub warnings, unrelated) |
| `holon bylaws emit` | registry written |
