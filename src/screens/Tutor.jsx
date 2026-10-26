import { useEffect, useMemo, useRef, useState } from "react";
import { TopBar } from "./Home.jsx";
import { Icon, Mascot, useProfile } from "../components/ui.jsx";
import { UNITS, nextUnit } from "../data/course.js";
import { chat, progressOf, useMlStatus } from "../lib/ml.js";
import { say } from "../lib/speech.js";
import { logEvent } from "../lib/store.js";

const SCENES = [
  { id: "lunch", ru: "В столовой: заговорить с одноклассником", ko: "급식실에서 친구에게 말 걸기", role: "одноклассник 민준 (10 лет) в школьной столовой", start: "안녕! 같이 먹을래? (Привет! Будешь есть вместе со мной?)" },
  { id: "eraser", ru: "Попросить ластик", ko: "지우개 빌리기", role: "одноклассник 민준 за соседней партой на уроке рисования", start: "뭐 필요해? (Тебе что-то нужно?)" },
  { id: "toilet", ru: "Отпроситься в туалет", ko: "화장실 가도 되는지 묻기", role: "учитель на уроке, говорит вежливо и спокойно", start: "자, 모두 책을 보세요. (Так, все смотрим в учебник.)" },
  { id: "nurse", ru: "В медкабинете", ko: "보건실에서 아픈 곳 말하기", role: "школьная медсестра (보건 선생님), добрая", start: "어서 와요. 어디가 아파요? (Заходи. Что у тебя болит?)" },
];

const MODES = [
  { id: "ask", ru: "Спросить", ko: "물어보기", icon: "CircleHelp" },
  { id: "scene", ru: "Сценка", ko: "상황극", icon: "Drama" },
  { id: "check", ru: "Проверь фразу", ko: "문장 고치기", icon: "SpellCheck" },
];

function systemAsk(unit) {
  const words = (unit?.words || []).map((w) => `${w.ko} (${w.ru})`).join(", ");
  return `Ты — Мишка, добрый учитель корейского языка для детей 7–15 лет из Казахстана и Узбекистана. Они живут в Корее, ходят в корейскую школу и только начинают учить корейский.

ПРАВИЛА
1. Отвечай по-русски, коротко: не больше 4 простых предложений. Если ребёнок пишет по-узбекски или по-казахски, отвечай на этом языке.
2. Корейские слова и примеры пиши только хангылем (한글). Не записывай корейские слова русскими буквами.
3. Объясняй как ребёнку: одно правило и один пример из школьной жизни.
4. Если не уверен, честно скажи и посоветуй спросить учителя.
5. Говори только об учёбе, языке и школе. Если ребёнок спрашивает об опасном или о личных данных (адрес, телефон, пароль), мягко скажи, что об этом лучше поговорить со взрослым, которому он доверяет.
6. Не ругай за ошибки. Можно похвалить за вопрос.

Сейчас ребёнок проходит урок «${unit?.title?.ru || ""}» (${unit?.title?.ko || ""}). Слова урока: ${words || "—"}.`;
}

function systemScene(scene) {
  return `Ты играешь роль: ${scene.role}. Ребёнок из Казахстана или Узбекистана учит корейский, уровень — самый начальный.

ПРАВИЛА
1. Каждая твоя реплика — ОДНА очень короткая простая фраза по-корейски (хангылем), потом в скобках перевод на русский.
2. Используй только самые простые слова: 안녕, 네, 아니요, 이거, 뭐예요, 주세요, 돼요, 아파요, 좋아요.
3. Если ребёнок ошибся, сначала ответь по роли, потом новой строкой: «Подсказка: можно сказать …» и правильная фраза хангылем.
4. Если ребёнок пишет по-русски, ответь по роли по-корейски и подскажи, как сказать это по-корейски.
5. Будь добрым. Никаких тем, кроме этой школьной ситуации.`;
}

