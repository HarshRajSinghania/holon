/**
 * The kernel seam for the Holon Command Center.
 *
 * The dashboard is a Harness plugin, so it cannot import the Python kernel. Every read is one
 * `holon --json` child process at `--mode ro`; every write is one of the curated commands in
 * `api.js`. Direct SQLite reads are limited to the two surfaces the CLI does not expose as JSON:
 * the run ledger and the Chair's message threads. They open the database with `-readonly`.
 *
 * Nothing here uses a shell: command strings are split for argv, never handed to `/bin/sh`.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  closeSync, constants, existsSync, fstatSync, openSync, readFileSync, readSync, readdirSync,
  realpathSync, statSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';

const execFileAsync = promisify(execFile);
const MAX_BUFFER = 64 * 1024 * 1024;

export class HolonError extends Error {
  constructor(message, { code = 'holon', status = null, stdout = '', stderr = '', exitCode = null } = {}) {
    super(message);
    this.name = 'HolonError';
    this.code = code;
    this.status = status;
    this.stdout = stdout;
    this.stderr = stderr;
    this.exitCode = exitCode;
  }
}

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

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function findOnPath(name, env) {
  const sep = process.platform === 'win32' ? ';' : ':';
  for (const dir of String(env.PATH ?? '').split(sep)) {
    if (!dir) continue;
    const candidate = join(dir, process.platform === 'win32' ? `${name}.exe` : name);
    try {
      statSync(candidate);
      return candidate;
    } catch {
      // next directory
    }
  }
  return null;
}

function normalizeCommand(value) {
  if (value === undefined || value === null || value === '') return null;
  if (Array.isArray(value)) {
    if (value.length === 0 || value.some((v) => typeof v !== 'string' || !v)) {
      throw new TypeError('holon-dashboard: command must be a non-empty array of strings');
    }
    return [...value];
  }
  if (typeof value === 'string') {
    const parts = splitCommand(value);
    if (parts.length === 0) throw new TypeError('holon-dashboard: command is empty');
    return parts;
  }
  throw new TypeError('holon-dashboard: command must be a string or an array of strings');
}

export function normalizeConfig(raw, env = process.env) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const dshHome = env.DSH_HOME || join(homedir(), '.dsh');
  const operator = readJson(join(dshHome, 'holon.json')) || {};
  const configuredHome = expandHome(source.holonHome || env.HOLON_HOME || operator.home || '');
  const home = configuredHome ? resolve(configuredHome) : '';
  const configured = normalizeCommand(source.command ?? operator.command);
  let command = configured;
  if (!command && env.HOLON) {
    const fromEnv = splitCommand(env.HOLON);
    if (fromEnv.length) command = fromEnv;
  }
  if (!command) {
    const found = findOnPath('holon', env);
    command = found ? [found] : [env.HOLON_PYTHON || 'python3', '-m', 'holon'];
  }
  const num = (value, fallback, min, max) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.trunc(n)));
  };
  return {
    home,
    command,
    allowActions: source.allowActions !== false,
    refreshMs: num(source.refreshMs, 20000, 5000, 300000),
    timeoutMs: num(source.timeoutMs, 120000, 5000, 600000),
    actionTimeoutMs: num(source.actionTimeoutMs, 300000, 10000, 1800000),
    cacheTtlMs: num(source.cacheTtlMs, 8000, 0, 120000),
    dshHome,
    configPath: join(dshHome, 'holon.json'),
  };
}

export function isUnder(root, candidate) {
  const r = relative(resolve(root), resolve(candidate));
  return r === '' || (!r.startsWith('..') && !isAbsolute(r));
}

/**
 * Resolve a path the dashboard is about to read with the kernel user's privileges.
 *
 * `isUnder` alone is lexical, so a symlink planted inside a run directory points anywhere the
 * kernel user can read — which is how a file outside the instance (the Chair key among them)
 * would be served to the browser. The kernel already solved this for the agent side
 * (`holon/execution/isolation.py`'s `read_agent_file`: O_NOFOLLOW, then an fstat of a regular
 * file). Here the parent directory is realpath'd so an intermediate symlink is followed and
 * measured, the final component is never followed, and anything that lands outside the instance
 * is refused. A path that cannot be resolved is not a path that can be read.
 */
export function safeReadPath(home, path) {
  if (!home || !path || !isUnder(home, path)) return null;
  let realRoot;
  let realParent;
  try {
    realRoot = realpathSync(home);
    realParent = realpathSync(dirname(resolve(path)));
  } catch {
    return null;
  }
  if (!isUnder(realRoot, realParent)) return null;
  return { dir: realParent, file: join(realParent, basename(path)) };
}

