import { useEffect, useMemo, useRef, useState } from "react";
import { unitById, UNITS, isOpen } from "../data/course.js";
import { Icon, Mascot, Pic, Stars, T, useProfile } from "../components/ui.jsx";
import { UI_PIC } from "../data/pictures.js";
import { sfx } from "../lib/sfx.js";
import { Intro, Learn, Scene } from "../activities/basic.jsx";
import { Build, Choose, Grammar, Listen, Read, Task } from "../activities/quiz.jsx";
import { Order, Speak, Trace } from "../activities/produce.jsx";
import { Mission, RolePlay } from "../activities/talk.jsx";
import { addMinutes, finishUnit, learnWords, updateProfile } from "../lib/store.js";
import { say, sayAll, stop } from "../lib/speech.js";

// ?debug in the address lets a teacher or tester skip ahead.
const DEBUG = typeof location !== "undefined" && location.search.includes("debug");

const VIEWS = { intro: Intro, explain: Intro, learn: Learn, scene: Scene, listen: Listen, read: Read, choose: Choose, grammar: Grammar, build: Build, task: Task, speak: Speak, order: Order, trace: Trace, roleplay: RolePlay, mission: Mission };

const STEP_NAME = {
  intro: ["Знакомство", "알아보기", "Sparkles"],
  explain: ["Как сказать", "설명", "Lightbulb"],
  scene: ["Послушай", "만나기", "MessagesSquare"],
  learn: ["Учим", "배우기", "BookOpen"],
  listen: ["Слушаем", "듣기", "Ear"],
  read: ["Читаем", "읽기", "BookOpen"],
  choose: ["Говорим", "말하기", "MessageCircle"],
  grammar: ["Правило", "규칙", "Lightbulb"],
  build: ["Собираем", "만들기", "Blocks"],
  task: ["Задание", "문제", "ClipboardList"],
  speak: ["Говорим", "말하기", "Mic"],
  roleplay: ["Разговор", "역할극", "Drama"],
  mission: ["Миссия", "미션", "Target"],
  order: ["Пишем", "쓰기", "PencilLine"],
  trace: ["Пишем", "쓰기", "PencilLine"],
};

