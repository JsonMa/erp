---
swagger: "2.0"
info:
  version: "1.0"
  description: |
    ### session
    由于一二期项目处于不同项目但使用同一登录状态，故使用access_token作为登录凭证，APP和PC均有效。
    PC还支持cookie，无需显示提供access_token

    ### responses
    以下API仅仅定义data内部的内容，所有API返回格式如下:
    ```
    {
      code: Interger,
      msg:  String,
      errors: [Error],  # 仅在开发环境下提供
      data: Object
    }
    ```

    ### pagination
    ##### 包含pagination标签的API均支持一下query参数
    ```
    {
      start:  Integer,  # default(0)  min(0)            起始偏移量
      count:  Integer,  # default(10) min(1) max(100)   获取个数
      sort:   Bool      # default(true)                 是否按时间正序
    }
    ```
    ##### 返回格式如下
    ```
    {
      code: Interger,
      msg:  String,
      data: {
        count:   Integer,    资源总数量
        start:   Integer,    起始偏移量
        items:   Array
      }
    }
    ```

    ### embed
    部分批量获取接口需要对某些字段进行展开，如user_id展开为user, 因此该类型接口统一支持embed参数。

    For example:
    ```
    GET /posts?embed=user
    {
      code: Integer,
      msg: String,
      {
        posts: [Post],
        users: [User]   // 返回posts中包含的user信息
      }
    }
    ```
    该类型接口均有embed标签

    ### model

    ##### model默认字段说明
    ```
    {
      created_at: Date,      # 2017-06-23T02:37:09.892Z
      updated_at: Date       # 2017-06-23T02:37:09.892Z
    }
    ```

    ### error code

    - 200-500: http错误
    - 1000  - 9999 : 系统内部操作错误, 如DB, REDIS
    - 10000 - 10999: Auth 相关错误
    - 11000 - 11999: Address 相关错误
    - 12000 - 12999: Commodity attribute value 相关错误
    - 13000 - 13999: Commodity attribute 相关错误
    - 14000 - 14999: Commodity category 相关错误
    - 15000 - 15999: Commodity 相关错误
    - 16000 - 16999: File 相关错误
    - 17000 - 17999: Logistic 相关错误
    - 18000 - 18999: Order 相关错误
    - 19000 - 19999: Post category 相关错误
    - 20000 - 20999: Post comment 相关错误
    - 21000 - 21999: Post hit 相关错误
    - 22000 - 22999: Post vote 相关错误
    - 23000 - 23999: Post 相关错误
    - 24000 - 24999: Sensitive word 相关错误
    - 25000 - 25999: Trade 相关错误


    | 状态码  | 含义          | 说明             |
    | ---- | ----------- | ---------------- |
    | 200  | success     | 请求成功             |
    | 204  | no content  | 请求成功，但是没有返回内容    |
    | 304  | redirect    | 重定向              |
    | 400  | bad request | 参数错误，msg中有错误字段提示 |
    | 403  | forbidden   | 没有登录或者没有管理员权限 |
    | 404  | not found   | 接口不存在            |
    | 500  | error       | 服务器错误            |
    | 10001 | auth error          | Session已失效, 请重新登录      |
    | 13000 | commodity attr error| 商品属性不存在                 |
    | 13001 | commodity attr error| 商品属性已存在                 |
    | 14000 | commodity category error | 商品分类不存在            |
    | 14001 | commodity category error | 商品分类名已存在          |
    | 14002 | commodity category error | 封面非图片类型文件        |
    | 14003 | commodity category error | 商品分类中存在关联商品    |
    | 15000 | commodity error     | 商品不存在                    |
    | 15001 | commodity error     | 商品图片数量需在1~5张范围内     |
    | 15002 | commodity error     | 商品图片重复/丢失或包含非图片类型文件 |
    | 15003 | commodity error     | 参数中包含不存在的商品          |
    | 16000 | file error          | 文件丢失                      |
    | 16001 | file error          | 文件类型错误                   |
    | 16002 | file error          | 文件大小超出限制               |
    | 17000 | logistifc error     | 创建失败:订单不存在            |
    | 17001 | logistifc error     | 订单状态有误，不能执行发货请求  |
    | 18001 | order error         | 商品不存在                    |
    | 18002 | order error         | 收货地址不存在                 |
    | 18003 | order error         | 订单当前状态不能修改为已完成    |
    | 18004 | order error         | 商品属性或商品属性值不存在      |
    | 18004 | order error         | 商品属性或商品属性值不存在      |
    | 18005 | order error         | 必须包含商品属性或商品属性值    |
    | 18006 | order error         | 商品已下架                     |
    | 18007 | order error         | 已支付的订单不能修改价格        |
    | 19001 | post category error | 禁止删除已使用帖子分类         |
    | 19002 | post category error | 禁止重复创建帖子分类           |
    | 12000 | post comment error  | 禁止用户对帖子重复评论         |
    | 22000 | post vote error     | 禁止用户对帖子重复点赞         |
    | 23000 | post vote error     | 禁止访问含有敏感词帖子         |
    | 24000 | sensitive word error| 禁止创建重复敏感词             |
    | 24001 | sensitive word error| 请上传txt格式文件             |
    | 24002 | sensitive word error| txt文件必须包含敏感词          |
    | 24003 | sensitive word error| txt文件编码方式错误            |
    | 24004 | sensitive word error| txt文件中存在敏感词超过最大长度 |
    | 25001 | trade error         | 订单不存在                    |
    | 25002 | trade error         | 订单状态有误，不能发起支付      |
    | 25003 | trade error         | 微信订单创建失败               |
    | 25004 | trade error         | 支付宝订单创建失败             |
    | 25005 | trade error         | 订单地址不存在                 |

  title: "庶邦 API"
  termsOfService: "http://172.19.3.186:25001/"
  contact:
    email: "xieguodong@wondertek.com"
