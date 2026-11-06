// Diagrams drawn as inline SVG from placeholders in lesson HTML. Every kind is a
// <span> with a class and data-* attributes holding Python-style literals, so a
// lesson file can write them inline in prompts, notes and the Read section:
//
//   <span class="tree" data-tree="[8, 4, 12, None, 6]"></span>
//       LeetCode level-order list. data-path="8,12" (blue nodes, and edges between
//       them), data-bad="3" (red), data-cur="4" (filled). x = inorder position, so a
//       BST reads sorted from left to right. String labels can start with a marker:
//       "*" blue, "!" red, "~" faded (for decision trees, where labels repeat).
//   <span class="tree" data-ntree="['[]', [['[1]', [['[1, 2]']]], ['[2]']]]"></span>
//       any number of children: each node is [label, [children]]. Same options.
//   <span class="arr" data-arr="[2, 7, 1]"></span>
//       cells with their indices. data-win="1,3" (a window, inclusive), data-ptr="0:l,4:r"
//       (labels under cells), data-hl="2,3" (blue cells), data-bad="1" (red cells),
//       data-below="[0, 2, 9, 10]" (a row on the boundaries between cells, like a
//       prefix list; data-belowcap names it), data-noidx="1" hides the indices.
//   <span class="bars" data-bars="[0, 1, 0, 2]"></span>
//       a histogram. data-water="1" fills trapped water, data-rect="l,r,h" outlines a
//       rectangle (columns l..r inclusive, height h), data-ptr and data-hl as for arr.
//   <span class="ivals" data-ivals="[[1, 3], [2, 6]]"></span>
//       one interval per row on a shared axis. data-out="[[1, 6]]" adds a result group,
//       data-outcap names it, data-bad / data-hl pick input rows by index, data-count="1"
//       draws how many are open at each point (half-open [s, e)).
//   <span class="grid" data-grid="[[0, 0], [0, 1]]"></span>
//       a table. data-rowh / data-colh are header lists, data-hl="1,1;2,2" blue cells,
//       data-cur="2,2" a filled cell, data-bad red cells.
//
// Every kind takes data-cap, a caption under it. Wrap several in <span class="trees">
// to put them side by side.
(() => {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // A Python literal of numbers / None / True / False / strings / lists → JS value, or null.
  const pyVal = (s) => {
    try {
      return JSON.parse(String(s).trim().replace(/\bNone\b/g, "null").replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false")
        .replace(/'/g, '"').replace(/,\s*\]/g, "]"));
    } catch { return null; }
  };
  const pyList = (s) => { const v = pyVal(s); return Array.isArray(v) ? v : null; };
  const set = (s) => new Set(String(s || "").split(/[,;]/).map((t) => t.trim()).filter(Boolean));
  const cells = (s) => new Set(String(s || "").split(";").map((t) => t.replace(/\s/g, "")).filter(Boolean));
  const ptrs = (s) => { const m = {}; String(s || "").split(",").forEach((t) => { const [i, lab] = t.split(":"); if (lab != null) (m[i.trim()] = m[i.trim()] || []).push(lab.trim()); }); return m; };
  const svg = (w, h, body, label) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">${body}</svg>`;
  const fmt = (v) => (v === null ? "None" : v === true ? "True" : v === false ? "False" : typeof v === "string" ? v : JSON.stringify(v).replace(/,/g, ", "));

  // ── tree ──────────────────────────────────────────────────────────────────
  function tree(vals, o = {}) {
    if (!vals.length || vals[0] == null) return `<em>(empty tree)</em>`;
    const mk = (v, d) => {
      let mark = "";
      if (typeof v === "string" && /^[*!~]/.test(v)) { mark = v[0]; v = v.slice(1); }
      return { v, d, mark };
    };
    const nodes = [mk(vals[0], 0)];
    const q = [nodes[0]];
    for (let i = 1; q.length && i < vals.length; ) {
      const p = q.shift();
      for (const side of ["l", "r"]) {
        if (i < vals.length && vals[i] != null) { const c = mk(vals[i], p.d + 1); p[side] = c; nodes.push(c); q.push(c); }
        i++;
      }
    }
    let x = 0;
    const place = (n) => { if (!n) return; place(n.l); n.x = x++; place(n.r); };
    place(nodes[0]);
    nodes.forEach((n) => (n.kids = [n.l, n.r].filter(Boolean)));
    return drawNodes(nodes, x, o, "tree " + JSON.stringify(vals));
  }

  // n-ary: [label, [child, child, ...]], a child being [label, [...]] or just [label].
  // Leaves are spaced evenly and each parent sits over the middle of its children.
  function ntree(root, o = {}) {
    const nodes = [];
    let x = 0;
    const build = (t, d) => {
      let v = Array.isArray(t) ? t[0] : t, mark = "";
      if (typeof v === "string" && /^[*!~]/.test(v)) { mark = v[0]; v = v.slice(1); }
      const n = { v, d, mark, kids: [] };
      nodes.push(n);
      const ch = Array.isArray(t) && Array.isArray(t[1]) ? t[1] : [];
      n.kids = ch.map((c) => build(c, d + 1));
      n.x = n.kids.length ? (n.kids[0].x + n.kids[n.kids.length - 1].x) / 2 : x++;
      return n;
    };
    build(root, 0);
    return drawNodes(nodes, x, o, "tree");
  }

  function drawNodes(nodes, x, o, aria) {
    const path = set(o.path), bad = set(o.bad), cur = set(o.cur);
    const label = (n) => fmt(n.v);
    const longest = Math.max(...nodes.map((n) => label(n).length));
    const R = 15, PAD = 4, DY = 52, wide = longest > 3;
    const RX = wide ? longest * 3.9 + 8 : R, DX = 2 * RX + 6;
    const depth = Math.max(...nodes.map((n) => n.d));
    const W = (x - 1) * DX + 2 * (RX + PAD), H = depth * DY + 2 * (R + PAD);
    const cx = (n) => n.x * DX + RX + PAD, cy = (n) => n.d * DY + R + PAD;
    const key = (n) => String(n.v);
    const cls = (n) => (n.mark === "!" || bad.has(key(n)) ? "bad" : cur.has(key(n)) ? "cur" : n.mark === "*" || path.has(key(n)) ? "on" : n.mark === "~" ? "faded" : "");
    const lit = (n) => ["on", "cur"].includes(cls(n));
    let edges = "", body = "";
    for (const n of nodes) for (const c of n.kids) {
      edges += `<line x1="${cx(n)}" y1="${cy(n)}" x2="${cx(c)}" y2="${cy(c)}" class="${lit(n) && lit(c) ? "on" : c.mark === "~" ? "faded" : ""}"/>`;
    }
    for (const n of nodes) {
      const shape = wide ? `<rect x="${cx(n) - RX}" y="${cy(n) - R}" width="${2 * RX}" height="${2 * R}" rx="${R}"/>` : `<circle cx="${cx(n)}" cy="${cy(n)}" r="${R}"/>`;
      body += `<g class="${cls(n)}">${shape}<text x="${cx(n)}" y="${cy(n)}">${esc(label(n))}</text></g>`;
    }
    return svg(W, H, edges + body, aria);
  }

  // ── array ─────────────────────────────────────────────────────────────────
  function arr(vals, o = {}) {
    const n = vals.length, hl = set(o.hl), bad = set(o.bad), p = ptrs(o.ptr);
    const below = o.below ? pyList(o.below) : null;
    const labels = vals.map(fmt), widest = Math.max(1, ...labels.map((s) => s.length), ...(below || []).map((v) => fmt(v).length));
    const CW = Math.max(34, widest * 8 + 14), CH = 34, L = below && o.belowcap ? 8 + o.belowcap.length * 7 : 6;
    const idx = !o.noidx, top = idx ? 18 : 4;
    const win = o.win ? o.win.split(",").map(Number) : null;
    const pRows = Math.max(0, ...Object.values(p).map((a) => a.length));
    let y = top + CH;
    let body = "";
    if (win) body += `<rect class="win" x="${L + win[0] * CW - 3}" y="${top - 3}" width="${(win[1] - win[0] + 1) * CW + 6}" height="${CH + 6}" rx="6"/>`;
    vals.forEach((_, i) => {
      const c = bad.has(String(i)) ? "bad" : hl.has(String(i)) ? "on" : win && i >= win[0] && i <= win[1] ? "inwin" : "";
      body += `<g class="cell ${c}"><rect x="${L + i * CW}" y="${top}" width="${CW}" height="${CH}"/><text x="${L + i * CW + CW / 2}" y="${top + CH / 2}">${esc(labels[i])}</text></g>`;
      if (idx) body += `<text class="idx" x="${L + i * CW + CW / 2}" y="${top - 9}">${i}</text>`;
    });
    if (pRows) {
      for (const [i, labs] of Object.entries(p)) {
        const x = L + Number(i) * CW + CW / 2;
        body += `<text class="ptr" x="${x}" y="${y + 12}">↑</text>`;
        labs.forEach((lab, k) => { body += `<text class="ptr" x="${x}" y="${y + 28 + k * 15}">${esc(lab)}</text>`; });
      }
      y += 22 + pRows * 15;
    }
    if (below) {
      y += 10;
      if (o.belowcap) body += `<text class="idx" x="${L - 6}" y="${y + CH / 2}" style="text-anchor:end">${esc(o.belowcap)}</text>`;
      below.forEach((v, i) => {
        const x = L + i * CW - CW / 2 + 2;
        body += `<g class="cell below"><rect x="${x}" y="${y}" width="${CW - 4}" height="${CH}" rx="6"/><text x="${x + (CW - 4) / 2}" y="${y + CH / 2}">${esc(fmt(v))}</text></g>`;
        body += `<line class="tick" x1="${L + i * CW}" y1="${top + CH}" x2="${L + i * CW}" y2="${y}"/>`;
      });
      y += CH;
    }
    const W = L + n * CW + (below && below.length > n ? CW / 2 : 0) + 6;
    return svg(W, y + 4, body, "list " + JSON.stringify(vals));
  }

  // ── bars ──────────────────────────────────────────────────────────────────
  function bars(h, o = {}) {
    const n = h.length, U = 18, CW = 30, top = 8, max = Math.max(1, ...h), hl = set(o.hl), p = ptrs(o.ptr);
    const base = top + max * U;
    let body = "";
    if (o.water) {
      const lm = [], rm = [];
      for (let i = 0, m = 0; i < n; i++) lm[i] = m = Math.max(m, h[i]);
      for (let i = n - 1, m = 0; i >= 0; i--) rm[i] = m = Math.max(m, h[i]);
      h.forEach((v, i) => { const w = Math.min(lm[i], rm[i]) - v; if (w > 0) body += `<rect class="water" x="${i * CW + 1}" y="${base - (v + w) * U}" width="${CW - 2}" height="${w * U}"/>`; });
    }
    h.forEach((v, i) => {
      body += `<rect class="bar ${hl.has(String(i)) ? "on" : ""}" x="${i * CW + 3}" y="${base - v * U}" width="${CW - 6}" height="${v * U}"/>`;
      body += `<text class="val" x="${i * CW + CW / 2}" y="${base + 13}">${v}</text>`;
    });
    if (o.rect) {
      const [l, r, rh] = o.rect.split(",").map(Number);
      body += `<rect class="hirect" x="${l * CW + 1}" y="${base - rh * U}" width="${(r - l + 1) * CW - 2}" height="${rh * U}"/>`;
    }
    body += `<line class="base" x1="0" y1="${base}" x2="${n * CW}" y2="${base}"/>`;
    let y = base + 18;
    const pRows = Math.max(0, ...Object.values(p).map((a) => a.length));
    for (const [i, labs] of Object.entries(p)) labs.forEach((lab, k) => { body += `<text class="ptr" x="${Number(i) * CW + CW / 2}" y="${y + 12 + k * 15}">${esc(lab)}</text>`; });
    y += pRows * 15 + 4;
    return svg(n * CW, y, body, "heights " + JSON.stringify(h));
  }

  // ── intervals ─────────────────────────────────────────────────────────────
  function ivals(list, o = {}) {
    const out = o.out ? pyList(o.out) || [] : null;
    const all = list.concat(out || []);
    const lo = Math.min(...all.map((p) => p[0])), hi = Math.max(...all.map((p) => p[1]));
    const span = Math.max(1, hi - lo), U = Math.max(16, Math.min(44, 420 / span)), L = 10, RH = 22;
    const X = (v) => L + (v - lo) * U;
    const hl = set(o.hl), bad = set(o.bad);
    let y = 6, body = "", right = 0;
    const row = (p, c) => {
      const w = Math.max(X(p[1]) - X(p[0]), 4);
      const lab = `[${p[0]}, ${p[1]}]`, fits = lab.length * 6.8 + 8 <= w;
      // a label that doesn't fit inside its bar goes just to the right of it
      body += `<g class="iv ${c}"><rect x="${X(p[0])}" y="${y}" width="${w}" height="${RH - 6}" rx="4"/><text x="${fits ? X(p[0]) + w / 2 : X(p[0]) + w + 4}" y="${y + (RH - 6) / 2}"${fits ? "" : ` style="text-anchor:start"`}>${esc(lab)}</text></g>`;
      right = Math.max(right, fits ? 0 : X(p[0]) + w + 4 + lab.length * 6.8);
      y += RH;
    };
    list.forEach((p, i) => row(p, bad.has(String(i)) ? "bad" : hl.has(String(i)) ? "on" : ""));
    if (out) {
      y += 4;
      if (o.outcap) { body += `<text class="idx" x="${L}" y="${y + 6}" style="text-anchor:start">${esc(o.outcap)}</text>`; y += 14; }
      out.forEach((p) => row(p, "out"));
    }
    if (o.count) {
      y += 6;
      const ev = [];
      for (let v = lo; v < hi; v++) ev.push(list.filter((p) => p[0] <= v && v < p[1]).length);
      const top = Math.max(1, ...ev), CH = 12;
      ev.forEach((c, k) => {
        if (c) body += `<rect class="count" x="${X(lo + k) + 1}" y="${y + (top - c) * CH}" width="${U - 2}" height="${c * CH}"/>`;
        if (U >= 22) body += `<text class="cnt" x="${X(lo + k) + U / 2}" y="${y + top * CH + 9}">${c}</text>`;
      });
      y += top * CH + 16;
    }
    // axis
    y += 4;
    body += `<line class="base" x1="${X(lo)}" y1="${y}" x2="${X(hi)}" y2="${y}"/>`;
    const step = U >= 22 ? 1 : U >= 11 ? 2 : 5;
    for (let v = lo; v <= hi; v++) if ((v - lo) % step === 0 || v === hi) {
      body += `<line class="tick" x1="${X(v)}" y1="${y - 3}" x2="${X(v)}" y2="${y + 3}"/><text class="idx" x="${X(v)}" y="${y + 13}">${v}</text>`;
    }
    return svg(Math.max(X(hi) + 12, right + 4), y + 20, body, "intervals " + JSON.stringify(list));
  }

  // ── grid ──────────────────────────────────────────────────────────────────
  function grid(g, o = {}) {
    const rh = o.rowh ? pyList(o.rowh) : null, ch = o.colh ? pyList(o.colh) : null;
    const hl = cells(o.hl), bad = cells(o.bad), cur = cells(o.cur);
    const widest = Math.max(1, ...g.flat().map((v) => fmt(v).length), ...(ch || []).map((v) => fmt(v).length));
    const CW = Math.max(30, widest * 8 + 12), CH = 28;
    const L = rh ? Math.max(24, Math.max(...rh.map((v) => fmt(v).length)) * 8 + 12) : 0, T = ch ? 22 : 0;
    let body = "";
    if (ch) ch.forEach((v, c) => { body += `<text class="hdr" x="${L + c * CW + CW / 2}" y="${T / 2 + 2}">${esc(fmt(v))}</text>`; });
    if (rh) rh.forEach((v, r) => { body += `<text class="hdr" x="${L / 2}" y="${T + r * CH + CH / 2}">${esc(fmt(v))}</text>`; });
    g.forEach((rowv, r) => rowv.forEach((v, c) => {
      const k = r + "," + c;
      const cls = cur.has(k) ? "cur" : bad.has(k) ? "bad" : hl.has(k) ? "on" : "";
      body += `<g class="cell ${cls}"><rect x="${L + c * CW}" y="${T + r * CH}" width="${CW}" height="${CH}"/><text x="${L + c * CW + CW / 2}" y="${T + r * CH + CH / 2}">${esc(v == null ? "" : fmt(v))}</text></g>`;
    }));
    const cols = Math.max(...g.map((r) => r.length));
    return svg(L + cols * CW + 2, T + g.length * CH + 2, body, "table");
  }

  const KINDS = { ntree: ["ntree", ntree], tree: ["tree", tree], arr: ["arr", arr], bars: ["bars", bars], ivals: ["ivals", ivals], grid: ["grid", grid] };

  function draw(root) {
    root.querySelectorAll(".tree, .arr, .bars, .ivals, .grid").forEach((el) => {
      if (el.dataset.drawn) return;
      const kind = Object.keys(KINDS).find((k) => el.dataset[KINDS[k][0]] != null && el.classList.contains(k === "ntree" ? "tree" : k));
      if (!kind) return;
      el.dataset.drawn = "1";
      const v = pyVal(el.dataset[KINDS[kind][0]]);
      if (!Array.isArray(v) && kind !== "ntree") return;
      try {
        el.innerHTML = KINDS[kind][1](v, el.dataset) + (el.dataset.cap ? `<span class="tree-cap">${el.dataset.cap}</span>` : "");
      } catch (e) {
        el.textContent = "(diagram failed: " + e.message + ")";
      }
    });
  }

  // Build a placeholder from JS. opts keys become data-* attributes.
  const span = (kind, data, opts = {}) => `<span class="${kind === "ntree" ? "tree" : kind}" data-${KINDS[kind][0]}="${esc(JSON.stringify(data))}"${Object.entries(opts).filter(([, v]) => v !== "" && v != null).map(([k, v]) => ` data-${k}="${esc(v)}"`).join("")}></span>`;

  window.Diagrams = { draw, span, pyList, tree, ntree, arr, bars, ivals, grid };
  new MutationObserver(() => draw(document)).observe(document.documentElement, { childList: true, subtree: true });
})();
