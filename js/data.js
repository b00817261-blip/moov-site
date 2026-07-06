/* =====================================================================
   MOOV Logistics — Prototype data layer
   All data is fictional and for demonstration purposes only.
   ===================================================================== */

window.MOOV = window.MOOV || {};

/* ---- Brand / company ------------------------------------------------ */
MOOV.company = {
  name: "MOOV Logistics",
  tagline: "Freight forwarding & 4PL, engineered between Europe and China.",
  hq: "Shanghai, China",
  founded: 2009,
  offices: ["Shanghai", "Ningbo", "Shenzhen", "Hamburg", "Rotterdam", "Lyon"],
};

/* ---- Services ------------------------------------------------------- */
MOOV.services = [
  {
    id: "ocean",
    icon: "ship",
    title: "Ocean freight",
    tag: "FCL · LCL",
    desc: "Weekly consolidated sailings from Shanghai, Ningbo and Shenzhen to Hamburg and Rotterdam, with priority space on partner carriers.",
  },
  {
    id: "air",
    icon: "plane",
    title: "Air freight",
    tag: "Express · Standard",
    desc: "Time-critical uplift and back-up capacity for peak season, with door-to-door options across the EU.",
  },
  {
    id: "rail",
    icon: "train",
    title: "Rail freight",
    tag: "China–Europe corridor",
    desc: "Block-train solutions along the New Silk Road — a lower-carbon middle ground between ocean and air.",
  },
  {
    id: "warehouse",
    icon: "warehouse",
    title: "Bonded warehousing",
    tag: "Origin & destination",
    desc: "Bonded and general storage in China and Europe, with pick-and-pack, cross-dock and VMI programmes.",
  },
  {
    id: "customs",
    icon: "stamp",
    title: "Customs clearance",
    tag: "Import & export",
    desc: "In-house brokerage on both ends — HS classification, duty optimisation and full compliance handling.",
  },
  {
    id: "smartmoov",
    icon: "hub",
    title: "smartMOOV 4PL",
    tag: "Managed supply chain",
    desc: "A control-tower programme that orchestrates your carriers, suppliers and data under one accountable team.",
    featured: true,
  },
];

/* ---- Booking flow reference data ------------------------------------ */
MOOV.shipOptions = [
  "Consumer goods / retail",
  "Food & beverage",
  "Apparel & textiles",
  "Electronics",
  "Homeware & furniture",
  "Industrial / machinery",
  "Other",
];

MOOV.volumeOptions = [
  "< 10 TEU / month",
  "10–50 TEU / month",
  "50–150 TEU / month",
  "150+ TEU / month",
  "Air / LCL only",
];

MOOV.incotermOptions = ["EXW", "FOB", "FCA", "CIF", "CFR", "DAP", "DDP", "Not sure yet"];

MOOV.serviceInterest = [
  { id: "ocean", label: "Ocean freight", team: "freight" },
  { id: "air", label: "Air freight", team: "freight" },
  { id: "rail", label: "Rail freight", team: "freight" },
  { id: "warehouse", label: "Bonded warehousing", team: "freight" },
  { id: "customs", label: "Customs clearance", team: "freight" },
  { id: "smartmoov", label: "smartMOOV 4PL programme", team: "strategic" },
  { id: "supplychain", label: "End-to-end supply chain design", team: "strategic" },
];

/* Experts, routed by team ------------------------------------------- */
MOOV.experts = {
  strategic: {
    team: "Strategic team",
    blurb: "Our 4PL specialists design and run managed supply-chain programmes.",
    name: "Élodie Chen",
    role: "Director, smartMOOV Solutions",
    based: "Shanghai · Lyon",
    initials: "ÉC",
    langs: ["中文", "Français", "English"],
  },
  freight: {
    team: "Freight desk",
    blurb: "Our freight consultants build and price your lane in days, not weeks.",
    name: "Hao Lin",
    role: "Senior Freight Consultant",
    based: "Shanghai",
    initials: "HL",
    langs: ["中文", "English", "Deutsch"],
  },
};

