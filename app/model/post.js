module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
    STRING,
    TEXT,
    INTEGER,
    ARRAY,
  } = app.Sequelize;

  /**
   * 帖子Model
   *
   * @model Post
   * @namespace Model
   * @property {uuid}   id
   * @property {number} no                 - 帖子序列号
   * @property {string} theme              - 帖子主题
   * @property {string} theme_filted       - 已过滤帖子主题
   * @property {string} content            - 帖子内容
   * @property {string} content_filted     - 已过滤帖子内容
   * @property {uuid}   cover_id           - 帖子封面文件id
   * @property {uuid}   user_id            - 帖子所属用户id
   * @property {uuid}   category_id        - 帖子所属分类id
   * @property {array}  sensitive_words - 帖子包含敏感词
   */
  const Post = app.model.define('post', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    no: {
      type: INTEGER,
      autoIncrement: true,
    },
    theme: {
      type: STRING(200),
      allowNull: false,
    },
    theme_filted: {
      type: STRING(600),
      allowNull: false,
    },
    content: {
      type: TEXT,
      allowNull: false,
    },
    content_filted: {
      type: TEXT,
      allowNull: false,
    },
    cover_ids: {
      type: ARRAY(UUID),
      allowNull: false,
      defaultValue: [],
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
    },
    category_id: {
      type: UUID,
      allowNull: false,
    },
    sensitive_words: {
      type: ARRAY(STRING),
      allowNull: false,
      defaultValue: [],
    },
  });

  Post.associate = function () {
    app.model.Post.hasMany(app.model.PostHits, { foreignKey: 'post_id' });
  };

  return Post;
};
