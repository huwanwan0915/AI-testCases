---
name: knowledge-base-manager
description: Use this skill when the user wants to create, update, query, classify, or reuse a local knowledge base, especially for沉淀历史规则、返工经验、功能链路知识、待确认结论、测试口径、需求拆解经验、用例编写规范 and cross-feature reusable knowledge.
---

# Knowledge Base Manager

## When To Use

Use this skill when the user asks to:

- 建知识库
- 查知识库
- 沉淀经验
- 记录今天的经验教训
- 把规则总结到知识库
- 归档历史规则/历史分支/历史口径
- 判断哪些规则是历史沿用、哪些是本次新增
- 整理功能链路知识
- 整理待确认结论、测试口径、写用例规范

Typical scope:

- 测试用例写法规则
- 需求拆解方法
- 功能链路历史经验
- 数据准备经验
- 页面模块归属规则
- 编号节奏规则
- Coding 入库规则
- 需求拆解产物中的稳定知识点

## Default Storage

本 skill 默认把知识库存放在：

- `.codex/knowledge-base/`

推荐子目录：

- `.codex/knowledge-base/rules/`
- `.codex/knowledge-base/retrospectives/`
- `.codex/knowledge-base/features/`
- `.codex/knowledge-base/glossary/`
- `.codex/knowledge-base/open-questions/`

除非用户明确要求，不要把知识库文件写到 `testcases/`。

## Core Responsibilities

这个 skill 只负责知识库本身，不直接替代：

- `requirement-decomposer`
- `requirements-testcase-writer`
- `maitao-testcase-style`
- `requirements-doc-optimizer`

它的职责是：

1. 沉淀规则
2. 归档经验
3. 分类知识
4. 检索历史
5. 识别可复用结论
6. 标记待确认项

## Workflow

### 1. 先判断知识类型

先把内容归到以下类型之一：

- `rules`：稳定规则、硬约束、统一口径
- `retrospectives`：返工经验、踩坑总结、经验教训
- `features`：某个功能链路的历史知识
- `glossary`：术语解释、字段口径、命名约定
- `open-questions`：暂未定论、需继续确认的问题

### 2. 再判断知识状态

每条知识默认标记状态：

- `stable`：稳定可复用
- `provisional`：当前暂定，后续可能调整
- `feature-specific`：只适用于某功能
- `global`：适用于所有功能/所有用例

### 3. 写入前先去重

- 先检索是否已有相近条目
- 若已有，就优先更新原条目，不重复建相近文件
- 若是同规则的新版本，在原条目中补“新增/修订”说明
- 若是完全不同的知识，再新建文件

### 4. 输出格式

默认知识条目至少包含：

1. 标题
2. 类型
3. 适用范围
4. 状态
5. 内容
6. 来源/触发背景
7. 示例
8. 关联文件

### 5. 检索时的默认动作

如果用户要“查知识库”，默认按这个顺序检索：

1. 规则类
2. 返工经验类
3. 功能链路类
4. 旧用例/旧需求引用
5. 待确认问题

如果当前任务是在“准备写正式测试用例”，默认检索输入应来自：

- `requirement-decomposer` 的拆解结果

并优先回答：

- 哪些规则属于历史沿用
- 哪些分支属于历史已有
- 哪些口径在历史需求中已经定过
- 哪些是本次新增
- 哪些点仍然没有稳定结论

如果输入本身就是一份需求拆解结果，还要继续判断：

- 哪些拆解结论应沉淀为稳定知识点
- 哪些拆解结论只是本次 feature-specific 结果
- 哪些拆解结论仍属于待确认，不应当作稳定知识写入

### 6. 沉淀时的默认动作

如果用户说“总结到知识库/skill/经验里”，默认先判断：

- 这是全局规则，还是 feature-specific 规则？
- 这是稳定规则，还是临时经验？
- 应该写进 skill 规则本身，还是只写进 knowledge-base？

默认原则：

- 全局、稳定、以后所有任务都要遵守的，优先同步到对应 skill
- feature-specific、历史背景类，优先沉淀到 knowledge-base
- 拆解需求过程中产出的稳定模块拆解方法、稳定流程口径、稳定维度拆法、稳定映射规则，默认也应沉淀到 knowledge-base，不要只作为一次性中间稿存在

如果是“写测试用例前查知识库”，推荐标准链路：

1. `requirement-decomposer`
2. `knowledge-base-manager`
3. `requirements-testcase-writer`
4. `maitao-testcase-style`（如需）

## File Naming

推荐文件名：

- `rules/testcase-numbering-rules.md`
- `rules/coding-import-rules.md`
- `retrospectives/line-pk-retrospective.md`
- `features/line-pk-knowledge.md`
- `glossary/product-price-terms.md`
- `open-questions/line-pk-open-questions.md`

命名要求：

- 小写英文 + 连字符优先
- 文件名尽量体现主题
- 不要用 `新建文档1.md` 这类无信息名字

## Knowledge Entry Template

需要新建条目时，优先套用：

- `references/knowledge-entry-template.md`

## Quality Checklist

- [ ] 已判断知识类型
- [ ] 已判断适用范围是 `global` 还是 `feature-specific`
- [ ] 已判断状态是 `stable` 还是 `provisional`
- [ ] 已先检索相近条目，避免重复沉淀
- [ ] 已写清来源背景，不是只有结论没有上下文
- [ ] 已补示例，便于后续复用
- [ ] 未误写进 `testcases/`

## Example Triggers

- “帮我建一个知识库”
- “把今天的经验沉淀到知识库”
- “你查一下历史规则”
- “这个规则是历史沿用还是本次新增”
- “帮我整理功能链路知识”
- “把返工经验归档起来”
