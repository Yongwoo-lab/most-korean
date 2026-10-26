// Runs open-source models inside the browser (Transformers.js on WebGPU,
// or WebAssembly when there is no GPU). Nothing is sent to a server: the
// model files are downloaded once, cached by the browser, then run here.
import { pipeline, TextStreamer, env } from "@huggingface/transformers";

env.allowLocalModels = false;
// The ONNX runtime (about 27 MB) comes from a public CDN instead of our own
// host, so the site itself stays small. Same version as the bundled one.
env.backends.onnx.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${__ORT_VERSION__}/dist/`;

const loaded = {};

function progress(kind) {
  return (p) => {
    if (p.status === "progress" && p.total) {
      self.postMessage({ type: "progress", kind, file: p.file, loaded: p.loaded, total: p.total });
    }
  };
}

async function get(kind, task, model, opts) {
  const key = kind + "|" + model + "|" + opts.device;
  if (!loaded[key]) {
    loaded[key] = pipeline(task, model, { ...opts, progress_callback: progress(kind) }).catch((e) => {
      delete loaded[key];
      throw e;
    });
  }
  return loaded[key];
}

self.onmessage = async (e) => {
  const { id, type } = e.data;
  try {
    if (type === "asr") {
      const { model, device, audio } = e.data;
      const asr = await get("asr", "automatic-speech-recognition", model, {
        device,
        dtype: device === "webgpu" ? { encoder_model: "fp32", decoder_model_merged: "q4" } : "q8",
      });
      const out = await asr(audio, { language: "korean", task: "transcribe", chunk_length_s: 20 });
      self.postMessage({ id, type: "done", text: (out.text || "").trim() });
    } else if (type === "chat") {
      const { model, device, dtype, messages, maxTokens } = e.data;
      const gen = await get("llm", "text-generation", model, { device, dtype });
      let text = "";
      const streamer = new TextStreamer(gen.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (t) => {
          text += t;
          self.postMessage({ id, type: "token", text });
        },
      });
      await gen(messages, { max_new_tokens: maxTokens || 320, do_sample: false, repetition_penalty: 1.1, streamer });
      self.postMessage({ id, type: "done", text });
    } else if (type === "preload") {
      const { kind, model, device, dtype } = e.data;
      if (kind === "asr") {
        await get("asr", "automatic-speech-recognition", model, {
          device,
          dtype: device === "webgpu" ? { encoder_model: "fp32", decoder_model_merged: "q4" } : "q8",
        });
      } else {
        await get("llm", "text-generation", model, { device, dtype });
      }
      self.postMessage({ id, type: "done" });
    }
  } catch (err) {
    self.postMessage({ id, type: "error", message: String(err?.message || err) });
  }
};
