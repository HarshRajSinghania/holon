function WorkDrawer({ id, onClose, onAction, onOpenRun }) {
  const { data, error, loading, reload } = useApi('workItem', { id }, { poll: 12000 });
  const work = data?.work;
  const stages = data?.stages || [];
  const runs = data?.runs || [];
  const status = work?.status;
  const cancel = () => onAction({
    title: t('Cancel') + ' · ' + (work?.title || id),
    description: 'Cancelling withdraws this work and its open stages and children. The reason is recorded in the audit trail.',
    action: 'task.cancel', payload: { id }, fields: [{ key: 'note', label: 'Reason', type: 'textarea', required: true }], submit: t('Cancel'), danger: true, after: onClose,
  });
  const retry = () => onAction({ title: t('Retry'), action: 'task.retry', payload: { id }, submit: t('Retry'), after: onClose });
  const replan = () => onAction({
    title: t('Replan'), action: 'task.replan', payload: { id },
    fields: [{ key: 'note', label: 'Note (optional)', type: 'textarea' }], submit: t('Replan'), after: onClose,
  });
  const footer = work ? h(React.Fragment, null,
    status === 'failed' ? h(Btn, { icon: 'refresh', onClick: retry }, t('Retry')) : null,
    ['open', 'blocked', 'needs_input', 'waiting'].includes(status) ? h(Btn, { icon: 'git', onClick: replan }, t('Replan')) : null,
    h('div', { style: { flex: 1 } }),
    ['done', 'cancelled'].includes(status) ? null : h(Btn, { variant: 'danger', icon: 'x', onClick: cancel }, t('Cancel'))) : null;
  return h(Drawer, { open: true, title: work?.title || 'Work', sub: id, onClose, footer },
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    work ? h('div', { className: 'hd-grid' },
      h(WorkFacts, { data }),
      h(EntityCommands, { families: ['task', 'memory'], values: { task_id: id }, title: t('Commands'), onAction }),
      h(WorkStages, { stages }),
      h(WorkRuns, { runs, onOpenRun }),
      data.artifacts?.length ? h(Card, { title: t('Artifacts') }, h('div', { className: 'hd-list' }, data.artifacts.map((a) => h('div', { key: a.path, className: 'hd-list-item' },
        h('span', { className: 'hd-dot hd-dot--' + (a.exists ? 'ok' : 'error') }),
        h('div', { className: 'hd-row-main' }, h('div', { className: 'hd-mono hd-truncate' }, a.path), h('div', { className: 'hd-row-sub' }, h('span', null, a.stage), h('span', null, a.kind))))))) : null,
      h(WorkMessages, { messages: data.messages || [] }),
      h(WorkEvents, { events: data.events || [] })) : null);
}
function WorkFacts({ data }) {
  const work = data.work;
  const rows = [
    ['Status', h(Pill, { tone: toneFor(work.status), dot: true }, work.status)],
    ['Department', work.dept || '—'],
    ['Assignee', work.assignee || '—'],
    ['Approver', work.approver || '—'],
    ['Priority', 'P' + (work.priority ?? '?') + ' · ' + (work.risk || 'normal')],
    ['Grade', work.grade !== null && work.grade !== undefined ? 'G' + work.grade : '—'],
    ['Lane', work.lane || '—'],
    ['Attempt', `${work.attempt ?? 0}/${work.max_attempts ?? '?'}`],
    ['Workdir', h('span', { className: 'hd-mono' }, work.workdir || '—')],
    ['Created', fmtTime(work.created_at)],
    ['Updated', fmtTime(work.updated_at)],
    work.blocked_reason ? ['Blocked', work.blocked_reason] : null,
    work.outcome ? ['Outcome', work.outcome] : null,
  ].filter(Boolean);
  return h(Card, { title: t('Detail'), sub: work.root_id === work.id ? 'Root work' : 'Stage node' },
    h(KV, { rows }),
    work.acceptance ? h('div', { style: { marginTop: 12 } }, h('div', { className: 'hd-field-label' }, t('Acceptance')), h(Prose, { text: work.acceptance, limit: 800 })) : null,
    work.intent ? h('div', { style: { marginTop: 12 } }, h('div', { className: 'hd-field-label' }, t('Intent')), h(Prose, { text: work.intent, limit: 1400 })) : null);
}
function StageRow({ stage }) {
  const out = stage.output;
  const body = out?.body;
  return h('div', { className: 'hd-list-item', style: { display: 'block' } },
    h('div', { className: 'hd-inline', style: { justifyContent: 'space-between' } },
      h('div', { className: 'hd-inline' },
        h('span', { className: 'hd-strong', style: { textTransform: 'capitalize' } }, stage.stage),
        h(Pill, { tone: toneFor(stage.status), dot: true }, stage.status),
        h('span', { className: 'hd-muted hd-tiny' }, stage.assignee || 'unassigned')),
      h('span', { className: 'hd-muted hd-tiny' }, `attempt ${stage.attempt ?? 0}/${stage.max_attempts ?? '?'}`)),
    out ? h('details', { style: { marginTop: 6 } },
      h('summary', { className: 'hd-tiny hd-muted', style: { cursor: 'pointer' } },
        `${out.kind} · ${out.summary || 'output'} · ${fmtAgo(out.created_at)}`),
      h('div', { style: { marginTop: 6 } }, h(Pre, { text: body || out.body || '', maxHeight: 320 }))) : h('div', { className: 'hd-muted hd-tiny', style: { marginTop: 4 } }, 'No output yet'),
    stage.decision_note ? h('div', { className: 'hd-muted hd-tiny', style: { marginTop: 4 } }, stage.decision_note) : null);
}

