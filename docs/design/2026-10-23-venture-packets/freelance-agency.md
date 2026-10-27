# Packet — freelance-agency (Phase 4)

**Pool:** `organism/organism/ventures/freelance-agency`
**Charter:** Freelance pipeline: gig scouting, proposals, client scoring
(path-003).
**Protocols:** 15 files in `cron-jobs/` (10 `freelance-loop-*`, 2 `inbox`-class,
3 `reddit-*`). **Scripts:** 180. **Checks:** 1. **Outside reach:** 15 of 15.

## This pool holds all three of the survey's hazards at once

| Hazard | Manifestation |
|---|---|
| **§2.1 status lies both ways** | `freelance-loop-p4-negotiate` declares `paused` while `freelance-negotiate-close` is **active**; `freelance-loop-p3-outreach` and `p5-track` declare `superseded` while their live twins run |
| **§2.2 tuple gap** | **9 of this pool's 15 files declare `superseded`** and therefore import as active |
| **§2.3 rename family** | 6 live `freelance-*` routines are the rename of `freelance-loop-p*` |
| **The cadence refusal** | `reddit-karma-lane-2h-draft-post` is refused — see §3 of the plan |
| **Quoting is a non-issue** | this pool's `freelance-loop-*` files write bare `paused`/`superseded`, and quoting never reaches the tuple unnormalized — the parser strips both kinds. Do not re-open this; the parent plan's §2.4 records the retraction |

### The rename is recorded IN the registry — this is the strongest evidence in the survey

Both name families are present in the live registry, and the registry itself
shows the supersession. Measured from the snapshot:

**Active (the new names):** `freelance-source-sweep`, `freelance-qualify-sweep`,
`freelance-outreach-wave`, `freelance-negotiate-close`, `freelance-track-deliver`,
`freelance-compound`.

**Paused (the old corpus names, same pool):** `freelance-loop-p1-discover`,
`freelance-loop-p2-score`, `freelance-loop-p3-outreach`, `freelance-loop-p4-negotiate`,
`freelance-loop-p5-track`, `freelance-loop-p6-convert`, `freelance-loop-p7-compound`,
`freelance-loop-p8-recovery`, `freelance-loop-p9-followup`, `freelance-loop-recover`.

So the supersession is **not an inference**: the registry carries both families and
marks the old ones paused. That is precisely the trail a migration should follow,
and it means the corpus protocol files are not "wrong" — they describe jobs that
really did run and really were superseded. Their `status:` fields simply disagree
with the registry about which side of the rename they are on.

**Consequence for the import:** import the active `freelance-*` names, and record
the corpus files as provenance for them. Importing the corpus `freelance-loop-*`
names as well would create a duplicate department for one pipeline — the survey's
§2.3, now with its cause pinned.

## The refusal — preserve it, do not engineer around it

**The refusal is in the `skipped` list, measured on 2026-10-23 before `62d7a1d`.**
Then the real dry run for this pool reported `protocols: 15, skipped: 2,
outside_reach: 15`, and the second of the two skips was the cadence refusal,
verbatim:

> `reddit-karma-lane-2h-draft-post` — *"no decision model is available and this job
> fires on `23 */2 * * *` (12 times a day): a full lane would dispatch a body on
> every firing. Configure the classifier, give it as a script with `--command`, or
> say `--why` an agent must do it."*

The first skip was `freelance-loop-p4-negotiate`, correctly, for a bare `paused`.

**After `62d7a1d` the pool reports `skipped: 10, importing: 5`** — re-measured
2026-10-23 against the live corpus. The eight additional skips are all
`superseded`-declaring files: `freelance-loop-p3-outreach`, `freelance-loop-p5-track`,
`freelance-loop-p9-followup`, `freelance-loop-recover`, `inbox-scanner-daily`,
`reddit-hiring-lane-tier1-daily`, `reddit-hiring-lane-tier2-weekly`,
`reddit-karma-lane-weekly-hod-audit`.

Note that the refusal arrives as a **skip reason**, not a separate
`refusals` key — so an agent counting `skipped` and reporting "all superseded" or
"all paused" would lose the one item that most needs the Chair's attention. **Name
it explicitly, and separately from the nine.**

The protocol's own banner says the cron was `23 */2 * * *` and that the hermes
cron was removed 2026-10-19, the job living on in the Paperclip registry
(`c41261bf…`, active, cron `23 */2 * * *`). The kernel's rule is right. **Report the
refusal verbatim.** Do not lengthen a cadence, drop a protocol, or re-run with a
decision model to make it go away without a Chair ruling.

## Deliver

1. The dry run, quoting the registry `generatedAt` date. Expect a refusal in the
   output — capture the whole JSON, not the count:

```sh
cd ~/Documents/github/my-projects/holon-personal
mkdir -p /var/tmp/ishanp-agentic/pkt-scratch
python3 -m holon --home /var/tmp/ishanp-agentic/pkt-scratch --json venture import \
  ~/organism/organism/ventures/freelance-agency --dept freelance-agency
```

2. The reconciliation table: corpus `status:`, live status, dry-run behaviour, for
   every protocol-shaped file in the pool.
3. The rename ruling, as in the career-pipeline packet.
4. A ruling on `reddit-karma-lane-2h-draft-post`: is the refusal the correct
   answer for this cadence, and if the Chair later supplies a decision model, is
   `23 */2 * * *` a cadence that *should* then be allowed? Say what the kernel's
   lane policy implies, not what would be convenient.
5. Whether the 180 `scripts/` survive intact and carry no VPS paths.
6. The 15-of-15 outside-reach ratio: this pool reaches outside the organization
   for every protocol it holds. Does that make it the pool where the
   `outside_reach` import guard (which lands an outside-reach import **OFF**)
   matters most, and does the dry run honour it?
7. The three reddit protocols: `reddit-hiring-lane-tier1-daily`,
   `reddit-hiring-lane-tier2-weekly`, and `reddit-karma-lane-*` all declare
   `superseded`. Two are live. Rule on each.

## Stop conditions

- Stop if a dry run would import a protocol whose live routine is paused.
- Stop rather than editing a `status:` field to clear a refusal.
- Never `--apply`.
