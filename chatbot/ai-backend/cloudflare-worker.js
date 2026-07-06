/**
 * MOOV Assistant — AI answer backend (Cloudflare Worker)
 * ------------------------------------------------------
 * Answers free-form visitor questions with Claude when the widget's
 * built-in knowledge base doesn't recognize them. Deploy once, then set
 * `aiEndpoint` in the widget config to this worker's URL.
 *
 * Deploy (no build step — paste this file in the Cloudflare dashboard):
 *   1. dash.cloudflare.com → Workers & Pages → Create Worker → paste this code
 *   2. Settings → Variables and Secrets:
 *        ANTHROPIC_API_KEY   (secret)  your key from console.anthropic.com
 *        ALLOWED_ORIGINS     (text)    https://moovlogistics.com
 *        CLAUDE_MODEL        (text)    optional, defaults to claude-opus-4-8;
 *                                      set claude-haiku-4-5 for lower cost
 *   3. Deploy, copy the worker URL into MoovChatbotConfig.aiEndpoint
 *
 * The worker uses raw HTTP against the Claude API so it stays a single
 * dependency-free file you can paste into the dashboard.
 */

const SYSTEM_PROMPT = `You are the MOOV Assistant, the customer chat assistant on moovlogistics.com, the website of MOOV Logistics.

About MOOV Logistics:
- Asia's smart logistics and supply chain management company, operating in China and Malaysia.
- Roots in KLG Europe, a European logistics holding with over 100 years of history (since 1918). MOOV itself started in 2013.
- Headquartered in Shanghai (258 Maoxiang Road, Pudong). Warehouses in 4 major Chinese port cities. Malaysia branch (founded 2025) and a Hong Kong office. Part of a global network of 16 offices in 4 countries.
- Services: freight forwarding (ocean FCL/LCL, air, rail), customs clearance (import & export), warehousing, value-added services (quality inspection, pick & pack, labeling, repair, assembly/kitting), domestic transportation, project cargo handling (oversized/heavy-lift), cargo insurance.
- smartMOOV: MOOV's digital 4PL program and control-tower platform — end-to-end supply chain management, real-time shipment tracking, milestone management with escalations, carrier KPI monitoring, rate subscriptions and contract management. smartMOOV Essentials is the entry-level visibility offering with no significant investment cost.
- Special cargo: cold chain / temperature control, perishables, pharmaceuticals, dangerous goods guidance, high-value goods.
- Industries: virtually all — pharmaceuticals, industrial machinery, perishable food, retail, consumer goods, e-commerce.
- Contact: the form at https://moovlogistics.com/contact-us/ — or the visitor can leave their email in this chat and a MOOV expert will reach out.

Pages you may link to (these are the ONLY URLs you may ever mention, written bare):
- Services overview: https://moovlogistics.com/services-overview/
- Freight forwarding: https://moovlogistics.com/services-overview/freight-forwarding/
- Ocean freight: https://moovlogistics.com/services-overview/freight-forwarding/ocean/
- Air freight: https://moovlogistics.com/services-overview/freight-forwarding/air/
- Rail freight: https://moovlogistics.com/services-overview/freight-forwarding/train/
- Customs clearance: https://moovlogistics.com/services-overview/custom-clearance/
- smartMOOV 4PL program: https://moovlogistics.com/services-overview/smartmoov-4pl-program/
- smartMOOV platform / tracking: https://moovlogistics.com/services-overview/smartmoov-essentials/
- Warehousing: https://moovlogistics.com/value-added-warehousing-services/
- About MOOV: https://moovlogistics.com/who-we-are/
- FAQ: https://moovlogistics.com/faq/
- Knowledge center: https://moovlogistics.com/knowledge-center/
- Contact: https://moovlogistics.com/contact-us/

Rules — follow strictly:
1. NEVER state, estimate, or guess any price, rate, fee, or cost — not even a range or example. Rates are tailored per shipment. If asked about pricing, explain that and invite the visitor to type their email address in the chat so a MOOV expert can send a personalized quote.
2. Only answer questions about MOOV, logistics, shipping, and supply chain topics. For anything else, politely say you can only help with MOOV and logistics questions.
3. Never invent facts about MOOV. If the answer isn't in the knowledge above, use the web_search tool to look it up on moovlogistics.com (search is restricted to that site) and answer from what you find. If the search doesn't settle it either, say so honestly and point to the contact page or offer the email option — do not guess.
4. Be concise: 2 to 4 short sentences. Plain text only — no headings, no lists, no markdown link syntax (write URLs bare; the chat widget makes them clickable). You may use **bold** sparingly.
5. When a page from the list above matches the topic, end your answer by pointing the visitor to it, e.g. "You can read more here: https://moovlogistics.com/services-overview/freight-forwarding/". Never link any URL not in the list, and never invent deeper paths.
6. Be warm and professional. You represent MOOV.`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "*").split(",").map((s) => s.trim()).filter(Boolean);
    const allowOrigin = allowed.includes("*") ? "*" : allowed.includes(origin) ? origin : allowed[0] || "*";
    const cors = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    const json = (obj, status) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
      });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405);
    if (!env.ANTHROPIC_API_KEY) return json({ error: "ANTHROPIC_API_KEY not configured" }, 500);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "invalid JSON" }, 400);
    }

    const question = String(body.question || "").slice(0, 1000).trim();
    if (!question) return json({ error: "empty question" }, 400);

    // Prior turns from the widget, sanitized. Consecutive same-role
    // messages are fine (the API merges them); the first must be "user".
    const messages = [];
    if (Array.isArray(body.history)) {
      for (const turn of body.history.slice(-6)) {
        if (turn && (turn.role === "user" || turn.role === "assistant") && typeof turn.content === "string") {
          messages.push({ role: turn.role, content: turn.content.slice(0, 1000) });
        }
      }
    }
    while (messages.length && messages[0].role !== "user") messages.shift();
    messages.push({ role: "user", content: question });

    // Live retrieval: Claude may search moovlogistics.com (and only that
    // site) when the knowledge in the system prompt isn't enough.
    const tools = [
      {
        type: "web_search_20260209",
        name: "web_search",
        allowed_domains: ["moovlogistics.com"],
        max_uses: 3,
      },
    ];

    // The server runs the search loop; on pause_turn, re-send to resume.
    let reqMessages = messages;
    let data;
    for (let attempt = 0; attempt < 4; attempt++) {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: env.CLAUDE_MODEL || "claude-opus-4-8",
          max_tokens: 1200,
          thinking: { type: "adaptive" },
          output_config: { effort: "low" }, // short FAQ answers; keep latency low
          system: SYSTEM_PROMPT,
          tools,
          messages: reqMessages,
        }),
      });
      if (!resp.ok) return json({ error: "upstream " + resp.status }, 502);
      data = await resp.json();
      if (data.stop_reason !== "pause_turn") break;
      reqMessages = [...reqMessages, { role: "assistant", content: data.content }];
    }

    if (data.stop_reason === "refusal") {
      return json({
        answer:
          "I'd rather not answer that one here — for anything specific, please reach our team via moovlogistics.com/contact-us and they'll help you directly.",
      }, 200);
    }

    const answer = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!answer) return json({ error: "no answer" }, 502);
    return json({ answer }, 200);
  },
};
