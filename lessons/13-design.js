COURSE.lesson((() => {
  // Every class test: build it with `init`, call each op with its args, show each return value.
  const RUN = "lambda f, init, ops, args: (lambda m: [getattr(m, o)(*a) for o, a in zip(ops, args)])(f(*init))";
  // Break-it drivers take a list of [op, *args] and return the outputs.
  const DRIVE = (cls) => `
def run(ops):
    obj = ${cls}()
    return [getattr(obj, op[0])(*op[1:]) for op in ops]`;

  return {
  id: "13",
  title: "Design-a-class",
  tagline: "List the operations and the speed each needs, pick one structure per need, and keep them in sync. O(1) by swap-with-last, timestamps by binary search, deletes done lazily.",

  intro: `
<p>"Design a class that supports …" is a senior favourite, because there's no algorithm to recall: you have to
<b>choose structures</b>. Do it the same way every time:</p>
<ol>
<li><b>Write down each operation and the speed it needs.</b> "insert O(1), remove O(1), random O(1)".</li>
<li><b>For each one, name the structure that gives that speed:</b> a dict for "find by key", a list for "pick by
position", a heap for "the smallest", a deque for "oldest first", a sorted list plus bisect for "latest at or before
time t".</li>
<li><b>Write down the invariant that ties them together</b> ("<code>pos[v]</code> is v's index in <code>vals</code>"),
and update every structure in every method so it stays true.</li>
</ol>

<h3>The tricks that come up again and again</h3>
<table>
<thead><tr><th>Need</th><th>Trick</th><th>Problems</th></tr></thead>
<tbody>
<tr><td>remove from a list in O(1)</td><td>swap with the last item, pop, fix the moved item's index</td><td>380</td></tr>
<tr><td>the minimum of a stack at any time</td><td>store <code>(value, min so far)</code> pairs</td><td>155</td></tr>
<tr><td>remove from a heap</td><td><b>lazy deletion</b>: record it as deleted, and discard it when it reaches the top</td><td>2034, 480</td></tr>
<tr><td>value at time t</td><td>per key, a list of <code>(time, value)</code> in time order + <code>bisect_right</code></td><td>981, 1146</td></tr>
<tr><td>least or most frequent</td><td>a dict of count → group, plus the current min or max count</td><td>460, 895</td></tr>
<tr><td>the last N seconds</td><td>a deque of timestamps, popping old ones from the left</td><td>933, 362</td></tr>
</tbody>
</table>

<h3>Python class basics, so syntax costs nothing</h3>
<pre><code>class Thing:
    def __init__(self, cap):
        self.cap = cap
        self.data = {}            # every field goes on self

    def get(self, key):           # self comes first in every method
        return self.data.get(key, -1)</code></pre>

<h3>Traps</h3>
<ol>
<li><b>One structure updated, the other forgotten.</b> Every method must leave every invariant true (Break it b1).</li>
<li><b>A lazily deleted item served anyway.</b> Clean the top before <em>every</em> read, not only on pop (b2).</li>
<li><b><code>bisect_left</code> where you need <code>bisect_right</code>.</b> "At or before t" must include t itself (b3).</li>
<li><b>Class-level mutable fields.</b> <code>data = {}</code> written in the class body (not in <code>__init__</code>) is shared by every instance (predict d1).</li>
<li><b>Forgetting <code>self.</code></b> makes a local variable that disappears when the method returns.</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>"What's the complexity of each operation?"</b> Give a table, not one number.</li>
<li><b>"Make it thread-safe."</b> One lock around each method is the honest first answer. Then say which methods could share a read lock.</li>
<li><b>"Memory grows forever?"</b> Timestamps and lazy deletes pile up. Mention compaction: rebuild the heap when more than half of it is dead.</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "Remove in O(1): swap with the last",
      prompt: `A set that can also return a random member in O(1), so it needs a list (for random) and a dict of value → index (for finding). To remove from the middle of the list, move the last value into the hole and pop the end. Watch both structures stay in sync.`,
      code: `class RandomSet:
    def __init__(self):
        self.vals = []
        self.pos = {}

    def insert(self, v):
        if v in self.pos:
            return False
        self.pos[v] = len(self.vals)
        self.vals.append(v)
        return True

    def remove(self, v):
        if v not in self.pos:
            return False
        i, last = self.pos[v], self.vals[-1]
        self.vals[i] = last  # ask: (self.vals, self.pos)
        self.pos[last] = i
        self.vals.pop()
        del self.pos[v]
        return True

s = RandomSet()
for v in [10, 20, 30, 40]:
    s.insert(v)
s.remove(20)
s.remove(40)
print(s.vals, s.pos)`,
      note: `Removing 20: 40 moves into its slot and <code>pos[40]</code> is fixed to 1. Then removing 40 finds it at 1, where it now is. Both lines that touch <code>pos</code> matter, and Break it b1 drops one of them. When the removed value <em>is</em> the last one, the swap is with itself, and the order of the last two lines is what keeps that case right.`,
    },
    {
      id: "w2", kind: "walk", title: "Lazy deletion from a heap",
      prompt: `heapq can't remove from the middle. Instead, count removals in <code>gone</code>, and whenever someone looks at the top, throw away tops that are marked gone first.`,
      code: `import heapq
from collections import Counter

class LazyHeap:
    def __init__(self):
        self.h = []
        self.gone = Counter()

    def push(self, x):
        heapq.heappush(self.h, x)

    def remove(self, x):
        self.gone[x] += 1

    def min(self):
        while self.gone[self.h[0]]:  # ask 1,4: (sorted(self.h), dict(self.gone))
            self.gone[self.h[0]] -= 1
            heapq.heappop(self.h)
        return self.h[0]

q = LazyHeap()
for x in [5, 3, 8, 1]:
    q.push(x)
q.remove(1)
q.remove(3)
print(q.min())
q.remove(5)
print(q.min())`,
      note: `<code>remove</code> is O(1), and each dead item is popped once at most, when it finally reaches the top. So it all averages out to O(log n) per operation. A Counter rather than a set, because the same value can be pushed (and removed) more than once.`,
    },
    {
      id: "w3", kind: "walk", title: "Min stack: carry the minimum along",
      prompt: `A stack whose minimum is available in O(1) at any time. Each entry stores its value <em>and</em> the minimum of everything at or below it, so popping restores the old minimum for free.`,
      code: `class MinStack:
    def __init__(self):
        self.st = []

    def push(self, x):
        low = min(x, self.st[-1][1]) if self.st else x
        self.st.append((x, low))

    def pop(self):
        self.st.pop()

    def get_min(self):
        return self.st[-1][1]  # ask: self.st

s = MinStack()
for x in [5, 2, 7, 1]:
    s.push(x)
print(s.get_min())
s.pop()
print(s.get_min())`,
      note: `A single <code>self.min</code> field would be stuck after popping the 1: what was the minimum before it? Storing the answer next to every entry means the past is never lost. It's the "tuple up" idea from lesson 01, on a stack.`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "The index that wasn't fixed",
      prompt: `This set removes by swapping with the last item, but forgets to update the moved item's index in <code>pos</code>. Find a sequence of operations where it goes wrong. Give a list like <code>[["insert", 1], ["remove", 1]]</code>.`,
      fn: "run", args: "ops",
      code: `class RandomSet:
    def __init__(self):
        self.vals, self.pos = [], {}

    def insert(self, v):
        if v in self.pos:
            return False
        self.pos[v] = len(self.vals)
        self.vals.append(v)
        return True

    def remove(self, v):
        if v not in self.pos:
            return False
        i = self.pos[v]
        self.vals[i] = self.vals[-1]
        self.vals.pop()
        del self.pos[v]
        return True
` + DRIVE("RandomSet"),
      ref: "run",
      right: `class RandomSet:
    def __init__(self):
        self.vals, self.pos = [], {}

    def insert(self, v):
        if v in self.pos:
            return False
        self.pos[v] = len(self.vals)
        self.vals.append(v)
        return True

    def remove(self, v):
        if v not in self.pos:
            return False
        i, last = self.pos[v], self.vals[-1]
        self.vals[i] = last
        self.pos[last] = i
        self.vals.pop()
        del self.pos[v]
        return True
` + DRIVE("RandomSet"),
      valid: `lambda ops: (isinstance(ops, list) and 1 <= len(ops) <= 10 and all(isinstance(o, list) and len(o) == 2 and o[0] in ("insert", "remove") and type(o[1]) is int for o in ops)) or 'a list of up to 10 operations like ["insert", 1] or ["remove", 1].'`,
      rules: `up to 10 operations, each <code>["insert", n]</code> or <code>["remove", n]</code>.`,
      example: `[["insert", 1], ["insert", 2], ["remove", 1], ["remove", 2]]`,
      explain: `After removing 1, the 2 sits at index 0, but <code>pos[2]</code> still says 1. Removing 2 then writes to a slot past the end and crashes. Two structures, one fact: every change must update both.`,
    },
    {
      id: "b2", kind: "breakit", title: "Cleaning only on pop",
      prompt: `A lazy-deletion heap that discards dead items when you <code>pop</code>, but not when you only peek with <code>min</code>. Find operations where <code>min</code> returns something already removed. Operations: <code>["push", x]</code>, <code>["remove", x]</code> (x is in the heap), <code>["min"]</code>, <code>["pop"]</code>.`,
      fn: "run", args: "ops",
      code: `import heapq
from collections import Counter

class LazyHeap:
    def __init__(self):
        self.h, self.gone = [], Counter()

    def push(self, x):
        heapq.heappush(self.h, x)

    def remove(self, x):
        self.gone[x] += 1

    def pop(self):
        while self.gone[self.h[0]]:
            self.gone[self.h[0]] -= 1
            heapq.heappop(self.h)
        return heapq.heappop(self.h)

    def min(self):
        return self.h[0]
` + DRIVE("LazyHeap"),
      ref: "run",
      right: `import heapq
from collections import Counter

class LazyHeap:
    def __init__(self):
        self.h, self.gone = [], Counter()

    def push(self, x):
        heapq.heappush(self.h, x)

    def remove(self, x):
        self.gone[x] += 1

    def _clean(self):
        while self.gone[self.h[0]]:
            self.gone[self.h[0]] -= 1
            heapq.heappop(self.h)

    def pop(self):
        self._clean()
        return heapq.heappop(self.h)

    def min(self):
        self._clean()
        return self.h[0]
` + DRIVE("LazyHeap"),
      valid: `lambda ops: (isinstance(ops, list) and 1 <= len(ops) <= 10 and all(isinstance(o, list) and ((len(o) == 2 and o[0] in ("push", "remove") and type(o[1]) is int) or (len(o) == 1 and o[0] in ("min", "pop"))) for o in ops) and (lambda live: all((live.append(o[1]) or True) if o[0] == "push" else ((o[1] in live and (live.remove(o[1]) or True)) if o[0] == "remove" else (len(live) > 0 and ((o[0] == "min") or (live.remove(min(live)) or True)))) for o in ops))([])) or "up to 10 operations; remove only what's in the heap, and min or pop only when it isn't empty."`,
      rules: `up to 10 operations. Only remove values that are in the heap, and only <code>min</code> or <code>pop</code> when it's not empty.`,
      example: `[["push", 1], ["push", 2], ["remove", 1], ["min"]]`,
      explain: `1 is marked gone but still physically on top, and <code>min</code> looks without cleaning. With lazy deletion, the rule is "clean the top before <em>any</em> read of it": put the cleaning loop in one helper and call it from every method that looks.`,
    },
    {
      id: "b3", kind: "breakit", title: "bisect_left for \"at or before\"",
      prompt: `A key-value store with timestamps: <code>get(key, t)</code> returns the value set at the latest time ≤ t, or <code>""</code>. This one uses <code>bisect_left</code>. Find operations where it misses. Use <code>["set", key, value, t]</code> (times increase) and <code>["get", key, t]</code>.`,
      fn: "run", args: "ops",
      code: `from bisect import bisect_left

class TimeMap:
    def __init__(self):
        self.times, self.vals = {}, {}

    def set(self, key, value, t):
        self.times.setdefault(key, []).append(t)
        self.vals.setdefault(key, []).append(value)

    def get(self, key, t):
        ts = self.times.get(key, [])
        i = bisect_left(ts, t)
        return self.vals[key][i - 1] if i else ""
` + DRIVE("TimeMap"),
      ref: "run",
      right: `from bisect import bisect_right

class TimeMap:
    def __init__(self):
        self.times, self.vals = {}, {}

    def set(self, key, value, t):
        self.times.setdefault(key, []).append(t)
        self.vals.setdefault(key, []).append(value)

    def get(self, key, t):
        ts = self.times.get(key, [])
        i = bisect_right(ts, t)
        return self.vals[key][i - 1] if i else ""
` + DRIVE("TimeMap"),
      valid: `lambda ops: (isinstance(ops, list) and 1 <= len(ops) <= 10 and all(isinstance(o, list) and ((len(o) == 4 and o[0] == "set" and isinstance(o[1], str) and isinstance(o[2], str) and type(o[3]) is int) or (len(o) == 3 and o[0] == "get" and isinstance(o[1], str) and type(o[2]) is int)) for o in ops) and all(a[3] < b[3] for a, b in zip([o for o in ops if o[0] == "set"], [o for o in ops if o[0] == "set"][1:]))) or 'up to 10 operations like ["set", "k", "v", 1] or ["get", "k", 1]; set times must increase.'`,
      rules: `up to 10 operations, <code>["set", key, value, t]</code> with increasing t, or <code>["get", key, t]</code>.`,
      example: `[["set", "k", "v", 1], ["get", "k", 1]]`,
      explain: `<code>bisect_left(ts, 1)</code> on <code>[1]</code> is 0, so it looks before the value set at exactly time 1. "At or before t" means everything ≤ t, and <code>bisect_right</code> counts exactly those. The <code>i − 1</code> is then the last one.`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "Min stack", leetcode: 155,
      fn: "MinStack", adapt: RUN,
      prompt: `<code>MinStack()</code> with <code>push(x)</code>, <code>pop()</code>, <code>top()</code> and <code>getMin()</code>, all O(1). Store <code>(value, min so far)</code> pairs.`,
      cases: `[
        (([], ["push", "push", "push", "getMin", "pop", "top", "getMin"], [[-2], [0], [-3], [], [], [], []]), [None, None, None, -3, None, 0, -2]),
        (([], ["push", "push", "pop", "getMin"], [[1], [1], [], []]), [None, None, None, 1]),
      ]`,
      solution: `class MinStack:
    def __init__(self):
        self.st = []

    def push(self, x):
        low = min(x, self.st[-1][1]) if self.st else x
        self.st.append((x, low))

    def pop(self):
        self.st.pop()

    def top(self):
        return self.st[-1][0]

    def getMin(self):
        return self.st[-1][1]`,
      note: `The tests build the class with <code>init</code>, then call each method and show its return value (<code>None</code> for methods that return nothing). Every class in this lesson is tested that way.`,
    },
    {
      id: "r2", kind: "rep", title: "Insert, delete, random in O(1)", leetcode: 380,
      fn: "RandomizedSet", adapt: RUN,
      prompt: `<code>RandomizedSet()</code> with <code>insert(v)</code> and <code>remove(v)</code> (each returns whether it changed anything) and <code>getRandom()</code>, all O(1). A list plus a dict of value → index, removing by swap-with-last. (The tests only call <code>getRandom</code> when one value is left.)`,
      cases: `[
        (([], ["insert", "remove", "insert", "remove", "insert", "getRandom"], [[1], [2], [2], [1], [2], []]), [True, False, True, True, False, 2]),
        (([], ["insert", "insert", "insert", "remove", "remove", "getRandom"], [[1], [2], [3], [1], [3], []]), [True, True, True, True, True, 2]),
        (([], ["insert", "remove", "insert", "getRandom"], [[5], [5], [7], []]), [True, True, True, 7]),
      ]`,
      solution: `import random

class RandomizedSet:
    def __init__(self):
        self.vals = []
        self.pos = {}

    def insert(self, v):
        if v in self.pos:
            return False
        self.pos[v] = len(self.vals)
        self.vals.append(v)
        return True

    def remove(self, v):
        if v not in self.pos:
            return False
        i, last = self.pos[v], self.vals[-1]
        self.vals[i] = last
        self.pos[last] = i
        self.vals.pop()
        del self.pos[v]
        return True

    def getRandom(self):
        return random.choice(self.vals)`,
      note: `Fix <code>pos[last]</code> <em>before</em> deleting <code>pos[v]</code>: when v is the last value, last is v, and the delete has to come second or a stale entry survives. Walk w1 traces it.`,
    },
    {
      id: "r3", kind: "rep", title: "Recent calls (a deque window)", leetcode: 933,
      fn: "RecentCounter", adapt: RUN,
      prompt: `<code>RecentCounter()</code> with <code>ping(t)</code>: record a request at time <code>t</code> (times only increase) and return how many requests are in <code>[t − 3000, t]</code>. A deque of times, popping old ones from the left.`,
      cases: `[
        (([], ["ping", "ping", "ping", "ping"], [[1], [100], [3001], [3002]]), [1, 2, 3, 3]),
        (([], ["ping", "ping"], [[1], [5000]]), [1, 1]),
      ]`,
      mustUse: [{ re: "deque", msg: "Keep the times in a deque." }],
      solution: `from collections import deque

class RecentCounter:
    def __init__(self):
        self.q = deque()

    def ping(self, t):
        self.q.append(t)
        while self.q[0] < t - 3000:
            self.q.popleft()
        return len(self.q)`,
      note: `Each time enters once and leaves once, so it's O(1) on average per call. That's the sliding window from lesson 03, over time instead of over a list.`,
    },
    {
      id: "r4", kind: "rep", title: "Heap with lazy removal",
      fn: "LazyHeap", adapt: RUN,
      prompt: `<code>LazyHeap()</code> with <code>push(x)</code>, <code>remove(x)</code> (x is in it) and <code>min()</code>. Removing only records <code>x</code> in a Counter, and any read of the top first throws away tops that are recorded as removed.`,
      cases: `[
        (([], ["push", "push", "push", "min", "remove", "min", "remove", "min", "push", "min"], [[5], [3], [8], [], [3], [], [8], [], [1], []]), [None, None, None, 3, None, 5, None, 5, None, 1]),
        (([], ["push", "push", "remove", "min"], [[2], [2], [2], []]), [None, None, None, 2]),
      ]`,
      mustUse: [{ re: "heapq", msg: "Use heapq for the heap." }],
      mustNot: [{ re: "\\.remove\\(|heapify", msg: "Lazy: never remove from the heap list directly or re-heapify." }],
      solution: `import heapq
from collections import Counter

class LazyHeap:
    def __init__(self):
        self.h = []
        self.gone = Counter()

    def push(self, x):
        heapq.heappush(self.h, x)

    def remove(self, x):
        self.gone[x] += 1

    def min(self):
        while self.gone[self.h[0]]:
            self.gone[self.h[0]] -= 1
            heapq.heappop(self.h)
        return self.h[0]`,
      note: `The second test pushes 2 twice and removes it once: a set of removed values would kill both copies. Count them.`,
    },
    {
      id: "r5", kind: "rep", title: "Rate limiter",
      fn: "RateLimiter", adapt: RUN,
      prompt: `<code>RateLimiter()</code> with <code>should_print(t, msg)</code>: True if this message wasn't printed in the last 10 time units (so again at <code>t + 10</code> or later), and if so, record it as printed at t. Times never decrease.`,
      cases: `[
        (([], ["should_print", "should_print", "should_print", "should_print", "should_print", "should_print"], [[1, "foo"], [2, "bar"], [3, "foo"], [8, "bar"], [10, "foo"], [11, "foo"]]), [True, True, False, False, False, True]),
        (([], ["should_print", "should_print"], [[0, "a"], [10, "a"]]), [True, True]),
      ]`,
      solution: `class RateLimiter:
    def __init__(self):
        self.next_ok = {}

    def should_print(self, t, msg):
        if t < self.next_ok.get(msg, 0):
            return False
        self.next_ok[msg] = t + 10
        return True`,
      note: `Storing "when it's allowed again" rather than "when it was printed" makes the check one comparison. Follow-up: memory grows with every distinct message. A deque of (time, msg) can expire old entries.`,
    },
    {
      id: "r6", kind: "rep", title: "Two-sum as a class",
      fn: "TwoSum", adapt: RUN,
      prompt: `<code>TwoSum()</code> with <code>add(x)</code> and <code>find(total)</code>: is there a pair of <b>different</b> added items summing to <code>total</code>? Keep a Counter, so a pair of equal values needs that value added twice.`,
      cases: `[
        (([], ["add", "add", "add", "find", "find"], [[1], [3], [5], [4], [7]]), [None, None, None, True, False]),
        (([], ["add", "find", "add", "find"], [[3], [6], [3], [6]]), [None, False, None, True]),
        (([], ["add", "add", "find"], [[0], [-1], [-1]]), [None, None, True]),
      ]`,
      solution: `from collections import Counter

class TwoSum:
    def __init__(self):
        self.count = Counter()

    def add(self, x):
        self.count[x] += 1

    def find(self, total):
        for x in self.count:
            y = total - x
            if y in self.count and (y != x or self.count[x] > 1):
                return True
        return False`,
      note: `A design choice to say out loud: <code>add</code> O(1), <code>find</code> O(n). If <code>find</code> is called far more, precompute every pair sum on <code>add</code> instead (O(n) add, O(1) find). The interviewer wants to hear the trade.`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "A field in the class body",
      code: `class Store:
    data = {}

    def put(self, k, v):
        self.data[k] = v

a, b = Store(), Store()
a.put("x", 1)
print(b.data)`,
      explain: `<code>data = {}</code> in the class body is created once and shared by every instance, so b sees a's write. Make per-instance fields in <code>__init__</code>: <code>self.data = {}</code>.`,
    },
    {
      id: "d2", kind: "predict", title: "Forgetting self.",
      code: `class Counter2:
    def __init__(self):
        count = 0

    def bump(self):
        self.count += 1

c = Counter2()
c.bump()`,
      explain: `<code>count = 0</code> without <code>self.</code> is a local variable of <code>__init__</code>, gone when it returns. The object never gets a <code>count</code> field, so <code>self.count += 1</code> raises <code>AttributeError</code>.`,
    },
    {
      id: "d3", kind: "predict", title: "bisect on (time, value) pairs",
      code: `from bisect import bisect_right
log = [(1, "a"), (4, "b"), (9, "c")]
print(bisect_right(log, (4, "")), bisect_right(log, (4, "~")))
print(bisect_right([1, 4, 9], 4))`,
      explain: `Tuples compare field by field, so <code>(4, "")</code> sorts <em>before</em> <code>(4, "b")</code> and the search stops short of the entry at time 4. Searching with a value that sorts after anything (or keeping a separate list of times, as in b3) avoids the trap.`,
    },
    {
      id: "d4", kind: "predict", title: "Mutating while iterating a dict",
      code: `d = {"a": 1, "b": 0, "c": 0}
for k in d:
    if d[k] == 0:
        del d[k]
print(d)`,
      explain: `Changing a dict's size while looping over it raises <code>RuntimeError</code>. In a class that cleans up expired entries, loop over <code>list(d)</code> (a copy of the keys), or build a new dict.`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "Time-based key-value store", leetcode: 981,
      fn: "TimeMap", adapt: RUN,
      prompt: `<code>TimeMap()</code> with <code>set(key, value, t)</code> (times for a key only increase) and <code>get(key, t)</code>: the value set at the latest time ≤ t, or <code>""</code>.`,
      stub: `class TimeMap:
    `,
      cases: `[
        (([], ["set", "get", "get", "set", "get", "get"], [["foo", "bar", 1], ["foo", 1], ["foo", 3], ["foo", "bar2", 4], ["foo", 4], ["foo", 5]]), [None, "bar", "bar", None, "bar2", "bar2"]),
        (([], ["get"], [["x", 1]]), [""]),
        (([], ["set", "get"], [["a", "v", 5], ["a", 4]]), [None, ""]),
      ]`,
      solution: `from bisect import bisect_right

class TimeMap:
    def __init__(self):
        self.times = {}
        self.vals = {}

    def set(self, key, value, t):
        self.times.setdefault(key, []).append(t)
        self.vals.setdefault(key, []).append(value)

    def get(self, key, t):
        ts = self.times.get(key)
        if not ts:
            return ""
        i = bisect_right(ts, t)
        return self.vals[key][i - 1] if i else ""`,
      note: `Times arrive in order, so each key's list is sorted for free and <code>get</code> is a binary search: O(log n). Keeping times and values in parallel lists sidesteps the tuple-compare trap of predict d3.`,
    },
    {
      id: "p2", kind: "problem", title: "Average trip time", leetcode: 1396,
      fn: "UndergroundSystem", adapt: RUN,
      prompt: `<code>UndergroundSystem()</code> with <code>checkIn(id, station, t)</code>, <code>checkOut(id, station, t)</code> and <code>getAverageTime(start, end)</code>: the average duration of completed trips from start to end (at least one exists when asked).`,
      stub: `class UndergroundSystem:
    `,
      cases: `[
        (([], ["checkIn", "checkIn", "checkIn", "checkOut", "checkOut", "checkOut", "getAverageTime", "getAverageTime", "checkIn", "getAverageTime", "checkOut", "getAverageTime"], [[45, "A", 3], [32, "P", 8], [27, "A", 10], [45, "W", 15], [27, "W", 20], [32, "C", 22], ["P", "C"], ["A", "W"], [10, "A", 24], ["A", "W"], [10, "W", 38], ["A", "W"]]), [None, None, None, None, None, None, 14.0, 11.0, None, 11.0, None, 12.0]),
        (([], ["checkIn", "checkOut", "getAverageTime"], [[1, "X", 0], [1, "Y", 5], ["X", "Y"]]), [None, None, 5.0]),
      ]`,
      solution: `class UndergroundSystem:
    def __init__(self):
        self.open = {}
        self.stats = {}

    def checkIn(self, id, station, t):
        self.open[id] = (station, t)

    def checkOut(self, id, station, t):
        start, t0 = self.open.pop(id)
        total, n = self.stats.get((start, station), (0, 0))
        self.stats[(start, station)] = (total + t - t0, n + 1)

    def getAverageTime(self, start, end):
        total, n = self.stats[(start, end)]
        return total / n`,
      note: `Two dicts, one per question: "where did this rider get on?" and "what's the running total for this route?". Keep a sum and a count, not a list of trips: the average then needs O(1) time and O(routes) memory.`,
    },
    {
      id: "p3", kind: "problem", title: "LFU cache", leetcode: 460,
      fn: "LFUCache", adapt: RUN,
      prompt: `<code>LFUCache(capacity)</code> with <code>get(key)</code> (value or −1) and <code>put(key, value)</code>. When full, evict the least frequently used key, and among those the least recently used. Every get or put of a key counts as a use. Both operations O(1).`,
      stub: `class LFUCache:
    `,
      cases: `[
        (([2], ["put", "put", "get", "put", "get", "get", "put", "get", "get", "get"], [[1, 1], [2, 2], [1], [3, 3], [2], [3], [4, 4], [1], [3], [4]]), [None, None, 1, None, -1, 3, None, -1, 3, 4]),
        (([1], ["put", "put", "get", "get"], [[1, 1], [2, 2], [1], [2]]), [None, None, -1, 2]),
        (([0], ["put", "get"], [[0, 0], [0]]), [None, -1]),
      ]`,
      solution: `from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.val = {}
        self.freq = {}
        self.groups = defaultdict(OrderedDict)
        self.min_freq = 0

    def _touch(self, key):
        f = self.freq[key]
        del self.groups[f][key]
        if not self.groups[f] and self.min_freq == f:
            self.min_freq += 1
        self.freq[key] = f + 1
        self.groups[f + 1][key] = None

    def get(self, key):
        if key not in self.val:
            return -1
        self._touch(key)
        return self.val[key]

    def put(self, key, value):
        if self.cap == 0:
            return
        if key in self.val:
            self.val[key] = value
            self._touch(key)
            return
        if len(self.val) == self.cap:
            old, _ = self.groups[self.min_freq].popitem(last=False)
            del self.val[old]
            del self.freq[old]
        self.val[key] = value
        self.freq[key] = 1
        self.groups[1][key] = None
        self.min_freq = 1`,
      note: `Three facts per key (value, count, recency) and one global (the lowest count). <code>groups[f]</code> is an OrderedDict per count, oldest first, so "least frequent, then least recent" is <code>groups[min_freq]</code>'s first entry. <code>min_freq</code> only ever goes up by one on a touch, or resets to 1 on a new key, which is why it never needs a search.`,
    },
    {
      id: "p4", kind: "problem", title: "Maximum frequency stack", leetcode: 895,
      fn: "FreqStack", adapt: RUN,
      prompt: `<code>FreqStack()</code> with <code>push(x)</code> and <code>pop()</code>: pop removes and returns the most frequent value, and among ties the one pushed most recently. Both O(1).`,
      stub: `class FreqStack:
    `,
      cases: `[
        (([], ["push", "push", "push", "push", "push", "push", "pop", "pop", "pop", "pop"], [[5], [7], [5], [7], [4], [5], [], [], [], []]), [None, None, None, None, None, None, 5, 7, 5, 4]),
        (([], ["push", "push", "pop", "pop"], [[1], [2], [], []]), [None, None, 2, 1]),
      ]`,
      solution: `from collections import defaultdict

class FreqStack:
    def __init__(self):
        self.freq = defaultdict(int)
        self.group = defaultdict(list)
        self.top = 0

    def push(self, x):
        self.freq[x] += 1
        f = self.freq[x]
        self.group[f].append(x)
        self.top = max(self.top, f)

    def pop(self):
        x = self.group[self.top].pop()
        self.freq[x] -= 1
        if not self.group[self.top]:
            self.top -= 1
        return x`,
      note: `A stack per frequency: the k-th push of a value goes on stack k. Then "most frequent, most recent" is the top of the highest non-empty stack. A value with count 3 sits on stacks 1, 2 and 3 at once, which is exactly why popping from stack 3 leaves it correctly at count 2.`,
    },
    {
      id: "p5", kind: "problem", title: "Snapshot array", leetcode: 1146,
      fn: "SnapshotArray", adapt: RUN,
      prompt: `<code>SnapshotArray(length)</code> starts all zeros. <code>set(i, val)</code>, <code>snap()</code> (returns the snapshot id, counting from 0) and <code>get(i, snap_id)</code> (the value at index i when that snapshot was taken). Don't copy the array on snap.`,
      stub: `class SnapshotArray:
    `,
      cases: `[
        (([3], ["set", "snap", "set", "get"], [[0, 5], [], [0, 6], [0, 0]]), [None, 0, None, 5]),
        (([1], ["set", "set", "set", "snap", "get", "snap", "get"], [[0, 4], [0, 16], [0, 13], [], [0, 0], [], [0, 1]]), [None, None, None, 0, 13, 1, 13]),
        (([2], ["snap", "get", "set", "get"], [[], [1, 0], [1, 9], [1, 0]]), [0, 0, None, 0]),
      ]`,
      solution: `from bisect import bisect_right

class SnapshotArray:
    def __init__(self, length):
        self.snap_id = 0
        self.ids = [[0] for _ in range(length)]
        self.vals = [[0] for _ in range(length)]

    def set(self, i, val):
        if self.ids[i][-1] == self.snap_id:
            self.vals[i][-1] = val
        else:
            self.ids[i].append(self.snap_id)
            self.vals[i].append(val)

    def snap(self):
        self.snap_id += 1
        return self.snap_id - 1

    def get(self, i, snap_id):
        k = bisect_right(self.ids[i], snap_id)
        return self.vals[i][k - 1]`,
      note: `p1's idea per index: a history of (snapshot id, value), searched with <code>bisect_right</code>. <code>snap</code> is O(1) because it only bumps a counter. Several sets between snaps overwrite one entry, so the history grows only with snapshots that actually changed something.`,
    },
    {
      id: "p6", kind: "problem", title: "Stock price fluctuation", leetcode: 2034,
      fn: "StockPrice", adapt: RUN,
      prompt: `<code>StockPrice()</code> with <code>update(t, price)</code> (a later update for the same t <em>corrects</em> it), <code>current()</code> (price at the latest t), <code>maximum()</code> and <code>minimum()</code> (over the current, corrected prices).`,
      stub: `class StockPrice:
    `,
      cases: `[
        (([], ["update", "update", "current", "maximum", "update", "maximum", "update", "minimum"], [[1, 10], [2, 5], [], [], [1, 3], [], [4, 2], []]), [None, None, 5, 10, None, 5, None, 2]),
        (([], ["update", "update", "minimum", "update", "minimum"], [[1, 1], [2, 2], [], [1, 3], []]), [None, None, 1, None, 2]),
      ]`,
      solution: `import heapq

class StockPrice:
    def __init__(self):
        self.price = {}
        self.latest = 0
        self.hi = []
        self.lo = []

    def update(self, t, price):
        self.price[t] = price
        self.latest = max(self.latest, t)
        heapq.heappush(self.hi, (-price, t))
        heapq.heappush(self.lo, (price, t))

    def current(self):
        return self.price[self.latest]

    def maximum(self):
        while self.price[self.hi[0][1]] != -self.hi[0][0]:
            heapq.heappop(self.hi)
        return -self.hi[0][0]

    def minimum(self):
        while self.price[self.lo[0][1]] != self.lo[0][0]:
            heapq.heappop(self.lo)
        return self.lo[0][0]`,
      note: `Lazy deletion with no "gone" counter: a heap entry <code>(price, t)</code> is dead if <code>self.price[t]</code> no longer says that price. Corrections push a new entry and leave the old one to be discarded when it reaches the top. The dict is the truth, and the heaps are hints checked against it.`,
    },
  ],

  fromBlank: ["r1", "r2", "r4", "p1", "p3", "p6"],

  leetcode: [
    { n: 155, title: "Min Stack", slug: "min-stack" },
    { n: 933, title: "Number of Recent Calls", slug: "number-of-recent-calls" },
    { n: 380, title: "Insert Delete GetRandom O(1)", slug: "insert-delete-getrandom-o1" },
    { n: 981, title: "Time Based Key-Value Store", slug: "time-based-key-value-store" },
    { n: 1396, title: "Design Underground System", slug: "design-underground-system" },
    { n: 1146, title: "Snapshot Array", slug: "snapshot-array" },
    { n: 2034, title: "Stock Price Fluctuation", slug: "stock-price-fluctuation" },
    { n: 895, title: "Maximum Frequency Stack", slug: "maximum-frequency-stack" },
    { n: 460, title: "LFU Cache", slug: "lfu-cache" },
    { n: 362, title: "Design Hit Counter (premium)", slug: "design-hit-counter" },
    { n: 355, title: "Design Twitter", slug: "design-twitter" },
  ],
  };
})());
