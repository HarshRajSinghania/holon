function HealthPanel({ doctor, onAction }) {
  const groups = doctor?.groups || [];
  return h(Card, {
    title: 'Health', sub: `${doctor?.errors || 0} errors · ${doctor?.warnings || 0} warnings`,
    actions: h(Btn, { size: 'sm', icon: 'refresh', onClick: () => onAction({ title: t('Run doctor'), action: 'doctor.run', submit: t('Run doctor') }) }, t('Run doctor')),
  }, groups.length ? h('div', { className: 'hd-list' }, groups.map((group) => h('div', { key: group.check, className: 'hd-list-item' },
    h('span', { className: 'hd-dot hd-dot--' + (group.severity === 'error' ? 'error' : 'warn') }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, group.check),
      h('div', { className: 'hd-row-sub', style: { display: 'block' } }, (group.items || []).map((item, i) => h('div', { key: i, className: 'hd-tiny' }, item.message))))))) : h(Empty, null, t('No findings')));
}

function AuditBreak({ b }) {
  return h('div', { className: 'hd-list-item' },
    h('span', { className: 'hd-dot hd-dot--error' }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, 'seq ' + b.seq + ' · ' + (b.reason || 'break')),
      h('div', { className: 'hd-row-sub' },
        h('span', null, b.entity), h('span', null, shortId(b.entity_id)), h('span', null, b.actor))));
}

function AuditPanel({ audit }) {
  if (!audit) return h(Card, { title: t('Audit chain') }, h(Empty));
  const breaks = Array.isArray(audit.breaks) ? audit.breaks : [];
  const broken = Number(audit.break_count || 0) > 0;
  return h(Card, { title: t('Audit chain'), sub: `${audit.checked || 0} events checked` },
    h('div', { className: 'hd-inline', style: { marginBottom: 8 } },
      h(Pill, { tone: broken ? 'error' : 'ok', dot: true }, broken ? 'break' : 'intact'),
      h(Pill, null, 'last ok #' + (audit.last_ok_seq ?? '—')),
      broken ? h(Pill, { tone: 'warn' }, 'first break #' + audit.first_break_seq) : null),
    breaks.length ? h('div', { className: 'hd-list' }, breaks.slice(0, 4).map((b) => h(AuditBreak, { key: b.seq, b }))) : h('div', { className: 'hd-muted hd-tiny' }, 'No break in the checked range.'));
}

function ScheduleRow({ row, onAction }) {
  const on = row.enabled === 1 || row.enabled === true;
  return h('div', { className: 'hd-list-item' },
    h('span', { className: 'hd-dot hd-dot--' + (on ? 'ok' : 'quiet') }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, `${row.kind} · ${row.cron || '—'}`),
      h('div', { className: 'hd-row-sub' }, h('span', null, row.stage || row.template_id || '—'), h('span', null, 'next ' + fmtTime(row.next_run_at)), h('span', null, 'failures ' + (row.failure_streak || 0)))),
    h(Btn, { size: 'sm', variant: on ? 'ghost' : 'default', onClick: () => onAction({
      title: (on ? 'Disable' : 'Enable') + ' schedule', action: on ? 'schedule.disable' : 'schedule.enable', payload: { id: row.id }, submit: on ? 'Disable' : 'Enable',
    }) }, on ? 'Disable' : 'Enable'));
}

function SchedulesPanel({ schedules, onAction }) {
  const rows = schedules?.rows || [];
  return h(Card, { title: t('Schedules'), sub: `${schedules?.enabled || 0} enabled · ${schedules?.failing || 0} failing` }, rows.length
    ? h('div', { className: 'hd-list' }, rows.slice(0, 8).map((row) => h(ScheduleRow, { key: row.id, row, onAction })))
    : h(Empty, null, 'No schedules'));
}

