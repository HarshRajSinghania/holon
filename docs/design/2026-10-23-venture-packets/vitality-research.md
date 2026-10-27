# Packet — vitality-research (Phase 2)

**Pool:** `organism/organism/ventures/vitality-research`
**Charter:** Vitality engineering research: ailments to healing; methodologies to
wholeness/optimization.
**Protocols:** 4. **Scripts:** 2. **Checks:** 9.

## The measured state — this pool is the pause rule working correctly

All four protocols declare `status: "paused"` (double-quoted). **The real import
happily skips all four**, measured on 2026-10-23:

```
vitality-research: protocols=4  skipped=4
   - med-research-concept-cluster     :: the protocol declares itself paused
   - med-research-framework-synthesize :: the protocol declares itself paused
   - med-research-note-distill        :: the protocol declares itself paused
   - med-research-source-intake       :: the protocol declares itself paused
```

The earlier version of this packet asserted a quoting defect — that a
double-quoted `"paused"` would fail to normalize and import as active. **That was
wrong, and the real import disproved it.** The front-matter parser at
`holon/cli.py:847` strips both quote kinds (`v.strip().strip("\"'")`), so line 846
only ever sees a normalized `paused`. See the parent plan's §2.4 for the retracted
claim and the lesson it carries.

So this pool is **not** a defect reproduction. It is the control case: the
cleanest evidence that the pause rule works when the value is one the tuple
carries. That is worth having on record next to `saas-studio`, which reproduces
the real defect.

## What this packet is actually for

With nothing to import, the packet's value shifts from adjudication to two
questions the survey could not answer:

1. **Is a paused pool worth a department at all?** All four protocols are paused
   in the corpus *and* in the live registry. Nothing here runs. The charter, the
   2 scripts and 9 checks describe capability the organization holds but does not
   currently exercise.
2. **What does the kernel's department layer do with a charter that has no
   work?** The survey's reading is that this is expressible, but it was never
   tested, and `community-loo` is the second case of the same shape.

## Deliver

1. Re-run the dry run and confirm `skipped: 4` with the reason text, quoting the
   registry `generatedAt` date:

```sh
cd ~/Documents/github/my-projects/holon-personal
mkdir -p /var/tmp/ishanp-agentic/pkt-scratch
python3 -m holon --home /var/tmp/ishanp-agentic/pkt-scratch --json venture import \
  ~/organism/organism/ventures/vitality-research --dept vitality-research
```

   (`--json` is global and precedes the subcommand.) If any of the four imports,
   **that** is the defect — report it, because it would contradict the measured
   baseline above.
2. A ruling: import nothing today, or import the pool as a zero-routine
   department holding its charter, scripts and checks. State which, and what the
   Chair is choosing between.
3. What the 9 checks do (the highest check-to-protocol ratio in the corpus) and
   whether they map onto the kernel's `[checks.class]` vocabulary. A checks-only
   department is the interesting question here, not the protocols.
4. What the 2 scripts do, and whether either is the capability the four protocols
   were a thin wrapper around.
5. The charter's reach: "ailments to healing" is health-adjacent. State whether
   any protocol reaches outside the organization, and whether that changes its
   lane. (The survey's dry-run measurement for this pool reported
   `outside_reach: 4 of 4`, so this is not a formality.)
6. A second reading of the corpus's `\"paused\"` quoting: confirm that quoting is a
   non-issue corpus-wide by naming the parse site, so no later agent re-opens a
   retired claim.

## Stop conditions

- Stop if any of the four imports. That would overturn the measured baseline and
  is a real finding, not a formatting nit.
- Stop rather than editing a corpus `status:` to make a pool importable.
- Never `--apply`.
