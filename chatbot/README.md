# MOOV Assistant — customer chat widget for moovlogistics.com

A self-contained chat widget that answers visitor questions about MOOV
Logistics (services, freight forwarding, warehousing, customs, smartMOOV
4PL, tracking, offices…). It never quotes prices — pricing questions get a
friendly explanation that rates are tailored per shipment, plus an email
prompt so the MOOV team can follow up with a personalized quote.

**No backend, no API key, no monthly cost.** One JavaScript file.

## Try it

Open `demo.html` in a browser (or serve the folder with any static server).

## Embed on moovlogistics.com

The site runs on WordPress, so either:

1. **Plugin (easiest):** install a "header/footer scripts" plugin (e.g.
   *WPCode*), paste this into the footer scripts box:

   ```html
   <script src="https://moovlogistics.com/wp-content/uploads/moov-assistant.js" defer></script>
   ```

   after uploading `moov-assistant.js` to the media library / server.

2. **Theme:** add the same `<script>` tag before `</body>` in the theme's
   `footer.php` (use a child theme so updates don't wipe it).

## Where do the leads go?

When a visitor leaves an email, the widget:

- always saves it to `localStorage["moov-assistant-leads"]` (visible in the
  browser only — good for testing), and
- **POSTs it as JSON to `leadEndpoint` if you configure one** — this is the
  production path. Point it at anything that accepts a POST: a Formspree /
  Basin / Zapier webhook URL is the zero-code option, or a small endpoint of
  your own that emails sales@moov…

```html
<script>
  window.MoovChatbotConfig = {
    leadEndpoint: "https://hooks.zapier.com/hooks/catch/XXXX/YYYY", // → email/CRM
    primaryColor: "#0b2545",  // header & user bubbles
    accentColor:  "#f2762e",  // buttons & links — match MOOV brand colors
  };
</script>
<script src="moov-assistant.js" defer></script>
```

Payload: `{ "email": "...", "question": "...", "page": "...", "timestamp": "..." }`

## Editing answers

All content lives in the `INTENTS` array at the top of `moov-assistant.js`.
Each intent has `keywords` (single words), `phrases` (multi-word matches,
weighted higher), an `answer`, and optional quick-reply `chips`. Add or edit
entries there — no other code changes needed.

## Hybrid AI mode (optional)

By default the widget is rule-based: it answers from its built-in knowledge
base and shows a fallback for anything it doesn't recognize. **Hybrid AI
mode** sends those unrecognized questions to a real Claude model instead, so
the bot can handle any phrasing — while pricing questions are still
intercepted client-side and always go to email capture, never to the AI.

To enable it you deploy the small backend in `ai-backend/cloudflare-worker.js`
(it keeps your Anthropic API key server-side — never put an API key in the
widget itself):

1. Get an API key at https://console.anthropic.com (paid per use).
2. Create a free Cloudflare Worker, paste `ai-backend/cloudflare-worker.js`,
   and set the variables described at the top of that file
   (`ANTHROPIC_API_KEY`, `ALLOWED_ORIGINS`).
3. Point the widget at it:

```html
<script>
  window.MoovChatbotConfig = {
    aiEndpoint: "https://moov-assistant.YOUR-SUBDOMAIN.workers.dev",
  };
</script>
```

If the backend is slow, down, or not configured, the widget silently falls
back to its normal behavior — the site never breaks.

**Live site search:** the AI can also search moovlogistics.com in real time
(restricted to that domain only) when its built-in knowledge isn't enough —
so answers stay grounded in what the website actually says, and new site
content is picked up automatically without retraining anything.

**Cost:** the worker defaults to Claude Opus 4.8 (about $0.01–0.03 per
AI-answered question at typical lengths, plus $0.01 per web search when the
AI decides to search the site). Set the `CLAUDE_MODEL` variable to
`claude-haiku-4-5` for roughly 5× cheaper answers if volume grows. Only
unrecognized questions reach the AI — common questions are answered free by
the built-in knowledge base.
