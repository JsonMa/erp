module.exports = (app) => {
  const {
    STRING,
    INTEGER,
  } = app.Sequelize;

  /**
   * 管理员Model
   *
   * @model Admin
   * @namespace Model
   * @property {uuid}    id
   * @property {string}  account    - 账户
   * @property {string}  name       - 昵称
   * @property {string}  phone      - 电话
   * @property {string}  email      - 邮箱
   * @property {string}  role_id    - 角色
   *
   */
  const Admin = app.model.define('admin_user', {
    account: STRING(64),
    name: {
      type: STRING(64),
      field: 'account',
      allowNull: false,
    },
    nickname: STRING(64),
    phone: {
      type: STRING,
      field: 'tel',
    },
    password: {
      type: STRING,
      allowNull: false,
    },
    email: STRING(128),
    role_id: {
      type: INTEGER,
      allowNull: false,
    },
  }, {
    createdAt: 'create_time',
    updatedAt: 'update_time',
    deletedAt: false,
    paranoid: false,
  });

  return Admin;
};
