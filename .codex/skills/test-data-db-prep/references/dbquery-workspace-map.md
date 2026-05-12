# dbquery Workspace Map

This workspace contains a local repository at:

- `dbquery/`

## MySQL

Primary local references:

- `dbquery/mysql数据库/README.md`
- `dbquery/mysql数据库/麦淘查数潜规则.md`
- `dbquery/mysql数据库/评论隐藏规则说明.md`
- `dbquery/mysql数据库/broker.sql`
- `dbquery/mysql数据库/chatbot.sql`
- `dbquery/mysql数据库/finance.sql`
- `dbquery/mysql数据库/maitao.sql`
- `dbquery/mysql数据库/mtstat.sql`

Key local rules already documented there:

- `broker`、`finance`、`maitao`、`mtstat` are separate databases
- `maitao` and `mtstat` are on the same instance and can be joined
- MySQL version is `5.7`, so avoid CTE syntax
- sales and settlement semantics must not be mixed
- use explicit valid-order status whitelists
- product-facing ids often map to `activity.activity_code`

When a user asks for MySQL test data:

1. read the rule document first
2. identify the target business object chain
3. locate exact tables in the corresponding `.sql` file
4. write lookup, write, verify, and cleanup SQL

## Milvus

Primary local references:

- `dbquery/milvus向量数据库/act_schedule表初始化.sh`
- `dbquery/milvus向量数据库/agent_memory表初始化.sh`

Use these scripts as the source of truth for:

- collection names
- field names
- field data types
- vector dimensions
- index type and metric type

Do not copy raw credentials or internal endpoints into user-facing summaries unless explicitly requested.
