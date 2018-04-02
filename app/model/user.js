module.exports = (app) => {
  const {
    STRING,
  } = app.Sequelize;

  /**
   * 用户Model
   *
   * @model User
   * @namespace Model
   * @property {uuid}    id
   * @property {string}  id_card_no - 身份证号
   * @property {string}  name       - 真实姓名
   * @property {string}  phone      - 电话
   * @property {string}  nickname   - 昵称
   *
   */
  const User = app.model.define('system_driver_info', {
    id_card_no: {
      type: STRING,
      field: 'driver_idnumber',
    },
    name: {
      type: STRING,
      field: 'driver_name',
      allowNull: false,
    },
    phone: {
      type: STRING,
      field: 'driver_phone',
      allowNull: false,
    },
    password: {
      type: STRING,
      field: 'driver_password',
      allowNull: false,
    },
    nickname: {
      type: STRING,
      field: 'driver_nickname',
    },
    avatar: {
      type: STRING,
      field: 'driver_avatar',
    },
  }, {
    createdAt: 'create_time',
    updatedAt: 'update_time',
    deletedAt: false,
    paranoid: false,
  });

  return User;
};
