# Venture migration packets

Each file is one pool's packet for a specialized subagent. They inherit
`2026-10-23-ventures-survey-audit-and-migration-plan.md` in the parent directory:
read §2 (the four measured findings — one closed, one answered, one open, one
retracted), §3 (the two refusals), §4 (the measured dry-run baselines across all
ten pools) and §7 (the seven standing rules) first. Every
packet is survey-and-plan-only; the apply is a Chair-gated step no subagent
performs.

| Packet | Pool | Protocols | Phase | Hazards |
|---|---|---|---|---|
| [quant-trading](quant-trading.md) | quant-trading | 4 | 1 | 2 of 4 files have no live routine; reproduces §2.2 |
| [saas-studio](saas-studio.md) | saas-studio | 2 | 2 | reproduces §2.2; 1 file correctly skipped |
| [vitality-research](vitality-research.md) | vitality-research | 4 | 2 | the control case: pause rule works, nothing to import |
| [career-pipeline](career-pipeline.md) | career-pipeline | 15 | 3 | rename family, superseded-vs-active, already staged |
| [architectural-leads](architectural-leads.md) | architectural-leads | 9+1 | 4 | 9-of-10 files declare themselves dead, 4 are live |
| [freelance-agency](freelance-agency.md) | freelance-agency | 15 | 4 | rename family, 9 superseded files, cadence refusal |
| [brand-integrating](brand-integrating.md) | brand-integrating | 2 | 5 | Chair-facing surface |
| [brand-polarizing](brand-polarizing.md) | brand-polarizing | 2 | 5 | Chair-facing surface |
| [community-loo](community-loo.md) | community-loo | 2 | 5 | Chair-facing surface; both paused, one reaches outside |
| [credibility-funnel](credibility-funnel.md) | credibility-funnel | 6 | 5 | Chair-facing, paused protocols |

## Phase 6 is not in this directory

The `[ops]` families (16 active routines with no ventures charter) are a separate
program, not Ventures packets. See the plan's Phase 6.

## Before running any packet

1. Read the parent plan. The §2 findings and the §4 measured baselines are
   the reason the packets exist — quote a baseline's numbers rather than
   re-deriving them.
2. Confirm the registry snapshot's `generatedAt` date and quote it in the packet's
   output. A packet that does not date its registry is unfalsifiable.
3. Run the dry run against a **scratch** `--home` (e.g.
   `mkdir -p /var/tmp/ishanp-agentic/pkt-scratch`), never against `~/holon`. The
   scratch directory is per-workspace state and may be reused across packets.
4. Never pass `--apply`. If a dry run looks clean, report it and stop.
