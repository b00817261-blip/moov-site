# MOOV Logistics — Client Portal Prototype

A clickable web-app prototype for **MOOV Logistics**, a Shanghai-based freight
forwarding and 4PL company moving goods from China to Europe. Built as a
zero-build static single-page app (vanilla HTML/CSS/JS) — no dependencies, no
compile step.

> All company data, clients, shipments and people are **fictional** and for
> demonstration only.

## Run it

Because the app uses hash-based routing and plain `<script>` tags, you can just
open `index.html` in a browser. To avoid any browser quirks, serving statically
is recommended:

```bash
python3 -m http.server 8099
# then open http://localhost:8099
```

## What's inside

### 1. Public side (prospect-facing)
- **Landing page** — MOOV's services: ocean / air / rail freight forwarding,
  bonded warehousing, customs clearance, and the featured **smartMOOV 4PL**
  programme, plus how-it-works and trust sections.
- **"Book a call" flow** (`#/book`) — a 3-step wizard:
  1. **Qualification form** — company, what they ship, origin/destination,
     monthly volume, current Incoterm, and service interest.
  2. **Slot picker** — calendar-style, every slot shown in **CET and China
     time (CST)**, with some slots pre-booked.
  3. **Confirmation** — the assigned MOOV expert, with a full summary.
- **Visual inquiry routing** — 4PL / supply-chain interest routes to the
  **Strategic team** (Élodie Chen); simple freight quotes route to the
  **Freight desk** (Hao Lin). The routing updates live as you pick services.

### 2. Client dashboard (logged-in side)
Demo account: **Lidl Trading** (`#/login` → click *Sign in*).
- **Overview** (`#/app`) — active shipments, containers at sea, open alerts,
  monthly spend (with a 6-month chart), recent shipments and an alerts feed.
- **Shipment list** (`#/app/shipments`) — 8 shipments with container numbers
  (e.g. `MSKU-7781234`), origin (Shanghai / Ningbo / Shenzhen), destination
  (Hamburg / Rotterdam), Incoterm (FOB / CIF / DDP) and a status pill.
  Filter by state and search by container / PO.
- **Shipment detail** (`#/app/shipments/:id`) — a horizontal progress tracker
  with the stages **Booking confirmed → Picked up → In warehouse → Departed
  port → At sea → Arrived port → Customs clearance → Delivered**, plus an
  exception banner (e.g. customs hold), full shipment facts and a milestone
  timeline.

## Project structure

```
index.html        # shell + font + SPA mount
css/styles.css    # design system & all screen styles
js/data.js        # fictional data (services, experts, slots, shipments, alerts)
js/icons.js       # inline SVG icon set
js/app.js         # hash router + all views + interactions
```

## Notes
- The design uses the Inter web font when available and falls back to the system
  font stack offline.
- State (booking answers, filters) lives in memory — refreshing resets the demo.
