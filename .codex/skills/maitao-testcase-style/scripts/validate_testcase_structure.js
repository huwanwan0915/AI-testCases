#!/usr/bin/env node

// This validator is used with:
// ../references/testcase-hard-checklist.md
// It helps verify the repo's shared testcase structure rules,
// especially the final Coding import hierarchy.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const args = process.argv.slice(2);

if (args.includes("--help") || args.length === 0) {
  printHelp();
  process.exit(args.length === 0 ? 1 : 0);
}

let input = "";

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--input" && args[i + 1]) {
    input = args[i + 1];
    i += 1;
  }
}

if (!input) {
  printHelp();
  process.exit(1);
}

function printHelp() {
  console.log(`Usage:
  node scripts/validate_testcase_structure.js --input "<file-path>"

This validator follows:
  ../references/testcase-hard-checklist.md

Checks focus on:
  - Markdown/XMind testcase structure
  - final hierarchy for Coding import
  - whether a case can still be recognized as 用例名称 -> 测试步骤 -> 预期结果

Supported:
  - Markdown structure draft (.md)
  - XMind file (.xmind)
`);
}

function attached(node) {
  return node?.children?.attached || [];
}

function readXmindRoot(filePath) {
  const raw = execSync(`unzip -p '${filePath.replace(/'/g, "'\\''")}' content.json`, {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
  const content = JSON.parse(raw);
  return content[0]?.rootTopic;
}

function parseMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const result = {
    title: "",
    l2: 0,
    l3: 0,
    cases: [],
    rootNotes: [],
  };

  let currentCase = null;
  let section = "";
  let seenL2 = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("# ")) {
      result.title = trimmed.slice(2).trim();
      continue;
    }
    if (trimmed.startsWith("## ")) {
      result.l2 += 1;
      seenL2 = true;
      currentCase = null;
      section = "";
      continue;
    }
    if (trimmed.startsWith("### ")) {
      result.l3 += 1;
      currentCase = null;
      section = "";
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      currentCase = {
        title: trimmed.slice(5).trim(),
        steps: [],
        expects: [],
      };
      result.cases.push(currentCase);
      section = "";
      continue;
    }
    if (trimmed.startsWith("##### ")) {
      const name = trimmed.slice(6).trim();
      section = name === "测试步骤" ? "steps" : name === "预期结果" ? "expects" : "";
      continue;
    }

    if (!seenL2 && /^[-*]\s+/.test(trimmed)) {
      result.rootNotes.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    }

    if (!currentCase || !section) continue;
    if (/^[-*]\s+/.test(trimmed) || /^\d+[.)）]\s*/.test(trimmed) || /^[a-zA-Z]\.\s*/.test(trimmed)) {
      currentCase[section].push(trimmed.replace(/^[-*]\s+/, ""));
    } else if (currentCase[section].length > 0) {
      currentCase[section][currentCase[section].length - 1] += `\n${trimmed}`;
    } else {
      currentCase[section].push(trimmed);
    }
  }

  return result;
}

function isCaseNode(node) {
  const kids = attached(node);
  if (kids.length !== 1) return false;
  const stepNode = kids[0];
  const stepKids = attached(stepNode);
  if (stepKids.length === 0) return false;
  if (!/^\d+[.)]\s*/.test(stepNode?.title || "")) return false;
  return stepKids.every(isExpectationNode);
}

function isExpectationNode(node) {
  const kids = attached(node);
  if (kids.length === 0) return true;
  return kids.every(isExpectationLeaf);
}

function isExpectationLeaf(node) {
  const kids = attached(node);
  if (kids.length === 0) return true;
  return kids.every(isExpectationLeaf);
}

function collectXmindCases(rootTopic) {
  const cases = [];
  const warnings = [];

  function walk(node, depth = 0) {
    if (isCaseNode(node)) {
      const stepNode = attached(node)[0];
      const expectNodes = attached(stepNode);
      cases.push({
        title: node.title || "",
        steps: stepNode?.title || "",
        expects: expectNodes.map(flattenTopicText).join("\n"),
        expectNodes,
      });
      return;
    }

    const kids = attached(node);
    if (depth >= 3 && kids.length > 0 && !kids.some(isCaseNode)) {
      warnings.push(`非标准分组层级：${node.title}`);
    }
    for (const child of kids) walk(child, depth + 1);
  }

  walk(rootTopic, 0);
  return { cases, warnings };
}

function hasNestedExpectationChildren(node) {
  return attached(node).length > 0;
}

function flattenTopicText(node) {
  const lines = [node?.title || ""];
  for (const child of attached(node)) {
    lines.push(flattenTopicText(child));
  }
  return lines.filter(Boolean).join("\n");
}

function checkCommonText(title, text, issues, field) {
  if (!text.trim()) {
    issues.push(`${title} 缺少${field}`);
  }
  if (text.includes("《》")) {
    issues.push(`${title} 存在空引用《》`);
  }
  if (/待补|TODO|TBD/i.test(text)) {
    issues.push(`${title} 存在待补占位词`);
  }
}

function validateMarkdown(filePath) {
  const parsed = parseMarkdown(fs.readFileSync(filePath, "utf8"));
  const issues = [];

  if (!parsed.title) issues.push("缺少根节点标题（#）");
  if (parsed.l2 === 0) issues.push("缺少一级模块（##）");
  if (parsed.l3 === 0) issues.push("缺少二级模块（###）");
  if (parsed.cases.length === 0) issues.push("缺少用例节点（####）");

  for (const c of parsed.cases) {
    checkCommonText(c.title, c.title, issues, "用例标题");
    checkCommonText(c.title, c.steps.join("\n"), issues, "测试步骤");
    checkCommonText(c.title, c.expects.join("\n"), issues, "预期结果");
  }

  return {
    type: "markdown",
    title: parsed.title,
    caseCount: parsed.cases.length,
    issues,
  };
}

function validateXmind(filePath) {
  const rootTopic = readXmindRoot(filePath);
  const issues = [];

  if (!rootTopic?.title) issues.push("缺少根节点标题");
  const l2 = attached(rootTopic).filter((n) => n.title !== "+附注");
  if (l2.length === 0) issues.push("缺少一级模块");

  const { cases, warnings } = collectXmindCases(rootTopic);
  if (cases.length === 0) issues.push("未识别到标准 case 叶子");

  for (const c of cases) {
    checkCommonText(c.title, c.title, issues, "用例标题");
    checkCommonText(c.title, c.steps, issues, "测试步骤");
    checkCommonText(c.title, c.expects, issues, "预期结果");
    if (c.expectNodes.some(hasNestedExpectationChildren)) {
      issues.push(`${c.title} 的预期结果后存在额外子节点，不符合 Coding 入库叶子节点要求`);
    }
  }

  issues.push(...warnings);

  return {
    type: "xmind",
    title: rootTopic?.title || "",
    caseCount: cases.length,
    issues,
  };
}

const target = path.resolve(input);
const ext = path.extname(target).toLowerCase();
let result;

if (ext === ".md") {
  result = validateMarkdown(target);
} else if (ext === ".xmind") {
  result = validateXmind(target);
} else {
  throw new Error(`Unsupported file type: ${ext}`);
}

console.log(`type=${result.type}`);
console.log(`title=${result.title}`);
console.log(`case_count=${result.caseCount}`);
console.log(`issue_count=${result.issues.length}`);

if (result.issues.length > 0) {
  console.log("\n[ISSUES]");
  for (const issue of result.issues) {
    console.log(`- ${issue}`);
  }
} else {
  console.log("\n[OK] 未发现结构问题");
}
