// Activities that introduce: a short explanation, word cards and a dialog.
import { useEffect, useState } from "react";
import { Icon, Meaning, MiniSpeaker, Mascot, Pic, PicTile, Speaker, T, useProfile, useReadAloud } from "../components/ui.jsx";
import { say, sayAll } from "../lib/speech.js";

// One idea per slide, read aloud in Russian, with something to look at and
// tap: letters adding up (eq), tiles to hear (show), a sentence pattern with
// the changing part marked (pattern) and examples with pictures (ex).
// A unit can also carry a short video (step.video, a YouTube id).
export function Intro({ step, onReady }) {
  const p = useProfile();
  const blocks = step.blocks.map((b, i) => (i === step.blocks.length - 1 && step.show && !b.show ? { ...b, show: step.show } : b));
  const [k, setK] = useState(0);
  const b = blocks[k];
  const last = k === blocks.length - 1;
  useEffect(() => onReady(blocks.length === 1), []);
  useEffect(() => {
    if (last) onReady(true);
  }, [k]);
  useReadAloud(b.ru);
  const text = p?.help === "none" && b.ko ? b.ko : b.ru;
  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between", gap: 12 }}>
        <h2 className="act-title">
          <T ru={step.title.ru} ko={step.title.ko} />
        </h2>
        {blocks.length > 1 && (
          <span className="slide-dots" aria-label={`${k + 1} / ${blocks.length}`}>
            {blocks.map((_, i) => (
              <button key={i} type="button" className={i === k ? "on" : i < k ? "seen" : ""} onClick={() => setK(i)} aria-label={String(i + 1)} />
            ))}
          </span>
        )}
      </div>
      <div key={k} className="card col slide fade-in">
        <div className="row" style={{ alignItems: "flex-start", gap: 14 }}>
          <Mascot size={72} mood={b.eq || b.pattern ? "think" : "happy"} />
          <div className="col" style={{ flex: 1, gap: 6 }}>
            <div className={"slide-text " + (text === b.ru ? "ru" : "ko")}>{text}</div>
            {p?.help !== "many" && p?.help !== "none" && b.ko && <div className="t-sub">{b.ko}</div>}
          </div>
          <button type="button" className="btn btn-ghost icon-btn" aria-label="Ещё раз" onClick={() => sayAll([[b.ru, "ru"]])}>
            <Icon name="Volume2" size={22} />
          </button>
        </div>
        {b.eq && <Equation eq={b.eq} />}
        {b.pattern && <Pattern parts={b.pattern} />}
        {b.ex && (
          <div className="slide-ex">
            {b.ex.map((x) => (
              <button key={x.ko} type="button" className="slide-ex-row" onClick={() => say(x.ko)}>
                {x.icon && <PicTile icon={x.icon} ko={x.ko} size={56} />}
                <span className="col" style={{ gap: 2, alignItems: "flex-start" }}>
                  <span className="ko" style={{ fontSize: 24, fontWeight: 700 }}>{x.ko}</span>
                  {x.ru && <span className="ru muted">{x.ru}</span>}
                </span>
                <Icon name="Volume2" size={20} style={{ marginLeft: "auto", color: "var(--teal-d)" }} />
              </button>
            ))}
          </div>
        )}
        {b.show && (
          <div className="row wrap" style={{ gap: 10 }}>
            {b.show.map((x) => (
              <button key={x} type="button" className="tile" onClick={() => say(x)} style={{ minWidth: 72 }}>
                {x}
              </button>
            ))}
          </div>
        )}
      </div>
      {step.video && last && <Video id={step.video} />}
      {blocks.length > 1 && (
        <div className="row" style={{ gap: 10 }}>
          {k > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => setK(k - 1)}>
              <Icon name="ChevronLeft" size={20} /> Назад
            </button>
          )}
          {!last && (
            <button type="button" className="btn btn-teal" onClick={() => setK(k + 1)}>
              Понятно, дальше <Icon name="ChevronRight" size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ㄱ + ㅏ = 가: the parts slide together into the result.
function Equation({ eq }) {
  const parts = eq.slice(0, -1);
  const res = eq[eq.length - 1];
  return (
    <button type="button" className="eq" onClick={() => say(res)} aria-label={eq.join(" ")}>
      {parts.map((x, i) => (
        <span key={i} className="row" style={{ gap: 10 }}>
          {i > 0 && <span className="eq-op">+</span>}
          <span className="eq-part ko" style={{ animationDelay: `${i * 0.25}s` }}>{x}</span>
        </span>
      ))}
      <span className="eq-op">=</span>
      <span className="eq-res ko">{res}</span>
    </button>
  );
}

// A sentence with the word that changes in a dashed box and the ending in
// colour: [저는] [알리나] [예요].
function Pattern({ parts }) {
  const full = parts.map((x) => x.t).join("");
  return (
    <button type="button" className="pattern" onClick={() => say(full)}>
      {parts.map((x, i) => (
        <span key={i} className={"pattern-part ko " + (x.c || "")}>
          {x.t.trim()}
          {x.ru && <small className="ru">{x.ru}</small>}
        </span>
      ))}
    </button>
  );
}

function Video({ id }) {
  const [on, setOn] = useState(false);
  return on ? (
    <div className="video">
      <iframe src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`} title="video" allow="encrypted-media; picture-in-picture" allowFullScreen />
    </div>
  ) : (
    <button type="button" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={() => setOn(true)}>
      <Icon name="Play" size={20} /> Посмотреть видео
    </button>
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
