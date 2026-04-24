---
name: requirements-testcase-writer
description: Use this skill when the user wants to generate, supplement, or update QA test cases from requirement documents in the repository, especially files or folders under `requirments/`, and default to the user's XMind testcase style when writing results into `testcases/`.
---

# Requirements Testcase Writer

This skill converts requirement documents in the repo into structured, executable test cases. It is optimized for the conventions already used in this workspace: source material lives in `requirments/` and generated output goes to `testcases/`.

## When To Use

Use this skill when the user asks to:

- generate test cases from a requirement file or requirement folder
- continue expanding an existing testcase document from new requirement pages
- update test cases after a requirement change
- summarize a requirement into QA coverage with concrete steps and expected results

Typical source inputs:

- `requirments/` subfolders that group one feature across several files
- Axure-exported `.html` pages
- Markdown or plain-text requirement notes

Important repo convention:

- The source directory is intentionally spelled `requirments/`. Do not silently switch to `requirements/`.
- Unless the user explicitly asks for another format, the default deliverable in this repo is the user's XMind-style testcase output.
- In this repo, do not create or maintain markdown testcase twins unless the user explicitly asks for markdown.

## Workflow

### 1. Locate the source requirement

- If the user gives a path, use that path first.
- If the user only names a feature, search under `requirments/`.
- If the requirement is a folder, treat all files in that folder as one feature package unless the files clearly describe unrelated features.

### 2. Read and normalize the requirement

Extract the parts that can drive tests:

- pages and user flows
- business rules and display rules
- entry conditions and exit conditions
- states, empty states, error states, and boundary conditions
- dependencies between pages
- tracking or analytics requirements such as exposure, click, or conversion events

When the source is Axure HTML:

- use the page title, visible text, labels, buttons, headings, and repeated blocks as the primary signal
- combine related pages in the same folder to reconstruct the end-to-end flow
- do not invent backend rules or hidden validation logic unless the requirement explicitly shows them

### 3. Design the testcase set

At minimum, cover:

- happy path
- alternate and negative paths
- boundary and empty-state behavior
- visibility or state changes caused by selections or data conditions
- navigation and return paths
- data consistency between upstream and downstream pages

Add analytics coverage when the requirement mentions tracking, event reporting, or a dedicated analytics page such as `神策`.

Structure the testcase set in this repo with these defaults:

- build the skeleton from visible pages and page regions first, not from abstract business-rule buckets
- split modules in the same order the user sees the page, usually from top to bottom
- attach business rules, data states, login states, empty states, and exception paths under the page element or page region where they actually occur
- do not start by grouping cases into abstract headings such as `规则校验`、`列表逻辑`、`功能点汇总` unless the page really has no stable visual structure
- when one rule affects a specific control or section, place that testcase under that control/section instead of creating a detached rule-only module
- for UI-dense modules, prefer `一个模块下 1~3 个完整 case` over many tiny fragmented cases; only split into many sibling cases when the user explicitly prefers fine granularity
- before writing each case, first decide `这个 case 要验证哪些页面元素`、`这些元素之间有哪些切换/联动交互`、`哪些显示逻辑需要用 a/b/c/d 穷举`
- write from a tester's and user's perspective: ask what the user can see, click, switch, close, reopen, expand, collapse, or compare on this module, then turn that into expectations

### 4. Write the output file

Default output rules:

- write into `testcases/`
- place the testcase file directly under `testcases/`, not in nested feature folders
- name the final deliverable as `<项目名称>测试用例.xmind`
- when the source folder or feature name is Chinese, keep the Chinese project name in the filename
- do not create a sibling markdown testcase file unless the user explicitly requests one

Project name rule:

- prefer the feature folder name as the project name, for example `requirments/产品pk/` -> `testcases/产品pk测试用例.xmind`
- if the input is a single requirement file, use the closest stable feature name instead of the raw filename when that better matches the project scope
- only fall back to a single-page name when the file clearly represents an independent feature

If a testcase file already exists:

- extend it instead of rewriting blindly
- keep stable case IDs when possible
- append newly discovered cases and clearly mark changed assumptions

## Output Standard

Follow the template and checklist in [references/testcase-format.md](references/testcase-format.md).
When the user wants XMind-style output, also follow the screenshot-based sample in [references/xmind-screenshot-style.md](references/xmind-screenshot-style.md).
When `maitao-testcase-style` also applies, treat it as the final style authority for wording, case granularity, and XMind branch rhythm.

Quality bar:

