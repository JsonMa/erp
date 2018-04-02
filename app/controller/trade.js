const assert = require('assert');

const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';

module.exports = (app) => {
  /**
   * Trade 相关路由
   *
   * @class TradeController
   * @extends {app.Controller}
   */
  class TradeController extends app.Controller {
    /**
     * 创建 trade 的参数规则
     *
     * @readonly
     * @memberof TradeController
     */
    get createRule() {
      return {
        properties: {
          type: {
            type: 'string',
            enum: ['WECHAT', 'ALIPAY'],
          },
          order_id: this.ctx.helper.rule.uuid,
        },
        required: ['type', 'order_id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * create trade
     *
     * @memberof TradeController
     * @return {Trade} Trade
     */
    async create() {
      const param = await this.ctx.validate(this.createRule);

      const order = await this.app.model.Order.findById(param.order_id);
      this.ctx.error(order, '订单不存在', 25001);
      this.ctx.error(order.address_id, '订单地址不存在', 25005);
      this.ctx.error(order.status === app.model.Order.STATUS.CREATED, '订单状态有误，不能发起支付', 25002);
      this.ctx.userPermission(order.user_id);

      let payload = null;
      let trade = null;
      switch (param.type) {
        case 'WECHAT':
          [trade, payload] = await this.service.wechat.createTrade(param.order_id);
          break;
        case 'ALIPAY':
          [trade, payload] = await this.service.alipay.createTrade(param.order_id);
          break;
          /* istanbul ignore next */
        default:
          assert(false);
      }

      this.ctx.jsonBody = {
        trade,
        payload,
      };
    }

    /**
     *  获取 trade 的参数规则
     *
     * @readonly
     * @memberof TradeController
     */
    get fetchRule() {
      return {
        properties: {
          _id: this.ctx.helper.rule.uuid,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * fetch trade
     *
     * @memberof TradeController
     * @returns {Trade} trade
     */
    async fetch() {
      const param = await this.ctx.validate(this.fetchRule);

      const trade = await this.app.model.Trade.findById(param._id);
      this.ctx.assert(trade, 404);
      const order = await this.app.model.Order.findById(trade.order_id);
      assert(order, 'order should exist');

      this.ctx.checkPermission(order.user_id);

      this.ctx.jsonBody = trade;
    }

    /**
     * 微信回调接口
     * @returns {string} 处理是否成功
     * @memberof TradeController
     */
    async wechatNotify() {
      const { body } = this.ctx.request;
      const { Trade } = this.app.model;

      const {
        object2Xml, tn2uuid,
      } = this.service.wechat;

      /* istanbul ignore if */
      if (!this.service.wechat.verify(body)) {
        this.ctx.body = object2Xml({ return_code: FAILURE });
      }

      await this.service.trade.finishTrade(
        tn2uuid(body.out_trade_no),
        /* istanbul ignore next */
        body.return_code.toUpperCase() === SUCCESS ? Trade.STATUS.SUCCESS : Trade.STATUS.CLOSED,
      );
      this.ctx.body = object2Xml({ return_code: SUCCESS });
    }

    /**
     * 支付宝回调接口
     * @returns {string} 处理是否成功
     * @memberof TradeController
     */
    async alipayNotify() {
      const param = this.ctx.request.body;
      const verifiation = await this.service.alipay.verify(param);

      /* istanbul ignore if */
      if (!verifiation) {
        this.ctx.body = FAILURE;
      }

      await this.service.trade.finishTrade(
        param.out_trade_no,
        param.trade_status.slice(6), // e.g. TRADE_SUCCESS => SUCCESS
      );
      this.ctx.body = SUCCESS;
    }
  }
  return TradeController;
};
