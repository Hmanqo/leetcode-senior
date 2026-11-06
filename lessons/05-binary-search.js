COURSE.lesson({
  id: "05",
  title: "Binary search on the answer",
  tagline: "One template: the first value where ok() turns True. Search a sorted list, or search the answer itself with an \"is this guess possible?\" check.",

  intro: `
<p>Most binary search bugs come from switching between three or four templates. Use one. Every binary search here
answers the same question: <b>on a range where <code>ok(x)</code> goes False, False, …, True, True, which is the
first True?</b></p>

<pre><code>lo, hi = SMALLEST_POSSIBLE, LARGEST_POSSIBLE   # the answer is somewhere in [lo, hi]
while lo &lt; hi:
    mid = (lo + hi) // 2
    if ok(mid):
        hi = mid          # mid might be the answer: keep it
    else:
        lo = mid + 1      # mid is not: drop it
return lo                 # lo == hi: the first True</code></pre>
<p>It always ends: the range shrinks every turn, because <code>mid &lt; hi</code> when <code>lo &lt; hi</code>. Want the
<em>last</em> True instead? Find the first False and subtract 1, or flip the check.</p>

<h3>Searching a list</h3>
<p>"First index with <code>nums[i] &gt;= x</code>" is <code>ok(i) = nums[i] &gt;= x</code> on <code>[0, len(nums)]</code>.
Including <code>len(nums)</code> in the range means "not found" needs no special case. That's
<code>bisect_left</code>, and nearly every list search is built on it.</p>

<h3>Searching the answer</h3>
<p>The senior version: the question asks for the smallest speed, capacity or largest piece, and you don't know how
to compute it. But you <em>can</em> check a guess: "at speed 4, do I finish in time?" If a bigger guess is never
worse, the checks go False…True, so you binary search the guess. Three things to name before typing:</p>
<ol>
<li><b>The range:</b> a value certainly too small (or the smallest possible) and one certainly big enough.</li>
<li><b>The check:</b> usually a greedy O(n) pass that answers yes or no.</li>
<li><b>Why it's one-directional:</b> "if speed 4 works, speed 5 works too".</li>
</ol>
<p>Cost: O(n · log(range)), so even a range up to 10⁹ is only about 30 passes.</p>

<h3>Rotated lists</h3>
<p>A sorted list turned around a point (<code>[4, 5, 6, 7, 0, 1, 2]</code>). Compare <code>nums[mid]</code> with
<code>nums[hi]</code>: if it's bigger, the drop is to the right of <code>mid</code>. That's again a False…True check:
"is <code>nums[i] &lt;= nums[-1]</code>?" is True exactly from the minimum onwards.</p>

<h3>Traps</h3>
<ol>
<li><b>A range that misses the answer.</b> If the answer can be <code>max(piles)</code>, then <code>hi</code> must be at least that (Break it b1).</li>
<li><b><code>lo = mid</code> with <code>mid = (lo + hi) // 2</code>.</b> When <code>hi = lo + 1</code>, <code>mid</code> is <code>lo</code> and nothing moves: an infinite loop (predict d3). With this template you only ever write <code>lo = mid + 1</code>.</li>
<li><b>A check that isn't one-directional.</b> Binary search then quietly returns something wrong. Say why it is before you search.</li>
<li><b>Floor instead of ceiling.</b> Hours to eat 7 bananas at 2 an hour is 4, not 3: <code>(x + k − 1) // k</code> or <code>-(-x // k)</code>.</li>
<li><b>Rotated: comparing with <code>nums[lo]</code>.</b> That fails on a list that isn't rotated at all (b2). Compare with <code>nums[hi]</code>.</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>Complexity:</b> O(log n) for a list. O(n log(range)) for the answer search, and say what the range is.</li>
<li><b>"Why can you binary search here?"</b> Because the check is one-directional. Name the direction.</li>
<li><b>"With duplicates?"</b> Rotated lists with duplicates (81, 154) degrade to O(n) in the worst case, when <code>nums[mid] == nums[hi]</code> and you can only drop <code>hi</code> by one.</li>
<li><b>Python:</b> <code>bisect_left</code> and <code>bisect_right</code> exist. Know the template anyway, because answer searches have no list to hand them.</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "First index with value ≥ x",
      prompt: `Find where 5 belongs in a sorted list. <code>ok(i)</code> is <code>nums[i] &gt;= 5</code>, False then True. Watch the range <code>[lo, hi]</code> halve, and notice <code>hi</code> starts at <code>len(nums)</code>, one past the end.`,
      code: `def lower_bound(nums, x):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2  # ask: (lo, hi)
        if nums[mid] >= x:
            hi = mid
        else:
            lo = mid + 1
    return lo

print(lower_bound([1, 2, 4, 4, 5, 7, 9], 5))
print(lower_bound([1, 2, 4, 4, 5, 7, 9], 10))`,
      note: `When <code>nums[mid] &gt;= x</code>, mid might be the answer, so <code>hi = mid</code> keeps it. Otherwise it certainly isn't, so <code>lo = mid + 1</code> drops it. For 10, nothing is ≥ 10 and the answer is 7, one past the end, with no special case.`,
    },
    {
      id: "w2", kind: "walk", title: "Binary search on the answer",
      prompt: `Find the smallest divisor <code>d</code> so that the sum of <code>ceil(x / d)</code> over the list is at most 6. You don't solve for <code>d</code>: you guess it and check. Bigger divisors give smaller sums, so the checks go False…True.`,
      code: `def smallest_divisor(nums, threshold):
    def ok(d):
        return sum((x + d - 1) // d for x in nums) <= threshold
    lo, hi = 1, max(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):  # ask: (mid, sum((x + mid - 1) // mid for x in nums))
            hi = mid
        else:
            lo = mid + 1
    return lo

print(smallest_divisor([1, 2, 5, 9], 6))`,
      note: `The range is [1, max(nums)]: dividing by <code>max(nums)</code> makes every term 1, the smallest the sum can get, so if any divisor works, that one does. Each guess costs one O(n) pass, and there are about log₂(9) ≈ 3 guesses.`,
    },
    {
      id: "w3", kind: "walk", title: "Where a rotated list drops",
      prompt: `Find the smallest item of a sorted list that was turned around. Compare <code>nums[mid]</code> with <code>nums[hi]</code>: if it's bigger, the drop is somewhere to the right.`,
      code: `def rot_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:  # ask: (nums[lo], nums[mid], nums[hi])
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]

print(rot_min([4, 5, 6, 7, 0, 1, 2]))`,
      note: `<code>nums[mid] &gt; nums[hi]</code> means the stretch from mid to hi isn't sorted, so the drop (the minimum) is inside it and after mid. Otherwise mid..hi is sorted, so the minimum is at mid or to its left. It's the first-True template with <code>ok(i) = nums[i] &lt;= nums[hi]</code>.`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "A range one too small",
      prompt: `The same smallest-divisor search, but <code>hi</code> starts at <code>max(nums) − 1</code>. Find an input where the true answer is outside the range.`,
      fn: "smallest_divisor", args: "nums, threshold",
      code: `def smallest_divisor(nums, threshold):
    def ok(d):
        return sum((x + d - 1) // d for x in nums) <= threshold
    lo, hi = 1, max(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      ref: "right",
      right: `def right(nums, threshold):
    d = 1
    while sum((x + d - 1) // d for x in nums) > threshold:
        d += 1
    return d`,
      valid: `lambda nums, t: (isinstance(nums, list) and 1 <= len(nums) <= 6 and all(type(x) is int and 1 <= x <= 30 for x in nums) and type(t) is int and len(nums) <= t <= 100) or "nums is 1 to 6 whole numbers from 1 to 30, and threshold is at least len(nums) and at most 100."`,
      rules: `<code>nums</code>: 1–6 whole numbers from 1 to 30. <code>threshold</code>: from <code>len(nums)</code> to 100 (so an answer exists).`,
      example: `[5], 1`,
      explain: `The answer is 5, but the range stops at 4. The search can only return a value inside <code>[lo, hi]</code>, and it never checks whether that value actually works. So the first thing to settle is a <code>hi</code> that certainly works.`,
    },
    {
      id: "b2", kind: "breakit", title: "Rotated: compare with the left end",
      prompt: `This looks for the minimum of a rotated sorted list by comparing <code>nums[mid]</code> with <code>nums[lo]</code>. Find a list where it's wrong. (A list that was turned zero times counts as rotated.)`,
      fn: "rot_min", args: "nums",
      code: `def rot_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] >= nums[lo]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]`,
      ref: "right",
      right: `def right(nums):
    return min(nums)`,
      valid: `lambda nums: (isinstance(nums, list) and 1 <= len(nums) <= 8 and all(type(x) is int for x in nums) and len(set(nums)) == len(nums) and sum(nums[i] > nums[(i + 1) % len(nums)] for i in range(len(nums))) <= 1) or "a sorted list of 1 to 8 different whole numbers, turned around some point."`,
      rules: `1–8 different whole numbers, sorted and then rotated (rotating 0 times is allowed).`,
      example: `[1, 2, 3]`,
      explain: `<code>nums[mid] &gt;= nums[lo]</code> says "the left part is sorted", but that doesn't say the minimum is on the right. In an unrotated list the left part is sorted and the minimum is at the very start. Comparing with <code>nums[hi]</code> has no such blind spot.`,
    },
    {
      id: "b3", kind: "breakit", title: "Floor instead of ceiling",
      prompt: `The smallest-divisor check, but it rounds each <code>x / d</code> <b>down</b>. Find an input where it gets the answer wrong.`,
      fn: "smallest_divisor", args: "nums, threshold",
      code: `def smallest_divisor(nums, threshold):
    def ok(d):
        return sum(x // d for x in nums) <= threshold
    lo, hi = 1, max(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      ref: "right",
      right: `def right(nums, threshold):
    d = 1
    while sum((x + d - 1) // d for x in nums) > threshold:
        d += 1
    return d`,
      valid: `lambda nums, t: (isinstance(nums, list) and 1 <= len(nums) <= 6 and all(type(x) is int and 1 <= x <= 30 for x in nums) and type(t) is int and len(nums) <= t <= 100) or "nums is 1 to 6 whole numbers from 1 to 30, and threshold is at least len(nums) and at most 100."`,
      rules: `<code>nums</code>: 1–6 whole numbers from 1 to 30. <code>threshold</code>: from <code>len(nums)</code> to 100.`,
      example: `[1, 2, 5, 9], 6`,
      explain: `Rounding down makes every guess look cheaper (1 // 3 is 0, but you still need one step), so it accepts divisors that are too small. The search itself was fine: the check lied. When an answer search is wrong, test the check on its own first.`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "First index with value ≥ x",
      fn: "lower_bound", sig: "lower_bound(nums: list[int], x: int) -> int",
      prompt: `<code>nums</code> is sorted. Return the first index whose value is ≥ <code>x</code>, or <code>len(nums)</code> if none is. The template, with <code>hi = len(nums)</code>.`,
      cases: `[
        (([1, 3, 3, 5, 8], 3), 1),
        (([1, 3, 3, 5, 8], 4), 3),
        (([1, 3, 3, 5, 8], 9), 5),
        (([1, 3, 3, 5, 8], 0), 0),
        (([], 1), 0),
      ]`,
      mustNot: [{ re: "bisect", msg: "Write the loop yourself: no bisect." }],
      solution: `def lower_bound(nums, x):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] >= x:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      note: `This is <code>bisect.bisect_left</code>. Change <code>&gt;=</code> to <code>&gt;</code> and it's <code>bisect_right</code>: the first index <em>after</em> every copy of x.`,
    },
    {
      id: "r2", kind: "rep", title: "First and last position", leetcode: 34,
      fn: "search_range", sig: "search_range(nums: list[int], x: int) -> list[int]",
      prompt: `<code>nums</code> is sorted. Return <code>[first, last]</code> index of <code>x</code>, or <code>[-1, -1]</code>. Two searches with one helper: the first index ≥ x, and the first index ≥ x + 1, minus one.`,
      cases: `[
        (([5, 7, 7, 8, 8, 10], 8), [3, 4]),
        (([5, 7, 7, 8, 8, 10], 6), [-1, -1]),
        (([], 0), [-1, -1]),
        (([2, 2], 2), [0, 1]),
        (([1], 1), [0, 0]),
      ]`,
      mustNot: [{ re: "bisect|\\.index\\(", msg: "Two binary searches: no bisect or index()." }],
      solution: `def search_range(nums, x):
    def first_at_least(v):
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] >= v:
                hi = mid
            else:
                lo = mid + 1
        return lo
    start = first_at_least(x)
    if start == len(nums) or nums[start] != x:
        return [-1, -1]
    return [start, first_at_least(x + 1) - 1]`,
      note: `"Last index of x" is "first index of something bigger, minus one". Turning a "last" into a "first" keeps you on one template. (For non-integers, search with <code>&gt;</code> instead of using x + 1.)`,
    },
    {
      id: "r3", kind: "rep", title: "Integer square root", leetcode: 69,
      fn: "isqrt", sig: "isqrt(n: int) -> int",
      prompt: `Return the largest <code>k</code> with <code>k * k &lt;= n</code>, without <code>**</code> or <code>sqrt</code>. Find the first <code>k</code> with <code>k * k &gt; n</code>, then subtract 1.`,
      cases: `[
        ((8,), 2),
        ((16,), 4),
        ((0,), 0),
        ((1,), 1),
        ((2147395599,), 46339),
      ]`,
      mustNot: [{ re: "\\*\\*|\\bmath\\b|(?<!i)sqrt", msg: "Binary search: no ** or sqrt." }],
      solution: `def isqrt(n):
    lo, hi = 0, n + 1
    while lo < hi:
        mid = (lo + hi) // 2
        if mid * mid > n:
            hi = mid
        else:
            lo = mid + 1
    return lo - 1`,
      note: `"Largest k that works" became "first k that fails, minus one", so the template never changes. <code>hi = n + 1</code> is certainly too big, even for n = 0 and 1.`,
    },
    {
      id: "r4", kind: "rep", title: "Smallest divisor under a threshold", leetcode: 1283,
      fn: "smallest_divisor", sig: "smallest_divisor(nums: list[int], threshold: int) -> int",
      prompt: `Return the smallest positive <code>d</code> such that the sum of <code>ceil(x / d)</code> is at most <code>threshold</code> (one always exists). Write <code>ok(d)</code> first, then search <code>[1, max(nums)]</code>.`,
      cases: `[
        (([1, 2, 5, 9], 6), 5),
        (([44, 22, 33, 11, 1], 5), 44),
        (([21212, 10101, 12121], 1000000), 1),
        (([2, 3, 5, 7, 11], 11), 3),
      ]`,
      solution: `def smallest_divisor(nums, threshold):
    def ok(d):
        return sum((x + d - 1) // d for x in nums) <= threshold
    lo, hi = 1, max(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      note: `Koko (p1), shipping (p2) and splitting (p3) are this rep with a different <code>ok</code> and a different range. Say the range and the direction out loud before writing <code>ok</code>.`,
    },
    {
      id: "r5", kind: "rep", title: "First bad version", leetcode: 278,
      fn: "first_bad", sig: "first_bad(n: int, is_bad) -> int",
      adapt: "lambda f, n, bad: f(n, lambda v: v >= bad)",
      prompt: `Versions <code>1 … n</code> are good up to some point and bad from then on. You're given <code>is_bad(v)</code>. Return the first bad version with O(log n) calls. The tests build <code>is_bad</code> from the answer.`,
      cases: `[
        ((5, 4), 4),
        ((1, 1), 1),
        ((10, 1), 1),
        ((10, 10), 10),
        ((2126753390, 1702766719), 1702766719),
      ]`,
      solution: `def first_bad(n, is_bad):
    lo, hi = 1, n
    while lo < hi:
        mid = (lo + hi) // 2
        if is_bad(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      note: `The template with nothing else: the check is handed to you. This is the cleanest picture of what binary search needs, which is a False…True check, not a sorted list.`,
    },
    {
      id: "r6", kind: "rep", title: "A peak", leetcode: 162,
      fn: "peak", sig: "peak(nums: list[int]) -> int",
      adapt: "lambda f, a: (lambda i: isinstance(i, int) and 0 <= i < len(a) and (i == 0 or a[i - 1] < a[i]) and (i == len(a) - 1 or a[i + 1] < a[i]))(f(list(a)))",
      prompt: `Neighbours are never equal. Return the index of any item bigger than both its neighbours (the ends only need to beat one), in O(log n). The tests check that your index is a peak.`,
      cases: `[
        (([1, 2, 3, 1],), True),
        (([1, 2, 1, 3, 5, 6, 4],), True),
        (([1],), True),
        (([3, 2, 1],), True),
        (([1, 2],), True),
      ]`,
      solution: `def peak(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[mid + 1]:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      note: `The list isn't sorted, yet this works. If <code>nums[mid] &gt; nums[mid + 1]</code>, walking left from mid+1 goes uphill and must hit a peak at or before mid. Binary search needs a reason to drop half, not sorted input.`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "bisect_left vs bisect_right",
      code: `from bisect import bisect_left, bisect_right
nums = [1, 2, 2, 2, 3]
print(bisect_left(nums, 2), bisect_right(nums, 2))
print(bisect_left(nums, 5), bisect_right(nums, 0))`,
      explain: `<code>bisect_left</code> is the first index ≥ x, and <code>bisect_right</code> is the first index &gt; x, so the 2s sit from index 1 up to (not including) 4, and <code>4 − 1 = 3</code> is how many there are. Off the ends they return <code>len(nums)</code> and 0.`,
    },
    {
      id: "d2", kind: "predict", title: "Rounding up",
      code: `import math
x, k = 7, 2
print(x // k, (x + k - 1) // k, -(-x // k), math.ceil(x / k))`,
      explain: `<code>//</code> rounds down. The two integer forms of rounding up are <code>(x + k − 1) // k</code> and <code>-(-x // k)</code>. <code>math.ceil(x / k)</code> also works for small numbers, but goes through a float, which can be wrong past about 2⁵³.`,
    },
    {
      id: "d3", kind: "predict", title: "lo = mid never moves",
      code: `lo, hi, turns = 0, 1, 0
while lo < hi and turns < 5:
    mid = (lo + hi) // 2
    lo = mid
    turns += 1
print(lo, hi, turns)`,
      explain: `With <code>hi = lo + 1</code>, <code>(lo + hi) // 2</code> is <code>lo</code>, so <code>lo = mid</code> changes nothing. Without the <code>turns</code> guard this runs forever. In the first-True template you only write <code>hi = mid</code> and <code>lo = mid + 1</code>, which always shrink the range.`,
    },
    {
      id: "d4", kind: "predict", title: "Floor division of negatives",
      code: `print((-3 + 0) // 2, int((-3 + 0) / 2))
print(-7 // 2, -7 % 2)`,
      explain: `<code>//</code> rounds <em>down</em> (toward −∞), not toward 0, so −3 // 2 is −2 while <code>int(-1.5)</code> is −1. For an answer search over negative values, <code>(lo + hi) // 2</code> still lands in <code>[lo, hi)</code>, which is what the template needs.`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "Koko eating bananas", leetcode: 875,
      fn: "min_speed",
      prompt: `<code>piles[i]</code> bananas in each pile. Each hour Koko picks one pile and eats up to <code>k</code> bananas from it (if the pile has fewer, she finishes it and waits). Return the smallest whole <code>k</code> that finishes everything within <code>h</code> hours (h ≥ number of piles).`,
      stub: `def min_speed(piles, h):
    `,
      cases: `[
        (([3, 6, 7, 11], 8), 4),
        (([30, 11, 23, 4, 20], 5), 30),
        (([30, 11, 23, 4, 20], 6), 23),
        (([1], 1), 1),
        (([312884470], 312884469), 2),
      ]`,
      solution: `def min_speed(piles, h):
    def ok(k):
        return sum((p + k - 1) // k for p in piles) <= h
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      note: `Rep r4 in a costume: hours for a pile is <code>ceil(p / k)</code>. At <code>k = max(piles)</code> each pile takes one hour, and h ≥ number of piles, so <code>hi</code> certainly works.`,
    },
    {
      id: "p2", kind: "problem", title: "Capacity to ship within d days", leetcode: 1011,
      fn: "ship_within",
      prompt: `Packages must ship in the given order. Each day you load packages onto the ship until the next one would go over capacity. Return the smallest capacity that ships everything within <code>days</code> days.`,
      stub: `def ship_within(weights, days):
    `,
      cases: `[
        (([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5), 15),
        (([3, 2, 2, 4, 1, 4], 3), 6),
        (([1, 2, 3, 1, 1], 4), 3),
        (([10], 1), 10),
      ]`,
      solution: `def ship_within(weights, days):
    def ok(cap):
        used, load = 1, 0
        for w in weights:
            if load + w > cap:
                used += 1
                load = 0
            load += w
        return used <= days
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      note: `The range does real work here. Below <code>max(weights)</code> the heaviest package never fits, so start there, which also keeps <code>ok</code> from looping on an impossible package. At <code>sum(weights)</code> it all goes in one day. The check is a greedy pass: fill each day as full as possible.`,
    },
    {
      id: "p3", kind: "problem", title: "Split array largest sum", leetcode: 410,
      fn: "split_array",
      prompt: `Split <code>nums</code> (non-negative) into <code>k</code> non-empty runs of neighbours so that the largest run sum is as small as possible. Return that sum.`,
      stub: `def split_array(nums, k):
    `,
      cases: `[
        (([7, 2, 5, 10, 8], 2), 18),
        (([1, 2, 3, 4, 5], 2), 9),
        (([1, 4, 4], 3), 4),
        (([5], 1), 5),
      ]`,
      solution: `def split_array(nums, k):
    def ok(cap):
        pieces, total = 1, 0
        for x in nums:
            if total + x > cap:
                pieces += 1
                total = 0
            total += x
        return pieces <= k
    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      note: `A hard that is p2 again: "largest run sum" is the ship's capacity and k is the days. Using fewer than k pieces is fine, since you can always split a piece further without raising the max. The DP version (lesson 12) is O(n² · k). This is O(n log(sum)).`,
    },
    {
      id: "p4", kind: "problem", title: "Search in a rotated sorted list", leetcode: 33,
      fn: "search_rotated",
      prompt: `<code>nums</code> holds distinct values, sorted and then rotated. Return the index of <code>target</code>, or −1, in O(log n).`,
      stub: `def search_rotated(nums, target):
    `,
      cases: `[
        (([4, 5, 6, 7, 0, 1, 2], 0), 4),
        (([4, 5, 6, 7, 0, 1, 2], 3), -1),
        (([1], 0), -1),
        (([1, 3], 3), 1),
        (([5, 1, 3], 5), 0),
        (([3, 1], 1), 1),
      ]`,
      solution: `def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    start, n = lo, len(nums)
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[(start + mid) % n] >= target:
            hi = mid
        else:
            lo = mid + 1
    i = (start + lo) % n
    return i if lo < n and nums[i] == target else -1`,
      note: `Two plain searches beat one clever one: find where the rotation starts (w3), then do an ordinary lower bound on the list read from there with <code>% n</code>. The one-pass version (decide which half is sorted, then whether target is inside it) works too, but has more branches to get wrong under pressure.`,
    },
    {
      id: "p5", kind: "problem", title: "Minimum in a rotated sorted list", leetcode: 153,
      fn: "find_min",
      prompt: `<code>nums</code> holds distinct values, sorted and then rotated between 1 and n times. Return the minimum in O(log n).`,
      stub: `def find_min(nums):
    `,
      cases: `[
        (([3, 4, 5, 1, 2],), 1),
        (([4, 5, 6, 7, 0, 1, 2],), 0),
        (([11, 13, 15, 17],), 11),
        (([2, 1],), 1),
        (([1],), 1),
      ]`,
      solution: `def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]`,
      note: `Rotating n times leaves the list sorted, which is exactly where Break it b2's version fails. Comparing with <code>nums[hi]</code> handles it, because a sorted stretch from mid to hi sends you left.`,
    },
    {
      id: "p6", kind: "problem", title: "Median of two sorted lists", leetcode: 4,
      fn: "median_two",
      prompt: `<code>a</code> and <code>b</code> are sorted and not both empty. Return the median of all their items together in O(log(min(m, n))): no merging.`,
      stub: `def median_two(a, b):
    `,
      cases: `[
        (([1, 3], [2]), 2.0),
        (([1, 2], [3, 4]), 2.5),
        (([], [1]), 1.0),
        (([0, 0], [0, 0]), 0.0),
        (([2], []), 2.0),
        (([1, 3, 8, 9, 15], [7, 11, 18, 19, 21, 25]), 11.0),
      ]`,
      solution: `def median_two(a, b):
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    half = (m + n + 1) // 2
    def ok(i):
        j = half - i
        return i == m or j == 0 or a[i] >= b[j - 1]
    lo, hi = 0, m
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    i, j = lo, half - lo
    inf = float("inf")
    left = max(a[i - 1] if i > 0 else -inf, b[j - 1] if j > 0 else -inf)
    if (m + n) % 2:
        return left
    right = min(a[i] if i < m else inf, b[j] if j < n else inf)
    return (left + right) / 2`,
      note: `Search for how many of <code>a</code>'s items go in the left half: <code>i</code> from a and <code>j = half − i</code> from b. Taking one more from <code>a</code> is wrong once <code>a[i] &gt;= b[j − 1]</code>, and that check is False…True in i. The first True is the split. Search the shorter list so that <code>j</code> stays in range.`,
    },
  ],

  fromBlank: ["r1", "r3", "r4", "p2", "p4", "p6"],

  leetcode: [
    { n: 704, title: "Binary Search", slug: "binary-search" },
    { n: 35, title: "Search Insert Position", slug: "search-insert-position" },
    { n: 34, title: "Find First and Last Position of Element in Sorted Array", slug: "find-first-and-last-position-of-element-in-sorted-array" },
    { n: 69, title: "Sqrt(x)", slug: "sqrtx" },
    { n: 278, title: "First Bad Version", slug: "first-bad-version" },
    { n: 162, title: "Find Peak Element", slug: "find-peak-element" },
    { n: 875, title: "Koko Eating Bananas", slug: "koko-eating-bananas" },
    { n: 1011, title: "Capacity To Ship Packages Within D Days", slug: "capacity-to-ship-packages-within-d-days" },
    { n: 153, title: "Find Minimum in Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array" },
    { n: 33, title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array" },
    { n: 410, title: "Split Array Largest Sum", slug: "split-array-largest-sum" },
    { n: 4, title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays" },
  ],
});
