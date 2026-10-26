// Activities where the child produces Korean: speaking, putting words in
// order and writing letters by hand.
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, Meaning, Mascot, MiniSpeaker, Speaker, T, shuffled, useProfile } from "../components/ui.jsx";
import { DoneNote, Feedback, Progress, useQuiz } from "./quiz.jsx";
import { say } from "../lib/speech.js";
import { micSupported, startRecording, toMono16k } from "../lib/recorder.js";
import { diffSyllables, normalize, similarity, pronounce } from "../lib/hangul.js";
import { transcribe, useMlStatus, progressOf } from "../lib/ml.js";
import { logEvent } from "../lib/store.js";
import { STROKES } from "../data/strokes.js";

// ---------------- speaking ----------------

export function Speak({ step, unitId, onReady }) {
  const items = step.items;
  const [i, setI] = useState(0);
  const [rec, setRec] = useState(null); // active recorder
  const [mine, setMine] = useState(null); // { url, blob }
  const [result, setResult] = useState(null); // { text, score, parts }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const ml = useMlStatus();
  const cur = items[i];
  const canMic = micSupported();

  useEffect(() => {
    setMine(null);
    setResult(null);
    setErr("");
  }, [i]);
  useEffect(() => () => rec?.cancel(), [rec]);

  const begin = async () => {
    setErr("");
    setResult(null);
    try {
      const r = await startRecording();
      setRec(r);
      // Stop by itself after a while, children forget to press again.
      r.auto = setTimeout(() => finish(r), Math.min(9000, 2500 + normalize(cur.ko).length * 700));
    } catch {
      setErr("mic");
    }
  };

  const finish = async (r = rec) => {
    if (!r) return;
    clearTimeout(r.auto);
    setRec(null);
    const out = await r.stop();
    setMine(out);
    new Audio(out.url).play().catch(() => {});
    setBusy(true);
    try {
      const audio = await toMono16k(out.blob);
      const text = await transcribe(audio);
      const score = similarity(cur.ko, text);
      setResult({ text, score, parts: diffSyllables(cur.ko, text) });
      logEvent(unitId, "speak", score >= 0.75, { target: cur.ko, said: text, score: Math.round(score * 100) });
    } catch {
      setResult({ offline: true });
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (i + 1 >= items.length) {
      setDone(true);
      onReady(true);
    } else setI(i + 1);
  };

  useEffect(() => onReady(false), []);

  if (done)
    return (
      <div className="col fade-in" style={{ gap: 18 }}>
        <h2 className="act-title">
          <T ru="Повтори вслух" ko="따라 말해 보세요" />
        </h2>
        <DoneNote />
      </div>
    );

  const pct = result?.score != null ? Math.round(result.score * 100) : null;
  const loading = ml.asr === "loading";

  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between" }}>
        <h2 className="act-title">
          <T ru="Повтори вслух" ko="따라 말해 보세요" />
        </h2>
        <Progress i={i} total={items.length} />
      </div>
      <div className="row wrap" style={{ gap: 8, color: "var(--muted)", fontSize: 14 }}>
        <Icon name="ShieldCheck" size={18} />
        <span className="ru">Твой голос слышит только этот компьютер. Никто другой не слушает.</span>
      </div>

      <div className="card col" style={{ padding: "24px 24px 20px", gap: 14, alignItems: "center", textAlign: "center" }}>
        <div className="ko" style={{ fontSize: "clamp(36px, 6vw, 60px)", lineHeight: 1.2 }}>
          {result?.parts
            ? result.parts.map((p, k) => (
                <span key={k} style={p.ok ? undefined : { background: "#FDE68A", borderBottom: "4px solid var(--warn)", borderRadius: 4 }}>
                  {p.ch}
                </span>
              ))
            : cur.ko}
        </div>
        {pronounce(cur.ko) !== cur.ko.replace(/[?.!,~]/g, "").trim() && (
          <div className="pron" title="Так произносится · 이렇게 소리 나요">
            <span className="ru">читается</span> <span className="ko">[{pronounce(cur.ko)}]</span>
          </div>
        )}
        <Meaning ru={cur.ru} />
        <div className="row" style={{ gap: 14 }}>
          <Speaker key={i} text={cur.ko} size={72} autoPlay label="Слушать образец" />
          <Speaker text={cur.ko} size={56} slow label="Медленно" />
        </div>
      </div>

      <div className="row wrap" style={{ gap: 22, justifyContent: "center" }}>
        {canMic ? (
          <button
            type="button"
            className="speaker"
            style={{ width: 128, height: 128, background: rec ? "var(--good)" : "var(--coral)", boxShadow: rec ? "0 0 0 16px rgba(21,128,61,0.18), 0 6px 0 #0f5f2d" : "0 0 0 14px rgba(194,65,12,0.14), 0 6px 0 var(--coral-d)" }}
            onClick={() => (rec ? finish() : begin())}
            aria-label={rec ? "Стоп" : "Записать голос"}
            disabled={busy}
          >
            <Icon name={rec ? "Square" : "Mic"} size={54} />
          </button>
        ) : null}
        <div className="col" style={{ gap: 8, maxWidth: 380 }}>
          <div className="ru" style={{ fontSize: 17, fontWeight: 700 }}>
            {rec ? "Говори… потом нажми ещё раз" : busy ? (loading ? "Готовлю распознавание речи…" : "Слушаю…") : canMic ? "Нажми и скажи вслух" : "Скажи вслух вместе с образцом"}
          </div>
          {busy && loading && (
            <div style={{ height: 10, borderRadius: 5, background: "var(--line)", overflow: "hidden" }}>
              <div style={{ width: `${Math.round(progressOf("asr") * 100)}%`, height: 10, background: "var(--teal)", transition: "width 0.3s" }} />
            </div>
          )}
          {mine && (
            <button type="button" className="btn btn-ghost" style={{ minHeight: 44, fontSize: 15 }} onClick={() => new Audio(mine.url).play()}>
              <Icon name="Play" size={18} /> Послушать себя
            </button>
          )}
          {err === "mic" && <div className="ru" style={{ color: "var(--warn)" }}>Микрофон не включён. Попроси учителя разрешить микрофон в браузере.</div>}
        </div>
      </div>

      {result && !result.offline && (
        <div className={"feedback " + (pct >= 75 ? "good" : "try") + " fade-in"} role="status">
          <Mascot size={52} mood={pct >= 75 ? "wow" : "think"} />
          <div className="col" style={{ gap: 6, flex: 1 }}>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ flex: 1, height: 12, borderRadius: 6, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                <div style={{ width: pct + "%", height: 12, background: pct >= 75 ? "var(--good)" : "var(--warn)" }} />
              </div>
              <b>{pct}%</b>
            </div>
            <div className="ru">
              {pct >= 90 ? "Отлично! Очень похоже." : pct >= 75 ? "Хорошо! Жёлтым — что можно сказать чётче." : "Послушай образец и попробуй ещё раз. Жёлтым — что прозвучало иначе."}
            </div>
            {result.text && (
              <div className="t-sub">
                Я услышал: <span className="ko">{result.text}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {result?.offline && (
        <div className="feedback try fade-in">
          <Mascot size={48} mood="think" />
          <span className="ru">Сравни сам: послушай образец, потом себя. Похоже? Тогда дальше!</span>
        </div>
      )}

      <div className="row" style={{ justifyContent: "flex-end", gap: 12 }}>
        <button type="button" className="btn btn-teal" onClick={next} disabled={!!rec || busy}>
          {i + 1 >= items.length ? "Готово" : "Следующее"} <Icon name="ChevronRight" size={22} />
        </button>
      </div>
    </div>
  );
}

// ---------------- word order ----------------

export function Order({ step, unitId, onScore, onReady }) {
  const items = step.items;
  const quiz = useQuiz(items.length, { onScore, onReady, unitId, kind: "order" });
  const cur = items[Math.min(quiz.i, items.length - 1)];
  const words = useMemo(() => cur.ko.split(" ").map((w, k) => ({ w, k })), [cur]);
  const pool = useMemo(() => {
    let s = shuffled(words);
    if (words.length > 1 && s.every((x, idx) => x.k === idx)) s = [...s].reverse();
    return s;
  }, [words]);
  const [placed, setPlaced] = useState([]);
  useEffect(() => setPlaced([]), [quiz.i]);
  useEffect(() => {
    if (placed.length === words.length && words.length) {
      const ok = placed.map((x) => x.w).join(" ") === cur.ko;
      quiz.answer(ok, { target: cur.ko, built: placed.map((x) => x.w).join(" ") });
      if (ok) say(cur.ko);
    }
  }, [placed]);
  const single = words.length === 1;
  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between" }}>
        <h2 className="act-title">
          <T ru="Собери предложение" ko="문장을 만들어 보세요" />
        </h2>
        <Progress i={quiz.i} total={items.length} />
      </div>
      {quiz.state === "done" ? (
        <DoneNote />
      ) : (
        <>
          <div className="card row" style={{ padding: 20, gap: 14 }}>
            <MiniSpeaker text={cur.ko} />
            <span className="ru" style={{ fontSize: 21, fontWeight: 700 }}>{cur.ru}</span>
          </div>
          <div className="slot-line tiles" aria-label="Твоё предложение">
            {placed.map((x, idx) => (
              <button key={x.k} type="button" className="tile placed" onClick={() => quiz.state !== "good" && setPlaced(placed.filter((_, j) => j !== idx))}>
                {x.w}
              </button>
            ))}
            {!placed.length && <span className="t-sub ru" style={{ alignSelf: "center" }}>Нажимай на слова по порядку</span>}
          </div>
          <div className="tiles" style={{ justifyContent: "center" }}>
            {pool
              .filter((x) => !placed.includes(x))
              .map((x) => (
                <button key={x.k} type="button" className="tile" onClick={() => setPlaced([...placed, x])}>
                  {x.w}
                </button>
              ))}
          </div>
          <div className="row wrap" style={{ justifyContent: "space-between" }}>
            <Feedback state={quiz.state} praise={quiz.praise} missText={["Порядок другой. Нажми на слово, чтобы убрать его.", "순서가 달라요."]} />
            {quiz.state === "miss" && (
              <button type="button" className="btn btn-ghost" onClick={() => setPlaced([])}>
                <Icon name="RotateCcw" size={20} /> Сначала
              </button>
            )}
          </div>
          {single && null}
        </>
      )}
    </div>
  );
}

// ---------------- handwriting ----------------

const TOL_END = 24; // how far a stroke may start/end from the model, in 0..100 units
const TOL_PATH = 15;

function resample(pts, n = 24) {
  if (pts.length < 2) return pts;
  const d = [0];
  for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = d[d.length - 1] || 1;
  const out = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const t = (k / (n - 1)) * L;
    while (j < d.length - 2 && d[j + 1] < t) j++;
    const seg = d[j + 1] - d[j] || 1;
    const u = (t - d[j]) / seg;
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * u, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * u]);
  }
  return out;
}

