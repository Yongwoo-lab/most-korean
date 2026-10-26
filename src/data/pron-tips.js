// What to tell a Russian-speaking child when one syllable sounded different.
// Compares the parts of the expected and the heard syllable and picks the
// first difference that has advice. Russian has no aspirated/tense split
// and hears ㅓ and ㅗ as one «о», so those come first.
import { decompose } from "../lib/hangul.js";

const GROUPS = [
  ["ㄱ", "ㅋ", "ㄲ"],
  ["ㄷ", "ㅌ", "ㄸ"],
  ["ㅂ", "ㅍ", "ㅃ"],
  ["ㅈ", "ㅊ", "ㅉ"],
  ["ㅅ", "ㅆ"],
];
const KIND = { ㄱ: "plain", ㄷ: "plain", ㅂ: "plain", ㅈ: "plain", ㅅ: "plain", ㅋ: "air", ㅌ: "air", ㅍ: "air", ㅊ: "air", ㄲ: "tense", ㄸ: "tense", ㅃ: "tense", ㅉ: "tense", ㅆ: "tense" };
const CONSONANT = {
  plain: "мягко, чуть-чуть воздуха",
  air: "с сильным выдохом: бумажка у рта должна шевелиться",
  tense: "напряжённо и коротко, совсем без воздуха",
};

const VOWEL = {
  ㅓ: "ㅓ: рот открыт, губы НЕ круглые (между «о» и «а»)",
  ㅗ: "ㅗ: губы круглые, вытяни их вперёд",
  ㅡ: "ㅡ: губы растянуты в улыбку, как «ы»",
  ㅜ: "ㅜ: губы круглые и вперёд, как «у»",
  ㅕ: "ㅕ: «й» + ㅓ, губы не круглые",
  ㅛ: "ㅛ: «й» + ㅗ, губы круглые",
  ㅏ: "ㅏ: рот широко открыт, «а»",
  ㅣ: "ㅣ: губы в улыбку, «и»",
  ㅐ: "ㅐ: «э»",
  ㅔ: "ㅔ: «э»",
  ㅘ: "ㅘ: «ва», начни с круглых губ",
  ㅙ: "ㅙ: «вэ», начни с круглых губ",
  ㅚ: "ㅚ: «вэ», начни с круглых губ",
  ㅝ: "ㅝ: «во», начни с круглых губ",
  ㅟ: "ㅟ: «ви», начни с круглых губ",
  ㅢ: "ㅢ: «ы» и «и» быстро вместе",
};

const JONG = {
  ㅇ: "в конце ㅇ — «нг»: рот открыт, звук идёт в нос",
  ㄴ: "в конце ㄴ — язык касается зубов, «н»",
  ㅁ: "в конце ㅁ — губы закрываются, «м»",
  ㄹ: "в конце ㄹ — язык наверху, лёгкое «л»",
  ㄱ: "в конце ㄱ — звук останавливается в горле, без «к»",
  ㅂ: "в конце ㅂ — губы закрываются, без «п»",
  ㄷ: "в конце — язык к зубам и стоп, без «т»",
};

// Same-sounding pairs: no advice, the speech recogniser just spelled it
// another way (ㅐ/ㅔ, ㅚ/ㅙ/ㅞ).
const SAME = [["ㅐ", "ㅔ"], ["ㅚ", "ㅙ"], ["ㅚ", "ㅞ"], ["ㅙ", "ㅞ"]];
const same = (a, b) => a === b || SAME.some(([x, y]) => (a === x && b === y) || (a === y && b === x));

// Returns { key, ru } or null. key is stable (e.g. "ㅓ>ㅗ") for the teacher's statistics.
export function pronTip(expected, heard) {
  if (!heard) return { key: "missing", ru: "Этот слог не было слышно. Скажи громче и чётче." };
  const e = decompose(expected);
  const h = decompose(heard);
  if (!e || !h) return null;
  if (!same(e.jung, h.jung)) {
    return { key: `${e.jung}>${h.jung}`, ru: `Прозвучало как ${heard}. ${VOWEL[e.jung] || `Нужен звук ${e.jung}`}.` };
  }
  if (e.cho !== h.cho) {
    const g = GROUPS.find((x) => x.includes(e.cho) && x.includes(h.cho));
    const how = g ? CONSONANT[KIND[e.cho]] : null;
    return { key: `${e.cho}>${h.cho}`, ru: `Прозвучало как ${heard}. ${e.cho === "ㅇ" ? "В начале ㅇ не звучит" : how ? `${e.cho} — ${how}` : `Начни со звука ${e.cho}`}.` };
  }
  if (e.jong !== h.jong) {
    if (!e.jong) return { key: `+${h.jong}`, ru: `Прозвучало как ${heard}. В конце слога ничего не добавляй.` };
    return { key: `${e.jong}>${h.jong || "-"}`, ru: `Прозвучало как ${heard}. ${JONG[e.jong] || `В конце нужен звук ${e.jong}`}.` };
  }
  return null;
}
