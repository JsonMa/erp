module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
    STRING,
  } = app.Sequelize;

  /**
   * 帖子分类Model
   *
   * @model PostCategory
   * @namespace Model
   * @property {uuid}   id
   * @property {string} name     - 分类名称
   * @property {uuid}   cover_id - 分类封面文件id
   */
  const PostCategory = app.model.define('post_category', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    name: {
      type: STRING(64),
      allowNull: false,
    },
    cover_id: {
      type: UUID,
      allowNull: false,
    },
  });

  return PostCategory;
};
