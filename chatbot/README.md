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

## Upgrading to a real LLM later

This widget is rule-based: it only answers what's in its knowledge base,
which means it can never invent prices or wrong facts. If you later want
free-form answers, keep this exact UI and swap `matchIntent()` for a call to
a small backend that queries the Claude API with the site content as
context. The email-capture flow for pricing can stay identical.
