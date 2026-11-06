COURSE.lesson({
  id: "08",
  title: "Intervals + sweep line",
  tagline: "Sort by start to merge, walk two sorted lists together, and turn intervals into +1/−1 events to count overlaps.",

  intro: `
<p>Interval problems look like geometry, but nearly all of them become easy after one sort. Sorted by start, an
interval can only overlap the one you're building right now, so a single pass merges everything. For "how many at
once?", break each interval into two <b>events</b>, +1 when it starts and −1 when it ends, sort the events, and keep a
running count.</p>

<h3>Do two intervals overlap?</h3>
<p><code>[a, b]</code> and <code>[c, d]</code> overlap exactly when <code>a &lt;= d and c &lt;= b</code>: each starts
before the other ends. With half-open intervals (meetings, where <code>[1, 2]</code> and <code>[2, 3]</code> don't
clash) it's <code>&lt;</code>. Most bugs here are this one character, so decide it first.</p>
<span class="trees"><span class="ivals" data-ivals="[[1, 4], [3, 6]]" data-hl="0,1" data-cap="overlap: 1 ≤ 6 and 3 ≤ 4"></span><span class="ivals" data-ivals="[[1, 2], [3, 5]]" data-cap="apart: 3 &gt; 2"></span><span class="ivals" data-ivals="[[1, 2], [2, 3]]" data-cap="touching: closed, they overlap; half-open, they don't"></span></span>

<h3>Merge: sort by start, extend or append</h3>
<pre><code>intervals.sort()                        # by start
out = []
for s, e in intervals:
    if out and s &lt;= out[-1][1]:         # overlaps the one being built
        out[-1][1] = max(out[-1][1], e) # max: e might be inside already
    else:
        out.append([s, e])</code></pre>
<span class="trees"><span class="ivals" data-ivals="[[1, 3], [2, 6], [8, 10], [9, 12], [15, 18]]" data-out="[[1, 6], [8, 12], [15, 18]]" data-outcap="merged" data-cap="Sorted by start, each one either extends the last merged interval or starts a new one."></span></span>

<h3>Two sorted lists: walk them together</h3>
<p>Intersections of two sorted interval lists: the overlap of <code>A[i]</code> and <code>B[j]</code> is
<code>[max(starts), min(ends)]</code> if that's non-empty. Then move past whichever interval ends first, since it
can't meet anything further on in the other list. It's lesson 04's two pointers again.</p>

<h3>Sweep line: events</h3>
<pre><code>events = []
for s, e in intervals:
    events.append((s, +1))
    events.append((e, -1))
events.sort()               # at equal times, -1 sorts before +1
cur = best = 0
for _, delta in events:
    cur += delta
    best = max(best, cur)</code></pre>
<p>Sorting <code>(time, delta)</code> tuples puts an end (−1) before a start (+1) at the same time, which is right for
half-open meetings: one room is freed before the next is taken. For closed intervals that share a point, you want
starts first instead. If coordinates are small integers, a <b>difference array</b> does the same with no sort:
<code>diff[s] += 1; diff[e] -= 1</code>, then a running sum (lesson 02).</p>
<span class="trees"><span class="ivals" data-ivals="[[1, 5], [2, 7], [4, 9], [8, 10]]" data-count="1" data-cap="The shaded bars are cur at each moment. The most at once is 3, from 4 to 5."></span></span>

<h3>Which sort?</h3>
<table>
<thead><tr><th>Question</th><th>Sort by</th></tr></thead>
<tbody>
<tr><td>merge, insert, union length, gaps</td><td>start</td></tr>
<tr><td>keep the most non-overlapping, fewest arrows</td><td>end (lesson 09's exchange argument)</td></tr>
<tr><td>how many at once, rooms, capacity</td><td>events by time</td></tr>
<tr><td>remove intervals covered by others</td><td>start ascending, then end <em>descending</em></td></tr>
</tbody>
</table>

<h3>Traps</h3>
<ol>
<li><b><code>out[-1][1] = e</code> instead of <code>max(…)</code>.</b> An interval inside the current one would shrink it (Break it b1).</li>
<li><b>Wrong tie order for events.</b> A start before an end at the same time counts back-to-back meetings as a clash (b2).</li>
<li><b>Changing the input by accident.</b> <code>out.append(iv)</code> then <code>out[-1][1] = …</code> also edits <code>iv</code> in the input (predict d2). Append <code>[s, e]</code>.</li>
<li><b>A one-sided overlap test.</b> <code>a[1] &gt; b[0]</code> alone is True for <code>[5, 6]</code> and <code>[1, 2]</code> (predict d4).</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>Complexity:</b> O(n log n) for the sort, then O(n). The difference array is O(n + range).</li>
<li><b>"Meeting rooms with a heap?"</b> Sort by start, and keep a min-heap of end times: pop the earliest end if it's ≤ this start (lesson 07). Same answer as the sweep.</li>
<li><b>"Intervals arrive one at a time, query any time?"</b> Keep them merged in a sorted structure and insert with binary search (lesson 05). Python has no balanced tree, so name <code>sortedcontainers</code> or a segment tree.</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "Merge: extend or start new",
      prompt: `Sorted by start, an interval either overlaps the last merged one (extend its end) or starts a new one. Watch <code>out</code> grow, and watch the inner interval that must not shrink the end.`,
      code: `def merge(intervals):
    intervals.sort()
    out = []
    for s, e in intervals:
        if out and s <= out[-1][1]:  # ask 2,4,5: out
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out

print(merge([[8, 10], [1, 4], [2, 3], [3, 6], [9, 12]]))`,
      note: `<code>[2, 3]</code> sits inside <code>[1, 4]</code>, so the end stays 4 because of the <code>max</code>. Then <code>[3, 6]</code> extends it to 6. Sorting first is what makes one look back enough: anything that could overlap the current block starts before the next block does.`,
    },
    {
      id: "w2", kind: "walk", title: "Sweep: +1 at a start, −1 at an end",
      prompt: `How many intervals cover the busiest point? Each closed interval becomes two events. At equal times, starts (0) sort before ends (1), so intervals that touch at a point both count there.`,
      code: `def max_overlap(intervals):
    events = []
    for s, e in intervals:
        events.append((s, 0))
        events.append((e, 1))
    events.sort()
    cur = best = 0
    for t, kind in events:
        cur += 1 if kind == 0 else -1  # ask 3,5: (t, cur)
        best = max(best, cur)
    return best  # ask: best

print(max_overlap([[1, 5], [2, 3], [4, 6], [5, 7]]))`,
      note: `At time 5, <code>[5, 7]</code> starts before <code>[1, 5]</code> ends, so three intervals share the point 5. For half-open meetings you'd want the opposite tie order: ends first, so a room freed at 5 can be reused at 5 (problem p3).`,
    },
    {
      id: "w3", kind: "walk", title: "Intersect two sorted lists",
      prompt: `Two lists of disjoint, sorted intervals. The overlap of the current pair is <code>[max of starts, min of ends]</code>. Then drop whichever ends first: it can't reach anything further on in the other list.`,
      code: `def intersect(A, B):
    i = j = 0
    out = []
    while i < len(A) and j < len(B):
        lo = max(A[i][0], B[j][0])
        hi = min(A[i][1], B[j][1])
        if lo <= hi:
            out.append([lo, hi])
        if A[i][1] < B[j][1]:  # ask 1,3: (A[i], B[j])
            i += 1
        else:
            j += 1
    return out

print(intersect([[0, 2], [5, 10], [13, 23]], [[1, 5], [8, 12], [15, 24]]))`,
      note: `<code>[5, 5]</code> is a real answer: the two lists touch at one point, and with closed intervals that counts. Each step moves one pointer, so it's O(len(A) + len(B)).`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "Merge without max",
      prompt: `This merges overlapping intervals, but when one overlaps, it sets the end to the new interval's end instead of the larger of the two. Find intervals where the result is wrong.`,
      fn: "merge", args: "intervals",
      code: `def merge(intervals):
    intervals.sort()
    out = []
    for s, e in intervals:
        if out and s <= out[-1][1]:
            out[-1][1] = e
        else:
            out.append([s, e])
    return out`,
      ref: "right",
      right: `def right(intervals):
    intervals.sort()
    out = []
    for s, e in intervals:
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`,
      valid: `lambda ivs: (isinstance(ivs, list) and len(ivs) <= 8 and all(isinstance(iv, list) and len(iv) == 2 and all(type(v) is int for v in iv) and 0 <= iv[0] <= iv[1] <= 100 for iv in ivs)) or "a list of up to 8 [start, end] pairs with 0 ≤ start ≤ end ≤ 100."`,
      rules: `a list of up to 8 <code>[start, end]</code> pairs with 0 ≤ start ≤ end ≤ 100.`,
      example: `[[1, 10], [2, 3]]`,
      explain: `<code>[2, 3]</code> lies inside <code>[1, 10]</code>, and the merged block shrinks to <code>[1, 3]</code>. Sorting by start says nothing about ends: a later interval can end earlier. Hence <code>max</code>.`,
    },
    {
      id: "b2", kind: "breakit", title: "Starts before ends",
      prompt: `Rooms needed for meetings, where a meeting ending at 5 frees its room for one starting at 5. This sweep sorts events as <code>(time, +1 or −1)</code> but with <code>+1</code> written as 0 and <code>−1</code> as 1, so at equal times starts come first. Find meetings where it asks for too many rooms.`,
      fn: "rooms", args: "meetings",
      code: `def rooms(meetings):
    events = []
    for s, e in meetings:
        events.append((s, 0))
        events.append((e, 1))
    events.sort()
    cur = best = 0
    for t, kind in events:
        cur += 1 if kind == 0 else -1
        best = max(best, cur)
    return best`,
      ref: "right",
      right: `def right(meetings):
    events = []
    for s, e in meetings:
        events.append((s, 1))
        events.append((e, -1))
    events.sort()
    cur = best = 0
    for t, d in events:
        cur += d
        best = max(best, cur)
    return best`,
      valid: `lambda ms: (isinstance(ms, list) and len(ms) <= 8 and all(isinstance(m, list) and len(m) == 2 and all(type(v) is int for v in m) and 0 <= m[0] < m[1] <= 100 for m in ms)) or "a list of up to 8 [start, end] meetings with 0 ≤ start < end ≤ 100."`,
      rules: `a list of up to 8 <code>[start, end]</code> meetings with 0 ≤ start &lt; end ≤ 100.`,
      example: `[[1, 2], [2, 3]]`,
      explain: `At time 2 the second meeting is let in before the first one leaves, so for an instant there are two. The same sweep is right or wrong depending only on the tie order. With <code>(time, −1)</code> for ends and <code>(time, +1)</code> for starts, plain tuple sorting does the right thing.`,
    },
    {
      id: "b3", kind: "breakit", title: "Merge sorted by end",
      prompt: `The merge loop again, but the intervals are sorted by their <b>end</b> first. Find intervals where it goes wrong.`,
      fn: "merge", args: "intervals",
      code: `def merge(intervals):
    intervals.sort(key=lambda iv: iv[1])
    out = []
    for s, e in intervals:
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`,
      ref: "right",
      right: `def right(intervals):
    intervals.sort()
    out = []
    for s, e in intervals:
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`,
      valid: `lambda ivs: (isinstance(ivs, list) and len(ivs) <= 8 and all(isinstance(iv, list) and len(iv) == 2 and all(type(v) is int for v in iv) and 0 <= iv[0] <= iv[1] <= 100 for iv in ivs)) or "a list of up to 8 [start, end] pairs with 0 ≤ start ≤ end ≤ 100."`,
      rules: `a list of up to 8 <code>[start, end]</code> pairs with 0 ≤ start ≤ end ≤ 100.`,
      example: `[[2, 3], [1, 4]]`,
      explain: `<code>[2, 3]</code> ends first, so it becomes the block, and <code>[1, 4]</code> extends the end but never the start: the result is <code>[2, 4]</code>. Merging only ever looks at the last block's end, which is safe only if nothing later starts earlier. Sorting by start guarantees that.`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "Merge intervals", leetcode: 56,
      fn: "merge", sig: "merge(intervals: list[list[int]]) -> list[list[int]]",
      prompt: `Merge all overlapping intervals (touching ends count as overlapping) and return them sorted. Sort by start, then extend the last one or append a new one.`,
      cases: `[
        (([[1, 3], [2, 6], [8, 10], [15, 18]],), [[1, 6], [8, 10], [15, 18]]),
        (([[1, 4], [4, 5]],), [[1, 5]]),
        (([[1, 10], [2, 3]],), [[1, 10]]),
        (([],), []),
        (([[5, 6], [1, 2]],), [[1, 2], [5, 6]]),
      ]`,
      solution: `def merge(intervals):
    intervals.sort()
    out = []
    for s, e in intervals:
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`,
      note: `Appending <code>[s, e]</code> (a new list) rather than the input interval itself means changing <code>out[-1][1]</code> can't edit the caller's data.`,
    },
    {
      id: "r2", kind: "rep", title: "Do two intervals overlap?",
      fn: "overlaps", sig: "overlaps(a: list[int], b: list[int]) -> bool",
      prompt: `Closed intervals: they overlap if they share at least one point. Return the answer with one condition that covers every order: each must start no later than the other ends.`,
      cases: `[
        (([1, 3], [2, 5]), True),
        (([1, 2], [2, 3]), True),
        (([5, 6], [1, 2]), False),
        (([1, 10], [3, 4]), True),
        (([3, 4], [1, 10]), True),
        (([1, 2], [3, 4]), False),
      ]`,
      solution: `def overlaps(a, b):
    return a[0] <= b[1] and b[0] <= a[1]`,
      note: `The other way to see it: they <em>don't</em> overlap when one ends before the other starts, <code>a[1] &lt; b[0] or b[1] &lt; a[0]</code>, and this is its negation. For half-open intervals, swap <code>&lt;=</code> for <code>&lt;</code>.`,
    },
    {
      id: "r3", kind: "rep", title: "Most intervals at one point",
      fn: "max_overlap", sig: "max_overlap(intervals: list[list[int]]) -> int",
      prompt: `Closed intervals. Return the largest number covering any single point. Make <code>(time, 0)</code> start events and <code>(time, 1)</code> end events, so at equal times starts come first, and sweep.`,
      cases: `[
        (([[1, 2], [2, 3]],), 2),
        (([[1, 5], [2, 3], [4, 6]],), 2),
        (([[1, 10], [2, 9], [3, 8]],), 3),
        (([],), 0),
        (([[1, 5], [2, 3], [4, 6], [5, 7]],), 3),
      ]`,
      solution: `def max_overlap(intervals):
    events = []
    for s, e in intervals:
        events.append((s, 0))
        events.append((e, 1))
    events.sort()
    cur = best = 0
    for t, kind in events:
        cur += 1 if kind == 0 else -1
        best = max(best, cur)
    return best`,
      note: `Encoding the tie order in the tuple means one plain <code>sort()</code> does all the work. Meeting Rooms (p3) is this with the opposite tie order.`,
    },
    {
      id: "r4", kind: "rep", title: "Intersect two lists", leetcode: 986,
      fn: "intersect", sig: "intersect(A: list[list[int]], B: list[list[int]]) -> list[list[int]]",
      prompt: `<code>A</code> and <code>B</code> are each sorted and disjoint (closed intervals). Return every intersection, in order. Two pointers: record the overlap if non-empty, then advance whichever ends first.`,
      cases: `[
        (([[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]), [[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]]),
        (([[1, 3], [5, 9]], []), []),
        (([[1, 7]], [[3, 10]]), [[3, 7]]),
        (([[1, 2]], [[3, 4]]), []),
      ]`,
      solution: `def intersect(A, B):
    i = j = 0
    out = []
    while i < len(A) and j < len(B):
        lo = max(A[i][0], B[j][0])
        hi = min(A[i][1], B[j][1])
        if lo <= hi:
            out.append([lo, hi])
        if A[i][1] < B[j][1]:
            i += 1
        else:
            j += 1
    return out`,
      note: `The one that ends first is finished: everything after it in the other list starts later still. That's the same "this pointer can't help any more" reasoning as lesson 04.`,
    },
    {
      id: "r5", kind: "rep", title: "Range updates with a difference array", leetcode: 1109,
      fn: "bookings", sig: "bookings(updates: list[list[int]], n: int) -> list[int]",
      prompt: `Positions <code>1 … n</code> start at 0. Each update <code>[first, last, x]</code> adds <code>x</code> to every position from first to last. Return the final values in O(n + number of updates): mark <code>+x</code> at <code>first</code> and <code>−x</code> just after <code>last</code>, then a running sum.`,
      cases: `[
        (([[1, 2, 10], [2, 3, 20], [2, 5, 25]], 5), [10, 55, 45, 25, 25]),
        (([[1, 2, 10], [2, 2, 15]], 2), [10, 25]),
        (([], 3), [0, 0, 0]),
      ]`,
      solution: `def bookings(updates, n):
    diff = [0] * (n + 1)
    for first, last, x in updates:
        diff[first - 1] += x
        diff[last] -= x
    out, run = [], 0
    for i in range(n):
        run += diff[i]
        out.append(run)
    return out`,
      note: `The sweep line on integer positions, without a sort: the running sum is the "current count". The array is one longer, so <code>last = n</code> still has somewhere to put its −x. Car Pooling (p4) is this exactly.`,
    },
    {
      id: "r6", kind: "rep", title: "Total length covered",
      fn: "covered", sig: "covered(intervals: list[list[int]]) -> int",
      prompt: `Return the total length of the number line covered by at least one interval (<code>[1, 3]</code> has length 2). Merge as you go and add each finished block's length.`,
      cases: `[
        (([[1, 3], [2, 5], [7, 8]],), 5),
        (([[1, 2]],), 1),
        (([],), 0),
        (([[0, 10], [2, 3]],), 10),
        (([[5, 6], [1, 2], [2, 4]],), 4),
      ]`,
      solution: `def covered(intervals):
    total = 0
    cur_s = cur_e = None
    for s, e in sorted(intervals):
        if cur_e is not None and s <= cur_e:
            cur_e = max(cur_e, e)
        else:
            if cur_e is not None:
                total += cur_e - cur_s
            cur_s, cur_e = s, e
    if cur_e is not None:
        total += cur_e - cur_s
    return total`,
      note: `Merging without storing the result: hold only the current block, and flush it when a gap appears <em>and</em> once more at the end. Forgetting that last flush is the classic bug.`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "Sorting lists of pairs",
      code: `print(sorted([[1, 5], [1, 2], [0, 9]]))
print(sorted([[1, 5], [1, 2], [0, 9]], key=lambda iv: iv[1]))`,
      explain: `Lists compare item by item, so a plain sort orders by start, then by end for ties. That's the merge order. With <code>key=lambda iv: iv[1]</code> it's by end, the order for greedy scheduling (lesson 09).`,
    },
    {
      id: "d2", kind: "predict", title: "Editing the input by accident",
      code: `intervals = [[1, 3], [2, 6]]
out = []
for iv in intervals:
    if out and iv[0] <= out[-1][1]:
        out[-1][1] = max(out[-1][1], iv[1])
    else:
        out.append(iv)
print(out, intervals)`,
      explain: `<code>out.append(iv)</code> stores the same list object as <code>intervals[0]</code>, so extending <code>out[-1]</code> also rewrote the caller's input. Append a fresh <code>[s, e]</code>.`,
    },
    {
      id: "d3", kind: "predict", title: "Event tie order",
      code: `events = [(2, 1), (2, -1), (1, 1), (3, -1)]
print(sorted(events))`,
      explain: `Tuples compare by time, then by the second field, and −1 &lt; 1, so at time 2 the end comes before the start. That's the half-open meeting order for free. If you need starts first, encode them as the smaller number.`,
    },
    {
      id: "d4", kind: "predict", title: "A one-sided overlap test",
      code: `def overlaps(a, b):
    return a[1] >= b[0]

print(overlaps([1, 3], [2, 5]), overlaps([5, 6], [1, 2]))`,
      explain: `"a ends after b starts" is only half the story. <code>[5, 6]</code> ends after <code>[1, 2]</code> starts, yet they don't touch, because a also starts after b ends. You need both: <code>a[0] &lt;= b[1] and b[0] &lt;= a[1]</code>.`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "Insert interval", leetcode: 57,
      fn: "insert",
      prompt: `<code>intervals</code> is sorted and non-overlapping. Insert <code>new</code>, merging where needed, and return the result, in O(n) (no sorting).<span class="trees"><span class="ivals" data-ivals="[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16], [4, 8]]" data-hl="5" data-out="[[1, 2], [3, 10], [12, 16]]" data-outcap="result" data-cap="Second test: new = [4, 8], in blue."></span></span>`,
      stub: `def insert(intervals, new):
    `,
      cases: `[
        (([[1, 3], [6, 9]], [2, 5]), [[1, 5], [6, 9]]),
        (([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]), [[1, 2], [3, 10], [12, 16]]),
        (([], [5, 7]), [[5, 7]]),
        (([[1, 5]], [6, 8]), [[1, 5], [6, 8]]),
        (([[3, 5]], [1, 2]), [[1, 2], [3, 5]]),
      ]`,
      solution: `def insert(intervals, new):
    out = []
    s, e = new
    i, n = 0, len(intervals)
    while i < n and intervals[i][1] < s:
        out.append(intervals[i])
        i += 1
    while i < n and intervals[i][0] <= e:
        s = min(s, intervals[i][0])
        e = max(e, intervals[i][1])
        i += 1
    out.append([s, e])
    out.extend(intervals[i:])
    return out`,
      note: `Three stretches: everything that ends before the new one starts, then everything that overlaps it (absorbed into it), then the rest. Each <code>while</code> is one of rep r2's overlap conditions.`,
    },
    {
      id: "p2", kind: "problem", title: "Non-overlapping intervals", leetcode: 435,
      fn: "erase_overlap",
      prompt: `Return the fewest intervals to remove so the rest don't overlap. Touching ends (<code>[1, 2]</code> and <code>[2, 3]</code>) are fine.`,
      stub: `def erase_overlap(intervals):
    `,
      cases: `[
        (([[1, 2], [2, 3], [3, 4], [1, 3]],), 1),
        (([[1, 2], [1, 2], [1, 2]],), 2),
        (([[1, 2], [2, 3]],), 0),
        (([[1, 100], [11, 22], [1, 11], [2, 12]],), 2),
      ]`,
      solution: `def erase_overlap(intervals):
    intervals.sort(key=lambda iv: iv[1])
    kept, end = 0, float("-inf")
    for s, e in intervals:
        if s >= end:
            kept += 1
            end = e
    return len(intervals) - kept`,
      note: `Remove the fewest = keep the most, so it's lesson 09's sort-by-end greedy and a subtraction. Merging (sort by start) answers a different question, and this is where picking the sort is the whole problem.`,
    },
    {
      id: "p3", kind: "problem", title: "Meeting rooms II", leetcode: 253,
      fn: "min_rooms",
      prompt: `Each meeting is <code>[start, end)</code>: a room freed at time 5 can be used by a meeting starting at 5. Return the fewest rooms needed.<span class="trees"><span class="ivals" data-ivals="[[0, 30], [5, 10], [15, 20]]" data-count="1" data-cap="Never more than 2 at once, so 2 rooms."></span></span>`,
      stub: `def min_rooms(meetings):
    `,
      cases: `[
        (([[0, 30], [5, 10], [15, 20]],), 2),
        (([[7, 10], [2, 4]],), 1),
        (([[1, 5], [5, 10]],), 1),
        (([[1, 10], [2, 7], [3, 19], [8, 12], [10, 20], [11, 30]],), 4),
        (([],), 0),
      ]`,
      solution: `def min_rooms(meetings):
    events = []
    for s, e in meetings:
        events.append((s, 1))
        events.append((e, -1))
    events.sort()
    cur = best = 0
    for _, d in events:
        cur += d
        best = max(best, cur)
    return best`,
      note: `Rooms needed = most meetings at once, which is the sweep. <code>(e, −1)</code> sorts before <code>(s, +1)</code> at the same time, which frees the room first (Break it b2). The heap version: sort by start, and keep a min-heap of end times, popping one whenever its end ≤ this start.`,
    },
    {
      id: "p4", kind: "problem", title: "Car pooling", leetcode: 1094,
      fn: "car_pooling",
      prompt: `<code>trips[i] = [passengers, from, to]</code>: they get on at <code>from</code> and off at <code>to</code>, and the car only drives forward. Locations are 0 to 1000. Return whether the car's <code>capacity</code> is ever exceeded (False if it is).`,
      stub: `def car_pooling(trips, capacity):
    `,
      cases: `[
        (([[2, 1, 5], [3, 3, 7]], 4), False),
        (([[2, 1, 5], [3, 3, 7]], 5), True),
        (([[2, 1, 5], [3, 5, 7]], 3), True),
        (([[3, 2, 7], [3, 7, 9], [8, 3, 9]], 11), True),
      ]`,
      solution: `def car_pooling(trips, capacity):
    diff = [0] * 1002
    for k, a, b in trips:
        diff[a] += k
        diff[b] -= k
    load = 0
    for x in diff:
        load += x
        if load > capacity:
            return False
    return True`,
      note: `Small integer locations, so rep r5's difference array beats sorting events. Getting off at <code>to</code> happens before anyone gets on there, which is why the −k goes at <code>b</code> itself, not <code>b + 1</code>: the trip is half-open.`,
    },
    {
      id: "p5", kind: "problem", title: "Common free time", leetcode: 759,
      fn: "free_time",
      prompt: `<code>schedules</code> holds one list per person of their busy intervals (each list sorted and disjoint). Return the finite intervals, in order, where <b>nobody</b> is busy. Touching intervals leave no gap.`,
      stub: `def free_time(schedules):
    `,
      cases: `[
        (([[[1, 2], [5, 6]], [[1, 3]], [[4, 10]]],), [[3, 4]]),
        (([[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]],), [[5, 6], [7, 9]]),
        (([[[1, 2]]],), []),
        (([[[1, 2]], [[2, 3]]],), []),
      ]`,
      solution: `def free_time(schedules):
    busy = sorted(iv for person in schedules for iv in person)
    out = []
    end = busy[0][1]
    for s, e in busy[1:]:
        if s > end:
            out.append([end, s])
        end = max(end, e)
    return out`,
      note: `Pool everyone's busy time and merge it: the gaps between merged blocks are the free time. You don't need the merged list, only the running end. With k sorted lists, a heap merge (lesson 07) saves the sort: O(n log k).`,
    },
    {
      id: "p6", kind: "problem", title: "Remove covered intervals", leetcode: 1288,
      fn: "remaining",
      prompt: `An interval is covered if another one contains it (<code>c &lt;= a</code> and <code>b &lt;= d</code>). Remove every covered interval and return how many are left. All intervals are distinct.`,
      stub: `def remaining(intervals):
    `,
      cases: `[
        (([[1, 4], [3, 6], [2, 8]],), 2),
        (([[1, 4], [2, 3]],), 1),
        (([[1, 2], [1, 4], [3, 4]],), 1),
        (([[3, 10], [4, 10], [5, 11]],), 2),
      ]`,
      solution: `def remaining(intervals):
    intervals.sort(key=lambda iv: (iv[0], -iv[1]))
    count, far = 0, -1
    for s, e in intervals:
        if e > far:
            count += 1
            far = e
    return count`,
      note: `Sort by start, and for equal starts put the <em>longest</em> first. Then every earlier interval starts no later, so an interval is covered exactly when some earlier end reaches past it: <code>e &lt;= far</code>. Without the descending tiebreak, <code>[1, 2]</code> would come before <code>[1, 4]</code> and wouldn't be seen as covered.`,
    },
  ],

  fromBlank: ["r1", "r3", "r4", "p1", "p3", "p6"],

  leetcode: [
    { n: 56, title: "Merge Intervals", slug: "merge-intervals" },
    { n: 57, title: "Insert Interval", slug: "insert-interval" },
    { n: 986, title: "Interval List Intersections", slug: "interval-list-intersections" },
    { n: 1109, title: "Corporate Flight Bookings", slug: "corporate-flight-bookings" },
    { n: 435, title: "Non-overlapping Intervals", slug: "non-overlapping-intervals" },
    { n: 1094, title: "Car Pooling", slug: "car-pooling" },
    { n: 1288, title: "Remove Covered Intervals", slug: "remove-covered-intervals" },
    { n: 253, title: "Meeting Rooms II (premium)", slug: "meeting-rooms-ii" },
    { n: 759, title: "Employee Free Time (premium)", slug: "employee-free-time" },
    { n: 732, title: "My Calendar III", slug: "my-calendar-iii" },
  ],
});
