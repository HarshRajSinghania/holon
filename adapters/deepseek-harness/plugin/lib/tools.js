/**
 * The organization as native Harness tools.
 *
 * Every tool is one kernel command; the CLI remains the authority on who may run what, and every
 * mutation is checked by the kernel's own actor classes. The tool surface is deliberately small:
 * an organization is entered by finding out who you are, what is ready, what the organization
 * already knows, and how to hand a result in — not by exposing every command a shell could run.
 * `holon mcp` remains the complete agent surface for a harness that mounts an MCP server; this
 * plugin is the native face of the same organization.
 */

import { writeFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { runSummary } from './context.js';

const MAX_RENDER = 40000;
const MEMORY_KINDS = ['fact', 'decision', 'constraint', 'preference', 'lesson', 'open_question', 'glossary', 'artifact'];
const MESSAGE_KINDS = ['dm', 'channel', 'request', 'question', 'answer', 'proposal'];

function renderText(value, limit = MAX_RENDER) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  if (typeof text !== 'string') return [{ type: 'text', text: 'null' }];
  if (text.length <= limit) return [{ type: 'text', text }];
  return [{ type: 'text', text: text.slice(0, limit) + '\n… truncated (' + text.length + ' chars); narrow the query.' }];
}

function defineTool(name, description, parameters, execute, options = {}) {
  return {
    name,
    description,
    parameters,
    output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => renderText(value) },
    execute,
    isConcurrencySafe: options.isConcurrencySafe ?? (() => true),
  };
}

function inside(child, root) {
  const rel = relative(root, child);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

function clampLimit(value, fallback = 50) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(500, Math.trunc(n)));
}

function taskArgs(args) {
  const argv = ['task', 'list'];
  const stages = args.view === 'stages' || Boolean(args.stage);
  if (stages) argv.push('--stages');
  if (args.status) argv.push('--status', String(args.status));
  if (args.dept) argv.push('--dept', String(args.dept));
  if (args.assignee) argv.push('--assignee', String(args.assignee));
  if (args.stage) argv.push('--stage', String(args.stage));
  argv.push('--limit', String(clampLimit(args.limit)));
  return { argv, view: stages ? 'stages' : 'work' };
}

export function registerTools(ctx, { cli, run, config }) {
  const add = (definition) => ctx.effect(() => ctx.tools.register(definition));
  const writesAllowed = Boolean(run) || config.allowWrites;

  add(defineTool(
    'holon_identity',
    'Who you are in the Holon organization: principal, employee, and the run/stage this process was '
      + 'prepared for. Call this first when a request concerns the organization, its work, or its employees.',
    { type: 'object', properties: {}, additionalProperties: false },
    () => {
      const who = cli.who() ?? { principal: null };
      return {
        ...who,
        run: runSummary(run),
        posture: run?.posture ?? null,
        writes_allowed: writesAllowed,
      };
    },
  ));

  add(defineTool(
    'holon_status',
    "The organization's state: open work, ready stages by stage, what waits on the Chair, and "
      + 'departments/employees. Read-only.',
    { type: 'object', properties: {}, additionalProperties: false },
    () => cli.status(),
  ));

  add(defineTool(
    'holon_tasks',
    'List work or stage nodes (or show one task with task_id). Read-only. Use view="stages" to see '
      + 'the ready pipeline; use task_id for one work node with its outputs and conversation.',
    {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'Show this work node instead of listing.' },
        view: { type: 'string', enum: ['work', 'stages'], description: 'List work nodes (default) or stage nodes.' },
        status: { type: 'string', description: 'Filter by status (open, claimable, ready, running, done, cancelled).' },
        dept: { type: 'string', description: 'Filter by department slug.' },
        assignee: { type: 'string', description: 'Filter by employee id (emp_…).' },
        stage: { type: 'string', enum: ['research', 'shape', 'plan', 'approve', 'execute', 'verify', 'retro'] },
        limit: { type: 'number', description: 'Maximum rows (1–500, default 50).' },
      },
      additionalProperties: false,
    },
    (args) => {
      if (args.task_id) return cli.json(['task', 'show', String(args.task_id)]);
      const { argv, view } = taskArgs(args);
      const tasks = cli.json(argv) ?? [];
      return { view, count: Array.isArray(tasks) ? tasks.length : 0, tasks };
    },
  ));

  add(defineTool(
    'holon_recall',
    'One joined answer from the organization\'s knowledge: memory, verified episodes, skills and '
      + 'playbooks, plus the gaps where it has nothing. Read-only. Ask a question, not a keyword—the '
      + 'kernel joins the sources for you.',
    {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'What you need to know.' },
        dept: { type: 'string', description: 'Restrict to one department slug.' },
        limit: { type: 'number', description: 'Maximum items per source (default kernel choice).' },
      },
      required: ['question'],
      additionalProperties: false,
    },
    (args) => {
      const argv = ['recall', String(args.question)];
      if (args.dept) argv.push('--dept', String(args.dept));
      if (args.limit) argv.push('--limit', String(clampLimit(args.limit, 20)));
      return cli.json(argv);
    },
  ));

  if (run) {
    add(defineTool(
      'holon_submit',
      'Hand in this run\'s result: the JSON envelope the stage brief describes. Validates nothing '
        + 'itself; writes the run\'s result.json and submits it to the kernel, which answers with '
        + 'exactly what it accepted or which fields it refused. Use this as the primary hand-in — '
        + 'an observe-stage body does not need a file-write tool.',
      {
        type: 'object',
        properties: {
          result: { type: 'object', additionalProperties: true, description: 'The stage envelope, as the brief describes it.' },
          run_id: { type: 'string', description: 'Optional; defaults to this process\'s run. Must match the run token.' },
        },
        required: ['result'],
        additionalProperties: false,
      },
      (args) => submitResult(cli, run, args),
      { isConcurrencySafe: () => false },
    ));
  }

  if (writesAllowed) {
    add(defineTool(
      'holon_msg',
      'Message a colleague, a department, the organization or the Chair (to = emp:<id> | dept:<slug> '
        + '| org | chair). Use kind "question" or "request" to the Chair when work is blocked; the '
        + 'Chair digest owes it an answer.',
      {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'emp:<id>, dept:<slug>, org, or chair.' },
          body: { type: 'string', description: 'Literal message text.' },
          kind: { type: 'string', enum: MESSAGE_KINDS, description: 'Default dm (channel to a department or org).' },
          task: { type: 'string', description: 'Optional task id this message is about.' },
        },
        required: ['to', 'body'],
        additionalProperties: false,
      },
      (args) => sendMessage(cli, args),
      { isConcurrencySafe: () => false },
    ));
  }

  if (writesAllowed) {
    add(defineTool(
      'holon_memory',
      'Institutional memory. action="search" finds what the organization recorded (facts, decisions, '
        + 'lessons, constraints); action="add" records one durable item at emp:/dept:/org or a class/project scope.',
      {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['search', 'add'], description: 'search (default) or add.' },
          query: { type: 'string', description: 'search: what to look for.' },
          scope: { type: 'string', description: 'add: emp:<id> | dept:<slug> | org | class:<name> | <project ref>.' },
          kind: { type: 'string', enum: MEMORY_KINDS, description: 'add: the item kind.' },
          content: { type: 'string', description: 'add: the item text.' },
          confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
          pin: { type: 'boolean', description: 'add: pin it so it is never evicted.' },
          limit: { type: 'number', description: 'search: maximum matches.' },
        },
        required: ['action'],
        additionalProperties: false,
      },
      (args) => memoryOperation(cli, args),
      { isConcurrencySafe: (args) => (args?.action ?? 'search') === 'search' },
    ));
  }
}

