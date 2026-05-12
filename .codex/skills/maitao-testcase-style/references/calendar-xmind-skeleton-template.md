# 日历类 XMind 骨架模板

适用于“产品详情 -> 日历弹窗 -> 全部日历弹窗 -> 选择资源页 -> 埋点”链路类需求，可直接复制为脑图节点骨架后再补具体 case。

```text
+项目测试用例
  +前端
    +产品详情
      +价格横幅/价格信息
        查看产品详情-价格横幅（条件A&条件B&条件C）
          1.准备前置数据...
          2.进入产品详情页查看价格横幅...
            1.显示元素...
            2.默认展示如下：
              a....
              b....
            3.点击后如下：
              a....
              b....
            4.边界如下：
              a....
              b....
      +起售价&价格说明弹层
        查看产品详情-起售价与价格说明弹层（场景A/场景B）
          1.准备前置数据...
          2.点击价格说明入口...
            1.显示元素...
            2.价格展示如下：
              a....
              b....
            3.底部按钮如下：
              a....
              b....
      +选择团期入口
        点击选择团期入口
          1.进入产品详情页...
          2.点击选择团期入口...
            1.进入日历弹窗
    +日历弹窗
      +弹窗UI
        查看日历弹窗
          1.进入日历弹窗...
            1.显示线路/套餐/月份/团期/人数/底部栏
      +团期卡片
        查看团期卡片（多线路/非多线路）
          1.进入日历弹窗...
          2.查看团期卡片...
            1.状态文案如下：
              a.售卖中...
              b.即将售罄...
              c.可候补...
            2.价格/标签如下：
              a.调价...
              b.立减...
      +出行人数/份数/房间数/车型数
        查看出行人数（预定人数/预定份数/卡预约）
          1.进入日历弹窗...
          2.查看人数与补差区域...
            1.人数展示如下：
              a....
              b....
            2.房差/车差如下：
              a....
              b....
      +房差说明/车差说明
        查看房差说明弹层
          1.点击房差说明...
            1.弹层信息如下：
              a....
              b....
        查看车差咨询入口
          1.点击车差说明/我要咨询...
            1.咨询链路如下：
              a.专员
              b.进群
      +已选浮条&底部按钮
        查看已选浮条&底部按钮（条件A&条件B）
          1.选择团期...
          2.选择/不选择人数...
            1.已选浮条如下：
              a....
              b....
            2.底部按钮如下：
              a....
              b....
    +全部日历弹窗
      +进入全部日历弹窗
        点击查看全部日期
          1.进入日历弹窗...
          2.点击查看全部日期...
            1.打开全部日历弹窗
      +全部日期列表
        查看全部日历弹窗（条件A/条件B）
          1.进入全部日历弹窗...
            1.月份切换如下：
              a....
              b....
            2.日期状态如下：
              a.可售...
              b.可候补...
              c.不可选...
      +咨询入口
        点击更多日期咨询入口（专员/进群）
          1.进入全部日历弹窗...
          2.点击咨询入口...
            1.跳转/弹出如下：
              a.专员
              b.进群
    +选择资源页
      +页面UI与咨询入口
        查看资源页
          1.进入选择资源页...
            1.页面元素如下：
              a....
              b....
            2.咨询入口如下：
              a....
              b....
  +神策埋点
    +活动详情页-ProductDetailClick
      活动详情页-ProductDetailClick（查看价格说明）
        1.执行点击价格说明操作...
          1.记神策事件ProductDetailClick，button_name：查看价格说明
      活动详情页-ProductDetailClick（计算我的出行价格）
        1.执行点击底部按钮操作...
          1.记神策事件ProductDetailClick，button_name：计算我的出行价格
    +填写订单页-SelectDateClick
      填写订单页-SelectDateClick（查看全部日期）
        1.执行点击查看全部日期操作...
          1.记神策事件SelectDateClick，button_name为：查看全部日期
      填写订单页-SelectDateClick（价格明细）
        1.执行点击价格明细操作...
          1.记神策事件SelectDateClick，button_name为：价格明细
      填写订单页-SelectDateClick（更多日期咨询专员/进群咨询）
        1.执行点击更多日期咨询操作...
          1.记神策事件SelectDateClick，button_name为：更多日期咨询专员/更多日期进群咨询
```

