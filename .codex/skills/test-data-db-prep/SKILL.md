---
name: test-data-db-prep
description: "Use this skill when the user wants to prepare QA test data directly in a database, including creating, updating, cleaning, or verifying non-production data by SQL for specific business scenarios such as products, orders, users, inventory, schedules, coupons, or statuses. In this workspace, also use it when requests should follow the local `dbquery` repository under `dbquery/`, including MySQL query conventions and Milvus collection initialization. Trigger on requests like 造数, 准备测试数据, 插库, 改库数据, 清理测试数据, 直接去数据库生成数据."
---

# Test Data DB Prep

This skill is for preparing test data directly in a database for QA scenarios.

Use it when the user wants database-level test data work such as:

- creating test rows for a feature flow
- updating existing rows into a target state
- cleaning or rolling back previously inserted test data
- validating that required data already exists
- generating repeatable SQL for testers to reuse

In this workspace, default local knowledge comes from:

- `dbquery/mysql数据库/README.md`
- `dbquery/mysql数据库/麦淘查数潜规则.md`
- `dbquery/mysql数据库/评论隐藏规则说明.md`
- `dbquery/mysql数据库/*.sql`
- `dbquery/milvus向量数据库/*.sh`
- executable helpers under `scripts/`

## Safety Rules

- Default scope is non-production only.
- If the target environment is production, or the environment is not clearly identified, stop and ask for confirmation before any write operation.
- Prefer the smallest data change that satisfies the testcase.
- Always identify the affected tables and the business object chain before writing SQL.
- Before any `INSERT` or `UPDATE`, first run read-only queries to confirm current state.
- After any write, run verification queries and report exactly what changed.
- If cleanup is possible, prepare cleanup SQL together with creation SQL.
- Save temporary SQL drafts under `/tmp` unless the user explicitly asks to keep them in the repo.
- Do not echo database passwords, bearer tokens, or internal addresses back to the user unless the user explicitly asks for those exact values.

## Workflow

1. Clarify the target scenario.
Determine:
- environment name
- business object to create or modify
- target state
- key identifiers needed for lookup, such as user id, product id, order id, coupon id, schedule id

2. Inspect local context first.
Look in the codebase for:
- schema definitions
- ORM models
- seed scripts
- enum values
- status transitions
- foreign-key style dependencies
- existing test-data scripts

Prefer `rg` on files like:
- `schema`
- `model`
- `entity`
- `migration`
- `seed`
- `enum`
- `status`

In this workspace, inspect `dbquery/` before inventing SQL from scratch.
Priority order:
- `dbquery/mysql数据库/麦淘查数潜规则.md`
- `dbquery/mysql数据库/README.md`
- targeted `dbquery/mysql数据库/*.sql`
- targeted `dbquery/milvus向量数据库/*.sh`

3. Build the minimal data graph.
List only the rows required for the scenario, for example:
- user
- account binding
- product
- product schedule
- inventory row
- order header
- order item

4. Produce SQL in this order.
- lookup SQL
- insert or update SQL
- verification SQL
- cleanup SQL

If the task is Milvus or vector data preparation, produce the same four-part structure, but adapt execution artifacts to:
- collection existence check
- collection create or upsert payload
- verification request
- cleanup request

5. Execute writes only when one of these is true.
- the user explicitly asked to execute the SQL
- the repository already contains an established non-production data-prep workflow and the requested step is clearly part of it

6. After execution, summarize:
- target environment
- touched tables
- key ids
- final verification result
- cleanup method

## Preferred Output Shape

When preparing data, structure the response as:

1. Target scenario
2. Required tables and dependencies
3. SQL
4. Verification
5. Cleanup

Keep SQL blocks separate by purpose so they can be rerun safely.

## Execution Guidance

- Prefer existing project scripts or ORM tasks over handwritten SQL when the repo already standardizes data preparation that way.
- If using direct SQL, prefer idempotent patterns when possible.
- For `UPDATE`, always include a narrowly scoped `WHERE`.
- For `DELETE`, avoid broad cleanup. Prefer deleting by the exact ids created in the same run.
- If the database command needs network or external access, request approval and clearly state the purpose.
- When local scripts contain credentials or internal endpoints, treat them as sensitive configuration. Use them only for execution context and do not reproduce them in normal summaries.

## Local Scripts

Use these local scripts when the user wants direct execution support:

- `scripts/run_mysql_sql.py`
- `scripts/run_milvus_request.py`
- `scripts/generate_mysql_case_sql.py`

### MySQL script

Use:

```bash
python3 .codex/skills/test-data-db-prep/scripts/run_mysql_sql.py --env nonprod --db maitao --sql-file /tmp/query.sql
python3 .codex/skills/test-data-db-prep/scripts/run_mysql_sql.py --env nonprod --db mtstat --sql "select count(*) from sales_stat_activity limit 10;"
python3 .codex/skills/test-data-db-prep/scripts/run_mysql_sql.py --env nonprod --db maitao --sql-file /tmp/update.sql --allow-write --execute
```

