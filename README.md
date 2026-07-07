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

The app opens directly on the **sign-in screen** — MOOV's marketing site
lives elsewhere; this portal is for current clients and MOOV staff.

### 1. Booking flow (website-embedded)
- **"Book a call" flow** (`#/book`) — the wizard that would embed on the
  MOOV marketing site (linked from the sign-in screen for prospects), a
  3-step flow:
  1. **Qualification form** — company, what they ship, origin/destination,
     monthly volume, current Incoterm, and service interest.
  2. **Expert & time picker** — a slider of MOOV team members (5 fictional
     people across the two teams) with role, location, languages and live
     free-slot counts; picking a person loads *their* calendar, shown in
     **CET and China time (CST)**.
  3. **Confirmation** — the chosen expert, Teams invite, participants and a
     downloadable .ics.
- **Visual inquiry routing** — 4PL / supply-chain interest routes to the
  **Strategic team** (Élodie Chen); simple freight quotes route to the
  **Freight desk** (Hao Lin). The routing updates live as you pick services.

### 2. One login, two roles
The login screen (`#/login`) offers two demo sign-ins that render different
portals from the same entry point:
- **Sign in as Client — Lidl Trading** → the client portal, scoped to that account
- **Sign in as MOOV Ops** → the internal operations console, spanning all clients

A "Demo: switch view" link in each sidebar jumps between the two.

### 3. Client portal (Lidl Trading)
- **Overview** (`#/app`) — active shipments, containers at sea, open alerts,
  monthly spend (with a 6-month chart), recent shipments and an alerts feed.
- **Shipment list** (`#/app/shipments`) — 8 shipments with container numbers
  (e.g. `MSKU-7781234`), origin (Shanghai / Ningbo / Shenzhen), destination
  (Hamburg / Rotterdam), Incoterm (FOB / CIF / DDP) and a status pill.
  Filter by state and search by container / PO.
- **Shipment detail** (`#/app/shipments/:id`) — a horizontal progress tracker
  with the stages **Booking confirmed → Picked up → In warehouse → Departed
  port → At sea → Arrived port → Customs clearance → Delivered**, plus an
  exception banner, full shipment facts, per-shipment documents and a
  milestone timeline.
- **Act on exceptions** — the customs-hold shipment shows a *"Required from
  you"* checklist with drag-and-drop upload; uploading flips the documents to
  *Under review*, updates the banner, timeline and alert feed.
- **Bookings** (`#/app/bookings`) — request quotes/new shipments in-app; the
  form adds a live *Pending review* row.
- **Documents** (`#/app/documents`) — every B/L, invoice, packing list and
  customs doc across shipments, with status (available / under review /
  required from you) and download/upload actions.
- **Invoices** (`#/app/invoices`) — open balance, overdue and paid; July's
  three invoices reconcile exactly to the €249k spend KPI.
- **Messages** (`#/app/messages`) — a per-shipment thread (chat UI) so
  questions stay attached to the container; sending works in-demo.
- Working chrome: notification bell (opens an alert panel), global topbar
  search (jumps to shipments), clickable KPI cards (deep-link to filtered
  views), clickable breadcrumbs, and a **live lane view** (China → EU SVG,
  each dot a shipment positioned by milestone progress).

### 4. MOOV Ops console (internal side)
- **Action queue** (`#/ops`) — cross-client exceptions and tasks, prioritised,
  each linking to the shipment; KPIs across all accounts.
- **All shipments** (`#/ops/shipments`) — every client's shipments with a
  client column and client switcher.
- **Clients** (`#/ops/clients`) — account cards with live workload
  (active shipments, exceptions, monthly spend).
- **Ops actions on a shipment** — advance the milestone or resolve a customs
  hold; changes appear immediately in the client's view (shared data layer —
  exactly the "control tower produces what clients consume" model).
- **My schedule & availability** (`#/ops/schedule`) — a week grid (CET + CST)
  where a MOOV employee manages their own calendar: click a slot to block or
  reopen it, click a day header to toggle the whole day, switch between
  all five staff members. Booked prospect calls are locked cells
  showing company and call type. The grid is backed by the **same data as the
  public "Book a call" slot picker** — blocking a slot hides it from
  prospects instantly, and a new prospect booking appears in the calendar the
  moment it's confirmed (highlighted "just booked").
- **Calendar sync (simulated Microsoft 365)** — each expert has a "connected"
  work calendar; Outlook/Teams meetings appear as purple *auto-blocked* cells
  and are removed from the public picker (titles are never shown to
  prospects). Sync now / disconnect / reconnect all work in-demo. Bookable
  slots = working hours − Outlook busy − manual blocks.