function WorkStages({ stages }) {
  return h(Card, { title: t('Stage') + 's', sub: `${stages.length} stage nodes` }, stages.length
    ? h('div', { className: 'hd-list' }, stages.map((stage) => h(StageRow, { key: stage.id, stage })))
    : h(Empty, null, 'No stages yet'));
}
function RunRow({ run, onOpenRun }) {
  const tone = run.status === 'succeeded' ? 'ok' : run.status === 'running' ? 'brand' : 'error';
  return h('div', { className: 'hd-list-item hd-list-item--click', onClick: () => onOpenRun(run.id) },
    h('span', { className: 'hd-dot hd-dot--' + tone }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, `${run.kind} · ${run.employee_name || run.employee_id || 'unassigned'}`),
      h('div', { className: 'hd-row-sub' },
        h('span', null, run.driver || '—'), h('span', null, fmtDuration(run.duration_s)),
        h('span', null, `${fmtTokens(run.tokens_in)} in / ${fmtTokens(run.tokens_out)} out`))),
    h('span', { className: 'hd-muted hd-tiny hd-mono' }, shortId(run.id)));
}

function WorkRuns({ runs, onOpenRun }) {
  return h(Card, { title: t('Runs'), sub: `${runs.length} run records` }, runs.length
    ? h('div', { className: 'hd-list' }, runs.map((run) => h(RunRow, { key: run.id, run, onOpenRun })))
    : h(Empty, null, t('No runs yet')));
}

function WorkMessages({ messages }) {
  if (!messages.length) return null;
  return h(Card, { title: t('Messages'), sub: `${messages.length} in this thread` },
    h('div', { className: 'hd-list' }, messages.map((m) => h('div', { key: m.id, className: 'hd-list-item' },
      h('div', { className: 'hd-row-main' },
        h('div', { className: 'hd-row-title' }, `${m.sender} · ${m.kind}`),
        h('div', { className: 'hd-row-sub', style: { display: 'block' } }, m.body)),
      h('span', { className: 'hd-muted hd-tiny' }, fmtAgo(m.ts))))));
}

