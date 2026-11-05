function TaskCard({ row, onOpen }) {
  const title = row.work_title || row.title;
  return h('div', { className: 'hd-task', onClick: () => onOpen(row) },
    h('div', { className: 'hd-task-title' }, title),
    h('div', { className: 'hd-task-meta' },
      h(Pill, { tone: toneFor(row.status), dot: true }, row.status),
      row.grade !== null && row.grade !== undefined ? h('span', null, 'G' + row.grade) : null,
      h('span', null, row.dept || '—'),
      row.assignee_name ? h('span', null, row.assignee_name) : null,
      h('span', null, fmtAgo(row.updated_at))));
}

function Board({ rows, onOpen }) {
  return h('div', { className: 'hd-board' }, STAGES.map((stage) => {
    const items = rows.filter((row) => row.stage === stage && !['done', 'cancelled'].includes(row.status));
    return h('div', { key: stage, className: 'hd-board-col' },
      h('div', { className: 'hd-board-head' },
        h('span', { className: 'hd-board-title' }, stage),
        h('span', { className: 'hd-board-count' }, items.length)),
      items.length ? items.map((row) => h(TaskCard, { key: row.id, row, onOpen })) : h('div', { className: 'hd-empty', style: { padding: '12px 4px' } }, '—'));
  }));
}
function WorkTable({ rows, onOpen, view }) {
  const columns = view === 'work'
    ? ['Title', 'Status', 'Department', 'Open stages', 'Priority', 'Updated']
    : ['Title', 'Stage', 'Status', 'Department', 'Assignee', 'Grade', 'Updated'];
  return h('div', { className: 'hd-table-wrap' }, h('table', { className: 'hd-table' },
    h('thead', null, h('tr', null, columns.map((c) => h('th', { key: c, className: 'hd-th' }, t(c))))),
    h('tbody', null, rows.map((row) => h('tr', { key: row.id, className: 'hd-tr', onClick: () => onOpen(row) },
      h('td', { className: 'hd-td' }, h('div', { className: 'hd-strong' }, row.work_title || row.title), h('div', { className: 'hd-muted hd-tiny hd-mono' }, shortId(row.id))),
      view === 'work' ? null : h('td', { className: 'hd-td', style: { textTransform: 'capitalize' } }, row.stage),
      h('td', { className: 'hd-td' }, h(Pill, { tone: toneFor(row.status), dot: true }, row.status)),
      h('td', { className: 'hd-td' }, row.dept || '—'),
      view === 'work' ? h('td', { className: 'hd-td' }, row.open_stages ?? 0) : h('td', { className: 'hd-td' }, row.assignee_name || '—'),
      view === 'work' ? h('td', { className: 'hd-td' }, 'P' + (row.priority ?? '?')) : h('td', { className: 'hd-td' }, row.grade !== null && row.grade !== undefined ? 'G' + row.grade : '—'),
      h('td', { className: 'hd-td hd-muted' }, fmtAgo(row.updated_at)))))));
}
function ApprovalItem({ row, onOpenPlan, onAction }) {
  const title = row.work_title || row.title;
  const tone = row.grade >= 3 ? 'warn' : 'brand';
  const approve = () => onAction({
    title: t('Approve') + ' · ' + title,
    description: 'Approving the plan moves the work to execute. The note is stored in the approval record.',
    action: 'plan.approve', payload: { ref: row.id },
    fields: [{ key: 'note', label: 'Note (optional)', type: 'textarea' }], submit: t('Approve'),
  });
  return h('div', { className: 'hd-list-item' },
    h('div', { style: { paddingTop: 3 } }, h('span', { className: 'hd-dot hd-dot--' + tone })),
    h('div', { className: 'hd-row-main', style: { cursor: 'pointer' }, onClick: () => onOpenPlan(row.id) },
      h('div', { className: 'hd-row-title' }, title),
      h('div', { className: 'hd-row-sub' },
        h('span', null, row.dept || '—'), h('span', null, 'G' + (row.grade ?? '?')),
        h('span', null, row.approver || 'chair'), h('span', null, fmtAgo(row.created_at)),
        row.lane ? h('span', null, row.lane) : null)),
    h('div', { className: 'hd-row-meta' },
      h(Btn, { size: 'sm', onClick: () => onOpenPlan(row.id) }, t('Review')),
      h(Btn, { size: 'sm', variant: 'primary', icon: 'check', onClick: approve }, t('Approve'))));
}

function ApprovalList({ rows, onOpenPlan, onAction }) {
  return h('div', { className: 'hd-list' }, rows.map((row) => h(ApprovalItem, { key: row.id, row, onOpenPlan, onAction })));
}