/* Slot picker — a few working days of availability -------------------- */
/* China Standard Time is UTC+8; CEST (summer) is UTC+2 → China is CET+6. */
MOOV.slotDays = [
  { date: "Mon 6 Jul", iso: "2026-07-06" },
  { date: "Tue 7 Jul", iso: "2026-07-07" },
  { date: "Wed 8 Jul", iso: "2026-07-08" },
  { date: "Thu 9 Jul", iso: "2026-07-09" },
];

/* Each slot stored as CET hour; China time computed as +6 ------------- */
MOOV.slotTimes = [
  { cet: "08:30", cst: "14:30" },
  { cet: "09:30", cst: "15:30" },
  { cet: "10:30", cst: "16:30" },
  { cet: "11:30", cst: "17:30" },
  { cet: "13:30", cst: "19:30" },
  { cet: "14:30", cst: "20:30" },
];
/* Per-expert schedule — the SAME data drives the public "Book a call"
   slot picker and the staff availability manager (#/ops/schedule).
   Keyed by "iso|cet"; state: booked | blocked; anything else = free. */
MOOV.schedule = {
  strategic: {
    entries: {
      "2026-07-06|09:30": { state: "booked", with: "Bolt Home & Living", type: "Intro call — 4PL" },
      "2026-07-08|14:30": { state: "booked", with: "Rossmann Import", type: "Programme review" },
      "2026-07-07|11:30": { state: "blocked", reason: "Team stand-up" },
      "2026-07-09|13:30": { state: "blocked", reason: "Flight to Lyon" },
    },
  },
  freight: {
    entries: {
      "2026-07-06|13:30": { state: "booked", with: "Tedi GmbH", type: "Intro call — ocean" },
      "2026-07-07|10:30": { state: "booked", with: "Pepco Group", type: "Quote review" },
      "2026-07-09|09:30": { state: "blocked", reason: "Port visit — Ningbo" },
    },
  },
};
/* Connected work calendars (simulates a Microsoft Graph free/busy sync).
   In production this comes from the Microsoft 365 / Teams calendar via the
   Graph API — here the busy events are canned but drive the same logic. */
MOOV.calendars = {
  strategic: {
    connected: true, provider: "Microsoft 365", account: "e.chen@moov-logistics.com", lastSync: "2 min ago",
    busy: {
      "2026-07-07|08:30": { title: "Internal — QBR prep" },
      "2026-07-08|10:30": { title: "Carrier review — Maersk" },
      "2026-07-09|09:30": { title: "1:1 with Hao Lin" },
    },
  },
  freight: {
    connected: true, provider: "Microsoft 365", account: "h.lin@moov-logistics.com", lastSync: "5 min ago",
    busy: {
      "2026-07-06|10:30": { title: "Pricing committee" },
      "2026-07-08|08:30": { title: "Depot visit — Waigaoqiao" },
      "2026-07-09|14:30": { title: "Team retro" },
    },
  },
};

/* Slot resolution order: portal booking > manual block > calendar busy > free.
   The public picker and the staff schedule both read from this. */
MOOV.slotState = function (team, iso, cet) {
  const key = iso + "|" + cet;
  const entry = MOOV.schedule[team].entries[key];
  if (entry) return entry;
  const cal = MOOV.calendars[team];
  if (cal && cal.connected && cal.busy[key]) return { state: "busy", title: cal.busy[key].title };
  return { state: "free" };
};

/* =====================================================================
   CLIENT DASHBOARD — demo account "Lidl Trading"
   ===================================================================== */
MOOV.client = {
  name: "Lidl Trading",
  account: "LDL-4471",
  contact: "Katrin Vogel",
  role: "Head of Import Logistics",
  since: 2018,
  manager: "Élodie Chen",
};

/* Canonical shipment stages (in order) -------------------------------- */
MOOV.stages = [
  "Booking confirmed",
  "Picked up",
  "In warehouse",
  "Departed port",
  "At sea",
  "Arrived port",
  "Customs clearance",
  "Delivered",
];

/* status pill helper: derives label/tone from current stage index ----- */
MOOV.statusFor = function (stageIndex, flags) {
  flags = flags || {};
  if (flags.exception) return { label: flags.exceptionLabel || "Exception", tone: "danger" };
  const s = MOOV.stages[stageIndex];
  const tone =
    stageIndex === 7 ? "success" :
    stageIndex >= 4 ? "info" :
    "neutral";
  return { label: s, tone };
};

