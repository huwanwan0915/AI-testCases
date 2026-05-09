#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);

if (args.includes("--help") || args.length === 0) {
  printHelp();
  process.exit(args.length === 0 ? 1 : 0);
}

let input = "";
let output = "";
let maxSections = 12;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--input" && args[i + 1]) {
    input = args[i + 1];
    i += 1;
  } else if (arg === "--output" && args[i + 1]) {
    output = args[i + 1];
    i += 1;
  } else if (arg === "--max-sections" && args[i + 1]) {
    maxSections = Number(args[i + 1]) || 12;
    i += 1;
  }
}

if (!input) {
  printHelp();
  process.exit(1);
}

function printHelp() {
  console.log(`Usage:
  node scripts/html_to_prototype_alignment_draft.js --input "<html-path>" [--output "<md-path>"] [--max-sections 12]

Example:
  node scripts/html_to_prototype_alignment_draft.js --input "requirments/日历改造/产品详情.html" --output "testcases/产品详情-原型落位草稿.md"
`);
}

function decodeHtml(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function stripTags(text) {
  return decodeHtml(text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
}

function normalizeCandidate(text) {
  return text.replace(/\s+/g, "").trim();
}

function canonicalizeSectionName(text) {
  const normalized = normalizeCandidate(text);

  if (/^查看$/.test(normalized)) return "";
  if (/查看价格/.test(text)) return "价格说明入口";
  if (/价格说明|当前起价|产品起价|常规售价|限时直降|起价说明/.test(text)) return "价格说明弹层";
  if (/选择团期/.test(text)) return "选择团期入口";
  if (/团期卡片/.test(text)) return "团期卡片";
  if (/计算我的出行价格|报名活动|开售提醒我|我知道了/.test(text)) return "底部按钮";
  if (/我要咨询|进群咨询|咨询入口|咨询/.test(text)) return "咨询入口";
  if (/全部日期弹窗/.test(text)) return "全部日期弹窗";
  if (/选择出行日期与人数|选择出行人数与日期/.test(text)) return "已选浮条";
  if (/选择出行日期|出行日期/.test(text)) return "出行日期";
  if (/选择出行人数|出行人数/.test(text)) return "出行人数";
  if (/房间数/.test(text)) return "房间数";
  if (/需补房差|房差说明|房差/.test(text)) return "房差说明";
  if (/需补车差|车差说明|车差/.test(text)) return "车差说明";
  if (/余位通知|已报名|仅余\d+|立减\d+|拼单立减|调价|优惠|起\/人|起\/成人|起\/儿童/.test(normalized)) return "价格信息区";
  if (/^¥?\d+(\.\d+)?$/.test(normalized) || /^¥\d+起$/.test(normalized)) return "";
  if (/^余\d+$/.test(normalized) || /报名中|已成团|未成团|已售罄|已满员|可候补|即将售罄/.test(normalized)) return "团期卡片";
  if (/^成人$|^儿童$|^老人$|^婴儿$/.test(normalized)) return "出行人数";
  if (/清明|端午|中秋|国庆|春节|劳动节|元旦/.test(normalized)) return "出行日期";
  return text;
}

function isLikelySectionName(text) {
  const normalized = normalizeCandidate(text);
  if (!normalized) return false;
  if (normalized.length < 2 || normalized.length > 18) return false;
  if (/^[0-9]+$/.test(normalized)) return false;
  if (/^[1-9][0-9]*[、.)）]/.test(normalized)) return false;
  if (/^[·•\-→]/.test(normalized)) return false;
  if (/[，。,；：:（）()【】\[\]\/]/.test(normalized)) return false;
  if (/如果|默认|找到|展示|点击|打开|关闭|跳转|文案|逻辑|规则|说明见下|补充|调整|枚举|不同|以上|以下|固定|UI|重构/.test(normalized)) return false;
  if (/^本起价|^最终支付价格|^儿童报价|^产品详情起价显示逻辑/.test(normalized)) return false;
  if (/^¥?\d+(\.\d+)?$/.test(normalized)) return false;
  if (/^\d+人已报名$|^\d+(\.\d+)?w\+?人已报名$|^仅余\d+[人份间车]?$/.test(normalized)) return false;
  return true;
}

function scoreCandidate(text) {
  let score = 0;
  if (/弹窗|说明|价格|团期|日期|人数|房间|车差|房差|按钮|咨询|资源|进度条|卡片|起价|横幅/.test(text)) score += 4;
  if (text.length >= 2 && text.length <= 12) score += 3;
  if (text.length <= 8) score += 1;
  if (/^[\d¥\-+/.:年月日周节假起满减返人份间房车]+$/.test(text)) score -= 4;
  if (/^(\d+|¥.*|[+\-]|\d+月|\d+日|周.|春节|儿童节|已选|下一步|报名中|已成团|已满员|0)$/.test(text)) score -= 3;
  if (/UI样式|重构|补充|逻辑|规则/.test(text)) score -= 1;
  return score;
}

function extractCandidates(html) {
  const textMatches = [...html.matchAll(/<div id="u\d+_text"[^>]*>\s*<p[^>]*>(.*?)<\/p>/g)]
    .map((m) => stripTags(m[1]))
    .filter(Boolean);

  const seen = new Set();
  const candidates = [];
  for (const text of textMatches) {
    const canonical = canonicalizeSectionName(text);
    const normalized = normalizeCandidate(canonical);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    if (!isLikelySectionName(canonical)) continue;
    const score = scoreCandidate(canonical);
    if (score > 0) {
      candidates.push({ text: canonical, score });
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score || a.text.length - b.text.length)
    .map((x) => x.text);
}

function getDefaultSections(pageTitle) {
  if (/产品详情/.test(pageTitle)) {
    return ["价格信息区", "价格说明入口", "价格说明弹层", "选择团期入口", "团期卡片", "底部按钮"];
  }
  if (/日历弹窗/.test(pageTitle)) {
    return ["弹窗UI", "团期卡片", "出行日期", "出行人数", "房差说明", "车差说明", "已选浮条", "底部按钮", "咨询入口", "全部日期弹窗"];
  }
  if (/选择资源页/.test(pageTitle)) {
    return ["页面UI", "资源信息区", "咨询入口", "底部按钮"];
  }
  if (/套餐编辑/.test(pageTitle)) {
    return ["页面UI", "套餐列表", "底部按钮"];
  }
  return [];
}

function mergeSections(pageTitle, extractedSections) {
  const merged = [];
  const seen = new Set();

  for (const name of [...getDefaultSections(pageTitle), ...extractedSections]) {
    const normalized = normalizeCandidate(name);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    merged.push(name);
    if (merged.length >= maxSections) break;
  }

  return merged;
}

function buildDraft(pageTitle, sections, sourcePath) {
  const out = [];
  out.push(`# ${pageTitle}-原型落位草稿（HTML自动初始化）`);
  out.push("");
  out.push(`- 来源原型：\`${sourcePath}\``);
  out.push("- 说明：以下“页面区域”由 HTML 原型中的页面标题和短文本候选自动抽取，必须人工二次确认、合并、删减。");
  out.push("");
  out.push(`页面/弹层：${pageTitle}`);
  out.push("");
  out.push("## 原型区域 -> 文字规则 -> 用例节点");
  out.push("");

  sections.forEach((name, index) => {
    out.push(`${index + 1}. 页面区域：${name}`);
    out.push("   - 原型位置：");
    out.push("   - 页面动作：查看 / 点击 / 切换 / 关闭");
    out.push("   - 文字规则：");
    out.push("     - ");
    out.push("   - 后续用例节点：");
    out.push(`     - 查看${pageTitle}-${name}（条件A）`);
    out.push("");
  });

  out.push("## 人工修正建议");
  out.push("- 删除纯数值、纯价格、纯日期类噪音项。");
  out.push("- 合并同一视觉区块下的重复候选，例如“价格说明”“常规售价”“当前起价”。");
  out.push("- 优先保留真正的页面区域名，不要保留说明文案本身当区域名。");
  out.push("- 再把需求文档中的文字规则逐条挂到保留下来的区域下面。");
  out.push("");

  return out.join("\n");
}

const inputPath = path.resolve(input);
const html = fs.readFileSync(inputPath, "utf8");
const pageTitle = stripTags((html.match(/<title>(.*?)<\/title>/i) || [])[1] || path.basename(inputPath, ".html"));
const sections = mergeSections(pageTitle, extractCandidates(html));
const draft = buildDraft(pageTitle, sections, inputPath);

if (output) {
  const outputPath = path.resolve(output);
  fs.writeFileSync(outputPath, `${draft}\n`, "utf8");
  console.log(outputPath);
} else {
  console.log(draft);
}
