---
name: requirements-testcase-writer
description: "Use this skill for the general workflow of generating, supplementing, or updating QA test cases from requirement documents in the repository, especially files or folders under `requirments/`, with output written into `testcases/` in the repo's default XMind-oriented structure. When the user explicitly asks for the 麦淘/个人既有 testcase style, or the task clearly matches `requirments/+麦淘旅行家测试用例（落地页）.md` and same-style local samples, also apply `maitao-testcase-style` as the final wording and structure authority."
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
- prefer cohesive, testable cases over many tiny fragmented cases unless the user explicitly asks for very fine granularity
- before writing each case, decide which visible elements, interactions, and state changes the case is meant to verify
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

## Skill Coordination

- Use this skill as the primary workflow for requirement-to-testcase conversion in this repo.
- If the task explicitly asks for the user's existing 麦淘/个人 testcase style, or the local evidence clearly points to that style, also apply `maitao-testcase-style`.
- When both skills apply, split responsibility this way:
  - `requirements-testcase-writer`: source discovery, requirement normalization, coverage design, output path/file decisions, and generic testcase quality
  - `maitao-testcase-style`: wording rhythm, case granularity, page-module naming, XMind branch structure, and style-specific anti-pattern avoidance
- If there is no clear style signal, stay with this skill's default repo-level XMind conventions and do not implicitly assume the full 麦淘 style.

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
- In XMind-oriented output, mirror the local screenshot/sample structure before inventing a new one.
- In XMind-oriented output, use plain numbered lines such as `1. 文案`; avoid markdown tables unless the user explicitly asks for them.
- Keep branch names short, stable, and directly usable as XMind nodes.
- Prefer concise but complete testcase titles that describe one scenario.
- For integrated, UI-dense modules, capture both element inventory and key interaction/state changes in the same testcase when that reads more clearly.
- If a label, badge, button state, or field visibility depends on multiple conditions, enumerate the meaningful combinations instead of writing one vague sentence.
- Put setup, data state, login state, page-entry state, and other preconditions into the test steps, usually as step 1 or the first few ordered steps.
- Group related cases under a module heading instead of forcing everything into one flat list.
- Do not keep many cases under the same overly broad `模块` name without structure. When needed, split into sub-modules or use more specific testcase titles.
- When building module headings, scan the page from top to bottom and use real page areas or controls instead of detached abstract headings.
- If an existing testcase draft is organized by abstract rules, rewrite it back into page order before extending it.
- For one page, prefer this decision order: first decide page sections by visible layout, then place scenarios under each section, then append normal/abnormal/boundary variants for that section.
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

1. 页面模块是不是按用户实际看到的顺序组织，而不是按抽象规则硬分组？
2. 每个 case 有没有明确步骤、可观察预期，以及必要的正常/异常/边界覆盖？
3. 页面上的关键交互、状态切换、返回路径和数据联动有没有漏掉？
4. 我写的是可执行的测试语言，还是只是把需求原文换行重排了一遍？

If the answer to any of these is “有”, revise before delivering.

## Example Triggers

- “根据 `requirments/产品pk/` 生成测试用例”
- “把 `requirments/产品pk/产品详情.html` 转成 QA 用例”
- “继续补充 `testcases/` 里现有的产品 PK 测试用例”