/* Shipments (fake but internally consistent) -------------------------- */
MOOV.shipments = [
  {
    id: "MSKU-7781234",
    ref: "PO-LDL-88213",
    origin: "Shanghai", originPort: "CNSHA",
    dest: "Hamburg", destPort: "DEHAM",
    incoterm: "FOB",
    mode: "Ocean · FCL",
    carrier: "Maersk", vessel: "Maersk Halifax",
    commodity: "Homeware & kitchenware",
    containers: 3, teu: 6, weightT: 58.4,
    valueEur: 214000,
    etd: "2026-06-18", eta: "2026-07-19",
    stage: 4, // At sea
    flags: { delayed: true, note: "ETA revised +2 days — congestion at Hamburg." },
    events: [
      { stage: 0, ts: "2026-06-02 09:12", place: "Shanghai", note: "Booking confirmed with Maersk." },
      { stage: 1, ts: "2026-06-14 07:40", place: "Kunshan", note: "Cargo collected from supplier." },
      { stage: 2, ts: "2026-06-15 15:20", place: "Shanghai CFS", note: "Received, stuffed into 3×40'HC." },
      { stage: 3, ts: "2026-06-18 22:05", place: "Shanghai (CNSHA)", note: "Vessel departed origin port." },
      { stage: 4, ts: "2026-06-19 06:00", place: "East China Sea", note: "In transit — routing via Suez." },
    ],
  },
  {
    id: "MRKU-4432190",
    ref: "PO-LDL-88240",
    origin: "Ningbo", originPort: "CNNGB",
    dest: "Rotterdam", destPort: "NLRTM",
    incoterm: "CIF",
    mode: "Ocean · FCL",
    carrier: "MSC", vessel: "MSC Bettina",
    commodity: "Seasonal garden furniture",
    containers: 2, teu: 4, weightT: 33.1,
    valueEur: 96500,
    etd: "2026-07-11", eta: "2026-08-12",
    stage: 2, // In warehouse
    flags: {},
    events: [
      { stage: 0, ts: "2026-06-24 11:02", place: "Ningbo", note: "Booking confirmed with MSC." },
      { stage: 1, ts: "2026-07-01 08:15", place: "Yiwu", note: "Cargo collected from 2 suppliers." },
      { stage: 2, ts: "2026-07-02 17:44", place: "Ningbo CFS", note: "In bonded warehouse, awaiting stuffing." },
    ],
  },
  {
    id: "TCLU-9902315",
    ref: "PO-LDL-88101",
    origin: "Shenzhen", originPort: "CNSZX",
    dest: "Hamburg", destPort: "DEHAM",
    incoterm: "DDP",
    mode: "Ocean · FCL",
    carrier: "CMA CGM", vessel: "CMA CGM Rossini",
    commodity: "Small electronics & accessories",
    containers: 1, teu: 2, weightT: 14.8,
    valueEur: 178300,
    etd: "2026-05-28", eta: "2026-07-02",
    stage: 6, // Customs clearance
    flags: { exception: true, exceptionLabel: "Customs hold", note: "Import declaration on hold — commercial invoice value query." },
    events: [
      { stage: 0, ts: "2026-05-12 10:00", place: "Shenzhen", note: "Booking confirmed with CMA CGM." },
      { stage: 1, ts: "2026-05-22 09:30", place: "Dongguan", note: "Cargo collected." },
      { stage: 2, ts: "2026-05-24 14:10", place: "Shenzhen CFS", note: "Stuffed into 1×40'." },
      { stage: 3, ts: "2026-05-28 19:50", place: "Shenzhen (CNSZX)", note: "Departed origin port." },
      { stage: 4, ts: "2026-05-29 04:00", place: "South China Sea", note: "In transit." },
      { stage: 5, ts: "2026-07-01 13:22", place: "Hamburg (DEHAM)", note: "Vessel arrived, discharged." },
      { stage: 6, ts: "2026-07-02 09:05", place: "Hamburg customs", note: "Held — invoice value verification requested." },
    ],
  },
  {
    id: "HLXU-5567781",
    ref: "PO-LDL-88266",
    origin: "Shanghai", originPort: "CNSHA",
    dest: "Rotterdam", destPort: "NLRTM",
    incoterm: "FOB",
    mode: "Ocean · FCL",
    carrier: "Hapag-Lloyd", vessel: "Hamburg Express",
    commodity: "Textiles & home linen",
    containers: 2, teu: 4, weightT: 28.9,
    valueEur: 121750,
    etd: "2026-07-03", eta: "2026-08-05",
    stage: 3, // Departed port
    flags: {},
    events: [
      { stage: 0, ts: "2026-06-18 09:40", place: "Shanghai", note: "Booking confirmed with Hapag-Lloyd." },
      { stage: 1, ts: "2026-06-28 07:10", place: "Nantong", note: "Cargo collected." },
      { stage: 2, ts: "2026-06-30 12:30", place: "Shanghai CFS", note: "Stuffed into 2×40'HC." },
      { stage: 3, ts: "2026-07-03 20:15", place: "Shanghai (CNSHA)", note: "Departed origin port." },
    ],
  },
  {
    id: "MSCU-3320145",
    ref: "PO-LDL-87990",
    origin: "Ningbo", originPort: "CNNGB",
    dest: "Hamburg", destPort: "DEHAM",
    incoterm: "CIF",
    mode: "Ocean · FCL",
    carrier: "MSC", vessel: "MSC Rifaya",
    commodity: "Ceramic tableware",
    containers: 4, teu: 8, weightT: 71.2,
    valueEur: 158900,
    etd: "2026-04-30", eta: "2026-06-04",
    stage: 7, // Delivered
    flags: {},
    events: [
      { stage: 0, ts: "2026-04-14 10:20", place: "Ningbo", note: "Booking confirmed." },
      { stage: 1, ts: "2026-04-24 08:00", place: "Jinhua", note: "Cargo collected." },
      { stage: 2, ts: "2026-04-26 16:00", place: "Ningbo CFS", note: "Stuffed into 4×40'." },
      { stage: 3, ts: "2026-04-30 21:00", place: "Ningbo (CNNGB)", note: "Departed origin port." },
      { stage: 4, ts: "2026-05-01 05:30", place: "East China Sea", note: "In transit." },
      { stage: 5, ts: "2026-06-03 09:10", place: "Hamburg (DEHAM)", note: "Arrived, discharged." },
      { stage: 6, ts: "2026-06-03 15:40", place: "Hamburg customs", note: "Cleared." },
      { stage: 7, ts: "2026-06-05 11:25", place: "Neckarsulm DC", note: "Delivered and signed for." },
    ],
  },
  {
    id: "OOLU-8811223",
    ref: "PO-LDL-88301",
    origin: "Shenzhen", originPort: "CNSZX",
    dest: "Rotterdam", destPort: "NLRTM",
    incoterm: "DDP",
    mode: "Ocean · FCL",
    carrier: "OOCL", vessel: "OOCL Germany",
    commodity: "Toys & seasonal goods",
    containers: 2, teu: 4, weightT: 22.6,
    valueEur: 87400,
    etd: "2026-07-16", eta: "2026-08-20",
    stage: 0, // Booking confirmed
    flags: {},
    events: [
      { stage: 0, ts: "2026-07-04 14:33", place: "Shenzhen", note: "Booking confirmed with OOCL. Pickup scheduled." },
    ],
  },
  {
    id: "CMAU-6675490",
    ref: "PO-LDL-88055",
    origin: "Shanghai", originPort: "CNSHA",
    dest: "Hamburg", destPort: "DEHAM",
    incoterm: "FOB",
    mode: "Ocean · FCL",
    carrier: "CMA CGM", vessel: "CMA CGM Verdi",
    commodity: "Small appliances",
    containers: 1, teu: 2, weightT: 17.3,
    valueEur: 143200,
    etd: "2026-05-30", eta: "2026-07-04",
    stage: 5, // Arrived port
    flags: {},
    events: [
      { stage: 0, ts: "2026-05-16 09:00", place: "Shanghai", note: "Booking confirmed." },
      { stage: 1, ts: "2026-05-25 07:50", place: "Suzhou", note: "Cargo collected." },
      { stage: 2, ts: "2026-05-27 13:15", place: "Shanghai CFS", note: "Stuffed into 1×40'HC." },
      { stage: 3, ts: "2026-05-30 18:40", place: "Shanghai (CNSHA)", note: "Departed origin port." },
      { stage: 4, ts: "2026-05-31 02:10", place: "East China Sea", note: "In transit." },
      { stage: 5, ts: "2026-07-03 22:48", place: "Hamburg (DEHAM)", note: "Vessel arrived, awaiting discharge." },
    ],
  },
  {
    id: "MSKU-1129983",
    ref: "PO-LDL-88288",
    origin: "Ningbo", originPort: "CNNGB",
    dest: "Rotterdam", destPort: "NLRTM",
    incoterm: "CIF",
    mode: "Ocean · FCL",
    carrier: "Maersk", vessel: "Maersk Kensington",
    commodity: "Household plastics",
    containers: 2, teu: 4, weightT: 19.8,
    valueEur: 64300,
    etd: "2026-07-14", eta: "2026-08-16",
    stage: 1, // Picked up
    flags: {},
    events: [
      { stage: 0, ts: "2026-06-27 10:45", place: "Ningbo", note: "Booking confirmed with Maersk." },
      { stage: 1, ts: "2026-07-05 08:20", place: "Taizhou", note: "Cargo collected, moving to CFS." },
    ],
  },
];

