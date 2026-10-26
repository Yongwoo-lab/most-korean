import { PARTS, UNITS, isOpen, nextUnit } from "../data/course.js";
import { UNIT_COVER, UI_PIC } from "../data/pictures.js";
import { Avatar, Icon, Mascot, Pic, Stars, T, useProfile } from "../components/ui.jsx";
import { streak, today, totalStars } from "../lib/store.js";
import { sayAll } from "../lib/speech.js";
import { hasBatchim } from "../lib/hangul.js";
import { logout, useCloud } from "../lib/cloud.js";
import { dueWords } from "../lib/review.js";

export function Brand({ go }) {
  return (
    <button type="button" className="brand" onClick={() => go("home")} aria-label="Мост · 다리 — на главную">
      <img src="logo-mark.svg" width="44" height="44" alt="" />
      <span className="brand-name">
        <span className="brand-ru">Мост</span>
        <span className="brand-dot" aria-hidden="true" />
        <span className="brand-ko">다리</span>
      </span>
    </button>
  );
}

export function TopBar({ go, children }) {
  const p = useProfile();
  const { sync } = useCloud();
  // A logged-in student leaves by logging out; local profiles go back to the list.
  const who = () => (p.cloud ? confirm("Выйти? · 로그아웃할까요?") && logout().then(() => go("home")) : go("profiles"));
  return (
    <header className="topbar">
      <Brand go={go} />
      {children}
      <span className="spacer" />
      {p && (
        <>
          <span className="chip stat" title="Дней подряд · 연속">
            <Pic pic={UI_PIC.streak} size={24} /> {streak(p)}
          </span>
          <span className="chip stat" title="Звёзды · 별">
            <Pic pic={UI_PIC.star} size={24} /> {totalStars(p)}
          </span>
          {p.cloud && (
            <span className="chip stat" title={sync === "offline" ? "Нет интернета: сохраню позже · 오프라인" : "Сохранено · 저장됨"}>
              <Icon name={sync === "offline" ? "CloudOff" : "Cloud"} size={22} />
            </span>
          )}
          <button type="button" className="chip who-chip" onClick={who} aria-label={p.cloud ? "Выйти" : "Сменить ученика"}>
            <Avatar avatar={p.avatar} size={34} />
            <span>{p.name}</span>
          </button>
        </>
      )}
    </header>
  );
}

export function Cover({ unit, size = 44, color }) {
  const c = UNIT_COVER[unit.id];
  if (c?.text)
    return (
      <span className="ko cover-text" style={{ fontSize: size, color }}>
        {c.text}
      </span>
    );
  if (c?.pic) return <Pic pic={c.pic} size={Math.round(size * 1.15)} />;
  return <Icon name={unit.icon} size={size * 0.8} />;
}

// Nodes zigzag down a centred column, like a path across the map.
const STEP = 150;
const SWAY = [0, 62, 92, 62, 0, -62, -92, -62];
const COL = 380;

function UnitNode({ unit, part, profile, current, x, y, side, go }) {
  const open = isOpen(unit, profile);
  const rec = profile?.units?.[unit.id];
  const done = !!rec?.done;
  const state = current ? "current" : done ? "done" : open ? "open" : unit.soon ? "soon" : "locked";
  const name = `${unit.title.ru}, ${unit.title.ko}`;
  const status = { current: "сейчас", done: `пройден, ${rec?.stars} из 3 звёзд`, open: "открыт", soon: "скоро", locked: "закрыт" }[state];
  return (
    <div className={"node node-" + state} style={{ left: x, top: y, "--c": part.color, "--cd": part.dark, "--cs": part.soft }}>
      {current && (
        <span className={"node-flag " + side} aria-hidden="true">
          {done ? "Ещё раз" : "Начни здесь"}
        </span>
      )}
      <button type="button" className="node-btn" disabled={!open} onClick={() => go("unit", { id: unit.id })} aria-label={`${name}: ${status}`}>
        <Cover unit={unit} size={current ? 46 : 40} color={state === "current" || state === "done" ? "#fff" : state === "open" ? part.color : "#ABA394"} />
        {(state === "locked" || state === "soon") && (
          <span className="node-lock" aria-hidden="true">
            <Icon name="Lock" size={14} />
          </span>
        )}
      </button>
      {done && (
        <span className="node-stars">
          <Stars n={rec.stars} size={15} />
        </span>
      )}
      <span className="node-label" aria-hidden="true">
        <b className="ko">{unit.title.ko}</b>
        <span className="ru">{unit.soon ? "скоро · 준비 중" : unit.title.ru}</span>
      </span>
    </div>
  );
}

const DECOR = {
  A: ["speech-balloon", "open-book", "sparkles"],
  B: ["school", "backpack", "deciduous-tree"],
  C: ["books", "pencil", "straight-ruler"],
};

