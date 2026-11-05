/**
 * holon-native — a DeepSeek Harness bundle for operating inside a Holon organization.
 *
 * Two situations, one plugin:
 *  - a kernel-dispatched run (`HOLON_RUN_DIR` + `HOLON_RUN_TOKEN`): the run's brief, identity,
 *    skills and policy become native Harness context and tools, and the observe/act posture is
 *    enforced in-process from `policy.json`;
 *  - an ordinary operator session: the same organization is readable through typed tools, with
 *    writes off unless the profile opts in.
 *
 * It has no npm dependencies on purpose: a profile-installed bundle should not need a registry
 * to resolve the Harness packages it composes with.
 */

import { HolonCli, loadOperatorConfig } from './lib/cli.js';
import { loadRun } from './lib/context.js';
import { registerGuard } from './lib/guard.js';
import { registerPrompt } from './lib/prompt.js';
import { registerRunSkills } from './lib/skills.js';
import { registerTools } from './lib/tools.js';

export const name = 'holon-native';
export const inject = ['tools', 'systemPrompt'];

function normalize(config) {
  const raw = config && typeof config === 'object' && !Array.isArray(config) ? config : {};
  const out = {
    command: raw.command,
    holonHome: raw.holonHome,
    allowWrites: raw.allowWrites ?? false,
    timeoutMs: raw.timeoutMs ?? 120000,
    enforcePolicy: raw.enforcePolicy ?? true,
    announce: raw.announce ?? true,
  };
  if (out.holonHome !== undefined && typeof out.holonHome !== 'string') {
    throw new TypeError('holon-native: holonHome must be an absolute path string');
  }
  if (typeof out.allowWrites !== 'boolean') throw new TypeError('holon-native: allowWrites must be a boolean');
  if (typeof out.enforcePolicy !== 'boolean') throw new TypeError('holon-native: enforcePolicy must be a boolean');
  if (typeof out.announce !== 'boolean') throw new TypeError('holon-native: announce must be a boolean');
  if (!Number.isInteger(out.timeoutMs) || out.timeoutMs < 1000 || out.timeoutMs > 3600000) {
    throw new TypeError('holon-native: timeoutMs must be an integer between 1000 and 3600000');
  }
  if (out.command !== undefined && typeof out.command !== 'string' && !Array.isArray(out.command)) {
    throw new TypeError('holon-native: command must be a string or an array of strings');
  }
  return out;
}

export function apply(ctx, config) {
  const cfg = normalize(config);
  const run = loadRun(process.env);
  const operator = loadOperatorConfig(process.env);
  const cli = new HolonCli({ config: cfg, env: process.env, run, operator });

  registerTools(ctx, { cli, run, config: cfg });
  registerGuard(ctx, run, cfg);
  registerPrompt(ctx, run, cfg, cli.configured);
  const skills = registerRunSkills(ctx, run);

  const where = cli.home || '(unconfigured)';
  if (run) {
    ctx.logger?.info?.('holon-native: run ' + (run.runId || '?') + ' ' + (run.stage || '?') + '/'
      + (run.posture || '?') + ' as ' + (run.employeeId || '?') + '; ' + skills + ' run skill(s); home '
      + where + '.');
  } else {
    ctx.logger?.info?.('holon-native: operator tools on ' + where + '; writes '
      + (cfg.allowWrites ? 'enabled' : 'disabled') + '.');
  }
}
