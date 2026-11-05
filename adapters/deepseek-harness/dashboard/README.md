# Holon Command Center (Harness Web UI)

A DeepSeek Harness bundle that puts a Holon instance's operating surface inside the Harness Web
UI: the board, the Chair's approval queue, the org chart, the run ledger, institutional
knowledge, health, schedules, drivers and messages — plus a curated set of Chair actions.

It is the **UI companion** to `holon-native`. `holon-native` gives a Harness *agent* native tools
and run-time context; this bundle gives the *operator* a page. They share the same kernel and the
same `$DSH_HOME/holon.json` connection, but install and uninstall independently.

## What the plugin adds

| Surface | Slot | Purpose |
|---|---|---|
| Command Center page | `main` (key `holon`) + `sidebar.panellist` | The full dashboard, opened from the Holon icon in the global panel rail. |
| Overview | page tab | Heartbeat, ready stages, open work, active runs, doctor, approvals, pipeline, metrics, activity, schedules, org pulse. |
| Work | page tab | Stage board and work table with search and filters; work detail with stages, outputs, runs, artifacts, messages and events; plan review; create, cancel, retry, replan and answer actions. |
| Organization | page tab | Departments, heads, missions, profiles and employees; employee detail with roles, stages, classes, driver and evidence review; pause, activate and rebind actions; **create a department, hire an employee**. |
| Runs | page tab | Run ledger with status, driver, duration and tokens; log, result, trajectory, brief and file evidence. |
| Knowledge | page tab | Joined `recall`, memory, episodes, skills, playbooks and knowledge bases; **create a skill, write a memory, seed a knowledge base**; every item opens its own preview and the kernel's commands for it. |
| Operations | page tab | Doctor findings grouped by check; audit chain; schedules and operations; drivers and conformance; metrics; scopes; backups; isolation plan; maintenance actions; **create a schedule, create an operation**. |
| Messages | page tab | The Chair's inbox and threads, with compose and reply. |
| Console | page tab | Every command the kernel offers, as a form built from the kernel's own catalogue; the result is the kernel's JSON. |
| Configuration | page tab | Every key the kernel reads, its effective value and whether `holon.toml` sets it; one key can be changed. |
| Settings | page tab + `settings.section` | Connection, paths, drivers, backups and the action policy, also visible inside the host Settings panel. |
| Composer signal | `conversation.composer.dock` | A slim line under the composer only when approvals or doctor errors need attention; opens the Command Center. |

## Architecture

```
Harness Web (browser)                     Harness Host (Node)
┌──────────────────────────┐   fetch     ┌──────────────────────────────────────┐
│ client.js                │ ──────────▶ │ index.js                             │
│  slots / React page      │  /api/...   │  createApi() + Resources + actions   │
└──────────────────────────┘             │      │                               │
                                          │      ├─ `holon --json --mode ro`     │
                                          │      ├─ `sqlite3 -readonly` (runs,   │
                                          │      │    messages)                  │
                                          │      └─ curated `holon` actions      │
                                          └──────────────────────────────────────┘
```

- The Host half registers one **exact Fetch route**, `/api/holon-dashboard`, through
  `ctx.connection.fetch.register`. Connection authenticates it and only the owner Peer reaches
  it; an agent peer cannot call the dashboard API.
- Reads use the kernel's own read-only door (`holon --json --mode ro`) wherever a JSON command
  exists. The run ledger and the Chair's threads are read with `sqlite3 -readonly` because the
  CLI exposes no list command for them; every value that reaches SQL is validated or comes from
  a fixed allowlist.
- Writes are named actions, not arbitrary commands. Each one is validated again on the Host,
  built as argv (never a shell), and run without the Harness run token in its environment so a
  dashboard action always speaks as the Chair. `holon`'s actor classes remain the authority.
- **Every write carries a token.** The Host mints one per process, hands it out over
  `GET ?resource=session`, and refuses a POST that does not send it in `x-holon-write`. A page on
  another origin can ask for the token and cannot read the answer, so it cannot write; a script
  running inside the Harness page origin still can, which is the same trust domain as the
  dashboard itself.
- The **Console** is the exception, and it is bounded by the kernel rather than by a list here.
  It reads `holon help --json` — the kernel's own registry — and builds both the form and the
  argument vector from that manifest. The manifest marks every argument with what it MEANS: a
  `path` the kernel opens, a `shell` line the kernel executes, a `text` value the kernel may
  resolve as `@file` or stdin. The Console refuses all three, refuses an argument the command does
  not declare, refuses a positional that starts with `-`, and runs a write with `--mode rw` and a
  read with `--mode ro`, so the kernel's own read-only fence still holds.
