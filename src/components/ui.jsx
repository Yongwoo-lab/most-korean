import { useEffect, useState } from "react";
import { ICONS } from "./icons.js";
import { AVATAR_PIC, ICON_PIC, UI_PIC, WORD_PIC } from "../data/pictures.js";
import { say, sayAll, stop } from "../lib/speech.js";
import { currentProfile, useStore } from "../lib/store.js";

export function Icon({ name, size = 24, ...rest }) {
  const C = ICONS[name] || ICONS.Circle;
  return <C size={size} strokeWidth={2} aria-hidden="true" {...rest} />;
}

// A colour picture from public/pics (Fluent Emoji). Decorative by default.
export function Pic({ pic, size = 48, alt = "", className = "", style }) {
  return <img className={"pic " + className} src={`pics/${pic}.svg`} width={size} height={size} alt={alt} aria-hidden={alt ? undefined : true} draggable="false" style={style} />;
}

export function picFor(ko, icon) {
  return WORD_PIC[ko] || ICON_PIC[icon] || null;
}

// Мишка, the bear who guides the child. A small badge shows the mood.
export function Mascot({ size = 72, mood = "happy" }) {
  const badge = mood === "wow" ? UI_PIC.sparkles : mood === "think" ? UI_PIC.think : null;
  return (
    <span className={"mascot mood-" + mood} style={{ width: size, height: size }} role="img" aria-label="Мишка">
      <Pic pic={UI_PIC.mascot} size={size} />
      {badge && <Pic pic={badge} size={Math.round(size * 0.42)} className="mascot-badge" />}
    </span>
  );
}

export function useProfile() {
  const s = useStore();
  return currentProfile(s);
}

// The child's Russian help level decides how instructions look.
//   many: Russian first, Korean under it
//   some: Korean first, Russian when tapped
//   none: Korean only
export function T({ ru, ko, as: Tag = "span", className = "", lead }) {
  const p = useProfile();
  const help = p?.help || "many";
  const [open, setOpen] = useState(false);
  if (!ko) return <Tag className={"ru " + className}>{help === "none" ? null : ru}</Tag>;
  if (!ru) return <Tag className={className}>{ko}</Tag>;
  if (help === "many")
    return (
      <Tag className={className}>
        <span className="ru">{ru}</span>
        {lead !== false && (
          <>
            {" "}
            <span className="t-sub">· {ko}</span>
          </>
        )}
      </Tag>
    );
  if (help === "some")
    return (
      <Tag className={className}>
        <button type="button" className="reveal" onClick={() => setOpen(!open)} aria-expanded={open}>
          {ko}
        </button>
        {open && <span className="t-sub ru"> · {ru}</span>}
      </Tag>
    );
  return <Tag className={className}>{ko}</Tag>;
}

// Russian meaning of a Korean word, shown according to the help level.
export function Meaning({ ru, className = "" }) {
  const p = useProfile();
  const help = p?.help || "many";
  const [open, setOpen] = useState(false);
  if (!ru || help === "none") return null;
  if (help === "some")
    return (
      <button type="button" className={"t-sub ru reveal " + className} onClick={(e) => (e.stopPropagation(), setOpen(!open))}>
        {open ? ru : "перевод"}
      </button>
    );
  return <span className={"t-sub ru " + className}>{ru}</span>;
}

export function Speaker({ text, lang = "ko", size = 120, slow = false, label, autoPlay = false, onPlayed }) {
  const [playing, setPlaying] = useState(false);
  const play = async () => {
    setPlaying(true);
    await say(text, lang, { slow });
    setPlaying(false);
    onPlayed?.();
  };
  useEffect(() => {
    if (autoPlay && text) {
      const t = setTimeout(play, 350);
      return () => {
        clearTimeout(t);
        stop();
      };
    }
  }, [text, autoPlay]);
  return (
    <button type="button" className={"speaker" + (playing ? " playing" : "")} style={{ width: size, height: size }} onClick={play} aria-label={label || "Слушать"}>
      <Icon name={slow ? "Snail" : "Volume2"} size={size * 0.45} />
    </button>
  );
}

export function MiniSpeaker({ text, lang = "ko", slow, label }) {
  return (
    <button
      type="button"
      className="icon-btn"
      style={{ width: 40, height: 40, boxShadow: "none", background: "var(--teal-soft)", color: "var(--teal-d)" }}
      onClick={(e) => {
        e.stopPropagation();
        say(text, lang, { slow });
      }}
      aria-label={label || "Слушать"}
    >
      <Icon name={slow ? "Snail" : "Volume2"} size={20} />
    </button>
  );
}

// Reads an instruction aloud in Russian when the child turned sound mode on.
export function useReadAloud(ru, ko) {
  const p = useProfile();
  useEffect(() => {
    if (!p?.sound || !ru) return;
    const t = setTimeout(() => sayAll([[ru, "ru"]]), 300);
    return () => clearTimeout(t);
  }, [ru, ko, p?.sound]);
}

export function Stars({ n = 0, size = 16, of = 3 }) {
  return (
    <span className="stars" aria-label={`${n} / ${of}`}>
      {Array.from({ length: of }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.8z" fill={i < n ? "#F5B800" : "none"} stroke={i < n ? "#B45309" : "#9AA3B5"} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

export const AVATAR_BG = { cat: "#FFE9A8", dog: "#CDEBFF", rabbit: "#FFD9EC", bird: "#D3F5DC", fish: "#DCE2FF", turtle: "#FFE0C2", bear: "#F6E3CF", fox: "#FFE4D2" };

export function Avatar({ avatar, size = 56 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: AVATAR_BG[avatar] || "var(--teal-soft)" }}>
      <Pic pic={AVATAR_PIC[avatar] || "bear"} size={Math.round(size * 0.74)} />
    </span>
  );
}

// Picture for a word: a colour picture when there is one, else the line icon.
export function PicTile({ icon, ko, size = 84, tone = "teal" }) {
  const bg = { teal: "var(--teal-soft)", coral: "var(--coral-soft)", navy: "var(--navy-soft)", amber: "var(--amber-soft)" }[tone];
  const fg = { teal: "var(--teal-d)", coral: "var(--coral)", navy: "var(--navy)", amber: "var(--warn)" }[tone];
  const pic = picFor(ko, icon);
  return (
    <span className="pic-tile" style={{ width: size, height: size, background: bg, color: fg }}>
      {pic ? <Pic pic={pic} size={Math.round(size * 0.72)} /> : <Icon name={icon} size={size * 0.55} />}
    </span>
  );
}

const shuffleCache = new WeakMap();
export function shuffled(arr) {
  if (shuffleCache.has(arr)) return shuffleCache.get(arr);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  shuffleCache.set(arr, a);
  return a;
}
