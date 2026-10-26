// Question-by-question activities. A wrong answer never costs anything
// except the "first try" star count; the child tries again until it is right.
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, Meaning, MiniSpeaker, Mascot, PicTile, Speaker, T, shuffled, useProfile, useReadAloud } from "../components/ui.jsx";
import { say } from "../lib/speech.js";
import { compose } from "../lib/hangul.js";
import { logEvent } from "../lib/store.js";
import { sfx } from "../lib/sfx.js";

const PRAISE = [
  ["Молодец!", "잘했어요!"],
  ["Отлично!", "좋아요!"],
  ["Верно!", "맞아요!"],
  ["Супер!", "최고예요!"],
];

export function useQuiz(total, { onScore, onReady, unitId, kind }) {
  const [i, setI] = useState(0);
  const [state, setState] = useState("idle"); // idle | good | miss | done
  const missed = useRef(false);
  const first = useRef(0);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const answer = (ok, detail) => {
    if (state === "good" || state === "done") return;
    logEvent(unitId, kind, ok, detail);
    if (!ok) {
      missed.current = true;
      sfx.miss();
      setState("miss");
      return;
    }
    sfx.good();
    if (!missed.current) first.current++;
    setState("good");
    timer.current = setTimeout(() => {
      missed.current = false;
      if (i + 1 >= total) {
        setState("done");
        onScore?.(total, first.current);
        onReady(true);
      } else {
        setI(i + 1);
        setState("idle");
      }
    }, 950);
  };
  return { i, state, answer, praise: PRAISE[i % PRAISE.length] };
}

export function Progress({ i, total }) {
  return (
    <span className="chip" style={{ boxShadow: "none" }}>
      {Math.min(i + 1, total)} / {total}
    </span>
  );
}

export function Feedback({ state, praise, missText }) {
  if (state === "good")
    return (
      <div className="feedback good" role="status">
        <Mascot size={52} mood="wow" />
        <b className="feedback-text">
          <T ru={praise[0]} ko={praise[1]} />
        </b>
      </div>
    );
  if (state === "miss")
    return (
      <div className="feedback try" role="status">
        <Mascot size={52} mood="think" />
        <b className="feedback-text">
          <T ru={missText?.[0] || "Почти! Попробуй ещё раз."} ko={missText?.[1] || "다시 해 볼까요?"} />
        </b>
      </div>
    );
  return <div style={{ minHeight: 76 }} aria-hidden="true" />;
}

export function DoneNote() {
  return (
    <div className="feedback good" role="status">
      <Mascot size={52} mood="wow" />
      <b className="feedback-text">
        <T ru="Готово! Нажми «Дальше»." ko="다 했어요! '다음'을 누르세요." />
      </b>
    </div>
  );
}

function optState(state, isAnswer, picked, key) {
  if (state === "good" && isAnswer) return " good";
  if (state === "miss" && picked === key) return " miss";
  if (state === "good") return " dim";
  return "";
}

// Hear a sound or word, pick the right card.
export function Listen({ step, unitId, onScore, onReady }) {
  const q = step.q;
  const quiz = useQuiz(q.length, { onScore, onReady, unitId, kind: "listen" });
  const [picked, setPicked] = useState(null);
  const p = useProfile();
  const cur = q[Math.min(quiz.i, q.length - 1)];
  const opts = useMemo(() => shuffled(cur.options), [cur]);
  useEffect(() => setPicked(null), [quiz.i]);
  useReadAloud(quiz.i === 0 ? (step.title?.ru || "Послушай и выбери") : null);
  const optKey = (o) => (typeof o === "string" ? o : o.ko);

  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between" }}>
        <h2 className="act-title">
          <T ru={step.title?.ru || "Послушай и выбери"} ko={step.title?.ko || "듣고 고르세요"} />
        </h2>
        <Progress i={quiz.i} total={q.length} />
      </div>
      {step.note && p?.help !== "none" && quiz.i === 0 && <div className="bubble ru">{step.note.ru}</div>}
      <div className="row" style={{ justifyContent: "center", gap: 20, padding: "8px 0" }}>
        <Speaker key={quiz.i} text={cur.say} size={128} autoPlay />
        <Speaker text={cur.say} size={68} slow label="Медленно" />
      </div>
      {quiz.state === "done" ? (
        <DoneNote />
      ) : (
        <>
          <div className="options">
            {opts.map((o) => {
              const k = optKey(o);
              const isAns = k === cur.say || (typeof o !== "string" && cur.say.startsWith(o.ko));
              return (
                <button
                  key={k}
                  type="button"
                  className={"opt" + (step.pictures ? " pic" : "") + optState(quiz.state, isAns, picked, k)}
                  onClick={() => {
                    setPicked(k);
                    quiz.answer(isAns, { say: cur.say, picked: k });
                  }}
                >
                  {typeof o === "string" ? (
                    <span className="ko">{o}</span>
                  ) : (
                    <>
                      <PicTile icon={o.icon} ko={o.ko} size={92} />
                      {o.label && p?.help !== "none" ? <span className="ru muted">{o.label}</span> : null}
                      {p?.help === "none" || quiz.state === "good" ? <span className="ko" style={{ fontSize: 22 }}>{o.ko}</span> : null}
                    </>
                  )}
                </button>
              );
            })}
          </div>
          <Feedback state={quiz.state} praise={quiz.praise} missText={["Почти! Послушай ещё раз.", "다시 들어 볼까요?"]} />
        </>
      )}
    </div>
  );
}

