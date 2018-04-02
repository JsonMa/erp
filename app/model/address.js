module.exports = (app) => {
  const {
    STRING,
    UUID,
    UUIDV1,
    BOOLEAN,
    INTEGER,
  } = app.Sequelize;

  /**
   * 地址Model
   *
   * @model Address
   * @namespace Model
   * @property {uuid}    id
   * @property {integer} user_id    - 用户id
   * @property {string}  name       - 收件人姓名
   * @property {string}  phone      - 收件人电话
   * @property {string}  location   - 收件地址
   * @property {boolean} default   -  是否为默认地址
   *
   */
  const Address = app.model.define('address', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
    },
    name: STRING(64),
    phone: STRING(32),
    location: STRING(256),
    default: BOOLEAN,
  });

  return Address;
};
