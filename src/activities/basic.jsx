// Activities that introduce: a short explanation, word cards and a dialog.
import { useEffect, useState } from "react";
import { Icon, Meaning, MiniSpeaker, Mascot, Pic, PicTile, Speaker, T, useProfile, useReadAloud } from "../components/ui.jsx";
import { say, sayAll } from "../lib/speech.js";

export function Intro({ step, onReady }) {
  useEffect(() => onReady(true), []);
  useReadAloud(step.blocks.map((b) => b.ru).join(" "));
  const p = useProfile();
  return (
    <div className="col fade-in" style={{ gap: 20 }}>
      <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
        <Mascot size={88} />
        <div className="col" style={{ flex: 1, gap: 12 }}>
          <h2 className="act-title">
            <T ru={step.title.ru} ko={step.title.ko} />
          </h2>
          {step.blocks.map((b, i) => (
            <div key={i} className="bubble">
              {p?.help === "none" && b.ko ? b.ko : <span className="ru">{b.ru}</span>}
              {p?.help !== "many" && p?.help !== "none" && b.ko ? <div className="t-sub">{b.ko}</div> : null}
            </div>
          ))}
        </div>
      </div>
      {step.show && (
        <div className="card" style={{ padding: 20 }}>
          <div className="t-sub ru" style={{ marginBottom: 10 }}>
            Нажми, чтобы услышать
          </div>
          <div className="row wrap" style={{ gap: 10 }}>
            {step.show.map((s) => (
              <button key={s} type="button" className="tile" onClick={() => say(s)} style={{ minWidth: 72 }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Learn({ step, onReady, onWords }) {
  const [heard, setHeard] = useState({});
  useEffect(() => onReady(true), []);
  useEffect(() => {
    if (!step.jamo) onWords?.(step.items);
  }, []);
  const hear = (it) => {
    say(it.ko);
    setHeard((h) => ({ ...h, [it.ko]: true }));
  };
  const all = Object.keys(heard).length;
  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between" }}>
        <h2 className="act-title">
          <T ru={step.title?.ru || "Нажми на каждую карточку и послушай"} ko={step.title?.ko || "카드를 눌러서 들어 보세요"} />
        </h2>
        <span className="chip" style={{ boxShadow: "none" }}>
          <Icon name="Ear" size={18} /> {all} / {step.items.length}
        </span>
      </div>
      <div className="learn-grid">
        {step.items.map((it) => (
          <button key={it.ko + (it.glyph || "")} type="button" className={"learn-card" + (heard[it.ko] ? " heard" : "")} onClick={() => hear(it)}>
            {step.jamo ? (
              <div className="row" style={{ gap: 16, alignItems: "center" }}>
                <span className="glyph">{it.glyph}</span>
                <span className="ko" style={{ fontSize: 40, color: "var(--muted)" }}>
                  {it.ko}
                </span>
              </div>
            ) : (
              <div className="row" style={{ gap: 14 }}>
                {it.icon && <PicTile icon={it.icon} ko={it.ko} size={64} />}
                <span className="ko">{it.ko}</span>
              </div>
            )}
            {step.jamo ? <span className="ru" style={{ fontSize: 15 }}>{it.ru}</span> : <Meaning ru={it.ru} />}
            <span className="row" style={{ gap: 8, color: "var(--teal-d)", fontSize: 14, fontWeight: 700 }}>
              <Icon name="Volume2" size={18} />
              {heard[it.ko] ? <Icon name="Check" size={18} /> : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const PEOPLE = {
  teacher: { icon: "GraduationCap", pic: "woman-teacher", bg: "#E8ECF7", fg: "#3B4A7A", ru: "Учитель", ko: "선생님" },
  nurse: { icon: "Stethoscope", pic: "health-worker", bg: "#E3F2EE", fg: "#0B5A54", ru: "Медсестра", ko: "보건 선생님" },
  friend: { icon: "Smile", pic: "boy", bg: "#FDE68A", fg: "#1F2A44", ru: "Одноклассник", ko: "친구" },
  kid: { icon: "User", pic: "girl", bg: "#BAE6FD", fg: "#1F2A44", ru: "Ученик", ko: "나" },
};

export function Scene({ step, onReady }) {
  const p = useProfile();
  const [active, setActive] = useState(-1);
  const [played, setPlayed] = useState(false);
  useEffect(() => onReady(true), []);
  useReadAloud(step.note?.ru);
  const playAll = async () => {
    for (let i = 0; i < step.lines.length; i++) {
      setActive(i);
      await say(step.lines[i].ko);
      await new Promise((r) => setTimeout(r, 250));
    }
    setActive(-1);
    setPlayed(true);
  };
  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ gap: 16 }}>
        <Mascot size={72} />
        <div className="col" style={{ flex: 1, gap: 4, minWidth: 220 }}>
          <h2 className="act-title">
            <T ru={step.title.ru} ko={step.title.ko} />
          </h2>
          {step.note && p?.help !== "none" && <div className="ru muted">{step.note.ru}</div>}
        </div>
      </div>
      <div className="col" style={{ gap: 14 }}>
        {step.lines.map((l, i) => {
          const who = PEOPLE[l.who];
          return (
            <div key={i} className={"scene-line" + (l.who === "kid" ? " right" : "")}>
              <span className="who" style={{ background: who.bg, color: who.fg }} title={who.ru}>
                {who.pic ? <Pic pic={who.pic} size={40} /> : <Icon name={who.icon} size={26} />}
              </span>
              <button type="button" className={"scene-bubble" + (active === i ? " active" : "")} onClick={() => (setActive(i), say(l.ko).then(() => setActive(-1)))}>
                <div className="ko">{l.ko}</div>
                <Meaning ru={l.ru} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="row">
        <button type="button" className="btn btn-teal" onClick={playAll}>
          <Icon name="Play" size={22} />
          {played ? "Ещё раз" : "Слушать весь диалог"}
        </button>
      </div>
    </div>
  );
}
