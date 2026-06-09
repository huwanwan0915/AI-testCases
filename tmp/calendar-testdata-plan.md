# 日历改造项目测试数据方案

## 1. 目标

为 `日历改造项目` 准备一组可复用的测试产品，优先覆盖以下前端链路：

- 产品详情价格横幅
- 起售价/价格说明弹层
- 日历弹窗
- 全部日期弹窗
- 选择资源页

当前未指定执行环境，因此本稿仅输出：

- 测试产品覆盖清单
- 关键库表控制点
- SQL 草稿

不直接执行数据库写入。

## 2. 最小覆盖产品集

建议不要为每个用例单独造一套产品，而是做一组可复用的“标准测试产品”。

### CAL-A 普通可售预定产品

覆盖：

- 设置产品开售，但未设置开售时间
- 正常可售
- 非调价
- 非拼单
- 非会员

目标状态：

- 产品级即将开售
- `activity.is_waiting = 1`
- `activity.onsale_time IS NULL`
- `act_can_order.can_order = 1`
- 有正常场次和价格

### CAL-B 产品级即将开售产品

覆盖：

- 设置产品开售且设置开售时间
- 可点击开售提醒
- 起售价可见场景

目标状态：

- `activity.is_waiting = 1`
- `activity.onsale_time > NOW()`
- `act_can_order.can_order = 1`

### CAL-C 套餐级即将开售产品

覆盖：

- 设置套餐开售且设置开售时间
- 详情页不展示价格横幅，只展示价格信息栏

目标状态：

- `activity.is_waiting = 2`
- 套餐存在开售提醒配置
- `act_can_order.can_order = 1`

### CAL-D 调价优惠产品

覆盖：

- 未设置即将开售 + 存在调价优惠
- 调价文案
- 已减金额
- 价格说明弹层中的常规售价/当前起价

目标状态：

- 绑定有效 `act_flash_discount_rule`
- 绑定目标场次 `act_item_flash_discount`

### CAL-E 倒计时横幅产品

覆盖：

- 未设置即将开售
- 不存在调价
- 所有可售场次付款截止时间 <= 15 天

目标状态：

- `activity.is_waiting = 0`
- 无调价规则
- 有可售场次
- `act_item.expires_at` 在 15 天内

### CAL-F 无横幅普通产品

覆盖：

- 未设置即将开售
- 不存在调价
- 所有可售场次付款截止时间 > 15 天

目标状态：

- `activity.is_waiting = 0`
- 无调价规则
- `act_item.expires_at` 超过 15 天

### CAL-G 卡预约产品

覆盖：

- 卡预约价格区点数文案
- 卡预约不显示起售价/已售文案/价格说明入口

目标状态：

- `activity.can_ccard_booking = 1`
- `act_price.can_ccard_booking > 0`

### CAL-H 亲子双起价产品

覆盖：

- 1成人 + 1儿童
- 成人价 != 儿童价
- 双起价展示

目标状态：

- 同场次下存在：
- `act_price(adult_cnt=1, child_cnt=0)`
- `act_price(adult_cnt=0, child_cnt=1)` 或按现网价格结构可映射到儿童最低价
- 能推导出成人价与儿童价不同

### CAL-I 单一起价产品

覆盖：

- 1成人 + 1儿童
- 成人价 = 儿童价
- `￥XXX起/人`

### CAL-J 仅成人起价产品

覆盖：

- 仅成人起价

### CAL-K 儿童价兜底产品

覆盖：

- 兜底最低 1 儿童价

### CAL-L 组合价兜底产品

覆盖：

- 兜底最低组合价

### CAL-M 营地教育产品

覆盖：

- 营地教育儿童起价
- 营地教育成人兜底价
- 营地教育组合价兜底

目标状态：

- 存在 `act_group_edu`

### CAL-N 多线路资源产品

覆盖：

- 多线路日历弹窗
- 非多线路/多线路差异
- 资源浮条
- 选择资源页

目标状态：

- 主套餐有多场次
- 存在 `act_group_travel_resource`
- 存在 `act_group_travel_resource_bind`
- 建议补 `act_group_traveler_quota`

### CAL-O 拼单立减产品

覆盖：

- 立减团
- 调价 + 立减团
- 日历弹窗金额浮条中的立减文案

目标状态：

- `tuan_config.tuan_type = 2`
- 套餐或产品存在立减配置

### CAL-P 拼单返现产品

覆盖：

- 返现团按人数
- 返现团按订单
- 调价 + 返现团

目标状态：

- `tuan_config.tuan_type = 1`
- 分别覆盖 `discount_type = 0 / 1`

### CAL-Q 会员价产品

覆盖：

- 会员优惠展示

目标状态：

- `act_price.enable_vip_discount = 1`
- `bd_vip_discount + market_vip_discount > 0`

### CAL-R 候补产品

覆盖：

- 已选团期候补
- 余位通知弹框
- 候补通知埋点

目标状态：

- `act_item.support_candidate = 1`
- 对应场次不可直接售卖或库存不足
- 可补 `act_item_candidate`

## 3. 建议优先落地的最小组合

如果你只想先搞一版能跑主链路的，建议先做这 10 个：

- `CAL-B` 产品级即将开售
- `CAL-C` 套餐级即将开售
- `CAL-D` 调价优惠
- `CAL-E` 倒计时横幅
- `CAL-F` 无横幅普通产品
- `CAL-G` 卡预约
- `CAL-H` 双起价
- `CAL-I` 单一起价
- `CAL-N` 多线路资源
- `CAL-R` 候补

## 4. 关键控制表

### 产品级

- `activity`
- `activity_ext2`
- `act_can_order`

### 套餐/规则级

- `act_group`
- `act_group_bind_rule`
- `act_purchase_rule`
- `act_itinerary_rule`
- `act_group_edu`
- `act_group_travel_resource`
- `act_group_travel_resource_bind`
- `act_group_traveler_quota`

### 场次/价格级

- `act_item`
- `act_price`

### 开售提醒/候补

- `act_onsale_remind`
- `act_onsale_remind_detail`
- `act_item_candidate`

### 调价/拼单

- `act_flash_discount_rule`
- `act_item_flash_discount`
- `tuan_config`

## 5. 落地建议

建议走“找现有产品 -> 小范围改字段 -> 校验 -> 回滚”的方式，不建议从零插完整产品链路。原因：

- 麦淘产品链路表多，纯插入容易漏关联
- 日历改造多数场景只依赖展示分支字段
- 复用已有产品能更快拿到可用页面

推荐顺序：

1. 先找 10 个现有候选产品。
2. 按场景把关键字段改到目标状态。
3. 执行验证 SQL。
4. 记录回滚 SQL。

## 6. 产物

配套 SQL 草稿见：

- `/tmp/calendar-testdata-draft.sql`
