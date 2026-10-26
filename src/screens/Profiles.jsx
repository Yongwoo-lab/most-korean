import { useState } from "react";
import { AVATARS, addProfile, selectProfile, updateProfile, useStore } from "../lib/store.js";
import { Avatar, Icon, Mascot } from "../components/ui.jsx";
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
    <div className="page" style={{ paddingTop: 32, maxWidth: 980 }}>
      <div className="row" style={{ gap: 16, marginBottom: 28 }}>
        <button type="button" className="speaker" style={{ width: 64, height: 64 }} aria-label="Слушать вопрос" onClick={() => sayAll([["Кто будет учиться?", "ru"], ["누가 공부할까요?", "ko"]])}>
          <Icon name="Volume2" size={30} />
        </button>
        <div>
          <h1 className="display" style={{ fontSize: "clamp(30px, 4.5vw, 42px)", lineHeight: 1.15 }}>Кто будет учиться?</h1>
          <div className="muted" style={{ fontSize: 18 }}>누가 공부할까요?</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        {s.profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            className="card col"
            style={{ padding: 24, alignItems: "center", gap: 10, border: s.current === p.id ? "4px solid var(--coral)" : "4px solid transparent" }}
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
          <button type="button" className="card col" style={{ padding: 24, alignItems: "center", justifyContent: "center", gap: 10, background: "var(--teal-soft)", boxShadow: "none", border: "3px dashed #7FB8AC", minHeight: 190 }} onClick={() => setAdding(true)}>
            <Icon name="Plus" size={44} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>Новый ученик</div>
            <div className="muted">새 친구</div>
          </button>
        )}
      </div>

      {adding && (
        <div className="card col fade-in" style={{ padding: "26px clamp(18px, 3vw, 32px)", gap: 22, marginTop: 24 }}>
          <div className="row" style={{ gap: 14 }}>
            <Mascot size={64} />
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
                <button key={a.id} type="button" aria-pressed={avatar === a.id} aria-label={a.id} onClick={() => setAvatar(a.id)} style={{ borderRadius: 40, padding: 4, border: avatar === a.id ? "4px solid var(--coral)" : "4px solid transparent" }}>
                  <Avatar avatar={a.id} size={68} />
                </button>
              ))}
            </div>
          </div>
          <div className="col" style={{ gap: 10 }}>
            <div style={{ fontWeight: 700 }}>Как тебе удобнее? · 어떻게 할까요?</div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <button type="button" aria-pressed={!sound} onClick={() => setSound(false)} className="card col" style={{ padding: 18, gap: 6, textAlign: "left", boxShadow: "none", border: !sound ? "3px solid var(--teal)" : "3px solid var(--line)" }}>
                <span className="row" style={{ gap: 10, fontWeight: 700, fontSize: 17 }}>
                  <Icon name="BookOpen" /> Я умею читать по-русски
                </span>
                <span className="muted">Задания написаны текстом. 러시아어 글을 읽을 수 있어요.</span>
              </button>
              <button type="button" aria-pressed={sound} onClick={() => setSound(true)} className="card col" style={{ padding: 18, gap: 6, textAlign: "left", boxShadow: "none", border: sound ? "3px solid var(--teal)" : "3px solid var(--line)" }}>
                <span className="row" style={{ gap: 10, fontWeight: 700, fontSize: 17 }}>
                  <Icon name="Ear" /> Лучше голосом
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