function WorkToolbar({ view, setView, mode, setMode, filters, search, setSearch, dept, setDept, stage, setStage, status, setStatus, onRefresh }) {
  const depts = (filters?.departments || []).map((d) => ({ value: d.slug, label: d.name }));
  const statuses = view === 'work'
    ? ['blocked', 'open', 'waiting', 'needs_input', 'done', 'failed', 'cancelled']
    : ['ready', 'claimed', 'done', 'failed', 'cancelled'];
  const reset = () => { setSearch(''); setDept(''); setStage(''); setStatus(''); };
  return h('div', null,
    h('div', { className: 'hd-toolbar' },
      h('div', { style: { minWidth: 150 } }, h(Seg, { items: [
        { value: 'stages', label: t('Board') }, { value: 'work', label: t('Work') }, { value: 'approvals', label: t('Approvals') },
      ], value: view, onChange: setView })),
      view === 'stages' ? h(Seg, { items: [{ value: 'board', label: t('Board') }, { value: 'table', label: t('List') }], value: mode, onChange: setMode }) : null,
      h(SearchBox, { value: search, onChange: setSearch, placeholder: 'Search title, id, department…' }),
      h('div', { style: { width: 150 } }, h(Select, { value: dept, onChange: setDept, options: depts, placeholder: t('Department') })),
      view === 'approvals' ? null : h('div', { style: { width: 130 } }, h(Select, { value: stage, onChange: setStage, options: STAGES, placeholder: t('Stage') })),
      view === 'approvals' ? null : h('div', { style: { width: 140 } }, h(Select, { value: status, onChange: setStatus, options: statuses, placeholder: t('Status') })),
      h(Btn, { icon: 'refresh', size: 'sm', variant: 'ghost', onClick: onRefresh }, t('Refresh')),
      h(Btn, { size: 'sm', variant: 'ghost', onClick: reset }, t('Reset'))));
}
function WorkPage({ focus, onClearFocus, onAction, onOpenRun }) {
  const [view, setView] = React.useState('stages');
  const [mode, setMode] = React.useState('board');
  const [search, setSearch] = React.useState('');
  const [dept, setDept] = React.useState('');
  const [stage, setStage] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [workId, setWorkId] = React.useState(null);
  const [planId, setPlanId] = React.useState(null);
  const q = useDebounced(search, 250);
  const { data, error, loading, reload } = useApi('work', { view, dept, stage, status, q, limit: 500 }, { poll: 20000 });
  React.useEffect(() => {
    if (!focus) return;
    if (focus.kind === 'plan') setPlanId(focus.id);
    else setWorkId(focus.id);
  }, [focus?.id]);
  const changeView = (next) => { setView(next); setStage(''); setStatus(''); };
  const closeWork = () => { setWorkId(null); if (onClearFocus) onClearFocus(); };
  const closePlan = () => { setPlanId(null); if (onClearFocus) onClearFocus(); };
  const open = (row) => { if (row.stage === 'approve') setPlanId(row.id); else setWorkId(row.id); };
  const rows = data?.rows || [];
  return h('div', { className: 'hd-page' },
    h(PageHead, {
      title: t('Work'), sub: `${rows.length} nodes · ${data?.work?.open || 0} open work · ${data?.pipeline?.reduce((n, s) => n + (s.ready || 0), 0) || 0} ready stages`,
      actions: h(React.Fragment, null,
        h(Btn, { icon: 'plus', size: 'sm', onClick: () => onAction({
          title: 'New work', action: 'task.add', description: 'Files a root work item as the Chair. The kernel plans it.',
          fields: [
            { key: 'title', label: 'Title', type: 'text', required: true },
            { key: 'intent', label: 'Intent', type: 'textarea', required: true },
            { key: 'acceptance', label: 'Acceptance', type: 'textarea' },
            { key: 'dept', label: 'Department', type: 'select', options: (data?.filters?.departments || []).map((d) => ({ value: d.slug, label: d.name })) },
            { key: 'priority', label: 'Priority', type: 'select', options: ['0','1','2','3','4'].map((n) => ({ value: n, label: 'P' + n })) },
            { key: 'risk', label: 'Risk', type: 'select', options: ['low','normal','high','irreversible'].map((r) => ({ value: r, label: r })) },
            { key: 'lane', label: 'Lane', type: 'select', options: ['auto','fast','full'].map((l) => ({ value: l, label: l })) },
          ], submit: 'Create', after: reload,
        }) }, 'New work'),
        h(Btn, { icon: 'plus', size: 'sm', onClick: () => onAction({
          command: 'objective add', title: t('New objective'),
          description: 'Files an objective for a department: the intent, the key results and the department that owns it.',
        }) }, t('New objective')),
        h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh'))),
    }),
    h(WorkToolbar, { view, setView: changeView, mode, setMode, filters: data?.filters, search, setSearch, dept, setDept, stage, setStage, status, setStatus, onRefresh: reload }),
    h(ErrorBox, { error, onRetry: reload }),
    h(ErrorBox, { error: degradationError(data) }),
    loading && !data ? h(Loading) : view === 'approvals'
      ? h(Card, { title: t('Approval queue'), sub: `${rows.length} waiting`, flush: true }, rows.length ? h(ApprovalList, { rows, onOpenPlan: setPlanId, onAction }) : h(Empty, null, t('No approvals waiting')))
      : view === 'work' || mode === 'table'
        ? h(Card, { flush: true }, rows.length ? h(WorkTable, { rows, onOpen: open, view }) : h(Empty))
        : h(Board, { rows, onOpen: open }),
    workId ? h(WorkDrawer, { id: workId, onClose: closeWork, onAction, onOpenRun }) : null,
    planId ? h(PlanDrawer, { id: planId, onClose: closePlan, onAction, onRefresh: reload }) : null);
}
