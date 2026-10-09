// ScamProof ML engine — tokenizer, TF-IDF-style features, logistic regression,
// evaluation metrics and per-token explanations. 100% dependency-free, runs in browser.
(function () {
  "use strict";

  // ---------- Deterministic PRNG (seeded shuffles for reproducible splits) ----------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- Normalization + tokenization ----------
  // URLS, phone numbers, money amounts and shouty punctuation carry strong scam
  // signal, so they are mapped to dedicated placeholder tokens instead of being dropped.
  const URL_RE = /(?:https?:\/\/|www\.)\S+|(?:\b[\w-]+\.)(?:com|net|org|co|uk|info|biz|ru|xyz|top|link|site|online)\b(?:\/\S*)?/gi;
  const PHONE_RE = /(?:\+?\d[\d\s\-()]{7,}\d)/g;
  const MONEY_RE = /(?:[$£€]\s?\d[\d,.]*|\b\d[\d,.]*\s?(?:pounds?|dollars?|euros?|gbp|usd|p|m)\b)/gi;
  const NUM_RE = /\b\d+(?:[.,]\d+)*\b/g;
  const BANG_RE = /([!?]){2,}/g;
  const WORD_RE = /[a-z']{2,}/g;

  const STOP = new Set(("the a an and or but if of to in on for with is are was were be been being it its this that these those i you he she we they me him her them my your our their do does did not no so as at by from have has had will would can could should just get got go going").split(" "));

  function normalize(text) {
    let t = " " + text.toLowerCase() + " ";
    t = t.replace(/&(?:amp|lt|gt|quot|apos|nbsp|#x?[0-9a-f]+);/g, " "); // strip HTML entities from corpus artifacts
    t = t.replace(URL_RE, " urltoken ");
    t = t.replace(MONEY_RE, " moneytoken ");
    t = t.replace(PHONE_RE, " phonetoken ");
    t = t.replace(NUM_RE, " numtoken ");
    t = t.replace(BANG_RE, " bangtoken ");
    return t;
  }

  function tokenize(text) {
    const t = normalize(text);
    const words = t.match(WORD_RE) || [];
    const unigrams = [];
    for (const w of words) {
      if (w === "urltoken" || w === "moneytoken" || w === "phonetoken" || w === "numtoken" || w === "bangtoken") { unigrams.push(w); continue; }
      if (STOP.has(w)) continue;
      unigrams.push(w);
    }
    const out = unigrams.slice();
    for (let i = 0; i < unigrams.length - 1; i++) out.push(unigrams[i] + "_" + unigrams[i + 1]); // bigrams
    return out;
  }

  // ---------- Vocabulary (top-K by document frequency) ----------
  function buildVocab(docs, k) {
    const df = new Map();
    for (const d of docs) {
      const toks = new Set(tokenize(d.text));
      for (const tok of toks) df.set(tok, (df.get(tok) || 0) + 1);
    }
    const arr = [...df.entries()].sort((a, b) => b[1] - a[1]);
    const vocab = new Map();
    const n = Math.min(k, arr.length);
    for (let i = 0; i < n; i++) vocab.set(arr[i][0], i);
    return vocab;
  }

  // ---------- Sparse vectorization: binary presence (standard for LR text classification) ----------
  function vectorize(docs, vocab) {
    const n = docs.length;
    const indptr = new Int32Array(n + 1);
    const indices = [];
    const data = [];
    for (let r = 0; r < n; r++) {
      const counts = new Map();
      for (const tok of tokenize(docs[r].text)) {
        const j = vocab.get(tok);
        if (j !== undefined) counts.set(j, 1);
      }
      const entries = [...counts.entries()].sort((a, b) => a[0] - b[0]);
      for (const [j] of entries) {
        indices.push(j);
        data.push(1);
      }
      indptr[r + 1] = indices.length;
    }
    return { indptr, indices: Int32Array.from(indices), data: Float32Array.from(data), n };
  }

  // ---------- Logistic regression (full-batch gradient descent, L2, class-weighted) ----------
  function trainLogReg(X, y, opts) {
    const { epochs = 1200, lr0 = 2.5, l2 = 3e-4, dim = X.dim } = opts || {};
    const w = new Float64Array(dim);
    let b = 0;
    const n = X.n;
    // Class weighting neutralizes the 87/13 ham/spam imbalance so the model
    // cannot win by always predicting "safe".
    let nPos = 0;
    for (let r = 0; r < n; r++) if (y[r] === 1) nPos++;
    const wPos = n / (2 * Math.max(1, nPos));
    const wNeg = n / (2 * Math.max(1, n - nPos));
    const losses = [];
    const t0 = performance.now();

    for (let ep = 0; ep < epochs; ep++) {
      const lr = lr0 / (1 + ep / 120);
      const gw = new Float64Array(dim);
      let gb = 0;
      let loss = 0;
      for (let r = 0; r < n; r++) {
        const cw = y[r] === 1 ? wPos : wNeg;
        const s = b + dotRow(X, w, r);
        const p = 1 / (1 + Math.exp(-s));
        const e = cw * (p - y[r]);
        gb += e;
        loss += cw * -(y[r] * Math.log(p + 1e-12) + (1 - y[r]) * Math.log(1 - p + 1e-12));
        for (let k = X.indptr[r]; k < X.indptr[r + 1]; k++) gw[X.indices[k]] += e * X.data[k];
      }
      for (let j = 0; j < dim; j++) w[j] -= lr * (gw[j] / n + l2 * w[j]);
      b -= lr * (gb / n);
      if (ep % 40 === 0 || ep === epochs - 1) losses.push({ epoch: ep, loss: loss / n });
    }
    return { w, b, losses, trainMs: performance.now() - t0, epochs, lr0, l2 };
  }

  function dotRow(X, w, r) {
    let s = 0;
    for (let k = X.indptr[r]; k < X.indptr[r + 1]; k++) s += w[X.indices[k]] * X.data[k];
    return s;
  }

  function predictScore(model, X, r) {
    return 1 / (1 + Math.exp(-(model.b + dotRow(X, model.w, r))));
  }

  // ---------- Metrics ----------
  function evaluate(model, X, y) {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    const scores = [];
    for (let r = 0; r < X.n; r++) {
      const p = predictScore(model, X, r);
      scores.push([p, y[r]]);
      const pred = p >= 0.5 ? 1 : 0;
      if (pred === 1 && y[r] === 1) tp++;
      else if (pred === 1 && y[r] === 0) fp++;
      else if (pred === 0 && y[r] === 0) tn++;
      else fn++;
    }
    const accuracy = (tp + tn) / X.n;
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

    // ROC-AUC via rank statistic (handles ties with average ranks)
    scores.sort((a, b) => a[0] - b[0]);
    let rankSumPos = 0, nPos = 0;
    for (let i = 0; i < scores.length; i++) {
      if (scores[i][1] === 1) { rankSumPos += i + 1; nPos++; }
    }
    const nNeg = scores.length - nPos;
    const auc = nPos === 0 || nNeg === 0 ? 0.5 : (rankSumPos - (nPos * (nPos + 1)) / 2) / (nPos * nNeg);

    return { tp, fp, tn, fn, accuracy, precision, recall, f1, auc };
  }

  // ---------- Full pipeline: split -> vocab -> vectorize -> train -> evaluate ----------
  function buildModel(allDocs, seed, opts) {
    const t0 = performance.now();
    opts = opts || {};
    const testFrac = opts.testFrac || 0.2;
    const vocabSize = opts.vocabSize || 6000;

    // Stratified shuffle split
    const rand = mulberry32(seed);
    const pos = [], neg = [];
    allDocs.forEach((d, i) => (d.y === 1 ? pos : neg).push(i));
    shuffle(pos, rand); shuffle(neg, rand);
    const nTestPos = Math.round(pos.length * testFrac);
    const nTestNeg = Math.round(neg.length * testFrac);
    const testIdx = new Set([...pos.slice(0, nTestPos), ...neg.slice(0, nTestNeg)]);
    const train = [], test = [];
    allDocs.forEach((d, i) => (testIdx.has(i) ? test : train).push(d));

    const vocab = buildVocab(train, vocabSize);
    const Xtr = vectorize(train, vocab); Xtr.dim = vocab.size;
    const Xte = vectorize(test, vocab); Xte.dim = vocab.size;
    const ytr = train.map((d) => d.y);
    const yte = test.map((d) => d.y);

    const model = trainLogReg(Xtr, ytr, { dim: vocab.size, epochs: opts.epochs });
    const trainMetrics = evaluate(model, Xtr, ytr);
    const testMetrics = evaluate(model, Xte, yte);

    return {
      vocab, train, test, model, trainMetrics, testMetrics,
      buildMs: performance.now() - t0, seed,
      predictText,
      topWeights,
    };

    function shuffle(a, rnd) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }

    function predictText(text) {
      const doc = { text };
      const x = vectorize([doc], vocab); x.dim = vocab.size;
      const score = predictScore(model, x, 0);
      // per-token contributions: w_j * x_j
      const contribs = [];
      for (let k = x.indptr[0]; k < x.indptr[0 + 1]; k++) contribs.push({ token: keyOf(x.indices[k]), w: model.w[x.indices[k]] * x.data[k] });
      contribs.sort((a, b) => b.w - a.w);
      const scamWords = contribs.filter((c) => c.w > 0).slice(0, 8);
      const safeWords = contribs.filter((c) => c.w < 0).sort((a, b) => a.w - b.w).slice(0, 5);
      return { score, scamWords, safeWords };
    }

    function keyOf(idx) { for (const [t, i] of vocab) if (i === idx) return t; return "?"; }
  }

  function topWeights(modelVocab, w, k, positive) {
    const arr = [];
    for (const [t, i] of modelVocab) if (!t.includes("_")) arr.push([t, w[i]]);
    arr.sort((a, b) => (positive ? b[1] - a[1] : a[1] - b[1]));
    return arr.slice(0, k);
  }

  // ---------- Rule-based red flags (hybrid layer: complements the model) ----------
  function ruleFlags(text) {
    const flags = [];
    const t = text.toLowerCase();
    if (URL_RE.test(text) || /\b[a-z0-9-]+\.(com|net|xyz|top|link|info|online|site)\b/i.test(text)) flags.push({ icon: "🔗", title: "Contains a link", why: "Scammers push you to fake login pages or malware. Never click links from unknown senders — type the address yourself." });
    if (/(urgent|immediately|act now|final (notice|warning)|within \d+ (hours|minutes|days)|expires? (today|tomorrow|in)|last chance|asap)/.test(t)) flags.push({ icon: "⏰", title: "Artificial urgency", why: "Pressure to act fast is designed to stop you from thinking or checking with someone you trust." });
    if (/(won|winner|selected|lucky draw|lottery|prize|claim your|congratulations)/.test(t) && /(free|claim|fee|tax|code|call|text)/.test(t)) flags.push({ icon: "🎁", title: "Unexpected prize", why: "Real lotteries never ask winners to pay fees or share codes to receive money." });
    if (/(otp|one[- ]time (code|password)|verification code|pin|password|confirm your (identity|account))/.test(t)) flags.push({ icon: "🔢", title: "Asks for codes or passwords", why: "No real bank, shop or delivery company will ever ask for your one-time codes. These words are a huge red flag." });
    if (/(bank|account (has been )?(suspended|locked|blocked|compromised)|unusual (activity|login)|security (alert|breach))/.test(t)) flags.push({ icon: "🏦", title: "Fake account alert", why: "Banks send alerts inside their official app, not by text asking you to 'verify' via a link." });
    if (/[$£€]/.test(text) || /moneytoken/.test(normalize(text))) flags.push({ icon: "💰", title: "Money involved", why: "Requests to pay a fee, tax or deposit — or offers of easy money — are the core of most scams." });
    if (/(gift card|itunes|steam|bitcoin|crypto|wire transfer|western union|zelle|cash ?app)/.test(t)) flags.push({ icon: "💳", title: "Hard-to-reverse payment", why: "Gift cards, crypto and wire transfers are requested because the money cannot be recovered." });
    if (/(call this number|text (us|me) (at|on)|whatsapp (me|us)|telegram)/.test(t) || phonetokenPresent()) flags.push({ icon: "📞", title: "Move contact off-platform", why: "Scammers want you on WhatsApp/Telegram or a private number where they control the conversation." });
    if (/(mum|mom|mother|dad|father|son|daughter|grandma|grandpa|brother|sister)/.test(t) && /(new number|lost (my )?phone|stuck|emergency|help me|need money|been in an accident)/.test(t)) flags.push({ icon: "👨‍👩‍👧", title: "Family emergency", why: "'Hi mum, this is my new number' is a classic — always call the real number of your relative to check." });
    if (/(your (package|parcel|delivery)|royal mail|dhl|fedex|ups|usps|customs|redeliver|shipping fee)/.test(t)) flags.push({ icon: "📦", title: "Fake delivery notice", why: "Real couriers don't ask for a small 'customs fee' by text with a link. Check the tracking in their official app." });
    function phonetokenPresent() { return PHONE_RE.test(text) && text.replace(PHONE_RE, "").length < text.length; }
    return flags;
  }

  (typeof window !== "undefined" ? window : globalThis).SCAMPROOF_ML = { tokenize, buildModel, topWeights, ruleFlags, mulberry32 };
})();
