const assert = require('assert');
const {
  Service,
} = require('egg');

module.exports = () => {
  /**
   * User Service
   *
   * @class UserService
   * @extends {Service}
   */
  class UserService extends Service {
  /**
   * 根据ids查找用户
   *
   * @param {[UUID]} ids 用户id数组
   * @memberof UserService
   * @returns {[User]} 用户数组
   */
    async findByIds(ids) {
      assert(ids instanceof Array);

      return this.app.model.User.findAll({
        where: {
          id: {
            $in: ids,
          },
        },
        attributes: ['id', 'name', 'nickname', 'avatar', 'phone'],
        paranoid: false,
      });
    }
  }

  return UserService;
};
