// senior: the app. Lessons register themselves with COURSE.lesson({...}).
(function () {
  "use strict";

  const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  const RUN_LIMIT_MS = 4000;
  const LESSONS = [];
  window.COURSE = { lesson: (l) => LESSONS.push(l) };

  // The whole course. Lessons without a data file show as "coming".
  const PLAN = [
    ["01", "Binary trees", "Recursion (pass down, return up, answer on the side), level by level with a queue, BST order."],
    ["02", "Prefix sums + hash map", "Running totals, {prefix: count}, sum = k as a lookup."],
    ["03", "Sliding window", "Grow and shrink, what the window holds, exactly k = at most k − at most k−1."],
    ["04", "Two pointers after sorting", "Sort then squeeze, skipping duplicates, 3-sum around 2-sum."],
    ["05", "Binary search on the answer", "One boundary template, the feasibility check, rotated arrays."],
    ["06", "Stacks: monotonic + parsing", "Which way it's sorted, when to pop, contribution counting, a stack of states for nesting."],
    ["07", "Heaps + selection", "heapq tuples, top k, two heaps, k-way merge, schedulers, quickselect, bucket by count."],
    ["08", "Intervals + sweep line", "Sort by start or end, merge, +1/−1 events, rooms."],
    ["09", "Greedy", "One safe choice at a time: furthest reach, sort by the right key, why it works, when it breaks."],
    ["10", "Backtracking", "Choose → explore → undo, pruning, skipping duplicate results."],
    ["11", "DP 1: recursion to table", "Name the state, @cache it, then tabulate."],
    ["12", "DP 2: the families", "Knapsack, interval, state machine, bitmask."],
    ["13", "Design-a-class", "Pick structures for the required speeds, O(1) tricks, lazy deletion."],
    ["14", "Mixed", "No labels: picking the tool is part of the test."],
  ];

  // ── storage (per-browser conveniences; never required) ───────────────────
  const store = {
    get(k, d) { try { const v = localStorage.getItem("senior.v1." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("senior.v1." + k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem("senior.v1." + k); } catch {} },
  };
  const key = (l, e, ...rest) => [l.id, e.id, ...rest].join(".");
  const times = (l, e, mode) => store.get(key(l, e, "times", mode), []);
  const best = (arr) => (arr.length ? Math.min(...arr.map((t) => t.ms)) : null);
  const isDone = (l, e) => !!store.get(key(l, e, "done"), null);

  // ── helpers ──────────────────────────────────────────────────────────────
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (ms) => { if (ms == null) return "–"; const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const ago = (t) => { if (!t) return "never"; const d = Math.floor((Date.now() - t) / 86400000); return d === 0 ? "today" : d === 1 ? "yesterday" : d + " days ago"; };
  const stripComments = (code) => code.split("\n").map((l) => l.replace(/#.*$/, "")).join("\n");
  // Phone keyboards turn ' and " into curly quotes, which Python rejects.
  const straight = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  const ASK_MARK = /\s*#\s*ask(?:\s+[\d,\s]+)?:.*$/;

  // ── tree diagrams ────────────────────────────────────────────────────────
  // Lesson HTML can hold <span class="tree" data-tree="[8, 4, 12]"></span>, a LeetCode
  // level-order list. Optional: data-path="8,12" (highlighted nodes and the edges between
  // them), data-bad="3" (marked wrong), data-cap="caption". x = inorder position, so a
  // BST reads sorted from left to right.
  function treeSvg(vals, path, bad) {
    if (!vals.length || vals[0] == null) return `<em>(empty tree)</em>`;
    const nodes = [{ v: vals[0], d: 0 }];
    const q = [nodes[0]];
    for (let i = 1; q.length && i < vals.length; ) {
      const p = q.shift();
      for (const side of ["l", "r"]) {
        if (i < vals.length && vals[i] != null) { const c = { v: vals[i], d: p.d + 1 }; p[side] = c; nodes.push(c); q.push(c); }
        i++;
      }
    }
    let x = 0;
    const place = (n) => { if (!n) return; place(n.l); n.x = x++; place(n.r); };
    place(nodes[0]);
    const R = 15, DX = 36, DY = 52, PAD = 4;
    const depth = Math.max(...nodes.map((n) => n.d));
    const W = (x - 1) * DX + 2 * (R + PAD), H = depth * DY + 2 * (R + PAD);
    const cx = (n) => n.x * DX + R + PAD, cy = (n) => n.d * DY + R + PAD;
    const on = (n) => path.has(String(n.v));
    let edges = "", circles = "";
    for (const n of nodes) for (const c of [n.l, n.r]) if (c) {
      edges += `<line x1="${cx(n)}" y1="${cy(n)}" x2="${cx(c)}" y2="${cy(c)}" class="${on(n) && on(c) ? "on" : ""}"/>`;
    }
    for (const n of nodes) {
      const cls = bad.has(String(n.v)) ? "bad" : on(n) ? "on" : "";
      circles += `<g class="${cls}"><circle cx="${cx(n)}" cy="${cy(n)}" r="${R}"/><text x="${cx(n)}" y="${cy(n)}">${esc(n.v)}</text></g>`;
    }
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="tree ${esc(JSON.stringify(vals))}">${edges}${circles}</svg>`;
  }
  function drawTrees(root) {
    root.querySelectorAll(".tree:not([data-drawn])").forEach((el) => {
      el.dataset.drawn = "1";
      const set = (s) => new Set((s || "").split(",").map((t) => t.trim()).filter(Boolean));
      let vals;
      try { vals = JSON.parse(el.dataset.tree.replace(/None/g, "null")); } catch { return; }
      el.innerHTML = treeSvg(vals, set(el.dataset.path), set(el.dataset.bad)) + (el.dataset.cap ? `<span class="tree-cap">${el.dataset.cap}</span>` : "");
    });
  }
  new MutationObserver(() => drawTrees(document)).observe(document.documentElement, { childList: true, subtree: true });

  // ── Python in a worker (so an infinite loop can be killed) ───────────────
  function workerMain() {
    let py = null;
    self.onmessage = async (e) => {
      const m = e.data;
      if (m.type === "init") {
        try {
          importScripts(m.base + "pyodide.js");
          py = await loadPyodide({ indexURL: m.base });
          py.runPython(m.harness);
          self.postMessage({ type: "ready" });
        } catch (err) {
          self.postMessage({ type: "fail", msg: String(err) });
        }
        return;
      }
      try {
        const f = py.globals.get(m.fn);
        const out = f(...m.args);
        f.destroy();
        self.postMessage({ type: "result", id: m.id, json: out });
      } catch (err) {
        self.postMessage({ type: "result", id: m.id, json: JSON.stringify({ fatal: String(err) }) });
      }
    };
  }

  const Py = {
    w: null, ready: null, pending: new Map(), seq: 0,
    start() {
      setPy("loading", "Python loading…");
      const src = "(" + workerMain.toString() + ")()";
      this.w = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
      this.ready = new Promise((res, rej) => {
        this.w.onmessage = (e) => {
          const m = e.data;
          if (m.type === "ready") { setPy("ready", "Python ready"); res(); }
          else if (m.type === "fail") { setPy("failed", "Python failed to load"); console.error(m.msg); rej(new Error(m.msg)); }
          else if (m.type === "result") {
            const p = this.pending.get(m.id);
            if (p) { clearTimeout(p.t); this.pending.delete(m.id); p.res(JSON.parse(m.json)); }
          }
        };
        this.w.onerror = (e) => { setPy("failed", "Python failed to load"); rej(new Error(e.message || "worker error")); };
      });
      this.ready.catch(() => {});
      this.w.postMessage({ type: "init", base: PYODIDE_BASE, harness: window.COURSE_HARNESS });
    },
    async call(fn, args) {
      await this.ready;
      const id = ++this.seq;
      return new Promise((res) => {
        const t = setTimeout(() => {
          this.pending.delete(id);
          this.w.terminate();
          this.start();
          res({ timeout: true });
        }, RUN_LIMIT_MS);
        this.pending.set(id, { res, t });
        this.w.postMessage({ type: "call", id, fn, args });
      });
    },
  };
  function setPy(state, text) { const el = $("#py-status"); if (el) { el.dataset.state = state; el.textContent = text; } }

  // ── editor: a textarea that indents like an interview pad ────────────────
  function insertText(ta, text) {
    ta.focus();
    if (!document.execCommand("insertText", false, text)) {
      ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end");
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
  function selectedLines(ta) {
    const v = ta.value;
    const s = v.lastIndexOf("\n", ta.selectionStart - 1) + 1;
    let endPos = ta.selectionEnd;
    if (endPos > ta.selectionStart && v[endPos - 1] === "\n") endPos--;
    let e = v.indexOf("\n", endPos);
    if (e < 0) e = v.length;
    return [s, e];
  }
  function reindent(ta, fn) {
    const [s, e] = selectedLines(ta);
    const lines = ta.value.slice(s, e).split("\n").map(fn).join("\n");
    ta.setSelectionRange(s, e);
    insertText(ta, lines);
    ta.setSelectionRange(s, s + lines.length);
  }
  function makeEditor(host, { value, onInput, onRun }) {
    host.innerHTML = `<div class="editor"><pre class="gutter" aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Python code"></textarea></div>`;
    const ta = $("textarea", host), gutter = $(".gutter", host);
    let errLine = null;
    const paint = () => {
      const n = ta.value.split("\n").length;
      let h = "";
      for (let i = 1; i <= n; i++) h += `<span${i === errLine ? ' class="err"' : ""}>${i}</span>`;
      gutter.innerHTML = h;
      gutter.scrollTop = ta.scrollTop;
    };
    ta.value = value;
    paint();
    ta.addEventListener("scroll", () => { gutter.scrollTop = ta.scrollTop; });
    ta.addEventListener("input", () => { errLine = null; paint(); onInput(ta.value); });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onRun(); return; }
      if (e.key === "Tab") {
        e.preventDefault();
        const multi = ta.value.slice(ta.selectionStart, ta.selectionEnd).includes("\n");
        if (e.shiftKey) reindent(ta, (l) => l.replace(/^ {1,4}/, ""));
        else if (multi) reindent(ta, (l) => "    " + l);
        else insertText(ta, "    ");
        return;
      }
      if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const v = ta.value, pos = ta.selectionStart;
        const line = v.slice(v.lastIndexOf("\n", pos - 1) + 1, pos);
        let indent = line.match(/^ */)[0];
        const code = line.replace(/#.*$/, "").trimEnd();
        if (code.endsWith(":")) indent += "    ";
        else if (/^\s*(return|pass|break|continue|raise)\b/.test(code)) indent = indent.slice(4);
        insertText(ta, "\n" + indent);
        return;
      }
      if (e.key === "Backspace" && ta.selectionStart === ta.selectionEnd) {
        const v = ta.value, pos = ta.selectionStart;
        const before = v.slice(v.lastIndexOf("\n", pos - 1) + 1, pos);
        if (before.length && /^ +$/.test(before)) {
          e.preventDefault();
          const n = before.length % 4 || 4;
          ta.setSelectionRange(pos - n, pos);
          insertText(ta, "");
        }
      }
    });
    return {
      ta,
      get value() { return ta.value; },
      set(v) { ta.value = v; errLine = null; paint(); },
      markLine(n) { errLine = n; paint(); },
      focus() { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); },
    };
  }

  // ── router ───────────────────────────────────────────────────────────────
  let cleanup = [];
  function route() {
    cleanup.forEach((f) => f());
    cleanup = [];
    const [path, query] = location.hash.replace(/^#\/?/, "").split("?");
    const [lid, eid] = path.split("/").filter(Boolean);
    const lesson = LESSONS.find((l) => l.id === lid);
    if (!lesson) return renderHome();
    renderLesson(lesson, eid || "intro", query || "");
    window.scrollTo(0, 0);
  }

  function renderHome() {
    $("#crumb").textContent = "senior-level LeetCode patterns";
    const cards = PLAN.map(([id, title, desc]) => {
      const l = LESSONS.find((x) => x.id === id);
      if (!l) return `<div class="card soon"><span class="num">${id}</span><span><span class="t">${esc(title)}</span><br><span class="d">${esc(desc)}</span></span><span class="prog">coming</span></div>`;
      const total = l.exercises.length;
      const done = l.exercises.filter((e) => isDone(l, e)).length;
      return `<a class="card" href="#/${id}"><span class="num">${id}</span><span><span class="t">${esc(l.title)}</span><br><span class="d">${esc(desc)}</span></span><span class="prog">${done}/${total} done</span></a>`;
    }).join("");
    $("#app").innerHTML = `
      <section class="home">
        <h1>Senior-level LeetCode patterns</h1>
        <p class="lead">The patterns behind the harder mediums and hards, one skill at a time, until each one takes no thought. Each lesson: read one tool → type it with the answer beside you (<b>Copy</b>) → type it from memory, timed (<b>Recall</b>) → predict the traps → solve problems → redo from blank in 2–3 days → LeetCode, cold.</p>
        <p class="lead">Editor: Tab / Shift+Tab indent, Enter keeps indent, <b>⌘/Ctrl+Enter runs</b>. No autocomplete, so type your imports. <code>TreeNode</code> is given, as on LeetCode.</p>
        <div class="cards">${cards}</div>
      </section>`;
  }

  // The lesson's sections, in the order they're done. Empty ones are left out.
  function groupsOf(l) {
    const of = (k) => l.exercises.filter((e) => e.kind === k);
    return [
      ["Read", [{ id: "intro", title: "The tools" }]],
      ["Step through", of("walk")],
      ["Break it", of("breakit")],
      ["Reps", of("rep")],
      ["Predict", of("predict")],
      ["Problems", of("problem")],
      ["Finish", [{ id: "blank", title: "From blank" }, { id: "leetcode", title: "On LeetCode" }]],
    ].filter(([, items]) => items.length);
  }

  function sideNav(l, current) {
    return groupsOf(l).map(([name, items]) => `<h4>${name}</h4>` + items.map((e) => {
      const real = e.kind ? e : null;
      const tick = real && isDone(l, real) ? "✓" : "";
      const b = real && (real.kind === "rep" || real.kind === "problem") ? best(times(l, real, real.kind === "rep" ? "recall" : "solve")) : null;
      return `<a href="#/${l.id}/${e.id}" class="${e.id === current ? "on" : ""}"><span class="tick">${tick}</span>${esc(e.title)}${b != null ? `<span class="best">${fmt(b)}</span>` : ""}</a>`;
    }).join("")).join("");
  }

  function renderLesson(l, eid, query) {
    $("#crumb").textContent = `${l.id} · ${l.title}`;
    $("#app").innerHTML = `<div class="lesson"><nav class="side">${sideNav(l, eid)}</nav><section class="pane" id="pane"></section></div>`;
    const pane = $("#pane");
    const ex = l.exercises.find((e) => e.id === eid);
    const order = groupsOf(l).flatMap(([, items]) => items.map((e) => e.id));
    const nextId = order[order.indexOf(eid) + 1];
    const nextLink = nextId ? `<div class="next"><a class="btn" href="#/${l.id}/${nextId}">Next →</a></div>` : "";
    const refreshSide = () => { $(".side").innerHTML = sideNav(l, eid); };

    if (eid === "intro") {
      pane.innerHTML = `<div class="meta">Lesson ${l.id}</div><h1>${esc(l.title)}</h1><p class="sig">${esc(l.tagline)}</p>${l.intro}${nextLink}`;
    } else if (eid === "blank") {
      renderBlank(l, pane);
    } else if (eid === "leetcode") {
      renderLeetcode(l, pane, refreshSide);
    } else if (ex && ex.kind === "predict") {
      renderPredict(l, ex, pane, nextLink, refreshSide);
    } else if (ex && ex.kind === "walk") {
      renderWalk(l, ex, pane, nextLink, refreshSide);
    } else if (ex && ex.kind === "breakit") {
      renderBreak(l, ex, pane, nextLink, refreshSide);
    } else if (ex) {
      renderCode(l, ex, pane, nextLink, refreshSide, query);
    } else {
      location.hash = `#/${l.id}`;
    }
  }

  // ── reps and problems ────────────────────────────────────────────────────
  function renderCode(l, ex, pane, nextLink, refreshSide, query) {
    const isRep = ex.kind === "rep";
    let mode = isRep ? (query === "recall" ? "recall" : query === "copy" ? "copy" : store.get(key(l, ex, "mode"), "copy")) : "solve";
    const blank = isRep ? "" : ex.stub;

    pane.innerHTML = `
      <div class="meta">${isRep ? "Rep" : "Problem"}${ex.leetcode ? ` · LeetCode ${ex.leetcode}` : ""}</div>
      <h2>${esc(ex.title)}</h2>
      ${ex.sig ? `<div class="sig">${esc(ex.sig)}</div>` : ""}
      <p>${ex.prompt}</p>
      <div class="bar">
        ${isRep ? `<div class="tabs"><button data-mode="copy">Copy</button><button data-mode="recall">Recall</button></div>` : ""}
        <span class="timer" id="timer">0:00</span>
        <span class="times" id="times"></span>
      </div>
      <div class="work" id="work">
        <div class="ref" id="ref"><h4>Type this</h4><pre><code>${esc(ex.solution)}</code></pre></div>
        <div class="edwrap"><h4>Your code</h4><div id="ed"></div>
          <div class="bar"><button class="btn primary" id="run">Run tests</button><span class="kbd">⌘/Ctrl+Enter</span><button class="btn" id="reset">Reset</button></div>
        </div>
      </div>
      <div class="results" id="results"></div>
      ${isRep ? "" : `<details class="sol"><summary>Show a solution</summary><pre><code>${esc(ex.solution)}</code></pre>${ex.note ? `<div class="note">${ex.note}</div>` : ""}</details>`}
      ${nextLink}`;

    let t0 = null, timedOk = true, passed = false, tick = null;
    const timerEl = $("#timer");
    const stopTick = () => { if (tick) clearInterval(tick); tick = null; };
    cleanup.push(stopTick);

    const draftKey = () => key(l, ex, "draft", mode);
    const showTimes = () => {
      const parts = [];
      if (isRep) {
        const c = times(l, ex, "copy"), r = times(l, ex, "recall");
        if (c.length) parts.push(`Copy best ${fmt(best(c))}`);
        if (r.length) parts.push(`Recall best ${fmt(best(r))} · last ${fmt(r[r.length - 1].ms)} · ${r.length} timed`);
      } else {
        const s = times(l, ex, "solve");
        if (s.length) parts.push(`Best ${fmt(best(s))} · ${s.length} timed`);
      }
      $("#times").textContent = parts.join("  ·  ") || (isRep ? "Timer starts on your first keystroke." : "Timer starts on your first keystroke.");
    };

    const ed = makeEditor($("#ed"), {
      value: "",
      onInput(v) {
        store.set(draftKey(), v);
        if (!t0 && timedOk && !passed) {
          t0 = Date.now();
          tick = setInterval(() => { timerEl.textContent = fmt(Date.now() - t0); }, 250);
        }
      },
      onRun: run,
    });

    function load() {
      stopTick();
      const draft = store.get(draftKey(), null);
      const v = draft != null ? draft : blank;
      ed.set(v);
      t0 = null; passed = false;
      timedOk = v === blank;
      timerEl.textContent = timedOk ? "0:00" : "–";
      $("#results").innerHTML = timedOk ? "" : `<div class="banner info">Restored your saved draft, so this attempt isn't timed. Press <b>Reset</b> to time a fresh one.</div>`;
      if (isRep) {
        pane.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.mode === mode));
        $("#ref").style.display = mode === "copy" ? "" : "none";
        $("#work").classList.toggle("single", mode !== "copy");
      } else {
        $("#ref").style.display = "none";
        $("#work").classList.add("single");
      }
      showTimes();
    }

    pane.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => {
      mode = b.dataset.mode;
      store.set(key(l, ex, "mode"), mode);
      load();
      ed.focus();
    }));
    $("#reset").addEventListener("click", () => { store.del(draftKey()); load(); ed.focus(); });
    $("#run").addEventListener("click", run);

    async function run() {
      const btn = $("#run");
      if (btn.disabled) return;
      btn.disabled = true;
      btn.textContent = "Running…";
      const code = straight(ed.value);
      const res = await Py.call("_run_tests", [code, ex.fn, ex.cases, ex.mode || "exact", ex.adapt || ""]).catch((e) => ({ fatal: String(e.message || e) }));
      btn.disabled = false;
      btn.textContent = "Run tests";

      const src = stripComments(code);
      const technique = [];
      for (const r of ex.mustUse || []) if (!new RegExp(r.re).test(src)) technique.push(r.msg);
      for (const r of ex.mustNot || []) if (new RegExp(r.re).test(src)) technique.push(r.msg);

      const testsOk = !res.timeout && !res.fatal && !res.error && res.cases.length && res.cases.every((c) => c.ok);
      const allOk = testsOk && technique.length === 0;
      let head = "";

      if (allOk) {
        store.set(key(l, ex, "done"), Date.now());
        if (t0 && !passed) {
          const ms = Date.now() - t0;
          const arr = times(l, ex, mode);
          const prev = best(arr);
          arr.push({ ms, at: Date.now() });
          store.set(key(l, ex, "times", mode), arr.slice(-50));
          stopTick();
          timerEl.textContent = fmt(ms);
          head = `<div class="banner ok">All tests pass in <b>${fmt(ms)}</b>${prev != null ? (ms < prev ? ` · new best (was ${fmt(prev)})` : ` · best is ${fmt(prev)}`) : ""}.${isRep && mode === "copy" ? " Now try <b>Recall</b>." : ""}</div>`;
        } else if (!passed) {
          head = `<div class="banner ok">All tests pass.${timedOk ? "" : " (Not timed: started from a draft.)"}</div>`;
        } else {
          head = `<div class="banner ok">Still passing. Reset to time another attempt.</div>`;
        }
        passed = true;
        refreshSide();
        showTimes();
      } else if (res.timeout) {
        head = `<div class="banner bad">Stopped after ${RUN_LIMIT_MS / 1000}s: probably an infinite loop, or recursion with no base case that ends. Python is restarting.</div>`;
      } else if (res.fatal) {
        head = `<div class="banner bad">${esc(res.fatal)}</div>`;
      } else if (res.error) {
        head = `<div class="banner bad">${res.error.line ? `Line ${res.error.line}: ` : ""}${esc(res.error.msg)}</div>`;
        if (res.error.line) ed.markLine(res.error.line);
      } else if (testsOk) {
        head = `<div class="banner bad">Tests pass, but: ${technique.map(esc).join(" ")}</div>`;
      } else {
        const n = res.cases.filter((c) => !c.ok).length;
        head = `<div class="banner bad">${n} of ${res.cases.length} test${res.cases.length > 1 ? "s" : ""} failing.</div>`;
        const bad = res.cases.find((c) => !c.ok && c.line);
        if (bad) ed.markLine(bad.line);
      }

      const cases = (res.cases || []).map((c) => `
        <div class="case ${c.ok ? "ok" : "bad"}"><span class="mark">${c.ok ? "✓" : "✗"}</span>${esc(c.call)}
          <div class="row got">got&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>${esc(c.got)}</b>${c.line ? ` <span>(line ${c.line})</span>` : ""}</div>
          ${c.ok ? "" : `<div class="row">expected <b>${esc(c.expected)}</b></div>`}
        </div>`).join("");
      const printed = res.stdout ? `<h4 style="margin-top:12px">Printed</h4><pre>${esc(res.stdout)}</pre>` : "";
      const after = allOk && isRep
        ? `${ex.note ? `<div class="note">${ex.note}</div>` : ""}${mode === "recall" ? `<details class="sol"><summary>Compare with the reference</summary><pre><code>${esc(ex.solution)}</code></pre></details>` : ""}`
        : "";
      $("#results").innerHTML = head + (cases ? `<div>${cases}</div>` : "") + printed + after;
      if (ex.mode && ex.mode !== "exact" && !allOk && res.cases) {
        $("#results").insertAdjacentHTML("beforeend", `<p class="times">Order doesn't matter for this one: ${ex.mode === "groups" ? "groups and the items inside them are sorted" : "the list is sorted"} before comparing.</p>`);
      }
    }

    load();
    if (mode !== "copy" || !isRep) ed.focus();
  }

  // ── predict ──────────────────────────────────────────────────────────────
  function renderPredict(l, ex, pane, nextLink, refreshSide) {
    pane.innerHTML = `
      <div class="meta">Predict</div>
      <h2>${esc(ex.title)}</h2>
      <p>What does this print? Type the output exactly, one line per line. If it raises, write the error's name on its own line (for example <code>KeyError</code>).</p>
      <pre><code>${esc(ex.code)}</code></pre>
      <textarea class="answer" id="ans" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" placeholder="your prediction"></textarea>
      <div class="bar"><button class="btn primary" id="check">Check</button></div>
      <div class="results" id="results"></div>
      ${nextLink}`;
    const ans = $("#ans");
    ans.value = store.get(key(l, ex, "answer"), "");
    ans.addEventListener("input", () => store.set(key(l, ex, "answer"), ans.value));
    ans.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); check(); } });
    $("#check").addEventListener("click", check);
    ans.focus();

    async function check() {
      const btn = $("#check");
      btn.disabled = true;
      const r = await Py.call("_run_snippet", [ex.code]).catch((e) => ({ fatal: String(e.message || e) }));
      btn.disabled = false;
      if (r.fatal || r.timeout) { $("#results").innerHTML = `<div class="banner bad">${esc(r.fatal || "Timed out")}</div>`; return; }
      const actual = r.stdout.replace(/\n+$/, "").split("\n").filter((x, _i, a) => !(a.length === 1 && x === ""));
      if (r.error) actual.push(r.error);
      const norm = (s) => s.trim().replace(/\s+/g, " ");
      const mine = straight(ans.value).replace(/\n+$/, "").split("\n").map(norm).filter((x, _i, a) => !(a.length === 1 && x === ""));
      const ok = mine.length === actual.length && actual.every((line, i) => {
        if (r.error && i === actual.length - 1) return mine[i].includes(r.error.split(":")[0]);
        return norm(line) === mine[i];
      });
      if (ok) { store.set(key(l, ex, "done"), Date.now()); refreshSide(); }
      $("#results").innerHTML = `
        <div class="banner ${ok ? "ok" : "bad"}">${ok ? "Right." : "Not quite. Compare:"}</div>
        <div class="cmp"><div><h4>You said</h4><pre>${esc(ans.value || " ")}</pre></div><div><h4>Python says</h4><pre>${esc(actual.join("\n") || "(nothing)")}</pre></div></div>
        <div class="note">${ex.explain}</div>`;
    }
  }

  // ── step through: real Python, one line at a time, with questions ────────
  // ex.code marks question lines with "# ask: expr" (see _walk in harness.js).
  // You can't step past a question until you answer it or ask to be shown.
  function renderWalk(l, ex, pane, nextLink, refreshSide) {
    pane.innerHTML = `
      <div class="meta">Step through</div>
      <h2>${esc(ex.title)}</h2>
      <p>${ex.prompt}</p>
      <div class="walk">
        <div class="wleft">
          <div class="wcode" id="wcode"></div>
          <div id="wed" hidden></div>
          <div class="bar">
            <button class="btn" id="wedit">Edit the code</button>
            <button class="btn primary" id="wtrace" hidden>Trace it</button>
            <button class="btn" id="worig" hidden>Back to the original</button>
            <span class="times" id="wmode"></span>
          </div>
        </div>
        <div class="wright">
          <div class="wctl">
            <button class="btn" id="wfirst" title="Back to the start" aria-label="Back to the start">⏮</button>
            <button class="btn" id="wprev" title="Step back (←)" aria-label="Step back">◀</button>
            <button class="btn primary" id="wnext" title="Step forward (→)" aria-label="Step forward">Step ▶</button>
            <span class="wpos" id="wpos">Python loading…</span>
          </div>
          <input type="range" id="wslider" min="0" max="0" value="0" aria-label="Step">
          <div id="wask"></div>
          <h4>Variables</h4><div id="wframes" class="wframes"></div>
          <h4>Printed</h4><pre id="wout" class="wout"></pre>
        </div>
      </div>
      <div class="results" id="results"></div>
      ${nextLink}`;

    let code = ex.code, asking = true, steps = [], i = 0, err = null, truncated = false;
    let answers = {}, tries = {}, ed = null;
    const norm = (s) => straight(s).trim().replace(/\s+/g, "").replace(/"/g, "'");
    const gate = () => { for (let k = 0; k < steps.length; k++) if (steps[k].ask && !answers[k]) return k; return steps.length - 1; };
    const askCount = () => steps.filter((s) => s.ask).length;

    async function trace() {
      $("#wpos").textContent = "Tracing…";
      const r = await Py.call("_walk", [code, asking]).catch((e) => ({ fatal: String(e.message || e) }));
      if (r.fatal || r.timeout) {
        steps = []; i = 0;
        $("#results").innerHTML = `<div class="banner bad">${esc(r.fatal || "Stopped: it ran too long. Is there an infinite loop?")}</div>`;
        $("#wpos").textContent = "";
        return;
      }
      err = r.error; truncated = r.truncated;
      steps = r.steps;
      // A last step for "it finished", so the final print and final values show.
      steps.push({ event: "end", line: err ? err.line : null, frames: r.final ? [{ fn: "<module>", vars: r.final }] : [], out: r.out || "" });
      i = 0;
      $("#wslider").max = steps.length - 1;
      paint();
    }

    function paint() {
      const st = steps[i];
      if (!st) return;
      const g = gate();
      // code, with the current line lit
      const askLines = new Set(asking ? code.split("\n").map((t, k) => (/#\s*ask(?:\s+[\d,\s]+)?:/.test(t) ? k + 1 : 0)).filter(Boolean) : []);
      $("#wcode").innerHTML = code.split("\n").map((t, k) => {
        const n = k + 1;
        const cls = ["ln"];
        if (st.line === n) cls.push(st.event === "end" ? "errline" : st.event === "return" ? "retline" : "cur");
        return `<div class="${cls.join(" ")}"><span class="no">${askLines.has(n) ? "?" : n}</span><span class="src">${esc(t.replace(ASK_MARK, "")) || " "}</span></div>`;
      }).join("");
      const cur = $("#wcode .cur, #wcode .retline, #wcode .errline"), box0 = $("#wcode");
      if (cur) {
        const t = cur.offsetTop, b = t + cur.offsetHeight;
        if (t < box0.scrollTop) box0.scrollTop = t - 8;
        else if (b > box0.scrollTop + box0.clientHeight) box0.scrollTop = b - box0.clientHeight + 8;
      }

      // variables, one box per call, newest at the bottom
      const prev = steps[i - 1];
      $("#wframes").innerHTML = st.frames.map((f, d) => {
        // the top level is only noise while it has nothing in it
        if (f.fn === "<module>" && !Object.keys(f.vars).length && st.frames.length > 1) return "";
        const pf = prev && prev.frames[d] && prev.frames[d].fn === f.fn ? prev.frames[d].vars : null;
        const top = d === st.frames.length - 1;
        const name = f.fn === "<module>" ? "top level" : `${esc(f.fn)}()`;
        const rows = Object.entries(f.vars).map(([k, v]) => {
          const changed = pf && pf[k] !== v && st.event !== "end";
          return `<div class="var${changed ? " changed" : ""}"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`;
        }).join("") || `<div class="var empty">no variables yet</div>`;
        const ret = top && st.event === "return" ? `<div class="ret">↩ returns <b>${esc(st.ret)}</b></div>` : "";
        return `<div class="frame${top && st.event !== "end" ? " now" : ""}"><div class="fn">${name}</div>${rows}${ret}</div>`;
      }).join("") || `<div class="var empty">nothing yet</div>`;
      $("#wout").textContent = st.out || " ";

      // the question, if this step has one
      const a = st.ask, box = $("#wask");
      if (!a) box.innerHTML = "";
      else if (answers[i]) {
        box.innerHTML = `<div class="ask done ${answers[i].first ? "ok" : ""}">Before line ${st.line} ran, <code>${esc(a.expr)}</code> was <b>${esc(a.answer)}</b> ${answers[i].first ? "✓" : answers[i].shown ? "(shown)" : "✓ (second try)"}</div>`;
      } else {
        box.innerHTML = `
          <div class="ask">
            <div>Line ${st.line} is about to run. What is <code>${esc(a.expr)}</code> right now?</div>
            <div class="bar"><input class="answer one" id="wans" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" placeholder="type its value">
              <button class="btn primary" id="wcheck">Check</button><button class="btn" id="wshow">Show me</button></div>
            <div class="times" id="wmsg">${tries[i] ? "Not quite. Look at the variables above, then try again." : "Write it the way Python would print it."}</div>
          </div>`;
        const inp = $("#wans");
        const check = () => {
          if (!inp.value.trim()) return;
          if (norm(inp.value) === norm(a.answer)) { answers[i] = { first: !tries[i] }; paint(); $("#wnext").focus(); }
          else { tries[i] = (tries[i] || 0) + 1; $("#wmsg").textContent = `Not quite: ${inp.value.trim()} isn't it. Look at the variables, then try again.`; inp.select(); }
        };
        $("#wcheck").addEventListener("click", check);
        inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); check(); } });
        $("#wshow").addEventListener("click", () => { answers[i] = { first: false, shown: true }; paint(); $("#wnext").focus(); });
        if (document.activeElement !== inp) inp.focus({ preventScroll: true });
      }

      // controls
      $("#wprev").disabled = $("#wfirst").disabled = i === 0;
      $("#wnext").disabled = i >= g;
      $("#wslider").value = i;
      const n = askCount(), right = Object.values(answers).filter((x) => x.first).length;
      $("#wpos").textContent = `step ${i + 1} of ${steps.length}` + (asking && n ? ` · ${Object.keys(answers).length}/${n} answered` : "");

      // the end
      let res = "";
      if (st.event === "end") {
        if (err) res += `<div class="banner bad">${err.line ? `Line ${err.line}: ` : ""}${esc(err.msg)}</div>`;
        if (truncated) res += `<div class="banner info">Stopped after ${steps.length - 1} steps so the page stays quick.</div>`;
        if (asking) {
          store.set(key(l, ex, "done"), Date.now());
          refreshSide();
          res += `<div class="banner ok">Done.${n ? ` ${right} of ${n} right first time.` : ""}</div>${ex.note ? `<div class="note">${ex.note}</div>` : ""}`;
        }
      }
      $("#results").innerHTML = res;
    }

    const go = (n) => { if (!steps.length) return; i = Math.max(0, Math.min(n, gate())); paint(); };
    $("#wnext").addEventListener("click", () => go(i + 1));
    $("#wprev").addEventListener("click", () => go(i - 1));
    $("#wfirst").addEventListener("click", () => go(0));
    $("#wslider").addEventListener("input", (e) => go(+e.target.value));
    const onKey = (e) => {
      if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && document.activeElement.type !== "range") return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
    };
    document.addEventListener("keydown", onKey);
    cleanup.push(() => document.removeEventListener("keydown", onKey));

    // edit mode: change the code and trace your own version, no questions
    const show = (id, on) => { $(id).hidden = !on; };
    $("#wedit").addEventListener("click", () => {
      show("#wcode", false); show("#wed", true); show("#wedit", false); show("#wtrace", true); show("#worig", true);
      if (!ed) ed = makeEditor($("#wed"), { value: "", onInput() {}, onRun: () => $("#wtrace").click() });
      ed.set(code.split("\n").map((t) => t.replace(ASK_MARK, "")).join("\n"));
      ed.focus();
      $("#wmode").textContent = "Change anything, then trace it.";
    });
    $("#wtrace").addEventListener("click", () => {
      code = straight(ed.value); asking = false; answers = {}; tries = {};
      show("#wcode", true); show("#wed", false); show("#wedit", true); show("#wtrace", false);
      $("#wmode").textContent = "Your version: no questions.";
      trace();
    });
    $("#worig").addEventListener("click", () => {
      code = ex.code; asking = true; answers = {}; tries = {};
      show("#wcode", true); show("#wed", false); show("#wedit", true); show("#wtrace", false); show("#worig", false);
      $("#wmode").textContent = "";
      trace();
    });

    trace();
  }

  // ── break it: find an input where a plausible wrong answer fails ─────────
  function renderBreak(l, ex, pane, nextLink, refreshSide) {
    pane.innerHTML = `
      <div class="meta">Break it</div>
      <h2>${esc(ex.title)}</h2>
      <p>${ex.prompt}</p>
      <pre><code>${esc(ex.code)}</code></pre>
      ${ex.rules ? `<p class="times">Rules for your input: ${ex.rules}</p>` : ""}
      <div class="bar breakbar"><code>${esc(ex.fn)}(</code><input class="answer one" id="bin" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" placeholder="${esc(ex.args)}"><code>)</code>
        <button class="btn primary" id="btry">Try it</button></div>
      <div class="results" id="results"></div>
      <div id="bhist" class="bhist"></div>
      <details class="sol"><summary>Show an input that breaks it</summary><pre><code>${esc(ex.fn)}(${esc(ex.example)})</code></pre><div class="note">${ex.explain}</div></details>
      ${nextLink}`;
    const inp = $("#bin"), hist = [];
    inp.value = store.get(key(l, ex, "input"), "");
    inp.addEventListener("input", () => store.set(key(l, ex, "input"), inp.value));
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); attempt(); } });
    $("#btry").addEventListener("click", attempt);
    inp.focus();

    async function attempt() {
      const src = straight(inp.value).trim();
      if (!src) return;
      const btn = $("#btry");
      btn.disabled = true;
      const r = await Py.call("_breakit", [ex.code, ex.right, ex.fn, ex.ref, ex.valid, src]).catch((e) => ({ fatal: String(e.message || e) }));
      btn.disabled = false;
      let head;
      if (r.timeout) head = `<div class="banner bad">That took too long. Keep the input small.</div>`;
      else if (r.fatal) head = `<div class="banner bad">${esc(r.fatal)}</div>`;
      else if (r.bad) head = `<div class="banner bad">${esc(r.bad)}</div>`;
      else {
        hist.unshift(`<div class="case ${r.broke ? "ok" : "bad"}"><span class="mark">${r.broke ? "✓" : "·"}</span>${esc(r.call)}<div class="row">it says <b>${esc(r.got)}</b>, the right answer is <b>${esc(r.right)}</b></div></div>`);
        $("#bhist").innerHTML = `<h4>Your tries</h4>` + hist.join("");
        if (r.broke) {
          store.set(key(l, ex, "done"), Date.now());
          refreshSide();
          head = `<div class="banner ok">Broken. It says ${esc(r.got)}, but the right answer is ${esc(r.right)}.</div><div class="note">${ex.explain}</div>`;
        } else {
          head = `<div class="banner info">It survives that one: both say ${esc(r.right)}. Think about what the shortcut ignores, and aim at that.</div>`;
        }
      }
      $("#results").innerHTML = head;
    }
  }

  // ── from blank / leetcode ────────────────────────────────────────────────
  function renderBlank(l, pane) {
    const rows = l.fromBlank.map((id) => {
      const e = l.exercises.find((x) => x.id === id);
      const m = e.kind === "rep" ? "recall" : "solve";
      const arr = times(l, e, m);
      const last = arr.length ? arr[arr.length - 1].at : null;
      return `<tr><td><a href="#/${l.id}/${e.id}?recall">${esc(e.title)}</a></td><td>${e.kind}</td><td>${fmt(best(arr))}</td><td>${ago(last)}</td><td>${arr.length}</td></tr>`;
    }).join("");
    pane.innerHTML = `
      <div class="meta">Finish</div>
      <h2>From blank</h2>
      <p>The mastery check: each of these from an empty editor (Recall mode for reps, Reset first for problems), with no peeking, until it passes. Do it <b>today</b>, then again <b>2–3 days from now</b>. If the second time is slower or you had to look, do it once more the next day.</p>
      <table><thead><tr><th>Exercise</th><th>Kind</th><th>Best</th><th>Last timed</th><th>Times</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="next"><a class="btn" href="#/${l.id}/leetcode">Next →</a></div>`;
  }

  function renderLeetcode(l, pane, refreshSide) {
    const items = l.leetcode.map((p) => {
      const k = `${l.id}.lc.${p.n}`;
      const on = store.get(k, false);
      return `<tr><td><input type="checkbox" data-k="${k}" ${on ? "checked" : ""} aria-label="solved ${esc(p.title)}"></td><td>${p.n}</td><td><a href="https://leetcode.com/problems/${p.slug}/" target="_blank" rel="noopener">${esc(p.title)}</a></td></tr>`;
    }).join("");
    pane.innerHTML = `
      <div class="meta">Finish</div>
      <h2>On LeetCode, cold</h2>
      <p>Solve these on leetcode.com in Python, from scratch, without coming back here. Tick each one you solve without help. If one stumps you, add it to <code>QA.md</code> with the skill that was missing.</p>
      <table><thead><tr><th>Solved</th><th>#</th><th>Problem</th></tr></thead><tbody>${items}</tbody></table>
      ${(() => { const i = PLAN.findIndex((p) => p[0] === l.id); const n = PLAN[i + 1]; return n ? `<div class="next">Next lesson: <b>${n[0]} · ${esc(n[1])}</b>${LESSONS.find((x) => x.id === n[0]) ? ` <a class="btn" href="#/${n[0]}">Go →</a>` : " (not built yet)"}</div>` : ""; })()}`;
    pane.querySelectorAll("input[type=checkbox]").forEach((cb) => cb.addEventListener("change", () => { store.set(cb.dataset.k, cb.checked); refreshSide(); }));
  }

  // ── boot ─────────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("hashchange", route);
    Py.start(); // before route(): a walk asks Python for its trace as soon as it renders
    route();
  });
})();
