const _ = require('lodash');

module.exports = (app) => {
  /**
   * 敏感词相关service
   *
   * @class SensitiveWord
   * @extends {app.Service}
  */
  class SensitiveWord extends app.Service {
    /**
     * 生成excel buffer
     *
     * @memberof SensitiveWord
     * @returns {Promise}   - sensitive words map
    */
    getSensitiveWordMap() {
      return app.redis.get('SENSITIVE_WORD_MAP')
        .then(async (map) => {
          /* istanbul ignore else */
          if (map) return JSON.parse(map);
          /* istanbul ignore next */
          await this.setRedisWordsMap();
          /* istanbul ignore next */
          return JSON.parse(await app.redis.get('SENSITIVE_WORD_MAP'));
        });
    }

    /**
     * 生成敏感词字典(run in background)
     *
     * @memberof SensitiveWord
     * @param {array}  words - 敏感词数组
     * @returns {Promise}    - redis set words map
    */
    async setRedisWordsMap() {
      const map = {};
      const words = await app.model.SensitiveWord.findAll();
      words.map(w => w.key).forEach((w) => {
        let temp = map;
        for (let i = 0, len = w.length; i < len; i += 1) {
          if (!temp[w[i]]) temp[w[i]] = {};
          temp = temp[w[i]];
        }
        temp.isEnd = true;
      });
      return app.redis.set('SENSITIVE_WORD_MAP', JSON.stringify(map));
    }

    /**
     * 单个字符串敏感词过滤(run in background)
     *
     * @param {string} content      - 需要过滤的内容
     * @typedef {object} option
     * @property {boolean} replace  - 是否替换敏感词
     * @param   {option}   option   - 过滤配置
     * @typedef {object} filted
     * @property {string} content   - 已添加标记文本
     * @property {array} words      - 文本包含的关键字
     * @return {filted}             - 返回过滤后对象
    */
    async filterContent(content, option = { replace: false }) {
      const filtedWords = [];
      const startSymbol = '|<';
      const endSymbol = '>|';
      let filtedContent = content;
      const map = await this.getSensitiveWordMap();

      // 外层循环,控制检测content每个字符
      for (let i = 0, len = content.length; i < len; i += 1) {
        /* istanbul ignore next */
        if (content[i] === '|' || content[i] === '<' || content[i] === '>') { // 不做检测字符
          continue; // eslint-disable-line
        }
        let parent = map;
        let keyWord = '';
        let skip = 0;
        let found = false;
        // 内层循环,控制命中敏感词后检测敏感词检测和标记
        for (let j = i; j < len; j += 1) {
          if (!parent[content[j]]) { // 没有命中关键词跳出循环检测下一个字
            parent = map;
            break;
          }
          keyWord += content[j]; // 记录命中字符
          if (parent[content[j]].isEnd) {
            found = true;
            filtedWords.push(keyWord);
            skip = j - i;
            break;
          }
          parent = parent[content[j]];
        }
        if (skip > 1) {
          i += skip - 1;
        }
        if (!found) {
          continue;  // eslint-disable-line
        }
      }
      if (filtedWords.length > 0) { // 根据敏感词数组进行正则替换
        const wordsRegExp = /\*|\\|\^|\$|\+|\?|\./g;
        const regWords = (_.uniq(filtedWords)).map(w => w.replace(wordsRegExp, e => `\\${e}`));
        const regexp = new RegExp(regWords.join('|'), 'ig');
        if (option.replace) { // 过滤方式 - 替换
          filtedContent = filtedContent.replace(regexp, (str) => str.replace(/./g, '*')); // eslint-disable-line
        } else { // 过滤方式 - 添加标记
          filtedContent = filtedContent.replace(regexp, w => startSymbol + w + endSymbol);
        }
      }
      return { content: filtedContent, words: filtedWords };
    }

    /**
     * 后台执行过滤所有post和comment
     *
     * @memberof SensitiveWord
     * @returns {null} 无返回值
    */
    runFilters() {
      const { ctx } = this;
      app.runInBackground(function* () {
        yield ctx.service.sensitiveWord.setRedisWordsMap();
        yield ctx.service.post.filterPosts();
        yield ctx.service.postComment.filterComments();
      });
    }
  }

  return SensitiveWord;
};
