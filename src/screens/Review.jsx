// "Повторение · 복습": a few minutes a day on words that are due again.
// Each word is asked with the skill that fits its box (hear, read, say,
// spell), so a word is only "done" once the child can say and write it.
import { useEffect, useMemo, useRef, useState } from "react";
import { TopBar } from "./Home.jsx";
import { Icon, Mascot, MiniSpeaker, Pic, PicTile, Speaker, shuffled, useProfile } from "../components/ui.jsx";
import { Feedback } from "../activities/quiz.jsx";
import { MicButton, MicHint, VoiceFeedback, useVoice } from "../activities/voice.jsx";
import { SKILL_AT, dueWords, nextState, reviewState, variants } from "../lib/review.js";
import { addCheck, addMinutes, logEvent, setReview } from "../lib/store.js";
import { AREAS, areaOf } from "../lib/skills.js";
import { isSyllable } from "../lib/hangul.js";
import { micSupported } from "../lib/recorder.js";
import { say } from "../lib/speech.js";
import { sfx } from "../lib/sfx.js";

const SKILL = {
  listen: ["Послушай и выбери", "듣기", "Ear"],
  read: ["Прочитай и выбери перевод", "읽기", "BookOpen"],
  speak: ["Скажи по-корейски", "말하기", "Mic"],
  spell: ["Как пишется?", "쓰기", "PencilLine"],
};

function others(p, ko, n, withIcon) {
  const pool = Object.entries(p.words || {}).filter(([k, w]) => k !== ko && (!withIcon || w.icon));
  return shuffled(pool).slice(0, n);
}

