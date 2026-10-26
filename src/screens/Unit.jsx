import { useEffect, useMemo, useRef, useState } from "react";
import { unitById, UNITS, isOpen } from "../data/course.js";
import { Icon, Mascot, Stars, T, useProfile } from "../components/ui.jsx";
import { Intro, Learn, Scene } from "../activities/basic.jsx";
import { Build, Choose, Grammar, Listen, Read, Task } from "../activities/quiz.jsx";
import { Order, Speak, Trace } from "../activities/produce.jsx";
import { addMinutes, finishUnit, learnWords, updateProfile } from "../lib/store.js";
import { say, sayAll, stop } from "../lib/speech.js";

// ?debug in the address lets a teacher or tester skip ahead.
const DEBUG = typeof location !== "undefined" && location.search.includes("debug");

const VIEWS = { intro: Intro, learn: Learn, scene: Scene, listen: Listen, read: Read, choose: Choose, grammar: Grammar, build: Build, task: Task, speak: Speak, order: Order, trace: Trace };

const STEP_NAME = {
  intro: ["Знакомство", "알아보기"],
  scene: ["Послушай", "만나기"],
  learn: ["Учим", "배우기"],
  listen: ["Слушаем", "듣기"],
  read: ["Читаем", "읽기"],
  choose: ["Говорим", "말하기"],
  grammar: ["Правило", "규칙"],
  build: ["Собираем", "만들기"],
  task: ["Задание", "문제"],
  speak: ["Говорим", "말하기"],
  order: ["Пишем", "쓰기"],
  trace: ["Пишем", "쓰기"],
};

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
    sayAll([["Ура! Урок пройден!", "ru"], ["잘했어요!", "ko"]]);
  }, []);
  return (
    <div className="col fade-in" style={{ gap: 22, alignItems: "center", textAlign: "center", paddingTop: 12 }}>
      <Mascot size={120} mood="wow" />
      <div className="big-stars">
        <Stars n={stars} size={64} />
      </div>
      <h2 className="act-title">
        <T ru="Урок пройден!" ko="잘했어요!" />
      </h2>
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
        <div className="col" style={{ gap: 0 }}>
          <span className="t-sub ru">{finished ? "" : STEP_NAME[step?.type]?.[0]}</span>
          <b className="ko" style={{ fontSize: 22, lineHeight: 1.1 }}>
            {unit.id} · {unit.title.ko}
          </b>
        </div>
        <div className="dots" aria-label={`Шаг ${i + 1} из ${steps.length}`}>
          {steps.map((_, k) => (
            <span key={k} className={"dot" + (finished || k < i ? " done" : k === i ? " now" : "")} />
          ))}
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