export function sqlString(value) {
  return "'" + String(value).replaceAll("'", "''") + "'";
}

export function jsonText(value) {
  return JSON.stringify(value, null, 2);
}

export class Holon {
  constructor(config, env = process.env) {
    this.config = config;
    this.home = config.home;
    this.command = config.command;
    this.workDb = this.home ? join(this.home, 'execution', 'runtime', 'work.db') : '';
    // The child's environment is the CALLER's environment, not the ambient process's, so the
    // scrub below is a property of this dashboard and not of whoever launched the Host.
    this.env = { ...env };
    delete this.env.HOLON_RUN_TOKEN;
    delete this.env.HOLON_KEY;
    delete this.env.HOLON_TOKEN;
    // The Chair credential is a file the child reads by path, not a variable it inherits: the
    // dashboard IS the Chair (it runs as the kernel's user), and that grant must not ride along
    // inside a raw key value in every child's environment.
    delete this.env.HOLON_CHAIR_KEY;
    delete this.env.HOLON_CHAIR_KEY_FILE;
    if (this.home) this.env.HOLON_HOME = this.home;
  }

  get configured() {
    return Boolean(this.home) && existsSync(this.home);
  }

  requireHome() {
    if (!this.configured) {
      throw new HolonError(
        'No Holon instance is configured. Set HOLON_HOME, write {"home": "/path/to/instance"} to '
          + '$DSH_HOME/holon.json, or set holonHome in the holon-dashboard plugin row.',
        { code: 'not_configured' },
      );
    }
  }

  async exec(args, {
    mode = 'ro',
    json = true,
    timeoutMs = this.config.timeoutMs,
    allowNonZero = false,
    allowEmpty = false,
    cwd = this.home,
  } = {}) {
    this.requireHome();
    const argv = [...this.command];
    if (!argv.includes('--home')) argv.push('--home', this.home);
    if (json) argv.push('--json');
    if (mode === 'ro') argv.push('--mode', 'ro');
    argv.push(...args);
    try {
      const { stdout, stderr } = await execFileAsync(argv[0], argv.slice(1), {
        cwd: cwd || this.home,
        env: this.env,
        timeout: timeoutMs,
        maxBuffer: MAX_BUFFER,
        encoding: 'utf8',
        windowsHide: true,
      });
      const text = String(stdout ?? '');
      if (json && text.trim()) {
        try {
          return { json: JSON.parse(text), text, stderr: String(stderr ?? ''), status: 0 };
        } catch {
          throw new HolonError(`holon ${args.join(' ')} did not print JSON: ${text.slice(0, 1200)}`, {
            code: 'not_json',
            stdout: text,
            stderr: String(stderr ?? ''),
          });
        }
      }
      if (!allowEmpty && !text.trim() && json) {
        return { json: null, text, stderr: String(stderr ?? ''), status: 0 };
      }
      return { json: null, text, stderr: String(stderr ?? ''), status: 0 };
    } catch (error) {
      // The child's EXIT CODE is not an HTTP status. It is reported as `exitCode` and never as
      // `status`: a kernel refusal exits 4, a usage error exits 2, and a RangeError inside the
      // error responder would take the whole route down instead of answering the Chair.
      const exitCode = typeof error?.code === 'number' ? error.code : null;
      const stdout = String(error?.stdout ?? '');
      const stderr = String(error?.stderr ?? '');
      if (allowNonZero && exitCode !== null) {
        let parsed = null;
        if (json && stdout.trim()) {
          try {
            parsed = JSON.parse(stdout);
          } catch {
            parsed = null;
          }
        }
        return { json: parsed, text: stdout, stderr, status: exitCode };
      }
      const reason = error?.code === 'ENOENT'
        ? `cannot execute ${JSON.stringify(argv[0])} (not found)`
        : error?.code === 'ETIMEDOUT'
          ? `timed out after ${timeoutMs} ms`
          : error?.message || 'command failed';
      throw new HolonError(
        `holon ${args.join(' ')} failed: ${reason}${stderr.trim() ? `\n${stderr.trim().slice(0, 4000)}` : ''}`,
        { code: 'command_failed', status: null, stdout, stderr, exitCode },
      );
    }
  }

  async json(args, options = {}) {
    const out = await this.exec(args, { ...options, json: true });
    return out.json;
  }

  async text(args, options = {}) {
    const out = await this.exec(args, { ...options, json: false });
    return out.text;
  }

