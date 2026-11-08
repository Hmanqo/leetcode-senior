/* Trees & Graphs, step by step.
 *
 * Every animation on the lesson page and in the lab comes from this file.
 * An algorithm runs once, up front, inside a "recorder" that takes a snapshot
 * (a frame) at every interesting moment. The player then just shows frames,
 * forwards or backwards. Nothing here needs a network or a build step.
 *
 * Markup: <div data-viz="bfs"></div>   (ids are the keys of REG at the bottom)
 */
(function () {
  'use strict';

  // ───────────────────────────── tiny DOM helpers
  const SVGNS = 'http://www.w3.org/2000/svg';
  function S(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function H(tag, cls, parent, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  let UID = 0;

  // ───────────────────────────── scenes
  // A scene is the fixed picture: where the nodes sit and which edges exist.
  // Coordinates are grid units; the renderer multiplies by dx / dy.
  function mkScene(nodes, edges, o = {}) {
    const sc = { kind: 'graph', nodes, edges, directed: !!o.directed, dx: o.dx || 64, dy: o.dy || 70, padX: o.padX || 0, emap: {} };
    edges.forEach((e) => {
      e.key = e.a + '>' + e.b;
      sc.emap[e.a + '>' + e.b] = e.key;
      if (!sc.directed) sc.emap[e.b + '>' + e.a] = e.key;
    });
    sc.cols = Math.max(0, ...nodes.map((n) => n.x));
    sc.rows = Math.max(0, ...nodes.map((n) => n.y));
    sc.ekey = (a, b) => sc.emap[a + '>' + b];
    return sc;
  }
  function gridScene(rows, cols, o = {}) {
    return { kind: 'grid', rows, cols, cell: o.cell || 42 };
  }

  // LeetCode-style level-order list -> linked nodes
  function buildTree(list) {
    if (!list.length || list[0] == null) return null;
    let c = 0;
    const mk = (v) => ({ id: 't' + c++, label: String(v), val: v, left: null, right: null });
    const root = mk(list[0]);
    const q = [root];
    let i = 1;
    while (q.length && i < list.length) {
      const n = q.shift();
      if (i < list.length) { if (list[i] != null) { n.left = mk(list[i]); q.push(n.left); } i++; }
      if (i < list.length) { if (list[i] != null) { n.right = mk(list[i]); q.push(n.right); } i++; }
    }
    return root;
  }
  // x = in-order position, y = depth: a tidy picture that never overlaps
  function treeScene(root, o = {}) {
    const nodes = [], edges = [];
    let k = 0;
    (function w(n, d) {
      if (!n) return;
      w(n.left, d + 1);
      nodes.push({ id: n.id, label: n.label, x: k++, y: d });
      w(n.right, d + 1);
    })(root, 0);
    (function e(n) {
      if (!n) return;
      for (const [c, lab] of [[n.left, n.leftLabel], [n.right, n.rightLabel]]) {
        if (c) { edges.push({ a: n.id, b: c.id, label: lab }); e(c); }
      }
    })(root);
    return mkScene(nodes, edges, { dx: o.dx || 48, dy: o.dy || 66, directed: !!o.directed, padX: o.padX });
  }
  function subtreeIds(n, acc = []) {
    if (n) { acc.push(n.id); subtreeIds(n.left, acc); subtreeIds(n.right, acc); }
    return acc;
  }
  function adjacency(sc) {
    const adj = {};
    sc.nodes.forEach((n) => (adj[n.id] = []));
    sc.edges.forEach((e) => {
      adj[e.a].push(e.b);
      if (!sc.directed) adj[e.b].push(e.a);
    });
    for (const k in adj) adj[k].sort();
    return adj;
  }

  // ───────────────────────────── the recorder
  class Rec {
    constructor(scene) {
      this.scene = scene;
      this.frames = [];
      this.ns = {}; // node id -> state
      this.es = {}; // edge key -> state
      this.bd = {}; // node id -> badge text
      this.lists = []; // [name, value, isScalar]
      this.cells = null; // grid: [[{t, s}]]
      this.dyn = null; // a scene that changes from frame to frame
    }
    L(name, items) {
      let l = this.lists.find((x) => x[0] === name);
      if (!l) { l = [name, [], false]; this.lists.push(l); }
      if (items !== undefined) l[1] = items;
      return l[1];
    }
    V(name, v) {
      let l = this.lists.find((x) => x[0] === name);
      if (!l) { l = [name, v, true]; this.lists.push(l); }
      l[1] = v;
    }
    e(a, b, s) {
      const k = (this.dyn || this.scene).ekey(a, b);
      if (k) this.es[k] = s;
    }
    snap(say, line = -1) {
      this.frames.push({
        ns: { ...this.ns }, es: { ...this.es }, bd: { ...this.bd },
        lists: this.lists.map(([n, v, sc]) => [n, Array.isArray(v) ? v.slice() : v, sc]),
        cells: this.cells && this.cells.map((r) => r.map((c) => ({ ...c }))),
        scene: this.dyn, say, line,
      });
    }
  }
  const fmt = (v) => (v === -Infinity ? '−∞' : v === Infinity ? '∞' : String(v));

  // ═════════════════════════════ TREES

  function genTraverse(order) {
    const root = buildTree([1, 2, 3, 4, 5, null, 6]);
    const sc = treeScene(root);
    const r = new Rec(sc);
    const stack = r.L('call stack (waiting for you)', []);
    const out = r.L('written down', []);
    const name = { pre: 'Pre-order', in: 'In-order', post: 'Post-order' }[order];
    const steps = { pre: ['v', 'l', 'r'], in: ['l', 'v', 'r'], post: ['l', 'r', 'v'] }[order];
    const text = { v: 'write down this node', l: 'walk the whole left subtree', r: 'walk the whole right subtree' };
    const recipe = steps.map((s) => text[s]).concat(['go back up to whoever sent you']);
    const line = (s) => steps.indexOf(s);
    r.snap(`${name}: every node does the same three jobs, in the order on the right. The <b>call stack</b> lists the nodes that are paused, waiting for you to come back.`);
    function go(n, p, viaLine) {
      stack.push(n.label);
      r.ns[n.id] = 'path';
      if (p) r.e(p.id, n.id, 'active');
      r.snap(p ? `${p.label} sends you down to <b>${n.label}</b>. ${p.label} is now paused on the stack.` : `Start at the root, <b>${n.label}</b>.`, viaLine);
      for (const s of steps) {
        if (s === 'v') {
          r.ns[n.id] = 'active';
          out.push(n.label);
          r.snap(`Write down <b>${n.label}</b>.`, line('v'));
          r.ns[n.id] = 'path';
        } else {
          const c = s === 'l' ? n.left : n.right;
          if (c) go(c, n, line(s));
          else r.snap(`${n.label} has no ${s === 'l' ? 'left' : 'right'} child, so that walk is over at once.`, line(s));
        }
      }
      stack.pop();
      r.ns[n.id] = 'done';
      if (p) r.e(p.id, n.id, 'tree');
      r.snap(p ? `${n.label} is finished. Climb back to <b>${p.label}</b>, which resumes exactly where it paused.`
        : `The root is finished, so the walk is done. ${name}: <b>${out.join(' ')}</b>.`, 3);
    }
    go(root, null, -1);
    return { scene: sc, frames: r.frames, recipe };
  }

  function genLevel() {
    const root = buildTree([1, 2, 3, 4, 5, null, 6, null, null, 7]);
    const sc = treeScene(root);
    const r = new Rec(sc);
    const q = [root];
    const show = () => r.L('queue (front → back)', q.map((n) => n.label));
    const out = r.L('levels', []);
    r.ns[root.id] = 'frontier';
    show();
    r.snap('Breadth-first: finish a whole floor before going down a floor. A <b>queue</b> does this: what goes in first comes out first.', 0);
    let level = 0;
    while (q.length) {
      const size = q.length;
      r.V('this level', `${size} node${size > 1 ? 's' : ''}`);
      r.snap(`Floor ${level}: the queue holds exactly ${size} node${size > 1 ? 's' : ''}, and that is the whole floor. Take exactly that many.`, 1);
      const row = [];
      for (let i = 0; i < size; i++) {
        const n = q.shift();
        r.ns[n.id] = 'active';
        row.push(n.label);
        const kids = [n.left, n.right].filter(Boolean);
        kids.forEach((c) => { q.push(c); r.ns[c.id] = 'frontier'; r.e(n.id, c.id, 'tree'); });
        show();
        r.snap(`Take <b>${n.label}</b> from the front. ${kids.length ? `Its children ${kids.map((c) => c.label).join(' and ')} join the <i>back</i> of the queue, behind the rest of this floor.` : 'It has no children to add.'}`, 2);
        r.ns[n.id] = 'done';
      }
      out.push(`[${row.join(' ')}]`);
      r.snap(`Floor ${level} done: [${row.join(' ')}].`, 3);
      level++;
    }
    r.snap(`The queue is empty. Every node was seen floor by floor: ${out.join(' ')}.`, -1);
    return { scene: sc, frames: r.frames, recipe: ['put the root in the queue', 'count what is in the queue: that is one floor', 'take that many from the front; add their children at the back', 'one floor finished; repeat until the queue is empty'] };
  }

  function genDepth() {
    const root = buildTree([1, 2, 3, 4, 5, null, 6, null, null, 7]);
    const sc = treeScene(root);
    const r = new Rec(sc);
    const st = r.L('call stack', []);
    r.snap('Question for every node: <b>how many floors are there from you down?</b> No node can answer until its children have.', -1);
    function go(n, p) {
      if (!n) return 0;
      st.push(n.label);
      r.ns[n.id] = 'path';
      if (p) r.e(p.id, n.id, 'active');
      r.snap(`${p ? p.label + ' asks ' + n.label : 'The root ' + n.label + ' is asked'}. ${n.label} can't answer yet: it passes the question to its own children first.`, 0);
      const a = go(n.left, n), b = go(n.right, n);
      const h = 1 + Math.max(a, b);
      r.bd[n.id] = '↑ ' + h;
      r.ns[n.id] = 'done';
      st.pop();
      if (p) r.e(p.id, n.id, 'tree');
      const leaf = !n.left && !n.right;
      r.snap(leaf ? `${n.label} is a leaf. Both of its children are empty, and an empty tree has 0 floors. It reports <b>1 + max(0, 0) = 1</b>.`
        : `${n.label} heard ${a} from the left and ${b} from the right. It reports <b>1 + max(${a}, ${b}) = ${h}</b>${p ? ' up to ' + p.label : ''}.`, leaf ? [1, 2] : 2);
      return h;
    }
    const ans = go(root, null);
    r.snap(`The root's report is the answer: <b>${ans}</b> floors. Each node was asked once and answered once, so this is O(n).`);
    return { scene: sc, frames: r.frames, recipe: ['ask the left child, then the right child', 'an empty child answers 0', 'report 1 + the bigger answer'] };
  }

  function genBST(target) {
    const root = buildTree([8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13]);
    const sc = treeScene(root);
    const r = new Rec(sc);
    const total = sc.nodes.length;
    r.V('looking for', target);
    r.snap(`A BST keeps one promise at every node: <b>smaller things live on the left, bigger on the right</b>. Looking for ${target}.`);
    let n = root, p = null, k = 0;
    while (n) {
      k++;
      r.ns[n.id] = 'active';
      if (p) r.e(p.id, n.id, 'active');
      r.V('comparisons', k);
      if (target === n.val) {
        r.ns[n.id] = 'done';
        r.snap(`${target} = ${n.val}. Found it after <b>${k}</b> comparisons, in a tree of ${total} nodes.`, 0);
        return { scene: sc, frames: r.frames, recipe: RB };
      }
      const left = target < n.val;
      const gone = subtreeIds(left ? n.right : n.left);
      gone.forEach((id) => (r.ns[id] = 'dim'));
      r.snap(`${target} ${left ? '<' : '>'} ${n.val}, so ${target} can only be on the <b>${left ? 'left' : 'right'}</b>. ${gone.length ? `The ${left ? 'right' : 'left'} side (${gone.length} node${gone.length > 1 ? 's' : ''}) fades out without being looked at.` : `The ${left ? 'right' : 'left'} side is empty anyway.`}`, left ? 1 : 2);
      r.ns[n.id] = 'path';
      p = n;
      n = left ? n.left : n.right;
    }
    r.snap(`You stepped off the tree: the place where ${target} would have to be is empty, so ${target} isn't here. That empty place is exactly where <i>insert</i> would put it.`, 3);
    return { scene: sc, frames: r.frames, recipe: RB };
  }
  const RB = ['same value? found it', 'smaller? go left', 'bigger? go right', 'hit an empty spot? it is not here'];

  function genValidate(list) {
    const root = buildTree(list);
    const sc = treeScene(root, { dx: 62, padX: 40 });
    const r = new Rec(sc);
    r.snap('Each node gets a <b>window</b>: the range its value must fall in. The root may be anything. Going left lowers the ceiling to the parent; going right raises the floor to it.', -1);
    let ok = true;
    function go(n, lo, hi, loN, hiN, p) {
      if (!n || !ok) return;
      r.bd[n.id] = `${fmt(lo)} … ${fmt(hi)}`;
      r.ns[n.id] = 'active';
      if (p) r.e(p.id, n.id, 'active');
      if (!(lo < n.val && n.val < hi)) {
        ok = false;
        r.ns[n.id] = 'bad';
        const who = n.val >= hi ? hiN : loN;
        const pOk = p && (p.left === n ? n.val < p.val : n.val > p.val);
        r.snap(`${n.val} must be between ${fmt(lo)} and ${fmt(hi)}, and it isn't. ${pOk ? `Its parent ${p.label} is happy with it, but ${who.label} further up is not: ${n.val} sits on ${who.label}'s ${n.val >= hi ? 'left, where everything must be smaller than ' + who.label : 'right, where everything must be bigger than ' + who.label}.` : ''} <b>Not a valid BST.</b>`, 0);
        return;
      }
      r.snap(`${n.val} fits in its window. Its left child inherits <b>${fmt(lo)} … ${n.val}</b>; its right child inherits <b>${n.val} … ${fmt(hi)}</b>.`, [0, 1]);
      r.ns[n.id] = 'path';
      go(n.left, lo, n.val, loN, n, n);
      go(n.right, n.val, hi, n, hiN, n);
      if (!ok) return;
      r.ns[n.id] = 'done';
      if (p) r.e(p.id, n.id, 'tree');
    }
    go(root, -Infinity, Infinity, null, null, null);
    if (ok) r.snap('Every node sat inside its window, so <b>this is a valid BST</b>.', 2);
    return { scene: sc, frames: r.frames, recipe: ['is my value strictly inside my window?', 'pass my value down as the left ceiling and the right floor', 'everyone passed: valid'] };
  }

  function deepest(n) {
    if (!n) return [];
    const a = deepest(n.left), b = deepest(n.right);
    return [n, ...(a.length >= b.length ? a : b)];
  }
  function genDiameter() {
    const root = buildTree([1, 2, 3, 4, 5, null, null, 6, null, null, 7, 8, null, null, 9]);
    const sc = treeScene(root);
    const r = new Rec(sc);
    let best = 0, bestN = null;
    r.V('best path so far', '0 edges');
    r.snap('The longest path between any two nodes. Every path has one highest point, where it <b>bends</b>. So ask every node: "what is the longest path that bends at you?"', -1);
    function go(n, p) {
      if (!n) return 0;
      r.ns[n.id] = 'path';
      if (p) r.e(p.id, n.id, 'active');
      const L = go(n.left, n), R = go(n.right, n);
      r.ns[n.id] = 'active';
      const up = 1 + Math.max(L, R);
      const rec = L + R > best;
      if (rec) { best = L + R; bestN = n; }
      r.V('best path so far', `${best} edges${bestN ? ', bending at ' + bestN.label : ''}`);
      r.bd[n.id] = `${L}+${R}`;
      r.snap(`At ${n.label}: the longest arm going down-left is ${L}, down-right ${R}. A path bending here uses <b>both</b>: ${L} + ${R} = ${L + R}${rec ? ', a new record' : ''}. But ${n.label} can hand only <b>one</b> arm to its parent (a path can't fork): it reports 1 + max(${L}, ${R}) = ${up}.`, [1, 2]);
      r.bd[n.id] = `${L}+${R} ↑${up}`;
      r.ns[n.id] = 'done';
      if (p) r.e(p.id, n.id, 'tree');
      return up;
    }
    go(root, null);
    const path = [...deepest(bestN.left).reverse(), bestN, ...deepest(bestN.right)];
    path.forEach((n) => (r.ns[n.id] = 'path'));
    for (let i = 1; i < path.length; i++) r.e(path[i - 1].id, path[i].id, 'path');
    r.snap(`Answer: <b>${best} edges</b>, bending at ${bestN.label}, not at the root. That is why we record the best at every node instead of just reading the root's report.`);
    return { scene: sc, frames: r.frames, recipe: ['ask both children for their longest arm', 'record left arm + right arm: the path that bends here', 'hand up 1 + the longer arm, only one'] };
  }

  function genLCA() {
    const root = buildTree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
    const sc = treeScene(root);
    const r = new Rec(sc);
    const P = 6, Q = 4;
    r.V('looking for', `${P} and ${Q}`);
    r.snap(`Lowest common ancestor of ${P} and ${Q}: the deepest node that has both of them below it (a node counts as below itself). Every node will report up one of: <i>nothing</i>, <i>one of them</i>, or <i>the answer</i>.`);
    let ans = null;
    function go(n, p) {
      if (!n) return null;
      r.ns[n.id] = 'path';
      if (p) r.e(p.id, n.id, 'active');
      if (n.val === P || n.val === Q) {
        r.ns[n.id] = 'active';
        r.bd[n.id] = 'me!';
        r.snap(`${n.val} is one of the two. It reports itself and doesn't look underneath: if the other one is down there, ${n.val} is the answer anyway.`, 0);
        r.ns[n.id] = 'done';
        if (p) r.e(p.id, n.id, 'tree');
        return n;
      }
      const a = go(n.left, n), b = go(n.right, n);
      r.ns[n.id] = 'active';
      let res;
      if (a && b) {
        res = n; ans = n;
        r.bd[n.id] = 'both!';
        r.snap(`Reports arrive from <b>both</b> sides: ${a.label} from the left, ${b.label} from the right. The two searches meet here, so <b>${n.label}</b> is the lowest common ancestor. It reports itself upward.`, 2);
      } else {
        res = a || b;
        r.bd[n.id] = res ? '↑' + res.label : '∅';
        r.snap(res ? `Only one side found something (${res.label}). ${n.label} passes that report up unchanged.` : `Nothing below ${n.label}. It reports <i>nothing</i>.`, res ? 3 : 1);
      }
      r.ns[n.id] = ans === n ? 'path' : 'done';
      if (p) r.e(p.id, n.id, 'tree');
      return res;
    }
    go(root, null);
    r.ns[ans.id] = 'active';
    r.snap(`The root's report is the answer: <b>${ans.label}</b>. Each node was visited once: O(n).`);
    return { scene: sc, frames: r.frames, recipe: ['am I one of the two? report myself', 'nothing on either side? report nothing', 'something on both sides? I am the answer', 'something on one side? pass it up'] };
  }

  function genRobber() {
    const root = buildTree([3, 4, 5, 1, 3, null, 1]);
    const sc = treeScene(root, { dx: 92, padX: 62 });
    const r = new Rec(sc);
    r.snap('Houses on a tree; robbing two houses joined by an edge sets off the alarm. Each house reports <b>two</b> numbers: the best total if it is robbed, and the best if it is skipped.', -1);
    let last;
    function go(n, p) {
      if (!n) return [0, 0];
      r.ns[n.id] = 'path';
      if (p) r.e(p.id, n.id, 'active');
      const [lr, ls] = go(n.left, n), [rr, rs] = go(n.right, n);
      const rob = n.val + ls + rs, skip = Math.max(lr, ls) + Math.max(rr, rs);
      r.ns[n.id] = 'active';
      r.bd[n.id] = `rob ${rob} · skip ${skip}`;
      r.snap(`House ${n.val}. <b>Rob it</b>: ${n.val} + its children's <i>skip</i> numbers (${ls} + ${rs}) = ${rob}. <b>Skip it</b>: each child is free to give its better number (${Math.max(lr, ls)} + ${Math.max(rr, rs)}) = ${skip}.`, [1, 2]);
      r.ns[n.id] = 'done';
      if (p) r.e(p.id, n.id, 'tree');
      last = [rob, skip];
      return last;
    }
    go(root, null);
    r.snap(`The root reports rob ${last[0]}, skip ${last[1]}. The answer is the larger: <b>${Math.max(...last)}</b>. One post-order pass, O(n): the two numbers <i>are</i> the DP table, one row per node.`, 3);
    return { scene: sc, frames: r.frames, recipe: ['get (rob, skip) from both children', 'rob me = my value + both children skipped', 'skip me = each child\'s better number', 'answer = the root\'s better number'] };
  }

  // ═════════════════════════════ GRAPHS

  function g1() {
    const P = { A: [0, 1], B: [1, 0], C: [1, 2], D: [2, 0], E: [2, 1], F: [2, 2], G: [3, 0], H: [3, 2] };
    const nodes = Object.keys(P).map((k) => ({ id: k, label: k, x: P[k][0], y: P[k][1] }));
    const E = ['AB', 'AC', 'BD', 'BE', 'CF', 'EF', 'DG', 'GH', 'FH'];
    return mkScene(nodes, E.map((s) => ({ a: s[0], b: s[1] })), { dx: 110, dy: 78 });
  }

  function genBFS() {
    const sc = g1(), adj = adjacency(sc), r = new Rec(sc);
    const dist = { A: 0 }, par = {}, q = ['A'];
    const show = () => { r.L('queue (front → back)', q.slice()); r.L('seen', Object.keys(dist)); };
    r.ns.A = 'frontier'; r.bd.A = 'd 0';
    show();
    r.snap('Breadth-first search from A. Think of a stone dropped in a pond: the ripple reaches everything 1 step away, then everything 2 steps away, and so on. A node gets a chalk mark (<i>seen</i>) the moment it joins the queue.', 0);
    while (q.length) {
      const u = q.shift();
      r.ns[u] = 'active';
      show();
      const fresh = [], old = [];
      for (const v of adj[u]) {
        if (v in dist) { old.push(v); continue; }
        dist[v] = dist[u] + 1; par[v] = u; q.push(v);
        fresh.push(v); r.ns[v] = 'frontier'; r.bd[v] = 'd ' + dist[v]; r.e(u, v, 'tree');
      }
      show();
      r.snap(`Take <b>${u}</b> from the front (distance ${dist[u]}). ${fresh.length ? `New neighbours ${fresh.join(', ')} get distance ${dist[u] + 1}, a chalk mark, and a place at the back of the queue.` : 'No new neighbours.'} ${old.length ? `${old.join(', ')} ${old.length > 1 ? 'are' : 'is'} already chalked: skip.` : ''}`, [1, 2]);
      r.ns[u] = 'done';
    }
    const path = ['H'];
    while (par[path[0]]) path.unshift(par[path[0]]);
    path.forEach((v) => (r.ns[v] = 'path'));
    for (let i = 1; i < path.length; i++) r.e(path[i - 1], path[i], 'path');
    r.snap(`Done. Each node's distance is the fewest edges from A, because the ripple reached it in that round. To get the route to H, follow the green "who found me" edges back: <b>${path.join(' → ')}</b>.`, 3);
    return { scene: sc, frames: r.frames, recipe: ['put the start in the queue and chalk it', 'take the node at the front', 'for each unchalked neighbour: chalk it, record its distance, add it to the back', 'queue empty: every distance is the shortest number of hops'] };
  }

  function genDFS() {
    const sc = g1(), adj = adjacency(sc), r = new Rec(sc);
    const seen = new Set(), stack = r.L('call stack (your trail of string)', []), order = r.L('visit order', []);
    r.snap('Depth-first search from A. One explorer in a maze with chalk and a ball of string: keep going down unmarked corridors; at a dead end, wind the string back to the last junction with an unexplored corridor.');
    function go(u, p) {
      seen.add(u); stack.push(u); order.push(u);
      r.ns[u] = 'path';
      if (p) r.e(p, u, 'tree');
      r.snap(p ? `From ${p}, the corridor to <b>${u}</b> is unmarked. Go in and chalk it.` : `Start at <b>${u}</b> and chalk it.`, [0, 1]);
      for (const v of adj[u]) if (!seen.has(v)) go(v, u);
      stack.pop();
      r.ns[u] = 'done';
      r.snap(`Every corridor out of ${u} leads somewhere already chalked. ${p ? `Wind the string back to <b>${p}</b>.` : 'Back at the start with nothing left: done.'}`, 2);
    }
    go('A', null);
    r.snap(`Visit order: <b>${order.join(' ')}</b>. Notice the green edges: one long snake, very different from BFS's ripples. DFS does not find shortest paths; it is for <i>reaching</i> things, and for questions about structure (cycles, order, components).`);
    return { scene: sc, frames: r.frames, recipe: ['chalk this node', 'for each corridor: if the far end has no chalk, go there now', 'all corridors used up: walk back the way you came'] };
  }

  function dressing() {
    const P = { socks: [0, 0], underwear: [1.5, 0], shirt: [3.4, 0], pants: [1.5, 1], tie: [4, 1], shoes: [0.4, 2], belt: [2.6, 2], jacket: [3.4, 3] };
    const nodes = Object.keys(P).map((k) => ({ id: k, label: k, x: P[k][0], y: P[k][1] }));
    const E = [['socks', 'shoes'], ['underwear', 'pants'], ['underwear', 'shoes'], ['pants', 'shoes'], ['pants', 'belt'], ['shirt', 'belt'], ['shirt', 'tie'], ['tie', 'jacket'], ['belt', 'jacket']];
    return mkScene(nodes, E.map(([a, b]) => ({ a, b })), { directed: true, dx: 112, dy: 76 });
  }
  function genKahn() {
    const sc = dressing(), adj = adjacency(sc), r = new Rec(sc);
    const indeg = {};
    sc.nodes.forEach((n) => (indeg[n.id] = 0));
    sc.edges.forEach((e) => indeg[e.b]++);
    sc.nodes.forEach((n) => (r.bd[n.id] = 'needs ' + indeg[n.id]));
    const q = sc.nodes.map((n) => n.id).filter((id) => indeg[id] === 0);
    const out = r.L('dressed so far', []);
    const show = () => r.L('ready (queue)', q.slice());
    q.forEach((id) => (r.ns[id] = 'frontier'));
    show();
    r.snap('Getting dressed. An arrow means "must come before". The badge counts how many things each item still waits for. Items waiting for nothing are <b>ready</b>: socks, underwear and shirt.', 0);
    while (q.length) {
      const u = q.shift();
      r.ns[u] = 'active';
      out.push(u);
      const freed = [];
      for (const v of adj[u]) {
        indeg[v]--;
        r.bd[v] = 'needs ' + indeg[v];
        r.e(u, v, 'dim');
        if (indeg[v] === 0) { q.push(v); r.ns[v] = 'frontier'; freed.push(v); }
      }
      show();
      r.snap(`Put on <b>${u}</b>. ${adj[u].length ? `Cross out its arrows: ${adj[u].join(', ')} ${adj[u].length > 1 ? 'each wait' : 'waits'} for one thing fewer.` : 'Nothing was waiting on it.'} ${freed.length ? `<b>${freed.join(', ')}</b> now wait${freed.length > 1 ? '' : 's'} for nothing: ready.` : ''}`, [1, 2]);
      r.ns[u] = 'done';
      r.bd[u] = '✓';
    }
    r.snap(`All ${out.length} items, in an order that breaks no arrow: <b>${out.join(' → ')}</b>. If items were left over with a count above 0, they would be waiting on each other in a circle: a <b>cycle</b>, and no valid order exists.`, 3);
    return { scene: sc, frames: r.frames, recipe: ['count, for every item, how many arrows point into it', 'take any item whose count is 0', 'cross out its arrows; anything that drops to 0 becomes ready', 'placed every item? valid order. Leftovers? there is a cycle'] };
  }

  function genColors() {
    const P = { A: [0, 1], B: [1, 0], C: [2.2, 0], D: [1, 2], E: [2.4, 2], F: [1.7, 3] };
    const nodes = Object.keys(P).map((k) => ({ id: k, label: k, x: P[k][0], y: P[k][1] }));
    const E = ['AB', 'BC', 'AD', 'DC', 'DE', 'EF', 'FD'];
    const sc = mkScene(nodes, E.map((s) => ({ a: s[0], b: s[1] })), { directed: true, dx: 110, dy: 64 });
    const adj = adjacency(sc), r = new Rec(sc);
    const color = {};
    sc.nodes.forEach((n) => (color[n.id] = 'white'));
    const trail = r.L('on the current trail (grey)', []);
    r.snap('Cycle detection in a <b>directed</b> graph with three colours. <b>White</b>: never visited. <b>Grey</b> (purple here): on the trail you are walking right now. <b>Black</b> (green): finished, every road out of it explored.');
    let found = false;
    function go(u) {
      color[u] = 'grey'; r.ns[u] = 'path'; trail.push(u);
      r.snap(`Enter <b>${u}</b>: it turns grey, because it is on the trail now.`, 0);
      for (const v of adj[u]) {
        if (found) return;
        if (color[v] === 'grey') {
          found = true;
          r.e(u, v, 'bad');
          const cyc = trail.slice(trail.indexOf(v));
          cyc.forEach((x) => (r.ns[x] = 'bad'));
          for (let i = 1; i < cyc.length; i++) r.e(cyc[i - 1], cyc[i], 'bad');
          r.snap(`${u} → ${v}, and ${v} is <b>grey</b>: it's on the trail you are still walking. You've walked in a circle: <b>${cyc.join(' → ')} → ${v}</b>. Cycle found.`, 2);
          return;
        }
        if (color[v] === 'black') {
          r.e(u, v, 'active');
          r.snap(`${u} → ${v}, but ${v} is <b>black</b>: fully explored earlier, on a different trail. That's a second road into the same place, not a loop. Ignore it.`, 3);
          r.e(u, v, '');
          continue;
        }
        r.e(u, v, 'tree');
        go(v);
      }
      if (found) return;
      color[u] = 'black'; r.ns[u] = 'done'; trail.pop();
      r.snap(`Every road out of ${u} is explored with no circle. ${u} turns <b>black</b> and leaves the trail.`, 1);
    }
    for (const n of sc.nodes) if (color[n.id] === 'white' && !found) go(n.id);
    r.snap('Why do we need three colours and not just "visited"? Because C was visited from B, and later D reached C again. A two-colour check would have shouted "cycle" there. Only an edge back to a <b>grey</b> node closes a loop.');
    return { scene: sc, frames: r.frames, recipe: ['entering a node: paint it grey', 'leaving a node: paint it black', 'edge to a grey node? cycle', 'edge to a black node? harmless, skip it'] };
  }

  function genDijkstra() {
    const P = { A: [0, 1], B: [1.2, 0], C: [1.2, 2], D: [2.4, 1], E: [3.6, 2], F: [4.6, 1] };
    const nodes = Object.keys(P).map((k) => ({ id: k, label: k, x: P[k][0], y: P[k][1] }));
    const W = [['A', 'B', 4], ['A', 'C', 1], ['C', 'B', 2], ['B', 'D', 1], ['C', 'D', 5], ['D', 'E', 3], ['C', 'E', 8], ['E', 'F', 1], ['D', 'F', 6]];
    const sc = mkScene(nodes, W.map(([a, b, w]) => ({ a, b, w })), { dx: 100, dy: 80 });
    const r = new Rec(sc);
    const adj = {};
    nodes.forEach((n) => (adj[n.id] = []));
    W.forEach(([a, b, w]) => { adj[a].push([b, w]); adj[b].push([a, w]); });
    for (const k in adj) adj[k].sort();
    const dist = {}, par = {}, done = new Set();
    nodes.forEach((n) => { dist[n.id] = Infinity; r.bd[n.id] = '∞'; });
    dist.A = 0; r.bd.A = '0';
    let pq = [[0, 'A']];
    const show = () => {
      pq.sort((x, y) => x[0] - y[0] || (x[1] < y[1] ? -1 : 1));
      r.L('priority queue (cheapest first)', pq.map(([d, v]) => ({ t: `${v} ${d}`, s: d > dist[v] ? 'stale' : '' })));
      r.L('settled (final)', [...done]);
    };
    show();
    r.snap('Shortest routes from A when roads have lengths. Badges are the best distance known so far; ∞ means "no route found yet". The priority queue always hands back the <b>closest</b> unsettled place.', 0);
    while (pq.length) {
      show();
      const [d, u] = pq.shift();
      if (done.has(u)) {
        r.snap(`Next ticket: ${u} at ${d}. But ${u} was already settled at ${dist[u]}, so this is an old, worse ticket. Throw it away.`, 1);
        continue;
      }
      done.add(u);
      r.ns[u] = 'active';
      if (par[u]) r.e(par[u], u, 'tree');
      const notes = [];
      for (const [v, w] of adj[u]) {
        if (done.has(v)) continue;
        r.e(u, v, 'active');
        const nd = d + w;
        if (nd < dist[v]) {
          notes.push(`${v}: ${d} + ${w} = <b>${nd}</b> beats ${fmt(dist[v])}`);
          dist[v] = nd; par[v] = u; r.bd[v] = String(nd); pq.push([nd, v]);
          r.ns[v] = 'frontier';
        } else notes.push(`${v}: ${d} + ${w} = ${nd}, no better than ${dist[v]}`);
      }
      show();
      r.snap(`Settle <b>${u} at ${d}</b>. That's final: any other route to ${u} would have to pass through somewhere at least as far away first. Now try the roads out of ${u}. ${notes.length ? notes.join('; ') + '.' : 'Every neighbour is already settled.'}`, [1, 2]);
      sc.edges.forEach((e) => { if (r.es[e.key] === 'active') r.es[e.key] = ''; });
      r.ns[u] = 'done';
    }
    const path = ['F'];
    while (par[path[0]]) path.unshift(par[path[0]]);
    sc.edges.forEach((e) => (r.es[e.key] = par[e.b] === e.a || par[e.a] === e.b ? 'tree' : ''));
    path.forEach((v) => (r.ns[v] = 'path'));
    for (let i = 1; i < path.length; i++) r.e(path[i - 1], path[i], 'path');
    show();
    r.snap(`Every place is settled. The green edges are the shortest-route tree. The best route to F is <b>${path.join(' → ')}</b>, length ${dist.F} over five roads, beating the "obvious" A → C → E → F (10).`, 3);
    return { scene: sc, frames: r.frames, recipe: ['start: distance 0 at the source, ∞ everywhere else', 'pop the cheapest ticket; skip it if that place is already settled', 'settle it; for each road out, if this route is shorter, update and push a ticket', 'queue empty: every distance is final'] };
  }

  function forest(parent) {
    const ids = Object.keys(parent).sort();
    const kids = {};
    ids.forEach((i) => (kids[i] = []));
    ids.forEach((i) => { if (parent[i] !== i) kids[parent[i]].push(i); });
    const nodes = [], edges = [];
    let x = 0;
    function place(id, d) {
      const ch = kids[id];
      if (!ch.length) { nodes.push({ id, label: id, x: x++, y: d }); return x - 1; }
      const xs = ch.map((c) => place(c, d + 1));
      const mx = (xs[0] + xs[xs.length - 1]) / 2;
      nodes.push({ id, label: id, x: mx, y: d });
      ch.forEach((c) => edges.push({ a: c, b: id }));
      return mx;
    }
    ids.filter((i) => parent[i] === i).forEach((root) => { place(root, 0); x += 0.4; });
    const sc = mkScene(nodes, edges, { directed: true, dx: 58, dy: 62 });
    sc.rows = Math.max(sc.rows, 3);
    sc.cols = Math.max(sc.cols, 9.5);
    return sc;
  }
  function genUF() {
    const parent = {}, size = {};
    'ABCDEFGH'.split('').forEach((c) => { parent[c] = c; size[c] = 1; });
    const r = new Rec(null);
    const re = () => { r.dyn = forest(parent); r.es = {}; };
    const clubs = () => {
      const g = {};
      Object.keys(parent).forEach((c) => { let x = c; while (parent[x] !== x) x = parent[x]; (g[x] = g[x] || []).push(c); });
      r.L('clubs (president: members)', Object.keys(g).sort().map((k) => `${k}: ${g[k].join('')}`));
    };
    re(); clubs();
    r.snap('Union-Find. Eight people, each in a club of one, each their own <b>president</b>. Every arrow means "my boss is…". To learn your club, follow bosses up until someone is their own boss.', -1);
    function find(x, why) {
      const path = [x];
      while (parent[path[path.length - 1]] !== path[path.length - 1]) path.push(parent[path[path.length - 1]]);
      const root = path[path.length - 1];
      r.ns = {};
      path.forEach((p) => (r.ns[p] = 'path'));
      r.ns[root] = 'active';
      for (let i = 1; i < path.length; i++) r.e(path[i - 1], path[i], 'active');
      r.snap(`find(${x})${why ? ' ' + why : ''}: ${path.length > 1 ? `follow the bosses ${path.join(' → ')}.` : `${x} is its own boss.`} President: <b>${root}</b>.`, 0);
      const moved = path.slice(0, -2);
      if (moved.length) {
        moved.forEach((p) => (parent[p] = root));
        re(); clubs();
        r.ns = {}; moved.forEach((p) => (r.ns[p] = 'frontier')); r.ns[root] = 'active';
        r.snap(`<b>Path compression</b>: on the way back, ${moved.join(' and ')} ${moved.length > 1 ? 'remember' : 'remembers'} the president directly. Next time, one hop.`, 1);
      }
      return root;
    }
    function union(a, b) {
      r.V('doing', `union(${a}, ${b})`);
      const ra = find(a, `(${a}'s club)`), rb = find(b, `(${b}'s club)`);
      if (ra === rb) { r.snap(`Same president: already one club. Nothing to do.`, 2); return; }
      const [big, small] = size[ra] >= size[rb] ? [ra, rb] : [rb, ra];
      parent[small] = big; size[big] += size[small];
      re(); clubs();
      r.ns = { [big]: 'active', [small]: 'frontier' };
      r.e(small, big, 'tree');
      r.snap(`Merge the clubs: president ${small} (club of ${size[small]}) now reports to ${big} (club of ${size[big] - size[small]}). <b>Union by size</b>: the smaller club joins the bigger, so the chains stay short.`, [2, 3]);
      r.ns = {};
    }
    [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['B', 'D'], ['F', 'H'], ['D', 'H']].forEach(([a, b]) => union(a, b));
    r.V('doing', 'find(H)');
    find('H', 'once more');
    r.ns = {};
    r.snap('With both tricks, each operation is so close to O(1) it makes no difference (α(n), at most 4 or 5 for any input you will ever meet).');
    return { scene: r.frames[0].scene, frames: r.frames, recipe: ['find: follow bosses up to the president', 'compress: everyone on that path points straight at the president', 'union: find both presidents; same one? done', 'otherwise the smaller club\'s president reports to the bigger one\'s'] };
  }

  // ═════════════════════════════ GRIDS

  function genIslands() {
    const G = ['110001', '100111', '001000', '101101', '100001'].map((s) => s.split('').map(Number));
    const R = G.length, C = G[0].length;
    const sc = gridScene(R, C);
    const r = new Rec(sc);
    r.cells = G.map((row) => row.map((v) => ({ t: '', s: v ? 'land' : 'water' })));
    let count = 0;
    r.V('islands', 0);
    r.snap('A grid is a graph in disguise: each cell is a node, and its up/down/left/right cells are its neighbours. Scan cell by cell; on unpainted land, start a <b>flood fill</b>, like the paint-bucket tool.', 0);
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
      if (r.cells[i][j].s !== 'land') continue;
      count++;
      r.V('islands', count);
      r.cells[i][j].s = 'active';
      r.snap(`The scan reaches unpainted land at row ${i + 1}, column ${j + 1}: a <b>new island</b>, number ${count}. Pour paint here.`, 1);
      let size = 0;
      (function fill(a, b) {
        size++;
        r.cells[a][b] = { t: String(count), s: 'active' };
        r.snap(`Paint (${a + 1}, ${b + 1}) with ${count}, then spread to its land neighbours.`, 2);
        r.cells[a][b].s = 'done';
        for (const [da, db] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const x = a + da, y = b + db;
          if (x >= 0 && y >= 0 && x < R && y < C && r.cells[x][y].s === 'land') fill(x, y);
        }
      })(i, j);
      r.snap(`Island ${count} is fully painted (${size} cell${size > 1 ? 's' : ''}). Painting <i>is</i> the visited mark, so the scan will never count these cells again. Keep scanning.`, 3);
    }
    r.snap(`Scan complete: <b>${count} islands</b>. Every cell was looked at a fixed number of times, so O(rows × cols).`);
    return { scene: sc, frames: r.frames, recipe: ['scan every cell, row by row', 'unpainted land? new island: count it', 'flood fill: paint it, spread to land neighbours', 'island done, keep scanning'] };
  }

  function genOranges() {
    const G = ['21101', '11011', '01110', '00012'].map((s) => s.split('').map(Number));
    const R = G.length, C = G[0].length;
    const sc = gridScene(R, C);
    const r = new Rec(sc);
    r.cells = G.map((row) => row.map((v) => ({ t: v === 2 ? '0' : '', s: v === 2 ? 'bad' : v === 1 ? 'land' : 'wall' })));
    let q = [];
    let fresh = 0;
    G.forEach((row, i) => row.forEach((v, j) => { if (v === 2) q.push([i, j]); if (v === 1) fresh++; }));
    r.V('minute', 0); r.V('fresh left', fresh);
    r.snap('Rotten oranges (red) spoil their fresh neighbours (yellow) every minute. There are <b>two</b> rotten ones at the start, so put <b>both</b> in the queue at once: two stones dropped in the pond together. That is multi-source BFS.', 0);
    let minute = 0;
    while (q.length && fresh) {
      minute++;
      const next = [];
      for (const [a, b] of q) for (const [da, db] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const x = a + da, y = b + db;
        if (x >= 0 && y >= 0 && x < R && y < C && r.cells[x][y].s === 'land') {
          r.cells[x][y] = { t: String(minute), s: 'active' };
          next.push([x, y]); fresh--;
        }
      }
      r.V('minute', minute); r.V('fresh left', fresh);
      r.snap(`Minute ${minute}: everything next to last minute's rot spoils at once: ${next.length} orange${next.length > 1 ? 's' : ''}. ${fresh ? `${fresh} fresh left.` : 'None left fresh.'}`, [1, 2]);
      next.forEach(([x, y]) => (r.cells[x][y].s = 'bad'));
      q = next;
    }
    r.snap(fresh ? `The rot stopped spreading with ${fresh} fresh orange${fresh > 1 ? 's' : ''} it can't reach. Answer: <b>−1</b>.` : `All rotten after <b>${minute} minutes</b>. Each number is the cell's distance to its <i>nearest</i> rotten start. Running a separate BFS from each rotten orange would have done the work several times over.`, 3);
    return { scene: sc, frames: r.frames, recipe: ['put every rotten orange in the queue: minute 0', 'one minute = one whole layer of the queue', 'each fresh neighbour turns rotten and joins the next layer', 'stop when nothing spreads; any fresh left? impossible'] };
  }

  function genGridDP() {
    const G = ['.....', '.#...', '...#.', '.....'];
    const R = G.length, C = G[0].length;
    const sc = gridScene(R, C);
    const r = new Rec(sc);
    r.cells = G.map((row) => row.split('').map((ch) => ({ t: ch === '#' ? '' : '', s: ch === '#' ? 'wall' : '' })));
    const dp = G.map((row) => row.split('').map(() => 0));
    r.snap('A robot starts top-left and may only step <b>right</b> or <b>down</b>; dark squares are blocked. How many different routes reach the bottom-right? Each square answers: <b>routes to me = routes to the square above + routes to the square on my left</b>.', 0);
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
      if (G[i][j] === '#') { dp[i][j] = 0; continue; }
      const up = i > 0 ? dp[i - 1][j] : 0, left = j > 0 ? dp[i][j - 1] : 0;
      dp[i][j] = i === 0 && j === 0 ? 1 : up + left;
      const prev = [];
      if (i > 0 && G[i - 1][j] !== '#') prev.push([i - 1, j]);
      if (j > 0 && G[i][j - 1] !== '#') prev.push([i, j - 1]);
      prev.forEach(([x, y]) => (r.cells[x][y].s = 'frontier'));
      r.cells[i][j] = { t: String(dp[i][j]), s: 'active' };
      r.snap(i === 0 && j === 0 ? 'The start: exactly <b>1</b> way to be here (do nothing).'
        : `(${i + 1}, ${j + 1}): ${i > 0 ? (G[i - 1][j] === '#' ? 'above is blocked (0)' : `${up} from above`) : 'nothing above (0)'} + ${j > 0 ? (G[i][j - 1] === '#' ? 'left is blocked (0)' : `${left} from the left`) : 'nothing to the left (0)'} = <b>${dp[i][j]}</b>.`, i === 0 && j === 0 ? 1 : 2);
      prev.forEach(([x, y]) => (r.cells[x][y].s = 'done'));
      r.cells[i][j].s = 'done';
    }
    r.cells[R - 1][C - 1].s = 'path';
    r.snap(`Answer: <b>${dp[R - 1][C - 1]}</b> routes. Each square was filled once from two neighbours already filled, which is why we go row by row: the order of filling is the important part. O(rows × cols), against an exponential number of routes if you walked each one.`, 3);
    return { scene: sc, frames: r.frames, recipe: ['state: routes(row, col) = number of ways to reach this square', 'the start has 1 way; blocked squares have 0', 'routes = routes(above) + routes(left)', 'fill in an order where above and left are already done'] };
  }

  function genQueens() {
    const N = 4;
    const sc = gridScene(N, N, { cell: 50 });
    const r = new Rec(sc);
    const qs = [];
    const attacks = (a, b, q) => q[1] === b || Math.abs(q[0] - a) === Math.abs(q[1] - b);
    function paint(cand, bad) {
      r.cells = [];
      for (let i = 0; i < N; i++) {
        const row = [];
        for (let j = 0; j < N; j++) {
          const q = qs.find((x) => x[0] === i && x[1] === j);
          let s = (i + j) % 2 ? 'dark' : '';
          if (qs.some((x) => x[0] !== i && attacks(i, j, x))) s = 'attack';
          if (q) s = 'queen';
          if (cand && cand[0] === i && cand[1] === j) s = bad ? 'bad' : 'active';
          row.push({ t: q || (cand && cand[0] === i && cand[1] === j && !bad) ? '♛' : '', s });
        }
        r.cells.push(row);
      }
      r.L('queens placed (row → column)', qs.map(([a, b]) => `r${a + 1}→c${b + 1}`));
    }
    let tries = 0;
    r.V('squares tried', 0);
    paint();
    r.snap('Place 4 queens so no two attack each other (same column or diagonal). One queen per row, so go row by row: <b>choose</b> a square, <b>explore</b> the next row, and if that fails, <b>un-choose</b>.', -1);
    function solve(row) {
      if (row === N) { paint(); r.snap(`All ${N} rows filled with no attacks. <b>Solution found</b> after trying ${tries} squares out of ${N ** N} possible layouts. (The other 4×4 solution is this one's mirror image.)`, 3); return true; }
      for (let c = 0; c < N; c++) {
        tries++;
        r.V('squares tried', tries);
        const hit = qs.find((q) => attacks(row, c, q));
        if (hit) {
          paint([row, c], true);
          r.snap(`Row ${row + 1}, column ${c + 1}: attacked by the queen at row ${hit[0] + 1}, column ${hit[1] + 1}. <b>Prune</b>: don't even try anything below this.`, 1);
          continue;
        }
        qs.push([row, c]);
        paint();
        r.snap(`Row ${row + 1}, column ${c + 1} is safe. <b>Choose</b> it, then move on to row ${row + 2 > N ? N : row + 2}.`, 0);
        if (solve(row + 1)) return true;
        qs.pop();
        paint();
        r.snap(`Row ${row + 2} had no safe square, so this choice was wrong. <b>Un-choose</b>: lift the queen off row ${row + 1}, column ${c + 1} and try the next column.`, 2);
      }
      paint();
      r.snap(`Every square in row ${row + 1} is attacked. <b>Dead end</b>: go back to row ${row} and change its queen.`, 2);
      return false;
    }
    solve(0);
    return { scene: sc, frames: r.frames, recipe: ['choose: put a queen on a safe square in this row', 'prune: skip any square already attacked', 'explore the next row; if it dead-ends, un-choose and try the next square', 'every row has a queen: solution'] };
  }

  // ═════════════════════════════ BACKTRACKING / DP TREES

  function genSubsets() {
    const nums = [1, 2, 3];
    let c = 0;
    const set = (p) => (p.length ? '{' + p.join(',') + '}' : '{ }');
    function build(i, path) {
      const n = { id: 's' + c++, label: set(path), left: null, right: null };
      if (i < nums.length) {
        n.left = build(i + 1, [...path, nums[i]]); n.leftLabel = '+' + nums[i];
        n.right = build(i + 1, path); n.rightLabel = 'skip';
      }
      return n;
    }
    const root = build(0, []);
    const sc = treeScene(root, { dx: 40, dy: 70 });
    const r = new Rec(sc);
    const path = r.L('path (what you hold now)', []);
    const out = r.L('subsets recorded', []);
    r.snap('All subsets of [1, 2, 3]. Each level of this tree is one decision: <b>take</b> the number or <b>skip</b> it. Backtracking is a depth-first walk of this tree, and the tree is never actually built: it only exists as the path you are holding.', -1);
    function go(n, i, p) {
      r.ns[n.id] = 'path';
      if (p) r.e(p.id, n.id, 'active');
      if (i === nums.length) {
        r.ns[n.id] = 'active';
        out.push(set(path));
        r.snap(`No numbers left to decide. Record <b>${set(path)}</b>.`, 3);
        r.ns[n.id] = 'done';
        if (p) r.e(p.id, n.id, 'tree');
        return;
      }
      r.snap(`Holding ${set(path)}. Decide about <b>${nums[i]}</b>: first, take it.`, 0);
      path.push(nums[i]);
      go(n.left, i + 1, n);
      path.pop();
      r.ns[n.id] = 'active';
      r.snap(`Back at ${set(path)}. <b>Un-choose</b>: put ${nums[i]} back down (pop it off the path), so the next branch starts clean. Now skip ${nums[i]}.`, [1, 2]);
      r.ns[n.id] = 'path';
      go(n.right, i + 1, n);
      r.ns[n.id] = 'done';
      if (p) r.e(p.id, n.id, 'tree');
    }
    go(root, 0, null);
    r.snap(`All ${out.length} = 2³ subsets. The work is the number of nodes in the decision tree, which is why backtracking is exponential, and why <i>pruning</i> (cutting branches early) matters so much.`);
    return { scene: sc, frames: r.frames, recipe: ['choose: take the next number (push)', 'explore everything that follows', 'un-choose: put it back (pop), then explore the skip branch', 'no numbers left: record what you hold'] };
  }

  function genFib(memo) {
    let c = 0;
    function build(n) {
      const node = { id: 'f' + c++, n, label: 'f' + n, left: null, right: null };
      if (n >= 2) { node.left = build(n - 1); node.right = build(n - 2); }
      return node;
    }
    const root = build(5);
    const sc = treeScene(root, { dx: 40, dy: 62 });
    const r = new Rec(sc);
    const note = {};
    let calls = 0;
    r.V('calls made', 0);
    if (memo) r.L('sticky notes (memo)', []);
    r.snap(memo ? 'The same calls, but every answer gets written on a <b>sticky note</b> the first time. Before working anything out, check the notes.'
      : 'f(n) = f(n−1) + f(n−2), done the naive way. Each call makes two more calls. Watch for calls you have seen before.');
    function go(t, p) {
      calls++;
      r.V('calls made', calls);
      if (p) r.e(p.id, t.id, 'active');
      if (memo && t.n in note) {
        r.ns[t.id] = 'hit';
        r.bd[t.id] = '= ' + note[t.n];
        subtreeIds(t).slice(1).forEach((id) => (r.ns[id] = 'dim'));
        r.snap(`f(${t.n}) is already on a sticky note: <b>${note[t.n]}</b>. No calls below it. The whole faded branch is work we don't do.`, 1);
        if (p) r.e(p.id, t.id, 'tree');
        return note[t.n];
      }
      r.ns[t.id] = 'path';
      let v;
      if (t.n < 2) {
        v = t.n;
        r.ns[t.id] = 'active';
        r.bd[t.id] = '= ' + v;
        r.snap(`f(${t.n}) is a base case: <b>${v}</b>.`, 0);
      } else {
        const seenBefore = !memo && Object.keys(note).includes(String(t.n));
        r.snap(`Call f(${t.n}).${seenBefore ? ` <b>We have already computed f(${t.n})</b>, but nothing remembers it, so it all happens again.` : ''}`, 2);
        const a = go(t.left, t), b = go(t.right, t);
        v = a + b;
        r.ns[t.id] = 'active';
        r.bd[t.id] = '= ' + v;
        r.snap(`f(${t.n}) = ${a} + ${b} = <b>${v}</b>.${memo ? ` Write it on a sticky note.` : ''}`, memo ? [2, 3] : 2);
      }
      note[t.n] = v;
      if (memo) r.L('sticky notes (memo)', Object.keys(note).sort().map((k) => `f${k}=${note[k]}`));
      r.ns[t.id] = 'done';
      if (p) r.e(p.id, t.id, 'tree');
      return v;
    }
    const ans = go(root, null);
    r.snap(memo ? `f(5) = <b>${ans}</b> in ${calls} calls instead of 15. Each distinct question is worked out once. That's all DP is: <b>recursion + remembering</b>. For f(40) it is 79 calls instead of 331 million.`
      : `f(5) = <b>${ans}</b>, but it took <b>${calls} calls</b>, and f(2) alone was worked out 3 times. The tree doubles with each level: f(40) needs over 300 million calls.`);
    return { scene: sc, frames: r.frames, recipe: memo ? ['base case: f(0) = 0, f(1) = 1', 'answer on a sticky note? use it, no calls', 'otherwise add f(n−1) and f(n−2)', 'write the answer on a sticky note'] : ['base case: f(0) = 0, f(1) = 1', '(nothing is remembered)', 'otherwise add f(n−1) and f(n−2)'] };
  }

  // ═════════════════════════════ static pictures

  function stShapes() {
    const t = buildTree([1, 2, 3, 4, 5, null, 6]);
    const tree = treeScene(t, { dx: 36, dy: 54 });
    const P = { A: [0, 0], B: [1.4, 0], C: [0, 1.4], D: [1.4, 1.4], E: [2.6, 0.7] };
    const nd = Object.keys(P).map((k) => ({ id: k, label: k, x: P[k][0], y: P[k][1] }));
    const und = mkScene(nd, ['AB', 'AC', 'BD', 'CD', 'BE', 'DE'].map((s) => ({ a: s[0], b: s[1] })), { dx: 58, dy: 58 });
    const nd2 = nd.map((n) => ({ ...n }));
    const dir = mkScene(nd2, [['A', 'B', 3], ['A', 'C', 1], ['C', 'D', 2], ['D', 'B', 4], ['B', 'E', 7], ['E', 'D', 5]].map(([a, b, w]) => ({ a, b, w })), { directed: true, dx: 58, dy: 58 });
    const grid = gridScene(4, 4, { cell: 34 });
    const cells = [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => ({ t: '', s: (i === 1 && j === 2) ? 'active' : (Math.abs(i - 1) + Math.abs(j - 2) === 1) ? 'frontier' : '' })));
    return [
      { cap: '<b>Tree</b>: one root, no loops, exactly one route between any two nodes.', scene: tree, frame: { ns: { [t.id]: 'active' } } },
      { cap: '<b>Undirected graph</b>: two-way streets. Loops allowed.', scene: und, frame: {} },
      { cap: '<b>Directed, weighted</b>: one-way streets with lengths.', scene: dir, frame: {} },
      { cap: '<b>Grid</b>: a graph nobody wrote down. Neighbours are computed: up, down, left, right.', scene: grid, frame: { cells } },
    ];
  }
  function stAnatomy() {
    const t = buildTree(['A', 'B', 'C', 'D', 'E', null, 'F', null, null, 'G']);
    const sc = treeScene(t, { dx: 64, dy: 62 });
    const bd = { t0: 'root · depth 0', t1: 'parent of D, E', t2: 'depth 1', t3: 'leaf', t4: 'depth 2', t5: 'leaf', t6: 'leaf · depth 3' };
    const ns = { t0: 'active', t1: 'path', t3: 'done', t5: 'done', t6: 'done', t4: 'frontier' };
    const es = {};
    return [{ cap: 'Purple: B and everything below it form <b>B\'s subtree</b>, itself a complete tree. That fact is why recursion works on trees. Height of the whole tree: 3 edges (A → B → E → G).', scene: sc, frame: { ns: { ...ns, t4: 'path', t6: 'path', t3: 'path' }, bd, es } }];
  }
  function stStairs() {
    const nodes = [0, 1, 2, 3, 4, 5].map((i) => ({ id: 's' + i, label: String(i), x: i, y: 0 }));
    const edges = [];
    for (let i = 0; i < 5; i++) edges.push({ a: 's' + i, b: 's' + (i + 1) });
    for (let i = 0; i < 4; i++) edges.push({ a: 's' + i, b: 's' + (i + 2), bend: i % 2 ? 20 : 34 });
    const sc = mkScene(nodes, edges, { directed: true, dx: 82, dy: 60 });
    sc.rows = 0.35; sc.top = 52;
    const bd = { s0: '1 way', s1: '1', s2: '2', s3: '3', s4: '5', s5: '8 ways' };
    return [{ cap: 'Climbing stairs, one or two steps at a time, drawn as a graph: each step number is a <b>state</b>, each move is an <b>edge</b>. Ways to reach a state = sum of the ways into it. Filling left to right is a walk of this graph in topological order.', scene: sc, frame: { bd, ns: { s5: 'active' } } }];
  }
  function stEuler() { return 'euler'; }

  // ───────────────────────────── renderer

  function nodeBox(n) {
    const pill = n.label.length > 2;
    const w = pill ? Math.max(36, n.label.length * 7.3 + 18) : 34;
    return { hw: w / 2, hh: pill ? 14 : 17, pill };
  }
  function trim(b, ux, uy) {
    if (!b.pill) return b.hh;
    const tx = Math.abs(ux) > 1e-6 ? b.hw / Math.abs(ux) : Infinity;
    const ty = Math.abs(uy) > 1e-6 ? b.hh / Math.abs(uy) : Infinity;
    return Math.min(tx, ty);
  }
  const STATES = ['none', 'active', 'tree', 'path', 'bad', 'dim'];

  function drawGraph(svg, sc) {
    svg.innerHTML = '';
    const uid = 'v' + UID++;
    const padX = 30, padT = sc.top != null ? sc.top : 44, padB = 28;
    const pos = {};
    let maxHW = 17;
    sc.nodes.forEach((n) => {
      const b = nodeBox(n);
      maxHW = Math.max(maxHW, b.hw);
      pos[n.id] = { cx: 0, cy: 0, ...b, n };
    });
    const px = Math.max(padX, maxHW + 8, sc.padX);
    sc.nodes.forEach((n) => { pos[n.id].cx = px + n.x * sc.dx; pos[n.id].cy = padT + n.y * sc.dy; });
    const W = px * 2 + sc.cols * sc.dx, Hh = padT + padB + sc.rows * sc.dy;
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
    svg.setAttribute('width', W);
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    const defs = S('defs', {}, svg);
    STATES.forEach((s) => {
      const m = S('marker', { id: `${uid}-${s}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 11, markerHeight: 11, markerUnits: 'userSpaceOnUse', orient: 'auto' }, defs);
      S('path', { d: 'M0,0 L10,5 L0,10 z', class: 'mk s-' + s }, m);
    });
    const gE = S('g', {}, svg), gL = S('g', {}, svg), gN = S('g', {}, svg), gB = S('g', {}, svg);
    const edges = {};
    sc.edges.forEach((e) => {
      const A = pos[e.a], B = pos[e.b];
      let d, mx, my;
      if (e.bend) {
        const mx0 = (A.cx + B.cx) / 2, my0 = (A.cy + B.cy) / 2;
        const dx = B.cx - A.cx, dy = B.cy - A.cy, L = Math.hypot(dx, dy);
        const cx = mx0 - (dy / L) * e.bend * 2, cy = my0 + (dx / L) * e.bend * 2;
        const u1 = norm(cx - A.cx, cy - A.cy), u2 = norm(B.cx - cx, B.cy - cy);
        const s1 = trim(A, u1[0], u1[1]) + 1, s2 = trim(B, u2[0], u2[1]) + (sc.directed ? 3 : 1);
        const x1 = A.cx + u1[0] * s1, y1 = A.cy + u1[1] * s1, x2 = B.cx - u2[0] * s2, y2 = B.cy - u2[1] * s2;
        d = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
        mx = 0.25 * x1 + 0.5 * cx + 0.25 * x2; my = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
      } else {
        const u = norm(B.cx - A.cx, B.cy - A.cy);
        const s1 = trim(A, u[0], u[1]) + 1, s2 = trim(B, u[0], u[1]) + (sc.directed ? 3 : 1);
        const x1 = A.cx + u[0] * s1, y1 = A.cy + u[1] * s1, x2 = B.cx - u[0] * s2, y2 = B.cy - u[1] * s2;
        d = `M${x1},${y1} L${x2},${y2}`;
        mx = (x1 + x2) / 2; my = (y1 + y2) / 2;
      }
      const p = S('path', { d, class: 'ed s-none' }, gE);
      edges[e.key] = p;
      const text = e.w != null ? String(e.w) : e.label;
      if (text) {
        const g = S('g', { class: 'elab' }, gL);
        const w = text.length * 6.6 + 8;
        S('rect', { x: mx - w / 2, y: my - 9, width: w, height: 18, rx: 5 }, g);
        S('text', { x: mx, y: my + 4, 'text-anchor': 'middle' }, g).textContent = text;
      }
    });
    const nodes = {}, badges = {};
    sc.nodes.forEach((n) => {
      const P = pos[n.id];
      const g = S('g', { class: 'nd s-none', transform: `translate(${P.cx},${P.cy})` }, gN);
      if (P.pill) S('rect', { x: -P.hw, y: -P.hh, width: P.hw * 2, height: P.hh * 2, rx: P.hh }, g);
      else S('circle', { r: 17 }, g);
      S('text', { y: 4.5, 'text-anchor': 'middle' }, g).textContent = n.label;
      nodes[n.id] = g;
      const bg = S('g', { class: 'bdg', transform: `translate(${P.cx},${P.cy - P.hh - 12})` }, gB);
      S('rect', { y: -9, height: 18, rx: 9 }, bg);
      S('text', { y: 4, 'text-anchor': 'middle' }, bg);
      badges[n.id] = bg;
    });
    return {
      update(f) {
        for (const id in nodes) nodes[id].setAttribute('class', 'nd s-' + ((f.ns && f.ns[id]) || 'none'));
        for (const k in edges) {
          const s = (f.es && f.es[k]) || 'none';
          edges[k].setAttribute('class', 'ed s-' + s);
          if (sc.directed) edges[k].setAttribute('marker-end', `url(#${uid}-${STATES.includes(s) ? s : 'none'})`);
        }
        for (const id in badges) {
          const t = f.bd && f.bd[id];
          const g = badges[id];
          g.style.display = t ? '' : 'none';
          if (t) {
            const w = t.length * 6.4 + 14;
            g.firstChild.setAttribute('x', -w / 2);
            g.firstChild.setAttribute('width', w);
            g.lastChild.textContent = t;
          }
        }
      },
    };
  }
  function norm(x, y) { const L = Math.hypot(x, y) || 1; return [x / L, y / L]; }

  function drawGrid(svg, sc) {
    svg.innerHTML = '';
    const c = sc.cell, pad = 4;
    const W = pad * 2 + sc.cols * c, Hh = pad * 2 + sc.rows * c;
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
    svg.setAttribute('width', W);
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    const cells = [];
    for (let i = 0; i < sc.rows; i++) {
      const row = [];
      for (let j = 0; j < sc.cols; j++) {
        const g = S('g', { class: 'cell s-none', transform: `translate(${pad + j * c},${pad + i * c})` }, svg);
        S('rect', { x: 1.5, y: 1.5, width: c - 3, height: c - 3, rx: 6 }, g);
        S('text', { x: c / 2, y: c / 2 + 5, 'text-anchor': 'middle' }, g);
        row.push(g);
      }
      cells.push(row);
    }
    return {
      update(f) {
        if (!f.cells) return;
        f.cells.forEach((row, i) => row.forEach((cl, j) => {
          cells[i][j].setAttribute('class', 'cell s-' + (cl.s || 'none'));
          cells[i][j].lastChild.textContent = cl.t || '';
        }));
      },
    };
  }

  function drawEuler(svg) {
    const t = buildTree([1, 2, 3, 4, 5]);
    const sc = treeScene(t, { dx: 78, dy: 86 });
    const g = drawGraph(svg, sc);
    g.update({});
    const P = {};
    sc.nodes.forEach((n) => (P[n.label] = [30 + n.x * sc.dx + 0, 44 + n.y * sc.dy]));
    // nodeBox gives px = max(30, 17+8) = 30
    const o = 27;
    const L = (k) => [P[k][0] - o, P[k][1] - 6], B = (k) => [P[k][0], P[k][1] + o], R = (k) => [P[k][0] + o, P[k][1] - 6];
    const tour = [L(1), L(2), L(4), B(4), R(4), B(2), L(5), B(5), R(5), R(2), B(1), L(3), B(3), R(3), R(1)];
    const mk = S('marker', { id: 'eu-arrow', viewBox: '0 0 10 10', refX: 6, refY: 5, markerWidth: 9, markerHeight: 9, markerUnits: 'userSpaceOnUse', orient: 'auto' }, svg.querySelector('defs'));
    S('path', { d: 'M0,0 L10,5 L0,10 z', class: 'eu-mk' }, mk);
    const d = 'M' + tour.map((p) => p.join(',')).join(' L');
    S('path', { d, class: 'eu-path', 'marker-mid': 'url(#eu-arrow)' }, svg);
    const dots = [];
    for (const k of [1, 2, 3, 4, 5]) { dots.push([L(k), 'pre']); dots.push([B(k), 'in']); dots.push([R(k), 'post']); }
    dots.forEach(([p, c]) => S('circle', { cx: p[0], cy: p[1], r: 5, class: 'eu-dot eu-' + c }, svg));
  }

  // ───────────────────────────── player

  function mount(host) {
    const id = host.dataset.viz;
    const spec = REG[id];
    if (!spec) { host.textContent = 'Unknown visual: ' + id; return; }
    host.classList.add('viz');
    host.innerHTML = '';
    if (spec.static) return mountStatic(host, spec);
    const head = H('div', 'viz-head', host);
    H('div', 'viz-title', head, spec.title);
    const chips = H('div', 'viz-chips', head);
    const body = H('div', 'viz-body', host);
    const stage = H('div', 'viz-stage', body);
    const svg = S('svg', { class: 'viz-svg', role: 'img', 'aria-label': spec.title }, stage);
    const side = H('div', 'viz-side', body);
    const say = H('div', 'viz-say', host);
    say.setAttribute('aria-live', 'polite');
    const recipe = H('ol', 'viz-recipe', host);
    const bar = H('div', 'viz-bar', host);
    const bFirst = btn(bar, '⏮', 'Back to the start');
    const bPrev = btn(bar, '◀', 'Step back (←)');
    const bPlay = btn(bar, '▶', 'Play / pause (space)', 'play');
    const bNext = btn(bar, '▶', 'Step forward (→)', 'next');
    const bLast = btn(bar, '⏭', 'Jump to the end');
    bNext.innerHTML = 'Step ›';
    bPrev.innerHTML = '‹';
    const range = H('input', 'viz-range', bar);
    range.type = 'range'; range.min = 0; range.setAttribute('aria-label', 'Frame');
    const count = H('span', 'viz-count', bar);
    const speed = H('select', 'viz-speed', bar);
    speed.setAttribute('aria-label', 'Speed');
    [['Slow', 2600], ['Normal', 1500], ['Fast', 700]].forEach(([t, v], k) => { const o = H('option', null, speed, t); o.value = v; if (k === 1) o.selected = true; });

    const variants = spec.variants || [{ label: null, make: spec.make }];
    let def, i = 0, timer = null, painter = null, curScene = null;
    if (variants.length > 1) variants.forEach((v, k) => {
      const c = H('button', 'chip' + (k === 0 ? ' on' : ''), chips, v.label);
      c.type = 'button';
      c.onclick = () => { [...chips.children].forEach((x) => x.classList.remove('on')); c.classList.add('on'); load(k); };
    });
    function load(k) {
      stop();
      def = variants[k].make();
      i = 0;
      curScene = null;
      recipe.innerHTML = '';
      (def.recipe || []).forEach((t) => H('li', null, recipe, t));
      recipe.style.display = def.recipe ? '' : 'none';
      range.max = def.frames.length - 1;
      render();
    }
    function render() {
      const f = def.frames[i];
      const sc = f.scene || def.scene;
      if (sc !== curScene) { painter = sc.kind === 'grid' ? drawGrid(svg, sc) : drawGraph(svg, sc); curScene = sc; }
      painter.update(f);
      say.innerHTML = f.say || '';
      side.innerHTML = '';
      (f.lists || []).forEach(([name, v, scalar]) => {
        const box = H('div', 'vl' + (scalar ? ' scalar' : ''), side);
        H('div', 'vl-name', box, name);
        const items = H('div', 'vl-items', box);
        if (scalar) H('span', 'vl-val', items, String(v));
        else if (!v.length) H('span', 'vl-empty', items, 'empty');
        else v.forEach((it) => H('span', 'tok' + (it && it.s ? ' ' + it.s : ''), items, String(it && it.t != null ? it.t : it)));
      });
      side.style.display = (f.lists || []).length ? '' : 'none';
      const lines = Array.isArray(f.line) ? f.line : [f.line];
      [...recipe.children].forEach((li, k) => li.classList.toggle('on', lines.includes(k)));
      range.value = i;
      count.textContent = `${i + 1} / ${def.frames.length}`;
      bPrev.disabled = bFirst.disabled = i === 0;
      bNext.disabled = bLast.disabled = i === def.frames.length - 1;
    }
    function go(k) { i = Math.max(0, Math.min(def.frames.length - 1, k)); render(); }
    function stop() { if (timer) clearInterval(timer); timer = null; bPlay.textContent = '▶'; bPlay.classList.remove('on'); }
    function play() {
      if (timer) return stop();
      if (i === def.frames.length - 1) go(0);
      bPlay.textContent = '❚❚'; bPlay.classList.add('on');
      timer = setInterval(() => { if (i >= def.frames.length - 1) stop(); else go(i + 1); }, +speed.value);
    }
    bFirst.onclick = () => { stop(); go(0); };
    bLast.onclick = () => { stop(); go(def.frames.length - 1); };
    bPrev.onclick = () => { stop(); go(i - 1); };
    bNext.onclick = () => { stop(); go(i + 1); };
    bPlay.onclick = play;
    speed.onchange = () => { if (timer) { stop(); play(); } };
    range.oninput = () => { stop(); go(+range.value); };
    host.tabIndex = 0;
    host.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); stop(); go(i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); go(i - 1); }
      else if (e.key === ' ') { e.preventDefault(); play(); }
    });
    load(0);
    host._viz = { stop };
  }
  function btn(parent, t, title, cls) {
    const b = H('button', 'vb' + (cls ? ' ' + cls : ''), parent, t);
    b.type = 'button'; b.title = title; b.setAttribute('aria-label', title);
    return b;
  }
  function mountStatic(host, spec) {
    host.classList.add('static');
    if (spec.title) H('div', 'viz-title', H('div', 'viz-head', host), spec.title);
    const out = spec.make();
    if (out === 'euler') {
      const fig = H('figure', 'viz-fig', host);
      const svg = S('svg', { class: 'viz-svg', role: 'img', 'aria-label': 'Walking around a tree' }, fig);
      drawEuler(svg);
      H('figcaption', null, fig, spec.caption);
      return;
    }
    const grid = H('div', 'viz-figs n' + out.length, host);
    out.forEach((p) => {
      const fig = H('figure', 'viz-fig', grid);
      const svg = S('svg', { class: 'viz-svg', role: 'img' }, fig);
      const painter = p.scene.kind === 'grid' ? drawGrid(svg, p.scene) : drawGraph(svg, p.scene);
      painter.update(p.frame);
      H('figcaption', null, fig, p.cap);
    });
  }

  // ───────────────────────────── registry

  const REG = {
    shapes: { static: true, make: stShapes },
    anatomy: { static: true, make: stAnatomy },
    stairs: { static: true, make: stStairs },
    euler: { static: true, make: stEuler, caption: 'Walk around the outside of the tree, keeping it on your left. You pass every node three times: arriving from above (<span class="k-pre">●</span> pre-order), passing underneath between its children (<span class="k-in">●</span> in-order), and leaving back up (<span class="k-post">●</span> post-order). Write the node down at one of those three moments and you get one of the three orders.' },
    traverse: { title: 'Depth-first traversals', variants: [{ label: 'Pre-order', make: () => genTraverse('pre') }, { label: 'In-order', make: () => genTraverse('in') }, { label: 'Post-order', make: () => genTraverse('post') }] },
    level: { title: 'Level order (breadth-first)', make: genLevel },
    depth: { title: 'Maximum depth: answers flow up', make: genDepth },
    bst: { title: 'Searching a BST', variants: [{ label: 'Find 7', make: () => genBST(7) }, { label: 'Find 5 (missing)', make: () => genBST(5) }] },
    validate: { title: 'Is it a valid BST? Pass a window down', variants: [{ label: 'Broken tree', make: () => genValidate([5, 3, 8, 1, 6, 7, 9]) }, { label: 'Valid tree', make: () => genValidate([5, 3, 8, 1, 4, 7, 9]) }] },
    diameter: { title: 'Diameter: return one arm, record two', make: genDiameter },
    lca: { title: 'Lowest common ancestor of 6 and 4', make: genLCA },
    robber: { title: 'Tree DP: rob or skip each house', make: genRobber },
    bfs: { title: 'Exploring a graph', variants: [{ label: 'Breadth-first (queue)', make: genBFS }, { label: 'Depth-first (stack)', make: genDFS }] },
    islands: { title: 'Counting islands with flood fill', make: genIslands },
    oranges: { title: 'Multi-source BFS: rotting oranges', make: genOranges },
    kahn: { title: 'Topological sort (Kahn): getting dressed', make: genKahn },
    colors: { title: 'Cycle detection with three colours', make: genColors },
    dijkstra: { title: "Dijkstra's shortest paths", make: genDijkstra },
    uf: { title: 'Union-Find: clubs and presidents', make: genUF },
    subsets: { title: 'Backtracking: every subset of [1, 2, 3]', make: genSubsets },
    queens: { title: 'Backtracking with pruning: 4 queens', make: genQueens },
    fib: { title: 'Why DP: the same question, asked again and again', variants: [{ label: 'Plain recursion', make: () => genFib(false) }, { label: 'With memo', make: () => genFib(true) }] },
    griddp: { title: 'Grid DP: counting routes', make: genGridDP },
  };

  const API = { REG, mount, mountAll: () => document.querySelectorAll('[data-viz]').forEach(mount) };
  if (typeof module !== 'undefined') module.exports = API;
  if (typeof window !== 'undefined') {
    window.TGViz = API;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', API.mountAll);
    else API.mountAll();
  }
})();
