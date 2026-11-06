# Questions & answers

Questions that come up while working through the course, each kept once with its answer, filed under its lesson. It's a distilled record, not a transcript.

## How entries work

- **One entry per question.** If an entry on the same thing already exists, improve its answer and add the date to its "came up" line.
- **File it where it belongs:** under its lesson, or under *Whole course*.
- **Keep answers short:** two to four sentences. Link to `README.md` or the lesson instead of repeating them.
- **Record what changed.** If answering meant changing something, add a **Changed:** line.
- **LeetCode misses go here too:** the problem, and which lesson's skill was missing.

## Open

## Whole course

### Will it work on a phone if it's on GitHub?
*Whole course · settled 2026-11-06*

Not by opening `index.html` in the GitHub repo view, which shows the source. It works once the repo is served with GitHub Pages (Settings → Pages → deploy from `main`). Pages is free for public repos and needs a paid plan for private ones. Tested in Chrome emulating a 390 px phone screen, not on a real phone: everything fits and runs. On a real phone: the first load downloads about 10 MB of Python, there's no Tab key (Enter still auto-indents, Backspace removes 4 spaces), and curly quotes from the phone keyboard are now turned back into straight ones before running.

**Changed:** published as a public repo, `leetcode-senior`, served by GitHub Pages at <https://hmanqo.github.io/leetcode-senior/>.

### Is `senior` the right name for the repo?
*Whole course · settled 2026-11-06*

It was a placeholder, since no name was picked. Renaming means renaming the folder and changing the `<title>`/brand in `index.html`. The `localStorage` prefix in `app.js` can stay as it is.

**Answer:** the GitHub repo is `leetcode-senior`. The local folder and the in-app brand stay `senior`.

### What other topics could go between lessons 01 and 09?
*Whole course · settled 2026-11-05*

Greedy was the one big gap, so it became lesson 09 and everything after it moved down one (Backtracking is now 10). Tree BFS and BST moves went into lesson 01. Stack parsing (394, 224, 71) is now part of the plan for 06, and quickselect / bucket sort (215, 347, 41) part of 07, to be built with those lessons.

**Changed:** new `lessons/09-greedy.js`, `09-backtracking.js` → `10-backtracking.js`, 01 renamed "Binary trees" with level-order and BST material, `README.md` and the plan in `app.js` now list 14 lessons.

### How do the "Step through" and "Break it" sections work?
*Whole course · settled 2026-11-05*

They were added for understanding rather than speed. **Step through** runs the code line by line in real Python, with a box per waiting call, and pauses at lines marked `# ask: expr` until you say what `expr` is. **Edit the code** lets you trace your own version. **Break it** shows a plausible wrong solution, and you type an input where it disagrees with a hidden correct one. Every lesson has them (lesson 14's walk through brute-force code to practise spotting which tool removes the repeated work).

**Changed:** `_walk` and `_breakit` in `harness.js`, `renderWalk` and `renderBreak` in `app.js`, and `tools/check.mjs` now verifies both kinds.

### Why is binary tree recursion lesson 01?
*Whole course · settled 2026-11-05*

You asked for it first. It doesn't depend on any other lesson here, and its "pass down, undo" and "answer on the side" shapes come back in Backtracking (10) and DP (11–12), so it makes a good start. The other lessons kept the order they were proposed in and moved down one.

### Where does `TreeNode` come from?
*Whole course · settled 2026-11-05*

It's given, as on LeetCode (see `harness.js`). Tests write trees as LeetCode's level-order lists, and rep 01/r7 has you write the list → tree builder yourself for local testing.

## 01 · Binary trees

### Can the BST parts show the tree as a picture?
*01 · Binary trees · settled 2026-11-06*

Yes. A level-order list like `[5, 4, 6, None, None, 3, 7]` is hard to picture, so the BST parts of lesson 01 now draw it: the Read section (floor's path and a two-child delete), walk w4, break-it b1 (an example and the answer), rep r9, and problems p2 and p10. Each node sits at its inorder position, so a BST reads sorted from left to right; blue marks the path and red marks the node that breaks the rule.

**Changed:** `app.js` draws any `<span class="tree" data-tree="[…]">` as an SVG (optional `data-path`, `data-bad`, `data-cap`), styled in `style.css` for light and dark.

*Came up again 2026-11-06: "in the answers too, and other sections that could use diagrams".* Trees are now drawn wherever an answer shows one: under each test case (the input trees, plus got/expected when the result is a tree), under each Break-it try and as you type, and in a Tree panel in Step through that fills in the node the current call is on. Other lessons got diagrams where the idea is a picture: the prefix list (02), the window moving (03), the squeeze, container and rain water (04), the no…yes boundary and the rotated list (05), the waiting stack, contribution and histogram (06), a heap as a tree and as a list (07), overlap, merge and sweep counts (08), sort by end and balloons (09), the subset and skip-duplicates trees (10), the repeated calls and the DP tables (11), and swap-with-last (13). Lessons 12 and 14 have none: 12's ideas are about loop order, and in 14 a picture would give away which tool to use.

**Changed:** the drawing moved to a new `diagrams.js`, which has five kinds (tree, including n-ary; arr; bars; ivals; grid). `harness.js` sends the raw test values to the page, and `tools/check.mjs` fails if any diagram doesn't parse or draw.
