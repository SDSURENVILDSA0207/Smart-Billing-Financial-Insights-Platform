import { getModuleFromPath, moduleTitle } from "./context";
import { GLOSSARY, MODULE_HELP } from "./knowledge";
import type { CopilotModule, CopilotReply } from "./types";

type NavRule = { test: RegExp; path: string; confirm: string };

const NAV_RULES: NavRule[] = [
  { test: /^(go to|open|take me to|show me)\s*(the\s*)?(home|overview|dashboard)\b/i, path: "/dashboard", confirm: "Opening Overview." },
  { test: /\b(go to|open|take me to|show)\s*(the\s*)?invoices?\b/i, path: "/invoices", confirm: "Opening the invoice register." },
  { test: /\b(new invoice|create (an )?invoice|make (an )?invoice)\b/i, path: "/invoices/new", confirm: "Opening new invoice." },
  { test: /\b(go to|open|take me to)\s*(the\s*)?customers?\b/i, path: "/customers", confirm: "Opening Customers." },
  { test: /\b(go to|open|take me to)\s*(the\s*)?payments?\b/i, path: "/payments", confirm: "Opening Payments." },
  { test: /\b(go to|open|take me to)\s*(the\s*)?(risk\s*)?alerts?\b/i, path: "/alerts", confirm: "Opening Alerts." },
  { test: /\b(go to|open|take me to)\s*(the\s*)?(insights|analytics)\b/i, path: "/insights", confirm: "Opening Insights." },
  { test: /\b(go to|open|take me to)\s*(the\s*)?(assistant|briefing)\b/i, path: "/assistant", confirm: "Opening Assistant." },
  { test: /\b(unpaid invoices?|invoices? not paid|show unpaid)\b/i, path: "/invoices", confirm: "Opening invoices — use the status filter for unpaid." },
  { test: /\b(overdue payments?|overdue invoices?|show overdue)\b/i, path: "/payments", confirm: "Opening Payments — filter by status or check Alerts for risk." }
];

function explainModule(pathname: string): CopilotReply {
  const mod = getModuleFromPath(pathname);
  const h = MODULE_HELP[mod];
  const lines = [
    `**${h.headline}**`,
    "",
    h.summary,
    "",
    ...h.bullets.map((b) => `• ${b}`),
    "",
    "Suggested next steps — use the buttons below or ask another question."
  ];
  return {
    text: lines.join("\n"),
    actions: h.nextSteps
  };
}

function glossaryAnswer(q: string): CopilotReply | null {
  const lower = q.toLowerCase().trim();
  if (/^(go to|open|take me|show me|navigate)\b/i.test(q)) return null;
  const looksLikeQuestion =
    /what (is|does)|explain|meaning|define|tell me (about )?|why (is|does)/i.test(q) || lower.length < 48;
  if (!looksLikeQuestion) return null;
  const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
  for (const term of terms) {
    if (!lower.includes(term)) continue;
    const def = GLOSSARY[term];
    if (!def) continue;
    const title = term
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { text: `**${title}**\n\n${def}` };
  }
  return null;
}

function workflowAnswer(q: string): CopilotReply | null {
  const lower = q.toLowerCase();
  if (/(how (do|to) )?create (an )?invoice|new invoice steps|invoice workflow/i.test(lower)) {
    return {
      text: [
        "**Create an invoice**",
        "",
        "1. Go to **Invoices → New** (or say “open new invoice”).",
        "2. Choose a **customer** (add them under Customers if missing).",
        "3. Enter **line description**, quantity, unit price, unit cost, tax %, and any discount.",
        "4. Review the **estimate** on the right, then **Create & review**.",
        "5. On the invoice page, **record payments** as cash arrives."
      ].join("\n"),
      actions: [
        { label: "Open new invoice", href: "/invoices/new" },
        { label: "Customers", href: "/customers" }
      ]
    };
  }
  if (/(how (do|to) )?add (a )?customer|new customer/i.test(lower)) {
    return {
      text: [
        "**Add a customer**",
        "",
        "1. Open **Customers**.",
        "2. Use the **New account** form (left on desktop): name required, email optional.",
        "3. Click **Save**, then search the directory or start an invoice."
      ].join("\n"),
      actions: [{ label: "Go to Customers", href: "/customers" }]
    };
  }
  if (/how (do|to) (check|find|see|filter) unpaid|unpaid invoices/i.test(lower)) {
    return {
      text: "Open **Invoices**, set **Status** to **Unpaid**, or scan the register — unpaid rows show a clear status badge.",
      actions: [{ label: "Open invoices", href: "/invoices" }]
    };
  }
  if (/how (do|to) (see|check) overdue|overdue payment/i.test(lower)) {
    return {
      text: "Use **Payments** with filters, check **Alerts** for risk-flagged items, or review **Overdue** on the dashboard. Invoice detail shows due date vs balance.",
      actions: [
        { label: "Payments", href: "/payments" },
        { label: "Alerts", href: "/alerts" }
      ]
    };
  }
  if (
    /what (do|should) i fill (in )?first|what (goes|to fill) first|where (do )?i start (the )?invoice/i.test(lower)
  ) {
    return {
      text: [
        "**On the new invoice form**",
        "",
        "1. **Customer** — pick an existing account (add under Customers if needed).",
        "2. **Line** — description, quantity, unit price, unit cost, tax %, discount.",
        "3. Review the **estimate** panel, then save — you’ll land on the invoice to take payments."
      ].join("\n"),
      actions: [
        { label: "Customers", href: "/customers" },
        { label: "Invoice list", href: "/invoices" }
      ]
    };
  }
  if (/revenue|profit|metrics?|what do (the )?cards mean/i.test(lower) && /what|mean|explain|understand/i.test(lower)) {
    return {
      text: [
        "**Dashboard metrics**",
        "",
        "**Revenue** — lifetime invoiced total.",
        "**Profit** — retained profit after costs (engine-calculated).",
        "**Open** — invoices not fully paid.",
        "**Overdue** — not paid and past due date.",
        "",
        "Insights expands this with monthly trends and concentration."
      ].join("\n"),
      actions: [{ label: "Open Insights", href: "/insights" }]
    };
  }
  return null;
}

