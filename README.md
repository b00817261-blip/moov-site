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
  2. **Slot picker** — calendar-style, every slot shown in **CET and China
     time (CST)**, with some slots pre-booked.
  3. **Confirmation** — the assigned MOOV expert, with a full summary.
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
  experts (Élodie Chen / Hao Lin). Booked prospect calls are locked cells
  showing company and call type. The grid is backed by the **same data as the
  public "Book a call" slot picker** — blocking a slot hides it from
  prospects instantly, and a new prospect booking appears in the calendar the
  moment it's confirmed (highlighted "just booked").

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
