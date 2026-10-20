# a3-markdown

Turn a short problem into a one-page A3 problem-solving sheet in Markdown.

```bash
node bin/a3-markdown.js "Line 3 stops too often"
```

The problem text lands in **Theme** and **Background**. The other six sections are empty prompts: Current Condition, Goal, Analysis, Countermeasures, Plan, and Follow-up.

This is the free local CLI for [Lean Shopfloor Coach](https://prodrank.app/lean-shopfloor-coach), a free remote coach MCP for Claude. The CLI writes the sheet. The coach helps you fill it in.

## Install

Requires Node.js 18 or newer. No dependencies.

From this checkout:

```bash
node bin/a3-markdown.js "Scrap on station 4"
```

Put the command on your PATH:

```bash
npm install -g .
a3-markdown "Scrap on station 4"
```

After the package is published to npm:

```bash
npx a3-markdown "Scrap on station 4"
```

## Usage

```text
a3-markdown [options] <problem>
a3-markdown [options]            # read the problem from stdin
```

| Flag | Meaning |
| --- | --- |
| `-l, --lang <en\|zh>` | Section language. Default: `en`. |
| `-o, --out <file>` | Write the sheet to a file. Use `-` for stdout. |
| `-h, --help` | Show help. |
| `-v, --version` | Show the version. |

Words after the flags are joined into one problem. `--` stops flag parsing.

```bash
a3-markdown "Line 3 stops too often"
a3-markdown --lang zh --out a3.md "三号线频繁停机"
printf '%s\n' "Night shift misses the cutoff" | a3-markdown --out night-shift.md
```

From a checkout, prefix those commands with `node bin/a3-markdown.js`, or install locally with `npm install -g .` first.

A title is one line. A multiline problem (typical of stdin) stays intact under Background, and the heading uses the same words on a single line.

## The sheet

Eight sections, in the usual A3 order:

1. Theme
2. Background
3. Current Condition
4. Goal
5. Analysis
6. Countermeasures
7. Plan
8. Follow-up

`a3-markdown "Line 3 stops too often"` prints:

```markdown
# A3: Line 3 stops too often

_A one-page problem-solving sheet. Replace each prompt with facts._

- Owner:
- Date:

## Theme

Line 3 stops too often

## Background

Line 3 stops too often

What led up to this:

- Why this matters:
- Who is affected:
- Why now:

## Current Condition

What is happening today? Use a place and a number, not an impression.

- Where:
- What we see:
- How often or how much:
- Since when:

## Goal

The result you want, the measure, and the date.

- Target:
- Measure:
- By when:

## Analysis

The gap, the causes you can check, and the cause you will act on.

- Gap:
- Possible causes:
- What the evidence shows:
- Cause to address:

## Countermeasures

Changes that remove the cause, not the symptom.

| Countermeasure | Cause it addresses | Owner | Expected effect |
| --- | --- | --- | --- |
|   |   |   |   |

## Plan

Who does what, by when.

| Action | Owner | Due | Done when |
| --- | --- | --- | --- |
|   |   |   |   |

## Follow-up

How you will know it worked, and what becomes the standard.

- When we will check:
- Result against the goal:
- What becomes the new standard:
- What is still open:
```

`--lang zh` uses the same outline with Chinese labels (主题, 背景, 现状, 目标, 分析, 对策, 计划, 跟进).

## Disclaimer

a3-markdown is an independent template generator. It is not affiliated with, endorsed by, or sponsored by Toyota Motor Corporation. "A3" here means the widely used one-page problem-solving layout. The sheet is generic section labels and empty prompts written for this project.

## Lean Shopfloor Coach

When the blank page is the start and you want a coach for the thinking, connect [Lean Shopfloor Coach](https://prodrank.app/lean-shopfloor-coach). It is a free remote coach MCP for Claude: shopfloor practices such as Hoshin, A3, kanban, heijunka, and poka-yoke, used as practical tools.

Remote MCP endpoint:

https://mcp.prodrank.app/lean-shopfloor-coach

Setup steps are on the product page.

## Development

```bash
npm test
```

`npm test` runs `node --test` (also available as `npm run smoke`). The tests check the eight sections, English and Chinese labels, stdin, `--out`, and usage errors.

## License

[MIT](LICENSE)
