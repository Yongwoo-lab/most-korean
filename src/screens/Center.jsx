// The centre teacher's screen (Korean): register students, print ID cards,
// see everyone's progress from the server.
import { useEffect, useMemo, useState } from "react";
import { Brand } from "./Home.jsx";
import { ParentSheet, Settings, Student } from "./Teacher.jsx";
import { Avatar, Icon, Pic } from "../components/ui.jsx";
import { UNITS } from "../data/course.js";
import { passPic, randomPass, suggestId } from "../data/passpics.js";
import { AVATARS, newProfile } from "../lib/store.js";
import { call, errorText, logout, useCloud } from "../lib/cloud.js";

export const SITE = "https://yongwoo-lab.github.io/most-korean/";

const asProfile = (s) => ({ ...newProfile(s.name, s.avatar || "cat"), ...(s.state || {}), name: s.name, avatar: s.avatar || "cat" });

function weekMinutes(p) {
  let n = 0;
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    n += p.minutes?.[k] || 0;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function PassPics({ pass, size = 44 }) {
  return (
    <span className="row" style={{ gap: 6 }}>
      {pass.split("-").map((id, i) => (
        <span key={i} className="pass-slot full" style={{ width: size + 16, height: size + 16 }}>
          <Pic pic={passPic(id)} size={size} />
        </span>
      ))}
    </span>
  );
}

// One printable card per student: ID and pictures for the child, the
// guardian code and Russian instructions for the parents.
function IdCard({ s, pass, inst, onClose }) {
  return (
    <div className="col" style={{ gap: 14, alignItems: "center" }}>
      <div className="row no-print" style={{ justifyContent: "space-between", width: "100%", maxWidth: 720 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          <Icon name="ChevronLeft" /> 돌아가기
        </button>
        <button type="button" className="btn btn-teal" onClick={() => window.print()}>
          <Icon name="Printer" /> 인쇄
        </button>
      </div>
      {!pass && <div className="login-note no-print">그림 비밀번호는 서버에 그림으로 저장되지 않아서 다시 볼 수 없어요. 잊었다면 "그림 비밀번호 바꾸기"를 눌러 새로 만들어 주세요.</div>}
      <div className="card id-card">
        <div className="id-card-kid">
          <div className="row" style={{ gap: 12 }}>
            <Avatar avatar={s.avatar} size={64} />
            <div className="col" style={{ gap: 2 }}>
              <span className="muted ko">{inst.name}</span>
              <b style={{ fontSize: 24 }}>{s.name}</b>
            </div>
          </div>
          <div className="id-row">
            <span className="muted">ID · 아이디</span>
            <b className="id-big">{s.login_id}</b>
          </div>
          <div className="id-row">
            <span className="muted">Пароль-картинки · 그림 비밀번호</span>
            {pass ? <PassPics pass={pass} /> : <span className="row" style={{ gap: 6 }}>{[0, 1, 2, 3].map((i) => <span key={i} className="pass-slot" style={{ width: 60, height: 60 }} />)}</span>}
          </div>
        </div>
        <div className="id-card-parent ru" lang="ru">
          <b>Для родителей</b>
          <div>
            Смотрите, как учится ваш ребёнок: откройте <b>{SITE.replace("https://", "")}</b>, выберите «{inst.name}» → «Родители» → «Регистрация» и введите код:
          </div>
          <div className="id-big" style={{ letterSpacing: 4 }}>{s.guardian_code}</div>
          <div className="muted">Код только для вашей семьи. Не показывайте его другим.</div>
        </div>
      </div>
    </div>
  );
}

function AddStudent({ onMade }) {
  const [name, setName] = useState("");
  const [cls, setCls] = useState("");
  const [id, setId] = useState("");
  const [touched, setTouched] = useState(false);
  const [avatar, setAvatar] = useState("cat");
  const [pass, setPass] = useState(randomPass);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const onName = (v) => {
    setName(v);
    if (!touched) setId(v.trim() ? suggestId(v) : "");
  };
  const make = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const s = await call("create_student", { p_id: id, p_secret: pass, p_name: name.trim(), p_avatar: avatar, p_class: cls.trim() });
      onMade(s, pass);
    } catch (x) {
      setErr(x);
    }
    setBusy(false);
  };
  return (
    <form className="card col" style={{ padding: 24, gap: 18 }} onSubmit={make}>
      <h2 style={{ fontSize: 22 }}>학생 등록</h2>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="field">
          <label htmlFor="nname">이름 (러시아어나 한국어)</label>
          <input id="nname" value={name} onChange={(e) => onName(e.target.value)} placeholder="Алина / 알리나" maxLength={30} />
        </div>
        <div className="field">
          <label htmlFor="ncls">반 (선택)</label>
          <input id="ncls" value={cls} onChange={(e) => setCls(e.target.value)} placeholder="저학년" maxLength={20} />
        </div>
        <div className="field">
          <label htmlFor="nid">아이디 (자동, 바꿀 수 있어요)</label>
          <input
            id="nid"
            value={id}
            onChange={(e) => (setTouched(true), setId(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()))}
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>
      </div>
      <div className="col" style={{ gap: 8 }}>
        <b>그림</b>
        <div className="row wrap" style={{ gap: 10 }}>
          {AVATARS.map((a) => (
            <button key={a.id} type="button" className="avatar-pick" aria-pressed={avatar === a.id} aria-label={a.id} onClick={() => setAvatar(a.id)}>
              <Avatar avatar={a.id} size={56} />
            </button>
          ))}
        </div>
      </div>
      <div className="col" style={{ gap: 8 }}>
        <b>그림 비밀번호 (순서대로 4개)</b>
        <div className="row wrap" style={{ gap: 12 }}>
          <PassPics pass={pass} size={36} />
          <button type="button" className="btn btn-ghost" onClick={() => setPass(randomPass())}>
            <Icon name="Shuffle" size={20} /> 다른 그림
          </button>
        </div>
      </div>
      {err && <div className="login-err">{errorText(err)[1]}</div>}
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button type="submit" className="btn btn-primary" disabled={busy || !name.trim() || id.length < 3}>
          <Icon name="UserPlus" size={22} /> 등록하고 카드 만들기
        </button>
      </div>
    </form>
  );
}

export default function Center({ go }) {
  const { account } = useCloud();
  const [tab, setTab] = useState("rec");
  const [list, setList] = useState(null);
  const [err, setErr] = useState(null);
  const [card, setCard] = useState(null); // { s, pass }
  const [sheet, setSheet] = useState(null);
  const inst = account?.institution || { name: "" };

  const load = () => {
    setErr(null);
    call("list_students").then(setList, setErr);
  };
  useEffect(load, []);

  const rows = useMemo(() => (list || []).map((s) => ({ s, p: asProfile(s) })), [list]);
  const active = rows.filter((r) => weekMinutes(r.p) > 0).length;
  const classes = [...new Set(rows.map((r) => r.s.class_name || ""))];

  const reset = async (s) => {
    if (!confirm(`${s.name} 학생의 그림 비밀번호를 새로 만들까요?`)) return;
    const pass = randomPass();
    try {
      await call("reset_student_secret", { p_student: s.id, p_secret: pass });
      setCard({ s, pass });
    } catch (x) {
      alert(errorText(x)[1]);
    }
  };

  return (
    <>
      <header className="topbar no-print">
        <Brand go={() => setTab("rec")} />
        <span className="chip">
          <Pic pic="school" size={22} /> <span className="ko">{inst.name}</span>
        </span>
        <span className="spacer" />
        <span className="chip">
          <Pic pic="woman-teacher" size={24} /> {account?.name} 선생님
        </span>
        <button type="button" className="btn btn-ghost" style={{ minHeight: 44 }} onClick={() => logout().then(() => go("home"))}>
          <Icon name="LogOut" size={20} /> 로그아웃
        </button>
      </header>
      <div className="page" style={{ maxWidth: 1100 }}>
        {card ? (
          <IdCard s={card.s} pass={card.pass} inst={inst} onClose={() => (setCard(null), load())} />
        ) : sheet ? (
          <ParentSheet p={sheet} cloud onClose={() => setSheet(null)} />
        ) : (
          <>
            <div className="row wrap" style={{ justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
              <h1 className="display" style={{ fontSize: 30 }}>우리 기관 학생</h1>
              <div className="seg" role="group">
                <button type="button" aria-pressed={tab === "rec"} onClick={() => setTab("rec")}>
                  학생 기록
                </button>
                <button type="button" aria-pressed={tab === "add"} onClick={() => setTab("add")}>
                  학생 등록
                </button>
                <button type="button" aria-pressed={tab === "set"} onClick={() => setTab("set")}>
                  이 기기 설정
                </button>
              </div>
            </div>
            {tab === "add" && <AddStudent onMade={(s, pass) => (setTab("rec"), setCard({ s, pass }))} />}
            {tab === "set" && <Settings />}
            {tab === "rec" && (
              <div className="col" style={{ gap: 16 }}>
                <div className="center-stats">
                  {[
                    [rows.length, "등록 학생", "busts-in-silhouette"],
                    [active, "이번 주 공부한 학생", "fire"],
                    [rows.reduce((a, r) => a + UNITS.filter((u) => r.p.units?.[u.id]?.done).length, 0), "끝낸 단원 (모두)", "trophy"],
                  ].map(([n, l, pic]) => (
                    <div key={l} className="card center-stat">
                      <Pic pic={pic} size={40} />
                      <b>{n}</b>
                      <span className="muted">{l}</span>
                    </div>
                  ))}
                </div>
                {err && (
                  <div className="login-err">
                    {errorText(err)[1]}{" "}
                    <button type="button" className="btn btn-ghost" onClick={load}>
                      다시 시도
                    </button>
                  </div>
                )}
                {list && !list.length && (
                  <div className="card col" style={{ padding: 24, gap: 12, alignItems: "flex-start" }}>
                    <b>아직 등록한 학생이 없어요.</b>
                    <button type="button" className="btn btn-primary" onClick={() => setTab("add")}>
                      <Icon name="UserPlus" size={20} /> 첫 학생 등록하기
                    </button>
                  </div>
                )}
                {classes.map((c) => (
                  <section key={c} className="col" style={{ gap: 12 }}>
                    {classes.length > 1 && <h2 style={{ fontSize: 20 }}>{c || "반 없음"}</h2>}
                    {rows
                      .filter((r) => (r.s.class_name || "") === c)
                      .map(({ s, p }) => (
                        <Student
                          key={s.id}
                          p={p}
                          onParent={() => setSheet(p)}
                          extra={
                            <div className="row wrap" style={{ gap: 8 }}>
                              <span className="chip id-chip">ID {s.login_id}</span>
                              <span className="chip id-chip">보호자 {s.guardians}명 연결</span>
                              <span className="chip id-chip">이번 주 {weekMinutes(p)}분</span>
                              <span className="chip id-chip">마지막 기록 {s.state_at ? new Date(s.state_at).toLocaleDateString("ko-KR") : "없음"}</span>
                              <span className="spacer" style={{ flex: 1 }} />
                              <button type="button" className="btn btn-ghost" style={{ minHeight: 40, fontSize: 15 }} onClick={() => setCard({ s })}>
                                <Icon name="IdCard" size={18} /> 아이디 카드
                              </button>
                              <button type="button" className="btn btn-ghost" style={{ minHeight: 40, fontSize: 15 }} onClick={() => reset(s)}>
                                <Icon name="KeyRound" size={18} /> 그림 비밀번호 바꾸기
                              </button>
                            </div>
                          }
                        />
                      ))}
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
