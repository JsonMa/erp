module.exports = (app) => {
  /**
   * 帖子分类相关service
   *
   * @class PostCategory
   * @extends {app.Service}
  */
  class PostCategory extends app.Service {
    /**
     * 验证帖子分类是否存在
     *
     * @memberof PostCategory
     * @param {uuid} categoryId - 帖子分类id
     * @returns {Promise} 帖子分类model实例
    */
    getByIdOrThrow(categoryId) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(categoryId), 'categoryId需为uuid格式');

      return this.ctx.model.PostCategory.findById(categoryId).then((category) => {
        this.ctx.error(category, '帖子分类不存在', 19000);
        return category;
      });
    }
  }

  return PostCategory;
};
