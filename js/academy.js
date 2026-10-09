// ScamProof Academy: level grid, lesson intro, quizzes, endless practice (You vs AI).
(function () {
  "use strict";
  const S = window.SCAMPROOF;
  const LESSONS = window.SCAMPROOF_LESSONS;

  S.pages.academy = function (param) {
    const root = document.getElementById("page-academy");
    root.innerHTML = "";
    if (param && LESSONS.some((l) => l.id === param)) return renderIntro(root, LESSONS.find((l) => l.id === param));
    if (param === "practice") return renderPractice(root);
    renderGrid(root);
  };

  // ---------- Level grid ----------
  function renderGrid(root) {
    const st = S.getState();
    const passedCount = LESSONS.filter((l) => (st.passed[l.id] || 0) >= 0.75).length;
    root.appendChild(S.el(`
      <header class="pagehead">
        <h1>ScamProof Academy</h1>
        <p>Six scam families, one bonus on AI tricks. Learn the red flags, then prove it in the quiz. Pass a level with 75% or more.</p>
        <div class="progressline"><div class="progressfill" style="width:${(100 * passedCount) / LESSONS.length}%"></div></div>
        <div class="progresscap">${passedCount} of ${LESSONS.length} levels passed · ${st.xp} XP</div>
      </header>
    `));

    const grid = S.el(`<div class="levelgrid"></div>`);
    for (const l of LESSONS) {
      const best = st.passed[l.id] || 0;
      const card = S.el(`
        <button class="levelcard" style="--accent:${l.accent}">
          ${l.bonus ? `<span class="badge bonus">New · AI era</span>` : `<span class="badge">Level ${LESSONS.indexOf(l) + 1}</span>`}
          <div class="level-icon">${l.icon}</div>
          <h3>${l.title}</h3>
          <div class="level-score">${best >= 0.75 ? `✅ passed · best ${S.pct(best)}` : best > 0 ? `best attempt ${S.pct(best)}` : "not started"}</div>
        </button>
      `);
      card.addEventListener("click", () => S.go("academy", l.id));
      grid.appendChild(card);
    }
    root.appendChild(grid);

    const locked = passedCount < 3;
    const prac = S.el(`
      <button class="practicecard ${locked ? "locked" : ""}">
        <div>
          <h3>⚡ Endless practice — You vs the AI</h3>
          <p>${locked ? "Pass any 3 lessons to unlock. Real messages the model has never seen: you judge them, then the AI shows its answer and reasoning."
                    : "Real messages the model has never seen. You judge them, then the AI shows its answer and reasoning."}</p>
        </div>
        <span class="practice-arrow">→</span>
      </button>
    `);
    if (!locked) prac.addEventListener("click", () => S.go("academy", "practice"));
    root.appendChild(prac);
  }

  // ---------- Lesson intro ----------
  function renderIntro(root, l) {
    const st = S.getState();
    root.appendChild(S.el(`<header class="pagehead"><button class="btn small ghost" data-go="academy">← All levels</button></header>`));
    const intro = S.el(`<section class="lessonintro" style="--accent:${l.accent}">
        <div class="lesson-icon big">${l.icon}</div>
        <h1>${l.title}</h1>
        <p class="lesson-desc">${l.intro}</p>
        <div class="goldenrule">💡 ${l.goldenRule}</div>
        <h2>Three red flags to remember</h2>
        <div class="flagcards">
          ${l.flags.map((f, i) => `
            <div class="flagcard">
              <div class="flag-icon">${f.icon}</div>
              <div><h4>${i + 1}. ${f.title}</h4><p>${f.why}</p></div>
            </div>`).join("")}
        </div>
        <div class="startrow">
          <button class="btn primary big" id="startQuiz">Start the quiz →</button>
          ${st.passed[l.id] >= 0.75 ? `<span class="retakehint">You already passed — retake to beat your score!</span>` : ""}
        </div>
      </section>`);
    root.appendChild(intro);
    intro.querySelector("#startQuiz").addEventListener("click", () => renderQuiz(root, l));
  }

  // ---------- Quiz ----------
  function renderQuiz(root, l) {
    const items = l.mcq ? l.mcqs.slice() : shuffle(l.quiz.slice());
    let i = 0, correct = 0;
    const box = S.el(`<section class="quiz"></section>`);
    root.innerHTML = "";
    root.appendChild(S.el(`<header class="pagehead"><button class="btn small ghost" data-go="academy">← Quit</button><h2>${l.icon} ${l.title}</h2></header>`));
    root.appendChild(box);

    const bar = S.el(`<div class="progressline tall"><div class="progressfill" style="width:0%"></div></div>`);
    root.appendChild(bar);

    function show() {
      bar.firstElementChild.style.width = (100 * i) / items.length + "%";
      const q = items[i];
      if (l.mcq) {
        box.innerHTML = `
          <div class="smsrow">
            <div class="smsbubble">
              <div class="sms-meta">Scenario ${i + 1} of ${items.length} · choose the safest response</div>
              <div class="sms-text">${S.esc(q.scenario)}</div>
            </div>
          </div>
          <div class="quizbtns mcqbtns">
            ${q.options.map((o, j) => `<button class="btn ghost big" data-j="${j}">${S.esc(o)}</button>`).join("")}
          </div>
          <div class="feedback" id="feedback"></div>
        `;
        box.querySelectorAll("[data-j]").forEach((b) =>
          b.addEventListener("click", () => answerMcq(+b.dataset.j, q)));
        return;
      }
      box.innerHTML = `
        <div class="smsrow">
          <div class="smsbubble">
            <div class="sms-meta">Incoming message · question ${i + 1} of ${items.length}</div>
            <div class="sms-text">${S.esc(q.text)}</div>
          </div>
        </div>
        <div class="quizbtns">
          <button class="btn danger big" data-a="scam">🚩 This is a scam</button>
          <button class="btn safe big" data-a="safe">✅ This is safe</button>
        </div>
        <div class="feedback" id="feedback"></div>
      `;
      box.querySelectorAll("[data-a]").forEach((b) =>
        b.addEventListener("click", () => answer(b.dataset.a === "scam", q)));
    }

    function answerMcq(j, q) {
      const right = j === q.answer;
      if (right) correct++;
      S.recordAnswer(l.id, right);
      const fb = box.querySelector("#feedback");
      fb.className = "feedback show " + (right ? "good" : "bad");
      fb.innerHTML = `
        <div class="fb-title">${right ? "✅ Exactly the right reflex!" : "❌ That's what the scammers hope you'll do."}</div>
        <p>${q.why}</p>
        <button class="btn primary" id="nextQ">${i + 1 < items.length ? "Next scenario →" : "See my result →"}</button>
      `;
      box.querySelectorAll(".quizbtns button").forEach((b) => (b.disabled = true));
      fb.querySelector("#nextQ").addEventListener("click", () => {
        i++;
        if (i < items.length) show();
        else finish();
      });
      fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function answer(userSaysScam, q) {
      const isScam = !!q.scam;
      const right = userSaysScam === isScam;
      if (right) correct++;
      S.recordAnswer(l.id, right);
      const fb = box.querySelector("#feedback");
      fb.className = "feedback show " + (right ? "good" : "bad");
      fb.innerHTML = `
        <div class="fb-title">${right ? "✅ Correct!" : isScam ? "🚩 Careful — this one WAS a scam." : "🙈 It was actually safe."}</div>
        <p>${q.why}</p>
        ${isScam && q.flags && q.flags.length ? `<div class="fb-flags">${q.flags.map((f) => `<span class="chip">${l.flags[f].icon} ${l.flags[f].title}</span>`).join("")}</div>` : ""}
        <button class="btn primary" id="nextQ">${i + 1 < items.length ? "Next message →" : "See my result →"}</button>
      `;
      box.querySelectorAll(".quizbtns button").forEach((b) => (b.disabled = true));
      fb.querySelector("#nextQ").addEventListener("click", () => {
        i++;
        if (i < items.length) show();
        else finish();
      });
      fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function finish() {
      const score = correct / items.length;
      const pass = score >= 0.75;
      const st = S.getState();
      st.passed[l.id] = Math.max(st.passed[l.id] || 0, score);
      st.xp += correct * 10 + (pass ? 30 : 0);
      S.save();
      box.innerHTML = `
        <div class="resultcard ${pass ? "good" : "retry"}" style="--accent:${l.accent}">
          <div class="result-emoji">${pass ? "🏅" : "🔁"}</div>
          <h2>${pass ? "Level passed!" : "Almost there"}</h2>
          <div class="result-score">${correct} / ${items.length} · ${S.pct(score)}</div>
          <p>${pass ? "+30 bonus XP. You can now spot this scam family in the wild." : "You need 75% to pass. Have another look at the red flags and try again — repetition is exactly how immunity is built."}</p>
          <div class="resultbtns">
            ${pass ? `<button class="btn primary big" data-go="academy">Back to levels</button>
                      <button class="btn ghost big" id="again">Try again</button>`
                   : `<button class="btn primary big" id="again">Try again</button>
                      <button class="btn ghost big" data-go="academy">Back to levels</button>`}
          </div>
        </div>
      `;
      box.querySelector("#again").addEventListener("click", () => renderQuiz(root, l));
    }

    show();
  }

  // ---------- Endless practice: You vs AI ----------
  function renderPractice(root) {
    root.innerHTML = "";
    root.appendChild(S.el(`
      <header class="pagehead">
        <button class="btn small ghost" data-go="academy">← All levels</button>
        <h1>⚡ You vs the AI</h1>
        <p>Real messages from the <b>test set</b> — the model has never trained on these. Give your verdict, then see the AI's.</p>
      </header>`));
    const box = S.el(`<div id="pracBox"><div class="loadingbox">🧠 Waking up the model (training on ${window.SCAMPROOF_META.n.toLocaleString()} messages)…</div></div>`);
    root.appendChild(box);

    S.ensureModel(() => nextRound(box));
  }

  function nextRound(box) {
    const m = S.getModel();
    const t = m.test[Math.floor(Math.random() * m.test.length)];
    const pred = m.predictText(t.text);
    const aiSaysScam = pred.score >= 0.5;

    box.innerHTML = `
      <div class="smsrow">
        <div class="smsbubble">
          <div class="sms-meta">Incoming message · from the AI's unseen test set</div>
          <div class="sms-text">${S.esc(t.text)}</div>
        </div>
      </div>
      <div class="quizbtns">
        <button class="btn danger big" data-a="scam">🚩 Scam</button>
        <button class="btn safe big" data-a="safe">✅ Safe</button>
      </div>
      <div class="feedback" id="pfb"></div>
    `;
    box.querySelectorAll("[data-a]").forEach((b) =>
      b.addEventListener("click", () => reveal(b.dataset.a === "scam")));
    box.querySelector(".smsbubble").scrollIntoView({ behavior: "smooth", block: "nearest" });

    function reveal(userSaysScam) {
      const right = userSaysScam === t.y;
      S.getState().practice.push({ t: Date.now(), correct: right });
      S.save();
      const fb = box.querySelector("#pfb");
      const truth = t.y === 1;
      fb.className = "feedback show " + (right ? "good" : "bad");
      fb.innerHTML = `
        <div class="fb-title">${right ? "✅ You and reality agree." : truth ? "🚩 It was a scam." : "🙈 It was safe."}</div>
        <div class="ai-verdict">
          <div class="ai-badge ${aiSaysScam ? "danger" : "safe"}">AI says: ${aiSaysScam ? "🚩 Scam" : "✅ Safe"} · ${S.pct(pred.score)} confidence</div>
          <div class="ai-agree">${userSaysScam === aiSaysScam ? "🤝 Same verdict as the AI" : "⚔️ You disagreed with the AI"}</div>
        </div>
        <h4>Why the AI decided this</h4>
        <div class="explain">
          ${pred.scamWords.length ? `<div class="explain-col"><div class="explain-head">pushes toward <b>scam</b></div>${pred.scamWords.map((w) => `<span class="tok red">${S.esc(w.token)}</span>`).join(" ")}</div>` : ""}
          ${pred.safeWords.length ? `<div class="explain-col"><div class="explain-head">pushes toward <b>safe</b></div>${pred.safeWords.map((w) => `<span class="tok green">${S.esc(w.token)}</span>`).join(" ")}</div>` : ""}
        </div>
        <p class="practicenote">Note how the AI sees keyword patterns — but <b>you</b> see the story and the context. That's why the best protection is both.</p>
        <button class="btn primary big" id="nextMsg">Next message →</button>
      `;
      box.querySelectorAll(".quizbtns button").forEach((b) => (b.disabled = true));
      fb.querySelector("#nextMsg").addEventListener("click", () => nextRound(box));
    }
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
})();
