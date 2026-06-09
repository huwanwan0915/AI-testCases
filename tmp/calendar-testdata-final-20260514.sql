-- 日历改造项目测试数据 SQL（已填真实参数版）
-- 环境：nonprod / maitao
-- 生成时间：2026-05-14
-- 标记：codexcal20260514

SET @marker = 'codexcal20260514';
SET @appid_marker = 'wx_cal_20260514';
SET @discount_name = '日历改造测试调价-20260514';
SET @candidate_remark = '日历改造测试数据-候补-20260514';

-- CAL-B 产品级即将开售
SET @cal_b_activity_id = 'A0725022411451682167';
SET @cal_b_activity_code = 114448;

-- CAL-C 套餐级即将开售
SET @cal_c_activity_id = 'A0723111500522282111';
SET @cal_c_activity_code = 105368;
SET @cal_c_act_group_id = 'A1423111500541181102';

-- CAL-D 调价优惠
SET @cal_d_activity_id = 'A0723081516340681656';
SET @cal_d_activity_code = 103049;
SET @cal_d_act_group_id = 'A1423081517065581157';
SET @cal_d_act_item_id = 'A0223081517105281158';

-- CAL-E 倒计时横幅
SET @cal_e_activity_id = 'A0726033118143518129';
SET @cal_e_activity_code = 119099;
SET @cal_e_act_item_id = 'A0226033118265518712';

-- CAL-F 无横幅普通产品
SET @cal_f_activity_id = 'A0723051615432482710';
SET @cal_f_activity_code = 100594;
SET @cal_f_act_item_id = 'A0223051615491782811';

-- CAL-G 卡预约
SET @cal_g_activity_id = 'A0724101411331181130';
SET @cal_g_activity_code = 112191;
SET @cal_g_act_price_id = 'A0424101411391781142';

-- CAL-R 候补
SET @cal_r_activity_id = 'A0726033118143518129';
SET @cal_r_activity_code = 119099;
SET @cal_r_act_item_id = 'A0226033118265518712';
SET @cal_r_user_id = 'u20260514c01';
SET @cal_r_mobile = '13900005214';

-- 幂等清理：删除本标记历史插入
DELETE FROM act_item_candidate
WHERE remark = @candidate_remark
  AND create_person = @marker;

DELETE FROM act_item_flash_discount
WHERE create_person = @marker;

DELETE FROM act_flash_discount_rule
WHERE name = @discount_name
  AND create_person = @marker;

DELETE FROM act_onsale_remind
WHERE appid = @appid_marker
  AND create_person = @marker;

-- CAL-B 产品级即将开售
INSERT INTO act_can_order (id, can_order, create_date, update_date)
SELECT @cal_b_activity_id, 1, NOW(), NOW()
FROM dual
WHERE NOT EXISTS (
  SELECT 1
  FROM act_can_order
  WHERE id = @cal_b_activity_id
);

UPDATE activity
SET is_waiting = 1,
    onsale_time = DATE_ADD(NOW(), INTERVAL 2 DAY),
    sell_status = 1,
    status = '1',
    update_date = NOW()
WHERE activity_id = @cal_b_activity_id;

UPDATE act_can_order
SET can_order = 1,
    update_date = NOW()
WHERE id = @cal_b_activity_id;

-- CAL-C 套餐级即将开售
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
) VALUES (
  @cal_c_activity_id,
  @cal_c_act_group_id,
  @appid_marker,
  DATE_ADD(NOW(), INTERVAL 2 DAY),
  0,
  @marker,
  NOW(),
  @marker,
  NOW()
);

-- CAL-D 调价优惠
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
  @discount_name,
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
  @marker,
  NOW(),
  @marker,
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
  @marker,
  NOW(),
  @marker,
  NOW()
);

-- CAL-E 倒计时横幅
UPDATE act_item
SET expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY),
    update_date = NOW()
WHERE act_item_id = @cal_e_act_item_id;

-- CAL-F 无横幅普通产品
UPDATE act_item
SET expires_at = DATE_ADD(NOW(), INTERVAL 20 DAY),
    update_date = NOW()
WHERE act_item_id = @cal_f_act_item_id;

-- CAL-G 卡预约
UPDATE activity
SET can_ccard_booking = 1,
    update_date = NOW()
WHERE activity_id = @cal_g_activity_id;

UPDATE act_price
SET can_ccard_booking = 2,
    update_date = NOW()
WHERE act_price_id = @cal_g_act_price_id;

-- CAL-R 候补
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
VALUES (
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
  @candidate_remark,
  '0',
  @marker,
  NOW(),
  @marker,
  NOW()
);

-- 校验
SELECT activity_id, activity_code, title, is_waiting, onsale_time, sell_status, status
FROM activity
WHERE activity_id IN (@cal_b_activity_id, @cal_c_activity_id);

SELECT id, can_order, update_date
FROM act_can_order
WHERE id = @cal_b_activity_id;

SELECT onsale_remind_id, activity_id, act_group_id, appid, remind_time, status
FROM act_onsale_remind
WHERE appid = @appid_marker
  AND create_person = @marker;

SELECT id, activity_id, name, price_delta, share_stock_id, status
FROM act_flash_discount_rule
WHERE name = @discount_name
  AND create_person = @marker;

SELECT id, act_group_id, act_item_id, act_flash_discount_rule_id, status
FROM act_item_flash_discount
WHERE create_person = @marker;

SELECT act_item_id, expires_at, support_candidate, regular_max, status
FROM act_item
WHERE act_item_id IN (@cal_e_act_item_id, @cal_f_act_item_id, @cal_r_act_item_id);

SELECT activity_id, can_ccard_booking
FROM activity
WHERE activity_id = @cal_g_activity_id;

SELECT act_price_id, act_item_id, price, can_ccard_booking
FROM act_price
WHERE act_price_id = @cal_g_act_price_id;

SELECT id, activity_id, act_item_id, user_id, mobile, adult_cnt, child_cnt, remark, status
FROM act_item_candidate
WHERE remark = @candidate_remark
  AND create_person = @marker;
