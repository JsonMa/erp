const util = require('utility');
const co = require('co');
const assert = require('assert');
const converter = require('xml-js');

const API = {
  UNIFIEDORDER: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
};


module.exports = (app) => {
  /**
   * Wechat 支付 Service
   *
   * @class Wechat
   * @extends {app.Service}
   */
  class Wechat extends app.Service {
    /**
     * Creates an instance of Wechat.
     * @param {Context} ctx Context
     * @memberof Wechat
     */
    constructor(ctx) {
      super(ctx);
      const config = app.config.wechat;
      const { host } = app.config;

      assert(config.appid, '[shubang] appid is required in config.wechat');
      assert(config.mch_id, '[shubang] mch_id is required in config.wechat');
      assert(config.trade_type, '[shubang] trade_type is required in config.wechat');
      assert(config.key, '[shubang] key is required in config.wechat');

      this.defaults = {
        notify_url: host + ctx.helper.pathFor('wechat_notify'),
        appid: config.appid,
        mch_id: config.mch_id,
        trade_type: config.trade_type,
      };

      this.key = config.key;
    }

    /**
     * 生成请求参数签名
     *
     * @param {object} param 请求参数
     * @returns {string} 签名
     * @memberof Wechat
     */
    sign(param) {
      const query = `${Object.keys(param).sort().map(key => `${key}=${param[key]}`)
        .join('&')}&key=${this.key}`;
      return util.md5(query).toUpperCase();
    }

    /**
     * 验证参数签名
     *
     * @param {object} param 响应参数
     * @returns {boolean} 签名是否合法
     * @memberof Wechat
     */
    verify(param) {
      const param_ = Object.assign({}, param);
      const {
        sign,
      } = param;
      delete param_.sign;

      const actualSign = this.sign(param_).toUpperCase();
      return sign === actualSign;
    }

    /* eslint-disable max-len */
    /**
     * 生成随机字符串
     *
     * @param {number} [length=16] 长度
     * @param {string} [candidates='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'] 备选字符
     * @returns {string} 随机字符串
     * @memberof Wechat
     */
    nonceStr(length = 16, candidates = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
      return util.randomString(length, candidates);
    }
    /* eslint-enable max-len */

    /**
     * 发送请求，自动处理xml转换
     *
     * @param {string} url 请求URL
     * @param {object} [data={}] 请求body
     * @returns {object} response
     * @memberof Wechat
     */
    request(url, data = {}) {
      const signedData = Object.assign({}, data, {
        sign: this.sign(data),
      });
      return app.curl(url, {
        method: 'POST',
        data: this.object2Xml(signedData),
      }).then(resp => Object.assign({}, resp, {
        data: this.xml2Object(resp.data),
      }));
    }

    /**
     * xml 转 json
     *
     * @param {string} xml xml
     * @returns {object} json
     * @memberof Wechat
     */
    xml2Object(xml) {
      /**
       *  简化xml返回的object
       *
       * @param {object} object xml解析出的Object
       * @returns {object} 简化后的object
       */
      function simplify(object) {
        if (object._cdata) {
          return object._cdata;
        }
        if (object._text) {
          return object._text;
        }
        /* istanbul ignore if */
        if (!(typeof object === 'object')) {
          return {};
        }
        return Object.assign(
          {},
          ...Object.keys(object).map(key => ({
            [key]: simplify(object[key]),
          })),
        );
      }
      const complex = converter.xml2js(xml, {
        compact: true,
      });
      return simplify(complex.xml);
    }
    /**
     * json 转 xml
     *
     * @param {object} object object
     * @returns {string} xml
     * @memberof Wechat
     */
    object2Xml(object) {
      return converter.js2xml({
        xml: object,
      }, {
        compact: true,
      });
    }

    /**
     * 将UUID转换为32位的trade_no
     *
     * @param {uuid} uuid uuid
     * @returns {string} trade_no
     * @memberof Wechat
     */
    uuid2tn(uuid) {
      assert.equal(typeof uuid, 'string');
      return uuid.replace(/-/g, '');
    }

    /**
     * 将trade_no转换为uuid
     *
     * @param {string} tn trade_no
     * @returns {uuid} uuid
     * @memberof Wechat
     */
    tn2uuid(tn) {
      assert.equal(typeof tn, 'string');
      assert.equal(tn.length, 32);
      return `${tn.slice(0, 8)}-${tn.slice(8, 12)}-${tn.slice(12, 16)}-${tn.slice(16, 20)}-${tn.slice(20, 32)}`;
    }

    /**
     * 创建交易订单
     *
     * @param {uuid} orderId 订单id
     * @return {Trade} trade
     * @memberof Wechat
     */
    createTrade(orderId) {
      const {
        ctx,
        defaults,
        nonceStr,
        uuid2tn,
      } = this;
      const sign = this.sign.bind(this);
      const request = this.request.bind(this);
      return co.wrap(function* () {
        const order = yield app.model.Order.findById(orderId);
        ctx.error(order, '订单不存在', 25001);
        ctx.error(order.status === app.model.Order.STATUS.CREATED, '订单状态有误，不能发起支付', 25002);
        ctx.userPermission(order.user_id);

        const commodity = yield app.model.Commodity.findById(order.commodity_id);
        assert(commodity);

        const trade = yield app.model.Trade.create({
          order_id: order.id,
          type: app.model.Trade.TYPE.WECHAT,
        });

        const data = Object.assign({
          nonce_str: nonceStr(),
        }, defaults, {
          body: commodity.name,
          out_trade_no: uuid2tn(trade.id),
          total_fee: Math.floor(order.realPrice * 100),
          spbill_create_ip: ctx.ip,
        });
        const resp = yield request(API.UNIFIEDORDER, data);
        ctx.error(resp.data.return_code === 'SUCCESS', resp.data.return_msg, 25003);

        const payload = {
          appid: resp.data.appid,
          partnerid: resp.data.mch_id,
          prepayid: resp.data.prepay_id,
          package: 'Sign=WXPay', // 固定值
          noncestr: nonceStr(),
          timestamp: Date.now().toString().slice(0, 10),
        };
        payload.sign = sign(payload);

        return [trade, payload];
      })();
    }
  }

  return Wechat;
};
