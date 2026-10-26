import { useMemo, useState } from "react";
import { TopBar } from "./Home.jsx";
import { Icon, Mascot, MiniSpeaker, PicTile, useProfile } from "../components/ui.jsx";
import { say } from "../lib/speech.js";

export default function Words({ go }) {
  const p = useProfile();
  const [hide, setHide] = useState(false);
  const [open, setOpen] = useState({});
  const list = useMemo(() => Object.entries(p?.words || {}).sort((a, b) => b[1].ts - a[1].ts), [p]);

  return (
    <>
      <TopBar go={go} />
      <div className="page">
        <div className="row wrap" style={{ gap: 14, marginBottom: 18, justifyContent: "space-between" }}>
          <div>
            <h1 className="display" style={{ fontSize: 32 }}>Мои слова · 내 단어장</h1>
            <div className="muted ru">{list.length} слов. Нажми, чтобы услышать.</div>
          </div>
          <div className="seg" role="group" aria-label="Режим">
            <button type="button" aria-pressed={!hide} onClick={() => setHide(false)}>
              Все с переводом
            </button>
            <button type="button" aria-pressed={hide} onClick={() => (setHide(true), setOpen({}))}>
              Проверь себя
            </button>
          </div>
        </div>
        {!list.length ? (
          <div className="card row" style={{ padding: 24, gap: 16 }}>
            <Mascot size={64} mood="think" />
            <span className="ru" style={{ fontSize: 18 }}>
              Пока пусто. Пройди первый урок — и слова появятся здесь.
            </span>
          </div>
        ) : (
          <div className="learn-grid">
            {list.map(([ko, w]) => (
              <button
                key={ko}
                type="button"
                className="learn-card"
                onClick={() => {
                  say(ko);
                  if (hide) setOpen((o) => ({ ...o, [ko]: true }));
                }}
              >
                <div className="row" style={{ gap: 12 }}>
                  {w.icon && <PicTile icon={w.icon} ko={ko} size={56} />}
                  <span className="ko">{ko}</span>
                </div>
                <span className="ru muted" style={{ minHeight: 24 }}>
                  {!hide || open[ko] ? w.ru : "• • •"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
