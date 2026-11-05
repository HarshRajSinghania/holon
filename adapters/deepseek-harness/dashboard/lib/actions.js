import { HolonError } from './holon.js';
import { consoleCommands, consoleManifest, runCommand } from './console.js';
import {
  pickBool, pickEnum, pickId, pickInt, pickLiteral, pickPositional, pickSlug, pickText, pickToken,
} from './query.js';

function run(holon, config, args, timeoutMs = config.actionTimeoutMs) {
  return holon.json(args, { mode: 'rw', timeoutMs });
}

function note(payload, key = 'note', required = false) {
  return pickText(payload, key, { max: 4000, required });
}

function requireConfirm(payload, expected) {
  if (pickText(payload, 'confirm', { max: 80, required: true }) !== expected) {
    throw new HolonError(`this action requires confirm "${expected}"`, { code: 'confirmation_required', status: 400 });
  }
}

export async function runAction(holon, config, name, payload) {
  if (!config.allowActions) {
    throw new HolonError('actions are disabled in this dashboard configuration', { code: 'actions_disabled', status: 403 });
  }
  switch (name) {
    case 'plan.approve': {
      const ref = pickId(payload, 'ref');
      const args = ['plan', 'approve', ref];
      const text = note(payload);
      if (text) args.push(`--note=${text}`);
      if (pickBool(payload, 'recurring')) args.push('--recurring');
      return { action: name, result: await run(holon, config, args) };
    }
    case 'plan.reject': {
      const ref = pickId(payload, 'ref');
      const text = note(payload, 'note', true);
      return { action: name, result: await run(holon, config, ['plan', 'reject', `--note=${text}`, ref]) };
    }
    case 'plan.grade': {
      const ref = pickId(payload, 'ref');
      // The grade is required by the kernel; a missing one must not become the string 'null'.
      if (payload?.grade === undefined || payload?.grade === null || payload?.grade === '') {
        throw new HolonError('grade is required', { code: 'invalid_request', status: 400 });
      }
      const grade = pickInt(payload, 'grade', null, 0, 4);
      const text = note(payload, 'note', true);
      return { action: name, result: await run(holon, config, ['plan', 'grade', `--note=${text}`, ref, String(grade)]) };
    }
    case 'task.cancel': {
      const id = pickId(payload, 'id');
      const text = note(payload, 'note', true);
      return { action: name, result: await run(holon, config, ['task', 'cancel', `--note=${text}`, id]) };
    }
    case 'task.retry': {
      const id = pickId(payload, 'id');
      return { action: name, result: await run(holon, config, ['task', 'retry', id]) };
    }
    case 'task.replan': {
      const id = pickId(payload, 'id');
      const args = ['task', 'replan', id];
      const text = note(payload);
      if (text) args.push(`--note=${text}`);
      return { action: name, result: await run(holon, config, args) };
    }
    case 'task.answer': {
      const id = pickId(payload, 'id');
      const text = pickPositional(payload, 'text', { max: 8000, required: true });
      return { action: name, result: await run(holon, config, ['task', 'answer', id, text]) };
    }
    case 'task.add': {
      // The title is the kernel's first POSITIONAL: a title starting with '-' would be parsed as
      // an option. The intent and the acceptance are values the kernel resolves through
      // `_text_arg`, where '@path' means "read this file" — a shape a Chair's prose never means.
      const title = pickPositional(payload, 'title', { max: 300, required: true });
      const intent = pickLiteral(payload, 'intent', { max: 40000, required: true });
      const args = ['task', 'add', title, `--intent=${intent}`];
      const acceptance = pickLiteral(payload, 'acceptance', { max: 8000 });
      if (acceptance) args.push(`--acceptance=${acceptance}`);
      const dept = pickSlug(payload, 'dept');
      if (dept) args.push('--dept', dept);
      const assign = pickId(payload, 'assign', false);
      if (assign) args.push('--assign', assign);
      const cls = pickToken(payload, 'taskClass', { max: 80, required: false });
      if (cls) args.push('--task-class', cls);
      const lane = pickEnum(payload, 'lane', ['auto', 'fast', 'full'], 'auto');
      if (lane) args.push('--lane', lane);
      const risk = pickEnum(payload, 'risk', ['low', 'normal', 'high', 'irreversible'], 'normal');
      args.push('--risk', risk);
      const priority = pickInt(payload, 'priority', 2, 0, 4);
      args.push('--priority', String(priority));
      return { action: name, result: await run(holon, config, args) };
    }
    case 'hr.pause':
    case 'hr.activate': {
      const employee = pickId(payload, 'employee');
      const text = note(payload, 'reason', true);
      const verb = name === 'hr.pause' ? 'pause' : 'activate';
      return { action: name, result: await run(holon, config, ['hr', verb, `--reason=${text}`, employee]) };
    }
    case 'hr.setDriver': {
      const employee = pickId(payload, 'employee');
      const driver = pickText(payload, 'driver', { max: 80, required: true });
      const text = note(payload, 'reason', true);
      return { action: name, result: await run(holon, config, ['hr', 'set-driver', `--driver=${driver}`, `--reason=${text}`, employee]) };
    }
    case 'schedule.enable': {
      const id = pickId(payload, 'id');
      const args = ['schedule', 'enable', id];
      if (pickBool(payload, 'force')) args.push('--force');
      return { action: name, result: await run(holon, config, args) };
    }
    case 'schedule.disable': {
      const id = pickId(payload, 'id');
      return { action: name, result: await run(holon, config, ['schedule', 'disable', id]) };
    }
    case 'msg.send': {
      const to = pickText(payload, 'to', { max: 200, required: true });
      if (!/^(chair|org|emp:[A-Za-z0-9_]+|dept:[a-z0-9-]+)$/.test(to)) {
        throw new HolonError('to must be chair, org, emp:<id>, or dept:<slug>', { code: 'invalid_request', status: 400 });
      }
      const body = pickText(payload, 'body', { max: 20000, required: true });
      const kind = pickEnum(payload, 'kind', ['dm', 'channel', 'request', 'question', 'answer', 'proposal'], 'dm');
      const task = pickId(payload, 'task', false);
      const args = ['msg', 'send', '--kind', kind, '--literal'];
      if (task) args.push('--task', task);
      args.push('--', to, body);
      return { action: name, result: await run(holon, config, args) };
    }
    case 'msg.reply': {
      const message = pickId(payload, 'message');
      const body = pickText(payload, 'body', { max: 20000, required: true });
      return { action: name, result: await run(holon, config, ['msg', 'reply', '--literal', '--', message, body]) };
    }
    case 'doctor.run': {
      const value = await holon.json(['doctor'], { allowNonZero: true, timeoutMs: 60000 });
      return { action: name, result: value };
    }
    case 'tick.run': {
      requireConfirm(payload, 'RUN TICK');
      const output = await holon.text(['tick', '--foreground'], { mode: 'rw', timeoutMs: Math.max(config.actionTimeoutMs, 180000) });
      return { action: name, result: { output } };
    }
    case 'backup.run': {
      requireConfirm(payload, 'BACKUP');
      const stamp = new Date().toISOString().replaceAll(':', '').replace(/\.\d+Z$/, 'Z');
      const to = `${holon.home}/backups/holon-dashboard-${stamp}`;
      const output = await holon.text(['backup', '--to', to], { mode: 'rw', timeoutMs: Math.max(config.actionTimeoutMs, 600000) });
      return { action: name, result: { to, output } };
    }
    case 'conformance.run': {
      requireConfirm(payload, 'CONFORMANCE');
      // `holon adapter test` has two modes: a DRIVER name, and `--supervisor CMD` — which runs
      // CMD through a shell. A free-text field that can carry `--supervisor=...` turns this
      // button into remote command execution as the kernel's user, so the driver is a plain name
      // and the clauses are the driver's own (the supervisor suite's clause names are refused).
      const driver = pickToken(payload, 'driver', { max: 80, required: true });
      const clauses = pickEnum(payload, 'clauses', ['driver', 'plan', 'approve', 'execute', 'verify'], 'driver');
      const value = await holon.json(['adapter', 'test', driver, '--clauses', clauses, '--timeout', '180'], {
        mode: 'rw', timeoutMs: Math.max(config.actionTimeoutMs, 240000),
      });
      return { action: name, result: value };
    }
    case 'isolation.plan': {
      const value = await holon.json(['isolation', 'plan'], { timeoutMs: 60000 });
      return { action: name, result: value };
    }
    case 'command.run': {
      // The long tail: any command the kernel's own manifest offers, with the manifest's own
      // types and its own fence (a path, a shell command line, a `@file` — see console.js).
      // The catalogue is the filtered one the page was shown, so the Host and the browser agree
      // on what may run: a command whose required argument is fenced is in neither.
      const wanted = pickText(payload, 'command', { max: 80, required: true });
      const rows = consoleCommands(await consoleManifest(holon));
      const row = (Array.isArray(rows) ? rows : []).find((r) => r && r.command === wanted);
      if (!row) {
        throw new HolonError(`the kernel has no command ${JSON.stringify(wanted)} that a browser may run`, { code: 'unknown_command', status: 400 });
      }
      const values = payload.args && typeof payload.args === 'object' && !Array.isArray(payload.args)
        ? payload.args : {};
      if (row.mutates) {
        // The form asks the Chair to type the command's name before a write. That confirmation
        // is checked here too, so it is a gate and not a decoration: a POST that skipped the
        // form cannot reach a write.
        const confirm = pickText(payload, 'confirm', { max: 120, required: true });
        if (confirm !== row.command) {
          throw new HolonError(`type ${row.command} to confirm`, { code: 'confirmation_required', status: 400 });
        }
      }
      const out = await runCommand(holon, row, values, { timeoutMs: config.actionTimeoutMs });
      return { action: name, result: out.result };
    }
    case 'config.set': {
      // One configuration key, typed by the value already in force, and re-parsed before it is
      // accepted (holon/execution/config.py). The browser cannot write an arbitrary section.
      const section = pickToken(payload, 'section', { max: 60 });
      const key = pickToken(payload, 'key', { max: 80 });
      const value = pickText(payload, 'value', { max: 20000, required: true });
      const result = await holon.json(['config', 'set', section, key, value], {
        mode: 'rw', timeoutMs: config.actionTimeoutMs,
      });
      return { action: name, result };
    }
    default:
      throw new HolonError(`unknown action ${JSON.stringify(name)}`, { code: 'unknown_action', status: 400 });
  }
}
