# SQL Shaping Patterns

## Lookup

Use read-only SQL first:

```sql
SELECT id, status
FROM some_table
WHERE external_key = 'xxx';
```

## Insert

Prefer explicit columns:

```sql
INSERT INTO some_table (
  id,
  status,
  created_at,
  updated_at
) VALUES (
  12345,
  'READY',
  NOW(),
  NOW()
);
```

## Update

Always narrow the `WHERE`:

```sql
UPDATE some_table
SET status = 'READY',
    updated_at = NOW()
WHERE id = 12345;
```

## Verification

Verify only the branch-driving fields:

```sql
SELECT id, status, updated_at
FROM some_table
WHERE id = 12345;
```

## Cleanup

Delete only the rows created for the task:

```sql
DELETE FROM some_table
WHERE id = 12345;
```

## Reporting

After execution, report:

- environment
- touched tables
- ids created or changed
- verification query result
- cleanup query

