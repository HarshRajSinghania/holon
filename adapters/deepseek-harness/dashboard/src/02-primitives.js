const STAGES = ['research', 'shape', 'plan', 'approve', 'execute', 'verify', 'retro'];
const ICONS = {
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM16 16l4 4',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12l4.5 4.5L19 7',
  x: 'M7 7l10 10M17 7L7 17',
  play: 'M8 5l11 7-11 7V5Z',
  pause: 'M9 5v14M15 5v14',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  chevron: 'M9 6l6 6-6 6',
  external: 'M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5',
  alert: 'M12 3l9 16H3L12 3ZM12 9v5M12 17h.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01',
  users: 'M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-2a4 4 0 0 0-3-3.9M16 3.2a3.5 3.5 0 0 1 0 6.6',
  activity: 'M3 12h4l2.5-7 4 14 2.5-7H21',
  brain: 'M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 3 3M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v1a3 3 0 0 1-3 3M9 4v16M15 4v16',
  shield: 'M12 3l7 3v5c0 4.5-2.8 7.9-7 10-4.2-2.1-7-5.5-7-10V6l7-3Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  terminal: 'M4 5h16v14H4V5ZM7 9l3 3-3 3M13 15h4',
  message: 'M21 12a8 8 0 0 1-8 8H5l2-3a8 8 0 1 1 14-5Z',
  send: 'M21 3L10 14M21 3l-7 18-4-7-7-4 18-7Z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
  database: 'M12 8c4.4 0 8-1.1 8-2.5S16.4 3 12 3 4 4.1 4 5.5 7.6 8 12 8ZM4 5.5v13C4 19.9 7.6 21 12 21s8-1.1 8-2.5v-13M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5',
  layers: 'M12 3l9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z',
  git: 'M6 3v12a3 3 0 0 0 3 3h6M6 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  filter: 'M3 5h18M7 12h10M10 19h4',
  grid: 'M4 4h7v7H4V4ZM13 4h7v7h-7V4ZM4 13h7v7H4v-7ZM13 13h7v7h-7v-7Z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  plus: 'M12 5v14M5 12h14',
  copy: 'M8 8h11v11H8V8ZM5 16H4V4h11v1',
};
function Icon({ name, size = 14 }) {
  const path = ICONS[name] || ICONS.info;
  return h('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
    style: { display: 'block', flex: 'none' },
  }, h('path', { d: path }));
}
const STAGE_TONE = { ready: 'brand', claimed: 'warn', done: 'ok', failed: 'error', cancelled: 'quiet' };
const TASK_TONE = { open: 'brand', waiting: 'quiet', blocked: 'warn', needs_input: 'warn', done: 'ok', failed: 'error', cancelled: 'quiet' };
function toneFor(value) { return STAGE_TONE[value] || TASK_TONE[value] || 'quiet'; }
function shortId(id, size = 8) { return typeof id === 'string' && id.length > size + 4 ? id.slice(0, size) + '…' : id || '—'; }
function initials(name) { return String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join('') || '?'; }
function fmtTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtAgo(value) {
  if (!value) return '—';
  const s = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (s < 60) return s + 's';
  if (s < 3600) return Math.round(s / 60) + 'm';
  if (s < 86400) return Math.round(s / 3600) + 'h';
  return Math.round(s / 86400) + 'd';
}
function fmtDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return '—';
  const n = Math.round(Number(seconds));
  if (n < 60) return n + 's';
  if (n < 3600) return Math.round(n / 60) + 'm';
  return (n / 3600).toFixed(1) + 'h';
}
function fmtTokens(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
}
function Btn({ children, icon, variant = 'default', size = 'md', onClick, disabled, title, type = 'button', ariaLabel }) {
  const cls = ['hd-btn', variant !== 'default' ? 'hd-btn--' + variant : '', size === 'sm' ? 'hd-btn--sm' : '', !children ? 'hd-btn--icon' : ''].filter(Boolean).join(' ');
  // The icon is aria-hidden, so a button that carries only an icon needs its name stated: the
  // tooltip is not an accessible name a screen reader can rely on.
  const text = typeof children === 'string' ? children : null;
  const name = ariaLabel || text || title || undefined;
  return h('button', {
    type, className: cls, onClick, disabled,
    title: title || text || undefined,
    ...(name && !text ? { 'aria-label': name } : {}),
  },
    icon ? h(Icon, { name: icon, size: size === 'sm' ? 12 : 13 }) : null, children || null);
}
function Pill({ tone = 'quiet', children, dot = false }) {
  return h('span', { className: 'hd-pill hd-pill--' + tone }, dot ? h('span', { className: 'hd-dot hd-dot--' + tone }) : null, children);
}
function Card({ title, sub, actions, children, flush = false, className = '', style }) {
  return h('section', { className: 'hd-card ' + className, style },
    title || actions ? h('div', { className: 'hd-card-head' },
      h('div', { style: { minWidth: 0 } }, title ? h('div', { className: 'hd-card-title' }, title) : null, sub ? h('div', { className: 'hd-card-sub' }, sub) : null),
      actions ? h('div', { className: 'hd-card-actions' }, actions) : null) : null,
    h('div', { className: 'hd-card-body' + (flush ? ' hd-card-body--flush' : '') }, children));
}
function Stat({ label, value, hint, tone = '', icon, onClick }) {
  return h('div', { className: 'hd-card hd-stat ' + (tone ? 'hd-stat--' + tone : ''), onClick, style: onClick ? { cursor: 'pointer' } : undefined },
    h('div', { className: 'hd-stat-label' }, icon ? h(Icon, { name: icon, size: 11 }) : null, label),
    h('div', { className: 'hd-stat-value' }, value),
    hint ? h('div', { className: 'hd-stat-hint' }, hint) : null);
}
function Empty({ children }) { return h('div', { className: 'hd-empty' }, children || t('No data')); }
function Loading({ children }) { return h('div', { className: 'hd-loading', role: 'status', 'aria-live': 'polite' }, children || t('Loading')); }
function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return h('div', { className: 'hd-error', role: 'alert' }, h('div', { className: 'hd-inline', style: { justifyContent: 'space-between' } },
    h('span', null, error.message || String(error)), onRetry ? h('button', { className: 'hd-btn hd-btn--sm', onClick: onRetry }, t('Retry')) : null));
}
function KV({ rows }) {
  return h('div', { className: 'hd-kv' }, rows.filter(Boolean).map(([k, v], i) => h(React.Fragment, { key: i },
    h('div', { className: 'hd-kv-key' }, k), h('div', { className: 'hd-kv-val' }, v))));
}
function Prose({ text, limit }) {
  const [open, setOpen] = React.useState(false);
  const full = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
  const long = limit && full.length > limit;
  return h('div', null,
    h('div', { className: 'hd-prose' }, long && !open ? full.slice(0, limit) + '…' : full),
    long ? h('button', { className: 'hd-btn hd-btn--ghost hd-btn--sm', style: { marginTop: 6 }, onClick: () => setOpen(!open) }, open ? t('Show less') : t('Show full')) : null);
}
function Pre({ text, maxHeight }) {
  return h('pre', { className: 'hd-pre', style: maxHeight ? { maxHeight } : undefined }, typeof text === 'string' ? text : JSON.stringify(text, null, 2));
}
function CopyBtn({ text, label }) {
  const [done, setDone] = React.useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(String(text)); setDone(true); setTimeout(() => setDone(false), 1200); } catch { /* ignore */ }
  };
  return h('button', { className: 'hd-btn hd-btn--ghost hd-btn--sm', onClick: copy, title: t('Copy') }, h(Icon, { name: 'copy', size: 11 }), done ? t('Copied') : (label || t('Copy')));
}
function Field({ label, children, style }) {
  return h('label', { className: 'hd-field', style },
    label ? h('span', { className: 'hd-field-label' }, label) : null, children);
}
function SearchBox({ value, onChange, placeholder, onEnter }) {
  return h('div', { className: 'hd-search' },
    h('span', { className: 'hd-search-icon' }, h(Icon, { name: 'search', size: 13 })),
    h('input', {
      className: 'hd-input', value: value || '', placeholder: placeholder || t('Search'),
      'aria-label': placeholder || t('Search'),
      onChange: (e) => onChange(e.target.value),
      onKeyDown: (e) => { if (e.key === 'Enter' && onEnter) onEnter(); },
    }));
}
function Select({ value, onChange, options, placeholder }) {
  return h('select', { className: 'hd-select', value: value || '', onChange: (e) => onChange(e.target.value) },
    placeholder ? h('option', { value: '' }, placeholder) : null,
    (options || []).map((opt) => {
      const value = typeof opt === 'string' ? opt : opt.value;
      const label = typeof opt === 'string' ? opt : opt.label;
      return h('option', { key: value, value }, label);
    }));
}
function Chip({ active, onClick, children }) {
  return h('button', { className: 'hd-chip' + (active ? ' hd-chip--active' : ''), onClick, type: 'button' }, children);
}
function Tabs({ items, value, onChange }) {
  return h('div', { className: 'hd-tabs', role: 'tablist', style: { padding: '0 0 0', borderBottom: 'none', marginBottom: 10 } },
    items.map((item) => h('button', {
      key: item.value, className: 'hd-tab' + (item.value === value ? ' hd-tab--active' : ''),
      onClick: () => onChange(item.value), type: 'button',
      role: 'tab', 'aria-selected': item.value === value,
    }, item.label, item.count !== undefined && item.count !== null ? h('span', { className: 'hd-tab-count' }, item.count) : null)));
}
function Seg({ items, value, onChange }) {
  return h('div', { className: 'hd-inline', style: { gap: 2, padding: 2, borderRadius: 8, background: 'var(--dsw-alias-bg-layer-2)' } },
    items.map((item) => h('button', {
      key: item.value, type: 'button',
      className: 'hd-btn hd-btn--sm ' + (item.value === value ? 'hd-btn--primary' : 'hd-btn--ghost'),
      onClick: () => onChange(item.value),
    }, item.label)));
}
/**
 * A dialog that keeps the keyboard: focus moves into it, Tab stays inside it, and the focus that
 * opened it comes back when it closes. Without this a keyboard user tabs straight out of the
 * dialog into the page behind it and never hears where they are.
 */
