# 2026-11-05: the Command Center's objects carry the kernel's commands

**Status:** shipped. The first round is
[2026-11-05-the-command-center-management-surface.md](2026-11-05-the-command-center-management-surface.md);
this is the second: what the pages still could not do, and what closed it.

## 1. What the second audit found

The first round gave the Command Center a console: every command the kernel offers, as a form
built from the kernel's own manifest. It did not give it a *management surface*, because the
**objects the dashboard shows were previews**. A work item, a department, an employee, a skill,
a playbook, a memory item, a run, a schedule, a plan and a message showed what the kernel held
and offered nothing to do with it. The commands that act on those objects were reachable only by
typing their names into the console and pasting an id — which is a status page with a terminal
attached.

Measured, against the kernel's own 132-command registry:

| gap | measured |
|---|---|
| commands that act on an object the pages show, reachable *from that object* | 0 |
| commands no button was written for (`task supersede`, `hr reassign`, `hr fire`, `memory retire`, `memory promote`, `memory pin/unpin`, `dept profile`, `skill fork/invoke/path`, `playbook show`, `objective show`, `run heartbeat`, `msg thread`) | reachable only by hand, through the console |
| objects with no deep preview (a department's roles and slots, a skill's files, a playbook's rubric and history, a memory item's lineage) | none |
| families the pages own with no way to create one (department, employee, skill, memory, knowledge base, schedule, operation, objective) | 8 |
| commands the console **offered but could never run** — their required argument is a file or a command line, and the console refuses both | 8 (`dept export`, `dept import`, `venture import`, `operation import`, `skill export`, `backup`, `bylaws draft`, `restore`) |
| the write route's secret | a static header every page in the origin could send |

Two of those are defects in their own right, and both were found by a real run rather than by
reading: the catalogue promised eight commands that could only fail, and the write route's
guard was a constant.

## 2. What was built

### 2.1 An object carries the commands that act on it

The kernel's manifest already says what a command's first positional is called. That is enough
to bind a command to the object it acts on, and the binding is **derived on the Host**
(`lib/console.js`), not written in the browser:

- `entityCommands(rows, family, idName)` — the commands of one family whose first positional is
  that object's identifier, minus the creations (`task add <title>` names a new title, `dept
  create <slug>` a new slug: neither acts on the work or the department that already exists);
- `previewCommand(rows, family, idName)` — the family's own `show`, or its first read that takes
  the identifier (`dept roles` for a department, `hr review` for an employee);
- `entityCatalogue(rows)` — the two, per family and identifier, published with the catalogue.

The browser only looks it up. So a command the kernel adds reaches its objects with no client
code, and a command the kernel takes away disappears with them. The catalogue is the same
manifest the console already read, so there is still **one** description of the kernel's
commands.

What each object now carries:

| object | commands it carries |
|---|---|
| a work item | `task show`, `task tree`, `task cancel`, `task supersede`, `task retry`, `task replan`, `task answer`, `memory context` |
| a plan | `plan show`, `plan approve`, `plan reject`, `plan grade` |
| an employee | `hr reassign`, `hr fire`, `hr set-driver`, `hr pause`, `hr activate`, `hr review`, `emp show`, `emp card` |
| a department | `dept roles`, `dept profile` |
| a skill | `skill show`, `skill path`, `skill invoke`, `skill fork` |
| a playbook | `playbook show` |
| a memory item | `memory show`, `memory pin`, `memory unpin`, `memory retire`, `memory promote` |
| a run | `run show`, `run heartbeat` |
| a schedule | `schedule enable`, `schedule disable` |
| a message | `msg reply`, `msg thread` |

### 2.2 The preview is the kernel's answer, not the dashboard's summary

A department, a skill, a playbook and a memory item open a drawer that runs the object's own
read command and renders what it said: a department's slots and vacancies (`dept roles`), a
skill's file (`skill show`), a playbook's protocol, rubric and run history (`playbook show`), a
memory item's lineage (`memory show`). The dashboard shows the kernel's words; it does not
re-implement a summary of them.

### 2.3 Creation, on every family the pages own

The manifest's own form creates the object, with the manifest's own types: a department
(`dept create`), an employee (`hr hire`), a skill (`skill new`), a memory item (`memory add`), a
knowledge base (`kb seed`), a schedule (`schedule add`), an operation (`operation add`) and an
objective (`objective add`). The form shows the required arguments and the kernel's defaults,
and puts the rest behind *More options*, so a fifteen-argument command is still one screen.

### 2.4 The catalogue stopped promising what the fence forbids

Eight commands were offered with a required argument the browser may not name, so every attempt
ended in the kernel refusing that argument. They are not offered now: a command whose required
argument is a file or a command line has no browser form, and the catalogue says so by omission.
A command with an *optional* fenced argument stays and publishes that argument with its fence
(`fenced: 'path' | 'shell'`), so the form can say what it may not fill.

**Coverage: 121 → 112 offerable of 132**, and the twenty withheld are all withheld for a
reason: the runtime's own seat, the credential commands, a free-form tail, or an argument the
browser may not name.

### 2.5 The write route got a token, and the confirmation became a gate

The write route was guarded by `x-holon-dashboard: 1` — a constant any script in the page origin
could send, and the write surface had just grown from nineteen hand-written actions to every
command the kernel offers that a browser may run. The Host now mints a token per process, hands
it out over `GET ?resource=session`, and refuses a POST that does not carry it in
`x-holon-write`. A page on another origin can ask for the token and cannot read the answer, so
it cannot write.

The typed confirmation the console's form already asked for ("type `task cancel` to confirm") is
now **checked by the Host** as well: a write through `command.run` must carry the command's own
name as its confirmation. It was a decoration before; it is a gate now.

### 2.6 A defect found while rendering the client

The client's own components had never been *run*, only asserted on: the guard read the built
bundle's source and looked for a marker. Writing the render guard — a React stand-in that renders
the real `src/` fragments and reads the tree — found the defect immediately: the catalogue's
entity map holds command **names**, while the component that renders it treated them as rows, so
every object's command rendered as an empty button. A button with a class and no name looks like
a button and does nothing. The client now looks the row up, and the render guard is in the suite
(`test_the_client_renders_the_commands_that_belong_to_the_object`): the components run, and the
tree carries the kernel's own command names for the object it is showing.

## 3. What this does not do

- **The curated actions stay.** The hand-written cases in `lib/actions.js` remain the fast path
  (the plan queue's approve, the work detail's cancel, the messages' compose): they carry shaped
  fields and copy a generic form does not. The object commands are the complete path beside them.
- **The kernel's own gaps are not the dashboard's to close.** There is no `objective list`, so an
  objective can be created and shown but not enumerated; no `kb retire` and no way to re-bind a
  knowledge base to a department; no `skill` or `playbook` delete; no `run cancel` (a hung run is
  reclaimed by the lease sweep); no `dept show` (a department's detail is `dept roles` plus the
  organization). Each is a kernel gap, reported, not patched from the browser.
- **File-backed commands stay outside the browser.** `dept export`, `dept import`,
  `venture import`, `operation import`, `skill export` and `restore` all take a path. A browser
  that can name a file can read and write anything the kernel's user can, so the fence holds and
  those commands are CLI work (`backup` is reachable through the curated `backup.run`).
- **No per-command write policies.** Every write asks for a typed confirmation, but the surface
  does not know which writes are *dangerous* (`gc --apply` versus `task add`); the kernel's own
  `--force`/`--apply` gates still decide, and the console cannot override them.
- **The token is per Host process, not per session.** It closes the cross-origin hole. A script
  running inside the Harness page origin — another plugin's page — can still read it, which is
  the same trust domain as the dashboard.
- **The DSH-side integration gap is untouched.** What the Harness bundle itself is doing (the
  isolated profile, the adapter's install state) is still visible only through the paths the
  Settings tab reads.

## 4. How this was measured

- the catalogue and the binding: `holon --json help` on a scratch instance — 132 commands, 112
  offered, and the entity catalogue resolving every family above;
- the write path, end to end, against a scratch instance through the real Host API: `dept create`
  → the department appears in `org`; `hr hire` → the employee exists; `memory add` → `memory
  show` → `memory retire`; `task add` → the work item exists; `dept profile` → the department's
  profile changed;
- the refusals: a write without the typed confirmation is refused, a path argument is refused by
  name, and `backup` — now withheld — is refused as a command a browser may not run;
- the guards: `tests/test_console_fence.py` runs the real `lib/console.js` under node against the
  real registry — the catalogue's honesty (`test_a_command_the_browser_could_never_run_is_not_offered`),
  the binding (`test_every_object_is_bound_to_the_commands_that_act_on_it`), and the argv fence
  (`test_the_console_refuses_what_the_kernel_would_resolve_as_a_file_or_a_command`); and
  `tests/test_holon_dashboard.py` holds the write token
  (`test_a_write_without_the_session_token_is_refused`) and the client's rendering of the object
  commands (`test_the_dashboard_offers_the_commands_of_the_object_it_shows`).