function submitResult(cli, run, args) {
  if (run.tokenMissing) {
    throw new Error('holon-native: HOLON_RUN_TOKEN is missing, so a submit would fall back to the '
      + 'Chair principal. A lost run token must fail closed; refusing rather than submitting as Chair.');
  }
  if (!run.runId) throw new Error('holon-native: this process has no run id; there is nothing to submit to.');
  if (args.run_id && String(args.run_id) !== run.runId) {
    throw new Error('holon-native: run_id ' + JSON.stringify(args.run_id) + ' is not this process\'s run ('
      + run.runId + '). The run token authenticates one run.');
  }
  let envelope = args.result;
  if (typeof envelope === 'string') {
    try { envelope = JSON.parse(envelope); } catch { throw new Error('holon-native: result was a string that is not JSON.'); }
  }
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
    throw new Error('holon-native: result must be the stage envelope object, not ' + (Array.isArray(envelope) ? 'an array' : typeof envelope) + '.');
  }
  const target = resolve(run.resultPath || resolve(run.dir || '.', 'result.json'));
  if (run.dir && !inside(target, resolve(run.dir))) {
    throw new Error('holon-native: refusing to write the result outside the run directory: ' + target);
  }
  writeFileSync(target, JSON.stringify(envelope, null, 2) + '\n', { encoding: 'utf8', mode: 0o640 });
  let out;
  try {
    out = cli.json(['submit', run.runId, '--file', target], { readOnly: false, timeoutMs: Math.max(cli.config.timeoutMs, 300000) });
  } catch (error) {
    throw new Error(error.message + '\nThe envelope was written to ' + target + '.');
  }
  return { submitted: true, run_id: run.runId, result_path: target, result: out };
}

function sendMessage(cli, args) {
  if (typeof args.to !== 'string' || !args.to.trim()) throw new Error('holon-native: msg needs a recipient.');
  if (typeof args.body !== 'string' || !args.body.trim()) throw new Error('holon-native: msg needs a body.');
  const kind = args.kind ?? 'dm';
  if (!MESSAGE_KINDS.includes(kind)) throw new Error('holon-native: unknown message kind ' + JSON.stringify(kind) + '.');
  const argv = ['msg', 'send', '--kind', kind, '--literal'];
  if (args.task) argv.push('--task', String(args.task));
  argv.push('--', String(args.to), String(args.body));
  return cli.json(argv, { readOnly: false });
}

function memoryOperation(cli, args) {
  if ((args.action ?? 'search') === 'search') {
    if (typeof args.query !== 'string' || !args.query.trim()) throw new Error('holon-native: memory search needs a query.');
    const argv = ['memory', 'search', String(args.query)];
    if (args.scope) argv.push('--scope', String(args.scope));
    if (args.limit) argv.push('--limit', String(clampLimit(args.limit, 20)));
    return cli.json(argv);
  }
  if (args.action !== 'add') throw new Error('holon-native: memory action must be "search" or "add".');
  for (const key of ['scope', 'kind', 'content']) {
    if (typeof args[key] !== 'string' || !args[key].trim()) throw new Error('holon-native: memory add needs ' + key + '.');
  }
  if (!MEMORY_KINDS.includes(args.kind)) throw new Error('holon-native: unknown memory kind ' + JSON.stringify(args.kind) + '.');
  const argv = ['memory', 'add', '--scope', String(args.scope), '--kind', String(args.kind), '--content', String(args.content), '--literal'];
  if (args.confidence) {
    if (!['low', 'medium', 'high'].includes(args.confidence)) throw new Error('holon-native: confidence must be low, medium or high.');
    argv.push('--confidence', String(args.confidence));
  }
  if (args.pin) argv.push('--pin');
  return cli.json(argv, { readOnly: false });
}
