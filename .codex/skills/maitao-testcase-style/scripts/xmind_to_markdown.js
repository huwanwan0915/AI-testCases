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
  if (
    kids.length === 1 &&
    kids[0]?.title === "测试步骤" &&
    attached(kids[0]).length === 1 &&
    attached(kids[0])[0] &&
    attached(attached(kids[0])[0]).length === 1 &&
    attached(attached(kids[0])[0])[0]?.title === "预期结果" &&
    attached(attached(attached(kids[0])[0])[0]).length === 1
  ) {
    return true;
  }
  if (kids.length === 2 && kids[0]?.title === "测试步骤" && kids[1]?.title === "预期结果") {
    return true;
  }
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

    const isTopLevelNumber = /^\d+[.)]\s*/.test(trimmed);
    const isLetterBranch = /^[a-zA-Z]\.\s*/.test(trimmed);
    const isCnNumber = /^\d+[）]/.test(trimmed);
    const isBranchDetail = /^[a-zA-Z](?:-\d+)+(?:-[a-zA-Z])?[.)）]\s*/.test(trimmed);

    if (isTopLevelNumber) {
      if (current) items.push(current);
      current = trimmed;
    } else if (isCnNumber) {
      if (current) items.push(current);
      current = trimmed;
    } else if (isBranchDetail) {
      if (current) items.push(current);
      current = trimmed;
    } else if (isLetterBranch) {
      if (current) {
        current += `\n${trimmed}`;
      } else {
        current = trimmed;
      }
    } else if (current) {
      current += `\n${trimmed}`;
    } else {
      current = trimmed;
    }
  }

  if (current) items.push(current);
  return items;
}

function flattenListTopics(node) {
  const lines = [];
  for (const child of attached(node)) {
    lines.push(child.title);
    if (attached(child).length > 0) {
      lines.push(...flattenListTopics(child));
    }
  }
  return lines;
}

function collectNodeLines(node) {
  const lines = [node.title];
  for (const child of attached(node)) {
    lines.push(...collectNodeLines(child));
  }
  return lines;
}

function renderCase(caseNode, out) {
  out.push(`#### ${caseNode.title}`);
  const caseChildren = attached(caseNode);

  out.push("");
  out.push("##### 测试步骤");
  let steps = [];
  let expects = [];

  if (
    caseChildren.length === 1 &&
    caseChildren[0]?.title === "测试步骤" &&
    attached(caseChildren[0]).length === 1 &&
    attached(attached(caseChildren[0])[0]).length === 1 &&
    attached(attached(caseChildren[0])[0])[0]?.title === "预期结果" &&
    attached(attached(attached(caseChildren[0])[0])[0]).length === 1
  ) {
    steps = splitNumberedText(attached(caseChildren[0])[0]?.title || "");
    expects = splitNumberedText(attached(attached(attached(caseChildren[0])[0])[0])[0]?.title || "");
  } else if (caseChildren.length === 1) {
    const stepNode = caseChildren[0];
    steps = splitNumberedText(stepNode?.title || "");
    expects = attached(stepNode).map((child) => collectNodeLines(child).join("\n"));
  } else if (caseChildren.length === 2 && caseChildren[0]?.title === "测试步骤" && caseChildren[1]?.title === "预期结果") {
    steps = flattenListTopics(caseChildren[0]);
    expects = flattenListTopics(caseChildren[1]);
  } else {
    const stepNode = caseChildren[0];
    const expectNode = attached(stepNode)[0];
    steps = splitNumberedText(stepNode?.title || "");
    expects = splitNumberedText(expectNode?.title || "");
  }

  if (steps.length === 0) {
    out.push("1. 待补测试步骤");
  } else {
    out.push(...steps);
  }

  out.push("");
  out.push("##### 预期结果");
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
