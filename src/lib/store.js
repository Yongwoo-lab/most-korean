// Profiles, progress and settings, kept in this browser. A profile that
// belongs to a logged-in student (cloud: true) is also copied to the server
// by lib/cloud.js.
import { useSyncExternalStore } from "react";

const KEY = "most.v1";
const listeners = new Set();

const empty = () => ({ profiles: [], current: null, settings: { aiModel: "", ollamaUrl: "", voiceRate: 0.9 } });

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch {}
  return empty();
}

let state = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

function set(next) {
  state = next;
  save();
  listeners.forEach((l) => l());
}

export function useStore() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export function getState() {
  return state;
}

export const AVATARS = [
  { id: "cat", color: "#FDE68A" },
  { id: "dog", color: "#BAE6FD" },
  { id: "rabbit", color: "#FBCFE8" },
  { id: "bird", color: "#BBF7D0" },
  { id: "fish", color: "#C7D2FE" },
  { id: "turtle", color: "#FED7AA" },
  { id: "fox", color: "#FFE4D2" },
  { id: "bear", color: "#F6E3CF" },
];

export function newProfile(name, avatar) {
  return {
    id: "p" + Date.now().toString(36),
    name,
    avatar,
    created: Date.now(),
    help: "many", // many | some | none
    sound: false, // read instructions aloud in Russian
    units: {}, // unitId -> { stars, done, best, ts }
    words: {}, // ko -> { ru, ts, seen }
    days: [], // yyyy-mm-dd strings
    log: [], // { ts, unit, kind, ok }
    minutes: {}, // yyyy-mm-dd -> minutes
  };
}

export function addProfile(name, avatar) {
  const p = newProfile(name, avatar);
  set({ ...state, profiles: [...state.profiles, p], current: p.id });
  return p;
}

export function removeProfile(id) {
  set({ ...state, profiles: state.profiles.filter((p) => p.id !== id), current: state.current === id ? null : state.current });
}

export function selectProfile(id) {
  set({ ...state, current: id });
}

export function currentProfile(s = state) {
  return s.profiles.find((p) => p.id === s.current) || null;
}

export function updateProfile(fn) {
  const p = currentProfile();
  if (!p) return;
  const next = fn(structuredClone(p));
  next.updated = Date.now();
  set({ ...state, profiles: state.profiles.map((x) => (x.id === p.id ? next : x)) });
}

// Puts a whole profile in place (from the server) and makes it current.
export function putProfile(p) {
  const others = state.profiles.filter((x) => x.id !== p.id);
  set({ ...state, profiles: [...others, p], current: p.id });
}

export function updateSettings(patch) {
  set({ ...state, settings: { ...state.settings, ...patch } });
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function finishUnit(unitId, stars) {
  updateProfile((p) => {
    const prev = p.units[unitId] || {};
    p.units[unitId] = { done: true, stars: Math.max(prev.stars || 0, stars), last: stars, ts: Date.now() };
    const d = today();
    if (!p.days.includes(d)) p.days.push(d);
    return p;
  });
}

export function learnWords(words) {
  updateProfile((p) => {
    for (const w of words) {
      if (!w.ko) continue;
      const prev = p.words[w.ko];
      p.words[w.ko] = { ru: w.ru, icon: w.icon || prev?.icon || null, ts: prev?.ts || Date.now(), seen: (prev?.seen || 0) + 1 };
    }
    return p;
  });
}

export function logEvent(unit, kind, ok, detail) {
  updateProfile((p) => {
    p.log.push({ ts: Date.now(), unit, kind, ok, detail });
    if (p.log.length > 2000) p.log = p.log.slice(-2000);
    return p;
  });
}

export function addMinutes(min) {
  updateProfile((p) => {
    const d = today();
    p.minutes[d] = (p.minutes[d] || 0) + min;
    if (!p.days.includes(d)) p.days.push(d);
    return p;
  });
}

export function streak(p) {
  if (!p?.days?.length) return 0;
  const set = new Set(p.days);
  let n = 0;
  const d = new Date();
  if (!set.has(today())) d.setDate(d.getDate() - 1);
  for (;;) {
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!set.has(k)) break;
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function totalStars(p) {
  return Object.values(p?.units || {}).reduce((a, u) => a + (u.stars || 0), 0);
}

export function resetAll() {
  set(empty());
}

export function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}
