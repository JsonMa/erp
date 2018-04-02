const Initiater = require('../../initiater');
const assert = require('assert');
const uuidv4 = require('uuid/v4');
const {
  app,
} = require('egg-mock/bootstrap');

describe('test/app/controller/post.test.js', () => {
  const initiater = new Initiater(app);
  let ctx;

  beforeEach(async () => {
    await initiater.inject(['post_comment', 'post_vote', 'post_hits']);
    ctx = app.mockContext({
      state: {
        auth: {
          token: uuidv4(),
          role: 'admin',
          user: {
            id: parseInt(initiater.userId), // eslint-disable-line
          },
        },
      },
    });
  });

  afterEach(async () => {
    await app.model.PostHits.destroy({
      where: { session_id: ctx.state.auth.token },
      force: true,
    });
    await initiater.destory();
  });

  after(async () => {
    await app.model.Post.destroy({
      where: { user_id: initiater.userId },
      force: true,
    });
    await app.model.PostComment.destroy({
      where: { user_id: initiater.userId },
      force: true,
    });
    await app.model.PostVote.destroy({
      where: { user_id: initiater.userId },
      force: true,
    });
  });

  it('获取帖子列表-最热', async function () {
    const resp = await app.httpRequest()
      .get('/posts?query_type=HOT&sort=false&start=0&embed=user')
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.count, 2);
    assert.equal(resp.body.data.items[0].hits, '2');
  });

  it('获取帖子列表-最新-根据用户电话查询', async function () {
    const resp = await app.httpRequest()
      .get(`/posts?phone=${initiater.values.user[0].phone}`)
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.count, 1);
  });

  it('获取用户帖子正序排列', async function () {
    const resp = await app.httpRequest()
      .get(`/users/${initiater.values.user[0].id}/posts`)
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.count, 1);
  });

  it('获取用户帖子倒序序排列', async function () {
    const resp = await app.httpRequest()
      .get(`/users/${initiater.values.user[0].id}/posts?sort=false`)
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.count, 1);
  });

  it('创建帖子', async function () {
    const resp = await app.httpRequest()
      .post('/posts')
      .send({
        theme: 'mock-post-theme',
        content: 'mock-post-content-电动车',
        category_id: initiater._getRandomItem('post_category').id,
        cover_ids: [initiater._getRandomItem('file').id],
      })
      .expect(this.varifyResponse);
    assert(!!~resp.body.data.content_filted.indexOf('|<')); // eslint-disable-line
  });

  it('修改帖子文件', async function () {
    return app.httpRequest()
      .patch(`/posts/${initiater.values.post[1].id}`)
      .send({
        category_id: initiater._getRandomItem('post_category').id,
        cover_ids: [initiater._getRandomItem('file').id],
      })
      .expect(this.varifyResponse);
  });

  it('修改帖子内容', async function () {
    const resp = await app.httpRequest()
      .patch(`/posts/${initiater.values.post[1].id}`)
      .send({
        content: '我的三轮车',
      })
      .expect(this.varifyResponse);
    assert(!!~resp.body.data.content_filted.indexOf('|<')); // eslint-disable-line
  });

  it('管理员删除帖子', async function () {
    const resp = await app.httpRequest()
      .delete(`/posts?post_ids=${(initiater.values.post.map(p => p.id)).join(',')}`)
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.length, 2);
  });

  it('用户删除帖子', async function () {
    await app.mockContext({
      state: {
        auth: {
          token: uuidv4(),
          role: 'user',
          user: {
            id: initiater.userId,
          },
        },
      },
    });
    const resp = await app.httpRequest()
      .delete(`/posts?post_ids=${initiater.values.post[1].id}`)
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.length, 1);
  });

  it('获取帖子详情', async function () {
    const resp = await app.httpRequest()
      .get(`/posts/${initiater._getRandomItem('post', { theme: 'post2' }).id}`)
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.theme, 'post2');
  });

  it('非本用户禁止获取含有敏感词帖子', async () => {
    await app.mockContext({
      state: {
        auth: {
          token: uuidv4(),
          role: 'user',
          user: {
            id: 3,
          },
        },
      },
    });
    const resp = await app.httpRequest()
      .get(`/posts/${initiater.values.post[0].id}`)
      .expect(200);
    assert.equal(resp.body.code, 23000);
  });

  it('获取帖子评论正序排列', async function () {
    const resp = await app.httpRequest()
      .get(`/posts/${initiater._getRandomItem('post_comment').post_id}/comments?start=0&embed=user`)
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.count, 2);
  });

  it('获取帖子评论倒序排列', async function () {
    const resp = await app.httpRequest()
      .get(`/posts/${initiater._getRandomItem('post_comment').post_id}/comments?sort=false`)
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.count, 2);
  });

  it('创建帖子评论', async function () {
    const resp = await app.httpRequest()
      .post(`/posts/${initiater._getRandomItem('post', { theme: 'post1' }).id}/comments`)
      .send({
        content: 'mock-post-comment-三轮车',
      })
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.content_filted, 'mock-post-comment-***');
  });

  it('对帖子点赞', async function () {
    return app.httpRequest()
      .post(`/posts/${initiater._getRandomItem('post', { theme: 'post1' }).id}/vote`)
      .send({})
      .expect(this.varifyResponse);
  });

  it('禁止同一用户对同一帖子重复点赞', async () => {
    const resp = await app.httpRequest()
      .post(`/posts/${initiater._getRandomItem('post', { theme: 'post2' }).id}/vote`)
      .send({})
      .expect(200);
    assert.equal(resp.body.code, 22000);
  });

  it('对帖子取消点赞', () => app.httpRequest()
    .delete(`/posts/${initiater._getRandomItem('post_vote').post_id}/vote`)
    .expect(200));
});