host: "172.19.3.186:25001"
basePath: "/api/v2"
schemes:
  - http
produces:
  - application/json
consumes:
  - application/json
tags:
  - name: order
  - name: logistics
  - name: address
  - name: user
  - name: pagination
  - name: admin  
  - name: post
  - name: post_category
  - name: sensitive_word
  - name: file
  - name: auth  
  - name: commodity
  - name: embed

paths:

  /auth/login:
    post:
      description: 模拟登录, 仅用户测试环境
      tags:
        - auth 
      parameters:
        - in: body
          name: user
          schema:
            type: object
            required:
              - name 
              - role 
              - password
              - phone 
            properties:
              name:
                type: string                
                description: 任意名字，数据库没有会新建用户
              role:
                type: string
                description: admin 或者 user  
              phone:
                type: string
              password:
                type: string
      responses:
        200:
          description: Success
          schema:
            type: object
            properties:
              user: 
                type: object
                $ref: "#/definitions/User"
              token:
                $ref: "#/definitions/Trade"
                description: access_token


  /users/{id}/orders/:
    get:
      description: 获取用户订单列表
      tags:
        - user
        - pagination
      parameters:
        - name: id
          in: path
          description: User ID
          type: string
          format: uuid
          required: true
        - name: status
          in: query
          type: string
          description: 取值于Order_Status
        - name: embed
          in: query
          type: string 
          description: 注入相关model, 取值于[user, commodity, trade], 支持多个 e.g embed=user,commodity
      responses:
        200:
          description: 返回的order列表, order会携带commodity对象
          schema:
            type: object
            properties:
              count:
                type: integer
              start: 
                type: integer
              items:
                type: array
                items:
                  $ref: "#/definitions/Order"

  /users/{id}/addresses/:
    get:
      description: 获取用户收货地址列表
      tags:
        - user
        - address
        - pagination
      parameters:
        - name: id
          in: path
          description: User ID
          type: string
          format: uuid
          required: true
        - name: default 
          in: query
          type: string
          description: true/false
      responses:
        200:
          description: 返回的地址列表
          schema:
            type: object
            properties:
              count:
                type: integer
              start: 
                type: integer
              items:
                type: array
                items:
                  $ref: "#/definitions/Address"

  /users/{id}/posts:
    get:
      description: 获取用户帖子
      tags:
          - user
          - post
          - pagination
      parameters:
        - name: id
          in: path
          description: User ID
          type: string
          format: uuid
          required: true
      responses:
          200:
            description: Success
            schema:
              type: object
              properties:
                count:
                  type: integer
                start: 
                  type: integer
                items:
                  type: array
                  items:
                    $ref: '#/definitions/Post'
    

  /orders/:
    get:
      description: 获取订单列表
      tags:
        - order
        - pagination
        - admin
        - embed
      parameters:
        - name: status
          in: query
          type: string
          description: 取值于Order_Status
        - name: from
          in: query
          type: string
          format: date
          description: 下单开始时间
        - name: to
          in: query
          type: string
          description: 下单截至时间
        - name: user_name
          in: query
          type: string
          description: 用户名
        - name: user_phone
          in: query
          type: string
          description: 用户电话
        - name: recipient_name
          in: query
          type: string
          description: 收件人姓名
        - name: recipient_phone
          in: query
          type: string
          description: 收件人电话
        - name: commodity_name
          in: query
          type: string
          description: 商品名称
        - name: order_no
          in: query
          type: string
          description: 订单编号
        - name: embed
          in: query
          type: string 
          description: 注入相关model, 取值于[user, commodity, trade], 支持多个 e.g embed=user,commodity
      responses:
        200:
          description: 返回的order列表, order会携带commodity、user、address、trade对象
          schema:
            type: object
            properties:
              count:
                type: integer
              start: 
                type: integer
              items:
                type: array
                items:
                  $ref: "#/definitions/Order"
    post:
      tags:
        - order
      parameters:
        - in: body
          name: user
          description: 创建订单
          schema:
            type: object
            required:
              - commodity_id
            properties:
              commodity_id:
                type: string
                format: uuid
              address_id:
                type: string
                format: uuid
              count:
                type: integer 
              commodity_attrs:
                type: object 
                description: |
                  键值对存储, e.g. { size: 1, color: 'red' }
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/Order"
            
  /orders/{id}:
    get:
      description: 获取订单
      tags:
        - order
        - embed
      parameters:
        - name: id
          in: path
          description: Order ID
          type: string
          format: uuid
          required: true
        - name: embed
          in: query
          type: string 
          description: 注入相关model, 取值于[user, address], 支持多个 e.g embed=user,address
      responses:
        200:
          description: Success
          schema:
            type: object
            properties:
              order: 
                $ref: "#/definitions/Order"
              user: 
                $ref: "#/definitions/User"
              address: 
                $ref: "#/definitions/Address"

    patch:
      description: 修改订单
      tags:
        - order
      parameters:
        - name: id
          in: path
          description: Order ID
          type: string
          format: uuid
          required: true
        - in: body
          name: user
          description: 修改订单
          schema:
            type: object
            properties:
              address_id: 
                type: string
              price:
                type: integer
                description: 需要admin权限
              status:
                type: string
                description: 只能为'FINISHED', 表示确认收货
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/Order"

  /orders/{id}/logistics:
    get:
      description: 获取订单物流信息
      tags:
        - order
        - logistics
      parameters:
        - name: id
          in: path
          description: Order ID
          type: string
          format: uuid
          required: true
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/Logistics"
  
  /trades/:
    post:
      description: 创建支付订单
      tags:
        - order
      parameters:
        - in: body
          name: user
          schema:
            type: object
            required:
              - order_id
              - type
            properties:
              order_id:
                type: string
                format: uuid
              type:
                type: string
                description: 取值于Order_Type
      responses:
        200:
          description: Success
          schema:
            type: object
            properties:
              payload: 
                type: object
                description: 用于客服端创建订单的请求参数
              trade:
                $ref: "#/definitions/Trade"

  /trades/{id}:
    get:
      description: 获取支付订单信息
      tags:
        - order
      parameters:
        - name: id
          in: path
          description: Trade ID
          type: string
          format: uuid
          required: true
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/Trade"

  /logistics/:
    post:
      description: 创建物流信息, 订单自动切换至发货状态
      tags:
        - logistics
      parameters:
        - in: body
          name: user
          schema:
            type: object
            required:
              - order_id
              - company
              - order_no
            properties:
              order_id:
                type: string
                format: uuid
              company:
                type: string
              order_no:
                type: string
                description: 快递单号
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/Logistics"

  /addresses/:
    post:
      description: 创建收货地址
      tags:
        - address
      parameters:
        - in: body
          name: user
          schema:
            type: object
            required:
              - name
              - phone
              - location
            properties:
              name:
                type: string
              phone:
                type: string
              location:
                type: string
              default:
                type: boolean
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/Address"
  
  /addresses/{id}:
    get:
      tags:
        - address
      description: 获取地址详情
      parameters:
        - name: id
          in: path
          description: Address ID
          type: string
          format: uuid
          required: true
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/Address"

    delete:
      tags:
        - address
      description: 删除地址
      parameters:
        - name: id
          in: path
          description: Address ID
          type: string
          format: uuid
          required: true
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/Address"
            
    patch:
      tags:
        - address
      parameters:
        - name: id
          in: path
          description: Address ID
          type: string
          format: uuid
          required: true
        - in: body
          name: user
          schema:
            type: object
            required:
              - name
              - phone
              - location
            properties:
              name:
                type: string
              phone:
                type: string
              location:
                type: string
              default:
                type: boolean
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/Address"

  /posts:
    get:
      summary: 获取帖子列表
      tags:
        - post
        - pagination
        - embed
      description: 获取帖子列表
      parameters:
        - name: from
          in: query
          description: 发帖开始时间(eg:from='2017-01-01'),
          required: true
          type: string
          format: date
        - name: to
          in: query
          description: 发帖截止时间
          required: true
          type: string
          format: date
        - name: nick_name
          in: query
          description: 发帖人昵称
          type: string
        - name: phone
          in: query
          description: 发帖人手机
          type: string
        - name: theme
          in: query
          description: 帖子主题
          type: string
        - name: state
          in: query
          description: 帖子状态,取值于Post_Status
          type: string
        - name: category_id
          in: query
          description: 帖子分类(不传:全部,number:分类id)
          type: string
          format: uuid
        - name: query_type
          in: query
          type: string
          default: 'NEW'
          description: 取值于Post_Query_Type
        - name: embed
          in: query
          type: string
          description: 注入信息,enum=[user]
      responses:
        200:
          description: Success
          schema:
            type: object
            properties:
              count:
                type: integer
              start: 
                type: integer
              items:
                type: array
                items:
                  $ref: '#/definitions/Post'
    post:
      summary: 创建帖子
      tags:
        - post
      description: 创建帖子
      parameters:
        - name: post
          in: body
          required: true
          schema:
            type: object
            required:
              - theme
              - category_id
              - content
              - cover_ids
            properties:
              theme: 
                type: string
              category_id:
                type: string
                format: uuid
              content:
                type: string
              cover_ids:
                type: array
                items:
                  type: string
                  format: uuid
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Post'
    delete:
      summary: 批量删除帖子
      tags:
        - post
      description: 批量删除帖子
      parameters:
        - name: post_ids
          in: query
          required: true
          description: 删除的帖子id(eg:post_ids=1,2,3)
          type: string
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
             $ref: '#/definitions/Post'

  /posts/{id}:
    get:
      summary: 帖子详情
      tags:
        - post
      description: 帖子详情
      parameters:
        - name: id
          in: path
          required: true
          description: 帖子id
          type: string
          format: uuid
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Post'
    patch:
      summary: 修改帖子
      tags:
        - post
      description: 修改帖子
      parameters:
        - name: id
          in: path
          required: true
          description: 帖子id
          type: string
          format: uuid
        - name: post
          in: body
          required: true
          schema:
            type: object
            properties:
              theme: 
                type: string
              category_id:
                type: string
                format: uuid
              content:
                type: string
              cover_ids:
                type: array
                items:
                  type: string
                  format: uuid
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Post'

  /posts/{id}/comments:
    get:
      summary: 获取帖子评论列表
      tags:
        - post
        - pagination
        - embed
      description: 获取帖子评论列表
      parameters:
        - name: id
          in: path
          required: true
          description: 帖子id
          format: uuid
          type: string
        - name: embed
          in: query
          type: string
          description: 注入信息,enum=[user]
      responses:
        200:
          description: Success
          schema:
            type: object
            properties:
              count:
                type: integer
              start: 
                type: integer
              items:
                type: array
                items:
                  $ref: '#/definitions/PostComment'
    post:
      summary: 创建帖子评论
      tags:
        - post
      description: 创建帖子评论
      parameters:
        - name: id
          in: path
          required: true
          description: 帖子id
          format: uuid
          type: string
        - name: comment
          in: body
          required: true
          schema:
            required:
              - content
            properties:
              content:
                type: string
                description: 评论内容
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/PostComment'

  /posts/{id}/vote:
    post:
      summary: 点赞帖子
      tags:
        - post
      description: 点赞帖子
      parameters:
        - name: id
          in: path
          required: true
          description: 帖子id
          format: uuid
          type: string
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/PostVote'
    delete:
      summary: 取消点赞
      tags:
        - post
      description: 取消点赞
      parameters:
        - name: id
          in: path
          required: true
          description: 帖子id
          format: uuid
          type: string
      responses:
        200:
          description: Success

  /post_categories:
    get:
      summary: 获取帖子分类列表
      tags:
        - post_category
      description: 获取帖子分类列表
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
             $ref: '#/definitions/PostCategory'
    post:
      summary: 创建帖子分类
      tags:
        - post_category
        - admin  
      description: 创建帖子分类
      parameters:
        - name: post_category
          in: body
          required: true
          schema:
            required:
              - name
              - cover_id
            properties:
              name:
                type: string
                description: 分类名称
              cover_id:
                type: string
                description: 封面图片id
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/PostCategory'
    delete:
      summary: 删除帖子分类
      tags:
       - post_category
       - admin  
      description: 删除帖子分类
      parameters:
        - name: ids
          in: query
          required: true
          type: string
          description: 分类id
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
             $ref: '#/definitions/PostCategory'

  /post_categories/{id}:
    patch:
      summary: 修改帖子分类
      tags:
       - post_category
       - admin  
      description: 修改帖子分类
      parameters:
        - name: id
          in: path
          required: true
          type: string
          description: 分类id
          format: uuid
        - name: post_category
          in: body
          required: true
          schema:
            properties:
              name:
                type: string
                description: 分类名称
              cover_id:
                type: string
                description: 封面图片id
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/PostCategory'

  /sensitive_words:
    get:
      summary: 获取敏感词列表
      tags:
        - sensitive_word
        - admin 
      description: 获取敏感词列表
      parameters:
        - name: word
          in: query
          description: 查询的敏感词
          type: string
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
             $ref: '#/definitions/SensitiveWord'
    post:
      summary: 创建敏感词
      tags:
        - sensitive_word
        - admin 
      description: 创建敏感词
      parameters:
        - name: sensitive_word
          in: body
          required: true
          schema:
            type: object
            required:
              - key
            properties:
              key:
                type: string
      responses:
          200:
            description: Success
            schema:
              $ref: '#/definitions/SensitiveWord'
    delete:
      summary: 删除敏感词
      tags:
        - sensitive_word
        - admin 
      description: 删除敏感词
      parameters:
        - name: ids
          in: query
          required: true
          description: 删除的敏感词的id(eg:ids=1,2,3)
          type: string
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
             $ref: '#/definitions/SensitiveWord'

  /sensitive_words/import:
    post:
      summary: 批量导入敏感词
      tags:
        - sensitive_word
        - admin 
      description: 批量导入敏感词
      parameters:
        - name: file
          in: body
          required: true
          schema:
            type: object
            required:
              - fid
            properties:
              fid:
                type: string
                format: uuid
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
             $ref: '#/definitions/SensitiveWord'

  /sensitive_words/export:
    get:
      summary: 批量导出敏感词
      tags:
        - sensitive_word
        - admin 
      description: 批量导出敏感词
      responses:
        200:
          description: 下载文件

  /sensitive_words/{id}:
    patch:
      summary: 修改敏感词
      tags:
        - sensitive_word
        - admin 
      description: 修改敏感词
      parameters:
        - name: id
          in: path
          required: true
          type: string
          description: 敏感词id
          format: uuid
        - name: sensitive_word
          in: body
          required: true
          schema:
            type: object
            properties:
              key:
                type: string
      responses:
          200:
            description: Success
            schema:
              $ref: '#/definitions/SensitiveWord'

  /files:
    post:
      summary: 上传文件
      tags:
        - file
      description: 文件上传
      consumes:
        - "multipart/form-data"
      parameters:
        - in: formData
          description: 上传的文件
          name: files
          required: true
          type: 'file'
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
              $ref: "#/definitions/File"

  /files/{id}:
    get:
      summary: 获取文件内容
      tags:
        - file
      description: 获取文件内容
      parameters:
        - name: id
          in: path
          description: File ID
          type: string
          format: uuid
          required: true
      responses:
        200:
          description: 文件内容

  /commodities:
    get:
      summary: 商品列表
      tags:
        - commodity
        - pagination
        - embed
      description: 根据查询参数，返回商品列表
      parameters:
        - name: name
          in: query
          description: 商品名称
          type: string
        - name: category_id
          in: query
          description: 所属分类
          type: string
          format: uuid
        - name: status
          in: query
          description: 上/下架状态，取值于Commodity_Status
          type: string
        - name: recommended
          in: query
          description: 是否推荐
          type: boolean
        - name: embed
          in: query
          description: 是否内嵌商品分类（embed='category'时，返回的数据中将包含'categories'字段）
          type: string
      responses:
        200:
          description: 商品列表
          schema:
            type: object
            properties:
              count:
                type: integer
              start:
                type: integer
              items:
                type: array
                items:
                  $ref: '#/definitions/Commodity'
              categories:
                type: array
                items:
                  $ref: '#/definitions/CommodityCategory'
    post:
      tags:
        - commodity
        - admin
      summary: 添加商品
      description: 添加新的商品
      parameters:
        - name: commodity
          in: body
          required: true
          schema:
            type: object
            required:
              - name
              - category_id
              - description
              - price
              - picture_ids
            properties:
              name:
                type: string
                description: 商品名称
              category_id:
                type: string
                format: uuid
                description: 所属类别id
              description:
                type: string
                description: 商品描述
              price:
                type: number
                description: 商品价格
              act_price:
                type: number
                description: 活动价格
              recommended:
                type: boolean
                description: 是否推荐
              attr:
                type: array
                description: 商品属性
                items:
                  type: object
                  properties:
                    attr_name:
                      type: string
                    attr_value:
                      type: array
                      items:
                        type: string
              picture_ids:
                type: array
                description: 商品图片
                items:
                  type: string
                  format: uuid
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Commodity'
    delete:
      tags:
        - commodity
        - admin
      summary: 删除商品
      description: 批量删除商品
      parameters:
        - name: ids
          in: query
          required: true
          description: 删除的商品ids(eg:ids='1,2,3')
          type: string
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
             $ref: '#/definitions/Commodity'
    patch:
      tags:
        - commodity
        - admin
      summary: 批量修改商品(推荐/上架)
      description: 根据ids批量修改商品
      parameters:
        - name: ids
          in: query
          description: 商品ids(eg:ids=uuid,uuid,uuid)
          type: string
          format: uuid
          required: true
        - name: attributes
          in: body
          required: true
          schema:
            type: object
            properties:
              status:
                type: string
                description: 上/下架状态 -['ON','OFF']
              recommended:
                type: boolean
                description: 推荐 -[true, false]
      responses:
          200:
            description: Success
            schema:
              type: array
              items:
                $ref: '#/definitions/Commodity'

  /commodities/{id}:
    get:
      tags:
        - commodity
      summary: 商品详情
      description: 根据id查询商品详情
      parameters:
        - name: id
          in: path
          required: true
          description: 商品id
          type: string
          format: uuid
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Commodity'
    patch:
      summary: 修改商品
      description: 根据id修改商品信息
      tags:
        - commodity
        - admin
      parameters:
        - name: id
          in: path
          description: 商品id
          type: string
          format: uuid
          required: true
        - in: body
          name: commodity
          description: 修改商品信息
          required: true
          schema:
            type: object
            properties:
              name:
                type: string
                description: 商品名称
              category_id:
                type: string
                format: uuid
                description: 所属类别id
              description:
                type: string
                description: 商品描述
              price:
                type: number
                description: 商品价格
              act_price:
                type: number
                description: 活动价格
              recommended:
                type: boolean
                description: 是否推荐
              picture_ids:
                type: array
                description: 商品图片
                items:
                  type: string
                  format: uuid
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/Commodity"

  /commodities/{id}/attributes:
    post:
      summary: 增加商品属性
      tags:
        - admin
        - commodity
      description: 为指定商品添加商品属性
      parameters:
        - in: path
          name: id
          required: true
          type: string
          format: uuid
          description: 商品id
        - in: body
          name: attribute
          required: true
          description: 新增的商品属性
          schema:
            type: object
            properties:
              attr_name:
                type: string
                description: 属性名
              attr_value:
                type: array
                description: 属性值数组
                items:
                  type: string
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/CommodityAttr"

    get:
      summary: 获取商品属性列表
      tags:
        - commodity
      description: 获取商品列表
      parameters:
        - in: path
          name: id
          description: 商品id
          required: true
          type: string
          format: uuid
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
              $ref: "#/definitions/CommodityAttr"

  /commodities/{id}/attributes/{attr_id}:
    get:
      summary: 获取商品指定属性
      tags:
        - commodity
      description: 获取指定商品的指定属性
      parameters:
        - in: path
          name: id
          required: true
          type: string
          format: uuid
          description: 商品id
        - in: path
          name: attr_id
          required: true
          type: string
          format: uuid
          description: 属性id
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/CommodityAttr"
    put:
      summary: 修改商品指定属性
      tags:
        - admin
        - commodity
      description: 修改指定商品的属性
      parameters:
        - in: path
          name: id
          required: true
          type: string
          format: uuid
          description: 商品id
        - in: path
          name: attr_id
          required: true
          type: string
          format: uuid
          description: 属性id
        - in: body
          name: attribute
          required: true
          description: 被替换的属性内容
          schema:
            type: object
            properties:
              attr_name:
                type: string
                description: 属性名
              attr_value:
                type: array
                description: 属性值数组
                items:
                  type: string
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/CommodityAttr"

    delete:
      summary: 删除商品指定属性
      tags:
        - admin
        - commodity
      description: 删除指定商品的指定属性
      parameters:
        - in: path
          name: id
          required: true
          type: string
          format: uuid
          description: 商品id
        - in: path
          name: attr_id
          required: true
          type: string
          format: uuid
          description: 属性id
      responses:
        200:
          description: Success
          schema:
            $ref: "#/definitions/CommodityAttr"

  /commodity_categories:
    get:
      tags:
        - commodity_category
        - pagination
      summary: 商品分类列表
      description: 获取商品分类列表
      responses:
        200:
          description: Success
          schema:
            type: object
            properties:
              count:
                type: integer
              start:
                type: integer
              items:
                type: array
                items:
                  $ref: '#/definitions/CommodityCategory'
    post:
      tags:
        - commodity_category
        - admin
      summary: 添加商品分类
      description: 添加商品分类
      parameters:
        - name: commodity_category
          in: body
          required: true
          schema:
            required:
              - name
              - cover_id
            properties:
              name:
                type: string
                description: 商品类名
              cover_id:
                type: string
                format: uuid
                description: 类型封面图id
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/CommodityCategory'
    delete:
      tags:
        - commodity_category
        - admin
      description: 根据ids删除商品分类
      summary: 批量删除商品分类
      parameters:
        - name: ids
          in: query
          required: true
          description: 删除的分类id(eg:ids=uuid,uuid,uuid)
          type: string
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
             $ref: '#/definitions/CommodityCategory'

  /commodity_categories/{id}:
    patch:
      tags:
       - commodity_category
       - admin
      description: 修改商品分类
      summary: 修改商品分类
      parameters:
        - name: id
          in: path
          required: true
          type: string
          description: 商品分类id
          format: uuid
        - name: commodity_category
          in: body
          required: true
          schema:
            properties:
              name:
                type: string
                description: 商品分类名称
              cover_id:
                type: string
                format: uuid
                description: 商品分类封面id
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/CommodityCategory'

  /banners:
    get:
      tags:
        - banner
      summary: 获取banner列表
      description: 获取banner列表
      responses:
        200:
          description: Success
          schema:
            type: object
            properties:
              count:
                type: integer
              items:
                type: array
                items:
                  $ref: '#/definitions/Banner'
    post:
      tags:
        - banner
        - admin
      summary: 添加banner
      description: 添加banner
      parameters:
        - name: picture
          in: body
          required: true
          schema:
            required:
              - picture_id
            properties:
              picture_id:
                type: string
                format: uuid
                description: banner图id
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Banner'

  /banners/{id}:
    delete:
      tags:
        - banner
        - admin
      description: 根据id删除banner
      summary: 删除banner
      parameters:
        - name: id
          in: path
          required: true
          description: 删除的banner id
          format: uuid
          type: string
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Banner'

    patch:
      tags:
       - banner
       - admin
      description: 修改banner
      summary: 修改banner
      parameters:
        - name: id
          in: path
          required: true
          type: string
          description: banner id
          format: uuid
        - name: picture
          in: body
          required: true
          description: 封面图
          schema:
            type: object
            required:
              - picture_id
            properties:
              picture_id:
                type: string
                format: uuid
                description: 属性名
      responses:
        200:
          description: Success
          schema:
            $ref: '#/definitions/Banner'