function tryNavigate(q: string): CopilotReply | null {
  const trimmed = q.trim();
  for (const rule of NAV_RULES) {
    if (rule.test.test(trimmed)) {
      return {
        text: rule.confirm,
        navigateTo: rule.path,
        actions: [{ label: "Go there", href: rule.path }]
      };
    }
  }
  return null;
}

/**
 * Deterministic copilot: navigation + workflows + glossary + page explain — no generic LLM.
 */
export function resolveCopilotQuery(query: string, pathname: string): CopilotReply {
  const q = query.trim();
  if (!q) {
    return { text: "Ask a question or tap a suggestion below." };
  }

  const nav = tryNavigate(q);
  if (nav) return nav;

  const wf = workflowAnswer(q);
  if (wf) return wf;

  const gloss = glossaryAnswer(q);
  if (gloss) return gloss;

  if (
    /^(explain (this|the) (page|screen)|what (is )?this (page|screen)|where am i|help( me)? with this)$/i.test(q) ||
    /explain (the )?dashboard/i.test(q) ||
    (pathname.includes("dashboard") && /what am i (looking at|seeing)/i.test(q))
  ) {
    return explainModule(pathname);
  }

  if (/what (does|is) (the )?(\w+ )?(module|screen)/i.test(q)) {
    return explainModule(pathname);
  }

  if (/^(hi|hello|hey)\b/i.test(q)) {
    const mod = getModuleFromPath(pathname);
    return {
      text: `Hi — you’re on **${moduleTitle(mod)}**. I can explain this screen, walk through a task, or jump to another area. Try a suggestion chip or ask “how do I create an invoice?”`
    };
  }

  return {
    text: [
      "I didn’t match that to a specific guide. Try:",
      "• “Explain this page”",
      "• “How do I create an invoice?”",
      "• “Take me to payments”",
      "• “What is margin?”",
      "",
      `Or I can summarize **${moduleTitle(getModuleFromPath(pathname))}** — say **explain this page**.`
    ].join("\n"),
    actions: MODULE_HELP[getModuleFromPath(pathname)].nextSteps.slice(0, 3)
  };
}

/** Quick prompts shown in the copilot UI — vary by route. */
export function getSuggestedPrompts(pathname: string): string[] {
  const mod = getModuleFromPath(pathname);
  const base = [
    "Explain this page",
    "How do I create an invoice?",
    "Take me to payments"
  ];
  const byModule: Record<CopilotModule, string[]> = {
    dashboard: [
      "Explain this page",
      "What do these metrics mean?",
      "How do I create an invoice?",
      "Take me to unpaid invoices"
    ],
    invoices: [
      "Explain this page",
      "How do I filter unpaid?",
      "Open new invoice",
      "Take me to customers"
    ],
    "invoice-new": [
      "What do I fill in first?",
      "How is profit calculated?",
      "Take me to customers"
    ],
    "invoice-detail": [
      "How do I record a payment?",
      "What is balance vs total?",
      "Take me to payments"
    ],
    customers: [
      "Explain this page",
      "How do I add a customer?",
      "Take me to new invoice"
    ],
    "customer-detail": [
      "Explain this page",
      "What is outstanding?",
      "Create an invoice"
    ],
    payments: [
      "Explain this page",
      "How do I find overdue?",
      "Take me to alerts"
    ],
    alerts: [
      "Explain this page",
      "What is a risk alert?",
      "Take me to payments"
    ],
    insights: [
      "Explain this page",
      "What is concentration?",
      "Take me to assistant"
    ],
    assistant: [
      "What’s the difference from this Guide?",
      "Take me to insights",
      "Explain dashboard"
    ],
    other: base
  };
  return byModule[mod] ?? base;
}
