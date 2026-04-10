# Testcase Output Format

Use this format unless the user explicitly asks for another testcase schema.

## File naming rule

- Write the testcase file directly under `testcases/`.
- Name the file as `<项目名称>测试用例.md`.
- Keep the document title as `# <项目名称>测试用例`.

## Recommended file structure

```md
# <项目名称>测试用例

## 1. 需求来源
- 来源路径：`requirments/...`
- 关联页面：页面A、页面B
- 生成说明：首次生成 / 增量补充 / 按变更更新

## 2. 测试范围
- 本次覆盖：
- 本次不覆盖：

## 3. 待确认
- 待确认问题 1
- 待确认问题 2

## 4. 测试用例

| 用例ID | 模块 | 测试场景 | 测试步骤 | 预期结果 | 优先级 |
| --- | --- | --- | --- | --- | --- |
| PK-001 | 产品详情入口（可展示线路PK） | 正常进入 PK 流程 | 1. 进入产品详情页 2. 点击“线路PK” 3. 选择活动 4. 确认进入对比 | 成功进入 PK 页面，所选活动正确展示 | P1 |

## 5. 覆盖说明
- 主流程：
- 异常流程：
- 边界场景：
- 埋点检查：
```

## Coverage checklist

Before finishing, check whether the testcase set covers:

- main flow
- empty state
- invalid or interrupted operation
- repeated click or repeated submit
- back navigation or cancel path
- different data combinations when the UI is data-driven
- permission, login, or availability preconditions if visible in the requirement
- tracking, exposure, click, and conversion events if the requirement mentions analytics

## Writing rules

- One row should represent one independently verifiable scenario.
- Do not use a standalone `前置条件` column by default; merge preconditions into the ordered test steps.
- Keep `模块` names specific. If many cases share one generic module, add a concise qualifier such as condition, state, or sub-function; for list-page cases, you may use the testcase name as the module name.
- Keep steps short and ordered.
- Expected results should describe observable behavior, not implementation guesses.
- If one scenario has multiple branches, split it into separate rows.
- Use stable IDs with a readable prefix derived from the feature name.
