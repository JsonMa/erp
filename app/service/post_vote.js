module.exports = (app) => {
  /**
   * 帖子点赞相关service
   *
   * @class PostVote
   * @extends {app.Service}
  */
  class PostVote extends app.Service {
    /**
     * 帖子被点赞次数
     *
     * @memberof PostVote
     * @param {uuid} postId - 帖子id
     * @returns {Promise} 帖子被点赞次数
    */
    getCount(postId) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(postId), 'postId需为uuid格式');

      return this.ctx.model.PostVote.count({
        where: { post_id: postId },
      });
    }

    /**
     * 根据用户和帖子获取点赞
     *
     * @memberof PostVote
     * @param {uuid} userId - 用户id
     * @param {uuid} postId - 帖子id
     * @returns {Promise} 点赞详情
    */
    getVote(userId, postId) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(typeof userId === 'number', 'userId需为number格式');
      assert(uuidValidate(postId), 'postId需为uuid格式');

      return this.ctx.model.PostVote.findOne({
        where: {
          post_id: postId,
          user_id: userId,
        },
      });
    }

    /**
     * 用户是否已点赞
     *
     * @memberof PostVote
     * @param {uuid} userId - 用户id
     * @param {uuid} postId - 帖子id
     * @returns {Promise} 点赞 model 实例
    */
    isVoted(userId, postId) {
      return this.ctx.model.PostVote.findOne({
        where: {
          post_id: postId,
          user_id: userId,
        },
      });
    }
  }

  return PostVote;
};
