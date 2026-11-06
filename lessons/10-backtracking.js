COURSE.lesson({
  id: "10",
  title: "Backtracking",
  tagline: "Choose → explore → undo: subsets, combinations, orderings, cuts and grids, without duplicates, cut short early.",

  intro: `
<p>Backtracking walks a <b>tree of choices</b> that never exists in memory. Each call stands at one node: it makes a
choice, recurses, then <b>undoes</b> the choice so the next one starts from the same state. You did a small version in
lesson 01 (leaf paths: append, recurse, pop). What changes from problem to problem is only three things: <b>what the
choices are</b>, <b>when to record</b>, and <b>what to skip</b>.</p>

<h3>The template</h3>
<pre><code>out, path = [], []
def go(start, ...):
    if DONE:
        out.append(path[:])      # a copy: path keeps changing
        return
    for i in range(start, len(items)):
        if SKIP(i):              # duplicate or pruned
            continue             # (or break, if sorted and nothing after can fit)
        path.append(items[i])    # choose
        go(i + 1, ...)           # explore
        path.pop()               # undo
go(0)</code></pre>

<h3>Which shape, by question</h3>
<table>
<thead><tr><th>The question asks for…</th><th>Choices at each call</th><th>Record when</th><th>Recurse with</th></tr></thead>
<tbody>
<tr><td>all <b>subsets</b></td><td>items from <code>start</code> on</td><td>every call</td><td><code>go(i + 1)</code></td></tr>
<tr><td><b>combinations</b> of size k / to a sum</td><td>items from <code>start</code> on</td><td>size = k / left = 0</td><td><code>go(i + 1)</code>, or <code>go(i)</code> if an item can repeat</td></tr>
<tr><td><b>orderings</b> (permutations)</td><td>every item not yet <code>used</code></td><td>path is full</td><td><code>go()</code>, with a <code>used</code> list</td></tr>
<tr><td>ways to <b>cut</b> a string</td><td>every end point for the next piece</td><td>start reaches the end</td><td><code>go(end)</code></td></tr>
<tr><td>a <b>path on a grid</b></td><td>the four neighbours</td><td>you reach the goal</td><td>mark the cell, recurse, unmark</td></tr>
</tbody>
</table>

<h3>No duplicates: sort, then skip at the same level</h3>
<p>When the input repeats values, sort it, then in the loop write
<code>if i &gt; start and nums[i] == nums[i - 1]: continue</code>. It means "at this position in the path, a value gets tried
once". It's <code>i &gt; start</code>, not <code>i &gt; 0</code>: the second 1 is still allowed <em>deeper</em> in the
same path. For orderings, the rule is "skip a repeat whose twin isn't in use":
<code>i &gt; 0 and nums[i] == nums[i - 1] and not used[i - 1]</code>.</p>

<h3>Pruning: stop before the subtree, not inside it</h3>
<ul>
<li><b>Sorted + <code>break</code>:</b> if this item is already too big for what's left, every later one is too.</li>
<li><b>Not enough left:</b> if <code>len(path) + (len(items) - i) &lt; k</code>, this branch can never reach k.</li>
<li><b>Return a bool</b> when one solution is enough: <code>if go(...): return True</code> stops the whole search.</li>
</ul>

<h3>Traps</h3>
<ol>
<li><b><code>out.append(path)</code> without a copy.</b> Every entry is the same list, empty by the end.</li>
<li><b>An undo you forgot.</b> No <code>pop()</code> or <code>used[i] = False</code> on some path: later branches start from the wrong state.</li>
<li><b><code>go(start + 1)</code> instead of <code>go(i + 1)</code>.</b> The next choice must come after the item just taken, not after where this loop started.</li>
<li><b>Strings don't need an undo.</b> <code>go(s + "a")</code> makes a new string, so there is nothing to pop. That's simpler, but costs O(n) per step.</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>Complexity is the size of the output:</b> subsets O(2ⁿ · n), orderings O(n! · n), the copy being the · n. Say it before they ask.</li>
<li><b>"What if we only need how many?"</b> If the count of results depends only on (index, what's left), not on the
path, that's DP (lessons 11–12): memoise and stop listing.</li>
<li><b>"Can it be faster?"</b> The answer is nearly always pruning (sort first, break, check feasibility early), and the
interviewer wants to hear which cut you'd add.</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "The subset tree: choose, explore, undo",
      prompt: `Every call records <code>path</code>, then tries each later item: append, recurse, pop. Watch the call boxes stack up as the path grows, and see the path jump back after <code>[1, 2, 3]</code>.`,
      code: `out, path = [], []

def go(start, items):
    out.append(path[:])  # ask 4,5,6: path
    for i in range(start, len(items)):
        path.append(items[i])
        go(i + 1, items)
        path.pop()

go(0, [1, 2, 3])
print(out)`,
      note: `After <code>[1, 2, 3]</code> the 3 is popped, then the 2 is popped, and the loop one level up moves on to 3, giving <code>[1, 3]</code>. The pops are what let the next branch start from the right state. Every call is a node of the choice tree, and every node is a subset.`,
    },
    {
      id: "w2", kind: "walk", title: "Skip repeats at the same level",
      prompt: `<code>[1, 2, 2]</code> sorted. At each level, a value is tried once: a second 2 is skipped if it's not the first choice <em>at this level</em> (<code>i &gt; start</code>). Each question comes when a skip happens.`,
      code: `def unique_subsets(nums):
    nums.sort()
    out, path = [], []
    def go(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue  # ask: (start, i, path)
            path.append(nums[i])
            go(i + 1)
            path.pop()
    go(0)
    return out

print(unique_subsets([1, 2, 2]))`,
      note: `Both skips happen after a 2 was already tried at that level (once below [1], once at the top). The second 2 still gets used one level deeper, as in <code>[2, 2]</code>, because there it's the first choice (<code>i == start</code>). With <code>i &gt; 0</code> instead, <code>[2, 2]</code> would be lost (Break it b1).`,
    },
    {
      id: "w3", kind: "walk", title: "Prune with break",
      prompt: `Make 7 from <code>[2, 3, 5]</code>, reusing parts. Parts are sorted, so once a part is bigger than what's <code>left</code>, every later part is too, and the whole rest of the loop is cut.`,
      code: `def make_total(parts, total):
    parts.sort()
    out, path = [], []
    def go(start, left):
        if left == 0:
            out.append(path[:])
            return
        for i in range(start, len(parts)):
            if parts[i] > left:
                break  # ask 1,2,3: (path, left, parts[i])
            path.append(parts[i])
            go(i, left - parts[i])
            path.pop()
    go(0, total)
    return out

print(make_total([2, 3, 5], 7))`,
      note: `Each <code>break</code> cuts a whole subtree before it's visited, which is where backtracking's speed comes from. <code>go(i, …)</code> lets a part repeat but never goes back to an earlier one, so <code>[2, 5]</code> and <code>[5, 2]</code> can't both appear.`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "Skip with i > 0",
      prompt: `Distinct subsets of a list with repeats, but the skip test is <code>i &gt; 0</code> instead of <code>i &gt; start</code>. Find a list where a subset goes missing.`,
      fn: "unique_subsets", args: "nums",
      code: `def unique_subsets(nums):
    nums = sorted(nums)
    out, path = [], []
    def go(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            path.append(nums[i])
            go(i + 1)
            path.pop()
    go(0)
    return sorted(out)`,
      ref: "right",
      right: `def right(nums):
    from itertools import combinations
    s = sorted(nums)
    return sorted(list(c) for c in {c for r in range(len(s) + 1) for c in combinations(s, r)})`,
      valid: `lambda nums: (isinstance(nums, list) and len(nums) <= 6 and all(type(x) is int and 0 <= x <= 9 for x in nums)) or "a list of up to 6 whole numbers from 0 to 9."`,
      rules: `a list of up to 6 whole numbers from 0 to 9.`,
      example: `[2, 2]`,
      explain: `At the level below <code>[2]</code>, the second 2 is the <em>first</em> choice there, and it should be allowed. <code>i &gt; 0</code> skips it anyway, because it only checks the value before it, not whether that value was tried at this level. So <code>[2, 2]</code> is never built.`,
    },
    {
      id: "b2", kind: "breakit", title: "A missing undo",
      prompt: `All orderings with a <code>used</code> list, but <code>used[i]</code> is never set back to False. Find a list where orderings go missing.`,
      fn: "orderings", args: "items",
      code: `def orderings(items):
    out, path = [], []
    used = [False] * len(items)
    def go():
        if len(path) == len(items):
            out.append(path[:])
            return
        for i in range(len(items)):
            if used[i]:
                continue
            used[i] = True
            path.append(items[i])
            go()
            path.pop()
    go()
    return sorted(out)`,
      ref: "right",
      right: `def right(items):
    from itertools import permutations
    return sorted(list(p) for p in permutations(items))`,
      valid: `lambda items: (isinstance(items, list) and len(items) <= 5 and len(set(items)) == len(items) and all(type(x) is int for x in items)) or "up to 5 different whole numbers."`,
      rules: `up to 5 different whole numbers.`,
      example: `[1, 2]`,
      explain: `The path is undone but <code>used</code> isn't, so after the first ordering every item stays marked used and no other branch can start. Every piece of state you change on the way down needs its own undo on the way up.`,
    },
    {
      id: "b3", kind: "breakit", title: "A cell never restored",
      prompt: `Count paths from the top-left to the bottom-right of a grid without revisiting a cell. The cell is marked <code>"#"</code> while the path is on it, but never set back. Find a grid where it undercounts.`,
      fn: "count_paths", args: "grid",
      code: `def count_paths(grid):
    rows, cols = len(grid), len(grid[0])
    def go(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != ".":
            return 0
        if (r, c) == (rows - 1, cols - 1):
            return 1
        grid[r][c] = "#"
        return go(r + 1, c) + go(r - 1, c) + go(r, c + 1) + go(r, c - 1)
    return go(0, 0)`,
      ref: "right",
      right: `def right(grid):
    rows, cols = len(grid), len(grid[0])
    def go(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != ".":
            return 0
        if (r, c) == (rows - 1, cols - 1):
            return 1
        grid[r][c] = "#"
        total = go(r + 1, c) + go(r - 1, c) + go(r, c + 1) + go(r, c - 1)
        grid[r][c] = "."
        return total
    return go(0, 0)`,
      valid: `lambda g: (isinstance(g, list) and 1 <= len(g) <= 3 and all(isinstance(row, list) and len(row) == len(g[0]) and 1 <= len(row) <= 3 and all(c in (".", "#") for c in row) for row in g)) or "a grid of 1 to 3 rows and 1 to 3 columns of \\".\\" and \\"#\\"."`,
      rules: `1–3 rows and 1–3 columns of <code>"."</code> and <code>"#"</code>.`,
      example: `[[".", ".", "."], [".", ".", "."]]`,
      explain: `The first path to finish leaves its cells marked, so later paths that need the middle cells find them blocked. (In a 2 × 2 grid the two paths share no cell that needs restoring, so it survives that one.) That's right for "can I reach it?" (dicti's grid search) and wrong for "how many paths?": here each path needs the cells back.`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "All subsets (loop from start)",
      fn: "subsets", sig: "subsets(items: list) -> list[list]", mode: "groups",
      prompt: `Return every subset of <code>items</code> (distinct values). Record at <b>every</b> call, then loop over the items from <code>start</code>. Order doesn't matter.`,
      cases: `[
        (([1, 2, 3],), [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]),
        (([],), [[]]),
        ((["a"],), [[], ["a"]]),
      ]`,
      mustUse: [{ re: "\\.pop\\(", msg: "Share one path and pop() to undo." }],
      solution: `def subsets(items):
    out, path = [], []
    def go(start):
        out.append(path[:])
        for i in range(start, len(items)):
            path.append(items[i])
            go(i + 1)
            path.pop()
    go(0)
    return out`,
      note: `Each call is one node of the choice tree, and every node is a subset, so recording happens before the loop with no condition at all.`,
    },
    {
      id: "r2", kind: "rep", title: "All subsets (take or skip)",
      fn: "subsets_bin", sig: "subsets_bin(items: list) -> list[list]", mode: "groups",
      prompt: `Same output, other tree: each call decides one item, <b>take it</b> or <b>skip it</b>, with two recursive calls and no loop. Record only once every item has been decided.`,
      cases: `[
        (([1, 2, 3],), [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]),
        (([],), [[]]),
        (([7, 8],), [[], [7], [7, 8], [8]]),
      ]`,
      mustNot: [{ re: "\\bfor\\b", msg: "No for loop: two calls, take then skip." }],
      solution: `def subsets_bin(items):
    out, path = [], []
    def go(i):
        if i == len(items):
            out.append(path[:])
            return
        path.append(items[i])
        go(i + 1)
        path.pop()
        go(i + 1)
    go(0)
    return out`,
      note: `Same 2ⁿ results. Take/skip is the shape DP problems use (knapsack in lesson 12 is this with memo). The loop shape makes dedup and pruning easier.`,
    },
    {
      id: "r3", kind: "rep", title: "Pick k (prune what can't fit)",
      fn: "pick_k", sig: "pick_k(items: list, k: int) -> list[list]",
      adapt: "lambda f, items, k: (lambda r: len(r) if len(items) > 10 else sorted(sorted(c) for c in r))(f(items, k))",
      prompt: `Return every group of exactly <code>k</code> items. Stop a branch as soon as there aren't enough items left to reach <code>k</code>. The last test (26 items, k = 25) times out without that cut. It only checks how many groups you return.`,
      cases: `[
        (([1, 2, 3, 4], 2), [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]),
        (([1, 2], 3), []),
        (([1, 2, 3], 0), [[]]),
        (([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], 25), 26),
      ]`,
      solution: `def pick_k(items, k):
    out, path = [], []
    def go(start):
        if len(path) == k:
            out.append(path[:])
            return
        for i in range(start, len(items)):
            if len(path) + len(items) - i < k:
                break
            path.append(items[i])
            go(i + 1)
            path.pop()
    go(0)
    return out`,
      note: `Without the cut, the search visits every subset of size ≤ 25: about 67 million calls to find 26 answers. <code>break</code>, not <code>continue</code>: later <code>i</code> leave even fewer items.`,
    },
    {
      id: "r4", kind: "rep", title: "All orderings (used list)",
      fn: "orderings", sig: "orderings(items: list) -> list[list]", mode: "sorted",
      prompt: `Return every ordering of <code>items</code> (distinct values). Each call may pick <b>any</b> item not yet used, so it loops from 0 and keeps a <code>used</code> list, set before recursing and cleared after.`,
      cases: `[
        (([1, 2, 3],), [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]),
        (([],), [[]]),
        ((["x", "y"],), [["x", "y"], ["y", "x"]]),
      ]`,
      mustUse: [{ re: "used", msg: "Keep a used list." }],
      solution: `def orderings(items):
    out, path = [], []
    used = [False] * len(items)
    def go():
        if len(path) == len(items):
            out.append(path[:])
            return
        for i in range(len(items)):
            if used[i]:
                continue
            used[i] = True
            path.append(items[i])
            go()
            path.pop()
            used[i] = False
    go()
    return out`,
      note: `Two pieces of state, so two undos. A set of used <em>values</em> works for distinct items, but indexes still work once values repeat (p3).`,
    },
    {
      id: "r5", kind: "rep", title: "Make a total (reuse allowed)",
      fn: "make_total", sig: "make_total(parts: list[int], total: int) -> list[list[int]]", mode: "groups",
      prompt: `<code>parts</code> are distinct positive ints, and each may be used <b>any number of times</b>. Return every multiset that sums to <code>total</code>, each once. Sort first, so you can <code>break</code> when a part is too big.`,
      cases: `[
        (([2, 3, 5], 8), [[2, 2, 2, 2], [2, 3, 3], [3, 5]]),
        (([2], 1), []),
        (([3, 2], 6), [[2, 2, 2], [3, 3]]),
        (([4], 0), [[]]),
      ]`,
      mustUse: [{ re: "break", msg: "Sort, then break once a part is bigger than what's left." }],
      solution: `def make_total(parts, total):
    parts = sorted(parts)
    out, path = [], []
    def go(start, left):
        if left == 0:
            out.append(path[:])
            return
        for i in range(start, len(parts)):
            if parts[i] > left:
                break
            path.append(parts[i])
            go(i, left - parts[i])
            path.pop()
    go(0, total)
    return out`,
      note: `<code>go(i, …)</code>, not <code>go(i + 1, …)</code>: the same part may come again. It still never goes <em>back</em> to an earlier part, which is why [2, 3, 3] and [3, 2, 3] can't both appear.`,
    },
    {
      id: "r6", kind: "rep", title: "Subsets of a list with repeats",
      fn: "unique_subsets", sig: "unique_subsets(items: list[int]) -> list[list[int]]", mode: "groups",
      prompt: `<code>items</code> may repeat values. Return every <b>distinct</b> subset once. Sort, then skip a value equal to the one before it <em>at the same level</em>.`,
      cases: `[
        (([1, 2, 2],), [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]),
        (([2, 2, 2],), [[], [2], [2, 2], [2, 2, 2]]),
        (([],), [[]]),
        (([3, 1, 3],), [[], [1], [1, 3], [1, 3, 3], [3], [3, 3]]),
      ]`,
      mustUse: [{ re: "sort", msg: "Sort first, so equal values sit next to each other." }],
      mustNot: [{ re: "set\\(|tuple\\(", msg: "No set of tuples to dedup afterwards: skip duplicates while searching." }],
      solution: `def unique_subsets(items):
    nums = sorted(items)
    out, path = [], []
    def go(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            path.append(nums[i])
            go(i + 1)
            path.pop()
    go(0)
    return out`,
      note: `<code>i &gt; start</code>: the first copy at each level always gets tried, so [2, 2] still happens (the second 2 is taken one level deeper, where it's first).`,
    },
    {
      id: "r7", kind: "rep", title: "Count grid paths (mark, unmark)",
      fn: "count_paths", sig: "count_paths(grid: list[list[str]]) -> int",
      prompt: `<code>"."</code> is open, <code>"#"</code> is a wall. Count the paths from the top-left to the bottom-right cell that move up, down, left or right and never visit a cell twice. Mark the cell in the grid itself before recursing and restore it after. No <code>visited</code> set.`,
      cases: `[
        (([[".", "."], [".", "."]],), 2),
        (([[".", "#"], [".", "."]],), 1),
        (([["."]],), 1),
        (([["#"]],), 0),
        (([[".", ".", "."], [".", ".", "."], [".", ".", "."]],), 12),
      ]`,
      mustNot: [{ re: "visited|seen", msg: "Mark the grid cell itself, then restore it." }],
      solution: `def count_paths(grid):
    rows, cols = len(grid), len(grid[0])
    def go(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != ".":
            return 0
        if (r, c) == (rows - 1, cols - 1):
            return 1
        grid[r][c] = "#"
        total = go(r + 1, c) + go(r - 1, c) + go(r, c + 1) + go(r, c - 1)
        grid[r][c] = "."
        return total
    return go(0, 0)`,
      note: `This is not dicti's grid DFS. There, a visited cell stays visited, because each cell needs reaching only once. Here each <em>path</em> is separate, so the cell is freed on the way back. Forget the restore and you count one path.`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "Recording without a copy",
      code: `out, path = [], []
def go(start, items):
    out.append(path)
    for i in range(start, len(items)):
        path.append(items[i])
        go(i + 1, items)
        path.pop()

go(0, [1, 2])
print(out)`,
      explain: `Four subsets were recorded, but all four entries are <em>the same list</em>, and every <code>pop()</code> has run by the end, so it's empty. <code>path[:]</code> takes a copy at that moment.`,
    },
    {
      id: "d2", kind: "predict", title: "start + 1 vs i + 1",
      code: `out, path = [], []
items = [1, 2, 3]
def go(start):
    if len(path) == 2:
        out.append(path[:])
        return
    for i in range(start, len(items)):
        path.append(items[i])
        go(start + 1)
        path.pop()

go(0)
print(out)`,
      explain: `The next level should start after the item just taken (<code>i + 1</code>). With <code>start + 1</code>, every first choice restarts the second level at index 1. You get [2, 2], [3, 3] and both orders of 2 and 3, instead of the three pairs.`,
    },
    {
      id: "d3", kind: "predict", title: "The undo that wasn't",
      code: `out, path = [], []
items = [1, 2, 3]
used = [False] * 3
def go():
    if len(path) == 3:
        out.append(path[:])
        return
    for i in range(3):
        if used[i]:
            continue
        used[i] = True
        path.append(items[i])
        go()
        path.pop()

go()
print(out)`,
      explain: `<code>path</code> is undone but <code>used</code> isn't, so after the first ordering every item still looks taken and no other branch gets past the check. Undo every piece of state you changed.`,
    },
    {
      id: "d4", kind: "predict", title: "Strings carry their own undo",
      code: `out = []
def go(s, n):
    if len(s) == n:
        out.append(s)
        return
    go(s + "a", n)
    go(s + "b", n)

go("", 2)
print(out)`,
      explain: `It works, with no pop and no copy. <code>s + "a"</code> makes a new string, so the caller's <code>s</code> never changed and there's nothing to undo. Strings and tuples passed as arguments give you this for free, at O(n) per step.`,
    },
    {
      id: "d5", kind: "predict", title: "i > 0 vs i > start",
      code: `nums = [1, 1]
out, path = [], []
def go(start):
    out.append(path[:])
    for i in range(start, len(nums)):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        path.append(nums[i])
        go(i + 1)
        path.pop()

go(0)
print(out)`,
      explain: `<code>[1, 1]</code> is missing. One level down, <code>start</code> is 1 and the second 1 is that level's <em>first</em> choice, but <code>i &gt; 0</code> skips it anyway. <code>i &gt; start</code> skips only repeats at the same level.`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "Generate parentheses", leetcode: 22,
      fn: "generate_parens", mode: "sorted",
      prompt: `Return every string of <code>n</code> pairs of balanced parentheses. Never build an unbalanced prefix in the first place: decide what may come next from how many you've opened and closed.`,
      stub: `def generate_parens(n):
    `,
      cases: `[
        ((3,), ["((()))", "(()())", "(())()", "()(())", "()()()"]),
        ((1,), ["()"]),
        ((2,), ["(())", "()()"]),
      ]`,
      solution: `def generate_parens(n):
    out = []
    def go(s, opened, closed):
        if len(s) == 2 * n:
            out.append(s)
            return
        if opened < n:
            go(s + "(", opened + 1, closed)
        if closed < opened:
            go(s + ")", opened, closed + 1)
    go("", 0, 0)
    return out`,
      note: `Two rules prune everything invalid: open while you have some left, close only what's open. A string argument means no undo (d4).`,
    },
    {
      id: "p2", kind: "problem", title: "Combination sum II", leetcode: 40,
      fn: "combination_sum2", mode: "groups",
      prompt: `<code>candidates</code> may repeat values. Each <em>element</em> can be used once. Return every distinct combination summing to <code>target</code>. The last test has 27 ones, so dedup has to happen while you search.`,
      stub: `def combination_sum2(candidates, target):
    `,
      cases: `[
        (([10, 1, 2, 7, 6, 1, 5], 8), [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]),
        (([2, 5, 2, 1, 2], 5), [[1, 2, 2], [5]]),
        (([3], 2), []),
        (([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 27), [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]),
      ]`,
      solution: `def combination_sum2(candidates, target):
    nums = sorted(candidates)
    out, path = [], []
    def go(start, left):
        if left == 0:
            out.append(path[:])
            return
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            if nums[i] > left:
                break
            path.append(nums[i])
            go(i + 1, left - nums[i])
            path.pop()
    go(0, target)
    return out`,
      note: `r5 (sum target + break) plus r6 (skip repeats at a level), with <code>i + 1</code> because each element is used once. Collecting into a set of tuples would also give the right output, but it still makes all 2²⁷ calls first.`,
    },
    {
      id: "p3", kind: "problem", title: "Orderings with repeats", leetcode: 47,
      fn: "permute_unique", mode: "sorted",
      prompt: `<code>nums</code> may repeat values. Return every <b>distinct</b> ordering once.`,
      stub: `def permute_unique(nums):
    `,
      cases: `[
        (([1, 1, 2],), [[1, 1, 2], [1, 2, 1], [2, 1, 1]]),
        (([1, 2, 3],), [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]),
        (([2, 2],), [[2, 2]]),
        (([],), [[]]),
      ]`,
      solution: `def permute_unique(nums):
    nums = sorted(nums)
    out, path = [], []
    used = [False] * len(nums)
    def go():
        if len(path) == len(nums):
            out.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue
            used[i] = True
            path.append(nums[i])
            go()
            path.pop()
            used[i] = False
    go()
    return out`,
      note: `Equal values must be used left to right. A repeat whose twin isn't in the path yet would start the same branch twice, so it waits. Another way: loop over a <code>Counter</code>'s keys and decrement, so repeats can't arise at all.`,
    },
    {
      id: "p4", kind: "problem", title: "Palindrome partitioning", leetcode: 131,
      fn: "partition", mode: "sorted",
      prompt: `Cut <code>s</code> into pieces that are all palindromes. Return every way to do it, as lists of pieces.`,
      stub: `def partition(s):
    `,
      cases: `[
        (("aab",), [["a", "a", "b"], ["aa", "b"]]),
        (("a",), [["a"]]),
        (("aba",), [["a", "b", "a"], ["aba"]]),
        (("abba",), [["a", "b", "b", "a"], ["a", "bb", "a"], ["abba"]]),
      ]`,
      solution: `def partition(s):
    out, path = [], []
    def go(start):
        if start == len(s):
            out.append(path[:])
            return
        for end in range(start + 1, len(s) + 1):
            piece = s[start:end]
            if piece == piece[::-1]:
                path.append(piece)
                go(end)
                path.pop()
    go(0)
    return out`,
      note: `The choice is where the next piece <em>ends</em>. The palindrome test is the prune. Follow-up: precompute <code>is_pal[i][j]</code> with DP so each check is O(1).`,
    },
    {
      id: "p5", kind: "problem", title: "Word search", leetcode: 79,
      fn: "exist",
      prompt: `Can <code>word</code> be spelled by a path of adjacent cells (up, down, left, right), using each cell at most once? Mark cells in the board as you go and restore them.`,
      stub: `def exist(board, word):
    `,
      cases: `[
        (([["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "ABCCED"), True),
        (([["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "SEE"), True),
        (([["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "ABCB"), False),
        (([["a"]], "a"), True),
        (([["a", "a"]], "aaa"), False),
      ]`,
      solution: `def exist(board, word):
    rows, cols = len(board), len(board[0])
    def go(r, c, i):
        if i == len(word):
            return True
        if r < 0 or c < 0 or r >= rows or c >= cols or board[r][c] != word[i]:
            return False
        board[r][c] = "#"
        found = go(r + 1, c, i + 1) or go(r - 1, c, i + 1) or go(r, c + 1, i + 1) or go(r, c - 1, i + 1)
        board[r][c] = word[i]
        return found
    return any(go(r, c, 0) for r in range(rows) for c in range(cols))`,
      note: `r7 with a bool: <code>or</code> stops at the first success. Restore <em>before</em> returning, even on success, if anyone will reuse the board. Follow-up for 212 (many words): a trie from dicti's lesson 11.`,
    },
    {
      id: "p6", kind: "problem", title: "N-Queens", leetcode: 51,
      fn: "solve_n_queens",
      adapt: "lambda f, n: sorted(f(n)) if n < 6 else len(f(n))",
      prompt: `Place <code>n</code> queens on an n×n board so that none share a row, column or diagonal. Return every board as a list of strings (<code>"Q"</code> and <code>"."</code>). One queen per row, so each call picks a column. Check conflicts in O(1). The 8×8 test only counts the boards.`,
      stub: `def solve_n_queens(n):
    `,
      cases: `[
        ((4,), [["..Q.", "Q...", "...Q", ".Q.."], [".Q..", "...Q", "Q...", "..Q."]]),
        ((1,), [["Q"]]),
        ((3,), []),
        ((8,), 92),
      ]`,
      solution: `def solve_n_queens(n):
    out, queens = [], []
    cols, diag, anti = set(), set(), set()
    def go(r):
        if r == n:
            out.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
            return
        for c in range(n):
            if c in cols or r - c in diag or r + c in anti:
                continue
            cols.add(c)
            diag.add(r - c)
            anti.add(r + c)
            queens.append(c)
            go(r + 1)
            cols.remove(c)
            diag.remove(r - c)
            anti.remove(r + c)
            queens.pop()
    go(0)
    return out`,
      note: `Cells on one ↘ diagonal share <code>r - c</code>, and on one ↙ diagonal share <code>r + c</code>. Four pieces of state, four undos.`,
    },
    {
      id: "p7", kind: "problem", title: "Split into k equal sums", leetcode: 698,
      fn: "can_partition_k",
      prompt: `Can <code>nums</code> (positive ints) be split into <code>k</code> groups with equal sums? Place each number into one of k buckets. Prune hard: try big numbers first, and never try two buckets that hold the same sum (they lead to the same subtree).`,
      stub: `def can_partition_k(nums, k):
    `,
      cases: `[
        (([4, 3, 2, 3, 5, 2, 1], 4), True),
        (([1, 2, 3, 4], 3), False),
        (([2, 2, 2, 2, 3, 4, 5], 4), False),
        (([10, 10, 10, 7, 7, 7, 7, 7, 7, 6, 6, 6], 3), True),
        (([3, 3, 10, 2, 6, 5, 10, 6, 8, 3, 2, 1, 6, 10, 7, 2], 6), False),
      ]`,
      solution: `def can_partition_k(nums, k):
    total = sum(nums)
    if total % k:
        return False
    target = total // k
    nums = sorted(nums, reverse=True)
    if nums[0] > target:
        return False
    buckets = [0] * k
    def go(i):
        if i == len(nums):
            return True
        tried = set()
        for b in range(k):
            if buckets[b] + nums[i] > target or buckets[b] in tried:
                continue
            tried.add(buckets[b])
            buckets[b] += nums[i]
            if go(i + 1):
                return True
            buckets[b] -= nums[i]
        return False
    return go(0)`,
      note: `Three cuts do the work: the sum check before searching, biggest numbers first (they fail sooner), and <code>tried</code>, which stops the search from trying the same arrangement k! ways. Follow-up: bitmask DP over used numbers (lesson 12).`,
    },
  ],

  fromBlank: ["r1", "r4", "r6", "r7", "p2", "p3", "p6"],

  leetcode: [
    { n: 78, title: "Subsets", slug: "subsets" },
    { n: 90, title: "Subsets II", slug: "subsets-ii" },
    { n: 77, title: "Combinations", slug: "combinations" },
    { n: 46, title: "Permutations", slug: "permutations" },
    { n: 47, title: "Permutations II", slug: "permutations-ii" },
    { n: 39, title: "Combination Sum", slug: "combination-sum" },
    { n: 40, title: "Combination Sum II", slug: "combination-sum-ii" },
    { n: 17, title: "Letter Combinations of a Phone Number", slug: "letter-combinations-of-a-phone-number" },
    { n: 22, title: "Generate Parentheses", slug: "generate-parentheses" },
    { n: 131, title: "Palindrome Partitioning", slug: "palindrome-partitioning" },
    { n: 79, title: "Word Search", slug: "word-search" },
    { n: 51, title: "N-Queens", slug: "n-queens" },
    { n: 698, title: "Partition to K Equal Sum Subsets", slug: "partition-to-k-equal-sum-subsets" },
    { n: 37, title: "Sudoku Solver", slug: "sudoku-solver" },
  ],
});
