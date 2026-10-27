# Packet — brand-integrating (Phase 5)

**Pool:** `organism/organism/ventures/brand-integrating`
**Charter:** Integrating personal brand surface (ishan-parihar): self-help
educational content.
**Protocols:** 2. **Scripts:** 2. **Checks:** 2 (the dry run reports 2, not 1). **Outside
reach:** 2 of 2 (measured).

## The measured dry run (re-measured 2026-10-23 after `62d7a1d`)

Measured 2026-10-23 against the live corpus, **before the fix**:
**`protocols: 2, with_skills: 2, skipped: 1, outside_reach: 2`**. After the fix:
**`skipped: 2, importing: 0`** — the earlier single skip was
`Ishan Parihar Healing Content Cycle Daily` for a bare `paused`; the other file,
`ishan-parihar-content-pipeline.md` declaring `superseded`, now skips too (§2.2).

## The measured state

| Protocol | Corpus `status:` | Live routine | Live status |
|---|---|---|---|
| `ishan-parihar-content-pipeline.md` | **superseded** | `Ishan Parihar Content Pipeline Daily` | **active** |
| `ishan-parihar-cycle-daily.md` | paused | `Ishan Parihar Healing Content Cycle Daily` | **paused** |

So the pool is split down the middle: **the corpus says the content pipeline is
retired while the registry runs it daily**, and says the healing cycle is merely
paused while the registry agrees. One protocol is a §2.1 false-negative (corpus
retires a live job), the other is correctly dead. A pool this small is the
cleanest place to see both defects side by side, and it is a Chair-facing surface,
so the mistake would be public.

## The reach question

Both protocols reach outside the organization (2 of 2). "Self-help educational
content" published under the Chair's own name is the sharpest external-reach case
in the corpus. The survey found the outside-reach import guard lands such an
import **OFF**, and that the deterministic rule can disagree with the decision
model's judgement of the same text. **Rule on what "reaches outside the
organization" should mean for a content pipeline that publishes under a person's
name** — that definition is what the other three surface pools inherit.

## Deliver

1. The dry run, quoting the registry `generatedAt` date:

```sh
cd ~/Documents/github/my-projects/holon-personal
mkdir -p /var/tmp/ishanp-agentic/pkt-scratch
python3 -m holon --home /var/tmp/ishanp-agentic/pkt-scratch --json venture import \
  ~/organism/organism/ventures/brand-integrating --dept brand-integrating
```

2. A ruling on `ishan-parihar-content-pipeline`: corpus `superseded`, live
   `active`. Which wins, and what would have to be true for the corpus's word to be
   right (is there a superseding routine under a different name? there is no
   `Ishan *` sibling in the registry besides the healing cycle, so check).
3. A ruling on `ishan-parihar-cycle-daily`: agreed-dead. Is the correct migration
   a skip, or a chair-visible record that it was considered and retired?
4. Whether the pool's 2 scripts survive intact and carry no VPS paths.
5. The outside-reach definition question above, answered as a rule the kernel
   could express, not as prose.
6. Whether this pool's charter and `brand-polarizing`'s are one surface or two
   — they are separate pools with separate names (`ishan-parihar` vs
   `undercurrent`) and both are Chair-facing. The Chair's department-shape ruling
   (Phase 0) turns on that.

## Stop conditions

- Stop if the import would publish content externally without the Chair's
  approval gate visible in the result.
- Never `--apply`.
