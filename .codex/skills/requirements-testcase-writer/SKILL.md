---
name: requirements-testcase-writer
description: Use this skill when the user wants to generate, supplement, or update QA test cases from requirement documents in the repository, especially files or folders under `requirments/` such as Axure-exported HTML, Markdown, or text specs, and write the result into `testcases/`.
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

### 4. Write the output file

Default output rules:

- write into `testcases/`
- place the testcase file directly under `testcases/`, not in nested feature folders
- name the file as `<项目名称>测试用例.md`
- when the source folder or feature name is Chinese, keep the Chinese project name in the filename
- keep the document title consistent with the filename, using `<项目名称>测试用例`

Project name rule:

- prefer the feature folder name as the project name, for example `requirments/产品pk/` -> `testcases/产品pk测试用例.md`
- if the input is a single requirement file, use the closest stable feature name instead of the raw filename when that better matches the project scope
- only fall back to a single-page name when the file clearly represents an independent feature

If a testcase file already exists:

- extend it instead of rewriting blindly
- keep stable case IDs when possible
- append newly discovered cases and clearly mark changed assumptions

## Output Standard

Follow the template and checklist in [references/testcase-format.md](references/testcase-format.md).
When the user wants XMind-style output, also follow the screenshot-based sample in [references/xmind-screenshot-style.md](references/xmind-screenshot-style.md).

Quality bar:

- use the screenshot-based XMind structure as the default testcase style for this repo
- when the user asks for testcase generation in this repo, prefer generating/updating a real `.xmind` file in `testcases/`; markdown is only an intermediate draft unless the user explicitly asks for markdown only
- each case must be testable and have a clear scenario boundary
- preconditions must be embedded into `测试步骤`; do not keep a separate `前置条件` column unless the user explicitly asks for that schema
- steps must be actionable, not vague summaries
- expected results must be observable
- separate UI display checks from business-rule checks when they can fail independently
- preserve numbered and lettered branches when the requirement is naturally a rule tree or state matrix
- explicitly mark assumptions and unresolved questions instead of hiding them
- if the user has already adjusted one testcase file into the target company style, treat that file as the highest-priority local style reference for subsequent rewrites
- if the user provides an XMind screenshot sample, follow the screenshot's node granularity, naming style, and sentence rhythm ahead of the generic template
- if the user provides an XMind canvas/settings screenshot, follow the shown canvas settings ahead of generic XMind defaults

## Writing Guidance

- Keep output in Chinese when the source documents are in Chinese.
- Prefer the user's existing testcase style when a sample testcase file already exists in the repo.
- Default to the user's screenshot-based XMind testcase style for future testcase generation in this repo.
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
- Put setup, data state, login state, page-entry state, and other preconditions into the test steps, usually as step 1 or the first few ordered steps.
- Group related cases under a module heading instead of forcing everything into one flat list.
- Do not keep many cases under the same overly broad `模块` name without structure. When needed, split into sub-modules or use more specific testcase titles.
- In this repo's XMind style, second-level nodes usually use `+页面/模块名`, third-level nodes use `+功能节点`, and testcase nodes usually do not need a `+`.
- For real `.xmind` output, do not create standalone nodes named `测试步骤` or `预期结果`; place the numbered step text directly in one child node and place the numbered expected-result text directly in its child node, matching the screenshot sample.
- For real `.xmind` output in this repo, prefer canvas-level settings aligned to the screenshot sample: `画布=逻辑图`, `配色方案=晨曦`, `彩虹分支=开启`, `同级主题对齐=开启`.
- When reorganizing a testcase set into XMind style, prefer grouping by page, then by functional area, then by testcase.
- If the screenshot sample splits one rule into multiple sibling cases by trigger timing or entry state, preserve that split in the generated output.
- If several branches belong to one business rule and read more clearly together, keep them in one testcase under `预期结果` instead of over-splitting into many tiny cases.
- If the requirement is incomplete, produce the best available testcase draft and add a `待确认` section.
- If there is obvious ambiguity, state the inference you made and why.

## Example Triggers

- “根据 `requirments/产品pk/` 生成测试用例”
- “把 `requirments/产品pk/产品详情.html` 转成 QA 用例”
- “继续补充 `testcases/` 里现有的产品 PK 测试用例”
