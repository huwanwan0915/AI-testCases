# 日历改造测试数据最小执行说明

## 1. 文件

- SQL 文件：`tmp/calendar-testdata-min.sql`

## 2. 推荐执行顺序

1. 执行 `A1` 找候选产品。
2. 把产品编号填到 `SET @activity_code = xxx;`
3. 执行 `A2` 查套餐、场次、价格。
4. 把查出来的 `activity_id` 填到 `SET @activity_id = 'xxx';`
5. 执行 `B` 做快照。
6. 按你需要的场景执行 `C` 到 `H`。

## 3. 各场景需要填的最少参数

### 产品级即将开售

- `@cal_b_activity_id`

### 套餐级即将开售

- `@cal_c_activity_id`
- `@cal_c_act_group_id`

### 调价优惠

- `@cal_d_activity_id`
- `@cal_d_act_group_id`
- `@cal_d_act_item_id`

### 截止时间控制

- `@cal_e_act_item_id`
- `@cal_f_act_item_id`

### 卡预约

- `@cal_g_activity_id`
- `@cal_g_act_price_id`

### 候补

- `@cal_r_activity_id`
- `@cal_r_act_item_id`
- `@cal_r_user_id`
- `@cal_r_mobile`

## 4. 注意

- `SET @activity_code = 0;` 只是默认值，不是最终值。
- 真正执行前要改成真实产品编号，例如 `SET @activity_code = 119199;`
- 如果某个场景不用，就不用填对应参数，也不要执行那一段 SQL。
- 这份最小版没有回滚 SQL，执行前先保存 `B` 段快照结果。