// Read Korean (or hear it), pick the meaning or the right spelling.
export function Read({ step, unitId, onScore, onReady }) {
  const q = step.q;
  const quiz = useQuiz(q.length, { onScore, onReady, unitId, kind: "read" });
  const [picked, setPicked] = useState(null);
  const cur = q[Math.min(quiz.i, q.length - 1)];
  useEffect(() => setPicked(null), [quiz.i]);
  useEffect(() => {
    if (step.sayFirst && quiz.state !== "done") {
      const t = setTimeout(() => say(cur.ko), 350);
      return () => clearTimeout(t);
    }
  }, [quiz.i]);
  const opts = useMemo(() => cur.options.map((o, idx) => ({ o, idx })), [cur]);

  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between" }}>
        <h2 className="act-title">
          <T ru={step.title?.ru || "Прочитай и выбери значение"} ko={step.title?.ko || "읽고 뜻을 고르세요"} />
        </h2>
        <Progress i={quiz.i} total={q.length} />
      </div>
      {quiz.state === "done" ? (
        <DoneNote />
      ) : (
        <>
          <div className="card row" style={{ padding: "26px 24px", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
            {cur.spelling ? (
              <>
                <Speaker text={cur.ko} size={96} />
                <span className="ru" style={{ fontSize: 22 }}>{cur.ru}</span>
              </>
            ) : (
              <>
                <span className="ko" style={{ fontSize: "clamp(44px, 7vw, 72px)" }}>{cur.ko}</span>
                {quiz.state === "good" && <MiniSpeaker text={cur.ko} />}
              </>
            )}
          </div>
          <div className="options">
            {opts.map(({ o, idx }) => (
              <button
                key={o}
                type="button"
                className={"opt" + optState(quiz.state, idx === cur.answer, picked, idx)}
                onClick={() => {
                  setPicked(idx);
                  quiz.answer(idx === cur.answer, { ko: cur.ko, picked: o });
                  if (idx === cur.answer) say(cur.ko);
                }}
              >
                <span className={cur.spelling ? "ko" : "ru"} style={cur.spelling ? undefined : { fontSize: 20, fontWeight: 700 }}>
                  {o}
                </span>
              </button>
            ))}
          </div>
          <Feedback state={quiz.state} praise={quiz.praise} />
        </>
      )}
    </div>
  );
}

// A small situation in Russian, pick what to say in Korean.
export function Choose({ step, unitId, onScore, onReady }) {
  const q = step.q;
  const quiz = useQuiz(q.length, { onScore, onReady, unitId, kind: "choose" });
  const [picked, setPicked] = useState(null);
  const p = useProfile();
  const cur = q[Math.min(quiz.i, q.length - 1)];
  useEffect(() => setPicked(null), [quiz.i]);
  useReadAloud(quiz.state !== "done" ? cur.prompt.ru : null);
  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between" }}>
        <h2 className="act-title">
          <T ru={step.title?.ru || "Что ты скажешь?"} ko={step.title?.ko || "뭐라고 말해요?"} />
        </h2>
        <Progress i={quiz.i} total={q.length} />
      </div>
      {step.note && p?.help !== "none" && quiz.i === 0 && <div className="bubble ru">{step.note.ru}</div>}
      {quiz.state === "done" ? (
        <DoneNote />
      ) : (
        <>
          <div className="card row" style={{ padding: 22, gap: 18 }}>
            <PicTile icon={cur.prompt.icon} size={88} tone="navy" />
            <div className="ru" style={{ fontSize: 22, fontWeight: 700, flex: 1 }}>
              {cur.prompt.ru}
            </div>
          </div>
          <div className="options">
            {cur.options.map((o, idx) => (
              <div key={o} style={{ position: "relative" }}>
                <button
                  type="button"
                  className={"opt" + optState(quiz.state, idx === cur.answer, picked, idx)}
                  style={{ width: "100%" }}
                  onClick={() => {
                    setPicked(idx);
                    say(o);
                    quiz.answer(idx === cur.answer, { prompt: cur.prompt.ru, picked: o });
                  }}
                >
                  <span className="ko" style={{ fontSize: "clamp(24px, 3.4vw, 34px)" }}>{o}</span>
                </button>
              </div>
            ))}
          </div>
          <Feedback state={quiz.state} praise={quiz.praise} />
        </>
      )}
    </div>
  );
}

