# 🛡️ ScamProof — Train your scam immunity with real AI

**[▶ Live demo](https://jasurcyb.me/)** — runs entirely in your browser, nothing ever leaves your device.

**ScamProof** is a free, private, senior-friendly web app that teaches people — especially adults 60+ — to recognize scam messages, fake-bank texts, OTP-theft tricks, romance fraud and AI voice-clone scams. Inside it runs a **genuine machine-learning model trained live in your browser** on 5,118 real, publicly labelled SMS messages. No cloud. No accounts. No API keys. Nothing ever leaves the device.

> **The pitch:** Fraud awareness training is the most effective defence against scams — once a person can name the trick, the trick stops working. ScamProof turns that training into a 5-minute-a-day habit, and pairs it with an explainable AI scanner so users can check any suspicious message and *see exactly why* it looks like a scam.

> **Why now:** In October 2026, Uzbekistan's Deputy Interior Minister Ramazon Ashropov reported **69,962 ICT-enabled crimes in just six months** — the vast majority of them money stolen from citizens through electronic payment systems. This project targets exactly those channels — payment-app scams, OTP theft, Telegram/WhatsApp social engineering — with training and an on-device scanner (multilingual lesson content is the first roadmap item).

---

## ✨ What it does

| Module | What the user gets |
|---|---|
| 🎓 **Academy** | 6 scam families (prizes, fake banks, OTP theft, family/romance, investment, delivery) + a bonus on **AI voice & deepfakes**. Each level: 3 memorable red flags → a quiz with instant, plain-language feedback. |
| ⚡ **You vs the AI** | Endless practice on **held-out test messages the model has never seen**. You give a verdict, then the AI shows its own verdict, confidence, and the exact words that pushed it. |
| 🔍 **Scanner** | Paste any suspicious text → scam probability in milliseconds, classic red flags found, and a per-token explanation of the AI's decision. 100% on-device. |
| 🧠 **Model Lab** | Watch the model **train from scratch in your browser**: dataset card, training steps, loss curve, accuracy / precision / recall / F1 / ROC-AUC, confusion matrix, and the top scam & safe signals it learned. Retrain with a new random split any time. |

## 🧠 The machine learning (no black box)

A compact, fully transparent pipeline — deliberately small, because **interpretability is a safety feature**:

```
raw text → tokenizer (URLs, phone numbers, money amounts, shouty punctuation
           become dedicated signal tokens; unigrams + bigrams)
         → sparse binary feature vectors (top 6,000 n-grams)
         → logistic regression (class-weighted, L2-regularized, full-batch GD, 1200 epochs)
         → calibrated scam probability + per-token contributions
```

**Honest results on the held-out test set** (seed 42, reproducible via the Retrain button):

| accuracy | precision | recall | F1 | ROC-AUC | latency |
|---|---|---|---|---|---|
| **98.9%** | **99.2%** | **92.2%** | **95.5%** | **0.988** | ~0.2 ms |

Confusion matrix: 118 scams caught, 10 missed, **1 false alarm** out of 895 safe messages. Metrics are computed only on messages excluded from training; retraining with a new seed re-splits the data, and the numbers stay stable — that's what honest ML looks like.

The ML layer is also **hybrid**: alongside the learned model, a rule engine surfaces classic red flags (links, urgency, "gift cards", OTP requests, fake delivery fees) with human explanations — because the best assistant shows its work.

## 🔒 Privacy by design

- All training, scoring and progress tracking happen **in the browser tab** — there is no backend at all.
- No accounts, no analytics, no cookies, no network calls after the page loads.
- Progress is stored in `localStorage` on the user's own device.
- Works offline once loaded; runs on a 10-year-old phone.

## ♿ Designed for the target users

- **Three text sizes** (A / A+ / A++) and a **high-contrast mode** built in.
- Plain language everywhere; every metric explained in a sentence.
- Positive, shame-free tone: "Almost there — repetition is exactly how immunity is built."

## 🚀 Run it

No build step, no dependencies:

```bash
# option 1: any static server
node tools/server.js 8080        # → http://localhost:8080

# option 2: just open index.html in a browser (double-click works too)
```

Or deploy the folder as-is to GitHub Pages / Netlify / Vercel.

**Project structure**

```
index.html          app shell
css/styles.css      design system (light/dark-contrast, 3 text scales)
js/data.js          generated corpus (tools/build-data.js)
js/ml.js            tokenizer, vectorizer, logistic regression, metrics, rule flags
js/lessons.js       curated Academy content (6 families + AI-voice bonus)
js/app.js           router, state, home, accessibility
js/academy.js       levels, quizzes, You-vs-AI practice
js/scanner.js       explainable message scanner
js/lab.js           live training + evaluation dashboard
tools/              dataset builder, tuning script, dev server
screenshots/        submission screenshots
```

## 📊 Dataset & credits

- [UCI Machine Learning Repository — SMS Spam Collection](https://archive.ics.uci.edu/dataset/228/sms+spam+collection) (Almeida, T. A., Hidalgo, J. M. G., & Yamakami, A., 2011), licensed **CC BY 4.0**. 5,574 raw messages → 5,118 after deduplication and length filtering.
- Scam-pattern lesson content follows public-interest guidance published by consumer-protection bodies (FTC, Action Fraud). All examples are for recognition training only.

## ⚠️ Disclaimer

ScamProof is an **educational project**, not a security product. A low score does not guarantee a message is safe, and a high score does not replace critical thinking. When in doubt: stop, don't click, don't share codes, and verify by calling the person or company on the number you already have.

---

