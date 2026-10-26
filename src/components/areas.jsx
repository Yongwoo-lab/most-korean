// Four bars for 듣기 · 말하기 · 읽기 · 쓰기 and the self-check history.
// lang "ko" for the teacher, "ru" for parents.
import { Icon } from "./ui.jsx";
import { AREAS, MIN_N, areaReport, level, trend } from "../lib/skills.js";

const LEVEL = {
  good: { ko: "잘해요", ru: "хорошо", color: "var(--teal)" },
  ok: { ko: "보통", ru: "неплохо", color: "var(--amber)" },
  low: { ko: "연습 필요", ru: "нужно повторить", color: "var(--coral)" },
};
const TXT = {
  ko: { title: "4영역 정답률", sub: "최근 2주 기준, 화살표는 그 전 기간과 비교", few: "기록 부족", n: "문항", checks: "실력 점검 기록", first: "처음", last: "최근" },
  ru: { title: "Четыре навыка", sub: "доля верных ответов за 2 недели", few: "мало данных", n: "отв.", checks: "Проверки «Проверь себя»", first: "первая", last: "последняя" },
};

const pctOf = ([ok, n]) => (n ? Math.round((ok / n) * 100) : null);

export function AreaBars({ p, lang = "ko" }) {
  const r = areaReport(p);
  const t = TXT[lang];
  const checks = p.checks || [];
  return (
    <div className="col areas" style={{ gap: 10 }}>
      <div>
        <b>{t.title}</b> <span className="t-sub">· {t.sub}</span>
      </div>
      {AREAS.map((a) => {
        // Use the last two weeks when there is enough, otherwise everything.
        const s = r.recent[a.id].n >= MIN_N ? r.recent[a.id] : r.all[a.id];
        const lv = s.n >= MIN_N ? level(s.pct) : null;
        const d = trend(r, a.id);
        return (
          <div key={a.id} className="area-row">
            <span className="area-name">
              <Icon name={a.icon} size={18} /> {lang === "ko" ? a.ko : a.ru}
            </span>
            <span className="area-track">
              <span style={{ width: `${s.pct || 0}%`, background: lv ? LEVEL[lv].color : "var(--line-strong)" }} />
            </span>
            <span className="area-pct">
              {lv ? `${s.pct}%` : "–"}
              {d !== 0 && <Icon name={d > 0 ? "TrendingUp" : "TrendingDown"} size={16} style={{ color: d > 0 ? "var(--teal-d)" : "var(--coral)", marginLeft: 4 }} />}
            </span>
            <span className="area-level t-sub">{lv ? LEVEL[lv][lang] : t.few} · {s.n}{lang === "ko" ? "" : " "}{t.n}</span>
          </div>
        );
      })}
      {checks.length > 0 && (
        <div className="col" style={{ gap: 6, marginTop: 6 }}>
          <b style={{ fontSize: 15 }}>
            <Icon name="ClipboardCheck" size={16} /> {t.checks}
          </b>
          <table className="rec checks">
            <thead>
              <tr>
                <td />
                {AREAS.map((a) => (
                  <td key={a.id}>{lang === "ko" ? a.ko : a.ru}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {(checks.length > 1 ? [checks[0], checks[checks.length - 1]] : checks).map((c, i) => (
                <tr key={c.ts}>
                  <td className="t-sub">
                    {checks.length > 1 ? (i ? t.last : t.first) + " · " : ""}
                    {new Date(c.ts).toLocaleDateString(lang === "ko" ? "ko-KR" : "ru-RU", { month: "numeric", day: "numeric" })}
                  </td>
                  {AREAS.map((a) => {
                    const v = c.res[a.id];
                    const pc = v ? pctOf(v) : null;
                    return <td key={a.id}>{pc == null ? "–" : `${v[0]}/${v[1]}`}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
