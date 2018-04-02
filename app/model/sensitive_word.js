module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
    STRING,
  } = app.Sequelize;

  /**
   * 敏感词Model
   *
   * @model SensitiveWord
   * @namespace Model
   * @property {uuid}   id
   * @property {string} key         - 敏感词
   */
  const SensitiveWord = app.model.define('sensitive_word', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    key: {
      type: STRING(64),
      allowNull: false,
    },
  });

  return SensitiveWord;
};