/* Alerts feed for the dashboard (derived + curated) ------------------- */
MOOV.alerts = [
  {
    tone: "danger",
    shipment: "TCLU-9902315",
    title: "Customs hold at Hamburg",
    body: "Import declaration paused pending commercial-invoice value verification. Broker has requested supporting docs.",
    when: "2h ago",
  },
  {
    tone: "warning",
    shipment: "MSKU-7781234",
    title: "ETA revised +2 days",
    body: "Berth congestion at Hamburg pushed estimated arrival to 19 Jul. Inland plan unaffected for now.",
    when: "Yesterday",
  },
  {
    tone: "info",
    shipment: "CMAU-6675490",
    title: "Vessel arrived — awaiting discharge",
    body: "CMA CGM Verdi berthed at Hamburg. Discharge and customs pre-clearance in progress.",
    when: "2d ago",
  },
];

/* Monthly spend trend for the overview sparkline (last 6 months, €k) -- */
MOOV.spendTrend = [
  { m: "Feb", v: 198 },
  { m: "Mar", v: 231 },
  { m: "Apr", v: 205 },
  { m: "May", v: 268 },
  { m: "Jun", v: 242 },
  { m: "Jul", v: 249 },
];

/* =====================================================================
   ROLES & SESSION (prototype only — no real auth; see README security note)
   ===================================================================== */
