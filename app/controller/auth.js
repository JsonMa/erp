const uuid = require('uuid/v4');
const util = require('utility');

module.exports = (app) => {
  /**
   * Auth 相关路由
   *
   * @class AuthController
   * @extends {app.Controller}
   */
  class AuthController extends app.Controller {
    /**
     * login 的参数规则
     *
     * @readonly
     * @memberof AuthController
     */
    get rule() {
      return {
        properties: {
          role: {
            type: 'string',
            enum: ['admin', 'user'],
          },
          name: {
            type: 'string',
          },
          phone: {
            type: 'string',
          },
          password: {
            type: 'string',
          },
        },
        required: ['role', 'name', 'phone', 'password'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * login
     *
     * @memberof AuthController
     * @return {Object} user & token
     */
    async login() {
      const {
        name, role, phone, password,
      } = await this.ctx.validate(this.rule);
      let user = null;

      /* istanbul ignore next */
      if (role === 'admin') {
        [user] = await this.app.model.Admin.findOrCreate({
          where: {
            name,
          },
          defaults: {
            name,
            phone,
            password: util.md5(password),
            role_id: 1,
          },
        });
      } else {
        [user] = await this.app.model.User.findOrCreate({
          where: { name },
          defaults: {
            name,
            phone,
            password: util.md5(password),
          },
        });
      }

      const token = uuid();
      this.app.redis.set(`${app.config.auth.prefix}:${token}`, JSON.stringify({ role, id: user.id }));
      this.ctx.cookies.set('access_token', token);

      this.ctx.jsonBody = {
        user,
        token,
      };
    }
  }
  return AuthController;
};
