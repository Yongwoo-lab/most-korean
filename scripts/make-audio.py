"""Records every line in speech/lines.json with Supertonic 3, an open-source
text-to-speech model that speaks both Korean and Russian (Supertone,
OpenRAIL-M weights, MIT code). Runs on the build machine, not in the
child's browser; the app then plays the files instead of the device voice.

    pip install supertonic soundfile
    python scripts/make-audio.py            # public/audio/*.mp3 + manifest.json
    python scripts/make-audio.py --samples  # also one sample per voice

Voices: KO_VOICE and RU_VOICE (default F1 and F2). Files are named by a hash
of text + voice + settings, so a rerun only records new or changed lines.
"""

import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from supertonic import TTS

OUT = Path("public/audio")
KO_VOICE = os.getenv("KO_VOICE", "F1")
RU_VOICE = os.getenv("RU_VOICE", "F2")
STEPS = int(os.getenv("TTS_STEPS", "12"))
SPEED = {"ko": 0.95, "koSlow": 0.72, "ru": 1.0}

HANGUL_RUN = re.compile(r"[ᄀ-ᇿ㄰-㆏가-힣]+(?:[\s,.?!~'’]*[ᄀ-ᇿ㄰-㆏가-힣]+)*[?!.~]?")

# A letter on its own is read by its sound (vowels) or its name (consonants).
VOWEL = dict(zip("ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ", "아애야얘어에여예오와왜외요우워웨위유으의이"))
CONSONANT = {
    "ㄱ": "기역", "ㄲ": "쌍기역", "ㄴ": "니은", "ㄷ": "디귿", "ㄸ": "쌍디귿", "ㄹ": "리을", "ㅁ": "미음",
    "ㅂ": "비읍", "ㅃ": "쌍비읍", "ㅅ": "시옷", "ㅆ": "쌍시옷", "ㅇ": "이응", "ㅈ": "지읒", "ㅉ": "쌍지읒",
    "ㅊ": "치읓", "ㅋ": "키읔", "ㅌ": "티읕", "ㅍ": "피읖", "ㅎ": "히읗",
}


def readable_ko(text: str) -> str:
    t = text
    for k, v in {**VOWEL, **CONSONANT}.items():
        t = t.replace(k, v)
    return t.replace("'", "").replace("‘", "").replace("’", "").strip()


def readable_ru(text: str) -> str:
    t = re.sub(r"\s*=\s*", " — ", text)
    t = t.replace("«", "").replace("»", "").replace("○", "").replace("…?", "?").replace("…", ",")
    t = re.sub(r"\(([^)]*)\)", r", \1,", t)
    return re.sub(r"\s+", " ", t).strip()


def segments(text: str, lang: str):
    """Russian lines often quote Korean words; each part gets its own language."""
    if lang != "ru":
        return [("ko", readable_ko(text))]
    parts, last = [], 0
    for m in HANGUL_RUN.finditer(text):
        if m.start() > last:
            parts.append(("ru", text[last : m.start()]))
        parts.append(("ko", m.group(0)))
        last = m.end()
    if last < len(text):
        parts.append(("ru", text[last:]))
    out = []
    for lg, s in parts:
        s = readable_ko(s) if lg == "ko" else readable_ru(s)
        if re.search(r"\w", s):
            out.append((lg, s))
    return out


def main():
    lines = json.loads(Path("speech/lines.json").read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    tts = TTS(auto_download=True)
    sr = tts.sample_rate
    print(f"::notice title=make-audio::voices {sorted(tts.voice_style_names)}, sample rate {sr}")
    styles = {}

    def style(name):
        if name not in styles:
            styles[name] = tts.get_voice_style(voice_name=name)
        return styles[name]

    def render(parts, speed_key, path: Path, ko_voice=KO_VOICE, ru_voice=RU_VOICE):
        chunks = []
        gap = np.zeros(int(0.18 * sr), dtype=np.float32)
        for lg, s in parts:
            voice = ko_voice if lg == "ko" else ru_voice
            speed = SPEED["koSlow"] if (speed_key == "koSlow" and lg == "ko") else SPEED[lg]
            wav, _ = tts.synthesize(s, voice_style=style(voice), lang=lg, total_steps=STEPS, speed=speed)
            chunks += [wav.squeeze().astype(np.float32), gap]
        audio = np.concatenate(chunks[:-1]) if chunks else np.zeros(1, dtype=np.float32)
        peak = float(np.max(np.abs(audio))) or 1.0
        audio = audio * (0.89 / peak)
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            sf.write(tmp.name, audio, sr)
            subprocess.run(
                ["ffmpeg", "-loglevel", "error", "-y", "-i", tmp.name, "-ac", "1", "-ar", "24000", "-b:a", "48k", str(path)],
                check=True,
            )

    manifest = {"ko": {}, "koSlow": {}, "ru": {}, "voices": {"ko": KO_VOICE, "ru": RU_VOICE}, "engine": "Supertonic 3"}
    jobs = [("ko", t) for t in lines["ko"]] + [("koSlow", t) for t in lines["ko"]] + [("ru", t) for t in lines["ru"]]
    keep = set()
    made = 0
    for i, (key, text) in enumerate(jobs):
        lang = "ru" if key == "ru" else "ko"
        parts = segments(text, lang)
        if not parts:
            continue
        sig = json.dumps([key, parts, KO_VOICE, RU_VOICE, STEPS, SPEED], ensure_ascii=False)
        name = f"{key}-{hashlib.sha1(sig.encode()).hexdigest()[:12]}.mp3"
        keep.add(name)
        manifest[key][text] = name
        if not (OUT / name).exists():
            render(parts, key, OUT / name)
            made += 1
            if made % 50 == 0:
                print(f"  {i + 1}/{len(jobs)}", flush=True)

    for f in OUT.glob("*.mp3"):
        if f.name not in keep:
            f.unlink()
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False))
    print(f"Recorded {made} new files, {len(keep)} in total.")

    if "--samples" in sys.argv:
        vdir = OUT / "voices"
        vdir.mkdir(exist_ok=True)
        samples = []
        for n in sorted(tts.voice_style_names):
            render([("ko", "안녕하세요. 저는 선생님이에요. 화장실에 가도 돼요?")], "ko", vdir / f"{n}-ko.mp3", ko_voice=n)
            render([("ru", "Привет! Я Мишка. Послушай и выбери картинку.")], "ru", vdir / f"{n}-ru.mp3", ru_voice=n)
            samples.append(n)
        (vdir / "voices.json").write_text(json.dumps(samples))
        print("Voice samples:", ", ".join(samples))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # show the reason in the GitHub Actions summary
        import traceback

        tb = traceback.format_exc().strip().splitlines()
        print(f"::error title=make-audio::{type(e).__name__}: {e} | " + " / ".join(tb[-6:]).replace("\n", " "))
        raise