const SYSTEM_CHECK = `Ты — Мишка, учитель корейского для детей из Казахстана и Узбекистана.
Ребёнок пишет фразу по-корейски. Ответь так:
1. Первая строка: «Правильно!» или «Почти!».
2. Если есть ошибка, вторая строка: «Лучше так: …» и исправленная фраза хангылем.
3. Одно-два коротких предложения по-русски: что именно исправлено и почему (например, 이에요/예요 после патчима).
Не больше 4 строк. Не придумывай новых правил. Если фраза правильная, просто похвали и скажи, что она значит.`;

// Ready-made explanations written for each lesson come first: they are
// checked by a person, the model only adds to them.
function findFaq(q, current) {
  const text = q.toLowerCase();
  const words = text.split(/[^a-zа-яё\uAC00-\uD7A3]+/i).filter(Boolean);
  let best = null;
  for (const u of UNITS) {
    for (const f of u.faq || []) {
      let score = 0;
      for (const k of f.keys) {
        const key = k.toLowerCase();
        if (/[\uAC00-\uD7A3]/.test(key)) {
          if (text.includes(key)) score += 2;
        } else if (words.some((w) => w.startsWith(key))) score += 1;
      }
      if (score && u.id === current) score += 0.5;
      if (score >= 1.5 && (!best || score > best.score)) best = { ...f, unit: u, score };
    }
  }
  return best;
}

