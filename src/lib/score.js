// Scores what the speech recogniser heard against the accepted sentences
// and finds the syllables that sounded different.
import { pronTip } from "../data/pron-tips.js";
import { normalize, pronounce, similarity, soundDiff } from "./hangul.js";

// Syllables are compared as they sound (화장실에 → [화장시레]), because the
// recogniser sometimes writes what it heard phonetically. Marks are then
// put back on the written sentence.
function compare(target, said) {
  const pt = pronounce(target);
  // Already written as it sounds: do not run the rules on it a second time.
  const heard = normalize(said) === normalize(pt) ? pt : pronounce(said);
  const sounds = soundDiff(pt, heard).filter((p) => !p.plain);
  const written = soundDiff(target, target);
  if (sounds.length !== written.filter((p) => !p.plain).length) return soundDiff(target, said).map((p) => ({ ...p, sound: p.ch }));
  let k = 0;
  return written.map((p) => (p.plain ? p : { ...p, ok: sounds[k].ok, heard: sounds[k].heard, sound: sounds[k++].ch }));
}

// Best match of what was said against the accepted sentences. keys: words
// that, if all heard, mean the child was understood even when the sentence
// differs (another name, a shorter form).
export function scoreSpeech(answers, said, keys = [], pass = 0.75) {
  let best = { score: 0, target: answers[0] };
  for (const a of answers) {
    const sc = Math.max(similarity(a, said), similarity(pronounce(a), pronounce(said)));
    if (sc > best.score) best = { score: sc, target: a };
  }
  const n = normalize(said);
  const hasKeys = keys.length > 0 && keys.every((k) => n.includes(normalize(k)));
  const parts = compare(best.target, said);
  const tips = [];
  // Understood through the key words: no pronunciation advice on the rest.
  if (best.score >= pass || !hasKeys)
    for (const p of parts) {
      if (p.ok || p.plain) continue;
      const t = pronTip(p.sound, p.heard);
      if (t && !tips.some((x) => x.key === t.key)) tips.push({ ...t, ch: p.sound, heard: p.heard });
    }
  const clean = parts.every((p) => p.ok);
  return { ...best, score: clean ? 1 : best.score, keys: hasKeys, parts: hasKeys && best.score < pass ? null : parts, tips: tips.slice(0, 2) };
}