definitions:

  Order_Type:
    type: string
    enum: [
      'WECHAT',
      'ALIPAY'
    ]

  Order_Status:
    type: string
    enum: [
      'CREATED',
      'PAYED',
      'SHIPMENT',
      'FINISHED'
    ]

  Trade_Status:
    type: string
    enum: [
      'PENDING',
      'CLOSED',
      'SUCCESS'
    ]

  Post_Status:
    type: string
    enum: [
      'VALID',
      'INVALID'
    ]

  Post_Query_Type:
    description: 贴子查询类型(最新或最热)
    type: string
    enum: [
      'NEW',
      'HOT'
    ]

  Commodity_Status:
    type: string
    description: 上/下架状态
    enum: [
      'ON',
      'OFF',
    ]

  User:
    properties:
      id:
        type: string
        format: uuid
      name:
        type: string
      phone:
        type: string

  Order:
    properties:
      id:
        type: string
        format: uuid
      no:
        type: integer
      status:
        $ref: "#/definitions/Order_Status"
      commodity_price:
        type: number
        format: float
      price:
        type: number
        format: float
      user_id:
        type: string
        format: uuid
      commodity_id:
        type: string
        format: uuid
      commodity_attr: 
        type: string
      ommodity_attr_val:
        type: string
      address_id:
        type: string
        format: uuid
      trade_id:
        type: string
        format: uuid

  Trade:
    properties:
      id:
        type: string
        format: uuid
      order_id:
        type: string
        format: uuid
      trade_no:
        type: string
        description: 支付订单号
      type:
        type: string
        enum: [
          'WECHAT',
          'ALIPAY'
        ]
      status:
        $ref: "#/definitions/Trade_Status"

  Address:
    properties:
      id:
        type: string
        format: uuid
      user_id:
        type: string
        format: uuid
      name:
        type: string
      phone:
        type: string
      location:
        type: string
      default:
        type: boolean

  Logistics:
    properties:
      id:
        type: string
        format: uuid
      order_id:
        type: string
        format: uuid
        description: 内部订单id
      company:
        type: string
      order_no:
        type: string
        description: 物流订单号

  Post:
    properties:
      id:
        type: number
        format: uuid
      no:
        type: integer
      theme:
        type: string
        description: 帖子主题
      theme_filted:
        type: string
        description: 已标记敏感词的帖子主题
      content:
        type: string
        description: 帖子内容
      content_filted:
        type: string
        description: 已标记敏感词的帖子内容
      hits:
        type: number
        description: 浏览量
      votes:
        type: number
        description: 点赞数
      vote:
        type: object
        description: 点赞详情
      comments:
        type: number
        description: 评论数
      cover_ids:
        type: array
        items:
          type: string
          format: uuid
        description: 帖子封面文件id数组
      user_id:
        type: string
        description: 帖子所属用户id
        format: uuid
      category_id:
        type: string
        description: 帖子所属分类id
        format: uuid
      sensitive_words:
        type: array
        description: 帖子敏感词
        items:
          type: string
      user:
        $ref: "#/definitions/User"

  PostCategory:
    properties:
      id:
        type: string
        format: uuid
      name:
        type: string
        description: 帖子分类名称
      cover_id:
        type: string
        description: 分类封面id
        format: uuid

  PostComment:
    properties:
      id:
        type: string
        format: uuid
      user_id:
        type: string
        format: uuid
      post_id:
        type: string
        format: uuid
      cotent:
        type: string
      content_filted:
        type: string
        description: 已过滤敏感词的评论内容

  PostVote:
    description: 帖子点赞
    properties:
      id:
        type: string
        format: uuid
      user_id:
        type: string
        format: uuid
      post_id:
        type: string
        format: uuid

  SensitiveWord:
    properties:
      id:
        type: string
        format: uuid
      key:
        type: string
        description: 敏感词关键字

  File:
    properties:
      id:
        type: string
        format: uuid
      name:
        type: string
        description: 文件名
      type:
        type: string
        description: 文件类型
      size:
        type: string
        description: 文件大小

  Commodity:
    type: object
    properties:
      id:
        type: string
        format: uuid
        description: 商品id
      description:
        type: string
        description: 商品描述
      price:
        type: number
        description: 商品价格
      act_price:
        type: number
        description: 活动价格
      total:
        type: number
        default: 0
        description: 商品总数
      sales:
        type: number
        default: 0
        description: 已售出数量
      recommended:
        type: boolean
        default: false
        description: 是否推荐
      status:
        $ref: "#/definitions/Commodity_Status"
      attr_ids:
        type: array
        description: 属性id
        items:
          type: string
          format: uuid
      category_id:
        type: string
        format: uuid
        description: 商品所属类型id
      picture_ids:
        type: array
        description: 商品图片id
        items:
          type: string
          format: uuid

  CommodityAttr:
    type: object
    properties:
      id:
        type: string
        format: uuid
      name:
        type: string
        description: 属性描述
      values:
        type: array
        description: 属性值
        items:
          type: string
      commodity_id:
        type: string
        format: uuid
        description: 商品id

  CommodityCategory:
    type: object
    properties:
      id:
        type: string
        format: uuid
      name:
        type: string
        description: 类型名
      cover_id:
        type: string
        format: uuid
        description: 产品类型封面id

  Banner:
    properties:
      id:
        type: string
        format: uuid
      picture_id:
        type: string
        format: uuid
