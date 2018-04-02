module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
    TEXT,
    INTEGER,
  } = app.Sequelize;

  /**
   * 帖子评论
   *
   * @model Comment
   * @namespace Model
   * @property {uuid}   id
   * @property {string} content - 评论内容
   * @property {string} content_filted - 已过滤敏感词评论内容
   * @property {uuid}   post_id - 帖子id
   * @property {uuid}   user_id - 发表评论的用户id
   */
  const PostComment = app.model.define('post_comment', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    content: {
      type: TEXT,
      allowNull: false,
    },
    content_filted: {
      type: TEXT,
      allowNull: false,
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

  return PostComment;
};
