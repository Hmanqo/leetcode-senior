COURSE.lesson({
  id: "12",
  title: "DP 2: the families",
  tagline: "0/1 vs unbounded knapsack (one loop direction apart), interval DP by length, a state machine, a bitmask of what's used, and DP + binary search.",

  intro: `
<p>Most hard DP problems belong to a handful of families. Recognising the family hands you the state and the loop
order, which is most of the work. Each family below is lesson 11's four steps with a particular state shape.</p>

<h3>Knapsack: 0/1 vs unbounded</h3>
<pre><code>dp = [0] * (cap + 1)                # dp[c] = best value with capacity c
for w, v in items:
    for c in range(cap, w - 1, -1):  # 0/1: go DOWN, each item used at most once
        dp[c] = max(dp[c], dp[c - w] + v)
    # unbounded: for c in range(w, cap + 1)  (go UP, so an item can be reused)</code></pre>
<p>The only difference is the direction of the inner loop. Going down, <code>dp[c − w]</code> is still last item's
value, so this item hasn't been used yet. Going up, <code>dp[c − w]</code> may already include this item, so it can be
taken again. The same applies to counting: items outside and amounts inside counts <b>combinations</b> (518).
Amounts outside and items inside counts <b>orderings</b> (377, lesson 11).</p>

<h3>Interval DP</h3>
<p><code>dp[i][j]</code> = the answer for the slice <code>i..j</code>, built from smaller slices inside it, so you fill
<b>by length</b>, short to long. The trick in the hard ones is choosing what to split on. For Burst Balloons (p3), it's
"which balloon in <code>i..j</code> bursts <em>last</em>": then its neighbours are the fixed walls <code>i − 1</code>
and <code>j + 1</code>, and the two sides don't interact.</p>

<h3>State machine</h3>
<p>When the rules say what you may do <em>next</em> (holding a stock, in cooldown, free), make each situation a state
and write how each one is reached from yesterday's. A few variables per day, updated together.</p>

<h3>Bitmask</h3>
<p>When the state is "which of these n things are used" and n ≤ about 20, the set fits in an int:
<code>mask &amp; (1 &lt;&lt; j)</code> tests j, <code>mask | (1 &lt;&lt; j)</code> adds it. That's 2ⁿ states, which turns n!
orderings into 2ⁿ · n work.</p>

<h3>DP + binary search</h3>
<p>Weighted Job Scheduling (p5): sort by end, and <code>dp[i] = max(skip job i, take it + best among jobs ending by its
start)</code>. "Which jobs end by its start" is a prefix of the sorted list, found with <code>bisect</code> (lesson 05).</p>

<h3>Traps</h3>
<ol>
<li><b>The wrong loop direction</b> silently turns 0/1 into unbounded (Break it b1), or combinations into orderings (b2).</li>
<li><b>Interval DP filled row by row</b> instead of by length reads slices that aren't done yet.</li>
<li><b>Updating state-machine variables one after another</b>, so the second update reads today's value of the first. Use a tuple assignment.</li>
<li><b>Operator precedence with bits:</b> <code>mask &amp; 1 &lt;&lt; j == 0</code> doesn't mean what it looks like. Bracket everything.</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>"Knapsack is O(n · cap). Is that polynomial?"</b> Only in the <em>value</em> of cap ("pseudo-polynomial"). If cap is 10⁹, it isn't usable.</li>
<li><b>"Why does 0/1 go backwards?"</b> Say the sentence about <code>dp[c − w]</code> above.</li>
<li><b>"How big can n be for a bitmask?"</b> 2²⁰ · 20 is about 2 × 10⁷: fine. 2³⁰ isn't.</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "0/1 knapsack: loop down",
      prompt: `Items (weight, value): (1, 1), (3, 4), (4, 5), capacity 7. One list, and for each item the capacities run <b>down</b>. Watch <code>dp</code> after each item: an item never appears twice in one answer.`,
      code: `def knap(items, cap):
    dp = [0] * (cap + 1)
    for w, v in items:
        for c in range(cap, w - 1, -1):
            dp[c] = max(dp[c], dp[c - w] + v)
        print(dp)  # ask: dp
    return dp[cap]

print(knap([(1, 1), (3, 4), (4, 5)], 7))`,
      note: `After the first item, every capacity holds 1, not c × 1, because going down means <code>dp[c − 1]</code> was still 0 when <code>dp[c]</code> read it. The last list shows capacity 7 using items 2 and 3 (4 + 5 = 9).`,
    },
    {
      id: "w2", kind: "walk", title: "Unbounded: loop up",
      prompt: `The same items, but each may be used any number of times. Only the inner loop's direction changes. Compare <code>dp</code> after the first item with w1's.`,
      code: `def knap_unbounded(items, cap):
    dp = [0] * (cap + 1)
    for w, v in items:
        for c in range(w, cap + 1):
            dp[c] = max(dp[c], dp[c - w] + v)
        print(dp)  # ask: dp
    return dp[cap]

print(knap_unbounded([(1, 1), (3, 4), (4, 5)], 7))`,
      note: `Going up, <code>dp[c − 1]</code> already includes the item when <code>dp[c]</code> reads it, so it stacks: after item 1, <code>dp[c] = c</code>. The answer is still 9 here, but through <code>3 + 3 + 1</code> as well. One word of difference in the loop.`,
    },
    {
      id: "w3", kind: "walk", title: "A state machine, day by day",
      prompt: `Buy and sell a stock as often as you like, paying a fee of 2 on each sale. Two states: <code>hold</code> (best profit while owning a share) and <code>cash</code> (best while not owning one). Each day, both are updated from yesterday's values at once.`,
      code: `def stock_fee(prices, fee):
    hold, cash = -prices[0], 0
    for p in prices[1:]:
        hold, cash = max(hold, cash - p), max(cash, hold + p - fee)  # ask: (hold, cash)
    return cash

print(stock_fee([1, 3, 2, 8, 4, 9], 2))`,
      note: `Each state has two arrows into it: stay as you were, or switch from the other state (buy: <code>cash − p</code>, sell: <code>hold + p − fee</code>). The tuple assignment uses yesterday's values for both. A cooldown (p4) just adds a third state between selling and buying again.`,
    },
    {
      id: "w4", kind: "walk", title: "A bitmask of what's taken",
      prompt: `Three workers, three jobs, <code>cost[w][j]</code>. Worker number <code>popcount(mask)</code> picks next, and <code>mask</code> says which jobs are already taken. <code>dp[mask]</code> = cheapest way to reach that set.`,
      code: `def assign(cost):
    n = len(cost)
    INF = float("inf")
    dp = [INF] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        w = bin(mask).count("1")
        if w == n or dp[mask] == INF:
            continue
        for j in range(n):
            if not mask & (1 << j):
                new = mask | (1 << j)
                dp[new] = min(dp[new], dp[mask] + cost[w][j])
    return dp[-1]  # ask: dp

print(assign([[9, 2, 7], [6, 4, 3], [5, 8, 1]]))`,
      note: `There are only 2³ = 8 sets instead of 3! = 6 orders. The saving grows fast: for 15 workers it's 32,768 sets against over a trillion orders. A mask's number is always bigger than its subsets', so the plain loop over masks is already a valid fill order.`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "0/1 knapsack looping up",
      prompt: `Each item may be used at most once, but this inner loop goes <b>up</b> through the capacities. Find items and a capacity where it's wrong. Items are <code>(weight, value)</code> pairs.`,
      fn: "knap", args: "items, cap",
      code: `def knap(items, cap):
    dp = [0] * (cap + 1)
    for w, v in items:
        for c in range(w, cap + 1):
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]`,
      ref: "right",
      right: `def right(items, cap):
    dp = [0] * (cap + 1)
    for w, v in items:
        for c in range(cap, w - 1, -1):
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]`,
      valid: `lambda items, cap: (isinstance(items, list) and 1 <= len(items) <= 5 and all(isinstance(it, (list, tuple)) and len(it) == 2 and all(type(x) is int and 1 <= x <= 10 for x in it) for it in items) and type(cap) is int and 0 <= cap <= 20) or "items: 1 to 5 (weight, value) pairs from 1 to 10; cap: 0 to 20."`,
      rules: `<code>items</code>: 1–5 <code>(weight, value)</code> pairs, each from 1 to 10. <code>cap</code>: 0 to 20.`,
      example: `[(1, 5)], 2`,
      explain: `With capacity 2 and one item of weight 1, it takes the item twice (value 10). Going up, <code>dp[1]</code> already holds this item when <code>dp[2]</code> reads it. Going down means every read sees the table from before this item.`,
    },
    {
      id: "b2", kind: "breakit", title: "Counting orders instead of combinations",
      prompt: `Count the ways to make <code>amount</code> from coins, where 1 + 2 and 2 + 1 are the <b>same</b> way. This puts the amount loop outside and the coin loop inside. Find an input where it overcounts.`,
      fn: "change", args: "amount, coins",
      code: `def change(amount, coins):
    dp = [1] + [0] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] += dp[a - c]
    return dp[amount]`,
      ref: "right",
      right: `def right(amount, coins):
    dp = [1] + [0] * amount
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]`,
      valid: `lambda amount, coins: (type(amount) is int and 0 <= amount <= 30 and isinstance(coins, list) and 1 <= len(coins) <= 4 and len(set(coins)) == len(coins) and all(type(c) is int and 1 <= c <= 10 for c in coins)) or "amount: 0 to 30; coins: 1 to 4 different whole numbers from 1 to 10."`,
      rules: `<code>amount</code>: 0 to 30. <code>coins</code>: 1–4 different whole numbers from 1 to 10.`,
      example: `3, [1, 2]`,
      explain: `It counts 1 + 2 and 2 + 1 separately (3 ways instead of 2). With amounts outside, every coin can come last at every step, so every order appears. With coins outside, all the 1s are placed before any 2, so each combination is built in one order only.`,
    },
    {
      id: "b3", kind: "breakit", title: "Ignoring the cooldown",
      prompt: `Stock profit where after selling you must wait one day before buying again. This shortcut adds up every rise from one day to the next, which is right with no cooldown. Find prices where it overstates the profit.`,
      fn: "max_profit", args: "prices",
      code: `def max_profit(prices):
    return sum(max(0, b - a) for a, b in zip(prices, prices[1:]))`,
      ref: "right",
      right: `def right(prices):
    hold, sold, rest = float("-inf"), 0, 0
    for p in prices:
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)`,
      valid: `lambda prices: (isinstance(prices, list) and 1 <= len(prices) <= 8 and all(type(x) is int and 0 <= x <= 9 for x in prices)) or "a list of 1 to 8 prices from 0 to 9."`,
      rules: `a list of 1–8 prices from 0 to 9.`,
      example: `[1, 2, 1, 2]`,
      explain: `It sells on day 2 and buys again on day 3, which the cooldown forbids. The best legal plan earns 1. When a rule links today to yesterday's action, make each situation a state (holding, just sold, free) and say how each is reached.`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "0/1 knapsack, one row",
      fn: "knap01", sig: "knap01(weights: list[int], values: list[int], cap: int) -> int",
      prompt: `Each item at most once. Return the most value fitting in <code>cap</code>. One list <code>dp[0..cap]</code>, with the inner loop going <b>down</b>.`,
      cases: `[
        (([1, 3, 4, 5], [1, 4, 5, 7], 7), 9),
        (([2], [3], 1), 0),
        (([1, 1, 1], [10, 20, 30], 2), 50),
        (([5, 4, 6, 3], [10, 40, 30, 50], 10), 90),
      ]`,
      solution: `def knap01(weights, values, cap):
    dp = [0] * (cap + 1)
    for w, v in zip(weights, values):
        for c in range(cap, w - 1, -1):
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]`,
      note: `<code>range(cap, w − 1, −1)</code> stops at <code>w</code>, so <code>c − w</code> is never negative. Partition Equal Subset Sum (p1) is this with a yes/no table.`,
    },
    {
      id: "r2", kind: "rep", title: "Unbounded knapsack",
      fn: "knap_unbounded", sig: "knap_unbounded(weights: list[int], values: list[int], cap: int) -> int",
      prompt: `Each item any number of times. Same one-row table, with the inner loop going <b>up</b>.`,
      cases: `[
        (([2, 3], [3, 5], 7), 11),
        (([5], [10], 4), 0),
        (([1, 50], [1, 30], 100), 100),
        (([1, 3, 4], [15, 50, 60], 8), 130),
      ]`,
      solution: `def knap_unbounded(weights, values, cap):
    dp = [0] * (cap + 1)
    for w, v in zip(weights, values):
        for c in range(w, cap + 1):
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]`,
      note: `Same line, other direction. In the first test the 0/1 answer would be 8 (one of each). Coin change (lesson 11) is unbounded knapsack with "fewest" instead of "most".`,
    },
    {
      id: "r3", kind: "rep", title: "Count subsets to a target", leetcode: 494,
      fn: "count_subsets", sig: "count_subsets(nums: list[int], target: int) -> int",
      prompt: `Count the subsets of <code>nums</code> (non-negative; equal values at different positions are different items) whose sum is <code>target</code>. 0/1 counting: <code>dp[t] += dp[t − x]</code>, t going down.`,
      cases: `[
        (([1, 1, 1, 1, 1], 3), 10),
        (([1, 2, 3], 3), 2),
        (([2, 4], 5), 0),
        (([0, 1], 1), 2),
      ]`,
      solution: `def count_subsets(nums, target):
    dp = [1] + [0] * target
    for x in nums:
        for t in range(target, x - 1, -1):
            dp[t] += dp[t - x]
    return dp[target]`,
      note: `<code>max</code> became <code>+=</code>, and the direction rule is unchanged. Target Sum (494) becomes this after some algebra: the plus-signed numbers must sum to <code>(total + target) / 2</code>.`,
    },
    {
      id: "r4", kind: "rep", title: "Interval DP by length", leetcode: 516,
      fn: "lps", sig: "lps(s: str) -> int",
      prompt: `Return the length of the longest palindromic subsequence of <code>s</code>. <code>dp[i][j]</code> covers <code>s[i..j]</code>: fill by length, short to long. If the ends match, it's <code>2 + dp[i + 1][j − 1]</code>, otherwise drop one end.`,
      cases: `[
        (("bbbab",), 4),
        (("cbbd",), 2),
        (("a",), 1),
        (("agbdba",), 5),
      ]`,
      solution: `def lps(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = 1
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                dp[i][j] = 2 + (dp[i + 1][j - 1] if length > 2 else 0)
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]`,
      note: `Every cell reads only shorter slices, so "by length" is a safe order. Going <code>i</code> from n − 1 down to 0 with <code>j</code> going up works too. Pick one and say why it's safe.`,
    },
    {
      id: "r5", kind: "rep", title: "A two-state machine", leetcode: 714,
      fn: "stock_fee", sig: "stock_fee(prices: list[int], fee: int) -> int",
      prompt: `Trade as often as you like, holding at most one share, and pay <code>fee</code> per sale. Keep <code>hold</code> and <code>cash</code>, both updated together from yesterday's values each day.`,
      cases: `[
        (([1, 3, 2, 8, 4, 9], 2), 8),
        (([1, 3, 7, 5, 10, 3], 3), 6),
        (([5, 4, 3], 1), 0),
        (([1, 5], 0), 4),
      ]`,
      solution: `def stock_fee(prices, fee):
    hold, cash = -prices[0], 0
    for p in prices[1:]:
        hold, cash = max(hold, cash - p), max(cash, hold + p - fee)
    return cash`,
      note: `Every stock problem (121, 122, 123, 188, 309, 714) is this machine with different states: a transaction count, a cooldown day, a fee. Draw the states first and the code writes itself.`,
    },
    {
      id: "r6", kind: "rep", title: "Bitmask assignment",
      fn: "assign", sig: "assign(cost: list[list[int]]) -> int",
      prompt: `n workers, n jobs, <code>cost[w][j]</code>. Each worker does exactly one job. Return the cheapest total. <code>dp[mask]</code> over sets of taken jobs, where the next worker is <code>bin(mask).count("1")</code>.`,
      cases: `[
        (([[9, 2, 7], [6, 4, 3], [5, 8, 1]],), 9),
        (([[1]],), 1),
        (([[1, 2], [3, 4]],), 5),
        (([[4, 1, 3], [2, 0, 5], [3, 2, 2]],), 5),
      ]`,
      mustUse: [{ re: "<<", msg: "Use a bitmask of taken jobs." }],
      solution: `def assign(cost):
    n = len(cost)
    INF = float("inf")
    dp = [INF] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        w = bin(mask).count("1")
        if w == n or dp[mask] == INF:
            continue
        for j in range(n):
            if not mask & (1 << j):
                new = mask | (1 << j)
                dp[new] = min(dp[new], dp[mask] + cost[w][j])
    return dp[(1 << n) - 1]`,
      note: `Which worker comes next is fixed by how many jobs are taken, so the state needs only the set. O(2ⁿ · n) instead of trying all n! assignments. Walk w4 traces it.`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "Bit operations",
      code: `mask = 6
print(mask & 1, mask & 2, mask >> 1, 1 << 3)
print(mask | 1, bin(mask), bin(mask).count("1"))`,
      explain: `6 is <code>0b110</code>: bit 0 is off (<code>&amp; 1</code> → 0) and bit 1 is on (<code>&amp; 2</code> → 2, which is truthy, not 1). <code>| 1</code> sets bit 0. <code>bin(m).count("1")</code> is how many items are in the set (<code>m.bit_count()</code> in Python 3.10+).`,
    },
    {
      id: "d2", kind: "predict", title: "A range going down",
      code: `print(list(range(5, 1, -1)))
w, cap = 2, 5
print(list(range(cap, w - 1, -1)))`,
      explain: `<code>range(a, b, −1)</code> counts down and stops <em>before</em> b, so to include <code>w</code> the stop is <code>w − 1</code>. That's the 0/1 knapsack loop: every capacity from cap down to the item's weight.`,
    },
    {
      id: "d3", kind: "predict", title: "One item, used twice",
      code: `dp = [0, 0, 0]
w, v = 1, 5
for c in range(w, 3):
    dp[c] = max(dp[c], dp[c - w] + v)
print(dp)`,
      explain: `Going up, <code>dp[2]</code> reads <code>dp[1]</code>, which already took the item, so capacity 2 holds it twice. That's right for unbounded and wrong for 0/1.`,
    },
    {
      id: "d4", kind: "predict", title: "Updating states one at a time",
      code: `hold, cash = -1, 0
for p in [3]:
    hold = max(hold, cash - p)
    cash = max(cash, hold + p)
print(hold, cash)
hold, cash = -1, 0
for p in [3]:
    hold, cash = max(hold, cash - p), max(cash, hold + p)
print(hold, cash)`,
      explain: `Here both orders happen to agree. They agree because buying and selling on the same day nets 0. With a fee or a cooldown they don't: the second line would read <em>today's</em> hold. The tuple form is the one that's always right, so make it a habit.`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "Partition equal subset sum", leetcode: 416,
      fn: "can_partition",
      prompt: `Can <code>nums</code> (positive) be split into two groups with equal sums?`,
      stub: `def can_partition(nums):
    `,
      cases: `[
        (([1, 5, 11, 5],), True),
        (([1, 2, 3, 5],), False),
        (([2, 2],), True),
        (([1],), False),
        (([3, 3, 3, 4, 5],), True),
      ]`,
      solution: `def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    half = total // 2
    can = [True] + [False] * half
    for x in nums:
        for t in range(half, x - 1, -1):
            can[t] = can[t] or can[t - x]
    return can[half]`,
      note: `"Two equal groups" = "a subset summing to half". Then it's 0/1 knapsack with booleans, going down. A Python trick: one big int as a bitset, <code>bits |= bits &lt;&lt; x</code>, does the same loop in one line.`,
    },
    {
      id: "p2", kind: "problem", title: "Coin change II", leetcode: 518,
      fn: "change",
      prompt: `Count the combinations of coins (each kind unlimited) that make <code>amount</code>. Order doesn't matter.`,
      stub: `def change(amount, coins):
    `,
      cases: `[
        ((5, [1, 2, 5]), 4),
        ((3, [2]), 0),
        ((10, [10]), 1),
        ((0, [7]), 1),
        ((3, [1, 2]), 2),
      ]`,
      solution: `def change(amount, coins):
    dp = [1] + [0] * amount
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]`,
      note: `Coins outside means combinations: by the time coin c is considered, the table only contains smaller coins, so each multiset is built in one order. Going up means each coin can be reused (unbounded). Break it b2 swaps the loops.`,
    },
    {
      id: "p3", kind: "problem", title: "Burst balloons", leetcode: 312,
      fn: "max_coins",
      prompt: `Bursting balloon i earns <code>left · nums[i] · right</code>, where left and right are its current neighbours (1 past the ends). Return the most coins from bursting all of them.`,
      stub: `def max_coins(nums):
    `,
      cases: `[
        (([3, 1, 5, 8],), 167),
        (([1, 5],), 10),
        (([7],), 7),
        (([2, 3],), 9),
      ]`,
      solution: `def max_coins(nums):
    a = [1] + nums + [1]
    n = len(a)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n):
        for i in range(n - length):
            j = i + length
            for k in range(i + 1, j):
                dp[i][j] = max(dp[i][j], dp[i][k] + a[i] * a[k] * a[j] + dp[k][j])
    return dp[0][n - 1]`,
      note: `<code>dp[i][j]</code> = the most from bursting everything strictly between i and j. Choose <code>k</code>, the <b>last</b> one to burst in there: its neighbours at that moment are the walls i and j, and the two sides are independent. Choosing the first one fails, because its neighbours change.`,
    },
    {
      id: "p4", kind: "problem", title: "Stock with cooldown", leetcode: 309,
      fn: "max_profit",
      prompt: `Buy and sell as often as you like (one share at a time), but after selling you can't buy the next day. Return the most profit.`,
      stub: `def max_profit(prices):
    `,
      cases: `[
        (([1, 2, 3, 0, 2],), 3),
        (([1],), 0),
        (([2, 1],), 0),
        (([1, 2, 4],), 3),
        (([1, 2, 1, 2],), 1),
      ]`,
      solution: `def max_profit(prices):
    hold, sold, rest = float("-inf"), 0, 0
    for p in prices:
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)`,
      note: `Three states: <code>hold</code> (own a share), <code>sold</code> (sold today, so tomorrow is cooldown) and <code>rest</code> (free to buy). You can only buy from <code>rest</code>, and that one arrow is the whole cooldown rule. All three update together.`,
    },
    {
      id: "p5", kind: "problem", title: "Weighted job scheduling", leetcode: 1235,
      fn: "job_profit",
      prompt: `Job i runs from <code>start[i]</code> to <code>end[i]</code> and pays <code>profit[i]</code>. Jobs you take can't overlap, though one may start exactly when another ends. Return the most profit.`,
      stub: `def job_profit(start, end, profit):
    `,
      cases: `[
        (([1, 2, 3, 3], [3, 4, 5, 6], [50, 10, 40, 70]), 120),
        (([1, 2, 3, 4, 6], [3, 5, 10, 6, 9], [20, 20, 100, 70, 60]), 150),
        (([1, 1, 1], [2, 3, 4], [5, 6, 4]), 6),
      ]`,
      solution: `from bisect import bisect_right

def job_profit(start, end, profit):
    jobs = sorted(zip(end, start, profit))
    ends = [e for e, _, _ in jobs]
    dp = [0] * (len(jobs) + 1)
    for i, (e, s, p) in enumerate(jobs):
        k = bisect_right(ends, s, 0, i)
        dp[i + 1] = max(dp[i], dp[k] + p)
    return dp[-1]`,
      note: `Lesson 09's interval scheduling, but with profits, so greedy no longer works. Sorted by end, <code>dp[i + 1]</code> is the best using the first i + 1 jobs: skip job i, or take it plus the best among jobs ending by its start. <code>bisect_right</code> finds how many those are, in O(log n).`,
    },
    {
      id: "p6", kind: "problem", title: "Beautiful arrangement", leetcode: 526,
      fn: "count_arrangement",
      prompt: `Count the orderings of 1…n where, at every position i (from 1), the number there divides i or i divides it. n ≤ 15.`,
      stub: `def count_arrangement(n):
    `,
      cases: `[
        ((1,), 1),
        ((2,), 2),
        ((3,), 3),
        ((6,), 36),
        ((12,), 4010),
      ]`,
      solution: `def count_arrangement(n):
    dp = [0] * (1 << n)
    dp[0] = 1
    for mask in range(1 << n):
        if not dp[mask]:
            continue
        pos = bin(mask).count("1") + 1
        for x in range(1, n + 1):
            bit = 1 << (x - 1)
            if not mask & bit and (x % pos == 0 or pos % x == 0):
                dp[mask | bit] += dp[mask]
    return dp[-1]`,
      note: `Backtracking (lesson 10) would build every valid ordering one at a time. Here the state is only <em>which</em> numbers are placed, since the next position is fixed by how many are, so orderings that used the same set merge. That's rep r6 counting instead of minimising.`,
    },
  ],

  fromBlank: ["r1", "r2", "r4", "p1", "p3", "p5"],

  leetcode: [
    { n: 416, title: "Partition Equal Subset Sum", slug: "partition-equal-subset-sum" },
    { n: 494, title: "Target Sum", slug: "target-sum" },
    { n: 518, title: "Coin Change II", slug: "coin-change-ii" },
    { n: 516, title: "Longest Palindromic Subsequence", slug: "longest-palindromic-subsequence" },
    { n: 714, title: "Best Time to Buy and Sell Stock with Transaction Fee", slug: "best-time-to-buy-and-sell-stock-with-transaction-fee" },
    { n: 309, title: "Best Time to Buy and Sell Stock with Cooldown", slug: "best-time-to-buy-and-sell-stock-with-cooldown" },
    { n: 123, title: "Best Time to Buy and Sell Stock III", slug: "best-time-to-buy-and-sell-stock-iii" },
    { n: 312, title: "Burst Balloons", slug: "burst-balloons" },
    { n: 1235, title: "Maximum Profit in Job Scheduling", slug: "maximum-profit-in-job-scheduling" },
    { n: 526, title: "Beautiful Arrangement", slug: "beautiful-arrangement" },
    { n: 698, title: "Partition to K Equal Sum Subsets", slug: "partition-to-k-equal-sum-subsets" },
  ],
});
