-- 日历改造项目测试数据 SQL 草稿
-- 说明：
-- 1. 本稿默认非生产环境。
-- 2. 先查候选产品，再给下面的 @变量赋真实值。
-- 3. 本稿只给出最小可落地的 lookup / write / verify / cleanup 结构，不直接执行。

/* =========================================================
 * 0. 参数区
 * 直接先改这里，不要改正文 SQL。
 * ========================================================= */

SET @activity_code = 0;
SET @activity_id = '';

SET @cal_b_activity_id = '';

SET @cal_c_activity_id = '';
SET @cal_c_act_group_id = '';

SET @cal_d_activity_id = '';
SET @cal_d_act_group_id = '';
SET @cal_d_act_item_id = '';
SET @cal_d_flash_rule_id = 0;

SET @cal_e_act_item_id = '';
SET @cal_f_act_item_id = '';

SET @cal_g_activity_id = '';
SET @cal_g_act_price_id = '';

SET @cal_h_adult_price_id = '';
SET @cal_h_child_price_id = '';
SET @cal_i_adult_price_id = '';
SET @cal_i_child_price_id = '';
SET @cal_j_adult_price_id = '';
SET @cal_j_child_price_id = '';
SET @cal_k_adult_price_id = '';
SET @cal_k_child_price_id = '';
SET @cal_l_combo_price_id = '';

SET @cal_m_activity_id = '';
SET @cal_m_act_group_id = '';

SET @cal_n_main_act_group_id = '';
SET @cal_n_resource_act_group_id = '';

SET @cal_o_activity_id = '';
SET @cal_p_activity_id = '';
SET @cal_p_discount_type = 0;

SET @cal_q_act_price_id = '';

SET @cal_r_activity_id = '';
SET @cal_r_act_item_id = '';
SET @cal_r_user_id = '';
SET @cal_r_mobile = '';

/* =========================================================
 * A. 候选产品查找
 * ========================================================= */

-- A1. 查预定类、可售、带日历数据的候选产品
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

-- A2. 查候选产品下的套餐、场次、价格
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
 * B. 通用快照
 * 每次改造前都先执行一份快照，便于回滚。
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
WHERE a.activity_code = @activity_code;

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
 * activity.is_waiting = 1，onsale_time 未来时间
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

/* cleanup
-- 这里请先用快照查询结果手工回填旧值后再执行。
-- UPDATE activity
-- SET is_waiting = 0,
--     onsale_time = NULL,
--     sell_status = 1,
--     status = '1',
--     update_date = NOW()
-- WHERE activity_id = @cal_b_activity_id;
-- UPDATE act_can_order
-- SET can_order = 1,
--     update_date = NOW()
-- WHERE id = @cal_b_activity_id;
*/

/* =========================================================
 * D. CAL-C 套餐级即将开售
 * activity.is_waiting = 2
 * act_onsale_remind / act_onsale_remind_detail 用于验证提醒链路
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

/* cleanup
DELETE FROM act_onsale_remind
WHERE activity_id = @cal_c_activity_id
  AND act_group_id = @cal_c_act_group_id
  AND create_person = 'codex';
*/

/* =========================================================
 * E. CAL-D 调价优惠
 * act_flash_discount_rule + act_item_flash_discount
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

/* cleanup
DELETE FROM act_item_flash_discount
WHERE act_group_id = @cal_d_act_group_id
  AND act_item_id = @cal_d_act_item_id
  AND act_flash_discount_rule_id = @cal_d_flash_rule_id;
DELETE FROM act_flash_discount_rule
WHERE id = @cal_d_flash_rule_id;
DELETE FROM act_flash_discount_share_stock
WHERE id = @cal_d_share_stock_id;
*/

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
 * H. CAL-H / CAL-I / CAL-J / CAL-K / CAL-L 起售价分支
 * 只改价格，不改产品主体
 * ========================================================= */

-- CAL-H 双起价：成人价 != 儿童价
UPDATE act_price
SET price = CASE
              WHEN act_price_id = @cal_h_adult_price_id THEN 1999.00
              WHEN act_price_id = @cal_h_child_price_id THEN 1599.00
              ELSE price
            END,
    update_date = NOW()
WHERE act_price_id IN (@cal_h_adult_price_id, @cal_h_child_price_id);

-- CAL-I 单一起价：成人价 = 儿童价
UPDATE act_price
SET price = 1699.00,
    update_date = NOW()
WHERE act_price_id IN (@cal_i_adult_price_id, @cal_i_child_price_id);

-- CAL-J 仅成人价
UPDATE act_price
SET status = CASE
               WHEN act_price_id = @cal_j_child_price_id THEN '9'
               ELSE status
             END,
    update_date = NOW()
WHERE act_price_id IN (@cal_j_adult_price_id, @cal_j_child_price_id);

-- CAL-K 儿童价兜底：儿童价最低
UPDATE act_price
SET price = CASE
              WHEN act_price_id = @cal_k_adult_price_id THEN 1999.00
              WHEN act_price_id = @cal_k_child_price_id THEN 999.00
              ELSE price
            END,
    update_date = NOW()
WHERE act_price_id IN (@cal_k_adult_price_id, @cal_k_child_price_id);

-- CAL-L 组合价兜底：组合价最低
UPDATE act_price
SET price = CASE
              WHEN act_price_id = @cal_l_combo_price_id THEN 2499.00
              ELSE price
            END,
    update_date = NOW()
WHERE act_price_id = @cal_l_combo_price_id;

