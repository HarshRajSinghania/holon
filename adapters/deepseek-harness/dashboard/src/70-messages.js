function MessageRow({ message, onOpen }) {
  const unacked = message.ack_required === 1 && !message.acked_at;
  return h('div', { className: 'hd-list-item hd-list-item--click', onClick: () => onOpen(message.id) },
    h('span', { className: 'hd-dot hd-dot--' + (unacked ? 'warn' : 'quiet') }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, message.sender_name || message.sender || '—'),
      h('div', { className: 'hd-row-sub', style: { display: 'block' } }, String(message.body || '').slice(0, 220)),
      h('div', { className: 'hd-row-sub' }, h('span', null, message.kind), h('span', null, message.to_ref), h('span', null, fmtAgo(message.ts)), unacked ? h('span', null, 'needs ack') : null)),
    h('span', { className: 'hd-muted hd-tiny hd-mono' }, shortId(message.id)));
}

function ComposeModal({ open, onClose, onAction }) {
  const [to, setTo] = React.useState('chair');
  const [kind, setKind] = React.useState('dm');
  const [body, setBody] = React.useState('');
  React.useEffect(() => { if (open) { setTo('chair'); setKind('dm'); setBody(''); } }, [open]);
  const send = () => onAction({
    title: 'Send message', action: 'msg.send', payload: { to, kind, body }, submit: t('Send'), after: onClose,
  });
  return h(Modal, { open, title: t('Compose'), sub: 'Chair authority: the message is recorded in the thread and the digest.', onClose,
    footer: h(React.Fragment, null, h(Btn, { onClick: onClose }, t('Cancel')), h(Btn, { variant: 'primary', icon: 'send', onClick: send, disabled: !body.trim() }, t('Send'))) },
    h('div', { className: 'hd-grid' },
      h(Field, { label: 'To (chair, org, emp:<id>, dept:<slug>)' }, h('input', { className: 'hd-input', value: to, onChange: (e) => setTo(e.target.value) })),
      h(Field, { label: 'Kind' }, h(Select, { value: kind, onChange: setKind, options: ['dm', 'channel', 'request', 'question', 'answer', 'proposal'] })),
      h(Field, { label: 'Message' }, h('textarea', { className: 'hd-textarea', value: body, onChange: (e) => setBody(e.target.value) }))));
}
function MessageItem({ m }) {
  return h('div', { className: 'hd-list-item' },
    h('span', { className: 'hd-dot hd-dot--' + (m.sender === 'chair' ? 'brand' : 'quiet') }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, `${m.sender_name || m.sender} · ${m.kind}`),
      h('div', { className: 'hd-prose', style: { marginTop: 3 } }, m.body),
      h('div', { className: 'hd-row-sub' },
        h('span', null, m.to_ref), h('span', null, fmtTime(m.ts)),
        m.ack_required ? h('span', null, m.acked_at ? 'acked' : 'unacked') : null)));
}

function MessageDrawer({ id, onClose, onAction }) {
  const { data, error, loading, reload } = useApi('thread', { id }, { poll: 15000 });
  const [body, setBody] = React.useState('');
  const root = data?.root;
  const messages = data?.messages || [];
  const reply = () => onAction({
    title: t('Reply'), action: 'msg.reply', payload: { message: id, body }, submit: t('Reply'),
    after: () => { setBody(''); reload(); },
  });
  return h(Drawer, { open: true, title: root ? (root.sender_name || root.sender || 'Thread') : 'Thread', sub: id, onClose },
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    messages.length ? h('div', { className: 'hd-list' }, messages.map((m) => h(MessageItem, { key: m.id, m }))) : h(Empty, null, t('No messages')),
    h(EntityCommands, { families: ['msg'], values: { message: id }, title: t('Commands'), onAction }),
    h('div', { style: { marginTop: 14 } },
      h(Field, { label: t('Reply') }, h('textarea', { className: 'hd-textarea', value: body, onChange: (e) => setBody(e.target.value) })),
      h(Btn, { variant: 'primary', icon: 'send', onClick: reply, disabled: !body.trim(), style: { marginTop: 8 } }, t('Reply'))));
}

function MessagesPage({ focus, onClearFocus, onAction }) {
  const [filter, setFilter] = React.useState('all');
  const [selected, setSelected] = React.useState(null);
  React.useEffect(() => { if (focus?.id) setSelected(focus.id); }, [focus?.id]);
  const [compose, setCompose] = React.useState(false);
  const { data, error, loading, reload } = useApi('messages', { filter, limit: 100 }, { poll: 15000 });
  const rows = data?.rows || [];
  const counts = data?.counts || {};
  return h('div', { className: 'hd-page' },
    h(PageHead, { title: t('Messages'), sub: 'The Chair\'s inbox and every thread the organization sent to it.', actions: h(React.Fragment, null,
      h(Btn, { icon: 'plus', size: 'sm', onClick: () => setCompose(true) }, t('Compose')),
      h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh'))) }),
    h('div', { className: 'hd-grid hd-stat-grid' },
      h(Stat, { label: 'Unread', value: counts.unacked || 0, hint: 'need an answer', tone: counts.unacked ? 'warn' : '', icon: 'message' }),
      h(Stat, { label: 'Incoming', value: counts.incoming || 0, hint: 'to the Chair', icon: 'arrow' }),
      h(Stat, { label: 'Sent', value: counts.sent || 0, hint: 'from the Chair', icon: 'send' }),
      h(Stat, { label: 'Threads', value: counts.total || 0, hint: 'all time', icon: 'layers' })),
    h('div', { className: 'hd-toolbar', style: { marginTop: 12 } },
      h(Seg, { items: [{ value: 'all', label: t('All') }, { value: 'unacked', label: t('Unread') }, { value: 'incoming', label: 'Incoming' }, { value: 'sent', label: 'Sent' }], value: filter, onChange: setFilter })),
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : h(Card, { flush: true }, rows.length ? h('div', { className: 'hd-list', style: { padding: '0 14px' } }, rows.map((m) => h(MessageRow, { key: m.id, message: m, onOpen: setSelected }))) : h(Empty, null, t('No messages'))),
    selected ? h(MessageDrawer, { id: selected, onClose: () => { setSelected(null); if (onClearFocus) onClearFocus(); }, onAction }) : null,
    h(ComposeModal, { open: compose, onClose: () => setCompose(false), onAction }));
}
