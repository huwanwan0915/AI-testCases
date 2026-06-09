-- 日历改造测试数据回滚 SQL（2026-05-14 v2）
-- 环境：nonprod / maitao

DELETE FROM act_item_candidate WHERE id = 39231 OR (remark = '日历改造测试数据-候补-20260514-v2' AND create_person = 'codexcal20260514v2');
DELETE FROM act_item_flash_discount WHERE id = 159;
DELETE FROM act_flash_discount_rule WHERE id = 851;
DELETE FROM act_flash_discount_share_stock WHERE id = 579;
DELETE FROM act_onsale_remind WHERE onsale_remind_id = 10427;
UPDATE act_can_order SET can_order = 1 , update_date = NOW() WHERE id = 'A0726011610174081166';
UPDATE activity SET is_waiting = 0, onsale_time = NULL, sell_status = 1, status = '1', update_date = NOW() WHERE activity_id = 'A0726011610174081166';
UPDATE activity SET is_waiting = 0, onsale_time = NULL, sell_status = 1, status = '1', update_date = NOW() WHERE activity_id = 'A0726011609143982476';
UPDATE act_item SET expires_at = '2026-05-16 17:36:00', support_candidate = 1, regular_max = 100, update_date = NOW() WHERE act_item_id = 'A0226040911072018149';
UPDATE act_item SET expires_at = '2026-06-26 20:00:00', support_candidate = 0, regular_max = 20, update_date = NOW() WHERE act_item_id = 'A0226011316374582762';
UPDATE activity SET can_ccard_booking = 1, update_date = NOW() WHERE activity_id = 'A0726012117123581915';
UPDATE act_price SET can_ccard_booking = 0, update_date = NOW() WHERE act_price_id = 'A0426040911072018150';
UPDATE act_item SET support_candidate = 1, regular_max = 100, update_date = NOW() WHERE act_item_id = 'A0226040911072018149';
