module.exports = (app) => {
  /**
   * 帖子阅读相关service
   *
   * @class PostHits
   * @extends {app.Service}
  */
  class PostHits extends app.Service {
    /**
     * 帖子阅读次数
     *
     * @memberof PostHits
     * @param {uuid} postId - 帖子id
     * @returns {Promise} 帖子被阅读次数
    */
    getCount(postId) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(postId), 'postId需为uuid格式');

      return this.ctx.model.PostHits.count({
        where: { post_id: postId },
      });
    }

    /**
     * 用户阅读帖子
     *
     * @memberof PostVote
     * @param {uuid} sessionId - 用户session id
     * @param {Post} post - 帖子Model
     * @returns {Promise} 查询或者创建hits
    */
    hits(sessionId, post) {
      /* istanbul ignore next */
      if (!sessionId) return false;
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(sessionId), 'sessionId需为uuid格式');
      assert(typeof post === 'object', 'post需为Model');

      return post.getPost_hits({
        where: { session_id: sessionId },
      })
        .then((hits) => {
          /* istanbul ignore else */
          if (hits.length === 0) {
            return post.createPost_hit({
              session_id: sessionId,
            });
          }
          /* istanbul ignore next */
          return hits[0];
        });
    }
  }

  return PostHits;
};
