import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { consoleCommands, consoleManifest, entityCatalogue } from './console.js';
import { HolonError, sqlString } from './holon.js';
import {
  Cache, RUN_SELECT, STAGES, applyPipeline, approvals, collectArtifacts, compactTask,
  emptyPipeline, messageRows, messageThread, pipelineCounts, runRows, settle,
  shorten, taskRows, workCounts,
} from './query.js';

function bylaws(value) {
  if (typeof value !== 'string' || !value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function deptView(d) {
  return {
    id: d.id, slug: d.slug, name: d.name, mission: d.mission || '',
    parent_id: d.parent_id || null, head_id: d.head_id || null,
    head_name: d.head_name || null, profile: d.profile || null,
    status: d.status || null, created_at: d.created_at || null,
    bylaws: bylaws(d.bylaws), employees: Array.isArray(d.employees) ? d.employees : [],
  };
}

function empView(e, d) {
  return {
    id: e.id, name: e.name, title: e.title || '', dept: d?.slug || e.dept || '',
    dept_id: e.dept_id || d?.id || null, driver: e.driver || null,
    status: e.status || null, roles: e.roles || [], stages: e.stages || [],
    task_classes: e.task_classes || [], skills: e.skills || [],
    max_concurrency: e.max_concurrency ?? null, is_head: Boolean(e.is_head),
    reports_to: e.reports_to || null, hired_at: e.hired_at || null,
    hired_reason: e.hired_reason || '',
  };
}

function scheduleView(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const on = list.filter((r) => r.enabled === 1 || r.enabled === true);
  return {
    total: list.length, enabled: on.length, disabled: list.length - on.length,
    failing: list.filter((r) => Number(r.failure_streak || 0) > 0).length,
    next: on.filter((r) => r.next_run_at).sort((a, b) => String(a.next_run_at).localeCompare(String(b.next_run_at))).slice(0, 5),
    rows: list,
  };
}

function drivers(value) {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).map(([name, info]) => ({
    name, source: info?.source || '', stages: info?.stages || [],
  }));
}

function metricCards(value) {
  if (!value || typeof value !== 'object') return [];
  return ['first_pass_rate', 'verify_pass_rate', 'rework_rate', 'rejection_rate', 'gate_latency_h', 'research_reuse', 'cost_per_verified_result', 'rubric_agreement']
    .filter((k) => value[k] && typeof value[k] === 'object')
    .map((k) => ({ key: k, value: value[k].value ?? null, n: value[k].n ?? null }));
}

export class Resources {
  constructor(holon, config) {
    this.holon = holon;
    this.config = config;
    this.cache = new Cache(config.cacheTtlMs);
  }

  async doctor() {
    return this.cache.get('doctor', 20000, async () => {
      const value = await this.holon.json(['doctor'], { allowNonZero: true, timeoutMs: 60000 });
      if (!value) {
        // The doctor did not answer. "No findings" is not the same answer as "nothing to report",
        // and a clean-looking doctor over an unreadable instance is the empty-means-ungoverned
        // failure this repository's laws name. Unknown counts are null, never zero.
        return {
          errors: null, findings: [], warnings: null, clean: false, readable: false,
          error: 'the doctor did not answer',
        };
      }
      const findings = Array.isArray(value?.findings) ? value.findings : [];
      const errors = Number(value?.errors || findings.filter((f) => f.severity === 'error').length);
      return {
        errors, findings, warnings: findings.filter((f) => f.severity === 'warning').length,
        clean: errors === 0, readable: true,
      };
    });
  }

  async org() {
    return this.cache.get('org-page', 30000, async () => {
      const [orgR, autonomyR, driversR, scopeR] = await Promise.all([
        settle(this.holon.json(['org'], { timeoutMs: 60000 })),
        settle(this.holon.json(['charter', 'autonomy'], { allowNonZero: true, timeoutMs: 30000 })),
        settle(this.holon.json(['drivers'])),
        settle(this.holon.json(['scope'], { allowNonZero: true })),
      ]);
      const departments = (orgR.value || []).map(deptView);
      const employees = departments.flatMap((d) => d.employees.map((e) => empView(e, d)));
      const warnings = [orgR, autonomyR, driversR, scopeR].filter((x) => !x.ok).map((x) => x.error);
      return {
        generatedAt: new Date().toISOString(), departments, employees,
        autonomy: autonomyR.value || [], drivers: drivers(driversR.value),
        scope: scopeR.value || null, warnings,
      };
    });
  }

  async overview() {
    const results = await Promise.all([
      settle(this.holon.json(['status'])),
      settle(this.doctor()),
      settle(this.holon.json(['events', '--limit', '12'])),
      settle(this.holon.json(['schedule', 'list'], { allowNonZero: true })),
      settle(this.holon.json(['drivers'])),
      settle(this.holon.json(['metrics'])),
      settle(this.org()),
      settle(pipelineCounts(this.holon)),
      settle(workCounts(this.holon)),
      settle(approvals(this.holon, 12)),
      settle(messageRows(this.holon, { filter: 'unacked', limit: 6 })),
      settle(this.holon.sql(`${RUN_SELECT} WHERE r.status = 'running' ORDER BY r.started_at DESC LIMIT 10`)),
      settle(this.holon.sql(`${RUN_SELECT} ORDER BY r.started_at DESC LIMIT 6`)),
      settle(this.holon.version()),
    ]);
    const [statusR, doctorR, eventsR, schedulesR, driversR, metricsR, orgR, pipelineR, rootsR, approvalsR, messagesR, activeRunsR, recentRunsR, versionR] = results;
    const status = statusR.value || { work: {}, ready_stages: {}, employees: 0, departments: 0, awaiting_chair: 0 };
    const doc = doctorR.value || { errors: 0, warnings: 0, findings: [] };
    const org = orgR.value || { departments: [], employees: [] };
    const pipeline = applyPipeline(emptyPipeline(), pipelineR.value || []);
    const work = {};
    for (const row of rootsR.value || []) work[row.status] = Number(row.count || 0);
    const ready = status.ready_stages || {};
    const readyTotal = Object.values(ready).reduce((sum, n) => sum + Number(n || 0), 0);
    const mail = messagesR.value || { rows: [], counts: {} };
    const sched = scheduleView(schedulesR.value);
    const stats = {
      readyTotal, readyStages: ready, awaitingChair: Number(status.awaiting_chair || 0),
      awaitingDelegated: Number(status.awaiting_delegated || 0), needsInput: Number(status.needs_input || 0),
      openWork: Number(work.open || 0), doneWork: Number(work.done || 0), cancelledWork: Number(work.cancelled || 0),
      activeRuns: (activeRunsR.value || []).length, employees: Number(status.employees || 0),
      departments: Number(status.departments || 0), doctorErrors: Number(doc.errors || 0),
      doctorWarnings: Number(doc.warnings || 0), unackedMessages: Number(mail.counts?.unacked || 0),
      schedulesEnabled: sched.enabled,
    };
    const warnings = results.filter((x) => !x.ok).map((x) => x.error);
    return {
      generatedAt: new Date().toISOString(),
      instance: { label: this.holon.instanceLabel(), home: this.holon.home, command: this.holon.command, version: versionR.value || null, configPath: this.config.configPath },
      config: { refreshMs: this.config.refreshMs, allowActions: this.config.allowActions },
      heartbeat: this.holon.heartbeat(), stats, status, doctor: doc,
      pipeline: STAGES.map((name) => ({ stage: name, ...pipeline[name] })),
      work,
      approvals: (approvalsR.value || []).map((row) => compactTask(row, 700)),
      messages: { counts: mail.counts || {}, rows: (mail.rows || []).map((m) => ({ ...m, body: shorten(m.body, 280) })) },
      activeRuns: activeRunsR.value || [], recentRuns: recentRunsR.value || [],
      events: eventsR.value || [],
      schedules: { total: sched.total, enabled: sched.enabled, failing: sched.failing, next: sched.next },
      drivers: drivers(driversR.value), metrics: metricsR.value || null, metricCards: metricCards(metricsR.value),
      org: {
        departments: org.departments.map((d) => ({ id: d.id, slug: d.slug, name: d.name, mission: d.mission, head_name: d.head_name, employees: d.employees.length })),
        employees: org.employees.length,
      },
      warnings,
    };
  }

  async work(params) {
    const view = params.view === 'work' || params.view === 'approvals' ? params.view : 'stages';
    const limit = Math.max(1, Math.min(500, Number(params.limit) || 300));
    const [rowsR, pipelineR, rootsR, orgR] = await Promise.all([
      settle(taskRows(this.holon, params, { view, limit })),
      settle(pipelineCounts(this.holon)),
      settle(workCounts(this.holon)),
      settle(this.org()),
    ]);
    let rows = (rowsR.value || []).map((row) => compactTask(row, 600));
    const q = String(params.q || '').trim().toLowerCase();
    if (q) rows = rows.filter((row) => [row.id, row.title, row.work_title, row.dept, row.assignee_name, row.task_class].join(' ').toLowerCase().includes(q));
    const pipeline = applyPipeline(emptyPipeline(), pipelineR.value || []);
    const work = {};
    for (const row of rootsR.value || []) work[row.status] = Number(row.count || 0);
    const org = orgR.value || { departments: [], employees: [] };
    const filters = {
      departments: org.departments.map((d) => ({ slug: d.slug, name: d.name })),
      employees: org.employees.map((e) => ({ id: e.id, name: e.name, dept: e.dept })),
      stages: STAGES,
    };
    return {
      generatedAt: new Date().toISOString(), view, count: rows.length, rows, filters,
      pipeline: STAGES.map((name) => ({ stage: name, ...pipeline[name] })), work,
      warnings: [rowsR, pipelineR, rootsR, orgR].filter((x) => !x.ok).map((x) => x.error),
    };
  }

  async employee(id) {
    const [empR, reviewR, driversR] = await Promise.all([
      settle(this.holon.json(['emp', 'show', id], { timeoutMs: 30000 })),
      settle(this.holon.json(['hr', 'review', id], { allowNonZero: true, timeoutMs: 30000 })),
      settle(this.holon.json(['drivers'])),
    ]);
    if (!empR.ok) throw new HolonError(`employee ${id} not found`, { code: 'not_found', status: 404 });
    return { generatedAt: new Date().toISOString(), employee: empR.value, review: reviewR.value || null, drivers: drivers(driversR.value), warnings: [reviewR, driversR].filter((x) => !x.ok).map((x) => x.error) };
  }

  async workItem(id) {
    let task;
    try { task = await this.holon.json(['task', 'show', id], { timeoutMs: 60000 }); }
    catch (error) { throw new HolonError(`work ${id} not found`, { code: 'not_found', status: 404 }); }
    if (!task || !task.work) throw new HolonError(`work ${id} not found`, { code: 'not_found', status: 404 });
    const stages = Array.isArray(task.stages) ? task.stages : [];
    const stageIds = stages.map((s) => s.id).filter((s) => /^[A-Za-z0-9_]+$/.test(s));
    let runs = [];
    if (stageIds.length) {
      try {
        runs = await this.holon.sql(`${RUN_SELECT} WHERE r.task_id IN (${stageIds.map(sqlString).join(',')}) ORDER BY r.started_at DESC LIMIT 80`);
      } catch { runs = []; }
    }
    let plan = null;
    if (stages.some((s) => s.stage === 'approve')) {
      try { plan = await this.holon.json(['plan', 'show', id], { timeoutMs: 60000 }); } catch { plan = null; }
    }
    const artifacts = collectArtifacts(stages, this.holon.home).map((a) => ({ ...a, exists: existsSync(a.path) }));
    const latest = runs[0] || null;
    const log = latest?.log_path ? this.holon.tailFile(latest.log_path, 180) : null;
    return { generatedAt: new Date().toISOString(), ...task, runs, plan, artifacts, log };
  }

  async planItem(id) {
    let plan;
    try { plan = await this.holon.json(['plan', 'show', id], { timeoutMs: 60000 }); }
    catch { throw new HolonError(`plan ${id} not found`, { code: 'not_found', status: 404 }); }
    if (!plan || !plan.approval) throw new HolonError(`plan ${id} not found`, { code: 'not_found', status: 404 });
    return { generatedAt: new Date().toISOString(), ...plan };
  }

  async runs(params) {
    const { rows, counts } = await runRows(this.holon, params);
    return { generatedAt: new Date().toISOString(), rows, counts };
  }

  async runItem(id) {
    const rows = await this.holon.sql(`${RUN_SELECT} WHERE r.id = ${sqlString(id)} LIMIT 1`);
    if (!rows.length) throw new HolonError(`run ${id} not found`, { code: 'not_found', status: 404 });
    const run = rows[0];
    let shown = null;
    try { shown = await this.holon.json(['run', 'show', id], { allowNonZero: true, timeoutMs: 60000 }); } catch { shown = null; }
    const log = run.log_path ? this.holon.tailFile(run.log_path, 240) : null;
    const dir = run.log_path?.endsWith('/driver.log')
      ? run.log_path.slice(0, -'/driver.log'.length)
      : join(this.holon.home, 'execution', 'runtime', 'runs', id);
    let files = [];
    try {
      files = readdirSync(dir).map((name) => {
        try { const s = statSync(join(dir, name)); return { name, size: s.size, mtime: s.mtime.toISOString() }; }
        catch { return { name, size: null, mtime: null }; }
      }).sort((a, b) => a.name.localeCompare(b.name));
    } catch { files = []; }
    return {
      generatedAt: new Date().toISOString(), ...run, shown, log, files,
      brief: this.holon.tailFile(join(dir, 'BRIEF.md'), 260, 128 * 1024),
      result: this.holon.readJsonFile(join(dir, 'result.json')),
      trajectory: this.holon.tailFile(join(dir, 'trajectory.json'), 300, 192 * 1024),
    };
  }

  async events(params) {
    const limit = Math.max(1, Math.min(200, Number(params.limit) || 50));
    const id = typeof params.id === 'string' && /^[A-Za-z0-9_]{3,80}$/.test(params.id) ? params.id : '';
    const args = ['events', '--limit', String(limit)];
    if (id) args.push('--id', id);
    const rows = await this.holon.json(args);
    return { generatedAt: new Date().toISOString(), id: id || null, rows: rows || [] };
  }

  async doctorPage() {
    const doc = await this.doctor();
    const groups = {};
    for (const finding of doc.findings) {
      const key = finding.check || 'other';
      if (!groups[key]) groups[key] = { check: key, severity: finding.severity, items: [] };
      groups[key].items.push(finding);
      if (finding.severity === 'error') groups[key].severity = 'error';
    }
    const groupList = Object.values(groups).sort((a, b) => a.severity === b.severity ? a.check.localeCompare(b.check) : a.severity === 'error' ? -1 : 1);
    return { generatedAt: new Date().toISOString(), ...doc, groups: groupList };
  }

  async knowledge(params) {
    const q = String(params.q || '').trim().slice(0, 500);
    const limit = Math.max(1, Math.min(50, Number(params.limit) || 20));
    const [skillsR, playbooksR, kbsR] = await Promise.all([
      settle(this.holon.json(['skill', 'list'])),
      settle(this.holon.json(['playbook', 'list'])),
      settle(this.holon.json(['kb', 'list'])),
    ]);
    const out = {
      generatedAt: new Date().toISOString(), query: q, limit,
      skills: skillsR.value || [], playbooks: playbooksR.value || [], kbs: kbsR.value || null,
      recall: null, memory: null, episodes: null,
      warnings: [skillsR, playbooksR, kbsR].filter((x) => !x.ok).map((x) => x.error),
    };
    if (!q) return out;
    const [recallR, memoryR, episodesR] = await Promise.all([
      settle(this.holon.json(['recall', q, '--limit', String(limit)], { timeoutMs: 90000 })),
      settle(this.holon.json(['memory', 'search', q, '--limit', String(limit)])),
      settle(this.holon.json(['memory', 'episodes', q, '--limit', String(limit)])),
    ]);
    out.recall = recallR.ok ? recallR.value : { error: recallR.error };
    out.memory = memoryR.ok ? memoryR.value : { error: memoryR.error };
    out.episodes = episodesR.ok ? episodesR.value : { error: episodesR.error };
    return out;
  }

  async messages(params) {
    const filter = ['all', 'unacked', 'incoming', 'sent'].includes(params.filter) ? params.filter : 'all';
    const limit = Math.max(1, Math.min(300, Number(params.limit) || 100));
    const { rows, counts } = await messageRows(this.holon, { filter, limit });
    return { generatedAt: new Date().toISOString(), filter, rows, counts };
  }

  async thread(id) {
    return messageThread(this.holon, id);
  }

  async law(id) {
    if (!['intent', 'bylaws', 'contract'].includes(id)) {
      throw new HolonError('law must be intent, bylaws, or contract', { code: 'invalid_request', status: 400 });
    }
    return this.holon.json(['law', 'show', id], { timeoutMs: 30000 });
  }

  async ops() {
    const results = await Promise.all([
      settle(this.doctor()),
      settle(this.holon.json(['audit', 'walk'], { allowNonZero: true, timeoutMs: 60000 })),
      settle(this.holon.json(['schedule', 'list'], { allowNonZero: true })),
      settle(this.holon.json(['operation', 'list'], { allowNonZero: true })),
      settle(this.holon.json(['drivers'])),
      settle(this.holon.json(['scope'], { allowNonZero: true })),
      // `holon guards` is a pure SELECT, but the registry declared it mutating, so `--mode ro`
      // refused it and the panel was always empty for a reason nobody could see. It is read
      // without the read-only flag so the panel shows what the kernel actually holds.
      settle(this.holon.json(['guards'], { allowNonZero: true, timeoutMs: 30000, mode: 'none' })),
      settle(this.holon.json(['metrics'], { allowNonZero: true })),
      settle(this.holon.json(['charter', 'autonomy'], { allowNonZero: true })),
    ]);
    const [docR, auditR, schedR, opsR, driversR, scopeR, guardsR, metricsR, autonomyR] = results;
    return {
      generatedAt: new Date().toISOString(),
      doctor: docR.value || null, audit: auditR.value || null,
      schedules: scheduleView(schedR.value), operations: opsR.value || [],
      drivers: drivers(driversR.value), scope: scopeR.value || null,
      guards: guardsR.value || [], metrics: metricsR.value || null,
      autonomy: autonomyR.value || [], backups: this.holon.listBackups(),
      warnings: results.filter((x) => !x.ok).map((x) => x.error),
    };
  }

  async settings() {
    const [versionR, driversR, statusR] = await Promise.all([
      settle(this.holon.version()),
      settle(this.holon.json(['drivers'])),
      settle(this.holon.json(['status'])),
    ]);
    const paths = {
      workDb: join(this.holon.home, 'execution', 'runtime', 'work.db'),
      memoryDb: join(this.holon.home, 'capabilities', 'memory', 'memory.db'),
      config: join(this.holon.home, 'holon.toml'),
      runs: join(this.holon.home, 'execution', 'runtime', 'runs'),
      backups: join(this.holon.home, 'backups'),
    };
    return {
      generatedAt: new Date().toISOString(),
      instance: { label: this.holon.instanceLabel(), home: this.holon.home, version: versionR.value || null },
      config: {
        command: this.holon.command, refreshMs: this.config.refreshMs,
        timeoutMs: this.config.timeoutMs, actionTimeoutMs: this.config.actionTimeoutMs,
        allowActions: this.config.allowActions, configPath: this.config.configPath,
      },
      auth: statusR.value?.auth || null, drivers: drivers(driversR.value),
      paths: Object.fromEntries(Object.entries(paths).map(([k, p]) => [k, { path: p, exists: existsSync(p) }])),
      backups: this.holon.listBackups(),
      warnings: [versionR, driversR, statusR].filter((x) => !x.ok).map((x) => x.error),
    };
  }

  async backups() {
    return { generatedAt: new Date().toISOString(), rows: this.holon.listBackups() };
  }

  /**
   * The console's catalogue: every command the kernel offers, with the arguments it may fill.
   *
   * Read from the kernel's own registry (`holon help --json` is the manifest) rather than from a
   * list here, so a command added to the kernel appears in the dashboard with its own types, and a
   * command the kernel takes away disappears with it.
   */
  async commands() {
    return this.cache.get('commands', 30000, async () => {
      const rows = await consoleManifest(this.holon);
      const commands = consoleCommands(rows);
      return {
        generatedAt: new Date().toISOString(),
        commands,
        // Which commands act on which object, and which command previews it: derived from the
        // same catalogue, so the browser only ever looks up what the kernel declared.
        ...entityCatalogue(commands),
        total: Array.isArray(rows) ? rows.length : 0,
      };
    });
  }

  /** The instance's own configuration: every key, its effective value, and where it came from. */
  async instanceConfig() {
    const value = await this.holon.json(['config', 'show'], { timeoutMs: 30000 });
    return { generatedAt: new Date().toISOString(), ...(value || {}) };
  }
}