SELECT act_price_id, act_item_id, adult_cnt, child_cnt, price, status
FROM act_price
WHERE act_price_id IN (
  @cal_h_adult_price_id,
  @cal_h_child_price_id,
  @cal_i_adult_price_id,
  @cal_i_child_price_id,
  @cal_j_adult_price_id,
  @cal_j_child_price_id,
  @cal_k_adult_price_id,
  @cal_k_child_price_id,
  @cal_l_combo_price_id
)
ORDER BY act_item_id, adult_cnt, child_cnt;

/* =========================================================
 * I. CAL-M 营地教育
 * ========================================================= */

INSERT INTO act_group_edu (
  act_group_id,
  activity_id,
  age_min,
  age_max,
  lesson_num,
  lesson_minutes,
  introduction,
  announcements,
  discount_info
)
SELECT
  @cal_m_act_group_id,
  @cal_m_activity_id,
  6,
  12,
  5,
  90,
  '[]',
  '日历改造测试营地教育数据',
  '[]'
FROM dual
WHERE NOT EXISTS (
  SELECT 1
  FROM act_group_edu
  WHERE act_group_id = @cal_m_act_group_id
);

SELECT *
FROM act_group_edu
WHERE act_group_id = @cal_m_act_group_id;

/* =========================================================
 * J. CAL-N 多线路资源产品
 * ========================================================= */

INSERT INTO act_group_travel_resource (
  act_group_id,
  resource_type,
  price_unit,
  quota_type,
  need_traveler,
  status,
  create_person,
  create_date,
  update_person,
  update_date
)
SELECT
  @cal_n_resource_act_group_id,
  'pickup',
  '份',
  2,
  1,
  '0',
  'codex',
  NOW(),
  'codex',
  NOW()
FROM dual
WHERE NOT EXISTS (
  SELECT 1
  FROM act_group_travel_resource
  WHERE act_group_id = @cal_n_resource_act_group_id
);

INSERT INTO act_group_travel_resource_bind (
  act_group_id,
  resource_act_group_id,
  start_day,
  sort_value,
  status,
  create_person,
  create_date,
  update_person,
  update_date
)
SELECT
  @cal_n_main_act_group_id,
  @cal_n_resource_act_group_id,
  1,
  100,
  '0',
  'codex',
  NOW(),
  'codex',
  NOW()
FROM dual
WHERE NOT EXISTS (
  SELECT 1
  FROM act_group_travel_resource_bind
  WHERE act_group_id = @cal_n_main_act_group_id
    AND resource_act_group_id = @cal_n_resource_act_group_id
    AND status = '0'
);

INSERT INTO act_group_traveler_quota (
  id,
  travel_validate,
  total_cnt,
  adult_cnt,
  child_cnt,
  member_cred_type,
  status,
  create_date
)
SELECT
  @cal_n_main_act_group_id,
  1,
  3,
  2,
  1,
  1,
  '0',
  NOW()
FROM dual
WHERE NOT EXISTS (
  SELECT 1
  FROM act_group_traveler_quota
  WHERE id = @cal_n_main_act_group_id
);

SELECT *
FROM act_group_travel_resource
WHERE act_group_id = @cal_n_resource_act_group_id;

SELECT *
FROM act_group_travel_resource_bind
WHERE act_group_id = @cal_n_main_act_group_id
  AND resource_act_group_id = @cal_n_resource_act_group_id;

SELECT *
FROM act_group_traveler_quota
WHERE id = @cal_n_main_act_group_id;

/* =========================================================
 * K. CAL-O / CAL-P 拼单立减 / 返现团
 * ========================================================= */

INSERT INTO tuan_config (
  activity_id,
  title,
  greeting,
  tuan_limits1,
  tuan_discount1,
  tuan_hours,
  tuan_cost_type,
  show_directbuy,
  is_fail_auto_refund,
  tuan_type,
  discount_type,
  can_auto_tuan,
  auto_tuan_minutes,
  status,
  create_person,
  create_date,
  update_person,
  update_date
) VALUES (
  @cal_o_activity_id,
  '日历改造立减团',
  '测试立减团',
  3,
  200,
  48,
  1,
  1,
  0,
  2,
  1,
  0,
  0,
  '0',
  'codex',
  NOW(),
  'codex',
  NOW()
);

INSERT INTO tuan_config (
  activity_id,
  title,
  greeting,
  tuan_limits1,
  tuan_discount1,
  tuan_hours,
  tuan_cost_type,
  show_directbuy,
  is_fail_auto_refund,
  tuan_type,
  discount_type,
  can_auto_tuan,
  auto_tuan_minutes,
  status,
  create_person,
  create_date,
  update_person,
  update_date
) VALUES (
  @cal_p_activity_id,
  '日历改造返现团',
  '测试返现团',
  3,
  100,
  48,
  1,
  1,
  0,
  1,
  @cal_p_discount_type,
  0,
  0,
  '0',
  'codex',
  NOW(),
  'codex',
  NOW()
);

SELECT tuan_config_id, activity_id, tuan_type, discount_type, tuan_discount1, status
FROM tuan_config
WHERE activity_id IN (@cal_o_activity_id, @cal_p_activity_id)
ORDER BY tuan_config_id DESC;

/* =========================================================
 * L. CAL-Q 会员价
 * ========================================================= */

UPDATE act_price
SET enable_vip_discount = 1,
    bd_vip_discount = 50.00,
    market_vip_discount = 30.00,
    update_date = NOW()
WHERE act_price_id = @cal_q_act_price_id;

SELECT act_price_id, price, enable_vip_discount, bd_vip_discount, market_vip_discount
FROM act_price
WHERE act_price_id = @cal_q_act_price_id;

/* =========================================================
 * M. CAL-R 候补
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
) SELECT
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

/* cleanup
DELETE FROM act_item_candidate
WHERE act_item_id = @cal_r_act_item_id
  AND user_id = @cal_r_user_id
  AND create_person = 'codex';
*/
