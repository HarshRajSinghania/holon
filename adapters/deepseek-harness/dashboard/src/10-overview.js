function PageHead({ title, sub, actions }) {
  return h('div', { className: 'hd-page-head' },
    h('div', { style: { minWidth: 0 } },
      h('div', { className: 'hd-page-title' }, title),
      sub ? h('div', { className: 'hd-page-sub' }, sub) : null),
    actions ? h('div', { className: 'hd-actions' }, actions) : null);
}

function OverviewStats({ data }) {
  const s = data.stats || {};
  const ready = s.readyStages || {};
  const age = data.heartbeat?.ageSeconds;
  const hbTone = !data.heartbeat?.present ? 'error' : data.heartbeat.stale ? 'warn' : 'ok';
  const docTone = s.doctorErrors === null ? 'warn' : s.doctorErrors > 0 ? 'error' : s.doctorWarnings > 0 ? 'warn' : 'ok';
  const cards = [
    ['Awaiting Chair', s.awaitingChair ?? '—', `${ready.approve || 0} approval stages`, 'brand', 'clock'],
    ['Ready stages', s.readyTotal ?? '—', Object.entries(ready).map(([k, v]) => `${v} ${k}`).join(' · '), 'brand', 'layers'],
    ['Open work', s.openWork ?? '—', `${s.doneWork || 0} done · ${s.cancelledWork || 0} cancelled`, '', 'activity'],
    ['Active runs', s.activeRuns ?? '—', `${data.recentRuns?.length || 0} recent`, s.activeRuns ? 'ok' : '', 'play'],
    ['Doctor', s.doctorErrors ?? '—', `${s.doctorWarnings || 0} warnings`, docTone, 'shield'],
    ['Heartbeat', age === null || age === undefined ? '—' : age + 's', data.heartbeat?.stale ? t('Stale') : t('Live'), hbTone, 'activity'],
  ];
  return h('div', { className: 'hd-grid hd-stat-grid' }, cards.map(([label, value, hint, tone, icon]) => h(Stat, {
    key: label, label: t(label), value, hint, tone, icon,
  })));
}
function ApprovalRow({ row, onOpenPlan, onAction }) {
  const title = row.work_title || row.title;
  return h('div', { className: 'hd-list-item' },
    h('div', { style: { paddingTop: 3 } }, h('span', { className: 'hd-dot hd-dot--' + (row.grade >= 3 ? 'warn' : 'brand') })),
    h('div', { className: 'hd-row-main', style: { cursor: 'pointer' }, onClick: () => onOpenPlan(row.id) },
      h('div', { className: 'hd-row-title' }, title),
      h('div', { className: 'hd-row-sub' },
        h('span', null, row.dept || '—'), h('span', null, 'G' + (row.grade ?? '?')),
        h('span', null, fmtAgo(row.created_at)), row.task_class ? h('span', null, row.task_class) : null)),
    h('div', { className: 'hd-row-meta' },
      h(Btn, { size: 'sm', onClick: () => onOpenPlan(row.id) }, t('Review')),
      h(Btn, { size: 'sm', variant: 'primary', icon: 'check', onClick: () => onAction({
        title: t('Approve') + ' · ' + title,
        description: 'Approving the plan moves the work to execute. The note is stored in the approval record.',
        action: 'plan.approve', payload: { ref: row.id },
        fields: [{ key: 'note', label: 'Note (optional)', type: 'textarea' }], submit: t('Approve'),
      }) }, t('Approve'))));
}

