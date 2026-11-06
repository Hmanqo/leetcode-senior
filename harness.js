// The Python side of the runner. Loaded into Pyodide inside the worker, and
// by tools/check.mjs to verify lesson solutions with local python3.
window.COURSE_HARNESS = String.raw`
import ast, io, json, copy, traceback, contextlib
from collections import deque as _deque

# ── Given, like on LeetCode: TreeNode and list <-> tree helpers ──────────
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
    def __repr__(self):
        return "TreeNode(" + repr(self.val) + ")"

def _tree(vals):
    # LeetCode level order: [1, None, 2] is 1 with a right child 2.
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])
    q = _deque([root])
    i = 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            q.append(node.right)
        i += 1
    return root

def _tree_list(root):
    out, q = [], _deque([root])
    while q:
        node = q.popleft()
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        q.append(node.left)
        q.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out

def _find(root, val):
    if root is None or root.val == val:
        return root
    return _find(root.left, val) or _find(root.right, val)

def _given():
    return {"__name__": "__main__", "TreeNode": TreeNode, "tree": _tree, "tree_list": _tree_list, "find": _find}

def _fmt(x):
    if isinstance(x, TreeNode):
        return "tree " + _fmt(_tree_list(x))
    if isinstance(x, dict):
        if not x:
            return "{}"
        return "{" + ", ".join(_fmt(k) + ": " + _fmt(v) for k, v in x.items()) + "}"
    if isinstance(x, list):
        return "[" + ", ".join(_fmt(v) for v in x) + "]"
    if isinstance(x, tuple):
        if len(x) == 1:
            return "(" + _fmt(x[0]) + ",)"
        return "(" + ", ".join(_fmt(v) for v in x) + ")"
    if isinstance(x, (set, frozenset)):
        if not x:
            return "set()"
        try:
            items = sorted(x)
        except TypeError:
            items = list(x)
        return "{" + ", ".join(_fmt(v) for v in items) + "}"
    return repr(x)

def _norm(x, mode):
    if mode == "sorted":
        return sorted(x)
    if mode == "groups":
        return sorted(sorted(g) for g in x)
    if mode == "set":
        return set(x)
    return x

def _err(e):
    line = None
    for fr in traceback.extract_tb(e.__traceback__):
        if fr.filename == "<your code>":
            line = fr.lineno
    if isinstance(e, SyntaxError):
        if e.filename == "<your code>":
            line = e.lineno
        return {"line": line, "msg": type(e).__name__ + ": " + str(e.msg)}
    text = str(e)
    return {"line": line, "msg": type(e).__name__ + (": " + text if text else "")}

def _jsonable(x):
    # plain data only, so the page can draw trees from it; anything else becomes None
    if x is None or isinstance(x, (bool, int, float, str)):
        return x
    if isinstance(x, (list, tuple)):
        return [_jsonable(v) for v in x]
    return None

def _run_tests(code, fname, cases_src, mode, adapt=""):
    buf = io.StringIO()
    res = {"stdout": "", "error": None, "cases": []}
    ns = _given()
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(code, "<your code>", "exec"), ns)
    except BaseException as e:
        res["error"] = _err(e)
    if res["error"] is None:
        fn = ns.get(fname)
        if not callable(fn):
            res["error"] = {"line": None, "msg": "No function named " + fname + "() was defined."}
        else:
            # adapt: a Python lambda (fn, *args) that turns list args into
            # trees and tree results back into lists. Evaluated with our own
            # helpers so a user's variable named "tree" can't break it.
            call = eval(adapt, dict(ns, _tree=_tree, _tree_list=_tree_list, _find=_find)) if adapt else None
            for args, exp in ast.literal_eval(cases_src):
                c = {"call": fname + "(" + ", ".join(_fmt(a) for a in args) + ")", "expected": _fmt(exp)}
                try:
                    with contextlib.redirect_stdout(buf):
                        got = call(fn, *copy.deepcopy(args)) if call else fn(*copy.deepcopy(args))
                    c["got"] = _fmt(got)
                    c["raw"] = {"args": _jsonable(args), "exp": _jsonable(exp), "got": _jsonable(got)}
                    try:
                        c["ok"] = _norm(got, mode) == _norm(exp, mode)
                    except Exception as e:
                        c["ok"] = False
                        c["got"] += "   (couldn't compare: " + _err(e)["msg"] + ")"
                except BaseException as e:
                    er = _err(e)
                    c["got"] = er["msg"]
                    c["line"] = er["line"]
                    c["ok"] = False
                res["cases"].append(c)
    res["stdout"] = buf.getvalue()[-4000:]
    return json.dumps(res)

# ── Step through: trace code line by line, with questions at marked lines ──
import re as _re, sys as _sys, types as _types

def _show(x, depth=0):
    # Like _fmt, but a node shows as TreeNode(v): in a walk you want to see
    # which node a variable points at, not its whole subtree.
    if depth > 4:
        return "…"
    if isinstance(x, TreeNode):
        return "TreeNode(" + repr(x.val) + ")"
    if isinstance(x, _deque):
        return "deque([" + ", ".join(_show(v, depth + 1) for v in x) + "])"
    if isinstance(x, dict):
        return "{" + ", ".join(_show(k, depth + 1) + ": " + _show(v, depth + 1) for k, v in x.items()) + "}"
    if isinstance(x, list):
        return "[" + ", ".join(_show(v, depth + 1) for v in x) + "]"
    if isinstance(x, tuple):
        if len(x) == 1:
            return "(" + _show(x[0], depth + 1) + ",)"
        return "(" + ", ".join(_show(v, depth + 1) for v in x) + ")"
    if isinstance(x, (set, frozenset)):
        if not x:
            return "set()"
        try:
            items = sorted(x)
        except TypeError:
            items = list(x)
        return "{" + ", ".join(_show(v, depth + 1) for v in items) + "}"
    if type(x).__module__ == "__main__" and hasattr(x, "__dict__") and not isinstance(x, type):
        # an object of a class the code defined: show its fields, not an address
        return type(x).__name__ + "(" + ", ".join(k + "=" + _show(v, depth + 1) for k, v in vars(x).items()) + ")"
    s = repr(x)
    return s if len(s) <= 200 else s[:200] + "…"

# "# ask: expr" asks every time the line is reached; "# ask 1,3: expr" only
# the 1st and 3rd time. The question comes before the line runs.
_ASK = _re.compile(r"#\s*ask(?:\s+([\d,\s]+))?:\s*(.+?)\s*$")

class _WalkStop(Exception):
    pass

def _walk(code, use_asks=True, limit=800):
    asks = {}
    if use_asks:
        for i, line in enumerate(code.split("\n"), 1):
            m = _ASK.search(line)
            if m:
                which = {int(n) for n in m.group(1).replace(",", " ").split()} if m.group(1) else None
                asks[i] = (m.group(2), which)
    seen, steps, buf = {}, [], io.StringIO()
    hidden = set(_given())
    skip = (_types.FunctionType, _types.ModuleType, _types.BuiltinFunctionType, type)

    def keep(d):
        return {k: _show(v) for k, v in d.items() if not (k.startswith("__") or k in hidden or isinstance(v, skip))}

    def frames(f):
        chain = []
        while f is not None:
            if f.f_code.co_filename == "<walk>":
                chain.append(f)
            f = f.f_back
        return [{"fn": fr.f_code.co_name, "line": fr.f_lineno, "vars": keep(fr.f_locals)} for fr in reversed(chain)]

    def local(frame, event, arg):
        if event not in ("line", "return"):
            return local
        if event == "return" and frame.f_code.co_name == "<module>":
            return local
        if len(steps) >= limit:
            raise _WalkStop()
        st = {"line": frame.f_lineno, "event": event, "frames": frames(frame), "out": buf.getvalue()[-2000:]}
        if event == "return":
            st["ret"] = _show(arg)
        elif frame.f_lineno in asks:
            expr, which = asks[frame.f_lineno]
            n = seen[frame.f_lineno] = seen.get(frame.f_lineno, 0) + 1
            if which is None or n in which:
                try:
                    # one merged namespace, so a generator inside expr can see locals too
                    ans = _show(eval(expr, {**frame.f_globals, **frame.f_locals}))
                except Exception as e:
                    ans = type(e).__name__
                st["ask"] = {"expr": expr, "answer": ans}
        steps.append(st)
        return local

    def glob(frame, event, arg):
        return local if frame.f_code.co_filename == "<walk>" else None

    res = {"steps": steps, "error": None, "truncated": False}
    try:
        compiled = compile(code, "<walk>", "exec")
    except SyntaxError as e:
        res["error"] = {"line": e.lineno, "msg": "SyntaxError: " + str(e.msg)}
        return json.dumps(res)
    g = _given()
    try:
        with contextlib.redirect_stdout(buf):
            _sys.settrace(glob)
            try:
                exec(compiled, g)
            finally:
                _sys.settrace(None)
    except _WalkStop:
        res["truncated"] = True
    except BaseException as e:
        er = {"line": None, "msg": type(e).__name__ + (": " + str(e) if str(e) else "")}
        for fr in traceback.extract_tb(e.__traceback__):
            if fr.filename == "<walk>":
                er["line"] = fr.lineno
        res["error"] = er
    res["out"] = buf.getvalue()[-2000:]
    res["final"] = keep(g)
    return json.dumps(res)

# ── Break it: find an input where the shown code disagrees with a correct one ──
def _breakit(code, ref_code, fn, ref, valid, argsrc):
    def bad(msg):
        return json.dumps({"bad": msg})
    try:
        args = ast.literal_eval("(" + argsrc + ",)")
    except Exception as e:
        return bad("Couldn't read that as Python values (" + _err(e)["msg"] + ").")
    ns, rs = _given(), _given()
    exec(compile(code, "<shown>", "exec"), ns)
    exec(compile(ref_code, "<ref>", "exec"), rs)
    try:
        ok = eval(valid, {})(*args)
    except TypeError:
        return bad("Wrong number of values: give one for each argument.")
    except Exception as e:
        return bad("That input doesn't fit the rules (" + _err(e)["msg"] + ").")
    if ok is not True:
        return bad(ok or "That input doesn't fit the rules.")
    call = fn + "(" + ", ".join(_fmt(a) for a in args) + ")"
    try:
        right = rs[ref](*copy.deepcopy(args))
    except Exception as e:
        return bad("That input doesn't fit the rules (" + _err(e)["msg"] + ").")
    try:
        wrong = ns[fn](*copy.deepcopy(args))
        got = _fmt(wrong)
        broke = wrong != right
    except Exception as e:
        got = _err(e)["msg"]
        broke = True
    return json.dumps({"call": call, "got": got, "right": _fmt(right), "broke": broke})

def _run_snippet(code):
    buf = io.StringIO()
    err = None
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(code, "<snippet>", "exec"), _given())
    except BaseException as e:
        text = str(e)
        err = type(e).__name__ + (": " + text if text else "")
    return json.dumps({"stdout": buf.getvalue(), "error": err})
`;
