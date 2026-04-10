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

Quality bar:

- each case must be testable and atomic
- preconditions must be embedded into `测试步骤`; do not keep a separate `前置条件` column unless the user explicitly asks for that schema
- steps must be actionable, not vague summaries
- expected results must be observable
- separate UI display checks from business-rule checks when they can fail independently
- explicitly mark assumptions and unresolved questions instead of hiding them

## Writing Guidance

- Keep output in Chinese when the source documents are in Chinese.
- Prefer concise but complete testcase titles that describe one scenario.
- Put setup, data state, login state, page-entry state, and other preconditions into the test steps, usually as step 1 or the first few ordered steps.
- Do not keep many rows under the same overly broad `模块` name. When several cases belong to one large module, refine the module with a short qualifier in parentheses based on entry condition, state, or sub-function.
- For list-page cases, if the generic module name would still be vague or heavily repeated, use the testcase name as the `模块` value.
- Split mixed scenarios into multiple cases instead of one oversized case.
- If the requirement is incomplete, produce the best available testcase draft and add a `待确认` section.
- If there is obvious ambiguity, state the inference you made and why.

## Example Triggers

- “根据 `requirments/产品pk/` 生成测试用例”
- “把 `requirments/产品pk/产品详情.html` 转成 QA 用例”
- “继续补充 `testcases/` 里现有的产品 PK 测试用例”
