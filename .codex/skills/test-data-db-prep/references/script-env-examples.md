# Script Environment Examples

## MySQL

Use uppercase database aliases:

- `broker` -> `DBQUERY_BROKER_*`
- `finance` -> `DBQUERY_FINANCE_*`
- `maitao` -> `DBQUERY_MAITAO_*`
- `mtstat` -> `DBQUERY_MTSTAT_*`
- `chatbot` -> `DBQUERY_CHATBOT_*`

Example:

```bash
export DBQUERY_MAITAO_HOST="127.0.0.1"
export DBQUERY_MAITAO_PORT="3306"
export DBQUERY_MAITAO_USER="readonly_user"
export DBQUERY_MAITAO_PASS="***"
export DBQUERY_MAITAO_NAME="maitao"
```

## Milvus

Example:

```bash
export DBQUERY_MILVUS_URL="http://127.0.0.1:19530"
export DBQUERY_MILVUS_TOKEN="***"
```

Do not store real secrets in the repository.

