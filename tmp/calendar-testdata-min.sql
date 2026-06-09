-- 日历改造项目测试数据 SQL（最小可执行版）
-- 使用方式：
-- 1. 先执行参数区，把真实值填进去。
-- 2. 先执行 A、B 查候选产品和快照。
-- 3. 再按需要执行对应场景段落。
-- 4. 默认仅限非生产环境。

/* =========================================================
 * 0. 参数区
 * 只改这里。
 * ========================================================= */

-- 通用查询参数
SET @activity_code = 0;
SET @activity_id = '';

-- CAL-B 产品级即将开售
SET @cal_b_activity_id = '';

-- CAL-C 套餐级即将开售
SET @cal_c_activity_id = '';
SET @cal_c_act_group_id = '';

-- CAL-D 调价优惠
SET @cal_d_activity_id = '';
SET @cal_d_act_group_id = '';
SET @cal_d_act_item_id = '';

-- CAL-E / CAL-F 截止时间控制
SET @cal_e_act_item_id = '';
SET @cal_f_act_item_id = '';

-- CAL-G 卡预约
SET @cal_g_activity_id = '';
SET @cal_g_act_price_id = '';

-- CAL-R 候补
SET @cal_r_activity_id = '';
SET @cal_r_act_item_id = '';
SET @cal_r_user_id = '';
SET @cal_r_mobile = '';

/* =========================================================
 * A. 候选产品查找
 * ========================================================= */

-- A1. 先找候选产品
SELECT
  a.activity_id,
  a.activity_code,
  a.title,
  a.category_id,
  a.pro_type1,
  a.pro_type2,
  a.layout_type,
  a.can_ccard_booking,
  a.is_waiting,
  a.onsale_time,
  a.sell_status,
  a.status,
  o.can_order
FROM activity a
LEFT JOIN act_can_order o
  ON o.id = a.activity_id
WHERE a.category_id = '1'
  AND a.data_version = 2
  AND a.status = '1'
ORDER BY a.update_date DESC
LIMIT 200;

-- A2. 查某个候选产品下的套餐、场次、价格
SELECT
  a.activity_code,
  a.activity_id,
  g.act_group_id,
  g.title AS act_group_title,
  i.act_item_id,
  i.title AS act_item_title,
  i.begin_at,
  i.expires_at,
  i.support_candidate,
  i.status AS act_item_status,
  p.act_price_id,
  p.adult_cnt,
  p.child_cnt,
  p.price,
  p.can_ccard_booking,
  p.enable_vip_discount,
  p.bd_vip_discount,
  p.market_vip_discount
FROM activity a
JOIN act_group g
  ON g.activity_id = a.activity_id
 AND g.status = '0'
JOIN act_item i
  ON i.activity_id = a.activity_id
 AND i.act_group_id = g.act_group_id
 AND i.status IN ('1', '5', '6', '7')
LEFT JOIN act_price p
  ON p.activity_id = a.activity_id
 AND p.act_item_id = i.act_item_id
 AND p.status = '0'
WHERE a.activity_code = @activity_code
ORDER BY g.act_group_id, i.begin_at, p.adult_cnt, p.child_cnt;

/* =========================================================
 * B. 快照
 * 改数据前先执行，便于手工回滚。
 * ========================================================= */

SELECT
  a.activity_id,
  a.activity_code,
  a.title,
  a.is_waiting,
  a.onsale_time,
  a.can_ccard_booking,
  a.sell_status,
  a.status,
  o.can_order
FROM activity a
LEFT JOIN act_can_order o
  ON o.id = a.activity_id
WHERE a.activity_id = @activity_id;

SELECT
  g.act_group_id,
  g.title,
  g.virtual_price,
  g.tuan_discount,
  g.is_formember,
  g.sell_status,
  g.status
FROM act_group g
WHERE g.activity_id = @activity_id
ORDER BY g.act_group_id;

