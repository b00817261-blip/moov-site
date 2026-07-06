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
/* A few slots taken, to feel real (keyed by "iso|cet") */
MOOV.slotsTaken = new Set(["2026-07-06|09:30", "2026-07-06|13:30", "2026-07-07|10:30", "2026-07-08|14:30"]);

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
