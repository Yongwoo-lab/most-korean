// "Поговори с Мишкой · 미샤랑 이야기해요": the bear asks four questions with
// the words of a finished unit and the child answers out loud. No AI model
// is needed, so it works on any computer in the centre.
import { useEffect, useRef, useState } from "react";
import { TopBar } from "./Home.jsx";
import { Icon, Mascot, MiniSpeaker, Pic, PicTile, useProfile } from "../components/ui.jsx";
import { Marked, MicButton, MicHint, VoiceFeedback, useVoice } from "../activities/voice.jsx";
import { PrivacyNote } from "../activities/produce.jsx";
import { PEOPLE } from "../activities/basic.jsx";
import { UNITS } from "../data/course.js";
import { CHATS } from "../data/chats.js";
import { say, stop } from "../lib/speech.js";
import { addMinutes, logEvent } from "../lib/store.js";

const KID = PEOPLE.kid;
// Мишка's answer when the child skipped a question.
export const LATER = "괜찮아요! 다음에 또 해요.";

function BearLine({ ko, ru, show, active }) {
  return (
    <div className="scene-line">
      <span className="who chat-bear">
        <Mascot size={44} />
      </span>
      <button type="button" className={"scene-bubble" + (active ? " active" : "")} onClick={() => say(ko)}>
        {show && <PicTile icon={show.icon} ko={show.ko} size={84} />}
        <div className="ko">{ko}</div>
        {ru && <div className="ru t-sub">{ru}</div>}
      </button>
    </div>
  );
}

function KidLine({ ko }) {
  return (
    <div className="scene-line right">
      <span className="who" style={{ background: KID.bg, color: KID.fg }}>
        <Pic pic={KID.pic} size={40} />
      </span>
      <button type="button" className="scene-bubble" onClick={() => say(ko)}>
        <div className="ko">{ko}</div>
      </button>
    </div>
  );
}

function Talk({ unit, go }) {
  const turns = CHATS[unit.id];
  const p = useProfile();
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState("ask"); // ask | answer | reply
  const [said, setSaid] = useState([]); // per turn: { ko: sentence shown for the child, ok }
  const [hint, setHint] = useState(p?.help === "none" ? 0 : 1);
  const [misses, setMisses] = useState(0);
  const [right, setRight] = useState(0);
  const started = useRef(Date.now());
  const end = useRef(null);
  const done = i >= turns.length;
  const cur = turns[Math.min(i, turns.length - 1)];
  const answers = [cur.answer, ...(cur.alt || [])];
  const v = useVoice({ unitId: unit.id, kind: "chat", answers, keys: cur.keys || [], pass: 0.65, log: false });
  const word = (ko) => unit.words?.find((w) => w.ko === ko);

  useEffect(() => () => stop(), []);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [i, phase, v.result]);

  // Мишка asks, then waits for the child.
  useEffect(() => {
    if (done) {
      const min = Math.round((Date.now() - started.current) / 60000);
      if (min > 0) addMinutes(min);
      return;
    }
    let alive = true;
    v.reset();
    setMisses(0);
    setHint(p?.help === "none" ? 0 : 1);
    setPhase("ask");
    say(cur.ko).then(() => alive && setPhase("answer"));
    return () => (alive = false);
  }, [i]);

  const next = (ok, text) => {
    setSaid((s) => [...s, { ko: text, ok }]);
    setPhase("reply");
    say(ok ? cur.reply : LATER).then(() => setTimeout(() => setI((n) => n + 1), 400));
  };

  useEffect(() => {
    const r = v.result;
    if (!r || phase !== "answer") return;
    if (r.self && !r.judged) return setHint(2);
    const first = misses === 0;
    if (r.ok) {
      logEvent(unit.id, "chat", first, { target: cur.answer, said: r.said, score: r.score != null ? Math.round(r.score * 100) : null, tips: (r.tips || []).map((x) => x.key) });
      if (first) setRight((n) => n + 1);
      const t = setTimeout(() => next(true, r.target || cur.answer), 900);
      return () => clearTimeout(t);
    }
    if (r.said || r.judged) {
      if (first) logEvent(unit.id, "chat", false, { target: cur.answer, said: r.said, tips: (r.tips || []).map((x) => x.key) });
      setMisses((m) => m + 1);
      setHint(2);
    }
  }, [v.result]);

  const firstWord = cur.answer.split(" ")[0];
  const shown = turns.slice(0, Math.min(i + (done ? 0 : 1), turns.length));

  return (
    <div className="col" style={{ gap: 14 }}>
      {shown.map((t, k) => (
        <div key={k} className="col" style={{ gap: 14 }}>
          <BearLine ko={t.ko} ru={p?.help !== "none" ? t.ru : null} show={t.show && word(t.show)} active={k === i && phase === "ask"} />
          {said[k] && <KidLine ko={said[k].ko} />}
          {said[k] && <BearLine ko={said[k].ok ? t.reply : LATER} active={k === i && phase === "reply"} />}
        </div>
      ))}
      {!done && phase === "answer" && (
        <div className="card col turn-card fade-in" style={{ gap: 14 }}>
          <div className="row wrap" style={{ gap: 10 }}>
            <span className="chip turn-chip">
              <Icon name="Mic" size={18} /> Твоя очередь
            </span>
            <b className="ru" style={{ fontSize: 20 }}>{cur.to}</b>
          </div>
          <div className="ko turn-text">{hint === 2 ? <Marked text={cur.answer} parts={v.result?.parts} /> : hint === 1 ? `${firstWord} …` : "…"}</div>
          <div className="row wrap" style={{ gap: 18, justifyContent: "center" }}>
            <MicButton v={v} />
            <MicHint v={v} idle="Нажми и ответь" />
          </div>
          <div className="row wrap" style={{ gap: 10 }}>
            {hint < 2 && (
              <button type="button" className="btn btn-ghost" onClick={() => setHint(2)}>
                <Icon name="Lightbulb" size={18} /> Подсказка
              </button>
            )}
            <MiniSpeaker text={cur.answer} label="Как сказать" />
            <button type="button" className="btn btn-ghost" onClick={() => say(cur.ko)}>
              <Icon name="RotateCcw" size={18} /> Мишка, ещё раз
            </button>
            {misses >= 2 && (
              <button type="button" className="btn btn-ghost" onClick={() => next(false, cur.answer)}>
                Дальше <Icon name="ChevronRight" size={18} />
              </button>
            )}
          </div>
          <VoiceFeedback v={v} model={cur.answer} goodText="Мишка тебя понял!" />
        </div>
      )}
      {done && (
        <div className="card col fade-in" style={{ padding: 24, gap: 14, alignItems: "center", textAlign: "center" }}>
          <Mascot size={88} mood="wow" />
          <b className="ru" style={{ fontSize: 22 }}>
            Ты поговорил(а) с Мишкой! С первого раза: {right} из {turns.length}
          </b>
          <span className="ko muted">미샤랑 이야기했어요. 잘했어요!</span>
          <button type="button" className="btn btn-primary btn-xl" onClick={() => go("home")}>
            Дальше <Icon name="ChevronRight" size={26} />
          </button>
        </div>
      )}
      <div ref={end} />
    </div>
  );
}

