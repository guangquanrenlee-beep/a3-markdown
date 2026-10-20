/**
 * Generic A3 sheet copy. Section labels and prompts are original.
 * This file does not reproduce Toyota training material.
 */

const LOCALES = {
  en: {
    intro: "A one-page problem-solving sheet. Replace each prompt with facts.",
    owner: "Owner",
    date: "Date",
    theme: "Theme",
    background: "Background",
    backgroundLead: "What led up to this:",
    backgroundPrompts: ["Why this matters:", "Who is affected:", "Why now:"],
    current: "Current Condition",
    currentLead: "What is happening today? Use a place and a number, not an impression.",
    currentPrompts: ["Where:", "What we see:", "How often or how much:", "Since when:"],
    goal: "Goal",
    goalLead: "The result you want, the measure, and the date.",
    goalPrompts: ["Target:", "Measure:", "By when:"],
    analysis: "Analysis",
    analysisLead: "The gap, the causes you can check, and the cause you will act on.",
    analysisPrompts: [
      "Gap:",
      "Possible causes:",
      "What the evidence shows:",
      "Cause to address:",
    ],
    counter: "Countermeasures",
    counterLead: "Changes that remove the cause, not the symptom.",
    counterHeaders: ["Countermeasure", "Cause it addresses", "Owner", "Expected effect"],
    plan: "Plan",
    planLead: "Who does what, by when.",
    planHeaders: ["Action", "Owner", "Due", "Done when"],
    follow: "Follow-up",
    followLead: "How you will know it worked, and what becomes the standard.",
    followPrompts: [
      "When we will check:",
      "Result against the goal:",
      "What becomes the new standard:",
      "What is still open:",
    ],
  },
  zh: {
    intro: "一页纸解决问题。把每处提示换成事实。",
    owner: "负责人",
    date: "日期",
    theme: "主题",
    background: "背景",
    backgroundLead: "事情是怎么到这一步的：",
    backgroundPrompts: ["这件事为什么重要：", "谁受到影响：", "为什么是现在："],
    current: "现状",
    currentLead: "今天实际发生了什么？写地点和数字，不写印象。",
    currentPrompts: ["发生在哪里：", "我们看到什么：", "频率或数量：", "从什么时候开始："],
    goal: "目标",
    goalLead: "想要的结果、衡量方式和日期。",
    goalPrompts: ["目标值：", "衡量指标：", "完成时间："],
    analysis: "分析",
    analysisLead: "写下差距、可以核实的原因，以及准备动手的那一条。",
    analysisPrompts: ["差距：", "可能的原因：", "证据说明了什么：", "要针对的原因："],
    counter: "对策",
    counterLead: "去掉原因的改动，而不是盖住表面现象。",
    counterHeaders: ["对策", "针对的原因", "负责人", "预期效果"],
    plan: "计划",
    planLead: "谁在什么时候做什么。",
    planHeaders: ["行动", "负责人", "期限", "怎样算完成"],
    follow: "跟进",
    followLead: "怎样确认有效，以及哪一项会变成新标准。",
    followPrompts: ["何时检查：", "结果与目标的对比：", "哪一项变成新标准：", "还有什么没关闭："],
  },
};

export const LANGUAGES = Object.keys(LOCALES);

function bullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function table(headers) {
  const head = `| ${headers.join(" | ")} |`;
  const rule = `| ${headers.map(() => "---").join(" | ")} |`;
  const blank = `| ${headers.map(() => " ").join(" | ")} |`;
  return [head, rule, blank].join("\n");
}

function section(heading, body) {
  return `## ${heading}\n\n${body}`;
}

function normalizeProblem(problem) {
  const text = String(problem ?? "").replace(/\r\n/g, "\n").trim();
  const title = text.replace(/\s*\n\s*/g, " ").replace(/[ \t]{2,}/g, " ").trim();
  return { text, title };
}

export function renderA3(problem, lang = "en") {
  const locale = LOCALES[lang];
  if (!locale) {
    throw new Error(`Unknown language: ${lang}`);
  }

  const { text, title } = normalizeProblem(problem);
  if (!text) {
    throw new Error("Problem description is empty.");
  }

  const blocks = [
    `# A3: ${title}`,
    "",
    `_${locale.intro}_`,
    "",
    bullets([`${locale.owner}:`, `${locale.date}:`]),
    "",
    section(locale.theme, title),
    "",
    section(
      locale.background,
      [text, "", locale.backgroundLead, "", bullets(locale.backgroundPrompts)].join("\n"),
    ),
    "",
    section(
      locale.current,
      [locale.currentLead, "", bullets(locale.currentPrompts)].join("\n"),
    ),
    "",
    section(locale.goal, [locale.goalLead, "", bullets(locale.goalPrompts)].join("\n")),
    "",
    section(
      locale.analysis,
      [locale.analysisLead, "", bullets(locale.analysisPrompts)].join("\n"),
    ),
    "",
    section(locale.counter, [locale.counterLead, "", table(locale.counterHeaders)].join("\n")),
    "",
    section(locale.plan, [locale.planLead, "", table(locale.planHeaders)].join("\n")),
    "",
    section(locale.follow, [locale.followLead, "", bullets(locale.followPrompts)].join("\n")),
  ];

  return `${blocks.join("\n")}\n`;
}