function WorkEvents({ events }) {
  return h(Card, { title: t('Events'), sub: 'Status transitions for this work node' }, events.length
    ? h('div', { className: 'hd-timeline' }, events.map((e) => h('div', { key: e.seq, className: 'hd-event' },
      h('span', { className: 'hd-event-dot' }),
      h('div', { className: 'hd-event-body' },
        h('div', { className: 'hd-event-text' }, `${e.from_status || '—'} → ${e.to_status || '—'}`),
        e.note ? h('div', { className: 'hd-muted hd-tiny' }, e.note) : null,
        h('div', { className: 'hd-event-meta' }, h('span', null, e.actor), h('span', null, fmtTime(e.ts)))))))
    : h(Empty, null, t('No data')));
}
function PlanBody({ plan }) {
  const steps = Array.isArray(plan.steps) ? plan.steps : [];
  const writes = Array.isArray(plan.writes) ? plan.writes : [];
  const rubric = Array.isArray(plan.rubric) ? plan.rubric : [];
  return h(Card, { title: 'Plan', sub: plan.playbook ? 'playbook ' + plan.playbook : 'What the executor will do' },
    plan.findings ? h('div', null, h('div', { className: 'hd-field-label' }, 'Findings'), h(Prose, { text: plan.findings, limit: 1600 })) : null,
    steps.length ? h('div', { style: { marginTop: 10 } },
      h('div', { className: 'hd-field-label' }, 'Steps'),
      h('ol', { style: { margin: '5px 0 0 18px', padding: 0, fontSize: 11.5, lineHeight: 1.5 } }, steps.map((step, i) => h('li', { key: i }, step)))) : null,
    plan.command ? h('div', { style: { marginTop: 10 } }, h('div', { className: 'hd-field-label' }, 'Command'), h(Pre, { text: plan.command, maxHeight: 180 })) : null,
    writes.length ? h('div', { style: { marginTop: 10 } }, h('div', { className: 'hd-field-label' }, 'Writes'), h('div', { className: 'hd-chip-row' }, writes.map((w, i) => h(Pill, { key: i }, w)))) : null,
    rubric.length ? h('div', { style: { marginTop: 10 } }, h('div', { className: 'hd-field-label' }, 'Rubric'), h('div', { className: 'hd-list' }, rubric.map((r, i) => h('div', { key: i, className: 'hd-tiny' }, typeof r === 'string' ? r : JSON.stringify(r))))) : null);
}

function PlanDrawer({ id, onClose, onAction, onRefresh }) {
  const { data, error, loading, reload } = useApi('planItem', { id }, { poll: 0 });
  const approval = data?.approval;
  const plan = data?.plan || {};
  const title = approval?.work_title || approval?.title || 'Plan';
  const after = () => { if (onRefresh) onRefresh(); onClose(); };
  const approve = () => onAction({
    title: t('Approve') + ' · ' + title, description: 'Approving the plan moves the work to execute.',
    action: 'plan.approve', payload: { ref: id },
    fields: [
      { key: 'note', label: 'Note (optional)', type: 'textarea' },
      { key: 'recurring', label: 'Record as a recurring plan', type: 'checkbox' },
    ], submit: t('Approve'), after,
  });
  const reject = () => onAction({
    title: t('Reject') + ' · ' + title, description: 'Rejection tells the planner what must change. The note is required.',
    action: 'plan.reject', payload: { ref: id },
    fields: [{ key: 'note', label: 'What must change', type: 'textarea', required: true }],
    submit: t('Reject'), danger: true, after,
  });
  const grade = () => onAction({
    title: 'Regrade plan', description: 'Regrading reroutes the approval to the authority that owns the new grade.',
    action: 'plan.grade', payload: { ref: id },
    fields: [
      { key: 'grade', label: 'Grade', type: 'select', options: [0,1,2,3,4].map((n) => ({ value: String(n), label: 'G' + n })), required: true },
      { key: 'note', label: 'Why', type: 'textarea', required: true },
    ], submit: 'Regrade', after,
  });
  const footer = approval ? h(React.Fragment, null,
    h(Btn, { variant: 'danger', icon: 'x', onClick: reject }, t('Reject')),
    h(Btn, { icon: 'git', onClick: grade }, 'Regrade'),
    h('div', { style: { flex: 1 } }),
    h(Btn, { variant: 'primary', icon: 'check', onClick: approve }, t('Approve'))) : null;
  return h(Drawer, { open: true, title, sub: id, onClose, footer },
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    approval ? h('div', { className: 'hd-grid' },
      h(Card, null, h(KV, { rows: [
        ['Department', approval.dept || approval.dept_id || '—'],
        ['Approver', approval.approver || '—'],
        ['Grade', 'G' + (approval.grade ?? '?')],
        ['Priority', 'P' + (approval.priority ?? '?') + ' · ' + (approval.risk || 'normal')],
        ['Lane', approval.lane || '—'],
        ['Workdir', h('span', { className: 'hd-mono' }, approval.workdir || '—')],
        ['Created', fmtTime(approval.created_at)],
      ] })),
      h(PlanBody, { plan }),
      h(EntityCommands, { families: ['plan'], values: { ref: id }, title: t('Commands'), onAction }),
      approval.intent ? h(Card, { title: t('Intent') }, h(Prose, { text: approval.intent, limit: 2000 })) : null) : null);
}
