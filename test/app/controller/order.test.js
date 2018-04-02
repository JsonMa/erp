const Initiater = require('../../initiater');
const assert = require('assert');
const {
  app,
} = require('egg-mock/bootstrap');

describe('test/app/controller/order.test.js', () => {
  const initiater = new Initiater(app);

  beforeEach(() => initiater.inject(['order', 'commodity_attr', 'logistics']));
  afterEach(() => initiater.destory());

  describe('user apis', () => {
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

    it('fetch order', async function () {
      const { id } = initiater._getRandomItem('order');
      const resp = await app.httpRequest()
        .get(`/orders/${id}?embed=user,address`)
        .expect(this.varifyResponse);
      assert.equal(id, resp.body.data.order.id);
      assert(resp.body.data.user);
      assert(resp.body.data.address);
    });

    it('fetch order\'s logistics', async function () {
      const logistics = initiater.values.logistics[0];
      const resp = await app.httpRequest()
        .get(`/orders/${logistics.order_id}/logistics`)
        .expect(this.varifyResponse);
      assert.equal(logistics.id, resp.body.data.id);
    });

    it('order should be created successfully', async function () {
      const attrs = initiater.values.commodity_attr;
      const commodityAttrs = Object.assign.apply(
        null,
        attrs.map(attr => ({ [attr.name]: attr.values[0] })),
      );

      const resp = await app.httpRequest()
        .post('/orders')
        .send({
          commodity_id: attrs[0].commodity_id,
          address_id: initiater._getRandomItem('address').id,
          commodity_attrs: commodityAttrs,
          count: 1,
        })
        .expect(this.varifyResponse);

      const order = resp.body.data;

      assert(order.commodity_price);
      assert(order.commodity_id, attrs[0].commodity_id);
    });

    it('patch order', async function () {
      const { id } = initiater._getRandomItem('order', { status: 'SHIPMENT' });
      const resp = await app.httpRequest()
        .patch(`/orders/${id}`)
        .send({
          status: 'finished',
        })
        .expect(this.varifyResponse);
      assert.equal(id, resp.body.data.id);
    });

    after(() => app.model.Order.destroy({ where: { user_id: initiater.userId }, force: true }));
  });

  describe('order list', () => {
    beforeEach(async () => {
      app.mockContext({
        state: {
          auth: {
            role: 'admin',
            user: {
              id: initiater.adminId,
            },
          },
        },
      });
    });
    it('fetch all', async function () {
      const resp = await app.httpRequest()
        .get('/orders?embed=user')
        .expect(this.varifyResponse);

      assert.equal(resp.body.data.count, 4);
      assert.equal(resp.body.data.start, 0);
      assert.equal(resp.body.data.items.length, 4);
    });

    it('fetch by commodity name', async function () {
      const resp = await app.httpRequest()
        .get(`/orders?commodity_name=none_exist&user_name=${initiater._getRandomItem('user').name}&from=${new Date().toISOString()}`)
        .expect(this.varifyResponse);

      assert.equal(resp.body.data.items.length, 0);
    });

    it('fetch by time', async function () {
      const resp = await app.httpRequest()
        .get(`/orders?from=${new Date(2000, 1, 1).toISOString()}&to=${new Date().toISOString()}&count=2`)
        .expect(this.varifyResponse);

      assert.equal(resp.body.data.items.length, 2);
    });

    it('fetch by status', async function () {
      const resp = await app.httpRequest()
        .get('/orders?status=CREATED')
        .expect(this.varifyResponse);

      assert.equal(resp.body.data.items.length, 1);
    });

    it('fetch by order_no', async function () {
      const resp = await app.httpRequest()
        .get(`/orders?order_no=${initiater._getRandomItem('order').no}`)
        .expect(this.varifyResponse);

      assert.equal(resp.body.data.items.length, 1);
    });

    it('fetch by user_phone', async function () {
      const resp = await app.httpRequest()
        .get(`/orders?user_phone=${initiater._getRandomItem('user').phone}`)
        .expect(this.varifyResponse);

      assert.equal(resp.body.data.items.length, 4);
    });

    it('fetch with embed', async function () {
      const resp = await app.httpRequest()
        .get('/orders?embed=user,commodity,trade')
        .expect(this.varifyResponse);

      assert.equal(resp.body.data.items.length, 4);
      assert.equal(resp.body.data.users.length, 1);
      assert.equal(resp.body.data.trades.length, 0);
      assert.equal(resp.body.data.commodities.length, 1);
    });
  });
});
