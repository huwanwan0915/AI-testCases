# DB Safety Checklist

Use this checklist before any database write:

1. Confirm the target environment is non-production.
2. Confirm the business scenario and expected final state.
3. Identify the exact tables to be touched.
4. Run `SELECT` queries first and capture the current state.
5. Scope every `UPDATE` and `DELETE` by exact ids or unique keys.
6. Prefer transactions when the environment and client support them.
7. Prepare verification SQL before execution.
8. Prepare cleanup SQL before execution.
9. After execution, re-run verification and report exact ids changed.
10. If any result is unexpected, stop before additional writes.