function PartPath({ part, units, profile, next, go }) {
  const pts = units.map((_, i) => ({ x: COL / 2 + SWAY[i % SWAY.length], y: 60 + i * STEP }));
  const h = 60 + (units.length - 1) * STEP + 110;
  const d = pts.map((p, i) => (i ? `C ${pts[i - 1].x} ${pts[i - 1].y + STEP / 2}, ${p.x} ${p.y - STEP / 2}, ${p.x} ${p.y}` : `M ${p.x} ${p.y}`)).join(" ");
  const doneCount = units.filter((u) => profile?.units?.[u.id]?.done).length;
  const decor = DECOR[part.id];
  return (
    <section className="part" style={{ "--c": part.color, "--cs": part.soft }} aria-label={part.title.ko}>
      <header className="part-head">
        <div className="part-badge">{part.id}</div>
        <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
          <h2 className="ko">{part.title.ko}</h2>
          <span className="ru">{part.title.ru}</span>
        </div>
        <div className="part-progress" aria-label={`Пройдено ${doneCount} из ${units.filter((u) => !u.soon).length}`}>
          <span>
            {doneCount}/{units.filter((u) => !u.soon).length}
          </span>
          <span className="bar">
            <span style={{ width: `${(doneCount / Math.max(1, units.filter((u) => !u.soon).length)) * 100}%` }} />
          </span>
        </div>
      </header>
      <div className="path" style={{ width: COL, height: h }}>
        <svg className="path-line" width={COL} height={h} aria-hidden="true">
          <path d={d} />
        </svg>
        {decor.map((pic, k) => {
          const i = 1 + k * 3;
          if (i >= units.length) return null;
          const side = SWAY[i % SWAY.length] >= 0 ? -1 : 1;
          return <Pic key={pic} pic={pic} size={64} className="path-decor" style={{ left: COL / 2 + side * 150 - 32, top: 60 + i * STEP - 30 }} />;
        })}
        {units.map((u, i) => (
          <UnitNode key={u.id} unit={u} part={part} profile={profile} current={u.id === next.id} x={pts[i].x} y={pts[i].y} side={pts[i].x > COL / 2 ? "left" : "right"} go={go} />
        ))}
      </div>
    </section>
  );
}

function Ring({ value, size = 64, stroke = 8, color = "var(--teal)", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span className="ring-in">{children}</span>
    </span>
  );
}

export default function Home({ go }) {
  const p = useProfile();
  const next = nextUnit(p);
  const part = PARTS.find((x) => x.id === next.part);
  const minutes = p?.minutes?.[today()] || 0;
  const greet = `Привет, ${p?.name || ""}!`;
  const learned = Object.keys(p?.words || {}).length;
  const again = !!p?.units?.[next.id]?.done;
  const due = p ? dueWords(p).length : 0;

  return (
    <>
      <TopBar go={go} />
      <div className="page home">
        <aside className="home-side">
          <section className="hero" style={{ "--c": part.color, "--cd": part.dark, "--cs": part.soft }}>
            <div className="hero-top">
              <Mascot size={84} />
              <button
                type="button"
                className="hero-bubble"
                onClick={() => sayAll([[greet, "ru"], [`오늘은 '${next.title.ko}'${hasBatchim(next.title.ko) ? "을" : "를"} 배워요.`, "ko"]])}
                aria-label="Послушать приветствие"
              >
                <b className="ru">{greet}</b>
                <span className="ru">Сегодня учим: · 오늘 배울 것</span>
                <Icon name="Volume2" size={18} className="hero-bubble-sound" />
              </button>
            </div>
            <div className="hero-unit">
              <span className="hero-cover">
                <Cover unit={next} size={44} color="#fff" />
              </span>
              <div className="col" style={{ gap: 2, minWidth: 0 }}>
                <span className="hero-id">
                  {part.title.ko} · {next.id}
                </span>
                <b className="ko hero-title">{next.title.ko}</b>
                <span className="ru hero-goal">{next.goal?.ru || next.title.ru}</span>
              </div>
            </div>
            {due > 0 && (
              <button type="button" className="review-banner" onClick={() => go("review")}>
                <Pic pic="repeat-button" size={40} />
                <span className="col" style={{ gap: 2, alignItems: "flex-start", flex: 1 }}>
                  <b className="ru">Сначала повторим: {due} {due === 1 ? "слово" : due < 5 ? "слова" : "слов"}</b>
                  <span className="ko">오늘의 복습 · 3분</span>
                </span>
                <Icon name="ChevronRight" size={24} />
              </button>
            )}
            <button type="button" className="btn btn-primary btn-xl" onClick={() => go("unit", { id: next.id })}>
              {again ? "Повторить" : "Учиться"} · {again ? "복습" : "시작"}
              <Icon name="ChevronRight" size={28} />
            </button>
          </section>

          <div className="side-grid">
            <button type="button" className="side-tile" onClick={() => go("tutor")}>
              <Pic pic={UI_PIC.tutor} size={44} />
              <b className="ru">Мишка</b>
              <span className="ru">спросить</span>
            </button>
            <button type="button" className="side-tile" onClick={() => go("words")}>
              <Pic pic={UI_PIC.words} size={44} />
              <b className="ru">Слова</b>
              <span className="ru">{learned} слов</span>
            </button>
            <div className="side-tile today">
              <Ring value={minutes / 15} size={60}>
                <Pic pic={UI_PIC.clock} size={26} />
              </Ring>
              <b className="ru">{minutes} / 15 мин</b>
              <span className="ru">сегодня · 오늘</span>
            </div>
          </div>

          {!p?.cloud && (
            <button type="button" className="teacher-link" onClick={() => go("teacher")}>
              <Pic pic={UI_PIC.teacher} size={26} /> 선생님 · 부모님 화면
              <Icon name="ChevronRight" size={18} />
            </button>
          )}
        </aside>

        <main className="map">
          {PARTS.map((pt) => (
            <PartPath key={pt.id} part={pt} units={UNITS.filter((u) => u.part === pt.id)} profile={p} next={next} go={go} />
          ))}
        </main>
      </div>
    </>
  );
}