function OperationRow({ op }) {
  return h('div', { className: 'hd-list-item' },
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, op.title || op.plan || '—'),
      h('div', { className: 'hd-row-sub' },
        h('span', null, op.lane), h('span', null, op.cron || '—'),
        h('span', null, 'next ' + fmtTime(op.next_run_at)), h('span', null, `${op.fired || 0} fired`))),
    h(Pill, { tone: op.enabled ? 'ok' : 'quiet', dot: true }, op.enabled ? 'on' : 'off'));
}

function OperationsPanel({ operations }) {
  const rows = Array.isArray(operations) ? operations : [];
  return h(Card, { title: 'Operations', sub: `${rows.length} recurring` }, rows.length
    ? h('div', { className: 'hd-list' }, rows.slice(0, 8).map((op) => h(OperationRow, { key: op.schedule || op.title, op })))
    : h(Empty, null, 'No operations'));
}

function DriverRow({ driver, onAction }) {
  return h('div', { className: 'hd-list-item' },
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, driver.name),
      h('div', { className: 'hd-row-sub' }, h('span', null, (driver.stages || []).join(', ') || 'no stages'), h('span', { className: 'hd-mono' }, driver.source || '—'))),
    h(Btn, { size: 'sm', onClick: () => onAction({
      title: 'Conformance · ' + driver.name,
      description: 'Runs the driver clause against this harness. It spends real model calls and can take a few minutes.',
      action: 'conformance.run', payload: { driver: driver.name, clauses: 'driver' },
      fields: [{ key: 'confirm', label: 'Type CONFORMANCE to run', type: 'text', required: true }], submit: 'Run conformance',
    }) }, t('Conformance')));
}

function DriversPanel({ drivers, onAction }) {
  return h(Card, { title: t('Drivers'), sub: `${drivers?.length || 0} installed harness drivers` }, drivers?.length
    ? h('div', { className: 'hd-list' }, drivers.map((driver) => h(DriverRow, { key: driver.name, driver, onAction })))
    : h(Empty, null, 'No drivers'));
}

function MetricsPanel({ metrics }) {
  if (!metrics) return h(Card, { title: t('Metrics') }, h(Empty));
  const keys = Object.keys(metrics).filter((k) => metrics[k] && typeof metrics[k] === 'object' && !Array.isArray(metrics[k]));
  return h(Card, { title: t('Metrics'), sub: `window ${metrics.days || 30}d · ${metrics.dept || 'org'}` }, h('div', { className: 'hd-list' }, keys.slice(0, 12).map((key) => h('div', { key, className: 'hd-list-item' },
    h('div', { className: 'hd-row-main' }, h('div', { className: 'hd-inline', style: { justifyContent: 'space-between' } }, h('span', { className: 'hd-tiny hd-strong' }, metricLabel(key)), h('span', { className: 'hd-mono' }, metricValue(key, metrics[key].value))),
      h('div', { className: 'hd-muted hd-tiny' }, metrics[key].n ? 'n=' + metrics[key].n : (metrics[key].counter?.value ?? 'sensor')))))));
}
function ScopesPanel({ scope }) {
  const scopes = scope?.scopes || [];
  return h(Card, { title: t('Scopes'), sub: scope?.fingerprint ? 'fingerprint ' + scope.fingerprint : 'department reach' }, scopes.length
    ? h('div', { className: 'hd-list' }, scopes.map((s) => h('div', { key: s.name, className: 'hd-list-item' },
      h('div', { className: 'hd-row-main' },
        h('div', { className: 'hd-row-title' }, s.name),
        h('div', { className: 'hd-row-sub' }, h('span', null, `${(s.roots || []).length} roots`), h('span', null, `${(s.commands || []).length} commands`), h('span', null, `${(s.read_roots || []).length} read roots`)))))) : h(Empty));
}

function BackupRow({ b }) {
  return h('div', { className: 'hd-list-item' },
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, b.name),
      h('div', { className: 'hd-row-sub' },
        h('span', null, fmtTime(b.mtime)), h('span', null, `${b.files} files`),
        h('span', null, `${(b.bytes / 1024 / 1024).toFixed(1)} MiB`))));
}

