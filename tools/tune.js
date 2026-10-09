// Offline hyperparameter check — runs the same browser ml.js in Node via require.
global.performance = { now: () => Date.now() };
require("../js/data.js");
require("../js/ml.js");
const ML = globalThis.SCAMPROOF_ML;
const corpus = globalThis.SCAMPROOF_CORPUS.map(([text, y]) => ({ text, y }));

const configs = [
  { epochs: 500, l2: 3e-5 },
  { epochs: 500, l2: 1e-4 },
  { epochs: 800, l2: 1e-4 },
  { epochs: 800, l2: 3e-4 },
  { epochs: 1200, l2: 3e-4 },
];
for (const cfg of configs) {
  for (const seed of [42, 7]) {
    const m = ML.buildModel(corpus, seed, cfg);
    const t = m.testMetrics;
    console.log(
      `epochs=${cfg.epochs} l2=${cfg.l2} seed=${seed} :: acc=${(100 * t.accuracy).toFixed(1)} prec=${(100 * t.precision).toFixed(1)} rec=${(100 * t.recall).toFixed(1)} f1=${(100 * t.f1).toFixed(1)} auc=${t.auc.toFixed(3)} fp=${t.fp} fn=${t.fn}`
    );
  }
}
