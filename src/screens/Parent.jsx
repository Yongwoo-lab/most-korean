// The parents' screen (Russian): what the child learned this week, with the
// new words to listen to together at home.
import { useEffect, useState } from "react";
import { Brand } from "./Home.jsx";
import { Avatar, Icon, MiniSpeaker, Pic, Stars } from "../components/ui.jsx";
import { UNITS } from "../data/course.js";
import { newProfile, streak, totalStars } from "../lib/store.js";
import { call, errorText, logout, useCloud } from "../lib/cloud.js";

const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function lastWeek(p) {
  const out = [];
  const d = new Date();
  d.setDate(d.getDate() - 6);
  for (let i = 0; i < 7; i++) {
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({ day: DAYS[d.getDay()], min: p.minutes?.[k] || 0 });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function Child({ c }) {
  const p = { ...newProfile(c.name, c.avatar || "cat"), ...(c.state || {}) };
  const week = lastWeek(p);
  const total = week.reduce((a, x) => a + x.min, 0);
  const max = Math.max(15, ...week.map((x) => x.min));
  const done = UNITS.filter((u) => p.units?.[u.id]?.done).sort((a, b) => p.units[b.id].ts - p.units[a.id].ts);
  const words = Object.entries(p.words || {})
    .sort((a, b) => b[1].ts - a[1].ts)
    .slice(0, 12);
  return (
    <section className="card col parent-child" style={{ padding: 24, gap: 20 }}>
      <div className="row" style={{ gap: 14 }}>
        <Avatar avatar={c.avatar || "cat"} size={72} />
        <div className="col" style={{ gap: 2, flex: 1 }}>
          <h2 style={{ fontSize: 26 }}>{c.name}</h2>
          <span className="muted">
            {c.state_at ? `Последнее занятие: ${new Date(c.state_at).toLocaleDateString("ru-RU")}` : "Ещё не занимался(ась) в приложении"}
          </span>
        </div>
      </div>
      <div className="center-stats">
        {[
          [total, "минут за неделю", "stopwatch"],
          [streak(p), "дней подряд", "fire"],
          [done.length, `уроков из ${UNITS.length}`, "trophy"],
          [totalStars(p), "звёзд", "glowing-star"],
        ].map(([n, l, pic]) => (
          <div key={l} className="center-stat" style={{ background: "var(--bg)" }}>
            <Pic pic={pic} size={36} />
            <b>{n}</b>
            <span className="muted">{l}</span>
          </div>
        ))}
      </div>
      <div className="col" style={{ gap: 8 }}>
        <b>Занятия за 7 дней (цель — 15 минут в день)</b>
        <div className="week-bars" role="img" aria-label={week.map((x) => `${x.day} ${x.min} мин`).join(", ")}>
          {week.map((x, i) => (
            <div key={i} className="week-bar">
              <span className="week-min">{x.min || ""}</span>
              <span className="week-fill" style={{ height: `${(x.min / max) * 100}%`, background: x.min >= 15 ? "var(--teal)" : x.min ? "var(--amber)" : "var(--line-strong)" }} />
              <span className="week-day">{x.day}</span>
            </div>
          ))}
        </div>
      </div>
      {done.length > 0 && (
        <div className="col" style={{ gap: 8 }}>
          <b>Пройденные уроки</b>
          <div className="row wrap" style={{ gap: 8 }}>
            {done.slice(0, 8).map((u) => (
              <span key={u.id} className="chip" style={{ boxShadow: "none", background: "var(--teal-soft)", height: 40 }}>
                {u.title.ru} <Stars n={p.units[u.id].stars} size={14} />
              </span>
            ))}
          </div>
        </div>
      )}
      {words.length > 0 && (
        <div className="col" style={{ gap: 8 }}>
          <b>Новые слова — послушайте вместе с ребёнком</b>
          <div className="parent-words">
            {words.map(([ko, w]) => (
              <div key={ko} className="parent-word">
                <MiniSpeaker text={ko} />
                <span className="ko" style={{ fontSize: 20, fontWeight: 700 }}>{ko}</span>
                <span className="muted">{w.ru}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ background: "var(--amber-soft)", borderRadius: 16, padding: 16 }}>
        <b>Поиграйте дома 2 минуты.</b> Покажите предмет и спросите: «Как это по-корейски?» Если ребёнок ответил, похвалите: <span className="ko">잘했어!</span> (Молодец!). Не страшно, если вы сами не знаете корейский: ребёнок может стать вашим учителем.
      </div>
    </section>
  );
}

export default function Parent({ go }) {
  const { account } = useCloud();
  const [kids, setKids] = useState(null);
  const [err, setErr] = useState(null);
  const [code, setCode] = useState("");
  const load = () => {
    setErr(null);
    call("my_children").then(setKids, setErr);
  };
  useEffect(load, []);
  const add = async (e) => {
    e.preventDefault();
    try {
      await call("add_child", { p_code: code });
      setCode("");
      load();
    } catch (x) {
      setErr(x);
    }
  };
  return (
    <div lang="ru">
      <header className="topbar">
        <Brand go={() => load()} />
        <span className="spacer" />
        <span className="chip">
          <Pic pic="people-hugging" size={24} /> {account?.name}
        </span>
        <button type="button" className="btn btn-ghost" style={{ minHeight: 44 }} onClick={() => logout().then(() => go("home"))}>
          <Icon name="LogOut" size={20} /> Выйти
        </button>
      </header>
      <div className="page col" style={{ maxWidth: 820, gap: 18 }}>
        <div className="row wrap" style={{ justifyContent: "space-between", gap: 12 }}>
          <h1 className="display" style={{ fontSize: 30 }}>Как учится мой ребёнок</h1>
          <button type="button" className="btn btn-ghost" onClick={load}>
            <Icon name="RefreshCw" size={20} /> Обновить
          </button>
        </div>
        {err && <div className="login-err">{errorText(err)[0]}</div>}
        {!kids && !err && <div className="muted">Загрузка…</div>}
        {kids?.map((c) => <Child key={c.id} c={c} />)}
        <form className="card row wrap" style={{ padding: 18, gap: 12 }} onSubmit={add}>
          <span style={{ flex: "1 1 220px" }}>
            <b>Ещё один ребёнок?</b> <span className="muted">Введите код с его карточки.</span>
          </span>
          <input className="code-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="A1B2C3" aria-label="Код ребёнка" />
          <button type="submit" className="btn btn-teal" disabled={code.trim().length < 6}>
            Добавить
          </button>
        </form>
      </div>
    </div>
  );
}
