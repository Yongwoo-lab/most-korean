import { useState } from "react";
import { AVATARS, addProfile, selectProfile, updateProfile, useStore } from "../lib/store.js";
import { Avatar, Icon, Mascot, Pic } from "../components/ui.jsx";
import { say, sayAll } from "../lib/speech.js";

export default function Profiles({ go }) {
  const s = useStore();
  const [adding, setAdding] = useState(s.profiles.length === 0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("cat");
  const [sound, setSound] = useState(false);

  const create = () => {
    if (!name.trim()) return;
    addProfile(name.trim(), avatar);
    updateProfile((p) => ({ ...p, sound }));
    go("home");
  };

  return (
    <div className="page welcome" style={{ paddingTop: 24, maxWidth: 980 }}>
      <div className="welcome-logo">
        <img src="logo.svg" alt="Мост · 다리" height="72" />
      </div>
      <button type="button" className="login-local" style={{ marginBottom: 16 }} onClick={() => go("login")}>
        ← 기관 로그인 · Вход через центр
      </button>
      <div className="welcome-hero">
        <Mascot size={96} />
        <div className="col" style={{ gap: 4, flex: 1 }}>
          <h1 className="display welcome-title">Кто будет учиться?</h1>
          <div className="ko welcome-sub">누가 공부할까요?</div>
        </div>
        <button type="button" className="speaker" style={{ width: 64, height: 64 }} aria-label="Слушать вопрос" onClick={() => sayAll([["Кто будет учиться?", "ru"], ["누가 공부할까요?", "ko"]])}>
          <Icon name="Volume2" size={30} />
        </button>
      </div>

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        {s.profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            className={"card col profile-card" + (s.current === p.id ? " current" : "")}
            onClick={() => {
              selectProfile(p.id);
              say(p.name, "ru");
              go("home");
            }}
          >
            <Avatar avatar={p.avatar} size={96} />
            <div style={{ fontWeight: 700, fontSize: 21 }}>{p.name}</div>
          </button>
        ))}
        {!adding && (
          <button type="button" className="card col profile-card add" onClick={() => setAdding(true)}>
            <span className="add-plus">
              <Icon name="Plus" size={36} />
            </span>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Новый ученик</div>
            <div className="muted">새 친구</div>
          </button>
        )}
      </div>

      {adding && (
        <div className="card col fade-in" style={{ padding: "26px clamp(18px, 3vw, 32px)", gap: 22, marginTop: 24 }}>
          <div className="row" style={{ gap: 14 }}>
            <div className="bubble ru" style={{ flex: 1 }}>
              Привет! Я Мишка. Я помогу тебе учить корейский. Как тебя зовут?
            </div>
          </div>
          <div className="field">
            <label htmlFor="pname" style={{ fontWeight: 700 }}>
              Имя · 이름
            </label>
            <input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Алина" autoComplete="off" maxLength={24} />
          </div>
          <div className="col" style={{ gap: 10 }}>
            <div style={{ fontWeight: 700 }}>Выбери картинку · 그림을 골라요</div>
            <div className="row wrap" style={{ gap: 12 }}>
              {AVATARS.map((a) => (
                <button key={a.id} type="button" className="avatar-pick" aria-pressed={avatar === a.id} aria-label={a.id} onClick={() => setAvatar(a.id)}>
                  <Avatar avatar={a.id} size={72} />
                </button>
              ))}
            </div>
          </div>
          <div className="col" style={{ gap: 10 }}>
            <div style={{ fontWeight: 700 }}>Как тебе удобнее? · 어떻게 할까요?</div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <button type="button" aria-pressed={!sound} onClick={() => setSound(false)} className="mode-card">
                <span className="row" style={{ gap: 12, fontWeight: 800, fontSize: 18 }}>
                  <Pic pic="open-book" size={40} /> Я умею читать по-русски
                </span>
                <span className="muted">Задания написаны текстом. 러시아어 글을 읽을 수 있어요.</span>
              </button>
              <button type="button" aria-pressed={sound} onClick={() => setSound(true)} className="mode-card">
                <span className="row" style={{ gap: 12, fontWeight: 800, fontSize: 18 }}>
                  <Pic pic="ear" size={40} /> Лучше голосом
                </span>
                <span className="muted">Мишка читает задания вслух. 글 대신 소리로 들어요.</span>
              </button>
            </div>
          </div>
          <div className="row wrap" style={{ justifyContent: "flex-end", gap: 12 }}>
            {s.profiles.length > 0 && (
              <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>
                Отмена
              </button>
            )}
            <button type="button" className="btn btn-primary" disabled={!name.trim()} onClick={create}>
              Начать · 시작해요
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
