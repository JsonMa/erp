const co = require('co');
const Sequelize = require('sequelize');

const {
  UUID,
  UUIDV1,
  INTEGER,
  STRING,
  BOOLEAN,
  ENUM,
  TEXT,
  ARRAY,
  DATE,
  FLOAT,
} = Sequelize;

const tables = {
  address: {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
    },
    name: STRING(64),
    phone: STRING(32),
    location: STRING(256),
    default: BOOLEAN,
  },
  commodity_attr: {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    name: {
      type: STRING(20),
      allowNull: false,
    },
    values: {
      type: ARRAY(STRING(20)),
      allowNull: false,
      defaultValue: [],
    },
    commodity_id: {
      type: UUID,
      allowNull: false,
    },
  },
  commodity_category: {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    name: {
      type: STRING(20),
      allowNull: false,
    },
    cover_id: {
      type: UUID,
      allowNull: false,
    },
  },
  commodity: {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    no: {
      type: INTEGER,
      autoIncrement: true,
    },
    name: {
      type: STRING(20),
      allowNull: false,
    },
    description: STRING(500),
    price: {
      type: FLOAT,
      allowNull: false,
    },
    act_price: {
      type: FLOAT,
      allowNull: true,
    },
    sales: {
      type: INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    recommended: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    status: {
      type: ENUM,
      values: [
        'ON',
        'OFF',
      ],
      defaultValue: 'ON',
      allowNull: false,
    },
    category_id: {
      type: UUID,
      allowNull: false,
    },
    picture_ids: {
      type: ARRAY(UUID),
      allowNull: false,
      defaultValue: [],
    },
  },
  file: {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    name: {
      type: STRING(64),
      allowNull: false,
    },
    path: {
      type: STRING(128),
      allowNull: false,
    },
    type: {
      type: STRING(128),
      allowNull: false,
    },
    size: {
      type: INTEGER,
    },
  },
  logistics: {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    order_id: {
      type: UUID,
      allowNull: false,
      unique: true,
    },
    company: STRING(32),
    order_no: STRING(32),
  },
  order: {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    no: {
      type: INTEGER,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
    },
    commodity_id: {
      type: UUID,
      allowNull: false,
    },
    status: {
      type: ENUM,
      values: [
        'CREATED',
        'PAYED',
        'SHIPMENT',
        'FINISHED',
      ],
      defaultValue: 'CREATED',
    },
    commodity_attrs: ARRAY(STRING(20)),
    commodity_attr_vals: ARRAY(STRING(20)),
    price: {
      type: FLOAT,
    },
    commodity_price: {
      type: FLOAT,
      allowNull: false,
    },
    count: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    address_id: UUID,
    trade_id: UUID,
  },
  post_category: {
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
  },
  post_comment: {
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
  },
  post_hits: {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    session_id: {
      type: UUID,
      allowNull: false,
    },
    post_id: {
      type: UUID,
      allowNull: false,
    },
  },
  post_vote: {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    post_id: {
      type: UUID,
      allowNull: false,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
    },
  },
  post: {
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
  },
  sensitive_word: {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    key: {
      type: STRING(64),
      allowNull: false,
    },
  },
  trade: {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    order_id: UUID,
    trade_no: {
      type: STRING(64),
      allowNull: true,
    },
    type: {
      type: ENUM,
      values: [
        'ALIPAY',
        'WECHAT',
      ],
      allowNull: false,
    },
    status: {
      type: ENUM,
      values: [
        'PENDING', // 挂起
        'CLOSED',
        'SUCCESS',
      ],
      allowNull: false,
      defaultValue: 'PENDING',
    },
    detail: {
      type: TEXT,
    },
  },
  banner: {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    picture_id: {
      type: UUID,
      allowNull: false,
    },
    deleted_at: DATE,
    updated_at: DATE,
    created_at: DATE,
  },
};

