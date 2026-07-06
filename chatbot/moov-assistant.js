/*!
 * MOOV Logistics — AI Customer Assistant widget
 * ------------------------------------------------
 * Self-contained chat widget for moovlogistics.com. No dependencies,
 * no backend required. Embed with a single script tag:
 *
 *   <script src="moov-assistant.js" defer></script>
 *
 * Optional configuration (define BEFORE the script tag):
 *
 *   <script>
 *     window.MoovChatbotConfig = {
 *       leadEndpoint: "https://example.com/api/leads", // POST JSON {email, question, page, timestamp}
 *       accentColor: "#f2762e",
 *       primaryColor: "#0b2545",
 *     };
 *   </script>
 *
 * Pricing questions never get a number: the bot explains that rates are
 * tailored per shipment and asks for the visitor's email so the MOOV team
 * can follow up. Captured leads are POSTed to `leadEndpoint` when set and
 * always mirrored to localStorage under "moov-assistant-leads".
 */
(function () {
  "use strict";

  var cfg = Object.assign(
    {
      leadEndpoint: null,
      // Optional hybrid AI mode: URL of a backend that answers free-form
      // questions with a real LLM (see chatbot/ai-backend/). When set,
      // questions the built-in knowledge base doesn't recognize are sent
      // there instead of showing the generic fallback. Pricing questions
      // are still intercepted client-side and never reach the AI.
      aiEndpoint: null,
      primaryColor: "#0b2545",
      accentColor: "#f2762e",
      botName: "MOOV Assistant",
      contactPage: "https://moovlogistics.com/contact-us/",
    },
    window.MoovChatbotConfig || {}
  );

  /* ------------------------------------------------------------------ */
  /* Knowledge base                                                      */
  /* ------------------------------------------------------------------ */
  /* Each intent: keywords (single words, weight 1 unless given) and     */
  /* phrases (substring matches, weight 3). Highest score wins.          */

  var LINK = function (url, label) {
    return '<a href="' + url + '" target="_blank" rel="noopener">' + label + "</a>";
  };

  // Real pages on moovlogistics.com — every answer points to the matching one.
  var PAGES = {
    services: "https://moovlogistics.com/services-overview/",
    forwarding: "https://moovlogistics.com/services-overview/freight-forwarding/",
    ocean: "https://moovlogistics.com/services-overview/freight-forwarding/ocean/",
    air: "https://moovlogistics.com/services-overview/freight-forwarding/air/",
    rail: "https://moovlogistics.com/services-overview/freight-forwarding/train/",
    customs: "https://moovlogistics.com/services-overview/custom-clearance/",
    fourpl: "https://moovlogistics.com/services-overview/smartmoov-4pl-program/",
    essentials: "https://moovlogistics.com/services-overview/smartmoov-essentials/",
    warehousing: "https://moovlogistics.com/value-added-warehousing-services/",
    vas: "https://moovlogistics.com/services/warehousing-2/value-added-logistics-services/",
    digitalWarehouse: "https://moovlogistics.com/services/warehousing/my-digital-warehouse/",
    about: "https://moovlogistics.com/who-we-are/",
    contact: "https://moovlogistics.com/contact-us/",
    faq: "https://moovlogistics.com/faq/",
    knowledge: "https://moovlogistics.com/knowledge-center/",
  };

  function moreLink(url, label) {
    return '<br><br>👉 ' + LINK(url, label);
  }

  var INTENTS = [
    {
      id: "greeting",
      keywords: ["hi", "hello", "hey", "bonjour", "hola", "morning", "afternoon", "evening"],
      phrases: ["good morning", "good afternoon", "good evening"],
      answer: function () {
        return "Hello! 👋 I'm the MOOV Logistics assistant. Ask me about our services — freight forwarding, warehousing, customs clearance, 4PL supply chain management — or anything else about working with MOOV.";
      },
      chips: ["What services do you offer?", "Get a quote", "Track my shipment", "Contact MOOV"],
    },
    {
      id: "services",
      keywords: ["services", "service", "offer", "offers", "solutions", "capabilities", "provide", "help"],
      phrases: ["what do you do", "what can you do", "what does moov do", "what moov does", "list of services", "tell me about your services", "what do you offer"],
      answer: function () {
        return (
          "MOOV covers the full scope of supply chain services:<br><br>" +
          "• <b>Freight forwarding</b> — ocean, air and rail<br>" +
          "• <b>Customs clearance</b> — import &amp; export<br>" +
          "• <b>Warehousing</b> &amp; value-added services (inspection, pick/pack, labeling, assembly)<br>" +
          "• <b>Domestic transportation</b><br>" +
          "• <b>Project cargo handling</b><br>" +
          "• <b>smartMOOV 4PL</b> — end-to-end supply chain management with our digital control tower<br><br>" +
          "See the full overview at " + LINK("https://moovlogistics.com/services-overview/", "moovlogistics.com/services-overview") + ". Which one can I tell you more about?"
        );
      },
      chips: ["Ocean freight", "Air freight", "Warehousing", "smartMOOV 4PL"],
    },
    {
      id: "freight_forwarding",
      keywords: ["forwarding", "forwarder", "forwarders"],
      phrases: ["freight forwarding", "freight forwarder", "what is freight", "whats freight", "forward my freight"],
      answer: function () {
        return (
          "<b>Freight forwarding</b> is the organizing of cargo shipments on behalf of a business: a freight forwarder like MOOV books the space with carriers, prepares the documents, handles customs and tracks the shipment — so you don't have to deal with each carrier and border yourself.<br><br>" +
          "MOOV forwards freight by <b>ocean, air and rail</b>, with customs clearance and cargo insurance included as needed. Which mode are you interested in?" +
          moreLink(PAGES.forwarding, "Read more: Freight forwarding at MOOV")
        );
      },
      chips: ["Ocean freight", "Air freight", "Rail freight", "Get a quote"],
    },
    {
      id: "ocean",
      keywords: ["ocean", "sea", "container", "fcl", "lcl", "vessel", "ship", "shipping", "maritime", "port"],
      phrases: ["sea freight", "ocean freight", "by boat"],
      answer: function () {
        return (
          "MOOV provides ocean freight forwarding for both FCL and LCL shipments, with strong coverage out of China's major port cities where we operate our own warehouses. Value-added options include home delivery, customs clearance and cargo insurance." +
          moreLink(PAGES.ocean, "Read more: Ocean freight")
        );
      },
      chips: ["Get a quote", "Transit times", "Customs clearance"],
    },
    {
      id: "air",
      keywords: ["air", "airfreight", "plane", "flight", "urgent", "express"],
      phrases: ["air freight", "by air", "air cargo"],
      answer: function () {
        return (
          "MOOV offers global air freight solutions for virtually every industry — from pharmaceuticals and industrial machinery to perishable food. We also handle special requirements such as cold chain / temperature control and high-value goods. It's the right choice when speed matters most." +
          moreLink(PAGES.air, "Read more: Air freight")
        );
      },
      chips: ["Get a quote", "Cold chain shipping", "Transit times"],
    },
    {
      id: "rail",
      keywords: ["rail", "train", "railway"],
      phrases: ["rail freight", "by train", "china europe train"],
      answer: function () {
        return (
          "Yes — MOOV forwards freight by rail, a great middle ground between ocean (cheaper, slower) and air (faster, pricier), especially on China–Europe corridors (transit is typically around 20 days terminal to terminal). We can advise on which mode fits your cargo, timeline and budget best." +
          moreLink(PAGES.rail, "Read more: Rail freight")
        );
      },
      chips: ["Get a quote", "Which mode should I choose?"],
    },
    {
      id: "customs",
      keywords: ["customs", "clearance", "duties", "duty", "tariffs", "declaration", "import", "export", "broker"],
      phrases: ["customs clearance", "import tax", "clear customs"],
      answer: function () {
        return (
          "MOOV handles customs clearance for both <b>import and export</b>, with local expert teams that keep your paperwork, HS codes and declarations compliant so your cargo isn't held up at the border. Customs clearance is fully integrated with our freight forwarding and warehousing services." +
          moreLink(PAGES.customs, "Read more: Customs clearance")
        );
      },
      chips: ["Get a quote", "What documents do I need?", "Contact MOOV"],
    },
    {
      id: "warehousing",
      keywords: ["warehouse", "warehousing", "storage", "store", "fulfillment", "fulfilment", "inventory", "stock"],
      phrases: ["store my goods", "storage space"],
      answer: function () {
        return (
          "MOOV operates warehouses in <b>4 major port cities in China</b>, all integrated with our freight forwarding, customs clearance and the smartMOOV control tower — so you get full visibility from origin to delivery.<br><br>" +
          "On top of storage we offer value-added services: quality inspection, pick &amp; pack, labeling, repair and assembly." +
          moreLink(PAGES.warehousing, "Read more: Warehousing at MOOV")
        );
      },
      chips: ["Value-added services", "Get a quote", "Where are your warehouses?"],
    },
    {
      id: "vas",
      keywords: ["labeling", "labelling", "label", "kitting", "assembly", "assembling", "repack", "inspection", "repair"],
      phrases: ["value added", "value-added", "pick and pack", "pick/pack", "quality inspection"],
      answer: function () {
        return (
          "Our value-added logistics services are tailored to your products, channels and supply chain model. They include:<br><br>" +
          "• Quality inspection<br>• Pick &amp; pack<br>• Labeling<br>• Repair<br>• Assembling / kitting<br><br>" +
          "Everything runs inside MOOV warehouses and is visible in the smartMOOV platform." +
          moreLink(PAGES.vas, "Read more: Value-added services")
        );
      },
      chips: ["Warehousing", "Get a quote"],
    },
    {
      id: "fourpl",
      keywords: ["4pl", "3pl", "smartmoov", "outsource", "outsourcing", "orchestration"],
      phrases: ["supply chain management", "control tower", "manage my supply chain", "4pl program", "what is 4pl", "what is a 4pl", "what does 4pl mean"],
      answer: function () {
        return (
          "<b>smartMOOV</b> is our 4PL program: MOOV becomes the single point of contact that plans, executes and optimizes your entire supply chain — orders, bookings, carriers, warehousing and customs — through one digital control tower.<br><br>" +
          "You get milestone tracking with built-in escalation, carrier KPI monitoring, contract &amp; rate management, and full end-to-end visibility." +
          moreLink(PAGES.fourpl, "Read more: smartMOOV 4PL program")
        );
      },
      chips: ["smartMOOV Essentials", "Get a quote", "Digital platform"],
    },
    {
      id: "essentials",
      keywords: ["essentials"],
      phrases: ["smartmoov essentials"],
      answer: function () {
        return (
          "<b>smartMOOV Essentials</b> gives you transparency and visibility over your shipments <i>without significant investment costs</i>. Orders are uploaded online, every party completes its milestones (cargo ready dates, quality inspections…), reminders and escalations keep things on time, and you can monitor bookings, carrier schedules and KPI performance in one place." +
          moreLink(PAGES.essentials, "Read more: smartMOOV Essentials")
        );
      },
      chips: ["smartMOOV 4PL", "Get a quote"],
    },
    {
      id: "tracking",
      keywords: ["track", "tracking", "trace", "status", "eta", "located", "follow", "locate"],
      phrases: ["where is my", "where s my", "track my", "track a shipment", "how do i track", "how can i track", "shipment status", "order status", "my cargo", "my container", "my shipment", "my order", "follow my"],
      answer: function () {
        return (
          "You can follow your cargo in real time on the <b>smartMOOV platform</b> — live vessel &amp; shipment tracking from origin to destination, milestone alerts and document sharing: " +
          LINK(PAGES.essentials, "see how smartMOOV tracking works") + ".<br><br>" +
          "If you're an existing customer, log in with your smartMOOV account. No access yet? " +
          LINK(PAGES.contact, "Reach out to our team") + " and we'll set you up."
        );
      },
      chips: ["Digital platform", "Contact MOOV"],
    },
    {
      id: "project_cargo",
      keywords: ["oversized", "breakbulk", "heavy"],
      phrases: ["project cargo", "heavy lift", "out of gauge", "special project"],
      answer: function () {
        return (
          "MOOV handles <b>project cargo</b> — oversized, heavy-lift and out-of-gauge shipments that need special planning, equipment and routing. Our team engineers the move end to end, including permits and multimodal legs. Tell us about your cargo and we'll design the solution." +
          moreLink(PAGES.services, "Read more: MOOV services")
        );
      },
      chips: ["Get a quote", "Contact MOOV"],
    },
    {
      id: "special_cargo",
      keywords: ["perishable", "perishables", "pharma", "pharmaceutical", "refrigerated", "reefer", "frozen", "fragile", "hazardous", "dangerous"],
      phrases: ["cold chain", "temperature control", "temperature controlled", "dangerous goods"],
      answer: function () {
        return (
          "Yes — MOOV handles special shipping requirements including <b>cold chain / temperature-controlled</b> cargo, perishable goods, pharmaceuticals and high-value objects. Share the details of your cargo and our specialists will recommend the right setup." +
          moreLink(PAGES.air, "Read more: Air freight & special cargo")
        );
      },
      chips: ["Air freight", "Get a quote"],
    },
    {
      id: "about",
      keywords: ["company", "history", "founded", "klg", "background", "story"],
      phrases: ["who are you", "who is moov", "about moov", "about your company", "about the company", "your company", "how long have", "how old is"],
      answer: function () {
        return (
          "MOOV is Asia's smart logistics and supply chain management company. We trace our roots to <b>KLG Europe</b>, a European logistics holding with over 100 years of history (since 1918). MOOV itself started in <b>2013</b> as an innovative company continuing that legacy — combining a century of logistics experience with modern digital solutions.<br><br>" +
          "Today MOOV is headquartered in Shanghai, operates warehouses in 4 major Chinese port cities, and is part of a global network of 16 offices in 4 countries." +
          moreLink(PAGES.about, "Read more: Who we are")
        );
      },
      chips: ["Where are your offices?", "What services do you offer?"],
    },
    {
      id: "locations",
      keywords: ["office", "offices", "location", "locations", "china", "malaysia", "shanghai", "asia", "address", "based", "headquarters", "hq"],
      phrases: ["where are you", "hong kong", "where is moov"],
      answer: function () {
        return (
          "MOOV is headquartered in <b>Shanghai, China</b> (258 Maoxiang Road, Pudong) and operates warehouses in 4 major Chinese port cities. We also have a <b>Malaysia</b> branch and a <b>Hong Kong</b> office, and we're part of a global network of 16 offices across 4 countries — so we can move your cargo worldwide.<br><br>" +
          "Full contact details: " + LINK(cfg.contactPage, "Contact us") + "."
        );
      },
      chips: ["Contact MOOV", "What services do you offer?"],
    },
    {
      id: "contact",
      keywords: ["contact", "phone", "call", "reach", "human", "agent", "person", "representative", "sales", "someone"],
      phrases: ["talk to", "speak to", "speak with", "real person", "contact us", "get in touch", "email address"],
      answer: function () {
        return (
          "Of course! The fastest way to reach the MOOV team is through the contact form at " +
          LINK(cfg.contactPage, "moovlogistics.com/contact-us") + " — the team gets back to you quickly.<br><br>" +
          "Or leave your email address right here in the chat and a MOOV expert will contact <i>you</i> instead. 📩"
        );
      },
      captureEmail: true,
      chips: ["Leave my email"],
    },
    {
      id: "pricing",
      keywords: ["price", "prices", "pricing", "cost", "costs", "rate", "rates", "quote", "quotation", "fee", "fees", "charge", "charges", "tariff", "budget", "cheap", "cheaper", "expensive", "discount"],
      phrases: ["how much", "get a quote", "price list", "what does it cost", "what would it cost", "ballpark", "shipping cost", "cost of shipping", "the cost", "cost to", "cost for", "cost of", "the price", "a price", "price to", "price for", "price of", "rate for", "rates for", "quote for", "quote me", "need a quote", "request a quote", "an estimate"],
      weight: 2, // pricing wins ties — it's the money question
      answer: function () {
        return (
          "Great question — pricing at MOOV isn't fixed: every rate is <b>tailored to your shipment</b> (mode, route, volume, cargo type and service level), so I can't give you a number here without misleading you.<br><br>" +
          "But I can do one better: <b>type your email address below</b> and a MOOV expert will contact you with a personalized quote. 📩"
        );
      },
      captureEmail: true,
      chips: [],
    },
    {
      id: "transit",
      keywords: ["fast", "faster", "quickest", "slow", "duration", "delay"],
      phrases: ["how long", "transit time", "lead time", "delivery time", "how many days", "how quickly"],
      answer: function () {
        return (
          "Transit times depend on the mode and route. As a rule of thumb: <b>air</b> is the fastest (days), <b>rail</b> is the middle ground (~20 days China–Europe), and <b>ocean</b> is the most economical (several weeks). Exact schedules vary by corridor and carrier.<br><br>" +
          "Tell me your origin, destination and cargo — or leave your email — and our team will give you precise options." +
          moreLink(PAGES.forwarding, "Compare modes: Freight forwarding")
        );
      },
      chips: ["Get a quote", "Which mode should I choose?"],
    },
    {
      id: "mode_choice",
      keywords: [],
      phrases: ["which mode", "right logistics method", "best way to ship", "ocean or air", "air or ocean", "rail or ocean", "which is better"],
      answer: function () {
        return (
          "It depends on what matters most for this shipment:<br><br>" +
          "• <b>Air</b> — fastest, best for urgent, high-value or perishable goods<br>" +
          "• <b>Rail</b> — good balance of speed and cost (e.g. China–Europe)<br>" +
          "• <b>Ocean</b> — most economical for large volumes when time allows<br><br>" +
          "MOOV's team can compare options for your exact route and cargo — leave your email and we'll send you a tailored recommendation." +
          moreLink(PAGES.forwarding, "Compare modes: Freight forwarding")
        );
      },
      chips: ["Get a quote", "Transit times"],
    },
    {
      id: "digital",
      keywords: ["platform", "software", "digital", "app", "portal", "dashboard", "visibility", "analytics", "technology", "system"],
      phrases: ["it solutions", "your platform"],
      answer: function () {
        return (
          "MOOV develops and runs its own digital IT solutions to streamline communication, information and process flow. The <b>smartMOOV platform</b> gives you real-time tracking, analytics, milestone management with escalations, carrier schedules, rate subscriptions and contract management — designed to support your business, not complicate it, and set up to fit <i>your</i> supply chain." +
          moreLink(PAGES.essentials, "Read more: the smartMOOV platform")
        );
      },
      chips: ["smartMOOV 4PL", "Track my shipment"],
    },
    {
      id: "insurance",
      keywords: ["insurance", "insure", "insured", "damaged", "damage", "lost", "claim", "claims"],
      phrases: ["cargo insurance"],
      answer: function () {
        return (
          "Yes, MOOV offers <b>cargo insurance</b> as a value-added service alongside freight forwarding, so your goods are protected door to door. For a claim or an insurance question on an existing shipment, please " +
          LINK(cfg.contactPage, "contact our team") + " and we'll take care of it."
        );
      },
      chips: ["Get a quote", "Contact MOOV"],
    },
    {
      id: "documents",
      keywords: ["documents", "document", "paperwork", "invoice", "certificate"],
      phrases: ["what documents", "bill of lading", "packing list"],
      answer: function () {
        return (
          "Typical shipment documents include the commercial invoice, packing list, bill of lading (or air waybill) and, depending on the cargo and destination, certificates of origin or product certificates. Don't worry — MOOV's customs and forwarding teams guide you through exactly what's needed for your shipment and destination." +
          moreLink(PAGES.customs, "Read more: Customs clearance")
        );
      },
      chips: ["Customs clearance", "Contact MOOV"],
    },
    {
      id: "domestic",
      keywords: ["trucking", "truck", "domestic", "inland", "distribution", "haulage", "delivery"],
      phrases: ["domestic transportation", "domestic transport", "last mile", "inland transport", "local delivery", "door to door", "trucking", "by truck", "by road"],
      answer: function () {
        return (
          "MOOV handles <b>domestic transportation</b> too — mature domestic trucking and distribution that connect our warehouses, the ports and your final destinations, fully integrated with our freight forwarding and customs services so one partner covers the whole door-to-door move." +
          moreLink(PAGES.services, "Read more: MOOV services")
        );
      },
      chips: ["Warehousing", "Get a quote"],
    },
    {
      id: "ecommerce",
      keywords: ["ecommerce", "e-commerce", "amazon", "shopify", "b2c", "marketplace", "webshop", "dropshipping"],
      phrases: ["online store", "online shop", "e commerce"],
      answer: function () {
        return (
          "Yes — MOOV supports e-commerce supply chains. Our warehouses in China's major port cities handle <b>fulfillment-style operations</b>: storage, quality inspection, pick &amp; pack, labeling and kitting, connected to ocean, air and rail freight for replenishment. Tell us about your channels and volumes and we'll design the right setup." +
          moreLink(PAGES.warehousing, "Read more: Warehousing & fulfillment")
        );
      },
      chips: ["Warehousing", "Get a quote"],
    },
    {
      id: "industries",
      keywords: ["industries", "industry", "automotive", "electronics", "fashion", "retail", "machinery", "food", "textile", "furniture"],
      phrases: ["what industries", "which industries", "do you work with", "experience with"],
      answer: function () {
        return (
          "MOOV serves virtually every industry — from <b>pharmaceuticals</b> and <b>industrial machinery</b> to <b>perishable food</b>, retail and consumer goods. Each supply chain gets a tailored setup rather than a one-size-fits-all approach: we take time to understand your products and channels first." +
          moreLink(PAGES.services, "Read more: MOOV services")
        );
      },
      chips: ["What services do you offer?", "Get a quote"],
    },
    {
      id: "getting_started",
      keywords: ["start", "started", "onboard", "onboarding", "account", "register", "signup"],
      phrases: ["get started", "how do i start", "work with you", "work with moov", "become a customer", "become a client", "open an account", "how does it work", "next step"],
      answer: function () {
        return (
          "Getting started is simple: tell us about your supply chain — routes, volumes, cargo — and a MOOV expert designs a proposal around it. <b>Leave your email below</b> and we'll reach out to you, or use the form at " +
          LINK(cfg.contactPage, "moovlogistics.com/contact-us") + "."
        );
      },
      captureEmail: true,
      chips: [],
    },
    {
      id: "thanks",
      keywords: ["thanks", "thank", "merci", "great", "perfect", "awesome", "helpful"],
      phrases: ["thank you"],
      answer: function () {
        return "You're welcome! 😊 Anything else I can help you with?";
      },
      chips: ["What services do you offer?", "Get a quote", "Contact MOOV"],
    },
    {
      id: "bye",
      keywords: ["bye", "goodbye", "ciao"],
      phrases: ["see you", "that's all"],
      answer: function () {
        return "Thanks for chatting with MOOV Logistics — have a great day! 🚢 Come back anytime.";
      },
      chips: [],
    },
  ];

  var FALLBACK_CHIPS = ["What services do you offer?", "Get a quote", "Track my shipment", "Contact MOOV"];

  function fallbackAnswer() {
    return (
      "I'm not sure I got that — I'm best at questions about MOOV's services, shipping, warehousing, customs, tracking and quotes.<br><br>" +
      "You can try one of the topics below, browse our " + LINK(PAGES.faq, "FAQ") + ", or leave your <b>email address</b> and a member of our team will personally answer your question."
    );
  }

  /* ------------------------------------------------------------------ */
  /* Intent matching                                                     */
  /* ------------------------------------------------------------------ */

  var EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

  function matchIntent(text) {
    var lower = " " + text.toLowerCase().replace(/[^a-z0-9@.\s-]/g, " ").replace(/\s+/g, " ") + " ";
    // token set with light plural/singular normalization so
    // "containers", "warehouses", "rates" hit their singular keywords
    var tokens = {};
    lower.trim().split(" ").forEach(function (t) {
      tokens[t] = true;
      if (t.length > 3 && t.slice(-1) === "s") tokens[t.slice(0, -1)] = true;
    });
    var best = null;
    var bestScore = 0;
    INTENTS.forEach(function (intent) {
      var score = 0;
      var w = intent.weight || 1;
      (intent.phrases || []).forEach(function (p) {
        if (lower.indexOf(p) !== -1) score += 3 * w;
      });
      (intent.keywords || []).forEach(function (k) {
        if (tokens[k] || tokens[k + "s"]) score += 1 * w;
      });
      // Pricing wins ties: never quote a canned service answer when the
      // visitor is asking about money.
      if (score > bestScore || (score === bestScore && score > 0 && intent.id === "pricing")) {
        bestScore = score;
        best = intent;
      }
    });
    if (!best) return null;
    // With an AI backend available, only trust weak matches (one keyword,
    // no phrase) on short messages — a lone keyword buried in a long
    // sentence is better answered by the AI than by a canned reply.
    var wordCount = lower.trim().split(" ").length;
    if (cfg.aiEndpoint && bestScore < 2 && wordCount > 4) return null;
    return best;
  }

  /* ------------------------------------------------------------------ */
  /* Lead capture                                                        */
  /* ------------------------------------------------------------------ */

  function saveLead(email, question) {
    var lead = {
      email: email,
      question: question || "(general inquiry)",
      page: location.href,
      timestamp: new Date().toISOString(),
    };
    try {
      var all = JSON.parse(localStorage.getItem("moov-assistant-leads") || "[]");
      all.push(lead);
      localStorage.setItem("moov-assistant-leads", JSON.stringify(all));
    } catch (e) {
      /* storage unavailable — endpoint below is the primary channel */
    }
    if (cfg.leadEndpoint) {
      try {
        fetch(cfg.leadEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead),
        }).catch(function () {});
      } catch (e) {}
    }
  }

  /* ------------------------------------------------------------------ */
  /* UI                                                                  */
  /* ------------------------------------------------------------------ */

  var css =
    ":root{--moov-primary:" + cfg.primaryColor + ";--moov-accent:" + cfg.accentColor + ";}" +
    "#moov-assistant *{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;}" +
    "#moov-assistant{position:fixed;bottom:24px;right:24px;z-index:2147483000;}" +
    "#moov-bubble{width:60px;height:60px;border-radius:50%;background:var(--moov-primary);color:#fff;border:none;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;transition:transform .15s ease;}" +
    "#moov-bubble:hover{transform:scale(1.07);}" +
    "#moov-bubble svg{width:30px;height:30px;fill:#fff;}" +
    "#moov-bubble .moov-badge{position:absolute;top:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:var(--moov-accent);border:2px solid #fff;}" +
    "#moov-panel{position:absolute;bottom:76px;right:0;width:372px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,.3);display:none;flex-direction:column;overflow:hidden;}" +
    "#moov-panel.moov-open{display:flex;animation:moov-pop .18s ease;}" +
    "@keyframes moov-pop{from{opacity:0;transform:translateY(12px) scale(.97);}to{opacity:1;transform:none;}}" +
    ".moov-header{background:var(--moov-primary);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;}" +
    ".moov-header .moov-avatar{width:38px;height:38px;border-radius:50%;background:var(--moov-accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;color:#fff;flex-shrink:0;}" +
    ".moov-header h3{font-size:15px;font-weight:600;line-height:1.2;}" +
    ".moov-header p{font-size:11.5px;opacity:.75;}" +
    ".moov-header .moov-close{margin-left:auto;background:none;border:none;color:#fff;cursor:pointer;font-size:22px;line-height:1;opacity:.8;padding:4px;}" +
    ".moov-header .moov-close:hover{opacity:1;}" +
    ".moov-messages{flex:1;overflow-y:auto;padding:16px;background:#f4f6fa;display:flex;flex-direction:column;gap:10px;}" +
    ".moov-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:13.5px;line-height:1.5;word-wrap:break-word;}" +
    ".moov-msg.bot{background:#fff;color:#1c2b3a;border-bottom-left-radius:4px;align-self:flex-start;box-shadow:0 1px 3px rgba(0,0,0,.08);}" +
    ".moov-msg.user{background:var(--moov-primary);color:#fff;border-bottom-right-radius:4px;align-self:flex-end;}" +
    ".moov-msg a{color:var(--moov-accent);font-weight:600;text-decoration:none;}" +
    ".moov-msg a:hover{text-decoration:underline;}" +
    ".moov-typing{display:flex;gap:4px;padding:12px 14px;background:#fff;border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start;box-shadow:0 1px 3px rgba(0,0,0,.08);}" +
    ".moov-typing span{width:7px;height:7px;border-radius:50%;background:#b9c3d0;animation:moov-blink 1.2s infinite;}" +
    ".moov-typing span:nth-child(2){animation-delay:.2s;}.moov-typing span:nth-child(3){animation-delay:.4s;}" +
    "@keyframes moov-blink{0%,80%,100%{opacity:.3;}40%{opacity:1;}}" +
    ".moov-chips{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start;max-width:95%;}" +
    ".moov-chip{background:#fff;border:1.5px solid var(--moov-accent);color:var(--moov-accent);border-radius:999px;padding:6px 12px;font-size:12.5px;font-weight:600;cursor:pointer;transition:background .12s,color .12s;}" +
    ".moov-chip:hover{background:var(--moov-accent);color:#fff;}" +
    ".moov-inputrow{display:flex;gap:8px;padding:12px;border-top:1px solid #e6eaf0;background:#fff;flex-shrink:0;}" +
    ".moov-inputrow input{flex:1;border:1.5px solid #d7dde6;border-radius:999px;padding:10px 15px;font-size:13.5px;outline:none;}" +
    ".moov-inputrow input:focus{border-color:var(--moov-accent);}" +
    ".moov-inputrow.moov-email-mode input{border-color:var(--moov-accent);background:#fff8f3;}" +
    ".moov-inputrow button{width:42px;height:42px;border-radius:50%;border:none;background:var(--moov-accent);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}" +
    ".moov-inputrow button:hover{filter:brightness(1.08);}" +
    ".moov-inputrow button svg{width:18px;height:18px;fill:#fff;}" +
    ".moov-powered{text-align:center;font-size:10.5px;color:#9aa6b5;padding:0 0 8px;background:#fff;flex-shrink:0;}" +
    "@media (max-width:480px){#moov-panel{width:calc(100vw - 16px);right:-8px;height:calc(100vh - 110px);}}";

  var SEND_ICON = '<svg viewBox="0 0 24 24"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
  var CHAT_ICON = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 9h10a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2zm6 5H7a1 1 0 1 1 0-2h6a1 1 0 1 1 0 2z"/></svg>';

  var state = {
    open: false,
    awaitingEmail: false,
    pendingQuestion: null,
    emailNudges: 0,
    started: false,
    history: [], // last few turns, sent to the AI backend for context
  };

  function remember(role, text) {
    state.history.push({ role: role, content: text });
    if (state.history.length > 8) state.history.shift();
  }

  var els = {};

  function build() {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var root = document.createElement("div");
    root.id = "moov-assistant";
    root.innerHTML =
      '<div id="moov-panel" role="dialog" aria-label="MOOV Logistics chat assistant">' +
      '  <div class="moov-header">' +
      '    <div class="moov-avatar">M</div>' +
      "    <div><h3>" + cfg.botName + "</h3><p>MOOV Logistics · typically replies instantly</p></div>" +
      '    <button class="moov-close" aria-label="Close chat">&times;</button>' +
      "  </div>" +
      '  <div class="moov-messages" aria-live="polite"></div>' +
      '  <form class="moov-inputrow">' +
      '    <input type="text" placeholder="Ask me anything about MOOV…" aria-label="Your message" autocomplete="off"/>' +
      '    <button type="submit" aria-label="Send">' + SEND_ICON + "</button>" +
      "  </form>" +
      '  <div class="moov-powered">AI assistant — answers are informational; our team confirms all details</div>' +
      "</div>" +
      '<button id="moov-bubble" aria-label="Open MOOV Logistics chat">' + CHAT_ICON + '<span class="moov-badge"></span></button>';
    document.body.appendChild(root);

    els.panel = root.querySelector("#moov-panel");
    els.bubble = root.querySelector("#moov-bubble");
    els.messages = root.querySelector(".moov-messages");
    els.form = root.querySelector(".moov-inputrow");
    els.input = root.querySelector(".moov-inputrow input");
    els.close = root.querySelector(".moov-close");

    els.bubble.addEventListener("click", toggle);
    els.close.addEventListener("click", toggle);
    els.form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = els.input.value.trim();
      if (!text) return;
      els.input.value = "";
      handleUserMessage(text);
    });
  }

  function toggle() {
    state.open = !state.open;
    els.panel.classList.toggle("moov-open", state.open);
    if (state.open) {
      els.input.focus();
      if (!state.started) {
        state.started = true;
        botSay(
          "Hi there! 👋 Welcome to <b>MOOV Logistics</b>. I can answer your questions about freight forwarding, warehousing, customs, tracking, our smartMOOV 4PL program and more.<br><br>What can I help you with today?",
          ["What services do you offer?", "Get a quote", "Track my shipment", "Contact MOOV"]
        );
      }
    }
  }

  function scrollDown() {
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function addMsg(html, who) {
    var div = document.createElement("div");
    div.className = "moov-msg " + who;
    if (who === "user") div.textContent = html;
    else div.innerHTML = html;
    els.messages.appendChild(div);
    scrollDown();
  }

  function addChips(labels) {
    if (!labels || !labels.length) return;
    var wrap = document.createElement("div");
    wrap.className = "moov-chips";
    labels.forEach(function (label) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "moov-chip";
      b.textContent = label;
      b.addEventListener("click", function () {
        wrap.remove();
        handleUserMessage(label);
      });
      wrap.appendChild(b);
    });
    els.messages.appendChild(wrap);
    scrollDown();
  }

  function botSay(html, chips) {
    var typing = document.createElement("div");
    typing.className = "moov-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    els.messages.appendChild(typing);
    scrollDown();
    setTimeout(function () {
      typing.remove();
      addMsg(html, "bot");
      addChips(chips);
    }, 450 + Math.min(html.length, 600));
  }

  function enterEmailMode(question) {
    state.awaitingEmail = true;
    state.pendingQuestion = question;
    state.emailNudges = 0;
    els.form.classList.add("moov-email-mode");
    els.input.placeholder = "Type your email address…";
  }

  function exitEmailMode() {
    state.awaitingEmail = false;
    state.pendingQuestion = null;
    els.form.classList.remove("moov-email-mode");
    els.input.placeholder = "Ask me anything about MOOV…";
  }

  function handleUserMessage(text) {
    // remove stale chips so the thread stays clean
    var stale = els.messages.querySelectorAll(".moov-chips");
    stale.forEach(function (c) { c.remove(); });

    addMsg(text, "user");

    var emailMatch = text.match(EMAIL_RE);

    // 1. An email address anywhere = a lead, always.
    if (emailMatch) {
      var q = state.awaitingEmail ? state.pendingQuestion : text;
      saveLead(emailMatch[0], q);
      exitEmailMode();
      botSay(
        "Perfect, thank you! ✅ I've passed <b>" + emailMatch[0] + "</b> to the MOOV team — an expert will contact you shortly" +
          (q && q !== text ? " about your request (<i>“" + escapeHtml(q) + "”</i>)" : "") +
          ".<br><br>Anything else I can help with in the meantime?",
        ["What services do you offer?", "Track my shipment"]
      );
      return;
    }

    // 2. Waiting for an email but didn't get one.
    if (state.awaitingEmail) {
      var intentWhileWaiting = matchIntent(text);
      // A real question always wins — answer it immediately instead of
      // nagging for the email (they can leave it anytime later).
      if (intentWhileWaiting && intentWhileWaiting.id !== "pricing") {
        exitEmailMode();
        respondWithIntent(intentWhileWaiting, text);
        return;
      }
      var declined = /\b(no|nope|skip|later|cancel|don'?t|stop)\b/i.test(text);
      if (declined) {
        exitEmailMode();
        botSay("No problem! You can also reach the team anytime via " + LINK(cfg.contactPage, "our contact page") + ". What else can I help you with?", FALLBACK_CHIPS);
        return;
      }
      // Looks like a failed email attempt (has an @) — nudge once.
      if (text.indexOf("@") !== -1 && state.emailNudges < 1) {
        state.emailNudges++;
        botSay(
          "That doesn't look like a complete email address 🙂 — could you double-check it? (e.g. <i>name@company.com</i>)<br>Or type <b>skip</b> if you'd rather not leave one.",
          []
        );
        return;
      }
      // Anything else: stop insisting, fall through to normal handling.
      exitEmailMode();
      botSay(
        fallbackAnswer() + "<br><br><i>(And if you'd still like that quote, just drop your email anytime.)</i>",
        FALLBACK_CHIPS
      );
      return;
    }

    // 3. Normal Q&A.
    remember("user", text);
    var intent = matchIntent(text);
    if (intent) {
      respondWithIntent(intent, text);
    } else if (cfg.aiEndpoint) {
      askAI(text);
    } else {
      botSay(fallbackAnswer(), FALLBACK_CHIPS);
    }
  }

  function respondWithIntent(intent, originalText) {
    var html = intent.answer();
    remember("assistant", html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    botSay(html, intent.chips);
    if (intent.captureEmail) enterEmailMode(originalText);
  }

  // Hybrid AI mode: unknown questions go to a real LLM backend.
  function askAI(question) {
    var typing = document.createElement("div");
    typing.className = "moov-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    els.messages.appendChild(typing);
    scrollDown();

    var finish = function (html, chips) {
      typing.remove();
      addMsg(html, "bot");
      addChips(chips);
    };

    var timeout = setTimeout(function () {
      controllerDone = true;
      finish(fallbackAnswer(), FALLBACK_CHIPS);
    }, 20000);
    var controllerDone = false;

    fetch(cfg.aiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,
        history: state.history.slice(0, -1), // context before this question
        page: location.href,
      }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error("ai backend " + r.status);
        return r.json();
      })
      .then(function (data) {
        if (controllerDone) return;
        clearTimeout(timeout);
        var answer = data && typeof data.answer === "string" ? data.answer.trim() : "";
        if (!answer) throw new Error("empty answer");
        remember("assistant", answer);
        finish(renderAiText(answer), []);
      })
      .catch(function () {
        if (controllerDone) return;
        clearTimeout(timeout);
        finish(fallbackAnswer(), FALLBACK_CHIPS);
      });
  }

  // AI answers arrive as plain text — escape, then allow **bold**, newlines,
  // and turn bare URLs into clickable links.
  function renderAiText(text) {
    return escapeHtml(text)
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/(https?:\/\/[^\s<)]+?)([.,;)]?)(\s|$)/g, function (m, url, punct, tail) {
        return LINK(url, url.replace(/^https?:\/\/(www\.)?/, "")) + punct + tail;
      })
      .replace(/\n/g, "<br>");
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