SELECT
  i.act_item_id,
  i.act_group_id,
  i.begin_at,
  i.expires_at,
  i.support_candidate,
  i.status
FROM act_item i
WHERE i.activity_id = @activity_id
ORDER BY i.begin_at;

SELECT
  p.act_price_id,
  p.act_item_id,
  p.adult_cnt,
  p.child_cnt,
  p.price,
  p.can_ccard_booking,
  p.enable_vip_discount,
  p.bd_vip_discount,
  p.market_vip_discount
FROM act_price p
WHERE p.activity_id = @activity_id
  AND p.status = '0'
ORDER BY p.act_item_id, p.adult_cnt, p.child_cnt;

/* =========================================================
 * C. CAL-B 产品级即将开售
 * ========================================================= */

UPDATE activity
SET is_waiting = 1,
    onsale_time = DATE_ADD(NOW(), INTERVAL 2 DAY),
    sell_status = 1,
    status = '1',
    update_date = NOW()
WHERE activity_id = @cal_b_activity_id;

INSERT INTO act_can_order (id, can_order, create_date, update_date)
SELECT @cal_b_activity_id, 1, NOW(), NOW()
FROM dual
WHERE NOT EXISTS (
  SELECT 1
  FROM act_can_order
  WHERE id = @cal_b_activity_id
);

UPDATE act_can_order
SET can_order = 1,
    update_date = NOW()
WHERE id = @cal_b_activity_id;

SELECT activity_id, activity_code, is_waiting, onsale_time, sell_status, status
FROM activity
WHERE activity_id = @cal_b_activity_id;

SELECT id, can_order, update_date
FROM act_can_order
WHERE id = @cal_b_activity_id;

/* =========================================================
 * D. CAL-C 套餐级即将开售
 * ========================================================= */

UPDATE activity
SET is_waiting = 2,
    onsale_time = DATE_ADD(NOW(), INTERVAL 3 DAY),
    sell_status = 1,
    status = '1',
    update_date = NOW()
WHERE activity_id = @cal_c_activity_id;

INSERT INTO act_onsale_remind (
  activity_id,
  act_group_id,
  appid,
  remind_time,
  status,
  create_person,
  create_date,
  update_person,
  update_date
)
SELECT
  @cal_c_activity_id,
  @cal_c_act_group_id,
  'wx-test',
  DATE_ADD(NOW(), INTERVAL 2 DAY),
  0,
  'codex',
  NOW(),
  'codex',
  NOW()
FROM dual
WHERE NOT EXISTS (
  SELECT 1
  FROM act_onsale_remind
  WHERE activity_id = @cal_c_activity_id
    AND act_group_id = @cal_c_act_group_id
    AND status = 0
);

SELECT activity_id, is_waiting, onsale_time
FROM activity
WHERE activity_id = @cal_c_activity_id;

SELECT onsale_remind_id, activity_id, act_group_id, remind_time, status
FROM act_onsale_remind
WHERE activity_id = @cal_c_activity_id
  AND act_group_id = @cal_c_act_group_id;

/* =========================================================
 * E. CAL-D 调价优惠
 * ========================================================= */

INSERT INTO act_flash_discount_share_stock (sold_num)
VALUES (0);

SET @cal_d_share_stock_id = LAST_INSERT_ID();

INSERT INTO act_flash_discount_rule (
  activity_id,
  name,
  rule_type,
  rule_type_name,
  begin_at,
  end_at,
  price_delta,
  cost_delta,
  regular_max,
  share_stock_id,
  display_remaining_stock,
  status,
  create_person,
  create_date,
  update_person,
  update_date
) VALUES (
  @cal_d_activity_id,
  '日历改造测试调价',
  5,
  '测试调价',
  DATE_SUB(NOW(), INTERVAL 1 DAY),
  DATE_ADD(NOW(), INTERVAL 10 DAY),
  120.00,
  0.00,
  20,
  @cal_d_share_stock_id,
  1,
  '0',
  'codex',
  NOW(),
  'codex',
  NOW()
);