function ApprovalsCard({ stats, approvals, onOpenPlan, onAction, onNavigate }) {
  return h(Card, {
    title: t('Needs the Chair'),
    sub: `${stats.awaitingChair || 0} approvals · ${stats.unackedMessages || 0} unread messages`,
    actions: h(Btn, { size: 'sm', variant: 'ghost', icon: 'arrow', onClick: () => onNavigate('work') }, t('Approvals')),
  }, approvals.length
    ? h('div', { className: 'hd-list' }, approvals.slice(0, 7).map((row) => h(ApprovalRow, { key: row.id, row, onOpenPlan, onAction })))
    : h(Empty, null, t('No approvals waiting')));
}
function StageColumn({ stage }) {
  const total = stage.total || 0;
  const segments = [['ready', stage.ready || 0], ['claimed', stage.claimed || 0], ['done', stage.done || 0], ['failed', stage.failed || 0]];
  return h('div', { className: 'hd-stage-col' },
    h('div', { className: 'hd-stage-head' }, h('span', null, stage.stage), h('span', { className: 'hd-stage-total' }, total)),
    h('div', { className: 'hd-stage-bars' }, segments.map(([name, count]) => h('div', {
      key: name, className: 'hd-stage-seg hd-stage-seg--' + name,
      style: { width: total ? (count / total) * 100 + '%' : '0%' },
    }))),
    h('div', { className: 'hd-stage-meta' },
      h('span', null, `${stage.ready || 0} ready`), h('span', null, `${stage.claimed || 0} running`),
      h('span', null, `${stage.done || 0} done`)));
}

function PipelineCard({ pipeline }) {
  return h(Card, { title: t('Pipeline'), sub: 'Stage nodes by status, live from the work graph.' },
    h('div', { className: 'hd-pipeline' }, (pipeline || []).map((stage) => h(StageColumn, { key: stage.stage, stage }))));
}
function FindingRow({ finding }) {
  const tone = finding.severity === 'error' ? 'error' : finding.severity === 'warning' ? 'warn' : 'ok';
  return h('div', { className: 'hd-list-item' },
    h('div', { style: { paddingTop: 3 } }, h('span', { className: 'hd-dot hd-dot--' + tone })),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, finding.check || 'check'),
      h('div', { className: 'hd-row-sub', style: { display: 'block', marginTop: 3 } }, finding.message)));
}

function HealthCard({ doctor, onNavigate }) {
  const findings = doctor.findings || [];
  const tone = doctor.errors ? 'error' : doctor.warnings ? 'warn' : 'ok';
  return h(Card, {
    title: t('Health'), sub: `${doctor.errors || 0} errors · ${doctor.warnings || 0} warnings`,
    actions: h(Btn, { size: 'sm', variant: 'ghost', icon: 'arrow', onClick: () => onNavigate('ops') }, t('Operations')),
  }, findings.length
    ? h('div', { className: 'hd-list' }, findings.slice(0, 7).map((finding, i) => h(FindingRow, { key: finding.check + i, finding })))
    : h('div', { className: 'hd-inline' }, h(Pill, { tone, dot: true }, doctor.errors ? t('Errors') : t('No findings'))));
}

