# Packet — credibility-funnel (Phase 5)

**Pool:** `organism/organism/ventures/credibility-funnel`
**Charter:** Agentic Engineering Authority — public proof + monetization surface
for the Agentic AI System.
**Protocols:** 6. **Scripts:** 0. **Checks:** 7. **Outside reach:** 4 of 6 (measured: `ta-research-concept-cluster`, `ta-research-framework-synthesize`, `ta-research-note-distill`, `ta-research-source-intake` — an earlier survey reading said 1 and was wrong).

## The measured state — the same pattern as the machinery pools, with the lie reversed

| Protocol | Corpus `status:` | Live routine | Live status |
|---|---|---|---|
| `drift-watchdog-weekly` | paused | `drift-watchdog-weekly` | **active** |
| `state-repair-daily` | paused | `state-repair-daily` | **active** |
| `ta-research-concept-cluster` | paused | `ta-research-concept-cluster` | paused |
| `ta-research-framework-synthesize` | paused | `ta-research-framework-synthesize` | paused |
| `ta-research-note-distill` | paused | `ta-research-note-distill` | paused |
| `ta-research-source-intake` | paused | `ta-research-source-intake` | paused |

**Two of six are live-active while declaring `paused`; four of six are
agreed-paused on both sides.** The pool is one-third §2.1 false-negative and
two-thirds correctly-dead. Because these are bare `paused` (the value that *does*
match the tuple), the importer would **skip all six**, including the two the
registry runs daily. That is the opposite failure from the `superseded`-tuple gap:
here the tuple works and the *corpus* is what lies.

**This is the pool that proves standing rule 1.** The corpus's word and the
registry's word disagree in the direction where honouring the corpus loses live
work.

## Note what the two live protocols are

`drift-watchdog-weekly` and `state-repair-daily` are **not** brand content — they
are health and integrity monitors for the organism itself. A pool chartered as
"public proof + monetization surface" whose only live jobs are internal health
checks is a pool whose charter and its work have diverged. Rule on whether those
two belong in this pool's migration at all, or in the `[ops]` program (Phase 6).

The pool has **0 scripts and 7 checks**, so its enforcement is entirely
declarative. That makes it the best test of whether a department can be governed
by checks alone.

## Deliver

1. The dry run, quoting the registry `generatedAt` date. **Expect exactly six
   skips, all for `paused`** — measured baselines in the plan's §4 confirm
   `skipped: 6`:

```sh
cd ~/Documents/github/my-projects/holon-personal
mkdir -p /var/tmp/ishanp-agentic/pkt-scratch
python3 -m holon --home /var/tmp/ishanp-agentic/pkt-scratch --json venture import \
  ~/organism/organism/ventures/credibility-funnel --dept credibility-funnel
```

2. The reconciliation table, and an explicit statement that the importer's skip is
   **correct for four and wrong for two** — naming `drift-watchdog-weekly` and
   `state-repair-daily` as the two that are live.
3. A ruling on those two: migrate them as Ventures work, hand them to the `[ops]`
   program, or import them under this charter with a note. State the consequence
   of each.
4. A ruling on the four `ta-research-*` protocols: agreed-paused on both sides.
   Is that a skip or a chair-visible retirement record?
5. Whether the 7 checks map onto the kernel's `[checks.class]` vocabulary, and
   whether a checks-only department (0 scripts) is expressible.
6. The charter-vs-work divergence above: a "public proof + monetization" charter
   whose only live work is internal integrity monitoring. Rule on which the
   department should be read as.
7. The 4-of-6 outside reach: all four `ta-research-*` files reach outside the
   organization, while the two live protocols (`drift-watchdog-weekly`,
   `state-repair-daily`) do not. **So external reach and live work are disjoint in
   this pool** — the live jobs are internal health monitors and the reaching jobs
   are the retired research ones. What does that say about the charter, and does
   the kernel's own deterministic outside-reach rule agree with the dry run's
   classification of those four?

## Stop conditions

- Stop if the dry run's skip count is reported as a clean bill. Six skips that
  include two live jobs is a defect, not a result.
- Never `--apply`.
