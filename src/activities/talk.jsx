// Speaking for real: the child takes a part in the unit's dialogue, and
// solves small situations by saying something in Korean on their own.
import { useEffect, useRef, useState } from "react";
import { Icon, Mascot, MiniSpeaker, Pic, PicTile, T, useProfile } from "../components/ui.jsx";
import { PEOPLE } from "./basic.jsx";
import { DoneNote, Feedback, Progress, useQuiz } from "./quiz.jsx";
import { PrivacyNote } from "./produce.jsx";
import { Marked, MicButton, MicHint, VoiceFeedback, useVoice } from "./voice.jsx";
import { say, stop } from "../lib/speech.js";
import { logEvent } from "../lib/store.js";

function Who({ who }) {
  const w = PEOPLE[who];
  return (
    <span className="who" style={{ background: w.bg, color: w.fg }} title={w.ru}>
      <Pic pic={w.pic} size={40} />
    </span>
  );
}

// ---------------- role play ----------------

export function RolePlay({ step, unitId, onReady }) {
  const lines = step.lines;
  const p = useProfile();
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [hint, setHint] = useState(p?.help === "none" ? 0 : 1); // 0 Russian only, 1 + first word, 2 whole sentence
  const [misses, setMisses] = useState(0);
  const [talking, setTalking] = useState(-1);
  const end = useRef(null);
  const done = i >= lines.length;
  const cur = lines[Math.min(i, lines.length - 1)];
  const mine = !done && cur.who === "kid";
  const v = useVoice({ unitId, kind: "roleplay", answers: [cur.ko], pass: 0.65 });

  useEffect(() => onReady(false), []);
  useEffect(() => () => stop(), []);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [i, v.result]);

  // The other people speak by themselves; the child's turn waits for them.
  useEffect(() => {
    if (!started) return;
    if (done) {
      onReady(true);
      return;
    }
    v.reset();
    setMisses(0);
    if (cur.who !== "kid") {
      let alive = true;
      setTalking(i);
      say(cur.ko).then(() => alive && setTimeout(() => alive && (setTalking(-1), setI(i + 1)), 450));
      return () => (alive = false);
    }
  }, [i, started]);

  // React to the child's answer.
  useEffect(() => {
    const r = v.result;
    if (!r || !mine) return;
    if (r.self && !r.judged) setHint(2); // comparing needs the whole sentence
    if (r.ok) {
      const t = setTimeout(() => setI(i + 1), 1100);
      return () => clearTimeout(t);
    }
    if (r.said || r.judged) {
      setMisses((m) => m + 1);
      setHint(2);
    }
  }, [v.result]);

  const skip = () => {
    logEvent(unitId, "roleplay", false, { target: cur.ko, skipped: true });
    setI(i + 1);
  };
  const restart = () => {
    setI(0);
    setStarted(true);
  };
  const firstWord = cur.ko.split(" ")[0];

  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between", gap: 12 }}>
        <h2 className="act-title">
          <T ru="Теперь говоришь ты" ko="이제 내가 말해요" />
        </h2>
        <span className="chip" style={{ boxShadow: "none" }}>
          <Pic pic={PEOPLE.kid.pic} size={24} /> Ты — ученик
        </span>
      </div>
      {!started ? (
        <div className="card col" style={{ padding: 24, gap: 16, alignItems: "flex-start" }}>
          <div className="row" style={{ gap: 14 }}>
            <Mascot size={72} />
            <div className="bubble ru" style={{ flex: 1 }}>
              Это тот же разговор, что в начале урока. Только теперь ученика играешь ты! Когда твоя очередь, скажи фразу вслух.
            </div>
          </div>
          <PrivacyNote />
          <button type="button" className="btn btn-primary btn-xl" onClick={restart}>
            <Icon name="Play" size={26} /> Начать · 시작
          </button>
        </div>
      ) : (
        <>
          <div className="col" style={{ gap: 14 }}>
            {lines.slice(0, i).map((l, k) => (
              <div key={k} className={"scene-line" + (l.who === "kid" ? " right" : "")}>
                <Who who={l.who} />
                <button type="button" className="scene-bubble" onClick={() => say(l.ko)}>
                  <div className="ko">{l.ko}</div>
                </button>
              </div>
            ))}
            {!done && !mine && (
              <div className="scene-line">
                <Who who={cur.who} />
                <div className={"scene-bubble" + (talking === i ? " active" : "")}>
                  <div className="ko">{cur.ko}</div>
                </div>
              </div>
            )}
          </div>
          {mine && (
            <div className="card col turn-card fade-in" style={{ gap: 14 }}>
              <div className="row wrap" style={{ gap: 10 }}>
                <span className="chip turn-chip">
                  <Icon name="Mic" size={18} /> Твоя очередь
                </span>
                <b className="ru" style={{ fontSize: 20 }}>Скажи: «{cur.ru}»</b>
              </div>
              <div className="ko turn-text">
                {hint === 2 ? <Marked text={cur.ko} parts={v.result?.parts} /> : hint === 1 ? `${firstWord} …` : "…"}
              </div>
              <div className="row wrap" style={{ gap: 18, justifyContent: "center" }}>
                <MicButton v={v} />
                <MicHint v={v} idle="Нажми и скажи" />
              </div>
              <div className="row wrap" style={{ gap: 10 }}>
                {hint < 2 && (
                  <button type="button" className="btn btn-ghost" onClick={() => setHint(2)}>
                    <Icon name="Lightbulb" size={18} /> Подсказка
                  </button>
                )}
                <MiniSpeaker text={cur.ko} label="Как сказать" />
                {misses >= 2 && (
                  <button type="button" className="btn btn-ghost" onClick={skip}>
                    Дальше <Icon name="ChevronRight" size={18} />
                  </button>
                )}
              </div>
              <VoiceFeedback v={v} model={cur.ko} goodText="Отлично! Тебя поняли." />
            </div>
          )}
          {done && (
            <div className="col" style={{ gap: 12 }}>
              <DoneNote />
              <button type="button" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={restart}>
                <Icon name="RotateCcw" size={20} /> Сыграть ещё раз
              </button>
            </div>
          )}
          <div ref={end} />
        </>
      )}
    </div>
  );
}

