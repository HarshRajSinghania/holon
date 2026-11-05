/**
 * The run's skills, registered natively.
 *
 * The kernel renders every run with a department-resolved `skills/` tree beside its brief (the
 * CONTRACT's Skills part: a tailored skill appears once, as the department's version). A harness
 * with a skill registry can read that tree directly instead of exporting a second copy; this
 * module parses each bundle's frontmatter and registers it as a runtime skill. Runtime entries
 * outrank user entries in the Harness registry, so the department's copy wins over the standard
 * export the adapter also installs — exactly the precedence the contract asks for.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

function unquote(value) {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  if (v.startsWith('>') || v.startsWith('|')) return '';
  return v;
}

/** Parse one `SKILL.md`: YAML frontmatter (the fields the registry needs) plus the body. */
export function parseSkill(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return null;
  const meta = {};
  let key = null;
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (pair) {
      key = pair[1];
      meta[key] = unquote(pair[2]);
    } else if (key && /^\s+/.test(line)) {
      meta[key] = (meta[key] ? meta[key] + ' ' : '') + line.trim();
    }
  }
  const name = (meta.name ?? '').trim();
  const description = (meta.description ?? '').trim();
  if (!name || !description) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) return null;
  const body = text.slice(match[0].length).replace(/^\s+/, '');
  return { name, description, content: body, metadata: meta };
}

/** Register every skill in the run's resolved tree. Returns how many were registered. */
export function registerRunSkills(ctx, run) {
  if (!run?.skillsDir) return 0;
  let entries;
  try {
    entries = readdirSync(run.skillsDir, { withFileTypes: true });
  } catch {
    return 0;
  }
  const skills = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = join(run.skillsDir, entry.name, 'SKILL.md');
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const parsed = parseSkill(text);
    if (!parsed) {
      ctx.logger?.warn?.('holon-native: skipped a run skill without usable frontmatter: ' + file);
      continue;
    }
    skills.push({ ...parsed, file });
  }
  if (skills.length === 0) return 0;
  if (typeof ctx.inject !== 'function') {
    ctx.logger?.warn?.('holon-native: this Harness has no ctx.inject; run skills were not registered.');
    return 0;
  }
  ctx.effect(() => ctx.inject(['skills'], (scope) => {
    for (const skill of skills) {
      scope.effect(() => scope.skills.register({
        name: skill.name,
        description: skill.description,
        content: skill.content,
        path: skill.file,
        resourceBase: { kind: 'directory', path: dirname(skill.file) },
        invocation: { modelInvocable: true, userInvocable: true },
      }));
    }
  }));
  return skills.length;
}