function meanDist(a, b) {
  const A = resample(a);
  const B = resample(b);
  let s = 0;
  for (let i = 0; i < A.length; i++) s += Math.hypot(A[i][0] - B[i][0], A[i][1] - B[i][1]);
  return s / A.length;
}

function judge(model, drawn) {
  if (drawn.length < model.length) return { ok: false, why: "count-less" };
  if (drawn.length > model.length) return { ok: false, why: "count-more" };
  for (let i = 0; i < model.length; i++) {
    const m = model[i];
    const s = drawn[i];
    const start = s[0];
    const end = s[s.length - 1];
    const ms = m[0];
    const me = m[m.length - 1];
    const fwd = meanDist(m, s);
    const back = meanDist([...m].reverse(), s);
    if (back + 4 < fwd && back < TOL_PATH) return { ok: false, why: "direction", stroke: i };
    // Is this stroke actually another one of the model (wrong order)?
    const other = model.findIndex((o, k) => k !== i && meanDist(o, s) < TOL_PATH && meanDist(o, s) < fwd);
    if (other >= 0 && fwd > TOL_PATH) return { ok: false, why: "order", stroke: i };
    if (fwd > TOL_PATH * 1.4 || Math.hypot(start[0] - ms[0], start[1] - ms[1]) > TOL_END * 1.3 || Math.hypot(end[0] - me[0], end[1] - me[1]) > TOL_END * 1.3) return { ok: false, why: "shape", stroke: i };
  }
  return { ok: true };
}