  async sql(query, { timeoutMs = 20000 } = {}) {
    this.requireHome();
    if (!this.workDb || !existsSync(this.workDb)) {
      throw new HolonError(`work database not found at ${this.workDb}`, { code: 'no_work_db' });
    }
    try {
      const { stdout } = await execFileAsync('sqlite3', ['-readonly', '-json', this.workDb, query], {
        timeout: timeoutMs,
        maxBuffer: MAX_BUFFER,
        encoding: 'utf8',
        windowsHide: true,
      });
      const text = String(stdout ?? '').trim();
      return text ? JSON.parse(text) : [];
    } catch (error) {
      throw new HolonError(
        `read-only SQLite query failed: ${error?.stderr || error?.message || 'unknown error'}`,
        { code: 'sqlite_failed' },
      );
    }
  }

  async version() {
    try {
      return (await this.text(['--version'], { mode: 'none', timeoutMs: 5000 })).trim();
    } catch {
      return null;
    }
  }

  heartbeat() {
    this.requireHome();
    const path = join(this.home, '.clock', 'last_tick');
    try {
      const raw = readFileSync(path, 'utf8').trim();
      const epoch = Number(raw);
      if (!Number.isFinite(epoch) || epoch <= 0) return { present: false, path };
      const ageSeconds = Math.max(0, Math.round(Date.now() / 1000 - epoch));
      return {
        present: true,
        path,
        epoch,
        at: new Date(epoch * 1000).toISOString(),
        ageSeconds,
        stale: ageSeconds > 300,
      };
    } catch {
      return { present: false, path, ageSeconds: null, stale: true };
    }
  }

  tailFile(path, lines = 160, maxBytes = 96 * 1024) {
    const safe = safeReadPath(this.home, path);
    if (!safe) {
      return { ok: false, error: 'path is outside the instance' };
    }
    let fd = null;
    try {
      // O_NOFOLLOW: the final component is never a symlink, so a body cannot plant one where
      // the kernel later reads (the agent side refuses the same way — isolation.py).
      fd = openSync(safe.file, constants.O_RDONLY | constants.O_NOFOLLOW);
      const stat = fstatSync(fd);
      if (!stat.isFile()) {
        closeSync(fd);
        fd = null;
        return { ok: false, error: 'not a regular file', path };
      }
      const size = stat.size;
      const start = Math.max(0, size - maxBytes);
      const length = Math.min(maxBytes, size);
      const buffer = Buffer.alloc(length);
      readSync(fd, buffer, 0, length, start);
      closeSync(fd);
      fd = null;
      const text = buffer.toString('utf8');
      const split = text.split(/\r?\n/);
      return {
        ok: true,
        path,
        size,
        mtime: stat.mtime.toISOString(),
        truncated: start > 0,
        text: split.slice(-lines).join('\n'),
      };
    } catch (error) {
      if (fd !== null) { try { closeSync(fd); } catch { /* already closed */ } }
      return { ok: false, error: error?.message || 'cannot read file', path };
    }
  }

  readJsonFile(path, maxBytes = 256 * 1024) {
    const safe = safeReadPath(this.home, path);
    if (!safe) {
      return { ok: false, error: 'path is outside the instance' };
    }
    let fd = null;
    try {
      fd = openSync(safe.file, constants.O_RDONLY | constants.O_NOFOLLOW);
      const stat = fstatSync(fd);
      if (!stat.isFile()) {
        closeSync(fd);
        fd = null;
        return { ok: false, error: 'not a regular file', path };
      }
      if (stat.size > maxBytes) {
        closeSync(fd);
        fd = null;
        return { ok: false, error: `file is ${stat.size} bytes; too large to inline`, path, size: stat.size };
      }
      const buffer = Buffer.alloc(stat.size);
      readSync(fd, buffer, 0, stat.size, 0);
      closeSync(fd);
      fd = null;
      const text = buffer.toString('utf8');
      let value = null;
      try {
        value = JSON.parse(text);
      } catch {
        value = null;
      }
      return { ok: true, path, size: stat.size, text, value };
    } catch (error) {
      return { ok: false, error: error?.message || 'cannot read file', path };
    }
  }

  listBackups() {
    this.requireHome();
    const dir = join(this.home, 'backups');
    try {
      return readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => {
          const path = join(dir, entry.name);
          try {
            const stat = statSync(path);
            const files = readdirSync(path);
            const bytes = files.reduce((sum, file) => {
              try {
                return sum + statSync(join(path, file)).size;
              } catch {
                return sum;
              }
            }, 0);
            return { name: entry.name, path, mtime: stat.mtime.toISOString(), files: files.length, bytes };
          } catch {
            return { name: entry.name, path, mtime: null, files: 0, bytes: 0 };
          }
        })
        .sort((a, b) => String(b.mtime).localeCompare(String(a.mtime)))
        .slice(0, 20);
    } catch {
      return [];
    }
  }

  instanceLabel() {
    return this.home ? basename(this.home) : '(unconfigured)';
  }
}
