const {
  app,
} = require('egg-mock/bootstrap');

describe('test/app/controller/auth.test.js', () => {
  const name = 'egg-test-user';
  after(() => app.model.User.destroy({ where: { name }, force: true }));

  it('login', async function () {
    await app.httpRequest()
      .post('/auth/login')
      .send({
        name,
        role: 'user',
        phone: '18523776307',
        password: '123456',
      })
      .expect(this.varifyResponse)
      .then(resp => app.httpRequest()
        .post('/orders')
        .set('access_token', resp.body.data.token)
        .expect(400));
  });
});
