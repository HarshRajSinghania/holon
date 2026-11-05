# Holon adapter for DeepSeek Harness

Makes DeepSeek Harness (`dsh`) a body Holon employees run in, and makes the Holon organization
native to a Harness session. Holon stays harness-agnostic: this directory is the only place that
knows `dsh` exists. It implements the adapter shape in `docs/CONTRACT.md` §7.

The integration is two halves that meet at one seam:

| Half | Where | What it is |
|---|---|---|
| Holon → Harness | `driver.toml`, `install.py` | A one-shot `dsh` body: isolated `DSH_HOME`, a `holon` profile, the bundle installed, skills exported, Holon's policy enforced. |
| Harness → Holon | `plugin/` | The `holon-native` Host bundle: run context, department skills, typed organization tools, typed result hand-in, posture guard. |

The kernel never sees either half's harness name: the adapter installs an instance driver, and the
bundle runs inside the harness process.

## Parts

| Part | Where |
|---|---|
| Driver | `driver.toml`: `dsh --profile holon {briefing}`; the installer writes a pinned copy with the absolute launcher, the isolated `DSH_HOME` and `DSH_PERMISSION_MODE=danger-full-access`. |
| Identity | `{briefing}` = the identity card + `BRIEF.md`, and the bundle also injects the run facts into the system prompt. |
| Skills | The installer exports the standard library to `$DSH_HOME/skills`; the bundle registers the run's **department-resolved** `runs/<id>/skills` at runtime, which outranks the export, so a tailored skill appears once. |
| Native tools | The `holon-native` bundle registers `holon_identity`, `holon_status`, `holon_tasks`, `holon_recall`, `holon_submit`, `holon_msg`, `holon_memory`. The `holon mcp` server remains the complete surface for harnesses that mount MCP. |
| Posture map | Observe: the bundle refuses `write`/`edit` and non-read-only `bash`; the kernel's working-directory fingerprint stays on (`read_only_enforced=false`). Act: file writes are confined to `policy.json`'s roots + writes + the run dir. |
| Result hand-in | `holon_submit` writes `result.json` and runs `holon submit`; the driver's `result = "file"`. A printed JSON object is not read. |
| Conformance | `holon adapter test deepseek-harness` (all clauses spend real model calls; `--clauses driver` is free). |

## What a run looks like

1. Holon claims a stage and writes the run directory (`BRIEF.md`, `identity.md`, `context.md`,
   `policy.json`, `envelope.schema.json`, `skills/`, `brief.json`).
2. The driver starts `dsh` in `{workdir}` with `HOLON_*` in the environment, `DSH_HOME` at
   `$HOLON_HOME/adapters/deepseek-harness/home`, and `DSH_PERMISSION_MODE=danger-full-access`.
3. The `holon-native` bundle activates in that process: it reads the run artifacts, registers the
   run skills, adds the stage contract and reach to the prompt, registers `holon_submit`, and
   installs the posture guard.
4. The body works, then calls `holon_submit` (or writes `result.json` and submits). `holon submit`
   returns what the kernel accepted or refused; the body can repair and resubmit.
5. The kernel grades the run, closes the stage, and records a breach if the workdir changed during
   an observe stage.

## Install

```sh
python3 adapters/deepseek-harness/install.py --holon-home ~/holon \
    [--dsh /path/to/dsh] [--profile holon] [--model deepseek-flash] \
    [--base-url <endpoint>] [--api-key-file ~/.config/holon/model.key] \
    [--register-dsh-home ~/.dsh] [--dry-run]
```

It writes, idempotently:

- `$HOLON_HOME/adapters/deepseek-harness/home` — an isolated `DSH_HOME`, so employees never share
  the operator's sessions, skills or credentials;
- `…/home/profiles/holon` — a profile initialized from the shipped `headless` template;
- `…/adapters/deepseek-harness/plugin/holon-native` — the bundle copied out of this checkout, so a
  moved source tree does not break the profile; the profile selects it with `dsh plugin add`;
