-- 日历改造测试数据回滚 SQL（2026-05-14）
-- 环境：nonprod / maitao

DELETE FROM act_item_candidate WHERE id = 39229 OR (remark = '日历改造测试数据-候补-20260514' AND create_person = 'codexcal20260514');
DELETE FROM act_item_flash_discount WHERE id = 157;
DELETE FROM act_flash_discount_rule WHERE id = 849;
DELETE FROM act_flash_discount_share_stock WHERE id = 577;
DELETE FROM act_onsale_remind WHERE onsale_remind_id = 10425;
UPDATE act_can_order SET can_order = 0 , update_date = NOW() WHERE id = 'A0725022411451682167';
UPDATE activity SET is_waiting = 0, onsale_time = NULL, sell_status = 0, status = '1', update_date = NOW() WHERE activity_id = 'A0725022411451682167';
UPDATE activity SET is_waiting = 0, onsale_time = NULL, sell_status = 0, status = '1', update_date = NOW() WHERE activity_id = 'A0723111500522282111';
UPDATE act_item SET expires_at = '2026-04-01 22:24:00', support_candidate = 1, regular_max = 33, update_date = NOW() WHERE act_item_id = 'A0226033118265518712';
UPDATE act_item SET expires_at = '2023-05-19 15:00:00', support_candidate = 0, regular_max = 20, update_date = NOW() WHERE act_item_id = 'A0223051615491782811';
UPDATE activity SET can_ccard_booking = 1, update_date = NOW() WHERE activity_id = 'A0724101411331181130';
UPDATE act_price SET can_ccard_booking = 1, update_date = NOW() WHERE act_price_id = 'A0424101411391781142';
UPDATE act_item SET support_candidate = 1, regular_max = 33, update_date = NOW() WHERE act_item_id = 'A0226033118265518712';

-- 回滚后校验
SELECT id, can_order FROM act_can_order WHERE id = 'A0725022411451682167';
SELECT activity_id, is_waiting, onsale_time, sell_status, status FROM activity WHERE activity_id IN ('A0725022411451682167', 'A0723111500522282111');
SELECT onsale_remind_id FROM act_onsale_remind WHERE onsale_remind_id = 10425;
SELECT id FROM act_flash_discount_rule WHERE id = 849;
SELECT id FROM act_item_flash_discount WHERE id = 157;
SELECT id FROM act_flash_discount_share_stock WHERE id = 577;
SELECT act_item_id, expires_at, support_candidate, regular_max FROM act_item WHERE act_item_id IN ('A0226033118265518712', 'A0223051615491782811', 'A0226033118265518712');
SELECT act_price_id, can_ccard_booking FROM act_price WHERE act_price_id = 'A0424101411391781142';
SELECT id FROM act_item_candidate WHERE id = 39229;
