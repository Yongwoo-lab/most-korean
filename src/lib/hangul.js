import { standardizePronunciation } from "es-hangul";
// Hangul helpers: build syllables from jamo, split them back, and compare
// what a child said with the target sentence.

export const CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
export const JUNG = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
export const JONG = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

const BASE = 0xac00;

export function compose(cho, jung, jong = "") {
  const c = CHO.indexOf(cho);
  const j = JUNG.indexOf(jung);
  const t = JONG.indexOf(jong);
  if (c < 0 || j < 0 || t < 0) return "";
  return String.fromCharCode(BASE + (c * 21 + j) * 28 + t);
}

export function isSyllable(ch) {
  const code = ch.charCodeAt(0);
  return code >= BASE && code <= 0xd7a3;
}

export function decompose(ch) {
  if (!isSyllable(ch)) return null;
  const n = ch.charCodeAt(0) - BASE;
  return { cho: CHO[Math.floor(n / 588)], jung: JUNG[Math.floor((n % 588) / 28)], jong: JONG[n % 28] };
}

export function hasBatchim(word) {
  const last = [...word.trim()].pop();
  const d = last && decompose(last);
  return !!(d && d.jong);
}

// Only the Hangul syllables, so punctuation and spaces never cost points.
export function normalize(s) {
  return [...(s || "")].filter(isSyllable).join("");
}

function toJamo(s) {
  const out = [];
  for (const ch of normalize(s)) {
    const d = decompose(ch);
    out.push(d.cho, d.jung);
    if (d.jong) out.push(d.jong);
  }
  return out;
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// 0..1, measured on jamo so "대요" vs "돼요" counts as one small slip.
export function similarity(target, said) {
  const a = toJamo(target);
  const b = toJamo(said);
  if (!a.length) return 0;
  return Math.max(0, 1 - levenshtein(a, b) / Math.max(a.length, b.length));
}

// Mark each target syllable as matched or not, using the longest common
// subsequence of syllables. Spaces and punctuation in the target are kept.
export function diffSyllables(target, said) {
  const t = normalize(target);
  const s = normalize(said);
  const dp = Array.from({ length: t.length + 1 }, () => new Array(s.length + 1).fill(0));
  for (let i = t.length - 1; i >= 0; i--) {
    for (let j = s.length - 1; j >= 0; j--) {
      dp[i][j] = t[i] === s[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ok = new Array(t.length).fill(false);
  let i = 0;
  let j = 0;
  while (i < t.length && j < s.length) {
    if (t[i] === s[j]) {
      ok[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  const parts = [];
  let k = 0;
  for (const ch of target) {
    if (isSyllable(ch)) parts.push({ ch, ok: ok[k++] });
    else parts.push({ ch, ok: true, plain: true });
  }
  return parts;
}

// 받침 rule for 이에요/예요, 을/를 and friends.
export function josa(word, withBatchim, without) {
  return word + (hasBatchim(word) ? withBatchim : without);
}

// How a phrase is actually pronounced (표준 발음), e.g. 화장실에 → [화장시레].
// es-hangul (Toss, MIT) applies the standard rules; it over-applies 경음화
// in a few compounds and misses tensing across a space (몇 시 → [멷 씨]),
// so those are corrected by hand.
const PRON_FIX = {
  반가워요: "반가워요",
  감사합니다: "감사함니다",
  "보건실 어디예요": "보건실 어디예요",
  "보건실에 가고 싶어요": "보건시레 가고 시퍼요",
  "몇 시예요": "멷 씨예요",
  "모두 몇 개예요": "모두 멷 깨예요",
  "일곱 시에 일어나요": "일곱 씨에 이러나요",
  "여덟 시에 학교에 가요": "여덜 씨에 학꾜에 가요",
  "잘 먹겠습니다": "잘 먹께씀니다",
  언제: "언제",
};
export function pronounce(text) {
  const clean = text.replace(/[?.!,~]/g, "").trim();
  if (PRON_FIX[clean]) return PRON_FIX[clean];
  try {
    return standardizePronunciation(clean);
  } catch {
    return clean;
  }
}