// ---------------- missions ----------------

export function Mission({ step, unitId, onScore, onReady }) {
  const q = step.q;
  const quiz = useQuiz(q.length, { onScore, onReady, unitId, kind: "mission" });
  const cur = q[Math.min(quiz.i, q.length - 1)];
  const answers = [cur.answer, ...(cur.alt || [])];
  const v = useVoice({ unitId, kind: "mission", answers, keys: cur.keys, pass: 0.7, log: false });
  const [hint, setHint] = useState(false);

  useEffect(() => {
    v.reset();
    setHint(false);
  }, [quiz.i]);
  useEffect(() => {
    const r = v.result;
    if (!r || quiz.state === "good") return;
    if (r.self && !r.judged) return;
    quiz.answer(!!r.ok, { mission: cur.ru, said: r.said, score: r.score != null ? Math.round(r.score * 100) : null, self: !!r.self });
  }, [v.result]);

  const showModel = quiz.state === "miss" || quiz.state === "good" || (v.result?.self && !v.result.judged);

  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between" }}>
        <h2 className="act-title">
          <T ru={step.title?.ru || "Миссия: скажи сам"} ko={step.title?.ko || "미션: 내가 말해요"} />
        </h2>
        <Progress i={quiz.i} total={q.length} />
      </div>
      {quiz.state === "done" ? (
        <DoneNote />
      ) : (
        <>
          <div className="card mission-card">
            <PicTile icon={cur.icon} ko={cur.word} size={96} tone="amber" />
            <div className="col" style={{ gap: 6, flex: 1 }}>
              <span className="chip turn-chip" style={{ alignSelf: "flex-start" }}>
                <Icon name="Target" size={18} /> Миссия {quiz.i + 1}
              </span>
              <b className="ru mission-text">{cur.ru}</b>
              <span className="t-sub ru">Скажи это по-корейски. Своими словами тоже можно!</span>
            </div>
            <MiniSpeaker text={cur.ru} lang="ru" label="Прочитать вслух" />
          </div>
          <div className="row wrap" style={{ gap: 22, justifyContent: "center" }}>
            <MicButton v={v} size={124} />
            <MicHint v={v} idle="Нажми и скажи по-корейски" />
          </div>
          {!showModel && (
            <div className="row wrap" style={{ gap: 10 }}>
              {!hint ? (
                <button type="button" className="btn btn-ghost" onClick={() => setHint(true)}>
                  <Icon name="Lightbulb" size={18} /> Подсказка
                </button>
              ) : (
                <div className="hint-box">
                  <span className="ru">Начни так:</span> <b className="ko">{cur.hint || cur.answer.split(" ").slice(0, -1).join(" ") + " …"}</b>
                </div>
              )}
            </div>
          )}
          {showModel && (
            <div className="card row wrap model-answer fade-in" style={{ gap: 12 }}>
              <span className="ru muted">Можно сказать так:</span>
              <b className="ko" style={{ fontSize: 26 }}>
                <Marked text={v.result?.target || cur.answer} parts={quiz.state === "miss" ? v.result?.parts : null} />
              </b>
              <MiniSpeaker text={v.result?.target || cur.answer} />
            </div>
          )}
          {v.result && !(quiz.state === "good" && !v.result.tips?.length) && <VoiceFeedback v={v} model={cur.answer} goodText="Отлично! Тебя поняли." />}
          {quiz.state === "good" && <Feedback state="good" praise={quiz.praise} />}
          {quiz.state === "miss" && (
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost" onClick={() => quiz.answer(true, { mission: cur.ru, gaveUp: true })}>
                Дальше <Icon name="ChevronRight" size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
