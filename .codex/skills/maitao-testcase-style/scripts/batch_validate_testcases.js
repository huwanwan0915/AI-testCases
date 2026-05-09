#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const args = process.argv.slice(2);

if (args.includes("--help") || args.length === 0) {
  printHelp();
  process.exit(args.length === 0 ? 1 : 0);
}

let dir = "";

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--dir" && args[i + 1]) {
    dir = args[i + 1];
    i += 1;
  }
}

if (!dir) {
  printHelp();
  process.exit(1);
}

function printHelp() {
  console.log(`Usage:
  node scripts/batch_validate_testcases.js --dir "<directory>"

Example:
  node scripts/batch_validate_testcases.js --dir "testcases"
`);
}

function listFiles(targetDir) {
  return fs
    .readdirSync(targetDir)
    .map((name) => path.join(targetDir, name))
    .filter((filePath) => fs.statSync(filePath).isFile())
    .sort();
}

function shouldInclude(filePath) {
  const base = path.basename(filePath);
  if (base === ".DS_Store" || base === "README.md") return false;
  if (/^-/.test(base)) return false;
  if (/-结构稿转换/.test(base)) return false;
  if (/-导出结构稿/.test(base)) return false;
  if (/\.xmind$/i.test(base)) return true;
  if (/\.md$/i.test(base)) {
    return /结构版|结构稿/i.test(base);
  }
  return false;
}

function parseOutput(stdout) {
  const lines = stdout.split(/\r?\n/);
  const meta = {};
  const issues = [];
  let inIssues = false;

  for (const line of lines) {
    if (!line.trim()) continue;
    if (line === "[ISSUES]") {
      inIssues = true;
      continue;
    }
    if (line.startsWith("[OK]")) {
      meta.ok = true;
      continue;
    }
    if (inIssues && line.startsWith("- ")) {
      issues.push(line.slice(2));
      continue;
    }
    const idx = line.indexOf("=");
    if (idx > 0) {
      meta[line.slice(0, idx)] = line.slice(idx + 1);
    }
  }

  return { meta, issues };
}

const targetDir = path.resolve(dir);
const runner = path.join(__dirname, "validate_testcase_structure.js");
const files = listFiles(targetDir).filter(shouldInclude);

const summary = {
  total: files.length,
  ok: 0,
  withIssues: 0,
  failed: 0,
  items: [],
};

for (const filePath of files) {
  const run = spawnSync("node", [runner, "--input", filePath], {
    encoding: "utf8",
  });

  if (run.status !== 0) {
    summary.failed += 1;
    summary.items.push({
      filePath,
      status: "failed",
      issues: [(run.stderr || run.stdout || "").trim() || "validation failed"],
    });
    continue;
  }

  const parsed = parseOutput(run.stdout || "");
  const issueCount = Number(parsed.meta.issue_count || parsed.issues.length || 0);

  if (issueCount > 0) {
    summary.withIssues += 1;
    summary.items.push({
      filePath,
      status: "issues",
      type: parsed.meta.type || "",
      title: parsed.meta.title || "",
      caseCount: parsed.meta.case_count || "",
      issues: parsed.issues,
    });
  } else {
    summary.ok += 1;
    summary.items.push({
      filePath,
      status: "ok",
      type: parsed.meta.type || "",
      title: parsed.meta.title || "",
      caseCount: parsed.meta.case_count || "",
      issues: [],
    });
  }
}

console.log(`dir=${targetDir}`);
console.log(`total=${summary.total}`);
console.log(`ok=${summary.ok}`);
console.log(`with_issues=${summary.withIssues}`);
console.log(`failed=${summary.failed}`);

if (summary.withIssues > 0) {
  console.log("\n[FILES_WITH_ISSUES]");
  for (const item of summary.items.filter((x) => x.status === "issues")) {
    console.log(`${item.filePath}`);
    console.log(`type=${item.type} title=${item.title} case_count=${item.caseCount}`);
    for (const issue of item.issues) {
      console.log(`- ${issue}`);
    }
    console.log("");
  }
}

if (summary.failed > 0) {
  console.log("\n[FAILED]");
  for (const item of summary.items.filter((x) => x.status === "failed")) {
    console.log(`${item.filePath}`);
    for (const issue of item.issues) {
      console.log(`- ${issue}`);
    }
    console.log("");
  }
}