Connection settings come from environment variables:

- `DBQUERY_<DB>_HOST`
- `DBQUERY_<DB>_PORT`
- `DBQUERY_<DB>_USER`
- `DBQUERY_<DB>_PASS`
- `DBQUERY_<DB>_NAME`

For example:

- `DBQUERY_MAITAO_HOST`
- `DBQUERY_MTSTAT_HOST`

The script defaults to dry-run. Actual writes require both:

- `--allow-write`
- `--execute`

### MySQL scenario template script

Use:

```bash
python3 .codex/skills/test-data-db-prep/scripts/generate_mysql_case_sql.py order-status --order-id 13620001 --target-status 1 --output /tmp/order-status.sql
python3 .codex/skills/test-data-db-prep/scripts/generate_mysql_case_sql.py product-saleability --activity-code 119199 --can-order 1 --activity-status 1 --sell-status 1 --output /tmp/product-saleability.sql
python3 .codex/skills/test-data-db-prep/scripts/generate_mysql_case_sql.py comment-visibility --order-comment-id 98765001 --mode hide --hide-bit system --output /tmp/comment-visibility.sql
python3 .codex/skills/test-data-db-prep/scripts/generate_mysql_case_sql.py channel-laxin --unionid oAbcUnion123 --external-userid woAJ_external_123 --qy-staff-id zhangsan --stu-name 小红书测试号A --nickname 测试用户A --output /tmp/channel-laxin.sql
```

Supported scenarios:

- `order-status`
- `product-saleability`
- `comment-visibility`
- `channel-laxin`

The template script only generates SQL. Pair it with `run_mysql_sql.py` when the user wants actual execution.

### Milvus script

Use:

```bash
python3 .codex/skills/test-data-db-prep/scripts/run_milvus_request.py --env nonprod --path /v2/vectordb/collections/create --body-file /tmp/create_collection.json
python3 .codex/skills/test-data-db-prep/scripts/run_milvus_request.py --env nonprod --path /v2/vectordb/collections/create --body-file /tmp/create_collection.json --execute
```

Connection settings come from environment variables:

- `DBQUERY_MILVUS_URL`
- `DBQUERY_MILVUS_TOKEN`

The script defaults to dry-run. Network execution requires `--execute`.

## Workspace-Specific Rules

### MySQL via `dbquery/mysql数据库`

- `broker`、`finance`、`maitao`、`mtstat` are different databases.
- `maitao` and `mtstat` are on the same MySQL instance and may be joined together when needed.
- MySQL version is `5.7`; do not use `WITH` / CTE syntax.
- Unless the user explicitly asks otherwise, default query semantics are sales semantics, not settlement semantics.
- For order validity, prefer the explicit status whitelist from the local rule document instead of broad negative filters.
- For user-facing product id language, treat “产品编号” as likely `activity.activity_code`, not the internal primary key, unless local context proves otherwise.

### Milvus via `dbquery/milvus向量数据库`

- Prefer reusing the local initialization scripts as the source of truth for collection schema and index settings.
- Before creating or changing a collection, inspect the existing shell script and keep field names, types, and vector dimensions aligned with it.
- When summarizing Milvus work, describe the collection name, field layout, and verification result, but do not print raw secrets by default.

## Common Patterns

- Create a new business object:
  - query prerequisite parent rows
  - insert parent
  - insert children
  - verify joins

- Flip a status:
  - query current row
  - confirm allowed values from code or schema
  - update one row with exact primary key
  - verify status and timestamps

- Force an edge case:
  - identify the smallest set of fields that control the branch
  - update only those fields
  - verify the branch-driving fields after update

## When To Read References

- Read [references/db-safety-checklist.md](references/db-safety-checklist.md) before executing database writes.
- Read [references/sql-shaping-patterns.md](references/sql-shaping-patterns.md) when you need repeatable SQL patterns for insert, update, verify, and cleanup steps.
- Read [references/dbquery-workspace-map.md](references/dbquery-workspace-map.md) when the task should follow the local `dbquery` repository conventions.
- Read [references/script-env-examples.md](references/script-env-examples.md) when you need the exact environment-variable naming for local script execution.
- Read [references/mysql-case-templates.md](references/mysql-case-templates.md) when the task matches one of the reusable MySQL testcase scenarios.

## Trigger Examples

- “帮我准备一个用户已支付未核销的订单数据”
- “直接去数据库把产品改成可售”
- “按 dbquery 的规则查某个活动销量”
- “补一条测试渠道获客数据”
- “按本地 milvus 脚本初始化一个测试 collection”
