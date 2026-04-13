# Testcase Output Format

Use this format unless the user explicitly asks for another testcase schema.

## File naming rule

- Write the testcase file directly under `testcases/`.
- Name the testcase file as `<项目名称>测试用例.md`.
- Keep the document title as `# <项目名称>测试用例`.

## Recommended file structure

```md
# <项目名称>测试用例

- 来源路径：`requirments/...`
- 来源路径：`requirments/...`
- 关联范围：模块A、模块B、模块C

## +一级模块A

### +二级模块A

#### +三级模块A

##### 用例标题A

测试步骤
1. 进入页面A
2. 点击按钮B
3. 查看页面变化

预期结果
1. 显示模块C
2. 按钮文案正确
3. 页面跳转到D

## 待确认

- 待确认问题 1
- 待确认问题 2
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

- Default to XMind-friendly hierarchical Markdown, not a table, when the user wants XMind format.
- When the user explicitly asks for a real `.xmind` file and a local sample exists, prefer outputting a sibling `.xmind` file under `testcases/`.
- The screenshot-based XMind style in [xmind-screenshot-style.md](xmind-screenshot-style.md) is the primary reference for this repo.
- Group related scenarios under `+`-prefixed module headings when the output is intended for XMind.
- Prefer a hierarchy like `一级模块 -> 二级模块 -> 三级模块 -> 用例标题`.
- If the user has provided or finalized a company testcase sample in the repo, follow that sample first and treat this reference as the fallback baseline.
- If the user has provided an XMind screenshot sample, align the generated branch granularity and wording style with that screenshot first.
- For real `.xmind` output, prefer the visual node chain `根节点 -> 模块节点 -> 用例节点 -> 步骤内容节点 -> 预期结果节点`.
- For real `.xmind` output in this repo, prefer the screenshot-based canvas settings: `逻辑图` canvas, `晨曦` color scheme, `彩虹分支` enabled, `同级主题对齐` enabled.
- Each testcase should contain `测试步骤` and `预期结果`.
- Do not use a standalone `前置条件` section by default; merge preconditions into the ordered test steps.
- Keep module and testcase names specific and readable.
- Avoid generic repeated module names like `列表模块`、`基础模块`; prefer concrete page/function names, or directly use the testcase title when that is clearer.
- Keep steps short and ordered where possible, but preserve multi-level numbering when the business rule itself is hierarchical.
- Normalize numbered lines as `1. 文案`.
- If a screenshot sample has already split one requirement into siblings such as `首次进入`、`刷新页面`、`已发起过`, keep that split instead of recombining it.
- Expected results should describe observable behavior, not implementation guesses.
- When several branches belong to one rule set and are easier to read together, keep them in the same testcase instead of forcing a split.