function ActivityCard({ events }) {
  return h(Card, { title: t('Recent activity'), sub: 'Hash-chained kernel events, newest first.' }, events.length
    ? h('div', { className: 'hd-timeline' }, events.slice(0, 9).map((event) => h('div', { key: event.seq, className: 'hd-event' },
      h('span', { className: 'hd-event-dot', style: { background: event.to_status ? 'var(--dsw-alias-state-business-primary)' : undefined } }),
      h('div', { className: 'hd-event-body' },
        h('div', { className: 'hd-event-text' }, `${event.entity}${event.entity_id ? ' · ' + shortId(event.entity_id) : ''}${event.to_status ? ' → ' + event.to_status : ''}`),
        event.note ? h('div', { className: 'hd-muted hd-tiny' }, event.note.slice(0, 160)) : null,
        h('div', { className: 'hd-event-meta' }, h('span', null, event.actor), h('span', null, fmtAgo(event.ts)), h('span', null, '#' + event.seq))))))
    : h(Empty, null, t('No data')));
}
function metricLabel(key) {
  return key.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
function metricValue(key, value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  if (key === 'gate_latency_h') return Number(value).toFixed(1) + 'h';
  if (key === 'cost_per_verified_result') return fmtTokens(value);
  return Math.round(Number(value) * 100) + '%';
}
function MetricsCard({ cards }) {
  return h(Card, { title: t('Metrics'), sub: 'Feedback-loop sensors with their counter-metric.' }, cards.length
    ? h('div', { className: 'hd-list' }, cards.map((m) => {
      const ratio = Math.max(0, Math.min(1, Number(m.value) || 0));
      return h('div', { key: m.key, className: 'hd-list-item' },
        h('div', { className: 'hd-row-main' },
          h('div', { className: 'hd-inline', style: { justifyContent: 'space-between' } },
            h('span', { className: 'hd-tiny hd-strong' }, metricLabel(m.key)),
            h('span', { className: 'hd-mono' }, metricValue(m.key, m.value))),
          m.key !== 'gate_latency_h' && m.key !== 'cost_per_verified_result'
            ? h('div', { className: 'hd-progress', style: { marginTop: 5 } }, h('div', { className: 'hd-progress-bar', style: { width: ratio * 100 + '%' } }))
            : null,
          h('div', { className: 'hd-muted hd-tiny', style: { marginTop: 3 } }, m.n ? `n=${m.n}` : 'sensor')));
    }))
    : h(Empty, null, t('No data')));
}
function PulseCard({ data, onNavigate }) {
  const schedules = data.schedules?.next || [];
  const drivers = data.drivers || [];
  return h(Card, {
    title: 'Organization pulse',
    actions: h(Btn, { size: 'sm', variant: 'ghost', icon: 'arrow', onClick: () => onNavigate('org') }, t('Organization')),
  },
  h('div', { className: 'hd-kv', style: { gridTemplateColumns: '90px 1fr' } },
    h('div', { className: 'hd-kv-key' }, t('Departments')), h('div', { className: 'hd-kv-val' }, `${data.org?.departments?.length || 0} departments · ${data.org?.employees || 0} employees`),
    h('div', { className: 'hd-kv-key' }, t('Drivers')), h('div', { className: 'hd-kv-val' }, `${drivers.length} installed · ${drivers.filter((d) => d.stages?.length).length} with stages`),
    h('div', { className: 'hd-kv-key' }, t('Schedules')), h('div', { className: 'hd-kv-val' }, `${data.schedules?.enabled || 0} enabled · ${data.schedules?.failing || 0} failing`)),
  schedules.length ? h('div', { className: 'hd-list', style: { marginTop: 8 } }, schedules.slice(0, 3).map((s) => h('div', { key: s.id, className: 'hd-list-item' },
    h('div', { className: 'hd-row-main' }, h('div', { className: 'hd-row-title' }, s.kind + ' · ' + (s.employee_id ? shortId(s.employee_id) : s.template_id ? shortId(s.template_id) : s.id)),
      h('div', { className: 'hd-row-sub' }, h('span', null, s.cron || '—'), h('span', null, 'next ' + fmtTime(s.next_run_at))))))) : null);
}

function OverviewPage({ onNavigate, onOpenPlan, onAction }) {
  const { data, error, loading, reload } = useSharedApi('overview', {}, { poll: 20000 });
  if (!data && loading) return h(Loading, null);
  if (!data) return h('div', { className: 'hd-page' }, h(ErrorBox, { error, onRetry: reload }));
  return h('div', { className: 'hd-page' },
    h(PageHead, {
      title: t('Holon Command Center'),
      sub: `${data.instance?.label || 'instance'} · ${data.instance?.home || ''} · ${data.instance?.version || ''}`,
      actions: h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh')),
    }),
    h(ErrorBox, { error: degradationError(data) }),
    h(OverviewStats, { data }),
    h('div', { className: 'hd-split', style: { marginTop: 12 } },
      h('div', { className: 'hd-grid' },
        h(ApprovalsCard, { stats: data.stats || {}, approvals: data.approvals || [], onOpenPlan, onAction, onNavigate }),
        h(PipelineCard, { pipeline: data.pipeline }),
        h(MetricsCard, { cards: data.metricCards || [] })),
      h('div', { className: 'hd-grid' },
        h(HealthCard, { doctor: data.doctor || {}, onNavigate }),
        h(ActivityCard, { events: data.events || [] }),
        h(PulseCard, { data, onNavigate }))));
}
