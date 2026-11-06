COURSE.lesson({
  id: "01",
  title: "Binary trees",
  tagline: "Recursion (base case, pass down vs return up, a tuple up, an answer on the side), level by level with a queue, and walking a BST.",

  intro: `
<p>Almost every binary tree question is one function with the same skeleton. What changes is <b>what goes down</b>
(parameters) and <b>what comes back up</b> (the return value). Senior questions add one more piece: an answer that is
<em>recorded on the side</em> while the function returns something else. Once you see that split, 124 (max path sum)
is the same code as 104 (max depth) plus two lines.</p>

<h3>What's given</h3>
<p>As on LeetCode, <code>TreeNode</code> exists without you defining it (<code>.val</code>, <code>.left</code>,
<code>.right</code>). In tests, a tree is written the way LeetCode writes it: a level-order list with <code>None</code>
for gaps, so <code>[1, None, 2]</code> is 1 with a right child 2. The tests turn that list into a real tree before
calling your function. If you return a tree, it's turned back into a list. For predict snippets, <code>tree([...])</code>
builds one.</p>

<h3>The skeleton</h3>
<pre><code>def f(node, ...down...):
    if node is None:
        return BASE              # what an empty tree answers
    left = f(node.left, ...)
    right = f(node.right, ...)
    return COMBINE(node.val, left, right)</code></pre>

<h3>Four shapes, by where the information flows</h3>
<table>
<thead><tr><th>Shape</th><th>How it looks</th><th>Used for</th></tr></thead>
<tbody>
<tr><td><b>Return up</b></td><td><code>return 1 + max(l, r)</code></td><td>size, height, sums: anything a subtree can answer alone</td></tr>
<tr><td><b>Pass down</b></td><td><code>go(node.left, lo, node.val)</code></td><td>depth, bounds (BST), path so far, max on the path</td></tr>
<tr><td><b>Tuple up</b></td><td><code>return (height, size)</code></td><td>when the parent needs two facts from each child</td></tr>
<tr><td><b>Answer on the side</b></td><td><code>nonlocal best</code>, then <code>return</code> something else</td><td>diameter, max path sum: the best <em>through</em> a node ≠ what the parent can use</td></tr>
</tbody>
</table>

<p>The question to ask before typing: <b>"what does my parent need from me?"</b> That's the return value. If the
answer to the whole problem is something different, it goes on the side.</p>

<h3>Level by level: a queue and one snapshot</h3>
<p>When the question is about <b>depth</b> (each level's values, the last node in each row, a row's width), walk the
tree a level at a time. The one line that matters is <code>for _ in range(len(q))</code>. It reads the level's size
<em>once</em>, before any children are added, so children queued during this loop wait for the next level.</p>
<pre><code>from collections import deque

q = deque([root]) if root else deque()
while q:
    level = []
    for _ in range(len(q)):          # exactly this level's nodes
        node = q.popleft()
        level.append(node.val)
        if node.left:
            q.append(node.left)
        if node.right:
            q.append(node.right)
    # a whole level is in level here</code></pre>
<p>Recursion can do it too: pass <code>depth</code> down and append into <code>out[depth]</code>. The queue is the version
interviewers expect for "level order", and it uses O(width) memory instead of O(height).</p>

<h3>BST order: one path, not the whole tree</h3>
<p>In a binary search tree, everything left of a node is smaller and everything right of it is larger. Two things
follow from that:</p>
<ul>
<li><b>Search, insert, floor and ceiling walk one path down</b> in O(h). Compare, go left or right, and never visit the
other side. A <code>while node:</code> loop is enough, with no recursion.</li>
<li><b>Inorder visits the values sorted.</b> Kth smallest (230), validating (98) and the BST iterator (173) are all
inorder with a stack (rep 6), stopped early or paused between calls.</li>
</ul>
<span class="trees"><span class="tree" data-tree="[8, 4, 12, 2, 6, 10, 14]" data-path="8,12,10" data-cap="Floor of 11: 8 → 12 → 10. The left side is never visited."></span></span>
<p>The diagrams in this course place each node in its inorder position, so in a BST the values read sorted from left to right.</p>
<p>Deleting (450) has three cases: no children (return <code>None</code>), one child (return that child), or two
children (copy in the smallest value on the right, then delete that value from the right subtree). Writing it as
<code>root.left = delete(root.left, key)</code> means each call returns the new top of its subtree, and the parent's
link gets fixed for free.</p>
<span class="trees"><span class="tree" data-tree="[5, 3, 6, 2, 4, None, 7]" data-path="3,4" data-cap="Delete 3: it has two children. The leftmost on its right is 4."></span><span class="tree" data-tree="[5, 4, 6, 2, None, None, 7]" data-path="4" data-cap="4 is copied up, then deleted from the right subtree."></span></span>

<h3>Traps</h3>
<ol>
<li><b>Forgetting to return the recursive call.</b> <code>f(node.left)</code> on its own line computes the answer and throws it away.</li>
<li><b>Rebinding an outer variable without <code>nonlocal</code>.</b> <code>best = max(best, x)</code> in an inner function raises
<code>UnboundLocalError</code>. <code>out.append(x)</code> doesn't need it, because it changes the list instead of rebinding the name.</li>
<li><b>Appending a list you keep changing.</b> When the path is shared and you <code>pop()</code> after, save <code>path[:]</code>, not <code>path</code>.</li>
<li><b>"Leaf" is not "None".</b> A node with one child is not a leaf. <code>min</code> over a <code>None</code> child's 0 gives the wrong answer.</li>
<li><b>Checking only parent vs child for a BST.</b> Every node must fit the bounds from <em>all</em> its ancestors, so pass <code>(lo, hi)</code> down.</li>
<li><b><code>deque(root)</code> instead of <code>deque([root])</code>.</b> <code>deque</code> wants something to iterate over, and a node isn't one.</li>
<li><b>A BFS with no level snapshot.</b> An inner <code>while q:</code> runs on into the children, so every level merges into one.</li>
</ol>

<h3>The follow-ups a senior interviewer asks</h3>
<ul>
<li><b>Complexity:</b> O(n) time, O(h) space for the call stack. h is log n when balanced and n when it's a chain.</li>
<li><b>"What if the tree is 10⁵ deep?"</b> Python's default recursion limit is about 1000. Say so, then offer
<code>sys.setrecursionlimit</code> or an explicit stack (rep 6 drills the stack version of inorder).</li>
</ul>
`,

  exercises: [
    // ── Step through ────────────────────────────────────────────────────
    {
      id: "w1", kind: "walk", title: "Height: what each call returns",
      prompt: `Watch the call stack grow as <code>h</code> goes down the left side, then shrink as each call returns. Every box under Variables is one call that's still waiting. Before each question, work out what the call that just finished returned to its parent.`,
      code: `def h(node):
    if node is None:
        return 0
    l = h(node.left)
    r = h(node.right)  # ask 1,2,3: l
    return 1 + max(l, r)

print(h(tree([1, 2, 3, 4])))`,
      note: `Nothing is worked out on the way down. Each call only waits, and the answer is built on the way back up, one <code>1 + max(l, r)</code> at a time. "What does my parent need from me?" is literally the value in the green ↩ line.`,
    },
    {
      id: "w2", kind: "walk", title: "Diameter: an answer on the side",
      prompt: `<code>h</code> returns a height to its parent, but the question wants the longest path, <code>l + r</code> at some node. Watch <code>best</code> (top level) change while the return values stay heights.`,
      code: `best = 0

def h(node):
    global best
    if node is None:
        return 0
    l, r = h(node.left), h(node.right)
    best = max(best, l + r)  # ask 3,5: l + r
    return 1 + max(l, r)

h(tree([1, 2, 3, 4, 5]))
print(best)  # ask: best`,
      note: `At node 2 the path through it is 1 + 1 = 2, but its parent can only use one arm, so it returns 2 (= 1 + max). At the root, the path is 2 + 1 = 3. Two different numbers per node: one goes up, the other goes on the side. (<code>global</code> here because <code>best</code> is at the top level. Inside an outer function it's <code>nonlocal</code>, as in rep 5.)`,
    },
    {
      id: "w3", kind: "walk", title: "Level by level",
      prompt: `<code>range(len(q))</code> is worked out once, when a level starts. Watch the queue: children get added <em>during</em> the loop, but the loop still stops after this level's nodes.`,
      code: `from collections import deque

def levels(root):
    out = []
    q = deque([root])
    while q:
        level = []
        for _ in range(len(q)):  # ask 2,5: [n.val for n in q]
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        out.append(level)  # ask 2: level
    return out

print(levels(tree([3, 9, 20, None, None, 15, 7])))`,
      note: `Both times you were asked, the queue still held the <em>next</em> level, and the loop ended anyway: <code>range(len(q))</code> was fixed when the level started. That snapshot is the whole trick. Predict d7 shows what happens without it.`,
    },
    {
      id: "w4", kind: "walk", title: "Down one path of a BST",
      prompt: `Find the largest value ≤ 11. Each comparison throws away half of what's left. Watch <code>best</code>: it only changes when you go <b>right</b>, because a node smaller than <code>x</code> is a candidate.<span class="trees"><span class="tree" data-tree="[8, 4, 12, 2, 6, 10, 14]" data-cap="floor(root, 11)"></span></span>`,
      code: `def floor(root, x):
    best = None
    node = root
    while node:  # ask: best
        if node.val == x:
            return x
        if node.val < x:
            best = node.val
            node = node.right
        else:
            node = node.left
    return best

print(floor(tree([8, 4, 12, 2, 6, 10, 14]), 11))`,
      note: `Four nodes looked at out of seven. In a balanced BST that's O(log n), because the 4, 2 and 6 side was never touched. Going left never sets <code>best</code>: a node bigger than <code>x</code> can't be a floor.`,
    },

    // ── Break it ────────────────────────────────────────────────────────
    {
      id: "b1", kind: "breakit", title: "A BST checked parent by parent",
      prompt: `This checks a binary search tree by comparing each node only with its own children. Give a tree (as a LeetCode level-order list) that it calls valid but isn't.<span class="trees"><span class="tree" data-tree="[5, 1, 7, None, None, 6, 8]" data-cap="[5, 1, 7, None, None, 6, 8] is a valid BST."></span></span>`,
      fn: "check", args: "level_order_list",
      code: `def is_bst(node):
    if node is None:
        return True
    if node.left and node.left.val >= node.val:
        return False
    if node.right and node.right.val <= node.val:
        return False
    return is_bst(node.left) and is_bst(node.right)

def check(vals):
    return is_bst(tree(vals))`,
      ref: "right",
      right: `def right(vals):
    def ok(node, lo, hi):
        if node is None:
            return True
        if not (lo < node.val < hi):
            return False
        return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)
    return ok(tree(vals), float("-inf"), float("inf"))`,
      valid: `lambda vals: (isinstance(vals, list) and 1 <= len(vals) <= 15 and type(vals[0]) is int and all(v is None or type(v) is int for v in vals)) or "a level-order list of up to 15 entries (whole numbers or None), starting with a number, like [5, 1, 4, None, None, 3, 6]."`,
      rules: `a level-order list of up to 15 whole numbers or <code>None</code>, starting with a number.`,
      example: `[5, 4, 6, None, None, 3, 7]`,
      explain: `3 is smaller than its parent 6, so locally it's a fine left child. But it sits in 5's <em>right</em> subtree, where everything must be bigger than 5. Each node has to fit the bounds of <em>all</em> its ancestors, so pass <code>(lo, hi)</code> down (problem p2).<span class="trees"><span class="tree" data-tree="[5, 4, 6, None, None, 3, 7]" data-path="5,6" data-bad="3" data-cap="3 &lt; 6 is fine locally, but 3 &lt; 5 breaks the root's rule."></span></span>`,
    },
    {
      id: "b2", kind: "breakit", title: "Diameter through the root",
      prompt: `This measures the longest path (in edges) as left height + right height <b>at the root</b>. Give a tree where the longest path doesn't go through the root.`,
      fn: "check", args: "level_order_list",
      code: `def height(node):
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))

def check(vals):
    root = tree(vals)
    return height(root.left) + height(root.right)`,
      ref: "right",
      right: `def right(vals):
    best = 0
    def h(node):
        nonlocal best
        if node is None:
            return 0
        l, r = h(node.left), h(node.right)
        best = max(best, l + r)
        return 1 + max(l, r)
    h(tree(vals))
    return best`,
      valid: `lambda vals: (isinstance(vals, list) and 1 <= len(vals) <= 15 and type(vals[0]) is int and all(v is None or type(v) is int for v in vals)) or "a level-order list of up to 15 entries (whole numbers or None), starting with a number."`,
      rules: `a level-order list of up to 15 whole numbers or <code>None</code>, starting with a number.`,
      example: `[1, 2, None, 3, 4, 5, None, None, 6]`,
      explain: `The longest path bends at node 2, going down both of its sides, and never touches the root. The best path can bend at any node, so check <code>l + r</code> at every node and keep the best on the side (rep 5 and problem p3).`,
    },

    // ── Reps ────────────────────────────────────────────────────────────
    {
      id: "r1", kind: "rep", title: "Size (return up)",
      fn: "size", sig: "size(root: TreeNode) -> int",
      adapt: "lambda f, t: f(_tree(t))",
      prompt: `Return the number of nodes in the tree. Base case, two calls, combine.`,
      cases: `[
        (([1, 2, 3, 4, None, None, 5],), 5),
        (([],), 0),
        (([1],), 1),
        (([1, None, 2, None, 3],), 3),
      ]`,
      solution: `def size(root):
    if root is None:
        return 0
    return 1 + size(root.left) + size(root.right)`,
      note: `The base case answers for an <em>empty</em> tree, not for a leaf. Then leaves need no special case at all.`,
    },
    {
      id: "r2", kind: "rep", title: "Height (return up)",
      fn: "height", sig: "height(root: TreeNode) -> int",
      adapt: "lambda f, t: f(_tree(t))",
      prompt: `Return the number of nodes on the longest root-to-leaf path. An empty tree has height 0.`,
      cases: `[
        (([3, 9, 20, None, None, 15, 7],), 3),
        (([],), 0),
        (([1, None, 2],), 2),
        (([1, 2, 3, 4, None, None, None, 5],), 4),
      ]`,
      solution: `def height(root):
    if root is None:
        return 0
    return 1 + max(height(root.left), height(root.right))`,
      note: `Same shape as <code>size</code>, with <code>max</code> instead of <code>+</code>. This function comes back in reps 4–5 and in four of the problems.`,
    },
    {
      id: "r3", kind: "rep", title: "Leaf paths (pass down, undo)",
      fn: "leaf_paths", sig: "leaf_paths(root: TreeNode) -> list[list[int]]",
      adapt: "lambda f, t: f(_tree(t))",
      prompt: `Return every root-to-leaf path as a list of values, left paths first. Keep <b>one</b> shared <code>path</code> list: append on the way down, pop on the way back.`,
      cases: `[
        (([1, 2, 3, None, 5],), [[1, 2, 5], [1, 3]]),
        (([],), []),
        (([7],), [[7]]),
        (([1, 2, None, 3, 4],), [[1, 2, 3], [1, 2, 4]]),
      ]`,
      mustUse: [{ re: "\\.pop\\(", msg: "Share one path list and pop() after the recursive calls." }],
      solution: `def leaf_paths(root):
    out, path = [], []
    def go(node):
        if node is None:
            return
        path.append(node.val)
        if node.left is None and node.right is None:
            out.append(path[:])
        go(node.left)
        go(node.right)
        path.pop()
    go(root)
    return out`,
      note: `Append, recurse, pop: the same choose → explore → undo you'll use in Backtracking (lesson 10). <code>path[:]</code> saves a copy, because the shared list will be empty by the end.`,
    },
    {
      id: "r4", kind: "rep", title: "Height and size (tuple up)",
      fn: "height_and_size", sig: "height_and_size(root: TreeNode) -> tuple[int, int]",
      adapt: "lambda f, t: f(_tree(t))",
      prompt: `Return <code>(height, size)</code> in <b>one</b> pass: each call returns a tuple and the parent unpacks both children's.`,
      cases: `[
        (([1, 2, 3, 4],), (3, 4)),
        (([],), (0, 0)),
        (([1, None, 2, None, 3],), (3, 3)),
      ]`,
      solution: `def height_and_size(root):
    if root is None:
        return (0, 0)
    lh, ls = height_and_size(root.left)
    rh, rs = height_and_size(root.right)
    return (1 + max(lh, rh), 1 + ls + rs)`,
      note: `When a parent needs two facts from each child, return both. House Robber III (337) is this with (rob me, skip me).`,
    },
    {
      id: "r5", kind: "rep", title: "Count balanced nodes (answer on the side)",
      fn: "count_balanced", sig: "count_balanced(root: TreeNode) -> int",
      adapt: "lambda f, t: f(_tree(t))",
      prompt: `Count the nodes whose left and right subtree heights differ by at most 1. The inner function <b>returns height</b> (what the parent needs) and <b>adds to a <code>nonlocal</code> count</b> (what the question asks).`,
      cases: `[
        (([1, 2, None, 3],), 2),
        (([],), 0),
        (([1, 2, 3, 4, 5, 6, 7],), 7),
        (([1, 2, 3, 4, None, None, None, 5],), 3),
      ]`,
      mustUse: [{ re: "nonlocal", msg: "Use nonlocal for the count: that's the skill here." }],
      solution: `def count_balanced(root):
    count = 0
    def h(node):
        nonlocal count
        if node is None:
            return 0
        l, r = h(node.left), h(node.right)
        if abs(l - r) <= 1:
            count += 1
        return 1 + max(l, r)
    h(root)
    return count`,
      note: `The return value and the answer are different things. Diameter (543) and Max Path Sum (124) are this exact shape.`,
    },
    {
      id: "r6", kind: "rep", title: "Inorder with a stack",
      fn: "inorder_iter", sig: "inorder_iter(root: TreeNode) -> list[int]",
      adapt: "lambda f, t: f(_tree(t))",
      prompt: `Return the inorder values (left, node, right) <b>without recursion</b>: go left as far as you can pushing nodes, pop one, record it, then go right.`,
      cases: `[
        (([4, 2, 6, 1, 3, 5, 7],), [1, 2, 3, 4, 5, 6, 7]),
        (([],), []),
        (([1, None, 2, 3],), [1, 3, 2]),
      ]`,
      mustUse: [{ re: "while", msg: "Use a while loop and a stack." }],
      mustNot: [{ re: "def inorder_iter[\\s\\S]*\\binorder_iter\\(", msg: "No recursion: inorder_iter mustn't call itself." }],
      solution: `def inorder_iter(root):
    out, stack, node = [], [], root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        out.append(node.val)
        node = node.right
    return out`,
      note: `This is your answer to "what if the tree is too deep to recurse?" It's also how you do Kth Smallest in a BST (230) and stop early.`,
    },
    {
      id: "r7", kind: "rep", title: "Build a tree from LeetCode's list",
      fn: "build_tree", sig: "build_tree(vals: list) -> TreeNode",
      adapt: "lambda f, v: _tree_list(f(v))",
      prompt: `Write the helper the tests use: turn a level-order list (with <code>None</code> gaps) into a tree. Queue the nodes. Each one you pop takes the next two values as its children. Write this when you test locally.`,
      cases: `[
        (([1, 2, 3, None, 4],), [1, 2, 3, None, 4]),
        (([],), []),
        (([1, None, 2, None, 3],), [1, None, 2, None, 3]),
        (([5, 4, 8, 11, None, 13, 4],), [5, 4, 8, 11, None, 13, 4]),
      ]`,
      mustUse: [{ re: "deque", msg: "Use a deque as the queue." }],
      mustNot: [{ re: "(?<![\\w.])tree\\(", msg: "Don't call the given tree(): build it yourself." }],
      solution: `from collections import deque

def build_tree(vals):
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])
    q = deque([root])
    i = 1
    while q and i < len(vals):
        node = q.popleft()
        if vals[i] is not None:
            node.left = TreeNode(vals[i])
            q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            q.append(node.right)
        i += 1
    return root`,
      note: `<code>None</code> slots don't get queued, which is why <code>[1, None, 2, None, 3]</code> is a chain going right and not a sparse heap layout.`,
    },
    {
      id: "r8", kind: "rep", title: "Level order (queue + snapshot)", leetcode: 102,
      fn: "level_order", sig: "level_order(root: TreeNode) -> list[list[int]]",
      adapt: "lambda f, t: f(_tree(t))",
      prompt: `Return the values level by level, left to right. Use a <code>deque</code>, and read the level's size once with <code>for _ in range(len(q))</code>.`,
      cases: `[
        (([3, 9, 20, None, None, 15, 7],), [[3], [9, 20], [15, 7]]),
        (([],), []),
        (([1],), [[1]]),
        (([1, 2, None, 3],), [[1], [2], [3]]),
        (([1, 2, 3, 4, None, None, 5],), [[1], [2, 3], [4, 5]]),
      ]`,
      mustUse: [{ re: "deque", msg: "Use a deque as the queue." }, { re: "range\\(len\\(", msg: "Snapshot the level size: for _ in range(len(q))." }],
      solution: `from collections import deque

def level_order(root):
    if root is None:
        return []
    out, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        out.append(level)
    return out`,
      note: `Most "per level" problems are this loop with one line changed: keep <code>level[-1]</code> (199, right side view), reverse every other level (103), average it (637).`,
    },
    {
      id: "r9", kind: "rep", title: "Floor in a BST (one path)",
      fn: "bst_floor", sig: "bst_floor(root: TreeNode, x: int) -> int | None",
      adapt: "lambda f, t, x: f(_tree(t), x)",
      prompt: `<code>root</code> is a BST. Return the largest value ≤ <code>x</code>, or <code>None</code>. Walk one path down with a <code>while</code> loop: no recursion, O(h).<span class="trees"><span class="tree" data-tree="[8, 4, 12, 2, 6, 10, 14]" data-cap="The tree in the tests."></span></span>`,
      cases: `[
        (([8, 4, 12, 2, 6, 10, 14], 11), 10),
        (([8, 4, 12, 2, 6, 10, 14], 1), None),
        (([8, 4, 12, 2, 6, 10, 14], 14), 14),
        (([8, 4, 12, 2, 6, 10, 14], 5), 4),
        (([8, 4, 12, 2, 6, 10, 14], 100), 14),
        (([], 3), None),
      ]`,
      mustUse: [{ re: "while", msg: "Walk down with a while loop." }],
      mustNot: [{ re: "def bst_floor[\\s\\S]*\\bbst_floor\\(", msg: "No recursion: bst_floor mustn't call itself." }],
      solution: `def bst_floor(root, x):
    best = None
    node = root
    while node:
        if node.val == x:
            return x
        if node.val < x:
            best = node.val
            node = node.right
        else:
            node = node.left
    return best`,
      note: `Ceiling is the mirror image: record on the way <em>left</em>. Search and insert are the same walk. Insert stops at the <code>None</code> where the value belongs and hangs a new node there.`,
    },

    // ── Predict ─────────────────────────────────────────────────────────
    {
      id: "d1", kind: "predict", title: "The lost return",
      code: `def has(node, x):
    if node is None:
        return False
    if node.val == x:
        return True
    has(node.left, x) or has(node.right, x)

print(has(tree([1, 2, 3]), 3))`,
      explain: `The last line works out <code>True</code> and then drops it, so the function falls off the end and returns <code>None</code>. It needs <code>return</code> in front.`,
    },
    {
      id: "d2", kind: "predict", title: "Saving the shared path",
      code: `out, path = [], []
def go(node):
    if node is None:
        return
    path.append(node.val)
    if node.left is None and node.right is None:
        out.append(path)
    go(node.left)
    go(node.right)
    path.pop()

go(tree([1, 2, 3]))
print(out)`,
      explain: `Both entries are the <em>same</em> list object as <code>path</code>, which is empty once every <code>pop()</code> has run. Save <code>path[:]</code> (or <code>list(path)</code>).`,
    },
    {
      id: "d3", kind: "predict", title: "Counting without nonlocal",
      code: `def count(root):
    total = 0
    def go(node):
        if node:
            total += 1
            go(node.left)
            go(node.right)
    go(root)
    return total

print(count(tree([1, 2])))`,
      explain: `<code>total += 1</code> assigns, so Python treats <code>total</code> as local to <code>go</code>, and it's read before it's set. Add <code>nonlocal total</code>. (Mutating, as in <code>out.append</code>, doesn't need it.)`,
    },
    {
      id: "d4", kind: "predict", title: "Leaf vs None",
      code: `def min_depth(node):
    if node is None:
        return 0
    return 1 + min(min_depth(node.left), min_depth(node.right))

print(min_depth(tree([1, 2])))`,
      explain: `The right child is <code>None</code> (depth 0), so <code>min</code> picks it, but node 1 isn't a leaf. The real answer is 2. When one child is missing, use the other child's depth (LeetCode 111).`,
    },
    {
      id: "d5", kind: "predict", title: "The default list",
      code: `def collect(node, out=[]):
    if node:
        out.append(node.val)
        collect(node.left, out)
        collect(node.right, out)
    return out

print(collect(tree([1])))
print(collect(tree([2])))`,
      explain: `A default value is made once, when <code>def</code> runs, so both calls share one list. Use <code>out=None</code> and then <code>if out is None: out = []</code>, or keep the list in an outer function.`,
    },
    {
      id: "d6", kind: "predict", title: "deque(root)",
      code: `from collections import deque
root = tree([1, 2, 3])
q = deque(root)
print(len(q))`,
      explain: `<code>deque(x)</code> builds a queue from the <em>items of</em> <code>x</code>, the way <code>list(x)</code> does, and a <code>TreeNode</code> has no items. You want a queue holding one node: <code>deque([root])</code>.`,
    },
    {
      id: "d7", kind: "predict", title: "Levels without the snapshot",
      code: `from collections import deque

def levels(root):
    out, q = [], deque([root])
    while q:
        level = []
        while q:
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        out.append(level)
    return out

print(levels(tree([1, 2, 3, 4])))`,
      explain: `The inner <code>while q:</code> keeps going as long as children keep arriving, so it eats the whole tree as one "level". Values still come out in level order, but the boundaries are lost. <code>for _ in range(len(q))</code> fixes the count before the children arrive.`,
    },

    // ── Problems ────────────────────────────────────────────────────────
    {
      id: "p1", kind: "problem", title: "Balanced binary tree", leetcode: 110,
      fn: "is_balanced", adapt: "lambda f, t: f(_tree(t))",
      prompt: `A tree is balanced if, at <b>every</b> node, the left and right heights differ by at most 1. Do it in one O(n) pass, not by calling <code>height</code> from every node.`,
      stub: `def is_balanced(root):
    `,
      cases: `[
        (([3, 9, 20, None, None, 15, 7],), True),
        (([1, 2, 2, 3, 3, None, None, 4, 4],), False),
        (([],), True),
        (([1, 2, 2, 3, None, None, 3, 4, None, None, 4],), False),
      ]`,
      solution: `def is_balanced(root):
    def h(node):
        if node is None:
            return 0
        l = h(node.left)
        r = h(node.right)
        if l < 0 or r < 0 or abs(l - r) > 1:
            return -1
        return 1 + max(l, r)
    return h(root) >= 0`,
      note: `<code>-1</code> is a sentinel meaning "already unbalanced". It sends two facts up in one int. A tuple <code>(ok, height)</code> works too.`,
    },
    {
      id: "p2", kind: "problem", title: "Validate a BST", leetcode: 98,
      fn: "is_valid_bst", adapt: "lambda f, t: f(_tree(t))",
      prompt: `Return whether the tree is a strict binary search tree: everything in a node's left subtree is smaller than it, everything in the right subtree is larger.<span class="trees"><span class="tree" data-tree="[2, 1, 3]" data-cap="Valid."></span><span class="tree" data-tree="[5, 1, 4, None, None, 3, 6]" data-bad="4" data-cap="Not valid: 4 is right of 5."></span></span>`,
      stub: `def is_valid_bst(root):
    `,
      cases: `[
        (([2, 1, 3],), True),
        (([5, 1, 4, None, None, 3, 6],), False),
        (([5, 4, 6, None, None, 3, 7],), False),
        (([2, 2, 2],), False),
        (([],), True),
      ]`,
      solution: `def is_valid_bst(root):
    def ok(node, lo, hi):
        if node is None:
            return True
        if not (lo < node.val < hi):
            return False
        return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)
    return ok(root, float("-inf"), float("inf"))`,
      note: `Third test: 3 is smaller than its parent 6, but it's in 5's <em>right</em> subtree. Only bounds passed down catch it. Another way: an inorder walk must be strictly increasing.<span class="trees"><span class="tree" data-tree="[5, 4, 6, None, None, 3, 7]" data-path="5,6" data-bad="3" data-cap="Bounds at 3: (5, 6). It fails lo &lt; 3."></span></span>`,
    },
    {
      id: "p3", kind: "problem", title: "Diameter", leetcode: 543,
      fn: "diameter", adapt: "lambda f, t: f(_tree(t))",
      prompt: `Return the number of <b>edges</b> on the longest path between any two nodes. The path doesn't have to pass through the root.`,
      stub: `def diameter(root):
    `,
      cases: `[
        (([1, 2, 3, 4, 5],), 3),
        (([1, 2],), 1),
        (([1],), 0),
        (([1, 2, None, 3, 4, 5, None, None, 6],), 4),
      ]`,
      solution: `def diameter(root):
    best = 0
    def h(node):
        nonlocal best
        if node is None:
            return 0
        l, r = h(node.left), h(node.right)
        best = max(best, l + r)
        return 1 + max(l, r)
    h(root)
    return best`,
      note: `Rep 5 again. The path <em>through</em> a node is <code>l + r</code> (on the side). The parent can only extend one arm, <code>1 + max(l, r)</code> (returned).`,
    },
    {
      id: "p4", kind: "problem", title: "Lowest common ancestor", leetcode: 236,
      fn: "lca",
      adapt: "lambda f, t, p, q: (lambda root: getattr(f(root, _find(root, p), _find(root, q)), 'val', None))(_tree(t))",
      prompt: `<code>p</code> and <code>q</code> are two <b>nodes</b> in the tree (the tests show their values). Return the lowest node that has both as descendants. A node counts as its own descendant.`,
      stub: `def lca(root, p, q):
    `,
      cases: `[
        (([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4], 5, 1), 3),
        (([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4], 5, 4), 5),
        (([1, 2], 1, 2), 1),
        (([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4], 7, 8), 3),
      ]`,
      solution: `def lca(root, p, q):
    if root is None or root is p or root is q:
        return root
    left = lca(root.left, p, q)
    right = lca(root.right, p, q)
    if left and right:
        return root
    return left or right`,
      note: `Each call returns "the p or q (or the answer) I found below me, or None". If both sides found something, this node is where they meet. dicti's lesson 06 does the same with a parent map. This version uses no extra space beyond the stack.`,
    },
    {
      id: "p5", kind: "problem", title: "Build from preorder + inorder", leetcode: 105,
      fn: "build_from", adapt: "lambda f, pre, ino: _tree_list(f(pre, ino))",
      prompt: `Given the preorder and inorder traversals of a tree with unique values, rebuild it and return the root. Aim for O(n): no <code>.index()</code> inside the recursion and no slicing.`,
      stub: `def build_from(preorder, inorder):
    `,
      cases: `[
        (([3, 9, 20, 15, 7], [9, 3, 15, 20, 7]), [3, 9, 20, None, None, 15, 7]),
        (([-1], [-1]), [-1]),
        (([1, 2, 3], [3, 2, 1]), [1, 2, None, 3]),
        (([], []), []),
      ]`,
      solution: `def build_from(preorder, inorder):
    where = {v: i for i, v in enumerate(inorder)}
    it = iter(preorder)
    def go(lo, hi):
        if lo > hi:
            return None
        val = next(it)
        node = TreeNode(val)
        mid = where[val]
        node.left = go(lo, mid - 1)
        node.right = go(mid + 1, hi)
        return node
    return go(0, len(inorder) - 1)`,
      note: `Preorder gives the roots in order, and inorder says how much of the tree goes left. Build the left subtree <em>before</em> the right, because that's the order preorder hands out roots.`,
    },
    {
      id: "p6", kind: "problem", title: "Max path sum", leetcode: 124,
      fn: "max_path_sum", adapt: "lambda f, t: f(_tree(t))",
      prompt: `A path is any chain of connected nodes (each used once), and it needn't pass through the root. Values can be negative. Return the largest path sum.`,
      stub: `def max_path_sum(root):
    `,
      cases: `[
        (([1, 2, 3],), 6),
        (([-10, 9, 20, None, None, 15, 7],), 42),
        (([-3],), -3),
        (([2, -1],), 2),
        (([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1],), 48),
      ]`,
      solution: `def max_path_sum(root):
    best = float("-inf")
    def gain(node):
        nonlocal best
        if node is None:
            return 0
        l = max(gain(node.left), 0)
        r = max(gain(node.right), 0)
        best = max(best, node.val + l + r)
        return node.val + max(l, r)
    gain(root)
    return best`,
      note: `Diameter with values. The two new ideas: a negative arm is worth 0 (leave it out), and <code>best</code> starts at <code>-inf</code>, not 0, because an all-negative tree's answer is negative.`,
    },
    {
      id: "p7", kind: "problem", title: "Serialize and deserialize", leetcode: 297,
      fn: "deserialize",
      adapt: "lambda f, t: (lambda s: (type(s).__name__, _tree_list(f(s))))(serialize(_tree(t)))",
      prompt: `Write <code>serialize(root) -> str</code> and <code>deserialize(data) -> TreeNode</code> so that a tree survives the round trip. Any format works. Preorder with a marker for <code>None</code> is the shortest to write. The tests check <code>deserialize(serialize(tree))</code>.`,
      stub: `def serialize(root):
    pass

def deserialize(data):
    `,
      cases: `[
        (([1, 2, 3, None, None, 4, 5],), ("str", [1, 2, 3, None, None, 4, 5])),
        (([],), ("str", [])),
        (([-5],), ("str", [-5])),
        (([1, None, 2, None, 3],), ("str", [1, None, 2, None, 3])),
      ]`,
      solution: `def serialize(root):
    out = []
    def go(node):
        if node is None:
            out.append("#")
            return
        out.append(str(node.val))
        go(node.left)
        go(node.right)
    go(root)
    return ",".join(out)

def deserialize(data):
    vals = iter(data.split(","))
    def go():
        v = next(vals)
        if v == "#":
            return None
        node = TreeNode(int(v))
        node.left = go()
        node.right = go()
        return node
    return go()`,
      note: `With the <code>#</code> markers, preorder alone fixes the shape: no inorder needed (compare with p5). <code>deserialize</code> reads in exactly the order <code>serialize</code> wrote, from one shared iterator.`,
    },
    {
      id: "p8", kind: "problem", title: "Right side view", leetcode: 199,
      fn: "right_view", adapt: "lambda f, t: f(_tree(t))",
      prompt: `Standing to the right of the tree, return the values you can see from top to bottom: the last node of each level.`,
      stub: `def right_view(root):
    `,
      cases: `[
        (([1, 2, 3, None, 5, None, 4],), [1, 3, 4]),
        (([1, None, 3],), [1, 3]),
        (([],), []),
        (([1, 2, 3, 4],), [1, 3, 4]),
      ]`,
      solution: `from collections import deque

def right_view(root):
    if root is None:
        return []
    out, q = [], deque([root])
    while q:
        for i in range(len(q)):
            node = q.popleft()
            if i == 0:
                out.append(node.val)
            if node.right:
                q.append(node.right)
            if node.left:
                q.append(node.left)
    return out`,
      note: `Last test: 4 is on the <em>left</em> but nothing on the right reaches that deep, so you see it. That's why "follow right children" is wrong and levels are right. Queueing right before left makes the visible node the first of each level.`,
    },
    {
      id: "p9", kind: "problem", title: "Maximum width", leetcode: 662,
      fn: "max_width", adapt: "lambda f, t: f(_tree(t))",
      prompt: `A level's width is the distance from its leftmost to its rightmost node, <b>counting the gaps</b> where nodes are missing in between. Return the largest width.`,
      stub: `def max_width(root):
    `,
      cases: `[
        (([1, 3, 2, 5, 3, None, 9],), 4),
        (([1, 3, 2, 5, None, None, 9, 6, None, 7],), 7),
        (([1, 3, 2, 5],), 2),
        (([1],), 1),
      ]`,
      solution: `from collections import deque

def max_width(root):
    best, q = 0, deque([(root, 0)])
    while q:
        first, last = q[0][1], q[-1][1]
        best = max(best, last - first + 1)
        for _ in range(len(q)):
            node, i = q.popleft()
            if node.left:
                q.append((node.left, 2 * i))
            if node.right:
                q.append((node.right, 2 * i + 1))
    return best`,
      note: `Number the nodes as in a heap: children of <code>i</code> are <code>2i</code> and <code>2i + 1</code>, so gaps take up numbers too. Python's ints never overflow. In Java or C++ you'd subtract the level's first index from each <code>i</code> to keep numbers small, and saying so is a good follow-up answer.`,
    },
    {
      id: "p10", kind: "problem", title: "Delete a node in a BST", leetcode: 450,
      fn: "delete_node",
      adapt: "lambda f, t, k: (lambda io: io(io, f(_tree(t), k)))(lambda io, n: io(io, n.left) + [n.val] + io(io, n.right) if n else [])",
      prompt: `Delete the node with value <code>key</code> (if there is one) and return the root of the BST that's left, in O(h). The tests print the result in inorder, which must be the sorted values without <code>key</code>, so any correct shape passes.<span class="trees"><span class="tree" data-tree="[5, 3, 6, 2, 4, None, 7]" data-cap="The tree in the tests. Deleting 3, 5 or 7 hits each case."></span></span>`,
      stub: `def delete_node(root, key):
    `,
      cases: `[
        (([5, 3, 6, 2, 4, None, 7], 3), [2, 4, 5, 6, 7]),
        (([5, 3, 6, 2, 4, None, 7], 0), [2, 3, 4, 5, 6, 7]),
        (([5, 3, 6, 2, 4, None, 7], 5), [2, 3, 4, 6, 7]),
        (([5, 3, 6, 2, 4, None, 7], 7), [2, 3, 4, 5, 6]),
        (([1], 1), []),
        (([], 0), []),
      ]`,
      solution: `def delete_node(root, key):
    if root is None:
        return None
    if key < root.val:
        root.left = delete_node(root.left, key)
    elif key > root.val:
        root.right = delete_node(root.right, key)
    else:
        if root.left is None:
            return root.right
        if root.right is None:
            return root.left
        nxt = root.right
        while nxt.left:
            nxt = nxt.left
        root.val = nxt.val
        root.right = delete_node(root.right, nxt.val)
    return root`,
      note: `Each call returns the new top of its subtree, and the parent reattaches it with <code>root.left = …</code>. That's "return up" doing the relinking. With two children, the next value up (leftmost on the right) can take the deleted node's place, because it's larger than everything on the left and smaller than everything else on the right.`,
    },
  ],

  fromBlank: ["r3", "r5", "r7", "r8", "r9", "p3", "p4", "p6", "p10"],

  leetcode: [
    { n: 104, title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree" },
    { n: 94, title: "Binary Tree Inorder Traversal (do it iteratively)", slug: "binary-tree-inorder-traversal" },
    { n: 110, title: "Balanced Binary Tree", slug: "balanced-binary-tree" },
    { n: 543, title: "Diameter of Binary Tree", slug: "diameter-of-binary-tree" },
    { n: 98, title: "Validate Binary Search Tree", slug: "validate-binary-search-tree" },
    { n: 1448, title: "Count Good Nodes in Binary Tree", slug: "count-good-nodes-in-binary-tree" },
    { n: 236, title: "Lowest Common Ancestor of a Binary Tree", slug: "lowest-common-ancestor-of-a-binary-tree" },
    { n: 105, title: "Construct Binary Tree from Preorder and Inorder Traversal", slug: "construct-binary-tree-from-preorder-and-inorder-traversal" },
    { n: 337, title: "House Robber III", slug: "house-robber-iii" },
    { n: 979, title: "Distribute Coins in Binary Tree", slug: "distribute-coins-in-binary-tree" },
    { n: 124, title: "Binary Tree Maximum Path Sum", slug: "binary-tree-maximum-path-sum" },
    { n: 297, title: "Serialize and Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree" },
    { n: 102, title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal" },
    { n: 199, title: "Binary Tree Right Side View", slug: "binary-tree-right-side-view" },
    { n: 103, title: "Binary Tree Zigzag Level Order Traversal", slug: "binary-tree-zigzag-level-order-traversal" },
    { n: 662, title: "Maximum Width of Binary Tree", slug: "maximum-width-of-binary-tree" },
    { n: 235, title: "Lowest Common Ancestor of a Binary Search Tree", slug: "lowest-common-ancestor-of-a-binary-search-tree" },
    { n: 230, title: "Kth Smallest Element in a BST", slug: "kth-smallest-element-in-a-bst" },
    { n: 173, title: "Binary Search Tree Iterator", slug: "binary-search-tree-iterator" },
    { n: 450, title: "Delete Node in a BST", slug: "delete-node-in-a-bst" },
  ],
});
