# Packet — architectural-leads (Phase 4)

**Pool:** `organism/organism/ventures/architectural-leads`
**Charter:** Lead intelligence and outreach for Design-Aesthetic (Rakesh
Parihar's architecture practice).
**Protocols:** 10 files parsed as protocols by the importer — including
`EXECUTION-SURFACE.md`, which has no `status:` field and reads as documentation.
`protocols_with_skills: 9`, so one of the 10 carries no skills. **Scripts:** 10.
**Checks:** 2 (an earlier survey reading said 1). **Outside reach:** 8.

## The measured dry run, and a refusal the earlier survey missed

Measured 2026-10-23 against the live corpus, **after `62d7a1d`**: **`protocols: 10,
with_skills: 9, skipped: 9, importing: 1, outside_reach: 8, scripts: 10,
checks: 2`.**

The earlier survey recorded `skipped: 2`, from a run **before** `62d7a1d` taught
the importer to honour `status: superseded`. Nine of the ten files now skip.

| Skip | Reason | Registry says |
|---|---|---|
| `dad-arch-builder-intel` | declares `superseded` | **active — live work lost** |
| `dad-arch-rd-daily` | declares `superseded` | **active — live work lost** |
| `dad-arch-strategist-daily` | declares `superseded` | **active — live work lost** |
| `dad-arch-materials-refresh` | declares `paused` | **active — live work lost** |
| `dad-arch-feedback-scanner` | declares `superseded` | no registry routine |
| `dad-arch-homeowner-digest` | declares `superseded` | no registry routine |
| `dad-arch-lead-progression` | declares `superseded` | no registry routine |
| `dad-arch-smb-digest` | declares `superseded` | no registry routine |
| `dad-arch-strategist-listener` | **cadence refusal** — *"no decision model is available and this job fires on `*/30 9-21 * * *` (26 times a day): a full lane would dispatch a body on every firing…"* | no registry routine |

**The `dad-arch-strategist-listener` refusal was not in the earlier survey at all.**
It is the second cadence refusal in the corpus (the first being
`reddit-karma-lane-2h-draft-post` in `freelance-agency`), and at 26 firings a day
it is the more aggressive of the two. An agent that counts the nine skips and reports
"all superseded" would hand a 26-a-day unattended lane back to the Chair looking
clean. Name it explicitly, and separately from the eight.

Corrected: the earlier packet said `dad-arch-materials-refresh`'s pause was "correct —
the registry agrees". Re-measured, the registry runs it. That row was one of the four
live ones, which is why the count moves with the measurement.

## The measured hazard: the status field is unanimous and wrong

**Nine of ten files declare themselves dead** — eight `superseded` and one
`paused` — yet **four of the protocols are active in Paperclip**:

| Protocol | Corpus `status:` | Live status |
|---|---|---|
| `dad-arch-builder-intel` | superseded | **active** |
| `dad-arch-rd-daily` | superseded | **active** |
| `dad-arch-strategist-daily` | superseded | **active** |
| `dad-arch-materials-refresh` | paused | **active** |
| `dad-arch-feedback-scanner` | superseded | not in live 50 |
| `dad-arch-homeowner-digest` | superseded | not in live 50 |
| `dad-arch-lead-progression` | superseded | not in live 50 |
| `dad-arch-smb-digest` | superseded | not in live 50 |
| `dad-arch-strategist-listener` | superseded | not in live 50 |

So the corpus declares the whole pool retired while the live registry runs four
of its jobs daily. **This is the sharpest form of the survey's §2.1**: an import
that honoured the corpus would drop four live jobs, and an import that honoured
the registry would resurrect five dead ones. Neither reading alone is right, and
the dry run's default (import all, since `superseded` misses the tuple) lands on
the worst of the two.

This pool is also the survey's §2.3 case for the `dad-arch-*` family: the corpus
names and the live names agree here, so **there is no rename hazard** — the
hazard is purely the status field.

## The `$HOME` corruption was repaired, not merely found

The survey resolved 8 conflicts in this pool's files where the VPS had written a
literal double-slash expansion (`$HOME//home/ishanp/cron/jobs.json`) while the
local copy carried the correct portable `$HOME/cron/jobs.json`. Local's version
won in the convergence merge `ed8d379b6a`. **Verify the repaired state held**: a
corpus-wide scan now finds **0** files containing `/home/ishanp`. If any remain in
this pool, they are new writes since the merge.

## Deliver

1. The reconciliation table, three columns as in the career-pipeline packet:
   corpus `status:`, live registry status (quoting the `generatedAt` date), and
   what the dry run does with each.
2. A ruling on each of the 9: live-and-declared-superseded (4 cases), and
   dead-in-both (5 cases). For the 5, name the evidence that they are genuinely
   retired — a retirement record, a superseding routine, or nothing at all.
3. A scan of the 9 protocol files and 10 scripts for path portability
   (`$HOME//`, absolute `/home/`, another host's scratch dir as a workdir). The
   survey found that class here once; report the current count.
4. A ruling on the charter's **8-of-9 outside-reach** ratio, the highest in a
   non-brand pool. This pool reaches outside the organization by default. What
   does that do to its lane, and does the kernel's `outside_reach` view agree with
   the kernel's own deterministic rule?
5. Whether `EXECUTION-SURFACE.md` is a protocol, a playbook input, or unrelated
   documentation — it has no `status:` field, and the survey did not classify it.
6. The `dad-arch-materials-refresh` case specifically: corpus `paused`, live
   `active`, and the survey's earlier reading had it as "declares itself paused".
   State which.

## Stop conditions

- Stop rather than importing 9 protocols to match the pool's file count. Four
  are live, five may be retired; the import count should reflect that, not the
  directory listing.
- Stop if a script or protocol carries a live VPS path. Report the file.
- Never `--apply`.
