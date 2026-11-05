# 2026-11-05: the Command Center becomes a management surface

**Status:** shipped. The audit that found the gaps is
[2026-11-05-the-command-center-red-team.md](2026-11-05-the-command-center-red-team.md); this
record is what was built in answer to it, and what is still open.

## 1. What the audit found

The Command Center was a **status surface with nineteen buttons**. The kernel registered 130
commands. The dashboard's write path was a hand-maintained `switch` in `lib/actions.js`, so:

| gap | measured |
|---|---|
| commands reachable from the browser | 44 of 130 |
| configuration keys visible | 4 of 87 |
| configuration keys editable | 1 of 87 |
| knowledge-write commands reachable | none (`memory add`, `memory pin`, `kb seed`, `kb blueprint promote`, `skill fork`, `skill new`, `skill export`, `playbook show`, `ad index`) |
| organizational CRUD reachable | `hr hire`/`hr fire`/`dept create` were not |
| integration and repair commands reachable | `isolation plan`, `smoke`, `gc --apply`, `keys gc`, `audit attest`, `restore`, `bylaws promote`, `dept export/import` were not |
| preview depth | eight curated resources, each assembling a fixed set of fields; nothing else could be seen |

The dashboard could *watch* the agentic OS and run a narrow slice of it. It could not *operate* it.

## 2. What was built

### 2.1 The kernel publishes a command catalogue a remote surface can read

`cli.manifest()` already published every command's name, actor class, help text and option names.
That is enough to *list* commands and not enough to *use* them: a form needs to know which
argument is a number, which is a choice, which is required — and a remote surface needs to know
which argument it must not be allowed to fill at all.

The manifest now carries, per argument: `kind` (string / integer / number / boolean / array),
`required`, `choices`, `default`, `metavar`, `help`, `positional`, and three markers that say
what the value **means**:

| marker | what it means | who fills it |
|---|---|---|
| `path` | the kernel opens or writes that file or directory | nobody from a browser |
| `shell` | the kernel executes that value as a command line | nobody from a browser |
| `text` | the kernel may resolve the value as `@file` or stdin | a browser, but never with a `@`/`-` shape |

The kernel is where this knowledge lives, so the declaration carries it: `arg("--supervisor",
shell=True)`. The MCP server's `_arg_schema` already had the same shape (name, kind, required,
choices) and the two now agree on what an argument is — one derivation, two consumers.

**The registry's actor class decides the offer.** A command whose actor is `kernel` is the
heartbeat's own seat (`dispatch`, `run finish`, `post-execute`, `run-script`, `broker`, `tick`,
`operation fire`): a browser must not drive those. Four more are refused by name, each with its
reason in `cli.CONSOLE_BLOCK`: `mcp` (serves forever), `init` (mints the Chair key), `hr key`
and `intake key` (print a credential). `--as` (impersonation) and `--intake-key` (a door
credential) are dropped from the published arguments entirely, exactly as the MCP fence drops them.

### 2.2 The dashboard reads that catalogue instead of maintaining a twin

`lib/console.js` is the whole mechanism:

- the catalogue comes from `holon help --json` — the kernel's own registry, so a command added to
  the kernel appears in the dashboard with its own types, and one removed disappears with it;
- `buildArgv` builds the argument vector from the manifest: a value that is not declared is
  refused, a positional that starts with `-` is refused (argparse would read it as an option), a
  `@`-prefixed or bare `-` value for a `text` argument is refused (the kernel would read it as a
  file or stdin), an argument marked `path` or `shell` is refused, and a free-form
  (`argparse.REMAINDER`) tail is refused;
- a write runs with `--mode rw` and a read with `--mode ro`, so the kernel's own read-only fence
  still applies to the whole surface.

The client renders a form from the same manifest: a text field, a number field, a checkbox, a
select for a choice, and — for a write — a confirmation the Chair types by hand.

**Coverage: 44 → 121 offerable commands**, every one of them with the kernel's own argument
types, and the fence derived rather than restated.

### 2.3 The configuration surface

