/**
 * The console: every command the kernel offers, as a form.
 *
 * The dashboard used to be a status surface with nineteen hand-written buttons while the kernel
 * registered 130 commands. This page replaces that twin with the kernel's own catalogue: pick a
 * command, fill the arguments its manifest declares, run it, read the answer.
 *
 * Nothing here decides what is safe — the manifest does (a `path` or a `shell` argument is not
 * offered, and the Host refuses one that arrives). This page only renders.
 *
 * The same catalogue is what binds a command to the OBJECT it acts on: a command whose first
 * positional is the identifier of a work item, an employee, a department, a skill, a memory item
 * or a message is an action ON that object, and the object therefore offers it. The list of
 * actions is derived, so a command added to the kernel appears on the objects it belongs to
 * without a line of client code.
 */

/**
 * A field the Chair writes a paragraph into, so it gets a textarea rather than a single line.
 *
 * The kernel already marks the prose it resolves as a file or stdin (`text`), and that is most of
 * the set; the rest is the short tail of prose the kernel does not resolve.
 */
const PROSE_ARGS = ['note', 'reason', 'description', 'body', 'text', 'content'];

/**
 * The commands that act on one object.
 *
 * The Host already worked out which commands of which family act on which identifier; the browser
 * only looks it up, so a command the kernel adds reaches this object without a line of client
 * code, and a command the kernel takes away disappears with it.
 */
function entityCommands(catalogue, families, values) {
  const names = Object.keys(values || {});
  const found = [];
  for (const family of families || []) {
    const byName = catalogue?.entities?.[family] || {};
    for (const name of names) {
      for (const command of byName[name] || []) if (!found.includes(command)) found.push(command);
    }
  }
  return found;
}

/** The command that shows one object in depth: the family's own read of that object. */
function previewCommand(catalogue, families, values) {
  const names = Object.keys(values || {});
  for (const family of families || []) {
    const byName = catalogue?.previews?.[family] || {};
    for (const name of names) {
      const preview = byName[name];
      if (preview) return preview;
    }
  }
  return null;
}

function CommandArg({ arg, value, onChange }) {
  const label = arg.flag || arg.name;
  const help = arg.help || '';
  if (arg.fenced) {
    // The manifest says this argument names a file or a command line. The browser is not
    // offered it; the form says so rather than pretending the command does not need it.
    return h('div', { key: arg.name },
      h('div', { className: 'hd-muted hd-tiny' }, `${label} — ${arg.fenced === 'path' ? 'names a file: the console does not offer it' : 'is a command line: the console does not offer it'}`));
  }
  if (arg.kind === 'boolean') {
    return h('label', { key: arg.name, className: 'hd-inline', style: { fontSize: 11.5, cursor: 'pointer' } },
      h('input', { type: 'checkbox', checked: Boolean(value), onChange: (e) => onChange(e.target.checked) }),
      h('span', null, label));
  }
  const field = h(Field, { label: label + (arg.required ? ' *' : ''), key: arg.name },
    arg.choices
      ? h(Select, { value: value || '', onChange, options: ['', ...arg.choices] })
      : (arg.text || PROSE_ARGS.includes(arg.name))
        ? h('textarea', { className: 'hd-textarea', rows: 3, value: value || '', onChange: (e) => onChange(e.target.value) })
        : h('input', {
          className: 'hd-input', value: value ?? '',
          type: arg.kind === 'integer' || arg.kind === 'number' ? 'number' : 'text',
          onChange: (e) => onChange(e.target.value),
        }));
  return h('div', { key: arg.name },
    field,
    help ? h('div', { className: 'hd-muted hd-tiny', style: { marginTop: 2 } }, help) : null);
}

