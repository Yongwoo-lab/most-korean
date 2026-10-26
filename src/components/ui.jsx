import { useEffect, useState } from "react";
import { ICONS } from "./icons.js";
import { say, sayAll, stop } from "../lib/speech.js";
import { currentProfile, useStore } from "../lib/store.js";

export function Icon({ name, size = 24, ...rest }) {
  const C = ICONS[name] || ICONS.Circle;
  return <C size={size} strokeWidth={2} aria-hidden="true" {...rest} />;
}

export function Mascot({ size = 72, mood = "happy" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" role="img" aria-label="Мишка">
      <circle cx="18" cy="18" r="11" fill="#B7794A" />
      <circle cx="54" cy="18" r="11" fill="#B7794A" />
      <circle cx="18" cy="18" r="5" fill="#E7B48A" />
      <circle cx="54" cy="18" r="5" fill="#E7B48A" />
      <circle cx="36" cy="40" r="28" fill="#C98B5A" />
      <ellipse cx="36" cy="50" rx="14" ry="11" fill="#F3D9B8" />
      {mood === "think" ? (
        <>
          <path d="M22 36h8M42 36h8" stroke="#1F2A44" strokeWidth="3" strokeLinecap="round" />
          <circle cx="40" cy="55" r="2.6" fill="#1F2A44" />
        </>
      ) : (
        <>
          <circle cx="26" cy="36" r="4" fill="#1F2A44" />
          <circle cx="46" cy="36" r="4" fill="#1F2A44" />
          <circle cx="27.3" cy="34.6" r="1.3" fill="#fff" />
          <circle cx="47.3" cy="34.6" r="1.3" fill="#fff" />
          <path d={mood === "wow" ? "M31 53 Q36 60 41 53 Z" : "M31 53 Q36 57 41 53"} stroke="#1F2A44" strokeWidth="2.2" fill={mood === "wow" ? "#1F2A44" : "none"} strokeLinecap="round" />
        </>
      )}
      <ellipse cx="36" cy="46" rx="4.5" ry="3.2" fill="#1F2A44" />
      <circle cx="19" cy="47" r="4" fill="#F59E8B" opacity="0.5" />
      <circle cx="53" cy="47" r="4" fill="#F59E8B" opacity="0.5" />
    </svg>
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

export function Avatar({ avatar, size = 56 }) {
  const color = { cat: "#FDE68A", dog: "#BAE6FD", rabbit: "#FBCFE8", bird: "#BBF7D0", fish: "#C7D2FE", turtle: "#FED7AA" }[avatar] || "#E3F2EE";
  const icon = { cat: "Cat", dog: "Dog", rabbit: "Rabbit", bird: "Bird", fish: "Fish", turtle: "Turtle" }[avatar] || "User";
  return (
    <span style={{ width: size, height: size, borderRadius: size / 2, background: color, display: "grid", placeItems: "center", color: "#1F2A44", flexShrink: 0 }}>
      <Icon name={icon} size={size * 0.52} />
    </span>
  );
}

export function PicTile({ icon, size = 84, tone = "teal" }) {
  const bg = { teal: "var(--teal-soft)", coral: "var(--coral-soft)", navy: "var(--navy-soft)", amber: "var(--amber-soft)" }[tone];
  const fg = { teal: "var(--teal-d)", coral: "var(--coral)", navy: "var(--navy)", amber: "var(--warn)" }[tone];
  return (
    <span className="pic-tile" style={{ width: size, height: size, background: bg, color: fg }}>
      <Icon name={icon} size={size * 0.55} />
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
