# MySQL Case Templates

Use `scripts/generate_mysql_case_sql.py` to generate reusable SQL in the same four-part structure:

- lookup SQL
- write SQL
- verify SQL
- cleanup SQL

The script only generates SQL. It does not connect to the database directly.

## Supported Scenarios

### 1. `order-status`

Purpose:
- move one existing order to a target `orders.status`

Parameters:
- `--order-id`
- `--target-status`

Example:

```bash
python3 .codex/skills/test-data-db-prep/scripts/generate_mysql_case_sql.py \
  order-status \
  --order-id 13620001 \
  --target-status 1 \
  --output /tmp/order-status.sql
```

Notes:
- this template only changes `orders.status`
- if the branch also depends on `pay_time` / `verify_time` / `refund_status`, extend the generated SQL after lookup

### 2. `product-saleability`

Purpose:
- control current product saleability with `act_can_order.can_order`
- optionally align `activity.status` and `activity.sell_status`

Parameters:
- `--activity-id` or `--activity-code`
- `--can-order`
- optional `--activity-status`
- optional `--sell-status`

Example:

```bash
python3 .codex/skills/test-data-db-prep/scripts/generate_mysql_case_sql.py \
  product-saleability \
  --activity-code 119199 \
  --can-order 1 \
  --activity-status 1 \
  --sell-status 1 \
  --output /tmp/product-saleability.sql
```

Notes:
- local `dbquery` rules treat “当前可售” as a dual condition:
  - `act_can_order.can_order = 1`
  - `activity.status = '1'`
- `sell_status` is provided as an optional helper because some downstream logic also reads it

### 3. `comment-visibility`

Purpose:
- hide or show one comment by editing `order_comment.ctrl_bits`

Parameters:
- `--order-comment-id`
- `--mode hide|show`
- optional `--hide-bit user|system`, default `system`

Example:

```bash
python3 .codex/skills/test-data-db-prep/scripts/generate_mysql_case_sql.py \
  comment-visibility \
  --order-comment-id 98765001 \
  --mode hide \
  --hide-bit system \
  --output /tmp/comment-visibility.sql
```

Notes:
- hidden rule follows local code-aligned logic:
  - `ctrl_bits is null`
  - or `(ctrl_bits & 2) > 0`
  - or `(ctrl_bits & 4) > 0`
- `show` clears both hidden bits while preserving unrelated bits

### 4. `channel-laxin`

Purpose:
- insert one `xchannel_laxin` 渠道获客记录
- or just verify the existing record if the same key already exists

Parameters:
- `--unionid`
- `--external-userid`
- `--qy-staff-id`
- `--stu-id` or `--stu-name`
- optional `--nickname`
- optional `--create-type`

Example:

```bash
python3 .codex/skills/test-data-db-prep/scripts/generate_mysql_case_sql.py \
  channel-laxin \
  --unionid oAbcUnion123 \
  --external-userid woAJ_external_123 \
  --qy-staff-id zhangsan \
  --stu-name 小红书测试号A \
  --nickname 测试用户A \
  --create-type 0 \
  --output /tmp/channel-laxin.sql
```

Notes:
- `stu_id` is the real write field; if you only know the channel name, use `--stu-name`
- the template checks `qy_staff_client` and `wxwork_staff_bind` first for chain verification
- insert SQL is guarded so an exact existing active record is not duplicated

## Run Generated SQL

Read-only preview:

```bash
python3 .codex/skills/test-data-db-prep/scripts/run_mysql_sql.py \
  --env nonprod \
  --db maitao \
  --sql-file /tmp/product-saleability.sql
```

Execute write SQL:

```bash
python3 .codex/skills/test-data-db-prep/scripts/run_mysql_sql.py \
  --env nonprod \
  --db maitao \
  --sql-file /tmp/product-saleability.sql \
  --allow-write \
  --execute
```

## Template Design Rules

- Generated SQL is intended to run in one MySQL session so cleanup variables remain available.
- Cleanup is conservative:
  - restore original values for update scenarios
  - delete only the inserted row for insert scenarios
- If a scenario needs more than one branch-driving field, start from the generated SQL and extend the write and verify sections, not the lookup chain.