// 받침 rule practice: pick the ending that fits the word.
export function Grammar({ step, unitId, onScore, onReady }) {
  const q = step.q;
  const quiz = useQuiz(q.length, { onScore, onReady, unitId, kind: "grammar" });
  const [picked, setPicked] = useState(null);
  const p = useProfile();
  const cur = q[Math.min(quiz.i, q.length - 1)];
  useEffect(() => setPicked(null), [quiz.i]);
  const last = [...cur.word].pop();
  const full = cur.word + (quiz.state === "good" ? cur.answer : "___") + (step.suffix || "");
  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between" }}>
        <h2 className="act-title">
          <T ru={step.title.ru} ko={step.title.ko} />
        </h2>
        <Progress i={quiz.i} total={q.length} />
      </div>
      <div className="card col" style={{ padding: 20, gap: 12, background: "var(--navy-soft)", boxShadow: "none" }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>
          <T ru={step.rule.ru} ko={step.rule.ko} />
        </div>
        <div className="row wrap" style={{ gap: 10 }}>
          {step.examples.map((e) => (
            <button key={e.ko} type="button" className="tile" onClick={() => say(e.ko)} style={{ fontSize: 22 }}>
              {e.ko}
              {p?.help === "many" && <span className="t-sub ru" style={{ display: "block", fontFamily: "Nunito", fontSize: 13 }}>{e.ru}</span>}
            </button>
          ))}
        </div>
      </div>
      {quiz.state === "done" ? (
        <DoneNote />
      ) : (
        <>
          <div className="card" style={{ padding: "26px 24px", textAlign: "center" }}>
            <span className="ko" style={{ fontSize: "clamp(36px, 6vw, 60px)" }}>
              {cur.word.slice(0, -1)}
              <span style={{ color: "var(--coral)", borderBottom: "4px solid var(--amber)" }}>{last}</span>
              <span style={{ color: quiz.state === "good" ? "var(--good)" : "var(--faint)" }}>{full.slice(cur.word.length)}</span>
            </span>
          </div>
          <div className="options" style={{ gridTemplateColumns: `repeat(${step.options.length}, minmax(0, 1fr))` }}>
            {step.options.map((o) => (
              <button
                key={o}
                type="button"
                className={"opt" + optState(quiz.state, o === cur.answer, picked, o)}
                onClick={() => {
                  setPicked(o);
                  quiz.answer(o === cur.answer, { word: cur.word, picked: o });
                  if (o === cur.answer) say(cur.word + o + (step.suffix || ""));
                }}
              >
                <span className="ko">{o}</span>
              </button>
            ))}
          </div>
          <Feedback state={quiz.state} praise={quiz.praise} missText={["Посмотри на последний слог: есть буква снизу?", "마지막 글자에 받침이 있어요?"]} />
        </>
      )}
    </div>
  );
}

