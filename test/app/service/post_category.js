const Initiater = require('../../initiater');
const assert = require('assert');
const uuidv4 = require('uuid/v4');
const {
  app,
} = require('egg-mock/bootstrap');

describe('test/app/service/post_category.test.js', () => {
  const initiater = new Initiater(app);
  let ctx;

  beforeEach(async () => {
    await initiater.destory();
    await initiater.inject(['post_category']);
    ctx = app.mockContext();
  });

  after(async () => {
    await initiater.destory();
  });

  it('禁止引用不存在帖子分类', async () => {
    try {
      await ctx.service.postCategory.getByIdOrThrow(uuidv4());
    } catch (err) {
      assert.equal(err.code, 19000);
    }
  });

  it('获取帖子分类', async () => {
    const category = await ctx.service.postCategory.getByIdOrThrow(initiater._getRandomItem('post_category', { name: '电动车' }).id);
    assert.equal(category.id.toString(), initiater._getRandomItem('post_category', { name: '电动车' }).id.toString());
  });
});
