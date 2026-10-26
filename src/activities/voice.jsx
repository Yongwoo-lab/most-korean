// Shared pieces for every activity where the child speaks: record, recognise
// on the device, score against one or more model sentences, and explain
// which syllable sounded different. When recognition is off or too slow on
// this device, the child compares their recording with the model instead.
import { useEffect, useRef, useState } from "react";
import { Icon, Mascot, MiniSpeaker } from "../components/ui.jsx";
import { normalize } from "../lib/hangul.js";
import { scoreSpeech } from "../lib/score.js";
import { progressOf, transcribe, useMlStatus } from "../lib/ml.js";
import { micSupported, startRecording, toMono16k } from "../lib/recorder.js";
import { getState, logEvent, updateSettings } from "../lib/store.js";

const SLOW_MS = 25000; // recognition slower than this switches the device to self-check

let failed = false; // recognition could not load in this visit (offline): stop retrying

export function asrMode() {
  return failed ? "self" : getState().settings.asrMode || "auto";
}

// Recording + recognition state for one prompt. Call reset() for the next one.
export function useVoice({ unitId, kind, answers, keys, pass = 0.75, log = true }) {
  const [rec, setRec] = useState(null);
  const [mine, setMine] = useState(null);
  const [result, setResult] = useState(null); // { said, score, ok, parts, tips } | { self: true }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ml = useMlStatus();
  const recRef = useRef(null);
  useEffect(() => () => recRef.current?.cancel(), []);

  const reset = () => {
    setMine(null);
    setResult(null);
    setErr("");
  };

  const finish = async (r = recRef.current) => {
    if (!r) return;
    clearTimeout(r.auto);
    recRef.current = null;
    setRec(null);
    const out = await r.stop();
    setMine(out);
    if (asrMode() === "self") {
      new Audio(out.url).play().catch(() => {});
      setResult({ self: true });
      return;
    }
    setBusy(true);
    const t0 = Date.now();
    try {
      const said = await transcribe(await toMono16k(out.blob));
      const res = scoreSpeech(answers, said, keys, pass);
      const ok = res.score >= pass || res.keys;
      setResult({ ...res, said, ok });
      if (log) logEvent(unitId, kind, ok, { target: res.target, said, score: Math.round(res.score * 100), tips: res.tips.map((x) => x.key) });
      // A model that is already loaded but still this slow will not get faster here.
      if (ml.asr === "ready" && Date.now() - t0 > SLOW_MS) updateSettings({ asrMode: "self" });
    } catch {
      failed = true;
      setResult({ self: true });
    } finally {
      setBusy(false);
    }
  };

  const begin = async () => {
    reset();
    try {
      const r = await startRecording();
      const len = Math.max(...answers.map((a) => normalize(a).length));
      r.auto = setTimeout(() => finish(r), Math.min(10000, 3000 + len * 700));
      recRef.current = r;
      setRec(r);
    } catch {
      setErr("mic");
    }
  };

  // Self-check: the child decides after hearing both.
  const judgeSelf = (ok) => {
    if (log) logEvent(unitId, kind, ok, { target: answers[0], self: true });
    setResult({ self: true, ok, judged: true });
  };

  return { rec, mine, result, busy, err, begin, finish, reset, judgeSelf, loading: ml.asr === "loading" && busy };
}

export function MicButton({ v, size = 116 }) {
  if (!micSupported()) return null;
  return (
    <button
      type="button"
      className={"speaker mic" + (v.rec ? " on" : "")}
      style={{ width: size, height: size }}
      onClick={() => (v.rec ? v.finish() : v.begin())}
      aria-label={v.rec ? "Стоп" : "Записать голос"}
      disabled={v.busy}
    >
      <Icon name={v.rec ? "Square" : "Mic"} size={size * 0.42} />
    </button>
  );
}

