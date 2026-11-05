/**
 * The kernel command seam.
 *
 * `holon mcp` runs the CLI in-process; this plugin cannot, because it is JavaScript. So every
 * operation is one `holon --json ...` child process, invoked without a shell: arguments are an
 * array, the run token arrives through the inherited environment (never argv), and stdout is
 * parsed as the JSON the CLI's `--json` flag promises.
 *
 * Command resolution, in the order a run actually needs it:
 *   1. the plugin's own `command` config (an instance that pins one interpreter);
 *   2. `HOLON` from the run environment — the kernel renders this exact command string for every
 *      body, including the `--home` it is running against;
 *   3. `holon` on PATH;
 *   4. `<python> -m holon`, which resolves through the `PYTHONPATH` the kernel exports.
 *
 * A run whose `HOLON_RUN_TOKEN` is missing must never silently become the Chair. `holon`'s auth
 * falls back to the Chair key when no token is present (the jcode seam, 2026-10-20), so this
 * module refuses to serve a run-scoped operation without a token instead of letting one call
 * inherit the widest principal in the distribution.
 */

import { spawnSync } from 'node:child_process';
import { accessSync, constants, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const MAX_ERROR_CHARS = 4000;

/** A command string split the way a POSIX shell would split it for argv. */
export function splitCommand(text) {
  const out = [];
  let cur = '';
  let quote = null;
  let escaped = false;
  for (const ch of String(text ?? '')) {
    if (escaped) {
      cur += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\' && quote !== "'") {
      escaped = true;
      continue;
    }
    if (quote !== null) {
      if (ch === quote) quote = null;
      else cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (cur) {
        out.push(cur);
        cur = '';
      }
      continue;
    }
    cur += ch;
  }
  if (escaped) cur += '\\';
  if (cur) out.push(cur);
  return out;
}

function expandHome(p) {
  if (typeof p !== 'string' || !p) return p;
  if (p === '~') return homedir();
  if (p.startsWith('~/')) return join(homedir(), p.slice(2));
  return p;
}

function hasFlag(argv, flag) {
  return argv.includes(flag);
}

function findOnPath(name, env) {
  const sep = process.platform === 'win32' ? ';' : ':';
  for (const dir of String(env.PATH ?? '').split(sep)) {
    if (!dir) continue;
    const candidate = join(dir, process.platform === 'win32' ? `${name}.exe` : name);
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // next directory
    }
  }
  return null;
}

function normalizeCommand(value) {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) {
    if (value.length === 0 || value.some((v) => typeof v !== 'string' || !v)) {
      throw new TypeError('holon-native: command must be a non-empty array of strings');
    }
    return [...value];
  }
  if (typeof value === 'string') {
    const parts = splitCommand(value);
    if (parts.length === 0) throw new TypeError('holon-native: command is empty');
    return parts;
  }
  throw new TypeError('holon-native: command must be a string or an array of strings');
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Operator-side configuration this plugin reads without touching the profile patch:
 * `$DSH_HOME/holon.json` = `{ "home": "/path/to/instance", "command": ["holon"] }`.
 * It is written by adapters/deepseek-harness/install.py; an isolated run does not need it
 * because the kernel exports HOLON_HOME and HOLON.
 */
export function loadOperatorConfig(env) {
  const dshHome = env.DSH_HOME || join(homedir(), '.dsh');
  const cfg = readJson(join(dshHome, 'holon.json'));
  return cfg && typeof cfg === 'object' ? cfg : null;
}

export class HolonCli {
  constructor({ config, env, run, operator }) {
    this.config = config;
    this.env = { ...env };
    this.runContext = run ?? null;
    this.home = expandHome(config.holonHome || env.HOLON_HOME || operator?.home || '');
    const operatorCommand = operator?.command;
    const configured = normalizeCommand(config.command ?? operatorCommand);
    let base = configured;
    if (!base && env.HOLON) {
      const fromEnv = splitCommand(env.HOLON);
      if (fromEnv.length) base = fromEnv;
    }
    if (!base) {
      const found = findOnPath('holon', env);
      base = found ? [found] : [env.HOLON_PYTHON || 'python3', '-m', 'holon'];
    }
    if (this.home && !hasFlag(base, '--home')) base = [...base, '--home', this.home];
    this.base = base;
    // A run token belongs in the environment, never in argv: argv is visible in `ps`.
    if (this.runContext?.token && !this.env.HOLON_RUN_TOKEN) this.env.HOLON_RUN_TOKEN = this.runContext.token;
  }

  get configured() {
    return Boolean(this.home) || Boolean(this.runContext);
  }

  /** True when this process is inside a kernel-prepared run. */
  get inRun() {
    return Boolean(this.runContext);
  }

  requireHome() {
    if (this.configured) return;
    throw new Error(
      'holon-native: no Holon instance is configured. Set HOLON_HOME, add "holonHome" to this '
      + 'plugin row, or write {"home": "/path/to/instance"} to $DSH_HOME/holon.json '
      + '(adapters/deepseek-harness/install.py --register-dsh-home does it).',
    );
  }

  /**
   * Run one kernel command.
   *
   * `readOnly` adds the CLI's own read-only door (`--mode ro`); it is the kernel's read-write
   * choice, not this plugin's. A run token in the environment keeps the principal the run's
   * employee. Exit code 3 is returned rather than thrown when `allowNoWork` is set: the CLI's
   * `claim` uses it for "nothing to do", which is an answer, not a failure.
   */
  run(args, { readOnly = true, timeoutMs, cwd, allowNoWork = false } = {}) {
    this.requireHome();
    const global = [...this.base, '--json'];
    if (readOnly) global.push('--mode', 'ro');
    const argv = [...global, ...args];
    const res = spawnSync(argv[0], argv.slice(1), {
      cwd: cwd || this.runContext?.workdir || process.cwd(),
      env: this.env,
      timeout: timeoutMs ?? this.config.timeoutMs,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    });
    if (res.error) {
      const reason = res.error.code === 'ENOENT'
        ? `cannot execute ${JSON.stringify(argv[0])} (not found)`
        : res.error.code === 'ETIMEDOUT'
          ? `timed out after ${timeoutMs ?? this.config.timeoutMs} ms`
          : res.error.message;
      throw new Error(`holon-native: ${reason}`);
    }
    const stdout = res.stdout ?? '';
    const stderr = res.stderr ?? '';
    if (res.status === 3 && allowNoWork) return { status: res.status, stdout, stderr, noWork: true };
    if (res.status !== 0) {
      const detail = (stderr.trim() || stdout.trim() || 'no output').slice(0, MAX_ERROR_CHARS);
      throw new Error(`holon-native: \`holon ${args.join(' ')}\` exited ${res.status}: ${detail}`);
    }
    return { status: res.status, stdout, stderr, noWork: false };
  }

  /** Run one command whose stdout is the CLI's JSON document. */
  json(args, options = {}) {
    const out = this.run(args, options);
    if (out.noWork) return null;
    const text = out.stdout.trim();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `holon-native: \`holon ${args.join(' ')}\` did not print JSON: ${text.slice(0, 1200)}`,
      );
    }
  }

  who() {
    return this.json(['whoami']);
  }

  status() {
    return this.json(['status']);
  }
}
