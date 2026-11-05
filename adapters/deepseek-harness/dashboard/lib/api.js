import { randomBytes } from 'node:crypto';
import { Holon, HolonError, normalizeConfig } from './holon.js';
import { pickId } from './query.js';
import { Resources } from './resources.js';
import { runAction } from './actions.js';

const HEADERS = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
};

/** A status the browser will accept: the error's own code, or 500. Never a child's exit code. */
function httpStatus(error) {
  const code = error?.status;
  if (Number.isInteger(code) && code >= 400 && code <= 599) return code;
  return 500;
}

/**
 * The browser gets a short, stable reason; the Host log gets the whole one.
 *
 * The full message carries the child's stderr, the instance paths and the command line. That is
 * what an operator needs in a log and what a page does not need: the Chair sees what went wrong,
 * not where the instance lives or what the kernel printed on the way out.
 */
function failure(error, logger = null) {
  const detail = error?.message || String(error);
  const code = error?.code || 'error';
  if (logger) {
    logger.warn?.('holon-dashboard: ' + code + ': ' + detail);
  }
  const body = {
    error: {
      code,
      message: code === 'command_failed'
        ? 'the kernel refused or failed that command (the Host log has the detail)'
        : detail,
      ...(Number.isInteger(error?.exitCode) ? { exitCode: error.exitCode } : {}),
    },
  };
  return Response.json(body, { status: httpStatus(error), headers: HEADERS });
}

export function createApi(rawConfig, env = process.env, logger = null) {
  const config = normalizeConfig(rawConfig, env);
  const holon = new Holon(config, env);
  const resources = new Resources(holon, config);
  /**
   * The write token.
   *
   * The dashboard's write route was guarded by a static header every page in the browser could
   * send, so any page the Chair opened could file work, hire, fire, cancel and retire in the
   * organization. The token is minted here, handed out by a GET (which the browser may read and
   * a page on another origin may not), and required on every POST — so a cross-origin form post
   * cannot write, because it cannot read the token.
   */
  const writeNonce = randomBytes(24).toString('hex');

  async function read(resource, params) {
    switch (resource) {
      case 'overview': return resources.overview();
      case 'work': return resources.work(params);
      case 'workItem': return resources.workItem(pickId(params, 'id'));
      case 'planItem': return resources.planItem(pickId(params, 'id'));
      case 'org': return resources.org();
      case 'employee': return resources.employee(pickId(params, 'id'));
      case 'runs': return resources.runs(params);
      case 'runItem': return resources.runItem(pickId(params, 'id'));
      case 'events': return resources.events(params);
      case 'doctor': return resources.doctorPage();
      case 'knowledge': return resources.knowledge(params);
      case 'messages': return resources.messages(params);
      case 'thread': return resources.thread(pickId(params, 'id'));
      case 'ops': return resources.ops();
      case 'law': return resources.law(params.id);
      case 'settings': return resources.settings();
      case 'backups': return resources.backups();
      case 'commands': return resources.commands();
      case 'config': return resources.instanceConfig();
      case 'session': return { nonce: writeNonce, generatedAt: new Date().toISOString() };
      default: throw new HolonError(`unknown resource ${resource}`, { code: 'unknown_resource', status: 404 });
    }
  }

  return {
    config,
    holon,
    resources,
    async handle(request) {
      try {
        if (request.method === 'POST') {
          if (request.headers.get('x-holon-dashboard') !== '1') {
            return Response.json({ error: { code: 'invalid_request', message: 'missing dashboard header' } }, { status: 400, headers: HEADERS });
          }
          // The static header says "this is the dashboard"; the token says "this page read the
          // token". A page on another origin can send the header and cannot read the token, so
          // it cannot write.
          if (request.headers.get('x-holon-write') !== writeNonce) {
            return Response.json({ error: { code: 'write_nonce_required', message: 'this write did not carry the session token' } }, { status: 403, headers: HEADERS });
          }
          const length = Number(request.headers.get('content-length') || 0);
          if (length > 1024 * 1024) {
            return Response.json({ error: { code: 'invalid_request', message: 'request body is too large' } }, { status: 413, headers: HEADERS });
          }
          let payload;
          try { payload = await request.json(); }
          catch { return Response.json({ error: { code: 'invalid_request', message: 'body must be JSON' } }, { status: 400, headers: HEADERS }); }
          if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            return Response.json({ error: { code: 'invalid_request', message: 'body must be a JSON object' } }, { status: 400, headers: HEADERS });
          }
          const name = typeof payload.action === 'string' ? payload.action : '';
          if (!name) return Response.json({ error: { code: 'invalid_request', message: 'action is required' } }, { status: 400, headers: HEADERS });
          let result;
          try {
            result = await runAction(holon, config, name, payload);
          } finally {
            // An action can write and then fail (a tick that fires schedules and then trips).
            // The cache is cleared either way, so no read keeps serving the state before it.
            resources.cache.clear();
          }
          return Response.json({ ok: true, ...result, at: new Date().toISOString() }, { headers: HEADERS });
        }
        if (request.method !== 'GET') {
          return Response.json({ error: { code: 'method_not_allowed', message: 'GET or POST only' } }, { status: 405, headers: HEADERS });
        }
        const url = new URL(request.url);
        const resource = url.searchParams.get('resource') || 'overview';
        const params = Object.fromEntries(url.searchParams.entries());
        const payload = await read(resource, params);
        // A resource assembles itself from several kernel reads; one of them failing must not be
        // read as "the organization is empty". The failures travel with the payload, and the page
        // says the dashboard is DEGRADED rather than showing a healthy-looking zero.
        const failures = payload && typeof payload === 'object' && !Array.isArray(payload)
          && Array.isArray(payload.warnings) ? payload.warnings : [];
        const body = payload && typeof payload === 'object' && !Array.isArray(payload)
          ? { ...payload, degraded: failures.length > 0, failures }
          : payload;
        return Response.json(body, { headers: HEADERS });
      } catch (error) {
        return failure(error, logger);
      }
    },
  };
}
