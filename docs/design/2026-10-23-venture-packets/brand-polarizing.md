# Packet — brand-polarizing (Phase 5)

**Pool:** `organism/organism/ventures/brand-polarizing`
**Charter:** Polarizing brand surface (undercurrent).
**Protocols:** 2. **Scripts:** 3 (the dry run reports 3, not 2). **Checks:** 2.
**Outside reach:** 2 of 2 (measured).

## The measured dry run (re-measured 2026-10-23 after `62d7a1d`)

Measured 2026-10-23 against the live corpus, **before the fix**:
**`protocols: 2, with_skills: 2, skipped: 1, outside_reach: 2`**. After the fix:
**`skipped: 2, importing: 0`**. The earlier single skip was
`Undercurrent Research + Content Cycle Daily` for a bare `paused` — that routine is
paused in the registry too. The other file, `undercurrent-content-pipeline.md`,
declares `superseded` and **now skips as well**, so the pool imports nothing today.
Both rows are §2.1 rows: one file is honest on both sides, the other names no
registry routine at all, and the fix no longer imports either.

## The per-file state — resolved against the files' own `name:` fields

Each file names its routine in front matter, and the mapping is **the reverse of
what the earlier survey assumed**:

| File | `name:` (the routine) | Corpus `status:` | Registry | Importer |
|---|---|---|---|---|
| `undercurrent-cycle-daily.md` | `Undercurrent Research + Content Cycle Daily` | `paused` | **paused** | correctly skipped |
| `undercurrent-content-pipeline.md` | `Undercurrent Content Pipeline Daily` | **superseded** | **no live routine** | **skipped after `62d7a1d`** |

So the pool is **not** "agreed-dead on both sides", and it is not "saved by
accident" either. One file is honest on both sides; the other names a routine the
live registry does not carry and declares itself `superseded` — and after `62d7a1d`
it skips too, so the pool imports nothing today. `undercurrent-cycle-daily` is the
file whose skip was always right; `undercurrent-content-pipeline` is the one the
fix simply silenced, without a live routine behind it either way.

**A note on how this was resolved:** the earlier survey mapped routines to files by
filename similarity, which put `Undercurrent Research + Content Cycle Daily`
against the `-content-pipeline` file. Reading each file's own `name:` field
reversed it. The lesson generalises: **map by the file's own declared name, never
by filename resemblance** — this pool is the counterexample, and the same method
may be wrong elsewhere in the corpus.

**The deliverable is a ruling, not an import.** The most likely correct answer for
this pool is **nothing today**, with a recommendation recorded. That is a complete
result, not a null one. Write it that way. A polarizing brand that is deliberately
not publishing still has a charter, a voice, and a decision trail, and those are
what the pool is for.

## Deliver

1. The dry run, quoting the registry `generatedAt` date. Expect
   `undercurrent-cycle-daily` (bare `paused`) to be skipped and
   `undercurrent-content-pipeline` (`superseded`) to import **active** under §2.2:

```sh
cd ~/Documents/github/my-projects/holon-personal
mkdir -p /var/tmp/ishanp-agentic/pkt-scratch
python3 -m holon --home /var/tmp/ishanp-agentic/pkt-scratch --json venture import \
  ~/organism/organism/ventures/brand-polarizing --dept brand-polarizing
```

2. Confirm that `undercurrent-content-pipeline` (`superseded`) imports active under
   §2.2, and that the registry's paused state is what should win. Name the file and
   the line.
3. A ruling: import nothing and record why, or import `undercurrent-content-pipeline`
   and un-pause a polarizing brand surface. State which, and what the Chair is
   choosing between.
4. Whether the pool's charter, voice, and decision trail belong in the kernel's
   department layer at all if no routine runs — the survey's reading is that a
   charter with no work is still a capability the organization holds.
5. Whether `undercurrent` and `ishan-parihar` should be **one** brand department
   with two voices, or two departments. This is the shape ruling (Phase 0) applied
   to the smallest case.
6. Whether the 2-of-2 outside reach changes anything for a paused surface (an
   import that lands OFF may be indistinguishable from one that never imported —
   is that acceptable for a Chair-facing brand?).

## Stop conditions

- Stop rather than importing this pool to make the surface pool count look even.
- Never `--apply`.
