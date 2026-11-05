/**
 * The run the kernel prepared for this harness process.
 *
 * A Holon dispatch exports the run directory, the stage and the run token; beside them the
 * kernel writes `brief.json`, `BRIEF.md`, `identity.md`, `context.md`, `policy.json`,
 * `envelope.schema.json` and a department-resolved `skills/` tree. This module reads those
 * artifacts once, at plugin activation, and keeps only what the tools and the posture guard
 * need. It is deliberately tolerant: a malformed artifact must not fail the harness boot,
 * because the harness still has a job to do and the kernel is the authority that will judge it.
 *
 * `token` lives here only so the CLI child can be given `HOLON_RUN_TOKEN`. It is never
 * rendered into a prompt, a tool result, or a log line.
 */

import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

function readText(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

function readJson(path) {
  try {
    return JSON.parse(readText(path));
  } catch {
    return null;
  }
}

function homeFromCommand(command) {
  if (typeof command !== 'string') return '';
  const parts = command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i].replace(/^['"]|['"]$/g, '');
    if (part === '--home' && parts[i + 1]) return parts[i + 1].replace(/^['"]|['"]$/g, '');
    if (part.startsWith('--home=')) return part.slice('--home='.length).replace(/^['"]|['"]$/g, '');
  }
  return '';
}

/**
 * Read the run the current environment belongs to, or `null` for an ordinary session.
 *
 * `inRun` is true as soon as the environment names a run, even when the token is absent: that
 * distinction is what lets the write tools fail closed instead of falling through to the Chair
 * principal the CLI would otherwise assume.
 */
export function loadRun(env = process.env) {
  const dir = env.HOLON_RUN_DIR || env.HOLON_BRIEF_DIR || '';
  const brief = dir ? readJson(join(dir, 'brief.json')) : null;
  const policy = dir ? readJson(join(dir, 'policy.json')) : null;
  const runId = env.HOLON_RUN_ID || brief?.run_id || '';
  const inRun = Boolean(dir || runId || env.HOLON_RUN_TOKEN);
  if (!inRun) return null;

  const token = env.HOLON_RUN_TOKEN || brief?.token || '';
  const stage = brief?.stage || env.HOLON_STAGE || '';
  const workdir = brief?.workdir || env.HOLON_WORKDIR || dir || process.cwd();
  const resultPath = resolve(
    env.HOLON_RESULT_PATH || brief?.result_path || join(dir, 'result.json'),
  );
  const skillsDir = brief?.skills || (dir ? join(dir, 'skills') : '');
  const home = env.HOLON_HOME || homeFromCommand(brief?.holon) || '';

  return {
    dir,
    home,
    inRun,
    token,
    tokenMissing: !token,
    runId,
    taskId: brief?.task_id || env.HOLON_TASK_ID || '',
    workId: brief?.work_id || '',
    stage,
    role: brief?.role || env.HOLON_ROLE || '',
    posture: brief?.posture || policy?.posture || env.HOLON_POSTURE || '',
    employeeId: brief?.employee_id || env.HOLON_EMPLOYEE_ID || '',
    employeeName: brief?.employee_name || '',
    workdir,
    resultPath,
    briefMd: brief?.brief_md || env.HOLON_BRIEF_MD || (dir ? join(dir, 'BRIEF.md') : ''),
    contextMd: brief?.context_md || (dir ? join(dir, 'context.md') : ''),
    identityMd: brief?.identity_md || (dir ? join(dir, 'identity.md') : ''),
    envelopePath: brief?.envelope || (dir ? join(dir, 'envelope.schema.json') : ''),
    skillsDir,
    skill: brief?.skill || '',
    brief,
    policy: policy ?? null,
    leaseUntil: brief?.lease_until || '',
  };
}

/** The run facts safe to show a model: no token, no whole brief duplication. */
export function runSummary(run) {
  if (!run) return null;
  return {
    run_id: run.runId,
    task_id: run.taskId,
    work_id: run.workId,
    stage: run.stage,
    role: run.role,
    posture: run.posture,
    employee_id: run.employeeId,
    employee_name: run.employeeName,
    workdir: run.workdir,
    brief_md: run.briefMd,
    identity_md: run.identityMd,
    context_md: run.contextMd,
    result_path: run.resultPath,
    envelope: run.envelopePath,
    skills: run.skillsDir,
    policy: run.dir ? join(run.dir, 'policy.json') : '',
    lease_until: run.leaseUntil,
  };
}

/** The roots this run may write: the policy's roots, the approved plan's writes, the run dir. */
export function writableRoots(run) {
  if (!run) return [];
  const roots = [];
  for (const p of run.policy?.roots ?? []) if (typeof p === 'string' && p) roots.push(p);
  for (const w of run.policy?.writes ?? []) {
    if (typeof w !== 'string' || !w) continue;
    roots.push(isAbsolute(w) ? w : resolve(run.workdir || run.dir || process.cwd(), w));
  }
  if (run.dir) roots.push(run.dir);
  return [...new Set(roots.map((p) => resolve(p)))];
}

export { existsSync, readText };
