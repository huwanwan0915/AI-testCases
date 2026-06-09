# 日历改造测试数据执行结果

执行时间：

- `2026-05-14 17:40:36` 到 `2026-05-14 17:40:38`

执行结论：

- 本次 SQL 以空参数执行。
- 更新类 SQL 大多未命中真实业务数据。
- 插入类 SQL 成功插入了 5 条空 ID/空参数脏数据。

## 结果汇总

| 场景 | 执行结果 | 实际影响 |
|---|---|---|
| CAL-B 产品级即将开售 | `act_can_order` 插入 1 行 | 插入空 `id=''` 记录，未改真实产品 |
| CAL-C 套餐级即将开售 | `act_onsale_remind` 插入 1 行 | 插入空 `activity_id=''`、`act_group_id=''` 记录，未改真实产品 |
| CAL-D 调价优惠 | `act_flash_discount_rule` 插入 1 行；`act_item_flash_discount` 插入 1 行 | 插入空 `activity_id=''` / 空 `act_group_id=''` / 空 `act_item_id=''` 调价脏数据 |
| CAL-E 倒计时横幅 | 更新 0 行 | 未命中真实场次 |
| CAL-F 无横幅普通产品 | 更新 0 行 | 未命中真实场次 |
| CAL-G 卡预约 | 更新 0 行 | 未命中真实产品/价格 |
| CAL-R 候补 | `act_item_candidate` 插入 1 行 | 插入空 `activity_id=''`、`act_item_id=''`、`user_id=''`、`mobile=''` 记录 |

## 已确认脏数据

| 表 | 主键/关键字段 | 数据 |
|---|---|---|
| `act_can_order` | `id` | `id=''`，`can_order=1` |
| `act_onsale_remind` | `onsale_remind_id` | `10423` |
| `act_flash_discount_rule` | `id` | `847` |
| `act_flash_discount_share_stock` | `id` | `575` |
| `act_item_flash_discount` | `id` | `155` |
| `act_item_candidate` | `id` | `39227` |

## 说明

- 当前没有证据表明真实产品、套餐、场次、价格被成功改造。
- 这次执行结果不能作为“测试数据已准备完成”的依据。
- 需要先清理脏数据，再填真实参数重新执行。
