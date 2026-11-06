# senior: senior-level LeetCode patterns

Senior interviews ask harder mediums and hards, design-a-class problems, and follow-ups like "now in O(1) space" or "now it's a stream". Under those are about a dozen patterns. This course takes them one at a time and drills each until the setup takes no thought, so your attention goes to the problem itself.

It's a sibling of `../dicti` (graphs and trees in a dict) and `../claude_leetcode_help` (linked lists), and it skips what they cover: linked lists, LRU, graph traversal, grids, topological sort, Dijkstra, union-find and tries.

## How to open it

```
cd ~/Projects/L/leetcode/senior
python3 -m http.server 8001
```

Then open <http://localhost:8001>. The first load downloads Python (Pyodide, about 10 MB) from a CDN, and the browser caches it after that.

## How each lesson works

The five parts of dicti, plus two at the start that build understanding before speed:

1. **Read.** The one new pattern, the shapes it comes in, its traps, and the follow-up questions a senior interviewer asks.
2. **Step through.** Real Python run one line at a time, showing each waiting call's variables and what it returns. At marked lines it stops and asks what a variable is before the line runs, and you can't go on until you answer. **Edit the code** lets you trace your own version.
3. **Break it.** A plausible wrong solution: find an input where it gives the wrong answer. The page checks your input against a correct solution. This is how you learn *why* the right version is right.
4. **Reps.** Small generic functions, each in **Copy** mode (solution beside you) and **Recall** mode (from memory, timed). Some reps require a particular technique.
5. **Predict.** Read a snippet, type what it prints or the error it raises. Each snippet targets one trap.
6. **Problems.** Interview problems with tests and a solution you can reveal.
7. **From blank + On LeetCode.** Redo the listed reps and problems in Recall mode today and again 2–3 days later, then solve the LeetCode list cold. Misses go in `QA.md` with the missing skill.

`TreeNode` is given, as on LeetCode. In tests, trees are written as LeetCode's level-order lists (`[1, None, 2]`).

## The 14 lessons

| # | Lesson | The new skill | Problems inside / On LeetCode |
|---|---|---|---|
| 01 | **Binary trees** | base case, pass down vs return up, a tuple up, an answer on the side (`nonlocal`), inorder with a stack, building trees, level order with a queue, walking a BST | 110, 98, 543, 236, 105, 124, 297, 199, 662, 450 · 104, 94, 1448, 337, 979, 102, 103, 235, 230, 173 |
| 02 | **Prefix sums + hash map** | running total, `{prefix: count}`, "sum = k" as a lookup, prefix mod k | 525, 974, 523, 1248, 437, 304 · 1480, 303, 724, 238, 560 |
| 03 | **Sliding window** | grow/shrink loop, what the window holds, exactly k = at most k − at most (k−1) | 3, 424, 904, 76, 992 · 643, 209, 1004, 567, 438, 930 |
| 04 | **Two pointers after sorting** | sort then squeeze, skipping duplicates, 3-sum as a loop around 2-sum | 15, 16, 11, 42, 881, 18 · 167, 125, 26, 283, 977, 75 |
| 05 | **Binary search on the answer** | one boundary template (`lo < hi`), the "is this guess possible?" check, rotated arrays | 875, 1011, 410, 33, 153, 4 · 704, 35, 34, 69, 278, 162 |
| 06 | **Stacks: monotonic + parsing** | which way the stack is sorted, when to pop, contribution counting, a stack of saved states for nested input | 503, 84, 907, 402, 394, 224 · 20, 496, 739, 150, 71, 901, 239 |
| 07 | **Heaps + selection** | `heapq` tuples, top k, two heaps (median), k-way merge, schedulers, quickselect, bucket by count | 295, 373, 621, 1834, 41, 502 · 1046, 215, 973, 347, 448, 378, 23 |
| 08 | **Intervals + sweep line** | sort by start or end, merge, two sorted lists together, +1/−1 events, difference arrays | 57, 435, 253, 1094, 759, 1288 · 56, 986, 1109, 732 |
| 09 | **Greedy** | the exchange argument, furthest reach, sort by end, reset a running total, one pass per direction, sort by a derived key, greedy vs DP | 134, 763, 452, 135, 1029, 846 · 55, 45, 53, 769, 179, 406, 630 |
| 10 | **Backtracking** | choose → explore → undo, pruning, skipping duplicate results | 22, 40, 47, 131, 79, 51, 698 · 78, 90, 77, 46, 39, 17, 37 |
| 11 | **DP 1: recursion to table** | name the state, `@cache` it, then turn it into a table | 198, 322, 300, 1143, 72, 139 · 70, 746, 62, 64, 213, 377, 91 |
| 12 | **DP 2: the families** | 0/1 vs unbounded knapsack, interval DP, state machine, bitmask, DP + binary search | 416, 518, 312, 309, 1235, 526 · 494, 516, 714, 123, 698 |
| 13 | **Design-a-class** | choosing structures for the required speeds, O(1) tricks (list + index map), lazy deletion | 981, 1396, 460, 895, 1146, 2034 · 155, 933, 380, 362, 355 |
| 14 | **Mixed** | nothing new: unlabelled problems from 1–13, so choosing the tool is part of the test | 128, 1658, 646, 152, 853, 287, 438, 931 · 1, 121, 692, 1838, 659, 2024 |

Every lesson is built. Left out on purpose: bit tricks, segment/Fenwick trees, KMP/rolling hash and geometry. They're rare even in senior interviews and cost a lot to learn for what they pay back.

## Files

```
senior/
  index.html          the app (home + lessons)
  app.js              router, editor, timer, Python runner (Pyodide in a Web Worker)
  harness.js          the Python side: test runner, TreeNode and tree helpers
  diagrams.js         draws trees, lists, bars, intervals and tables as SVG from <span> placeholders
  style.css
  lessons/NN-*.js     one data file per lesson
  tools/check.mjs     verifies every lesson with local python3 (tests, stubs, predicts, walks, break-its) and that every diagram draws
  QA.md               questions and answers, LeetCode misses
```

Progress, drafts and times are kept in your browser's `localStorage`, separately from dicti's.
