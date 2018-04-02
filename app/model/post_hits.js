module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
  } = app.Sequelize;

  /**
   * 浏览帖子
   *
   * @model PostHits
   * @namespace Model
   * @property {uuid}   id
   * @property {uuid}   post_id    - 帖子id
   * @property {uuid}   session_id - 浏览的用户id
   */
  const PostHits = app.model.define('post_hits', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    session_id: {
      type: UUID,
      allowNull: false,
    },
  });

  PostHits.associate = function () {
    PostHits.belongsTo(app.model.Post, { foreignKey: 'post_id' });
  };

  return PostHits;
};
