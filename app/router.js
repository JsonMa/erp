module.exports = (app) => {
  const { formidable, compress } = app.middleware;
  const wechat = require('co-wechat-body');

  /* istanbul ignore next */
  const prefix = app.config.noPrefix ? '' : app.config.prefix;

  // auth
  app.post(`${prefix}/auth/login`, 'auth.login'); // only available for dev

  // user
  app.get(`${prefix}/users/:_id/addresses`, 'user.addresses');
  app.get(`${prefix}/users/:_id/orders`, 'user.orders');
  app.get(`${prefix}/users/:id/posts`, 'user.posts');

  // order
  app.post(`${prefix}/orders`, 'order.create');
  app.get(`${prefix}/orders`, 'order.list');
  app.get(`${prefix}/orders/:_id`, 'order.fetch');
  app.get(`${prefix}/orders/:_id/logistics`, 'order.logistics');
  app.patch(`${prefix}/orders/:_id`, 'order.patch');

  // trade
  app.post(`${prefix}/trades`, 'trade.create');
  app.get(`${prefix}/trades/:_id`, 'trade.fetch');
  app.post('wechat_notify', `${prefix}/trades/wechat_notify`, wechat(), 'trade.wechatNotify');
  app.post('alipay_notify', `${prefix}/trades/alipay_notify`, 'trade.alipayNotify');


  // logistics
  app.post(`${prefix}/logistics`, 'logistics.create');

  // commodity
  app.get(`${prefix}/commodities`, 'commodity.index');
  app.get(`${prefix}/commodities/:id`, 'commodity.show');
  app.post(`${prefix}/commodities`, 'commodity.create');
  app.delete(`${prefix}/commodities`, 'commodity.batchDestroy');
  app.patch(`${prefix}/commodities`, 'commodity.batchUpdate');
  app.patch(`${prefix}/commodities/:id`, 'commodity.update');
  app.post(`${prefix}/commodities/:id/attributes`, 'commodity.createAttribute');
  app.get(`${prefix}/commodities/:id/attributes`, 'commodity.attributeIndex');
  app.get(`${prefix}/commodities/:id/attributes/:attr_id`, 'commodity.attributeShow');
  app.put(`${prefix}/commodities/:id/attributes/:attr_id`, 'commodity.attributeUpdate');
  app.delete(`${prefix}/commodities/:id/attributes/:attr_id`, 'commodity.destoryAttribute');

  // post
  app.get(`${prefix}/posts`, 'post.index');
  app.post(`${prefix}/posts`, 'post.create');
  app.delete(`${prefix}/posts`, 'post.batchDestroy');
  app.get(`${prefix}/posts/:id`, 'post.detail');
  app.patch(`${prefix}/posts/:id`, 'post.patch');
  app.get(`${prefix}/posts/:id/comments`, 'post.commentsIndex');
  app.post(`${prefix}/posts/:id/comments`, 'post.createComment');
  app.post(`${prefix}/posts/:id/vote`, 'post.createVote');
  app.delete(`${prefix}/posts/:id/vote`, 'post.destroyVote');

  // post_category
  app.get(`${prefix}/post_categories`, 'postCategory.index');
  app.post(`${prefix}/post_categories`, 'postCategory.create');
  app.patch(`${prefix}/post_categories/:id`, 'postCategory.update');
  app.delete(`${prefix}/post_categories`, 'postCategory.batchDestroy');

  // sensitive_word
  app.get(`${prefix}/sensitive_words`, 'sensitiveWord.index');
  app.post(`${prefix}/sensitive_words`, 'sensitiveWord.create');
  app.delete(`${prefix}/sensitive_words`, 'sensitiveWord.delete');
  app.post(`${prefix}/sensitive_words/import`, 'sensitiveWord.import');
  app.get(`${prefix}/sensitive_words/export`, 'sensitiveWord.export');
  app.patch(`${prefix}/sensitive_words/:id`, 'sensitiveWord.update');

  // address
  app.post(`${prefix}/addresses`, 'address.create');
  app.get(`${prefix}/addresses/:_id`, 'address.get');
  app.patch(`${prefix}/addresses/:_id`, 'address.update');
  app.delete(`${prefix}/addresses/:_id`, 'address.delete');

  // commodity category
  app.get(`${prefix}/commodity_categories`, 'commodityCategory.index');
  app.post(`${prefix}/commodity_categories`, 'commodityCategory.create');
  app.delete(`${prefix}/commodity_categories`, 'commodityCategory.batchDestroy');
  app.patch(`${prefix}/commodity_categories/:id`, 'commodityCategory.update');

  // file
  app.get(`${prefix}/files/:id`, 'file.show');
  app.post(`${prefix}/files`, formidable(app.config.formidable), compress(), 'file.upload');

  // banner
  app.get(`${prefix}/banners`, 'banner.index');
  app.post(`${prefix}/banners`, 'banner.create');
  app.patch(`${prefix}/banners/:id`, 'banner.update');
  app.delete(`${prefix}/banners/:id`, 'banner.destroy');

  // error
  app.get('/error', 'error.index');
};
