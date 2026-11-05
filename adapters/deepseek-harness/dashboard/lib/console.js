/**
 * The console: every command the kernel offers, and one way to run it.
 *
 * The dashboard used to hand-maintain a switch of nineteen actions while the kernel registered
 * 130 commands, so 86 of them — every knowledge write, every configuration change, every repair —
 * were unreachable from the browser. This module removes the twin: it reads the kernel's own
 * catalogue (`holon help --json`, which is the registry's manifest) and builds both the form and
 * the argv from it.
 *
 * **The fence is the manifest, not a list here.** The kernel marks each argument with what it
 * MEANS — `path` (a file or directory it opens), `shell` (a command line it executes), `text` (a
 * value it may resolve as `@file` or stdin) — and this module refuses those, so a browser can
 * never turn a field into a file read or a command execution. The curated actions in `actions.js`
 * stay for the flows that need a typed confirmation; this is the long tail, and it is derived.
 *
 * Nothing here builds a shell command line: argv is an array, and every option is passed as
 * `--flag=value`, which argparse cannot mistake for another flag.
 */

import { HolonError } from './holon.js';
import { pickBool, pickEnum, pickInt, pickText } from './query.js';

/** The manifest as the kernel publishes it: one row per command, with its typed arguments. */
export async function consoleManifest(holon) {
  // `holon --json help` IS the manifest: the global `--json` makes the help command print it.
  // (Passing `--json` again after `help` is an error — the flag is global, not per-command.)
  return holon.json(['help'], { timeoutMs: 30000 });
}

/** The commands a browser console may offer, with the arguments it may fill.
 *
 * A command whose REQUIRED argument is fenced (a file, a command line) can never run from a
 * browser: the console would offer it, the Chair would fill the rest of the form, and the
 * kernel would refuse the one argument the browser is not allowed to name. Seven commands were
 * in that state — `dept export`, `dept import`, `venture import`, `operation import`,
 * `skill export`, `backup`, `restore` — plus `bylaws draft`, whose command line is required.
 * They are not offered, and the page says why: the catalogue carries the fence, not a list.
 *
 * A command with an OPTIONAL fenced argument stays, and the fenced argument is published with
 * its fence (`fenced: 'path' | 'shell'`) so the form can show what it may not fill.
 */
export function consoleCommands(rows) {
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => row && row.offerable)
    .filter((row) => !(row.args || []).some((arg) => arg && arg.freeform))
    .filter((row) => !(row.args || []).some((arg) => arg && arg.required && (arg.path || arg.shell)))
    .map((row) => ({
      command: row.command,
      actor: row.actor,
      mutates: row.mutates,
      help: row.help,
      args: (row.args || []).map((arg) => (arg && (arg.path || arg.shell))
        ? { ...arg, fenced: arg.path ? 'path' : 'shell' }
        : arg),
    }));
}

/**
 * The argv for one command, built from the manifest and the values the browser sent.
 *
 * A value the kernel would read as a FILE (`@path`) or as stdin (`-`) is refused rather than
 * sanitised: the browser has no file to offer, and the shape that reads one is a shape the
 * kernel itself resolves. A positional that starts with "-" is refused, because argparse would
 * read it as an option.
 */
export function buildArgv(row, values) {
  const args = [];
  const positional = [];
  const byName = new Map();
  for (const arg of row.args || []) {
    byName.set(arg.name, arg);
  }
  const supplied = values && typeof values === 'object' && !Array.isArray(values) ? values : {};
  for (const [name, value] of Object.entries(supplied)) {
    const arg = byName.get(name);
    if (!arg) {
      throw new HolonError(`${row.command} has no argument ${name}`, { code: 'invalid_request', status: 400 });
    }
    if (arg.path) {
      throw new HolonError(`${arg.flag || name} names a file or a directory, so the console does not offer it`,
        { code: 'invalid_request', status: 400 });
    }
    if (arg.shell) {
      throw new HolonError(`${arg.flag || name} is a command line, so the console does not offer it`,
        { code: 'invalid_request', status: 400 });
    }
    if (arg.freeform) {
      throw new HolonError(`${arg.flag || name} takes free-form trailing arguments, so the console does not offer it`,
        { code: 'invalid_request', status: 400 });
    }
    if (arg.text) {
      const text = pickText(supplied, name, { max: 100000, required: false });
      if (text.startsWith('@') || text === '-') {
        throw new HolonError(`${name} may not start with "@" or be "-" (the kernel reads those as a file or stdin)`,
          { code: 'invalid_request', status: 400 });
      }
    }
  }
  for (const arg of row.args || []) {
    const raw = supplied[arg.name];
    const empty = raw === undefined || raw === null || raw === '';
    if (arg.positional) {
      if (empty) {
        if (arg.required) {
          throw new HolonError(`${row.command} needs ${arg.name}`, { code: 'invalid_request', status: 400 });
        }
        continue;
      }
      const value = String(raw);
      if (value.startsWith('-')) {
        throw new HolonError(`${arg.name} may not start with "-" (it would be read as an option)`,
          { code: 'invalid_request', status: 400 });
      }
      positional.push(value);
      continue;
    }
    if (empty) {
      if (arg.required) {
        throw new HolonError(`${row.command} needs ${arg.flag}`, { code: 'invalid_request', status: 400 });
      }
      continue;
    }
    if (arg.kind === 'boolean') {
      if (pickBool(supplied, arg.name)) args.push(arg.flag);
      continue;
    }
    if (arg.kind === 'integer') {
      args.push(`${arg.flag}=${pickInt(supplied, arg.name, 0, -1000000000, 1000000000)}`);
      continue;
    }
    if (arg.kind === 'number') {
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        throw new HolonError(`${arg.flag} must be a number`, { code: 'invalid_request', status: 400 });
      }
      args.push(`${arg.flag}=${n}`);
      continue;
    }
    if (arg.kind === 'array') {
      const list = Array.isArray(raw) ? raw : String(raw).split(',').map((x) => x.trim()).filter(Boolean);
      for (const item of list) args.push(`${arg.flag}=${item}`);
      continue;
    }
    if (arg.choices) {
      args.push(`${arg.flag}=${pickEnum(supplied, arg.name, arg.choices)}`);
      continue;
    }
    args.push(`${arg.flag}=${String(raw)}`);
  }
  return [...positional, ...args];
}