function useDialogFocus(open, onClose) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const node = ref.current;
    const items = () => Array.from(
      (node && node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')) || [],
    ).filter((el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true');
    const first = items()[0];
    (first || node)?.focus?.();
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const list = items();
      if (!list.length) return;
      const head = list[0];
      const tail = list[list.length - 1];
      if (e.shiftKey && document.activeElement === head) { e.preventDefault(); tail.focus(); }
      else if (!e.shiftKey && document.activeElement === tail) { e.preventDefault(); head.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previous && typeof previous.focus === 'function') previous.focus();
    };
  }, [open, onClose]);
  return ref;
}

function Modal({ open, title, sub, onClose, children, footer, width }) {
  const focusRef = useDialogFocus(open, onClose);
  if (!open) return null;
  return h('div', { className: 'hd-modal-backdrop', onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); } },
    h('div', { className: 'hd-modal', ref: focusRef, tabIndex: -1, style: width ? { width } : undefined, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { className: 'hd-modal-head' },
        h('div', { className: 'hd-card-title', style: { fontSize: 14 } }, title),
        sub ? h('div', { className: 'hd-card-sub', style: { marginTop: 4 } }, sub) : null),
      h('div', { className: 'hd-modal-body' }, children),
      footer ? h('div', { className: 'hd-modal-foot' }, footer) : null));
}
function Drawer({ open, title, sub, onClose, children, footer }) {
  const focusRef = useDialogFocus(open, onClose);
  if (!open) return null;
  return h('div', { className: 'hd-drawer-backdrop', onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); } },
    h('aside', { className: 'hd-drawer', ref: focusRef, tabIndex: -1, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { className: 'hd-drawer-head' },
        h('div', { style: { minWidth: 0, flex: 1 } },
          h('div', { className: 'hd-card-title', style: { fontSize: 14 } }, title),
          sub ? h('div', { className: 'hd-card-sub', style: { marginTop: 3 } }, sub) : null),
        h(Btn, { icon: 'close', variant: 'ghost', size: 'sm', onClick: onClose, title: t('Close') })),
      h('div', { className: 'hd-drawer-body' }, children),
      footer ? h('div', { className: 'hd-drawer-foot' }, footer) : null));
}
// __PRIM_MORE__

