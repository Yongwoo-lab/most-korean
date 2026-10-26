// Short, quiet sound effects made with Web Audio, so no files are needed.
let ctx;
function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, start, dur, { type = "sine", gain = 0.12 } = {}) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  good() {
    tone(784, 0, 0.18, { type: "triangle" });
    tone(1175, 0.09, 0.3, { type: "triangle" });
  },
  miss() {
    tone(330, 0, 0.16, { type: "sine", gain: 0.08 });
    tone(262, 0.1, 0.22, { type: "sine", gain: 0.08 });
  },
  tap() {
    tone(660, 0, 0.06, { type: "sine", gain: 0.05 });
  },
  done() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.35, { type: "triangle", gain: 0.1 }));
  },
};