/**
 * The verbs that CREATE an object rather than act on one.
 *
 * A create command's first positional is the new object's name (`task add <title>`,
 * `dept create <slug>`), not an existing object's identifier, so it is not an action ON an
 * existing object. `skill fork <name>` is not here: it acts on a skill that exists.
 */
const CREATE_VERBS = ['add', 'create', 'new', 'import', 'seed', 'draft'];

/** The first positional of a command: the argument that names the object it acts on. */
function firstPositional(row) {
  return (row?.args || []).find((arg) => arg && arg.positional) || null;
}

/**
 * The commands that act on one object: the same family, the same identifier, and not a creation.
 *
 * This is the rule that binds the kernel's catalogue to the dashboard's objects, and it lives
 * here rather than in the browser because the browser cannot be tested. A command the kernel adds
 * appears on the objects it belongs to without a line of client code; a command the kernel takes
 * away disappears with it.
 */
export function entityCommands(rows, family, idName) {
  const words = (row) => String(row?.command || '').split(' ');
  return (rows || [])
    .filter((row) => row && words(row)[0] === family)
    .filter((row) => !words(row).slice(1).some((word) => CREATE_VERBS.includes(word)))
    .filter((row) => {
      const positional = firstPositional(row);
      return Boolean(positional) && positional.name === idName;
    })
    .map((row) => row.command);
}

/** The command that shows one object in depth: the family's own `show`, or its first read. */
export function previewCommand(rows, family, idName) {
  const candidates = (rows || []).filter((row) => row && String(row.command || '').split(' ')[0] === family);
  const takes = (row) => {
    const positional = firstPositional(row);
    return Boolean(positional) && positional.name === idName;
  };
  const show = candidates.find((row) => row.command === family + ' show' && takes(row));
  if (show) return show.command;
  const read = candidates.find((row) => !row.mutates && takes(row));
  return read ? read.command : null;
}

/**
 * The entity catalogue: for every family and every identifier its commands take, the commands
 * that act on that object and the command that previews it.
 */
export function entityCatalogue(rows) {
  const catalogue = rows || [];
  const entities = {};
  const previews = {};
  for (const row of catalogue) {
    const family = String(row?.command || '').split(' ')[0];
    const positional = firstPositional(row);
    if (!family || !positional || !positional.name) continue;
    entities[family] = entities[family] || {};
    entities[family][positional.name] = entities[family][positional.name] || [];
    for (const command of entityCommands(catalogue, family, positional.name)) {
      if (!entities[family][positional.name].includes(command)) entities[family][positional.name].push(command);
    }
    if (!previews[family]) previews[family] = {};
    if (!previews[family][positional.name]) {
      const preview = previewCommand(catalogue, family, positional.name);
      if (preview) previews[family][positional.name] = preview;
    }
  }
  return { entities, previews };
}

/**
 * Run one command from the catalogue.
 *
 * `mutates` decides the mode: a write runs with `--mode rw`, a read with `--mode ro` — the
 * kernel then refuses a read that tries to write, which is the fence the whole instance rests on.
 */
export async function runCommand(holon, row, values, { timeoutMs = 120000 } = {}) {
  const argv = buildArgv(row, values);
  const mode = row.mutates ? 'rw' : 'ro';
  const result = await holon.json([...row.command.split(' '), ...argv], { mode, timeoutMs });
  return { command: row.command, result };
}
