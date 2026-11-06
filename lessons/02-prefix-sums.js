COURSE.lesson({
  id: "02",
  title: "Prefix sums + hash map",
  tagline: "A running total turns any range sum into one subtraction, and a dict of earlier totals turns \"sum = k\" into a lookup.",

  intro: `
<p>The sum of <code>nums[i..j]</code> is <b>(total up to j) − (total before i)</b>. Keep the running totals and every
range sum becomes one subtraction. Turn that around and you get the senior move: walking left to right with total
<code>t</code>, a run ending here sums to <code>k</code> exactly when some <em>earlier</em> total was
<code>t − k</code>. So you keep a dict of earlier totals, and "find every subarray with sum k" becomes one lookup per
element, O(n) in all.</p>

<h3>The prefix list</h3>
<pre><code>P = [0]                      # P[i] = sum of the first i items
for x in nums:
    P.append(P[-1] + x)
# sum of nums[i..j], both ends included:
P[j + 1] - P[i]</code></pre>
<p>The leading 0 is the empty prefix. It's why the formula needs no special case at <code>i = 0</code>.</p>
<span class="trees"><span class="arr" data-arr="[3, 1, 4, 1, 5]" data-win="1,3" data-below="[0, 3, 4, 8, 9, 14]" data-belowcap="P" data-cap="nums[1..3] = P[4] − P[1] = 9 − 3 = 6. P[i] sits on the boundary before item i."></span></span>

<h3>The running total + dict</h3>
<pre><code>seen = {0: 1}                # the empty prefix, seen once
total = count = 0
for x in nums:
    total += x
    count += seen.get(total - k, 0)      # earlier totals that leave k
    seen[total] = seen.get(total, 0) + 1 # then record this one</code></pre>

<h3>What the dict stores, by question</h3>
<table>
<thead><tr><th>The question asks…</th><th>Key</th><th>Value</th><th>Start with</th></tr></thead>
<tbody>
<tr><td><b>how many</b> runs sum to k</td><td>total</td><td>how many times seen</td><td><code>{0: 1}</code></td></tr>
<tr><td>the <b>longest</b> run summing to k</td><td>total</td><td><b>first</b> index seen (never overwrite)</td><td><code>{0: -1}</code></td></tr>
<tr><td>runs <b>divisible</b> by k</td><td><code>total % k</code></td><td>count, or first index</td><td><code>{0: 1}</code> or <code>{0: -1}</code></td></tr>
<tr><td>equal 0s and 1s, exactly k odds…</td><td>total of <b>re-mapped</b> values (0 → −1, odd → 1)</td><td>as above</td><td>as above</td></tr>
</tbody>
</table>

<h3>Why not a sliding window?</h3>
<p>A window works when growing it can only raise the sum, which is true when every number is positive. With
negatives or zeros, a sum that's too big can come back down, so shrinking the window throws away answers. Prefix
sums don't care about signs. In <b>Break it</b> you'll find the exact input that sinks the window.</p>

<h3>Traps</h3>
<ol>
<li><b>Forgetting <code>{0: 1}</code>.</b> Then a run starting at index 0 is never counted, because there's no earlier total of 0 to find.</li>
<li><b>Recording before looking up.</b> If <code>seen[total]</code> goes in first, then with <code>k = 0</code> it finds itself and counts an empty run.</li>
<li><b>Overwriting the first index.</b> For "longest", the earliest index gives the longest run. Write it only <code>if total not in first</code>.</li>
<li><b>A prefix list without the leading 0.</b> Then <code>P[j] - P[i]</code> drops <code>nums[i]</code> (predict d3).</li>
<li><b>Negative numbers and <code>%</code>.</b> In Python <code>-7 % 3</code> is 2, which is what you want here. In Java or C++ it's −1, and you'd add k. Say so if asked.</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>Complexity:</b> O(n) time and O(n) space for the dict. The prefix list costs O(n) to build, then O(1) per query.</li>
<li><b>"All numbers are positive?"</b> Then a sliding window (lesson 03) does it in O(1) space.</li>
<li><b>"In 2D?"</b> <code>P[r][c]</code> = sum of the rectangle above-left, and a region is four lookups (p6).</li>
<li><b>"On a tree?"</b> The same dict, along the root-to-node path, with an undo on the way back (p5).</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "Range sums from one list",
      prompt: `Build the prefix list, then get the sum of <code>nums[1..3]</code> with one subtraction. <code>P[i]</code> is the sum of the first <code>i</code> items, so <code>P</code> is one longer than <code>nums</code>.`,
      code: `nums = [3, -1, 4, 1, 5]
P = [0]
for x in nums:
    P.append(P[-1] + x)  # ask 3: P
i, j = 1, 3
print(P[j + 1] - P[i])  # ask: P
print(sum(nums[i:j + 1]))`,
      note: `<code>P[4] − P[1]</code> is (3 − 1 + 4 + 1) − (3) = −1 + 4 + 1, the three items from index 1 to 3. The <code>j + 1</code> is there because <code>P</code> is shifted by one, which is the price of the leading 0.`,
    },
    {
      id: "w2", kind: "walk", title: "Count runs that sum to k",
      prompt: `Count the runs that sum to 3. At each step, <code>total − k</code> is the earlier total you'd need to subtract to leave exactly k. Watch <code>seen</code> fill with the totals so far.`,
      code: `def count_k(nums, k):
    seen = {0: 1}
    total = count = 0
    for x in nums:
        total += x
        count += seen.get(total - k, 0)  # ask 3,5: seen
        seen[total] = seen.get(total, 0) + 1
    return count  # ask: count

print(count_k([1, 2, 3, -2, 2], 3))`,
      note: `The totals go 1, 3, 6, 4, 6, and each one found exactly one earlier total: 3 found 0 ([1, 2]), 6 found 3 ([3]), 4 found 1 ([2, 3, −2]) and the last 6 found 3 ([3, −2, 2]). A single lookup counts every run ending here at once, however many starts work, which is why it's O(n) and not O(n²).`,
    },
    {
      id: "w3", kind: "walk", title: "Longest run: keep the first index",
      prompt: `Longest run summing to 3. Now the dict stores the <b>first</b> index each total appeared at, because the earliest start gives the longest run. <code>{0: -1}</code> means "the empty prefix ends before index 0".`,
      code: `def longest_k(nums, k):
    first = {0: -1}
    total = best = 0
    for i, x in enumerate(nums):
        total += x
        if total - k in first:  # ask 3,5: first
            best = max(best, i - first[total - k])
        if total not in first:
            first[total] = i
    return best  # ask: best

print(longest_k([1, -1, 5, -2, 3], 3))`,
      note: `The answer is [1, −1, 5, −2], length 4: total 3 at index 3, and total 0 first appeared at −1. If you overwrote <code>first[0]</code> at index 1 (where the total is back to 0), you'd get length 2 instead. That's predict d4.`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "A sliding window for sum = k",
      prompt: `This counts runs summing to <code>k</code> with a sliding window: grow on the right, shrink from the left while the sum is too big. It's right when every number is positive. Find an input where it miscounts.`,
      fn: "count_k", args: "nums, k",
      code: `def count_k(nums, k):
    count = left = total = 0
    for right, x in enumerate(nums):
        total += x
        while total > k and left <= right:
            total -= nums[left]
            left += 1
        if total == k:
            count += 1
    return count`,
      ref: "right",
      right: `def right(nums, k):
    seen = {0: 1}
    total = count = 0
    for x in nums:
        total += x
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count`,
      valid: `lambda nums, k: (isinstance(nums, list) and 1 <= len(nums) <= 8 and all(type(x) is int and -9 <= x <= 9 for x in nums) and type(k) is int and -20 <= k <= 20) or "nums is a list of 1 to 8 whole numbers from -9 to 9, and k is from -20 to 20."`,
      rules: `<code>nums</code>: 1–8 whole numbers from −9 to 9. <code>k</code>: from −20 to 20.`,
      example: `[1, -1, 1], 1`,
      explain: `At the last step the window is [1, −1, 1], which sums to 1, so it counts that one. But [1] on its own (the last item) also sums to 1, and a window can only report one start per end. Zeros break it the same way: <code>[0, 0], 0</code> has three runs and it finds two. And with negatives, a sum that was too big can come back down, so shrinking can throw away a start it still needed. Prefix sums check every start at once.`,
    },
    {
      id: "b2", kind: "breakit", title: "No empty prefix",
      prompt: `This is the right algorithm with one change: the dict starts empty instead of <code>{0: 1}</code>. Find an input it gets wrong.`,
      fn: "count_k", args: "nums, k",
      code: `def count_k(nums, k):
    seen = {}
    total = count = 0
    for x in nums:
        total += x
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count`,
      ref: "right",
      right: `def right(nums, k):
    seen = {0: 1}
    total = count = 0
    for x in nums:
        total += x
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count`,
      valid: `lambda nums, k: (isinstance(nums, list) and 1 <= len(nums) <= 8 and all(type(x) is int and -9 <= x <= 9 for x in nums) and type(k) is int and -20 <= k <= 20) or "nums is a list of 1 to 8 whole numbers from -9 to 9, and k is from -20 to 20."`,
      rules: `<code>nums</code>: 1–8 whole numbers from −9 to 9. <code>k</code>: from −20 to 20.`,
      example: `[3], 3`,
      explain: `A run that starts at index 0 needs the earlier total 0, the sum of nothing. Without <code>{0: 1}</code> there's no such entry, so every run starting at the beginning is missed.`,
    },
    {
      id: "b3", kind: "breakit", title: "Record, then look up",
      prompt: `This one records the current total <em>before</em> looking up <code>total − k</code>. Usually that's harmless. Find where it isn't.`,
      fn: "count_k", args: "nums, k",
      code: `def count_k(nums, k):
    seen = {0: 1}
    total = count = 0
    for x in nums:
        total += x
        seen[total] = seen.get(total, 0) + 1
        count += seen.get(total - k, 0)
    return count`,
      ref: "right",
      right: `def right(nums, k):
    seen = {0: 1}
    total = count = 0
    for x in nums:
        total += x
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count`,
      valid: `lambda nums, k: (isinstance(nums, list) and 1 <= len(nums) <= 8 and all(type(x) is int and -9 <= x <= 9 for x in nums) and type(k) is int and -20 <= k <= 20) or "nums is a list of 1 to 8 whole numbers from -9 to 9, and k is from -20 to 20."`,
      rules: `<code>nums</code>: 1–8 whole numbers from −9 to 9. <code>k</code>: from −20 to 20.`,
      example: `[1], 0`,
      explain: `With <code>k = 0</code>, <code>total − k</code> is <code>total</code> itself, which was just recorded, so every step counts the empty run from here to here. Look up first, then record: the dict must hold only <em>earlier</em> totals.`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "Prefix list", leetcode: 1480,
      fn: "prefix_sums", sig: "prefix_sums(nums: list[int]) -> list[int]",
      prompt: `Return the prefix list with the leading 0: <code>P[i]</code> is the sum of the first <code>i</code> items, so it's one longer than <code>nums</code>.`,
      cases: `[
        (([1, 2, 3],), [0, 1, 3, 6]),
        (([],), [0]),
        (([-1, 5],), [0, -1, 4]),
      ]`,
      solution: `def prefix_sums(nums):
    P = [0]
    for x in nums:
        P.append(P[-1] + x)
    return P`,
      note: `<code>itertools.accumulate(nums, initial=0)</code> does the same in one line (predict d5). Type the loop until it's automatic, then use whichever you like.`,
    },
    {
      id: "r2", kind: "rep", title: "Many range sums", leetcode: 303,
      fn: "range_sums", sig: "range_sums(nums: list[int], queries: list[list[int]]) -> list[int]",
      prompt: `Each query <code>[i, j]</code> asks for the sum of <code>nums[i..j]</code>, both ends included. Build the prefix list once, then answer each query with one subtraction: no <code>sum()</code> per query.`,
      cases: `[
        (([1, 2, 3, 4], [[0, 3], [1, 2], [2, 2]]), [10, 5, 3]),
        (([5], [[0, 0]]), [5]),
        (([-2, 0, 3, -5, 2, -1], [[0, 2], [2, 5], [0, 5]]), [1, -1, -3]),
      ]`,
      mustNot: [{ re: "\\bsum\\(", msg: "Build the prefix list once: no sum() per query." }],
      solution: `def range_sums(nums, queries):
    P = [0]
    for x in nums:
        P.append(P[-1] + x)
    return [P[j + 1] - P[i] for i, j in queries]`,
      note: `O(n + q) instead of O(n · q). This is the whole reason prefix sums exist, and LeetCode 303 is literally this as a class.`,
    },
    {
      id: "r3", kind: "rep", title: "Count runs summing to k", leetcode: 560,
      fn: "count_k", sig: "count_k(nums: list[int], k: int) -> int",
      prompt: `Count the runs of neighbours that sum to <code>k</code>. Numbers can be negative. One pass, a dict of earlier totals, starting with <code>{0: 1}</code>. Look up, <em>then</em> record.`,
      cases: `[
        (([1, 1, 1], 2), 2),
        (([1, 2, 3], 3), 2),
        (([1, -1, 0], 0), 3),
        (([3], 3), 1),
        (([1, -1, 1], 1), 3),
      ]`,
      solution: `def count_k(nums, k):
    seen = {0: 1}
    total = count = 0
    for x in nums:
        total += x
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count`,
      note: `This rep is LeetCode 560 word for word. Walk w2 steps through it, and Break it b1–b3 are the three ways it usually goes wrong.`,
    },
    {
      id: "r4", kind: "rep", title: "Longest run summing to k",
      fn: "longest_k", sig: "longest_k(nums: list[int], k: int) -> int",
      prompt: `Return the length of the longest run summing to <code>k</code>, or 0. Store each total's <b>first</b> index, starting with <code>{0: -1}</code>.`,
      cases: `[
        (([1, -1, 5, -2, 3], 3), 4),
        (([-2, -1, 2, 1], 1), 2),
        (([1, 2], 5), 0),
        (([0, 0, 0], 0), 3),
      ]`,
      solution: `def longest_k(nums, k):
    first = {0: -1}
    total = best = 0
    for i, x in enumerate(nums):
        total += x
        if total - k in first:
            best = max(best, i - first[total - k])
        if total not in first:
            first[total] = i
    return best`,
      note: `Run length is <code>i − first[...]</code> with no + 1, because <code>first</code> holds the index <em>before</em> the run starts. That's also why the empty prefix sits at −1.`,
    },
    {
      id: "r5", kind: "rep", title: "Pivot index", leetcode: 724,
      fn: "pivot", sig: "pivot(nums: list[int]) -> int",
      prompt: `Return the first index where the sum of everything to its left equals the sum of everything to its right (the item itself counts on neither side), or −1. Use the total and a running left sum: no list needed.`,
      cases: `[
        (([1, 7, 3, 6, 5, 6],), 3),
        (([1, 2, 3],), -1),
        (([2, 1, -1],), 0),
        (([0],), 0),
      ]`,
      solution: `def pivot(nums):
    total, left = sum(nums), 0
    for i, x in enumerate(nums):
        if left == total - left - x:
            return i
        left += x
    return -1`,
      note: `When you only walk forward once, a single running number replaces the whole prefix list. The right side is <code>total − left − x</code>.`,
    },
    {
      id: "r6", kind: "rep", title: "Product of everything else", leetcode: 238,
      fn: "except_self", sig: "except_self(nums: list[int]) -> list[int]",
      prompt: `Return a list where item <code>i</code> is the product of every item except <code>nums[i]</code>, with <b>no division</b>. One pass left to right with a running product, then one pass right to left.`,
      cases: `[
        (([1, 2, 3, 4],), [24, 12, 8, 6]),
        (([-1, 1, 0, -3, 3],), [0, 0, 9, 0, 0]),
        (([2, 3],), [3, 2]),
      ]`,
      mustNot: [{ re: "/", msg: "No division: that's the point of the exercise." }],
      solution: `def except_self(nums):
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        out[i] *= right
        right *= nums[i]
    return out`,
      note: `Prefix products from the left times suffix products from the right. Writing each before multiplying in <code>nums[i]</code> leaves item <code>i</code> out. Division would fail on the 0 in the second test anyway.`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "Negative mod",
      code: `print(-7 % 3, -7 // 3)
print(7 % -3)`,
      explain: `Python's <code>%</code> takes the sign of the divisor, so <code>-7 % 3</code> is 2 (and <code>-7 // 3</code> rounds down to −3). That's exactly what a "prefix mod k" dict needs. In Java or C++ <code>-7 % 3</code> is −1, and you'd write <code>((t % k) + k) % k</code>.`,
    },
    {
      id: "d2", kind: "predict", title: "Counting into a plain dict",
      code: `seen = {}
for t in [3, 5, 3]:
    seen[t] += 1
print(seen)`,
      explain: `<code>seen[t] += 1</code> has to read <code>seen[3]</code> first, and it isn't there. Use <code>seen.get(t, 0) + 1</code>, <code>defaultdict(int)</code> or <code>Counter</code>.`,
    },
    {
      id: "d3", kind: "predict", title: "No leading zero",
      code: `nums = [2, 4, 6, 8]
P = []
total = 0
for x in nums:
    total += x
    P.append(total)
print(P[3] - P[1])`,
      explain: `This <code>P[i]</code> includes <code>nums[i]</code>, so <code>P[3] − P[1]</code> is 6 + 8 = 14: it drops <code>nums[1]</code>. The sum of <code>nums[1..3]</code> is 18. With the leading 0, the formula is <code>P[j + 1] − P[i]</code> and there's nothing to remember.`,
    },
    {
      id: "d4", kind: "predict", title: "Overwriting the first index",
      code: `def longest_k(nums, k):
    first = {0: -1}
    total = best = 0
    for i, x in enumerate(nums):
        total += x
        if total - k in first:
            best = max(best, i - first[total - k])
        first[total] = i
    return best

print(longest_k([1, -1, 5, -2, 3], 3))`,
      explain: `At index 1 the total is back to 0, and <code>first[0]</code> gets overwritten from −1 to 1. The run [1, −1, 5, −2] (length 4) needed the −1, so only shorter runs are found. Keep the earliest: <code>if total not in first</code>.`,
    },
    {
      id: "d5", kind: "predict", title: "accumulate",
      code: `from itertools import accumulate
print(list(accumulate([1, 2, 3])))
print(list(accumulate([1, 2, 3], initial=0)))
print(list(accumulate([3, 1, 4], max)))`,
      explain: `<code>accumulate</code> gives running totals, without the leading 0 unless you pass <code>initial=0</code>. Give it a function and it runs that instead: a running max is one line.`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "Contiguous array", leetcode: 525,
      fn: "longest_balanced",
      prompt: `<code>nums</code> holds only 0s and 1s. Return the length of the longest run with as many 0s as 1s.`,
      stub: `def longest_balanced(nums):
    `,
      cases: `[
        (([0, 1],), 2),
        (([0, 1, 0],), 2),
        (([0, 0, 1, 0, 0, 0, 1, 1],), 6),
        (([1, 1, 1],), 0),
      ]`,
      solution: `def longest_balanced(nums):
    first = {0: -1}
    total = best = 0
    for i, x in enumerate(nums):
        total += 1 if x == 1 else -1
        if total in first:
            best = max(best, i - first[total])
        else:
            first[total] = i
    return best`,
      note: `Count a 0 as −1 and "as many 0s as 1s" becomes "sums to 0". Then it's rep r4 with <code>k = 0</code>. Re-mapping values so the question becomes a sum is the move to look for.`,
    },
    {
      id: "p2", kind: "problem", title: "Subarray sums divisible by k", leetcode: 974,
      fn: "count_divisible",
      prompt: `Count the runs whose sum is divisible by <code>k</code> (k ≥ 2). Numbers can be negative.`,
      stub: `def count_divisible(nums, k):
    `,
      cases: `[
        (([4, 5, 0, -2, -3, 1], 5), 7),
        (([5], 9), 0),
        (([-1, 2, 9], 2), 2),
        (([0, 0], 3), 3),
      ]`,
      solution: `def count_divisible(nums, k):
    seen = {0: 1}
    total = count = 0
    for x in nums:
        total = (total + x) % k
        count += seen.get(total, 0)
        seen[total] = seen.get(total, 0) + 1
    return count`,
      note: `Two totals leave a run divisible by k exactly when they have the same remainder, so you look up <code>total % k</code> itself, not <code>total − k</code>. Python's <code>%</code> keeps remainders non-negative even when the total isn't (predict d1).`,
    },
    {
      id: "p3", kind: "problem", title: "Continuous subarray sum", leetcode: 523,
      fn: "has_multiple",
      prompt: `Return whether some run of <b>at least two</b> items sums to a multiple of <code>k</code> (0 counts as a multiple). All numbers are ≥ 0, and k ≥ 1.`,
      stub: `def has_multiple(nums, k):
    `,
      cases: `[
        (([23, 2, 4, 6, 7], 6), True),
        (([23, 2, 6, 4, 7], 13), False),
        (([5, 0, 0, 0], 3), True),
        (([0], 1), False),
        (([1, 0], 2), False),
        (([23, 2, 4, 6, 6], 7), True),
      ]`,
      solution: `def has_multiple(nums, k):
    first = {0: -1}
    total = 0
    for i, x in enumerate(nums):
        total = (total + x) % k
        if total in first:
            if i - first[total] >= 2:
                return True
        else:
            first[total] = i
    return False`,
      note: `p2's remainders combined with r4's first index: the length check needs the <em>earliest</em> index with this remainder, so never overwrite it. <code>[1, 0]</code> with k = 2 is the trap: remainder 1 repeats, but only across one item.`,
    },
    {
      id: "p4", kind: "problem", title: "Count nice subarrays", leetcode: 1248,
      fn: "count_nice",
      prompt: `Count the runs containing exactly <code>k</code> odd numbers.`,
      stub: `def count_nice(nums, k):
    `,
      cases: `[
        (([1, 1, 2, 1, 1], 3), 2),
        (([2, 4, 6], 1), 0),
        (([2, 2, 2, 1, 2, 2, 1, 2, 2, 2], 2), 16),
      ]`,
      solution: `def count_nice(nums, k):
    seen = {0: 1}
    total = count = 0
    for x in nums:
        total += x % 2
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count`,
      note: `Count an odd number as 1 and an even one as 0, and "exactly k odds" is "sums to k": rep r3 with one changed line. Lesson 03 solves this again as "at most k − at most (k − 1)".`,
    },
    {
      id: "p5", kind: "problem", title: "Path sum III (on a tree)", leetcode: 437,
      fn: "count_paths", adapt: "lambda f, t, k: f(_tree(t), k)",
      prompt: `Count the paths that sum to <code>k</code>. A path goes <b>downward</b> (parent to child) and can start and end at any node.<span class="trees"><span class="tree" data-tree="[10, 5, -3, 3, 2, None, 11, 3, -2, None, 1]" data-cap="k = 8: three paths, 5 → 3, 5 → 2 → 1 and −3 → 11."></span></span>`,
      stub: `def count_paths(root, k):
    `,
      cases: `[
        (([10, 5, -3, 3, 2, None, 11, 3, -2, None, 1], 8), 3),
        (([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, 5, 1], 22), 3),
        (([], 0), 0),
        (([1], 1), 1),
        (([0, 0], 0), 3),
      ]`,
      solution: `def count_paths(root, k):
    seen = {0: 1}
    def go(node, total):
        if node is None:
            return 0
        total += node.val
        count = seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
        count += go(node.left, total) + go(node.right, total)
        seen[total] -= 1
        return count
    return go(root, 0)`,
      note: `A root-to-node path is just a list, so it's r3 along each path. The dict must hold only <em>this</em> path's totals, so remove yours on the way back up: choose, explore, undo, as in lesson 10. Pass <code>total</code> down and return the count up (lesson 01).`,
    },
    {
      id: "p6", kind: "problem", title: "Range sums in 2D", leetcode: 304,
      fn: "region_sums",
      prompt: `Each query <code>[r1, c1, r2, c2]</code> asks for the sum of the rectangle from <code>(r1, c1)</code> to <code>(r2, c2)</code>, corners included. Build a 2D prefix table once, then answer each query in O(1).`,
      stub: `def region_sums(matrix, queries):
    `,
      cases: `[
        (([[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]], [[2, 1, 4, 3], [1, 1, 2, 2], [1, 2, 2, 4]]), [8, 11, 12]),
        (([[1]], [[0, 0, 0, 0]]), [1]),
        (([[1, 2], [3, 4]], [[0, 0, 1, 1], [1, 0, 1, 1], [0, 1, 1, 1]]), [10, 7, 6]),
      ]`,
      solution: `def region_sums(matrix, queries):
    R, C = len(matrix), len(matrix[0])
    P = [[0] * (C + 1) for _ in range(R + 1)]
    for r in range(R):
        for c in range(C):
            P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]
    out = []
    for r1, c1, r2, c2 in queries:
        out.append(P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1])
    return out`,
      note: `Same leading-zero trick, as a row and a column of zeros. Building: add the two rectangles above and to the left, and subtract their overlap, which was counted twice. A query is the mirror image: take away the strips above and to the left, then add back the corner you took away twice.`,
    },
  ],

  fromBlank: ["r3", "r4", "r6", "p1", "p2", "p5"],

  leetcode: [
    { n: 1480, title: "Running Sum of 1d Array", slug: "running-sum-of-1d-array" },
    { n: 303, title: "Range Sum Query - Immutable", slug: "range-sum-query-immutable" },
    { n: 724, title: "Find Pivot Index", slug: "find-pivot-index" },
    { n: 238, title: "Product of Array Except Self", slug: "product-of-array-except-self" },
    { n: 560, title: "Subarray Sum Equals K", slug: "subarray-sum-equals-k" },
    { n: 525, title: "Contiguous Array", slug: "contiguous-array" },
    { n: 974, title: "Subarray Sums Divisible by K", slug: "subarray-sums-divisible-by-k" },
    { n: 523, title: "Continuous Subarray Sum", slug: "continuous-subarray-sum" },
    { n: 1248, title: "Count Number of Nice Subarrays", slug: "count-number-of-nice-subarrays" },
    { n: 437, title: "Path Sum III", slug: "path-sum-iii" },
    { n: 304, title: "Range Sum Query 2D - Immutable", slug: "range-sum-query-2d-immutable" },
  ],
});
