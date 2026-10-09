// ScamProof app shell: state, storage, router, home page, accessibility.
(function () {
  "use strict";

  const S = window.SCAMPROOF = {};
  S.pages = {};

  // ---------- Persistent state ----------
  const DEFAULTS = {
    xp: 0,
    passed: {},            // lessonId -> best score (0..1)
    answers: [],           // {t, lessonId, correct} — for skill score
    practice: [],          // {t, correct} — You-vs-AI practice answers
    textScale: 0,          // 0 normal, 1 large, 2 larger
    contrast: false,
    modelTrained: false
  };
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem("scamproof.state.v1");
      return raw ? Object.assign({}, DEFAULTS, JSON.parse(raw)) : Object.assign({}, DEFAULTS);
    } catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function save() {
    try { localStorage.setItem("scamproof.state.v1", JSON.stringify(state)); } catch (e) { /* private mode */ }
  }
  S.getState = () => state;
  S.save = save;

  // ---------- Skill score: quiz accuracy over time ----------
  // "First session" vs "latest 15 answers" shows the learning gain.
  S.skillScore = function () {
    const a = state.answers;
    if (a.length < 5) return { now: null, before: null, gain: null, n: a.length };
    const first5 = a.slice(0, 5);
    const before = Math.round(100 * first5.filter((x) => x.correct).length / first5.length);
    const recent = a.slice(-15);
    const now = Math.round(100 * recent.filter((x) => x.correct).length / recent.length);
    return { now, before, gain: a.length >= 10 ? now - before : null, n: a.length };
  };

  S.recordAnswer = function (lessonId, correct) {
    state.answers.push({ t: Date.now(), lessonId, correct: !!correct });
    if (state.answers.length > 400) state.answers = state.answers.slice(-400);
    save();
  };

  // ---------- Model lifecycle (lazy: trained once, on first need) ----------
  let model = null;
  let modelPending = null;
  S.getModel = () => model;
  S.setModel = (m) => { model = m; modelPending = null; };
  S.ensureModel = function (onReady) {
    if (model) return onReady();
    if (!modelPending) {
      modelPending = true;
      // build off the hot path, then hand over
      setTimeout(() => {
        const corpus = window.SCAMPROOF_CORPUS.map(([text, y]) => ({ text, y }));
        const m = window.SCAMPROOF_ML.buildModel(corpus, 42);
        S.setModel(m);
        state.modelTrained = true; save();
        if (onReady) onReady();
      }, 30);
    } else {
      const iv = setInterval(() => { if (model) { clearInterval(iv); onReady(); } }, 100);
    }
  };

  // ---------- Accessibility ----------
  S.applyAccessibility = function () {
    document.documentElement.dataset.textScale = state.textScale;
    document.documentElement.dataset.contrast = state.contrast ? "on" : "off";
    const btns = document.querySelectorAll("[data-actscale]");
    btns.forEach((b) => b.classList.toggle("active", +b.dataset.actscale === state.textScale));
    const cb = document.getElementById("contrastBtn");
    if (cb) cb.classList.toggle("active", state.contrast);
  };

  S.setTextScale = function (v) { state.textScale = v; save(); S.applyAccessibility(); };
  S.toggleContrast = function () { state.contrast = !state.contrast; save(); S.applyAccessibility(); };

  // ---------- Router ----------
  S.go = function (page, param) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    const el = document.getElementById("page-" + page);
    if (!el) return;
    el.classList.add("active");
    document.querySelectorAll(".nav a").forEach((a) => a.classList.toggle("active", a.dataset.page === page));
    window.scrollTo({ top: 0 });
    if (S.pages[page]) S.pages[page](param);
  };

  // ---------- Shared UI helpers ----------
  S.esc = function (s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  };
  S.el = function (html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  S.pct = (v) => Math.round(100 * v) + "%";

  // ---------- Home page ----------
  S.pages.home = function () {
    const skill = S.skillScore();
    const passedCount = Object.keys(state.passed).filter((k) => state.passed[k] >= 0.75).length;
    const total = window.SCAMPROOF_LESSONS.length;
    const wrap = document.getElementById("homeContent");
    wrap.innerHTML = "";

    wrap.appendChild(S.el(`
      <section class="hero">
        <div class="hero-badge">🛡️ AI that runs 100% on your device</div>
        <h1>Train your <span class="grad">scam immunity</span> — with real AI watching your back.</h1>
        <p class="hero-sub">ScamProof teaches you to spot fraud texts, calls and AI-voice tricks in 5 minutes a day.
        Inside is a genuine machine-learning model trained live in your browser — no cloud, no sign-up, nothing leaves your device.</p>
        <div class="hero-cta">
          <button class="btn primary big" data-go="academy">🎓 Start training</button>
          <button class="btn ghost big" data-go="scanner">🔍 Check a suspicious message</button>
        </div>
      </section>
    `));

    wrap.appendChild(S.el(`
      <section class="statrow">
        <div class="statcard"><div class="stat-num">${passedCount}/${total}</div><div class="stat-label">lessons passed</div></div>
        <div class="statcard"><div class="stat-num">${state.xp}</div><div class="stat-label">XP earned</div></div>
        <div class="statcard"><div class="stat-num">${skill.now === null ? "—" : skill.now + "%"}</div><div class="stat-label">your scam-spotting score</div></div>
        <div class="statcard"><div class="stat-num">${skill.gain === null ? "—" : (skill.gain >= 0 ? "+" : "") + skill.gain + "%"}</div><div class="stat-label">improvement since you started</div></div>
      </section>
    `));

    wrap.appendChild(S.el(`
      <section class="grid3">
        <div class="featurecard">
          <div class="feature-icon">🎓</div>
          <h3>Learn the patterns</h3>
          <p>Six scam families — from fake banks to AI voice clones — broken into simple red flags anyone can remember.</p>
        </div>
        <div class="featurecard">
          <div class="feature-icon">🧠</div>
          <h3>Practise with real AI</h3>
          <p>A logistic-regression model trained on ${window.SCAMPROOF_META.n.toLocaleString()} real labelled SMS messages. See exactly which words tipped it off.</p>
        </div>
        <div class="featurecard">
          <div class="feature-icon">🔒</div>
          <h3>Private by design</h3>
          <p>Everything — training, scoring, your progress — happens on this device. No account, no cloud, no tracking.</p>
        </div>
      </section>
    `));

    wrap.appendChild(S.el(`
      <section class="impact">
        <h2>Why this matters</h2>
        <div class="impact-grid">
          <div class="impact-item"><div class="impact-num">$3.4B+</div><p>reported lost to fraud by adults 60+ in the US in a single year (FBI IC3)</p></div>
          <div class="impact-item"><div class="impact-num">3 s</div><p>of audio is enough for criminals to clone a voice with free AI tools</p></div>
          <div class="impact-item"><div class="impact-num">~90%</div><p>of fraud starts with a message: text, email or chat — exactly what we train for</p></div>
        </div>
        <p class="impact-note">Awareness training is the single most effective defence: once a person can name the trick, the trick stops working.</p>
      </section>
    `));
  };

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", () => {
    S.applyAccessibility();

    document.addEventListener("click", (e) => {
      const go = e.target.closest("[data-go]");
      if (go) { S.go(go.dataset.go); return; }
      const acts = e.target.closest("[data-actscale]");
      if (acts) { S.setTextScale(+acts.dataset.actscale); return; }
      if (e.target.closest("#contrastBtn")) { S.toggleContrast(); return; }
    });

    S.go("home");
  });
})();
