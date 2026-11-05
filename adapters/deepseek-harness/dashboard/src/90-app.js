function HolonIcon({ size = 18 }) {
  const s = size;
  return h('svg', { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', 'aria-hidden': true },
    h('rect', { x: 3.2, y: 3.2, width: 17.6, height: 17.6, rx: 5.2, opacity: 0.55 }),
    h('circle', { cx: 12, cy: 12, r: 5.1 }),
    h('circle', { cx: 12, cy: 12, r: 1.7, fill: 'currentColor', stroke: 'none' }),
    h('path', { d: 'M12 1.6v2.2M12 20.2v2.2M1.6 12h2.2M20.2 12h2.2', opacity: 0.45 }));
}

function Toast({ message }) {
  if (!message) return null;
  return h('div', { role: 'status', 'aria-live': 'polite', style: { position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 100, background: 'var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-layer-2))', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 10, padding: '8px 13px', fontSize: 11.5, boxShadow: '0 10px 30px rgba(0,0,0,.18)', maxWidth: '80vw' } }, message);
}

function ActionModal({ spec, onClose, onToast }) {
  const [values, setValues] = React.useState({});
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const { data: catalogue } = useSharedApi('commands', {}, { poll: 0 });
  React.useEffect(() => {
    if (!spec) return;
    const initial = {};
    for (const field of spec.fields || []) {
      initial[field.key] = spec.payload?.[field.key] ?? (field.type === 'checkbox' ? false : '');
    }
    setValues(initial); setBusy(false); setError(null); setResult(null);
  }, [spec]);
  if (!spec) return null;
  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  // A command from the kernel's catalogue: the form is the manifest's, the arguments are the
  // manifest's, and the fence is the manifest's. Nothing here knows what the command does.
  if (spec.command) {
    const row = (catalogue?.commands || []).find((c) => c.command === spec.command);
    const runCommand = async (name, args, confirm) => {
      setBusy(true); setError(null); setResult(null);
      try {
        const out = await apiPost('command.run', { command: name, args, confirm });
        setResult(out?.result ?? null);
        onToast(spec.success || 'Done.');
        if (spec.after) spec.after();
        onClose();
      } catch (e) {
        setError(e);
      } finally {
        setBusy(false);
      }
    };
    return h(Modal, {
      open: true, title: spec.title || spec.command, sub: spec.description, onClose,
      footer: h(Btn, { onClick: onClose }, t('Close')),
    }, row
      ? h(CommandForm, { command: row, prefill: spec.prefill, onRun: runCommand, busy, error, result })
      : h(Loading));
  }
  const submit = async () => {
    for (const field of spec.fields || []) {
      if (field.required && !String(values[field.key] ?? '').trim()) {
        setError(`${field.label || field.key} is required.`); return;
      }
    }
    setBusy(true); setError(null);
    try {
      const payload = { ...(spec.payload || {}), ...values };
      await apiPost(spec.action, payload);
      onToast(spec.success || 'Done.');
      if (spec.after) spec.after();
      onClose();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };
  const fields = (spec.fields || []).map((field) => {
    const value = values[field.key] ?? '';
    if (field.type === 'textarea') return h(Field, { key: field.key, label: field.label || field.key }, h('textarea', { className: 'hd-textarea', value, onChange: (e) => set(field.key, e.target.value) }));
    if (field.type === 'select') return h(Field, { key: field.key, label: field.label || field.key }, h(Select, { value, onChange: (v) => set(field.key, v), options: field.options || [] }));
    if (field.type === 'checkbox') return h('label', { key: field.key, className: 'hd-inline', style: { fontSize: 11.5, cursor: 'pointer' } }, h('input', { type: 'checkbox', checked: Boolean(value), onChange: (e) => set(field.key, e.target.checked) }), field.label || field.key);
    return h(Field, { key: field.key, label: field.label || field.key }, h('input', { className: 'hd-input', value, onChange: (e) => set(field.key, e.target.value) }));
  });
  return h(Modal, {
    open: true, title: spec.title || 'Confirm', sub: spec.description, onClose,
    footer: h(React.Fragment, null,
      h(Btn, { onClick: onClose, disabled: busy }, t('Cancel')),
      h(Btn, { variant: spec.danger ? 'danger' : 'primary', icon: spec.danger ? 'alert' : 'check', onClick: submit, disabled: busy }, busy ? 'Working…' : (spec.submit || t('Confirm')))),
  },
  h('div', { className: 'hd-grid' },
    h(ErrorBox, { error }),
    spec.danger ? h('div', { className: 'hd-tiny hd-muted' }, t('This action writes to the instance.')) : null,
    fields.length ? fields : null));
}
function App() {
  const [tab, setTab] = React.useState('overview');
  const [focus, setFocus] = React.useState(null);
  const [action, setAction] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const overview = useSharedApi('overview', {}, { poll: 30000 });
  React.useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(id);
  }, [toast]);
  const go = (next) => { setFocus(null); setTab(next); };
  const openPlan = (id) => { setFocus({ kind: 'plan', id }); setTab('work'); };
  const openWork = (id) => { setFocus({ kind: 'work', id }); setTab('work'); };
  const openRun = (id) => { setFocus({ kind: 'run', id }); setTab('runs'); };
  const openMessage = (id) => { setFocus({ kind: 'message', id }); setTab('messages'); };
  const data = overview.data;
  const s = data?.stats || {};
  const hb = data?.heartbeat;
  const hbTone = !hb?.present ? 'error' : hb.stale ? 'warn' : 'ok';
  const tabs = [
    { id: 'overview', label: t('Overview') },
    { id: 'work', label: t('Work'), count: s.readyTotal || 0 },
    { id: 'org', label: t('Organization') },
    { id: 'runs', label: t('Runs'), count: s.activeRuns || 0 },
    { id: 'knowledge', label: t('Knowledge') },
    { id: 'ops', label: t('Operations'), count: s.doctorErrors || 0 },
    { id: 'messages', label: t('Messages'), count: s.unackedMessages || 0 },
    { id: 'console', label: t('Console') },
    { id: 'config', label: t('Configuration') },
    { id: 'settings', label: t('Settings') },
  ];
  const page = tab === 'overview' ? h(OverviewPage, { onNavigate: go, onOpenPlan: openPlan, onAction: setAction })
    : tab === 'work' ? h(WorkPage, { focus, onClearFocus: () => setFocus(null), onAction: setAction, onOpenRun: openRun })
      : tab === 'org' ? h(OrgPage, { onAction: setAction })
        : tab === 'runs' ? h(RunsPage, { focus, onClearFocus: () => setFocus(null), onOpenWork: openWork, onAction: setAction })
          : tab === 'knowledge' ? h(KnowledgePage, { onAction: setAction })
            : tab === 'ops' ? h(OpsPage, { onAction: setAction })
              : tab === 'messages' ? h(MessagesPage, { focus, onClearFocus: () => setFocus(null), onAction: setAction })
                : tab === 'console' ? h(ConsolePage, null)
                  : tab === 'config' ? h(ConfigPanel, null)
                    : h(SettingsPage, null);
  return h('div', { className: 'hd-root' }, h('div', { className: 'hd-shell' },
    h('div', { className: 'hd-top' },
      h('div', { className: 'hd-brand' },
        h('div', { className: 'hd-logo' }, h(HolonIcon, { size: 18 })),
        h('div', { style: { minWidth: 0 } }, h('div', { className: 'hd-title' }, 'Holon'), h('div', { className: 'hd-sub' }, `Command Center · ${data?.instance?.label || 'instance'} · ${data?.instance?.home || ''}`))),
      h('div', { className: 'hd-top-actions' },
        h(Pill, { tone: hbTone, dot: true }, `${t('Heartbeat')} ${hb?.ageSeconds ?? '—'}s`),
        h(Pill, { tone: s.doctorErrors === null ? 'warn' : s.doctorErrors ? 'error' : s.doctorWarnings ? 'warn' : 'ok', dot: true }, `${t('Doctor')} ${s.doctorErrors ?? '—'}`),
        data?.degraded ? h(Pill, { tone: 'error', dot: true }, t('Degraded')) : null,
        h(Btn, { size: 'sm', icon: 'refresh', onClick: overview.reload }, t('Refresh')))),
    h('div', { className: 'hd-tabs', role: 'tablist' }, tabs.map((item) => h('button', {
      key: item.id, type: 'button', role: 'tab', 'aria-selected': tab === item.id,
      className: 'hd-tab' + (tab === item.id ? ' hd-tab--active' : ''), onClick: () => go(item.id),
    }, item.label, item.count ? h('span', { className: 'hd-tab-count' }, item.count) : null))),
    h('div', { className: 'hd-content' }, page),
    h(Toast, { message: toast }),
    h(ActionModal, { spec: action, onClose: () => setAction(null), onToast: setToast })));
}
function Dock({ onOpen }) {
  const { data } = useSharedApi('overview', {}, { poll: 60000 });
  if (!data) return null;
  const s = data.stats || {};
  if (!s.awaitingChair && !s.doctorErrors && !data.degraded) return null;
  return h('div', { className: 'hd-dock', role: 'status', 'aria-live': 'polite' },
    h('span', { className: 'hd-dot hd-dot--' + (data.degraded || s.doctorErrors ? 'error' : 'warn') }),
    h('span', { className: 'hd-dock-text' }, 'Holon · ', h('b', null, s.awaitingChair || 0), ' awaiting · ', h('b', null, s.doctorErrors || 0), ' doctor errors · heartbeat ', h('b', null, (data.heartbeat?.ageSeconds ?? '—') + 's')),
    h(Btn, { size: 'sm', variant: 'ghost', icon: 'arrow', onClick: onOpen }, 'Open'));
}