- use the screenshot-based XMind structure as the default testcase style for this repo
- when the user asks for testcase generation in this repo, generate/update a real `.xmind` file in `testcases/` and do not sync a markdown copy unless explicitly requested
- use page structure as the primary organizing principle: `页面 -> 页面区域/元素 -> 场景/用例`; business rules are secondary and should be attached to the relevant page node
- each case must be testable and have a clear scenario boundary
- preconditions must be embedded into `测试步骤`; do not keep a separate `前置条件` column unless the user explicitly asks for that schema
- steps must be actionable, not vague summaries
- expected results must be observable
- separate UI display checks from business-rule checks when they can fail independently
- preserve numbered and lettered branches when the requirement is naturally a rule tree or state matrix
- explicitly mark assumptions and unresolved questions instead of hiding them
- for page-style modules, expected results should usually start with page element checks, then continue with interaction changes, then rule branches
- when one module contains many coupled checks, keep them in one large testcase and enumerate the display/interaction matrix inside `预期结果` with `a.` `b.` `c.` `d.`
- do not stop at static display; explicitly cover user-driven interaction changes such as tab switch, category switch, line/package switch, filter toggle, scroll, close, reopen, expand, collapse, and login-state transition when they exist in the requirement or screenshot
- if the user has already adjusted one testcase file into the target company style, treat that file as the highest-priority local style reference for subsequent rewrites
- if the user provides an XMind screenshot sample, follow the screenshot's node granularity, naming style, and sentence rhythm ahead of the generic template
- if the user provides an XMind canvas/settings screenshot, follow the shown canvas settings ahead of generic XMind defaults

## Writing Guidance

- Keep output in Chinese when the source documents are in Chinese.
- Prefer the user's existing testcase style when a sample testcase file already exists in the repo.
- Default to the user's screenshot-based XMind testcase style for future testcase generation in this repo.
- Treat backend `预订产品价格设置` as a reusable default business knowledge point in this workspace when writing testcase logic for price, start-price selection, date-price display, and人数/价格组合 branches.
- For `预订产品价格设置` rows, use this default interpretation unless the requirement explicitly overrides it:
  - `成人数=1, 儿童数=0` -> 成人单价
  - `成人数=0, 儿童数=1` -> 儿童单价
  - `成人数>0 且 儿童数>0` -> 组合价
- When writing start-price testcases for the current repo's calendar/detail requirements:
  - 成人单价 only participates in adult start-price matching
  - 儿童单价 only participates in child start-price matching
  - 组合价 does not directly participate in adult/child single-price matching unless the requirement explicitly says otherwise
  - if the target single-price rows are absent and the requirement says to fallback to the lowest visible/sellable price,组合价 can be covered under the fallback branch
- Treat the user's adjusted testcase files as the highest-priority style authority. For this workspace, default to: `按页面元素写` + `结合需求描述写` + `按页面从上到下顺序分模块写`.
- When the user asks for XMind format or shows an XMind screenshot/sample, mirror that sample's node structure: `根节点 -> +页面/模块节点 -> +功能节点 -> 用例节点 -> 步骤内容节点 -> 预期结果内容节点`.
- The screenshot example at [references/xmind-screenshot-style.md](references/xmind-screenshot-style.md) is the authoritative style sample. Reuse its branch rhythm, wording style, and node granularity.
- Also follow the canvas settings captured in [references/xmind-screenshot-style.md](references/xmind-screenshot-style.md): prefer `逻辑图` canvas, `晨曦` color scheme, and enabled `彩虹分支`.
- In XMind-friendly output, use plain numbered lines under `测试步骤` and `预期结果`, not markdown tables.
- In XMind-friendly output, keep numbered lines normalized as `1. 文案`, not `1.文案`.
- Keep branch names short and stable so they can be used directly as XMind nodes.
- When the user has already rewritten part of the testcase in XMind, mirror that rewritten branch structure instead of re-abstracting it back into generic modules.
- In screenshot-driven XMind output, prefer concise requirement-native wording such as `首次进入`、`刷新页面`、`不执行pk按钮动效`; do not automatically rewrite them into more formal but less similar phrases.
- Avoid generic duplicated module names such as `列表模块` or `基础模块`. If a module name would be vague or repeated, rename it to the concrete page/function name, or collapse that level and use the testcase title directly.
- Prefer concise but complete testcase titles that describe one scenario.
- When the user prefers `按模块写到一个用例case中`, treat one visible module as one integrated testcase first, and put the state matrix into the expected-result node instead of exploding it into many tiny testcase siblings.
- For integrated module testcases, use this default order inside `预期结果`:
  1. 页面元素有哪些
  2. 默认展示/默认选中是什么
  3. 切换交互后怎么变化
  4. a/b/c/d 条件分支怎么显示
  5. 异常/空态/边界怎么反馈
