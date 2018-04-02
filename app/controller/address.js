const assert = require('assert');

module.exports = (app) => {
  /**
   * Address 相关路由
   *
   * @class AddressController
   * @extends {app.Controller}
   */
  class AddressController extends app.Controller {
    /**
     * create address 的参数规则
     *
     * @readonly
     * @memberof AddressController
     */
    get rule() {
      return {
        properties: {
          _id: this.ctx.helper.rule.uuid,
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 64,
          },
          phone: this.ctx.helper.rule.phone,
          location: {
            type: 'string',
            minLength: 1,
            maxLength: 256,
          },
          default: {
            type: 'boolean',
          },
        },
        required: ['name', 'phone', 'location'],
        $async: true,
        additionalProperties: false,
      };
    }


    /**
     * fetch address
     *
     * @memberof AddressController
     * @return {Address} address
     */
    async get() {
      await this.ctx.validate({
        ...this.rule,
        required: ['_id'],
      });
      const address = await this.app.model.Address.findById(this.ctx.params._id);
      this.ctx.assert(address, 404);
      this.ctx.checkPermission(address.user_id);

      this.ctx.jsonBody = address;
    }

    /**
     * create address
     *
     * @memberof AddressController
     * @return {Address} 创建后的address
     */
    async create() {
      await this.ctx.userPermission();
      const params = await this.ctx.validate({
        ...this.rule,
        required: ['name', 'phone', 'location'],
      });
      const userId = this.ctx.state.auth.user.id;

      /* istanbul ignore else */
      if (params.default) {
        await this.app.model.Address.update({ default: false }, {
          where: { user_id: userId },
        });
      }

      const address = await this.app.model.Address.create({
        ...this.ctx.request.body,
        user_id: userId,
      });
      this.ctx.jsonBody = address;
    }

    /**
     * update address
     *
     * @memberof AddressController
     * @return {Address} 修改后的address
     */
    async update() {
      const param = await this.ctx.validate({
        ...this.rule,
        required: ['_id'],
      });

      const address = await this.app.model.Address.findById(this.ctx.params._id);
      this.ctx.assert(address, 404);
      this.ctx.checkPermission(address.user_id);

      /* istanbul ignore else */
      if (param.default) {
        await this.app.model.Address.update({ default: false }, {
          where: { user_id: address.user_id },
        });
      }

      const [count, newAddresses] = await this.app.model.Address.update(param, {
        where: {
          id: this.ctx.params._id,
        },
        returning: true,
      });

      assert.equal(count, 1); // 指定了id, 有且只能为1
      [this.ctx.jsonBody] = newAddresses;
    }

    /**
     * delete address
     *
     * @memberof AddressController
     * @return {Address} 已删除的address
     */
    async delete() {
      await this.ctx.validate({
        ...this.rule,
        required: ['_id'],
      });

      const address = await this.app.model.Address.findById(this.ctx.params._id);
      this.ctx.checkPermission(address.user_id);

      this.ctx.assert(address, 404);
      await address.destroy();

      this.ctx.jsonBody = address;
    }
  }
  return AddressController;
};
