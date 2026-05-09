#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const args = process.argv.slice(2);

const options = {
  title: "+项目测试用例",
  output: "",
  includeResource: true,
  includeTracking: true,
  includeMultiLine: true,
  includeRoomCar: true,
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--title" && args[i + 1]) {
    options.title = args[i + 1];
    i += 1;
  } else if (arg === "--output" && args[i + 1]) {
    options.output = args[i + 1];
    i += 1;
  } else if (arg === "--no-resource") {
    options.includeResource = false;
  } else if (arg === "--no-tracking") {
    options.includeTracking = false;
  } else if (arg === "--single-line") {
    options.includeMultiLine = false;
  } else if (arg === "--no-room-car") {
    options.includeRoomCar = false;
  } else if (arg === "--help") {
    printHelp();
    process.exit(0);
  }
}

function printHelp() {
  console.log(`Usage:
  node scripts/generate_calendar_xmind.js [options]

Options:
  --title <text>       Root node title. Default: +项目测试用例
  --output <path>      Output .xmind path. Default: ./<title>.xmind
  --no-resource        Exclude +选择资源页 module
  --no-tracking        Exclude +神策埋点 tree
  --single-line        Use a single-line calendar branch
  --no-room-car        Exclude room/car difference branches
  --help               Show this help
`);
}

function id() {
  return crypto.randomUUID().replace(/-/g, "");
}

function topic(title, children = [], extra = {}) {
  const node = {
    id: id(),
    class: "topic",
    title,
    ...extra,
  };
  if (children.length > 0) {
    node.children = { attached: children };
  }
  return node;
}

function sheetTitleFromRoot(rootTitle) {
  return rootTitle.startsWith("+") ? rootTitle.slice(1) : rootTitle;
}

function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}

