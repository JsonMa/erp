const TOKEN = 'access_token';
const ADMIN = 'admin';
const SESSION_RULE = {
  properties: {
    role: {
      enum: ['admin', 'user'],
    },
    id: { type: 'integer' },
  },
  required: ['role', 'id'],
  additionalProperties: false,
};

/* istanbul ignore next */
module.exports = option => function* (next) {
  const token = this.headers[TOKEN] || this.cookies.get(TOKEN, { signed: false });

  const ret = yield this.app.redis.get(`${option.prefix}:${token}`);
  if (!ret) {
    this.state.auth = Object.assign({}, this.state.auth);
    yield next;
    return;
  }

  let session = null;
  try {
    session = JSON.parse(ret);
    this.assert(this.helper.ajv.validate(SESSION_RULE, session || {}));
  } catch (e) {
    yield this.app.redis.set(`${option.prefix}:${token}`, null);
    this.cookies.set(TOKEN, null);
    this.error('Session已失效, 请重新登录', 10001);
  }

  const model = session.role === ADMIN ? this.app.model.Admin : this.app.model.User;
  const user = yield model.findById(session.id);

  this.assert(user, 401, 'Session已失效，请重新登录');
  this.state.auth = Object.assign({}, this.state.auth, {
    token,
    role: session.role,
    user: user.toJSON(),
  });

  yield next;
};
