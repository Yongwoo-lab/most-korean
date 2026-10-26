// Record the child's voice. Gives back a playable URL and 16 kHz mono
// samples for speech recognition.

export function micSupported() {
  return !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
}

export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const rec = new MediaRecorder(stream);
  const chunks = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start();
  const started = Date.now();

  return {
    async stop() {
      await new Promise((resolve) => {
        rec.onstop = resolve;
        rec.stop();
      });
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
      return { blob, url: URL.createObjectURL(blob), seconds: (Date.now() - started) / 1000 };
    },
    cancel() {
      try {
        rec.stop();
      } catch {}
      stream.getTracks().forEach((t) => t.stop());
    },
  };
}

export async function toMono16k(blob) {
  const buf = await blob.arrayBuffer();
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx();
  const decoded = await ctx.decodeAudioData(buf);
  ctx.close();
  const off = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
  const src = off.createBufferSource();
  src.buffer = decoded;
  src.connect(off.destination);
  src.start();
  const out = await off.startRendering();
  return out.getChannelData(0);
}