## 使用说明
- 先按业务删除不需要的模块，再补充具体场景，不要整份模板原样保留。
- 当模块内部状态非常多时，优先在同一个 case 的预期下展开分支，而不是继续向下碎拆。
- 埋点模块只保留触发路径和事件结果，不重复描述前端 UI。
- 如果需要直接生成真实脑图文件，不手动复制模板，可运行：

```bash
node .codex/skills/maitao-testcase-style/scripts/generate_calendar_xmind.js --title "+XXX测试用例" --output "testcases/+XXX测试用例.xmind"
```

- 该命令会直接生成最小可用的 `.xmind` 包，包含 `content.json`、`metadata.json`、`manifest.json` 三个核心文件。
- 如果已经先写好了 Markdown 结构稿，再转成真实脑图，可运行；默认建议结构稿放临时目录，`testcases/` 只保留最终 `.xmind`：

```bash
node .codex/skills/maitao-testcase-style/scripts/markdown_to_xmind.js --input "/tmp/XXX（XMind结构版）.md" --output "testcases/+XXX测试用例.xmind"
```

- 结构稿默认采用以下约定：
  - `#`：根节点
  - `##`：一级模块
  - `###`：二级模块
  - `####`：用例标题
  - `##### 测试步骤`：步骤内容
  - `##### 预期结果`：预期内容
- 根节点下的 `- 来源路径`、`- 关联范围` 等说明项，会自动归档到脑图一级节点 `+附注`。
- `## +待确认` 这类一级模块会完整保留，不会在转换时丢失。

- 如果需要把已有 `.xmind` 反向导出成 Markdown 结构稿，可运行；默认建议导出到临时目录：

```bash
node .codex/skills/maitao-testcase-style/scripts/xmind_to_markdown.js --input "testcases/+XXX测试用例.xmind" --output "/tmp/XXX（XMind结构版）.md"
```

- 导出规则：
  - 标准 case 叶子按 `#### 用例标题 -> ##### 测试步骤 -> ##### 预期结果` 输出。
  - 多一层或多层分组的脑图，会压平成带路径的 `### 分组A / 分组B / 分组C`。
  - `+附注` 会回写成根节点下的 `- xxx` 说明行。
- 当前局限：
  - 导出脚本以“标准 case 叶子结构”为主，极端非标准脑图可能仍需人工微调。
  - 复杂富文本样式、颜色、边框、位置不会导出到 Markdown，只保留文本结构。

- 如果需要批量处理目录，可运行：

```bash
node .codex/skills/maitao-testcase-style/scripts/batch_convert_testcases.js --mode md-to-xmind --dir "testcases"
node .codex/skills/maitao-testcase-style/scripts/batch_convert_testcases.js --mode xmind-to-md --dir "/tmp/testcases-md"
```

- 批处理规则：
  - `md-to-xmind` 默认只处理文件名含 `结构版` 或 `结构稿` 的 `.md`
  - `md-to-xmind` 适合“临时结构稿 -> 最终 `.xmind`”流程；`testcases/` 默认只保留最终 `.xmind`
  - `xmind-to-md` 默认跳过文件名含 `-结构稿转换` 的 `.xmind`
  - `xmind-to-md` 建议输出到临时目录，不要默认回写到 `testcases/`
  - 默认不覆盖已有输出；如需覆盖，显式加 `--overwrite`

- 如果需要校验结构是否合规，可运行：

```bash
node .codex/skills/maitao-testcase-style/scripts/validate_testcase_structure.js --input "testcases/XXX（XMind结构版）.md"
node .codex/skills/maitao-testcase-style/scripts/validate_testcase_structure.js --input "testcases/+XXX测试用例.xmind"
```

- 当前校验项：
  - 是否缺少根节点、一级模块、二级模块、case
  - case 是否缺少测试步骤或预期结果
  - 是否存在空引用 `《》`
  - 是否存在 `待补`、`TODO`、`TBD` 等占位词
  - `.xmind` 中是否存在非标准深层分组，提示需要人工确认

- 如果需要批量校验目录，可运行：

```bash
node .codex/skills/maitao-testcase-style/scripts/batch_validate_testcases.js --dir "testcases"
```

- 批量校验默认筛选规则：
  - `.xmind`：纳入校验
  - `.md`：仅校验文件名含 `结构版` 或 `结构稿` 的结构稿
  - 自动跳过 `-导出结构稿`、`-结构稿转换` 这类中间产物，减少噪音
