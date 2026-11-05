function RunsTable({ rows, onOpen }) {
  const cols = ['Run', 'Stage', 'Task', 'Employee', 'Driver', 'Status', 'Started', 'Duration', 'Tokens'];
  return h('div', { className: 'hd-table-wrap' }, h('table', { className: 'hd-table' },
    h('thead', null, h('tr', null, cols.map((c) => h('th', { key: c, className: 'hd-th' }, c)))),
    h('tbody', null, rows.map((run) => h('tr', { key: run.id, className: 'hd-tr', onClick: () => onOpen(run.id) },
      h('td', { className: 'hd-td hd-mono' }, shortId(run.id)),
      h('td', { className: 'hd-td', style: { textTransform: 'capitalize' } }, run.stage || run.kind),
      h('td', { className: 'hd-td' }, h('div', { className: 'hd-truncate', style: { maxWidth: 320 } }, run.task_title || '—')),
      h('td', { className: 'hd-td' }, run.employee_name || '—'),
      h('td', { className: 'hd-td' }, h(Pill, { tone: 'brand' }, run.driver || '—')),
      h('td', { className: 'hd-td' }, h(Pill, { tone: run.status === 'succeeded' ? 'ok' : run.status === 'running' ? 'brand' : 'error', dot: true }, run.status)),
      h('td', { className: 'hd-td hd-tiny' }, fmtAgo(run.started_at)),
      h('td', { className: 'hd-td' }, fmtDuration(run.duration_s)),
      h('td', { className: 'hd-td hd-tiny' }, fmtTokens(run.tokens_in) + ' / ' + fmtTokens(run.tokens_out)))))));
}
function RunsPage({ focus, onClearFocus, onOpenWork, onAction }) {
  const [status, setStatus] = React.useState('');
  const [driver, setDriver] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const q = useDebounced(search, 200);
  const { data, error, loading, reload } = useApi('runs', { status, driver, limit: 300 }, { poll: 10000 });
  React.useEffect(() => { if (focus?.id) setSelected(focus.id); }, [focus?.id]);
  const rows = (data?.rows || []).filter((run) => !q || [run.id, run.task_title, run.employee_name, run.driver, run.stage].join(' ').toLowerCase().includes(q.toLowerCase()));
  const counts = data?.counts || {};
  const drivers = [...new Set((data?.rows || []).map((r) => r.driver).filter(Boolean))];
  const open = (id) => setSelected(id);
  const close = () => { setSelected(null); if (onClearFocus) onClearFocus(); };
  return h('div', { className: 'hd-page' },
    h(PageHead, { title: t('Runs'), sub: 'Every dispatch, lease and token count in the run ledger.', actions: h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh')) }),
    h('div', { className: 'hd-grid hd-stat-grid' },
      h(Stat, { label: 'Running', value: counts.running || 0, hint: 'live leases', tone: counts.running ? 'brand' : '', icon: 'play' }),
      h(Stat, { label: 'Succeeded', value: counts.succeeded || 0, hint: 'completed runs', tone: 'ok', icon: 'check' }),
      h(Stat, { label: 'Failed', value: (counts.failed || 0) + (counts.timeout || 0) + (counts.abandoned || 0), hint: `${counts.failed || 0} failed · ${counts.timeout || 0} timeout`, tone: 'error', icon: 'alert' }),
      h(Stat, { label: 'Records', value: rows.length, hint: 'loaded window', icon: 'database' })),
    h('div', { className: 'hd-toolbar', style: { marginTop: 12 } },
      h(SearchBox, { value: search, onChange: setSearch, placeholder: 'Filter runs, tasks, people…' }),
      h('div', { style: { width: 140 } }, h(Select, { value: status, onChange: setStatus, options: ['running', 'succeeded', 'failed', 'timeout', 'abandoned'], placeholder: t('Status') })),
      h('div', { style: { width: 150 } }, h(Select, { value: driver, onChange: setDriver, options: drivers, placeholder: t('Drivers') }))),
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : h(Card, { flush: true }, rows.length ? h(RunsTable, { rows, onOpen: open }) : h(Empty, null, t('No runs yet'))),
    selected ? h(RunDrawer, { id: selected, onClose: close, onOpenWork, onAction }) : null);
}
function RunDrawer({ id, onClose, onOpenWork, onAction }) {
  const { data, error, loading, reload } = useApi('runItem', { id }, { poll: 0 });
  const [tab, setTab] = React.useState('log');
  const footer = data && onOpenWork ? h(Btn, { icon: 'arrow', onClick: () => { onOpenWork(data.task_id); onClose(); } }, t('Open item')) : null;
  const log = data?.log;
  const result = data?.result;
  const trajectory = data?.trajectory;
  const brief = data?.brief;
  const files = data?.files || [];
  return h(Drawer, { open: true, title: data?.task_title || 'Run', sub: id, onClose, footer },
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    data ? h('div', { className: 'hd-grid' },
      h(Card, null, h(KV, { rows: [
        ['Status', h(Pill, { tone: data.status === 'succeeded' ? 'ok' : data.status === 'running' ? 'brand' : 'error', dot: true }, data.status)],
        ['Stage', data.stage || data.kind], ['Driver', data.driver || '—'],
        ['Employee', data.employee_name || data.employee_id || '—'],
        ['Started', fmtTime(data.started_at)], ['Ended', fmtTime(data.ended_at)],
        ['Duration', fmtDuration(data.duration_s)], ['Exit', data.exit_code === null || data.exit_code === undefined ? '—' : String(data.exit_code)],
        ['Tokens', `${fmtTokens(data.tokens_in)} in / ${fmtTokens(data.tokens_out)} out`],
        ['Tools', data.tool_calls === null || data.tool_calls === undefined ? '—' : String(data.tool_calls)],
        ['Lease', fmtTime(data.lease_until)], ['Build', data.harness_build || '—'],
        ['Log', h('span', { className: 'hd-mono hd-tiny' }, data.log_path || '—')],
      ] })),
      h(Card, { title: 'Evidence', actions: h(Seg, { items: [
        { value: 'log', label: 'Log' }, { value: 'result', label: 'Result' }, { value: 'trajectory', label: 'Trajectory' }, { value: 'brief', label: 'Brief' }, { value: 'files', label: 'Files' },
      ], value: tab, onChange: setTab }) },
        tab === 'log' ? (log?.ok ? h(Pre, { text: log.text, maxHeight: 480 }) : h(Empty, null, log?.error || 'No log')) : null,
        tab === 'result' ? (result?.ok ? h(Pre, { text: result.value ?? result.text, maxHeight: 480 }) : h(Empty, null, result?.error || 'No result.json')) : null,
        tab === 'trajectory' ? (trajectory?.ok ? h(Pre, { text: trajectory.text, maxHeight: 480 }) : h(Empty, null, trajectory?.error || 'No trajectory')) : null,
        tab === 'brief' ? (brief?.ok ? h(Prose, { text: brief.text }) : h(Empty, null, brief?.error || 'No brief')) : null,
        tab === 'files' ? (files.length ? h('div', { className: 'hd-list' }, files.map((f) => h('div', { key: f.name, className: 'hd-list-item' },
          h('span', { className: 'hd-mono hd-tiny' }, f.name), h('span', { className: 'hd-muted hd-tiny', style: { marginLeft: 'auto' } }, f.size === null ? '—' : `${Math.round(f.size / 1024)} KiB`)))) : h(Empty, null, 'No files')) : null),
      onAction ? h(EntityCommands, { families: ['run'], values: { run_id: id }, title: t('Commands'), onAction }) : null) : null);
}
