// The four language skills (듣기 · 말하기 · 읽기 · 쓰기), as the teacher and
// parents see them. Every logged answer belongs to one skill by its kind;
// the score is the share of first tries that were right.
const DAY = 86400000;

export const AREAS = [
  { id: "listen", ko: "듣기", ru: "Слушать", icon: "Ear", kinds: ["listen"] },
  { id: "speak", ko: "말하기", ru: "Говорить", icon: "Mic", kinds: ["speak", "roleplay", "mission", "chat"] },
  { id: "read", ko: "읽기", ru: "Читать", icon: "BookOpen", kinds: ["read", "task", "choose"] },
  { id: "write", ko: "쓰기", ru: "Писать", icon: "PencilLine", kinds: ["order", "trace", "build", "grammar", "spell"] },
];
const AREA_OF = Object.fromEntries(AREAS.flatMap((a) => a.kinds.map((k) => [k, a.id])));
export const areaOf = (kind) => AREA_OF[kind] || null;

// Fewer answers than this and the percentage says little.
export const MIN_N = 5;

export function areaScores(log = [], from = 0, to = Infinity) {
  const out = Object.fromEntries(AREAS.map((a) => [a.id, { n: 0, ok: 0, pct: null }]));
  for (const e of log) {
    const a = AREA_OF[e.kind];
    if (!a || e.ts < from || e.ts >= to) continue;
    out[a].n++;
    if (e.ok) out[a].ok++;
  }
  for (const v of Object.values(out)) v.pct = v.n ? Math.round((v.ok / v.n) * 100) : null;
  return out;
}

// All answers, plus the last two weeks against the weeks before, so the
// teacher sees whether a skill is getting better.
export function areaReport(p, now = Date.now()) {
  const log = p.log || [];
  const cut = now - 14 * DAY;
  return { all: areaScores(log), recent: areaScores(log, cut), before: areaScores(log, 0, cut) };
}

export function trend(r, id) {
  const a = r.recent[id];
  const b = r.before[id];
  if (a.n < MIN_N || b.n < MIN_N) return 0;
  const d = a.pct - b.pct;
  return Math.abs(d) < 5 ? 0 : d;
}

export function level(pct) {
  if (pct == null) return null;
  return pct >= 85 ? "good" : pct >= 60 ? "ok" : "low";
}

// Ready for a self-check: enough words and none in the last week.
export function checkDue(p, now = Date.now()) {
  if (Object.keys(p?.words || {}).length < 8) return false;
  const last = p.checks?.[p.checks.length - 1];
  return !last || now - last.ts >= 7 * DAY;
}
