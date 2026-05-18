# 标题
- 亲子游品类产品改销量规则

## 类型
- rules

## 适用范围
- global

## 状态
- stable

## 内容
- 改销量前，第一步必须先核对当前页面链接里的 `productid`，不要沿用上一次改过的 `activity_id`。
- 改销量前，第二步必须先判断产品品类和结构：
- `category_id / pro_type1 / pro_type2`
- 是否单套餐单场次链路
- 是否多套餐同日期并行链路
- 如果是多套餐同日期产品，不能只改其中一套套餐的场次销量；前端默认落在哪套套餐不确定时，要把同日期的可见套餐一起补齐。
- 快速改前端销量时，优先一次性补完整链路，不要只改单个字段后再逐层返工。
- 推荐快路径：
- 1）确认当前 `productid`
- 2）查 `activity` 基础信息、`product_item` 场次结构、是否多套餐
- 3）按品类口径补 `product_item`
- 4）同步补 `act_item_water`
- 5）同步补 `act_stat`
- 6）同步补 `ai_act_metric`
- 7）插入 `pro_es_cache`
- 8）最后再看前端是否仍未消费缓存
- 亲子游品类产品改前端展示销量时，不能只改 `product_item.sold_num`。
- 对亲子游品类产品，前端展示口径需要优先校验 `sold_num` 是否等于 `adult_cnt + child_cnt`。
- 如果目标是让前端展示销量，场次级至少要同步处理这些字段：
- `maitao.product_item.sold_num`
- `maitao.product_item.adult_cnt`
- `maitao.product_item.child_cnt`
- 其中推荐规则是：
- `sold_num = adult_cnt + child_cnt`
- 如果页面或链路还依赖注水销量，再同步处理：
- `maitao.act_item_water.sold_num`
- 如果页面或缓存依赖产品级聚合销量，再继续补这些层：
- `maitao.act_stat.sold_num`
- `maitao.ai_act_metric.annual_sales_volume`
- `maitao.pro_es_cache`
- 对亲子游品类产品，若只改 `product_item.sold_num` 而不改 `adult_cnt`、`child_cnt`，很可能前端仍然不显示销量。
- 对夏令营/多日营这类单套餐产品，通常可以直接按全部场次分配销量，并同步更新 `product_item + act_item_water + act_stat + ai_act_metric + pro_es_cache`。

## 来源背景
- 2026-05-15 在非生产环境排查亲子游产品 `activity_id=A0726031217204682758` 前端不显示销量时确认。
- 初始只修改了 `product_item.sold_num`、`act_item_water.sold_num`、`act_stat.sold_num`、`ai_act_metric.annual_sales_volume`，前端仍未显示。
- 用户明确指出亲子游品类产品销量口径应满足 `sold_num = adult_cnt + child_cnt`，随后补齐 `adult_cnt`、`child_cnt`。
- 同日又处理了夏令营产品 `activity_id=A07260309153711SOO19`，确认不能把前一条产品的经验机械套到另一条 `productid` 上，必须先核对当前详情页真实产品。
- 同日还确认了多套餐同日期产品若只改一套套餐，前端默认切到另一套套餐时仍会显示为 0。

## 示例
- 示例 1
- 目标场次销量为 `1800` 时，可写为 `adult_cnt=1200`、`child_cnt=600`、`sold_num=1800`。
- 示例 2
- 一组亲子游场次总销量目标为 `12000` 时，需要同时校验：
- `sum(sold_num) = 12000`
- `sum(adult_cnt + child_cnt) = 12000`
- 示例 3
- 当前详情页链接若是 `productid=A07260309153711SOO19`，必须直接按这条产品补销量，不能继续修改别的 `activity_id`。

## 关联文件
- /Users/maitao/AI-testCases/.codex/skills/test-data-db-prep/SKILL.md
- /Users/maitao/AI-testCases/dbquery/mysql数据库/maitao.sql