- **An object carries the commands that act on it.** The Host derives, from the same manifest,
  which commands of a family take that object's identifier (`task_id`, `employee`, `slug`, `name`,
  `item_id`, `run_id`, `schedule_id`, `message`, `ref`) and which command previews it. A work item,
  a department, an employee, a skill, a playbook, a memory item, a run, a schedule, a plan and a
  message therefore open their own kernel's commands — including the ones no button was written
  for (`task supersede`, `hr reassign`, `hr fire`, `memory retire`, `memory promote`). A command
  the kernel adds reaches its objects without a line of client code.

## Install

From a workspace checkout:

```sh
# In the Harness UI's Plugin Manager, install the bundle directory:
#   /path/to/holon/adapters/deepseek-harness/dashboard
```

The installer links the directory into the current profile and enables the bundle row. The Host
reads the connection from `$DSH_HOME/holon.json` (the installer for `holon-native` writes it:
`{"home":"/path/to/instance","command":["/usr/local/bin/holon"]}`), or from `HOLON_HOME`, or from
the bundle row's `holonHome`.

A page refresh is required after the first install (and after replacing the linked JavaScript).
The client bundle registers:

- `main` key `holon`;
- `sidebar.panellist` id `holon`, order 4;
- `settings.section` id `holon`, order 45;
- `conversation.composer.dock` id `holon-dock`, order 20.

## Config

The bundle row accepts:

| Key | Default | Meaning |
|---|---|---|
| `holonHome` | `$HOLON_HOME` or `$DSH_HOME/holon.json` | Instance root. |
| `command` | `holon.json` / `HOLON` / `holon` / `python3 -m holon` | Command argv prefix. |
| `allowActions` | `true` | Set `false` to make every action return `actions_disabled`; reads still work. |
| `refreshMs` | `20000` | Client hint for the overview poll. |
| `timeoutMs` | `120000` | Per-read command timeout. |
| `actionTimeoutMs` | `300000` | Per-action command timeout. |
| `cacheTtlMs` | `8000` | Host cache for repeated page reads. |

## Actions

All actions are POSTs to the same route with `x-holon-dashboard: 1`, the session token in
`x-holon-write`, and a JSON body.

| Action | Kernel command | Notes |
|---|---|---|
| `plan.approve` / `plan.reject` / `plan.grade` | `plan approve/reject/grade` | The Chair's approval queue. |
| `task.add` | `task add` | Create a root work item. |
| `task.cancel` / `task.retry` / `task.replan` / `task.answer` | `task …` | Work management. |
| `hr.pause` / `hr.activate` / `hr.setDriver` | `hr …` | Employee lifecycle; reason required. |
| `schedule.enable` / `schedule.disable` | `schedule …` | The kernel may refuse an unstaffed lane; its message is shown. |
| `msg.send` / `msg.reply` | `msg …` | Chair messages; replies join their thread. |
| `doctor.run` | `doctor` | Read-only health pass. |
| `tick.run` | `tick --foreground` | Requires `confirm: "RUN TICK"`; may dispatch due work. |
| `backup.run` | `backup --to …` | Requires `confirm: "BACKUP"`. |
| `conformance.run` | `adapter test --clauses …` | Requires `confirm: "CONFORMANCE"`; spends model calls. |
| `isolation.plan` | `isolation plan` | Read-only; prints the root script. |
| `command.run` | any command the kernel's manifest offers | The console's generic path; the arguments and their types come from `holon help --json`. A write needs a typed confirmation — the Host checks that the confirmation is the command's own name, so it is a gate and not a decoration. A command whose required argument is a file or a command line is not offered at all. |
| `config.set` | `config set SECTION KEY VALUE` | One configuration key; the value is typed by the value already in force, and the file is re-parsed before the change is accepted. |

The UI asks for a note/reason where the kernel requires one, shows the kernel's refusal verbatim,
and never presents a destructive action as a one-tap default.

## Verification

The repository check for this adapter is:

```sh
node --check index.js
node --check client.js
for f in lib/*.js; do node --check "$f"; done
python3 -m json.tool package.json >/dev/null
```

The Host API can be exercised without the browser:

```js
import { createApi } from './lib/api.js';
const api = createApi({ holonHome: process.env.HOLON_HOME, command: ['holon'] });
const res = await api.handle(new Request('http://localhost/api/holon-dashboard?resource=overview'));
console.log(res.status, await res.json());
```