// One question. Calls onDone(ok) once the child got it (or gave up).
function Question({ item, p, onDone }) {
  const w = p.words[item.ko];
  const [picked, setPicked] = useState(null);
  const [state, setState] = useState("idle"); // idle | good | miss
  const first = useRef(true);
  const v = useVoice({ unitId: "review", kind: "speak", answers: [item.ko], pass: 0.7, log: false });

  const finish = (ok) => {
    setState(ok ? "good" : "miss");
    ok ? sfx.good() : sfx.miss();
    if (ok) setTimeout(() => onDone(first.current), 900);
    else first.current = false;
  };

  useEffect(() => {
    const r = v.result;
    if (!r || item.skill !== "speak" || state === "good") return;
    if (r.self && !r.judged) return;
    finish(!!r.ok);
  }, [v.result]);

  const opts = useMemo(() => {
    if (item.skill === "listen") return shuffled([[item.ko, w], ...others(p, item.ko, 2, true)]);
    if (item.skill === "read") return shuffled([[item.ko, w], ...others(p, item.ko, 2)]);
    if (item.skill === "spell") return shuffled([item.ko, ...variants(item.ko, 2)]);
    return [];
  }, [item]);

  const choose = (key) => {
    if (state === "good") return;
    setPicked(key);
    finish(key === item.ko);
    if (key === item.ko) say(item.ko);
  };
  const cls = (key) => "opt" + (picked === key ? (state === "good" ? " good" : state === "miss" ? " miss" : "") : "");

  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      {item.skill === "listen" && (
        <>
          <div className="row" style={{ justifyContent: "center" }}>
            <Speaker text={item.ko} size={112} autoPlay />
          </div>
          <div className="options">
            {opts.map(([ko, x]) => (
              <button key={ko} type="button" className={cls(ko) + " pic"} onClick={() => choose(ko)}>
                <PicTile icon={x.icon} ko={ko} size={84} />
                <span className="ru">{x.ru}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {item.skill === "read" && (
        <>
          <div className="card ko review-word">{item.ko}</div>
          <div className="options">
            {opts.map(([ko, x]) => (
              <button key={ko} type="button" className={cls(ko)} onClick={() => choose(ko)}>
                <span className="ru">{x.ru}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {item.skill === "spell" && (
        <>
          <div className="row" style={{ justifyContent: "center", gap: 14 }}>
            <Speaker text={item.ko} size={100} autoPlay />
            <Speaker text={item.ko} size={60} slow label="Медленно" />
          </div>
          <div className="ru muted" style={{ textAlign: "center" }}>«{w.ru}»</div>
          <div className="options">
            {opts.map((ko) => (
              <button key={ko} type="button" className={cls(ko) + " ko"} style={{ fontSize: 28 }} onClick={() => choose(ko)}>
                {ko}
              </button>
            ))}
          </div>
        </>
      )}
      {item.skill === "speak" && (
        <>
          <div className="card mission-card">
            {w.icon ? <PicTile icon={w.icon} ko={item.ko} size={96} tone="amber" /> : null}
            <div className="col" style={{ gap: 6, flex: 1 }}>
              <span className="t-sub ru">Как сказать по-корейски?</span>
              <b className="ru mission-text">«{w.ru}»</b>
            </div>
          </div>
          {(state === "miss" || state === "good" || (v.result?.self && !v.result.judged)) && (
            <div className="card row wrap model-answer fade-in" style={{ gap: 12 }}>
              <b className="ko" style={{ fontSize: 30 }}>{item.ko}</b>
              <MiniSpeaker text={item.ko} />
            </div>
          )}
          <div className="row wrap" style={{ gap: 22, justifyContent: "center" }}>
            <MicButton v={v} size={116} />
            <MicHint v={v} idle="Нажми и скажи" />
          </div>
          {v.result && state !== "good" && <VoiceFeedback v={v} model={item.ko} />}
          {state === "idle" && !v.result && (
            <button type="button" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={() => (finish(false), say(item.ko))}>
              <Icon name="CircleHelp" size={18} /> Не помню
            </button>
          )}
        </>
      )}
      <div className="row wrap" style={{ justifyContent: "space-between", gap: 12 }}>
        <Feedback state={state === "idle" ? null : state} praise={["Молодец!", "잘했어요!"]} missText={["Запомни и попробуй ещё раз.", "다시 해 봐요."]} />
        {state === "miss" && item.skill !== "speak" && (
          <button type="button" className="btn btn-teal" onClick={() => onDone(false)}>
            Дальше <Icon name="ChevronRight" size={20} />
          </button>
        )}
        {state === "miss" && item.skill === "speak" && (
          <button type="button" className="btn btn-ghost" onClick={() => onDone(false)}>
            Дальше <Icon name="ChevronRight" size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

// "Проверь себя · 실력 점검": two questions per skill on words already
// learned, no second tries. The result goes to the teacher and parents.
function checkQueue(p) {
  const all = Object.entries(p.words || {});
  const used = new Set();
  const pick = (ok) => {
    const pool = shuffled(all.filter(([ko, w]) => !used.has(ko) && ok(ko, w)));
    const out = pool.slice(0, 2).map(([ko]) => ko);
    out.forEach((ko) => used.add(ko));
    return out;
  };
  const q = [];
  for (const ko of pick((ko, w) => w.icon)) q.push({ ko, skill: "listen" });
  for (const ko of pick(() => true)) q.push({ ko, skill: "read" });
  if (micSupported()) for (const ko of pick((ko) => ko.length <= 8)) q.push({ ko, skill: "speak" });
  for (const ko of pick((ko) => [...ko].every((c) => isSyllable(c) || c === " ") && variants(ko, 2).length === 2)) q.push({ ko, skill: "spell" });
  return q.map((x) => ({ ...x, again: false }));
}

export default function Review({ go, mode = "review" }) {
  const p = useProfile();
  const check = mode === "check";
  const started = useRef(Date.now());
  const res = useRef({});
  // The list is fixed when the screen opens; wrong words come back once at the end.
  const [queue, setQueue] = useState(() => {
    if (check) return checkQueue(p);
    const due = dueWords(p);
    const canSpeak = micSupported();
    return due.map((r) => {
      let skill = SKILL_AT[Math.min(r.box, SKILL_AT.length - 1)];
      if (skill === "speak" && !canSpeak) skill = "spell";
      if (skill === "listen" && Object.values(p.words).filter((x) => x.icon).length < 3) skill = "read";
      return { ko: r.ko, skill, again: false };
    });
  });
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const total = queue.filter((q) => !q.again).length;
  const done = i >= queue.length;

  useEffect(() => {
    if (done && queue.length) {
      const min = Math.round((Date.now() - started.current) / 60000);
      if (min > 0) addMinutes(min);
      if (check) addCheck(res.current);
    }
  }, [done]);

  const answered = (ok) => {
    const item = queue[i];
    if (check) {
      const a = areaOf(item.skill);
      const r = (res.current[a] ||= [0, 0]);
      r[1]++;
      if (ok) r[0]++, setRight((n) => n + 1);
      logEvent("check", item.skill, ok, { ko: item.ko });
    } else if (!item.again) {
      setReview(item.ko, nextState(reviewState(p, item.ko), ok));
      logEvent("review", item.skill, ok, { ko: item.ko });
      if (ok) setRight((n) => n + 1);
      else setQueue((q) => [...q, { ...item, again: true }]);
    }
    setI(i + 1);
  };

  const item = queue[Math.min(i, queue.length - 1)];
  return (
    <>
      <TopBar go={go} />
      <div className="page col" style={{ maxWidth: 820, gap: 18 }}>
        <div className="row wrap" style={{ justifyContent: "space-between", gap: 12 }}>
          <h1 className="display" style={{ fontSize: 30 }}>
            {check ? "Проверь себя" : "Повторение"} <span className="ko muted" style={{ fontSize: 22 }}>· {check ? "실력 점검" : "오늘의 복습"}</span>
          </h1>
          {!done && (
            <span className="chip" style={{ boxShadow: "none" }}>
              <Icon name={SKILL[item.skill][2]} size={18} /> {SKILL[item.skill][0]} · {Math.min(i + 1, queue.length)}/{queue.length}
            </span>
          )}
        </div>
        {!queue.length ? (
          <div className="card row" style={{ padding: 24, gap: 16 }}>
            <Mascot size={72} mood="wow" />
            <div className="col" style={{ gap: 8 }}>
              <b className="ru" style={{ fontSize: 20 }}>На сегодня всё повторено!</b>
              <span className="ru muted">Новые слова появятся для повторения завтра. 오늘 복습 끝!</span>
              <button type="button" className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => go("home")}>
                К урокам <Icon name="ChevronRight" size={20} />
              </button>
            </div>
          </div>
        ) : done && check ? (
          <CheckResult res={res.current} go={go} />
        ) : done ? (
          <div className="card col" style={{ padding: 28, gap: 16, alignItems: "center", textAlign: "center" }}>
            <Pic pic="trophy" size={96} />
            <b className="ru" style={{ fontSize: 24 }}>
              Повторено {total} слов, сразу верно {right}
            </b>
            <span className="ru muted">Слова, которые ты знаешь, вернутся позже. Ошибки — завтра. 잘했어요!</span>
            <button type="button" className="btn btn-primary btn-xl" onClick={() => go("home")}>
              Дальше <Icon name="ChevronRight" size={26} />
            </button>
          </div>
        ) : (
          <>
            <div className="bar-track">
              <div style={{ width: `${(i / queue.length) * 100}%` }} />
            </div>
            <Question key={i} item={item} p={p} onDone={answered} />
          </>
        )}
      </div>
    </>
  );
}

function CheckResult({ res, go }) {
  return (
    <div className="card col fade-in" style={{ padding: 28, gap: 18, alignItems: "center", textAlign: "center" }}>
      <Pic pic="trophy" size={88} />
      <b className="ru" style={{ fontSize: 24 }}>Готово! Вот что у тебя получается</b>
      <div className="check-grid">
        {AREAS.filter((a) => res[a.id]).map((a) => {
          const [ok, n] = res[a.id];
          return (
            <div key={a.id} className={"check-cell" + (ok === n ? " full" : "")}>
              <Icon name={a.icon} size={28} />
              <b className="ru">{a.ru}</b>
              <span className="ko t-sub">{a.ko}</span>
              <span className="check-dots">
                {Array.from({ length: n }, (_, i) => (
                  <span key={i} className={i < ok ? "on" : ""} />
                ))}
              </span>
            </div>
          );
        })}
      </div>
      <span className="ru muted">Учитель увидит результат. Ошибки — это нормально: так мы знаем, что повторить.</span>
      <button type="button" className="btn btn-primary btn-xl" onClick={() => go("home")}>
        Дальше <Icon name="ChevronRight" size={26} />
      </button>
    </div>
  );
}