- `…/home/skills` — the exported standard skills;
- `…/home/.env` — `DEEPSEEK_API_KEY` and `DEEPSEEK_BASE_URL` when asked, mode 0600, never printed;
- `…/home/holon.json` — the instance home and kernel command the bundle uses outside a run;
- `$HOLON_HOME/config/drivers/deepseek-harness.toml` — the pinned driver, parsed before it lands.

Then:

```sh
holon hr hire … --driver deepseek-harness     # or: holon hr set-driver <emp> deepseek-harness
holon adapter test deepseek-harness
```

`--register-dsh-home` also writes `holon.json` into the operator's own Harness home. It does **not**
install the bundle into that profile; use the Harness Plugin Manager (`plugin_manager`,
`install_bundle`, target = `adapters/deepseek-harness/plugin`) so the profile's package files stay
under its management.

Re-run the installer after changing the bundle or the model; it replaces the copied bundle, re-links
the profile, and rewrites the driver. It never touches the operator's own profile.

## Model credentials

The shipped `headless` profile disables the stored-credential and account routes: API-key routes
read the launch environment, then `<cwd>/.env`, then `$DSH_HOME/.env`. The installer therefore
writes `DEEPSEEK_API_KEY` (and optionally `DEEPSEEK_BASE_URL`) into the isolated `$DSH_HOME/.env`,
never onto a command line. Without one, a body's first model call fails with `MISSING_CREDENTIAL`;
the driver still starts, so `--clauses driver` conformance passes; a real stage fails at its first model call until a key is provided.

The `holon` profile selects `deepseek-official` / `deepseek-flash` through `agent-default-model` in
the profile patch; `--model` changes it. The patch starts as `[]`, which is valid YAML only on its
own — the installer rewrites that case instead of appending a second top-level entry.

## The posture, honestly

`DSH_PERMISSION_MODE=danger-full-access` is a deliberate grant, not an oversight. An unattended
body has no one to answer an approval prompt, and the Harness workspace sandbox cannot express a
Holon run's reach (the workdir plus the department's scope roots plus the approved plan's writes).
So the run is fenced where Holon can fence it: the bundle refuses writes and non-read-only commands
in observe and confines file writes to the policy's roots in act, and the kernel compares the
workdir before and after the run. DSH's read-only sandbox is available as a second fence only if a
launcher switches `DSH_PERMISSION_MODE` per posture; this adapter does not add one, because a
wrapper in the adapter home is not in the agent user's read reach and would need its own isolation
grant.

The trust boundary that matters is Holon's `[isolation]`: the body runs as the agent user, with the
Chair key and `work.db` outside its reach. On an instance with no boundary, `holon doctor` reports
`isolation.off` as an error; the Harness sandbox is not a substitute for it.

The bundle also refuses a run-scoped write when `HOLON_RUN_TOKEN` is missing, rather than letting
`holon`'s auth fall back to the Chair key. That fallback is the failure mode the 2026-10-20 jcode
seam proved: an absent token silently becomes the widest principal.

## What the harness does that the contract does not expect

Measured while building this adapter (2026-11-04, DSH 0.2.1-rc.5):

- **Headless disables stored credentials.** A profile cloned from `headless` cannot use the Web
  account sign-in; `DEEPSEEK_API_KEY` in the launch environment or `$DSH_HOME/.env` is the route.
  The installer writes the file mode 0600.
- **`DSH_PERMISSION_MODE` also chooses the approval policy.** `danger-full-access` maps to
  approval `never`; `workspace-write` maps to `ask`. An unattended body must run under the former,
  or a permission request fails closed and the stage stalls.
- **`dsh plugin --profile X add <dir>` both installs and selects a bundle.** A bundle whose
  `package.json` declares `dsh.bundle.patch` is appended to `dsh.profile.bundles`, and its patch
  applies; no hand edit of the profile manifest is needed.
