module.exports = (app) => {
  /**
   * 帖子评论相关service
   *
   * @class PostComment
   * @extends {app.Service}
  */
  class PostComment extends app.Service {
    /**
     * 帖子被评论次数
     *
     * @memberof PostComment
     * @param {uuid} postId - 帖子id
     * @returns {Promise} 帖子被评论次数
    */
    getCount(postId) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(postId), 'postId需为uuid格式');

      return this.ctx.model.PostComment.count({
        where: { post_id: postId },
      });
    }

    /**
     * 用户是否已评论
     *
     * @memberof PostComment
     * @param {uuid} userId - 用户id
     * @param {uuid} postId - 帖子id
     * @returns {Promise} 帖子评论model实例
    */
    isCommented(userId, postId) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(typeof userId === 'number', 'userId需为number格式');
      assert(uuidValidate(postId), 'postId需为uuid格式');

      return this.ctx.model.PostComment.findOne({
        where: {
          post_id: postId,
          user_id: userId,
        },
      });
    }

    /**
     * 所有帖子评论进行关键词过滤(run in background)
     *
     * @memberof PostComment
     * @returns {Null} 无返回值
    */
    async filterComments() {
      const comments = await app.model.PostComment.findAll();
      const batchNumber = 20;
      for (let i = 0; i < comments.length / batchNumber; i += 1) {
        /* eslint-disable */
        await Promise.all(comments.slice(i, batchNumber).map(async (c) => {
          const comment = c;
          const filted = await this.ctx.service.sensitiveWord.filterContent(c.content, { replace: true });
          /* istanbul ignore else */
          if (filted.words.length > 0) {
            comment.content_filted = filted.content;
            return comment.save();
          }
          /* istanbul ignore next */
          if (!!~comment.content_filted.indexOf('*')) {
            comment.content_filted = comment.content;
            return comment.save();
          }
          /* istanbul ignore next */
          return null;
        }));
        /* eslint-enable */
      }
    }
  }

  return PostComment;
};
