const fs = require('fs');
const iconv = require('iconv-lite');
const jschardet = require('jschardet');
const _ = require('lodash');

module.exports = (app) => {
  /**
   * SensitiveWord 相关路由
   *
   * @class SensitiveWordController
   * @extends {app.Controller}
   */
  class SensitiveWordController extends app.Controller {
    /**
     * 获取敏感词列表 的参数规则
     *
     * @readonly
     * @memberof SensitiveWordController
     */
    get indexRule() {
      return {
        properties: {
          word: {
            type: 'string',
            minLength: 1,
          },
          ...this.ctx.helper.rule.pagination,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 创建敏感词 的参数规则
     *
     * @readonly
     * @memberof SensitiveWordController
     */
    get createRule() {
      return {
        properties: {
          key: {
            type: 'string',
            maxLength: 32,
            minLength: 1,
          },
        },
        required: ['key'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 修改敏感词 的参数规则
     *
     * @readonly
     * @memberof SensitiveWordController
     */
    get updateRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
          key: {
            type: 'string',
            maxLength: 32,
            minLength: 1,
          },
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 删除敏感词 的参数规则
     *
     * @readonly
     * @memberof SensitiveWordController
     */
    get deleteRule() {
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
     * 导入敏感词 的参数规则
     *
     * @readonly
     * @memberof SensitiveWordController
     */
    get importRule() {
      return {
        properties: {
          fid: this.ctx.helper.rule.uuid,
        },
        required: ['fid'],
        $async: true,
        additionalProperties: false,
      };
    }


    /**
     * 获取敏感词列表
     *
     * @memberof SensitiveWordController
     * @returns {[SensitiveWord]} 敏感词列表
     */
    async index() {
      const { ctx, indexRule } = this;
      ctx.adminPermission();
      const query = await ctx.validate(indexRule, ctx.helper.preprocessor.pagination);
      const { start, count, sort } = query;
      const word = query.word ? decodeURI(query.word) : undefined;

      const where = {};
      if (word) where.key = { $like: `%${word}%` };
      const words = await ctx.model.SensitiveWord.findAndCount({
        where,
        offset: start,
        limit: count,
        order: [['created_at', sort === 'false' ? 'DESC' : 'ASC']],
      });

      ctx.jsonBody = {
        count: words.count,
        start,
        items: words.rows,
      };
    }

    /**
     * 创建敏感词
     *
     * @memberof SensitiveWordController
     * @returns {SensitiveWord} 创建的敏感词
     */
    async create() {
      const { ctx, createRule } = this;
      ctx.adminPermission();
      await ctx.validate(createRule);

      // findOrCreate 返回值为数组,[model, 是否存在]
      const [word] = await ctx.model.SensitiveWord.findOrCreate({
        where: { key: ctx.request.body.key },
      });
      ctx.service.sensitiveWord.runFilters();

      ctx.jsonBody = word;
    }

    /**
     * 修改敏感词
     *
     * @memberof SensitiveWordController
     * @returns {SensitiveWord} 修改后的敏感词
     */
    async update() {
      const { ctx, updateRule } = this;
      ctx.adminPermission();
      await ctx.validate(updateRule);

      // 验证修改敏感词存在
      const word = await ctx.model.SensitiveWord.findById(ctx.params.id);
      ctx.assert(word, 404);

      // 验证修改后词是否重复
      const exsitenceWord = await ctx.model.SensitiveWord.findOne({
        where: { key: ctx.request.body.key },
      });
      ctx.error(!exsitenceWord, '该关键词已经存在', 24000);

      Object.assign(word, { key: ctx.request.body.key });
      await word.save();
      ctx.service.sensitiveWord.runFilters();

      ctx.jsonBody = word;
    }

    /**
     * 删除敏感词
     *
     * @memberof SensitiveWordController
     * @returns {SensitiveWord} 删除的敏感词
     */
    async delete() {
      const { ctx, deleteRule } = this;
      ctx.adminPermission();
      await this.ctx.validate(deleteRule, (args) => {
        ctx.assert(args.ids, 400, 'ids 为必传参数');
        const wordIds = args.ids.split(',');
        return { ids: wordIds };
      });
      const wordIds = ctx.query.ids.split(',');

      const words = await ctx.model.SensitiveWord.findAll({
        where: { id: { $in: wordIds } },
      });

      await ctx.model.SensitiveWord.destroy({
        where: { id: { $in: wordIds } },
      });
      ctx.service.sensitiveWord.runFilters();

      ctx.jsonBody = words;
    }

    /**
     * 敏感词导入
     *
     * @memberof SensitiveWordController
     * @returns {SensitiveWord} 导入的敏感词列表
     */
    async import() {
      const { ctx, importRule } = this;
      ctx.adminPermission();
      await ctx.validate(importRule);

      // 确保上传文件存在且为txt文件
      const file = await ctx.model.File.findById(ctx.request.body.fid);
      ctx.assert(file, 1600, '未找到上传TXT文件');
      ctx.error(!!file.type.match(/text\/plain$/g), '请上传TXT格式文件', 24001);

      // 提取TXT文件内容
      const buffer = fs.readFileSync(file.path);
      const encodeType = jschardet.detect(buffer);
      ctx.error(encodeType.encoding === 'UTF-8', 'TXT文件仅支持UTF-8编码方式', 24003);
      const data = iconv.decode(Buffer.from(buffer), encodeType.encoding);
      ctx.error(data !== '', '请在TXT文件中填入敏感词', 24002);

      const injectWords = _.uniq(_.compact(data.replace(/，/g, ',').split(',')));
      injectWords.forEach((w) => { // 验证每个敏感词长度
        ctx.error(w.length > 0 && w.length < 32, `敏感词:"${w}" 长度小于1或大于32,请修改后重新上传`, 24004);
      });
      const existWords = await ctx.model.SensitiveWord.findAll({
        where: { key: { $in: injectWords } },
      });
      /* istanbul ignore next */
      const words = await ctx.model.SensitiveWord
        .bulkCreate((_.difference(injectWords, existWords.map(w => w.key)).map(w => ({ key: w }))));
      ctx.service.sensitiveWord.runFilters();

      ctx.jsonBody = words;
    }

    /**
     * 敏感词导出
     *
     * @memberof SensitiveWordController
     * @returns {SensitiveWord} 敏感词文件
     */
    async export() {
      const { ctx } = this;
      ctx.adminPermission();

      const words = await ctx.model.SensitiveWord.findAll();
      const stream = Buffer.from((words.map(w => w.key)).join(','));

      ctx.set('Content-Type', 'application/octe-stream');
      ctx.set('Content-Disposition', 'attachment;filename=sensitive_words.txt');

      ctx.body = stream;
    }
  }
  return SensitiveWordController;
};
