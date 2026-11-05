# holon-native — the Holon organization inside DeepSeek Harness

A Host bundle that makes a Holon instance native to DeepSeek Harness. It has two modes and no npm
dependencies:

- **Run mode.** When the kernel dispatches a body, it exports `HOLON_RUN_DIR` (and `HOLON_RUN_TOKEN`).
  The bundle reads the run's `brief.json`, `BRIEF.md`, `identity.md`, `policy.json` and
  `skills/`, registers the department-resolved skills in the Harness skill registry, injects the
  stage contract and reach into the system prompt, registers `holon_submit`, and enforces the
  observe/act posture on every tool call.
- **Operator mode.** In an ordinary session the same instance is readable through typed tools
  (`holon_identity`, `holon_status`, `holon_tasks`, `holon_recall`). Writes are off unless
  `allowWrites` is set.

## Install

From an adapter checkout, the supported path is the adapter installer, which creates an isolated
Harness home and profile for Holon's employees:

```sh
python3 adapters/deepseek-harness/install.py --holon-home ~/holon
```

For the operator's own Harness profile, install this directory as a bundle with the Harness Plugin
Manager (`plugin_manager`, `install_bundle`, target = this directory), then point the bundle at an
instance with `$DSH_HOME/holon.json`:

```json
{"home": "/abs/path/to/instance", "command": ["/abs/path/to/holon"]}
```

`install.py --register-dsh-home ~/.dsh` writes that file. A kernel-dispatched run needs neither:
`HOLON_HOME` and `HOLON` are in its environment.

## Configuration

The bundle row accepts:

| Field | Default | Meaning |
|---|---|---|
| `holonHome` | `$HOLON_HOME`, then `$DSH_HOME/holon.json` | The instance the tools read and write. |
| `command` | `$HOLON`, then `holon` on PATH, then `python3 -m holon` | The kernel command, as a string or an argv array. |
| `allowWrites` | `false` | Register `holon_msg`/`holon_memory` outside a run. |
| `timeoutMs` | `120000` | Per-command deadline. |
| `enforcePolicy` | `true` | Enforce `policy.json` on tool calls in run mode. |
| `announce` | `true` | Add the short organization section to ordinary sessions. |

Unknown fields are ignored; invalid types fail activation loudly. `Config` has no schema because a
dependency-free bundle cannot import the Harness schema package; the values are validated in
`index.js`.

## Tools

| Tool | Mode | What it does |
|---|---|---|
| `holon_identity` | both | Who the process is (principal, employee) and, in a run, the stage, posture, brief and result path. |
| `holon_status` | both | Open work, ready stages by stage, what waits on the Chair, headcount. |
| `holon_tasks` | both | `task list` (work or stages) or `task show` with `task_id`. |
| `holon_recall` | both | One joined answer from memory, episodes, skills and playbooks, with the gaps. |
| `holon_submit` | run | Writes the run's `result.json` and submits the envelope to the kernel. The primary hand-in. |
| `holon_msg` | run, or `allowWrites` | Message a colleague, department, the organization or the Chair. `question`/`request` to the Chair reach the digest. |
| `holon_memory` | run, or `allowWrites` | Search institutional memory or add one durable item. |

## Run mode

The kernel exports `HOLON_RUN_DIR`, `HOLON_RUN_TOKEN`, `HOLON_STAGE`, `HOLON_POSTURE`, `HOLON_HOME`
and `HOLON` for a dispatched body. The bundle:

1. registers every `skills/*/SKILL.md` as a runtime skill, so the department's fork wins over the
   adapter's standard export (runtime outranks user entries in the registry);
2. adds a `holon:run` system section (the stage contract, the hand-in rule, the posture) and a
   `holon:run-reach` runtime context (roots, writes, commands, budget, result path);
3. guards every tool call: in observe, `write`/`edit` are refused and `bash` is limited to the
   kernel's read-only vocabulary (plus refusals for `find -delete/-exec`, `sed -i`, `sort -o`,
   `xargs`, command substitution and redirection); in act, file writes are confined to the roots
   `policy.json` names plus the run directory.
4. **never** falls back to the Chair when the run token is missing: a run-scoped write fails closed
   and says why. The kernel's own auth would otherwise assume the Chair key (the 2026-10-20 seam).

The token is passed to the CLI child in its environment, never argv, and never appears in a prompt,
tool result or log line.

## Security boundary

An unattended body cannot answer an approval prompt, so the adapter's profile runs the Harness with
`DSH_PERMISSION_MODE=danger-full-access`; the run's real reach is Holon's `policy.json`, enforced by
this bundle, with the kernel's working-directory fingerprint as the backstop
(`read_only_enforced=false`). The trust boundary that keeps an employee out of the Chair's key and
`work.db` is Holon's `[isolation]` agent user, not the Harness sandbox. See the adapter README.
