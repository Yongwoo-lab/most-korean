// First screen: choose the centre, say who you are, log in with an ID.
// Students log in with an ID and four pictures instead of a password.
import { useEffect, useState } from "react";
import { Icon, Mascot, Pic } from "../components/ui.jsx";
import { PASS_PICS, passPic } from "../data/passpics.js";
import { errorText, listInstitutions, login, register, rememberInstitution, savedInstitution } from "../lib/cloud.js";
import { sayAll } from "../lib/speech.js";

const ROLES = [
  { id: "student", pic: "backpack", ru: "Я ученик", ko: "학생" },
  { id: "teacher", pic: "woman-teacher", ru: "Учитель", ko: "선생님" },
  { id: "guardian", pic: "people-hugging", ru: "Родители", ko: "보호자" },
];

function Err({ e }) {
  if (!e) return null;
  const [ru, ko] = errorText(e);
  return (
    <div className="login-err" role="alert">
      <Icon name="CircleAlert" size={20} /> <span className="ru">{ru}</span> <span className="ko muted">· {ko}</span>
    </div>
  );
}

function Institutions({ onPick, go }) {
  const [list, setList] = useState(null);
  const [err, setErr] = useState(null);
  const [q, setQ] = useState("");
  const load = () => {
    setErr(null);
    listInstitutions().then(setList, setErr);
  };
  useEffect(load, []);
  const shown = (list || []).filter((i) => !q || (i.name + i.region + i.code).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="col" style={{ gap: 16 }}>
      <h2 className="login-h">
        <span className="ko">어느 기관이에요?</span> <span className="ru muted">· Где ты учишься?</span>
      </h2>
      {list && list.length > 6 && (
        <div className="field">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="기관 이름 검색 · Поиск" aria-label="기관 검색" />
        </div>
      )}
      <Err e={err} />
      {err && (
        <button type="button" className="btn btn-ghost" onClick={load}>
          <Icon name="RotateCw" size={20} /> 다시 시도 · Ещё раз
        </button>
      )}
      {!list && !err && <div className="muted">불러오는 중… · Загрузка…</div>}
      <div className="login-grid">
        {shown.map((i) => (
          <button key={i.code} type="button" className="card login-inst" onClick={() => onPick(i)}>
            <Pic pic="school" size={48} />
            <span className="col" style={{ gap: 2, alignItems: "flex-start" }}>
              <b className="ko">{i.name}</b>
              <span className="muted">{i.region}</span>
            </span>
            <Icon name="ChevronRight" size={22} className="login-go" />
          </button>
        ))}
      </div>
      <button type="button" className="login-local" onClick={() => go("profiles")}>
        로그인 없이 이 기기에서만 써 보기 · Попробовать без входа
      </button>
    </div>
  );
}

function PicturePad({ value, onChange }) {
  const parts = value ? value.split("-") : [];
  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="pass-slots" aria-label={`Выбрано ${parts.length} из 4`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={"pass-slot" + (parts[i] ? " full" : "")}>
            {parts[i] ? <Pic pic={passPic(parts[i])} size={40} /> : i + 1}
          </span>
        ))}
        <button type="button" className="pass-back" disabled={!parts.length} onClick={() => onChange(parts.slice(0, -1).join("-"))} aria-label="Стереть">
          <Icon name="Delete" size={26} />
        </button>
      </div>
      <div className="pass-grid">
        {PASS_PICS.map((p) => (
          <button key={p.id} type="button" className="pass-pic" disabled={parts.length >= 4} onClick={() => onChange([...parts, p.id].join("-"))} aria-label={p.id}>
            <Pic pic={p.pic} size={52} />
          </button>
        ))}
      </div>
    </div>
  );
}

function StudentForm({ inst, done }) {
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const ok = id.trim().length >= 3 && pass.split("-").length === 4;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await login(inst.code, id, pass, "student");
      done("student");
    } catch (x) {
      setErr(x);
      setPass("");
    }
    setBusy(false);
  };
  return (
    <form className="col" style={{ gap: 18 }} onSubmit={submit}>
      <div className="row" style={{ gap: 12 }}>
        <Mascot size={64} />
        <button type="button" className="bubble ru" style={{ flex: 1, textAlign: "left" }} onClick={() => sayAll([["Напиши свой ID и выбери четыре картинки по порядку.", "ru"]])}>
          Напиши свой ID и выбери 4 картинки по порядку. <span className="ko muted">아이디를 쓰고 그림 4개를 순서대로 골라요.</span>
        </button>
      </div>
      <div className="field">
        <label htmlFor="sid">ID · 아이디</label>
        <input id="sid" value={id} onChange={(e) => setId(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())} placeholder="alina07" autoComplete="username" autoCapitalize="none" spellCheck={false} inputMode="latin" style={{ fontSize: 26, letterSpacing: 1 }} />
      </div>
      <PicturePad value={pass} onChange={setPass} />
      <Err e={err} />
      <button type="submit" className="btn btn-primary btn-xl" disabled={!ok || busy}>
        {busy ? "…" : "Войти · 들어가기"} <Icon name="ChevronRight" size={26} />
      </button>
    </form>
  );
}

