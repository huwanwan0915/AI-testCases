#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const args = process.argv.slice(2);

if (args.includes("--help") || args.length === 0) {
  printHelp();
  process.exit(args.length === 0 ? 1 : 0);
}

let input = "";
let output = "";

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--input" && args[i + 1]) {
    input = args[i + 1];
    i += 1;
  } else if (arg === "--output" && args[i + 1]) {
    output = args[i + 1];
    i += 1;
  }
}

if (!input || !output) {
  printHelp();
  process.exit(1);
}

function printHelp() {
  console.log(`Usage:
  node scripts/xmind_to_markdown.js --input "<xmind-path>" --output "<markdown-path>"

Output markdown structure:
  # 根节点
  ## 一级模块
  ### 二级模块
  #### 用例标题
  ##### 测试步骤
  1. ...
  ##### 预期结果
  1. ...
`);
}

function readContentJson(xmindPath) {
  const raw = execSync(`unzip -p '${xmindPath.replace(/'/g, "'\\''")}' content.json`, {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
  return JSON.parse(raw);
}

function attached(node) {
  return node?.children?.attached || [];
}

function isCaseNode(node) {
  const kids = attached(node);
  if (kids.length !== 1) return false;
  const stepNode = kids[0];
  const stepKids = attached(stepNode);
  if (stepKids.length !== 1) return false;
  return attached(stepKids[0]).length === 0;
}

function subtreeHasCase(node) {
  if (isCaseNode(node)) return true;
  return attached(node).some(subtreeHasCase);
}

function splitNumberedText(text) {
  if (!text) return [];
  const normalized = text.replace(/\r/g, "");
  const lines = normalized.split("\n");
  const items = [];
  let current = "";

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^(\d+[.)]|[a-zA-Z]\.)\s*/.test(trimmed)) {
      if (current) items.push(current);
      current = trimmed;
    } else if (/^\d+[）]/.test(trimmed)) {
      if (current) items.push(current);
      current = trimmed;
    } else if (current) {
      current += `\n${trimmed}`;
    } else {
      current = trimmed;
    }
  }

  if (current) items.push(current);
  return items;
}

function renderCase(caseNode, out) {
  out.push(`#### ${caseNode.title}`);
  const stepNode = attached(caseNode)[0];
  const expectNode = attached(stepNode)[0];

  out.push("");
  out.push("##### 测试步骤");
  const steps = splitNumberedText(stepNode?.title || "");
  if (steps.length === 0) {
    out.push("1. 待补测试步骤");
  } else {
    out.push(...steps);
  }

  out.push("");
  out.push("##### 预期结果");
  const expects = splitNumberedText(expectNode?.title || "");
  if (expects.length === 0) {
    out.push("1. 待补预期结果");
  } else {
    out.push(...expects);
  }

  out.push("");
}

function renderNotes(noteNode, out) {
  for (const child of attached(noteNode)) {
    out.push(`- ${child.title}`);
  }
  if (attached(noteNode).length > 0) {
    out.push("");
  }
}

function renderLeafList(node, out, level = 3) {
  const prefix = "#".repeat(level);
  out.push(`${prefix} ${node.title}`);
  out.push("");

  for (const child of attached(node)) {
    if (attached(child).length === 0) {
      out.push(`- ${child.title}`);
    } else {
      renderLeafList(child, out, Math.min(level + 1, 6));
    }
  }
  out.push("");
}

function collectCases(node, pathParts = [], bucket = []) {
  if (isCaseNode(node)) {
    bucket.push({
      groupPath: pathParts,
      caseNode: node,
    });
    return bucket;
  }

  for (const child of attached(node)) {
    if (subtreeHasCase(child)) {
      collectCases(child, pathParts.concat(node.title), bucket);
    }
  }
  return bucket;
}

function renderTree(rootTopic) {
  const out = [];
  out.push(`# ${rootTopic.title}`);
  out.push("");

  for (const l2 of attached(rootTopic)) {
    if (l2.title === "+附注") {
      renderNotes(l2, out);
      continue;
    }

    out.push(`## ${l2.title}`);
    out.push("");

    const children = attached(l2);
    const hasCaseDescendants = children.some(subtreeHasCase);

    if (!hasCaseDescendants) {
      for (const child of children) {
        renderLeafList(child, out, 3);
      }
      continue;
    }

    let lastGroupKey = "";
    for (const child of children) {
      if (!subtreeHasCase(child)) {
        renderLeafList(child, out, 3);
        continue;
      }

      const cases = collectCases(child, []);
      for (const entry of cases) {
        const filteredPath = entry.groupPath.filter(Boolean);
        const groupTitle = filteredPath.join(" / ") || child.title;
        if (groupTitle !== lastGroupKey) {
          out.push(`### ${groupTitle}`);
          out.push("");
          lastGroupKey = groupTitle;
        }
        renderCase(entry.caseNode, out);
      }
    }
  }

  return out.join("\n").trimEnd() + "\n";
}

const content = readContentJson(path.resolve(input));
const rootTopic = content[0]?.rootTopic;
if (!rootTopic) {
  throw new Error("Invalid XMind content.json: missing rootTopic");
}

const markdown = renderTree(rootTopic);
fs.writeFileSync(path.resolve(output), markdown, "utf8");
console.log(path.resolve(output));
