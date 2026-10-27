# Packet — quant-trading (Phase 1, pattern pilot)

**Pool:** `organism/organism/ventures/quant-trading`
**Charter:** Autonomous trading system ($100 to $1M).
**Protocols:** 4. **Scripts:** 7. **Checks:** 2.

## Why this pool is Phase 1

Smallest complete pool with a real charter, no rename hazard, and no
`[ops]`-infrastructure work inside it. It is where you prove the packet procedure
before the two 15-protocol pools.

## The hazard the survey corrected mid-flight

The plan called this pool "hazard-free". **It is not**, and that error is exactly
the kind this packet exists to catch:

| Protocol | Corpus `status:` | Registry | Consequence under the importer |
|---|---|---|---|
| `daily-live-monitor` | active | **active** | imports (correct) |
| `weekly-saas-metrics` | active | **active** | imports (correct) |
| `monthly-retrain` | **superseded** | **absent — no routine at all** | **imports ACTIVE — the tuple gap** |
| `weekly-reconciliation` | **superseded** | **absent — no routine at all** | **imports ACTIVE — the tuple gap** |

The two retired entries are not merely paused: **no routine for either exists in
the live registry**. They are corpus-only artifacts of work the live system no
longer carries. That makes this pool's ruling unusually clean — there is no
registry row to contradict the corpus's own `superseded`, so here the corpus is
simply right and the kernel is wrong. Two of four protocol files describe work
that no longer runs, and §2.2 would import both as active. So this pool is a live
reproduction of the defect inside the smallest candidate. **Do not let the dry
run's import count teach you all four are live work.**

## Deliver

1. The dry run, with the registry `generatedAt` date quoted:

```sh
cd ~/Documents/github/my-projects/holon-personal
mkdir -p /var/tmp/ishanp-agentic/pkt-scratch
python3 -m holon --home /var/tmp/ishanp-agentic/pkt-scratch --json venture import \
  ~/organism/organism/ventures/quant-trading --dept quant-trading
```

`--json` is a **global** flag and goes before the subcommand: `holon --json
venture import …`. Placing it after the subcommand is a usage error.

2. A table of all four protocol files with: corpus `status:`, registry status,
   the cadence the live routine declares — and for the two retired entries, an
   explicit note that **no routine exists**, so cadence is `n/a` rather than blank.
3. Confirm the tuple gap reproduces: `monthly-retrain` and `weekly-reconciliation`
   import as active because `superseded` misses `holon/cli.py:846`'s tuple. Name
   the line. This is the §2.2 evidence the Chair needs before ruling on whether to
   fix it.
4. Whether the pool's 7 `scripts/` and 2 checks survive the dry run intact, and
   whether any script carries a literal `$HOME` expansion or an absolute path from
   the VPS (the survey found that corruption class in two other pools).
5. The recommended department shape contribution: does a trading charter belong in
   its own department, or with `saas-studio`'s productized-offering charter?
6. Whether the two `checks` map onto anything in the kernel's `[checks.class]`
   vocabulary, or are free-form.

## Stop conditions

- Stop if the dry run imports `monthly-retrain` or `weekly-reconciliation` as
  active. Report the tuple gap as the cause (plan §2.2) rather than treating it as
  a routine skip.
- Stop rather than editing the corpus file to change its `status:`. The corpus is
  B-side source; the survey did not authorize edits to it.
- Never `--apply`.
