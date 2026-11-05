function DeptCard({ dept, onOpenEmployee, onOpenDept }) {
  const employees = dept.employees || [];
  return h(Card, { title: dept.name, sub: dept.mission || dept.slug,
    actions: h(Btn, { size: 'sm', icon: 'settings', onClick: () => onOpenDept(dept) }, t('Manage')) },
    h('div', { className: 'hd-inline', style: { marginBottom: 8 } },
      h(Pill, { tone: 'brand', dot: true }, dept.slug),
      h(Pill, null, (dept.profile || 'profile') + ' profile'),
      h(Pill, null, `${employees.length} employees`),
      dept.head_name ? h(Pill, null, 'head ' + dept.head_name) : null),
    employees.length ? h('div', { className: 'hd-chip-row' }, employees.map((emp) => h('button', {
      key: emp.id, className: 'hd-chip', onClick: () => onOpenEmployee(emp.id), title: emp.title || emp.name,
    }, initials(emp.name) + ' ' + emp.name))) : h('div', { className: 'hd-muted hd-tiny' }, 'No employees in this department'));
}

function EmployeeTable({ employees, onOpen }) {
  const cols = ['Employee', 'Title', 'Department', 'Driver', 'Status', 'Roles', 'Stages'];
  return h('div', { className: 'hd-table-wrap' }, h('table', { className: 'hd-table' },
    h('thead', null, h('tr', null, cols.map((c) => h('th', { key: c, className: 'hd-th' }, c)))),
    h('tbody', null, employees.map((emp) => h('tr', { key: emp.id, className: 'hd-tr', onClick: () => onOpen(emp.id) },
      h('td', { className: 'hd-td' }, h('div', { className: 'hd-inline' }, h('span', { className: 'hd-avatar' }, initials(emp.name)), h('div', null, h('div', { className: 'hd-strong' }, emp.name), h('div', { className: 'hd-muted hd-tiny hd-mono' }, shortId(emp.id))))),
      h('td', { className: 'hd-td' }, emp.title || '—'),
      h('td', { className: 'hd-td' }, emp.dept || '—'),
      h('td', { className: 'hd-td' }, h(Pill, { tone: 'brand' }, emp.driver || '—')),
      h('td', { className: 'hd-td' }, h(Pill, { tone: emp.status === 'active' ? 'ok' : 'warn', dot: true }, emp.status || '—')),
      h('td', { className: 'hd-td hd-tiny' }, (emp.roles || []).join(', ') || '—'),
      h('td', { className: 'hd-td hd-tiny' }, (emp.stages || []).join(', ') || '—'))))));
}
function EmployeeDrawer({ id, onClose, onAction, onRefresh }) {
  const { data, error, loading, reload } = useApi('employee', { id }, { poll: 0 });
  const emp = data?.employee;
  const after = () => { if (onRefresh) onRefresh(); onClose(); };
  const setDriver = () => onAction({
    title: t('Set driver') + ' · ' + (emp?.name || id), description: 'Rebinding keeps the employee record, authority and memory; the next dispatch uses the new harness.',
    action: 'hr.setDriver', payload: { employee: id },
    fields: [
      { key: 'driver', label: 'Driver', type: 'select', options: (data?.drivers || []).map((d) => ({ value: d.name, label: d.name })), required: true },
      { key: 'reason', label: 'Reason', type: 'textarea', required: true },
    ], submit: t('Set driver'), after,
  });
  const pause = () => onAction({
    title: t('Pause') + ' · ' + (emp?.name || id), description: 'A paused employee claims no new work. Work already assigned stays assigned.',
    action: 'hr.pause', payload: { employee: id }, fields: [{ key: 'reason', label: 'Reason', type: 'textarea', required: true }],
    submit: t('Pause'), danger: true, after,
  });
  const activate = () => onAction({
    title: t('Activate') + ' · ' + (emp?.name || id), action: 'hr.activate', payload: { employee: id },
    fields: [{ key: 'reason', label: 'Reason', type: 'textarea', required: true }], submit: t('Activate'), after,
  });
  const footer = emp ? h(React.Fragment, null,
    h(Btn, { icon: 'settings', onClick: setDriver }, t('Set driver')),
    h('div', { style: { flex: 1 } }),
    emp.status === 'active' ? h(Btn, { variant: 'danger', icon: 'pause', onClick: pause }, t('Pause')) : h(Btn, { variant: 'primary', icon: 'play', onClick: activate }, t('Activate'))) : null;
  return h(Drawer, { open: true, title: emp?.name || 'Employee', sub: id, onClose, footer },
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    emp ? h('div', { className: 'hd-grid' },
      h(Card, null, h(KV, { rows: [
        ['Title', emp.title || '—'], ['Department', emp.dept || emp.dept_id || '—'],
        ['Driver', h(Pill, { tone: 'brand' }, emp.driver || '—')], ['Status', h(Pill, { tone: emp.status === 'active' ? 'ok' : 'warn', dot: true }, emp.status || '—')],
        ['Reports to', emp.reports_to || '—'], ['Concurrency', String(emp.max_concurrency ?? '—')],
        ['Roles', (emp.roles || []).join(', ') || '—'], ['Stages', (emp.stages || []).join(', ') || '—'],
        ['Classes', (emp.task_classes || []).join(', ') || '—'], ['Skills', (emp.skills || []).join(', ') || '—'],
        ['Hired', fmtTime(emp.hired_at)], ['Reason', emp.hired_reason || '—'],
      ] })),
      h(EntityCommands, { families: ['hr', 'emp'], values: { employee: id }, title: t('Commands'), onAction }),
      emp.job_description ? h(Card, { title: 'Job description' }, h(Prose, { text: emp.job_description, limit: 1800 })) : null,
      data.review ? h(Card, { title: 'Evidence review' }, h(Pre, { text: data.review, maxHeight: 300 })) : null) : null);
}
function OrgPage({ onAction }) {
  const { data, error, loading, reload } = useApi('org', {}, { poll: 60000 });
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [dept, setDept] = React.useState(null);
  if (!data && loading) return h(Loading, null);
  if (!data) return h('div', { className: 'hd-page' }, h(ErrorBox, { error, onRetry: reload }));
  const departments = data.departments || [];
  const employees = data.employees || [];
  const q = search.trim().toLowerCase();
  const filtered = q ? employees.filter((e) => [e.name, e.title, e.dept, e.driver, e.roles?.join(' '), e.task_classes?.join(' ')].join(' ').toLowerCase().includes(q)) : employees;
  const active = employees.filter((e) => e.status === 'active').length;
  return h('div', { className: 'hd-page' },
    h(PageHead, { title: t('Organization'), sub: `${departments.length} departments · ${employees.length} employees · ${data.drivers?.length || 0} drivers`, actions: h(React.Fragment, null,
      h(Btn, { icon: 'plus', size: 'sm', onClick: () => onAction({
        command: 'dept create', title: t('New department'),
        description: 'Creates a department from a bylaws profile. The slug is how every other command names it.',
      }) }, t('New department')),
      h(Btn, { icon: 'users', size: 'sm', onClick: () => onAction({
        command: 'hr hire', title: t('Hire employee'),
        description: 'Files an employee record: name, title, department, job description, driver and the reason.',
      }) }, t('Hire employee')),
      h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh'))) }),
    h('div', { className: 'hd-grid hd-stat-grid' },
      h(Stat, { label: t('Departments'), value: departments.length, hint: `${departments.filter((d) => d.employees?.length).length} staffed`, icon: 'layers' }),
      h(Stat, { label: t('Employees'), value: employees.length, hint: `${active} active · ${employees.length - active} paused`, tone: active ? 'ok' : 'warn', icon: 'users' }),
      h(Stat, { label: t('Drivers'), value: data.drivers?.length || 0, hint: (data.drivers || []).map((d) => d.name).join(' · '), icon: 'terminal' }),
      h(Stat, { label: 'Autonomy', value: (data.autonomy || []).length, hint: 'department policies', icon: 'shield' })),
    h('div', { className: 'hd-grid', style: { gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', marginTop: 12 } }, departments.map((d) => h(DeptCard, { key: d.id, dept: d, onOpenEmployee: setSelected, onOpenDept: setDept }))),
    h(Card, { title: t('Employees'), sub: `${filtered.length} shown`, actions: h('div', { style: { width: 220 } }, h(SearchBox, { value: search, onChange: setSearch, placeholder: 'Filter people…' })), flush: true, style: { marginTop: 12 } },
      filtered.length ? h(EmployeeTable, { employees: filtered, onOpen: setSelected }) : h(Empty)),
    selected ? h(EmployeeDrawer, { id: selected, onClose: () => setSelected(null), onAction, onRefresh: reload }) : null,
    dept ? h(EntityDrawer, {
      title: dept.name, sub: dept.slug, families: ['dept'], values: { slug: dept.slug },
      facts: [
        ['Slug', dept.slug], ['Name', dept.name], ['Mission', dept.mission || '—'],
        ['Head', dept.head_name || '—'], ['Profile', dept.profile || '—'],
        ['Employees', String((dept.employees || []).length)],
      ],
      onClose: () => setDept(null), onAction,
    }) : null);
}