function makeTree() {
  const detail = topic("+产品详情", [
    topic("+价格横幅/价格信息", [
      topic("查看产品详情-价格横幅（条件A&条件B&条件C）", [
        topic("1.准备前置数据...\n2.进入产品详情页查看价格横幅...", [
          topic("1.显示元素...\n2.默认展示如下：\n  a....\n  b...."),
        ]),
      ]),
    ]),
    topic("+起售价&价格说明弹层", [
      topic("查看产品详情-起售价与价格说明弹层（场景A/场景B）", [
        topic("1.准备前置数据...\n2.点击价格说明入口...", [
          topic("1.弹层展示如下：\n  a....\n  b...."),
        ]),
      ]),
    ]),
    topic("+选择团期入口", [
      topic("点击选择团期入口", [
        topic("1.进入产品详情页...\n2.点击选择团期入口...", [
          topic("1.进入日历弹窗"),
        ]),
      ]),
    ]),
  ]);

  const calendarChildren = [
    topic("+弹窗UI", [
      topic("查看日历弹窗", [
        topic("1.进入日历弹窗...", [
          topic("1.显示线路/套餐/月份/团期/人数/底部栏"),
        ]),
      ]),
    ]),
    topic("+团期卡片", [
      topic(
        options.includeMultiLine
          ? "查看团期卡片（多线路/非多线路）"
          : "查看团期卡片（单线路）",
        [
          topic("1.进入日历弹窗...\n2.查看团期卡片...", [
            topic("1.状态文案如下：\n  a.售卖中...\n  b.即将售罄...\n  c.可候补..."),
          ]),
        ]
      ),
    ]),
    topic("+出行人数/份数/房间数/车型数", [
      topic("查看出行人数（预定人数/预定份数/卡预约）", [
        topic("1.进入日历弹窗...\n2.查看人数与补差区域...", [
          topic(
            options.includeRoomCar
              ? "1.人数展示如下：\n  a....\n  b....\n2.房差/车差如下：\n  a....\n  b...."
              : "1.人数展示如下：\n  a....\n  b...."
          ),
        ]),
      ]),
    ]),
    topic("+已选浮条&底部按钮", [
      topic("查看已选浮条&底部按钮（条件A&条件B）", [
        topic("1.选择团期...\n2.选择/不选择人数...", [
          topic("1.已选浮条如下：\n  a....\n  b....\n2.底部按钮如下：\n  a....\n  b...."),
        ]),
      ]),
    ]),
  ];

  if (options.includeRoomCar) {
    calendarChildren.splice(
      3,
      0,
      topic("+房差说明/车差说明", [
        topic("查看房差说明弹层", [
          topic("1.点击房差说明...", [
            topic("1.弹层信息如下：\n  a....\n  b...."),
          ]),
        ]),
        topic("查看车差咨询入口", [
          topic("1.点击车差说明/我要咨询...", [
            topic("1.咨询链路如下：\n  a.专员\n  b.进群"),
          ]),
        ]),
      ])
    );
  }

  const allDates = topic("+全部日历弹窗", [
    topic("+进入全部日历弹窗", [
      topic("点击查看全部日期", [
        topic("1.进入日历弹窗...\n2.点击查看全部日期...", [
          topic("1.打开全部日历弹窗"),
        ]),
      ]),
    ]),
    topic("+全部日期列表", [
      topic("查看全部日历弹窗（条件A/条件B）", [
        topic("1.进入全部日历弹窗...", [
          topic("1.月份切换如下：\n  a....\n  b....\n2.日期状态如下：\n  a.可售...\n  b.可候补...\n  c.不可选..."),
        ]),
      ]),
    ]),
    topic("+咨询入口", [
      topic("点击更多日期咨询入口（专员/进群）", [
        topic("1.进入全部日历弹窗...\n2.点击咨询入口...", [
          topic("1.跳转/弹出如下：\n  a.专员\n  b.进群"),
        ]),
      ]),
    ]),
  ]);

  const frontChildren = [detail, topic("+日历弹窗", calendarChildren), allDates];

  if (options.includeResource) {
    frontChildren.push(
      topic("+选择资源页", [
        topic("+页面UI与咨询入口", [
          topic("查看资源页", [
            topic("1.进入选择资源页...", [
              topic("1.页面元素如下：\n  a....\n  b....\n2.咨询入口如下：\n  a....\n  b...."),
            ]),
          ]),
        ]),
      ])
    );
  }

  const rootChildren = [topic("+前端", frontChildren)];

  if (options.includeTracking) {
    rootChildren.push(
      topic("+神策埋点", [
        topic("+活动详情页-ProductDetailClick", [
          topic("活动详情页-ProductDetailClick（查看价格说明）", [
            topic("1.执行点击价格说明操作...", [
              topic("1.记神策事件ProductDetailClick，button_name：查看价格说明"),
            ]),
          ]),
          topic("活动详情页-ProductDetailClick（计算我的出行价格）", [
            topic("1.执行点击底部按钮操作...", [
              topic("1.记神策事件ProductDetailClick，button_name：计算我的出行价格"),
            ]),
          ]),
        ]),
        topic("+填写订单页-SelectDateClick", [
          topic("填写订单页-SelectDateClick（查看全部日期）", [
            topic("1.执行点击查看全部日期操作...", [
              topic("1.记神策事件SelectDateClick，button_name为：查看全部日期"),
            ]),
          ]),
          topic("填写订单页-SelectDateClick（价格明细）", [
            topic("1.执行点击价格明细操作...", [
              topic("1.记神策事件SelectDateClick，button_name为：价格明细"),
            ]),
          ]),
          topic("填写订单页-SelectDateClick（更多日期咨询专员/进群咨询）", [
            topic("1.执行点击更多日期咨询操作...", [
              topic("1.记神策事件SelectDateClick，button_name为：更多日期咨询专员/更多日期进群咨询"),
            ]),
          ]),
        ]),
      ])
    );
  }

  return topic(options.title, rootChildren, {
    structureClass: "org.xmind.ui.logic.right",
  });
}

function makeSheet(rootTopic) {
  return {
    id: id(),
    revisionId: crypto.randomUUID(),
    class: "sheet",
    title: "画布 1",
    rootTopic,
    topicPositioning: "fixed",
    arrangeableLayerOrder: [rootTopic.id],
    zones: [],
  };
}

function writePackage(outputPath, content, metadata, manifest) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "calendar-xmind-"));
  try {
    fs.writeFileSync(path.join(tempDir, "content.json"), JSON.stringify(content, null, 2));
    fs.writeFileSync(path.join(tempDir, "metadata.json"), JSON.stringify(metadata, null, 2));
    fs.writeFileSync(path.join(tempDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    execFileSync("zip", ["-qr", outputPath, "."], { cwd: tempDir });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

const rootTopic = makeTree();
const sheet = makeSheet(rootTopic);
const metadata = {
  dataStructureVersion: "3",
  creator: {
    name: "Codex",
    version: "1.0.0",
  },
  activeSheetId: sheet.id,
  layoutEngineVersion: "5",
};
const manifest = {
  "file-entries": {
    "content.json": {},
    "metadata.json": {},
  },
};

const outputPath = path.resolve(
  options.output || `${sanitizeFilename(options.title)}.xmind`
);

writePackage(outputPath, [sheet], metadata, manifest);
console.log(outputPath);