export default function Chat({ go, id }) {
  const p = useProfile();
  const units = UNITS.filter((u) => CHATS[u.id]);
  const done = units.filter((u) => p?.units?.[u.id]?.done);
  // Default: the unit finished last, or the first one with a talk.
  const last = [...done].sort((a, b) => p.units[b.id].ts - p.units[a.id].ts)[0];
  const [pick, setPick] = useState(id && CHATS[id] ? id : last?.id || units[0].id);
  const [on, setOn] = useState(false);
  const unit = units.find((u) => u.id === pick);

  return (
    <>
      <TopBar go={go} />
      <div className="page col" style={{ maxWidth: 820, gap: 18 }}>
        <div className="row wrap" style={{ justifyContent: "space-between", gap: 12 }}>
          <h1 className="display" style={{ fontSize: 30 }}>
            Поговори с Мишкой <span className="ko muted" style={{ fontSize: 22 }}>· 미샤랑 이야기해요</span>
          </h1>
          <button type="button" className="btn btn-ghost" style={{ minHeight: 44 }} onClick={() => go("tutor")}>
            <Icon name="CircleHelp" size={18} /> Задать вопрос
          </button>
        </div>
        {!on ? (
          <div className="card col" style={{ padding: 24, gap: 16 }}>
            <div className="row" style={{ gap: 14 }}>
              <Mascot size={72} />
              <div className="bubble ru" style={{ flex: 1 }}>
                Я задам тебе 4 вопроса. Отвечай вслух по-корейски! Выбери тему.
              </div>
            </div>
            <div className="row wrap chat-topics" style={{ gap: 8 }}>
              {units.map((u) => {
                const ok = p?.units?.[u.id]?.done;
                return (
                  <button key={u.id} type="button" className={"chip chat-topic" + (u.id === pick ? " on" : "")} onClick={() => setPick(u.id)}>
                    {ok ? <Icon name="Check" size={16} /> : null} {u.id} · <span className="ko">{u.title.ko}</span>
                  </button>
                );
              })}
            </div>
            {!p?.units?.[pick]?.done && <span className="ru muted">Этот урок ты ещё не прошёл(ла). Можно попробовать, но сначала лучше пройти урок.</span>}
            <PrivacyNote />
            <button type="button" className="btn btn-primary btn-xl" style={{ alignSelf: "flex-start" }} onClick={() => setOn(true)}>
              <Icon name="Play" size={26} /> Начать · 시작
            </button>
          </div>
        ) : (
          <Talk key={pick} unit={unit} go={go} />
        )}
      </div>
    </>
  );
}