The browser half is assembled from the small, reviewable files in `src/` by:

```sh
python3 build_client.py
```

`client.js` is the artifact the Harness loader reads; edit `src/` and rebuild. The client registers
through `ctx.slots.inject` and uses only `--dsw-alias-*` theme tokens, so it follows the host's
light/dark theme and locale. Visible copy is registered in the `holon-dashboard` locale namespace.

The client's own components are **rendered** in the test suite, not only asserted on: a React
stand-in evaluates the real `src/` fragments and the guard reads the tree
(`test_the_client_renders_the_commands_that_belong_to_the_object`). React is not installed in the
test environment, so the stand-in stands in — the point is that a component which throws, or a
prop which is never passed, fails the suite instead of the page.

## The seam test

The route's shape, its reach and the client's URL are checked against the **shipped**
`@deepseek-ai/dsh-client-connection` package — the code that will actually serve them:

```sh
python3 -m unittest tests.test_holon_dashboard_seam -v
```

It drives the real connection service (its exact Fetch-route validation, its owner-peer fence,
its shared `/api` handler) against this bundle's real Host module and a real Holon instance, and
asserts that an owner peer gets the live organization, a non-owner peer gets 403, a POST without
the dashboard header gets 400, and the client's `API_BASE` is the registered path. It skips when
this machine has no shipped Harness copy or no instance to read.

**A real lesson from the first live page (2026-11-04).** The client half registered its locale
dictionary outside any effect, so the registration owned no disposer. A disable→enable cycle
re-applied the factory, the namespace was still registered, `ctx.locale.register` threw
"locale namespace already has locale", and the whole client half died — while the bundle stayed
*enabled* in the Plugin Manager, so the inventory said the Command Center was on and the page
showed nothing. The registration is now effect-owned and a stale namespace is survivable. The
guard is `test_the_dashboard_client_registers_its_locale_inside_an_effect`.

## Known limits

- The dashboard is **Chair-facing**. Its route is owner-only; there is no employee or agent view.
- Run and message lists come from read-only SQLite and are therefore tied to the kernel's current
  table shape. A kernel schema migration should be followed by a dashboard smoke test.
- The UI renders the kernel's JSON; it does not re-implement kernel decisions. A refused action
  is displayed as the kernel wrote it.
- The page is verified by syntax checks, the live slot registration on the connected page
  (`main` key `holon`, sidebar panel `holon`, Settings section `holon`, composer dock
  `holon-dock`), the seam test against the shipped connection service, and server-rendered
  component smoke tests in development. Rendered **visual** verification (light/dark beside a
  comparable host page, no console crash) still belongs to the connected Web UI, which this
  session could not drive.
- `tick.run` can dispatch work and `conformance.run` can spend model calls; both require an
  explicit confirmation string.
- **The write token is per Host process, not per session.** It closes the cross-origin hole (a
  page on another origin cannot read the token), but any script running inside the Harness page
  origin — another plugin's page, say — can read it and write with it. That is the same trust
  domain as the dashboard itself, and closing it further would mean a per-tab session the Host
  tracks, which is a bigger change than this one.
- **The dashboard is the Chair by uid.** Its children run as the Harness process's user, so the
  kernel resolves the Chair key for them; the run and employee credentials are scrubbed from
  their environment. That is a stated grant, not a capability check.
- **A resource is assembled from many kernel reads.** One cold overview spawns eighteen child
  processes (eleven `holon`, seven `sqlite3`); the client shares one request per resource across
  the page, and the Host caches the doctor and the organization, but there is no server-side
  concurrency cap.
- **File-backed commands stay outside the browser.** `dept export`, `dept import`,
  `venture import`, `operation import`, `skill export`, `backup` and `restore` all take a path the
  browser may not name, so they are not offered; `backup` is reachable through the curated
  `backup.run`, and the rest are CLI work. The fence is the reason, not an oversight: a browser
  that can name a file can read and write anything the kernel's user can.
- **The action list is no longer the whole write surface.** The Console derives its catalogue from
  the kernel's own manifest, so a command added to the kernel is reachable from the browser with
  its own argument types, and the fence comes from that same manifest rather than from a list here.
  What remains hand-written is the *curated* set — the flows with a typed confirmation and a
  shaped field. The gap list and the plan are in
  `docs/design/2026-11-05-the-command-center-red-team.md`; what was built in answer is in
  `docs/design/2026-11-05-the-command-center-management-surface.md` and
  `docs/design/2026-11-05-the-command-center-entity-surface.md`.
