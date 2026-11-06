COURSE.lesson({
  id: "06",
  title: "Stacks: monotonic + parsing",
  tagline: "A stack kept in sorted order answers \"next greater\" for everyone in one pass. A stack of saved states parses anything nested.",

  intro: `
<p>Two different jobs, one tool. A <b>monotonic stack</b> holds the items still waiting for an answer, kept in sorted
order. When a new item breaks the order, everything it beats gets popped, and each popped item has found its answer:
<em>this</em> item. Every index is pushed once and popped once, so it's O(n) despite the inner loop. A <b>stack of
saved states</b> parses nesting: on an opening bracket, push what you have and start fresh. On a closing one, pop and
combine.</p>

<h3>Next greater: the monotonic stack</h3>
<pre><code>ans = [-1] * len(nums)
stack = []                                  # indices still waiting
for i, x in enumerate(nums):
    while stack and nums[stack[-1]] &lt; x:     # x is the answer for each one it beats
        ans[stack.pop()] = x
    stack.append(i)</code></pre>
<p>The values on the stack only go <b>down</b> from bottom to top (nothing smaller can sit under something waiting for a
greater value). Pick the direction from the question:</p>
<table>
<thead><tr><th>You want each item's…</th><th>Pop while the top is…</th><th>Stack values, bottom to top</th></tr></thead>
<tbody>
<tr><td>next <b>greater</b></td><td><code>&lt; x</code></td><td>going down</td></tr>
<tr><td>next <b>smaller</b></td><td><code>&gt; x</code></td><td>going up</td></tr>
<tr><td>previous greater / smaller</td><td>same pops, then read the top <em>after</em> popping, before pushing</td><td>same</td></tr>
</tbody>
</table>
<span class="trees"><span class="arr" data-arr="[2, 1, 2, 4, 3]" data-hl="0,2" data-ptr="3:x" data-cap="Before i = 3: index 1 popped at i = 2, so 0 and 2 are waiting. 4 beats both."></span><span class="arr" data-arr="[4, 2, 4, -1, -1]" data-noidx="" data-cap="ans when it's done"></span></span>

<h3>Contribution counting</h3>
<p>"Sum of the minimum of every subarray" can't list O(n²) subarrays. Turn it around: <code>nums[j]</code> is the minimum
of every subarray that starts after the previous smaller item and ends before the next smaller one. That's
<code>(j − left) · (right − j)</code> subarrays, each adding <code>nums[j]</code>. When item j is popped, the item
under it is <code>left</code> and the current index is <code>right</code>. With equal values, make one side strict and
the other not, or ties get counted twice (Break it b1). Largest Rectangle (p2) is the same pop with
<code>height · width</code>.</p>
<span class="trees"><span class="arr" data-arr="[3, 1, 4, 5, 2, 6]" data-hl="2" data-win="2,3" data-ptr="1:left,2:j,4:right" data-cap="4 is the minimum of every subarray that holds it, from just after left to just before right: (2 − 1) · (4 − 2) = 2 of them, [4] and [4, 5]."></span></span>

<h3>Monotonic deque: max of every window</h3>
<p>Window maximum needs a queue: new items enter on the right, and old ones leave on the left. Keep it in decreasing
order (pop smaller items from the back, since they can never be the max again while x is in the window), and drop the
front once it's out of the window. The front is always the max.</p>

<h3>Parsing with saved states</h3>
<pre><code>stack, cur = [], START
for ch in s:
    if ch == "(":   stack.append(cur); cur = START     # save, start a fresh inner level
    elif ch == ")": cur = COMBINE(stack.pop(), cur)     # finish the inner level
    else:           cur = ADD(cur, ch)</code></pre>
<p>What you save depends on the problem: a string so far (reverse, decode), a <code>(result, sign)</code> pair
(calculator), or just the bracket to match (valid parentheses).</p>

<h3>Traps</h3>
<ol>
<li><b>Storing values instead of indices.</b> You usually need where it was (distance, width, out of the window).</li>
<li><b><code>stack[-1]</code> on an empty stack.</b> Always <code>while stack and …</code>.</li>
<li><b>Leftovers at the end.</b> Items still on the stack never found an answer: they keep the default, or need flushing (a 0 at the end does it for rectangles).</li>
<li><b>Ties.</b> <code>&lt;</code> vs <code>&lt;=</code> decides whether equal items pop each other. Choose on purpose (predict d4).</li>
<li><b>Numbers with more than one digit.</b> Build them up, <code>num = num * 10 + int(ch)</code>, and only use them at the next operator or bracket.</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>"Isn't the while inside the for O(n²)?"</b> No: each index is pushed once and popped at most once, so all the pops together are at most n.</li>
<li><b>"Circular list?"</b> Loop twice with <code>i % n</code> and only push during the first pass (p1).</li>
<li><b>"Recursion instead of a stack?"</b> For parsing, a recursive function per bracket level is the same thing with the call stack. Mention it, and the depth limit.</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "Next greater: who's still waiting",
      prompt: `The stack holds the indices still waiting for something bigger. Watch it as values: it only goes down from bottom to top. When a big value arrives, it answers everyone it beats in one go.`,
      code: `def next_greater(nums):
    ans = [-1] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:  # ask 2,5: [nums[j] for j in stack]
            ans[stack.pop()] = x
        stack.append(i)
    return ans  # ask: ans

print(next_greater([2, 1, 2, 4, 3]))`,
      note: `When the 4 arrives the stack holds the values [2, 2] (the 1 was already answered by the second 2), and both pop with answer 4. The 4 and 3 are still waiting at the end, so they keep −1. Each index was pushed once and popped at most once.`,
    },
    {
      id: "w2", kind: "walk", title: "Max of every window (deque)",
      prompt: `Windows of size 3. The deque holds indices whose values go down from front to back. A new value throws out every smaller one from the back (they can never be the max again), and the front leaves once it falls out of the window.`,
      code: `from collections import deque

def window_max(nums, k):
    dq, out = deque(), []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:  # ask 4,6: [nums[j] for j in dq]
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out

print(window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))`,
      note: `When 5 arrives, it clears everything smaller (3, −1, −3), so the deque is just [5]. Smaller items to the <em>left</em> of a bigger one are dead: they leave the window before it does. That's why the deque never needs more than the "still might be the max" items.`,
    },
    {
      id: "w3", kind: "walk", title: "Save the outside, work the inside",
      prompt: `Reverse the text inside each pair of brackets, innermost first, and drop the brackets. On <code>(</code>, save what you have and start fresh. On <code>)</code>, reverse what's inside and glue it onto what you saved.`,
      code: `def reverse_parens(s):
    stack, cur = [], ""
    for ch in s:
        if ch == "(":  # ask 6,9,11: (stack, cur)
            stack.append(cur)
            cur = ""
        elif ch == ")":
            cur = stack.pop() + cur[::-1]
        else:
            cur += ch
    return cur

print(reverse_parens("a(bc(de)f)g"))`,
      note: `Each bracket level is its own <code>cur</code>, and the stack holds the levels outside it, waiting. When "de" closes, it comes back reversed as "ed" and joins "bc". When the outer level closes, "bcedf" is reversed as a whole, which turns "ed" back the right way round. Decode String (p5) and the calculator (p6) save different things but move exactly like this.`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "Ties counted twice",
      prompt: `Sum of the minimum of every subarray, by contribution: each item counts the subarrays where it's the minimum, using the previous <b>strictly</b> smaller item and the next <b>strictly</b> smaller item as the walls. Find a list where the total is wrong.`,
      fn: "sum_mins", args: "nums",
      code: `def sum_mins(nums):
    n = len(nums)
    total = 0
    for j in range(n):
        left = j - 1
        while left >= 0 and nums[left] >= nums[j]:
            left -= 1
        right = j + 1
        while right < n and nums[right] >= nums[j]:
            right += 1
        total += nums[j] * (j - left) * (right - j)
    return total`,
      ref: "right",
      right: `def right(nums):
    return sum(min(nums[i:j + 1]) for i in range(len(nums)) for j in range(i, len(nums)))`,
      valid: `lambda nums: (isinstance(nums, list) and 1 <= len(nums) <= 8 and all(type(x) is int and 1 <= x <= 9 for x in nums)) or "a list of 1 to 8 whole numbers from 1 to 9."`,
      rules: `a list of 1–8 whole numbers from 1 to 9.`,
      example: `[1, 1]`,
      explain: `The subarray [1, 1] has two minimums, and both items claim it, because each lets the other's equal value through. Make one side strict and the other not (stop at <code>&lt;</code> on the left, at <code>&lt;=</code> on the right) and each subarray is claimed only by its leftmost minimum.`,
    },
    {
      id: "b2", kind: "breakit", title: "A window that never forgets",
      prompt: `The window-max deque, but nothing ever leaves from the front. Find a list and window size where it reports a maximum that has already left the window.`,
      fn: "window_max", args: "nums, k",
      code: `from collections import deque

def window_max(nums, k):
    dq, out = deque(), []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
      ref: "right",
      right: `def right(nums, k):
    return [max(nums[i - k + 1:i + 1]) for i in range(k - 1, len(nums))]`,
      valid: `lambda nums, k: (isinstance(nums, list) and 1 <= len(nums) <= 8 and all(type(x) is int and -9 <= x <= 9 for x in nums) and type(k) is int and 1 <= k <= len(nums)) or "nums is 1 to 8 whole numbers from -9 to 9, and k is from 1 to len(nums)."`,
      rules: `<code>nums</code>: 1–8 whole numbers from −9 to 9. <code>k</code>: from 1 to <code>len(nums)</code>.`,
      example: `[3, 1, 1], 2`,
      explain: `The 3 sits at the front, and nothing after it is big enough to pop it from the back, so it's still reported once its window has moved on. Popping from the back handles "beaten", and popping the front handles "expired". The deque needs both.`,
    },
    {
      id: "b3", kind: "breakit", title: "One digit at a time",
      prompt: `Decode strings like <code>3[ab]</code> (repeat "ab" 3 times, nesting allowed). This version reads the repeat count as a single digit. Find an input it decodes wrongly.`,
      fn: "decode", args: "s",
      code: `def decode(s):
    stack, cur, k = [], "", 0
    for ch in s:
        if ch.isdigit():
            k = int(ch)
        elif ch == "[":
            stack.append((cur, k))
            cur, k = "", 0
        elif ch == "]":
            prev, times = stack.pop()
            cur = prev + cur * times
        else:
            cur += ch
    return cur`,
      ref: "right",
      right: `def right(s):
    stack, cur, k = [], "", 0
    for ch in s:
        if ch.isdigit():
            k = k * 10 + int(ch)
        elif ch == "[":
            stack.append((cur, k))
            cur, k = "", 0
        elif ch == "]":
            prev, times = stack.pop()
            cur = prev + cur * times
        else:
            cur += ch
    return cur`,
      valid: `lambda s: (isinstance(s, str) and 1 <= len(s) <= 20 and all(c.islower() or c.isdigit() or c in "[]" for c in s) and all(s[:i].count("[") >= s[:i].count("]") for i in range(len(s) + 1)) and s.count("[") == s.count("]") and max(s[:i].count("[") - s[:i].count("]") for i in range(len(s) + 1)) <= 2 and all(s[i - 1].isdigit() for i in range(len(s)) if s[i] == "[") and all(i + 1 < len(s) and (s[i + 1].isdigit() or s[i + 1] == "[") for i in range(len(s)) if s[i].isdigit()) and all(len(run) <= 2 for run in "".join(c if c.isdigit() else " " for c in s).split())) or "a valid encoded string of up to 20 characters, like 3[a2[bc]]: counts of 1 or 2 digits, brackets nested at most 2 deep."`,
      rules: `a valid encoded string of up to 20 characters, like <code>3[a2[bc]]</code>, with counts of 1–2 digits and brackets nested at most 2 deep.`,
      example: `"12[a]"`,
      explain: `Reading "12" one digit at a time leaves k = 2, so the count of 12 becomes 2. Build multi-digit numbers up: <code>k = k * 10 + int(ch)</code>. That's the most common parsing bug in interviews, and the calculator (p6) needs it too.`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "Next greater value", leetcode: 496,
      fn: "next_greater", sig: "next_greater(nums: list[int]) -> list[int]",
      prompt: `For each item, return the first value to its right that is <b>strictly</b> greater, or −1. One pass, a stack of waiting indices.`,
      cases: `[
        (([2, 1, 2, 4, 3],), [4, 2, 4, -1, -1]),
        (([1, 2, 3],), [2, 3, -1]),
        (([3, 2, 1],), [-1, -1, -1]),
        (([2, 2, 3],), [3, 3, -1]),
      ]`,
      mustUse: [{ re: "while", msg: "Pop with a while loop: that's the monotonic stack." }],
      solution: `def next_greater(nums):
    ans = [-1] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            ans[stack.pop()] = x
        stack.append(i)
    return ans`,
      note: `Store <code>i - j</code> instead of <code>x</code> and it's Daily Temperatures (739): how many days until warmer.`,
    },
    {
      id: "r2", kind: "rep", title: "Previous smaller index",
      fn: "prev_smaller", sig: "prev_smaller(nums: list[int]) -> list[int]",
      prompt: `For each item, return the index of the nearest item to its <b>left</b> that is strictly smaller, or −1. Pop everything ≥ x, then the top (if any) is the answer, then push.`,
      cases: `[
        (([3, 7, 8, 4],), [-1, 0, 1, 0]),
        (([1, 2, 3],), [-1, 0, 1]),
        (([2, 2],), [-1, -1]),
        (([5, 4, 3],), [-1, -1, -1]),
      ]`,
      solution: `def prev_smaller(nums):
    ans = []
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] >= x:
            stack.pop()
        ans.append(stack[-1] if stack else -1)
        stack.append(i)
    return ans`,
      note: `"Previous" reads the top <em>after</em> popping: whatever survived is smaller than x. That's the left wall in contribution counting and in Largest Rectangle.`,
    },
    {
      id: "r3", kind: "rep", title: "Max of every window", leetcode: 239,
      fn: "window_max", sig: "window_max(nums: list[int], k: int) -> list[int]",
      prompt: `Return the max of every window of size <code>k</code>, in O(n). A deque of indices with decreasing values: pop smaller ones from the back, drop the front once it's outside the window.`,
      cases: `[
        (([1, 3, -1, -3, 5, 3, 6, 7], 3), [3, 3, 5, 5, 6, 7]),
        (([1], 1), [1]),
        (([9, 8, 7, 6], 2), [9, 8, 7]),
        (([1, 3, 1, 2, 0, 5], 3), [3, 3, 2, 5]),
      ]`,
      mustUse: [{ re: "deque", msg: "Use a deque." }],
      mustNot: [{ re: "\\bmax\\(", msg: "No max(): the deque's front is the max." }],
      solution: `from collections import deque

def window_max(nums, k):
    dq, out = deque(), []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
      note: `This is LeetCode 239, a hard, in ten lines. Walk w2 steps through it. Only one item can expire per step, so <code>if</code> is enough at the front.`,
    },
    {
      id: "r4", kind: "rep", title: "Matching brackets", leetcode: 20,
      fn: "valid", sig: "valid(s: str) -> bool",
      prompt: `<code>s</code> holds only <code>()[]{}</code>. Return whether every bracket closes in the right order. Push openers, and on a closer check that the top is its partner.`,
      cases: `[
        (("()[]{}",), True),
        (("(]",), False),
        (("([)]",), False),
        (("{[]}",), True),
        (("",), True),
        (("(",), False),
        (("]",), False),
      ]`,
      solution: `def valid(s):
    pair = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pair:
            if not stack or stack.pop() != pair[ch]:
                return False
        else:
            stack.append(ch)
    return not stack`,
      note: `Two ways to fail: a closer with nothing open (empty stack), and openers left at the end (<code>return not stack</code>). The tests have one of each.`,
    },
    {
      id: "r5", kind: "rep", title: "Reverse inside brackets", leetcode: 1190,
      fn: "reverse_parens", sig: "reverse_parens(s: str) -> str",
      prompt: `Reverse the text inside each pair of brackets, innermost first, and return it without brackets. A stack of saved strings: push on <code>(</code>, pop and combine on <code>)</code>.`,
      cases: `[
        (("(abcd)",), "dcba"),
        (("(u(love)i)",), "iloveu"),
        (("(ed(et(oc))el)",), "leetcode"),
        (("a(bc)d",), "acbd"),
        (("abc",), "abc"),
      ]`,
      solution: `def reverse_parens(s):
    stack, cur = [], ""
    for ch in s:
        if ch == "(":
            stack.append(cur)
            cur = ""
        elif ch == ")":
            cur = stack.pop() + cur[::-1]
        else:
            cur += ch
    return cur`,
      note: `The whole parsing pattern in its smallest form (walk w3). Swap what's saved and how it combines, and you have Decode String and the calculator.`,
    },
    {
      id: "r6", kind: "rep", title: "Reverse Polish notation", leetcode: 150,
      fn: "eval_rpn", sig: "eval_rpn(tokens: list[str]) -> int",
      prompt: `Evaluate postfix tokens (<code>["2", "1", "+", "3", "*"]</code> is (2 + 1) · 3). Numbers go on the stack, and an operator pops two and pushes the result. Division truncates toward zero.`,
      cases: `[
        ((["2", "1", "+", "3", "*"],), 9),
        ((["4", "13", "5", "/", "+"],), 6),
        ((["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"],), 22),
        ((["3", "-4", "/"],), 0),
        ((["7"],), 7),
      ]`,
      solution: `def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in ("+", "-", "*", "/"):
            b = stack.pop()
            a = stack.pop()
            if t == "+":
                stack.append(a + b)
            elif t == "-":
                stack.append(a - b)
            elif t == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(t))
    return stack[0]`,
      note: `Pop <code>b</code> first: the right operand is on top. <code>int(a / b)</code> truncates toward zero as the problem wants, while <code>a // b</code> would round −0.75 down to −1 (predict d2).`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "Peeking at an empty stack",
      code: `stack = [1]
stack.pop()
print(len(stack))
print(stack[-1])`,
      explain: `<code>stack[-1]</code> on an empty list raises <code>IndexError</code>. Every peek in a monotonic loop needs <code>while stack and …</code> in front of it.`,
    },
    {
      id: "d2", kind: "predict", title: "Truncating division",
      code: `print(-7 // 2, int(-7 / 2))
print(3 // -4, int(3 / -4))`,
      explain: `<code>//</code> rounds down, toward −∞. <code>int(a / b)</code> truncates toward 0, which is what C, Java and RPN (r6) mean by integer division. They only differ when the result is negative.`,
    },
    {
      id: "d3", kind: "predict", title: "isdigit and signs",
      code: `print("12".isdigit(), "-12".isdigit(), "1.5".isdigit())
print(int("-12"), int(" 7 "))`,
      explain: `<code>isdigit</code> is about characters, not numbers, so "-12" fails. In a parser that reads one character at a time, a minus sign is an operator or a sign you handle yourself. <code>int()</code> is more forgiving: it accepts a sign and surrounding spaces.`,
    },
    {
      id: "d4", kind: "predict", title: "Popping on ties",
      code: `def nxt(nums, pop_ties):
    ans, stack = [-1] * len(nums), []
    for i, x in enumerate(nums):
        while stack and (nums[stack[-1]] <= x if pop_ties else nums[stack[-1]] < x):
            ans[stack.pop()] = x
        stack.append(i)
    return ans

print(nxt([2, 2, 3], False))
print(nxt([2, 2, 3], True))`,
      explain: `With <code>&lt;=</code>, the second 2 pops the first one and becomes its "answer", although 2 isn't greater than 2. Strict <code>&lt;</code> gives "next strictly greater". Neither is wrong in general: choose the one the question asks for.`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "Next greater element II (circular)", leetcode: 503,
      fn: "next_greater_circular",
      prompt: `The list is circular: after the last item comes the first. For each item, return the first strictly greater value going forward (wrapping round), or −1.`,
      stub: `def next_greater_circular(nums):
    `,
      cases: `[
        (([1, 2, 1],), [2, -1, 2]),
        (([1, 2, 3, 4, 3],), [2, 3, 4, -1, 4]),
        (([5],), [-1]),
        (([3, 3],), [-1, -1]),
      ]`,
      solution: `def next_greater_circular(nums):
    n = len(nums)
    ans = [-1] * n
    stack = []
    for i in range(2 * n):
        x = nums[i % n]
        while stack and nums[stack[-1]] < x:
            ans[stack.pop()] = x
        if i < n:
            stack.append(i)
    return ans`,
      note: `Walk the list twice. The second lap only answers items still waiting and never pushes, so each index still enters the stack once. That's O(n), with no doubled list.`,
    },
    {
      id: "p2", kind: "problem", title: "Largest rectangle in a histogram", leetcode: 84,
      fn: "largest_rect",
      prompt: `Bars of width 1 with the given heights. Return the area of the largest rectangle that fits under them, in O(n).<span class="trees"><span class="bars" data-bars="[2, 1, 5, 6, 2, 3]" data-rect="2,3,5" data-cap="[2, 1, 5, 6, 2, 3] → 5 × 2 = 10"></span></span>`,
      stub: `def largest_rect(heights):
    `,
      cases: `[
        (([2, 1, 5, 6, 2, 3],), 10),
        (([2, 4],), 4),
        (([1],), 1),
        (([2, 1, 2],), 3),
        (([6, 7, 5, 2, 4, 5, 9, 3],), 16),
      ]`,
      solution: `def largest_rect(heights):
    h = heights + [0]
    stack, best = [], 0
    for i, x in enumerate(h):
        while stack and h[stack[-1]] >= x:
            j = stack.pop()
            left = stack[-1] if stack else -1
            best = max(best, h[j] * (i - left - 1))
        stack.append(i)
    return best`,
      note: `When bar j pops, <code>i</code> is the first bar to its right that's lower, and the new top is the first to its left that's lower, so bar j's full-height rectangle spans everything between them. The extra 0 at the end flushes every bar still waiting.`,
    },
    {
      id: "p3", kind: "problem", title: "Sum of subarray minimums", leetcode: 907,
      fn: "sum_mins",
      prompt: `Return the sum of <code>min(sub)</code> over every subarray, modulo 10⁹ + 7. All values are ≥ 1. O(n).`,
      stub: `def sum_mins(arr):
    `,
      cases: `[
        (([3, 1, 2, 4],), 17),
        (([11, 81, 94, 43, 3],), 444),
        (([1, 1],), 3),
        (([71, 55, 82, 55],), 593),
      ]`,
      solution: `def sum_mins(arr):
    MOD = 10 ** 9 + 7
    stack, total = [], 0
    for i, x in enumerate(arr + [0]):
        while stack and arr[stack[-1]] >= x:
            j = stack.pop()
            left = stack[-1] if stack else -1
            total += arr[j] * (j - left) * (i - j)
        stack.append(i)
    return total % MOD`,
      note: `p2's loop with contribution instead of area. Popping on <code>&gt;=</code> makes the right wall "next smaller or equal" and the left wall "previous strictly smaller", so equal values never share a subarray (Break it b1). Python's ints don't overflow, so one <code>%</code> at the end is enough here.`,
    },
    {
      id: "p4", kind: "problem", title: "Remove k digits", leetcode: 402,
      fn: "remove_k",
      prompt: `<code>num</code> is a string of digits. Remove exactly <code>k</code> digits to make the smallest possible number, and return it as a string with no leading zeros (<code>"0"</code> if nothing's left).`,
      stub: `def remove_k(num, k):
    `,
      cases: `[
        (("1432219", 3), "1219"),
        (("10200", 1), "200"),
        (("10", 2), "0"),
        (("112", 1), "11"),
        (("9", 1), "0"),
        (("12345", 2), "123"),
      ]`,
      solution: `def remove_k(num, k):
    stack = []
    for d in num:
        while k and stack and stack[-1] > d:
            stack.pop()
            k -= 1
        stack.append(d)
    if k:
        stack = stack[:-k]
    return "".join(stack).lstrip("0") or "0"`,
      note: `A digit followed by a smaller one should go: removing it pulls the smaller one into a more important place. That's a greedy choice (lesson 09) carried out by an increasing stack. If digits only ever rise ("12345"), nothing pops, and you cut from the end.`,
    },
    {
      id: "p5", kind: "problem", title: "Decode string", leetcode: 394,
      fn: "decode",
      prompt: `<code>k[text]</code> means <code>text</code> repeated <code>k</code> times, and brackets nest. Counts can have several digits. Return the decoded string.`,
      stub: `def decode(s):
    `,
      cases: `[
        (("3[a]2[bc]",), "aaabcbc"),
        (("3[a2[c]]",), "accaccacc"),
        (("2[abc]3[cd]ef",), "abcabccdcdcdef"),
        (("10[a]",), "aaaaaaaaaa"),
        (("abc",), "abc"),
      ]`,
      solution: `def decode(s):
    stack, cur, k = [], "", 0
    for ch in s:
        if ch.isdigit():
            k = k * 10 + int(ch)
        elif ch == "[":
            stack.append((cur, k))
            cur, k = "", 0
        elif ch == "]":
            prev, times = stack.pop()
            cur = prev + cur * times
        else:
            cur += ch
    return cur`,
      note: `r5's shape, saving <code>(text so far, count)</code> at each <code>[</code>. The count belongs to the bracket that follows it, so it's saved with the outer text and the next level starts at 0.`,
    },
    {
      id: "p6", kind: "problem", title: "Basic calculator", leetcode: 224,
      fn: "calculate",
      prompt: `Evaluate a string with non-negative integers, <code>+</code>, <code>-</code>, brackets and spaces. A <code>-</code> can also negate, as in <code>-(2+3)</code>. No <code>eval</code>.`,
      stub: `def calculate(s):
    `,
      cases: `[
        (("1 + 1",), 2),
        ((" 2-1 + 2 ",), 3),
        (("(1+(4+5+2)-3)+(6+8)",), 23),
        (("-(2+3)",), -5),
        (("1-(     -2)",), 3),
        (("2147483647",), 2147483647),
      ]`,
      mustNot: [{ re: "\\beval\\(", msg: "No eval: parse it." }],
      solution: `def calculate(s):
    stack = []
    result, num, sign = 0, 0, 1
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch in "+-":
            result += sign * num
            num = 0
            sign = 1 if ch == "+" else -1
        elif ch == "(":
            stack.append((result, sign))
            result, sign = 0, 1
        elif ch == ")":
            result += sign * num
            num = 0
            prev, psign = stack.pop()
            result = prev + psign * result
    return result + sign * num`,
      note: `With only + and −, the whole state is <code>(result so far, sign of what comes next)</code>. A bracket saves that pair and starts a fresh result, and closing it applies the saved sign to the whole bracket. A number is only added when the next operator or bracket arrives, which is why multi-digit numbers work.`,
    },
  ],

  fromBlank: ["r1", "r3", "r5", "p2", "p3", "p6"],

  leetcode: [
    { n: 20, title: "Valid Parentheses", slug: "valid-parentheses" },
    { n: 496, title: "Next Greater Element I", slug: "next-greater-element-i" },
    { n: 739, title: "Daily Temperatures", slug: "daily-temperatures" },
    { n: 150, title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation" },
    { n: 71, title: "Simplify Path", slug: "simplify-path" },
    { n: 503, title: "Next Greater Element II", slug: "next-greater-element-ii" },
    { n: 901, title: "Online Stock Span", slug: "online-stock-span" },
    { n: 402, title: "Remove K Digits", slug: "remove-k-digits" },
    { n: 394, title: "Decode String", slug: "decode-string" },
    { n: 239, title: "Sliding Window Maximum", slug: "sliding-window-maximum" },
    { n: 907, title: "Sum of Subarray Minimums", slug: "sum-of-subarray-minimums" },
    { n: 84, title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram" },
    { n: 224, title: "Basic Calculator", slug: "basic-calculator" },
  ],
});
