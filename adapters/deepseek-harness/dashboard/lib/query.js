import { HolonError, sqlString } from './holon.js';

export const STAGES = ['research', 'shape', 'plan', 'approve', 'execute', 'verify', 'retro'];
export const STAGE_STATUS = ['ready', 'claimed', 'done', 'failed', 'cancelled'];
export const WORK_STATUS = ['blocked', 'open', 'waiting', 'needs_input', 'done', 'failed', 'cancelled'];
export const RUN_STATUS = ['running', 'succeeded', 'failed', 'timeout', 'abandoned'];
export const MESSAGE_KINDS = ['dm', 'channel', 'request', 'question', 'answer', 'proposal'];

const ID_RE = /^[A-Za-z0-9_]{3,80}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;

export function pickText(source, key, { max = 4000, required = false } = {}) {
  const value = source?.[key];
  if (value === undefined || value === null) {
    if (required) throw new HolonError(`${key} is required`, { code: 'invalid_request', status: 400 });
    return '';
  }
  if (typeof value !== 'string') {
    throw new HolonError(`${key} must be a string`, { code: 'invalid_request', status: 400 });
  }
  const trimmed = value.trim();
  if (required && !trimmed) {
    throw new HolonError(`${key} is required`, { code: 'invalid_request', status: 400 });
  }
  if (value.length > max) {
    throw new HolonError(`${key} is longer than ${max} characters`, { code: 'invalid_request', status: 400 });
  }
  return required ? trimmed : value;
}

export function pickId(source, key, required = true) {
  const value = source?.[key];
  if ((value === undefined || value === null || value === '') && !required) return null;
  if (typeof value !== 'string' || !ID_RE.test(value)) {
    throw new HolonError(`${key} is not a valid Holon id`, { code: 'invalid_request', status: 400 });
  }
  return value;
}

export function pickSlug(source, key, required = false) {
  const value = source?.[key];
  if (value === undefined || value === null || value === '') {
    if (required) throw new HolonError(`${key} is required`, { code: 'invalid_request', status: 400 });
    return '';
  }
  if (typeof value !== 'string' || !SLUG_RE.test(value)) {
    throw new HolonError(`${key} is not a valid department slug`, { code: 'invalid_request', status: 400 });
  }
  return value;
}

export function pickEnum(source, key, allowed, fallback = '') {
  const value = source?.[key];
  if (value === undefined || value === null || value === '') return fallback;
  if (!allowed.includes(value)) {
    throw new HolonError(`${key} must be one of ${allowed.join(', ')}`, { code: 'invalid_request', status: 400 });
  }
  return value;
}

export function pickInt(source, key, fallback, min, max) {
  const value = source?.[key];
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new HolonError(`${key} must be an integer from ${min} to ${max}`, { code: 'invalid_request', status: 400 });
  }
  return n;
}

export function pickLiteral(source, key, { max = 4000, required = false } = {}) {
  /**
   * A value the KERNEL would resolve as something other than text.
   *
   * `holon/cli.py`'s `_text_arg` reads a value that starts with '@' as a FILE PATH and a bare
   * '-' as STDIN. The dashboard's payloads are text the Chair typed: a title that happens to
   * start with '@' must be stored as that title, not read from disk and pasted into the work
   * graph. So the shapes the kernel treats as references are refused here, before the value
   * reaches the command line.
   */
  const value = pickText(source, key, { max, required });
  if (!value) return value;
  if (value.startsWith('@') || value === '-') {
    throw new HolonError(
      `${key} may not start with "@" or be "-" (the kernel reads those as a file or as stdin)`,
      { code: 'invalid_request', status: 400 },
    );
  }
  return value;
}