MOOV.session = { role: null };

/* All client accounts (ops side sees every one; client side sees itself) */
MOOV.clientsAll = [
  { id: "LDL-4471", name: "Lidl Trading", country: "Germany", contact: "Katrin Vogel", manager: "Élodie Chen", spendMonthK: 249, since: 2018 },
  { id: "ACT-2210", name: "Action Retail B.V.", country: "Netherlands", contact: "Pieter de Wit", manager: "Hao Lin", spendMonthK: 118, since: 2021 },
  { id: "WLW-1130", name: "Woolworth GmbH", country: "Germany", contact: "Sabine Kraus", manager: "Hao Lin", spendMonthK: 76, since: 2023 },
];

/* tag existing (Lidl) shipments with their account */
MOOV.shipments.forEach((s) => (s.client = "LDL-4471"));

/* other clients' shipments — visible on the ops side only ------------- */
MOOV.otherShipments = [
  {
    id: "CSNU-4419023", ref: "PO-ACT-55102", client: "ACT-2210",
    origin: "Ningbo", originPort: "CNNGB", dest: "Rotterdam", destPort: "NLRTM",
    incoterm: "DAP", mode: "Ocean · FCL", carrier: "MSC", vessel: "MSC Sixin",
    commodity: "Household goods", containers: 3, teu: 6, weightT: 41.5, valueEur: 102000,
    etd: "2026-06-21", eta: "2026-07-23", stage: 4, flags: {},
    events: [
      { stage: 0, ts: "2026-06-06 09:30", place: "Ningbo", note: "Booking confirmed with MSC." },
      { stage: 3, ts: "2026-06-21 21:10", place: "Ningbo (CNNGB)", note: "Departed origin port." },
      { stage: 4, ts: "2026-06-22 05:00", place: "East China Sea", note: "In transit." },
    ],
  },
  {
    id: "MSKU-2210457", ref: "PO-ACT-55140", client: "ACT-2210",
    origin: "Shenzhen", originPort: "CNSZX", dest: "Rotterdam", destPort: "NLRTM",
    incoterm: "FOB", mode: "Ocean · FCL", carrier: "Maersk", vessel: "Maersk Salina",
    commodity: "Party supplies", containers: 1, teu: 2, weightT: 11.2, valueEur: 54200,
    etd: "2026-05-26", eta: "2026-06-30", stage: 6,
    flags: { exception: true, exceptionLabel: "Docs required", note: "Certificate of origin missing — broker cannot lodge the import declaration." },
    events: [
      { stage: 0, ts: "2026-05-10 14:00", place: "Shenzhen", note: "Booking confirmed." },
      { stage: 5, ts: "2026-06-29 08:45", place: "Rotterdam (NLRTM)", note: "Arrived, discharged." },
      { stage: 6, ts: "2026-06-30 10:20", place: "Rotterdam customs", note: "Blocked — certificate of origin missing." },
    ],
  },
  {
    id: "HLXU-7801122", ref: "PO-WLW-33018", client: "WLW-1130",
    origin: "Shanghai", originPort: "CNSHA", dest: "Hamburg", destPort: "DEHAM",
    incoterm: "CIF", mode: "Ocean · FCL", carrier: "Hapag-Lloyd", vessel: "Al Zubara",
    commodity: "Stationery & crafts", containers: 2, teu: 4, weightT: 24.0, valueEur: 66800,
    etd: "2026-07-12", eta: "2026-08-14", stage: 2, flags: {},
    events: [
      { stage: 0, ts: "2026-06-26 10:15", place: "Shanghai", note: "Booking confirmed." },
      { stage: 2, ts: "2026-07-04 16:40", place: "Shanghai CFS", note: "In warehouse, awaiting stuffing." },
    ],
  },
  {
    id: "TGHU-5583901", ref: "PO-WLW-33002", client: "WLW-1130",
    origin: "Ningbo", originPort: "CNNGB", dest: "Hamburg", destPort: "DEHAM",
    incoterm: "DDP", mode: "Ocean · FCL", carrier: "COSCO", vessel: "COSCO Shipping Aries",
    commodity: "Kitchen textiles", containers: 2, teu: 4, weightT: 18.6, valueEur: 47900,
    etd: "2026-05-29", eta: "2026-07-03", stage: 5, flags: {},
    events: [
      { stage: 0, ts: "2026-05-14 11:00", place: "Ningbo", note: "Booking confirmed." },
      { stage: 5, ts: "2026-07-03 07:30", place: "Hamburg (DEHAM)", note: "Vessel arrived, awaiting discharge." },
    ],
  },
];
MOOV.allShipments = MOOV.shipments.concat(MOOV.otherShipments);
MOOV.clientName = (id) => (MOOV.clientsAll.find((c) => c.id === id) || {}).name || id;

