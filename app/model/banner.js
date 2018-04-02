module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
  } = app.Sequelize;

    /**
     * banner
     *
     * @model Banner
     * @namespace Model
     * @property {uuid}   id
     * @property {uuid}   picture_id - 文件名称
     */
  const Banner = app.model.define('banner', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    picture_id: {
      type: UUID,
      allowNull: false,
    },
  });

  return Banner;
};

