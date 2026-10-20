import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LANGUAGES, renderA3 } from "./render.js";

const VERSION = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf8"),
).version;

export const HELP = `a3-markdown — an A3 problem-solving sheet in Markdown

Usage:
  a3-markdown [options] <problem>
  a3-markdown [options]            Read the problem from stdin

Options:
  -l, --lang <en|zh>   Section language (default: en)
  -o, --out <file>     Write the sheet to a file instead of stdout
  -h, --help           Show this help
  -v, --version        Show the version

Examples:
  a3-markdown "Line 3 stops too often"
  a3-markdown --lang zh "三号线频繁停机"
  a3-markdown --out a3.md "Scrap on station 4"
`;

export class CliError extends Error {
  constructor(message) {
    super(message);
    this.name = "CliError";
  }
}

export function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = {
    help: false,
    version: false,
    lang: "en",
    out: null,
    problem: "",
  };
  const words = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--") {
      words.push(...args.slice(i + 1));
      break;
    }

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }

    if (arg === "--version" || arg === "-v" || arg === "-V") {
      parsed.version = true;
      continue;
    }

    if (arg === "--lang" || arg === "-l") {
      const value = args[i + 1];
      if (!value || value.startsWith("-")) {
        throw new CliError("--lang needs en or zh");
      }
      parsed.lang = value;
      i += 1;
      continue;
    }

    if (arg.startsWith("--lang=")) {
      parsed.lang = arg.slice("--lang=".length);
      continue;
    }

    if (arg === "--out" || arg === "-o") {
      const value = args[i + 1];
      if (!value || (value.startsWith("-") && value !== "-")) {
        throw new CliError("--out needs a file path");
      }
      parsed.out = value;
      i += 1;
      continue;
    }

    if (arg.startsWith("--out=")) {
      parsed.out = arg.slice("--out=".length);
      continue;
    }

    if (arg.startsWith("-")) {
      throw new CliError(`Unknown option: ${arg}`);
    }

    words.push(arg);
  }

  parsed.lang = String(parsed.lang || "").toLowerCase();
  parsed.problem = words.join(" ").trim();

  if (parsed.out === "") {
    throw new CliError("--out needs a file path");
  }

  return parsed;
}

async function defaultReadStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function execute({
  argv = process.argv,
  isTTY = Boolean(process.stdin.isTTY),
  stdout = process.stdout,
  stderr = process.stderr,
  readStdin = defaultReadStdin,
  writeTextFile = (file, text) => writeFile(file, text, "utf8"),
} = {}) {
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (error) {
    stderr.write(`${error.message}\n${HELP}`);
    return 1;
  }

  if (parsed.help) {
    stdout.write(HELP);
    return 0;
  }

  if (parsed.version) {
    stdout.write(`${VERSION}\n`);
    return 0;
  }

  if (!LANGUAGES.includes(parsed.lang)) {
    stderr.write(`--lang must be en or zh\n${HELP}`);
    return 1;
  }

  let problem = parsed.problem;
  if (!problem) {
    if (isTTY) {
      stderr.write(`Missing problem description.\n${HELP}`);
      return 1;
    }
    problem = (await readStdin()).trim();
  }

  let markdown;
  try {
    markdown = renderA3(problem, parsed.lang);
  } catch (error) {
    stderr.write(`${error.message}\n${HELP}`);
    return 1;
  }

  if (parsed.out && parsed.out !== "-") {
    try {
      await writeTextFile(parsed.out, markdown);
    } catch (error) {
      stderr.write(`Could not write ${parsed.out}: ${error.message}\n`);
      return 1;
    }
    stderr.write(`Wrote ${parsed.out}\n`);
    return 0;
  }

  stdout.write(markdown);
  return 0;
}
