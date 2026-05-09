#!/usr/bin/env node

const args = process.argv.slice(2);

const options = {
  title: "+项目测试用例",
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
  node scripts/generate_calendar_skeleton.js [options]

Options:
  --title <text>       Root node title. Default: +项目测试用例
  --no-resource        Exclude +选择资源页 module
  --no-tracking        Exclude +神策埋点 tree
  --single-line        Use a single-line calendar branch
  --no-room-car        Exclude room/car difference branches
  --help               Show this help
`);
}

function line(text, depth = 0) {
  return `${"  ".repeat(depth)}${text}`;
}

const out = [];
out.push(line(options.title));
out.push(line("+前端", 1));
out.push(line("+产品详情", 2));
out.push(line("+价格横幅/价格信息", 3));
out.push(line("查看产品详情-价格横幅（条件A&条件B&条件C）", 4));
out.push(line("1.准备前置数据...", 5));
out.push(line("2.进入产品详情页查看价格横幅...", 5));
out.push(line("1.显示元素...", 6));
out.push(line("2.默认展示如下：", 6));
out.push(line("a....", 7));
out.push(line("b....", 7));
out.push(line("+起售价&价格说明弹层", 3));
out.push(line("查看产品详情-起售价与价格说明弹层（场景A/场景B）", 4));
out.push(line("1.准备前置数据...", 5));
out.push(line("2.点击价格说明入口...", 5));
out.push(line("1.弹层展示如下：", 6));
out.push(line("a....", 7));
out.push(line("b....", 7));
out.push(line("+选择团期入口", 3));
out.push(line("点击选择团期入口", 4));
out.push(line("1.进入产品详情页...", 5));
out.push(line("2.点击选择团期入口...", 5));
out.push(line("1.进入日历弹窗", 6));

out.push(line("+日历弹窗", 2));
out.push(line("+弹窗UI", 3));
out.push(line("查看日历弹窗", 4));
out.push(line("1.进入日历弹窗...", 5));
out.push(line("1.显示线路/套餐/月份/团期/人数/底部栏", 6));
out.push(line("+团期卡片", 3));
out.push(
  line(
    options.includeMultiLine
      ? "查看团期卡片（多线路/非多线路）"
      : "查看团期卡片（单线路）",
    4
  )
);
out.push(line("1.进入日历弹窗...", 5));
out.push(line("2.查看团期卡片...", 5));
out.push(line("1.状态文案如下：", 6));
out.push(line("a.售卖中...", 7));
out.push(line("b.即将售罄...", 7));
out.push(line("c.可候补...", 7));
out.push(line("+出行人数/份数/房间数/车型数", 3));
out.push(line("查看出行人数（预定人数/预定份数/卡预约）", 4));
out.push(line("1.进入日历弹窗...", 5));
out.push(line("2.查看人数与补差区域...", 5));
out.push(line("1.人数展示如下：", 6));
out.push(line("a....", 7));
out.push(line("b....", 7));
if (options.includeRoomCar) {
  out.push(line("2.房差/车差如下：", 6));
  out.push(line("a....", 7));
  out.push(line("b....", 7));
  out.push(line("+房差说明/车差说明", 3));
  out.push(line("查看房差说明弹层", 4));
  out.push(line("1.点击房差说明...", 5));
  out.push(line("1.弹层信息如下：", 6));
  out.push(line("a....", 7));
  out.push(line("b....", 7));
  out.push(line("查看车差咨询入口", 4));
  out.push(line("1.点击车差说明/我要咨询...", 5));
  out.push(line("1.咨询链路如下：", 6));
  out.push(line("a.专员", 7));
  out.push(line("b.进群", 7));
}
out.push(line("+已选浮条&底部按钮", 3));
out.push(line("查看已选浮条&底部按钮（条件A&条件B）", 4));
out.push(line("1.选择团期...", 5));
out.push(line("2.选择/不选择人数...", 5));
out.push(line("1.已选浮条如下：", 6));
out.push(line("a....", 7));
out.push(line("b....", 7));
out.push(line("2.底部按钮如下：", 6));
out.push(line("a....", 7));
out.push(line("b....", 7));

out.push(line("+全部日历弹窗", 2));
out.push(line("+进入全部日历弹窗", 3));
out.push(line("点击查看全部日期", 4));
out.push(line("1.进入日历弹窗...", 5));
out.push(line("2.点击查看全部日期...", 5));
out.push(line("1.打开全部日历弹窗", 6));
out.push(line("+全部日期列表", 3));
out.push(line("查看全部日历弹窗（条件A/条件B）", 4));
out.push(line("1.进入全部日历弹窗...", 5));
out.push(line("1.月份切换如下：", 6));
out.push(line("a....", 7));
out.push(line("b....", 7));
out.push(line("2.日期状态如下：", 6));
out.push(line("a.可售...", 7));
out.push(line("b.可候补...", 7));
out.push(line("c.不可选...", 7));
out.push(line("+咨询入口", 3));
out.push(line("点击更多日期咨询入口（专员/进群）", 4));
out.push(line("1.进入全部日历弹窗...", 5));
out.push(line("2.点击咨询入口...", 5));
out.push(line("1.跳转/弹出如下：", 6));
out.push(line("a.专员", 7));
out.push(line("b.进群", 7));

if (options.includeResource) {
  out.push(line("+选择资源页", 2));
  out.push(line("+页面UI与咨询入口", 3));
  out.push(line("查看资源页", 4));
  out.push(line("1.进入选择资源页...", 5));
  out.push(line("1.页面元素如下：", 6));
  out.push(line("a....", 7));
  out.push(line("b....", 7));
  out.push(line("2.咨询入口如下：", 6));
  out.push(line("a....", 7));
  out.push(line("b....", 7));
}

if (options.includeTracking) {
  out.push(line("+神策埋点", 1));
  out.push(line("+活动详情页-ProductDetailClick", 2));
  out.push(line("活动详情页-ProductDetailClick（查看价格说明）", 3));
  out.push(line("1.执行点击价格说明操作...", 4));
  out.push(line("1.记神策事件ProductDetailClick，button_name：查看价格说明", 5));
  out.push(line("活动详情页-ProductDetailClick（计算我的出行价格）", 3));
  out.push(line("1.执行点击底部按钮操作...", 4));
  out.push(line("1.记神策事件ProductDetailClick，button_name：计算我的出行价格", 5));
  out.push(line("+填写订单页-SelectDateClick", 2));
  out.push(line("填写订单页-SelectDateClick（查看全部日期）", 3));
  out.push(line("1.执行点击查看全部日期操作...", 4));
  out.push(line("1.记神策事件SelectDateClick，button_name为：查看全部日期", 5));
  out.push(line("填写订单页-SelectDateClick（价格明细）", 3));
  out.push(line("1.执行点击价格明细操作...", 4));
  out.push(line("1.记神策事件SelectDateClick，button_name为：价格明细", 5));
  out.push(line("填写订单页-SelectDateClick（更多日期咨询专员/进群咨询）", 3));
  out.push(line("1.执行点击更多日期咨询操作...", 4));
  out.push(line("1.记神策事件SelectDateClick，button_name为：更多日期咨询专员/更多日期进群咨询", 5));
}

console.log(out.join("\n"));
