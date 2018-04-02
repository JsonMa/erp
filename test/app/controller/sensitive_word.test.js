const Initiater = require('../../initiater');
const assert = require('assert');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const {
  app,
} = require('egg-mock/bootstrap');

describe('test/app/controller/sensitive_word.test.js', () => {
  const initiater = new Initiater(app);
  const fileId = uuidv4();
  let ctx;

  beforeEach(async () => {
    await initiater.inject(['post_comment', 'sensitive_word']);
    ctx = app.mockContext({
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
    if (fs.existsSync(`files/upload_${fileId}`)) {
      fs.unlinkSync(`files/upload_${fileId}`);
    }
    await app.model.SensitiveWord.destroy({
      where: { key: { $in: ['sensitive_word', '我去', '我来'] } },
      force: true,
    });
  });

  it('获取敏感词列表正序排列', async function () {
    const resp = await app.httpRequest()
      .get('/sensitive_words')
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.count, 2);
  });

  it('decodeURI获取敏感词列表倒序排列', async function () {
    const resp = await app.httpRequest()
      .get(`/sensitive_words?sort=false&word=${encodeURI('车')}`)
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.count, 2);
  });

  it('创建敏感词', async function () {
    const resp = await app.httpRequest()
      .post('/sensitive_words')
      .send({
        key: 'sensitive_word',
      })
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.key, 'sensitive_word');
  });

  it('修改敏感词', async function () {
    const resp = await app.httpRequest()
      .patch(`/sensitive_words/${initiater.values.sensitive_word[0].id}`)
      .send({
        key: 'sensitive_word2',
      })
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.key, 'sensitive_word2');
  });

  it('重复创建敏感词失败', async () => {
    const resp = await app.httpRequest()
      .patch(`/sensitive_words/${initiater.values.sensitive_word[0].id}`)
      .send({
        key: 'sensitive_word',
      })
      .expect(200);
    assert.equal(resp.body.code, 24000);
  });

  it('导入敏感词', async function () {
    const path = 'test/assets/sensitive_word.txt';
    fs.linkSync(path, `files/upload_${fileId}`);
    await ctx.model.File.create({
      id: fileId,
      name: 'sensitive_word',
      path: `files/upload_${fileId}`,
      type: 'text/plain',
    });
    const resp = await app.httpRequest()
      .post('/sensitive_words/import')
      .send({
        fid: fileId,
      })
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.length, 2);
  });

  it('删除敏感词', async function () {
    const resp = await app.httpRequest()
      .delete(`/sensitive_words?ids=${initiater.values.sensitive_word.map(s => s.id).join(',')}`)
      .expect(this.varifyResponse);
    assert.equal(resp.body.data.length, 2);
  });

  it('导出敏感词', () => app.httpRequest()
    .get('/sensitive_words/export')
    .expect(200));
});
