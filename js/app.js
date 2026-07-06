/* =====================================================================
   MOOV Logistics — SPA router + views
   Vanilla JS, hash-based routing (works over file:// and any static host)
   ===================================================================== */
(function () {
  const I = MOOV.icon;
  const app = document.getElementById("app");

  /* ---- tiny helpers ------------------------------------------------- */
  const h = (html) => html;
  const el = (id) => document.getElementById(id);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const eur = (n) => "€" + n.toLocaleString("en-GB");
  const go = (hash) => { window.location.hash = hash; };
  function fmtDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  /* ---- ephemeral booking state -------------------------------------- */
  MOOV.booking = MOOV.booking || {
    step: 1, company: "", email: "", ship: "", origin: "", dest: "", volume: "",
    incoterm: "", interests: [], day: null, slot: null,
  };
  const emailOk = (v) => /\S+@\S+\.\S+/.test(v || "");
  function bookingTeam() {
    const b = MOOV.booking;
    const strategic = b.interests.some(
      (id) => (MOOV.serviceInterest.find((s) => s.id === id) || {}).team === "strategic"
    );
    return strategic ? "strategic" : "freight";
  }

  /* =====================================================================
     SHARED CHROME
     ===================================================================== */
  function logoMark() {
    return `<svg class="mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#0b1f3a"/>
      <path d="M8 26V14l6 7 6-7v12" stroke="#4d84ff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23 20h8M27 16l4 4-4 4" stroke="#14b8a6" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }
  /* =====================================================================
     VIEW: BOOKING WIZARD
     ===================================================================== */
  function wizardSteps(step) {
    const labels = ["Your shipping", "Pick a slot", "Confirmed"];
    return `<div class="wizard-steps">${labels.map((l, i) => {
      const n = i + 1;
      const cls = n < step ? "done" : n === step ? "active" : "";
      return `<div class="ws ${cls}"><span class="b">${n < step ? I('check','i-sm') : n}</span><span class="txt">${l}</span></div>`;
    }).join("")}</div>`;
  }

  function viewBook() {
    const b = MOOV.booking;
    if (b.step > 3) b.step = 1;
    let inner = "";
    if (b.step === 1) inner = bookStep1();
    else if (b.step === 2) inner = bookStep2();
    else inner = bookStep3();

    const heroText = b.step === 3
      ? { t: "You're booked in.", p: "Here's everything you need for the call." }
      : { t: "Book a call with a MOOV expert", p: "Tell us a little about your freight and we'll route you to the right team." };

    return h(`
    <header class="nav"><div class="wrap nav-inner">
      <a class="brand" href="#/">${logoMark()} MOOV</a>
      <span class="chip">${I('globe','i-sm')} Booking flow — embedded on the MOOV website</span>
      <div class="nav-spacer"></div>
      <a class="btn btn-ghost btn-sm" href="#/">${I('logout','i-sm')} Client sign in</a>
    </div></header>
    <div class="book">
      <div class="book-hero"><div class="wrap">
        <a class="back-link" href="#/" style="color:#9fb2d0;margin-bottom:18px">${I('chevleft','i-sm')} Back to sign in</a>
        <h1>${heroText.t}</h1>
        <p>${heroText.p}</p>
      </div></div>
      <div class="book-shell">
        ${wizardSteps(b.step)}
        <div class="card">${inner}</div>
      </div>
    </div>
    <div class="toast" id="toast"></div>`);
  }

  /* -- step 1: qualification ------------------------------------------ */
  function bookStep1() {
    const b = MOOV.booking;
    const shipChips = MOOV.shipOptions.map((o) =>
      `<button type="button" class="choice ${b.ship===o?'sel':''}" data-ship="${o}"><span class="tick">${I('check','i-sm')}</span>${o}</button>`).join("");
    const volOpts = MOOV.volumeOptions.map((o) =>
      `<option value="${o}" ${b.volume===o?'selected':''}>${o}</option>`).join("");
    const incOpts = MOOV.incotermOptions.map((o) =>
      `<option value="${o}" ${b.incoterm===o?'selected':''}>${o}</option>`).join("");
    const interestChips = MOOV.serviceInterest.map((s) => {
      const on = b.interests.includes(s.id);
      return `<button type="button" class="choice ${s.team==='strategic'?'strategic':''} ${on?'sel':''}" data-interest="${s.id}"><span class="tick">${I('check','i-sm')}</span>${s.label}</button>`;
    }).join("");

    return `
      <h2>Tell us what you ship</h2>
      <p class="sub">Six quick fields. This helps us bring the right expert to your call.</p>

      <div class="field-row">
        <div class="field">
          <label>Company name <span class="req">*</span></label>
          <input class="input" id="f-company" placeholder="e.g. Lidl Trading" value="${b.company||''}">
        </div>
        <div class="field">
          <label>Work email <span class="req">*</span></label>
          <input class="input" id="f-email" type="email" placeholder="you@company.com" value="${b.email||''}">
        </div>
      </div>
      <p class="muted" style="font-size:12.5px;margin-top:8px">${I('calendar','i-sm')} We'll send the calendar invite and Microsoft Teams link here.</p>

      <div class="field">
        <label>What do you ship?</label>
        <div class="choices" id="ship-choices">${shipChips}</div>
      </div>

      <div class="field-row">
        <div class="field" style="margin-top:20px">
          <label>Origin</label>
          <input class="input" id="f-origin" placeholder="e.g. Shanghai, Ningbo" value="${b.origin||''}">
        </div>
        <div class="field" style="margin-top:20px">
          <label>Destination</label>
          <input class="input" id="f-dest" placeholder="e.g. Hamburg, Rotterdam" value="${b.dest||''}">
        </div>
      </div>

      <div class="field-row">
        <div class="field">
          <label>Monthly volume</label>
          <select class="select" id="f-volume"><option value="">Select…</option>${volOpts}</select>
        </div>
        <div class="field">
          <label>Current Incoterm</label>
          <select class="select" id="f-incoterm"><option value="">Select…</option>${incOpts}</select>
        </div>
      </div>

      <div class="field">
        <label>Which services are you interested in?</label>
        <div class="choices" id="interest-choices">${interestChips}</div>
      </div>

      <div id="route-hint-slot">${routeHint()}</div>

      <div class="card-actions">
        <a class="btn btn-ghost" href="#/">Cancel</a>
        <button class="btn btn-primary" id="to-step2" ${b.company && emailOk(b.email)?'':'disabled'}>Choose a time ${I('arrow','i-sm')}</button>
      </div>
    `;
  }

  function routeHint() {
    const b = MOOV.booking;
    if (!b.interests.length) {
      return `<div class="route-hint">
        <div class="rh-icn" style="background:var(--ink-3)">${I('hub','i-sm')}</div>
        <div><b>We'll route you automatically</b><span class="muted">Pick a service above and we'll show which MOOV team will take your call.</span></div>
      </div>`;
    }
    const team = bookingTeam();
    const exp = MOOV.experts[team];
    return `<div class="route-hint ${team}">
      <div class="rh-icn">${I(team==='strategic'?'hub':'ship','i-sm')}</div>
      <div><b>Routing to the ${exp.team}</b><span class="muted">${exp.blurb}</span></div>
    </div>`;
  }

  /* -- step 2: slot picker -------------------------------------------- */
  function bookStep2() {
    const b = MOOV.booking;
    if (!b.day) b.day = MOOV.slotDays[0].iso;
    const days = MOOV.slotDays.map((d) => {
      const [dow, ...rest] = d.date.split(" ");
      return `<button type="button" class="slot-day ${b.day===d.iso?'sel':''}" data-day="${d.iso}">
        <div class="sd-dow">${dow}</div><div class="sd-date">${rest.join(' ')}</div></button>`;
    }).join("");
    const exp = MOOV.experts[bookingTeam()];
    return `
      <h2>Pick a time that works</h2>
      <p class="sub">Live availability for <b>${exp.name}</b> (${exp.team}) — times in Central European Time and China Standard Time.</p>
      <div class="slot-days">${days}</div>
      <div class="tz-note">${I('globe','i-sm')} <span><b>CET</b> (Central European Time) &nbsp;·&nbsp; <b>CST</b> (China Standard Time, CET +6h)</span></div>
      <div class="slot-grid" id="slot-grid">${slotGrid()}</div>
      <div class="card-actions">
        <button class="btn btn-ghost" id="back-step1">${I('chevleft','i-sm')} Back</button>
        <button class="btn btn-primary" id="to-step3" ${b.slot?'':'disabled'}>Confirm booking ${I('check','i-sm')}</button>
      </div>
    `;
  }
  function slotGrid() {
    const b = MOOV.booking;
    const team = bookingTeam();
    return MOOV.slotTimes.map((t) => {
      const st = MOOV.slotState(team, b.day, t.cet).state;
      const taken = st !== "free";
      const sel = b.slot === t.cet;
      return `<button type="button" class="slot ${sel?'sel':''}" data-slot="${t.cet}" ${taken?'disabled':''}>
        <div class="s-cet">${t.cet} <span style="font-size:11px;color:var(--ink-3);font-weight:600">CET</span></div>
        <div class="s-cst">${t.cst} CST${st==='booked'?' · booked':taken?' · unavailable':''}</div>
      </button>`;
    }).join("");
  }

  /* A real, downloadable calendar invite (.ics) for the prospect.
     July = CEST (UTC+2), so a 10:30 CET slot is 08:30 UTC. */
  function bookingIcs(b, exp, day, slot) {
    const [h, m] = slot.cet.split(":").map(Number);
    const pad = (n) => String(n).padStart(2, "0");
    const dayNum = day.iso.replace(/-/g, "");
    const startH = h - 2;
    const endMin = m + 30, endH = startH + Math.floor(endMin / 60);
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MOOV Logistics//Booking//EN",
      "BEGIN:VEVENT",
      "UID:moov-" + dayNum + "-" + slot.cet.replace(":", "") + "@moov-logistics.com",
      "DTSTAMP:" + dayNum + "T000000Z",
      "DTSTART:" + dayNum + "T" + pad(startH) + pad(m) + "00Z",
      "DTEND:" + dayNum + "T" + pad(endH) + pad(endMin % 60) + "00Z",
      "SUMMARY:MOOV intro call — " + (b.company || "Prospect") + " × " + exp.name,
      "DESCRIPTION:30-minute video call with " + exp.name + " (" + exp.team + ")\\nMicrosoft Teams — join link in your email invite.",
      "LOCATION:Microsoft Teams",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
  }

  /* -- step 3: confirmation ------------------------------------------- */
  function bookStep3() {
    const b = MOOV.booking;
    const team = bookingTeam();
    const exp = MOOV.experts[team];
    const day = MOOV.slotDays.find((d) => d.iso === b.day) || MOOV.slotDays[0];
    const slot = MOOV.slotTimes.find((t) => t.cet === b.slot) || MOOV.slotTimes[0];
    const interestLabels = b.interests.map((id) => (MOOV.serviceInterest.find((s) => s.id === id) || {}).label).filter(Boolean);

    return `
      <div class="confirm-hero">
        <div class="confirm-check">${I('checkbig')}</div>
        <h2>Call confirmed</h2>
        <p class="sub">${day.date} · ${slot.cet} CET / ${slot.cst} CST · 30 minutes</p>
      </div>

      <div class="teams-block">
        <div class="tb-icn">${I('video')}</div>
        <div style="flex:1;min-width:0">
          <b>Microsoft Teams meeting</b>
          <div class="muted" style="font-size:13px;margin-top:2px">Invite sent to <b>${b.email || 'your inbox'}</b> and added to ${exp.name}'s Outlook calendar.</div>
          <a href="#" class="link tb-join" style="font-size:13px;display:inline-block;margin-top:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%">teams.microsoft.com/l/meetup-join/moov-${day.iso}-${slot.cet.replace(':','')}…</a>
        </div>
        <a class="btn btn-ghost btn-sm" style="flex:none" href="${bookingIcs(b, exp, day, slot)}" download="moov-intro-call.ics">${I('calendar','i-sm')} Add to calendar</a>
      </div>

      <div class="expert-card ${team}">
        <div class="expert-av ${team}">${exp.initials}</div>
        <div>
          <div class="e-team">${I(team==='strategic'?'hub':'ship','i-sm')} ${exp.team}</div>
          <div class="e-name">${exp.name}</div>
          <div class="e-role">${exp.role} · ${exp.based}</div>
          <div class="e-langs">${exp.langs.map((l)=>`<span class="chip">${l}</span>`).join('')}</div>
        </div>
      </div>

      <div class="summary-list">
        <div class="row"><span class="k">Company</span><span class="v">${b.company||'—'}</span></div>
        ${b.ship?`<div class="row"><span class="k">Ships</span><span class="v">${b.ship}</span></div>`:''}
        ${(b.origin||b.dest)?`<div class="row"><span class="k">Lane</span><span class="v">${b.origin||'—'} → ${b.dest||'—'}</span></div>`:''}
        ${b.volume?`<div class="row"><span class="k">Monthly volume</span><span class="v">${b.volume}</span></div>`:''}
        ${b.incoterm?`<div class="row"><span class="k">Current Incoterm</span><span class="v">${b.incoterm}</span></div>`:''}
        ${interestLabels.length?`<div class="row"><span class="k">Interested in</span><span class="v">${interestLabels.join(', ')}</span></div>`:''}
        <div class="row"><span class="k">Routed to</span><span class="v">${exp.team}</span></div>
      </div>

      <div class="card-actions">
        <a class="btn btn-ghost" href="#/">Back to sign in</a>
        <a class="btn btn-primary" href="#/app">Preview the client portal ${I('arrow','i-sm')}</a>
      </div>
    `;
  }

  /* wire up booking interactions after render ------------------------- */
  function bindBook() {
    const b = MOOV.booking;
    if (b.step === 1) {
      const company = el("f-company");
      const refreshNext = () => { const btn = el("to-step2"); if (btn) btn.disabled = !(el("f-company").value.trim() && emailOk(el("f-email").value)); };
      company && company.addEventListener("input", (e) => { b.company = e.target.value; refreshNext(); });
      const email = el("f-email");
      email && email.addEventListener("input", (e) => { b.email = e.target.value; refreshNext(); });
      const bindText = (id, key) => { const n = el(id); n && n.addEventListener("input", (e) => (b[key] = e.target.value)); };
      bindText("f-origin", "origin"); bindText("f-dest", "dest");
      const vol = el("f-volume"); vol && vol.addEventListener("change", (e) => (b.volume = e.target.value));
      const inc = el("f-incoterm"); inc && inc.addEventListener("change", (e) => (b.incoterm = e.target.value));

      $$("#ship-choices .choice").forEach((c) => c.addEventListener("click", () => {
        b.ship = b.ship === c.dataset.ship ? "" : c.dataset.ship;
        $$("#ship-choices .choice").forEach((x) => x.classList.toggle("sel", x.dataset.ship === b.ship));
      }));
      $$("#interest-choices .choice").forEach((c) => c.addEventListener("click", () => {
        const id = c.dataset.interest;
        const idx = b.interests.indexOf(id);
        if (idx >= 0) b.interests.splice(idx, 1); else b.interests.push(id);
        c.classList.toggle("sel");
        el("route-hint-slot").innerHTML = routeHint();
      }));
      const next = el("to-step2");
      next && next.addEventListener("click", () => { b.step = 2; render(); });
    } else if (b.step === 2) {
      $$(".slot-day").forEach((d) => d.addEventListener("click", () => {
        b.day = d.dataset.day; b.slot = null;
        $$(".slot-day").forEach((x) => x.classList.toggle("sel", x.dataset.day === b.day));
        el("slot-grid").innerHTML = slotGrid();
        bindSlots();
        el("to-step3").disabled = true;
      }));
      bindSlots();
      el("back-step1") && el("back-step1").addEventListener("click", () => { b.step = 1; render(); });
      el("to-step3") && el("to-step3").addEventListener("click", () => {
        // the confirmed slot lands in the assigned expert's Outlook calendar
        MOOV.schedule[bookingTeam()].entries[b.day + "|" + b.slot] =
          { state: "booked", with: b.company || "New prospect", type: "Intro call", teams: true, isNew: true };
        b.step = 3; render();
      });
    } else if (b.step === 3) {
      const join = $(".tb-join");
      join && join.addEventListener("click", (e) => { e.preventDefault(); toast("Prototype — the Teams meeting would open here"); });
    }
  }
  function bindSlots() {
    const b = MOOV.booking;
    $$("#slot-grid .slot").forEach((s) => {
      if (s.disabled) return;
      s.addEventListener("click", () => {
        b.slot = s.dataset.slot;
        $$("#slot-grid .slot").forEach((x) => x.classList.toggle("sel", x.dataset.slot === b.slot));
        el("to-step3").disabled = false;
      });
    });
  }

  /* =====================================================================
     VIEW: LOGIN
     ===================================================================== */
  function viewLogin() {
    return h(`
    <div class="login-wrap">
      <div class="login-side">
        <div class="ls-inner">
          <a class="brand" href="#/" style="color:#fff">${logoMark()} MOOV</a>
          <h2>The whole journey, in one place.</h2>
          <p>Every booking, container and customs event — live, with proactive alerts before problems reach your shelves.</p>
        </div>
        <div class="quote">
          <p style="color:#fff;font-size:17px">"MOOV took our China-to-Europe lane from a spreadsheet to a control tower. We see issues before our stores do."</p>
          <p class="muted" style="margin-top:10px;color:#9fb2d0">Katrin Vogel · Head of Import Logistics, Lidl Trading</p>
        </div>
      </div>
      <div class="login-form-side">
        <div class="login-form">
          <a class="brand" href="#/" style="margin-bottom:26px">${logoMark()} MOOV</a>
          <h1>Client portal</h1>
          <p class="muted" style="margin-top:8px">Sign in to your MOOV account.</p>
          <div class="field"><label>Work email</label><input class="input" id="l-email" value="katrin.vogel@lidl-trading.com"></div>
          <div class="field"><label>Password</label><input class="input" type="password" value="demo-access"></div>
          <button class="btn btn-primary btn-block" id="do-login" style="margin-top:22px">${I('users','i-sm')} Sign in as Client — Lidl Trading</button>
          <button class="btn btn-dark btn-block" id="do-login-ops" style="margin-top:10px">${I('hub','i-sm')} Sign in as MOOV Ops</button>
          <div class="demo-note">${I('info','i-sm')} <span><b>Prototype demo — one login, two roles.</b> The same entry point renders a different portal by role: clients see only their own account; MOOV Ops sees every client. No real authentication behind this yet.</span></div>
          <p class="center" style="margin-top:20px;font-size:14px"><span class="muted">Not a client yet?</span> <a class="link" href="#/book">Book an intro call ${I('arrow','i-sm')}</a></p>
        </div>
      </div>
    </div>`);
  }

  /* =====================================================================
     CLIENT DASHBOARD SHELL
     ===================================================================== */
  function topbar(title, crumb, searchScope) {
    return `
        <div class="topbar">
          <button class="hamburger" id="ham">${I('menu','i-sm')}</button>
          <div>
            ${crumb?`<div class="t-crumb">${crumb}</div>`:''}
            <div class="t-title">${title}</div>
          </div>
          <div class="spacer"></div>
          <div class="search-wrap">
            <div class="searchbox">${I('search','i-sm')}<input id="global-search" placeholder="Search containers, POs…" autocomplete="off" data-scope="${searchScope}"></div>
            <div id="search-drop"></div>
          </div>
          <div class="bell-wrap">
            <button class="icon-btn" id="bell-btn" aria-label="Notifications">${I('bell','i-sm')}<span class="bump"></span></button>
            <div id="bell-drop"></div>
          </div>
        </div>`;
  }

  function appShell(active, title, crumb, body) {
    const c = MOOV.client;
    const unread = MOOV.unreadCount();
    const navItem = (hash, icon, label, key, badge) =>
      `<a href="${hash}" class="${active===key?'active':''}">${I(icon)} ${label}${badge?`<span class="nbadge">${badge}</span>`:''}</a>`;
    return h(`
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <a class="brand" href="#/">${logoMark()} MOOV</a>
        <span class="role-chip">${I('users','i-sm')} Client portal</span>
        <nav class="side-nav">
          ${navItem('#/app','grid','Overview','overview')}
          ${navItem('#/app/shipments','box','Shipments','shipments')}
          ${navItem('#/app/bookings','calendar','Bookings','bookings')}
          ${navItem('#/app/documents','doc','Documents','documents')}
          ${navItem('#/app/invoices','wallet','Invoices','invoices')}
          ${navItem('#/app/messages','life','Messages','messages', unread || '')}
        </nav>
        <div class="side-foot">
          <div class="side-user">
            <div class="av">KV</div>
            <div><div class="nm">${c.contact}</div><div class="rl">${c.name}</div></div>
          </div>
          <a href="#/" class="side-nav signout" style="display:flex;margin-top:6px"><span style="display:flex;align-items:center;gap:12px;padding:11px 14px;color:#9fb2d0;font-size:14px">${I('logout')} Sign out</span></a>
          <a class="side-switch" href="#/ops">Demo: switch to MOOV Ops view</a>
        </div>
      </aside>
      <div class="main">
        ${topbar(title, crumb, 'client')}
        <div class="content">${body}</div>
      </div>
    </div>
    <div class="toast" id="toast"></div>`);
  }

  function opsShell(active, title, crumb, body) {
    const navItem = (hash, icon, label, key, badge) =>
      `<a href="${hash}" class="${active===key?'active':''}">${I(icon)} ${label}${badge?`<span class="nbadge" style="background:var(--danger)">${badge}</span>`:''}</a>`;
    const openExceptions = MOOV.allShipments.filter((s) => s.flags.exception).length;
    return h(`
    <div class="app-shell">
      <aside class="sidebar ops" id="sidebar">
        <a class="brand" href="#/">${logoMark()} MOOV</a>
        <span class="role-chip">${I('hub','i-sm')} Operations console</span>
        <nav class="side-nav">
          ${navItem('#/ops','zap','Action queue','queue', MOOV.opsQueue.length)}
          ${navItem('#/ops/shipments','box','All shipments','shipments', openExceptions ? openExceptions : '')}
          ${navItem('#/ops/clients','building','Clients','clients')}
          ${navItem('#/ops/schedule','calendar','My schedule','schedule', Object.values(MOOV.schedule[MOOV.session.expert || 'strategic'].entries).filter(e=>e.state==='booked').length)}
        </nav>
        <div class="side-foot">
          <div class="side-user">
            <div class="av" style="background:linear-gradient(135deg,var(--blue-500),#6a4dff)">ÉC</div>
            <div><div class="nm">Élodie Chen</div><div class="rl">MOOV Operations</div></div>
          </div>
          <a href="#/" class="side-nav signout" style="display:flex;margin-top:6px"><span style="display:flex;align-items:center;gap:12px;padding:11px 14px;color:#9fb2d0;font-size:14px">${I('logout')} Sign out</span></a>
          <a class="side-switch" href="#/app">Demo: switch to client view</a>
        </div>
      </aside>
      <div class="main">
        ${topbar(title, crumb, 'ops')}
        <div class="content">${body}</div>
      </div>
    </div>
    <div class="toast" id="toast"></div>`);
  }

  let toastTimer = null;
  function toast(msg) {
    const t = el("toast");
    if (!t) return;
    t.innerHTML = I('check','i-sm') + ' ' + msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  function statusPill(s) {
    const st = MOOV.statusFor(s.stage, s.flags);
    return `<span class="pill pill-${st.tone}"><span class="dot"></span>${st.label}</span>`;
  }

  /* -- lane view: China origins → EU destinations, dots = shipments ---- */
  function laneView(ships, baseHref) {
    const X0 = 110, X1 = 530;
    const origins = { Shanghai: 52, Ningbo: 116, Shenzhen: 180 };
    const dests = { Hamburg: 72, Rotterdam: 160 };
    const qPoint = (t, x0, y0, cx, cy, x1, y1) => {
      const a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
      return [a * x0 + b * cx + c * x1, a * y0 + b * cy + c * y1];
    };
    // unique lanes present in the data
    const laneKeys = [...new Set(ships.map((s) => s.origin + ">" + s.dest))];
    const paths = laneKeys.map((k) => {
      const [o, d] = k.split(">");
      const oy = origins[o], dy = dests[d];
      const cy = (oy + dy) / 2 - 30;
      return `<path d="M ${X0} ${oy} Q 320 ${cy} ${X1} ${dy}" fill="none" stroke="var(--line)" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round"/>`;
    }).join("");
    // shipment dots, jittered when several share a lane
    const perLane = {};
    const dots = ships.map((s) => {
      const oy = origins[s.origin], dy = dests[s.dest];
      if (oy === undefined || dy === undefined) return "";
      const key = s.origin + ">" + s.dest;
      const n = (perLane[key] = (perLane[key] || 0) + 1);
      const t = Math.min(0.94, Math.max(0.05, (s.stage + 0.5) / 8 + (n - 1) * 0.045));
      const cy = (oy + dy) / 2 - 30;
      const [x, y] = qPoint(t, X0, oy, 320, cy, X1, dy);
      const color = s.flags.exception ? "var(--danger)" : s.flags.delayed ? "var(--warning)" : "var(--blue-500)";
      return `<a href="${baseHref}${s.id}"><circle class="lane-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7.5" fill="${color}" stroke="#fff" stroke-width="2.5"><title>${s.id} · ${s.origin} → ${s.dest} · ${MOOV.stages[s.stage]}</title></circle></a>`;
    }).join("");
    const portNode = (x, y, name, anchor) =>
      `<circle cx="${x}" cy="${y}" r="5" fill="var(--navy-800)"/><text x="${anchor === 'end' ? x - 14 : x + 14}" y="${y + 4}" text-anchor="${anchor}" font-size="12.5" font-weight="600" fill="var(--ink-2)">${name}</text>`;
    const ports =
      Object.entries(origins).map(([n, y]) => portNode(X0, y, n, "end")).join("") +
      Object.entries(dests).map(([n, y]) => portNode(X1, y, n, "start")).join("");
    return `<svg viewBox="0 0 640 216" role="img" aria-label="Shipments positioned along their trade lanes">
      <text x="110" y="22" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="1.5" fill="var(--ink-3)">CHINA</text>
      <text x="530" y="22" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="1.5" fill="var(--ink-3)">EUROPE</text>
      ${paths}${ports}${dots}
    </svg>`;
  }

  /* -- overview ------------------------------------------------------- */
  function viewOverview() {
    const ships = MOOV.shipments;
    const active = ships.filter((s) => s.stage < 7).length;
    const atSea = ships.filter((s) => s.stage === 4).length;
    const alerts = MOOV.alerts.length;
    const spend = MOOV.spendTrend[MOOV.spendTrend.length - 1].v; // €k current month
    const prev = MOOV.spendTrend[MOOV.spendTrend.length - 2].v;
    const spendDelta = (((spend - prev) / prev) * 100).toFixed(1);

    const kpis = `
      <div class="kpis">
        <a class="kpi" href="#/app/shipments?f=active"><div class="k-top"><div><div class="k-val">${active}</div><div class="k-lbl">Active shipments</div></div><div class="k-icn blue">${I('box')}</div></div><div class="k-delta flat">${I('trend','i-sm')} ${ships.length} total this quarter</div></a>
        <a class="kpi" href="#/app/shipments?f=sea"><div class="k-top"><div><div class="k-val">${atSea}</div><div class="k-lbl">Containers at sea</div></div><div class="k-icn teal">${I('anchor')}</div></div><div class="k-delta flat">${I('clock','i-sm')} Next arrival in 4 days</div></a>
        <a class="kpi" href="#/app/shipments?f=exception"><div class="k-top"><div><div class="k-val">${alerts}</div><div class="k-lbl">Open alerts</div></div><div class="k-icn rose">${I('alert')}</div></div><div class="k-delta down">1 needs your action</div></a>
        <a class="kpi" href="#/app/invoices"><div class="k-top"><div><div class="k-val tabular">€${spend}k</div><div class="k-lbl">Spend this month</div></div><div class="k-icn amber">${I('wallet')}</div></div><div class="k-delta ${spendDelta>=0?'up':'down'}">${I('trend','i-sm')} ${spendDelta>=0?'+':''}${spendDelta}% vs last month</div></a>
      </div>`;

    const maxV = Math.max(...MOOV.spendTrend.map((d) => d.v));
    const spark = MOOV.spendTrend.map((d, i) => {
      const now = i === MOOV.spendTrend.length - 1;
      const pct = Math.round((d.v / maxV) * 100);
      return `<div class="bar ${now?'now':''}"><span class="vv">€${d.v}k</span><div class="col" style="height:${pct}%"></div><span class="lb">${d.m}</span></div>`;
    }).join("");

    const alertItems = MOOV.alerts.map((a) => `
      <div class="alert-item">
        <div class="a-icn ${a.tone}">${I(a.tone==='danger'?'alert':a.tone==='warning'?'warn':'info','i-sm')}</div>
        <div>
          <div class="a-title">${a.title}</div>
          <div class="a-body">${a.body}</div>
          <div class="a-meta"><span>${a.shipment}</span><span>·</span><span>${a.when}</span><a href="#/app/shipments/${a.shipment}">View shipment ${I('chevron','i-sm')}</a></div>
        </div>
      </div>`).join("");

    // recent shipments (top 4)
    const recent = ships.slice(0, 4).map((s) => shipRow(s)).join("");
    const lanes = laneView(ships.filter((s) => s.stage < 7), "#/app/shipments/");

    const body = `
      <div class="page-head">
        <h1>Welcome back, Katrin</h1>
        <p>Here's where ${MOOV.client.name}'s freight stands today — ${fmtDate('2026-07-06')}.</p>
      </div>
      ${kpis}
      <div class="panel lane-panel" style="margin-top:18px">
        <div class="p-head"><h3>Live lane view</h3>
          <div class="lane-legend">
            <span><i style="background:var(--blue-500)"></i> On track</span>
            <span><i style="background:var(--warning)"></i> Delayed</span>
            <span><i style="background:var(--danger)"></i> Exception</span>
          </div>
        </div>
        ${lanes}
        <p class="muted" style="font-size:12.5px;margin-top:8px">Each dot is a live shipment, positioned by milestone progress. Click a dot to open it.</p>
      </div>
      <div class="grid-2">
        <div class="panel">
          <div class="p-head"><h3>Recent shipments</h3><a class="link" href="#/app/shipments">View all ${I('chevron','i-sm')}</a></div>
          <div class="table-wrap" style="border:none;box-shadow:none">
            <table class="tbl">
              <thead><tr><th>Container</th><th>Lane</th><th>Incoterm</th><th>Status</th></tr></thead>
              <tbody>${recent}</tbody>
            </table>
          </div>
        </div>
        <div class="panel">
          <div class="p-head"><h3>Monthly spend</h3><span class="muted" style="font-size:13px">€k</span></div>
          <div class="spark">${spark}</div>
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--line-2);display:flex;justify-content:space-between">
            <div><div class="muted" style="font-size:13px">This month</div><div style="font-size:20px;font-weight:800" class="tabular">€${spend},000</div></div>
            <div style="text-align:right"><div class="muted" style="font-size:13px">Quarter to date</div><div style="font-size:20px;font-weight:800" class="tabular">€739,000</div></div>
          </div>
        </div>
      </div>
      <div class="panel" style="margin-top:18px">
        <div class="p-head"><h3>Alerts & exceptions</h3><a class="link" href="#/app/shipments">Manage ${I('chevron','i-sm')}</a></div>
        ${alertItems}
      </div>
    `;
    return appShell("overview", "Overview", "", body);
  }

  function shipRow(s) {
    return `<tr class="clickable" data-ship="${s.id}">
      <td><div class="cid">${s.id}</div><div class="subtle">${s.ref}</div></td>
      <td><div class="route">${s.origin} ${I('arrow','i-sm')} ${s.dest}</div><div class="subtle">${s.mode}</div></td>
      <td><span class="incoterm">${s.incoterm}</span></td>
      <td>${statusPill(s)}</td>
    </tr>`;
  }

  /* -- shipments list ------------------------------------------------- */
  function shipTableRow(s, withClient) {
    return `
      <tr class="clickable" data-ship="${s.id}">
        <td><div class="cid">${s.id}</div><div class="subtle">${s.ref}</div></td>
        ${withClient ? `<td>${MOOV.clientName(s.client)}</td>` : ""}
        <td><div class="route">${s.origin} ${I('arrow','i-sm')} ${s.dest}</div><div class="subtle">${s.carrier} · ${s.vessel}</div></td>
        <td><span class="incoterm">${s.incoterm}</span></td>
        <td class="tabular">${s.containers} × 40'<div class="subtle">${s.teu} TEU · ${s.weightT}t</div></td>
        <td class="tabular">${fmtDate(s.eta)}</td>
        <td>${statusPill(s)}</td>
        <td style="text-align:right">${I('chevron','i-sm')}</td>
      </tr>`;
  }

  function viewShipments(initialFilter) {
    const f = initialFilter || "all";
    const rows = filterShipments(f, "").map((s) => shipTableRow(s)).join("");
    const segBtn = (key, label) => `<button class="${f===key?'on':''}" data-filter="${key}">${label}</button>`;
    const body = `
      <div class="page-head" style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap">
        <div style="flex:1">
          <h1>Shipments</h1>
          <p>${MOOV.shipments.length} shipments · ${MOOV.shipments.filter(s=>s.stage<7).length} in progress</p>
        </div>
        <a class="btn btn-primary btn-sm" href="#/app/bookings?new=1">${I('calendar','i-sm')} Request a booking</a>
      </div>
      <div class="table-wrap">
        <div class="table-toolbar">
          <div class="seg" id="filter-seg">
            ${segBtn('all','All')}${segBtn('active','In progress')}${segBtn('sea','At sea')}${segBtn('exception','Exceptions')}${segBtn('delivered','Delivered')}
          </div>
          <div class="spacer" style="flex:1"></div>
          <div class="searchbox" style="min-width:200px">${I('search','i-sm')}<input id="ship-search" placeholder="Container or PO…"></div>
        </div>
        <table class="tbl">
          <thead><tr><th>Container</th><th>Lane</th><th>Incoterm</th><th>Load</th><th>ETA</th><th>Status</th><th></th></tr></thead>
          <tbody id="ship-tbody">${rows}</tbody>
        </table>
      </div>`;
    return appShell("shipments", "Shipments", `<a href="#/app">Client portal</a>`, body);
  }

  function filterShipments(filter, query) {
    query = (query || "").trim().toLowerCase();
    return MOOV.shipments.filter((s) => {
      let ok = true;
      if (filter === "active") ok = s.stage < 7;
      else if (filter === "sea") ok = s.stage === 4;
      else if (filter === "exception") ok = !!s.flags.exception;
      else if (filter === "delivered") ok = s.stage === 7;
      if (ok && query) ok = (s.id + " " + s.ref + " " + s.commodity).toLowerCase().includes(query);
      return ok;
    });
  }

  /* -- shipment detail ------------------------------------------------ */
  function viewShipmentDetail(id, ops) {
    const shell = ops ? opsShell : appShell;
    const backHref = ops ? "#/ops/shipments" : "#/app/shipments";
    const s = (ops ? MOOV.allShipments : MOOV.shipments).find((x) => x.id === id);
    if (!s) {
      return shell("shipments", "Not found", `<a href="${backHref}">Shipments</a>`, `<div class="panel"><p>Shipment <b>${id}</b> was not found. <a class="link" href="${backHref}">Back to shipments</a></p></div>`);
    }
    const stageEvents = {};
    s.events.forEach((e) => (stageEvents[e.stage] = e));
    const exception = !!s.flags.exception;

    const track = MOOV.stages.map((label, i) => {
      let cls = "";
      if (i < s.stage) cls = "done";
      else if (i === s.stage) cls = "current";
      const ev = stageEvents[i];
      const tm = ev ? ev.ts.split(" ")[0].slice(5).replace("-", "/") : "";
      const icon = cls === "done" ? I("check", "i-sm") : "";
      return `<div class="node ${cls}"><div class="line"></div><div class="dot">${icon}</div><div class="lbl">${label}</div>${tm?`<div class="tm">${tm}</div>`:''}</div>`;
    }).join("");

    const docsUnderReview = s.flags.docsUploaded;
    const banner = exception ? (docsUnderReview ? `
      <div class="banner warning">
        <div class="b-icn">${I('clock')}</div>
        <div><b>Documents received — under broker review</b><p>Our Hamburg broker is reviewing your documents and will resubmit the declaration the same day.</p></div>
      </div>` : `
      <div class="banner danger">
        <div class="b-icn">${I('alert')}</div>
        <div><b>${s.flags.exceptionLabel}</b><p>${s.flags.note}</p></div>
        ${ops ? "" : `<div style="margin-left:auto"><a class="btn btn-dark btn-sm" href="#req-docs" id="jump-docs">Upload documents</a></div>`}
      </div>`) : (s.flags.delayed ? `
      <div class="banner warning">
        <div class="b-icn">${I('warn')}</div>
        <div><b>Delay notice</b><p>${s.flags.note}</p></div>
      </div>` : "");

    /* required-from-you checklist (client side, exception shipments) --- */
    const reqDocs = MOOV.documents.filter((d) => d.ship === s.id && (d.status === "required" || d.justUploaded));
    const reqCard = (!ops && exception && reqDocs.length) ? `
      <div class="req-card ${docsUnderReview?'done':''}" id="req-docs">
        <h3>${I(docsUnderReview?'clock':'alert','i-sm')} ${docsUnderReview ? 'Documents under review' : 'Required from you — ' + reqDocs.filter(d=>d.status==='required').length + ' document' + (reqDocs.filter(d=>d.status==='required').length>1?'s':'')}</h3>
        <p style="font-size:13.5px;color:var(--ink-2);margin-top:6px">${docsUnderReview ? 'Thanks — everything is in. Our broker resubmits the declaration today.' : 'Customs can\'t release this container until these are uploaded. Our broker resubmits the same day they arrive.'}</p>
        ${reqDocs.map((d) => `
          <div class="req-item ${d.status!=='required'?'done':''}">
            <div class="ri-box">${d.status!=='required'?I('check','i-sm'):''}</div>
            <div><div class="ri-name">${d.type}</div><div class="ri-hint">${d.status!=='required' ? 'Uploaded just now — under review' : (d.hint || '')}</div></div>
          </div>`).join("")}
        ${docsUnderReview ? "" : `
        <label class="dropzone" id="dropzone" for="file-input">
          ${I('doc')} <b>Drop files here</b> or click to browse — PDF, JPG or PNG
          <input type="file" id="file-input" multiple accept=".pdf,.jpg,.jpeg,.png" style="display:none">
        </label>`}
      </div>` : "";

    /* documents panel for this shipment -------------------------------- */
    const shipDocs = MOOV.docsFor(s.id);
    const docsPanel = shipDocs.length ? `
      <div class="panel" style="margin-top:18px">
        <div class="p-head"><h3>Documents</h3><a class="link" href="#/app/documents">All documents ${I('chevron','i-sm')}</a></div>
        ${shipDocs.map((d) => `
          <div class="alert-item">
            <div class="doc-icn">${I('doc','i-sm')}</div>
            <div style="flex:1">
              <div class="a-title">${d.type}</div>
              <div class="a-body">${d.status==='required' ? (d.hint || 'Not yet provided.') : `${d.name} · ${d.size} · ${fmtDate(d.date)}`}</div>
            </div>
            <div style="align-self:center">${docPill(d)}</div>
            <div style="align-self:center">${d.status==='available' ? `<button class="btn btn-ghost btn-sm doc-dl" data-doc="${d.id}">Download</button>` : ""}</div>
          </div>`).join("")}
      </div>` : "";

    /* ops-only action row ---------------------------------------------- */
    const opsActions = ops ? `
      <div class="ops-actions">
        ${s.stage < 7 ? `<button class="btn btn-primary btn-sm" id="ops-advance">${I('check','i-sm')} Advance milestone → ${MOOV.stages[s.stage + 1] || ''}</button>` : ""}
        ${exception ? `<button class="btn btn-dark btn-sm" id="ops-resolve">${I('shield','i-sm')} Resolve hold</button>` : ""}
        <span class="chip">${I('building','i-sm')} ${MOOV.clientName(s.client)}</span>
      </div>` : "";

    const facts = [
      ["Origin", `${s.origin} (${s.originPort})`],
      ["Destination", `${s.dest} (${s.destPort})`],
      ["Incoterm", `<span class="incoterm">${s.incoterm}</span>`],
      ["Mode", s.mode],
      ["Carrier", s.carrier],
      ["Vessel", s.vessel],
      ["Commodity", s.commodity],
      ["Load", `${s.containers} × 40' · ${s.teu} TEU · ${s.weightT}t`],
      ["ETD", fmtDate(s.etd)],
      ["ETA", fmtDate(s.eta) + (s.flags.delayed ? ' <span class="pill pill-warning" style="margin-left:6px">revised</span>' : "")],
      ["Cargo value", eur(s.valueEur)],
      ["PO reference", s.ref],
    ].map(([k, v]) => `<div class="fact"><div class="fk">${k}</div><div class="fv">${v}</div></div>`).join("");

    // timeline (reverse chronological)
    const tl = [...s.events].reverse().map((e, idx) => {
      const isCurrent = e.stage === s.stage && !exception;
      const cls = isCurrent ? "current" : "";
      return `<div class="tl-item ${cls}">
        <div class="tl-dot"></div>
        <div>
          <div class="tl-stage">${MOOV.stages[e.stage]}</div>
          <div class="tl-note">${e.note}</div>
          <div class="tl-meta">${I('pin','i-sm')} ${e.place} · ${e.ts}</div>
        </div>
      </div>`;
    }).join("");

    const body = `
      <a class="back-link" href="${backHref}">${I('chevleft','i-sm')} All shipments</a>
      <div class="detail-head">
        <div class="dh-main">
          <h1>${s.id}</h1>
          <div class="dh-sub">
            <span>${s.ref}</span><span>·</span>
            <span class="route" style="display:inline-flex;align-items:center;gap:6px">${s.origin} ${I('arrow','i-sm')} ${s.dest}</span><span>·</span>
            <span>${s.carrier} · ${s.vessel}</span>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          ${statusPill(s)}
          ${ops ? "" : `<a class="btn btn-primary btn-sm" href="#/app/messages/${s.id}">${I('life','i-sm')} Message MOOV</a>`}
        </div>
      </div>

      ${opsActions}
      ${banner}
      ${reqCard}

      <div class="tracker">
        <div class="track ${exception?'exception':''}">${track}</div>
      </div>

      <div class="detail-grid">
        <div>
          <div class="panel">
            <div class="p-head"><h3>Shipment details</h3></div>
            <div class="facts">${facts}</div>
          </div>
          ${ops ? "" : docsPanel}
        </div>
        <div class="panel">
          <div class="p-head"><h3>Milestone history</h3></div>
          <div class="timeline">${tl}</div>
        </div>
      </div>
    `;
    return shell("shipments", s.id, `<a href="${backHref}">Shipments</a> · ${MOOV.clientName(s.client)}`, body);
  }

  function docPill(d) {
    return d.status === "available" ? `<span class="pill pill-success"><span class="dot"></span>Available</span>`
      : d.status === "review" || d.justUploaded ? `<span class="pill pill-warning"><span class="dot"></span>Under review</span>`
      : `<span class="pill pill-danger"><span class="dot"></span>Required from you</span>`;
  }

  /* client uploads the missing docs → shipment moves to "under review" */
  function completeDocUpload(shipId) {
    const s = MOOV.allShipments.find((x) => x.id === shipId);
    if (!s) return;
    MOOV.documents.forEach((d) => {
      if (d.ship === shipId && d.status === "required") {
        d.status = "review"; d.justUploaded = true;
        d.name = d.type.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".pdf";
        d.date = "2026-07-06"; d.size = "102 KB";
      }
    });
    s.flags.docsUploaded = true;
    s.events.push({ stage: s.stage, ts: "2026-07-06 · just now", place: "Client portal", note: "Documents uploaded by Lidl Trading — broker review in progress." });
    const alert = MOOV.alerts.find((a) => a.shipment === shipId);
    if (alert) { alert.tone = "info"; alert.title = "Documents received — under review"; alert.body = "Uploaded documents are with our Hamburg broker. Declaration will be resubmitted today."; alert.when = "Just now"; }
  }

  /* =====================================================================
     VIEW: BOOKINGS (client)
     ===================================================================== */
  function bookingPill(status) {
    const tone = status === "Confirmed" ? "success" : status === "Quote sent" ? "info" : "warning";
    return `<span class="pill pill-${tone}"><span class="dot"></span>${status}</span>`;
  }

  function viewBookings(showForm) {
    const rows = MOOV.bookingRequests.map((b) => `
      <tr>
        <td><div class="cid">${b.id}</div><div class="subtle">Requested ${fmtDate(b.requested)}</div></td>
        <td><div class="route">${b.origin} ${I('arrow','i-sm')} ${b.dest}</div><div class="subtle">${b.commodity}</div></td>
        <td class="tabular">${b.containers}</td>
        <td><span class="incoterm">${b.incoterm}</span></td>
        <td class="tabular">${fmtDate(b.ready)}</td>
        <td>${bookingPill(b.status)}${b.quoteEur ? `<div class="subtle" style="margin-top:4px">Quoted ${eur(b.quoteEur)} all-in</div>` : ""}${b.ship ? `<div class="subtle" style="margin-top:4px"><a class="link" href="#/app/shipments/${b.ship}">→ ${b.ship}</a></div>` : ""}</td>
      </tr>`).join("");

    const formCard = `
      <div class="form-card ${showForm ? '' : 'hide'}" id="bkg-form">
        <h3 style="font-size:17px">New booking request</h3>
        <p class="muted" style="font-size:14px;margin-top:4px">Your freight desk prices most lanes within one business day.</p>
        <div class="field-row">
          <div class="field"><label>Origin</label>
            <select class="select" id="bk-origin"><option>Shanghai</option><option>Ningbo</option><option>Shenzhen</option></select></div>
          <div class="field"><label>Destination</label>
            <select class="select" id="bk-dest"><option>Hamburg</option><option>Rotterdam</option></select></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Load</label>
            <select class="select" id="bk-load"><option>1 × 40'</option><option>2 × 40'</option><option>2 × 40'HC</option><option>3 × 40'</option><option>4 × 40'</option><option>LCL</option></select></div>
          <div class="field"><label>Incoterm</label>
            <select class="select" id="bk-incoterm"><option>FOB</option><option>CIF</option><option>EXW</option><option>DAP</option><option>DDP</option></select></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Cargo ready date</label><input class="input" id="bk-ready" type="date" value="2026-07-24"></div>
          <div class="field"><label>Commodity</label><input class="input" id="bk-commodity" placeholder="e.g. Homeware"></div>
        </div>
        <div class="card-actions" style="margin-top:20px">
          <button class="btn btn-ghost btn-sm" id="bk-cancel">Cancel</button>
          <button class="btn btn-primary btn-sm" id="bk-submit">${I('check','i-sm')} Submit request</button>
        </div>
      </div>`;

    const body = `
      <div class="page-head" style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap">
        <div style="flex:1">
          <h1>Bookings</h1>
          <p>Request quotes and new shipments without leaving the portal.</p>
        </div>
        <button class="btn btn-primary btn-sm ${showForm ? 'hide' : ''}" id="bk-new">${I('calendar','i-sm')} New booking request</button>
      </div>
      ${formCard}
      <div class="table-wrap">
        <table class="tbl">
          <thead><tr><th>Request</th><th>Lane</th><th>Load</th><th>Incoterm</th><th>Cargo ready</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    return appShell("bookings", "Bookings", `<a href="#/app">Client portal</a>`, body);
  }

  /* =====================================================================
     VIEW: DOCUMENTS (client)
     ===================================================================== */
  function viewDocuments() {
    const required = MOOV.documents.filter((d) => d.status === "required").length;
    const review = MOOV.documents.filter((d) => d.status === "review").length;
    const avail = MOOV.documents.filter((d) => d.status === "available").length;
    const rows = MOOV.documents.map((d) => `
      <tr>
        <td style="width:44px"><div class="doc-icn">${I('doc','i-sm')}</div></td>
        <td><div class="cid" style="font-size:14px">${d.type}</div><div class="subtle">${d.status==='required' ? (d.hint || 'Not yet provided') : d.name + ' · ' + d.size}</div></td>
        <td><a class="link" href="#/app/shipments/${d.ship}">${d.ship}</a></td>
        <td class="tabular">${d.date ? fmtDate(d.date) : '—'}</td>
        <td>${docPill(d)}</td>
        <td style="text-align:right">${d.status === 'available'
          ? `<button class="btn btn-ghost btn-sm doc-dl" data-doc="${d.id}">Download</button>`
          : d.status === 'required'
          ? `<a class="btn btn-dark btn-sm" href="#/app/shipments/${d.ship}">Upload</a>`
          : ''}</td>
      </tr>`).join("");
    const body = `
      <div class="page-head">
        <h1>Documents</h1>
        <p>Every bill of lading, invoice, packing list and customs document — in one place.</p>
      </div>
      <div class="mini-stats">
        <div class="mini-stat"><div class="ms-k">Available to download</div><div class="ms-v">${avail}</div></div>
        <div class="mini-stat"><div class="ms-k">Under broker review</div><div class="ms-v">${review}</div></div>
        <div class="mini-stat ${required ? 'rose' : ''}"><div class="ms-k">Required from you</div><div class="ms-v">${required}</div></div>
      </div>
      <div class="table-wrap">
        <table class="tbl">
          <thead><tr><th></th><th>Document</th><th>Shipment</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    return appShell("documents", "Documents", `<a href="#/app">Client portal</a>`, body);
  }

  /* =====================================================================
     VIEW: INVOICES (client)
     ===================================================================== */
  function viewInvoices() {
    const open = MOOV.invoices.filter((i) => i.status !== "paid").reduce((a, b) => a + b.amountEur, 0);
    const overdue = MOOV.invoices.filter((i) => i.status === "overdue").reduce((a, b) => a + b.amountEur, 0);
    const paid = MOOV.invoices.filter((i) => i.status === "paid").reduce((a, b) => a + b.amountEur, 0);
    const pill = (st) => st === "paid" ? `<span class="pill pill-success"><span class="dot"></span>Paid</span>`
      : st === "overdue" ? `<span class="pill pill-danger"><span class="dot"></span>Overdue</span>`
      : `<span class="pill pill-info"><span class="dot"></span>Due</span>`;
    const rows = MOOV.invoices.map((i) => `
      <tr>
        <td><div class="cid">${i.id}</div><div class="subtle">${i.desc}</div></td>
        <td class="tabular">${fmtDate(i.issued)}</td>
        <td class="tabular">${fmtDate(i.due)}</td>
        <td>${i.ships.map((sh) => `<a class="link" href="#/app/shipments/${sh}" style="font-size:13px;display:block">${sh}</a>`).join("")}</td>
        <td class="tabular" style="font-weight:700">${eur(i.amountEur)}</td>
        <td>${pill(i.status)}</td>
        <td style="text-align:right"><button class="btn btn-ghost btn-sm inv-dl" data-inv="${i.id}">PDF</button></td>
      </tr>`).join("");
    const body = `
      <div class="page-head">
        <h1>Invoices</h1>
        <p>July's three invoices make up the €249,000 shown on your overview.</p>
      </div>
      <div class="mini-stats">
        <div class="mini-stat"><div class="ms-k">Open balance</div><div class="ms-v tabular">${eur(open)}</div></div>
        <div class="mini-stat rose"><div class="ms-k">Overdue</div><div class="ms-v tabular">${eur(overdue)}</div></div>
        <div class="mini-stat"><div class="ms-k">Paid — last 60 days</div><div class="ms-v tabular">${eur(paid)}</div></div>
      </div>
      <div class="table-wrap">
        <table class="tbl">
          <thead><tr><th>Invoice</th><th>Issued</th><th>Due</th><th>Shipments</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    return appShell("invoices", "Invoices", `<a href="#/app">Client portal</a>`, body);
  }

  /* =====================================================================
     VIEW: MESSAGES (client) — one thread per shipment
     ===================================================================== */
  function viewMessages(shipId) {
    const activeId = shipId || (MOOV.threads[0] && MOOV.threads[0].ship);
    let active = MOOV.threadFor(activeId);
    if (shipId && !active) {
      // starting a fresh thread from a shipment's "Message MOOV" button
      active = { ship: shipId, unread: 0, messages: [] };
      MOOV.threads.unshift(active);
    }
    if (active) active.unread = 0;

    const list = MOOV.threads.map((t) => {
      const last = t.messages[t.messages.length - 1];
      const s = MOOV.allShipments.find((x) => x.id === t.ship);
      return `<a class="thread-item ${active && t.ship === active.ship ? 'on' : ''}" href="#/app/messages/${t.ship}">
        <div class="th-ship">${t.unread ? '<span class="unread-dot"></span>' : ''}${t.ship}</div>
        <div class="th-prev">${last ? last.text : 'New conversation'}</div>
        <div class="subtle" style="font-size:11.5px;margin-top:4px">${s ? s.origin + ' → ' + s.dest : ''}</div>
      </a>`;
    }).join("");

    const chat = active ? `
      <div class="chat">
        <div class="chat-head">
          <div>
            <div style="font-weight:700">${active.ship}</div>
            <div class="subtle" style="font-size:12.5px">Thread stays attached to this container — <a class="link" href="#/app/shipments/${active.ship}">open shipment</a></div>
          </div>
        </div>
        <div class="chat-body" id="chat-body">
          ${active.messages.length ? active.messages.map((m) => `
            <div class="bubble-row ${m.from}">
              <div class="bubble">${m.text}<div class="b-meta">${m.name} · ${m.ts}</div></div>
            </div>`).join("") : `<div class="chat-empty">No messages yet — ask your MOOV team anything about this shipment.</div>`}
        </div>
        <div class="chat-compose">
          <input class="input" id="chat-input" placeholder="Message your MOOV team about ${active.ship}…">
          <button class="btn btn-primary btn-sm" id="chat-send">Send ${I('arrow','i-sm')}</button>
        </div>
      </div>` : `<div class="chat"><div class="chat-empty">Select a conversation.</div></div>`;

    const body = `
      <div class="page-head">
        <h1>Messages</h1>
        <p>Questions stay attached to the shipment they're about — no more email archaeology.</p>
      </div>
      <div class="msg-grid">
        <div class="thread-list">${list}</div>
        ${chat}
      </div>
      <p class="muted" style="font-size:12.5px;margin-top:12px">${I('clock','i-sm')} Your MOOV team typically replies within 2 business hours (07:00–19:00 CET).</p>`;
    return appShell("messages", "Messages", `<a href="#/app">Client portal</a>`, body);
  }

  /* =====================================================================
     OPS VIEWS
     ===================================================================== */
  function viewOpsQueue() {
    const exceptions = MOOV.allShipments.filter((s) => s.flags.exception).length;
    const inTransit = MOOV.allShipments.filter((s) => s.stage >= 3 && s.stage < 7).length;
    const quotesPending = MOOV.bookingRequests.filter((b) => b.status === "Pending review").length;
    const kpis = `
      <div class="kpis">
        <a class="kpi" href="#/ops/shipments?f=exception"><div class="k-top"><div><div class="k-val">${exceptions}</div><div class="k-lbl">Open exceptions</div></div><div class="k-icn rose">${I('alert')}</div></div><div class="k-delta down">Across ${MOOV.clientsAll.length} accounts</div></a>
        <a class="kpi" href="#/ops/shipments"><div class="k-top"><div><div class="k-val">${inTransit}</div><div class="k-lbl">Shipments in transit</div></div><div class="k-icn blue">${I('ship')}</div></div><div class="k-delta flat">${MOOV.allShipments.length} total live</div></a>
        <a class="kpi" href="#/ops"><div class="k-top"><div><div class="k-val">${quotesPending}</div><div class="k-lbl">Quotes to price</div></div><div class="k-icn amber">${I('wallet')}</div></div><div class="k-delta flat">Oldest: 6 days</div></a>
        <a class="kpi" href="#/ops/clients"><div class="k-top"><div><div class="k-val">${MOOV.clientsAll.length}</div><div class="k-lbl">Active clients</div></div><div class="k-icn teal">${I('building')}</div></div><div class="k-delta up">${I('trend','i-sm')} smartMOOV: 1 account</div></a>
      </div>`;
    const queue = MOOV.opsQueue.map((q) => `
      <div class="q-item">
        <div class="q-pri ${q.pri}"></div>
        <div style="flex:1">
          <div class="q-title">${q.title}</div>
          <div class="q-detail">${q.detail}</div>
          <div class="q-meta">
            <span class="chip">${I('building','i-sm')} ${MOOV.clientName(q.client)}</span>
            ${q.ship ? `<span>·</span><a class="link" href="#/ops/shipments/${q.ship}">${q.ship}</a>` : ""}
            ${q.booking ? `<span>·</span><span>${q.booking}</span>` : ""}
            <span>·</span><span>open ${q.age}</span>
          </div>
        </div>
        ${q.ship ? `<a class="btn btn-ghost btn-sm" style="align-self:center" href="#/ops/shipments/${q.ship}">Open</a>` : ""}
      </div>`).join("");
    const lanes = laneView(MOOV.allShipments.filter((s) => s.stage < 7), "#/ops/shipments/");
    const body = `
      <div class="page-head">
        <h1>Operations — action queue</h1>
        <p>Everything that needs a MOOV hand today, across every client account.</p>
      </div>
      ${kpis}
      <div class="grid-2" style="align-items:start">
        <div class="panel">
          <div class="p-head"><h3>Needs action (${MOOV.opsQueue.length})</h3></div>
          ${queue}
        </div>
        <div class="panel lane-panel">
          <div class="p-head"><h3>All clients — lane view</h3></div>
          ${lanes}
        </div>
      </div>`;
    return opsShell("queue", "Action queue", "Operations console", body);
  }

  function viewOpsShipments(clientFilter, statusFilter) {
    const cf = clientFilter || "all";
    let list = MOOV.allShipments.filter((s) => cf === "all" || s.client === cf);
    if (statusFilter === "exception") list = list.filter((s) => s.flags.exception);
    const rows = list.map((s) => shipTableRow(s, true)).join("");
    const opts = [`<option value="all" ${cf==='all'?'selected':''}>All clients</option>`]
      .concat(MOOV.clientsAll.map((c) => `<option value="${c.id}" ${cf===c.id?'selected':''}>${c.name}</option>`)).join("");
    const body = `
      <div class="page-head">
        <h1>All shipments</h1>
        <p>${list.length} shipments${cf !== 'all' ? ' · ' + MOOV.clientName(cf) : ' across all accounts'}${statusFilter==='exception' ? ' · exceptions only' : ''}</p>
      </div>
      <div class="table-wrap">
        <div class="table-toolbar">
          <select class="select" id="ops-client-filter" style="width:auto;min-width:200px;padding:9px 13px">${opts}</select>
          ${statusFilter==='exception' ? `<a class="link" href="#/ops/shipments">Clear exception filter</a>` : ""}
          <div class="spacer" style="flex:1"></div>
        </div>
        <table class="tbl">
          <thead><tr><th>Container</th><th>Client</th><th>Lane</th><th>Incoterm</th><th>Load</th><th>ETA</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows || `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--ink-3)">No shipments match.</td></tr>`}</tbody>
        </table>
      </div>`;
    return opsShell("shipments", "All shipments", `<a href="#/ops">Operations console</a>`, body);
  }

  function viewOpsClients() {
    const cards = MOOV.clientsAll.map((c) => {
      const ships = MOOV.allShipments.filter((s) => s.client === c.id);
      const activeN = ships.filter((s) => s.stage < 7).length;
      const excN = ships.filter((s) => s.flags.exception).length;
      const initials = c.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
      return `
      <div class="client-card">
        <div class="cc-head">
          <div class="cc-av">${initials}</div>
          <div>
            <div style="font-weight:800;font-size:16px">${c.name}</div>
            <div class="subtle" style="font-size:12.5px">${c.id} · ${c.country} · since ${c.since}</div>
          </div>
        </div>
        <div class="cc-stats">
          <div><div class="k">Active</div><div class="v">${activeN}</div></div>
          <div><div class="k">Exceptions</div><div class="v" style="${excN?'color:var(--danger)':''}">${excN}</div></div>
          <div><div class="k">Spend / mo</div><div class="v tabular">€${c.spendMonthK}k</div></div>
        </div>
        <div class="subtle" style="font-size:13px;margin-bottom:14px">${I('users','i-sm')} ${c.contact} · Account manager: ${c.manager}</div>
        <a class="btn btn-ghost btn-sm btn-block" href="#/ops/shipments?c=${c.id}">View shipments ${I('chevron','i-sm')}</a>
      </div>`;
    }).join("");
    const body = `
      <div class="page-head">
        <h1>Clients</h1>
        <p>Every account MOOV operates, with live workload per client.</p>
      </div>
      <div class="client-cards">${cards}</div>`;
    return opsShell("clients", "Clients", `<a href="#/ops">Operations console</a>`, body);
  }

  /* =====================================================================
     OPS: MY SCHEDULE & AVAILABILITY
     The same entries power the public "Book a call" slot picker —
     blocking a slot here hides it from prospects instantly.
     ===================================================================== */
  function viewOpsSchedule() {
    const expKey = MOOV.session.expert || "strategic";
    const exp = MOOV.experts[expKey];
    const cal = MOOV.calendars[expKey];
    let booked = 0, blocked = 0, busy = 0, open = 0;
    MOOV.slotDays.forEach((d) => MOOV.slotTimes.forEach((t) => {
      const st = MOOV.slotState(expKey, d.iso, t.cet).state;
      if (st === "booked") booked++; else if (st === "blocked") blocked++;
      else if (st === "busy") busy++; else open++;
    }));

    const headRow = `<div class="sched-corner">
        <div style="font-weight:700;font-size:12.5px">CET</div>
        <div class="subtle" style="font-size:11.5px">CST +6h</div>
      </div>` + MOOV.slotDays.map((d) => {
        const [dow, ...rest] = d.date.split(" ");
        return `<button class="sched-day" data-day="${d.iso}" title="Toggle the whole day">
          <div class="sd-dow">${dow}</div><div class="sd-date">${rest.join(" ")}</div>
          <div class="sd-hint">toggle day</div>
        </button>`;
      }).join("");

    const rows = MOOV.slotTimes.map((t) => {
      const cells = MOOV.slotDays.map((d) => {
        const key = d.iso + "|" + t.cet;
        const e = MOOV.slotState(expKey, d.iso, t.cet);
        if (e.state === "booked") {
          return `<button class="sched-cell booked ${e.isNew?'isnew':''}" data-key="${key}" title="Booked calls can't be blocked here">
            ${I('lock','i-sm')} <div class="sc-t">${e.with}</div><div class="sc-s">${e.type}${e.teams?' · Teams':''}${e.isNew?' · just booked':''}</div>
          </button>`;
        }
        if (e.state === "blocked") {
          return `<button class="sched-cell blocked" data-key="${key}" title="Click to reopen this slot">
            <div class="sc-t">Blocked</div><div class="sc-s">${e.reason || 'Unavailable'}</div>
          </button>`;
        }
        if (e.state === "busy") {
          return `<button class="sched-cell busy" data-key="${key}" title="Synced from your Outlook calendar">
            ${I('calendar','i-sm')} <div class="sc-t">${e.title}</div><div class="sc-s">Outlook · auto-blocked</div>
          </button>`;
        }
        return `<button class="sched-cell free" data-key="${key}" title="Click to block this slot">
          <div class="sc-t">Available</div><div class="sc-s">on booking page</div>
        </button>`;
      }).join("");
      return `<div class="sched-time"><div style="font-weight:700">${t.cet}</div><div class="subtle" style="font-size:11.5px">${t.cst}</div></div>${cells}`;
    }).join("");

    const calPanel = cal.connected ? `
      <div class="cal-connect on">
        <div class="cc-icn">${I('calendar')}</div>
        <div style="flex:1">
          <b><span class="cc-dot"></span> ${cal.provider} connected</b>
          <div class="muted" style="font-size:13px">${cal.account} · Outlook &amp; Teams · last synced ${cal.lastSync}. Meetings auto-block your bookable slots — titles are never shown to prospects.</div>
        </div>
        <button class="btn btn-ghost btn-sm" id="cal-sync">${I('trend','i-sm')} Sync now</button>
        <button class="btn btn-ghost btn-sm" id="cal-toggle">Disconnect</button>
      </div>` : `
      <div class="cal-connect">
        <div class="cc-icn off">${I('calendar')}</div>
        <div style="flex:1">
          <b>Calendar not connected</b>
          <div class="muted" style="font-size:13px">Connect ${cal.provider} to auto-block slots when you have Outlook or Teams meetings — no manual upkeep, no double-booking.</div>
        </div>
        <button class="btn btn-primary btn-sm" id="cal-toggle">${I('zap','i-sm')} Connect ${cal.provider}</button>
      </div>`;

    const body = `
      <div class="page-head" style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap">
        <div style="flex:1">
          <h1>My schedule & availability</h1>
          <p>What you open here is exactly what prospects can book on the public “Book a call” page.</p>
        </div>
        <select class="select" id="sched-expert" style="width:auto;padding:9px 13px">
          <option value="strategic" ${expKey==='strategic'?'selected':''}>Élodie Chen — Strategic team</option>
          <option value="freight" ${expKey==='freight'?'selected':''}>Hao Lin — Freight desk</option>
        </select>
      </div>
      ${calPanel}
      <div class="mini-stats" style="grid-template-columns:repeat(4,1fr)">
        <div class="mini-stat"><div class="ms-k">Booked calls this week</div><div class="ms-v">${booked}</div></div>
        <div class="mini-stat"><div class="ms-k">Open to prospects</div><div class="ms-v" style="color:var(--success)">${open}</div></div>
        <div class="mini-stat"><div class="ms-k">Outlook busy</div><div class="ms-v" style="color:#6a4dff">${busy}</div></div>
        <div class="mini-stat"><div class="ms-k">Blocked by you</div><div class="ms-v">${blocked}</div></div>
      </div>
      <div class="panel">
        <div class="p-head">
          <h3>Week of 6 Jul — ${exp.name} <span class="muted" style="font-weight:500;font-size:13px">· ${exp.team} · ${exp.based}</span></h3>
          <div class="lane-legend">
            <span><i style="background:var(--success)"></i> Available</span>
            <span><i style="background:var(--blue-500)"></i> Booked</span>
            <span><i style="background:#6a4dff"></i> Outlook busy</span>
            <span><i style="background:var(--ink-3)"></i> Blocked</span>
          </div>
        </div>
        <div class="sched-grid">${headRow}${rows}</div>
        <div class="route-hint freight" style="margin-top:18px">
          <div class="rh-icn">${I('zap','i-sm')}</div>
          <div><b>Your bookable slots are calculated automatically</b><span class="muted">Working hours (08:30–14:30 CET), minus your Outlook/Teams meetings, minus anything you block by hand. Prospect bookings drop straight into your calendar with a Teams link. <a class="link" href="#/book">Try the booking page →</a></span></div>
        </div>
      </div>`;
    return opsShell("schedule", "My schedule", `<a href="#/ops">Operations console</a>`, body);
  }

  /* =====================================================================
     ROUTER
     ===================================================================== */
  function parseHash() {
    let hash = window.location.hash.replace(/^#/, "");
    if (!hash || hash === "/") return { name: "login" };
    const [path, queryStr] = hash.split("?");
    const params = {};
    (queryStr || "").split("&").forEach((kv) => {
      const [k, v] = kv.split("=");
      if (k) params[k] = decodeURIComponent(v || "");
    });
    const parts = path.split("/").filter(Boolean); // e.g. ["app","shipments","MSKU-.."]
    if (parts[0] === "book") return { name: "book" };
    if (parts[0] === "login") return { name: "login" };
    if (parts[0] === "app") {
      if (parts[1] === "shipments" && parts[2]) return { name: "shipment", id: decodeURIComponent(parts[2]), params };
      if (parts[1] === "shipments") return { name: "shipments", params };
      if (parts[1] === "bookings") return { name: "bookings", params };
      if (parts[1] === "documents") return { name: "documents", params };
      if (parts[1] === "invoices") return { name: "invoices", params };
      if (parts[1] === "messages" && parts[2]) return { name: "messages", id: decodeURIComponent(parts[2]), params };
      if (parts[1] === "messages") return { name: "messages", params };
      return { name: "overview", params };
    }
    if (parts[0] === "ops") {
      if (parts[1] === "shipments" && parts[2]) return { name: "opsShipment", id: decodeURIComponent(parts[2]), params };
      if (parts[1] === "shipments") return { name: "opsShipments", params };
      if (parts[1] === "clients") return { name: "opsClients", params };
      if (parts[1] === "schedule") return { name: "opsSchedule", params };
      return { name: "opsQueue", params };
    }
    return { name: "login" };
  }

  const CLIENT_ROUTES = ["overview", "shipments", "shipment", "bookings", "documents", "invoices", "messages"];
  const OPS_ROUTES = ["opsQueue", "opsShipments", "opsShipment", "opsClients", "opsSchedule"];

  function render() {
    const route = parseHash();
    // role follows the area being viewed (prototype: deep links always work)
    if (CLIENT_ROUTES.includes(route.name)) MOOV.session.role = "client";
    if (OPS_ROUTES.includes(route.name)) MOOV.session.role = "ops";
    const p = route.params || {};
    let html = "";
    switch (route.name) {
      case "book": html = viewBook(); break;
      case "login": html = viewLogin(); break;
      case "overview": html = viewOverview(); break;
      case "shipments": html = viewShipments(p.f); break;
      case "shipment": html = viewShipmentDetail(route.id); break;
      case "bookings": html = viewBookings(p.new === "1"); break;
      case "documents": html = viewDocuments(); break;
      case "invoices": html = viewInvoices(); break;
      case "messages": html = viewMessages(route.id); break;
      case "opsQueue": html = viewOpsQueue(); break;
      case "opsShipments": html = viewOpsShipments(p.c, p.f); break;
      case "opsShipment": html = viewShipmentDetail(route.id, true); break;
      case "opsClients": html = viewOpsClients(); break;
      case "opsSchedule": html = viewOpsSchedule(); break;
      default: html = viewLogin();
    }
    app.innerHTML = html;
    window.scrollTo(0, 0);
    bindAfterRender(route);
  }

  /* ---- topbar: notification bell + global search --------------------- */
  function bindTopbar(route) {
    const ops = OPS_ROUTES.includes(route.name);
    const detailBase = ops ? "/ops/shipments/" : "/app/shipments/";

    const bellBtn = el("bell-btn"), bellDrop = el("bell-drop");
    if (bellBtn && bellDrop) {
      const items = ops
        ? MOOV.opsQueue.map((q) => ({ tone: q.pri === "high" ? "danger" : "warning", title: q.title, sub: MOOV.clientName(q.client) + (q.ship ? " · " + q.ship : "") + " · open " + q.age, href: q.ship ? detailBase + q.ship : "/ops" }))
        : MOOV.alerts.map((a) => ({ tone: a.tone, title: a.title, sub: a.shipment + " · " + a.when, href: detailBase + a.shipment }));
      bellBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (bellDrop.innerHTML) { bellDrop.innerHTML = ""; return; }
        bellDrop.innerHTML = `<div class="drop-panel">
          <div class="dp-head">Notifications <span class="pill pill-neutral">${items.length}</span></div>
          <div class="dp-list">${items.map((n, i) => `
            <div class="drop-item" data-href="${n.href}">
              <div class="a-icn ${n.tone}" style="width:30px;height:30px">${I(n.tone==='danger'?'alert':n.tone==='warning'?'warn':'info','i-sm')}</div>
              <div><div class="di-t">${n.title}</div><div class="di-s">${n.sub}</div></div>
            </div>`).join("")}</div>
        </div>`;
        $$(".drop-item", bellDrop).forEach((d) => d.addEventListener("click", () => go(d.dataset.href)));
      });
    }

    const search = el("global-search"), sDrop = el("search-drop");
    if (search && sDrop) {
      const scope = ops ? MOOV.allShipments : MOOV.shipments;
      search.addEventListener("input", () => {
        const q = search.value.trim().toLowerCase();
        if (!q) { sDrop.innerHTML = ""; return; }
        const hits = scope.filter((s) => (s.id + " " + s.ref + " " + s.commodity + " " + s.origin + " " + s.dest).toLowerCase().includes(q)).slice(0, 6);
        sDrop.innerHTML = `<div class="drop-panel">
          <div class="dp-list">${hits.length ? hits.map((s) => `
            <div class="drop-item" data-href="${detailBase}${s.id}">
              <div class="doc-icn" style="width:30px;height:30px">${I('box','i-sm')}</div>
              <div><div class="di-t">${s.id} <span class="muted" style="font-weight:400">· ${s.ref}</span></div><div class="di-s">${s.origin} → ${s.dest} · ${MOOV.stages[s.stage]}</div></div>
            </div>`).join("") : `<div class="drop-item"><div class="di-s">No matches for “${search.value}”.</div></div>`}</div>
        </div>`;
        $$(".drop-item[data-href]", sDrop).forEach((d) => d.addEventListener("click", () => go(d.dataset.href)));
      });
      search.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const first = $(".drop-item[data-href]", sDrop);
          if (first) go(first.dataset.href);
        }
      });
    }

    // close dropdowns on outside click
    document.addEventListener("click", (e) => {
      if (bellDrop && !e.target.closest(".bell-wrap")) bellDrop.innerHTML = "";
      if (sDrop && !e.target.closest(".search-wrap")) sDrop.innerHTML = "";
    });
  }

  function bindAfterRender(route) {
    if (route.name === "book") bindBook();

    if (route.name === "login") {
      const btn = el("do-login");
      btn && btn.addEventListener("click", () => { MOOV.session.role = "client"; go("/app"); });
      const opsBtn = el("do-login-ops");
      opsBtn && opsBtn.addEventListener("click", () => { MOOV.session.role = "ops"; go("/ops"); });
    }

    // shared portal chrome
    if (CLIENT_ROUTES.includes(route.name) || OPS_ROUTES.includes(route.name)) bindTopbar(route);
    $$(".signout").forEach((a) => a.addEventListener("click", () => { MOOV.session.role = null; }));

    // dashboard: clickable rows
    const detailBase = OPS_ROUTES.includes(route.name) ? "/ops/shipments/" : "/app/shipments/";
    $$("tr.clickable").forEach((tr) => tr.addEventListener("click", () => go(detailBase + tr.dataset.ship)));

    // hamburger (mobile sidebar)
    const ham = el("ham");
    ham && ham.addEventListener("click", () => { const sb = el("sidebar"); sb && sb.classList.toggle("open"); });

    // fake downloads
    $$(".doc-dl").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); toast("Download started (prototype — no real file)"); }));
    $$(".inv-dl").forEach((b) => b.addEventListener("click", () => toast("Invoice PDF download started (prototype)")));

    // client shipments list: filter + search
    if (route.name === "shipments") {
      let filter = (route.params && route.params.f) || "all";
      const render2 = () => {
        const q = el("ship-search") ? el("ship-search").value : "";
        const list = filterShipments(filter, q);
        el("ship-tbody").innerHTML = list.length ? list.map((s) => shipTableRow(s)).join("")
          : `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--ink-3)">No shipments match.</td></tr>`;
        $$("#ship-tbody tr.clickable").forEach((tr) => tr.addEventListener("click", () => go("/app/shipments/" + tr.dataset.ship)));
      };
      $$("#filter-seg button").forEach((b) => b.addEventListener("click", () => {
        $$("#filter-seg button").forEach((x) => x.classList.remove("on"));
        b.classList.add("on"); filter = b.dataset.filter; render2();
      }));
      const search = el("ship-search");
      search && search.addEventListener("input", render2);
    }

    // shipment detail: document upload flow
    if (route.name === "shipment") {
      const fileInput = el("file-input");
      const zone = el("dropzone");
      const finish = () => { completeDocUpload(route.id); render(); toast("Documents uploaded — broker notified"); };
      if (fileInput) fileInput.addEventListener("change", () => { if (fileInput.files.length) finish(); });
      if (zone) {
        zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("over"); });
        zone.addEventListener("dragleave", () => zone.classList.remove("over"));
        zone.addEventListener("drop", (e) => { e.preventDefault(); finish(); });
      }
      const jump = el("jump-docs");
      jump && jump.addEventListener("click", (e) => {
        e.preventDefault();
        const t = el("req-docs");
        t && t.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    // ops shipment detail: milestone + hold actions
    if (route.name === "opsShipment") {
      const s = MOOV.allShipments.find((x) => x.id === route.id);
      const adv = el("ops-advance");
      adv && adv.addEventListener("click", () => {
        if (!s || s.stage >= 7) return;
        s.stage += 1;
        if (s.stage === 7) s.flags = {};
        s.events.push({ stage: s.stage, ts: "2026-07-06 · just now", place: "MOOV Ops", note: "Milestone updated by MOOV Operations — visible to the client immediately." });
        render(); toast("Milestone advanced to “" + MOOV.stages[s.stage] + "”");
      });
      const res = el("ops-resolve");
      res && res.addEventListener("click", () => {
        if (!s) return;
        s.flags = {};
        s.events.push({ stage: s.stage, ts: "2026-07-06 · just now", place: "MOOV Ops", note: "Hold released — declaration accepted, container free to move." });
        render(); toast("Hold resolved — client notified");
      });
    }

    // ops schedule: availability toggles + calendar connection
    if (route.name === "opsSchedule") {
      const expKey = MOOV.session.expert || "strategic";
      const entries = MOOV.schedule[expKey].entries;
      const cal = MOOV.calendars[expKey];
      const stateOf = (key) => MOOV.slotState(expKey, key.split("|")[0], key.split("|")[1]).state;
      $$(".sched-cell").forEach((c) => c.addEventListener("click", () => {
        const key = c.dataset.key;
        const st = stateOf(key);
        if (st === "booked") { toast("Booked calls can't be blocked — reschedule with the prospect first"); return; }
        if (st === "busy") { toast("Synced from Outlook — manage this meeting in your own calendar"); return; }
        if (st === "blocked") { delete entries[key]; render(); toast("Slot reopened — visible on the booking page"); }
        else { entries[key] = { state: "blocked", reason: "Blocked by you" }; render(); toast("Slot blocked — hidden from the booking page"); }
      }));
      $$(".sched-day").forEach((d) => d.addEventListener("click", () => {
        const iso = d.dataset.day;
        const dayKeys = MOOV.slotTimes.map((t) => iso + "|" + t.cet);
        const anyFree = dayKeys.some((k) => stateOf(k) === "free");
        if (anyFree) {
          dayKeys.forEach((k) => { if (stateOf(k) === "free") entries[k] = { state: "blocked", reason: "Out of office" }; });
          render(); toast("Day blocked (booked calls kept) — hidden from the booking page");
        } else {
          dayKeys.forEach((k) => { if (entries[k] && entries[k].state === "blocked") delete entries[k]; });
          render(); toast("Day reopened — visible on the booking page");
        }
      }));
      const sync = el("cal-sync");
      sync && sync.addEventListener("click", () => { cal.lastSync = "just now"; render(); toast("Outlook calendar synced — no new conflicts"); });
      const calToggle = el("cal-toggle");
      calToggle && calToggle.addEventListener("click", () => {
        cal.connected = !cal.connected;
        if (cal.connected) cal.lastSync = "just now";
        render();
        toast(cal.connected ? "Microsoft 365 connected — Outlook meetings now auto-block slots" : "Disconnected — Outlook meetings no longer block bookings");
      });
      const sel = el("sched-expert");
      sel && sel.addEventListener("change", () => { MOOV.session.expert = sel.value; render(); });
    }

    // ops shipments: client switcher
    const cf = el("ops-client-filter");
    cf && cf.addEventListener("change", () => go("/ops/shipments" + (cf.value === "all" ? "" : "?c=" + cf.value)));

    // bookings: new-request form
    if (route.name === "bookings") {
      const showBtn = el("bk-new"), form = el("bkg-form");
      showBtn && showBtn.addEventListener("click", () => { form.classList.remove("hide"); showBtn.classList.add("hide"); });
      const cancel = el("bk-cancel");
      cancel && cancel.addEventListener("click", () => { form.classList.add("hide"); showBtn && showBtn.classList.remove("hide"); });
      const submit = el("bk-submit");
      submit && submit.addEventListener("click", () => {
        MOOV.bookingRequests.unshift({
          id: "BKG-" + (2406 + MOOV.bookingRequests.length),
          requested: "2026-07-06",
          origin: el("bk-origin").value, dest: el("bk-dest").value,
          containers: el("bk-load").value, incoterm: el("bk-incoterm").value,
          ready: el("bk-ready").value || "2026-07-24",
          commodity: el("bk-commodity").value || "General cargo",
          status: "Pending review",
        });
        go("/app/bookings"); render(); toast("Booking request sent — your freight desk will quote within 1 business day");
      });
    }

    // messages: composer
    if (route.name === "messages") {
      const input = el("chat-input"), send = el("chat-send"), bodyEl = el("chat-body");
      if (bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;
      const doSend = () => {
        const txt = (input.value || "").trim();
        if (!txt) return;
        const t = MOOV.threadFor(route.id || (MOOV.threads[0] && MOOV.threads[0].ship));
        if (!t) return;
        t.messages.push({ from: "client", name: MOOV.client.contact, ts: "2026-07-06 · just now", text: txt });
        render(); toast("Message sent to your MOOV team");
      };
      send && send.addEventListener("click", doSend);
      input && input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSend(); });
    }
  }

  window.addEventListener("hashchange", render);
  window.addEventListener("DOMContentLoaded", render);
  if (document.readyState !== "loading") render();
})();
