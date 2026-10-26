// Daily review with growing gaps (Leitner boxes). A word comes back 1 day
// after it was learned, then 3, 7, 14 and 30 days after each right answer;
// a wrong answer sends it back to tomorrow. Each box asks for a harder skill,
// so a word moves from hearing it to saying and spelling it.
import { compose, decompose, isSyllable } from "./hangul.js";

const DAY = 86400000;
export const GAPS = [1, 3, 7, 14, 30];
// Skill asked at each box: hear → read → say → spell → say.
export const SKILL_AT = ["listen", "read", "speak", "spell", "speak", "spell"];

const dayStart = (t) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function reviewState(p, ko) {
  const r = p.review?.[ko];
  if (r) return r;
  const learned = p.words?.[ko]?.ts || Date.now();
  return { box: 0, due: dayStart(learned) + GAPS[0] * DAY };
}

export function dueWords(p, now = Date.now(), limit = 8) {
  const today = dayStart(now);
  return Object.keys(p?.words || {})
    .map((ko) => ({ ko, ...reviewState(p, ko) }))
    .filter((r) => r.due <= today + DAY - 1)
    .sort((a, b) => a.box - b.box || a.due - b.due)
    .slice(0, limit);
}

export function nextState(r, ok, now = Date.now()) {
  if (!ok) return { box: 0, due: dayStart(now) + DAY, miss: (r.miss || 0) + 1 };
  const box = Math.min(r.box + 1, GAPS.length);
  return { box, due: dayStart(now) + GAPS[Math.min(box, GAPS.length - 1)] * DAY, miss: r.miss || 0 };
}

// Spellings that sound close, for "which one is right?": swap a vowel or a
// consonant for the one Russian speakers confuse it with, or change the 받침.
const VOWEL_SWAP = { ㅓ: "ㅗ", ㅗ: "ㅓ", ㅡ: "ㅜ", ㅜ: "ㅡ", ㅕ: "ㅛ", ㅛ: "ㅕ", ㅐ: "ㅏ", ㅔ: "ㅓ", ㅏ: "ㅓ", ㅣ: "ㅡ", ㅘ: "ㅏ", ㅝ: "ㅓ", ㅟ: "ㅣ", ㅢ: "ㅡ" };
const CONS_SWAP = { ㄱ: "ㅋ", ㅋ: "ㄲ", ㄲ: "ㄱ", ㄷ: "ㅌ", ㅌ: "ㄸ", ㄸ: "ㄷ", ㅂ: "ㅍ", ㅍ: "ㅃ", ㅃ: "ㅂ", ㅈ: "ㅊ", ㅊ: "ㅉ", ㅉ: "ㅈ", ㅅ: "ㅆ", ㅆ: "ㅅ", ㄴ: "ㄹ", ㄹ: "ㄴ", ㅁ: "ㅂ", ㅎ: "ㅇ" };
const JONG_SWAP = { "": "ㅇ", ㅇ: "ㄴ", ㄴ: "ㅇ", ㄹ: "", ㅁ: "ㅂ", ㅂ: "ㅁ", ㄱ: "", ㅅ: "ㄷ" };

export function variants(word, n = 2) {
  const chars = [...word];
  const idx = chars.map((c, i) => (isSyllable(c) ? i : -1)).filter((i) => i >= 0);
  const out = new Set();
  for (const kind of ["v", "c", "j"])
    for (const i of idx) {
      const d = decompose(chars[i]);
      let s = null;
      if (kind === "v" && VOWEL_SWAP[d.jung]) s = compose(d.cho, VOWEL_SWAP[d.jung], d.jong);
      if (kind === "c" && CONS_SWAP[d.cho]) s = compose(CONS_SWAP[d.cho], d.jung, d.jong);
      if (kind === "j" && d.jong in JONG_SWAP) s = compose(d.cho, d.jung, JONG_SWAP[d.jong]);
      if (s && s !== chars[i]) {
        const w = chars.map((c, k) => (k === i ? s : c)).join("");
        if (w !== word) out.add(w);
      }
      if (out.size >= n * 3) break;
    }
  // Spread the changes over different syllables and kinds.
  const list = [...out];
  const pick = [];
  for (let k = 0; pick.length < n && k < list.length; k += Math.max(1, Math.floor(list.length / n))) pick.push(list[k]);
  return pick.length ? pick : list.slice(0, n);
}

