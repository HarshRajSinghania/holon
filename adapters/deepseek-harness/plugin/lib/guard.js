/**
 * The posture guard: `policy.json`, enforced where the model cannot route around it.
 *
 * Holon compiles one policy document per run. A harness that has an enforcement layer MUST
 * enforce it (docs/CONTRACT.md §10); the kernel's working-directory fingerprint remains the
 * backstop, but a post-hoc breach is evidence of a failed run, not a fence. The guard is
 * registered on the plugin's context, so it covers every tool call in the process, including
 * calls made by subagents a body delegates to.
 *
 * Observe: `write` and `edit` are refused outright; `bash` is reduced to the kernel's read-only
 * command vocabulary, with the flags that turn a reader into a writer (`find -delete`,
 * `sed -i`, `sort -o`) refused, and `xargs` refused because it runs a command chosen at
 * runtime. Redirections are refused except to `/dev/null`.
 *
 * Act: the approved plan was executed, so commands are not re-litigated; file tools are confined
 * to the roots policy.json names (the workdir, the department's scope roots, the plan's declared
 * writes) plus the run's own directory. The kernel grades what actually happened.
 */

import { isAbsolute, relative, resolve } from 'node:path';
import { writableRoots } from './context.js';

const WRITE_TOOLS = new Set(['write', 'edit']);
const SHELL_BUILTINS = new Set(['cd', 'pwd', 'true', 'false', ':', 'test', 'export', 'set']);
const OBSERVE_FORBIDDEN = new Set(['xargs']);

function isInside(child, root) {
  const rel = relative(root, child);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

function stripDevNull(segment) {
  return segment
    .replace(/\d?>&\d/g, '')
    .replace(/\d?>\s*\/dev\/null/g, '');
}

/**
 * Split a shell command into the simple commands it runs. This is a fence, not a shell parser:
 * quotes and substitutions are handled conservatively, and anything this function cannot
 * classify is left to the checks below rather than being assumed harmless.
 */
function segments(command) {
  return String(command).split(/\|\||&&|[;\n|&]/);
}

function stripAssignments(text) {
  let rest = text.trim();
  const assignment = /^(?:[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|[^\s;|&]*))\s+/;
  while (assignment.test(rest)) rest = rest.replace(assignment, '');
  return rest;
}

function firstWord(text) {
  const match = text.match(/^(?:"([^"]*)"|'([^']*)'|(\S+))/);
  if (!match) return '';
  return (match[1] ?? match[2] ?? match[3] ?? '').trim();
}

function commandDenial(segment, word, allowed) {
  const shown = allowed.length > 12 ? allowed.slice(0, 12).join(', ') + ', …' : allowed.join(', ');
  return 'holon-native: observe posture refused `' + segment + '`: ' + (word || 'the command')
    + " is not in the run's read-only command list (" + (shown || 'empty') + ').';
}

function checkCommand(command, allowed) {
  if (allowed.includes('*')) return undefined;
  const text = String(command ?? '').replace(/\d?>&\d/g, '');
  if (text.includes('`') || text.includes('$(')) {
    return 'holon-native: observe posture refused a command containing command substitution '
      + '(`…` or $(…)); the command list cannot classify what it would run.';
  }
  for (const raw of segments(text)) {
    const segment = stripDevNull(raw).trim();
    if (!segment) continue;
    if (/[<>]/.test(segment)) {
      return 'holon-native: observe posture refused `' + segment + '`: redirection writes. '
        + 'Redirect to /dev/null only, or use holon_submit for the result.';
    }
    let rest = stripAssignments(segment.replace(/^!\s*/, ''));
    if (!rest) continue;
    const envPrefix = rest.match(/^env(?:\s+-\S+|\s+[A-Za-z_][A-Za-z0-9_]*=\S+)*\s+(.*)$/);
    if (envPrefix) rest = stripAssignments(envPrefix[1]);
    const word = firstWord(rest);
    if (!word) continue;
    const base = word.replace(/^["']|["']$/g, '').split('/').pop();
    if (SHELL_BUILTINS.has(base)) continue;
    if (OBSERVE_FORBIDDEN.has(base)) {
      return 'holon-native: observe posture refused `' + segment + '`: ' + base
        + ' executes a command chosen at runtime, which the read-only posture cannot classify.';
    }
    if (!allowed.includes(base)) return commandDenial(segment, base, allowed);
    const args = rest.slice(rest.indexOf(word) + word.length);
    if (base === 'find' && /(?:^|\s)(?:-delete|-exec|-execdir|-ok|-okdir|-fprint0?|-fprintf|-fls)\b/.test(args)) {
      return 'holon-native: observe posture refused `' + segment + '`: this find flag writes or executes.';
    }
    if (base === 'sed' && /(?:^|\s)(?:-i|--in-place)\b/.test(args)) {
      return 'holon-native: observe posture refused `' + segment + '`: sed -i writes.';
    }
    if (base === 'sort' && /(?:^|\s)(?:-o|--output)\b/.test(args)) {
      return 'holon-native: observe posture refused `' + segment + '`: sort -o writes.';
    }
  }
  return undefined;
}

function checkWrite(args, run) {
  const target = args && typeof args === 'object' ? args.file_path : undefined;
  if (typeof target !== 'string' || !target) return undefined;
  const resolved = resolve(run.workdir || run.dir || process.cwd(), target);
  const roots = writableRoots(run);
  if (roots.some((root) => isInside(resolved, root))) return undefined;
  const shown = roots.length ? roots.join(', ') : '(none)';
  return 'holon-native: the act reach does not include ' + JSON.stringify(resolved) + '. '
    + 'policy.json names these writable roots: ' + shown + '. Write inside them, or ask the Chair '
    + '(holon_msg) for a scope that covers it.';
}

function checkWriteTool(name, args, run, config) {
  if (run.posture === 'observe') {
    return 'holon-native: the ' + (run.stage || 'current') + ' stage is an observe posture; '
      + name + ' would write. Holon\'s policy allows reading and inspection, not writes. '
      + 'Hand the result in with holon_submit; it writes only the run\'s own result.json.';
  }
  if (!config.enforcePolicy) return undefined;
  return checkWrite(args, run);
}

/**
 * Evaluate one tool call. Returns a denial reason, or undefined to allow it. The guard is
 * synchronous by contract, and a failure to evaluate refuses the call rather than permitting it.
 */
export function evaluate(exec, run, config) {
  try {
    const name = exec?.name;
    const args = exec?.arguments ?? {};
    if (!run) return undefined;
    if (WRITE_TOOLS.has(name)) return checkWriteTool(name, args, run, config);
    if (name === 'bash' && run.posture === 'observe') {
      return checkCommand(args.command, run.policy?.commands ?? []);
    }
    return undefined;
  } catch (error) {
    return 'holon-native: the policy guard could not evaluate this call ('
      + (error?.message ?? error) + '); refusing it rather than running it unchecked.';
  }
}

export function registerGuard(ctx, run, config) {
  if (!run || !config.enforcePolicy) return;
  if (typeof ctx.tools?.guard !== 'function') {
    ctx.logger?.warn?.('holon-native: this Harness has no tools.guard; policy.json is not enforced '
      + "in-process — the kernel's working-directory guard remains the only check.");
    return;
  }
  ctx.effect(() => ctx.tools.guard((exec) => evaluate(exec, run, config)));
}
