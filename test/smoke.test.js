import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { execute, parseArgs } from "../src/cli.js";
import { renderA3 } from "../src/render.js";

const bin = fileURLToPath(new URL("../bin/a3-markdown.js", import.meta.url));
const EN_HEADINGS = [
  "Theme",
  "Background",
  "Current Condition",
  "Goal",
  "Analysis",
  "Countermeasures",
  "Plan",
  "Follow-up",
];
const ZH_HEADINGS = ["主题", "背景", "现状", "目标", "分析", "对策", "计划", "跟进"];

function headings(markdown) {
  return [...markdown.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
}

function runBin(args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [bin, ...args], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
    child.stdin.end(input ?? "");
  });
}

test("English sheet uses the eight A3 sections and the problem text", () => {
  const problem = "Line 3 stops too often";
  const markdown = renderA3(problem);

  assert.deepEqual(headings(markdown), EN_HEADINGS);
  assert.match(markdown, /^# A3: Line 3 stops too often\n/);
  assert.match(markdown, /## Theme\n\nLine 3 stops too often\n/);
  assert.match(markdown, /## Background\n\nLine 3 stops too often\n/);
  assert.match(markdown, /\| Countermeasure \| Cause it addresses \| Owner \| Expected effect \|/);
  assert.match(markdown, /\| Action \| Owner \| Due \| Done when \|/);
  assert.equal(markdown.endsWith("\n"), true);
});

test("a multiline problem stays in Background and becomes one title line", () => {
  const markdown = renderA3("Line 3 stops.\nMostly on night shift.");

  assert.match(markdown, /^# A3: Line 3 stops\. Mostly on night shift\.\n/);
  assert.match(markdown, /## Theme\n\nLine 3 stops\. Mostly on night shift\.\n/);
  assert.match(markdown, /## Background\n\nLine 3 stops\.\nMostly on night shift\./);
});

test("Chinese labels stay on the same eight sections", () => {
  const markdown = renderA3("三号线频繁停机", "zh");

  assert.deepEqual(headings(markdown), ZH_HEADINGS);
  assert.match(markdown, /## 主题\n\n三号线频繁停机\n/);
  assert.match(markdown, /## 背景\n\n三号线频繁停机\n/);
  assert.doesNotMatch(markdown, /^## Theme$/m);
});

test("empty problems are rejected", () => {
  assert.throws(() => renderA3("   \n"), /empty/i);
});

test("flags can sit before or after the problem", () => {
  assert.deepEqual(parseArgs(["node", "a3", "--lang", "ZH", "--out", "a3.md", "scrap", "up"]), {
    help: false,
    version: false,
    lang: "zh",
    out: "a3.md",
    problem: "scrap up",
  });
  assert.equal(parseArgs(["node", "a3", "late parts", "--lang=en", "--out=out.md"]).problem, "late parts");
});

test("the bin prints a sheet for a quoted problem", async () => {
  const result = await runBin(["Line 3 stops too often"]);

  assert.equal(result.code, 0);
  assert.equal(result.stderr, "");
  assert.deepEqual(headings(result.stdout), EN_HEADINGS);
  assert.match(result.stdout, /## Theme\n\nLine 3 stops too often\n/);
});

test("stdin fills Theme and Background", async () => {
  const result = await runBin([], "Night shift misses the cutoff\n");

  assert.equal(result.code, 0);
  assert.match(result.stdout, /## Theme\n\nNight shift misses the cutoff\n/);
  assert.match(result.stdout, /## Background\n\nNight shift misses the cutoff\n/);
});

test("--lang zh and --out write a Chinese sheet", async () => {
  const dir = await mkdtemp(join(tmpdir(), "a3-markdown-"));
  const file = join(dir, "sheet.md");
  try {
    const result = await runBin(["--lang", "zh", "--out", file, "三号线频繁停机"]);
    const written = await readFile(file, "utf8");

    assert.equal(result.code, 0);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /Wrote /);
    assert.deepEqual(headings(written), ZH_HEADINGS);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("bad language, unknown flags, and an empty stdin fail", async () => {
  const badLang = await runBin(["--lang", "ja", "a problem"]);
  const unknown = await runBin(["--nope", "a problem"]);
  const empty = await runBin([]);

  assert.equal(badLang.code, 1);
  assert.match(badLang.stderr, /--lang must be en or zh/);
  assert.equal(unknown.code, 1);
  assert.match(unknown.stderr, /Unknown option: --nope/);
  assert.equal(empty.code, 1);
  assert.match(empty.stderr, /empty/i);
});

test("help and version succeed", async () => {
  const help = await runBin(["--help"]);
  const version = await runBin(["--version"]);
  const pkg = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );

  assert.equal(help.code, 0);
  assert.match(help.stdout, /--lang <en\|zh>/);
  assert.match(help.stdout, /--out <file>/);
  assert.equal(version.code, 0);
  assert.equal(version.stdout, `${pkg.version}\n`);
});

test("a terminal with no problem prints usage", async () => {
  let stderr = "";
  const code = await execute({
    argv: ["node", "a3-markdown"],
    isTTY: true,
    stdout: { write() {} },
    stderr: {
      write(chunk) {
        stderr += chunk;
      },
    },
    readStdin: async () => {
      throw new Error("stdin should not be read on a terminal");
    },
  });

  assert.equal(code, 1);
  assert.match(stderr, /Missing problem description/);
  assert.match(stderr, /Usage:/);
});
