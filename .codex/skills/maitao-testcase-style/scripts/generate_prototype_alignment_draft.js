#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

const args = process.argv.slice(2);

if (args.includes("--help") || args.length === 0) {
  printHelp();
  process.exit(args.length === 0 ? 1 : 0);
}

let page = "";
let output = "";
const sections = [];

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--page" && args[i + 1]) {
    page = args[i + 1];
    i += 1;
  } else if (arg === "--section" && args[i + 1]) {
    sections.push(args[i + 1]);
    i += 1;
  } else if (arg === "--output" && args[i + 1]) {
    output = args[i + 1];
    i += 1;
  }
}

if (!page) {
  printHelp();
  process.exit(1);
}

function printHelp() {
  console.log(`Usage:
  node scripts/generate_prototype_alignment_draft.js --page "<页面名>" [--section "<区域名>"]... [--output "<file>"]

Examples:
  node scripts/generate_prototype_alignment_draft.js --page "产品详情页" --section "价格横幅" --section "价格说明弹层"
  node scripts/generate_prototype_alignment_draft.js --page "日历弹窗" --section "团期卡片" --section "底部按钮" --output "/tmp/日历弹窗-原型落位草稿.md"
`);
}

const defaultSections = [
  "头部",
  "横幅",
  "价格区",
  "说明弹层",
  "卡片",
  "列表",
  "底部按钮",
  "咨询入口",
];

const finalSections = sections.length > 0 ? sections : defaultSections;

function buildDraft() {
  const out = [];
  out.push(`# ${page}-原型落位草稿`);
  out.push("");
  out.push(`页面/弹层：${page}`);
  out.push("");
  out.push("## 使用说明");
  out.push("- 先按原型图从上到下补充真实区域位置。");
  out.push("- 再把需求文档里的文字规则逐条挂到对应区域。");
  out.push("- 最后再补“后续用例节点”，不要跳过落位直接写 case。");
  out.push("");
  out.push("## 原型区域 -> 文字规则 -> 用例节点");
  out.push("");

  finalSections.forEach((name, index) => {
    out.push(`${index + 1}. 页面区域：${name}`);
    out.push("   - 原型位置：");
    out.push("   - 页面动作：查看 / 点击 / 切换 / 关闭");
    out.push("   - 文字规则：");
    out.push("     - ");
    out.push("   - 后续用例节点：");
    out.push(`     - 查看${page}-${name}（条件A）`);
    out.push("");
  });

  out.push("## 自检");
  out.push("- 这条规则作用于页面上的哪里？");
  out.push("- 这个区域名是不是原型图上真实能看到的区域？");
  out.push("- 这个“后续用例节点”是不是能直接挂到脑图里？");
  out.push("- 有没有规则还停留在抽象逻辑层，没有挂到具体区域？");
  out.push("");

  return out.join("\n");
}

const draft = buildDraft();
const outputPath = output
  ? path.resolve(output)
  : path.join(os.tmpdir(), `${page}-原型落位草稿.md`);

fs.writeFileSync(outputPath, `${draft}\n`, "utf8");
console.log(outputPath);
