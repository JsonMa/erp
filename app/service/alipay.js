const Alipay = require('alipay-mobile');
const assert = require('assert');
const co = require('co');

module.exports = (app) => {
  /**
   * Alipay Service
   *
   * @class Trade
   * @extends {app.Service}
   */
  class Payment extends app.Service {
    /**
     * Creates an instance of Alipay.
     * @param {object} ctx Context
     * @memberof Alipay
     */
    constructor(ctx) {
      super(ctx);
      const config = app.config.alipay;

      assert(config.secret, '[Shubang] secret should be set on config.secret');
      assert(config.app_id, '[Shubang] app_id should be set on config.secret');
      assert(config.secret.type, '[Shubang] secret.type should be set on config.secret');
      assert(config.secret.private, '[Shubang] secret.private should be set on config.secret');
      assert(config.secret.ali, '[Shubang] secret.ali should be set on config.secret');

      this.payment = new Alipay({
        app_id: config.app_id,
        appPrivKeyFile: config.secret.private,
        alipayPubKeyFile: config.secret.ali,
        notify_url: this.ctx.helper.pathFor('alipay_notify'),
      });
    }

    /**
     * 创建支付宝交易订单
     *
     * @param {uuid} orderId 订单id
     * @returns {array} [trade, payload]
     * @memberof Alipay
     */
    createTrade(orderId) {
      const { ctx, payment } = this;
      return co.wrap(function* () {
        const order = yield app.model.Order.findById(orderId);
        ctx.error(order, '订单不存在', 25001);
        ctx.error(order.status === app.model.Order.STATUS.CREATED, '订单状态有误，不能发起支付', 25002);
        ctx.userPermission(order.user_id);

        const commodity = yield app.model.Commodity.findById(order.commodity_id);
        assert(commodity);
        const trade = yield app.model.Trade.create({
          order_id: order.id,
          type: app.model.Trade.TYPE.ALIPAY,
        });

        const resp = yield payment.createOrder({
          subject: commodity.name,
          out_trade_no: trade.id,
          total_amount: order.realPrice,
        });

        ctx.error(resp.code === 0, resp.message, 25004);

        return [trade, resp.data];
      })();
    }

    /**
     * 校验支付宝响应是否合法
     *
     * @param {object} param 支付宝响应body
     * @returns {boolean} response是否合法
     * @memberof Alipay
     */
    verify(param) {
      /* istanbul ignore next */
      return this.payment.makeResponse(param).code === 0;
    }
  }

  return Payment;
};