SET @cal_d_flash_rule_id = LAST_INSERT_ID();

INSERT INTO act_item_flash_discount (
  act_group_id,
  act_item_id,
  act_flash_discount_rule_id,
  status,
  create_person,
  create_date,
  update_person,
  update_date
) VALUES (
  @cal_d_act_group_id,
  @cal_d_act_item_id,
  @cal_d_flash_rule_id,
  '0',
  'codex',
  NOW(),
  'codex',
  NOW()
);

SELECT id, activity_id, name, begin_at, end_at, price_delta, regular_max, display_remaining_stock, status
FROM act_flash_discount_rule
WHERE activity_id = @cal_d_activity_id
ORDER BY id DESC;

SELECT id, act_group_id, act_item_id, act_flash_discount_rule_id, status
FROM act_item_flash_discount
WHERE act_group_id = @cal_d_act_group_id
  AND act_item_id = @cal_d_act_item_id
ORDER BY id DESC;

/* =========================================================
 * F. CAL-E / CAL-F 截止时间控制
 * ========================================================= */

-- CAL-E: <=15天，展示倒计时横幅
UPDATE act_item
SET expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY),
    update_date = NOW()
WHERE act_item_id = @cal_e_act_item_id;

-- CAL-F: >15天，不展示横幅
UPDATE act_item
SET expires_at = DATE_ADD(NOW(), INTERVAL 20 DAY),
    update_date = NOW()
WHERE act_item_id = @cal_f_act_item_id;

SELECT act_item_id, expires_at, status
FROM act_item
WHERE act_item_id IN (@cal_e_act_item_id, @cal_f_act_item_id);

/* =========================================================
 * G. CAL-G 卡预约
 * ========================================================= */

UPDATE activity
SET can_ccard_booking = 1,
    update_date = NOW()
WHERE activity_id = @cal_g_activity_id;

UPDATE act_price
SET can_ccard_booking = 2,
    update_date = NOW()
WHERE act_price_id = @cal_g_act_price_id;

SELECT activity_id, can_ccard_booking
FROM activity
WHERE activity_id = @cal_g_activity_id;

SELECT act_price_id, act_item_id, price, can_ccard_booking
FROM act_price
WHERE act_price_id = @cal_g_act_price_id;

/* =========================================================
 * H. CAL-R 候补
 * ========================================================= */

UPDATE act_item
SET support_candidate = 1,
    regular_max = 0,
    update_date = NOW()
WHERE act_item_id = @cal_r_act_item_id;

INSERT INTO act_item_candidate (
  activity_id,
  act_item_id,
  user_id,
  mobile,
  adult_cnt,
  child_cnt,
  room_cnt,
  vehicle_cnt,
  notice_cnt,
  activity_buy,
  act_item_buy,
  remark,
  status,
  create_person,
  create_date,
  update_person,
  update_date
)
SELECT
  @cal_r_activity_id,
  @cal_r_act_item_id,
  @cal_r_user_id,
  @cal_r_mobile,
  2,
  1,
  0,
  0,
  0,
  0,
  0,
  '日历改造候补测试数据',
  '0',
  'codex',
  NOW(),
  'codex',
  NOW()
FROM dual
WHERE NOT EXISTS (
  SELECT 1
  FROM act_item_candidate
  WHERE act_item_id = @cal_r_act_item_id
    AND user_id = @cal_r_user_id
    AND status = '0'
);

SELECT act_item_id, support_candidate, regular_max, status
FROM act_item
WHERE act_item_id = @cal_r_act_item_id;

SELECT id, activity_id, act_item_id, user_id, mobile, adult_cnt, child_cnt, status
FROM act_item_candidate
WHERE act_item_id = @cal_r_act_item_id
ORDER BY id DESC;