/* =====================================================================
   DOCUMENTS (Lidl scope for the client demo)
   status: available | required | review
   ===================================================================== */
MOOV.documents = [
  { id: "D-101", ship: "MSKU-7781234", type: "Bill of lading", name: "MBL-MAEU-224781.pdf", date: "2026-06-19", size: "214 KB", status: "available" },
  { id: "D-102", ship: "MSKU-7781234", type: "Commercial invoice", name: "CI-88213.pdf", date: "2026-06-14", size: "96 KB", status: "available" },
  { id: "D-103", ship: "MSKU-7781234", type: "Packing list", name: "PL-88213.pdf", date: "2026-06-14", size: "88 KB", status: "available" },
  { id: "D-110", ship: "MRKU-4432190", type: "Booking confirmation", name: "BC-MSC-88240.pdf", date: "2026-06-24", size: "64 KB", status: "available" },
  { id: "D-111", ship: "MRKU-4432190", type: "Packing list", name: "PL-88240.pdf", date: "2026-07-01", size: "91 KB", status: "available" },
  { id: "D-120", ship: "TCLU-9902315", type: "Bill of lading", name: "MBL-CMDU-990231.pdf", date: "2026-05-29", size: "208 KB", status: "available" },
  { id: "D-121", ship: "TCLU-9902315", type: "Commercial invoice", name: "CI-88101-original.pdf", date: "2026-05-22", size: "94 KB", status: "available" },
  { id: "D-122", ship: "TCLU-9902315", type: "Packing list", name: "PL-88101.pdf", date: "2026-05-22", size: "85 KB", status: "available" },
  { id: "D-123", ship: "TCLU-9902315", type: "Import declaration", name: "MRN-26DE4855021.pdf", date: "2026-07-02", size: "132 KB", status: "review" },
  { id: "D-124", ship: "TCLU-9902315", type: "Commercial invoice (revised)", name: "—", date: "", size: "", status: "required", hint: "Must match the declared value of €178,300." },
  { id: "D-125", ship: "TCLU-9902315", type: "Proof of payment", name: "—", date: "", size: "", status: "required", hint: "Bank transfer confirmation for this consignment." },
  { id: "D-130", ship: "MSCU-3320145", type: "Bill of lading", name: "MBL-MEDU-332014.pdf", date: "2026-05-01", size: "211 KB", status: "available" },
  { id: "D-131", ship: "MSCU-3320145", type: "Customs clearance", name: "ATB-26DE1140233.pdf", date: "2026-06-03", size: "77 KB", status: "available" },
  { id: "D-132", ship: "MSCU-3320145", type: "Proof of delivery", name: "POD-87990.pdf", date: "2026-06-05", size: "58 KB", status: "available" },
  { id: "D-140", ship: "HLXU-5567781", type: "Bill of lading", name: "MBL-HLCU-556778.pdf", date: "2026-07-03", size: "205 KB", status: "available" },
  { id: "D-141", ship: "HLXU-5567781", type: "Commercial invoice", name: "CI-88266.pdf", date: "2026-06-28", size: "97 KB", status: "available" },
  { id: "D-150", ship: "OOLU-8811223", type: "Booking confirmation", name: "BC-OOCL-88301.pdf", date: "2026-07-04", size: "66 KB", status: "available" },
  { id: "D-160", ship: "CMAU-6675490", type: "Bill of lading", name: "MBL-CMDU-667549.pdf", date: "2026-05-31", size: "216 KB", status: "available" },
  { id: "D-161", ship: "CMAU-6675490", type: "Arrival notice", name: "AN-DEHAM-88055.pdf", date: "2026-07-03", size: "71 KB", status: "available" },
];
MOOV.docsFor = (shipId) => MOOV.documents.filter((d) => d.ship === shipId);

