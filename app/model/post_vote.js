module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
    INTEGER,
  } = app.Sequelize;

  /**
   * 帖子点赞
   *
   * @model PostVote
   * @namespace Model
   * @property {uuid}    id
   * @property {uuid}    post_id - 帖子id
   * @property {uuid}    user_id - 点赞的用户id
   */
  const PostVote = app.model.define('post_vote', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    post_id: {
      type: UUID,
      allowNull: false,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
    },
  });

  return PostVote;
};
