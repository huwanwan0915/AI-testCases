---
name: requirement-decomposer
description: Use this skill when the user wants to decompose a requirement before writing test cases or implementation, especially to拆页面模块、拆用户流程、拆条件维度、拆状态分支、做原型落位、列待确认项, without directly generating the final testcase file yet.
---

# Requirement Decomposer

## When To Use

Use this skill when the user asks to:

- 拆解需求
- 先把需求拆清楚
- 先拆页面模块再写用例
- 先做原型落位
- 先列条件维度、状态分支、排列组合
- 先整理流程、模块、空态、异常态、边界态
- 先列待确认问题，不急着产出最终测试用例

Typical inputs:

- `requirments/` 下的需求文档、Axure 导出 `.html/.htm`
- 页面截图、原型图、蓝湖/原型说明转存内容
- 用户已经写过一版，但希望先重拆结构

## Not The Goal

这个 skill 的目标不是直接产出最终 `.xmind` 测试用例。

默认只负责把需求拆成清晰的中间结构，包括：

- 页面/模块骨架
- 用户流程
- 条件维度
- 状态分支
- 规则矩阵
- 待确认项

但拆解结果本身默认不应被视为一次性草稿。
其中稳定、可复用、跨需求有价值的拆解结论，应进一步沉淀为知识点，写入 `knowledge-base-manager` 管理的本地知识库。

如果用户后续要写正式测试用例，再交给：

- `requirements-testcase-writer`
- `maitao-testcase-style`

## Default Output

默认输出应包含以下几块，按需要裁剪：

1. 页面模块拆解
2. 页面内元素归属
3. 用户主流程/分支流程
4. 条件维度拆解
5. 有业务意义的排列组合
6. 空态/异常态/边界态
7. 埋点/后台/联动点
8. 待确认项
9. 可沉淀知识点

若用户没有指定保存位置，中间拆解稿默认放 `/tmp`，不要写进 `testcases/`。

## Workflow

### 1. 先确认输入源

- 若用户给了明确路径，优先使用该路径。
- 若是一个功能文件夹，把同目录相关文件一起看。
- 若同时有原型图、文档、用户原稿，优先级默认是：
  - 原型图真实区域
  - 用户已确认过的模块/层级偏好
  - 文字规则

### 2. 先做原型落位

- 先按页面从上到下拆真实区域。
- 不先按“规则说明”“逻辑校验”“功能汇总”这类抽象名字分组。
- 每条文字规则都要先挂回具体页面区域，再继续拆。

最小输出至少要有：

- 页面名
- 页面区域
- 每个区域里的核心元素/交互/状态

### 3. 再拆用户流程

- 先列主流程。
- 再列入口差异、登录差异、切换差异、关闭重开差异、上下游跳转差异。
- 对于弹窗、结果页、分享页、后台详情页，默认拆成独立流程段。

### 4. 再拆条件维度

遇到以下内容时，必须先拆维度，再写组合：

- 显示/不显示
- 可点/不可点
- 为空/非空
- 有数据/无数据
- 单线路/多线路
- 有评价/无评价
- 未完成/已完成
- H5/小程序/App
- 标签映射/字段映射/归类关系

### 5. 做排列组合筛选

- 不要求机械穷举所有组合。
- 只保留有业务意义的组合：
  - 正常
  - 缺失
  - 并存
  - 互斥
  - 兜底
  - 空态
  - 边界

### 6. 输出拆解结果

默认用清晰结构输出，不急着贴最终 testcase 语气。

推荐顺序：

1. 页面模块骨架
2. 每个模块下的功能点
3. 每个功能点下的状态/分支
4. 最后列待确认项
5. 单独标出“可沉淀知识点”

### 7. 标记可沉淀知识点

拆解完成后，默认再判断本次拆解里哪些内容值得沉淀到知识库。

优先沉淀：

- 稳定的模块拆解方法
- 稳定的流程拆解方法
- 稳定的条件维度口径
- 稳定的映射/归类规则
- 某功能链路反复出现的历史分支
- 对后续相似需求有复用价值的拆解框架

## Writing Rules

- 固定说明清单可用 `1） 2） 3）`
- 真正的“条件不同 -> 结果不同”用 `a. b. c.`
- 若是“映射关系 / 归类关系 / 对应关系”，对象不同且结果不同，也按 `a. b. c.` 拆
- 不要写成 `1.a.`、`1-2a.`、`2.d-1.`
- 如果只是拆需求，不要急着把所有内容写成正式测试步骤/预期结果口吻

## Handoff Rules

如果下一步要继续写正式测试用例：

- 先把当前拆解稿作为中间输入保存到 `/tmp`
- 先把其中“可沉淀知识点”交给 `knowledge-base-manager` 写入知识库
- 先调用 `knowledge-base-manager`，基于拆解结果检索历史规则、历史分支、历史口径、历史需求/旧用例，并区分“历史沿用”“本次新增”“待确认”
- 再使用 `requirements-testcase-writer`
- 若用户要求麦淘 XMind 风格，再叠加 `maitao-testcase-style`

推荐标准链路：

1. `requirement-decomposer`
2. `knowledge-base-manager`
3. `requirements-testcase-writer`
4. `maitao-testcase-style`（如需）

## References

- 优先先看 `../maitao-testcase-style/references/testcase-hard-checklist.md`
- 若需要直接套拆解结构，可用 `references/requirements-decomposition-template.md`

## Quality Checklist

- [ ] 已先按页面真实区域拆模块，而不是按抽象逻辑分组
- [ ] 已拆主流程与关键分支流程
- [ ] 已拆出影响结果的条件维度
- [ ] 已筛出有业务意义的排列组合，而不是只抄原文
- [ ] 已区分固定说明与真正分支
- [ ] 已补空态/异常态/边界态
- [ ] 已标出待确认项
- [ ] 已标出哪些拆解结果可沉淀为知识点
- [ ] 中间稿默认未落到 `testcases/`

## Example Triggers

- “先帮我拆解这个需求”
- “先别写用例，先把需求拆清楚”
- “你先做原型落位”
- “先拆模块、流程、分支”
- “先列需求里的条件维度和排列组合”
