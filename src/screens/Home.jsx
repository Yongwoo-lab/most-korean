import { PARTS, UNITS, isOpen, nextUnit } from "../data/course.js";
import { Avatar, Icon, Mascot, Stars, T, useProfile } from "../components/ui.jsx";
import { streak, today, totalStars } from "../lib/store.js";
import { sayAll } from "../lib/speech.js";
import { hasBatchim } from "../lib/hangul.js";

export function TopBar({ go, children }) {
  const p = useProfile();
  return (
    <header className="topbar">
      <button type="button" className="brand" onClick={() => go("home")} aria-label="На главную">
        <span className="brand-mark">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 17h20" />
            <path d="M4 17v-3a8 8 0 0 1 16 0v3" />
            <path d="M8 17v-4M12 17v-6M16 17v-4" />
          </svg>
        </span>
        <span className="brand-name">Мост · 다리</span>
      </button>
      {children}
      <span className="spacer" />
      {p && (
        <>
          <span className="chip" title="Дней подряд">
            <Icon name="Flame" size={20} color="#C2410C" /> {streak(p)}
          </span>
          <span className="chip" title="Звёзды">
            <Stars n={1} of={1} size={20} /> {totalStars(p)}
          </span>
          <button type="button" className="chip" onClick={() => go("profiles")} aria-label="Сменить ученика">
            <Avatar avatar={p.avatar} size={32} />
            <span>{p.name}</span>
          </button>
        </>
      )}
    </header>
  );
}

function UnitNode({ unit, part, profile, current, go }) {
  const open = isOpen(unit, profile);
  const rec = profile?.units?.[unit.id];
  const done = !!rec?.done;
  const bg = done ? part.color : open ? "#fff" : "#d4d8d6";
  const fg = done ? "#fff" : open ? part.color : "#5b6478";
  return (
    <button
      type="button"
      className="node"
      disabled={!open}
      onClick={() => go("unit", { id: unit.id })}
      aria-label={`${unit.title.ru} ${unit.title.ko}${unit.soon ? ", скоро" : !open ? ", закрыто" : ""}`}
    >
      <span
        className={"node-circle" + (!open ? " locked" : "") + (current ? " current" : "")}
        style={{ background: bg, color: fg, border: open && !done ? `5px solid ${part.color}` : "none", boxShadow: open ? `0 6px 0 ${done ? "rgba(0,0,0,0.25)" : "rgba(31,42,68,0.12)"}` : "none" }}
      >
        {current && <span className="now-tag">Сейчас</span>}
        <Icon name={open ? unit.icon : "Lock"} size={open ? 38 : 30} />
      </span>
      {done ? <Stars n={rec.stars} /> : unit.soon ? <span className="badge-soon">скоро · 준비 중</span> : <span style={{ height: 16 }} />}
      <span className="node-label">
        <b className="ko" style={{ fontSize: 17 }}>{unit.title.ko}</b>
        <br />
        <span className="ru muted">{unit.title.ru}</span>
      </span>
    </button>
  );
}

export default function Home({ go }) {
  const p = useProfile();
  const next = nextUnit(p);
  const minutes = p?.minutes?.[today()] || 0;
  const greet = `Привет, ${p?.name || ""}!`;
  const learned = Object.keys(p?.words || {}).length;

  return (
    <>
      <TopBar go={go} />
      <div className="page home">
        <main>
          {PARTS.map((part) => (
            <section key={part.id} className="part" style={{ background: part.soft }}>
              <div className="part-head">
                <h2 style={{ color: part.color }}>{part.title.ko}</h2>
                <span className="ru muted">{part.title.ru}</span>
              </div>
              <div className="nodes">
                {UNITS.filter((u) => u.part === part.id).map((u) => (
                  <UnitNode key={u.id} unit={u} part={part} profile={p} current={u.id === next.id} go={go} />
                ))}
              </div>
            </section>
          ))}
        </main>

        <aside className="home-side col" style={{ gap: 16, position: "sticky", top: 12 }}>
          <div className="card row" style={{ padding: 18, gap: 14, alignItems: "flex-start" }}>
            <Mascot size={72} />
            <button type="button" className="bubble" style={{ flex: 1, textAlign: "left" }} onClick={() => sayAll([[greet, "ru"], [`오늘은 '${next.title.ko}'${hasBatchim(next.title.ko) ? "을" : "를"} 배워요.`, "ko"]])}>
              <div style={{ fontWeight: 700 }} className="ru">{greet}</div>
              <div>
                <T ru={`Сегодня: «${next.title.ru}»`} ko={`오늘은 '${next.title.ko}'`} />
              </div>
            </button>
          </div>

          <button type="button" className="btn btn-primary" style={{ minHeight: 68, fontSize: 24 }} onClick={() => go("unit", { id: next.id })}>
            {p?.units?.[next.id] ? "Повторить" : "Учиться"} · 시작
            <Icon name="ChevronRight" size={26} />
          </button>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
            <button type="button" className="btn btn-outline" style={{ color: "var(--teal)", minHeight: 64 }} onClick={() => go("tutor")}>
              <Icon name="MessageCircle" /> Мишка
            </button>
            <button type="button" className="btn btn-outline" style={{ color: "var(--ink)", minHeight: 64 }} onClick={() => go("words")}>
              <Icon name="BookMarked" /> Слова {learned}
            </button>
          </div>

          <div className="card col" style={{ padding: 18, gap: 10 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <b className="ru">Сегодня</b>
              <span className="muted">{minutes} мин</span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: "var(--line)", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (minutes / 15) * 100)}%`, height: 10, background: "var(--teal)" }} />
            </div>
            <div className="t-sub ru">Цель: 15 минут в день · 하루 15분</div>
          </div>

          <button type="button" className="row muted" style={{ justifyContent: "center", gap: 8, fontSize: 14, padding: 8 }} onClick={() => go("teacher")}>
            <Icon name="GraduationCap" size={18} /> 선생님 · 부모님 화면
          </button>
        </aside>
      </div>
    </>
  );
}
