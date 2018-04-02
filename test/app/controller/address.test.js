const Initiater = require('../../initiater');
const assert = require('assert');
const {
  app,
} = require('egg-mock/bootstrap');

describe('test/app/controller/address.test.js', () => {
  const initiater = new Initiater(app);
  const name = 'address-test-user';
  const location = 'address-test-location';
  const phone = '12332112311';

  before(async () => {
    await initiater.inject(['address']);
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

  after(() => {
    initiater.destory();
  });

  describe('create address', () => {
    after(() => app.model.Address.destroy({
      where: {
        user_id: initiater.userId,
      },
      force: true,
    }));

    it('address should be created successfully ', function () {
      return app.httpRequest()
        .post('/addresses')
        .send({
          name,
          location,
          phone,
          default: true,
        })
        .expect(this.varifyResponse);
    });
  });

  it('fetch address', function () {
    return app.httpRequest()
      .get(`/addresses/${initiater.values.address[0].id}`)
      .expect(this.varifyResponse);
  });

  it('update address', async function () {
    const resp = await app.httpRequest()
      .patch(`/addresses/${initiater.values.address[0].id}`)
      .send({
        name,
        default: true,
      })
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.name, name);
    assert.equal(resp.body.data.default, true);
  });


  it('address should be deleted successfully', function () {
    return app.httpRequest()
      .delete(`/addresses/${initiater.values.address[0].id}`)
      .expect(this.varifyResponse);
  });
});
