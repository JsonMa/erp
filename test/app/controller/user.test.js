const Initiater = require('../../initiater');
const assert = require('assert');
const {
  app,
} = require('egg-mock/bootstrap');

describe('test/app/controller/user.test.js', () => {
  const initiater = new Initiater(app);
  describe('user apis', () => {
    beforeEach(() => initiater.inject(['order', 'address']));
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

    it('fetch orders', async function () {
      const resp = await app.httpRequest()
        .get(`/users/${initiater.userId}/orders?status=created&embed=user,commodity`)
        .expect(this.varifyResponse);
      assert.equal(resp.body.data.count, 1);
      assert.equal(resp.body.data.items.length, 1);
      assert.equal(resp.body.data.users.length, 1);
      assert.equal(resp.body.data.commodities.length, 1);
    });

    it('fetch address', async function () {
      const resp = await app.httpRequest()
        .get(`/users/${initiater.userId}/addresses?default=true`)
        .expect(this.varifyResponse);
      assert.equal(resp.body.data.length, 1);
    });
  });
});
