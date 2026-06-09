-- 日历改造测试数据误执行清理 SQL
-- 适用场景：2026-05-14 空参数执行最小版 SQL 后产生的脏数据
-- 建议仅在非生产环境执行

-- 1. 候补脏数据
DELETE FROM act_item_candidate
WHERE id = 39227
   OR (
        activity_id = ''
    AND act_item_id = ''
    AND user_id = ''
    AND mobile = ''
    AND remark = '日历改造候补测试数据'
   );

-- 2. 调价绑定脏数据
DELETE FROM act_item_flash_discount
WHERE id = 155
   OR (
        act_group_id = ''
    AND act_item_id = ''
    AND act_flash_discount_rule_id = 847
   );

-- 3. 调价规则脏数据
DELETE FROM act_flash_discount_rule
WHERE id = 847
   OR (
        activity_id = ''
    AND name = '日历改造测试调价'
    AND create_person = 'codex'
   );

-- 4. 调价共享库存脏数据
DELETE FROM act_flash_discount_share_stock
WHERE id = 575;

-- 5. 开售提醒脏数据
DELETE FROM act_onsale_remind
WHERE onsale_remind_id = 10423
   OR (
        activity_id = ''
    AND act_group_id = ''
    AND appid = 'wx-test'
    AND create_person = 'codex'
   );

-- 6. 可售标记脏数据
DELETE FROM act_can_order
WHERE id = '';

-- 7. 清理后校验
SELECT 'act_item_candidate' AS tbl, COUNT(*) AS cnt
FROM act_item_candidate
WHERE id = 39227
   OR (
        activity_id = ''
    AND act_item_id = ''
    AND user_id = ''
    AND mobile = ''
    AND remark = '日历改造候补测试数据'
   )
UNION ALL
SELECT 'act_item_flash_discount' AS tbl, COUNT(*) AS cnt
FROM act_item_flash_discount
WHERE id = 155
   OR (
        act_group_id = ''
    AND act_item_id = ''
    AND act_flash_discount_rule_id = 847
   )
UNION ALL
SELECT 'act_flash_discount_rule' AS tbl, COUNT(*) AS cnt
FROM act_flash_discount_rule
WHERE id = 847
   OR (
        activity_id = ''
    AND name = '日历改造测试调价'
    AND create_person = 'codex'
   )
UNION ALL
SELECT 'act_flash_discount_share_stock' AS tbl, COUNT(*) AS cnt
FROM act_flash_discount_share_stock
WHERE id = 575
UNION ALL
SELECT 'act_onsale_remind' AS tbl, COUNT(*) AS cnt
FROM act_onsale_remind
WHERE onsale_remind_id = 10423
   OR (
        activity_id = ''
    AND act_group_id = ''
    AND appid = 'wx-test'
    AND create_person = 'codex'
   )
UNION ALL
SELECT 'act_can_order' AS tbl, COUNT(*) AS cnt
FROM act_can_order
WHERE id = '';