// 一期表结构
Object.assign(tables, {
  admin_user: {
    id: {
      type: INTEGER(32),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    account: {
      type: STRING(64),
      allowNull: false,
    },
    nickname: STRING(64),
    password: {
      type: STRING(32),
      allowNull: false,
    },
    tel: STRING(16),
    email: STRING(128),
    wechat: STRING(16),
    remark: STRING(255),
    role_id: {
      type: INTEGER(32),
      allowNull: false,
      autoIncrement: true,
    },
    create_time: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
      allowNull: false,
    },
    create_uid: INTEGER(32),
    update_time: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
      allowNull: false,
    },
    update_uid: INTEGER(32),
    company_id: INTEGER(32),
  },
  electronis_fence: {
    id: {
      type: INTEGER(32),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    company_id: {
      type: INTEGER(32),
      autoIncrement: true,
    },
    fence_name: STRING(36),
    fence_number: STRING(20),
    fence_type: STRING(1),
    into_area_warn: INTEGER(32),
    into_area_warn_content: STRING(500),
    out_area_warn: INTEGER(32),
    out_area_warn_content: STRING(500),
    remark: STRING(360),
    state: STRING(15),
    province: STRING(80),
    city: STRING(80),
    draw_type: STRING(1),
    draw_data: TEXT,
    area: STRING(255),
    create_time: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    create_user_id: INTEGER(32),
    create_user_name: STRING(36),
    last_modify_time: DATE,
    last_modify_user_id: INTEGER(32),
    last_modify_user_name: STRING(36),
    location: STRING(80),
    enabled: {
      type: BOOLEAN,
      defaultValue: true,
    },
  },
  fence_vehicle_bind: {
    id: {
      type: INTEGER(32),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fence_id: INTEGER(32),
    vehicle_id: INTEGER(32),
    vehicle_status: STRING(32),
  },
  notice: {
    type: STRING(16),
    content: STRING(255),
    start_time: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    update_time: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    platform: STRING(255),
    id: {
      type: INTEGER(64),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    uid: INTEGER(64),
    type_code: STRING(255),
    status: {
      type: INTEGER(16),
      defaultValue: 1,
    },
    read: {
      type: INTEGER(16),
      defaultValue: 1,
    },
  },
  role: {
    id: {
      type: INTEGER(32),
      allowNull: false,
      autoIncrement: true,
    },
    role_name: STRING(32),
    modules: STRING(255),
    create_time: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    create_uid: INTEGER(32),
    update_time: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    update_uid: INTEGER(32),
    role_id: INTEGER(32),
    status: INTEGER(32),
  },
  system_company: {
    id: {
      type: INTEGER(64),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    parent_id: INTEGER(64),
    company_number: STRING(50),
    company_name: STRING(255),
    short_name: STRING(255),
    company_type: {
      type: STRING(255),
      defaultValue: 2,
    },
    province: STRING(255),
    city: STRING(255),
    area: STRING(255),
    address: STRING(255),
    contact_person: STRING(255),
    telephone: STRING(255),
    mobile_phone: STRING(255),
    email: STRING(255),
    fax: STRING(255),
    state: {
      type: STRING(255),
      defaultValue: 0,
    },
    create_time: DATE,
    create_user_id: INTEGER(64),
    create_user_name: STRING(255),
    last_modify_time: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    last_modify_user_id: INTEGER(64),
    last_modify_user_name: STRING(255),
    remark: STRING(255),
    start_status: {
      type: BOOLEAN,
      defaultValue: true,
    },

  },
  system_driver_info: {
    driver_idnumber: STRING(30),
    driver_name: STRING(255),
    driver_phone: {
      type: STRING(255),
      allowNull: false,
    },
    driver_nickname: STRING(255),
    create_time: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    company_blong: {
      type: STRING(255),
      defaultValue: '个人',
    },
    driver_carbind: STRING(255),
    driver_password: {
      type: STRING(255),
      allowNull: false,
    },
    id: {
      type: INTEGER(32),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    update_time: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    driver_avatar: STRING(255),
    driver_frontpictrue: STRING(255),
    driver_backpictrue: STRING(255),
    validate_status: {
      type: ENUM,
      values: ['success', 'failed', 'review', 'unreview'],
      defaultValue: 'unreview',
    },
    refusal_reason: STRING(255),
    driver_unionid: STRING(40),
    driver_id: STRING(255),
    cmd_uuid: STRING(255),
  },
  system_vehicle_info: {
    id: {
      type: INTEGER(32),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    vehicle_manage_id: INTEGER(32),
    vehicle_name: STRING(180),
    alias: STRING(180),
    number: STRING(30),
    vin: {
      type: STRING(30),
      allowNull: false,
    },
    plate_number: STRING(10),
    specification: STRING(80),
    two_dimensional_code_serial_number: STRING(80),
    actuator_number: STRING(20),
    car_license_number: STRING(20),
    manufacture: STRING(180),
    vehicle_manufacture_date: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    vehicle_license_registration_date: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    vehicle_license_expiry_date: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    brand: STRING(20),
    car_type: STRING(30),
    vehicle_type: STRING(30),
    company_id: INTEGER(32),
    driver_id: INTEGER(32),
    sim_id: INTEGER(32),
    sim_end_date: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    gps_id: INTEGER(32),
    fence_id: INTEGER(32),
    state: {
      type: STRING(7),
      defaultValue: 'normal',
    },
    sim_number: STRING(32),
    imei_number: STRING(32),
    sim_change_date: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    sim_install_date: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    sim_start_date: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    gps_number: STRING(32),
    gps_name: STRING(255),
    gps_device_id: STRING(32),
    gps_api_key: STRING(255),
    sim_id_expiry_date: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
    color: STRING(255),
    onenet_device_id: {
      type: STRING(64),
      defaultValue: '',
    },
    import_time: DATE,
    frige1_temp: {
      type: INTEGER,
      defaultValue: 0,
    },
    frige2_temp: {
      type: INTEGER,
      defaultValue: 0,
    },
    locked: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  vehicle_drive_info: {
    id: {
      type: INTEGER(64),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    upload_date: DATE,
    upload_time: INTEGER(32),
    speed: FLOAT(53),
    single_distance: FLOAT(53),
    left_distance: FLOAT(53),
    total_distance: FLOAT(53),
    dev_id: INTEGER(32),
  },
  vehicle_location: {
    id: {
      type: INTEGER(64),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    upload_date: DATE,
    upload_time: INTEGER(32),
    lon: STRING(255),
    lat: STRING(255),
    msg_id: INTEGER(32),
    dev_id: INTEGER(32),

  },
  vehicle_single_locus: {
    id: {
      type: INTEGER(64),
      autoIncrement: true,
      allowNull: false,
    },
    create_date: DATE,
    create_time: INTEGER(32),
    state: INTEGER(16),
    start_address: STRING(255),
    end_address: STRING(255),
    mileage: FLOAT(24),
    start_time: INTEGER(32),
    end_time: INTEGER(32),
    dev_id: INTEGER(32),
    speed: FLOAT(53),
  },
  warning: {
    id: {
      type: INTEGER(64),
      autoIncrement: true,
      allowNull: false,
    },
    msg_id: STRING(64),
    fault_code: STRING(255),
    status: STRING(255),
    number: STRING(32),
    fault_type: STRING(32),
    remark: STRING(255),
    upload_time: STRING(255),
    start_time: {
      type: DATE,
      defaultValue: Sequelize.fn('NOW'),
    },
  },
});

module.exports = {
  up: co.wrap(function* (queryInterface) {
    yield Promise.all(Object.keys(tables)
      .map(key => [key, Object.assign({}, tables[key], {
        deleted_at: DATE,
        updated_at: DATE,
        created_at: DATE,
      })]).map(([name, schema]) => queryInterface.createTable(name, schema)));

    // out keys
    yield queryInterface.addConstraint('post_hits', ['post_id'], {
      type: 'FOREIGN KEY',
      name: 'post_id',
      references: {
        table: 'post',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });

    yield queryInterface.sequelize.query(`
      -- order no sequence
      CREATE SEQUENCE increment_order_no START WITH 10000000 INCREMENT BY 1;
      ALTER TABLE IF EXISTS "order" ALTER COLUMN no SET DEFAULT nextval('increment_order_no');

      -- admin and user id sequence
      CREATE SEQUENCE increment_user_id START WITH 1 INCREMENT BY 2;
      ALTER TABLE IF EXISTS system_driver_info ALTER COLUMN id SET DEFAULT nextval('increment_user_id');

      CREATE SEQUENCE increment_admin_id START WITH 2 INCREMENT BY 2;
      ALTER TABLE IF EXISTS admin_user ALTER COLUMN id SET DEFAULT nextval('increment_admin_id');
    `);
  }),
  down: co.wrap(function* (queryInterface) {
    yield queryInterface.removeConstraint('post_hits', 'post_id');
    yield Promise.all(Object.keys(tables).map(key => queryInterface.dropTable(key)));
    yield queryInterface.sequelize.query('DROP SEQUENCE increment_admin_id, increment_user_id, increment_order_no');
  }),
};
