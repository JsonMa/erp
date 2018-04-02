const {
  app,
} = require('egg-mock/bootstrap');

describe('test/app/serivce/notification.test.js', () => {
  let ctx;
  let user;

  const phone = '18511111111';

  beforeEach(async () => {
    user = await app.model.User.create({ name: 'xiegd', phone, password: '111111' });
  });

  after(async () => {
    await app.model.Notification.destroy({ where: { uid: user.id } });
    await app.model.User.destroy({ where: { id: user.id } });
  });

  it('发送推送', async () => {
    ctx = app.mockContext();
    await ctx.service.notification.send2Indivitual(user.id, app.model.Notification.TYPE.SYSTEM, 'unittest');
  });
});
