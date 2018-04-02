const Initiater = require('../../initiater');
const assert = require('assert');
const {
  app,
} = require('egg-mock/bootstrap');
const uuidv4 = require('uuid/v4');

describe('test/app/controller/logistics.test.js', () => {
  const initiater = new Initiater(app);
  const orderNO = '12345678';
  const company = 'express';

  before(async () => {
    await initiater.inject(['order']);
  });

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

  after(async () => {
    initiater.destory();
    await app.model.Logistics.destroy({
      where: {
        order_no: orderNO,
      },
      force: true,
    });
  });

  it('logistics should be created successfully ', async function () {
    const order = initiater._getRandomItem('order', {
      status: 'PAYED',
    });

    const resp = await app.httpRequest()
      .post('/logistics')
      .send({
        order_id: order.id,
        order_no: orderNO,
        company,
      })
      .expect(this.varifyResponse);

    assert.equal(resp.body.data.company, company);

    const realOrder = await app.model.Order.findById(order.id);
    assert.equal(realOrder.status, 'SHIPMENT');
  });

  it('logistics should be created successfully ', () => app.httpRequest()
    .post('/logistics')
    .send({
      order_id: uuidv4(),
      order_no: orderNO,
      company,
    })
    .expect((resp) => {
      assert.equal(resp.status, 200);
      assert.equal(resp.body.code, 17001);
    }));
});