There was no configuration command at all, so the dashboard showed four keys and could change one.
`holon/execution/config.py` is new:

- `holon config show` publishes every key the kernel reads, its effective value, and whether
  `holon.toml` sets it or the kernel's default applies — plus the keys the file carries that the
  kernel does not read (a typo, or a setting from another version);
- `holon config set SECTION KEY VALUE` changes one. The value is **typed by the value already in
  force** (`budget_chars` cannot become a string; a boolean stays a boolean), the file's comments
  and every other key survive, and a change that would not parse is **refused rather than
  written** — the file is re-read and re-parsed before it is accepted.

The known-key set is **derived** from the modules that own each section (`service.DEFAULT_CONFIG`,
`grading.DEFAULTS`, `autonomy.PRESETS`, `bylaws.PIPELINE_DEFAULTS`), never hand-listed: a key the
kernel does not read is refused, so a typo cannot sit in the file looking like it worked.

The dashboard's Configuration tab lists every section and key and writes a change through
`config set`.

### 2.4 A defect found while auditing the argument surface

`holon skill fork <name> --file <f>` built its paths by hand and never checked `<f>`, where
`resolve` refuses a file name that climbs out of the skill. So
`skill fork x --file ../../SECRET` copied a file from **outside** the skill library into the
instance (measured: the kernel user's own files were copyable into the instance's skill tree).
The fork now validates the file name the way `resolve` does. Guard:
`test_a_file_name_that_climbs_out_of_the_skill_is_refused`.

## 3. What this does not do

- **The curated actions stay.** The nineteen hand-written cases in `lib/actions.js` remain: they
  carry typed confirmations and curated field shapes that a generic form does not (the plan
  queue's approve/reject/grade, the work detail's cancel/retry/replan, the run's heartbeat). The
  console is the long tail, not a replacement.
- **The console is not a second identity.** The dashboard's children run as the Chair by uid; the
  console runs the same commands the Chair would run in a terminal, with the kernel's own actor
  gate behind them. It does not add a second principal, and it does not weaken the `--mode ro`
  fence.
- **No per-command write policies.** The console asks for a typed confirmation on every write,
  but it does not know which writes are *dangerous* (`gc --apply` versus `task add`); that remains
  the kernel's own `--force`/`--apply` gates, which the console cannot override.
- **The DSH-side integration gap is untouched.** What the Harness bundle itself is doing (the
  isolated profile, the adapter's install state) is still visible only through the paths the
  Settings tab reads.
- **The two kernel-side knowledge gaps stand**: there is no `kb retire`, and a knowledge base
  cannot be re-bound to a department after it is seeded. The console reaches `kb seed`,
  `kb blueprint draft/check/promote` and the `kb run` verbs it can safely offer, but a retired
  base still has to be removed by hand.

## 4. The Chair's decisions this does not take

The audit listed four. None of them changed in this round, and none of them is needed for the
console to work:

1. whether the kernel's `--supervisor` keeps `shell=True` — the console refuses the argument
   either way, so the decision is about the terminal, not the dashboard;
2. whether `holon.toml` gains a command — **it now has one** (`holon config show` / `config set`),
   so that decision is answered by the Chair's own request for configuration management;
3. whether the dashboard's children run as the kernel's user (today they are the Chair by uid) or
   under the isolation user — unchanged;
4. whether the write path gets a per-session nonce instead of a static header — unchanged. The
   console widens what that header can reach, so the nonce is now worth more than it was.

## 5. How this was measured

- the catalogue: `holon --json help` on a fresh instance — 132 commands, 121 offerable;
- the configuration: `holon config show --json` — 25 sections, 73 keys, each with its source;
- the write path: `holon config set` on a scratch instance — an integer stays an integer, a
  string stays a string, a wrong type is refused, an unknown key is refused, and the file's
  comments survive;
- the fence: `tests/test_console_fence.py` runs the real `lib/console.js` under node and asserts
  each refusal;
- the registry: `tests/test_command_catalogue.py` walks the kernel for the places a value becomes
  a file, a command line, or a path and checks each is marked.
