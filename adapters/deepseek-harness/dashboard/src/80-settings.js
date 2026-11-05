function ConfigRow({ section, key, row, onSave, busy, error }) {
  const [value, setValue] = React.useState(row.value === null || row.value === undefined ? '' : String(row.value));
  const [saved, setSaved] = React.useState(false);
  React.useEffect(() => {
    setValue(row.value === null || row.value === undefined ? '' : String(row.value));
    setSaved(false);
  }, [section, key, row.value]);
  const editable = row.type !== 'table';
  const changed = editable && String(value) !== String(row.value);
  return h('div', { className: 'hd-settings-row' },
    h('div', { className: 'hd-settings-row-label' }, key),
    h('div', { className: 'hd-settings-row-value' },
      editable
        ? h('input', { className: 'hd-input', value, onChange: (e) => { setValue(e.target.value); setSaved(false); } })
        : h('span', { className: 'hd-mono hd-tiny' }, JSON.stringify(row.value)),
      h('span', { className: 'hd-muted hd-tiny' }, row.source === 'file' ? t('set in holon.toml') : t('kernel default'))),
    editable
      ? h('div', { className: 'hd-inline' },
        h(Btn, {
          size: 'sm', variant: 'primary', disabled: busy || !changed,
          onClick: async () => {
            const ok = await onSave(section, key, value);
            if (ok) setSaved(true);
          },
        }, saved ? t('Saved') : t('Save')),
        error ? h('span', { className: 'hd-muted hd-tiny' }, error) : null)
      : null);
}

function ConfigPanel() {
  const { data, error, loading, reload } = useApi('config', {}, { poll: 0 });
  const [busy, setBusy] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const sections = data?.sections || {};
  const save = async (section, key, value) => {
    setBusy(true);
    setErrors((prev) => ({ ...prev, [`${section}.${key}`]: null }));
    try {
      await apiPost('config.set', { section, key, value });
      await reload();
      return true;
    } catch (e) {
      setErrors((prev) => ({ ...prev, [`${section}.${key}`]: e.message || String(e) }));
      return false;
    } finally {
      setBusy(false);
    }
  };
  return h('div', { className: 'hd-page' },
    h(PageHead, {
      title: t('Configuration'),
      sub: t('Every key the kernel reads, its effective value, and whether holon.toml sets it. A change is written to holon.toml and re-parsed before it is accepted.'),
      actions: h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh')),
    }),
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    data && data.unknown && data.unknown.length
      ? h(Card, { title: t('Unknown keys'), sub: t('holon.toml carries keys the kernel does not read: a typo, or a setting from another version.') },
        h('div', { className: 'hd-list' }, data.unknown.map((row) => h('div', { key: `${row.section}.${row.key}`, className: 'hd-list-item' },
          h('div', { className: 'hd-row-main' },
            h('div', { className: 'hd-row-title' }, row.key || row.section),
            h('div', { className: 'hd-row-sub' }, row.section)),
          h(Pill, { tone: 'warn' }, t('not read'))))))
      : null,
    Object.keys(sections).sort().map((section) => h(Card, { key: section, title: `[${section}]` },
      h('div', { className: 'hd-settings' }, Object.keys(sections[section]).sort().map((key) => h(ConfigRow, {
        key: `${section}.${key}`, section, key, row: sections[section][key],
        onSave: save, busy, error: errors[`${section}.${key}`],
      }))))));
}

function SettingsPage({ embedded = false, onOpen }) {
  const { data, error, loading, reload } = useApi('settings', {}, { poll: 0 });
  if (!data && loading) return h(Loading, null);
  if (!data) return h('div', { className: 'hd-page' }, h(ErrorBox, { error, onRetry: reload }));
  const cmd = (data.config?.command || []).join(' ');
  const body = h('div', { className: 'hd-grid' },
    h(Card, { title: t('Connection'), sub: data.instance?.home || '' },
      h(KV, { rows: [
        ['Instance', data.instance?.label || '—'],
        ['Version', data.instance?.version || '—'],
        ['Auth', data.auth || '—'],
        ['Command', h('span', { className: 'hd-mono' }, cmd || '—')],
        ['Config', h('span', { className: 'hd-mono hd-tiny' }, data.config?.configPath || '—')],
        ['Refresh', `${data.config?.refreshMs || 0} ms`],
        ['Actions', data.config?.allowActions ? h(Pill, { tone: 'ok', dot: true }, 'enabled') : h(Pill, { tone: 'warn', dot: true }, 'read-only')],
      ] }),
      h('div', { style: { marginTop: 10 } }, h(CopyBtn, { text: `holon --home ${data.instance?.home || ''} status`, label: 'Copy status command' }))),
    h(Card, { title: 'Paths' }, h('div', { className: 'hd-list' }, Object.entries(data.paths || {}).map(([key, value]) => h('div', { key, className: 'hd-list-item' },
      h('span', { className: 'hd-dot hd-dot--' + (value.exists ? 'ok' : 'error') }),
      h('div', { className: 'hd-row-main' }, h('div', { className: 'hd-row-title' }, key), h('div', { className: 'hd-mono hd-tiny hd-muted' }, value.path)))))),
    h(Card, { title: t('Drivers'), sub: `${data.drivers?.length || 0} installed` }, h('div', { className: 'hd-list' }, (data.drivers || []).map((d) => h('div', { key: d.name, className: 'hd-list-item' },
      h('div', { className: 'hd-row-main' }, h('div', { className: 'hd-row-title' }, d.name), h('div', { className: 'hd-row-sub' }, h('span', null, (d.stages || []).join(', ') || 'no stages'))),
      h(Pill, { tone: 'brand' }, 'driver'))))),
    h(Card, { title: t('Backups'), sub: `${data.backups?.length || 0} recent` }, h('div', { className: 'hd-list' }, (data.backups || []).slice(0, 5).map((b) => h('div', { key: b.name, className: 'hd-list-item' },
      h('div', { className: 'hd-row-main' }, h('div', { className: 'hd-row-title' }, b.name), h('div', { className: 'hd-row-sub' }, h('span', null, fmtTime(b.mtime)), h('span', null, `${b.files} files`))))))),
    h(ErrorBox, { error, onRetry: reload }));
  if (embedded) return h('div', null,
    h('div', { className: 'hd-card-head' }, h('div', null, h('div', { className: 'hd-card-title' }, 'Holon Command Center'), h('div', { className: 'hd-card-sub' }, 'The organization runtime is connected. Open the full operating surface from the sidebar.')), h('div', { className: 'hd-card-actions' }, onOpen ? h(Btn, { size: 'sm', variant: 'primary', onClick: onOpen }, 'Open') : null)),
    h('div', { style: { padding: '0 14px 14px' } }, h('div', { className: 'hd-grid' }, h(Card, null, h(KV, { rows: [['Instance', data.instance?.label], ['Home', data.instance?.home], ['Auth', data.auth], ['Actions', data.config?.allowActions ? 'enabled' : 'read-only']] })), h(ErrorBox, { error, onRetry: reload }))));
  return h('div', { className: 'hd-page' },
    h(PageHead, { title: t('Settings'), sub: 'How this Harness profile reaches the Holon instance, and what it is allowed to do.', actions: h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh')) }),
    body);
}
