# Packet — saas-studio (Phase 2)

**Pool:** `organism/organism/ventures/saas-studio`
**Charter:** Productized-offering studio layer: IGS / slideforge / openscript
service contracts.
**Protocols:** 2. **Scripts:** 0. **Checks:** 3.

## The measured hazard

Every protocol in this pool is declared dead:

| Protocol | Corpus `status:` | Paperclip live | Importer behaviour |
|---|---|---|---|
| `studio-content-pipeline.md` | **superseded** | not in the live 50 | **imports ACTIVE (tuple gap)** |
| `studio-status-daily.md` | paused | not in the live 50 | correctly skipped |

So this pool's dry run reports **1 of 2 protocols importable**, and the one that
imports is the one both sources agree is dead. **A raw protocol count here is a
false positive**: the number the dry run prints is not evidence of live work.

The pool has **no `scripts/`**, which makes it the cleanest test of whether the
importer needs that artifact at all — the `--help` says it reads "the four
artifacts", but this pool has three. Report whether that degrades, refuses, or is
harmless.

## Deliver

1. The dry run, quoting the registry `generatedAt` date:

```sh
cd ~/Documents/github/my-projects/holon-personal
mkdir -p /var/tmp/ishanp-agentic/pkt-scratch
python3 -m holon --home /var/tmp/ishanp-agentic/pkt-scratch --json venture import \
  ~/organism/organism/ventures/saas-studio --dept saas-studio
```

   (`--json` is global and precedes the subcommand.)

2. For each protocol: corpus `status:`, live registry status, and the cadence the
   live routine declares — or "no live routine".
3. A ruling on the studio charter: IGS / slideforge / openscript are **product
   names with external reach**. Does this charter belong beside `quant-trading`'s
   (both are money machinery with no Chair-facing content), beside the brand
   surfaces, or on its own?
4. Whether the pool's **3 checks** map onto the kernel's `[checks.class]`
   vocabulary, or are free-form. This pool has no scripts, so its checks are the
   only enforcement it carries — that matters for the plan's standing rule 4.
5. Whether the "service contracts" in the charter imply skills and a playbook, or
   only routines.

## Stop conditions

- Stop rather than "fixing" the dry run's count by editing a corpus `status:`.
- Stop if the import of `studio-content-pipeline` cannot be justified by any live
  routine. It cannot: **no routine for the studio family exists in the live
  registry** apart from `Studio Status Daily`, which is paused. Report it as the
  survey's §2.2 reproduced, with the file and the line at `holon/cli.py:846` — this
  pool is the cleanest reproduction in the corpus, because here the corpus says
  `superseded` and the registry simply has no contradicting row.
- Never `--apply`.