function SettingsSection({ onOpen }) {
  return h(SettingsPage, { embedded: true, onOpen });
}

const FACTORY_RETURN = {
  inject: ['slots', 'locale'],
  apply(ctx) {
    // The dictionary is owned by this plugin: an HMR reload re-applies the factory, and a
    // namespace that is still registered throws. Effect-owning the registration gives it a
    // disposer, so a reload replaces the copy instead of colliding with it. A namespace left
    // behind by an older generation (a disable that predated this ownership) must not take the
    // whole plugin down: the copy is the same text, so the page keeps rendering.
    ctx.effect(() => {
      let dispose = () => {};
      try {
        dispose = ctx.locale.register(NS, { en: EN, zh: ZH });
      } catch (error) {
        ctx.logger?.warn?.('holon-dashboard: the locale namespace was already registered: '
          + (error?.message || error) + ' — reloading the page clears it.');
      }
      translate = ctx.locale.bind(NS);
      return () => { dispose(); translate = (text) => text; };
    }, 'holon-dashboard: locale dictionary');
    const openPanel = () => { try { ctx.layout?.selectPanel?.('holon'); } catch { /* no layout */ } };
    ctx.effect(() => {
      const el = document.createElement('style');
      el.setAttribute('data-holon-dashboard', '1');
      el.textContent = CSS;
      document.head.appendChild(el);
      return () => el.remove();
    }, 'holon-dashboard: styles');
    ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'holon', locale: NS }, App));
    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
      name: 'sidebar.panellist', id: 'holon', order: 4, locale: NS,
      label: () => t('Holon Command Center'),
      title: () => t('Holon Command Center'),
    }, HolonIcon));
    ctx.slots.inject('settings.section', () => ctx.slots.register({
      name: 'settings.section', id: 'holon', order: 45, locale: NS,
      label: () => t('Holon Command Center'),
    }, () => h(SettingsSection, { onOpen: openPanel })));
    ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
      name: 'conversation.composer.dock', id: 'holon-dock', order: 20, locale: NS,
    }, () => h(Dock, { onOpen: openPanel })));
  },
};