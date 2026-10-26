// Speech recognition and the AI teacher. Both run on the child's own
// device: open-source models in the browser (default), or an Ollama server
// the teacher points the app at (optional, Settings).
import { useSyncExternalStore } from "react";
import { getState } from "./store.js";

export const LLM_MODELS = [
  { id: "onnx-community/gemma-3-1b-it-ONNX-GQA", dtype: "q4f16", device: "webgpu", size: "약 1GB", label: "Gemma 3 1B (그래픽카드 있는 PC·태블릿)" },
  { id: "onnx-community/Qwen2.5-0.5B-Instruct", dtype: "q4", device: "wasm", size: "약 0.5GB", label: "Qwen2.5 0.5B (가벼움, 느린 기기용)" },
];
export const ASR_MODEL = "onnx-community/whisper-base";

let worker = null;
let seq = 0;
const pending = new Map();
const listeners = new Set();
let status = { gpu: null, asr: "idle", llm: "idle", progress: {} };

function emit(patch) {
  status = { ...status, ...patch };
  listeners.forEach((l) => l());
}

export function useMlStatus() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => status,
  );
}

async function detectGpu() {
  if (status.gpu !== null) return status.gpu;
  let ok = false;
  try {
    ok = !!(navigator.gpu && (await navigator.gpu.requestAdapter()));
  } catch {}
  emit({ gpu: ok });
  return ok;
}
detectGpu();

function w() {
  if (!worker) {
    worker = new Worker(new URL("./ml.worker.js", import.meta.url), { type: "module" });
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === "progress") {
        const files = { ...(status.progress[m.kind] || {}), [m.file]: [m.loaded, m.total] };
        emit({ progress: { ...status.progress, [m.kind]: files } });
        return;
      }
      const p = pending.get(m.id);
      if (!p) return;
      if (m.type === "token") p.onToken?.(m.text);
      else {
        pending.delete(m.id);
        m.type === "error" ? p.reject(new Error(m.message)) : p.resolve(m);
      }
    };
  }
  return worker;
}

function call(msg, onToken) {
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, onToken });
    w().postMessage({ ...msg, id });
  });
}

export function progressOf(kind) {
  const files = Object.values(status.progress[kind] || {});
  if (!files.length) return 0;
  const [a, b] = files.reduce(([x, y], [l, t]) => [x + l, y + t], [0, 0]);
  return b ? a / b : 0;
}

async function llmChoice() {
  const s = getState().settings;
  const gpu = await detectGpu();
  const pick = LLM_MODELS.find((m) => m.id === s.aiModel) || (gpu ? LLM_MODELS[0] : LLM_MODELS[1]);
  return { ...pick, device: pick.device === "webgpu" && !gpu ? "wasm" : pick.device };
}

// ---- speech recognition ----

export async function transcribe(audio) {
  const gpu = await detectGpu();
  emit({ asr: status.asr === "ready" ? "ready" : "loading" });
  try {
    const r = await call({ type: "asr", model: ASR_MODEL, device: gpu ? "webgpu" : "wasm", audio });
    emit({ asr: "ready" });
    return r.text;
  } catch (e) {
    emit({ asr: "error" });
    throw e;
  }
}

export async function preloadAsr() {
  const gpu = await detectGpu();
  emit({ asr: "loading" });
  try {
    await call({ type: "preload", kind: "asr", model: ASR_MODEL, device: gpu ? "webgpu" : "wasm" });
    emit({ asr: "ready" });
  } catch {
    emit({ asr: "error" });
  }
}

// ---- AI teacher ----

export async function preloadLlm() {
  const m = await llmChoice();
  emit({ llm: "loading" });
  try {
    await call({ type: "preload", kind: "llm", model: m.id, device: m.device, dtype: m.dtype });
    emit({ llm: "ready" });
  } catch {
    emit({ llm: "error" });
  }
}

async function ollamaChat(messages, onToken, signal) {
  const s = getState().settings;
  const base = s.ollamaUrl.replace(/\/$/, "");
  const r = await fetch(base + "/api/chat", {
    method: "POST",
    signal,
    body: JSON.stringify({ model: s.ollamaModel || "gemma3:4b", stream: true, messages, options: { temperature: 0.3, num_predict: 400 } }),
  });
  if (!r.ok || !r.body) throw new Error("ollama " + r.status);
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let text = "";
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      const j = JSON.parse(line);
      if (j.message?.content) {
        text += j.message.content;
        onToken(text);
      }
    }
  }
  return text;
}

export async function chat(messages, onToken, signal) {
  const s = getState().settings;
  if (s.ollamaUrl) return ollamaChat(messages, onToken, signal);
  const m = await llmChoice();
  emit({ llm: status.llm === "ready" ? "ready" : "loading" });
  try {
    const r = await call({ type: "chat", model: m.id, device: m.device, dtype: m.dtype, messages, maxTokens: 320 }, onToken);
    emit({ llm: "ready" });
    return r.text;
  } catch (e) {
    emit({ llm: "error" });
    throw e;
  }
}
