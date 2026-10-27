# Packet — community-loo (Phase 5)

**Pool:** `organism/organism/ventures/community-loo`
**Charter:** Law of One India community facilitation — sacred space, no personal
work; companion Sakhi.
**Protocols:** 2. **Scripts:** 9. **Checks:** 2 (the dry run reports 2, not the 1 the
earlier survey carried). **Outside reach:** 1 of 2 — an earlier survey reading said
**0 of 2**, and the real import disproved it: `Q'uo Community Pulse` reaches
outside the organization. `LoO Events Notifier` does not.

## The measured state — dead on both sides

| Protocol | Corpus `status:` | Live routine | Live status |
|---|---|---|---|
| `loo-events-notify.md` | paused | `LoO Events Notifier` | **paused** |
| `quo-community-pulse.md` | paused | `Q'uo Community Pulse` | **paused** |

The real dry run (2026-10-23) reports **`skipped: 2`, both for a bare `paused`** —
both protocols correctly skipped by the pause rule. This pool has nothing to
import today, and the pause rule is behaving correctly on it.

So the packet's earlier claim that this is "the only pool in the corpus with zero
outside reach" and therefore "the cleanest test of a wholly internal department"
is **wrong on both counts**: one of its two protocols does reach outside, and the
interesting test this pool offers is the opposite — a paused, Chair-facing
community surface where one of two protocols reaches outside and the other does
not.

## Why this pool matters more than its size

The charter says "sacred space, no personal work" and names a companion, Sakhi.
That is a *constraint* recorded in the charter itself — a rule the pool imposes on
its own work, not a job it runs. It is the clearest example in the corpus of a
pool whose value lives in its charter rather than its routines, and the shape
ruling (Phase 0) has to decide what happens to that value when no routine fires.

The 9 `scripts/` for 2 paused protocols is also the highest script-to-live-protocol
ratio in the corpus. Either the scripts outlive their protocols, or the protocols
outlive their registry rows.

## Deliver

1. The dry run, quoting the registry `generatedAt` date. Expect both protocols
   skipped, since both declare a bare `paused` (the value that *does* match the
   tuple):

```sh
cd ~/Documents/github/my-projects/holon-personal
mkdir -p /var/tmp/ishanp-agentic/pkt-scratch
python3 -m holon --home /var/tmp/ishanp-agentic/pkt-scratch --json venture import \
  ~/organism/organism/ventures/community-loo --dept community-loo
```

2. Confirm the dry run reports `skipped` for both, with the reason text. If either
   imports, that is a §2.1 defect in a pool both sources call dead — report it.
3. A ruling on what a **zero-routine, mixed-reach** department is worth. Is
   a charter with no work a capability (one the organization can re-activate), or
   nothing? And separately: a paused pool where one protocol reaches outside and
   the other does not — if the Chair later re-activates this pool, the two
   protocols land in **different lanes**. Rule on whether that is acceptable for a
   single department.
4. A ruling on the charter's own constraint ("no personal work"): can the kernel's
   department layer express a charter-level prohibition, or does it only express
   routines? If it cannot, that is a gap worth naming.
5. What the 9 scripts do, and whether any of them is the actual capability the
   paused protocols were a thin wrapper around.
6. Whether `Sakhi` is a harness/adapter name, an employee, or a persona — the
   survey did not resolve this, and it affects whether the charter references
   machinery or a colleague.

## Stop conditions

- Stop rather than importing this pool to give the organization a fourth surface.
- Never `--apply`.