const WHY = {
  "count-less": ["Не хватает чёрточки. Посмотри на образец.", "획이 모자라요."],
  "count-more": ["Лишняя чёрточка. Каждую линию — одним движением.", "획이 너무 많아요."],
  direction: ["Линия в другую сторону. Сверху вниз, слева направо.", "방향이 반대예요."],
  order: ["Другой порядок. Смотри на цифры.", "획 순서가 달라요."],
  shape: ["Форма немного не та. Веди по серой букве.", "모양을 다시 따라 써 봐요."],
};

function pathD(s) {
  return s.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
}

export function Trace({ step, unitId, onScore, onReady }) {
  const list = step.jamo.filter((j) => STROKES[j]);
  const quiz = useQuiz(list.length, { onScore, onReady, unitId, kind: "trace" });
  const cur = list[Math.min(quiz.i, list.length - 1)];
  const model = STROKES[cur] || [];
  const [strokes, setStrokes] = useState([]);
  const [why, setWhy] = useState(null);
  const [demo, setDemo] = useState(0);
  const drawing = useRef(null);
  const pad = useRef(null);
  const [, force] = useState(0);

  useEffect(() => {
    setStrokes([]);
    setWhy(null);
    setDemo((d) => d + 1);
  }, [quiz.i]);

  const pt = (e) => {
    const r = pad.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100];
  };
  const down = (e) => {
    if (quiz.state === "good") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = [pt(e)];
    setWhy(null);
    force((x) => x + 1);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const p = pt(e);
    const last = drawing.current[drawing.current.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 0.8) {
      drawing.current.push(p);
      force((x) => x + 1);
    }
  };
  const up = () => {
    const s = drawing.current;
    drawing.current = null;
    if (!s || s.length < 2) return force((x) => x + 1);
    const next = [...strokes, s];
    setStrokes(next);
    if (next.length >= model.length) {
      const r = judge(model, next);
      if (r.ok) {
        say(cur === "ㅇ" ? "이응" : cur);
        quiz.answer(true, { jamo: cur });
      } else {
        setWhy(r.why);
        quiz.answer(false, { jamo: cur, why: r.why });
        setTimeout(() => setStrokes([]), 1400);
        setDemo((d) => d + 1);
      }
    }
  };

  const live = drawing.current;
  return (
    <div className="col fade-in" style={{ gap: 18 }}>
      <div className="row wrap" style={{ justifyContent: "space-between" }}>
        <h2 className="act-title">
          <T ru="Напиши букву пальцем" ko="손가락으로 따라 써 보세요" />
        </h2>
        <Progress i={quiz.i} total={list.length} />
      </div>
      {quiz.state === "done" ? (
        <DoneNote />
      ) : (
        <div className="trace-wrap">
          <div
            className="trace-pad"
            ref={pad}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            role="img"
            aria-label={"Поле для письма: " + cur}
          >
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <path d="M50 4V96M4 50H96" stroke="#F0EBE2" strokeWidth="0.6" strokeDasharray="2 2" />
              {model.map((s, k) => (
                <path key={k} d={pathD(s)} stroke="#E9E4DA" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              ))}
              {model.map((s, k) => (
                <path
                  key={"d" + demo + k}
                  d={pathD(s)}
                  stroke="#F59E0B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset="1"
                  style={{ animation: `draw 0.7s ${k * 0.8}s forwards` }}
                />
              ))}
              {model.map((s, k) => (
                <g key={"n" + k}>
                  <circle cx={s[0][0]} cy={s[0][1]} r="4.2" fill="#0F766E" />
                  <text x={s[0][0]} y={s[0][1] + 1.6} fontSize="5" textAnchor="middle" fill="#fff" fontWeight="700" fontFamily="Nunito, sans-serif">
                    {k + 1}
                  </text>
                </g>
              ))}
              {[...strokes, ...(live ? [live] : [])].map((s, k) => (
                <path key={"u" + k} d={pathD(s)} stroke={quiz.state === "good" ? "#15803D" : "#1F2A44"} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              ))}
            </svg>
          </div>
          <div className="col" style={{ gap: 14 }}>
            <div className="card row" style={{ padding: 18, gap: 16, justifyContent: "center" }}>
              <span className="glyph" style={{ fontSize: 96 }}>{cur}</span>
              <MiniSpeaker text={cur === "ㅇ" ? "이응" : cur} />
            </div>
            <div className="ru muted" style={{ fontSize: 15 }}>
              Начинай с зелёной цифры 1. Каждая линия — одним движением, не отрывая пальца.
            </div>
            <div className="row wrap" style={{ gap: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setDemo((d) => d + 1)}>
                <Icon name="Play" size={20} /> Показать
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => (setStrokes([]), setWhy(null))} disabled={quiz.state === "good"}>
                <Icon name="Eraser" size={20} /> Стереть
              </button>
            </div>
            <Feedback state={quiz.state} praise={quiz.praise} missText={why ? WHY[why] : undefined} />
          </div>
        </div>
      )}
    </div>
  );
}
