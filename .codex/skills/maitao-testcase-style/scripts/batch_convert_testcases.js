#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const args = process.argv.slice(2);

if (args.includes("--help") || args.length === 0) {
  printHelp();
  process.exit(args.length === 0 ? 1 : 0);
}

let mode = "";
let dir = "";
let overwrite = false;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--mode" && args[i + 1]) {
    mode = args[i + 1];
    i += 1;
  } else if (arg === "--dir" && args[i + 1]) {
    dir = args[i + 1];
    i += 1;
  } else if (arg === "--overwrite") {
    overwrite = true;
  }
}

if (!mode || !dir || !["md-to-xmind", "xmind-to-md"].includes(mode)) {
  printHelp();
  process.exit(1);
}

function printHelp() {
  console.log(`Usage:
  node scripts/batch_convert_testcases.js --mode <md-to-xmind|xmind-to-md> --dir "<directory>" [--overwrite]

Examples:
  node scripts/batch_convert_testcases.js --mode md-to-xmind --dir "testcases"
  node scripts/batch_convert_testcases.js --mode xmind-to-md --dir "testcases" --overwrite
`);
}

function listFiles(targetDir) {
  return fs
    .readdirSync(targetDir)
    .map((name) => path.join(targetDir, name))
    .filter((filePath) => fs.statSync(filePath).isFile())
    .sort();
}

function deriveOutput(filePath) {
  const dirName = path.dirname(filePath);
  const base = path.basename(filePath);

  if (mode === "md-to-xmind") {
    const stem = base.replace(/\.md$/i, "");
    let outName = stem;
    if (!outName.startsWith("+")) {
      outName = `+${outName}`;
    }
    if (!outName.endsWith(".xmind")) {
      outName += ".xmind";
    }
    return path.join(dirName, outName);
  }

  const stem = base.replace(/\.xmind$/i, "");
  return path.join(dirName, `${stem}-导出结构稿.md`);
}

function shouldInclude(filePath) {
  const base = path.basename(filePath);
  if (mode === "md-to-xmind") {
    return /\.md$/i.test(base) && /结构版|结构稿/.test(base);
  }
  return /\.xmind$/i.test(base) && !/-结构稿转换/.test(base);
}

function runnerForMode() {
  const scriptName =
    mode === "md-to-xmind" ? "markdown_to_xmind.js" : "xmind_to_markdown.js";
  return path.join(__dirname, scriptName);
}

const targetDir = path.resolve(dir);
const files = listFiles(targetDir).filter(shouldInclude);
const runner = runnerForMode();

const result = {
  success: [],
  skipped: [],
  failed: [],
};

for (const inputPath of files) {
  const outputPath = deriveOutput(inputPath);

  if (!overwrite && fs.existsSync(outputPath)) {
    result.skipped.push({ inputPath, outputPath, reason: "exists" });
    continue;
  }

  const run = spawnSync("node", [runner, "--input", inputPath, "--output", outputPath], {
    encoding: "utf8",
  });

  if (run.status === 0) {
    result.success.push({ inputPath, outputPath });
  } else {
    result.failed.push({
      inputPath,
      outputPath,
      error: (run.stderr || run.stdout || "").trim(),
    });
  }
}

console.log(`mode=${mode}`);
console.log(`dir=${targetDir}`);
console.log(`success=${result.success.length}`);
console.log(`skipped=${result.skipped.length}`);
console.log(`failed=${result.failed.length}`);

if (result.success.length > 0) {
  console.log("\n[SUCCESS]");
  for (const item of result.success) {
    console.log(`${item.inputPath} -> ${item.outputPath}`);
  }
}

if (result.skipped.length > 0) {
  console.log("\n[SKIPPED]");
  for (const item of result.skipped) {
    console.log(`${item.inputPath} -> ${item.outputPath} (${item.reason})`);
  }
}

if (result.failed.length > 0) {
  console.log("\n[FAILED]");
  for (const item of result.failed) {
    console.log(`${item.inputPath} -> ${item.outputPath}`);
    if (item.error) {
      console.log(item.error);
    }
  }
}
