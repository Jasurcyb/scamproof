// ScamProof Scanner: paste a message -> explainable verdict.
(function () {
  "use strict";
  const S = window.SCAMPROOF;

  S.pages.scanner = function () {
    const root = document.getElementById("page-scanner");
    root.innerHTML = `
      <header class="pagehead">
        <h1>🔍 Message scanner</h1>
        <p>Paste any suspicious text, email or chat message. The AI scores it and shows <b>exactly which words</b> pushed the verdict — no black box, and nothing is uploaded anywhere.</p>
      </header>

      <section class="scanbox">
        <textarea id="scanInput" rows="5" placeholder="Paste a suspicious message here…"></textarea>
        <div class="examples">
          <span>Try an example:</span>
          <button class="btn tiny ghost" data-ex="0">Fake bank</button>
          <button class="btn tiny ghost" data-ex="1">Delivery fee</button>
          <button class="btn tiny ghost" data-ex="2">Real message</button>
        </div>
        <button class="btn primary big" id="scanBtn">Analyze message</button>
        <div class="scan-note">🔒 Analyzed locally on this device — the text never leaves your browser.</div>
      </section>

      <div id="scanResult"></div>
    `;

    const EXAMPLES = [
      "URGENT ALERT from NatWest: your account has been locked due to unusual activity. Verify your identity immediately at secure-natwest-verify.example.com or your account will be closed within 24 hours.",
      "Royal Mail: Your parcel is on hold due to unpaid shipping fee of £2.99. Pay now to release delivery: rm-pay-redelivery.example.com Ref #GB-4471",
      "Hi Jean, it's Carol. Book club is at mine this Thursday at 7 as usual — bring the lemon cake if you fancy! See you there x"
    ];

    root.querySelectorAll("[data-ex]").forEach((b) =>
      b.addEventListener("click", () => { root.querySelector("#scanInput").value = EXAMPLES[+b.dataset.ex]; }));

    root.querySelector("#scanBtn").addEventListener("click", () => {
      const text = root.querySelector("#scanInput").value.trim();
      const out = root.querySelector("#scanResult");
      if (text.length < 8) { out.innerHTML = `<div class="feedback show bad"><div class="fb-title">Please paste a longer message to analyze.</div></div>`; return; }
      out.innerHTML = `<div class="loadingbox">🧠 Analyzing…</div>`;
      S.ensureModel(() => {
        const m = S.getModel();
        const t0 = performance.now();
        const r = m.predictText(text);
        const flags = window.SCAMPROOF_ML.ruleFlags(text);
        const ms = (performance.now() - t0).toFixed(1);
        render(out, text, r, flags, ms);
      });
    });
  };

  function render(out, text, r, flags, ms) {
    const p = r.score;
    let verdict, cls, advice;
    if (p >= 0.65) { verdict = "High risk — treat as a scam"; cls = "danger"; advice = "Do not click, do not reply, do not share codes. If it claims to be your bank or a company, contact them using the number on your card or their official app."; }
    else if (p >= 0.35) { verdict = "Uncertain — verify first"; cls = "warn"; advice = "The model is not confident. Be suspicious of urgency and links. Verify the sender by calling them on the official number you already have."; }
    else { verdict = "Likely safe — stay alert"; cls = "ok"; advice = "No strong scam signals found. Even so, never share one-time codes, and treat unexpected money requests with care."; }

    out.innerHTML = `
      <section class="verdictcard ${cls}">
        <div class="verdict-head">
          <div class="verdict-score ${cls}">${S.pct(p)}</div>
          <div>
            <h2>${verdict}</h2>
            <p class="verdict-sub">Scam probability · analyzed in ${ms} ms on your device</p>
          </div>
        </div>
        <div class="gauge"><div class="gauge-fill ${cls}" style="width:${S.pct(p)}"></div>
          <div class="gauge-labels"><span>0% safe</span><span>100% scam</span></div>
        </div>
        <p class="advice">${advice}</p>
      </section>

      ${flags.length ? `
      <section class="flagsfound">
        <h3>Red flags found</h3>
        ${flags.map((f) => `<div class="flagcard"><div class="flag-icon">${f.icon}</div><div><h4>${f.title}</h4><p>${f.why}</p></div></div>`).join("")}
      </section>` : `<section class="flagsfound"><h3>Red flags found</h3><p class="muted">No classic red-flag patterns detected — but new tricks appear daily. Trust your gut and verify.</p></section>`}

      <section class="explainbox">
        <h3>How the AI read this message</h3>
        <div class="explain">
          ${r.scamWords.length ? `<div class="explain-col"><div class="explain-head">pushes toward <b>scam</b></div>${r.scamWords.map((w) => `<span class="tok red">${S.esc(w.token)}</span>`).join(" ")}</div>` : `<div class="explain-col"><div class="explain-head">pushes toward <b>scam</b></div><span class="muted">no strong signals</span></div>`}
          ${r.safeWords.length ? `<div class="explain-col"><div class="explain-head">pushes toward <b>safe</b></div>${r.safeWords.map((w) => `<span class="tok green">${S.esc(w.token)}</span>`).join(" ")}</div>` : `<div class="explain-col"><div class="explain-head">pushes toward <b>safe</b></div><span class="muted">no strong signals</span></div>`}
        </div>
        <p class="muted small">Weights come from a logistic-regression model trained on ${window.SCAMPROOF_META.n.toLocaleString()} real labelled SMS messages. Each token shows its learned contribution. The AI sees patterns — only a human sees the full story.</p>
      </section>

      <section class="checklist">
        <h3>Your 4-step safety plan</h3>
        <ol>
          <li><b>Stop.</b> Urgency is the attacker's tool, not yours.</li>
          <li><b>Verify out-of-band.</b> Call the person/company on the number you already have — never the one in the message.</li>
          <li><b>Never share codes or passwords.</b> Not with "bank staff", not with "the police", not with anyone.</li>
          <li><b>Tell someone.</b> Scammers isolate you. One phone call to family breaks the spell.</li>
        </ol>
      </section>
    `;
  }
})();
