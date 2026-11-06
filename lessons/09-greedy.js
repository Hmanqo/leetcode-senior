COURSE.lesson({
  id: "09",
  title: "Greedy",
  tagline: "One safe choice at a time: furthest reach, sort by the right key, reset a running total. Why it works, and how to tell when it doesn't.",

  intro: `
<p>A greedy algorithm makes the best-looking choice right now and never goes back. Writing one is easy. The hard part,
and the part a senior interviewer is testing, is knowing <b>whether that choice is safe</b>. Most greedy bugs aren't
typos: they're a choice that looks best and isn't. So this lesson starts with the "why", interactively. In <b>Step
through</b> you watch the state change and say what it is before each line runs. In <b>Break it</b> you're handed a
plausible greedy that's wrong, and you find the input that proves it.</p>

<h3>Three questions before you type</h3>
<ol>
<li><b>What is the one choice at each step?</b> Take the meeting that ends first. Drop the running sum. Put this
string before that one.</li>
<li><b>Why can't it hurt?</b> Take <em>any</em> best answer. If it doesn't make your choice, swap your choice in and
show it's no worse. That's the <b>exchange argument</b>, and two sentences of it is the proof an interviewer wants.</li>
<li><b>Can I break it?</b> Try three or four tiny inputs, especially ones built to fool the rule. If a small case
breaks it, the problem needs DP (lessons 11–12), not a cleverer greedy.</li>
</ol>

<h3>Two kinds of safe</h3>
<p>Some greedies are safe because they <b>don't actually commit</b>. Jump Game never picks where to land. It keeps
<code>reach</code>, the furthest point <em>any</em> sequence of jumps could get to, which sums up every choice at once.
Others <b>do</b> commit, and are safe because of an exchange argument: the meeting that ends first can replace the
first meeting of any best schedule, because it leaves at least as much room after it.</p>

<h3>The shapes</h3>
<table>
<thead><tr><th>Shape</th><th>The state you keep</th><th>Problems</th></tr></thead>
<tbody>
<tr><td><b>Furthest reach</b></td><td><code>reach = max(reach, i + nums[i])</code>, fail if <code>i &gt; reach</code></td><td>55, 45, 1024</td></tr>
<tr><td><b>Sort by end, take what finishes first</b></td><td><code>end</code> of the last one taken</td><td>435 (lesson 08), 452, 646</td></tr>
<tr><td><b>Running total, reset when it hurts</b></td><td><code>cur</code>, dropped once it's negative</td><td>53, 134</td></tr>
<tr><td><b>A boundary that only grows</b></td><td>max so far, or the last index of every letter so far</td><td>763, 769</td></tr>
<tr><td><b>One pass per direction</b></td><td>a left-to-right list, then a right-to-left one, merged with <code>max</code></td><td>135</td></tr>
<tr><td><b>Sort by a key you derive</b></td><td>a comparison or a difference: <code>a + b</code> vs <code>b + a</code>, <code>cost_a - cost_b</code></td><td>179, 1029, 406</td></tr>
<tr><td><b>Greedy + heap</b></td><td>a heap of choices you can still take back (lesson 07)</td><td>630, 871</td></tr>
</tbody>
</table>
<span class="trees"><span class="ivals" data-ivals="[[1, 3], [2, 5], [4, 7], [6, 9], [8, 10]]" data-hl="0,2,4" data-bad="1,3" data-cap="Sorted by end: take [1, 3], skip [2, 5] (it starts before 3), take [4, 7], skip [6, 9], take [8, 10]. Three."></span></span>

<h3>Greedy or DP?</h3>
<p>Ask: <b>does taking this now change what's left in a way I can't swap back?</b> Paying 6 with coins 1, 3, 4: taking
the 4 leaves 2, which only costs more coins. Taking 3 leaves 3, which is one coin. The local best made the rest worse,
so that's DP. Sorting by end is different. The first-ending meeting can only leave <em>more</em> room than whatever it
replaced, so there's nothing to regret.</p>

<h3>Traps</h3>
<ol>
<li><b>Sorting by the wrong key.</b> Start instead of end, or shortest instead of earliest-ending. Both look sensible, and Break it has you find where they fail.</li>
<li><b><code>x = x.sort()</code></b> sets <code>x</code> to <code>None</code>. Use <code>x.sort()</code> on its own line, or <code>x = sorted(x)</code>.</li>
<li><b>Starting a running max at 0.</b> If everything is negative, the answer is negative. Start from <code>nums[0]</code>.</li>
<li><b>Using a position you can't reach.</b> In reach problems, check <code>i &gt; reach</code> <em>before</em> using <code>nums[i]</code>.</li>
<li><b>A <code>cmp_to_key</code> comparator that returns a bool.</b> It must return negative, zero or positive. <code>True</code>/<code>False</code> is 1/0, so it can never say "a first".</li>
<li><b><code>&gt;</code> vs <code>&gt;=</code> at touching ends.</b> Meetings <code>[1,2]</code> and <code>[2,3]</code> don't clash, but balloons <code>[1,2]</code> and <code>[2,3]</code> share a point. Read which one the problem means.</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>"Why does that work?"</b> Give the exchange argument in two sentences: "Take any best answer. Swap its first choice for mine. It's no worse because…".</li>
<li><b>Complexity:</b> usually O(n log n) for the sort plus O(n) for the pass, and O(1) extra space. Reach and running-total greedies are O(n) with no sort.</li>
<li><b>"What if it's a stream?"</b> The running-state shapes (reach, Kadane, gas) already make one pass and need no sort.</li>
<li><b>"What if the costs were different?"</b> Check whether the exchange argument still holds. If it doesn't, say "then it's DP" and name the state.</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "Furthest reach (Jump Game)",
      prompt: `<code>nums[i]</code> is the longest jump you can make from index <code>i</code>. Can you get to the last index? Watch <code>reach</code>: the furthest index any sequence of jumps could have got to so far. The code never decides where to land.`,
      code: `def can_reach(nums):
    reach = 0
    for i in range(len(nums)):
        if i > reach:  # ask 2,3,8,10: reach
            return False
        reach = max(reach, i + nums[i])
    return True

print(can_reach([2, 3, 1, 0, 4]))
print(can_reach([3, 2, 1, 0, 4]))`,
      note: `<code>reach</code> sums up every possible path at once, so there's no choice to get wrong. In the second list every path runs into the 0 at index 3, and you can see it: <code>reach</code> stops at 3 while <code>i</code> keeps going. That's the moment <code>i &gt; reach</code>.`,
    },
    {
      id: "w2", kind: "walk", title: "Fewest jumps: BFS without a queue",
      prompt: `Same jumps, but now count the fewest it takes to reach the end. <code>end</code> is the edge of what <code>jumps</code> jumps can reach, and <code>far</code> is the edge of what one more jump can reach. Only when <code>i</code> hits <code>end</code> do you have to spend a jump.`,
      code: `def min_jumps(nums):
    jumps, end, far = 0, 0, 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == end:  # ask 1,3: far
            jumps += 1
            end = far
    return jumps  # ask: jumps

print(min_jumps([2, 3, 1, 1, 4]))`,
      note: `This is BFS, one level per jump, but each level is a <em>range</em> of indices (<code>end</code> of the last level up to <code>far</code>), so you don't need a queue. The loop stops before the last index: once you're standing there, you don't jump again.`,
    },
    {
      id: "w3", kind: "walk", title: "Drop a sum that only hurts (Kadane)",
      prompt: `The largest sum of a non-empty run of neighbours. <code>cur</code> is the best sum of a run that ends at the element just before <code>x</code>. Before each line runs, ask yourself: will <code>x</code> join that run or start a new one?`,
      code: `def max_subarray(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)  # ask 3,4: cur
        best = max(best, cur)
    return best  # ask: best

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,
      note: `When <code>cur</code> is negative, adding it to <code>x</code> can only make that sum smaller, so <code>max(x, cur + x)</code> drops it and starts again at <code>x</code>. It's safe because the best run starting later never wanted that negative prefix. Gas Station (p1) is the same reset with fuel.`,
    },
    {
      id: "w4", kind: "walk", title: "Take what ends first",
      prompt: `Keep as many non-overlapping meetings as possible (touching is fine). Sort by <b>end</b>, then take every meeting that starts at or after the last one you kept ended.`,
      code: `def max_meetings(intervals):
    intervals.sort(key=lambda iv: iv[1])
    count, end = 0, float("-inf")
    for s, e in intervals:
        if s >= end:  # ask 1,4,5: end
            count += 1
            end = e
    return count  # ask: count

print(max_meetings([[1, 10], [2, 3], [4, 5], [6, 7], [8, 12]]))`,
      note: `Why it's safe: take any best schedule and swap its first meeting for the one that ends earliest. That one ends no later, so everything after it still fits, and the count is the same. Repeat for the rest. Sorting by start instead would take <code>[1, 10]</code> first and lose three meetings. You'll find that input yourself in Break it.`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "Biggest coin first",
      prompt: `This pays an amount with the fewest coins by always taking the biggest coin that fits. It's right for 1, 5, 10, 25. Find coins and an amount where it uses more coins than it needs.`,
      fn: "fewest_coins", args: "coins, amount",
      code: `def fewest_coins(coins, amount):
    count = 0
    for c in sorted(coins, reverse=True):
        count += amount // c
        amount %= c
    return count if amount == 0 else -1`,
      ref: "best",
      right: `def best(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] < INF else -1`,
      valid: `lambda coins, amount: (isinstance(coins, list) and 1 <= len(coins) <= 6 and all(type(c) is int and 1 <= c <= 50 for c in coins) and type(amount) is int and 0 <= amount <= 200) or "coins is a list of 1 to 6 whole numbers from 1 to 50, and amount is a whole number from 0 to 200."`,
      rules: `<code>coins</code> is a list of 1–6 whole numbers from 1 to 50, and <code>amount</code> is from 0 to 200.`,
      example: `[1, 3, 4], 6`,
      explain: `Taking the 4 leaves 2, and 2 costs two more coins (4 + 1 + 1). Taking a 3 leaves 3, which is one coin (3 + 3). The biggest coin changed what was left in a way you can't swap back, so this is DP: <code>best(a) = 1 + min(best(a - c))</code>. That's LeetCode 322, in lesson 11.`,
    },
    {
      id: "b2", kind: "breakit", title: "Always jump as far as you can",
      prompt: `This answers Jump Game by always taking the longest jump. Find a list where you can reach the end but this says you can't.`,
      fn: "can_reach", args: "nums",
      code: `def can_reach(nums):
    i = 0
    while i < len(nums) - 1:
        if nums[i] == 0:
            return False
        i += nums[i]
    return True`,
      ref: "right",
      right: `def right(nums):
    reach = 0
    for i in range(len(nums)):
        if i > reach:
            return False
        reach = max(reach, i + nums[i])
    return True`,
      valid: `lambda nums: (isinstance(nums, list) and 1 <= len(nums) <= 10 and all(type(x) is int and 0 <= x <= 9 for x in nums)) or "nums is a list of 1 to 10 whole numbers from 0 to 9."`,
      rules: `a list of 1–10 whole numbers from 0 to 9.`,
      example: `[2, 3, 0, 0, 1]`,
      explain: `The longest jump from index 0 lands on a 0 and gets stuck. A shorter jump to the 3 would have cleared the gap. "Jump furthest" commits to one landing spot. The right greedy (w1) commits to nothing: it tracks the furthest point <em>any</em> landing spot could lead to.`,
    },
    {
      id: "b3", kind: "breakit", title: "Take what starts first",
      prompt: `The same meetings problem as w4, but sorted by <b>start</b> instead of end. Find meetings where it keeps fewer than it could.`,
      fn: "max_meetings", args: "intervals",
      code: `def max_meetings(intervals):
    intervals.sort()
    count, end = 0, float("-inf")
    for s, e in intervals:
        if s >= end:
            count += 1
            end = e
    return count`,
      ref: "right",
      right: `def right(intervals):
    intervals.sort(key=lambda iv: iv[1])
    count, end = 0, float("-inf")
    for s, e in intervals:
        if s >= end:
            count += 1
            end = e
    return count`,
      valid: `lambda ivs: (isinstance(ivs, list) and len(ivs) <= 8 and all(isinstance(iv, list) and len(iv) == 2 and all(type(v) is int for v in iv) and 0 <= iv[0] < iv[1] <= 100 for iv in ivs)) or "a list of up to 8 [start, end] pairs with 0 ≤ start < end ≤ 100."`,
      rules: `a list of up to 8 <code>[start, end]</code> pairs with 0 ≤ start &lt; end ≤ 100.`,
      example: `[[1, 10], [2, 3], [4, 5]]`,
      explain: `<code>[1, 10]</code> starts first and blocks everything inside it. Starting early says nothing about how much room a meeting leaves. Ending early does, which is why the exchange argument works for end and not for start.`,
    },
    {
      id: "b4", kind: "breakit", title: "Take the shortest first",
      prompt: `Smarter-looking: take the shortest meetings first, keeping each one that doesn't clash with any you already kept. Find meetings where it keeps fewer than it could.`,
      fn: "max_meetings", args: "intervals",
      code: `def max_meetings(intervals):
    intervals.sort(key=lambda iv: iv[1] - iv[0])
    kept = []
    for s, e in intervals:
        if all(e <= ks or s >= ke for ks, ke in kept):
            kept.append((s, e))
    return len(kept)`,
      ref: "right",
      right: `def right(intervals):
    intervals.sort(key=lambda iv: iv[1])
    count, end = 0, float("-inf")
    for s, e in intervals:
        if s >= end:
            count += 1
            end = e
    return count`,
      valid: `lambda ivs: (isinstance(ivs, list) and len(ivs) <= 8 and all(isinstance(iv, list) and len(iv) == 2 and all(type(v) is int for v in iv) and 0 <= iv[0] < iv[1] <= 100 for iv in ivs)) or "a list of up to 8 [start, end] pairs with 0 ≤ start < end ≤ 100."`,
      rules: `a list of up to 8 <code>[start, end]</code> pairs with 0 ≤ start &lt; end ≤ 100.`,
      example: `[[1, 5], [4, 7], [6, 10]]`,
      explain: `<code>[4, 7]</code> is the shortest, but it overlaps both of the others, which don't overlap each other. Short isn't the same as ending early. A short meeting can still sit right across two long ones.`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "Can reach the end", leetcode: 55,
      fn: "can_reach", sig: "can_reach(nums: list[int]) -> bool",
      prompt: `<code>nums[i]</code> is the longest jump from index <code>i</code>. Return whether the last index can be reached from index 0. Keep <code>reach</code>, and fail as soon as <code>i</code> is past it.`,
      cases: `[
        (([2, 3, 1, 1, 4],), True),
        (([3, 2, 1, 0, 4],), False),
        (([0],), True),
        (([0, 1],), False),
        (([2, 0, 0],), True),
        (([1, 0, 1, 0],), False),
      ]`,
      solution: `def can_reach(nums):
    reach = 0
    for i in range(len(nums)):
        if i > reach:
            return False
        reach = max(reach, i + nums[i])
    return True`,
      note: `Check before you update: <code>nums[i]</code> only counts if you can stand on <code>i</code>. Predict d3 shows what happens otherwise.`,
    },
    {
      id: "r2", kind: "rep", title: "Fewest jumps", leetcode: 45,
      fn: "min_jumps", sig: "min_jumps(nums: list[int]) -> int",
      prompt: `The end is always reachable. Return the fewest jumps to get there. Keep <code>end</code> (what this many jumps reaches) and <code>far</code> (what one more reaches), and spend a jump when <code>i == end</code>.`,
      cases: `[
        (([2, 3, 1, 1, 4],), 2),
        (([2, 3, 0, 1, 4],), 2),
        (([0],), 0),
        (([1, 1, 1, 1],), 3),
        (([5, 1, 1, 1],), 1),
      ]`,
      solution: `def min_jumps(nums):
    jumps, end, far = 0, 0, 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == end:
            jumps += 1
            end = far
    return jumps`,
      note: `<code>range(len(nums) - 1)</code>: standing on the last index costs nothing, and without the − 1, <code>[0]</code> would answer 1. Walk w2 steps through this.`,
    },
    {
      id: "r3", kind: "rep", title: "Most non-overlapping",
      fn: "most_kept", sig: "most_kept(intervals: list[list[int]]) -> int",
      prompt: `Return the most intervals you can keep with no two overlapping. Touching ends are fine: <code>[1, 2]</code> and <code>[2, 3]</code> can both stay. Sort by end.`,
      cases: `[
        (([[1, 2], [2, 3], [3, 4], [1, 3]],), 3),
        (([],), 0),
        (([[1, 10], [2, 3], [4, 5]],), 2),
        (([[1, 5], [4, 7], [6, 10]],), 2),
        (([[1, 2], [1, 2], [1, 2]],), 1),
      ]`,
      mustUse: [{ re: "\\[1\\]", msg: "Sort by the end: key=lambda iv: iv[1]." }],
      solution: `def most_kept(intervals):
    intervals.sort(key=lambda iv: iv[1])
    count, end = 0, float("-inf")
    for s, e in intervals:
        if s >= end:
            count += 1
            end = e
    return count`,
      note: `LeetCode 435 (lesson 08) asks how many to <em>remove</em>, which is <code>len(intervals) - most_kept(intervals)</code>.`,
    },
    {
      id: "r4", kind: "rep", title: "Largest run sum (Kadane)", leetcode: 53,
      fn: "max_subarray", sig: "max_subarray(nums: list[int]) -> int",
      prompt: `Return the largest sum of a non-empty run of neighbouring elements. Keep <code>cur</code>, the best sum ending here, and drop it when starting fresh is better.`,
      cases: `[
        (([-2, 1, -3, 4, -1, 2, 1, -5, 4],), 6),
        (([-3, -1, -2],), -1),
        (([5],), 5),
        (([5, 4, -1, 7, 8],), 23),
      ]`,
      solution: `def max_subarray(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best`,
      note: `Start from <code>nums[0]</code>, not 0, or an all-negative list answers 0 (predict d2). Follow-up: "return the run itself", so remember where <code>cur</code> last restarted.`,
    },
    {
      id: "r5", kind: "rep", title: "Most chunks to sort", leetcode: 769,
      fn: "max_chunks", sig: "max_chunks(arr: list[int]) -> int",
      prompt: `<code>arr</code> is an ordering of <code>0 … n−1</code>. Split it into as many pieces as possible so that sorting each piece and joining them gives the sorted list. You can cut after index <code>i</code> exactly when the largest value so far is <code>i</code>.`,
      cases: `[
        (([4, 3, 2, 1, 0],), 1),
        (([1, 0, 2, 3, 4],), 4),
        (([0],), 1),
        (([2, 0, 1, 3],), 2),
      ]`,
      solution: `def max_chunks(arr):
    count, hi = 0, -1
    for i, x in enumerate(arr):
        hi = max(hi, x)
        if hi == i:
            count += 1
    return count`,
      note: `A boundary that only grows: <code>hi</code> says how far this piece has to stretch at least. Partition Labels (p2) is this with "last index of each letter" as the stretch.`,
    },
    {
      id: "r6", kind: "rep", title: "Largest number (sort by a comparison)", leetcode: 179,
      fn: "largest_number", sig: "largest_number(nums: list[int]) -> str",
      prompt: `Arrange the numbers to form the largest number and return it as a string. Put <code>a</code> before <code>b</code> when <code>a + b &gt; b + a</code> as strings. Use <code>functools.cmp_to_key</code>, and remember that all zeros is <code>"0"</code>.`,
      cases: `[
        (([10, 2],), "210"),
        (([3, 30, 34, 5, 9],), "9534330"),
        (([0, 0],), "0"),
        (([1],), "1"),
        (([8, 89],), "898"),
      ]`,
      mustUse: [{ re: "cmp_to_key", msg: "Sort with functools.cmp_to_key: that's the skill here." }],
      solution: `from functools import cmp_to_key

def largest_number(nums):
    strs = [str(x) for x in nums]
    def cmp(a, b):
        if a + b > b + a:
            return -1
        if a + b < b + a:
            return 1
        return 0
    strs.sort(key=cmp_to_key(cmp))
    out = "".join(strs)
    return "0" if out[0] == "0" else out`,
      note: `This is an exchange argument in code: if <code>b</code> sits right before <code>a</code> and <code>a + b &gt; b + a</code>, swapping them makes a bigger number, so the best order has no pair left to swap. Return <code>-1</code> to mean "a goes first".`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "Looping over sort()",
      code: `intervals = [[3, 4], [1, 2]]
for s, e in intervals.sort(key=lambda iv: iv[1]):
    print(s, e)`,
      explain: `<code>list.sort()</code> sorts in place and returns <code>None</code>, so the loop tries to iterate over <code>None</code>. Sort on its own line first, or loop over <code>sorted(intervals, key=…)</code>.`,
    },
    {
      id: "d2", kind: "predict", title: "Kadane from zero",
      code: `def max_subarray(nums):
    best = cur = 0
    for x in nums:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best

print(max_subarray([2, -1, 3]))
print(max_subarray([-3, -1, -2]))`,
      explain: `The first is right (2 − 1 + 3 = 4). The second should be −1, but <code>best</code> started at 0, a sum no non-empty run has, and nothing negative beats it. Start <code>best</code> and <code>cur</code> at <code>nums[0]</code>.`,
    },
    {
      id: "d3", kind: "predict", title: "Reach you can't use",
      code: `def can_reach(nums):
    reach = 0
    for i in range(len(nums)):
        reach = max(reach, i + nums[i])
    return reach >= len(nums) - 1

print(can_reach([0, 2, 0]))`,
      explain: `You're stuck at index 0 (a jump of 0), but the loop still reads <code>nums[1]</code> and sets <code>reach</code> to 3. Index 1 only counts if you can stand on it, so check <code>i &gt; reach</code> first and stop there.`,
    },
    {
      id: "d4", kind: "predict", title: "A comparator that returns a bool",
      code: `from functools import cmp_to_key
nums = ["3", "30", "34", "5", "9"]
nums.sort(key=cmp_to_key(lambda a, b: a + b < b + a))
print("".join(nums))`,
      explain: `The comparator returns <code>True</code> (1, meaning "a after b") or <code>False</code> (0, meaning "equal"), never a negative number, so the sort is never told "a goes first". The result is some order, but not the right one (<code>9534330</code>). Return −1, 0 or 1.`,
    },
    {
      id: "d5", kind: "predict", title: "Do touching ends clash?",
      code: `def count(intervals):
    intervals.sort(key=lambda iv: iv[1])
    n, end = 0, float("-inf")
    for s, e in intervals:
        if s > end:
            n += 1
            end = e
    return n

print(count([[1, 2], [2, 3], [3, 4]]))`,
      explain: `With <code>&gt;</code>, <code>[2, 3]</code> starts exactly where <code>[1, 2]</code> ends, so it counts as a clash and is skipped. That's right for balloons (452: one arrow at 2 hits both) and wrong for meetings (435: back-to-back is fine, use <code>&gt;=</code>).`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "Gas station", leetcode: 134,
      fn: "start_station",
      prompt: `Stations sit in a circle. At station <code>i</code> you get <code>gas[i]</code>, and driving to the next one costs <code>cost[i]</code>. Starting with an empty tank, return the index to start from to get all the way round, or −1. The answer is unique if it exists. Do it in O(n), one pass.`,
      stub: `def start_station(gas, cost):
    `,
      cases: `[
        (([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]), 3),
        (([2, 3, 4], [3, 4, 3]), -1),
        (([5], [4]), 0),
        (([3, 1, 1], [1, 2, 2]), 0),
        (([1, 2], [2, 1]), 1),
      ]`,
      solution: `def start_station(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    start, tank = 0, 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    return start`,
      note: `Why jump <code>start</code> straight to <code>i + 1</code>: if you start at <code>s</code> and run dry at <code>i</code>, you reached every station in between with a tank of at least 0. Starting at one of them means arriving at <code>i</code> with less, so they all fail too. One failure rules out a whole block. The total check means an answer exists, and the last start standing is it.`,
    },
    {
      id: "p2", kind: "problem", title: "Partition labels", leetcode: 763,
      fn: "partition_labels",
      prompt: `Split the string into as many pieces as possible so that each letter appears in at most one piece. Return the pieces' lengths in order.`,
      stub: `def partition_labels(s):
    `,
      cases: `[
        (("ababcbacadefegdehijhklij",), [9, 7, 8]),
        (("eccbbbbdec",), [10]),
        (("a",), [1]),
        (("abc",), [1, 1, 1]),
      ]`,
      solution: `def partition_labels(s):
    last = {c: i for i, c in enumerate(s)}
    out, start, end = [], 0, 0
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            out.append(end - start + 1)
            start = i + 1
    return out`,
      note: `Rep r5 with letters: each letter stretches the piece to its last appearance, and you cut when <code>i</code> catches up with the stretch. It's also Jump Game's <code>reach</code> wearing different clothes.`,
    },
    {
      id: "p3", kind: "problem", title: "Fewest arrows to burst balloons", leetcode: 452,
      fn: "min_arrows",
      prompt: `Each balloon covers <code>[start, end]</code> on a line. An arrow shot at <code>x</code> bursts every balloon with <code>start ≤ x ≤ end</code>. Return the fewest arrows that burst them all.<span class="trees"><span class="ivals" data-ivals="[[10, 16], [2, 8], [1, 6], [7, 12]]" data-cap="First test: 2 arrows burst all four."></span></span>`,
      stub: `def min_arrows(points):
    `,
      cases: `[
        (([[10, 16], [2, 8], [1, 6], [7, 12]],), 2),
        (([[1, 2], [3, 4], [5, 6], [7, 8]],), 4),
        (([[1, 2], [2, 3], [3, 4], [4, 5]],), 2),
        (([[1, 2]],), 1),
        (([[-2147483648, 2147483647]],), 1),
      ]`,
      solution: `def min_arrows(points):
    points.sort(key=lambda p: p[1])
    arrows, x = 0, float("-inf")
    for s, e in points:
        if s > x:
            arrows += 1
            x = e
    return arrows`,
      note: `Shoot at the end of the balloon that ends first: any arrow further left misses nothing extra, and any arrow further right misses that balloon. Note <code>&gt;</code>: a balloon that starts exactly at <code>x</code> is hit (predict d5).`,
    },
    {
      id: "p4", kind: "problem", title: "Candy", leetcode: 135,
      fn: "candies",
      prompt: `Children stand in a line with <code>ratings</code>. Each gets at least one candy, and a child with a higher rating than a neighbour must get more than that neighbour. Return the fewest candies in total.`,
      stub: `def candies(ratings):
    `,
      cases: `[
        (([1, 0, 2],), 5),
        (([1, 2, 2],), 4),
        (([1, 2, 87, 87, 87, 2, 1],), 13),
        (([5],), 1),
        (([1, 3, 4, 5, 2],), 11),
      ]`,
      solution: `def candies(ratings):
    n = len(ratings)
    c = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            c[i] = c[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            c[i] = max(c[i], c[i + 1] + 1)
    return sum(c)`,
      note: `Each pass makes one direction of the rule true: left neighbours first, then right. <code>max</code> in the second pass keeps what the first pass needed. Writing <code>c[i + 1] + 1</code> on its own would break the left rule again (the last test catches that).`,
    },
    {
      id: "p5", kind: "problem", title: "Two city scheduling", leetcode: 1029,
      fn: "two_city",
      prompt: `<code>costs[i] = [a, b]</code> is the cost of flying person <code>i</code> to city A or to city B. Exactly half go to each city. Return the lowest total cost.`,
      stub: `def two_city(costs):
    `,
      cases: `[
        (([[10, 20], [30, 200], [400, 50], [30, 20]],), 110),
        (([[259, 770], [448, 54], [926, 667], [184, 139], [840, 118], [577, 469]],), 1859),
        (([[1, 2], [3, 4]],), 5),
        (([[5, 5], [5, 5]],), 10),
      ]`,
      solution: `def two_city(costs):
    costs.sort(key=lambda c: c[0] - c[1])
    half = len(costs) // 2
    return sum(a for a, _ in costs[:half]) + sum(b for _, b in costs[half:])`,
      note: `Picture everyone booked to B first. Moving a person to A changes the total by <code>a − b</code>. You must move exactly half, so move the half with the smallest <code>a − b</code>. Sorting by cheapest A, or by smallest <code>min(a, b)</code>, both break, and that's worth checking by hand.`,
    },
    {
      id: "p6", kind: "problem", title: "Hand of straights", leetcode: 846,
      fn: "can_group",
      prompt: `Can <code>hand</code> be split into groups of exactly <code>size</code> consecutive values (like 3, 4, 5)? Every card must be used.`,
      stub: `def can_group(hand, size):
    `,
      cases: `[
        (([1, 2, 3, 6, 2, 3, 4, 7, 8], 3), True),
        (([1, 2, 3, 4, 5], 4), False),
        (([1], 1), True),
        (([1, 1, 2, 2, 3, 3], 3), True),
        (([1, 2, 3, 3, 4, 4, 5, 6], 4), True),
        (([3, 4, 5, 7], 2), False),
      ]`,
      solution: `from collections import Counter

def can_group(hand, size):
    if len(hand) % size:
        return False
    count = Counter(hand)
    for x in sorted(count):
        k = count[x]
        if k == 0:
            continue
        for y in range(x, x + size):
            if count[y] < k:
                return False
            count[y] -= k
    return True`,
      note: `The smallest card left <em>has</em> to start a group, because nothing smaller is left for it to join. That forced move is the greedy, and it needs no exchange argument. Starting all <code>k</code> copies' groups at once makes it O(n log n) for the sort plus O(n · size).`,
    },
  ],

  fromBlank: ["r2", "r4", "r6", "p1", "p3", "p6"],

  leetcode: [
    { n: 55, title: "Jump Game", slug: "jump-game" },
    { n: 45, title: "Jump Game II", slug: "jump-game-ii" },
    { n: 53, title: "Maximum Subarray", slug: "maximum-subarray" },
    { n: 769, title: "Max Chunks To Make Sorted", slug: "max-chunks-to-make-sorted" },
    { n: 179, title: "Largest Number", slug: "largest-number" },
    { n: 134, title: "Gas Station", slug: "gas-station" },
    { n: 763, title: "Partition Labels", slug: "partition-labels" },
    { n: 452, title: "Minimum Number of Arrows to Burst Balloons", slug: "minimum-number-of-arrows-to-burst-balloons" },
    { n: 135, title: "Candy", slug: "candy" },
    { n: 1029, title: "Two City Scheduling", slug: "two-city-scheduling" },
    { n: 846, title: "Hand of Straights", slug: "hand-of-straights" },
    { n: 406, title: "Queue Reconstruction by Height", slug: "queue-reconstruction-by-height" },
    { n: 630, title: "Course Schedule III (greedy + heap)", slug: "course-schedule-iii" },
  ],
});
