import { createApi } from './lib/api.js';

export const name = 'holon-dashboard';
export const inject = ['connection'];

export function apply(ctx, config) {
  const api = createApi(config, process.env, ctx.logger);
  ctx.effect(() => {
    let dispose = null;
    let closed = false;
    const ready = ctx.connection.fetch.register({
      path: '/api/holon-dashboard',
      methods: ['GET', 'POST'],
      requestBody: 'buffered',
      fetch: (request) => api.handle(request),
    });
    ready.then((value) => {
      if (closed) value();
      else dispose = value;
    }).catch((error) => {
      ctx.logger?.error?.('holon-dashboard: cannot register /api/holon-dashboard: ' + (error?.message || error));
    });
    if (api.config.home) {
      ctx.logger?.info?.('holon-dashboard: /api/holon-dashboard for ' + api.config.home);
    } else {
      ctx.logger?.warn?.('holon-dashboard: no Holon instance configured; the panel will explain how to connect one.');
    }
    return () => {
      closed = true;
      if (dispose) dispose();
    };
  }, 'holon-dashboard: authenticated API route');
}