function AdultForm({ inst, role, done }) {
  const [join, setJoin] = useState(false);
  const [f, setF] = useState({ id: "", password: "", code: "", name: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const ru = role === "guardian";
  const put = (k) => (e) => setF({ ...f, [k]: k === "id" ? e.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : e.target.value });
  const ok = f.id.length >= 3 && f.password.length >= (join ? 6 : 1) && (!join || (f.code.trim() && f.name.trim()));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (join) await register(role, inst.code, f.code, f.id, f.password, f.name);
      else await login(inst.code, f.id, f.password, role);
      done(role);
    } catch (x) {
      setErr(x);
    }
    setBusy(false);
  };
  const L = (ko, r) => (ru ? `${r} · ${ko}` : `${ko} · ${r}`);
  return (
    <form className="col" style={{ gap: 16 }} onSubmit={submit}>
      <div className="seg" role="group">
        <button type="button" aria-pressed={!join} onClick={() => setJoin(false)}>
          {L("로그인", "Вход")}
        </button>
        <button type="button" aria-pressed={join} onClick={() => setJoin(true)}>
          {L("처음이에요", "Регистрация")}
        </button>
      </div>
      {join && (
        <>
          <div className="login-note">
            {ru ? "Код ребёнка дал учитель (6 букв и цифр на карточке ребёнка). · 아이 카드에 있는 보호자 코드" : "기관 관리자에게 받은 선생님 가입 코드를 넣어 주세요. · Код учителя"}
          </div>
          <div className="field">
            <label htmlFor="acode">{ru ? L("보호자 코드", "Код ребёнка") : L("선생님 가입 코드", "Код учителя")}</label>
            <input id="acode" value={f.code} onChange={put("code")} autoCapitalize="characters" autoComplete="off" style={{ textTransform: "uppercase", letterSpacing: 2 }} />
          </div>
          <div className="field">
            <label htmlFor="aname">{L("이름", "Имя")}</label>
            <input id="aname" value={f.name} onChange={put("name")} placeholder={ru ? "Мама Алины" : "김선생"} maxLength={30} />
          </div>
        </>
      )}
      <div className="field">
        <label htmlFor="aid">{L("아이디", "ID")}</label>
        <input id="aid" value={f.id} onChange={put("id")} autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder={join ? (ru ? "mama07" : "teacher01") : ""} />
        {join && <span className="t-sub">{L("영문 소문자·숫자 3~20자", "латинские буквы и цифры, 3–20")}</span>}
      </div>
      <div className="field">
        <label htmlFor="apw">{L("비밀번호", "Пароль")}</label>
        <input id="apw" type="password" value={f.password} onChange={put("password")} autoComplete={join ? "new-password" : "current-password"} />
        {join && <span className="t-sub">{L("6자 이상", "минимум 6 символов")}</span>}
      </div>
      <Err e={err} />
      <button type="submit" className="btn btn-primary btn-xl" disabled={!ok || busy}>
        {busy ? "…" : join ? L("가입하고 들어가기", "Создать и войти") : L("들어가기", "Войти")} <Icon name="ChevronRight" size={26} />
      </button>
      {!join && <div className="t-sub">{L("비밀번호를 잊으면 기관 선생님께 말해 주세요.", "Забыли пароль? Обратитесь к учителю центра.")}</div>}
    </form>
  );
}

export default function Login({ go }) {
  const [inst, setInst] = useState(savedInstitution);
  const [role, setRole] = useState(null);
  const pickInst = (i) => {
    rememberInstitution(i);
    setInst(i);
  };
  const done = (r) => go(r === "teacher" ? "center" : r === "guardian" ? "parent" : "home");
  const back = () => (role ? setRole(null) : (rememberInstitution(null), setInst(null)));
  return (
    <div className="page welcome login" style={{ paddingTop: 24, maxWidth: 640 }}>
      <div className="welcome-logo">
        <img src="logo.svg" alt="Мост · 다리" height="64" />
      </div>
      <div className="card col login-card">
        {inst && (
          <div className="row login-top">
            <button type="button" className="btn btn-ghost login-back" onClick={back} aria-label="Назад">
              <Icon name="ChevronLeft" size={22} />
            </button>
            <span className="chip login-inst-chip">
              <Pic pic="school" size={22} /> <span className="ko">{inst.name}</span>
            </span>
            {role && (
              <span className="chip">
                <Pic pic={ROLES.find((r) => r.id === role).pic} size={22} /> {ROLES.find((r) => r.id === role).ko}
              </span>
            )}
          </div>
        )}
        {!inst && <Institutions onPick={pickInst} go={go} />}
        {inst && !role && (
          <div className="col" style={{ gap: 16 }}>
            <h2 className="login-h">
              <span className="ru">Кто ты?</span> <span className="ko muted">· 누구예요?</span>
            </h2>
            <div className="login-roles">
              {ROLES.map((r) => (
                <button key={r.id} type="button" className="mode-card login-role" onClick={() => setRole(r.id)}>
                  <Pic pic={r.pic} size={64} />
                  <b className="ru">{r.ru}</b>
                  <span className="ko muted">{r.ko}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {inst && role === "student" && <StudentForm inst={inst} done={done} />}
        {inst && role && role !== "student" && <AdultForm key={role} inst={inst} role={role} done={done} />}
      </div>
    </div>
  );
}
