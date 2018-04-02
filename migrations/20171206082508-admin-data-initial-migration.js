const co = require('co');
const moment = require('moment');
const crypto = require('crypto');

const adminUsers = {
  '-1': {
    id: '-1',
    name: '超级管理员',
    modules: '11,12,13,14,21,22,23,24,31,41,51',
    privsOwner: [],
    privsNotOwner: [],
  },
  1: {
    id: '1',
    name: '系统管理员',
    modules: '11,12,13,14,21,24,31,41,51',
    privsOwner: [],
    privsNotOwner: ['role'],
  },
  2: {
    id: '2',
    name: '企业管理员',
    modules: '11,12,13,14,24',
    privsOwner: [],
    privsNotOwner: ['role'],
  },
};

module.exports = {
  up: co.wrap(function* (queryInterface) {
    // 插入 role 数据
    yield queryInterface.bulkInsert('role', Object.keys(adminUsers).map(r => ({
      id: adminUsers[r].id,
      role_name: adminUsers[r].name,
      modules: adminUsers[r].modules,
      create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
      update_time: moment().format('YYYY-MM-DD HH:mm:ss'),
    })));
    // 插入 admin_user 数据
    yield queryInterface.bulkInsert('admin_user', [{
      account: 'admin',
      nickname: '超级管理员',
      password: crypto.createHash('md5').update('111111', 'utf8').digest('hex'),
      tel: '18888888888',
      role_id: -1,
      remark: '系统初始化自动生成管理员账号',
      company_id: -1,
    }]);
    // 插入 system_company 数据
    yield queryInterface.bulkInsert('system_company', [{
      id: '-1',
      company_name: '庶邦生鲜',
      start_status: true,
    }]);
  }),

  down: co.wrap(function* (queryInterface) {
    yield queryInterface.bulkDelete('role', { id: { $lt: 3 } });
    yield queryInterface.bulkDelete('admin_user', { role_id: -1 });
    yield queryInterface.bulkDelete('system_company', { id: -1 });
  }),
};
