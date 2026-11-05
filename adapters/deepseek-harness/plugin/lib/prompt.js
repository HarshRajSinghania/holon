/**
 * What the model is told about the organization.
 *
 * Two contributions, at two different levels. The section states the protocol (read the brief,
 * hand in one result, load the employee skill); the runtime context states the run's reach, which
 * changes per run and belongs beside the sandbox/approval facts, not in the stable prompt. Neither
 * repeats the full brief: the driver puts identity + BRIEF.md in the first message, and the brief
 * itself is the contract. Repeating it here would spend context on a second copy that can drift.
 */

function postureLine(run) {
  if (run.posture === 'observe') {
    return 'This is an observe posture: read and inspect only. write/edit are refused, and bash is '
      + 'limited to the run\'s read-only command list. Hand the result in with holon_submit; it is the '
      + 'primary route, not a fallback.';
  }
  if (run.posture === 'act') {
    return 'This is an act posture: the plan was approved. Write only under the roots policy.json '
      + 'names; a write outside them is refused, and the kernel grades what actually happened.';
  }
  return 'The run declares no posture; treat it as observe and prefer read-only work.';
}

export function runSection(run) {
  const who = run.employeeName ? run.employeeName + ' (' + run.employeeId + ')' : (run.employeeId || 'an employee');
  return [
    'You are operating inside a Holon organization as ' + who + ', on the ' + (run.stage || 'current')
      + ' stage of run ' + (run.runId || '(unknown)') + '.',
    'Your stage contract is ' + run.briefMd + '; read it before acting. Your identity card is '
      + run.identityMd + ', and the run\'s context digest is ' + run.contextMd + '.',
    'Hand in exactly one JSON result with holon_submit. It writes ' + run.resultPath + ' and submits it to '
      + 'the kernel, which replies with the fields it accepted or refused. A result written by hand is '
      + 'not a hand-in until it is submitted.',
    run.skillsDir ? 'The run\'s department-resolved skills are in your skill catalog (' + run.skillsDir
      + '). Load holon-employee first, then the skill for your role.' : 'Load the holon-employee skill first.',
    postureLine(run),
    'policy.json is ' + (run.dir ? run.dir + '/policy.json' : '(not found)') + ' and is authoritative. '
      + 'Do not claim other work: this run is one stage of one task.',
  ].join('\n\n');
}

export function reachContext(run) {
  const policy = run.policy ?? {};
  const roots = (policy.roots ?? []).join(', ') || '(none)';
  const reads = (policy.read_roots ?? []).join(', ') || '(none)';
  const writes = (policy.writes ?? []).join(', ') || '(none)';
  const commands = (policy.commands ?? []).join(', ') || '(none)';
  const budget = policy.budget ?? {};
  return [
    'Holon run ' + run.runId + ' · task ' + (run.taskId || '?') + ' · ' + (run.stage || '?') + '/'
      + (run.posture || '?') + ' · employee ' + (run.employeeId || '?'),
    'Writable roots: ' + roots + '. Approved plan writes: ' + writes + '.',
    'Read-only roots: ' + reads + '.',
    'Commands: ' + commands + '.',
    'Result path: ' + run.resultPath + '. Token budget: ' + (budget.tokens ?? 'uncapped') + '.',
  ].join('\n');
}

export function organizationSection(configured, writesAllowed) {
  if (!configured) {
    return 'Holon is installed but no instance is configured. Set HOLON_HOME, set holonHome on the '
      + 'holon-native plugin row, or write {"home":"/path/to/instance"} to $DSH_HOME/holon.json '
      + '(adapters/deepseek-harness/install.py --register-dsh-home).';
  }
  return 'Holon, the organization runtime, is available through native tools: holon_identity, '
    + 'holon_status, holon_tasks, holon_recall' + (writesAllowed ? ', holon_msg, holon_memory' : '')
    + '. Call holon_identity first when a request concerns the organization, its work, or its '
    + 'employees. Reads run against the kernel read-only door'
    + (writesAllowed ? '; writes were explicitly enabled for this profile' : '; writes are disabled')
    + '.';
}

export function registerPrompt(ctx, run, config, configured) {
  if (run) {
    ctx.effect(() => ctx.systemPrompt.section({
      name: 'holon:run',
      order: 700,
      interpolate: false,
      text: runSection(run),
    }));
    ctx.effect(() => ctx.systemPrompt.context({
      name: 'holon:run-reach',
      order: 130,
      required: false,
      interpolate: false,
      text: reachContext(run),
    }));
    return;
  }
  if (!config.announce) return;
  ctx.effect(() => ctx.systemPrompt.section({
    name: 'holon:organization',
    order: 700,
    interpolate: false,
    text: organizationSection(configured, config.allowWrites),
  }));
}