export function pickPositional(source, key, { max = 4000, required = false } = {}) {
  /**
   * A value the kernel parses as an OPTION when it starts with '-'.
   *
   * The dashboard sends argv, never a shell, so nothing is injected into a command line — but a
   * positional that begins with '-' is still read as a flag by the kernel's own parser, which
   * turns the Chair's text into a different command (or a usage dump). Refuse the shape.
   */
  const value = pickText(source, key, { max, required });
  if (value && value.startsWith('-')) {
    throw new HolonError(
      `${key} may not start with "-" (the kernel would read it as an option, not as text)`,
      { code: 'invalid_request', status: 400 },
    );
  }
  return value;
}

export function pickToken(source, key, { max = 80, required = true } = {}) {
  /**
   * A plain NAME: a driver, a blueprint, a slug. No spaces, no options, no shell metacharacters.
   *
   * This is the guard that keeps the browser from reaching a command's other, shell-shaped mode:
   * `holon adapter test --supervisor CMD` runs CMD through a shell, and a free-text field that
   * can carry `--supervisor=...` turns a conformance button into remote command execution.
   */
  const value = pickText(source, key, { max, required });
  if (value && !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)) {
    throw new HolonError(
      `${key} must be a plain name (letters, digits, dot, dash, underscore)`,
      { code: 'invalid_request', status: 400 },
    );
  }
  return value;
}

export function pickBool(source, key, fallback = false) {
  const value = source?.[key];
  if (value === undefined || value === null || value === '') return fallback;
  if (value === true || value === 'true' || value === '1' || value === 1) return true;
  if (value === false || value === 'false' || value === '0' || value === 0) return false;
  throw new HolonError(`${key} must be a boolean`, { code: 'invalid_request', status: 400 });
}

