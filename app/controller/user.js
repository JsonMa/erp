const _ = require('lodash');

module.exports = (app) => {
  /**
   * User 相关路由
   *
   * @class UserController
   * @extends {app.Controller}
   */
  class UserController extends app.Controller {
    /**
   * 获取 user orders 的参数规则
   *
   * @readonly
   * @memberof UserController
   */
    get ordersRule() {
      return {
        properties: {
          status: {
            type: 'string',
            enum: Object.keys(app.model.Order.STATUS)
              .map(s => String.prototype.toLowerCase.apply(s)),
          },
          _id: {
            type: 'string',
          },
          embed: {
            type: 'array',
            items: {
              type: 'string', enum: ['user', 'commodity', 'trade', ''],
            },
          },
          ...this.ctx.helper.rule.pagination,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * fetch user orders
     *
     * @memberof UserController
     * @return {[User]} Users
     */
    async orders() {
      const {
        status, _id, count, start, embed, sort,
      } = await this.ctx.validate(
        this.ordersRule,
        this.ctx.helper.preprocessor.pagination,
        /* istanbul ignore next */
        param => Object.assign(param, { embed: (param.embed || '').split(',') }),
      );

      await this.ctx.userPermission(_id);

      /* istanbul ignore next */
      const query = status ? { status: status.toUpperCase() } : {};
      const { count: total, rows: items } = await this.app.model.Order.findAndCountAll({
        where: {
          ...query,
          user_id: _id,
        },
        limit: count,
        offset: start,
        /* istanbul ignore next */
        order: [['updated_at', sort === 'true' ? 'DESC' : 'ASC']],
      });

      // embed users
      let users = null;
      let commodities = null;
      let trades = null;
      /* istanbul ignore next */
      if (embed.indexOf('user') >= 0) {
        users = await this.service.user.findByIds(items.map(o => o.user_id));
      }
      /* istanbul ignore next */
      if (embed.indexOf('commodity') >= 0) {
        commodities = await this.app.model.Commodity.findAll({
          where: { id: { $in: items.map(o => o.commodity_id) } },
        });
      }
      /* istanbul ignore next */
      if (embed.indexOf('trade') >= 0) {
        trades = await this.app.model.Trade.findAll({
          where: { id: { $in: items.map(o => o.trade_id).filter(i => i) } },
        });
      }

      this.ctx.jsonBody = _.pickBy({
        count: total,
        start,
        items,
        users,
        trades,
        commodities,
      }, x => !_.isNil(x));
    }

    /**
     * 获取地址列表 的参数规则
     *
     * @readonly
     * @memberof PostController
     */
    get addressRule() {
      return {
        properties: {
          default: {
            type: 'string',
            enum: ['true', 'false'],
          },
          _id: {
            type: 'string',
          },
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * fetch addresses list
     *
     * @memberof AddressController
     * @returns {[Address]} address列表
     */
    async addresses() {
      const { default: isDefault } = await this.ctx.validate(this.addressRule);
      this.ctx.userPermission();

      const addresses = await this.app.model.Address.findAll({
        where: _.pickBy({
          user_id: this.ctx.state.auth.user.id,
          default: isDefault,
        }),
      });

      this.ctx.jsonBody = addresses;
    }

    /**
     * 获取帖子列表 的参数规则
     *
     * @readonly
     * @memberof PostController
     */
    get postRule() {
      return {
        properties: {
          id: {
            type: 'string',
          },
          ...this.ctx.helper.rule.pagination,
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 获取用户帖子列表
     *
     * @memberof PostController
     * @returns {object} 帖子列表
     */
    async posts() {
      const { ctx } = this;
      const {
        start, count, sort,
      } = await ctx.validate(this.postRule, this.ctx.helper.preprocessor.pagination);
      ctx.checkPermission(ctx.params.id);

      const posts = await ctx.model.Post.findAndCountAll({
        attributes: [
          ...Object.keys(ctx.model.Post.attributes),
          [app.Sequelize.literal('(SELECT COUNT(*) FROM post_hits WHERE post_hits.post_id = post.id)'), 'hits'],
        ],
        where: { user_id: ctx.state.auth.user.id },
        offset: start,
        limit: count,
        order: [['created_at', sort === 'false' ? 'DESC' : 'ASC']],
      });

      ctx.jsonBody = {
        count: posts.count,
        start,
        items: posts.rows,
      };
    }
  }
  return UserController;
};