function Rich({ text }) {
  // Make every Hangul run tappable so the child can hear it.
  const parts = text.split(/([가-힣][가-힣\s?!.,~]*)/g).filter(Boolean);
  return parts.map((p, i) =>
    /[가-힣]/.test(p) ? (
      <button key={i} type="button" className="ko-inline" onClick={() => say(p.trim())} style={{ borderBottom: "2px dotted var(--warn)", lineHeight: 1.2 }}>
        {p}
      </button>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export default function Tutor({ go }) {
  const p = useProfile();
  const ml = useMlStatus();
  const unit = useMemo(() => {
    const ids = Object.entries(p?.units || {}).sort((a, b) => b[1].ts - a[1].ts);
    return UNITS.find((u) => u.id === ids[0]?.[0]) || nextUnit(p);
  }, [p]);
  const [mode, setMode] = useState("ask");
  const [scene, setScene] = useState(SCENES[0]);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiErr, setAiErr] = useState(false);
  const abort = useRef(null);
  const end = useRef(null);

  useEffect(() => {
    if (mode === "ask") setMsgs([{ role: "assistant", content: `Привет, ${p?.name || ""}! Спрашивай по-русски или по-корейски. Например: «Почему 연필이에요, а не 연필예요?»` }]);
    if (mode === "check") setMsgs([{ role: "assistant", content: "Напиши фразу по-корейски, а я проверю. Например: 저는 학생예요" }]);
    if (mode === "scene") setMsgs([{ role: "assistant", content: scene.start }]);
    setAiErr(false);
  }, [mode, scene]);
  useEffect(() => {
    if (msgs.length > 1) end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs]);
  useEffect(() => () => abort.current?.abort(), []);

  const send = async (e) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    const history = [...msgs, { role: "user", content: q }];
    setMsgs(history);
    logEvent(unit?.id, "ask", true, { mode, q });

    if (mode === "ask") {
      const f = findFaq(q, unit?.id);
      if (f) {
        setMsgs([...history, { role: "assistant", content: f.ru, checked: true }]);
        return;
      }
    }

    setBusy(true);
    const system = mode === "ask" ? systemAsk(unit) : mode === "scene" ? systemScene(scene) : SYSTEM_CHECK;
    const convo = mode === "check" ? [{ role: "user", content: q }] : history.filter((m) => !m.checked || m.role === "user").slice(-8);
    const messages = [{ role: "system", content: system }, ...convo.map(({ role, content }) => ({ role, content }))];
    setMsgs([...history, { role: "assistant", content: "", pending: true }]);
    abort.current = new AbortController();
    try {
      const out = await chat(
        messages,
        (t) => setMsgs([...history, { role: "assistant", content: t, pending: true }]),
        abort.current.signal,
      );
      setMsgs([...history, { role: "assistant", content: out.trim() || "…" }]);
    } catch {
      setAiErr(true);
      setMsgs([...history, { role: "assistant", content: "Мишка пока не может ответить на этом компьютере. Попробуй спросить учителя или посмотри объяснения в уроке.", error: true }]);
    } finally {
      setBusy(false);
    }
  };

  const loading = ml.llm === "loading";
  const pct = Math.round(progressOf("llm") * 100);

  return (
    <>
      <TopBar go={go} />
      <div className="page" style={{ maxWidth: 980 }}>
        <div className="row wrap" style={{ gap: 14, marginBottom: 14 }}>
          <Mascot size={64} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 className="display" style={{ fontSize: 30, lineHeight: 1.1 }}>Мишка · AI 선생님</h1>
            <div className="row" style={{ gap: 6, color: "var(--teal-d)", fontSize: 14, fontWeight: 700 }}>
              <Icon name="Cpu" size={16} /> Работает внутри этого устройства · 기기 안에서 실행
            </div>
          </div>
        </div>

        <div className="row wrap" style={{ gap: 8, marginBottom: 14 }} role="group" aria-label="Режим">
          {MODES.map((m) => (
            <button key={m.id} type="button" aria-pressed={mode === m.id} className="chip" onClick={() => setMode(m.id)} style={mode === m.id ? { background: "var(--ink)", color: "#fff" } : { boxShadow: "none", border: "2px solid var(--line-strong)" }}>
              <Icon name={m.icon} size={18} /> {m.ru} <span style={{ opacity: 0.7, fontWeight: 400 }}>· {m.ko}</span>
            </button>
          ))}
        </div>

        {mode === "scene" && (
          <div className="row wrap" style={{ gap: 8, marginBottom: 14 }}>
            {SCENES.map((s) => (
              <button key={s.id} type="button" aria-pressed={scene.id === s.id} onClick={() => setScene(s)} className="tile" style={{ fontSize: 15, fontFamily: "Nunito, var(--font)", fontWeight: 700, ...(scene.id === s.id ? { background: "var(--amber-soft)", borderColor: "var(--warn)" } : {}) }}>
                {s.ru}
              </button>
            ))}
          </div>
        )}

        <div className="card col" style={{ padding: "18px clamp(14px, 2.5vw, 24px)", gap: 14, minHeight: 380 }}>
          <div className="chat" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={"msg " + (m.role === "user" ? "me" : "ai")}>
                {m.role === "user" ? m.content : m.content ? <Rich text={m.content} /> : null}
                {m.pending && !m.content && (
                  <span className="ru muted">
                    {loading ? `Мишка просыпается… загружаю модель один раз${pct ? ` (${pct}%)` : ""}` : "Мишка думает…"}
                  </span>
                )}
                {m.checked && (
                  <div className="t-sub ru row" style={{ gap: 6, marginTop: 6 }}>
                    <Icon name="BadgeCheck" size={16} /> Объяснение из урока
                  </div>
                )}
              </div>
            ))}
            <div ref={end} />
          </div>
          {loading && (
            <div style={{ height: 8, borderRadius: 4, background: "var(--line)", overflow: "hidden" }}>
              <div style={{ width: pct + "%", height: 8, background: "var(--teal)", transition: "width 0.3s" }} />
            </div>
          )}
          <form className="composer" onSubmit={send}>
            <label htmlFor="ask" className="sr-only">
              Вопрос
            </label>
            <input id="ask" value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "ask" ? "Спроси по-русски или по-корейски" : "Напиши по-корейски · 한국어로 써 보세요"} autoComplete="off" lang={mode === "ask" ? "ru" : "ko"} />
            <button type="submit" className="icon-btn" style={{ width: 56, height: 56, borderRadius: 18, background: "var(--coral)", color: "#fff" }} aria-label="Отправить" disabled={busy || !input.trim()}>
              <Icon name="Send" />
            </button>
          </form>
          {aiErr && <div className="t-sub ru">Для Мишки нужен браузер Chrome или Edge последней версии. Учитель может подключить AI в настройках.</div>}
        </div>
      </div>
    </>
  );
}