export function shorten(text, max = 600) {
  const s = typeof text === 'string' ? text : '';
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export function compactTask(row, intentLength = 500) {
  if (!row) return row;
  const { intent, ...rest } = row;
  return { ...rest, intent_preview: shorten(intent, intentLength) };
}

export const TASK_SELECT = `
SELECT t.id, t.root_id, t.parent_id, t.depth, t.stage, t.dept_id, d.slug AS dept,
       t.assignee, e.name AS assignee_name, t.approver, t.requested_by, t.source,
       t.title, t.intent, t.acceptance, t.task_class, t.project_ref, t.workdir,
       t.priority, t.risk, t.status, t.outcome, t.blocked_reason, t.attempt,
       t.max_attempts, t.grade, t.grade_floor, t.grade_proposed, t.grade_reasons,
       t.decided_by, t.decided_at, t.decision_note, t.recurring, t.due,
       t.created_at, t.updated_at, t.lane, t.objective_id, t.playbook, t.playbook_version,
       w.title AS work_title, w.status AS work_status,
       (SELECT count(*) FROM tasks s WHERE s.root_id = t.root_id AND s.stage IS NOT NULL
          AND s.status IN ('ready','claimed')) AS open_stages
FROM tasks t
LEFT JOIN departments d ON d.id = t.dept_id
LEFT JOIN employees e ON e.id = t.assignee
LEFT JOIN tasks w ON w.id = COALESCE(t.parent_id, t.id)
`;

export const RUN_SELECT = `
SELECT r.id, r.task_id, r.kind, r.employee_id, e.name AS employee_name, r.driver,
       r.attempt, r.lease_until, r.heartbeat_at, r.started_at, r.ended_at, r.status,
       r.tokens_in, r.tokens_out, r.cost, r.exit_code, r.brief_path, r.log_path,
       r.tool_calls, r.duration_s, r.harness_build,
       t.stage, t.title AS task_title, t.status AS task_status, t.dept_id, d.slug AS dept
FROM runs r
JOIN tasks t ON t.id = r.task_id
LEFT JOIN employees e ON e.id = r.employee_id
LEFT JOIN departments d ON d.id = t.dept_id
`;

export const MESSAGE_SELECT = `
SELECT m.id, m.ts, m.sender, e.name AS sender_name, m.to_ref, m.kind, m.task_id,
       m.thread_id, m.body, m.ack_required, m.acked_at
FROM messages m
LEFT JOIN employees e ON e.id = substr(m.sender, 5)
`;

export function taskWhere(params, { view = 'stages', limit = 300 } = {}) {
  const conditions = [];
  const stage = pickEnum(params, 'stage', STAGES);
  const status = pickEnum(params, 'status', view === 'work' ? WORK_STATUS : STAGE_STATUS);
  const dept = pickSlug(params, 'dept');
  const assignee = pickId(params, 'assignee', false);
  const lane = pickEnum(params, 'lane', ['script', 'fast', 'full']);
  const taskClass = pickText(params, 'taskClass', { max: 80 });
  if (view === 'work') conditions.push('t.stage IS NULL');
  else if (view === 'approvals') conditions.push("t.stage = 'approve'", "t.status = 'ready'");
  else conditions.push('t.stage IS NOT NULL');
  if (stage && view === 'stages') conditions.push(`t.stage = ${sqlString(stage)}`);
  if (status && view !== 'approvals') conditions.push(`t.status = ${sqlString(status)}`);
  if (dept) conditions.push(`d.slug = ${sqlString(dept)}`);
  if (assignee) conditions.push(`t.assignee = ${sqlString(assignee)}`);
  if (lane) conditions.push(`t.lane = ${sqlString(lane)}`);
  if (taskClass) conditions.push(`t.task_class = ${sqlString(taskClass)}`);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = view === 'work'
    ? 'ORDER BY t.updated_at DESC'
    : "ORDER BY CASE t.status WHEN 'ready' THEN 0 WHEN 'claimed' THEN 1 WHEN 'failed' THEN 2 ELSE 3 END, t.priority ASC, t.updated_at DESC";
  return { clause: `${where} ${order} LIMIT ${Math.max(1, Math.min(500, limit))}`, where, conditions };
}

export async function taskRows(holon, params, options = {}) {
  const { clause } = taskWhere(params, options);
  return holon.sql(`${TASK_SELECT} ${clause}`);
}

export async function approvals(holon, limit = 200) {
  return holon.sql(`${TASK_SELECT} WHERE t.stage = 'approve' AND t.status = 'ready'
    ORDER BY t.priority ASC, t.created_at ASC LIMIT ${Math.max(1, Math.min(500, limit))}`);
}

export async function pipelineCounts(holon) {
  return holon.sql('SELECT stage, status, count(*) AS count FROM tasks WHERE stage IS NOT NULL GROUP BY stage, status');
}

export async function workCounts(holon) {
  return holon.sql('SELECT status, count(*) AS count FROM tasks WHERE stage IS NULL GROUP BY status');
}

export function emptyPipeline() {
  const map = {};
  for (const stage of STAGES) {
    map[stage] = { ready: 0, claimed: 0, done: 0, failed: 0, cancelled: 0, total: 0 };
  }
  return map;
}

export function applyPipeline(map, rows) {
  for (const row of rows || []) {
    const stage = map[row.stage];
    if (!stage) continue;
    const status = row.status;
    if (status in stage) stage[status] = Number(row.count || 0);
    stage.total += Number(row.count || 0);
  }
  return map;
}

export async function runRows(holon, params = {}) {
  const status = pickEnum(params, 'status', RUN_STATUS);
  const driver = pickText(params, 'driver', { max: 80 });
  const employee = pickId(params, 'employee', false);
  const task = pickId(params, 'task', false);
  const limit = pickInt(params, 'limit', 120, 1, 500);
  const conditions = [];
  if (status) conditions.push(`r.status = ${sqlString(status)}`);
  if (driver) conditions.push(`r.driver = ${sqlString(driver)}`);
  if (employee) conditions.push(`r.employee_id = ${sqlString(employee)}`);
  if (task) conditions.push(`r.task_id = ${sqlString(task)}`);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await holon.sql(`${RUN_SELECT} ${where} ORDER BY r.started_at DESC LIMIT ${limit}`);
  const counts = await holon.sql('SELECT status, count(*) AS count FROM runs GROUP BY status');
  return {
    rows,
    counts: Object.fromEntries((counts || []).map((row) => [row.status, Number(row.count || 0)])),
  };
}

export async function messageRows(holon, { filter = 'all', limit = 100 } = {}) {
  const where = ["(m.to_ref = 'chair' OR m.sender = 'chair')"];
  if (filter === 'unacked') where.push('m.ack_required = 1', 'm.acked_at IS NULL');
  if (filter === 'incoming') where.push("m.to_ref = 'chair'");
  if (filter === 'sent') where.push("m.sender = 'chair'");
  const rows = await holon.sql(`${MESSAGE_SELECT} WHERE ${where.join(' AND ')} ORDER BY m.ts DESC LIMIT ${Math.max(1, Math.min(300, limit))}`);
  const [counts] = await holon.sql(`
    SELECT count(*) AS total,
           sum(CASE WHEN to_ref = 'chair' AND ack_required = 1 AND acked_at IS NULL THEN 1 ELSE 0 END) AS unacked,
           sum(CASE WHEN to_ref = 'chair' THEN 1 ELSE 0 END) AS incoming,
           sum(CASE WHEN sender = 'chair' THEN 1 ELSE 0 END) AS sent
    FROM messages WHERE to_ref = 'chair' OR sender = 'chair'
  `);
  return {
    rows,
    counts: {
      total: Number(counts?.total || 0),
      unacked: Number(counts?.unacked || 0),
      incoming: Number(counts?.incoming || 0),
      sent: Number(counts?.sent || 0),
    },
  };
}

export async function messageThread(holon, id) {
  const rows = await holon.sql(`${MESSAGE_SELECT} WHERE m.id = ${sqlString(id)} LIMIT 1`);
  if (!rows.length) throw new HolonError(`message ${id} not found`, { code: 'not_found', status: 404 });
  const root = rows[0];
  const threadId = root.thread_id || root.id;
  const thread = await holon.sql(`${MESSAGE_SELECT}
    WHERE m.id = ${sqlString(threadId)} OR m.thread_id = ${sqlString(threadId)}
    ORDER BY m.ts ASC LIMIT 200`);
  return { generatedAt: new Date().toISOString(), root, messages: thread };
}

export function collectArtifacts(stages, home) {
  const out = [];
  for (const stage of Array.isArray(stages) ? stages : []) {
    const output = stage?.output;
    if (!output || typeof output !== 'object') continue;
    const body = output.body && typeof output.body === 'object' ? output.body : {};
    for (const key of ['artifacts', 'writes']) {
      const list = Array.isArray(body[key]) ? body[key] : [];
      for (const entry of list) {
        const raw = typeof entry === 'string' ? entry : entry?.path;
        if (typeof raw !== 'string' || !raw.trim()) continue;
        const path = raw.startsWith('/') ? raw : `${stage.workdir || home}/${raw}`;
        out.push({
          path,
          stage: stage.stage,
          output_id: output.id,
          kind: key === 'artifacts' ? 'artifact' : 'write',
          exists: false,
        });
      }
    }
  }
  return out;
}

export class Cache {
  constructor(defaultTtl = 8000) {
    this.defaultTtl = defaultTtl;
    this.entries = new Map();
  }

  get(key, ttl, load) {
    const now = Date.now();
    const hit = this.entries.get(key);
    if (hit && hit.expires > now) return hit.value;
    const value = Promise.resolve().then(load);
    this.entries.set(key, { expires: now + (ttl ?? this.defaultTtl), value });
    value.catch(() => {
      if (this.entries.get(key)?.value === value) this.entries.delete(key);
    });
    return value;
  }

  clear() {
    this.entries.clear();
  }
}

export async function settle(promise) {
  try {
    return { ok: true, value: await promise };
  } catch (error) {
    return { ok: false, error: { code: error?.code || 'error', message: error?.message || String(error) } };
  }
}
