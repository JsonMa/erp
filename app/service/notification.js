const assert = require('assert');
const JPush = require('jpush-sdk');

module.exports = (app) => {
  /**
   * 推送 Service
   *
   * @class NotificationService
   * @extends {Service}
   */
  class NotificationService extends app.Service {
    /**
     * Creates an instance of NotificationService.
     * @param {any} ctx context
     * @memberof NotificationService
     */
    constructor(ctx) {
      super(ctx);
      const config = app.config.jpush;

      assert(config, '[NotificationService] jpush is required in config');
      assert(config.key, '[NotificationService] jpush.appKey is required in config');
      assert(config.secret, '[NotificationService] jpush.secret is required in config');

      const {
        key,
        secret,
        retryTimes,
      } = config;
      this.client = new JPush.buildClient(key, secret, retryTimes, !app.isProd); // eslint-disable-line
    }

    /**
     * 推送消息
     *
     * @param {object} option 推送设置
     * @returns {null} 无返回
     * @memberof NotificationService
     */
    async push(option) {
      const { client, logger } = this;
      const notification = await new Promise(((resolve) => {
        client.sendPush(JSON.stringify(Object.assign({
          audience: JPush.ALL,
          platform: JPush.ALL,
        }, option)), (err, res) => {
          if (err) {
            logger.error(err, err.message);
            // 失败后仅用log记录
            resolve(null);
          }
          resolve(res);
          logger.info('[jpush]: ', res);
        });
      }));

      return notification;
    }


    /**
     * 添加用户消息
     *
     * @param {uuid} userId user id
     * @param {int} type type
     * @param {string} message message
     * @returns {notification} notification
     * @memberof NotificationService
     */
    async send2Indivitual(userId, type, message) {
      const {
        User,
        Notification,
      } = app.model;
      assert(type <= 5 && type >= 1);
      const title = ['系统消息', '告警消息', '故障消息', '订单消息', '帖子消息'][type];
      const user = await User.findById(userId);
      const notification = await Notification.create({
        uid: userId,
        type,
        content: message,
      });

      const count = await Notification.count({
        where: {
          status: Notification.STATUS.VALID,
          read: Notification.READ.FALSE,
        },
      });

      await this.push({
        audience: {
          alias: [user.phone],
        },
        notification: {
          android: {
            alert: message,
            title,
            extras: {
              unread: count,
            },
          },
          ios: {
            alert: message,
            extras: {
              unread: count,
            },
          },
        },
        options: {
          time_to_live: 60,
          apns_production: app.isProd,
        },
      });

      return notification;
    }
  }

  return NotificationService;
};
