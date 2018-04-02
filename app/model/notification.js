module.exports = (app) => {
  const {
    STRING,
    INTEGER,
  } = app.Sequelize;

  /**
   * 地址Model
   *
   * @model Address
   * @namespace Model
   * @property {uuid}    id
   * @property {integer} uid    - 用户id
   * @property {string}  type       - 消息类型
   * @property {string}  content    - 消息内容
   * @property {string}  platform   - 推送平台
   * @property {string}  status     - 消息状态
   * @property {string}  read       - 消息是否已读
   *
   */
  const Notification = app.model.define('notice', {
    id: {
      type: INTEGER(64),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    uid: INTEGER(64),
    type: STRING(16),
    content: STRING(255),
    platform: {
      type: STRING(255),
      defaultValue: 'all',
    },
    status: {
      type: INTEGER(16),
      defaultValue: 1,
    },
    read: {
      type: INTEGER(16),
      defaultValue: 1,
    },
  }, {
    createdAt: 'start_time',
    updatedAt: 'update_time',
    deletedAt: false,
    paranoid: false,
  });

  Notification.TYPE = {
    SYSTEM: 1,
    WARNING: 2,
    PROBLEM: 3,
    ORDER: 4,
    POST: 5,
  };

  Notification.STATUS = {
    VALID: 1,
    INVALID: 0,
  };

  Notification.READ = {
    TRUE: 0,
    FALSE: 1,
  };

  return Notification;
};
