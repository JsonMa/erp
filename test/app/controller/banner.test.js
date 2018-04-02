const Initiater = require('../../initiater');
const uuidv4 = require('uuid/v4');

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

describe('test/app/controller/banner.test.js', () => {
  const initiater = new Initiater(app);

  beforeEach(async function () {
    await initiater.inject(['banner']);

    this.app.mockContext({
      state: {
        auth: {
          token: uuidv4(),
          role: 'admin',
          user: {
            id: initiater.userId,
          },
        },
      },
    });
  });

  afterEach(() => {
    initiater.destory();
  });

  it('should return banners', async () => {
    const resp = await app.httpRequest()
      .get('/banners')
      .expect(200);
    assert.equal(resp.body.data.count, 2);
  });

  describe('add commodity', () => {
    it('should add banner successfully', async () => {
      const file = initiater._getRandomItem('file');
      const resp = await app.httpRequest()
        .post('/banners')
        .send({
          picture_id: file.id,
        })
        .expect(200);
      assert.equal(resp.body.data.picture_id, file.id);
      this.mockBanner = resp.body.data;
    });

    after(async () => {
      await app.model.Banner.destroy({
        where: { id: this.mockBanner.id },
        force: true,
      });
    });
  });

  it('should update banner successfully', async () => {
    const resp = await app.httpRequest()
      .patch(`/banners/${initiater.values.banner[0].id}`)
      .send({
        picture_id: initiater.values.file[1].id,
      })
      .expect(200);
    assert.equal(resp.body.data.picture_id, initiater.values.file[1].id);
  });

  it('should delete banner successfully', async () => {
    const resp = await app.httpRequest()
      .delete(`/banners/${initiater.values.banner[0].id}`)
      .expect(200);
    assert.equal(resp.body.data.id, initiater.values.banner[0].id);
  });
});
