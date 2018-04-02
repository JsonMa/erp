const Raven = require('raven');
/* istanbul ignore next */
/**
 * 初始化Sentry
 *
 * @param {Application} app Application
 * @return {Raven} raven client
 */
function initSentry(app) {
  const options = Object.assign({}, app.config.sentry);

  /* istanbul ignore else */
  if (!options.enable) {
    return null;
  }

  Raven.config(options.dsn).install();
  app.on('error', ((e, ctx) => {
    if (e.status && e.status < 500) {
      return;
    }

    const auth = ctx.state.auth || {};
    const { user = 'anonym', role = 'user' } = auth;

    Raven.setContext({
      user,
      extra: {
        request: ctx.request,
        payload: Object.assign({}, ctx.params, ctx.query, ctx.request.body),
      },
    });
    Raven.captureException(e, {
      tags: {
        url: ctx.request.url,
        role,
      },
    });
  }));

  return Raven;
}

module.exports = (app) => {
  initSentry(app);
};
