const fs = require('fs');

module.exports = (app) => {
  /**
   * file相关Controller
   *
   * @class fileController
   * @extends {app.Controller}
   */
  class fileController extends app.Controller {
    /**
     * 参数验证-上传文件
     *
     * @readonly
     * @memberof fileController
     */
    get uploadRule() {
      return {
        properties: {
          files: {
            type: 'array',
            items: this.ctx.helper.rule.file,
          },
        },
        required: ['files'],
        $async: true,
        additionalProperties: false,
      };
    }
    /**
     * 参数验证-获取文件
     *
     * @readonly
     * @memberof fileController
     */
    get showRule() {
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
     * 上传文件
     *
     * @memberof fileController
     * @returns {object} 上传的文件
     */
    async upload() {
      const { ctx, uploadRule } = this;
      const { files } = ctx.request;
      await ctx.validate(uploadRule);

      const reqFiles = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        path: file.path,
      }));
      const createdFiles = await app.model.File.bulkCreate(reqFiles);

      ctx.jsonBody = createdFiles.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
      }));
    }

    /**
     * 获取文件
     *
     * @memberof fileController
     * @returns {object} 文件详情
     */
    async show() {
      const { ctx, service, showRule } = this;
      await ctx.validate(showRule);
      const file = await service.file.getByIdOrThrow(ctx.params.id);

      ctx.body = fs.createReadStream(file.path);
      ctx.type = file.type;
      ctx.attachment(file.name);
      ctx.set('Cache-Control', 'max-age=8640000');
    }
  }
  return fileController;
};

