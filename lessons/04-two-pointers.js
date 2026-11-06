COURSE.lesson({
  id: "04",
  title: "Two pointers after sorting",
  tagline: "Sort, then squeeze from both ends, ruling out a whole row of pairs with every move. Skip duplicates, and wrap 2-sum in a loop for 3-sum.",

  intro: `
<p>On a sorted list, two pointers at the two ends can find a pair in O(n) instead of checking all O(n²) pairs. The
reason is worth being able to say out loud. If <code>nums[lo] + nums[hi]</code> is <b>too small</b>, then
<code>nums[lo]</code> plus <em>anything</em> still in range is also too small, because <code>nums[hi]</code> is the
biggest partner it has left. So <code>lo</code> is useless and can go. Each move rules out a whole row of pairs.</p>

<h3>The squeeze</h3>
<pre><code>nums.sort()
lo, hi = 0, len(nums) - 1
while lo &lt; hi:
    s = nums[lo] + nums[hi]
    if s == target:
        RECORD; lo += 1; hi -= 1       # then skip repeats if results must be unique
    elif s &lt; target:
        lo += 1                        # nums[lo] is too small with every partner left
    else:
        hi -= 1                        # nums[hi] is too big with every partner left</code></pre>
<p>Target 15:</p>
<span class="trees"><span class="arr" data-arr="[1, 2, 4, 7, 11, 15]" data-ptr="0:lo,5:hi" data-noidx="1" data-cap="16 &gt; 15: hi moves"></span><span class="arr" data-arr="[1, 2, 4, 7, 11, 15]" data-ptr="0:lo,4:hi" data-noidx="1" data-cap="12 &lt; 15: lo moves"></span><span class="arr" data-arr="[1, 2, 4, 7, 11, 15]" data-ptr="1:lo,4:hi" data-noidx="1" data-cap="13 &lt; 15: lo moves"></span><span class="arr" data-arr="[1, 2, 4, 7, 11, 15]" data-hl="2,4" data-ptr="2:lo,4:hi" data-noidx="1" data-cap="4 + 11 = 15"></span></span>

<h3>No duplicate results</h3>
<p>After recording a match, move both pointers past every copy of the values you just used:
<code>while lo &lt; hi and nums[lo] == nums[lo - 1]: lo += 1</code>. For 3-sum, the outer loop skips a repeated first
value: <code>if i &gt; 0 and nums[i] == nums[i - 1]: continue</code>. That's the same "a value gets tried once per
position" rule as lesson 10.</p>

<h3>k-sum is a loop around (k − 1)-sum</h3>
<p>3-sum: fix <code>nums[i]</code>, then squeeze the rest for <code>−nums[i]</code>. That's O(n²), and the sort's
O(n log n) disappears inside it. 4-sum is one more loop, O(n³). Past that, write it as recursion down to 2-sum (p6).</p>

<h3>Same-direction pointers: read and write</h3>
<p>The other two-pointer shape: <code>read</code> visits every item and <code>write</code> marks where the next kept
item goes. It filters a list in place, with O(1) extra space: removing duplicates, moving zeros, and the three-way
partition (Dutch flag). No sort is needed.</p>

<h3>Moving the pointer that can't help</h3>
<p>Some problems squeeze with no target. Container With Most Water (p3) moves the <b>shorter</b> side, because the
shorter line can't do better with any partner further in: the width only shrinks, and the height can't beat it.
Trapping Rain Water (p4) moves the side with the <b>lower max so far</b>, because that side's water level is already
decided. In each case, say which pointer is useless and why.</p>
<span class="trees"><span class="bars" data-bars="[1, 8, 6, 2, 5, 4, 8, 3, 7]" data-rect="1,8,7" data-hl="1,8" data-cap="Container: lines 1 and 8 hold 7 × 7 = 49."></span><span class="bars" data-bars="[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]" data-water="1" data-cap="Rain water: 6 units trapped."></span></span>

<h3>Traps</h3>
<ol>
<li><b><code>nums[i] == nums[i - 1]</code> at <code>i = 0</code></b> compares with the <em>last</em> item. Write <code>i &gt; 0 and …</code>.</li>
<li><b>Removing from a list while looping over it.</b> The loop skips the item after each removal (predict d3). Use read/write pointers.</li>
<li><b><code>hi = len(nums)</code></b> instead of <code>len(nums) − 1</code>: an <code>IndexError</code> on the first read.</li>
<li><b>Sorting when the answer needs original indices.</b> Sort pairs <code>(value, index)</code>, or use a dict (two-sum on unsorted input is a dict, not pointers).</li>
<li><b>Moving the wrong side.</b> Container moves the shorter one. Break it has you find out what happens otherwise.</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>Complexity:</b> 2-sum on a sorted list is O(n) time, O(1) space. 3-sum is O(n²). Say the sort costs O(n log n) and may use O(n) space (Python's Timsort does).</li>
<li><b>"Why can you move <code>lo</code>?"</b> Answer with the row argument above. That's the proof.</li>
<li><b>"Unsorted, and you need the indices?"</b> A dict of value → index, in one pass, O(n). Pointers win only once the list is sorted.</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "The squeeze",
      prompt: `Find two numbers in a sorted list that add up to 10. When the sum is too small, the left number is too small with <em>every</em> partner still in range, so it's dropped. Watch each move rule out a whole row.`,
      code: `def pair(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]  # ask: (nums[lo], nums[hi])
        if s == target:
            return [lo, hi]
        if s < target:
            lo += 1
        else:
            hi -= 1
    return None

print(pair([1, 2, 4, 6, 8, 11], 10))`,
      note: `Three looks instead of 15 pairs. 1 + 11 is too big, and 1 is the smallest partner 11 has, so 11 goes. 1 + 8 is too small, and 8 is the biggest partner 1 has left, so 1 goes. Then 2 + 8 is it. Each step is safe because of the sort.`,
    },
    {
      id: "w2", kind: "walk", title: "Unique pairs: skip the repeats",
      prompt: `Every pair of values summing to 4, each pair once, from a list with repeats. After a match, both pointers move past every copy of the value they just used.`,
      code: `def unique_pairs(nums, target):
    nums.sort()
    out = []
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]
        if s == target:
            out.append([nums[lo], nums[hi]])
            lo += 1
            hi -= 1
            while lo < hi and nums[lo] == nums[lo - 1]:  # ask 1: (nums[lo], nums[hi])
                lo += 1
            while lo < hi and nums[hi] == nums[hi + 1]:
                hi -= 1
        elif s < target:
            lo += 1
        else:
            hi -= 1
    return out  # ask: out

print(unique_pairs([1, 1, 1, 2, 2, 3, 3, 3], 4))`,
      note: `Without the two skip loops, [1, 3] would be recorded three times. The skip compares with the item just used (<code>lo − 1</code> and <code>hi + 1</code>), not with the next one.`,
    },
    {
      id: "w3", kind: "walk", title: "Three-way partition (Dutch flag)",
      prompt: `Sort a list of 0s, 1s and 2s in one pass. Everything before <code>lo</code> is 0, everything after <code>hi</code> is 2, and <code>i</code> scans the unknown middle. Watch <code>nums</code> before each comparison.`,
      code: `def sort3(nums):
    lo, i, hi = 0, 0, len(nums) - 1
    while i <= hi:
        if nums[i] == 0:  # ask 2,5: nums
            nums[lo], nums[i] = nums[i], nums[lo]
            lo += 1
            i += 1
        elif nums[i] == 2:
            nums[i], nums[hi] = nums[hi], nums[i]
            hi -= 1
        else:
            i += 1
    return nums

print(sort3([2, 0, 2, 1, 1, 0]))`,
      note: `After swapping a 2 to the back, <code>i</code> stays put, because the item that came from <code>hi</code> hasn't been looked at yet. After swapping a 0 forward, <code>i</code> moves on, because whatever came from <code>lo</code> was already scanned (it's a 1).`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "Move the taller side",
      prompt: `Container With Most Water: pick two lines, and the water held is the distance between them times the shorter height. This squeeze moves the <b>taller</b> pointer inward. Find heights where it misses the best pair.`,
      fn: "most_water", args: "heights",
      code: `def most_water(heights):
    lo, hi = 0, len(heights) - 1
    best = 0
    while lo < hi:
        best = max(best, (hi - lo) * min(heights[lo], heights[hi]))
        if heights[lo] > heights[hi]:
            lo += 1
        else:
            hi -= 1
    return best`,
      ref: "right",
      right: `def right(heights):
    return max((j - i) * min(heights[i], heights[j]) for i in range(len(heights)) for j in range(i + 1, len(heights)))`,
      valid: `lambda h: (isinstance(h, list) and 2 <= len(h) <= 8 and all(type(x) is int and 0 <= x <= 9 for x in h)) or "a list of 2 to 8 whole numbers from 0 to 9."`,
      rules: `a list of 2–8 whole numbers from 0 to 9.`,
      example: `[1, 3, 3]`,
      explain: `It starts with 1 and the last 3 (area 2), then drops the 3, the line that could still do better, and keeps the 1, which can't. The best pair is the two 3s (area 3). The shorter line is the useless one: every container it's part of further in is narrower and no taller.`,
    },
    {
      id: "b2", kind: "breakit", title: "Unique pairs without skipping",
      prompt: `This finds the pairs summing to <code>target</code> but forgets to skip repeated values after a match. The answer should list each pair of values once. Find a list where it doesn't.`,
      fn: "unique_pairs", args: "nums, target",
      code: `def unique_pairs(nums, target):
    nums.sort()
    out = []
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]
        if s == target:
            out.append([nums[lo], nums[hi]])
            lo += 1
            hi -= 1
        elif s < target:
            lo += 1
        else:
            hi -= 1
    return out`,
      ref: "right",
      right: `def right(nums, target):
    seen = set()
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                seen.add(tuple(sorted((nums[i], nums[j]))))
    return [list(p) for p in sorted(seen)]`,
      valid: `lambda nums, t: (isinstance(nums, list) and 2 <= len(nums) <= 8 and all(type(x) is int and -9 <= x <= 9 for x in nums) and type(t) is int and -20 <= t <= 20) or "nums is a list of 2 to 8 whole numbers from -9 to 9, and target is from -20 to 20."`,
      rules: `<code>nums</code>: 2–8 whole numbers from −9 to 9. <code>target</code>: from −20 to 20.`,
      example: `[1, 1, 3, 3], 4`,
      explain: `After the first [1, 3] both pointers step in by one, onto another 1 and another 3, so it records [1, 3] again. Moving past every copy of a value you've just used (w2) is what makes results unique.`,
    },
    {
      id: "b3", kind: "breakit", title: "Water from the left wall only",
      prompt: `Trapping Rain Water: bars of width 1, and water settles between them. This fills each bar up to the tallest bar on its <b>left</b>. Find bars where that's wrong.`,
      fn: "trap", args: "heights",
      code: `def trap(heights):
    water, top = 0, 0
    for h in heights:
        top = max(top, h)
        water += top - h
    return water`,
      ref: "right",
      right: `def right(heights):
    n = len(heights)
    return sum(max(0, min(max(heights[:i + 1]), max(heights[i:])) - heights[i]) for i in range(n))`,
      valid: `lambda h: (isinstance(h, list) and 1 <= len(h) <= 10 and all(type(x) is int and 0 <= x <= 9 for x in h)) or "a list of 1 to 10 whole numbers from 0 to 9."`,
      rules: `a list of 1–10 whole numbers from 0 to 9.`,
      example: `[3, 0, 1]`,
      explain: `Water above a bar is held by the <em>lower</em> of the two walls: the tallest bar on its left and the tallest on its right. With nothing tall on the right, it spills. At the 0 the walls are 3 and 1, so it holds 1, not 3. Problem p4 gets <code>min(left max, right max)</code> without building either list.<span class="trees"><span class="bars" data-bars="[3, 0, 1]" data-water="1" data-cap="[3, 0, 1]: the water stops at the lower wall, 1."></span></span>`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "Pair in a sorted list", leetcode: 167,
      fn: "pair", sig: "pair(nums: list[int], target: int) -> list[int] | None",
      prompt: `<code>nums</code> is sorted. Return the indices <code>[i, j]</code> (i &lt; j) of two items summing to <code>target</code>, or <code>None</code>. O(1) extra space: squeeze from both ends.`,
      cases: `[
        (([2, 7, 11, 15], 9), [0, 1]),
        (([1, 2, 4, 6, 8, 11], 9), [0, 4]),
        (([-3, -1, 0, 2], -1), [0, 3]),
        (([1, 2], 4), None),
      ]`,
      mustUse: [{ re: "while", msg: "Squeeze with a while loop and two indices." }],
      solution: `def pair(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]
        if s == target:
            return [lo, hi]
        if s < target:
            lo += 1
        else:
            hi -= 1
    return None`,
      note: `Walk w1 shows why each move is safe. LeetCode 167 numbers its answer from 1, so it returns <code>[lo + 1, hi + 1]</code>.`,
    },
    {
      id: "r2", kind: "rep", title: "Unique pairs to a target",
      fn: "unique_pairs", sig: "unique_pairs(nums: list[int], target: int) -> list[list[int]]",
      prompt: `Return every pair of values summing to <code>target</code>, each pair once, smaller value first, pairs in increasing order. Sort, squeeze, and after a match skip past repeats on both sides.`,
      cases: `[
        (([1, 1, 1, 2, 2, 3, 3, 3], 4), [[1, 3], [2, 2]]),
        (([3, 1, 2, 0, 4], 4), [[0, 4], [1, 3]]),
        (([2, 2, 2, 2], 4), [[2, 2]]),
        (([1, 2], 5), []),
      ]`,
      solution: `def unique_pairs(nums, target):
    nums.sort()
    out = []
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]
        if s == target:
            out.append([nums[lo], nums[hi]])
            lo += 1
            hi -= 1
            while lo < hi and nums[lo] == nums[lo - 1]:
                lo += 1
            while lo < hi and nums[hi] == nums[hi + 1]:
                hi -= 1
        elif s < target:
            lo += 1
        else:
            hi -= 1
    return out`,
      note: `This is the inner loop of 3-sum (p1) exactly. Once it's automatic, 3-sum is three more lines.`,
    },
    {
      id: "r3", kind: "rep", title: "Remove duplicates in place", leetcode: 26,
      fn: "dedup", sig: "dedup(nums: list[int]) -> int",
      adapt: "lambda f, a: (lambda k: (k, a[:k]))(f(a))",
      prompt: `<code>nums</code> is sorted. Change it in place so its first <code>k</code> items are the distinct values in order, and return <code>k</code>. The tests show <code>(k, nums[:k])</code>. Use a read pointer and a write pointer.`,
      cases: `[
        (([1, 1, 2],), (2, [1, 2])),
        (([0, 0, 1, 1, 1, 2, 2, 3, 3, 4],), (5, [0, 1, 2, 3, 4])),
        (([],), (0, [])),
        (([7],), (1, [7])),
      ]`,
      mustNot: [{ re: "set\\(|\\.remove\\(|\\bdel\\b|\\.pop\\(", msg: "In place with two pointers: no set, remove, del or pop." }],
      solution: `def dedup(nums):
    write = 0
    for read in range(len(nums)):
        if read == 0 or nums[read] != nums[read - 1]:
            nums[write] = nums[read]
            write += 1
    return write`,
      note: `<code>write</code> is "how many kept so far" and "where the next one goes" at once. Change the keep test to <code>nums[read] != 0</code> and it's Move Zeroes (283).`,
    },
    {
      id: "r4", kind: "rep", title: "Sort 0s, 1s and 2s in one pass", leetcode: 75,
      fn: "sort3", sig: "sort3(nums: list[int]) -> None",
      adapt: "lambda f, a: (f(a), a)[1]",
      prompt: `Sort a list of 0s, 1s and 2s in place, in one pass, without counting. Keep <code>lo</code> (next 0 goes here), <code>i</code> (scanning) and <code>hi</code> (next 2 goes here).`,
      cases: `[
        (([2, 0, 2, 1, 1, 0],), [0, 0, 1, 1, 2, 2]),
        (([2, 0, 1],), [0, 1, 2]),
        (([1],), [1]),
        (([2, 2, 0, 0],), [0, 0, 2, 2]),
      ]`,
      mustNot: [{ re: "\\.sort\\(|sorted\\(|count\\(", msg: "One pass with three pointers: no sort() or count()." }],
      solution: `def sort3(nums):
    lo, i, hi = 0, 0, len(nums) - 1
    while i <= hi:
        if nums[i] == 0:
            nums[lo], nums[i] = nums[i], nums[lo]
            lo += 1
            i += 1
        elif nums[i] == 2:
            nums[i], nums[hi] = nums[hi], nums[i]
            hi -= 1
        else:
            i += 1`,
      note: `<code>i &lt;= hi</code>, not <code>&lt;</code>: the item at <code>hi</code> hasn't been looked at. This partition is also the inner step of quicksort and quickselect (lesson 07).`,
    },
    {
      id: "r5", kind: "rep", title: "Squares of a sorted list", leetcode: 977,
      fn: "sorted_squares", sig: "sorted_squares(nums: list[int]) -> list[int]",
      prompt: `<code>nums</code> is sorted and may hold negatives. Return the squares, sorted, in O(n): the biggest square is at one of the two ends, so fill the answer from the back.`,
      cases: `[
        (([-4, -1, 0, 3, 10],), [0, 1, 9, 16, 100]),
        (([-7, -3, 2, 3, 11],), [4, 9, 9, 49, 121]),
        (([1, 2],), [1, 4]),
        (([-2, -1],), [1, 4]),
      ]`,
      mustNot: [{ re: "\\.sort\\(|sorted\\(", msg: "O(n): fill from the back with two pointers, no sort." }],
      solution: `def sorted_squares(nums):
    n = len(nums)
    out = [0] * n
    lo, hi = 0, n - 1
    for k in range(n - 1, -1, -1):
        if abs(nums[lo]) > abs(nums[hi]):
            out[k] = nums[lo] * nums[lo]
            lo += 1
        else:
            out[k] = nums[hi] * nums[hi]
            hi -= 1
    return out`,
      note: `The pointers start where the answers are biggest and move toward the smallest. Merging two sorted halves (one going left, one going right) is the same idea.`,
    },
    {
      id: "r6", kind: "rep", title: "Palindrome, ignoring punctuation", leetcode: 125,
      fn: "is_pal", sig: "is_pal(s: str) -> bool",
      prompt: `Return whether <code>s</code> reads the same both ways, looking only at letters and digits, case ignored. Two pointers from the ends, skipping anything that isn't <code>.isalnum()</code>. No new string.`,
      cases: `[
        (("A man, a plan, a canal: Panama",), True),
        (("race a car",), False),
        ((" ",), True),
        ((".,",), True),
        (("0P",), False),
      ]`,
      mustNot: [{ re: "\\[::-1\\]|join", msg: "Two pointers, no reversed copy." }],
      solution: `def is_pal(s):
    lo, hi = 0, len(s) - 1
    while lo < hi:
        if not s[lo].isalnum():
            lo += 1
        elif not s[hi].isalnum():
            hi -= 1
        elif s[lo].lower() != s[hi].lower():
            return False
        else:
            lo += 1
            hi -= 1
    return True`,
      note: `One move per loop turn keeps the bounds check in one place. Nested <code>while</code> loops to skip punctuation work too, but each needs its own <code>lo &lt; hi</code>.`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "Skipping at i = 0",
      code: `nums = [2, 2, 2]
kept = []
for i in range(len(nums)):
    if nums[i] == nums[i - 1]:
        continue
    kept.append(i)
print(kept)`,
      explain: `At <code>i = 0</code>, <code>nums[i − 1]</code> is <code>nums[−1]</code>, the <em>last</em> item, and it's also 2. So even the first copy is skipped. Write <code>if i &gt; 0 and nums[i] == nums[i − 1]</code>.`,
    },
    {
      id: "d2", kind: "predict", title: "Numbers as strings",
      code: `print(sorted(["10", "9", "2", "33"]))
print(sorted(["10", "9", "2", "33"], key=int))`,
      explain: `Strings sort letter by letter, so "10" comes before "2" ("1" &lt; "2"). If the input holds numbers as text, sort with <code>key=int</code> before any squeezing.`,
    },
    {
      id: "d3", kind: "predict", title: "Removing while looping",
      code: `nums = [0, 0, 1, 0, 3]
for x in nums:
    if x == 0:
        nums.remove(x)
print(nums)`,
      explain: `Removing shifts everything left, so the loop's next index skips the item that slid into the gap. One 0 survives. It's also O(n²). Read and write pointers (rep r3) do it in one O(n) pass.`,
    },
    {
      id: "d4", kind: "predict", title: "Sorting by one field",
      code: `people = [(3, "b"), (1, "a"), (2, "b"), (1, "c")]
print(sorted(people, key=lambda p: p[1]))
print(sorted(people))`,
      explain: `Python's sort is <b>stable</b>: items with equal keys keep their original order, so (3, "b") stays before (2, "b"). Without a key, tuples compare field by field, first number then letter. Stability is what lets you sort by several keys in passes.`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "3Sum", leetcode: 15,
      fn: "three_sum", mode: "sorted",
      prompt: `Return every triple of values summing to 0, each triple once, written smallest first. The order of the triples doesn't matter. Aim for O(n²).`,
      stub: `def three_sum(nums):
    `,
      cases: `[
        (([-1, 0, 1, 2, -1, -4],), [[-1, -1, 2], [-1, 0, 1]]),
        (([0, 1, 1],), []),
        (([0, 0, 0, 0],), [[0, 0, 0]]),
        (([-2, 0, 0, 2, 2],), [[-2, 0, 2]]),
      ]`,
      solution: `def three_sum(nums):
    nums.sort()
    out = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s == 0:
                out.append([nums[i], nums[lo], nums[hi]])
                lo += 1
                hi -= 1
                while lo < hi and nums[lo] == nums[lo - 1]:
                    lo += 1
                while lo < hi and nums[hi] == nums[hi + 1]:
                    hi -= 1
            elif s < 0:
                lo += 1
            else:
                hi -= 1
    return out`,
      note: `Rep r2 inside a loop, plus one skip for the outer value. An easy speed-up: once <code>nums[i] &gt; 0</code>, nothing to its right can bring the sum back to 0, so <code>break</code>.`,
    },
    {
      id: "p2", kind: "problem", title: "3Sum closest", leetcode: 16,
      fn: "closest",
      prompt: `Return the sum of three items that is closest to <code>target</code>. There is exactly one closest sum.`,
      stub: `def closest(nums, target):
    `,
      cases: `[
        (([-1, 2, 1, -4], 1), 2),
        (([0, 0, 0], 1), 0),
        (([1, 1, 1, 0], -100), 2),
        (([4, 0, 5, -5, 3, 3, 0, -4, -5], -2), -2),
      ]`,
      solution: `def closest(nums, target):
    nums.sort()
    best = nums[0] + nums[1] + nums[2]
    for i in range(len(nums) - 2):
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if abs(s - target) < abs(best - target):
                best = s
            if s == target:
                return s
            if s < target:
                lo += 1
            else:
                hi -= 1
    return best`,
      note: `The same squeeze with no exact hit to wait for: every sum you look at is a candidate, and the direction rule is unchanged. Start <code>best</code> from a real triple, not infinity, so the subtraction never sees <code>inf</code>.`,
    },
    {
      id: "p3", kind: "problem", title: "Container with most water", leetcode: 11,
      fn: "most_water",
      prompt: `<code>heights[i]</code> is a vertical line at <code>x = i</code>. Two lines and the floor make a container holding <code>(j − i) · min(heights[i], heights[j])</code>. Return the most water any container can hold, in O(n).<span class="trees"><span class="bars" data-bars="[1, 8, 6, 2, 5, 4, 8, 3, 7]" data-rect="1,8,7" data-hl="1,8" data-cap="[1, 8, 6, 2, 5, 4, 8, 3, 7] → 49"></span></span>`,
      stub: `def most_water(heights):
    `,
      cases: `[
        (([1, 8, 6, 2, 5, 4, 8, 3, 7],), 49),
        (([1, 1],), 1),
        (([1, 3, 3],), 3),
        (([4, 3, 2, 1, 4],), 16),
      ]`,
      solution: `def most_water(heights):
    lo, hi = 0, len(heights) - 1
    best = 0
    while lo < hi:
        best = max(best, (hi - lo) * min(heights[lo], heights[hi]))
        if heights[lo] < heights[hi]:
            lo += 1
        else:
            hi -= 1
    return best`,
      note: `Break it b1 is this with the wrong side moving. The shorter line has already met its best partner: every other partner is closer, and the height is capped by the short line anyway.`,
    },
    {
      id: "p4", kind: "problem", title: "Trapping rain water", leetcode: 42,
      fn: "trap",
      prompt: `<code>heights</code> are bars of width 1. Return how much rain is trapped between them. Aim for O(n) time and O(1) extra space.<span class="trees"><span class="bars" data-bars="[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]" data-water="1" data-cap="[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] → 6"></span></span>`,
      stub: `def trap(heights):
    `,
      cases: `[
        (([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],), 6),
        (([4, 2, 0, 3, 2, 5],), 9),
        (([3, 0, 1],), 1),
        (([],), 0),
        (([5, 4, 3],), 0),
      ]`,
      solution: `def trap(heights):
    lo, hi = 0, len(heights) - 1
    left_max = right_max = water = 0
    while lo < hi:
        if heights[lo] < heights[hi]:
            left_max = max(left_max, heights[lo])
            water += left_max - heights[lo]
            lo += 1
        else:
            right_max = max(right_max, heights[hi])
            water += right_max - heights[hi]
            hi -= 1
    return water`,
      note: `Water at a bar is <code>min(left max, right max) − height</code> (Break it b3). If <code>heights[lo] &lt; heights[hi]</code>, there's a wall at least that tall on the right, so the left side's max is the smaller one and <code>lo</code>'s water is already decided. Settle that side and move on. Lesson 06 solves it again with a stack.`,
    },
    {
      id: "p5", kind: "problem", title: "Boats to save people", leetcode: 881,
      fn: "boats",
      prompt: `Each boat carries at most two people and at most <code>limit</code> weight. Everyone weighs at most <code>limit</code>. Return the fewest boats.`,
      stub: `def boats(people, limit):
    `,
      cases: `[
        (([1, 2], 3), 1),
        (([3, 2, 2, 1], 3), 3),
        (([3, 5, 3, 4], 5), 4),
        (([2, 2, 2, 2], 4), 2),
      ]`,
      solution: `def boats(people, limit):
    people.sort()
    lo, hi = 0, len(people) - 1
    count = 0
    while lo <= hi:
        if people[lo] + people[hi] <= limit:
            lo += 1
        hi -= 1
        count += 1
    return count`,
      note: `The heaviest person always leaves now. They take the lightest person along if they fit, and if the lightest doesn't fit, nobody does. It's a greedy choice (lesson 09) carried out by a squeeze. <code>lo &lt;= hi</code>, so one person left alone still gets a boat.`,
    },
    {
      id: "p6", kind: "problem", title: "4Sum (k-sum by recursion)", leetcode: 18,
      fn: "four_sum", mode: "sorted",
      prompt: `Return every set of four values summing to <code>target</code>, each set once, smallest first, in any order. Write it as a k-sum that loops and calls itself with k − 1, down to the 2-sum squeeze.`,
      stub: `def four_sum(nums, target):
    `,
      cases: `[
        (([1, 0, -1, 0, -2, 2], 0), [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]),
        (([2, 2, 2, 2, 2], 8), [[2, 2, 2, 2]]),
        (([1, 2, 3], 6), []),
        (([-3, -1, 0, 2, 4, 5], 2), [[-3, -1, 2, 4]]),
      ]`,
      solution: `def four_sum(nums, target):
    nums.sort()
    def k_sum(start, k, target):
        out = []
        if k == 2:
            lo, hi = start, len(nums) - 1
            while lo < hi:
                s = nums[lo] + nums[hi]
                if s == target:
                    out.append([nums[lo], nums[hi]])
                    lo += 1
                    hi -= 1
                    while lo < hi and nums[lo] == nums[lo - 1]:
                        lo += 1
                    while lo < hi and nums[hi] == nums[hi + 1]:
                        hi -= 1
                elif s < target:
                    lo += 1
                else:
                    hi -= 1
            return out
        for i in range(start, len(nums) - k + 1):
            if i > start and nums[i] == nums[i - 1]:
                continue
            for rest in k_sum(i + 1, k - 1, target - nums[i]):
                out.append([nums[i]] + rest)
        return out
    return k_sum(0, 4, target)`,
      note: `<code>i &gt; start</code>, not <code>i &gt; 0</code>: at each level, a value is tried once at <em>this</em> position, but the same value may appear deeper (lesson 10's rule again). O(n^(k−1)) for k-sum.`,
    },
  ],

  fromBlank: ["r2", "r3", "r4", "p1", "p3", "p4"],

  leetcode: [
    { n: 167, title: "Two Sum II - Input Array Is Sorted", slug: "two-sum-ii-input-array-is-sorted" },
    { n: 125, title: "Valid Palindrome", slug: "valid-palindrome" },
    { n: 26, title: "Remove Duplicates from Sorted Array", slug: "remove-duplicates-from-sorted-array" },
    { n: 283, title: "Move Zeroes", slug: "move-zeroes" },
    { n: 977, title: "Squares of a Sorted Array", slug: "squares-of-a-sorted-array" },
    { n: 75, title: "Sort Colors", slug: "sort-colors" },
    { n: 15, title: "3Sum", slug: "3sum" },
    { n: 16, title: "3Sum Closest", slug: "3sum-closest" },
    { n: 11, title: "Container With Most Water", slug: "container-with-most-water" },
    { n: 881, title: "Boats to Save People", slug: "boats-to-save-people" },
    { n: 18, title: "4Sum", slug: "4sum" },
    { n: 42, title: "Trapping Rain Water", slug: "trapping-rain-water" },
  ],
});
