// Accounts and learning records on Supabase (see supabase/schema.sql).
// Each device keeps one anonymous Supabase session; logging in with an
// institution + ID binds that session to an account, so no one needs an
// email address. A student's progress stays in the local store as before
// and is copied to the server a few seconds after each change.
import { createClient } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";
import { currentProfile, getState, newProfile, putProfile, selectProfile } from "./store.js";

const URL = import.meta.env.VITE_SUPABASE_URL || "https://tufkbgtquiguematskeq.supabase.co";
// Publishable key: meant for browsers; every table is closed except through
// the functions in schema.sql.
const KEY = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_2MU_q11VVXhPb4p3K14SLA_ji6dYvMN";

export const supabase = createClient(URL, KEY, { auth: { storageKey: "most.auth", persistSession: true, autoRefreshToken: true } });

const INST_KEY = "most.inst";
const listeners = new Set();
let cloud = { ready: false, account: null, sync: "idle" }; // sync: idle | saving | saved | offline

function set(patch) {
  cloud = { ...cloud, ...patch };
  listeners.forEach((l) => l());
}

export function useCloud() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => cloud,
  );
}

export function savedInstitution() {
  try {
    return JSON.parse(localStorage.getItem(INST_KEY));
  } catch {
    return null;
  }
}

export function rememberInstitution(inst) {
  try {
    localStorage.setItem(INST_KEY, JSON.stringify(inst));
  } catch {}
}

async function ensureSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return;
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw new Error(error.message);
}

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  if (data && data.error) throw new Error(data.error);
  return data;
}

export async function listInstitutions() {
  return (await rpc("list_institutions")) || [];
}

// Called once at start. Works offline: the local profile is used and the
// account is checked again when the network comes back.
export async function initCloud() {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const account = await rpc("me");
      set({ account });
      if (account?.role === "student") await pull(account);
    }
  } catch {
    set({ sync: "offline" });
  }
  set({ ready: true });
}

export async function login(inst, id, secret, role) {
  await ensureSession();
  const account = await rpc("login", { p_inst: inst, p_id: id.trim().toLowerCase(), p_secret: secret });
  if (account.role !== role) {
    await rpc("logout");
    throw new Error("wrong_role");
  }
  set({ account });
  if (role === "student") await pull(account);
  return account;
}

export async function register(kind, inst, code, id, password, name) {
  await ensureSession();
  const account = await rpc(kind === "teacher" ? "register_teacher" : "register_guardian", {
    p_inst: inst,
    p_code: code,
    p_id: id.trim().toLowerCase(),
    p_password: password,
    p_name: name.trim(),
  });
  set({ account });
  return account;
}

export async function logout() {
  await flush();
  try {
    await rpc("logout");
  } catch {}
  const p = currentProfile();
  if (p?.cloud) selectProfile(null);
  set({ account: null });
}

export const call = rpc;

// Progress sync -------------------------------------------------------------

const profileId = (account) => "c_" + account.id;

async function pull(account) {
  const local = getState().profiles.find((p) => p.id === profileId(account));
  const res = await rpc("load_state");
  const remote = res?.state;
  const base = newProfile(account.name, account.avatar || "cat");
  // Whichever copy changed last wins; the server copy is never older than
  // what this device last sent.
  const pick = remote && (!local || (remote.updated || 0) >= (local.updated || 0)) ? remote : local;
  putProfile({ ...base, ...pick, id: profileId(account), name: account.name, avatar: account.avatar || pick?.avatar || "cat", cloud: true });
  lastSent = JSON.stringify(currentProfile());
}

let timer = null;
let lastSent = "";

async function push() {
  timer = null;
  const p = currentProfile();
  if (!p?.cloud || cloud.account?.role !== "student") return;
  const body = { ...p, log: (p.log || []).slice(-600) };
  const json = JSON.stringify(body);
  if (json === lastSent) return;
  set({ sync: "saving" });
  try {
    await rpc("save_state", { p_state: body });
    lastSent = json;
    set({ sync: "saved" });
  } catch {
    set({ sync: "offline" });
  }
}

export async function flush() {
  if (timer) clearTimeout(timer);
  await push();
}

export function watchProgress(subscribe) {
  subscribe(() => {
    if (!currentProfile()?.cloud) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(push, 3000);
  });
  addEventListener("online", () => push());
  addEventListener("visibilitychange", () => document.visibilityState === "hidden" && push());
  setInterval(() => cloud.sync === "offline" && push(), 60000);
}

// Messages for the error codes raised in schema.sql.
export const ERRORS = {
  wrong_login: ["Неверный ID или пароль", "아이디나 비밀번호가 맞지 않아요"],
  locked: ["5 ошибок подряд. Подожди 10 минут", "5번 틀려서 10분 동안 잠겼어요"],
  wrong_role: ["Этот ID для другой роли", "다른 역할의 아이디예요"],
  wrong_code: ["Код не подходит", "코드가 맞지 않아요"],
  id_taken: ["Такой ID уже есть", "이미 있는 아이디예요"],
  bad_login_id: ["ID: 3–20 латинских букв или цифр", "아이디는 영문 소문자·숫자 3~20자"],
  short_password: ["Пароль: минимум 6 символов", "비밀번호는 6자 이상"],
  not_allowed: ["Нет доступа", "권한이 없어요"],
};

export function errorText(e) {
  const m = ERRORS[e?.message];
  if (m) return m;
  return ["Нет связи с сервером. Проверь интернет", "서버에 연결할 수 없어요. 인터넷을 확인해 주세요"];
}
