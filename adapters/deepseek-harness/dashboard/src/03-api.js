const API_BASE = '/api/holon-dashboard';
async function apiGet(resource, params = {}) {
  const url = new URL(API_BASE, location.origin);
  url.searchParams.set('resource', resource);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  const res = await fetch(url, { credentials: 'same-origin', headers: { accept: 'application/json' } });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok) throw new Error(data?.error?.message || `The dashboard API answered HTTP ${res.status}.`);
  return data;
}

/**
 * The write token.
 *
 * The Host mints it and hands it out over a GET; a page on another origin can ask for it but
 * cannot read the answer, so it cannot write. The token is fetched once and kept for the life of
 * the page — the Host's token lasts as long as the Host does.
 */
let writeNonce = '';
let nonceRequest = null;
async function sessionNonce() {
  if (writeNonce) return writeNonce;
  if (!nonceRequest) {
    nonceRequest = apiGet('session', {})
      .then((data) => { writeNonce = String(data?.nonce || ''); return writeNonce; })
      .catch(() => { nonceRequest = null; return ''; });
  }
  return nonceRequest;
}
async function apiPost(action, payload = {}) {
  const nonce = await sessionNonce();
  const res = await fetch(API_BASE, {
    method: 'POST', credentials: 'same-origin',
    headers: {
      'content-type': 'application/json', 'x-holon-dashboard': '1', accept: 'application/json',
      ...(nonce ? { 'x-holon-write': nonce } : {}),
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok || data?.ok === false) throw new Error(data?.error?.message || data?.message || `The action answered HTTP ${res.status}.`);
  return data;
}
function useApi(resource, params = {}, options = {}) {
  const [state, setState] = React.useState({ data: null, error: null, loading: true });
  const key = JSON.stringify(params || {});
  const alive = React.useRef(true);
  React.useEffect(() => () => { alive.current = false; }, []);
  const load = React.useCallback(async () => {
    try {
      const data = await apiGet(resource, JSON.parse(key));
      if (alive.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (alive.current) setState((prev) => ({ data: prev.data, error, loading: false }));
    }
  }, [resource, key]);
  React.useEffect(() => { setState((prev) => ({ ...prev, loading: true })); load(); }, [load]);
  React.useEffect(() => {
    if (!options.poll) return undefined;
    const id = setInterval(() => { if (document.visibilityState === 'visible') load(); }, options.poll);
    return () => clearInterval(id);
  }, [load, options.poll]);
  return { ...state, reload: load };
}

/**
 * One fetch per resource for the whole page.
 *
 * The page shell, the Overview tab and the composer dock all want the overview, and an overview
 * is eleven kernel child processes. Three independent polls meant three assemblies of it every
 * minute. The store keeps one request and one timer per key; every consumer subscribes.
 */
const sharedRequests = new Map();
function sharedEntry(key, resource, params) {
  let entry = sharedRequests.get(key);
  if (!entry) {
    entry = { resource, params, data: null, error: null, loading: true, inflight: null, subscribers: new Set() };
    sharedRequests.set(key, entry);
  }
  return entry;
}
function sharedLoad(entry) {
  if (entry.inflight) return entry.inflight;
  const settle = (data, error) => {
    entry.data = data;
    entry.error = error;
    entry.loading = false;
    entry.inflight = null;
    for (const notify of Array.from(entry.subscribers)) notify();
  };
  entry.inflight = apiGet(entry.resource, entry.params).then(
    (data) => settle(data, null),
    (error) => settle(entry.data, error),
  );
  return entry.inflight;
}
function useSharedApi(resource, params = {}, options = {}) {
  const key = resource + '|' + JSON.stringify(params || {});
  const [, bump] = React.useReducer((n) => n + 1, 0);
  const poll = options.poll || 0;
  React.useEffect(() => {
    const entry = sharedEntry(key, resource, JSON.parse(JSON.stringify(params || {})));
    const notify = () => bump();
    entry.subscribers.add(notify);
    sharedLoad(entry);
    const timer = poll
      ? setInterval(() => { if (document.visibilityState === 'visible') sharedLoad(entry); }, poll)
      : null;
    return () => {
      entry.subscribers.delete(notify);
      if (timer) clearInterval(timer);
    };
  }, [key, poll]);
  const entry = sharedEntry(key, resource, JSON.parse(JSON.stringify(params || {})));
  return {
    data: entry.data,
    error: entry.error,
    loading: entry.loading,
    reload: () => sharedLoad(entry),
  };
}

/**
 * The resource assembled itself from several kernel reads; one of them failed. Without this the
 * page shows a healthy-looking zero for what it could not read — the "empty means ungoverned"
 * failure this repository's own laws warn about.
 */
function degradationError(data) {
  if (!data || !data.degraded) return null;
  const failures = Array.isArray(data.failures) ? data.failures : [];
  const detail = failures.map((f) => (f && f.message) || String(f)).join(' · ');
  return new Error(
    'Part of this instance could not be read, so the numbers below are incomplete: ' + detail,
  );
}
function useNow(interval = 30000) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => { const id = setInterval(() => setNow(Date.now()), interval); return () => clearInterval(id); }, [interval]);
  return now;
}
function useDebounced(value, ms = 220) {
  const [out, setOut] = React.useState(value);
  React.useEffect(() => { const id = setTimeout(() => setOut(value), ms); return () => clearTimeout(id); }, [value, ms]);
  return out;
}
