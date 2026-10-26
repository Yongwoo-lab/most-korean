// Text to speech. Uses recorded audio files when a manifest exists
// (public/audio/manifest.json, made by scripts/make-audio.mjs), otherwise the
// voices built into the device's browser.
import { getState } from "./store.js";

let manifest = null;
let manifestLoaded = false;
async function loadManifest() {
  if (manifestLoaded) return manifest;
  manifestLoaded = true;
  try {
    const r = await fetch(import.meta.env.BASE_URL + "audio/manifest.json");
    if (r.ok) manifest = await r.json();
  } catch {}
  return manifest;
}
loadManifest();

let voices = [];
function refreshVoices() {
  try {
    voices = window.speechSynthesis?.getVoices() || [];
  } catch {
    voices = [];
  }
}
if (typeof window !== "undefined" && window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

export function voiceFor(lang) {
  const pref = lang === "ko" ? "ko" : "ru";
  const list = voices.filter((v) => v.lang?.toLowerCase().startsWith(pref));
  // Prefer local (offline) voices, then the nicer named ones.
  return list.sort((a, b) => Number(b.localService) - Number(a.localService))[0] || null;
}

export function voiceStatus() {
  refreshVoices();
  return { ko: voiceFor("ko"), ru: voiceFor("ru"), recorded: !!manifest };
}

let audioEl = null;
let token = 0;

export function stop() {
  token++;
  try {
    window.speechSynthesis?.cancel();
  } catch {}
  if (audioEl) {
    audioEl.pause();
    audioEl = null;
  }
}

function playFile(src, rate) {
  return new Promise((resolve) => {
    audioEl = new Audio(src);
    audioEl.playbackRate = rate;
    audioEl.onended = resolve;
    audioEl.onerror = resolve;
    audioEl.play().catch(resolve);
  });
}

function synth(text, lang, rate) {
  return new Promise((resolve) => {
    const s = window.speechSynthesis;
    if (!s) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ko" ? "ko-KR" : "ru-RU";
    const v = voiceFor(lang);
    if (v) u.voice = v;
    u.rate = rate;
    u.onend = resolve;
    u.onerror = resolve;
    s.speak(u);
    // Some browsers never fire onend; never leave the caller waiting forever.
    setTimeout(resolve, 1500 + text.length * 260);
  });
}

async function speakRaw(text, lang, slow, my) {
  const base = getState().settings.voiceRate || 0.9;
  const rate = slow ? Math.max(0.5, base - 0.35) : base;
  const m = await loadManifest();
  if (my !== token) return;
  const file = m?.[lang]?.[text];
  if (file) return playFile(import.meta.env.BASE_URL + "audio/" + file, slow ? 0.75 : 1);
  return synth(text, lang, rate);
}

// say("화장실", "ko", { slow: true })
export async function say(text, lang = "ko", { slow = false } = {}) {
  if (!text) return;
  stop();
  return speakRaw(text, lang, slow, token);
}

// Several lines one after another, e.g. Russian instruction then Korean word.
export async function sayAll(parts) {
  stop();
  const my = token;
  for (const [text, lang, opts] of parts) {
    if (my !== token) return;
    if (text) await speakRaw(text, lang, !!opts?.slow, my);
  }
}
