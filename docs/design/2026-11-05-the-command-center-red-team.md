# 2026-11-05: the Holon Command Center red-team — what the Chair can and cannot do

Status: 2026-11-05. Repo `ceed65f`. Target: `adapters/deepseek-harness/dashboard/` (the operator UI
of the Holon agentic OS, installed and live in the operator's Harness profile).

You asked for a red-team of the Command Center and the gap list that stands between it and a
full operationalization of the agentic OS: CRUD, management, configuration, systemic integration
and knowledge-base management. This record answers both, and it separates what was **defects,
found by a real run and fixed now** from what is **a gap list for the Chair to direct**.

---

## 1. The verdict in one table

The kernel's command registry carries **130 commands** (58 chair-only, 75 mutating). The
Command Center reaches **44** of them: 25 reads and 19 writes.

| lens | what the OS has | what the Command Center reaches | gap |
|---|---|---|---|
| reads | 55 non-mutating commands | 25 | 30 commands with no surface |
| writes | 75 mutating commands | 19 | 56 commands with no surface |
| configuration | 87 `holon.toml` keys + 18 governance surfaces outside it | 1 editable (`hr set-driver`), 4 readable | ~100 knobs the Chair cannot see or change |
| knowledge | memory (10) · skills (8) · playbooks (2) · KB (6) · law (1) · corpus (3) | `skill list`, `playbook list`, `kb list`, `memory search`, `memory episodes`, `recall`, `law show` | the whole write lifecycle of every one |
| systemic integration | doctor · lint · smoke · gc · backup · restore · keys · intake · isolation · audit · schedules · operations · bylaws · departments · MCP · broker | doctor, `audit walk`, `schedule list/enable/disable`, `operation list`, `isolation plan`, `backup`, `tick`, `adapter test` | 40+ commands, and **every read of the ones the Chair's own health depends on** |

The shape of the gap is not random: **the dashboard is a viewer with a thin write layer.** It
shows the organization well and operates it barely. The Chair can *watch* a failing instance,
a stale heartbeat, a broken notify route, an unstaffed lane and a rotted artifact pointer — and
cannot *act* on any of them from the page.

---

## 2. Defects: found by a real run, fixed now

Each was reproduced against the real shipped connection package and a real instance, and each
now carries a guard test and a ledger row (the repository's own law).

### D-01 — CRITICAL — a browser POST was remote command execution as the kernel's user

`conformance.run` forwarded a free-text `driver` to `holon adapter test`. That command has an
**optional** positional and a `--supervisor` option whose value is run through a shell
(`holon/integrity/supervisor_conformance.py`, `subprocess.run(..., shell=True)`). So
`driver = "--supervisor=touch /tmp/x"` was not a driver name: it was a command.

Reproduced: the file was created, and a second payload copied the **Chair key** out of the key
directory. The fix: the driver is a plain name (`pickToken`) and the clauses are the driver's own
(`pickEnum`), so the supervisor mode is unreachable from the page.
Guard: `test_the_dashboard_refuses_a_payload_the_kernel_would_read_as_a_command`.

**Still open at the root:** the kernel's `--supervisor` still runs a shell command, and any other
surface that forwards free text to `adapter test` inherits the same trap. `shell=False` +
`shlex.split`, and a required sentinel positional, is the kernel-side fix (a decision, because it
changes a documented CLI contract).

### D-02 — HIGH — a browser POST could paste any file the kernel user can read into the work graph

`holon task add` resolves an argument that begins with `@` as a **file path**
(`holon/cli.py`'s `_text_arg`). The dashboard passed the Chair's prose straight through, so
`intent = "@/etc/passwd"` became the file's content — stored in the work graph, readable back
through the work resources. Reproduced with the passwd file, the hostname and the Chair key.
The fix: the dashboard refuses the shapes the kernel resolves as a file or as stdin
(`pickLiteral`), and a positional that would be read as an option is refused too (`pickPositional`).
Guard: the same test.

### D-03 — HIGH — every failed action answered an empty 400

The error responder used the kernel child's **exit code** as the HTTP status. The kernel exits
1/2/3/4; `Response.json(body, {status: 1})` throws a `RangeError` *inside* the catch block, so
the handler never returned and the browser got a bare 400 with no reason. The Chair could not
tell a refusal from a usage error from a crash. The fix: the exit code travels as its own field
and the status is the error's own code (400–599), never the child's. The full reason now goes to
the Host log, not to the page. Guard:
`test_a_failed_action_answers_a_readable_error_and_a_broken_kernel_is_degraded`.

### D-04 — HIGH — an unreadable instance rendered as a healthy, empty dashboard

A resource is assembled from several kernel reads, and every failed read was coerced to zero or
empty while the status stayed 200. With the kernel command unreachable, the dashboard answered
**200** with `doctorErrors: 0`, `employees: 0`, `openWork: 0`, a green doctor pill and a fresh
heartbeat dot (the heartbeat is read from the filesystem, so it stayed green too). This is the
"empty means ungoverned" class the repository's laws name, in the one surface where it can hide
the whole organization. The fix: a failed read travels as a **degradation** the page shows in a
banner and a red pill, and a doctor that did not answer is `null` (unknown), never `0` (clean).
Guard: the same test.

### D-05 — HIGH — a symlink in a run directory read files outside the instance

The dashboard's file reads were contained by a **lexical** path check, and the paths come from
the runs table — whose directories a body can write. A symlink named `result.json` inside a run
directory pointed the kernel-user reader at any file on the machine; reproduced with the passwd
file and the Chair key. The kernel had already solved this for the agent side
(`O_NOFOLLOW` + a regular-file check); the dashboard reimplemented the read without the fence.
The fix: the parent directory is resolved and measured, the final component is never followed,
and a regular file is required. Guard:
`test_the_dashboard_refuses_a_symlink_that_points_out_of_the_instance`.

### D-06 — MEDIUM — the kernel's registry declared two reads as writes, and one write as a read

`guards` and `keys list` are pure reads declared `mutates=True`, so `--mode ro` refused them and
every read surface that called them showed an **empty panel for a reason nobody could see** (the
Operations tab's Guards card was empty by refusal, not by absence). `isolation plan` always
writes the root setup script but was declared `mutates=False`, so a read-only surface could
write. The flags now state what the commands do. Guards:
`test_a_command_that_only_reads_is_not_declared_mutating`,
`test_a_command_that_writes_is_declared_mutating`.

### D-07 — MEDIUM — three polls of the same resource, each one eleven kernel processes

The page shell, the Overview tab and the composer dock each polled the overview on their own
clock: three assemblies per cycle, each eleven `holon` child processes (~103 ms of CPU each) and
seven SQLite queries. Measured on the live instance: a cold overview is **18 child processes**
and ~1.2 s of CPU; five concurrent overviews are 63 children in 766 ms. The fix: one shared
request per resource for the whole page. The remaining cost (the server still has no single-flight
or concurrency cap) is listed as a gap.

### Also fixed, smaller: the action cache is now cleared even when an action fails (a tick can
write and then fail); `plan.grade` no longer passes the literal string `"null"` when the grade is
absent; a task class is a plain name; the child's environment is the caller's environment (the
`env` argument was half-wired) and the Chair-key variables are scrubbed from it; the browser no
longer receives the child's stderr, the argv and the instance paths.

---

## 3. What is actually sound (verified, not assumed)

- **Owner-only, on both verbs.** The shipped connection service matches the route by exact
  pathname and refuses any peer whose principal is not `owner` — on GET and on POST alike. An
  agent peer gets 403 on both.
- **No path-spelling or method-override bypass.** Trailing slash, `//api/…`, `%2f`, `%68`,
  `/./`, case variants, `x-http-method-override` — all 404 or ignored; they never reach the plugin.
- **Cross-origin is fail-closed.** The service emits no CORS header anywhere, answers no OPTIONS,
  and independently rejects a foreign `Origin`, a cross-site `Sec-Fetch-Site`, a foreign `Host`
  and a missing cookie. The custom write header forces a preflight that never succeeds. The
  session cookie is HttpOnly, SameSite=Strict and authority-bound.
- **No shell in the dashboard.** Every child is `execFile` (argv, never a shell).
- **Reads are read-only.** CLI reads run with `--mode ro` and the kernel refuses a mutating
  command under it; the SQL path is `sqlite3 -readonly`.
- **The SQL seam is sound.** Every interpolated value is quoted through `sqlString()`; the
  free-text search is applied in JavaScript *after* the query; limits are clamped integers.
- **The write path is a named allowlist.** The browser never names a kernel command; every action
  is a `case` in one switch; the destructive ones carry a typed confirmation.
- **No raw-HTML sink in the client.** React escapes everything; there is no `dangerouslySetInnerHTML`,
  no `innerHTML`, no `eval`. The theme is tokens only (two `#000` scrims excepted).
- **The built artifact is reproducible.** `client.js` is exactly what `src/` builds (checked by
  rebuilding and comparing).

---

## 4. The gap list: what the Command Center cannot do

### 4.1 Configuration — almost nothing is visible or editable

There is **no `config` command in the registry at all**. The Settings tab shows the path of
`holon.toml` and an existence dot. The Chair can read four things (autonomy policy, scope roots,
driver names, the skill/playbook/KB lists) and edit **one** (`hr set-driver`).

| missing surface | kernel command(s) | what the Chair cannot do |
|---|---|---|
| every `holon.toml` key (87) | *none* — hand-edited | see or change a single knob: budgets, retention, healing intervals, lanes, classifier, notify, classes, pilot, secret paths, per-department overrides |
| autonomy policy | `charter autonomy` (read only) | move a department from supervised to delegated |
| Chair channels / notify route | `chair-channels` | see where the kernel believes the Chair is — the live instance's notify failures are in the audit trail and the Chair cannot see the cause |
| decision-model config | *none* | see that the classifier is off, rate-limited or pointed at a dead endpoint |
| retention / collection | `gc` | see what would be collected, or collect it |
| drivers (10 of 13 fields) | `drivers` (thinned to name/source/stages) | see the deadline, the posture flags, the scope fingerprint `scope.drift` compares against, or edit a driver |
| scope roots and commands | `scope` (read only) | change a reach; the fingerprint is never shown beside the roots |
| smoke checks | `smoke` | re-run the check whose critical failure is blocking a department |
| the adapter's own state | *none* | see that the Harness bundle copy, the isolated `$DSH_HOME` or the `[isolation] reads` grant for the harness tree is missing — exactly the state the installer prints |

### 4.2 Knowledge — the write lifecycle of every knowledge surface is absent

| surface | read today | writes today |
|---|---|---|
| knowledge bases | `kb list` — and the "seeded" pill is a **hard-coded constant**, so a KB that was never seeded still reads as seeded | none: no `kb seed`, `kb blueprint draft/check/promote`, no `kb run` verbs (`find/view/ask/wake/show/lint` + `new/move/set/link`) |
| institutional memory | `memory search`, `memory episodes`, `recall` | none: no `memory add/pin/unpin/promote/retire/state/show` — the Chair cannot pin a constraint every run in a scope must see, cannot promote a lesson, cannot retire a stale one, cannot open a provenance graph |
| skills | `skill list` | none: no `skill show/path/check`, no `fork/new/export` — `skills.export_stale` is shown with no remedy |
| playbooks | `playbook list` | the rubric and the evidence that decides the next refinement are unreadable (`playbook show`) |
| the corpus | none | `ad find/show` — the ledger of findings, the design records and the decisions are unreachable from the operating surface |

**Two gaps are the kernel's, not the UI's:** there is no `kb retire`, and there is no way to
re-bind a KB to a department after seeding. Both are hand edits in the instance.

### 4.3 Systemic integration — reads are present, the repairs are not

`doctor` is the best-covered surface and also the one that exposes the gaps: the live instance
reports errors the page can show and not fix.

| what the kernel can do | the dashboard |
|---|---|
| `smoke` (re-run the check that blocks a department) | absent — only doctor's findings |
| `gc --apply` (collect what retention expired) | absent |
| `restore --verify-only` / `restore --force` | absent — the Chair can take a backup but cannot verify or restore one |
| `keys list` / `keys gc` / `hr key` / `intake key` | absent — no employee key, no intake door, no orphan visibility |
| `audit samples` / `judge` / `attest` / `truncate` | absent — the Chair can see a break in the chain and cannot attest it |
| `bylaws sync` / `promote` / `emit` | absent — `bylaws.orphan` and `bylaws.stale` are readable and unfixable |
| `dept create` / `profile` / `roles` / `export` / `import` | absent — a department's role slots and its vacancies are invisible |
| `hr hire` / `fire` / `reassign` | absent — only pause/activate/set-driver |
| `schedule add` / `operation add` / `import` / `fire` | absent — only enable/disable and list |
| `objective add` / `show` | absent |
| `lint` (the distribution's own 14-pack rubric) | absent |
| `incident waive` | absent |
| `msg request` (creates work in another department) | absent |
| `task supersede` / `task tree` / `plan queue` / `verify` | absent |
| `isolation apply --force` | absent — the boundary is visible but not closable (correctly: it needs the typed confirmation) |
| `mcp` / `broker` (the employee-facing fence and the user service) | absent — the employee-side contract is invisible to the Chair |

### 4.4 The missing meta-surface — and it already exists in the kernel

The dashboard hand-maintains a 19-case switch. The kernel already publishes the catalogue it
should be derived from:

- `holon help --json` → `cli.manifest()`: every command with its **actor class**, its
  `mutates` flag, its help text and its option/positional names;
- `cli.chair_actions()` / `cli.chair_action_meta()`: the Chair-offerable set, derived from the
  actor class rather than hand-listed (the same lesson as the MCP fence in this repository's
  ledger);
- `mcp.agent_commands()` / `mcp._arg_schema()`: the per-argument types and required flags that a
  schema-driven form needs.

**The one blocker:** `manifest()` publishes options and positionals as bare *strings* — no
types, no `required`, no `choices`. The MCP precedent shows how to carry them without a second
hand-maintained list. With that, a `commands` resource plus a schema-driven action form closes
the largest part of §4.1–4.3 at once, and the dashboard stops being a twin of the registry.

### 4.5 The DSH-side integration itself

The two bundles do not know about each other. `holon-native` gives a *body* the organization as
typed tools; the Command Center gives the *Chair* a page. Nothing connects them: the dashboard
cannot show which Harness profile is running which Holon employee, what a run's posture was,
which tools the native bundle registered, or whether the isolated Harness home exists. The
driver list shows a name and a source; the rest of the adapter's state is invisible.

### 4.6 Smaller, measured gaps

- The `refreshMs` configuration key is **inert**: the client hardcodes 20/30/60 s.
- The locale dictionary covers the chrome; **79 user-visible strings** (modal descriptions, field
  labels, placeholders, status names) are English-only.
- `holon kb run` bypasses the CLI's JSON output entirely, so no client-side parsing can make the
  genome verbs structured — the kernel must grow a `--json` form for them.
- `ad find` / `ad show` print an empty body on no match, so a JSON caller sees nothing.
- The tables have no horizontal scroll container for narrow widths, and the client renders every
  row it is given (no virtualization) — a 500-row board is 500 DOM rows.

### 4.7 Accessibility — measured, and now partly closed

Traced in the client: the two dialogs were `role="dialog"` but **took no focus and let Tab walk
out of them** into the page behind; the tab strips carried **no `aria-selected`**, so a screen
reader could not say which tab was open; an **icon-only button had only a tooltip** for a name;
the search box was named by its placeholder alone; the **toast and the composer dock announced
nothing**; the error box was not a live region.

Fixed in this pass: the dialog keeps the keyboard (focus moves in, Tab stays in, focus comes back),
`aria-selected` on every tab strip, an accessible name on icon-only buttons, a name on the search
box, `role="status"`/`aria-live="polite"` on the loading, toast and composer-dock surfaces, and
`role="alert"` on the error box. Guarded by
`test_the_dashboard_keeps_the_keyboard_and_announces_its_state`.

Still open, and worth a keyboard-only walkthrough in the browser: arrow-key navigation between
tabs (the WAI-ARIA tabs pattern expects it and it is not there), a visible focus ring in both
themes, and the contrast of the `quiet` tone in light mode.

---

## 5. The plan

**Phase 1 — the meta-surface (the biggest lever).** Teach `manifest()` to carry argument types,
required flags and choices (reusing the MCP precedent), add a `commands` resource and a
schema-driven action form, and derive the action allowlist from the registry instead of a
hand-written switch. One change closes a third of the gap table and removes a twin list.

**Phase 2 — the health-to-repair loop.** For every doctor finding, a remedy that exists in the
registry: smoke → re-run; gc → dry-run then apply; scope drift → the installer; skills export
stale → re-export; bylaws orphan/stale → sync then emit; retention overdue → gc. A dashboard that
shows an error and offers no remedy trains the Chair to ignore it.

**Phase 3 — configuration.** A `config` resource (the merged effective configuration, by
section) and a write path for the keys whose change is safe. The kernel needs a `config` command
(or a read API) first: today there is nothing to read.

**Phase 4 — the knowledge lifecycle.** KB seed/draft/check/promote and `kb run`'s verbs; the
memory write verbs (pin, promote, retire, show); `skill show/path/export`; `playbook show`;
`ad find/show`. Two kernel gaps need closing first: `kb retire` and KB re-binding.

**Phase 5 — the DSH-side integration.** An adapter-status resource: which bundle is installed,
where its copy lives, what the isolated Harness home is, what the isolation grant covers, which
Holon employee is bound to which driver and profile.

**Decisions for the Chair** (they change a contract, so they are not agent work): whether the
kernel's `--supervisor` keeps a shell; whether `holon.toml` gains a command; whether the
dashboard's children run as the kernel's user (today they are the Chair by uid) or under the
isolation user; whether the write path gets a per-session nonce instead of a static header.

---

## 6. How this audit was done

- The command surface was **imported**, not read: the registry was dumped from `holon.cli` and
  diffed against every command the dashboard actually invokes.
- The config surface was traced from `docs/BYLAWS.md` §6 to the code that reads each key (87/87
  are read by code today; one legacy section, `[authority]`, is read but undocumented).
- Every defect was **reproduced** against the real shipped connection package and a real
  instance — the RCE wrote a file, the file read produced the passwd content, the symlink read
  produced the hostname, the broken kernel produced the green dashboard — and each carries a
  guard test and a ledger row.
- The child-process cost was measured with an argv-logging wrapper, not estimated.
- Claims from the code were checked by reading the cited control flow; where a claim could not
  be reproduced it is marked plausible, not asserted.

**Limits of this audit.** The rendered page was not driven in a browser (no browser tool was
available in this session), so the visual result of the new degradation banner, the shared poll
and the focus behaviour is unverified by eye; the DOM-level behaviour was verified by the code
and by the guard tests. The seam test still calls the shared Fetch handler directly and therefore
does not cross the connection service's admission gate (the Host/Origin fence and the cookie
check) — a gap in the *test*, not in the route, and worth closing next. A keyboard-only
walkthrough and a light/dark contrast check remain undone for the same reason.