export function MicHint({ v, idle = "Нажми и скажи вслух" }) {
  return (
    <div className="col" style={{ gap: 8, maxWidth: 360 }}>
      <div className="ru" style={{ fontSize: 17, fontWeight: 700 }}>
        {v.rec ? "Говори… потом нажми ещё раз" : v.busy ? (v.loading ? "Готовлю распознавание речи…" : "Слушаю…") : micSupported() ? idle : "Скажи вслух вместе с образцом"}
      </div>
      {v.loading && (
        <div className="bar-track">
          <div style={{ width: `${Math.round(progressOf("asr") * 100)}%` }} />
        </div>
      )}
      {v.mine && (
        <button type="button" className="btn btn-ghost" style={{ minHeight: 44, fontSize: 15 }} onClick={() => new Audio(v.mine.url).play()}>
          <Icon name="Play" size={18} /> Послушать себя
        </button>
      )}
      {v.err === "mic" && <div className="ru" style={{ color: "var(--warn)" }}>Микрофон не включён. Попроси учителя разрешить микрофон в браузере.</div>}
    </div>
  );
}

// The sentence with syllables that sounded different marked in yellow.
export function Marked({ text, parts }) {
  if (!parts) return <>{text}</>;
  return parts.map((p, k) => (
    <span key={k} className={p.ok ? undefined : "syl-miss"}>
      {p.ch}
    </span>
  ));
}

// Result panel: score, what was heard, and up to two concrete tips with
// buttons to hear the right syllable and the one that came out.
export function VoiceFeedback({ v, model, goodText = "Отлично! Тебя поняли." }) {
  const r = v.result;
  if (!r) return null;
  if (r.self)
    return (
      <div className="feedback try fade-in" role="status">
        <Mascot size={48} mood="think" />
        <div className="col" style={{ gap: 10, flex: 1 }}>
          <span className="ru">{r.judged ? (r.ok ? "Молодец!" : "Послушай образец и попробуй ещё раз.") : "Сравни сам: послушай образец, потом себя. Похоже?"}</span>
          {!r.judged && (
            <div className="row wrap" style={{ gap: 10 }}>
              <MiniSpeaker text={model} label="Образец" />
              <button type="button" className="btn btn-teal" style={{ minHeight: 44 }} onClick={() => v.judgeSelf(true)}>
                <Icon name="ThumbsUp" size={18} /> Похоже
              </button>
              <button type="button" className="btn btn-ghost" style={{ minHeight: 44 }} onClick={() => v.judgeSelf(false)}>
                <Icon name="RotateCcw" size={18} /> Ещё раз
              </button>
            </div>
          )}
        </div>
      </div>
    );
  const pct = Math.round(r.score * 100);
  return (
    <div className={"feedback " + (r.ok ? "good" : "try") + " fade-in"} role="status">
      <Mascot size={52} mood={r.ok ? "wow" : "think"} />
      <div className="col" style={{ gap: 8, flex: 1 }}>
        <div className="row" style={{ gap: 10 }}>
          <div className="bar-track" style={{ flex: 1 }}>
            <div style={{ width: pct + "%", background: r.ok ? "var(--good)" : "var(--warn)" }} />
          </div>
          <b>{pct}%</b>
        </div>
        <div className="ru">{r.ok ? (r.tips.length ? "Тебя поняли! Можно ещё чётче:" : goodText) : "Почти! Послушай и попробуй ещё раз."}</div>
        {r.tips.map((t) => (
          <div key={t.key} className="tip-row">
            <span className="tip-pair">
              <MiniSpeaker text={t.ch} label={`Правильно: ${t.ch}`} />
              <b className="ko">{t.ch}</b>
              {t.heard && (
                <>
                  <Icon name="ArrowLeftRight" size={16} />
                  <span className="ko muted">{t.heard}</span>
                </>
              )}
            </span>
            <span className="ru">{t.ru}</span>
          </div>
        ))}
        {r.said && (
          <div className="t-sub">
            Я услышал: <span className="ko">{r.said}</span>
          </div>
        )}
      </div>
    </div>
  );
}
