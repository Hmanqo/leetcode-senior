COURSE.lesson({
  id: "03",
  title: "Sliding window",
  tagline: "Grow on the right, shrink from the left, and know exactly what the window holds. Exactly k = at most k − at most (k − 1).",

  intro: `
<p>A sliding window looks at every run of neighbours without starting over for each one. The right edge moves
forward on every step, and the left edge only moves forward too, so the whole thing is O(n) even though there's a
loop inside a loop. Each item enters once and leaves once.</p>

<h3>The template</h3>
<pre><code>left = 0
for right, x in enumerate(items):
    ADD x to the window
    while the window is NOT ok:        # while, not if (see Break it)
        REMOVE items[left] from the window
        left += 1
    RECORD: the window items[left..right] is ok here
            best = max(best, right - left + 1)   # longest
            count += right - left + 1            # how many ok windows end at right</code></pre>
<p>For "shortest window that is ok" the loop flips: <code>while the window IS ok: record, then shrink</code>.</p>
<p>Longest window with at most 2 distinct values, at three moments:</p>
<span class="trees"><span class="arr" data-arr="[1, 2, 1, 2, 3, 3]" data-win="0,3" data-ptr="0:left,3:right" data-cap="ok: 2 distinct"></span><span class="arr" data-arr="[1, 2, 1, 2, 3, 3]" data-win="0,4" data-bad="4" data-ptr="0:left,4:right" data-cap="add the 3: 3 distinct, not ok"></span><span class="arr" data-arr="[1, 2, 1, 2, 3, 3]" data-win="3,4" data-ptr="3:left,4:right" data-cap="shrink until ok: left = 3"></span></span>

<h3>Why it's allowed: ok-ness has to be one-directional</h3>
<p>The left edge never moves back. That's only safe if <b>shrinking an ok window keeps it ok</b> and <b>growing a
broken window keeps it broken</b>. "At most k distinct", "no repeats" and "sum ≤ target with positive numbers" all
work that way. "Sum exactly k with negatives" doesn't: that's lesson 02's dict, not a window.</p>

<h3>What the window holds</h3>
<table>
<thead><tr><th>The condition is about…</th><th>Keep</th><th>Window is ok when</th></tr></thead>
<tbody>
<tr><td>a sum (all positive)</td><td><code>total</code></td><td><code>total &lt;= target</code> / <code>&gt;= target</code></td></tr>
<tr><td>distinct values</td><td>a count dict, deleting keys that hit 0</td><td><code>len(count) &lt;= k</code></td></tr>
<tr><td>no repeats</td><td>a count dict, or the last index of each value</td><td>no count above 1</td></tr>
<tr><td>"at most k bad items"</td><td>how many bad items are inside</td><td><code>bad &lt;= k</code></td></tr>
<tr><td>covering every letter of t</td><td>a <code>need</code> Counter and how many are still <code>missing</code></td><td><code>missing == 0</code></td></tr>
</tbody>
</table>

<h3>Counting windows, and "exactly k"</h3>
<p>When the window <code>[left..right]</code> is ok, so is every shorter window ending at <code>right</code>. That's
<code>right − left + 1</code> windows, all counted in one step. "Exactly k" isn't one-directional (adding an item can
push the count past k, and shrinking can drop it below), so count it as <b>at most k − at most (k − 1)</b>.</p>
<span class="trees"><span class="arr" data-arr="[1, 2, 1, 2, 3]" data-win="1,3" data-ptr="1:left,3:right" data-cap="[1..3] is ok, so [2..3] and [3..3] are too: 3 − 1 + 1 = 3 windows end at right."></span></span>

<h3>Traps</h3>
<ol>
<li><b><code>if</code> instead of <code>while</code> when shrinking.</b> One step left might not be enough. (For "longest" it happens to still work, and Break it shows why. For counting it doesn't.)</li>
<li><b>Leaving zero counts in the dict.</b> <code>len(count)</code> then counts values that have left the window. <code>del</code> them at 0.</li>
<li><b>Window length off by one.</b> <code>items[left..right]</code> with both ends included has <code>right − left + 1</code> items.</li>
<li><b>Moving <code>left</code> backwards.</b> With "jump left to the last index + 1", take <code>max(left, last[c] + 1)</code>, or "abba" breaks (p1).</li>
<li><b>Using a window on negative numbers.</b> The sum can go back down, so shrinking loses answers. That's lesson 02.</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>Complexity:</b> O(n) time, because <code>left</code> and <code>right</code> each move n times. Space is O(size of the alphabet) for the count dict.</li>
<li><b>"Exactly k?"</b> At most k − at most (k − 1), said before they ask.</li>
<li><b>"What if it's a stream?"</b> A window is already one pass, and only the window's contents need storing.</li>
<li><b>"The maximum in every window?"</b> A count dict can't give you that quickly. That's the monotonic deque in lesson 06.</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "A fixed-size window slides",
      prompt: `The largest sum of any 3 neighbours. Instead of adding 3 numbers again at each position, the window adds the item coming in and subtracts the one going out.`,
      code: `def max_window_sum(nums, k):
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]  # ask 1,3: window
        best = max(best, window)
    return best  # ask: best

print(max_window_sum([2, 1, 5, 1, 3, 2], 3))`,
      note: `<code>nums[i]</code> comes in and <code>nums[i − k]</code> goes out: exactly k items stay inside. Each move is O(1), so the whole thing is O(n) instead of O(n · k).`,
    },
    {
      id: "w2", kind: "walk", title: "Grow until ok, shrink while ok",
      prompt: `The shortest run with sum ≥ 7 (all numbers positive). The right edge grows the sum. As soon as the window is ok, record it, then shrink from the left to see whether a shorter one is still ok.`,
      code: `def shortest(nums, target):
    left = total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x
        while total >= target:  # ask 1,3: (left, right)
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return best  # ask: best

print(shortest([2, 3, 1, 2, 4, 3], 7))`,
      note: `<code>left</code> only ever moves forward. If <code>[left..right]</code> stopped being ok, starting any further left can't help later, because adding items on the right only adds more. Positive numbers are what make that true.`,
    },
    {
      id: "w3", kind: "walk", title: "Count every window at once",
      prompt: `How many runs have at most 2 distinct values? Each time the window is ok, every shorter window ending at <code>right</code> is ok too, so add <code>right − left + 1</code>. Watch the count dict lose a key when a value leaves completely.`,
      code: `def count_at_most(nums, k):
    count = {}
    left = total = 0
    for right, x in enumerate(nums):
        count[x] = count.get(x, 0) + 1
        while len(count) > k:
            out = nums[left]
            count[out] -= 1
            if count[out] == 0:
                del count[out]
            left += 1
        total += right - left + 1  # ask 4,5: count
    return total  # ask: total

print(count_at_most([1, 2, 1, 2, 3], 2))`,
      note: `When the 3 arrives, the window has to give up every 1 before it's ok again, so the count dict loses key 1 entirely, and that's what <code>del</code> is for. Then the window is [2, 3], and it adds 2 (for [3] and [2, 3]).`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "Shrink once with if",
      prompt: `This counts the runs with at most <code>k</code> distinct values, but shrinks with <code>if</code> instead of <code>while</code>. (Curiously, the same change does no harm when you want the <em>longest</em> window, since that window only slides at its best size.) Find an input where the count is wrong.`,
      fn: "count_at_most", args: "nums, k",
      code: `def count_at_most(nums, k):
    count = {}
    left = total = 0
    for right, x in enumerate(nums):
        count[x] = count.get(x, 0) + 1
        if len(count) > k:
            out = nums[left]
            count[out] -= 1
            if count[out] == 0:
                del count[out]
            left += 1
        total += right - left + 1
    return total`,
      ref: "right",
      right: `def right(nums, k):
    return sum(1 for i in range(len(nums)) for j in range(i, len(nums)) if len(set(nums[i:j + 1])) <= k)`,
      valid: `lambda nums, k: (isinstance(nums, list) and 1 <= len(nums) <= 8 and all(type(x) is int and 0 <= x <= 9 for x in nums) and type(k) is int and 1 <= k <= 3) or "nums is a list of 1 to 8 whole numbers from 0 to 9, and k is 1, 2 or 3."`,
      rules: `<code>nums</code>: 1–8 whole numbers from 0 to 9. <code>k</code>: 1, 2 or 3.`,
      example: `[1, 1, 2], 1`,
      explain: `When the 2 arrives, the window [1, 1, 2] has 2 distinct values. One step left gives [1, 2], which still has 2, and it counts 2 windows that aren't ok. It needed to keep shrinking down to [2]. The "longest" version gets away with it because a window that isn't ok never sets a new best: it's the same size as one that was.`,
    },
    {
      id: "b2", kind: "breakit", title: "Exactly k in one window",
      prompt: `This counts the runs with <b>exactly</b> <code>k</code> distinct values using one window: shrink while there are more than k, and count 1 whenever there are exactly k. Find an input where it undercounts.`,
      fn: "count_exactly", args: "nums, k",
      code: `def count_exactly(nums, k):
    count = {}
    left = total = 0
    for right, x in enumerate(nums):
        count[x] = count.get(x, 0) + 1
        while len(count) > k:
            out = nums[left]
            count[out] -= 1
            if count[out] == 0:
                del count[out]
            left += 1
        if len(count) == k:
            total += 1
    return total`,
      ref: "right",
      right: `def right(nums, k):
    return sum(1 for i in range(len(nums)) for j in range(i, len(nums)) if len(set(nums[i:j + 1])) == k)`,
      valid: `lambda nums, k: (isinstance(nums, list) and 1 <= len(nums) <= 8 and all(type(x) is int and 0 <= x <= 9 for x in nums) and type(k) is int and 1 <= k <= 3) or "nums is a list of 1 to 8 whole numbers from 0 to 9, and k is 1, 2 or 3."`,
      rules: `<code>nums</code>: 1–8 whole numbers from 0 to 9. <code>k</code>: 1, 2 or 3.`,
      example: `[1, 1], 1`,
      explain: `At the second 1, both [1, 1] and [1] have exactly one distinct value, but it counts one window per end. Exactly k isn't one-directional, so no single window finds every start. Counting <code>at most k − at most (k − 1)</code> gets them all (problem p5).`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "Largest sum of k neighbours", leetcode: 643,
      fn: "max_window_sum", sig: "max_window_sum(nums: list[int], k: int) -> int",
      prompt: `Return the largest sum of <code>k</code> neighbouring items. Slide a fixed window: add the one coming in, subtract the one going out.`,
      cases: `[
        (([1, 4, 2, 10, 23, 3, 1, 0, 20], 4), 39),
        (([5], 1), 5),
        (([-1, -2, -3], 2), -3),
        (([2, 1, 5, 1, 3, 2], 3), 9),
      ]`,
      solution: `def max_window_sum(nums, k):
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        best = max(best, window)
    return best`,
      note: `A fixed window never needs a <code>while</code>: it's always exactly k wide. Negatives are fine here, because nothing depends on the sum going one way.`,
    },
    {
      id: "r2", kind: "rep", title: "Longest with at most k distinct",
      fn: "longest_k_distinct", sig: "longest_k_distinct(s: str, k: int) -> int",
      prompt: `Return the length of the longest run of <code>s</code> with at most <code>k</code> different letters. Count dict, shrink <code>while len(count) &gt; k</code>, delete keys that reach 0.`,
      cases: `[
        (("eceba", 2), 3),
        (("aa", 1), 2),
        (("", 2), 0),
        (("abcadcacacaca", 3), 11),
        (("abc", 0), 0),
      ]`,
      mustUse: [{ re: "\\bdel\\b|\\.pop\\(", msg: "Remove a letter's key when its count reaches 0, so len() counts only what's inside." }],
      solution: `def longest_k_distinct(s, k):
    count = {}
    left = best = 0
    for right, c in enumerate(s):
        count[c] = count.get(c, 0) + 1
        while len(count) > k:
            out = s[left]
            count[out] -= 1
            if count[out] == 0:
                del count[out]
            left += 1
        best = max(best, right - left + 1)
    return best`,
      note: `This one rep is Fruit Into Baskets (904) with k = 2 and Longest Without Repeats (3) with a different "ok". Learn the frame once and swap the condition.`,
    },
    {
      id: "r3", kind: "rep", title: "Shortest run with sum ≥ target", leetcode: 209,
      fn: "shortest", sig: "shortest(nums: list[int], target: int) -> int",
      prompt: `All numbers are positive. Return the length of the shortest run whose sum is at least <code>target</code>, or 0. Record and shrink <em>while</em> the window is ok.`,
      cases: `[
        (([2, 3, 1, 2, 4, 3], 7), 2),
        (([1, 4, 4], 4), 1),
        (([1, 1, 1, 1, 1, 1, 1, 1], 11), 0),
        (([1, 2, 3, 4, 5], 11), 3),
      ]`,
      solution: `def shortest(nums, target):
    left = total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best`,
      note: `For "longest", you record after shrinking. For "shortest", you record inside the shrink loop, while it's still ok. That flip is the one thing to think about before typing.`,
    },
    {
      id: "r4", kind: "rep", title: "Count runs with at most k distinct",
      fn: "count_at_most", sig: "count_at_most(nums: list[int], k: int) -> int",
      prompt: `Count the runs with at most <code>k</code> distinct values. After shrinking, add <code>right − left + 1</code>: every window ending at <code>right</code> that starts at or after <code>left</code>.`,
      cases: `[
        (([1, 2, 1, 2, 3], 2), 12),
        (([1, 1, 1], 1), 6),
        (([1, 2, 3], 0), 0),
        (([1, 2, 3], 3), 6),
      ]`,
      solution: `def count_at_most(nums, k):
    count = {}
    left = total = 0
    for right, x in enumerate(nums):
        count[x] = count.get(x, 0) + 1
        while len(count) > k:
            out = nums[left]
            count[out] -= 1
            if count[out] == 0:
                del count[out]
            left += 1
        total += right - left + 1
    return total`,
      note: `This is the half of "exactly k" you call twice. Walk w3 steps through it.`,
    },
    {
      id: "r5", kind: "rep", title: "Longest run of 1s with k flips", leetcode: 1004,
      fn: "longest_ones", sig: "longest_ones(nums: list[int], k: int) -> int",
      prompt: `<code>nums</code> holds 0s and 1s. You may flip at most <code>k</code> zeros to 1. Return the longest run of 1s you can make. The window may hold at most k zeros.`,
      cases: `[
        (([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2), 6),
        (([0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3), 10),
        (([0, 0], 0), 0),
        (([1, 1], 0), 2),
      ]`,
      solution: `def longest_ones(nums, k):
    left = zeros = best = 0
    for right, x in enumerate(nums):
        if x == 0:
            zeros += 1
        while zeros > k:
            if nums[left] == 0:
                zeros -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
      note: `Turn "flip" into "allow k bad items inside". You never flip anything: you count how many you would have to.`,
    },
    {
      id: "r6", kind: "rep", title: "Contains a rearrangement", leetcode: 567,
      fn: "has_anagram", sig: "has_anagram(p: str, s: str) -> bool",
      prompt: `Return whether <code>s</code> contains some rearrangement of <code>p</code> as a run of neighbouring letters. Slide a window of <code>len(p)</code> over <code>s</code>, keeping a letter count, and compare it with <code>p</code>'s.`,
      cases: `[
        (("ab", "eidbaooo"), True),
        (("ab", "eidboaoo"), False),
        (("a", "a"), True),
        (("abc", "ab"), False),
        (("adc", "dcda"), True),
      ]`,
      mustUse: [{ re: "Counter", msg: "Keep the window's letter counts in a Counter." }],
      solution: `from collections import Counter

def has_anagram(p, s):
    k = len(p)
    if k > len(s):
        return False
    need, window = Counter(p), Counter(s[:k])
    if window == need:
        return True
    for i in range(k, len(s)):
        window[s[i]] += 1
        window[s[i - k]] -= 1
        if window == need:
            return True
    return False`,
      note: `Counters compare equal even when one holds keys with count 0 (Python 3.10+), so the window needn't clean up. Comparing costs O(26) per step. LeetCode 438 asks for every start index instead of a yes/no.`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "A count that reached zero",
      code: `count = {"a": 2, "b": 1}
count["a"] -= 2
print(len(count), count)`,
      explain: `The key stays, with value 0, so <code>len(count)</code> still says 2 distinct values. In a distinct-values window that means shrinking too much. Delete it: <code>if count[x] == 0: del count[x]</code>.`,
    },
    {
      id: "d2", kind: "predict", title: "Reading a defaultdict",
      code: `from collections import defaultdict, Counter
d = defaultdict(int)
if d["x"] == 0:
    pass
c = Counter()
if c["x"] == 0:
    pass
print(len(d), len(c))`,
      explain: `Reading a missing key from a <code>defaultdict</code> <em>creates</em> it, so <code>d</code> now has one key. A <code>Counter</code> returns 0 without storing anything. So if <code>len()</code> means "distinct values in the window", a <code>defaultdict</code> can grow just by being looked at, and a Counter can't.`,
    },
    {
      id: "d3", kind: "predict", title: "Window length",
      code: `s = "abcdef"
left, right = 1, 3
print(right - left, s[left:right], s[left:right + 1])`,
      explain: `The window <code>s[left..right]</code> with both ends included is "bcd", 3 letters: <code>right − left + 1</code>, and as a slice <code>s[left:right + 1]</code>. <code>right − left</code> is one short.`,
    },
    {
      id: "d4", kind: "predict", title: "Jumping left backwards",
      code: `def longest(s):
    last = {}
    left = best = 0
    for right, c in enumerate(s):
        if c in last:
            left = last[c] + 1
        last[c] = right
        best = max(best, right - left + 1)
    return best

print(longest("abba"))`,
      explain: `At the last "a", <code>last["a"]</code> is 0, so <code>left</code> jumps <em>back</em> from 2 to 1 and the window "bba" (with two b's) is counted as length 3. The right answer is 2. Use <code>left = max(left, last[c] + 1)</code>.`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "Longest substring without repeats", leetcode: 3,
      fn: "longest_unique",
      prompt: `Return the length of the longest run of <code>s</code> with no repeated character.`,
      stub: `def longest_unique(s):
    `,
      cases: `[
        (("abcabcbb",), 3),
        (("bbbbb",), 1),
        (("pwwkew",), 3),
        (("",), 0),
        (("abba",), 2),
        ((" ",), 1),
      ]`,
      solution: `def longest_unique(s):
    last = {}
    left = best = 0
    for right, c in enumerate(s):
        if c in last and last[c] >= left:
            left = last[c] + 1
        last[c] = right
        best = max(best, right - left + 1)
    return best`,
      note: `Storing each letter's last index lets <code>left</code> jump straight past the repeat instead of stepping. Only jump if that index is inside the window (<code>&gt;= left</code>). "abba" is the test for that, and predict d4 is what happens without it.`,
    },
    {
      id: "p2", kind: "problem", title: "Longest repeating character replacement", leetcode: 424,
      fn: "longest_replace",
      prompt: `You may change at most <code>k</code> letters of <code>s</code> (uppercase A–Z) to any other letter. Return the length of the longest run of one repeated letter you can make.`,
      stub: `def longest_replace(s, k):
    `,
      cases: `[
        (("ABAB", 2), 4),
        (("AABABBA", 1), 4),
        (("A", 0), 1),
        (("ABCDE", 1), 2),
        (("AAAA", 0), 4),
      ]`,
      solution: `def longest_replace(s, k):
    count = {}
    left = top = best = 0
    for right, c in enumerate(s):
        count[c] = count.get(c, 0) + 1
        top = max(top, count[c])
        while (right - left + 1) - top > k:
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
      note: `A window is ok if everything except its most common letter fits in k changes: <code>length − top ≤ k</code>. <code>top</code> is never lowered when letters leave, and that's fine: a stale <code>top</code> only stops the window from growing, and the answer only improves when a letter really reaches a new top.`,
    },
    {
      id: "p3", kind: "problem", title: "Fruit into baskets", leetcode: 904,
      fn: "total_fruit",
      prompt: `<code>fruits[i]</code> is the type of fruit on tree <code>i</code>. You have two baskets, each holding one type. Starting at any tree and moving right, pick one fruit per tree until a third type appears. Return the most fruit you can pick.`,
      stub: `def total_fruit(fruits):
    `,
      cases: `[
        (([1, 2, 1],), 3),
        (([0, 1, 2, 2],), 3),
        (([1, 2, 3, 2, 2],), 4),
        (([3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4],), 5),
      ]`,
      solution: `def total_fruit(fruits):
    count = {}
    left = best = 0
    for right, f in enumerate(fruits):
        count[f] = count.get(f, 0) + 1
        while len(count) > 2:
            count[fruits[left]] -= 1
            if count[fruits[left]] == 0:
                del count[fruits[left]]
            left += 1
        best = max(best, right - left + 1)
    return best`,
      note: `Strip the story and it's rep r2 with k = 2. Practising that translation ("baskets" → "distinct values in the window") is the actual exercise.`,
    },
    {
      id: "p4", kind: "problem", title: "Minimum window substring", leetcode: 76,
      fn: "min_window",
      prompt: `Return the shortest run of <code>s</code> that contains every letter of <code>t</code> (with repeats: "aa" needs two a's), or <code>""</code> if there isn't one.`,
      stub: `def min_window(s, t):
    `,
      cases: `[
        (("ADOBECODEBANC", "ABC"), "BANC"),
        (("a", "a"), "a"),
        (("a", "aa"), ""),
        (("ab", "b"), "b"),
        (("aaflslflsldkalskaaa", "aaa"), "aaa"),
      ]`,
      solution: `from collections import Counter

def min_window(s, t):
    need = Counter(t)
    missing = len(t)
    left, best, start = 0, float("inf"), 0
    for right, c in enumerate(s):
        if need[c] > 0:
            missing -= 1
        need[c] -= 1
        while missing == 0:
            if right - left + 1 < best:
                best, start = right - left + 1, left
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1
    return "" if best == float("inf") else s[start:start + best]`,
      note: `<code>need[c]</code> counts down as letters come in and can go negative (spares). <code>missing</code> only changes when a letter of <code>t</code> that was still needed arrives or leaves, so checking "covers everything" is O(1) and not a Counter comparison. Then it's r3's "shrink while ok".`,
    },
    {
      id: "p5", kind: "problem", title: "Subarrays with exactly k distinct", leetcode: 992,
      fn: "exactly_k",
      prompt: `Count the runs with exactly <code>k</code> distinct values.`,
      stub: `def exactly_k(nums, k):
    `,
      cases: `[
        (([1, 2, 1, 2, 3], 2), 7),
        (([1, 2, 1, 3, 4], 3), 3),
        (([1], 1), 1),
        (([1, 1, 1], 1), 6),
      ]`,
      solution: `def exactly_k(nums, k):
    def at_most(k):
        count = {}
        left = total = 0
        for right, x in enumerate(nums):
            count[x] = count.get(x, 0) + 1
            while len(count) > k:
                count[nums[left]] -= 1
                if count[nums[left]] == 0:
                    del count[nums[left]]
                left += 1
            total += right - left + 1
        return total
    return at_most(k) - at_most(k - 1)`,
      note: `A hard that is two calls to rep r4. Runs with exactly k = runs with at most k − runs with at most k − 1. Break it b2 showed why one window can't do it directly.`,
    },
  ],

  fromBlank: ["r2", "r3", "r4", "p1", "p4", "p5"],

  leetcode: [
    { n: 643, title: "Maximum Average Subarray I", slug: "maximum-average-subarray-i" },
    { n: 209, title: "Minimum Size Subarray Sum", slug: "minimum-size-subarray-sum" },
    { n: 3, title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters" },
    { n: 1004, title: "Max Consecutive Ones III", slug: "max-consecutive-ones-iii" },
    { n: 567, title: "Permutation in String", slug: "permutation-in-string" },
    { n: 438, title: "Find All Anagrams in a String", slug: "find-all-anagrams-in-a-string" },
    { n: 424, title: "Longest Repeating Character Replacement", slug: "longest-repeating-character-replacement" },
    { n: 904, title: "Fruit Into Baskets", slug: "fruit-into-baskets" },
    { n: 76, title: "Minimum Window Substring", slug: "minimum-window-substring" },
    { n: 992, title: "Subarrays with K Different Integers", slug: "subarrays-with-k-different-integers" },
    { n: 930, title: "Binary Subarrays With Sum", slug: "binary-subarrays-with-sum" },
  ],
});
