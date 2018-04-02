module.exports = (app) => {
  /**
   * PostCategory 相关路由
   *
   * @class PostCategoryController
   * @extends {app.Controller}
   */
  class PostCategoryController extends app.Controller {
    /**
     * 创建帖子分类列表 的参数规则
     *
     * @readonly
     * @memberof PostCategoryController
     */
    get createRule() {
      return {
        properties: {
          name: {
            type: 'string',
            maxLength: 10,
            minLength: 1,
          },
          cover_id: this.ctx.helper.rule.uuid,
        },
        required: ['name', 'cover_id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 修改帖子分类 的参数规则
     *
     * @readonly
     * @memberof PostCategoryController
     */
    get updateRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
          name: {
            type: 'string',
            maxLength: 10,
            minLength: 1,
          },
          cover_id: this.ctx.helper.rule.uuid,
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 删除帖子分类 的参数规则
     *
     * @readonly
     * @memberof PostCategoryController
     */
    get batchDestroyRule() {
      return {
        properties: {
          ids: {
            type: 'array',
            items: this.ctx.helper.rule.uuid,
          },
        },
        required: ['ids'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 获取帖子分类列表
     *
     * @memberof PostCategoryController
     * @returns {[PostCategory]} 帖子分类列表
     */
    async index() {
      const { ctx } = this;
      const categories = await ctx.model.PostCategory.findAll({
        order: [['updated_at', 'DESC']],
      });

      ctx.jsonBody = categories;
    }

    /**
     * 创建帖子分类
     *
     * @memberof PostCategoryController
     * @returns {PostCategory} 创建的帖子分类
     */
    async create() {
      const { ctx } = this;
      ctx.adminPermission();
      await ctx.validate(this.createRule);

      await ctx.service.file.getByIdOrThrow(ctx.request.body.cover_id);
      const repeatNameCategory = await ctx.model.PostCategory.findOne({
        where: { name: ctx.request.body.name },
      });
      ctx.error(!repeatNameCategory, '禁止重复创建帖子分类', 19002);
      const category = await ctx.model.PostCategory.create(ctx.request.body);

      ctx.jsonBody = category;
    }

    /**
     * 修改帖子分类
     *
     * @memberof PostCategoryController
     * @returns {PostCategory} 修改后的帖子分类
     */
    async update() {
      const { ctx } = this;
      ctx.adminPermission();
      await ctx.validate(this.updateRule);

      const category = await ctx.model.PostCategory.findById(ctx.params.id);
      ctx.assert(category, 404);
      if (ctx.request.body.cover_id) {
        await ctx.service.file.getByIdOrThrow(ctx.request.body.cover_id);
      }
      Object.assign(category, ctx.request.body);
      await category.save();

      ctx.jsonBody = category;
    }

    /**
     * 删除帖子分类
     *
     * @memberof PostCategoryController
     * @returns {PostCategory} 删除的帖子分类
     */
    async batchDestroy() {
      const { ctx } = this;
      ctx.adminPermission();
      await this.ctx.validate(this.batchDestroyRule, () => {
        ctx.assert(ctx.query.ids, 400, 'ids 为必传参数');
        const categoryIds = ctx.query.ids.split(',');
        return { ids: categoryIds };
      });
      const categoryIds = ctx.query.ids.split(',');

      // 已使用的分类不可删除
      const postCount = await ctx.model.Post.count({
        where: {
          category_id: { $in: categoryIds },
        },
      });
      ctx.error(postCount === 0, '禁止删除已使用帖子分类', 19001);

      const categories = await ctx.model.PostCategory.findAll({
        where: {
          id: { $in: categoryIds },
        },
      });
      await ctx.model.PostCategory.destroy({
        where: {
          id: { $in: categoryIds },
        },
      });

      ctx.jsonBody = categories;
    }
  }
  return PostCategoryController;
};
