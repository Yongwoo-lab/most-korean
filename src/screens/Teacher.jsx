// Teacher and parent view. Teacher text is Korean; the page for parents is
// Russian and prints on one sheet.
import { useEffect, useMemo, useState } from "react";
import { TopBar } from "./Home.jsx";
import { Avatar, Icon, Stars } from "../components/ui.jsx";
import { UNITS } from "../data/course.js";
import { removeProfile, resetAll, streak, totalStars, updateSettings, useStore } from "../lib/store.js";
import { LLM_MODELS, preloadAsr, preloadLlm, progressOf, useMlStatus } from "../lib/ml.js";
import { say, voiceStatus } from "../lib/speech.js";

const KIND_KO = { listen: "듣기", read: "읽기", choose: "상황 고르기", grammar: "받침 규칙", build: "글자 만들기", task: "교과서 지시어", speak: "말하기", order: "문장 만들기", trace: "획순 쓰기" };

function stats(p) {
  const log = p.log || [];
  const byKind = {};
  for (const e of log) {
    if (!KIND_KO[e.kind]) continue;
    const k = (byKind[e.kind] ||= { n: 0, ok: 0 });
    k.n++;
    if (e.ok) k.ok++;
  }
  const speaks = log.filter((e) => e.kind === "speak" && e.detail?.score != null);
  const speakAvg = speaks.length ? Math.round(speaks.reduce((a, e) => a + e.detail.score, 0) / speaks.length) : null;
  const misses = {};
  for (const e of log) {
    if (e.ok || !e.detail) continue;
    const key = e.detail.say || e.detail.word || e.detail.target || e.detail.ko || e.detail.jamo || e.detail.task;
    if (key) misses[key] = (misses[key] || 0) + 1;
  }
  const hard = Object.entries(misses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const asks = log.filter((e) => e.kind === "ask").length;
  const minutes = Object.values(p.minutes || {}).reduce((a, b) => a + b, 0);
  return { byKind, speakAvg, hard, asks, minutes };
}

export function Student({ p, onParent, extra }) {
  const s = stats(p);
  const done = UNITS.filter((u) => p.units?.[u.id]?.done);
  return (
    <div className="card col" style={{ padding: 22, gap: 16 }}>
      <div className="row wrap" style={{ gap: 14 }}>
        <Avatar avatar={p.avatar} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{p.name}</div>
          <div className="muted" style={{ fontSize: 14 }}>
            완료 {done.length}단원 · 별 {totalStars(p)}개 · 연속 {streak(p)}일 · 누적 {s.minutes}분 · 낱말 {Object.keys(p.words || {}).length}개 · AI 질문 {s.asks}번
          </div>
        </div>
        <button type="button" className="btn btn-ghost" style={{ minHeight: 44, fontSize: 15 }} onClick={onParent}>
          <Icon name="Printer" size={18} /> 부모님용 (러시아어)
        </button>
      </div>
      {extra}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>단원 진도</div>
          <div className="row wrap" style={{ gap: 6 }}>
            {UNITS.filter((u) => !u.soon).map((u) => (
              <span key={u.id} className="chip" style={{ height: 32, fontSize: 13, boxShadow: "none", background: p.units?.[u.id]?.done ? "var(--teal-soft)" : "#F4F2EE", color: p.units?.[u.id]?.done ? "var(--teal-d)" : "var(--muted)" }}>
                {u.id} {u.title.ko} {p.units?.[u.id]?.done ? `★${p.units[u.id].stars}` : ""}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>활동별 첫 시도 정답률</div>
          <table className="rec">
            <tbody>
              {Object.entries(s.byKind).map(([k, v]) => (
                <tr key={k}>
                  <td>{KIND_KO[k]}</td>
                  <td style={{ width: "50%" }}>
                    <div style={{ height: 8, borderRadius: 4, background: "var(--line)", overflow: "hidden" }}>
                      <div style={{ width: `${(v.ok / v.n) * 100}%`, height: 8, background: "var(--teal)" }} />
                    </div>
                  </td>
                  <td style={{ width: 60 }}>{Math.round((v.ok / v.n) * 100)}%</td>
                </tr>
              ))}
              {s.speakAvg != null && (
                <tr>
                  <td>말하기 일치율 평균</td>
                  <td />
                  <td>{s.speakAvg}%</td>
                </tr>
              )}
              {!Object.keys(s.byKind).length && (
                <tr>
                  <td className="muted">아직 기록이 없어요</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>자주 틀린 것</div>
          {s.hard.length ? (
            <div className="row wrap" style={{ gap: 8 }}>
              {s.hard.map(([k, n]) => (
                <button key={k} type="button" className="tile" style={{ fontSize: 20 }} onClick={() => say(k)}>
                  {k} <span className="t-sub">×{n}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="muted">없어요</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ParentSheet({ p, onClose, cloud }) {
  const s = stats(p);
  const words = Object.entries(p.words || {})
    .sort((a, b) => b[1].ts - a[1].ts)
    .slice(0, 12);
  const done = UNITS.filter((u) => p.units?.[u.id]?.done);
  const last = done.sort((a, b) => p.units[b.id].ts - p.units[a.id].ts)[0];
  return (
    <div className="card col fade-in" style={{ padding: 28, gap: 18, maxWidth: 720, margin: "0 auto" }} lang="ru">
      <div className="row no-print" style={{ justifyContent: "space-between" }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          <Icon name="ChevronLeft" /> 돌아가기
        </button>
        <button type="button" className="btn btn-teal" onClick={() => window.print()}>
          <Icon name="Printer" /> 인쇄
        </button>
      </div>
      <div className="row" style={{ gap: 14 }}>
        <Avatar avatar={p.avatar} size={64} />
        <div>
          <div className="muted ru">Отчёт для родителей · {new Date().toLocaleDateString("ru-RU")}</div>
          <h2 className="ru" style={{ fontSize: 26 }}>{p.name} учит корейский</h2>
        </div>
      </div>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {[
          [done.length, "уроков пройдено"],
          [Object.keys(p.words || {}).length, "слов выучено"],
          [s.minutes, "минут занятий"],
        ].map(([n, l]) => (
          <div key={l} style={{ background: "var(--bg)", borderRadius: 16, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{n}</div>
            <div className="muted ru" style={{ fontSize: 14 }}>{l}</div>
          </div>
        ))}
      </div>
      {last && (
        <div className="ru" style={{ fontSize: 17 }}>
          Последний урок: <b>{last.title.ru}</b> ({last.title.ko}) <Stars n={p.units[last.id].stars} />
        </div>
      )}
      {words.length > 0 && (
        <div className="col" style={{ gap: 8 }}>
          <b className="ru">Новые слова</b>
          <div className="row wrap" style={{ gap: 8 }}>
            {words.map(([ko, w]) => (
              <span key={ko} className="chip" style={{ boxShadow: "none", background: "var(--teal-soft)", height: 38 }}>
                <span className="ko" style={{ fontSize: 18 }}>{ko}</span> <span className="ru" style={{ fontWeight: 400 }}>{w.ru}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <div style={{ background: "var(--amber-soft)", borderRadius: 16, padding: 16 }} className="ru">
        <b>Поиграйте дома 2 минуты.</b> Покажите предмет и спросите: «Как это по-корейски?» Если ребёнок ответил — похвалите: <span className="ko">잘했어!</span> (Молодец!). Не страшно, если вы сами не знаете корейский: ребёнок может стать вашим учителем.
      </div>
      <div className="t-sub ru">
        {cloud ? "Данные видят только учителя центра и вы. Пароль ребёнка нигде не показывается." : "Данные ребёнка хранятся только на этом устройстве и никуда не отправляются."}
      </div>
    </div>
  );
}

export function Settings() {
  const st = useStore();
  const ml = useMlStatus();
  const [voices, setVoices] = useState(voiceStatus());
  useEffect(() => {
    const t = setTimeout(() => setVoices(voiceStatus()), 800);
    return () => clearTimeout(t);
  }, []);
  const s = st.settings;
  const label = { idle: "아직 안 받음", loading: "받는 중", ready: "준비됨", error: "이 기기에서 안 됨" };
  return (
    <div className="card col" style={{ padding: 22, gap: 20 }}>
      <h2 className="display" style={{ fontSize: 24 }}>설정</h2>

      <div className="col" style={{ gap: 8 }}>
        <b>음성 (듣기)</b>
        <div className="muted" style={{ fontSize: 15 }}>
          한국어 목소리: {voices.ko ? `${voices.ko.name}` : "없음 — 기기 설정에서 한국어 음성을 추가해 주세요 (Windows: 설정 › 시간 및 언어 › 음성)"}
          <br />
          러시아어 목소리: {voices.ru ? voices.ru.name : "없음 (소리로 듣기 모드에 필요)"}
          {voices.recorded && <><br />녹음된 음성 파일 사용 중</>}
        </div>
        <div className="row wrap" style={{ gap: 10 }}>
          <button type="button" className="btn btn-ghost" style={{ minHeight: 44 }} onClick={() => say("안녕하세요. 화장실에 가도 돼요?")}>
            <Icon name="Volume2" size={18} /> 들어 보기
          </button>
          <label className="row" style={{ gap: 8 }}>
            속도
            <input type="range" min="0.6" max="1.1" step="0.05" value={s.voiceRate || 0.9} onChange={(e) => updateSettings({ voiceRate: Number(e.target.value) })} />
          </label>
        </div>
      </div>

      <div className="col" style={{ gap: 8 }}>
        <b>음성 인식 (말하기 채점)</b>
        <div className="muted" style={{ fontSize: 15 }}>
          Whisper(오픈소스)를 이 기기 브라우저 안에서 돌려요. 처음 한 번 약 80~150MB를 받고, 그다음엔 저장된 파일을 써요. 아이 목소리는 밖으로 나가지 않아요. 상태: <b>{label[ml.asr]}</b>
          {ml.asr === "loading" && ` ${Math.round(progressOf("asr") * 100)}%`}
        </div>
        <div>
          <button type="button" className="btn btn-ghost" style={{ minHeight: 44 }} onClick={preloadAsr} disabled={ml.asr === "loading" || ml.asr === "ready"}>
            <Icon name="Download" size={18} /> 미리 받아 두기
          </button>
        </div>
      </div>

      <div className="col" style={{ gap: 8 }}>
        <b>AI 선생님 (미쉬카)</b>
        <div className="muted" style={{ fontSize: 15 }}>
          오픈소스 언어 모델을 이 기기 브라우저 안에서 돌려요. 그래픽카드(WebGPU) {ml.gpu ? "있음" : ml.gpu === false ? "없음 → 가벼운 모델 사용" : "확인 중"}. 상태: <b>{label[ml.llm]}</b>
          {ml.llm === "loading" && ` ${Math.round(progressOf("llm") * 100)}%`}
        </div>
        <div className="field" style={{ maxWidth: 520 }}>
          <label htmlFor="model">모델</label>
          <select id="model" value={s.aiModel} onChange={(e) => updateSettings({ aiModel: e.target.value })}>
            <option value="">자동 선택</option>
            {LLM_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} · {m.size}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button type="button" className="btn btn-ghost" style={{ minHeight: 44 }} onClick={preloadLlm} disabled={ml.llm === "loading" || ml.llm === "ready"}>
            <Icon name="Download" size={18} /> 미리 받아 두기 (와이파이에서)
          </button>
        </div>
        <details>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>센터 PC의 Ollama 사용 (선택)</summary>
          <div className="col" style={{ gap: 8, marginTop: 10 }}>
            <div className="muted" style={{ fontSize: 14 }}>
              더 큰 모델을 쓰고 싶을 때만. PC에서 <code>OLLAMA_ORIGINS=*</code> 로 Ollama를 켜고 주소를 넣으세요. 비워 두면 브라우저 안 모델을 써요.
            </div>
            <div className="field" style={{ maxWidth: 520 }}>
              <label htmlFor="ollama">Ollama 주소</label>
              <input id="ollama" placeholder="http://localhost:11434" value={s.ollamaUrl} onChange={(e) => updateSettings({ ollamaUrl: e.target.value.trim() })} />
            </div>
            <div className="field" style={{ maxWidth: 520 }}>
              <label htmlFor="omodel">Ollama 모델</label>
              <input id="omodel" placeholder="gemma3:4b" value={s.ollamaModel || ""} onChange={(e) => updateSettings({ ollamaModel: e.target.value.trim() })} />
            </div>
          </div>
        </details>
      </div>

      <div className="col" style={{ gap: 8 }}>
        <b>기록</b>
        <div className="muted" style={{ fontSize: 15 }}>모든 기록은 이 기기의 브라우저에만 저장돼요.</div>
        <div>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ minHeight: 44, color: "var(--coral)" }}
            onClick={() => {
              if (confirm("이 기기의 모든 학생과 기록을 지울까요? 되돌릴 수 없어요.")) resetAll();
            }}
          >
            <Icon name="Trash2" size={18} /> 모든 기록 지우기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Teacher({ go }) {
  const st = useStore();
  const [tab, setTab] = useState("rec");
  const [parent, setParent] = useState(null);
  const p = st.profiles.find((x) => x.id === parent);
  return (
    <>
      <div className="no-print">
        <TopBar go={go} />
      </div>
      <div className="page" style={{ maxWidth: 1100 }}>
        {p ? (
          <ParentSheet p={p} onClose={() => setParent(null)} />
        ) : (
          <>
            <div className="row wrap" style={{ justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
              <h1 className="display" style={{ fontSize: 30 }}>선생님 · 부모님 화면</h1>
              <div className="seg" role="group">
                <button type="button" aria-pressed={tab === "rec"} onClick={() => setTab("rec")}>
                  학생 기록
                </button>
                <button type="button" aria-pressed={tab === "set"} onClick={() => setTab("set")}>
                  설정
                </button>
              </div>
            </div>
            {tab === "rec" ? (
              <div className="col" style={{ gap: 16 }}>
                {!st.profiles.length && <div className="card muted" style={{ padding: 22 }}>아직 학생이 없어요.</div>}
                {st.profiles.map((x) => (
                  <Student key={x.id} p={x} onParent={() => setParent(x.id)} />
                ))}
                {st.profiles.length > 0 && (
                  <details className="card" style={{ padding: 18 }}>
                    <summary style={{ cursor: "pointer", fontWeight: 700 }}>학생 삭제</summary>
                    <div className="row wrap" style={{ gap: 10, marginTop: 12 }}>
                      {st.profiles.map((x) => (
                        <button key={x.id} type="button" className="btn btn-ghost" style={{ minHeight: 44 }} onClick={() => confirm(`${x.name} 학생의 기록을 지울까요?`) && removeProfile(x.id)}>
                          <Icon name="Trash2" size={18} /> {x.name}
                        </button>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <Settings />
            )}
          </>
        )}
      </div>
    </>
  );
}
