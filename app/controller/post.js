const _ = require('lodash');

module.exports = (app) => {
  /**
   * 帖子相关路由
   *
   * @class PostController
   * @extends {app.Controller}
   */
  class PostController extends app.Controller {
    /**
     * 获取帖子列表 的参数规则
     *
     * @readonly
     * @memberof PostController
     */
    get indexRule() {
      return {
        properties: {
          from: {
            type: 'string',
            formats: 'date',
          },
          to: {
            type: 'string',
            formats: 'date',
          },
          nick_name: {
            type: 'string',
            minLength: 1,
            maxLength: 10,
          },
          phone: this.ctx.helper.rule.phone,
          theme: {
            type: 'string',
            minLength: 1,
            maxLength: 20,
          },
          state: {
            type: 'string',
            enum: ['VALID', 'INVALID'],
          },
          category_id: this.ctx.helper.rule.uuid,
          query_type: {
            type: 'string',
            enum: ['NEW', 'HOT'],
          },
          embed: {
            type: 'string',
            enum: ['user'],
          },
          ...this.ctx.helper.rule.pagination,
        },
        $async: true,
        additionalProperties: false,
      };
    }


    /**
     * 创建帖子 的参数规则
     *
     * @readonly
     * @memberof PostController
     */
    get createRule() {
      return {
        properties: {
          theme: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
          content: {
            type: 'string',
            minLength: 1,
            maxLength: 2000,
          },
          category_id: this.ctx.helper.rule.uuid,
          cover_ids: {
            type: 'array',
            items: [this.ctx.helper.rule.uuid],
          },
        },
        required: ['theme', 'content', 'category_id', 'cover_ids'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 修改帖子 的参数规则
     *
     * @readonly
     * @memberof PostController
     */
    get patchRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
          theme: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
          content: {
            type: 'string',
            minLength: 1,
            maxLength: 2000,
          },
          category_id: this.ctx.helper.rule.uuid,
          cover_ids: {
            type: 'array',
            items: [this.ctx.helper.rule.uuid],
          },
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 批量删除帖子 的参数规则
     *
     * @readonly
     * @memberof PostController
     */
    get batchDestroyRule() {
      return {
        properties: {
          post_ids: {
            type: 'array',
            items: this.ctx.helper.rule.uuid,
          },
        },
        required: ['post_ids'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 获取帖子详情的 参数规则
     *
     * @readonly
     * @memberof PostController
     */
    get detailRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 获取帖子评论列表 的参数规则
     *
     * @readonly
     * @memberof PostController
     */
    get commentsIndexRule() {
      return {
        properties: {
          embed: {
            type: 'string',
            enum: ['user'],
          },
          id: this.ctx.helper.rule.uuid,
          ...this.ctx.helper.rule.pagination,
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 创建帖子评论 的参数规则
     *
     * @readonly
     * @memberof PostController
     */
    get createCommentRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
          content: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
        },
        required: ['id', 'content'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 帖子点赞 的参数规则
     *
     * @readonly
     * @memberof PostController
     */
    get createVoteRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 取消帖子点赞 的参数规则
     *
     * @readonly
     * @memberof PostController
     */
    get destroyVoteRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 获取帖子列表
     *
     * @memberof PostController
     * @returns {object} 帖子列表
     */
    async index() {
      const { ctx } = this;

      const req = await ctx.validate(this.indexRule, ctx.helper.preprocessor.pagination);
      const {
        from, to, phone, category_id: categoryId,
        query_type: queryType, start, count, sort, embed,
      } = req;
      /* istanbul ignore next */
      const nickName = req.nick_name ? decodeURI(req.nick_name) : undefined;
      /* istanbul ignore next */
      const theme = req.theme ? decodeURI(req.theme) : undefined;
      const state = ctx.state.auth.role === 'admin' ? req.state : 'VALID';

      // 用户相关条件查询
      let users = [];
      /* istanbul ignore next */
      if (nickName || phone) {
        const userQuery = {};
        if (nickName) userQuery.nickname = { $like: `%${nickName}%` };
        if (phone) userQuery.phone = phone;
        users = await ctx.service.post.queryUserandAdmin(userQuery);
        if (users.length === 0) {
          ctx.jsonBody = {
            count: 0,
            start,
            items: [],
          };
          return;
        }
      }

      // 帖子相关条件查询
      /* istanbul ignore next */
      const postQuery = _.pickBy({
        created_at: (from || to) ? _.pickBy({
          $gte: from ? new Date(from) : undefined,
          $lte: to ? new Date(to) : undefined,
        }) : undefined,
        theme: theme ? { $like: `%${theme}%` } : undefined,
        category_id: categoryId,
        sensitive_words: state === 'INVALID' ? { $ne: [] } : (state === 'VALID' ? { $eq: [] } : undefined), // eslint-disable-line
        user_id: users.length > 0 ? { $in: users.map(u => u.id) } : undefined,
      });
      const order = [];
      /* istanbul ignore next */
      if (queryType === 'NEW') {
        order.push(['created_at', 'DESC']);
      } else if (queryType === 'HOT') {
        order.push([app.Sequelize.literal('hits'), 'DESC']);
      }
      order.push(['created_at', sort === 'false' ? 'DESC' : 'ASC']);

      const posts = await ctx.model.Post.findAndCountAll({
        attributes: [
          ...Object.keys(ctx.model.Post.attributes),
          [app.Sequelize.literal('(SELECT COUNT(*) FROM post_hits WHERE post_hits.post_id = post.id)'), 'hits'],
        ],
        where: postQuery,
        offset: start,
        limit: count,
        order,
      });

      // admin权限每条post注入user信息
      // TODO optimize user query
      /* istanbul ignore next */
      if (ctx.state.auth.role === 'admin' || embed) {
        const surplusUsers = _.difference(
          posts.rows.map(p => p.user_id.toString()),
          users.map(u => u.id.toString()),
        );
        if (surplusUsers.length > 0) {
          users = users.concat(await ctx.service.post.queryUserandAdmin({
            id: { $in: surplusUsers },
          }));
        }
      }

      ctx.jsonBody = _.pickBy({
        count: posts.count,
        start,
        items: posts.rows,
        users: embed ? users : undefined,
      }, x => !_.isNil(x));
    }

    /**
     * 发表帖子
     *
     * @memberof PostController
     * @returns {object} 帖子详情
     */
    async create() {
      const { ctx, service } = this;
      ctx.authPermission();
      await ctx.validate(this.createRule);
      const {
        category_id: categoryId,
        cover_ids: coverIds,
        content,
        theme,
      } = ctx.request.body;

      // 依赖文件检测
      await service.postCategory.getByIdOrThrow(categoryId);
      /* istanbul ignore else */
      if (coverIds.length > 0) {
        const files = await service.file.count(coverIds);
        ctx.error(files.count === coverIds.length, '包含不存在的图片', 16000);
      }
      const contentFilted = await ctx.service.sensitiveWord.filterContent(content);
      const themeFilted = await ctx.service.sensitiveWord.filterContent(theme);
      const post = await ctx.model.Post.create(Object.assign({}, ctx.request.body, {
        user_id: ctx.state.auth.user.id,
        content_filted: contentFilted.content,
        theme_filted: themeFilted.content,
        sensitive_words: contentFilted.words.concat(themeFilted.words),
      }));
      if (contentFilted.words.length > 0) {
        await ctx.service.notification.send2Indivitual(
          ctx.state.auth.user.id,
          app.model.Notification.TYPE.POST,
          `您发布的帖子"${post.theme}"包含敏感词(${contentFilted.words.join(',')}),未通过审核`,
        );
      }

      ctx.jsonBody = post;
    }

    /**
     * 修改帖子
     *
     * @memberof PostController
     * @returns {object} 帖子详情
     */
    async patch() {
      const { ctx, service } = this;
      await ctx.validate(this.patchRule);
      const {
        category_id: categoryId,
        cover_ids: coverIds,
        content,
        theme,
      } = ctx.request.body;

      const post = await service.post.getByIdOrThrow(ctx.params.id);
      ctx.checkPermission(post.user_id);

      // 依赖文件检测
      if (categoryId) await service.postCategory.getByIdOrThrow(categoryId);
      /* istanbul ignore else */
      if (coverIds) {
        const files = await service.file.count(coverIds);
        ctx.error(files.count === coverIds.length, '包含不存在的图片', 16000);
      }

      // 更改post
      Object.assign(post, ctx.request.body);
      /* istanbul ignore next */
      if (content || theme) {
        const contentFilted = content ?
          await ctx.service.sensitiveWord.filterContent(content) : undefined;
        const themeFilted = theme ?
          await ctx.service.sensitiveWord.filterContent(theme) : undefined;
        Object.assign(post, ctx.request.body, _.pickBy({
          content_filted: content ? contentFilted.content : undefined,
          theme_filted: theme ? themeFilted.content : undefined,
          sensitive_words: theme && content ? // eslint-disable-line
          contentFilted.words.concat(themeFilted.words) : // eslint-disable-line
          (theme ? themeFilted.words : contentFilted.words), // eslint-disable-line
        }));
        if (contentFilted.words.length > 0) {
          await ctx.service.notification.send2Indivitual(
            ctx.state.auth.user.id,
            app.model.Notification.TYPE.POST,
            `您已修改的帖子"${post.theme}"包含敏感词(${contentFilted.words.join(',')}),未通过审核`,
          );
        }
      }
      await post.save();

      ctx.jsonBody = post;
    }

    /**
     * 批量删除帖子
     *
     * @memberof PostController
     * @returns {array} 帖子列表
     */
    async batchDestroy() {
      const { ctx } = this;
      ctx.authPermission();
      await this.ctx.validate(this.batchDestroyRule, () => {
        ctx.assert(ctx.query.post_ids, 400, 'post_ids 为必传参数');
        const postIds = ctx.query.post_ids.split(',');
        return { post_ids: postIds };
      });
      const postIds = ctx.query.post_ids.split(',');

      const posts = await ctx.model.Post.findAll({
        where: {
          id: { $in: postIds },
        },
      });

      // 个人用户只能删除自己文章
      if (ctx.state.auth.role === 'user') posts.forEach(p => ctx.checkPermission(p.user_id));

      await ctx.model.Post.destroy({
        where: {
          id: { $in: postIds },
        },
      });

      ctx.jsonBody = posts;
    }

    /**
     * 获取帖子详情
     *
     * @memberof PostController
     * @returns {object} 帖子详情
     */
    async detail() {
      const { ctx, service } = this;
      await ctx.validate(this.detailRule);
      const { id: postId } = ctx.params;

      const post = await service.post.getByIdOrThrow(postId);

      // 非帖子拥有用户验证是否有敏感词
      if (ctx.state.auth.role === 'user' && ctx.state.auth.user.id !== post.user_id) {
        ctx.error(post.sensitive_words.length === 0, '禁止访问含有敏感词帖子', 23000);
      }

      // 增加帖子被阅读/帖子阅读量/评论数/点赞数/用户是否点赞
      await service.postHits.hits(ctx.state.auth.token, post);
      const hitsCount = await service.postHits.getCount(postId);
      const voteCount = await service.postVote.getCount(postId);
      const commentCount = await service.postComment.getCount(postId);
      /* istanbul ignore next */
      const vote = ctx.state.auth.user ?
        await service.postVote.getVote(ctx.state.auth.user.id, postId) :
        false;

      // 注入user信息
      const [user] = await service.post.queryUserandAdmin({ id: post.user_id });

      /* istanbul ignore next */
      ctx.jsonBody = Object.assign({}, post.toJSON(), {
        hits: hitsCount,
        votes: voteCount,
        comments: commentCount,
        vote: vote ? vote.toJSON() : undefined,
        user: user ? user.toJSON() : undefined,
      });
    }

    /**
     * 获取帖子评论列表
     *
     * @memberof PostController
     * @returns {object} 帖子评论列表
     */
    async commentsIndex() {
      const { ctx } = this;
      const query = await ctx.validate(
        this.commentsIndexRule,
        this.ctx.helper.preprocessor.pagination,
      );
      await ctx.service.post.getByIdOrThrow(ctx.params.id);
      const {
        count, start, sort, embed,
      } = query;

      const comments = await ctx.model.PostComment.findAndCountAll({
        where: { post_id: ctx.params.id },
        offset: start,
        limit: count,
        order: [['created_at', sort === 'false' ? 'DESC' : 'ASC']],
      });
      let users;
      if (embed) {
        users = await this.service.user.findByIds(comments.rows.map(o => o.user_id));
      }

      ctx.jsonBody = _.pickBy({
        count: comments.count,
        start,
        items: comments.rows,
        users: embed ? users : undefined,
      }, x => !_.isNil(x));
    }

    /**
     * 对帖子发表评论
     *
     * @memberof PostController
     * @returns {object} 帖子评论详情
     */
    async createComment() {
      const { ctx, service } = this;
      ctx.authPermission();
      await ctx.validate(this.createCommentRule);
      await service.post.getByIdOrThrow(ctx.params.id);
      const { content } = ctx.request.body;

      const filted = await ctx.service.sensitiveWord.filterContent(content, { replace: true });
      const comment = await ctx.model.PostComment.create({
        content,
        content_filted: filted.content,
        post_id: ctx.params.id,
        user_id: ctx.state.auth.user.id,
      });

      this.ctx.jsonBody = comment;
    }

    /**
     * 对帖子点赞
     *
     * @memberof PostController
     * @returns {object} 点赞详情
     */
    async createVote() {
      const { ctx, service } = this;
      ctx.authPermission();
      await ctx.validate(this.createVoteRule);
      await service.post.getByIdOrThrow(ctx.params.id);

      const isVoted = await service.postVote.isVoted(
        ctx.state.auth.user.id,
        ctx.params.id,
      );
      ctx.error(!isVoted, '禁止对已点赞帖子重复点赞', 22000);
      const vote = await ctx.model.PostVote.create({
        post_id: ctx.params.id,
        user_id: ctx.state.auth.user.id,
      });

      ctx.jsonBody = vote;
    }

    /**
     * 对帖子取消点赞
     *
     * @memberof PostController
     * @returns {null} 无返回
     */
    async destroyVote() {
      const { ctx, service } = this;
      ctx.authPermission();
      await ctx.validate(this.destroyVoteRule);
      await service.post.getByIdOrThrow(ctx.params.id);

      const vote = await service.postVote.getVote(ctx.state.auth.user.id, ctx.params.id);
      ctx.assert(vote, 404);
      await vote.destroy({ force: true });

      ctx.body = '取消点赞成功';
    }
  }

  return PostController;
};