- **Teams-native bookings** — the public flow collects the prospect's name
  and work email, and the confirmation shows a Teams meeting link, notes the
  invite went to both calendars, and offers a **real downloadable .ics
  invite** (correct UTC times, ORGANIZER + ATTENDEE lines for everyone).
  In production this is the Microsoft Graph API: read free/busy, create the
  Outlook event with a Teams link, email invites to both parties.
- **Participants ("Who's on the call")** — the confirmation lists the MOOV
  host, the organiser, and lets the prospect add up to 4 colleagues to the
  invite (add/remove with live toasts). Attendees flow through to the .ics
  file and to the expert's calendar cell, which shows the contact and
  headcount (e.g. "Ola Nowak +2").

### 5. smartMOOV BI Catalogue (Ops console)
- **BI Catalogue** (`#/ops/reports`) — three windows over the same data:
  an **"Ask"** assistant, a **"Find a report"** finder and a
  **"Usage & cleanup"** inventory of the **PEPCO Power BI workspace**
  (106 reports across 10 categories, ranked by **actual views** from the
  Usage Metrics Report, 6 Jun – 5 Jul 2026). Built to answer four questions:
  *what are we actually using, what's genuinely there for the client, what's
  just used as a data download, and where are the big datasets*.
- **Ask** — a chat-style assistant: type a plain-English question ("why is
  my container stuck at the port?") and it ranks the three best-matching
  reports using keyword + synonym + intent scoring (e.g. *stuck* → AHOD,
  demurrage, detention). Fully client-side — nothing leaves the browser.
  Answers show the description, when to use it, the click-path and an Open
  in smartMOOV button.
- **Find a report** — task-oriented search ("customs delay", "container
  fill", "late supplier"…) over names, topics and keywords. Every card gives
  a *"Use this when…"* sentence, the **click-path inside smartMOOV**
  (BI › Reports › tab › report), delivery-type badge, view count, and an
  **Open in smartMOOV** button; category chips filter the sections.
- **Landing summary** — 108 active reports, 12,336 views, only 4 viewers,
  a −1.2% view trend, ~3 s typical open — plus "the story": usage is
  extremely concentrated (7 workhorses take ~60% of all views; 29 reports sit
  under 20 views).
- **Usage tier buckets** — Workhorses (>400 views) / Regular (100–400) /
  Low (20–100) / Near-zero (<20); each bucket is clickable and filters the
  table.
- **Dashboard vs Extract vs Hybrid** — every report is classified by
  `deliveryType`, with `hasRawDataPage` flagged where a dashboard carries a
  downloadable Raw Data page behind it. Extracts don't need dashboard
  maintenance — filter to them in one click.
- **One-click views** — **Retirement candidates** (29 near-zero reports:
  "sheet1", per-broker Customs Clearance variants, per-country forecast
  splits…) and **Big datasets / extracts** (32 direct dataset sources).
- **Sortable ranked table** — sort by views, trend, users or name; live
  search; category and type filters; every row expands to usage facts
  (views, trend, users, active days) plus pages/metrics/slicers/calculation
  for the reports that warrant it. Near-zero reports deliberately carry
  usage + classification only.
- **Honest caveats** — usage was read on screen (single digits approximate),
  4-user sample, PEPCO-scoped only; calculation logic tagged **Documented**
  vs **Inferred** since DAX isn't browser-extractable.
- **Privacy** — access-directory reports (Report User, Supplier User) are
  catalogued by structure only; **no personal data (emails) is stored**.

## Project structure

```
index.html            # shell + font + SPA mount
css/styles.css        # design system & all screen styles
js/data.js            # fictional data (services, experts, slots, shipments, alerts)
js/reports-data.js    # smartMOOV BI Catalogue data (MOOV.bi — meta + 67 reports)
js/icons.js           # inline SVG icon set
js/app.js             # hash router + all views + interactions
```

## Notes
- The design uses the Inter web font when available and falls back to the system
  font stack offline.
- State (booking answers, uploads, messages, filters) lives in memory —
  refreshing resets the demo.

## Security caveat (for the real build)
This prototype has **no real authentication or authorization** — the role
buttons simply render different views over shared fictional data. Before
going live, anything touching real accounts needs proper access control:
per-tenant data isolation (a client must never see another client's
shipments), role-based permissions, audit logging for ops actions, and a
security review around documents and invoice/payment data. Deliberately out
of scope here; flag for the engineering team.
