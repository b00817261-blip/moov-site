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
    step: 1, company: "", ship: "", origin: "", dest: "", volume: "",
    incoterm: "", interests: [], day: null, slot: null,
  };
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
  function publicNav(active) {
    return `
    <header class="nav"><div class="wrap nav-inner">
      <a class="brand" href="#/">${logoMark()} MOOV</a>
      <nav class="nav-links">
        <a href="#/" class="${active==='home'?'':''}">Home</a>
        <a href="#/#services">Services</a>
        <a href="#/#how">How it works</a>
        <a href="#/app">Client portal</a>
      </nav>
      <div class="nav-spacer"></div>
      <div class="nav-actions">
        <a class="btn btn-ghost btn-sm" href="#/login">${I('logout','i-sm')} Client login</a>
        <a class="btn btn-primary btn-sm" href="#/book">Book a call</a>
      </div>
    </div></header>`;
  }
  function logoMark() {
    return `<svg class="mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#0b1f3a"/>
      <path d="M8 26V14l6 7 6-7v12" stroke="#4d84ff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23 20h8M27 16l4 4-4 4" stroke="#14b8a6" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }
  function footer() {
    return `
    <footer class="footer"><div class="wrap">
      <div class="cols">
        <div>
          <div class="brand">${logoMark()} MOOV</div>
          <p style="max-width:34ch">Freight forwarding & 4PL, engineered between Europe and China. Headquartered in Shanghai since 2009.</p>
        </div>
        <div><h4>Services</h4>
          <a href="#/#services">Ocean freight</a><a href="#/#services">Air freight</a>
          <a href="#/#services">Rail freight</a><a href="#/#services">Bonded warehousing</a>
          <a href="#/#services">smartMOOV 4PL</a>
        </div>
        <div><h4>Company</h4>
          <a href="#/">About</a><a href="#/">Offices</a><a href="#/">Sustainability</a><a href="#/">Careers</a>
        </div>
        <div><h4>Get started</h4>
          <a href="#/book">Book a call</a><a href="#/login">Client login</a><a href="#/">Contact</a>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© 2026 MOOV Logistics (Shanghai) Co., Ltd. · Prototype — fictional data.</span>
        <span>Shanghai · Ningbo · Shenzhen · Hamburg · Rotterdam · Lyon</span>
      </div>
    </div></footer>`;
  }

  /* =====================================================================
     VIEW: LANDING
     ===================================================================== */
  function viewHome() {
    const svc = MOOV.services.map((s) => {
      if (s.featured) {
        return `<div class="svc featured">
          <div class="svc-icn">${I(s.icon)}</div>
          <div>
            <div class="svc-tag">${s.tag}</div>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
          </div>
          <a class="btn btn-light" href="#/book">Explore 4PL ${I('arrow','i-sm')}</a>
        </div>`;
      }
      return `<div class="svc">
        <div class="svc-icn">${I(s.icon)}</div>
        <h3>${s.title}</h3>
        <div class="svc-tag">${s.tag}</div>
        <p>${s.desc}</p>
      </div>`;
    }).join("");

    return h(`
    ${publicNav('home')}
    <section class="hero"><div class="wrap"><div class="hero-grid">
      <div>
        <span class="eyebrow">${I('globe','i-sm')} Shanghai · Since 2009</span>
        <h1>Your cargo, moving as one system.</h1>
        <p class="lede">MOOV is a Shanghai-based freight forwarder and 4PL partner, moving goods from China to Europe for retailers who can't afford surprises.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="#/book">Book a call ${I('arrow','i-sm')}</a>
          <a class="btn btn-light" href="#/app">See the client portal</a>
        </div>
        <div class="trust">
          <div><div class="n">14k+</div><div class="l">TEU moved / year</div></div>
          <div><div class="n">6</div><div class="l">Offices, EU & China</div></div>
          <div><div class="n">99.2%</div><div class="l">On-time milestone rate</div></div>
        </div>
      </div>
      <div class="hero-card">
        <div class="hc-top">
          <span class="hc-id">MSKU-7781234</span>
          <span class="pill pill-info"><span class="dot"></span>At sea</span>
        </div>
        <div class="hc-route">
          <span>Shanghai</span><span class="arrow"></span><span>Hamburg</span>
        </div>
        <div class="hc-mini">
          <div><div class="k">Incoterm</div><div class="v">FOB</div></div>
          <div><div class="k">Containers</div><div class="v">3 × 40'</div></div>
          <div><div class="k">ETA</div><div class="v">19 Jul</div></div>
        </div>
      </div>
    </div></div>
    <svg class="hero-wave" viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0 30 Q 360 60 720 30 T 1440 30 V60 H0 Z" fill="#f5f7fb"/></svg>
    </section>

    <section class="section" id="services"><div class="wrap">
      <div class="section-head">
        <div class="kicker">What we do</div>
        <h2>One partner across every mode and border</h2>
        <p>From a single ocean booking to a fully managed supply chain, MOOV handles the freight, the paperwork and the control tower.</p>
      </div>
      <div class="services-grid">${svc}</div>
    </div></section>

    <div class="band"><div class="wrap">
      <span class="lbl">Trusted by European retailers</span>
      <div class="logos"><span>Lidl</span><span>Kaufland</span><span>Action</span><span>Normal</span><span>Woolworth</span></div>
    </div></div>

    <section class="section" id="how"><div class="wrap">
      <div class="section-head">
        <div class="kicker">How it works</div>
        <h2>From first call to delivered container</h2>
      </div>
      <div class="steps">
        <div class="step"><div class="num">STEP 01</div><h3>Tell us what you ship</h3><p>A two-minute qualification so we route you to the right desk — freight or strategic 4PL.</p></div>
        <div class="step"><div class="num">STEP 02</div><h3>Meet your MOOV expert</h3><p>Pick a slot in CET or China time. You'll meet a named specialist, not a queue.</p></div>
        <div class="step"><div class="num">STEP 03</div><h3>Track everything live</h3><p>Every booking, milestone and customs event in one portal — with proactive alerts.</p></div>
      </div>
    </div></section>

    <section class="section" style="padding-top:0"><div class="wrap">
      <div class="cta">
        <h2>Let's move your next shipment.</h2>
        <p>Book a 30-minute call with a MOOV expert. We'll map your lane, your Incoterms and where 4PL could take cost out.</p>
        <a class="btn btn-light" href="#/book">Book a call ${I('arrow','i-sm')}</a>
      </div>
    </div></section>
    ${footer()}
    `);
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
    ${publicNav()}
    <div class="book">
      <div class="book-hero"><div class="wrap">
        <a class="back-link" href="#/" style="color:#9fb2d0;margin-bottom:18px">${I('chevleft','i-sm')} Back to home</a>
        <h1>${heroText.t}</h1>
        <p>${heroText.p}</p>
      </div></div>
      <div class="book-shell">
        ${wizardSteps(b.step)}
        <div class="card">${inner}</div>
      </div>
    </div>`);
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

      <div class="field">
        <label>Company name <span class="req">*</span></label>
        <input class="input" id="f-company" placeholder="e.g. Lidl Trading" value="${b.company||''}">
      </div>

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
        <button class="btn btn-primary" id="to-step2" ${b.company?'':'disabled'}>Choose a time ${I('arrow','i-sm')}</button>
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
    return `
      <h2>Pick a time that works</h2>
      <p class="sub">Times shown in Central European Time and China Standard Time.</p>
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
    return MOOV.slotTimes.map((t) => {
      const key = b.day + "|" + t.cet;
      const taken = MOOV.slotsTaken.has(key);
      const sel = b.slot === t.cet;
      return `<button type="button" class="slot ${sel?'sel':''}" data-slot="${t.cet}" ${taken?'disabled':''}>
        <div class="s-cet">${t.cet} <span style="font-size:11px;color:var(--ink-3);font-weight:600">CET</span></div>
        <div class="s-cst">${t.cst} CST${taken?' · booked':''}</div>
      </button>`;
    }).join("");
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
        <p class="sub">${day.date} · ${slot.cet} CET / ${slot.cst} CST · 30 minutes · video link sent to your inbox</p>
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
        <a class="btn btn-ghost" href="#/">Back to home</a>
        <a class="btn btn-primary" href="#/app">Preview the client portal ${I('arrow','i-sm')}</a>
      </div>
    `;
  }

  /* wire up booking interactions after render ------------------------- */
  function bindBook() {
    const b = MOOV.booking;
    if (b.step === 1) {
      const company = el("f-company");
      const refreshNext = () => { const btn = el("to-step2"); if (btn) btn.disabled = !el("f-company").value.trim(); };
      company && company.addEventListener("input", (e) => { b.company = e.target.value; refreshNext(); });
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
      el("to-step3") && el("to-step3").addEventListener("click", () => { b.step = 3; render(); });
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
          <button class="btn btn-primary btn-block" id="do-login" style="margin-top:22px">Sign in ${I('arrow','i-sm')}</button>
          <div class="demo-note">${I('info','i-sm')} <span><b>Prototype demo.</b> Just click “Sign in” to enter the Lidl Trading dashboard with sample data.</span></div>
        </div>
      </div>
    </div>`);
  }

  /* =====================================================================
     CLIENT DASHBOARD SHELL
     ===================================================================== */
  function appShell(active, title, crumb, body) {
    const c = MOOV.client;
    const navItem = (hash, icon, label, key) =>
      `<a href="${hash}" class="${active===key?'active':''}">${I(icon)} ${label}</a>`;
    return h(`
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <a class="brand" href="#/">${logoMark()} MOOV</a>
        <nav class="side-nav">
          ${navItem('#/app','grid','Overview','overview')}
          ${navItem('#/app/shipments','box','Shipments','shipments')}
          <a href="#/app">${I('doc')} Documents</a>
          <a href="#/app">${I('wallet')} Invoices</a>
          <a href="#/app">${I('life')} Support</a>
        </nav>
        <div class="side-foot">
          <div class="side-user">
            <div class="av">KV</div>
            <div><div class="nm">${c.contact}</div><div class="rl">${c.name}</div></div>
          </div>
          <a href="#/" class="side-nav" style="display:flex;margin-top:6px"><span style="display:flex;align-items:center;gap:12px;padding:11px 14px;color:#9fb2d0;font-size:14px">${I('logout')} Sign out</span></a>
        </div>
      </aside>
      <div class="main">
        <div class="topbar">
          <button class="hamburger" id="ham">${I('menu','i-sm')}</button>
          <div>
            ${crumb?`<div class="t-crumb">${crumb}</div>`:''}
            <div class="t-title">${title}</div>
          </div>
          <div class="spacer"></div>
          <div class="searchbox">${I('search','i-sm')}<input placeholder="Search containers, POs…"></div>
          <button class="icon-btn">${I('bell','i-sm')}<span class="bump"></span></button>
        </div>
        <div class="content">${body}</div>
      </div>
    </div>`);
  }

  function statusPill(s) {
    const st = MOOV.statusFor(s.stage, s.flags);
    return `<span class="pill pill-${st.tone}"><span class="dot"></span>${st.label}</span>`;
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
        <div class="kpi"><div class="k-top"><div><div class="k-val">${active}</div><div class="k-lbl">Active shipments</div></div><div class="k-icn blue">${I('box')}</div></div><div class="k-delta flat">${I('trend','i-sm')} ${ships.length} total this quarter</div></div>
        <div class="kpi"><div class="k-top"><div><div class="k-val">${atSea}</div><div class="k-lbl">Containers at sea</div></div><div class="k-icn teal">${I('anchor')}</div></div><div class="k-delta flat">${I('clock','i-sm')} Next arrival in 4 days</div></div>
        <div class="kpi"><div class="k-top"><div><div class="k-val">${alerts}</div><div class="k-lbl">Open alerts</div></div><div class="k-icn rose">${I('alert')}</div></div><div class="k-delta down">1 needs your action</div></div>
        <div class="kpi"><div class="k-top"><div><div class="k-val tabular">€${spend}k</div><div class="k-lbl">Spend this month</div></div><div class="k-icn amber">${I('wallet')}</div></div><div class="k-delta ${spendDelta>=0?'up':'down'}">${I('trend','i-sm')} ${spendDelta>=0?'+':''}${spendDelta}% vs last month</div></div>
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

    const body = `
      <div class="page-head">
        <h1>Welcome back, Katrin</h1>
        <p>Here's where ${MOOV.client.name}'s freight stands today — ${fmtDate('2026-07-06')}.</p>
      </div>
      ${kpis}
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
  function viewShipments() {
    const rows = MOOV.shipments.map((s) => `
      <tr class="clickable" data-ship="${s.id}">
        <td><div class="cid">${s.id}</div><div class="subtle">${s.ref}</div></td>
        <td><div class="route">${s.origin} ${I('arrow','i-sm')} ${s.dest}</div><div class="subtle">${s.carrier} · ${s.vessel}</div></td>
        <td><span class="incoterm">${s.incoterm}</span></td>
        <td class="tabular">${s.containers} × 40'<div class="subtle">${s.teu} TEU · ${s.weightT}t</div></td>
        <td class="tabular">${fmtDate(s.eta)}</td>
        <td>${statusPill(s)}</td>
        <td style="text-align:right">${I('chevron','i-sm')}</td>
      </tr>`).join("");

    const body = `
      <div class="page-head">
        <h1>Shipments</h1>
        <p>${MOOV.shipments.length} shipments · ${MOOV.shipments.filter(s=>s.stage<7).length} in progress</p>
      </div>
      <div class="table-wrap">
        <div class="table-toolbar">
          <div class="seg" id="filter-seg">
            <button class="on" data-filter="all">All</button>
            <button data-filter="active">In progress</button>
            <button data-filter="sea">At sea</button>
            <button data-filter="exception">Exceptions</button>
            <button data-filter="delivered">Delivered</button>
          </div>
          <div class="spacer" style="flex:1"></div>
          <div class="searchbox" style="min-width:200px">${I('search','i-sm')}<input id="ship-search" placeholder="Container or PO…"></div>
        </div>
        <table class="tbl">
          <thead><tr><th>Container</th><th>Lane</th><th>Incoterm</th><th>Load</th><th>ETA</th><th>Status</th><th></th></tr></thead>
          <tbody id="ship-tbody">${rows}</tbody>
        </table>
      </div>`;
    return appShell("shipments", "Shipments", "Client portal", body);
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
  function viewShipmentDetail(id) {
    const s = MOOV.shipments.find((x) => x.id === id);
    if (!s) {
      return appShell("shipments", "Not found", "Shipments", `<div class="panel"><p>Shipment <b>${id}</b> was not found. <a class="link" href="#/app/shipments">Back to shipments</a></p></div>`);
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

    const banner = exception ? `
      <div class="banner danger">
        <div class="b-icn">${I('alert')}</div>
        <div><b>${s.flags.exceptionLabel}</b><p>${s.flags.note}</p></div>
        <div style="margin-left:auto"><a class="btn btn-dark btn-sm" href="#/app">Upload documents</a></div>
      </div>` : (s.flags.delayed ? `
      <div class="banner warning">
        <div class="b-icn">${I('warn')}</div>
        <div><b>Delay notice</b><p>${s.flags.note}</p></div>
      </div>` : "");

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
      <a class="back-link" href="#/app/shipments">${I('chevleft','i-sm')} All shipments</a>
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
          <a class="btn btn-ghost btn-sm" href="#/app">${I('doc','i-sm')} Documents</a>
          <a class="btn btn-primary btn-sm" href="#/app">${I('life','i-sm')} Message MOOV</a>
        </div>
      </div>

      ${banner}

      <div class="tracker">
        <div class="track ${exception?'exception':''}">${track}</div>
      </div>

      <div class="detail-grid">
        <div class="panel">
          <div class="p-head"><h3>Shipment details</h3></div>
          <div class="facts">${facts}</div>
        </div>
        <div class="panel">
          <div class="p-head"><h3>Milestone history</h3></div>
          <div class="timeline">${tl}</div>
        </div>
      </div>
    `;
    return appShell("shipments", s.id, "Shipments", body);
  }

  /* =====================================================================
     ROUTER
     ===================================================================== */
  function parseHash() {
    let hash = window.location.hash.replace(/^#/, "");
    if (!hash || hash === "/") return { name: "home" };
    // strip in-page anchors like /#services
    const parts = hash.split("/").filter(Boolean); // e.g. ["app","shipments","MSKU-.."]
    if (parts[0] === "book") return { name: "book" };
    if (parts[0] === "login") return { name: "login" };
    if (parts[0] === "app") {
      if (parts[1] === "shipments" && parts[2]) return { name: "shipment", id: decodeURIComponent(parts[2]) };
      if (parts[1] === "shipments") return { name: "shipments" };
      return { name: "overview" };
    }
    return { name: "home" };
  }

  function render() {
    const route = parseHash();
    let html = "";
    switch (route.name) {
      case "home": html = viewHome(); break;
      case "book": html = viewBook(); break;
      case "login": html = viewLogin(); break;
      case "overview": html = viewOverview(); break;
      case "shipments": html = viewShipments(); break;
      case "shipment": html = viewShipmentDetail(route.id); break;
      default: html = viewHome();
    }
    app.innerHTML = html;
    window.scrollTo(0, 0);
    bindAfterRender(route);
    handleAnchorScroll();
  }

  function bindAfterRender(route) {
    if (route.name === "book") bindBook();

    if (route.name === "login") {
      const btn = el("do-login");
      btn && btn.addEventListener("click", () => go("/app"));
    }

    // dashboard: clickable rows
    $$("tr.clickable").forEach((tr) => tr.addEventListener("click", () => go("/app/shipments/" + tr.dataset.ship)));

    // hamburger (mobile sidebar)
    const ham = el("ham");
    ham && ham.addEventListener("click", () => { const sb = el("sidebar"); sb && sb.classList.toggle("open"); });

    // shipments filter + search
    if (route.name === "shipments") {
      let filter = "all";
      const render2 = () => {
        const q = el("ship-search") ? el("ship-search").value : "";
        const list = filterShipments(filter, q);
        el("ship-tbody").innerHTML = list.length ? list.map((s) => `
          <tr class="clickable" data-ship="${s.id}">
            <td><div class="cid">${s.id}</div><div class="subtle">${s.ref}</div></td>
            <td><div class="route">${s.origin} ${I('arrow','i-sm')} ${s.dest}</div><div class="subtle">${s.carrier} · ${s.vessel}</div></td>
            <td><span class="incoterm">${s.incoterm}</span></td>
            <td class="tabular">${s.containers} × 40'<div class="subtle">${s.teu} TEU · ${s.weightT}t</div></td>
            <td class="tabular">${fmtDate(s.eta)}</td>
            <td>${statusPill(s)}</td>
            <td style="text-align:right">${I('chevron','i-sm')}</td>
          </tr>`).join("")
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
  }

  function handleAnchorScroll() {
    // support #/#services style anchors
    const raw = window.location.hash;
    const m = raw.match(/#\/#(.+)$/);
    if (m) {
      const target = document.getElementById(m[1]);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  }

  window.addEventListener("hashchange", render);
  window.addEventListener("DOMContentLoaded", render);
  if (document.readyState !== "loading") render();
})();
