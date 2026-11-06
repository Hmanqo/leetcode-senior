COURSE.lesson({
  id: "14",
  title: "Mixed",
  tagline: "Nothing new: unlabelled problems from lessons 01–13. Choosing the tool is the test.",

  intro: `
<p>In an interview nobody tells you which lesson a problem belongs to. Everything here is unlabelled: the reps and
problems don't name a technique, and the note after each one says which lesson it came from. Before typing, spend
thirty seconds on the questions below and say your choice out loud, with its complexity.</p>

<h3>Signals → tool</h3>
<table>
<thead><tr><th>If the problem says or implies…</th><th>Reach for</th><th>Lesson</th></tr></thead>
<tbody>
<tr><td>a tree, "path", "ancestor", "level"</td><td>recursion (what goes down, what comes up) or a queue by levels</td><td>01</td></tr>
<tr><td>a run summing to k, with negatives, or "divisible by"</td><td>running total + dict</td><td>02</td></tr>
<tr><td>longest / shortest run where some condition holds, which shrinking keeps</td><td>sliding window</td><td>03</td></tr>
<tr><td>pairs or triples in sorted (or sortable) data, in place, O(1) space</td><td>two pointers</td><td>04</td></tr>
<tr><td>"minimise the maximum", "smallest x that works", sorted or rotated</td><td>binary search on a False…True check</td><td>05</td></tr>
<tr><td>"next greater / smaller", spans, nested brackets</td><td>monotonic stack, stack of states</td><td>06</td></tr>
<tr><td>k-th, top k, a running median, "always the smallest available"</td><td>heap, quickselect, buckets</td><td>07</td></tr>
<tr><td>start/end pairs, "at the same time"</td><td>sort by start, or events</td><td>08</td></tr>
<tr><td>a local choice you can prove safe</td><td>greedy (then try to break it)</td><td>09</td></tr>
<tr><td>"all" combinations / arrangements / ways to split</td><td>backtracking</td><td>10</td></tr>
<tr><td>"how many ways" or "best", and the same sub-question repeats</td><td>DP</td><td>11–12</td></tr>
<tr><td>"design a class"</td><td>one structure per operation, kept in sync</td><td>13</td></tr>
</tbody>
</table>

<h3>When nothing jumps out</h3>
<ol>
<li><b>Write the brute force</b>, even only in your head, and state its cost.</li>
<li><b>Find the repeated work</b> in it: a sum recomputed for each start (→ prefix sums), a scan that rereads items it
already passed (→ stack or window), a sub-question asked twice (→ DP). Walks w1 and w2 practise exactly this.</li>
<li><b>Look at the constraints:</b> n ≤ 20 allows 2ⁿ (bitmask, backtracking), n ≤ 10⁴ allows n², and n ≤ 10⁵ needs
n log n or better.</li>
</ol>

<h3>How to use this lesson</h3>
<p>Do it last, and come back to it. For each problem, decide on the tool <em>before</em> opening the editor, then check
the note afterwards. If the tool was wrong, add a line to <code>QA.md</code>: the problem, the tool you picked, the
right one, and the signal you missed.</p>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "Find the repeated work (1)",
      prompt: `A brute force: count the runs that sum to 3, trying every start and every end. Watch <code>total</code> as the inner loop runs. For each new start it rebuilds sums it has already built. What would remove that?`,
      code: `def count_k(nums, k):
    count = 0
    for i in range(len(nums)):
        total = 0
        for j in range(i, len(nums)):
            total += nums[j]  # ask 3,7: (i, j, total)
            if total == k:
                count += 1
    return count

print(count_k([1, 2, 1, 2], 3))`,
      note: `Every <code>total</code> is a difference of two running totals from the start: <code>sum(i..j) = P[j + 1] − P[i]</code>. Asking "how many earlier totals equal <code>P − k</code>?" in a dict removes the inner loop, which is lesson 02. Spotting "a sum rebuilt for every start" is the signal.`,
    },
    {
      id: "w2", kind: "walk", title: "Find the repeated work (2)",
      prompt: `A brute force: for each item, scan right for the first bigger one. Watch <code>j</code>: the scans from different starts walk over the same items again and again.`,
      code: `def next_greater(nums):
    out = []
    for i in range(len(nums)):
        ans = -1
        for j in range(i + 1, len(nums)):
            if nums[j] > nums[i]:  # ask 2,6: (i, j)
                ans = nums[j]
                break
        out.append(ans)
    return out

print(next_greater([5, 4, 3, 2, 6]))`,
      note: `On a falling run, every start scans all the way to the 6, so it's O(n²). The items being rescanned are the ones still waiting for something bigger. Keep them on a stack and let the 6 answer them all at once: lesson 06. Spotting "many items waiting for the same future event" is the signal.`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "It looks like a window",
      prompt: `"Longest run with sum ≤ k" sounds like lesson 03. This sliding window grows on the right and shrinks while the sum is over k. Find an input where it's wrong.`,
      fn: "longest_at_most", args: "nums, k",
      code: `def longest_at_most(nums, k):
    left = total = best = 0
    for right, x in enumerate(nums):
        total += x
        while total > k and left <= right:
            total -= nums[left]
            left += 1
        best = max(best, right - left + 1)
    return best`,
      ref: "right",
      right: `def right(nums, k):
    best = 0
    for i in range(len(nums)):
        for j in range(i, len(nums)):
            if sum(nums[i:j + 1]) <= k:
                best = max(best, j - i + 1)
    return best`,
      valid: `lambda nums, k: (isinstance(nums, list) and 1 <= len(nums) <= 8 and all(type(x) is int and -9 <= x <= 9 for x in nums) and type(k) is int and -20 <= k <= 20) or "nums: 1 to 8 whole numbers from -9 to 9; k: -20 to 20."`,
      rules: `<code>nums</code>: 1–8 whole numbers from −9 to 9. <code>k</code>: −20 to 20.`,
      example: `[2, -3, 2], 1`,
      explain: `The 2 at the start is dropped because it's too big alone, but with the −3 after it, the whole list sums to 1. With negatives, shrinking can throw away a start that a later item would have rescued. The window needs all-positive numbers, so check the constraints before picking it.`,
    },
    {
      id: "b2", kind: "breakit", title: "It looks like two pointers",
      prompt: `"Return the indices of two numbers adding up to target" sounds like lesson 04. This sorts a copy and squeezes. Find an input where the indices are wrong.`,
      fn: "two_sum", args: "nums, target",
      code: `def two_sum(nums, target):
    s = sorted(nums)
    lo, hi = 0, len(s) - 1
    while lo < hi:
        total = s[lo] + s[hi]
        if total == target:
            return [lo, hi]
        if total < target:
            lo += 1
        else:
            hi -= 1
    return None`,
      ref: "right",
      right: `def right(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return None`,
      valid: `lambda nums, t: (isinstance(nums, list) and 2 <= len(nums) <= 8 and all(type(x) is int and -9 <= x <= 9 for x in nums) and type(t) is int and sum(1 for i in range(len(nums)) for j in range(i + 1, len(nums)) if nums[i] + nums[j] == t) == 1) or "nums: 2 to 8 whole numbers from -9 to 9, with exactly one pair summing to target."`,
      rules: `2–8 whole numbers from −9 to 9, with exactly one pair summing to <code>target</code>.`,
      example: `[3, 2, 4], 6`,
      explain: `Sorting moved the values, so the indices it returns are positions in the sorted copy, not in the input. When the answer is about original positions, sort <code>(value, index)</code> pairs, or use the one-pass dict, which is O(n) and needs no sort at all.`,
    },
    {
      id: "b3", kind: "breakit", title: "It looks like greedy",
      prompt: `"Best profit from <b>one</b> buy and one later sell." This adds up every daily rise, which is right when you may trade as often as you like. Find prices where it's wrong for one trade.`,
      fn: "max_profit", args: "prices",
      code: `def max_profit(prices):
    return sum(max(0, b - a) for a, b in zip(prices, prices[1:]))`,
      ref: "right",
      right: `def right(prices):
    low, best = float("inf"), 0
    for p in prices:
        low = min(low, p)
        best = max(best, p - low)
    return best`,
      valid: `lambda prices: (isinstance(prices, list) and 1 <= len(prices) <= 8 and all(type(x) is int and 0 <= x <= 9 for x in prices)) or "1 to 8 prices from 0 to 9."`,
      rules: `1–8 prices from 0 to 9.`,
      example: `[1, 5, 3, 8]`,
      explain: `It books two trades, 1 → 5 and 3 → 8, but only one is allowed: buy at 1 and sell at 8 earns 7. One small word in the statement ("one", "at most two", "cooldown") moves the problem between lesson 09 (greedy) and lesson 12 (a state machine). Read it twice.`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "Count pairs with a sum",
      fn: "pairs_with_sum", sig: "pairs_with_sum(nums: list[int], k: int) -> int",
      prompt: `Count the index pairs <code>i &lt; j</code> with <code>nums[i] + nums[j] == k</code>, in O(n).`,
      cases: `[
        (([1, 5, 7, -1, 5], 6), 3),
        (([1, 1, 1, 1], 2), 6),
        (([1, 2], 5), 0),
        (([3, 3, 3], 6), 3),
      ]`,
      solution: `def pairs_with_sum(nums, k):
    seen = {}
    count = 0
    for x in nums:
        count += seen.get(k - x, 0)
        seen[x] = seen.get(x, 0) + 1
    return count`,
      note: `Lesson 02's "look up, then record" with values instead of running totals. Recording after looking up is what keeps <code>i &lt; j</code> and stops an item pairing with itself.`,
    },
    {
      id: "r2", kind: "rep", title: "Longest run under a budget",
      fn: "longest_under", sig: "longest_under(nums: list[int], k: int) -> int",
      prompt: `All numbers are positive. Return the length of the longest run of neighbours whose sum is at most <code>k</code>, in O(n).`,
      cases: `[
        (([1, 2, 1, 3, 1], 4), 3),
        (([5], 4), 0),
        (([1, 1, 1], 10), 3),
        (([4, 1, 1, 1, 4], 3), 3),
      ]`,
      solution: `def longest_under(nums, k):
    left = total = best = 0
    for right, x in enumerate(nums):
        total += x
        while total > k:
            total -= nums[left]
            left += 1
        best = max(best, right - left + 1)
    return best`,
      note: `Lesson 03. "All positive" is the line that makes the window safe. Compare Break it b1, which is the same code with negatives allowed.`,
    },
    {
      id: "r3", kind: "rep", title: "Days until something smaller",
      fn: "until_smaller", sig: "until_smaller(nums: list[int]) -> list[int]",
      prompt: `For each item, return how many steps to the right the first strictly smaller item is, or 0 if none, in O(n).`,
      cases: `[
        (([5, 3, 4, 1, 6],), [1, 2, 1, 0, 0]),
        (([1, 2, 3],), [0, 0, 0]),
        (([3, 2, 1],), [1, 1, 0]),
        (([2, 2, 1],), [2, 1, 0]),
      ]`,
      solution: `def until_smaller(nums):
    out = [0] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] > x:
            j = stack.pop()
            out[j] = i - j
        stack.append(i)
    return out`,
      note: `Lesson 06, mirrored: "next smaller" pops while the top is bigger, so the stack's values go <em>up</em>. Store indices, since the answer is a distance.`,
    },
    {
      id: "r4", kind: "rep", title: "Cube root, rounded up",
      fn: "cube_root_up", sig: "cube_root_up(n: int) -> int",
      prompt: `Return the smallest whole <code>x ≥ 0</code> with <code>x * x * x &gt;= n</code> (n ≥ 0), using only integer arithmetic, in O(log n).`,
      cases: `[
        ((27,), 3),
        ((28,), 4),
        ((1,), 1),
        ((0,), 0),
        ((1000000000000000000,), 1000000),
      ]`,
      mustNot: [{ re: "\\*\\*|pow|math", msg: "Integer search only: no **, pow or math." }],
      solution: `def cube_root_up(n):
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi) // 2
        if mid * mid * mid >= n:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      note: `Lesson 05's first-True template, unchanged. "Smallest x such that …" is the signal. Floats would round wrongly near 10¹⁸, which is why it's integers.`,
    },
    {
      id: "r5", kind: "rep", title: "Most common words", leetcode: 692,
      fn: "top_words", sig: "top_words(words: list[str], k: int) -> list[str]",
      prompt: `Return the <code>k</code> most frequent words, most frequent first, and alphabetically among equal counts.`,
      cases: `[
        ((["i", "love", "leetcode", "i", "love", "coding"], 2), ["i", "love"]),
        ((["the", "day", "is", "sunny", "the", "the", "the", "sunny", "is", "is"], 4), ["the", "is", "sunny", "day"]),
        ((["b", "a"], 2), ["a", "b"]),
      ]`,
      solution: `from collections import Counter

def top_words(words, k):
    count = Counter(words)
    return sorted(count, key=lambda w: (-count[w], w))[:k]`,
      note: `A sort key of <code>(-count, word)</code> handles "most first, then alphabetical" in one go. The heap version (lesson 07) is O(n log k), but the tie order needs care, because a min-heap of size k must evict the <em>alphabetically later</em> word among equals. Know both, write the sort.`,
    },
    {
      id: "r6", kind: "rep", title: "Tiling a 2 × n strip",
      fn: "tilings", sig: "tilings(n: int) -> int",
      prompt: `Count the ways to cover a 2 × n strip with 2 × 1 dominoes (either way round), in O(n) time and O(1) space.`,
      cases: `[
        ((1,), 1),
        ((2,), 2),
        ((3,), 3),
        ((5,), 8),
        ((60,), 2504730781961),
      ]`,
      solution: `def tilings(n):
    a, b = 1, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b`,
      note: `Lesson 11. The left end is either one upright domino (leaving n − 1) or two flat ones stacked (leaving n − 2), so <code>f(n) = f(n − 1) + f(n − 2)</code>. Recognising a known recurrence under a new story is half of DP.`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "Counter arithmetic",
      code: `from collections import Counter
need = Counter("aab")
have = Counter("abb")
print(need - have)
print((need - have) == Counter())`,
      explain: `Subtracting Counters keeps only counts that stay <em>positive</em>, so it reads as "what's still missing": one 'a'. That's a one-line "can <code>have</code> cover <code>need</code>?" check: <code>not (need - have)</code>.`,
    },
    {
      id: "d2", kind: "predict", title: "Binary search on unsorted data",
      code: `from bisect import bisect_left
data = [3, 1, 2]
i = bisect_left(data, 2)
print(i, 2 in data)`,
      explain: `<code>bisect</code> doesn't check that the list is sorted. It quietly returns a position that means nothing here. Binary search needs a False…True order, and if you can't name it, you can't use bisect.`,
    },
    {
      id: "d3", kind: "predict", title: "Sorting by two keys",
      code: `scores = {"cy": 3, "al": 5, "bo": 3}
print(sorted(scores, key=lambda n: (-scores[n], n)))
print(sorted(scores, key=lambda n: scores[n], reverse=True))`,
      explain: `The tuple key sorts by score, highest first, then by name for ties. <code>reverse=True</code> on the score alone keeps tied names in their original order (the sort is stable), so "cy" stays before "bo" just because the dict was written that way. Spell out the tie-break whenever the problem states one.`,
    },
    {
      id: "d4", kind: "predict", title: "Recursion that's secretly quadratic",
      code: `calls = 0
def total(nums):
    global calls
    calls += 1
    if not nums:
        return 0
    return nums[0] + total(nums[1:])

print(total(list(range(10))), calls)`,
      explain: `It's correct, but each call copies the rest of the list with <code>nums[1:]</code>: O(n) per call, O(n²) in all, plus a frame per item. Pass an index instead of a slice. That's also what lets <code>@cache</code> work (lesson 11).`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "Longest consecutive sequence", leetcode: 128,
      fn: "longest_consecutive",
      prompt: `Return the length of the longest run of consecutive integers (like 1, 2, 3, 4) that can be formed from the values in <code>nums</code>, in O(n).`,
      stub: `def longest_consecutive(nums):
    `,
      cases: `[
        (([100, 4, 200, 1, 3, 2],), 4),
        (([0, 3, 7, 2, 5, 8, 4, 6, 0, 1],), 9),
        (([],), 0),
        (([1, 2, 0, 1],), 3),
      ]`,
      solution: `def longest_consecutive(nums):
    have = set(nums)
    best = 0
    for x in have:
        if x - 1 not in have:
            y = x
            while y + 1 in have:
                y += 1
            best = max(best, y - x + 1)
    return best`,
      note: `Sorting is O(n log n). The O(n) way is a set and only counting <em>up</em> from values with no predecessor, so each run is walked once. It's no particular lesson: "a set answers 'is x there?' in O(1)" is the tool.`,
    },
    {
      id: "p2", kind: "problem", title: "Minimum operations to reduce x to zero", leetcode: 1658,
      fn: "min_ops",
      prompt: `Each operation removes the leftmost or the rightmost item of <code>nums</code> (all positive) and subtracts it from <code>x</code>. Return the fewest operations that bring x to exactly 0, or −1.`,
      stub: `def min_ops(nums, x):
    `,
      cases: `[
        (([1, 1, 4, 2, 3], 5), 2),
        (([5, 6, 7, 8, 9], 4), -1),
        (([3, 2, 20, 1, 1, 3], 10), 5),
        (([1, 1], 3), -1),
        (([5], 5), 1),
      ]`,
      solution: `def min_ops(nums, x):
    target = sum(nums) - x
    if target < 0:
        return -1
    left = total = 0
    best = -1
    for right, v in enumerate(nums):
        total += v
        while total > target:
            total -= nums[left]
            left += 1
        if total == target:
            best = max(best, right - left + 1)
    return -1 if best < 0 else len(nums) - best`,
      note: `Removing from both ends leaves a middle run that sums to <code>total − x</code>, so "fewest removed" = "longest middle run with that sum". All positive, so it's a lesson 03 window. Turning the question inside out is the real skill here.`,
    },
    {
      id: "p3", kind: "problem", title: "Maximum length of pair chain", leetcode: 646,
      fn: "longest_chain",
      prompt: `Pair <code>[c, d]</code> can follow <code>[a, b]</code> if <code>b &lt; c</code>. Return the length of the longest chain you can build (pairs in any order, each used at most once).`,
      stub: `def longest_chain(pairs):
    `,
      cases: `[
        (([[1, 2], [2, 3], [3, 4]],), 2),
        (([[1, 2], [7, 8], [4, 5]],), 3),
        (([[1, 2]],), 1),
        (([[-6, 9], [1, 6], [8, 10], [-1, 4], [-6, -2], [-9, 8], [-5, 3], [0, 3]],), 3),
      ]`,
      solution: `def longest_chain(pairs):
    pairs.sort(key=lambda p: p[1])
    count, end = 0, float("-inf")
    for a, b in pairs:
        if a > end:
            count += 1
            end = b
    return count`,
      note: `Disguised interval scheduling: sort by end, take whatever fits (lesson 09, with strict <code>&gt;</code> because touching isn't allowed). The DP version (like LIS) is O(n²) and also correct. The greedy wins because the exchange argument holds.`,
    },
    {
      id: "p4", kind: "problem", title: "Maximum product subarray", leetcode: 152,
      fn: "max_product",
      prompt: `Return the largest product of a non-empty run of neighbours, in O(n).`,
      stub: `def max_product(nums):
    `,
      cases: `[
        (([2, 3, -2, 4],), 6),
        (([-2, 0, -1],), 0),
        (([-2, 3, -4],), 24),
        (([-2],), -2),
        (([0, 2],), 2),
      ]`,
      solution: `def max_product(nums):
    hi = lo = best = nums[0]
    for x in nums[1:]:
        hi, lo = max(x, hi * x, lo * x), min(x, hi * x, lo * x)
        best = max(best, hi)
    return best`,
      note: `Kadane (lesson 09) breaks, because a very negative product can flip to the best one after another negative. So keep two states, the biggest and the smallest product ending here, updated together: a lesson 12 state machine with two states.`,
    },
    {
      id: "p5", kind: "problem", title: "Car fleet", leetcode: 853,
      fn: "car_fleet",
      prompt: `Cars on a one-lane road drive toward <code>target</code>. Car i starts at <code>position[i]</code> with <code>speed[i]</code>. A car that catches up with a slower one ahead joins it and moves at its speed (a fleet). Return how many fleets arrive.`,
      stub: `def car_fleet(target, position, speed):
    `,
      cases: `[
        ((12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]), 3),
        ((10, [3], [3]), 1),
        ((100, [0, 2, 4], [4, 2, 1]), 1),
        ((10, [0, 4, 2], [2, 1, 3]), 1),
        ((10, [6, 8], [3, 2]), 2),
      ]`,
      solution: `def car_fleet(target, position, speed):
    cars = sorted(zip(position, speed), reverse=True)
    fleets, slowest = 0, 0.0
    for p, s in cars:
        t = (target - p) / s
        if t > slowest:
            fleets += 1
            slowest = t
    return fleets`,
      note: `Sort by position, nearest the target first (lesson 04's "sort makes it easy"). A car forms a new fleet only if it would arrive <em>later</em> than the fleet ahead, otherwise it catches up and merges. Equivalent to a monotonic stack of arrival times (lesson 06) where only the top is ever compared.`,
    },
    {
      id: "p6", kind: "problem", title: "Find the duplicate number", leetcode: 287,
      fn: "find_duplicate",
      prompt: `<code>nums</code> has n + 1 values, each between 1 and n, so at least one repeats. Exactly one value repeats (possibly many times). Return it without changing <code>nums</code> and with O(1) extra space.`,
      stub: `def find_duplicate(nums):
    `,
      cases: `[
        (([1, 3, 4, 2, 2],), 2),
        (([3, 1, 3, 4, 2],), 3),
        (([3, 3, 3, 3, 3],), 3),
        (([1, 1],), 1),
        (([2, 5, 9, 6, 9, 3, 8, 9, 7, 1],), 9),
      ]`,
      solution: `def find_duplicate(nums):
    lo, hi = 1, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if sum(1 for x in nums if x <= mid) > mid:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      note: `Not changing the list rules out cyclic sort (lesson 07), and O(1) space rules out a set. Binary search on the <em>value</em> works (lesson 05): "more than m values are ≤ m" is False…True in m, and first True is the duplicate. O(n log n). The O(n) answer is Floyd's cycle finding, treating <code>i → nums[i]</code> as a linked list (the linked-list course).`,
    },
    {
      id: "p7", kind: "problem", title: "Find all anagrams in a string", leetcode: 438,
      fn: "find_anagrams",
      prompt: `Return every start index in <code>s</code> where a rearrangement of <code>p</code> begins, in increasing order.`,
      stub: `def find_anagrams(s, p):
    `,
      cases: `[
        (("cbaebabacd", "abc"), [0, 6]),
        (("abab", "ab"), [0, 1, 2]),
        (("a", "ab"), []),
        (("aaa", "a"), [0, 1, 2]),
      ]`,
      solution: `from collections import Counter

def find_anagrams(s, p):
    k = len(p)
    need, window = Counter(p), Counter(s[:k])
    out = [0] if window == need and len(s) >= k else []
    for i in range(k, len(s)):
        window[s[i]] += 1
        window[s[i - k]] -= 1
        if window == need:
            out.append(i - k + 1)
    return out`,
      note: `Fixed-size window with a letter count (lesson 03, rep r6) recording every match instead of stopping at the first. The start index of the window ending at <code>i</code> is <code>i − k + 1</code>.`,
    },
    {
      id: "p8", kind: "problem", title: "Minimum falling path sum", leetcode: 931,
      fn: "min_falling",
      prompt: `Starting anywhere in the top row of a square grid, move down one row at a time to the cell directly below or diagonally left or right below. Return the smallest possible sum of a path to the bottom row.`,
      stub: `def min_falling(grid):
    `,
      cases: `[
        (([[2, 1, 3], [6, 5, 4], [7, 8, 9]],), 13),
        (([[-19, 57], [-40, -5]],), -59),
        (([[5]],), 5),
        (([[1, 2, 3], [4, 5, 6], [7, 8, 9]],), 12),
      ]`,
      solution: `def min_falling(grid):
    n = len(grid)
    row = grid[0][:]
    for r in range(1, n):
        new = []
        for c in range(n):
            best = row[c]
            if c > 0:
                best = min(best, row[c - 1])
            if c < n - 1:
                best = min(best, row[c + 1])
            new.append(best + grid[r][c])
        row = new
    return min(row)`,
      note: `Lesson 11's grid table, one row at a time. Unlike rep r3 there, each cell reads <em>both</em> diagonals of the previous row, so updating in place would overwrite a value its right neighbour still needs. Build a new row.`,
    },
  ],

  fromBlank: ["r1", "r3", "r4", "p2", "p4", "p6"],

  leetcode: [
    { n: 1, title: "Two Sum", slug: "two-sum" },
    { n: 121, title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock" },
    { n: 128, title: "Longest Consecutive Sequence", slug: "longest-consecutive-sequence" },
    { n: 692, title: "Top K Frequent Words", slug: "top-k-frequent-words" },
    { n: 1658, title: "Minimum Operations to Reduce X to Zero", slug: "minimum-operations-to-reduce-x-to-zero" },
    { n: 646, title: "Maximum Length of Pair Chain", slug: "maximum-length-of-pair-chain" },
    { n: 152, title: "Maximum Product Subarray", slug: "maximum-product-subarray" },
    { n: 853, title: "Car Fleet", slug: "car-fleet" },
    { n: 287, title: "Find the Duplicate Number", slug: "find-the-duplicate-number" },
    { n: 438, title: "Find All Anagrams in a String", slug: "find-all-anagrams-in-a-string" },
    { n: 931, title: "Minimum Falling Path Sum", slug: "minimum-falling-path-sum" },
    { n: 1838, title: "Frequency of the Most Frequent Element", slug: "frequency-of-the-most-frequent-element" },
    { n: 659, title: "Split Array into Consecutive Subsequences", slug: "split-array-into-consecutive-subsequences" },
    { n: 2024, title: "Maximize the Confusion of an Exam", slug: "maximize-the-confusion-of-an-exam" },
  ],
});
