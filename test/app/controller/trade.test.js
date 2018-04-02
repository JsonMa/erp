const Initiater = require('../../initiater');
const assert = require('assert');
const {
  app,
} = require('egg-mock/bootstrap');

describe('test/app/controller/trade.test.js', () => {
  const initiater = new Initiater(app);
  describe('trade apis', () => {
    beforeEach(() => initiater.inject(['order', 'trade']));
    afterEach(() => initiater.destory());
    beforeEach(async () => {
      app.mockContext({
        state: {
          auth: {
            role: 'user',
            user: {
              id: initiater.userId,
            },
          },
        },
      });
    });

    it('create wechat trade', async function () {
      const order = initiater._getRandomItem('order', { status: 'CREATED' });
      app.mockHttpclient(/\/.*/i, {
        data: '<xml><return_code>SUCCESS</return_code><return_msg>SUCCESS</return_msg></xml>',
      });
      const resp = await app.httpRequest()
        .post('/trades')
        .send({
          order_id: order.id,
          type: 'WECHAT',
        })
        .expect(this.varifyResponse);

      // todo: more varification
      assert.equal(resp.body.data.trade.order_id, order.id);
    });

    it('create alipay trade', async function () {
      const order = initiater._getRandomItem('order', { status: 'CREATED' });
      const resp = await app.httpRequest()
        .post('/trades')
        .send({
          order_id: order.id,
          type: 'ALIPAY',
        })
        .expect(this.varifyResponse);

      // todo: more varification
      assert.equal(resp.body.data.trade.order_id, order.id);
    });

    it('fetch trade', async function () {
      const trade = initiater._getRandomItem('trade', { status: 'SUCCESS' });

      const resp = await app.httpRequest()
        .get(`/trades/${trade.id}`)
        .expect(this.varifyResponse);
      assert.equal(resp.body.data.status, trade.status);
    });

    it('wechat_callback', async () => {
      const trade = initiater._getRandomItem('trade', { status: 'PENDING' });
      app.mockService('wechat', 'verify', () => true);
      await app.httpRequest()
        .post('/trades/wechat_notify')
        .set('Content-Type', 'text/xml')
        .send(`<xml><out_trade_no><![CDATA[${trade.id.replace(/-/g, '')}]]></out_trade_no><result_code><![CDATA[SUCCESS]]></result_code><return_code><![CDATA[SUCCESS]]></return_code></xml>`)
        .expect('<xml><return_code>SUCCESS</return_code></xml>');

      const { Trade, Order } = app.model;

      const newTrade = await Trade.findById(trade.id);
      const order = await Order.findById(trade.order_id);

      assert.equal(newTrade.status, Trade.STATUS.SUCCESS);
      assert.equal(order.status, Order.STATUS.PAYED);
    });

    it('alipay callback', () => {
      const trade = initiater._getRandomItem('trade', { status: 'PENDING' });
      app.mockService('alipay', 'verify', () => true);
      return app.httpRequest()
        .post('/trades/alipay_notify')
        .send({
          out_trade_no: trade.id,
          trade_status: 'TRADE_SUCCESS',
        })
        .expect('SUCCESS');
    });
  });
});
