const Initiater = require('../../initiater');
const assert = require('assert');
const uuidv4 = require('uuid/v4');
const {
  app,
} = require('egg-mock/bootstrap');

describe('test/app/controller/post_category.test.js', () => {
  const initiater = new Initiater(app);

  beforeEach(async () => {
    await initiater.inject(['post_category']);
    app.mockContext({
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

  afterEach(async () => {
    await initiater.destory();
  });

  after(async () => {
    await app.model.PostCategory.destroy({
      where: { name: 'category' },
    });
  });

  it('获取帖子分类列表', async function () {
    const resp = await app.httpRequest()
      .get('/post_categories')
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.length, 2);
  });

  it('创建帖子分类', async function () {
    const resp = await app.httpRequest()
      .post('/post_categories')
      .send({
        name: 'category',
        cover_id: initiater._getRandomItem('file').id,
      })
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.name, 'category');
  });

  it('禁止创建同名帖子分类', async () => {
    const resp = await app.httpRequest()
      .post('/post_categories')
      .send({
        name: 'category',
        cover_id: initiater._getRandomItem('file').id,
      })
      .expect(200);
    assert.equal(resp.body.code, 19002);
  });

  it('修改帖子分类cover', async function () {
    const resp = await app.httpRequest()
      .patch(`/post_categories/${initiater._getRandomItem('post_category').id}`)
      .send({
        cover_id: initiater.values.file[0].id,
      })
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.cover_id, initiater.values.file[0].id.toString());
  });

  it('修改帖子分类name', async function () {
    const resp = await app.httpRequest()
      .patch(`/post_categories/${initiater._getRandomItem('post_category').id}`)
      .send({
        name: 'mock-name',
      })
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.name, 'mock-name');
  });

  it('删除帖子分类', async function () {
    const resp = await app.httpRequest()
      .delete(`/post_categories?ids=${initiater.values.post_category[0].id},${initiater.values.post_category[1].id}`)
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.length, 2);
  });

  it('删除已使用帖子分类失败', async () => {
    await initiater.inject(['post']);
    const resp = await app.httpRequest()
      .delete(`/post_categories?ids=${initiater.values.post[0].category_id}`)
      .expect(200);
    assert.equal(resp.body.code, 19001);
  });
});
