// Lists every line the app can read aloud, so scripts/make-audio.py can
// record it once with a good voice. Writes speech/lines.json:
//   { ko: [...Korean texts], ru: [...Russian texts] }
// Lines built at run time (a child's name, a syllable the child assembled)
// are not listed; the app reads those with the device voice.
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import * as hangul from "../src/data/hangul-units.js";
import * as life from "../src/data/life-units.js";
import * as lessons from "../src/data/class-units.js";
import { MISSIONS } from "../src/data/missions.js";
import { CHATS } from "../src/data/chats.js";

const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힣]/;
const ko = new Set();
const ru = new Set();

function walk(node, key) {
  if (typeof node === "string") {
    if (key === "ru" || key === "label") ru.add(node);
    else if (HANGUL.test(node)) ko.add(node);
    return;
  }
  if (Array.isArray(node)) return node.forEach((x) => walk(x, key));
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walk(v, k);
}

for (const unit of [...Object.values(hangul), ...Object.values(life), ...Object.values(lessons)]) {
  walk(unit);
  for (const step of unit.steps || []) {
    // Intro steps are read aloud as one paragraph.
    if (step.type === "intro" && step.blocks) ru.add(step.blocks.map((b) => b.ru).join(" "));
    // Grammar answers are spoken as word + ending.
    if (step.type === "grammar")
      for (const q of step.q || []) for (const o of q.options || step.options || []) ko.add(q.word + o + (step.suffix || ""));
  }
}

// Missions: the situation (Russian) and the model answers (Korean).
for (const list of Object.values(MISSIONS)) for (const m of list) {
  ru.add(m.ru);
  for (const k of [m.answer, ...(m.alt || [])]) ko.add(k);
}

// Talks with Мишка: his questions and replies, and the model answers.
for (const list of Object.values(CHATS)) for (const t of list) {
  for (const k of [t.ko, t.reply, t.answer, ...(t.alt || [])]) if (/[가-힣]/.test(k) && !/\d/.test(k)) ko.add(k);
}
ko.add("괜찮아요! 다음에 또 해요.");

// Fixed lines in the screens: sayAll([["…", "ru"], ["…", "ko"]]) and say("…").
function files(dir) {
  return readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : f.endsWith(".jsx") ? [join(dir, f)] : []));
}
for (const f of files("src")) {
  const code = readFileSync(f, "utf8");
  for (const m of code.matchAll(/\["([^"`$]+)", "(ru|ko)"\]/g)) (m[2] === "ru" ? ru : ko).add(m[1]);
  for (const m of code.matchAll(/\bsay\("([^"`$]+)"\)/g)) ko.add(m[1]);
  for (const m of code.matchAll(/useReadAloud\([^)]*?"([^"`$]+)"/g)) ru.add(m[1]);
}

// Jamo are read by their sound in the app, not as letters.
const out = {
  ko: [...ko].filter((t) => t.trim()).sort(),
  ru: [...ru].filter((t) => /[а-яё]/i.test(t)).sort(),
};
mkdirSync("speech", { recursive: true });
writeFileSync("speech/lines.json", JSON.stringify(out, null, 1) + "\n");
console.log(`${out.ko.length} Korean and ${out.ru.length} Russian lines → speech/lines.json`);
