const Initiater = require('../../initiater');
const assert = require('assert');
const uuidv4 = require('uuid/v4');
const {
  app,
} = require('egg-mock/bootstrap');

describe('test/app/service/post.test.js', () => {
  const initiater = new Initiater(app);
  let ctx;

  beforeEach(async () => {
    await initiater.inject(['post_comment', 'sensitive_word']);
    ctx = app.mockContext();
  });

  afterEach(async () => {
    await initiater.destory();
  });

  it('禁止引用不存在帖子', async () => {
    try {
      await ctx.service.post.getByIdOrThrow(uuidv4());
    } catch (err) {
      assert.equal(err.message, 'Not Found');
    }
  });

  it('获取帖子', async () => {
    const post = await ctx.service.post.getByIdOrThrow(initiater._getRandomItem('post', { theme: 'post1' }).id);
    assert.equal(post.id.toString(), initiater._getRandomItem('post', { theme: 'post1' }).id.toString());
  });

  it('帖子敏感词过滤', async () => {
    await ctx.service.sensitiveWord.setRedisWordsMap();
    await ctx.service.post.filterPosts();
    const posts = await app.model.Post.findAll({
      where: { sensitive_words: { $ne: [] } },
    });
    posts.forEach((p) => {
      assert(!!~p.content_filted.indexOf('|<')); // eslint-disable-line
    });
  });

  it('帖子评论过滤', async () => {
    await ctx.service.postComment.filterComments();
    const comments = await ctx.model.PostComment.findAll();
    comments.forEach((p) => {
      assert(!!~p.content_filted.indexOf('*')); // eslint-disable-line
    });
  });
});
