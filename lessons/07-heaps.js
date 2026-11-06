COURSE.lesson({
  id: "07",
  title: "Heaps + selection",
  tagline: "heapq for \"the smallest so far\": top k, two heaps, k-way merge, schedulers. And when a heap is more than you need: quickselect, buckets, and the list's own indices.",

  intro: `
<p>A heap answers one question fast: <b>what's the smallest item right now?</b> Pushing and popping are O(log n), and
peeking at <code>h[0]</code> is O(1). Everything in this lesson is either that question in disguise, or a case where
you don't need the whole heap (one k-th item, counts, or values that fit the list's own indices).</p>

<h3>heapq in four lines</h3>
<pre><code>import heapq
h = []                         # a plain list; h[0] is always the smallest
heapq.heappush(h, (priority, i, item))   # tuples compare field by field
p, i, item = heapq.heappop(h)
heapq.heapify(nums)            # O(n), in place</code></pre>
<p>There's no max-heap: push <code>-x</code> and negate again when you pop. Put a unique tiebreak (an index or a
counter) second in the tuple, so two equal priorities never compare the items themselves (predict d2).</p>
<span class="trees"><span class="tree" data-tree="[1, 3, 2, 7, 4, 5]" data-path="1" data-cap="Each parent is ≤ its children, so h[0] is the smallest."></span><span class="arr" data-arr="[1, 3, 2, 7, 4, 5]" data-hl="0" data-cap="The same heap as the list heapq keeps: children of i are at 2i + 1 and 2i + 2. Not sorted."></span></span>

<h3>The shapes</h3>
<table>
<thead><tr><th>Shape</th><th>The heap holds</th><th>Problems</th></tr></thead>
<tbody>
<tr><td><b>Top k</b></td><td>the best k so far, with the <em>worst</em> of them on top so it can be evicted. For the k largest, that's a min-heap of size k. O(n log k).</td><td>215, 347, 973</td></tr>
<tr><td><b>Two heaps</b></td><td>a max-heap for the lower half and a min-heap for the upper half, sizes kept within 1</td><td>295, 480, 502</td></tr>
<tr><td><b>K-way merge</b></td><td>one <code>(value, which list, position)</code> per list. Pop the smallest and push its successor.</td><td>23, 373, 378</td></tr>
<tr><td><b>Scheduler</b></td><td>tasks that are available <em>now</em>, by priority. A sorted list plus a pointer feeds new arrivals in.</td><td>621, 1834, 502</td></tr>
</tbody>
</table>

<h3>When a heap is more than you need</h3>
<ul>
<li><b>Just the k-th item:</b> quickselect. Partition around a pivot (lesson 04's three-way split), then keep only the
side holding position k. O(n) on average with a random pivot, O(n²) in the worst case.</li>
<li><b>Top k by count:</b> counts are between 1 and n, so put values in buckets by count and read from the top. O(n), no
heap.</li>
<li><b>Values 1…n in a list of size n:</b> the list's indices are a free hash table. Swap each value to slot
<code>value − 1</code> (cyclic sort) and whatever doesn't fit is missing or duplicated, with O(1) extra space.</li>
</ul>

<h3>Traps</h3>
<ol>
<li><b>Evicting the wrong end.</b> To keep the k <em>largest</em>, the heap's top must be the smallest of them (Break it b1).</li>
<li><b>Ties that compare unorderable things.</b> <code>(dist, point_dict)</code> raises <code>TypeError</code> on equal distances. Add an index.</li>
<li><b>Thinking the heap list is sorted.</b> Only <code>h[0]</code> is guaranteed (predict d1).</li>
<li><b>Forgetting to negate back</b> when popping from a max-heap made of negatives.</li>
<li><b>A swap whose index depends on what's being swapped.</b> <code>nums[i], nums[nums[i] - 1] = …</code> assigns left to right and goes wrong (predict d5). Save <code>j = nums[i] − 1</code> first.</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>Complexity:</b> top k is O(n log k) time and O(k) space. Quickselect is O(n) average. Bucket is O(n). Say which one fits.</li>
<li><b>"It's a stream."</b> Then the heap wins: quickselect and buckets need all the data, and a size-k heap needs only k.</li>
<li><b>"Remove an arbitrary item?"</b> heapq can't do it fast. Mark it deleted and skip it when it reaches the top (lazy deletion, lesson 13).</li>
<li><b>Python:</b> <code>heapq.nlargest(k, it, key=…)</code> exists. Use it when allowed, and know what it does underneath.</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "Top k: evict the weakest",
      prompt: `Keep the 3 largest values. The heap holds the best 3 so far with the <b>smallest</b> of them on top, so when a 4th arrives, the weakest is the one popped. Before each push, say what's in the heap.`,
      code: `import heapq

def top_k(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)  # ask 4,6: sorted(heap)
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted(heap, reverse=True)

print(top_k([5, 1, 9, 3, 7, 2, 8], 3))`,
      note: `The heap never holds more than k + 1 items, so each push and pop is O(log k): O(n log k) overall, and only O(k) memory, which is why this wins for a stream. (The questions say <code>sorted(heap)</code> because the heap list itself isn't kept in order.)`,
    },
    {
      id: "w2", kind: "walk", title: "K-way merge",
      prompt: `Merge three sorted lists. The heap holds exactly one candidate from each list that isn't used up: the smallest candidate is the next output, and its successor from the same list replaces it.`,
      code: `import heapq

def merge_k(lists):
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(heap)
    out = []
    while heap:
        val, i, j = heapq.heappop(heap)  # ask 1,4: sorted(heap)
        out.append(val)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out

print(merge_k([[1, 4, 7], [2, 5], [3, 6, 9]]))`,
      note: `The tuple carries <em>where</em> the value came from, so its successor can follow it in. With k lists and n values in total, the heap never holds more than k items: O(n log k).`,
    },
    {
      id: "w3", kind: "walk", title: "Quickselect: keep one side",
      prompt: `Find the 3rd smallest. Partition around a pivot into &lt; pivot, = pivot and &gt; pivot, then look only at the side where position 2 (counting from 0) landed. The other side is never touched again.`,
      code: `def kth_smallest(nums, k):
    lo, hi, target = 0, len(nums) - 1, k - 1
    while True:
        pivot = nums[(lo + hi) // 2]
        lt, i, gt = lo, lo, hi
        while i <= gt:
            if nums[i] < pivot:
                nums[lt], nums[i] = nums[i], nums[lt]
                lt += 1
                i += 1
            elif nums[i] > pivot:
                nums[i], nums[gt] = nums[gt], nums[i]
                gt -= 1
            else:
                i += 1
        if target < lt:  # ask: (nums, lt, gt)
            hi = lt - 1
        elif target > gt:
            lo = gt + 1
        else:
            return pivot

print(kth_smallest([7, 2, 9, 4, 1, 8, 3], 3))`,
      note: `After a partition, everything at positions <code>lt..gt</code> equals the pivot and is in its final sorted place. If the target is left of that, the right side is thrown away, and vice versa. On average each round halves the work: n + n/2 + n/4 + … ≈ 2n.`,
    },
    {
      id: "w4", kind: "walk", title: "The list's indices as a hash table",
      prompt: `Values are 1 to n in a list of size n, with some repeated and some missing. Swap each value into slot <code>value − 1</code>. Afterwards, every slot that doesn't hold its own number marks a missing value. No set, O(1) extra space.`,
      code: `def missing(nums):
    i = 0
    while i < len(nums):
        j = nums[i] - 1
        if nums[i] != nums[j]:  # ask 1,2,4: nums
            nums[i], nums[j] = nums[j], nums[i]
        else:
            i += 1
    return [k + 1 for k in range(len(nums)) if nums[k] != k + 1]

print(missing([4, 3, 2, 7, 8, 2, 3, 1]))`,
      note: `Each swap puts at least one value in its home slot for good, so there are at most n swaps: O(n), even though <code>i</code> sometimes stays put. <code>nums[i] != nums[j]</code> also stops a duplicate from swapping with its twin forever.`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "Evict the wrong end",
      prompt: `This should return the <code>k</code> <b>smallest</b> values (in increasing order). It keeps a heap of size k, but it's a min-heap, so the item it evicts is the smallest. Find an input where it's wrong.`,
      fn: "k_smallest", args: "nums, k",
      code: `import heapq

def k_smallest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted(heap)`,
      ref: "right",
      right: `def right(nums, k):
    return sorted(nums)[:k]`,
      valid: `lambda nums, k: (isinstance(nums, list) and 1 <= len(nums) <= 8 and all(type(x) is int and -9 <= x <= 9 for x in nums) and type(k) is int and 1 <= k <= len(nums)) or "nums is 1 to 8 whole numbers from -9 to 9, and k is from 1 to len(nums)."`,
      rules: `<code>nums</code>: 1–8 whole numbers from −9 to 9. <code>k</code>: from 1 to <code>len(nums)</code>.`,
      example: `[3, 1, 2], 1`,
      explain: `It keeps throwing away the smallest, which is the one it was asked to keep, and ends up with the k <em>largest</em>. For the k smallest, the top must be the largest of the keepers: push <code>-x</code> (a max-heap). The evicted item is always the worst of the ones you're keeping.`,
    },
    {
      id: "b2", kind: "breakit", title: "Two heaps that drift",
      prompt: `Median of a list by two heaps: a value goes to the lower half if it's ≤ the lower half's top, otherwise to the upper half. There's no rebalancing, and the median is read from whichever half is bigger (or both tops if equal). Find a list where it's wrong.`,
      fn: "median", args: "nums",
      code: `import heapq

def median(nums):
    low, high = [], []
    for x in nums:
        if not low or x <= -low[0]:
            heapq.heappush(low, -x)
        else:
            heapq.heappush(high, x)
    if len(low) > len(high):
        return -low[0]
    if len(high) > len(low):
        return high[0]
    return (-low[0] + high[0]) / 2`,
      ref: "right",
      right: `def right(nums):
    s = sorted(nums)
    n = len(s)
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2`,
      valid: `lambda nums: (isinstance(nums, list) and 1 <= len(nums) <= 8 and all(type(x) is int and -9 <= x <= 9 for x in nums)) or "a list of 1 to 8 whole numbers from -9 to 9."`,
      rules: `a list of 1–8 whole numbers from −9 to 9.`,
      example: `[3, 2, 1]`,
      explain: `Every value is ≤ the first one, so they all pile into the lower half, and its top is the maximum, not the middle. The two tops are only the middle if the halves have equal size (or differ by one). After each push, move one item across if they've drifted apart (p1).`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "Top k with a size-k heap", leetcode: 215,
      fn: "top_k", sig: "top_k(nums: list[int], k: int) -> list[int]",
      prompt: `Return the <code>k</code> largest values, largest first. Keep a min-heap of at most k items, popping the smallest whenever it grows past k.`,
      cases: `[
        (([3, 2, 1, 5, 6, 4], 2), [6, 5]),
        (([1], 1), [1]),
        (([5, 5, 4], 2), [5, 5]),
        (([-1, -3, -2], 2), [-1, -2]),
      ]`,
      mustUse: [{ re: "heappush|heappushpop|heapreplace", msg: "Use heapq to keep the k largest." }],
      mustNot: [{ re: "nlargest|sorted\\(nums|nums\\.sort", msg: "Keep a size-k heap: no nlargest and no sorting the input." }],
      solution: `import heapq

def top_k(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted(heap, reverse=True)`,
      note: `<code>heap[0]</code> at the end is the k-th largest, which is LeetCode 215. <code>heapq.heappushpop(heap, x)</code> does push-then-pop in one faster step once the heap is full.`,
    },
    {
      id: "r2", kind: "rep", title: "K closest points", leetcode: 973,
      fn: "k_closest", sig: "k_closest(points: list[list[int]], k: int) -> list[list[int]]", mode: "sorted",
      prompt: `Return the <code>k</code> points closest to the origin, in any order. Keep a max-heap of size k, by pushing <code>(-distance², x, y)</code>.`,
      cases: `[
        (([[1, 3], [-2, 2]], 1), [[-2, 2]]),
        (([[3, 3], [5, -1], [-2, 4]], 2), [[3, 3], [-2, 4]]),
        (([[0, 1], [1, 0]], 2), [[0, 1], [1, 0]]),
        (([[1, 1], [2, 2], [3, 3], [0, 0]], 2), [[0, 0], [1, 1]]),
      ]`,
      solution: `import heapq

def k_closest(points, k):
    heap = []
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), x, y))
        if len(heap) > k:
            heapq.heappop(heap)
    return [[x, y] for _, x, y in heap]`,
      note: `Closest k means "evict the farthest", so the top must be the farthest: negate the distance. Squared distance is enough, since there's no need for <code>sqrt</code> to compare.`,
    },
    {
      id: "r3", kind: "rep", title: "Merge k sorted lists",
      fn: "merge_k", sig: "merge_k(lists: list[list[int]]) -> list[int]",
      prompt: `Merge sorted lists into one sorted list in O(n log k). The heap holds <code>(value, which list, position)</code>, one per list. Pop the smallest, then push its successor from the same list.`,
      cases: `[
        (([[1, 4, 5], [1, 3, 4], [2, 6]],), [1, 1, 2, 3, 4, 4, 5, 6]),
        (([],), []),
        (([[], []],), []),
        (([[2], [1]],), [1, 2]),
      ]`,
      mustNot: [{ re: "sort|heapq\\.merge", msg: "Merge with your own heap: no sort or heapq.merge." }],
      solution: `import heapq

def merge_k(lists):
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(heap)
    out = []
    while heap:
        val, i, j = heapq.heappop(heap)
        out.append(val)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out`,
      note: `<code>i</code> in the tuple also breaks ties between equal values, so the comparison never reaches anything unorderable. Merge K Sorted Lists (23) is this with linked-list nodes, and the index tiebreak matters there, because nodes can't be compared.`,
    },
    {
      id: "r4", kind: "rep", title: "Quickselect", leetcode: 215,
      fn: "kth_smallest", sig: "kth_smallest(nums: list[int], k: int) -> int",
      prompt: `Return the <code>k</code>-th smallest value (k = 1 is the minimum) in O(n) on average: three-way partition around a random pivot, then continue in only the side holding position <code>k − 1</code>. No sorting, no heap.`,
      cases: `[
        (([3, 2, 1, 5, 6, 4], 2), 2),
        (([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), 3),
        (([1], 1), 1),
        (([7, 7, 7], 2), 7),
        (([9, 8, 7, 6, 5, 4, 3, 2, 1], 9), 9),
      ]`,
      mustNot: [{ re: "sort|heapq|min\\(|max\\(", msg: "Quickselect: no sorting, heap, min or max." }],
      solution: `import random

def kth_smallest(nums, k):
    lo, hi, target = 0, len(nums) - 1, k - 1
    while True:
        pivot = nums[random.randint(lo, hi)]
        lt, i, gt = lo, lo, hi
        while i <= gt:
            if nums[i] < pivot:
                nums[lt], nums[i] = nums[i], nums[lt]
                lt += 1
                i += 1
            elif nums[i] > pivot:
                nums[i], nums[gt] = nums[gt], nums[i]
                gt -= 1
            else:
                i += 1
        if target < lt:
            hi = lt - 1
        elif target > gt:
            lo = gt + 1
        else:
            return pivot`,
      note: `The random pivot is what makes "O(n) on average" true for every input, including sorted ones. The three-way split stops a list of equal values (<code>[7, 7, 7]</code>) from going quadratic. The k-th <em>largest</em> is the <code>(n − k + 1)</code>-th smallest.`,
    },
    {
      id: "r5", kind: "rep", title: "Top k frequent by buckets", leetcode: 347,
      fn: "top_k_frequent", sig: "top_k_frequent(nums: list[int], k: int) -> list[int]", mode: "sorted",
      prompt: `Return the <code>k</code> most frequent values, in any order (the answer is unique). O(n): count, put each value in bucket <code>[count]</code> (counts run 1 to n), then read buckets from the top.`,
      cases: `[
        (([1, 1, 1, 2, 2, 3], 2), [1, 2]),
        (([1], 1), [1]),
        (([4, 4, 5, 5, 5, 6], 1), [5]),
        (([1, 2], 2), [1, 2]),
      ]`,
      mustNot: [{ re: "sort|heapq|most_common", msg: "Buckets by count: no sort, heap or most_common." }],
      solution: `from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for x, c in count.items():
        buckets[c].append(x)
    out = []
    for c in range(len(nums), 0, -1):
        for x in buckets[c]:
            out.append(x)
            if len(out) == k:
                return out
    return out`,
      note: `When the keys you'd sort by are small integers (here, counts ≤ n), a list indexed by key replaces the sort. The heap version, <code>heapq.nlargest(k, count, key=count.get)</code>, is O(n log k) and fine to mention.`,
    },
    {
      id: "r6", kind: "rep", title: "Missing numbers in place", leetcode: 448,
      fn: "missing", sig: "missing(nums: list[int]) -> list[int]",
      prompt: `<code>nums</code> has n values, each between 1 and n, some repeated. Return the values in 1…n that are missing, in increasing order, with O(1) extra space besides the answer: swap each value into slot <code>value − 1</code>.`,
      cases: `[
        (([4, 3, 2, 7, 8, 2, 3, 1],), [5, 6]),
        (([1, 1],), [2]),
        (([1, 2],), []),
        (([2, 2, 2],), [1, 3]),
      ]`,
      mustNot: [{ re: "set\\(|Counter|\\bin nums\\b|sort", msg: "Use the list's own slots: no set, Counter, sort or 'in nums'." }],
      solution: `def missing(nums):
    i = 0
    while i < len(nums):
        j = nums[i] - 1
        if nums[i] != nums[j]:
            nums[i], nums[j] = nums[j], nums[i]
        else:
            i += 1
    return [k + 1 for k in range(len(nums)) if nums[k] != k + 1]`,
      note: `Compute <code>j</code> before swapping (predict d5 shows why). The same placing loop finds duplicates (442), the duplicate and missing pair (645), and the first missing positive (p5).`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "A heap isn't sorted",
      code: `import heapq
h = []
for x in [1, 5, 2, 6, 3]:
    heapq.heappush(h, x)
print(h)
print(h[0], h[-1])`,
      explain: `A heap only promises that every parent is ≤ its children, so <code>h[0]</code> is the minimum and nothing else is in order. <code>h[-1]</code> is not the maximum. To list a heap in order, pop repeatedly or <code>sorted(h)</code>.`,
    },
    {
      id: "d2", kind: "predict", title: "Ties reach the payload",
      code: `import heapq
h = []
heapq.heappush(h, (1, {"name": "a"}))
heapq.heappush(h, (1, {"name": "b"}))
print(len(h))`,
      explain: `The two priorities are equal, so Python compares the second fields, two dicts, which can't be ordered: <code>TypeError</code>. Put a unique number between them: <code>(priority, index, item)</code>.`,
    },
    {
      id: "d3", kind: "predict", title: "A max-heap of negatives",
      code: `import heapq
h = []
for x in [4, 9, 2]:
    heapq.heappush(h, -x)
print(h[0], -h[0])
print(-heapq.heappop(h), -heapq.heappop(h))`,
      explain: `Negating turns the largest value into the smallest key, so it rises to the top. The stored keys are negative. Negate on the way in <em>and</em> on the way out, or you'll report −9 as the max.`,
    },
    {
      id: "d4", kind: "predict", title: "nlargest with a key",
      code: `import heapq
print(heapq.nlargest(2, [5, 1, 8, 3]))
print(heapq.nsmallest(2, ["bbb", "a", "cc"], key=len))`,
      explain: `<code>nlargest</code> and <code>nsmallest</code> return sorted lists, best first, and take a <code>key</code> like <code>sorted</code>. Underneath they keep a size-k heap, which is rep r1.`,
    },
    {
      id: "d5", kind: "predict", title: "The swap that reads itself",
      code: `nums = [2, 1]
i = 0
nums[i], nums[nums[i] - 1] = nums[nums[i] - 1], nums[i]
print(nums)
j = nums[i] - 1
nums[i], nums[j] = nums[j], nums[i]
print(nums)`,
      explain: `The right side is worked out first, giving (1, 2). Then the targets are assigned left to right: <code>nums[0] = 1</code>, and only then is <code>nums[nums[0] − 1]</code> worked out, which is now <code>nums[0]</code>, which gets 2 back. Nothing moves. Saving <code>j</code> first fixes it.`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "Find median from a data stream", leetcode: 295,
      fn: "MedianFinder",
      adapt: "lambda f, ops, args: (lambda m: [getattr(m, o)(*a) for o, a in zip(ops, args)])(f())",
      prompt: `Write a class <code>MedianFinder</code> with <code>addNum(num)</code> and <code>findMedian()</code>, both fast: O(log n) to add, O(1) to read. The tests create one and call the methods listed, showing each return value.`,
      stub: `import heapq

class MedianFinder:
    `,
      cases: `[
        ((["addNum", "addNum", "findMedian", "addNum", "findMedian"], [[1], [2], [], [3], []]), [None, None, 1.5, None, 2]),
        ((["addNum", "findMedian"], [[5], []]), [None, 5]),
        ((["addNum", "addNum", "addNum", "addNum", "findMedian"], [[6], [10], [2], [6], []]), [None, None, None, None, 6.0]),
        ((["addNum", "addNum", "addNum", "findMedian"], [[3], [2], [1], []]), [None, None, None, 2]),
      ]`,
      solution: `import heapq

class MedianFinder:
    def __init__(self):
        self.low = []    # max-heap (negated): the smaller half
        self.high = []   # min-heap: the larger half

    def addNum(self, num):
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def findMedian(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2`,
      note: `Every number passes through <code>low</code> into <code>high</code>, which keeps "everything in low ≤ everything in high" with no comparisons of your own. Then one move rebalances, so <code>low</code> has the same size or one more. Break it b2 is what happens without that move.`,
    },
    {
      id: "p2", kind: "problem", title: "K pairs with smallest sums", leetcode: 373,
      fn: "k_smallest_pairs", mode: "sorted",
      prompt: `<code>a</code> and <code>b</code> are sorted. Return the <code>k</code> pairs <code>[u, v]</code> (u from a, v from b) with the smallest sums, in any order. Don't build all pairs.`,
      stub: `def k_smallest_pairs(a, b, k):
    `,
      cases: `[
        (([1, 7, 11], [2, 4, 6], 3), [[1, 2], [1, 4], [1, 6]]),
        (([1, 1, 2], [1, 2, 3], 2), [[1, 1], [1, 1]]),
        (([1, 2], [3], 3), [[1, 3], [2, 3]]),
        (([1, 2, 4], [-1, 1, 10], 3), [[1, -1], [2, -1], [1, 1]]),
      ]`,
      solution: `import heapq

def k_smallest_pairs(a, b, k):
    if not a or not b:
        return []
    heap = [(a[i] + b[0], i, 0) for i in range(min(k, len(a)))]
    heapq.heapify(heap)
    out = []
    while heap and len(out) < k:
        _, i, j = heapq.heappop(heap)
        out.append([a[i], b[j]])
        if j + 1 < len(b):
            heapq.heappush(heap, (a[i] + b[j + 1], i, j + 1))
    return out`,
      note: `Think of it as k-way merge (r3): for each <code>a[i]</code>, the pairs with <code>b[0], b[1], …</code> form a sorted list. Start each list's first pair, and when you pop pair <code>(i, j)</code>, push <code>(i, j + 1)</code>. Only <code>min(k, len(a))</code> lists can ever matter.`,
    },
    {
      id: "p3", kind: "problem", title: "Task scheduler", leetcode: 621,
      fn: "least_interval",
      prompt: `Each task takes one time unit, and the same task must wait <code>n</code> units before running again (idling is allowed). Return the fewest units to finish all <code>tasks</code>.`,
      stub: `def least_interval(tasks, n):
    `,
      cases: `[
        ((["A", "A", "A", "B", "B", "B"], 2), 8),
        ((["A", "C", "A", "B", "D", "B"], 1), 6),
        ((["A", "A", "A", "B", "B", "B"], 3), 10),
        ((["A", "A", "A", "A", "A", "A", "B", "C", "D", "E", "F", "G"], 2), 16),
        ((["A", "B", "C"], 0), 3),
      ]`,
      solution: `from collections import Counter

def least_interval(tasks, n):
    counts = Counter(tasks).values()
    top = max(counts)
    tied = sum(1 for c in counts if c == top)
    return max(len(tasks), (top - 1) * (n + 1) + tied)`,
      note: `The most frequent task sets the frame: <code>top − 1</code> full blocks of <code>n + 1</code> slots, then one last slot for each task tied for the top. Everything else fits into the gaps, and if there's too much to fit, there are no idle slots at all, so the answer is just <code>len(tasks)</code>. Simulating with a max-heap of counts plus a cooldown queue also works, and is the version to reach for when the rules get more complicated.`,
    },
    {
      id: "p4", kind: "problem", title: "Single-threaded CPU", leetcode: 1834,
      fn: "cpu_order",
      prompt: `<code>tasks[i] = [enqueue_time, process_time]</code>. The CPU, when free, runs the available task with the shortest process time (ties: smallest index) to completion. If nothing is available, it waits for the next task. Return the order the indices run in.`,
      stub: `def cpu_order(tasks):
    `,
      cases: `[
        (([[1, 2], [2, 4], [3, 2], [4, 1]],), [0, 2, 3, 1]),
        (([[7, 10], [7, 12], [7, 5], [7, 4], [7, 2]],), [4, 3, 2, 0, 1]),
        (([[5, 2], [1, 1]],), [1, 0]),
        (([[1, 3], [2, 1], [3, 1]],), [0, 1, 2]),
      ]`,
      solution: `import heapq

def cpu_order(tasks):
    order = sorted(range(len(tasks)), key=lambda i: tasks[i][0])
    heap, out = [], []
    time, p = 0, 0
    while len(out) < len(tasks):
        if not heap and time < tasks[order[p]][0]:
            time = tasks[order[p]][0]
        while p < len(order) and tasks[order[p]][0] <= time:
            i = order[p]
            heapq.heappush(heap, (tasks[i][1], i))
            p += 1
        proc, i = heapq.heappop(heap)
        time += proc
        out.append(i)
    return out`,
      note: `The scheduler shape: a list sorted by arrival with a pointer feeds the heap everything that has arrived by <code>time</code>, and the heap picks among what's available. When the heap is empty, jump the clock to the next arrival instead of ticking.`,
    },
    {
      id: "p5", kind: "problem", title: "First missing positive", leetcode: 41,
      fn: "first_missing",
      prompt: `Return the smallest positive integer not in <code>nums</code>, in O(n) time and O(1) extra space.`,
      stub: `def first_missing(nums):
    `,
      cases: `[
        (([1, 2, 0],), 3),
        (([3, 4, -1, 1],), 2),
        (([7, 8, 9, 11, 12],), 1),
        (([1],), 2),
        (([1, 1],), 2),
        (([2, 1],), 3),
      ]`,
      solution: `def first_missing(nums):
    n = len(nums)
    i = 0
    while i < n:
        j = nums[i] - 1
        if 0 <= j < n and nums[i] != nums[j]:
            nums[i], nums[j] = nums[j], nums[i]
        else:
            i += 1
    for k in range(n):
        if nums[k] != k + 1:
            return k + 1
    return n + 1`,
      note: `The answer is somewhere in 1…n + 1, so only values 1…n matter, and they have a home slot each. Rep r6's loop, skipping anything without a home (≤ 0 or > n). A hard whose whole trick is "the indices are a hash table".`,
    },
    {
      id: "p6", kind: "problem", title: "IPO", leetcode: 502,
      fn: "max_capital",
      prompt: `You start with capital <code>w</code> and may do at most <code>k</code> projects. Project <code>i</code> needs <code>capital[i]</code> to start (it isn't spent) and adds <code>profits[i]</code> to your capital. Return the most capital you can end with.`,
      stub: `def max_capital(k, w, profits, capital):
    `,
      cases: `[
        ((2, 0, [1, 2, 3], [0, 1, 1]), 4),
        ((3, 0, [1, 2, 3], [0, 1, 2]), 6),
        ((1, 0, [1, 2, 3], [1, 1, 2]), 0),
        ((10, 0, [1], [0]), 1),
        ((2, 1, [5, 1, 9], [3, 0, 2]), 11),
      ]`,
      solution: `import heapq

def max_capital(k, w, profits, capital):
    projects = sorted(zip(capital, profits))
    heap, p = [], 0
    for _ in range(k):
        while p < len(projects) and projects[p][0] <= w:
            heapq.heappush(heap, -projects[p][1])
            p += 1
        if not heap:
            break
        w -= heapq.heappop(heap)
    return w`,
      note: `Greedy (lesson 09) on a scheduler (p4): of what you can afford now, take the most profitable, since profit only ever unlocks more. Projects sorted by cost, with a pointer, feed a max-heap of profits. A project you can afford stays affordable, so nothing is ever taken back out.`,
    },
  ],

  fromBlank: ["r1", "r3", "r4", "p1", "p4", "p5"],

  leetcode: [
    { n: 1046, title: "Last Stone Weight", slug: "last-stone-weight" },
    { n: 215, title: "Kth Largest Element in an Array (heap, then quickselect)", slug: "kth-largest-element-in-an-array" },
    { n: 973, title: "K Closest Points to Origin", slug: "k-closest-points-to-origin" },
    { n: 347, title: "Top K Frequent Elements", slug: "top-k-frequent-elements" },
    { n: 448, title: "Find All Numbers Disappeared in an Array", slug: "find-all-numbers-disappeared-in-an-array" },
    { n: 378, title: "Kth Smallest Element in a Sorted Matrix", slug: "kth-smallest-element-in-a-sorted-matrix" },
    { n: 373, title: "Find K Pairs with Smallest Sums", slug: "find-k-pairs-with-smallest-sums" },
    { n: 621, title: "Task Scheduler", slug: "task-scheduler" },
    { n: 1834, title: "Single-Threaded CPU", slug: "single-threaded-cpu" },
    { n: 502, title: "IPO", slug: "ipo" },
    { n: 295, title: "Find Median from Data Stream", slug: "find-median-from-data-stream" },
    { n: 41, title: "First Missing Positive", slug: "first-missing-positive" },
    { n: 23, title: "Merge k Sorted Lists", slug: "merge-k-sorted-lists" },
  ],
});
