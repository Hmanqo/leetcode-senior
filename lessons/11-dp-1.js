COURSE.lesson({
  id: "11",
  title: "DP 1: recursion to table",
  tagline: "Name the state, write the recursion, @cache it, then turn it into a table filled in the right order, and shrink the table if you can.",

  intro: `
<p>Dynamic programming is recursion that asks the same question many times. If you answer each question once and
remember it, exponential time becomes <b>(number of distinct questions) × (work per question)</b>. Don't start from
the table. Start from the recursion, because that's where the thinking is, and convert it mechanically.</p>

<h3>The four steps</h3>
<ol>
<li><b>Name the state.</b> "<code>f(i)</code> = the best answer for the items from i onwards" (or the first i). The state
is exactly what the rest of the problem needs to know, and nothing more.</li>
<li><b>Write the recursion:</b> the choices at state i, each leading to a smaller state, plus base cases. This is the
lesson 10 tree, except it returns a value instead of listing paths.</li>
<li><b>Add <code>@cache</code>.</b> Same arguments, same answer, so it's stored. That is a working DP solution, and often
the one to write first in an interview.</li>
<li><b>Turn it into a table</b> when asked (or when the recursion is too deep): one cell per state, filled in an order
where every cell's inputs are already filled. Then keep only the rows you still read.</li>
</ol>

<h3>One problem, all four forms</h3>
<pre><code># 1. recursion: ways to climb n stairs taking 1 or 2 at a time
def ways(n):
    if n &lt;= 1: return 1
    return ways(n - 1) + ways(n - 2)          # O(2ⁿ)

# 2. memo: the same, plus @cache from functools  # O(n)

# 3. table: dp[i] needs dp[i-1] and dp[i-2], so fill left to right
dp = [1, 1] + [0] * (n - 1)
for i in range(2, n + 1):
    dp[i] = dp[i - 1] + dp[i - 2]

# 4. rolling: only the last two are ever read
a, b = 1, 1
for _ in range(n - 1):
    a, b = b, a + b</code></pre>
<span class="trees"><span class="tree" data-ntree="['ways(5)', [['ways(4)', [['ways(3)', [['ways(2)', [['ways(1)'], ['ways(0)']]], ['*ways(1)']]], ['*ways(2)', [['~ways(1)'], ['~ways(0)']]]]], ['*ways(3)', [['~ways(2)', [['~ways(1)'], ['~ways(0)']]], ['~ways(1)']]]]]" data-cap="ways(5) as plain recursion. Blue calls were already worked out once, and dashed ones are the repeated work under them. @cache turns each blue call into a lookup."></span><span class="arr" data-arr="[1, 1, 2, 3, 5, 8]" data-hl="5" data-win="3,4" data-ptr="3:i-2,4:i-1,5:i" data-cap="The table: each cell reads the two before it."></span></span>

<h3>Common states</h3>
<table>
<thead><tr><th>Input</th><th>State</th><th>Examples</th></tr></thead>
<tbody>
<tr><td>one list</td><td><code>f(i)</code>: answer using items from i (or up to i)</td><td>198, 300, 139</td></tr>
<tr><td>a target amount</td><td><code>f(amount)</code></td><td>322, 377</td></tr>
<tr><td>a grid</td><td><code>f(r, c)</code></td><td>62, 64</td></tr>
<tr><td>two strings</td><td><code>f(i, j)</code>: answer for the first i of one and first j of the other</td><td>1143, 72</td></tr>
</tbody>
</table>

<h3>Traps</h3>
<ol>
<li><b>A greedy shortcut.</b> "Take every other house", "biggest coin first". DP exists because those break (Break it b1, and lesson 09).</li>
<li><b>A state that's missing something.</b> If the right choice depends on more than the arguments, the cache returns wrong answers (b2). Ask: "could two paths reach this state needing different answers?"</li>
<li><b>Filling the table in the wrong order.</b> A cell read before it's written is still its default (b3).</li>
<li><b>Lists as <code>@cache</code> arguments.</b> Unhashable (predict d1): pass an index instead of a slice.</li>
<li><b><code>[[0] * n] * m</code>.</b> Every row is the same list (predict d3). Use a comprehension.</li>
<li><b>Recursion depth.</b> Python stops at about 1000 frames. Say so, and offer the table.</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>Complexity:</b> states × choices per state. Say both numbers.</li>
<li><b>"Can you do better on space?"</b> If row i only reads row i − 1, keep two rows (or one, filled in the right direction).</li>
<li><b>"Return the actual solution, not just its size."</b> Store the choice at each state, or walk back through the table comparing neighbours.</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "A memo filling up",
      prompt: `<code>f(n) = f(n−1) + f(n−2)</code>, with a dict remembering every answer. Watch the stack dive down to <code>f(1)</code> once, then watch every second call return straight from the memo.`,
      code: `memo = {}

def f(n):
    if n <= 1:
        return n
    if n in memo:
        return memo[n]  # ask 1,2: memo
    memo[n] = f(n - 1) + f(n - 2)
    return memo[n]

print(f(6))`,
      note: `Without the memo, <code>f(6)</code> makes 25 calls, and <code>f(40)</code> over 300 million. With it, each n is computed once: O(n). <code>@cache</code> from functools is exactly this dict, written for you.`,
    },
    {
      id: "w2", kind: "walk", title: "The same thing as a table",
      prompt: `Ways to climb 6 stairs taking 1 or 2 at a time. <code>dp[i]</code> needs <code>dp[i − 1]</code> and <code>dp[i − 2]</code>, so filling left to right means both are ready in time.`,
      code: `def ways(n):
    dp = [0] * (n + 1)
    dp[0] = dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]  # ask 3,5: dp
    return dp[n]

print(ways(6))`,
      note: `Same recurrence as w1, but nothing is recursive: no stack, no depth limit. Only the last two cells are ever read, which is why <code>a, b = b, a + b</code> (O(1) space) is the final form.`,
    },
    {
      id: "w3", kind: "walk", title: "A 2D table, row by row",
      prompt: `Paths from the top-left to the bottom-right of a 3 × 4 grid moving only right or down. Each cell is (paths from above) + (paths from the left). One row is enough: before the update, <code>row[c]</code> still holds the cell above.`,
      code: `def grid_paths(rows, cols):
    row = [1] * cols
    for r in range(1, rows):
        for c in range(1, cols):
            row[c] = row[c] + row[c - 1]
        print(row)  # ask: row
    return row[-1]

print(grid_paths(3, 4))`,
      note: `<code>row[c]</code> on the right side is the old value (from the row above), and <code>row[c − 1]</code> was already updated this row (the cell to the left). Filling left to right is exactly what makes one list do the work of the whole table.`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "Every other house",
      prompt: `Rob houses in a row without taking two neighbours, maximising the total. This shortcut takes either all the even-numbered houses or all the odd ones, whichever is more. Find houses where that's not the best.`,
      fn: "rob", args: "houses",
      code: `def rob(houses):
    return max(sum(houses[0::2]), sum(houses[1::2]))`,
      ref: "right",
      right: `def right(houses):
    take, skip = 0, 0
    for x in houses:
        take, skip = skip + x, max(take, skip)
    return max(take, skip)`,
      valid: `lambda h: (isinstance(h, list) and 1 <= len(h) <= 8 and all(type(x) is int and 0 <= x <= 9 for x in h)) or "a list of 1 to 8 whole numbers from 0 to 9."`,
      rules: `a list of 1–8 whole numbers from 0 to 9.`,
      example: `[2, 1, 1, 2]`,
      explain: `The best plan takes the first and last houses, skipping <em>two</em> in between, which neither pattern can do. The real choice at each house is "take it (and the best up to two back)" or "skip it (best up to one back)": <code>f(i) = max(f(i − 1), f(i − 2) + x)</code>.`,
    },
    {
      id: "b2", kind: "breakit", title: "A state that forgets",
      prompt: `This should return the longest increasing <b>subsequence</b> (items needn't be neighbours). It uses <code>dp[i]</code> = "length ending at i", but only looks at the item right before i. Find a list where that's wrong.`,
      fn: "lis", args: "nums",
      code: `def lis(nums):
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        if nums[i] > nums[i - 1]:
            dp[i] = dp[i - 1] + 1
    return max(dp)`,
      ref: "right",
      right: `def right(nums):
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
      valid: `lambda nums: (isinstance(nums, list) and 1 <= len(nums) <= 8 and all(type(x) is int and 0 <= x <= 9 for x in nums)) or "a list of 1 to 8 whole numbers from 0 to 9."`,
      rules: `a list of 1–8 whole numbers from 0 to 9.`,
      example: `[1, 3, 2, 4]`,
      explain: `That's the longest increasing <em>run</em>. A subsequence ending at the 4 can come from the 3 <em>or</em> the 2, or anything earlier and smaller, so <code>dp[i]</code> must look back at every <code>j &lt; i</code>. The state was right, but the transition left out choices.`,
    },
    {
      id: "b3", kind: "breakit", title: "Filling the table backwards",
      prompt: `Fewest coins to make an amount. The recurrence is right, <code>dp[a] = 1 + min(dp[a − c])</code>, but the loop fills the amounts from the top down. Find an input where it's wrong.`,
      fn: "fewest", args: "coins, amount",
      code: `def fewest(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount
    for a in range(amount, 0, -1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] < INF else -1`,
      ref: "right",
      right: `def right(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] < INF else -1`,
      valid: `lambda coins, amount: (isinstance(coins, list) and 1 <= len(coins) <= 5 and all(type(c) is int and 1 <= c <= 20 for c in coins) and type(amount) is int and 0 <= amount <= 50) or "coins: 1 to 5 whole numbers from 1 to 20; amount: 0 to 50."`,
      rules: `<code>coins</code>: 1–5 whole numbers from 1 to 20. <code>amount</code>: 0 to 50.`,
      example: `[1, 2], 3`,
      explain: `<code>dp[3]</code> reads <code>dp[2]</code> and <code>dp[1]</code>, which are still ∞ because they're filled later. Only amounts a single coin makes exactly (reading <code>dp[0]</code>) come out right. Before filling a table, list what each cell reads, and fill those first.`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "Memoised recursion", leetcode: 509,
      fn: "fib", sig: "fib(n: int) -> int",
      prompt: `Return the n-th Fibonacci number (<code>fib(0) = 0</code>, <code>fib(1) = 1</code>) as plain recursion with <code>@cache</code> on it. The last test is too slow without the cache.`,
      cases: `[
        ((0,), 0),
        ((1,), 1),
        ((10,), 55),
        ((80,), 23416728348467685),
      ]`,
      mustUse: [{ re: "cache", msg: "Use @cache (or @lru_cache) from functools." }],
      solution: `from functools import cache

@cache
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`,
      note: `Step 3 of 4 is one decorator. In an interview, write the recursion, add <code>@cache</code>, and state the complexity: n states × O(1) work each.`,
    },
    {
      id: "r2", kind: "rep", title: "Climbing stairs as a table", leetcode: 70,
      fn: "ways", sig: "ways(n: int) -> int",
      prompt: `Ways to climb <code>n</code> stairs taking 1 or 2 at a time (n ≥ 0, and 0 stairs is 1 way). Build the table <code>dp[0..n]</code> left to right: no recursion.`,
      cases: `[
        ((0,), 1),
        ((1,), 1),
        ((2,), 2),
        ((5,), 8),
        ((45,), 1836311903),
      ]`,
      mustNot: [{ re: "def ways[\\s\\S]*\\bways\\(", msg: "A table, no recursion." }],
      solution: `def ways(n):
    dp = [1] * (n + 1)
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
      note: `<code>n + 1</code> cells, because the states are 0 … n. Off-by-one in the table size is the commonest table bug. Name the state first ("dp[i] = ways to reach stair i") and the size follows.`,
    },
    {
      id: "r3", kind: "rep", title: "Grid paths, one row", leetcode: 62,
      fn: "grid_paths", sig: "grid_paths(rows: int, cols: int) -> int",
      prompt: `Count the paths from the top-left to the bottom-right corner moving only right or down. Use a single row: <code>row[c] += row[c − 1]</code>, left to right, once per row after the first.`,
      cases: `[
        ((3, 7), 28),
        ((3, 2), 3),
        ((1, 1), 1),
        ((10, 10), 48620),
      ]`,
      solution: `def grid_paths(rows, cols):
    row = [1] * cols
    for _ in range(1, rows):
        for c in range(1, cols):
            row[c] += row[c - 1]
    return row[-1]`,
      note: `The full table is <code>dp[r][c] = dp[r − 1][c] + dp[r][c − 1]</code>. Before the update, <code>row[c]</code> is the cell above, and <code>row[c − 1]</code> is already this row's left cell. Walk w3 shows it.`,
    },
    {
      id: "r4", kind: "rep", title: "Cheapest path through a grid", leetcode: 64,
      fn: "min_path", sig: "min_path(grid: list[list[int]]) -> int",
      prompt: `Each cell has a cost. Moving only right or down from the top-left to the bottom-right, return the smallest total (both corners count). Fill a table, or the grid itself, row by row.`,
      cases: `[
        (([[1, 3, 1], [1, 5, 1], [4, 2, 1]],), 7),
        (([[1, 2, 3], [4, 5, 6]],), 12),
        (([[5]],), 5),
        (([[1], [2], [3]],), 6),
      ]`,
      solution: `def min_path(grid):
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                dp[r][c] = grid[r][c]
            elif r == 0:
                dp[r][c] = dp[r][c - 1] + grid[r][c]
            elif c == 0:
                dp[r][c] = dp[r - 1][c] + grid[r][c]
            else:
                dp[r][c] = min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c]
    return dp[-1][-1]`,
      note: `The first row and column have only one way in, which is why they're special cases. <code>[[0] * cols for _ in range(rows)]</code>, never <code>[[0] * cols] * rows</code> (predict d3).`,
    },
    {
      id: "r5", kind: "rep", title: "Ordered ways to a total", leetcode: 377,
      fn: "ordered_ways", sig: "ordered_ways(parts: list[int], total: int) -> int",
      prompt: `Count the <b>sequences</b> of parts (reuse allowed, order matters: 1 + 2 and 2 + 1 are different) that add up to <code>total</code>. <code>dp[t] = sum of dp[t − p]</code> over every part p ≤ t, with <code>dp[0] = 1</code>.`,
      cases: `[
        (([1, 2, 3], 4), 7),
        (([9], 3), 0),
        (([1], 0), 1),
        (([2, 3], 7), 3),
      ]`,
      solution: `def ordered_ways(parts, total):
    dp = [1] + [0] * total
    for t in range(1, total + 1):
        for p in parts:
            if p <= t:
                dp[t] += dp[t - p]
    return dp[total]`,
      note: `The state is just "what's left", and the choice is the <em>last</em> part, so every order is counted. If 1 + 2 and 2 + 1 should count once, the loops swap: parts outside, totals inside. That's lesson 12's coin change II.`,
    },
    {
      id: "r6", kind: "rep", title: "Rolling variables", leetcode: 746,
      fn: "min_cost_climb", sig: "min_cost_climb(cost: list[int]) -> int",
      prompt: `<code>cost[i]</code> is paid when you step on stair i. You start on stair 0 or 1, climb 1 or 2 at a time, and finish just past the last stair. Return the least total. Keep only two variables: no list.`,
      cases: `[
        (([10, 15, 20],), 15),
        (([1, 100, 1, 1, 1, 100, 1, 1, 100, 1],), 6),
        (([0, 0],), 0),
        (([5, 1],), 1),
      ]`,
      mustNot: [{ re: "\\[\\s*0\\s*\\]\\s*\\*|append|\\[\\s*\\]", msg: "Two rolling variables: no list." }],
      solution: `def min_cost_climb(cost):
    a, b = 0, 0
    for i in range(2, len(cost) + 1):
        a, b = b, min(b + cost[i - 1], a + cost[i - 2])
    return b`,
      note: `<code>a</code> and <code>b</code> are the cheapest ways to <em>reach</em> stairs i − 2 and i − 1. The tuple assignment shifts the window in one step, with no temporary, because the right side is worked out first.`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "Caching a list argument",
      code: `from functools import cache

@cache
def total(nums):
    return sum(nums)

print(total((1, 2)))
print(total([1, 2]))`,
      explain: `<code>@cache</code> stores answers in a dict keyed by the arguments, and a list can't be a dict key: <code>TypeError: unhashable type: 'list'</code>. Pass an index into a list that doesn't change, or a tuple.`,
    },
    {
      id: "d2", kind: "predict", title: "The cache remembers",
      code: `from functools import cache
calls = 0

@cache
def f(n):
    global calls
    calls += 1
    return n if n < 2 else f(n - 1) + f(n - 2)

print(f(10), calls)
print(f(12), calls)`,
      explain: `<code>f(10)</code> computes each of 0 … 10 once: 11 calls. <code>f(12)</code> only needs 11 and 12, the rest is cached. Useful, but a cache on a top-level function also survives between test cases. If the inputs change (a different list), define the cached function <em>inside</em> the solution so each call starts fresh.`,
    },
    {
      id: "d3", kind: "predict", title: "Multiplying a list of lists",
      code: `dp = [[0] * 3] * 2
dp[0][0] = 1
print(dp)
dp = [[0] * 3 for _ in range(2)]
dp[0][0] = 1
print(dp)`,
      explain: `<code>[row] * 2</code> repeats the <em>same</em> row object twice, so writing to one writes to both. The comprehension builds a new list for each row.`,
    },
    {
      id: "d4", kind: "predict", title: "Infinity as a starting value",
      code: `INF = float("inf")
print(INF + 1 == INF, min(INF, 3), INF > 10 ** 100)`,
      explain: `<code>inf</code> stays <code>inf</code> after adding, and loses every <code>min</code>, which is why it's the starting value for "fewest" tables: an unreachable state stays unreachable. Check <code>dp[n] == INF</code> at the end to return −1.`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "House robber", leetcode: 198,
      fn: "rob",
      prompt: `Each house holds some money. You can't rob two neighbouring houses. Return the most you can take.`,
      stub: `def rob(houses):
    `,
      cases: `[
        (([1, 2, 3, 1],), 4),
        (([2, 7, 9, 3, 1],), 12),
        (([2, 1, 1, 2],), 4),
        (([5],), 5),
      ]`,
      solution: `def rob(houses):
    prev, cur = 0, 0
    for x in houses:
        prev, cur = cur, max(cur, prev + x)
    return cur`,
      note: `<code>f(i) = max(f(i − 1), f(i − 2) + houses[i])</code>: skip this house, or take it plus the best from two back. Only two earlier values are read, so it's two variables (rep r6's shape). The circular version (213) runs this twice, once without the first house and once without the last.`,
    },
    {
      id: "p2", kind: "problem", title: "Coin change", leetcode: 322,
      fn: "coin_change",
      prompt: `Return the fewest coins (each kind unlimited) that make <code>amount</code>, or −1 if it can't be made.`,
      stub: `def coin_change(coins, amount):
    `,
      cases: `[
        (([1, 2, 5], 11), 3),
        (([2], 3), -1),
        (([1], 0), 0),
        (([1, 3, 4], 6), 2),
        (([186, 419, 83, 408], 6249), 20),
      ]`,
      solution: `def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] < INF else -1`,
      note: `State: the amount left. Choice: which coin to use last. Lesson 09's Break it showed why greedy fails ([1, 3, 4] with 6), and b3 here why the fill must go upwards. O(amount × coins).`,
    },
    {
      id: "p3", kind: "problem", title: "Longest increasing subsequence", leetcode: 300,
      fn: "lis",
      prompt: `Return the length of the longest strictly increasing subsequence (items in order, not necessarily neighbours).`,
      stub: `def lis(nums):
    `,
      cases: `[
        (([10, 9, 2, 5, 3, 7, 101, 18],), 4),
        (([0, 1, 0, 3, 2, 3],), 4),
        (([7, 7, 7],), 1),
        (([1, 3, 2, 4],), 3),
      ]`,
      solution: `def lis(nums):
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
      note: `<code>dp[i]</code> = the longest ending <em>at</em> i, so the answer is the max over all i, not <code>dp[-1]</code>. That's O(n²). Follow-up: O(n log n) by keeping <code>tails[k]</code> = the smallest end of an increasing run of length k + 1 and updating it with <code>bisect_left</code> (lesson 05).`,
    },
    {
      id: "p4", kind: "problem", title: "Longest common subsequence", leetcode: 1143,
      fn: "lcs",
      prompt: `Return the length of the longest sequence of characters appearing in both strings in the same order (not necessarily neighbouring).`,
      stub: `def lcs(a, b):
    `,
      cases: `[
        (("abcde", "ace"), 3),
        (("abc", "abc"), 3),
        (("abc", "def"), 0),
        (("bsbininm", "jmjkbkjkv"), 1),
        (("", "abc"), 0),
      ]`,
      solution: `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
      note: `Two strings → <code>dp[i][j]</code> on the first i of a and the first j of b. The extra row and column of 0s are the empty prefixes, the same trick as lesson 02's leading 0. If the last letters match, use both; otherwise drop one or the other.<span class="trees"><span class="grid" data-grid="[[0, 0, 0, 0], [0, 1, 1, 1], [0, 1, 1, 1], [0, 1, 2, 2], [0, 1, 2, 2], [0, 1, 2, 3]]" data-rowh="['', 'a', 'b', 'c', 'd', 'e']" data-colh="['', 'a', 'c', 'e']" data-hl="1,1;3,2;5,3" data-cur="5,3" data-cap="dp for &quot;abcde&quot; and &quot;ace&quot;. Blue: a match, taken from the diagonal + 1. The answer is the bottom-right corner."></span></span>`,
    },
    {
      id: "p5", kind: "problem", title: "Edit distance", leetcode: 72,
      fn: "edit_distance",
      prompt: `Return the fewest single-character inserts, deletes or replacements that turn <code>a</code> into <code>b</code>.`,
      stub: `def edit_distance(a, b):
    `,
      cases: `[
        (("horse", "ros"), 3),
        (("intention", "execution"), 5),
        (("", "a"), 1),
        (("abc", "abc"), 0),
        (("abc", ""), 3),
      ]`,
      solution: `def edit_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]`,
      note: `p4's table with costs. The three neighbours are the three edits: from above = delete a's letter, from the left = insert b's letter, diagonal = replace. The base row and column are "build from or erase to nothing".<span class="trees"><span class="grid" data-grid="[[0, 1, 2, 3], [1, 1, 2, 3], [2, 2, 1, 2], [3, 2, 2, 2], [4, 3, 3, 2], [5, 4, 4, 3]]" data-rowh="['', 'h', 'o', 'r', 's', 'e']" data-colh="['', 'r', 'o', 's']" data-hl="0,0;0,1;0,2;0,3;1,0;2,0;3,0;4,0;5,0" data-cur="5,3" data-cap="dp for &quot;horse&quot; → &quot;ros&quot;. Row 0 and column 0 are the base cases. The answer is the corner: 3."></span></span>`,
    },
    {
      id: "p6", kind: "problem", title: "Word break", leetcode: 139,
      fn: "word_break",
      prompt: `Return whether <code>s</code> can be split into a sequence of words from <code>words</code> (each word reusable).`,
      stub: `def word_break(s, words):
    `,
      cases: `[
        (("leetcode", ["leet", "code"]), True),
        (("applepenapple", ["apple", "pen"]), True),
        (("catsandog", ["cats", "dog", "sand", "and", "cat"]), False),
        (("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab", ["a", "aa", "aaa", "aaaa"]), False),
      ]`,
      solution: `def word_break(s, words):
    wordset = set(words)
    ok = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(i):
            if ok[j] and s[j:i] in wordset:
                ok[i] = True
                break
    return ok[len(s)]`,
      note: `<code>ok[i]</code> = "the first i letters can be split". The last test is why it needs DP: plain backtracking (lesson 10) retries the same suffix exponentially many times before failing on the "b". Only the position matters, not how you got there, which is why caching it is safe.`,
    },
  ],

  fromBlank: ["r1", "r3", "r6", "p2", "p4", "p5"],

  leetcode: [
    { n: 70, title: "Climbing Stairs", slug: "climbing-stairs" },
    { n: 746, title: "Min Cost Climbing Stairs", slug: "min-cost-climbing-stairs" },
    { n: 62, title: "Unique Paths", slug: "unique-paths" },
    { n: 64, title: "Minimum Path Sum", slug: "minimum-path-sum" },
    { n: 198, title: "House Robber", slug: "house-robber" },
    { n: 213, title: "House Robber II", slug: "house-robber-ii" },
    { n: 322, title: "Coin Change", slug: "coin-change" },
    { n: 377, title: "Combination Sum IV", slug: "combination-sum-iv" },
    { n: 139, title: "Word Break", slug: "word-break" },
    { n: 91, title: "Decode Ways", slug: "decode-ways" },
    { n: 300, title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence" },
    { n: 1143, title: "Longest Common Subsequence", slug: "longest-common-subsequence" },
    { n: 72, title: "Edit Distance", slug: "edit-distance" },
  ],
});
