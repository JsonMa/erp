const _ = require('lodash');

module.exports = (app) => {
  /**
   * Order 相关路由
   *
   * @class OrderController
   * @extends {app.Controller}
   */
  class OrderController extends app.Controller {
    /**
     * create order 的参数规则
     *
     * @readonly
     * @memberof OrderController
     */
    get createRule() {
      return {
        properties: {
          address_id: this.ctx.helper.rule.uuid,
          commodity_id: this.ctx.helper.rule.uuid,
          commodity_attrs: {
            patternProperties: {
              '.*': { type: 'string' },
            },
          },
          count: {
            type: 'integer',
            minimum: 1,
          },
        },
        required: ['commodity_id', 'count'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * create order
     *
     * @memberof OrderController
     * @return {Order} Order
     */
    async create() {
      this.ctx.userPermission();
      const params = await this.ctx.validate(
        this.createRule,
        param => Object.assign(
          param,
          { count: _.isNil(param.count) ? undefined : parseInt(param.count, 10) },
        ),
      );

      const { ctx } = this.ctx.request;

      const commodity = await this.app.model.Commodity.findById(params.commodity_id);
      this.ctx.error(commodity, '商品不存在', 18001);
      this.ctx.error(commodity.status === this.app.model.Commodity.STATUS.ON, '商品已下架', 18006);

      /* istanbul ignore else */
      if (params.address_id) {
        const address = await this.app.model.Address.findById(params.address_id);
        this.ctx.error(address, '收货地址不存在', 18002);
        this.ctx.userPermission(address.user_id);
      }

      // 有属性时创建订单必须包含属性
      const attrCount = await this.app.model.CommodityAttr.count({
        where: { commodity_id: params.commodity_id },
      });
      /* istanbul ignore if */
      if (attrCount !== 0 && !params.commodity_attrs) {
        this.ctx.error(false, '必须包含商品属性或商品属性值', 18005);
      }

      /* istanbul ignore else */
      if (params.commodity_attrs) {
        const commodityAttrs = await this.app.model.CommodityAttr.findAll({
          where: { commodity_id: commodity.id },
          attributes: ['name', 'values'],
        });

        this.ctx.error(Object.keys(params.commodity_attrs).length === commodityAttrs.length, '商品属性或商品属性值有误', 18004);
        commodityAttrs.forEach((attr) => {
          const attrs = params.commodity_attrs;
          this.ctx.error(attrs[attr.name], '商品属性或商品属性值有误', 18004);
          this.ctx.error(attr.values.indexOf(attrs[attr.name]) !== -1, '商品属性或商品属性值有误', 18004);
        });
      }

      /* istanbul ignore next */
      const order = await this.app.model.Order.create(Object.assign({
        user_id: ctx.state.auth.user.id,
        commodity_price: commodity.realPrice * params.count,
      }, params, {
        commodity_attrs: Object.keys(params.commodity_attrs || []),
        commodity_attr_vals: Object.values(params.commodity_attrs || []),
      }));
      this.ctx.jsonBody = order;
    }

    /**
     * 获取 orders 的参数规则
     *
     * @readonly
     * @memberof OrderController
     */
    get listRule() {
      return {
        properties: {
          from: this.ctx.helper.rule.date,
          to: this.ctx.helper.rule.date,
          user_name: { type: 'string' },
          user_phone: this.ctx.helper.rule.phone,
          recipent_name: { type: 'string' },
          recipent_phone: this.ctx.helper.rule.phone,
          commodity_name: { type: 'string' },
          embed: {
            type: 'array',
            items: {
              type: 'string', enum: ['user', 'commodity', 'trade', ''],
            },
          },
          status: {
            type: 'string',
            enum: ['CREATED', 'PAYED', 'SHIPMENT', 'FINISHED'],
          },
          order_no: { type: 'string' },
          ...this.ctx.helper.rule.pagination,
        },
        required: ['start', 'count', 'sort'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * list orders
     *
     * @memberof OrderController
     * @return {[Order]} Order List
     */
    async list() {
      this.ctx.adminPermission();
      const query = await this.ctx.validate(
        this.listRule,
        this.ctx.helper.preprocessor.pagination,
        param => Object.assign(param, { embed: (param.embed || '').split(',') }),
      );
      let userIds = null;
      let commodityId = null;

      /* istanbul ignore next */
      if (query.user_name || query.user_phone || query.recipent_name || query.recipent_phone) {
        userIds = await this.app.model.User.findAll({
          where: _.pickBy({
            name: (query.user_name || query.recipent_name) ? {
              $in: _.filter([
                query.user_name,
                query.recipent_name,
              ]),
            } : null,
            phone: (query.user_phone || query.recipent_phone) ? {
              $in: _.filter([
                query.user_phone,
                query.recipent_phone,
              ]),
            } : null,
          }),
          attributes: ['id'],
        }).map(item => item.id);

        if (userIds.length === 0) {
          this.ctx.jsonBody = {
            start: 0,
            count: 0,
            items: [],
          };
          return;
        }
      }

      /* istanbul ignore next */
      if (query.commodity_name) {
        const commodity = await this.app.model.Commodity.findOne({
          where: {
            name: query.commodity_name,
          },
          attributes: ['id'],
        });
        if (!commodity) {
          this.ctx.jsonBody = {
            start: 0,
            count: 0,
            items: [],
          };
          return;
        }
        commodityId = commodity.id;
      }

      const { count, start, sort } = query;

      /* istanbul ignore next */
      const { count: total, rows: items } = await this.app.model.Order.findAndCount({
        where: _.pickBy({
          user_id: userIds ? { $in: userIds } : null,
          commodity_id: commodityId,
          status: query.status,
          no: parseInt(query.order_no, 10),
          created_at: (query.from || query.to) ? _.pickBy({
            $gt: query.from ? new Date(query.from) : undefined,
            $lt: query.to ? new Date(query.to) : undefined,
          }) : null,
        }),
        limit: count,
        offset: start,
        order: [['created_at', sort === 'false' ? 'DESC' : 'ASC']],
      });

      // embed users
      let users = null;
      let commodities = null;
      let trades = null;
      /* istanbul ignore else */
      if (query.embed.indexOf('user') >= 0) {
        users = await this.service.user.findByIds(items.map(o => o.user_id));
      }
      if (query.embed.indexOf('commodity') >= 0) {
        commodities = await this.app.model.Commodity.findAll({
          where: { id: { $in: items.map(o => o.commodity_id) } },
        });
      }
      if (query.embed.indexOf('trade') >= 0) {
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
   * 获取 order 的参数规则
   *
   * @readonly
   * @memberof OrderController
   */
    get fetchRule() {
      return {
        properties: {
          _id: this.ctx.helper.rule.uuid,
          embed: {
            type: 'array',
            items: {
              type: 'string', enum: ['user', 'address', ''],
            },
          },
        },
        required: ['_id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * fetch order
     *
     * @memberof OrderController
     * @return {Order} Order
     */
    async fetch() {
      const query = await this.ctx.validate(
        this.fetchRule,
        param => Object.assign(param, { embed: (param.embed || '').split(',') }),
      );

      const order = await this.app.model.Order.findById(this.ctx.params._id);
      this.ctx.assert(order, 404);
      this.ctx.checkPermission(order.user_id);

      const result = { order };
      /* istanbul ignore else */
      if (query.embed.indexOf('user') >= 0) {
        result.user = await this.app.model.User.findById(order.user_id, {
          attributes: ['id', 'name', 'nickname', 'avatar', 'phone'],
          paranoid: false,
        });
      }

      /* istanbul ignore else */
      if (query.embed.indexOf('address') >= 0) {
        result.address = await this.app.model.Address.findById(order.address_id, {
          paranoid: false,
        });
      }

      this.ctx.jsonBody = result;
    }

    /**
     * fetch order logistics
     *
     * @memberof OrderController
     * @return {Logistics} logistics
     */
    async logistics() {
      await this.ctx.validate(this.fetchRule);
      const order = await this.app.model.Order.findById(this.ctx.params._id);
      this.ctx.assert(order, 404);
      this.ctx.checkPermission(order.user_id);
      const logistics = await this.app.model.Logistics.findOne({
        where: { order_id: this.ctx.params._id },
      });
      this.ctx.assert(logistics, 404, '未查询到订单相关物流信息');

      this.ctx.jsonBody = logistics;
    }

    /**
   * 修改 order 的参数规则
   *
   * @readonly
   * @memberof OrderController
   */
    get patchRule() {
      return {
        properties: {
          _id: this.ctx.helper.rule.uuid,
          address_id: this.ctx.helper.rule.uuid,
          price: { type: 'number', minimum: 0.01 },
          status: {
            type: 'string',
            enum: ['finished'],
          },
        },
        required: ['_id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * patch order
     *
     * @memberof OrderController
     * @return {Order} Order
     */
    async patch() {
      const params = await this.ctx.validate(this.patchRule);
      const { Order, Address } = this.app.model;

      const order = await Order.findById(params._id);
      this.ctx.assert(order, 404);
      this.ctx.checkPermission(order.user_id);

      /* istanbul ignore next */
      if (params.address_id) {
        const address = await Address.findById(params.address_id);
        this.ctx.error(address, '收货地址不存在', 18002);
        this.ctx.userPermission(address.user_id);
      }

      /* istanbul ignore next */
      if (params.price) {
        this.ctx.adminPermission();
        this.ctx.error(order.status === Order.STATUS.CREATED, '已支付的订单不能修改价格', 18007);
      }

      /* istanbul ignore next */
      if (params.status) {
        this.ctx.checkPermission(order.user_id);
        this.ctx.error(order.status === Order.STATUS.SHIPMENT, '订单当前状态不能修改为已完成', 18003);
        params.status = params.status.toUpperCase();
      }

      Object.assign(order, params);
      await order.save();

      this.ctx.jsonBody = order;
    }
  }
  return OrderController;
};