/* =====================================================================
   INVOICES (Lidl) — July invoices reconcile to the €249k spend KPI
   ===================================================================== */
MOOV.invoices = [
  { id: "INV-2026-0704", issued: "2026-07-04", due: "2026-07-28", amountEur: 96300, desc: "Ocean freight — June sailings", ships: ["MSKU-7781234", "HLXU-5567781"], status: "due" },
  { id: "INV-2026-0702", issued: "2026-07-02", due: "2026-07-26", amountEur: 84150, desc: "Freight & customs clearance", ships: ["CMAU-6675490", "TCLU-9902315"], status: "due" },
  { id: "INV-2026-0701", issued: "2026-07-01", due: "2026-07-25", amountEur: 68550, desc: "Warehousing & drayage — June programme", ships: ["MRKU-4432190"], status: "due" },
  { id: "INV-2026-0615", issued: "2026-06-15", due: "2026-06-30", amountEur: 12150, desc: "Demurrage & detention", ships: ["MSCU-3320145"], status: "overdue" },
  { id: "INV-2026-0610", issued: "2026-06-10", due: "2026-07-05", amountEur: 128700, desc: "Ocean freight — May sailings", ships: ["MSCU-3320145", "TCLU-9902315"], status: "paid" },
  { id: "INV-2026-0528", issued: "2026-05-28", due: "2026-06-22", amountEur: 113300, desc: "Freight, customs & warehousing", ships: ["CMAU-6675490"], status: "paid" },
];