- **The profile patch starts as `[]`.** Appending a second top-level YAML entry to `[]` is invalid
  YAML; the installer rewrites that case. A hand edit that appends to `[]` makes the whole profile
  unparseable, and `--dump-config` shows the parse error rather than the plugin.
- **Runtime skills outrank user skills in one registry layer.** The bundle's run-scoped registration
  therefore replaces the exporter's standard copy of the same skill; that is the precedence the
  contract's "a tailored skill appears once" rule asks for.
- **Headless prints no token-usage line.** There is no `usage_line` for the driver; the kernel's
  lease, timeout and per-run budget are the bounds, not a parsed usage summary. A body stopped
  after `holon_submit` leaves no summary either, which is why `result = "file"` does not depend on
  it.
- **A blocked `dsh` cannot start** (missing Node, a broken profile, a model route that cannot
  resolve). The driver's `build_cmd` names `dsh --version`; `holon smoke` reports it, and the stage
  fails closed rather than waiting.

## Command Center (operator UI)

`dashboard/` is a second, independent bundle for the **Chair**, not for a dispatched body. It
renders a full page in the Harness Web UI over the same instance: the work board and approval
queue, organization and employees, the run ledger, joined knowledge, health/audit/schedules/
drivers/scopes, the Chair's messages, and settings. It also adds a compact composer signal when
approvals or doctor errors need attention.

The Host half registers one owner-only exact Fetch route, `/api/holon-dashboard`; reads go
through `holon --json --mode ro` (plus read-only SQLite for the run ledger and message threads),
and writes are a named allowlist of Chair commands with per-action validation and explicit
confirmations for `tick`, `backup` and conformance. It is documented in
[`dashboard/README.md`](dashboard/README.md).

Install it either from the Plugin Manager (point it at `dashboard/`) or through the adapter
installer, which also writes the connection into that Harness home:

```sh
python3 adapters/deepseek-harness/install.py \
  --holon-home ~/holon \
  --operator-dsh-home ~/.dsh \
  --profile web
```

The dashboard is a **Chair** surface and is therefore never installed into the isolated run
home: a dispatched body does not need a dashboard, and the run profile stays minimal.

**A real lesson from the first live page (2026-11-04).** The client half registered its locale
dictionary outside any effect, so the registration owned no disposer. A disable→enable cycle
re-applied the factory, the namespace was still registered, `ctx.locale.register` threw
"locale namespace already has locale", and the whole client half died — while the bundle stayed
*enabled* in the Plugin Manager, so the inventory said the Command Center was on and the page
showed nothing. The registration is now effect-owned (a reload replaces the copy) and a stale
namespace is survivable rather than fatal. The guard is
`tests/test_holon_dashboard.py::test_the_dashboard_client_registers_its_locale_inside_an_effect`.

## Limits

- The bundle's guard is synchronous and string-level: it is a fence around the model's tool calls,
  not an OS sandbox. The kernel's fingerprint and, when configured, `[isolation]` remain the
  authoritative checks.
- `holon_tasks`/`holon_recall` render at most 40 000 characters; narrow the query rather than
  reading a whole board into the context.
- The operator direction is read-only by default. `allowWrites` registers `holon_msg` and
  `holon_memory`; it does not expose approvals, dispatch, or any Chair-only mutation. Use the
  Harness shell for those, under the Chair's own key, or the `holon` CLI.

Under an active `[isolation]`, the installer also grants the configured agent user `x` on this
adapter's directory, `rX` on the copied bundle, and `rwX` plus a default ACL on the isolated
`DSH_HOME`. That is not optional: measured on the live instance (2026-11-04), the new directory
inherited a deny, doctor reported `isolation.reach`, and the agent user could neither traverse to
nor write the home its harness must use. The Harness installation itself sits outside the
instance, so the installer prints the exact `[isolation] reads` entry for it and the
`isolation plan` → `sudo sh` → `isolation apply --force` sequence; until that is applied, doctor
keeps reporting the `dsh` tree as unreadable to the agent user, and a dispatch under the boundary
will fail at the harness's first import.