function CommandForm({ command, prefill, onRun, busy, error, result }) {
  const [values, setValues] = React.useState({});
  const [confirm, setConfirm] = React.useState('');
  const [more, setMore] = React.useState(false);
  const args = command?.args || [];
  const fillable = args.filter((arg) => !arg.fenced);
  const primary = fillable.filter((arg) => arg.required || (arg.default !== null && arg.default !== undefined));
  const secondary = fillable.filter((arg) => !primary.includes(arg));
  React.useEffect(() => {
    const initial = {};
    for (const arg of fillable) {
      if (prefill && prefill[arg.name] !== undefined && prefill[arg.name] !== null) {
        initial[arg.name] = prefill[arg.name];
        continue;
      }
      if (arg.default !== null && arg.default !== undefined) {
        initial[arg.name] = arg.kind === 'boolean' ? Boolean(arg.default) : arg.default;
      }
    }
    setValues(initial); setConfirm(''); setMore(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command?.command, JSON.stringify(prefill || {})]);
  if (!command) return null;
  const set = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
  const write = command.mutates;
  const submit = () => onRun(command.command, values, write ? confirm : '');
  return h('div', { className: 'hd-grid' },
    h(Card, { title: command.command, sub: command.help },
      h('div', { className: 'hd-inline', style: { marginBottom: 8 } },
        h(Pill, { tone: command.mutates ? 'warn' : 'quiet' }, command.mutates ? 'writes' : 'reads'),
        h(Pill, { tone: 'quiet' }, command.actor)),
      primary.length
        ? h('div', { className: 'hd-grid' }, primary.map((arg) => h(CommandArg, {
          key: arg.name, arg, value: values[arg.name], onChange: (v) => set(arg.name, v),
        })))
        : h(Empty, null, 'This command takes no arguments.'),
      secondary.length
        ? h('div', { style: { marginTop: 8 } },
          h('button', { type: 'button', className: 'hd-btn hd-btn--ghost hd-btn--sm', onClick: () => setMore(!more) },
            more ? 'Fewer options' : `More options (${secondary.length})`),
          more ? h('div', { className: 'hd-grid', style: { marginTop: 8 } }, secondary.map((arg) => h(CommandArg, {
            key: arg.name, arg, value: values[arg.name], onChange: (v) => set(arg.name, v),
          }))) : null)
        : null,
      args.some((arg) => arg.fenced)
        ? h('div', { className: 'hd-muted hd-tiny', style: { marginTop: 8 } },
          'This command also takes an argument the console does not offer; run it from the CLI.')
        : null,
      write
        ? h('div', { style: { marginTop: 10 } },
          h(Field, { label: `Type ${command.command} to confirm` },
            h('input', { className: 'hd-input', value: confirm, onChange: (e) => setConfirm(e.target.value) })))
        : null,
      h('div', { className: 'hd-actions', style: { marginTop: 10 } },
        h(Btn, { variant: 'primary', icon: 'play', disabled: busy || (write && confirm !== command.command), onClick: submit },
          busy ? t('Working…') : t('Run')),
        write ? h('span', { className: 'hd-muted hd-tiny' }, t('This command writes to the instance.')) : null)),
    h(Card, { title: t('Result') },
      h(ErrorBox, { error }),
      result ? h(CommandResult, { result }) : h(Empty, null, t('Nothing has run yet.'))));
}

/** What a command answered: prose when it answered in prose, the shape otherwise. */
function CommandResult({ result }) {
  if (result === null || result === undefined) return h(Empty, null, t('No result'));
  if (typeof result === 'string') return h(Pre, { text: result, maxHeight: 420 });
  if (typeof result !== 'object') return h(Pre, { text: JSON.stringify(result, null, 2), maxHeight: 420 });
  const prose = result.markdown || result.text || result.protocol || '';
  const rest = Object.entries(result).filter(([key]) => !['markdown', 'text', 'protocol'].includes(key));
  return h('div', null,
    rest.length
      ? h(KV, { rows: rest.slice(0, 12).map(([key, value]) => [
        key, typeof value === 'object' ? JSON.stringify(value).slice(0, 240) : String(value ?? '—'),
      ]) })
      : null,
    prose ? h(Prose, { text: prose, limit: 4000 }) : null);
}

/**
 * The commands that act on one object.
 *
 * The list is the kernel's own catalogue filtered by the object's family and identifier, so a
 * command the kernel adds appears here without a line of client code, and a command the kernel
 * takes away disappears with it.
 */
function EntityCommands({ families, values, title, onAction, after }) {
  const { data } = useSharedApi('commands', {}, { poll: 0 });
  const rows = data?.commands || [];
  // The catalogue's entity map holds command NAMES; the row is what carries the label, the
  // fence, and whether the command writes.
  const commands = entityCommands(data, families, values)
    .map((name) => rows.find((row) => row.command === name))
    .filter(Boolean);
  if (!commands.length) return null;
  return h(Card, { title: title || t('Commands'), sub: `${commands.length} the kernel offers for this` },
    h('div', { className: 'hd-inline' }, commands.map((command) => h(Btn, {
      key: command.command, size: 'sm', variant: command.mutates ? 'default' : 'ghost',
      title: command.help || command.command,
      onClick: () => onAction({
        command: command.command, prefill: values, after,
        title: `${command.command} · ${title || ''}`.trim(),
      }),
    }, command.command))));
}

/**
 * One object, in depth: what it is, what the kernel says about it, and what may be done to it.
 *
 * The preview is the object's own read command, run when the drawer opens — the deep view is
 * the kernel's answer, not the dashboard's summary of it.
 */
function EntityDrawer({ title, sub, families, values, facts, onClose, onAction, children }) {
  const { data } = useSharedApi('commands', {}, { poll: 0 });
  const commands = data?.commands || [];
  const preview = previewCommand(data, families, values);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const key = JSON.stringify(values || {});
  const load = React.useCallback(async () => {
    if (!preview) return;
    setBusy(true); setError(null);
    try {
      // Only the arguments this command declares: the Host refuses an argument a command does
      // not have, and an object's values may name more than this one command takes.
      const row = commands.find((c) => c.command === preview);
      const args = {};
      for (const arg of row?.args || []) {
        if (values[arg.name] !== undefined && values[arg.name] !== null) args[arg.name] = values[arg.name];
      }
      const out = await apiPost('command.run', { command: preview, args });
      setResult(out?.result ?? null);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, key]);
  React.useEffect(() => { load(); }, [load]);
  return h(Drawer, { open: true, title, sub, onClose },
    h(ErrorBox, { error }),
    facts ? h(Card, null, h(KV, { rows: facts })) : null,
    children,
    h(Card, { title: t('Preview'), sub: preview || null },
      busy && result === null ? h(Loading) : null,
      error ? null : (result ? h(CommandResult, { result }) : (preview ? h(Empty, null, t('No answer')) : h(Empty, null, t('This object has no read command.'))))),
    h(EntityCommands, { families, values, title, onAction, after: load }));
}

function ConsolePage() {
  const { data, error, loading, reload } = useSharedApi('commands', {}, { poll: 0 });
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [runError, setRunError] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const commands = data?.commands || [];
  const q = query.trim().toLowerCase();
  const shown = q
    ? commands.filter((c) => (c.command + ' ' + (c.help || '')).toLowerCase().includes(q))
    : commands;
  const groups = {};
  for (const command of shown) {
    const family = command.command.split(' ')[0];
    groups[family] = groups[family] || [];
    groups[family].push(command);
  }
  const current = selected ? commands.find((c) => c.command === selected) || selected : null;
  const run = async (name, values, confirm) => {
    setBusy(true); setRunError(null); setResult(null);
    try {
      const out = await apiPost('command.run', { command: name, args: values, confirm });
      setResult(out?.result ?? null);
    } catch (e) {
      setRunError(e);
    } finally {
      setBusy(false);
    }
  };
  return h('div', { className: 'hd-page' },
    h(PageHead, {
      title: t('Console'),
      sub: t('Every command the kernel offers, with the arguments it declares. The kernel decides which may be filled from a browser; this page only renders.'),
      actions: h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh')),
    }),
    h('div', { className: 'hd-toolbar' },
      h(SearchBox, { value: query, onChange: setQuery, placeholder: t('Search commands…') }),
      h('span', { className: 'hd-muted hd-tiny' }, `${shown.length} of ${commands.length}`)),
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    h('div', { className: 'hd-split hd-split--console' },
      h('div', { className: 'hd-list', style: { maxHeight: 520, overflowY: 'auto' } },
        Object.keys(groups).sort().map((family) => h('div', { key: family },
          h('div', { className: 'hd-card-sub', style: { padding: '8px 10px 2px' } }, family),
          groups[family].map((command) => h('div', {
            key: command.command, role: 'button', tabIndex: 0,
            className: 'hd-list-item hd-list-item--click' + (current?.command === command.command ? ' hd-list-item--active' : ''),
            onClick: () => { setSelected(command); setResult(null); setRunError(null); },
            onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(command); } },
          },
            h('div', { className: 'hd-row-main' },
              h('div', { className: 'hd-row-title' }, command.command),
              h('div', { className: 'hd-row-sub' }, command.help || '')),
            h(Pill, { tone: command.mutates ? 'warn' : 'quiet' }, command.mutates ? 'write' : 'read')))))),
      h('div', { style: { minWidth: 0 } },
        current
          ? h(CommandForm, { command: current, onRun: run, busy, error: runError, result })
          : h(Card, null, h(Empty, null, t('Pick a command on the left.'))))));
}