function BackupsPanel({ backups, onAction }) {
  return h(Card, {
    title: t('Backups'), sub: `${backups?.length || 0} recent`,
    actions: h(Btn, { size: 'sm', icon: 'plus', onClick: () => onAction({
      title: t('Back up'), description: 'Writes a consistent copy of the instance under its backups directory.',
      action: 'backup.run', payload: { confirm: 'BACKUP' }, submit: t('Back up'),
    }) }, t('Back up')),
  }, backups?.length ? h('div', { className: 'hd-list' }, backups.slice(0, 6).map((b) => h(BackupRow, { key: b.name, b }))) : h(Empty));
}

function IsolationPlanButton() {
  const [state, setState] = React.useState({ open: false, busy: false, data: null, error: null });
  const load = async () => {
    setState((s) => ({ ...s, busy: true, error: null }));
    try {
      const res = await apiPost('isolation.plan', {});
      setState({ open: true, busy: false, data: res.result, error: null });
    } catch (error) {
      setState((s) => ({ ...s, busy: false, error }));
    }
  };
  return h(React.Fragment, null,
    h(Btn, { size: 'sm', icon: 'shield', onClick: load, disabled: state.busy }, state.busy ? 'Planning…' : 'Isolation plan'),
    h(Modal, { open: state.open, title: 'Isolation plan', sub: 'Read-only: prints the root script and ACLs the Chair applies.', onClose: () => setState((s) => ({ ...s, open: false })), footer: h(Btn, { onClick: () => setState((s) => ({ ...s, open: false })) }, t('Close')) },
      h(ErrorBox, { error: state.error }),
      state.data ? h('div', { className: 'hd-grid' },
        h(KV, { rows: [['Agent user', state.data.agent_user || '—'], ['Runner', state.data.runner || '—']] }),
        state.data.root_script ? h('div', null, h('div', { className: 'hd-field-label' }, 'Root script'), h(Pre, { text: state.data.root_script, maxHeight: 360 })) : null) : null));
}

function AutonomyRow({ row }) {
  return h('tr', { className: 'hd-tr' },
    h('td', { className: 'hd-td' }, row.dept),
    h('td', { className: 'hd-td' }, h(Pill, { tone: 'brand' }, row.mode || '—')),
    h('td', { className: 'hd-td' }, row.widen_approver || '—'),
    h('td', { className: 'hd-td' }, 'G' + (row.auto_promote_cap ?? '—')),
    h('td', { className: 'hd-td' }, 'G' + (row.ceo_initial_max ?? '—')),
    h('td', { className: 'hd-td' }, String(row.audit_sample_permille ?? '—')));
}

function AutonomyPanel({ rows }) {
  const list = Array.isArray(rows) ? rows : [];
  return h(Card, { title: 'Autonomy', sub: `${list.length} department policies` }, list.length
    ? h('div', { className: 'hd-table-wrap' }, h('table', { className: 'hd-table' },
      h('thead', null, h('tr', null, ['Dept', 'Mode', 'Widen', 'Auto cap', 'CEO max', 'Samples'].map((c) => h('th', { key: c, className: 'hd-th' }, c)))),
      h('tbody', null, list.map((row) => h(AutonomyRow, { key: row.dept, row })))))
    : h(Empty));
}

