module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
    STRING,
  } = app.Sequelize;

  /**
   * 地址Model
   *
   * @model Logistics
   * @namespace Model
   * @property {uuid}    id
   * @property {uuid}    order_id     - 订单号
   * @property {string}  company      - 快递公司
   * @property {string}  order_no     - 快递单号
   *
   */
  const Logistics = app.model.define('logistics', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    order_id: {
      type: UUID,
      allowNull: false,
      unique: true,
    },
    company: STRING(32),
    order_no: STRING(32),
  });

  return Logistics;
};