// Hear a syllable, build it from jamo.
export function Build({ step, unitId, onScore, onReady }) {
  const q = step.q;
  const quiz = useQuiz(q.length, { onScore, onReady, unitId, kind: "build" });
  const [cho, setCho] = useState(null);
  const [jung, setJung] = useState(null);
  const [jong, setJong] = useState("");
  const cur = q[Math.min(quiz.i, q.length - 1)];
  useEffect(() => {
    setCho(null);
    setJung(null);
    setJong("");
  }, [quiz.i]);
  const built = cho && jung ? compose(cho, jung, jong) : "";
  const ready = !!built;
  const check = () => {
    quiz.answer(built === cur, { target: cur, built });
    say(built);
  };
  const Pad = ({ list, value, set, label }) => (
    <div className="col" style={{ gap: 8 }}>
      <div className="t-sub ru">{label}</div>
      <div className="row wrap" style={{ gap: 8 }}>
        {list.map((j) => (
          <button
            key={j || "none"}
            type="button"
            className="tile"
            aria-pressed={value === j}
            style={{ minWidth: 64, textAlign: "center", ...(value === j ? { background: "var(--amber-soft)", borderColor: "var(--warn)" } : {}) }}
            onClick={() => set(j)}
          >
            {j || "—"}
          </button>
        ))}
      </div>
    </div>
  );
  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between" }}>
        <h2 className="act-title">
          <T ru={step.title.ru} ko={step.title.ko} />
        </h2>
        <Progress i={quiz.i} total={q.length} />
      </div>
      {quiz.state === "done" ? (
        <DoneNote />
      ) : (
        <>
          <div className="row wrap" style={{ gap: 24, justifyContent: "center" }}>
            <Speaker key={quiz.i} text={cur} size={112} autoPlay />
            <div className="card" style={{ width: 150, height: 150, display: "grid", placeItems: "center", border: quiz.state === "good" ? "4px solid var(--good)" : "4px dashed var(--line-strong)", boxShadow: "none" }}>
              <span className="ko" style={{ fontSize: 88, lineHeight: 1, color: built ? "var(--ink)" : "var(--line-strong)" }}>{built || "?"}</span>
            </div>
          </div>
          <div className="card col" style={{ padding: 20, gap: 16 }}>
            <Pad list={step.cho} value={cho} set={setCho} label="Согласная · 자음" />
            <Pad list={step.jung} value={jung} set={setJung} label="Гласная · 모음" />
            {step.jong && <Pad list={step.jong} value={jong} set={setJong} label="Патчим · 받침" />}
          </div>
          <div className="row wrap" style={{ justifyContent: "space-between" }}>
            <Feedback state={quiz.state} praise={quiz.praise} missText={["Звучит иначе. Послушай ещё раз.", "소리가 달라요. 다시 들어 볼까요?"]} />
            <button type="button" className="btn btn-teal" disabled={!ready || quiz.state === "good"} onClick={check}>
              <Icon name="Check" size={22} /> Проверить
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Classroom instructions: actually do what the textbook asks.
export function Task({ step, unitId, onScore, onReady }) {
  const q = step.q;
  const quiz = useQuiz(q.length, { onScore, onReady, unitId, kind: "task" });
  const [picked, setPicked] = useState(null);
  const p = useProfile();
  const cur = q[Math.min(quiz.i, q.length - 1)];
  useEffect(() => setPicked(null), [quiz.i]);
  useEffect(() => {
    if (quiz.state !== "done") {
      const t = setTimeout(() => say(cur.ko), 400);
      return () => clearTimeout(t);
    }
  }, [quiz.i]);
  const pick = (k, ok) => {
    setPicked(k);
    quiz.answer(ok, { task: cur.ko, picked: k });
  };
  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between" }}>
        <h2 className="act-title">
          <T ru={step.title.ru} ko={step.title.ko} />
        </h2>
        <Progress i={quiz.i} total={q.length} />
      </div>
      {quiz.state === "done" ? (
        <DoneNote />
      ) : (
        <>
          <div className="card col" style={{ padding: 22, gap: 6, borderLeft: "0", background: "#FFFDF8" }}>
            <div className="row" style={{ gap: 10 }}>
              <span className="chip" style={{ background: "var(--navy)", color: "#fff", height: 32, padding: "0 12px", boxShadow: "none" }}>
                {quiz.i + 1}
              </span>
              <span className="ko" style={{ fontSize: "clamp(22px, 3vw, 30px)" }}>{cur.ko}</span>
              <MiniSpeaker text={cur.ko} />
            </div>
            {p?.help !== "none" && <Meaning ru={cur.ru} />}
          </div>
          <div className="card" style={{ padding: 24 }}>
            {cur.kind === "circle" && (
              <div className="options">
                {cur.options.map((o) => {
                  const good = quiz.state === "good" && o.id === cur.answer;
                  return (
                    <button key={o.id} type="button" className={"opt pic" + (picked === o.id && quiz.state === "miss" ? " miss" : "")} onClick={() => pick(o.id, o.id === cur.answer)} style={{ position: "relative" }}>
                      <PicTile icon={o.icon} ko={o.ko} size={96} tone="amber" />
                      <span className="ko" style={{ fontSize: 22 }}>{o.ko}</span>
                      {good && (
                        <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: -6, width: "calc(100% + 12px)", height: "calc(100% + 12px)" }} aria-hidden="true">
                          <ellipse cx="50" cy="50" rx="46" ry="44" fill="none" stroke="#C2410C" strokeWidth="3.5" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "draw 0.5s forwards" }} />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {cur.kind === "underline" && (
              <div className="row wrap" style={{ gap: 14, justifyContent: "center", padding: "20px 0" }}>
                {cur.tokens.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="ko"
                    onClick={() => pick(idx, idx === cur.answer)}
                    style={{
                      fontSize: "clamp(34px, 5vw, 52px)",
                      padding: "0 6px",
                      borderBottom: quiz.state === "good" && idx === cur.answer ? "6px solid var(--coral)" : picked === idx && quiz.state === "miss" ? "6px dashed var(--warn)" : "6px solid transparent",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            {cur.kind === "fill" && (
              <div className="options">
                {cur.options.map((o, idx) => (
                  <button key={o} type="button" className={"opt" + optState(quiz.state, idx === cur.answer, picked, idx)} onClick={() => pick(idx, idx === cur.answer)}>
                    <span className="ko">{o}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Feedback state={quiz.state} praise={quiz.praise} />
        </>
      )}
    </div>
  );
}