function LawPanel() {
  const [state, setState] = React.useState({ open: false, busy: '', data: null, error: null });
  const load = async (id) => {
    setState((s) => ({ ...s, busy: id, error: null }));
    try { const data = await apiGet('law', { id }); setState({ open: true, busy: '', data, error: null }); }
    catch (error) { setState((s) => ({ ...s, busy: '', error })); }
  };
  return h(Card, { title: 'Law', sub: 'The distribution’s own INTENT, BYLAWS and CONTRACT.' },
    h('div', { className: 'hd-inline' }, ['intent', 'bylaws', 'contract'].map((id) => h(Btn, {
      key: id, size: 'sm', icon: 'shield', disabled: Boolean(state.busy), onClick: () => load(id),
    }, state.busy === id ? 'Loading…' : id))),
    h(ErrorBox, { error: state.error }),
    h(Modal, { open: state.open, title: state.data?.path || 'Law', sub: 'Read-only', onClose: () => setState((s) => ({ ...s, open: false })),
      footer: h(Btn, { onClick: () => setState((s) => ({ ...s, open: false })) }, t('Close')) },
      state.data?.markdown ? h(Prose, { text: state.data.markdown, limit: 12000 }) : h(Empty)));
}

function MaintenancePanel({ onAction }) {
  return h(Card, { title: 'Maintenance', sub: 'Chair-only operations. Each writes to the instance and is confirmed.' },
    h('div', { className: 'hd-inline' },
      h(Btn, { icon: 'activity', onClick: () => onAction({
        title: 'Run heartbeat', description: 'Runs the kernel tick now: healing, feedback triggers and due schedules may dispatch work. It is the same tick the timer runs every two minutes.',
        action: 'tick.run', fields: [{ key: 'confirm', label: 'Type RUN TICK', type: 'text', required: true }], submit: 'Run tick', danger: true,
      }) }, 'Run heartbeat'),
      h(Btn, { icon: 'shield', onClick: () => onAction({ title: t('Run doctor'), action: 'doctor.run', submit: t('Run doctor') }) }, t('Run doctor')),
      h(Btn, { icon: 'plus', onClick: () => onAction({ title: 'Back up', description: 'Writes a consistent copy under the instance backups directory.', action: 'backup.run', payload: { confirm: 'BACKUP' }, submit: 'Back up' }) }, t('Back up'))));
}

function OpsPage({ onAction }) {
  const { data, error, loading, reload } = useApi('ops', {}, { poll: 30000 });
  if (!data && loading) return h(Loading, null);
  if (!data) return h('div', { className: 'hd-page' }, h(ErrorBox, { error, onRetry: reload }));
  const act = (spec) => onAction({ ...spec, after: () => { reload(); if (spec.after) spec.after(); } });
  return h('div', { className: 'hd-page' },
    h(PageHead, { title: t('Operations'), sub: 'Health, audit, schedules, drivers, scopes and backups in one operating surface.', actions: h(React.Fragment, null,
      h(Btn, { icon: 'plus', size: 'sm', onClick: () => onAction({
        command: 'schedule add', title: t('New schedule'),
        description: 'Adds a schedule: what it wakes, its cron expression and the stage or plan it serves.',
      }) }, t('New schedule')),
      h(Btn, { icon: 'plus', size: 'sm', onClick: () => onAction({
        command: 'operation add', title: t('New operation'),
        description: 'Adds a recurring operation for a department: its intent, its cadence, its lane and what it delivers.',
      }) }, t('New operation')),
      h(IsolationPlanButton, null), h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh'))) }),
    h(ErrorBox, { error, onRetry: reload }),
    h(ErrorBox, { error: degradationError(data) }),
    h('div', { className: 'hd-grid' },
      h(MaintenancePanel, { onAction: act }),
      h(HealthPanel, { doctor: data.doctor, onAction: act }),
      h('div', { className: 'hd-grid2' }, h(AuditPanel, { audit: data.audit }), h(SchedulesPanel, { schedules: data.schedules, onAction: act })),
      h(OperationsPanel, { operations: data.operations }),
      h(DriversPanel, { drivers: data.drivers, onAction: act }),
      h('div', { className: 'hd-grid2' }, h(MetricsPanel, { metrics: data.metrics }), h(ScopesPanel, { scope: data.scope })),
      h('div', { className: 'hd-grid2' }, h(AutonomyPanel, { rows: data.autonomy }), h(LawPanel, null)),
      h(BackupsPanel, { backups: data.backups, onAction: act })));
}
