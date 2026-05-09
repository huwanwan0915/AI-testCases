#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

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
  node scripts/markdown_to_xmind.js --input "<markdown-path>" --output "<xmind-path>"

Expected markdown structure:
  # 根节点
  - 根节点附注
  ## 一级模块
  ### 二级模块
  #### 用例标题
  ##### 测试步骤
  1. ...
  2. ...
  ##### 预期结果
  1. ...
  2. ...
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

function parseMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const root = {
    title: "",
    notes: [],
    modules: [],
  };

  let currentL2 = null;
  let currentL3 = null;
  let currentCase = null;
  let currentSection = null;
  let pendingInlineSection = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("# ")) {
      root.title = trimmed.slice(2).trim();
      continue;
    }
    if (trimmed.startsWith("## ")) {
      currentL2 = { title: trimmed.slice(3).trim(), children: [] };
      root.modules.push(currentL2);
      currentL3 = null;
      currentCase = null;
      currentSection = null;
      pendingInlineSection = null;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      if (!currentL2) continue;
      currentL3 = { title: trimmed.slice(4).trim(), children: [] };
      currentL2.children.push(currentL3);
      currentCase = null;
      currentSection = null;
      pendingInlineSection = null;
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      if (!currentL3) continue;
      currentCase = {
        title: trimmed.slice(5).trim(),
        steps: [],
        expects: [],
      };
      currentL3.children.push(currentCase);
      currentSection = null;
      pendingInlineSection = null;
      continue;
    }
    if (trimmed.startsWith("##### ")) {
      const sectionName = trimmed.slice(6).trim();
      if (/^测试步骤$/.test(sectionName)) {
        currentSection = "steps";
      } else if (/^预期结果$/.test(sectionName)) {
        currentSection = "expects";
      } else {
        currentSection = null;
      }
      pendingInlineSection = currentSection;
      continue;
    }

    if (!currentCase) {
      if (!currentL2 && /^[-*]\s+/.test(trimmed)) {
        root.notes.push(trimmed.replace(/^[-*]\s+/, ""));
      }
      continue;
    }

    if (!currentSection && pendingInlineSection) {
      currentSection = pendingInlineSection;
    }
    if (!currentSection) {
      currentSection = "steps";
    }

    if (/^[-*]\s+/.test(trimmed) || /^\d+[.)]\s*/.test(trimmed) || /^[a-zA-Z]\.\s*/.test(trimmed)) {
      currentCase[currentSection].push(trimmed.replace(/^[-*]\s+/, ""));
    } else if (currentCase[currentSection].length > 0) {
      currentCase[currentSection][currentCase[currentSection].length - 1] += `\n${trimmed}`;
    } else {
      currentCase[currentSection].push(trimmed);
    }
  }

  return root;
}

function buildXmindTree(parsed) {
  const rootChildren = [];

  if (parsed.notes.length > 0) {
    rootChildren.push(
      topic(
        "+附注",
        parsed.notes.map((note) => topic(note))
      )
    );
  }

  rootChildren.push(...parsed.modules.map((l2) =>
    topic(
      l2.title,
      l2.children.map((l3) =>
        topic(
          l3.title,
          l3.children.map((c) => {
            const stepText = c.steps.join("\n");
            const expectText = c.expects.join("\n");
            return topic(c.title, [
              topic(stepText || "1.待补测试步骤", [
                topic(expectText || "1.待补预期结果"),
              ]),
            ]);
          })
        )
      )
    )
  ));

  return topic(parsed.title || "+未命名测试用例", rootChildren, {
    structureClass: "org.xmind.ui.logic.right",
  });
}

function buildSheet(rootTopic) {
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

function makePackage(content, metadata, manifest, outputPath) {
  const tempDir = fs.mkdtempSync(path.join(require("os").tmpdir(), "md-to-xmind-"));
  try {
    fs.writeFileSync(path.join(tempDir, "content.json"), JSON.stringify(content, null, 2));
    fs.writeFileSync(path.join(tempDir, "metadata.json"), JSON.stringify(metadata, null, 2));
    fs.writeFileSync(path.join(tempDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    const result = spawnSync("zip", ["-qr", outputPath, "."], { cwd: tempDir, encoding: "utf8" });
    if (result.status !== 0) {
      throw new Error(result.stderr || "zip failed");
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

const markdown = fs.readFileSync(path.resolve(input), "utf8");
const parsed = parseMarkdown(markdown);
const rootTopic = buildXmindTree(parsed);
const sheet = buildSheet(rootTopic);
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

makePackage([sheet], metadata, manifest, path.resolve(output));
console.log(path.resolve(output));