function Confetti() {
  const colors = ["#FFC93C", "#FF6A45", "#18A898", "#4457A0", "#3FCF8E", "#FF8FB1"];
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 36 }, (_, k) => (
        <span
          key={k}
          style={{
            left: `${(k * 37) % 100}%`,
            background: colors[k % colors.length],
            animationDelay: `${(k % 9) * 0.09}s`,
            animationDuration: `${1.6 + (k % 5) * 0.25}s`,
            transform: `rotate(${k * 29}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function HelpSwitch() {
  const p = useProfile();
  const set = (help) => updateProfile((x) => ({ ...x, help }));
  return (
    <div className="seg" role="group" aria-label="Помощь на русском">
      {[
        ["many", "RU+KO"],
        ["some", "KO (ru)"],
        ["none", "KO"],
      ].map(([k, label]) => (
        <button key={k} type="button" aria-pressed={p?.help === k} onClick={() => set(k)} title={{ many: "Много русского", some: "Немного русского", none: "Только корейский" }[k]}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function SoundSwitch() {
  const p = useProfile();
  return (
    <button
      type="button"
      className="icon-btn"
      aria-pressed={!!p?.sound}
      aria-label={p?.sound ? "Мишка читает задания вслух: включено" : "Мишка читает задания вслух: выключено"}
      title="Читать задания вслух"
      style={p?.sound ? { background: "var(--teal)", color: "#fff" } : undefined}
      onClick={() => updateProfile((x) => ({ ...x, sound: !x.sound }))}
    >
      <Icon name={p?.sound ? "Ear" : "EarOff"} />
    </button>
  );
}

function Done({ unit, stars, go }) {
  const p = useProfile();
  const idx = UNITS.indexOf(unit);
  const after = UNITS.slice(idx + 1).find((u) => !u.soon && u.part === unit.part) || UNITS.find((u) => !u.soon && isOpen(u, p) && !p.units?.[u.id]?.done);
  useEffect(() => {
    sfx.done();
    const t = setTimeout(() => sayAll([["Ура! Урок пройден!", "ru"], ["잘했어요!", "ko"]]), 700);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="done col" style={{ gap: 20, alignItems: "center", textAlign: "center", paddingTop: 8 }}>
      <Confetti />
      <div className="done-art">
        <Pic pic={UI_PIC.trophy} size={120} className="done-trophy" />
        <span className="done-mascot">
          <Mascot size={88} mood="wow" />
        </span>
      </div>
      <h2 className="act-title" style={{ fontSize: 36 }}>
        <T ru="Урок пройден!" ko="잘했어요!" />
      </h2>
      <div className="big-stars">
        <Stars n={stars} size={60} />
      </div>
      {unit.words?.length > 0 && (
        <div className="card col" style={{ padding: 20, gap: 12, width: "100%", maxWidth: 640 }}>
          <div className="ru" style={{ fontWeight: 700 }}>
            Новые слова в твоём словаре · 새 낱말
          </div>
          <div className="row wrap" style={{ gap: 8, justifyContent: "center" }}>
            {unit.words.map((w) => (
              <button key={w.ko} type="button" className="tile" style={{ fontSize: 22 }} onClick={() => say(w.ko)}>
                {w.ko}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="row wrap" style={{ gap: 12, justifyContent: "center" }}>
        <button type="button" className="btn btn-ghost" onClick={() => go("home")}>
          <Icon name="Map" /> Карта
        </button>
        {after && (
          <button type="button" className="btn btn-primary" onClick={() => go("unit", { id: after.id })}>
            Дальше: {after.title.ru} <Icon name="ChevronRight" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function Unit({ id, go }) {
  const unit = unitById(id);
  const steps = unit?.steps || [];
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);
  const scores = useRef({});
  const [finished, setFinished] = useState(null);
  const started = useRef(Date.now());
  const body = useRef(null);

  useEffect(() => {
    return () => {
      stop();
      const min = Math.round((Date.now() - started.current) / 60000);
      if (min > 0) addMinutes(min);
    };
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [i]);
  const goStep = (k) => {
    setReady(false);
    setI(k);
  };

  if (!unit || unit.soon) {
    return (
      <div className="page col" style={{ paddingTop: 40, alignItems: "center", gap: 16 }}>
        <Mascot size={96} mood="think" />
        <div className="ru" style={{ fontSize: 20 }}>Этот урок скоро появится.</div>
        <button type="button" className="btn btn-ghost" onClick={() => go("home")}>
          Карта
        </button>
      </div>
    );
  }

  const step = steps[i];
  const View = VIEWS[step?.type];
  const onScore = (total, first) => (scores.current[i] = { total, first });
  const next = () => {
    stop();
    if (i + 1 < steps.length) return goStep(i + 1);
    const all = Object.values(scores.current);
    const t = all.reduce((a, s) => a + s.total, 0);
    const f = all.reduce((a, s) => a + s.first, 0);
    const ratio = t ? f / t : 1;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : 1;
    finishUnit(unit.id, stars);
    learnWords(unit.words || []);
    setFinished(stars);
  };

  return (
    <div className="runner">
      <header className="runner-head">
        <button type="button" className="icon-btn" onClick={() => go("home")} aria-label="На карту">
          <Icon name="X" />
        </button>
        <div className="col" style={{ gap: 2 }}>
          {!finished && STEP_NAME[step?.type] && (
            <span className="step-chip ru">
              <Icon name={STEP_NAME[step.type][2]} size={14} /> {STEP_NAME[step.type][0]}
            </span>
          )}
          <b className="ko" style={{ fontSize: 22, lineHeight: 1.1 }}>
            {unit.id} · {unit.title.ko}
          </b>
        </div>
        <div className="runner-progress" role="progressbar" aria-label="Шаги урока" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={finished ? steps.length : i}>
          <span style={{ width: `${finished ? 100 : Math.max(4, (i / steps.length) * 100)}%` }} />
        </div>
        <SoundSwitch />
        <HelpSwitch />
      </header>
      <div className="runner-body" ref={body}>
        {finished ? (
          <Done unit={unit} stars={finished} go={go} />
        ) : (
          View && <View key={i} step={step} unitId={unit.id} onReady={setReady} onScore={onScore} onWords={(w) => learnWords(w)} />
        )}
      </div>
      {!finished && (
        <footer className="runner-foot no-print">
          {i > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => goStep(i - 1)}>
              <Icon name="ChevronLeft" /> Назад
            </button>
          )}
          <button type="button" className="btn btn-primary" disabled={!ready && !DEBUG} onClick={next} style={{ minWidth: 200 }}>
            {i + 1 < steps.length ? "Дальше · 다음" : "Закончить · 끝"}
            <Icon name="ChevronRight" size={24} />
          </button>
        </footer>
      )}
    </div>
  );
}