/* =====================================================================
   MESSAGE THREADS (per shipment)
   ===================================================================== */
MOOV.threads = [
  {
    ship: "MSKU-7781234", unread: 1,
    messages: [
      { from: "moov", name: "Élodie Chen", ts: "2026-07-05 16:20", text: "Heads up — berth congestion at Hamburg has pushed your ETA to 19 Jul (+2 days). The inland leg is already rebooked; no action needed on your side." },
    ],
  },
  {
    ship: "TCLU-9902315", unread: 0,
    messages: [
      { from: "moov", name: "Élodie Chen", ts: "2026-07-02 09:40", text: "Hamburg customs has placed the import declaration on hold — they're querying the declared invoice value. Could you upload a revised commercial invoice and proof of payment? Both are listed under your required documents." },
      { from: "client", name: "Katrin Vogel", ts: "2026-07-02 11:05", text: "On it — finance is pulling the bank confirmation. You'll have the revised invoice by tomorrow." },
      { from: "moov", name: "Élodie Chen", ts: "2026-07-02 11:12", text: "Perfect. Once both are in, our broker resubmits the same day. No storage charges accrue before 9 Jul." },
    ],
  },
  {
    ship: "MRKU-4432190", unread: 0,
    messages: [
      { from: "client", name: "Katrin Vogel", ts: "2026-07-01 10:02", text: "Can we get stuffing photos for the garden furniture before departure?" },
      { from: "moov", name: "Hao Lin", ts: "2026-07-01 10:31", text: "Yes — the CFS will photograph the stuffing on 8 Jul and we'll post the photos to your documents the same day." },
    ],
  },
];
MOOV.threadFor = (shipId) => MOOV.threads.find((t) => t.ship === shipId);
MOOV.unreadCount = () => MOOV.threads.reduce((n, t) => n + (t.unread || 0), 0);

/* =====================================================================
   BOOKING / QUOTE REQUESTS (client-initiated, in-portal)
   ===================================================================== */
MOOV.bookingRequests = [
  { id: "BKG-2405", requested: "2026-07-03", origin: "Ningbo", dest: "Rotterdam", containers: "1 × 40'", incoterm: "CIF", ready: "2026-08-01", commodity: "Household plastics", status: "Quote sent", quoteEur: 3180 },
  { id: "BKG-2398", requested: "2026-06-30", origin: "Shanghai", dest: "Hamburg", containers: "2 × 40'HC", incoterm: "FOB", ready: "2026-07-20", commodity: "Homeware", status: "Pending review" },
  { id: "BKG-2377", requested: "2026-06-20", origin: "Shenzhen", dest: "Rotterdam", containers: "2 × 40'", incoterm: "DDP", ready: "2026-07-16", commodity: "Toys & seasonal goods", status: "Confirmed", ship: "OOLU-8811223" },
];

/* =====================================================================
   OPS ACTION QUEUE (internal side)
   ===================================================================== */
MOOV.opsQueue = [
  { pri: "high", client: "LDL-4471", ship: "TCLU-9902315", title: "Customs hold — awaiting client documents", detail: "Broker needs revised commercial invoice + proof of payment before resubmission.", age: "2h" },
  { pri: "high", client: "ACT-2210", ship: "MSKU-2210457", title: "Certificate of origin missing — declaration blocked", detail: "Chase supplier for the CO; declaration cannot be lodged without it.", age: "5h" },
  { pri: "med", client: "WLW-1130", ship: "TGHU-5583901", title: "Arrange final-mile delivery from Hamburg", detail: "Vessel arrived 3 Jul — book inland haulage to the Bochum DC.", age: "1d" },
  { pri: "med", client: "LDL-4471", ship: "MSKU-7781234", title: "Confirm client informed of revised ETA", detail: "ETA moved +2 days; message sent 5 Jul — confirm inland plan holds.", age: "1d" },
  { pri: "med", client: "LDL-4471", ship: null, booking: "BKG-2398", title: "Price & send quote for booking BKG-2398", detail: "2 × 40'HC Shanghai → Hamburg, FOB, cargo ready 20 Jul.", age: "6d" },
];
