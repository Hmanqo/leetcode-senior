// Verifies every lesson: each rep/problem solution passes its own cases and
// technique checks, and prints each predict snippet's real output.
// Usage: node tools/check.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const lessons = [];
const ctx = { window: {}, COURSE: { lesson: (l) => lessons.push(l) } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "harness.js"), "utf8"), ctx);
for (const f of fs.readdirSync(path.join(root, "lessons")).sort()) {
  if (f.endsWith(".js")) vm.runInContext(fs.readFileSync(path.join(root, "lessons", f), "utf8"), ctx);
}

const stripComments = (code) => code.split("\n").map((l) => l.replace(/#.*$/, "")).join("\n");
const jobs = [];
let failures = 0;

for (const l of lessons) {
  const ids = new Set(l.exercises.map((e) => e.id));
  for (const id of l.fromBlank || []) if (!ids.has(id)) { console.log(`✗ ${l.id} fromBlank lists unknown ${id}`); failures++; }
  for (const e of l.exercises) {
    if (e.kind === "rep" || e.kind === "problem") {
      const src = stripComments(e.solution);
      for (const r of e.mustUse || []) if (!new RegExp(r.re).test(src)) { console.log(`✗ ${l.id}/${e.id} solution misses mustUse ${r.re}`); failures++; }
      for (const r of e.mustNot || []) if (new RegExp(r.re).test(src)) { console.log(`✗ ${l.id}/${e.id} solution hits mustNot ${r.re}`); failures++; }
      jobs.push({ tag: `${l.id}/${e.id}`, kind: "test", code: e.solution, fn: e.fn, cases: e.cases, mode: e.mode || "exact", adapt: e.adapt || "" });
      if (e.stub) jobs.push({ tag: `${l.id}/${e.id} (stub must fail)`, kind: "stubfail", code: e.stub + "pass\n", fn: e.fn, cases: e.cases, mode: e.mode || "exact", adapt: e.adapt || "" });
    } else if (e.kind === "predict") {
      jobs.push({ tag: `${l.id}/${e.id}`, kind: "snippet", code: e.code });
    } else if (e.kind === "walk") {
      jobs.push({ tag: `${l.id}/${e.id}`, kind: "walk", code: e.code });
    } else if (e.kind === "breakit") {
      jobs.push({ tag: `${l.id}/${e.id}`, kind: "breakit", code: e.code, right: e.right, fn: e.fn, ref: e.ref, valid: e.valid, example: e.example });
    } else {
      console.log(`✗ ${l.id}/${e.id} has unknown kind ${e.kind}`); failures++;
    }
  }
}

const py = `
import json, sys
${ctx.window.COURSE_HARNESS}
jobs = json.load(sys.stdin)
for j in jobs:
    if j["kind"] == "snippet":
        r = json.loads(_run_snippet(j["code"]))
        print("· " + j["tag"] + " prints:")
        for line in r["stdout"].splitlines():
            print("      " + line)
        if r["error"]:
            print("      " + r["error"])
        continue
    if j["kind"] == "walk":
        # must run clean, finish under the step cap, and ask at least once.
        # The asks are printed so they can be checked against the prompt.
        r = json.loads(_walk(j["code"]))
        asks = [s for s in r["steps"] if "ask" in s]
        ok = r["error"] is None and not r["truncated"] and asks and not any(s["ask"]["answer"].endswith("Error") for s in asks)
        print(("✓ " if ok else "✗ ") + j["tag"] + " walk: " + str(len(r["steps"])) + " steps, " + str(len(asks)) + " asks" + ("" if ok else "  " + json.dumps({"error": r["error"], "truncated": r["truncated"]})))
        for s in asks:
            print("      line " + str(s["line"]) + ": " + s["ask"]["expr"] + " = " + s["ask"]["answer"])
        if r["out"]:
            print("      prints: " + r["out"].strip().replace("\\n", " | "))
        continue
    if j["kind"] == "breakit":
        r = json.loads(_breakit(j["code"], j["right"], j["fn"], j["ref"], j["valid"], j["example"]))
        ok = r.get("broke") is True
        print(("✓ " if ok else "✗ ") + j["tag"] + " breakit: " + json.dumps(r))
        continue
    r = json.loads(_run_tests(j["code"], j["fn"], j["cases"], j["mode"], j["adapt"]))
    ok = r["error"] is None and r["cases"] and all(c["ok"] for c in r["cases"])
    if j["kind"] == "stubfail":
        ok = not ok
    print(("✓ " if ok else "✗ ") + j["tag"] + ("" if ok else "  " + json.dumps(r)))
`;
const out = spawnSync("python3", ["-I", "-c", py], { input: JSON.stringify(jobs), encoding: "utf8" });
process.stdout.write(out.stdout);
if (out.stderr) process.stderr.write(out.stderr);
failures += (out.stdout.match(/^✗/gm) || []).length;
if (out.status) { console.log("✗ python exited with status " + out.status); failures++; }
console.log(failures ? `\n${failures} problem(s)` : `\nAll ${lessons.length} lesson(s) OK`);
process.exit(failures || out.status ? 1 : 0);
