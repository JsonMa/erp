module.exports = (app) => {
  /**
   * 帖子相关service
   *
   * @class Post
   * @extends {app.Service}
  */
  class Post extends app.Service {
    /**
     * 验证帖子是否存在
     *
     * @memberof PostService
     * @param {uuid} postId - 帖子id
     * @returns {Promise} 帖子model实例
    */
    getByIdOrThrow(postId) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(postId), 'postId需为uuid格式');

      return this.ctx.model.Post.findById(postId)
        .then((post) => {
          this.ctx.assert(post, 404);
          return post;
        });
    }

    /**
     * 所有帖子进行关键词过滤(run in background)
     *
     * @memberof PostService
     * @returns {Null} 帖子model实例
    */
    async filterPosts() {
      const posts = await app.model.Post.findAll();
      const batchNumber = 20;
      for (let i = 0; i < posts.length / batchNumber; i += 1) {
        /* eslint-disable */
        await Promise.all(posts.slice(i, batchNumber).map(async (p) => {
          const post = p;
          const contentFilted = await this.ctx.service.sensitiveWord.filterContent(p.content);
          const themeFilted = await this.ctx.service.sensitiveWord.filterContent(p.theme);
          if (contentFilted.words.length > 0 || themeFilted.words.length > 0) {
            post.content_filted = contentFilted.content;
            post.theme_filted = themeFilted.content;
            post.sensitive_words = contentFilted.words.concat(themeFilted.words);
            return post.save();
          }
          /* istanbul ignore next */
          if (post.sensitive_words.length > 0){
            post.content_filted = post.content;
            post.theme_filted = post.theme;
            post.sensitive_words = [];
            return post.save();
          }
          return null;
        }));
        /* eslint-enable */
      }
    }


    /**
     * 根据query条件在Admin和User表查询
     *
     * @memberof PostService
     * @param {object} query - 查询条件
     * @returns {array} user加admin model 数组
    */
    queryUserandAdmin(query) {
      const { assert } = this.ctx.helper;
      assert(typeof query === 'object', 'query查询条件应为Object');
      const queryObj = Object.assign({}, query);

      return this.ctx.model.User.findAll({ where: queryObj, attributes: ['id', 'name', 'nickname', 'avatar', 'phone'] })
        .then(async (users) => {
          const admins = await this.ctx.model.Admin.findAll({ where: queryObj, attributes: ['id', 'name', 'nickname', 'phone'] });
          return users.concat(admins);
        });
    }
  }

  return Post;
};
