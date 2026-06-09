# 日历改造测试数据执行登记表

## 使用说明

- 本表用于记录已经实际执行到数据库的数据。
- 当前我无法从本地 SQL 文件中反推出你真实执行的参数，所以先生成模板。
- 你把数据库里实际使用的产品编号、活动 ID、套餐 ID、场次 ID、价格 ID 回填到表里即可。

| 场景 | 是否已执行 | 产品编号 activity_code | 活动ID activity_id | 套餐ID act_group_id | 场次ID act_item_id | 价格ID act_price_id | 用户ID user_id | 手机号 mobile | 核心改动 | 结果校验 |
|---|---|---:|---|---|---|---|---|---|---|---|
| CAL-B 产品级即将开售 | 否 |  |  |  |  |  |  |  | `activity.is_waiting=1` `onsale_time>now` `act_can_order.can_order=1` |  |
| CAL-C 套餐级即将开售 | 否 |  |  |  |  |  |  |  | `activity.is_waiting=2` `act_onsale_remind`新增 |  |
| CAL-D 调价优惠 | 否 |  |  |  |  |  |  |  | `act_flash_discount_rule`新增 `act_item_flash_discount`新增 |  |
| CAL-E 倒计时横幅 | 否 |  |  |  |  |  |  |  | `act_item.expires_at=7天内` |  |
| CAL-F 无横幅普通产品 | 否 |  |  |  |  |  |  |  | `act_item.expires_at>15天` |  |
| CAL-G 卡预约 | 否 |  |  |  |  |  |  |  | `activity.can_ccard_booking=1` `act_price.can_ccard_booking>0` |  |
| CAL-R 候补 | 否 |  |  |  |  |  |  |  | `act_item.support_candidate=1` `act_item_candidate`新增 |  |

## 建议补充字段

如果你要把这份表给测试同学直接用，建议再补下面这些信息：

| 场景 | 页面入口 | 测试目的 | 预期展示 |
|---|---|---|---|
| CAL-B 产品级即将开售 | 产品详情页 | 校验产品级即将开售横幅、提醒按钮 | 显示“距开售还剩” |
| CAL-C 套餐级即将开售 | 产品详情页价格信息栏 | 校验套餐级开售不展示横幅 | 只展示价格信息栏 |
| CAL-D 调价优惠 | 产品详情页/价格说明弹层 | 校验已减金额、优惠文案 | 展示调价信息 |
| CAL-E 倒计时横幅 | 产品详情页 | 校验付款截止倒计时 | 展示倒计时横幅 |
| CAL-F 无横幅普通产品 | 产品详情页 | 校验不展示横幅 | 只展示价格信息栏 |
| CAL-G 卡预约 | 产品详情页/全部日期 | 校验点数文案 | 不展示起售价 |
| CAL-R 候补 | 日历弹窗 | 校验候补入口和候补记录 | 可进入候补流程 |
