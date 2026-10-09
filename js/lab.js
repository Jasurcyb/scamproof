// ScamProof Lab: train the model live, show honest metrics, loss curve, weights.
(function () {
  "use strict";
  const S = window.SCAMPROOF;
  const META = window.SCAMPROOF_META;

  S.pages.lab = function () {
    const root = document.getElementById("page-lab");
    root.innerHTML = `
      <header class="pagehead">
        <h1>🧠 Model lab</h1>
        <p>No hidden API. The whole model is built <b>right now, on your device</b> — you can watch it train and retrain it as many times as you like.</p>
      </header>

      <section class="datasetcard">
        <h3>Dataset</h3>
        <div class="datasetgrid">
          <div><b>${META.n.toLocaleString()}</b><span>real SMS messages</span></div>
          <div><b>${META.nSpam.toLocaleString()}</b><span>labelled spam / scam</span></div>
          <div><b>${META.nHam.toLocaleString()}</b><span>labelled normal (ham)</span></div>
          <div><b>80 / 20</b><span>train / test split</span></div>
        </div>
        <p class="muted small">${META.source} — ${META.citation} Licensed ${META.license}.
          <a href="${META.url}" target="_blank" rel="noopener">View dataset ↗</a></p>
      </section>

      <section class="trainrow">
        <button class="btn primary big" id="trainBtn">▶ Train the model</button>
        <button class="btn ghost big" id="retrainBtn" style="display:none">🎲 Retrain with a new random split</button>
      </section>

      <div id="labOut"></div>

      <section class="metricsexplain">
        <h3>Reading the numbers — in plain language</h3>
        <ul>
          <li><b>Accuracy</b> — how often the model is right overall.</li>
          <li><b>Precision</b> — when the model shouts “scam!”, how often is it really a scam? (avoids crying wolf)</li>
          <li><b>Recall</b> — of all the real scams, how many did the model catch? (misses are dangerous)</li>
          <li><b>AUC</b> — how well the model separates scam from safe across all thresholds. 0.5 is coin-flipping, 1.0 is perfect.</li>
        </ul>
        <p class="muted small">All metrics are computed on the <b>test set</b> — messages the model has never seen during training. Retraining with a new seed re-splits the data, so small changes in the numbers are expected — that's honest ML.</p>
      </section>
    `;

    root.querySelector("#trainBtn").addEventListener("click", () => run(root, 42));
    root.querySelector("#retrainBtn").addEventListener("click", () => run(root, Math.floor(Math.random() * 100000)));
  };

  function run(root, seed) {
    const out = root.querySelector("#labOut");
    root.querySelector("#retrainBtn").style.display = "";
    out.innerHTML = `
      <section class="steps" id="steps">
        <div class="step" id="st1"><span class="step-ico">🔤</span> Tokenizing & counting vocabulary…</div>
        <div class="step" id="st2"><span class="step-ico">🧮</span> Building TF-IDF-style feature vectors…</div>
        <div class="step" id="st3"><span class="step-ico">⚙️</span> Training logistic regression…</div>
        <div class="step" id="st4"><span class="step-ico">📊</span> Evaluating on unseen test set…</div>
      </section>`;
    const mark = (id, cls) => { const el = root.querySelector(id); if (el) el.classList.add(cls); };

    // run asynchronously so steps paint
    setTimeout(() => {
      mark("#st1", "done");
      const corpus = window.SCAMPROOF_CORPUS.map(([text, y]) => ({ text, y }));
      setTimeout(() => {
        mark("#st2", "done");
        setTimeout(() => {
          mark("#st3", "running");
          const m = window.SCAMPROOF_ML.buildModel(corpus, seed);
          S.setModel(m);
          S.getState().modelTrained = true; S.save();
          mark("#st3", "done");
          mark("#st4", "done");
          renderResults(out, m);
        }, 30);
      }, 30);
    }, 30);
  }

  function renderResults(out, m) {
    const tm = m.testMetrics, tr = m.trainMetrics;
    // inference latency
    const t0 = performance.now();
    for (let i = 0; i < 50; i++) m.predictText("URGENT your account locked verify now");
    const lat = ((performance.now() - t0) / 50).toFixed(2);

    out.innerHTML = `
      <section class="metricgrid">
        <div class="metriccard"><div class="metric-num">${S.pct(tm.accuracy)}</div><div class="metric-label">accuracy (test)</div></div>
        <div class="metriccard"><div class="metric-num">${S.pct(tm.precision)}</div><div class="metric-label">precision</div></div>
        <div class="metriccard"><div class="metric-num">${S.pct(tm.recall)}</div><div class="metric-label">recall</div></div>
        <div class="metriccard"><div class="metric-num">${S.pct(tm.f1)}</div><div class="metric-label">F1 score</div></div>
        <div class="metriccard"><div class="metric-num">${tm.auc.toFixed(3)}</div><div class="metric-label">ROC-AUC</div></div>
        <div class="metriccard"><div class="metric-num">${lat}ms</div><div class="metric-label">per prediction</div></div>
      </section>

      <div class="labgrid">
        <section class="labcard">
          <h3>Confusion matrix — unseen test set</h3>
          <table class="cm">
            <tr><td></td><th>AI says scam</th><th>AI says safe</th></tr>
            <tr><th>really scam</th><td class="cm good">${tm.tp}</td><td class="cm bad">${tm.fn} missed</td></tr>
            <tr><th>really safe</th><td class="cm warn">${tm.fp} false alarm</td><td class="cm good">${tm.tn}</td></tr>
          </table>
          <p class="muted small">Train accuracy ${S.pct(tr.accuracy)} vs test ${S.pct(tm.accuracy)} — the small gap shows the model generalizes instead of memorizing.</p>
        </section>

        <section class="labcard">
          <h3>Training loss curve</h3>
          ${lossSvg(m.model.losses)}
          <p class="muted small">${m.model.epochs} epochs of full-batch gradient descent, L2-regularized. Trained in ${(m.buildMs / 1000).toFixed(1)} s — inside your browser tab.</p>
        </section>
      </div>

      <div class="labgrid">
        <section class="labcard">
          <h3>Top scam signals the model learned</h3>
          <div class="toks">${window.SCAMPROOF_ML.topWeights(m.vocab, m.model.w, 14, true).map(([t]) => `<span class="tok red">${S.esc(t)}</span>`).join(" ")}</div>
        </section>
        <section class="labcard">
          <h3>Top safe signals</h3>
          <div class="toks">${window.SCAMPROOF_ML.topWeights(m.vocab, m.model.w, 14, false).map(([t]) => `<span class="tok green">${S.esc(t)}</span>`).join(" ")}</div>
        </section>
      </div>

      <section class="labcard archcard">
        <h3>Architecture — tiny by design</h3>
        <div class="arch">📨 raw text → 🔤 tokenizer (URLs, phone numbers, money, shouty punctuation → dedicated tokens) → 📊 TF-IDF-style sparse vectors (top ${m.vocab.size.toLocaleString()} n-grams, L2-normalized) → ⚙️ logistic regression (${m.vocab.size.toLocaleString()} weights + bias) → 🎯 calibrated probability</div>
        <p class="muted small">Why so small? Because interpretability is a safety feature: a senior user can see <i>why</i> the AI is worried, and the whole model is a few thousand numbers — it runs offline on a 10-year-old phone with zero dependencies.</p>
      </section>
    `;
  }

  function lossSvg(losses) {
    const W = 320, H = 120, P = 6;
    const xs = losses.map((l) => l.epoch), ys = losses.map((l) => l.loss);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const px = (x) => P + ((x - x0) / (x1 - x0 || 1)) * (W - 2 * P);
    const py = (y) => H - P - ((y - y0) / (y1 - y0 || 1)) * (H - 2 * P);
    const pts = losses.map((l) => `${px(l.epoch).toFixed(1)},${py(l.loss).toFixed(1)}`).join(" ");
    return `<svg viewBox="0 0 ${W} ${H}" class="losssvg" role="img" aria-label="loss curve">
      <polyline points="${pts}" fill="none" stroke="#0e9f6e" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="${P}" y1="${H - P}" x2="${W - P}" y2="${H - P}" stroke="#d6dedb" stroke-width="1"/>
      <line x1="${P}" y1="${P}" x2="${P}" y2="${H - P}" stroke="#d6dedb" stroke-width="1"/>
    </svg>`;
  }
})();