- If a label, badge, button state, or field visibility depends on multiple conditions, enumerate all meaningful combinations with `a.` `b.` `c.` `d.` rather than writing one vague sentence.
- For cards, lists, dialogs, tables, and bottom bars, actively check whether the case should mention visible sub-elements such as title, image, badge, score, price, tabs, tags, buttons, close icon, selected state, and empty-state CTA.
- Put setup, data state, login state, page-entry state, and other preconditions into the test steps, usually as step 1 or the first few ordered steps.
- Group related cases under a module heading instead of forcing everything into one flat list.
- Do not keep many cases under the same overly broad `模块` name without structure. When needed, split into sub-modules or use more specific testcase titles.
- When building module headings, scan the page from top to bottom and use real page areas or controls such as `头图`、`悬浮按钮`、`选择活动弹窗`、`产品卡片`、`底部栏`、`PK结论`、`PK详情`; avoid inventing detached headings such as `规则模块` or `能力汇总`.
- If an existing testcase draft is organized by abstract rules, rewrite it back into page order before extending it.
- For one page, prefer this decision order: first decide page sections by visible layout, then place scenarios under each section, then append normal/abnormal/boundary variants for that section.
- If a module still feels thin after drafting, check whether you missed:
  - page element inventory
  - switch interactions
  - selection linkage
  - default state vs switched state
  - label/badge visibility matrix
  - empty state and return path
- Treat the following as strong anti-patterns that usually require rewriting before delivery:
  - `写碎了`: one visible module is split into many tiny sibling cases that each verify only one sentence, while the user's preferred style is integrated large cases
  - `缺页面元素`: the case talks about rules but never states what visible controls/fields/cards/tabs/buttons actually appear on screen
  - `缺交互`: the case only checks initial display, but skips tab switching, tag switching, line/package switching, filter toggling, expand/collapse, close/reopen, or login transition that the page obviously supports
  - `缺显示矩阵`: the case says “按规则显示” for labels, badges, selected states, visibility, or button states without enumerating the meaningful condition combinations
  - `假模块`: headings such as `规则校验`、`功能汇总`、`列表逻辑` are used even though the page has stable visual modules that should be used instead
  - `只抄需求不转测试`: the output repeats requirement prose but does not convert it into observable steps and expected results
  - `只写正常流`: the case covers only the happy path and omits empty state, abnormal feedback, blocked actions, or return path
- In this repo's XMind style, second-level nodes usually use `+页面/模块名`, third-level nodes use `+功能节点`, and testcase nodes usually do not need a `+`.
- For real `.xmind` output, do not create standalone nodes named `测试步骤` or `预期结果`; place the numbered step text directly in one child node and place the numbered expected-result text directly in its child node, matching the screenshot sample.
- For real `.xmind` output in this repo, prefer canvas-level settings aligned to the screenshot sample: `画布=逻辑图`, `配色方案=晨曦`, `彩虹分支=开启`, `同级主题对齐=开启`.
- When reorganizing a testcase set into XMind style, prefer grouping by page, then by visible page area or element in top-to-bottom order, then by testcase.
- If the screenshot sample splits one rule into multiple sibling cases by trigger timing or entry state, preserve that split in the generated output.
- If several branches belong to one business rule and read more clearly together, keep them in one testcase under `预期结果` instead of over-splitting into many tiny cases.
- If the requirement is incomplete, produce the best available testcase draft and add a `待确认` section.
- If there is obvious ambiguity, state the inference you made and why.

## Anti-Pattern Self-Check

Before finalizing, quickly ask:

1. 有没有哪个模块本来应该是一个大 case，却被我拆成很多零碎 case？
2. 这个 case 里有没有先把页面元素说清楚？
3. 这个模块的切换交互我有没有漏写？
4. 标签/角标/显隐/默认选中逻辑有没有用 `a.` `b.` `c.` `d.` 穷举关键组合？
5. 我写的是测试语言，还是只是把需求原文换行重排了一遍？

If the answer to any of these is “有”, revise before delivering.

## Example Triggers

- “根据 `requirments/产品pk/` 生成测试用例”
- “把 `requirments/产品pk/产品详情.html` 转成 QA 用例”
- “继续补充 `testcases/` 里现有的产品 PK 测试用例”
