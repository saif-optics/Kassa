// Источник данных: настоящая база Supabase или демо в памяти (адрес с ?demo).
// Пишем в те же документы docs, что и рабочий сайт, — обе версии видят одни данные.
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import type { BankDay, BcDoc, CashRec, Data, Entry, PayItem, PayMark, Sale, Template } from "./types";

const URL = "https://qvblxhyftwivkzxucfak.supabase.co";
const KEY = "sb_publishable_-ceoJkpmAZ7Y8osbPHaOlg_3nqUsdB7"; // публичный ключ, доступ даёт только вход

export type Row = { col: string; id: string; data: Record<string, unknown> };
export const isDemo = typeof location !== "undefined" && new URLSearchParams(location.search).has("demo");

// демо с ограниченной ролью: ?demo&role=seller&point=C1 (без role — владелец)
const qs = typeof location !== "undefined" ? new URLSearchParams(location.search) : null;
export const demoRole = isDemo ? qs?.get("role") || null : null;
export const demoPoint = isDemo ? qs?.get("point") || null : null;
// ограниченная роль (не владелец и не админ): документы читаем одним вызовом role_docs_all, realtime не подписываем
let limited = false;
export const setLimited = (v: boolean) => { limited = v; };

let sb: SupabaseClient | null = null;
export const client = () => (sb ??= createClient(URL, KEY, { auth: { persistSession: true, storageKey: "kassa-web-auth" } }));


async function loadRows(): Promise<Row[]> {
  if (isDemo) { const all = (await import("./demoAll")).demoAll(); return limited ? limitRows(all, demoPoint) : all; } // только в браузере (Vite)
  const c = client(), out: Row[] = [], N = 1000;
  if (limited) { const { data, error } = await c.rpc("role_docs_all"); if (error) throw error; return Array.isArray(data) ? (data as Row[]) : []; }
  for (let from = 0; ; from += N) {
    // все документы, как на рабочем сайте: каждый раздел берёт свои коллекции из Data.rows
    const { data, error } = await c.from("docs").select("col,id,data").order("col").order("id").range(from, from + N - 1);
    if (error) throw error; out.push(...(data as Row[])); if (data.length < N) break;
  }
  return out;
}

// что видит ограниченная роль в демо: продажи и расходы дня своей точки, настройки продаж (как role_docs_all)
function limitRows(rows: Row[], point: string | null): Row[] {
  return rows.filter((r) => {
    if (r.col === "sales") return !point || r.data.point === point;
    if (r.col === "entries") return r.data.source === "day" && (!point || r.data.branch === point);
    return r.col === "settings" && r.id === "sales";
  });
}

export function toData(rows: Row[]): Data {
  const d: Data = { rows: {}, cash: null, cashlog: [], templates: [], bc: [], items: {}, marks: {}, sales: [], entries: [], report: {}, points: ["Премиум", "Яшнабад", "Сергели", "C1"] };
  // одна запись на col+id (последняя побеждает) — как в базе и на рабочем сайте
  const uniq = new Map<string, Row>(); rows.forEach((r) => uniq.set(r.col + "/" + r.id, r));
  for (const r of uniq.values()) {
    const x = r.data as never;
    (d.rows[r.col] ||= {})[r.id] = r.data;
    if (r.col === "payments") d.items[r.id] = { ...(x as PayItem), id: r.id };
    else if (r.col === "paymarks") d.marks[r.id] = x as PayMark;
    else if (r.col === "sales") d.sales.push({ ...(x as Sale), id: r.id });
    else if (r.col === "entries") d.entries.push({ ...(x as Entry), id: r.id });
    else if (r.col === "report" && /^\d{4}-\d\d-\d\d$/.test(r.id)) d.report[r.id] = { ...(x as BankDay), id: r.id };
    else if (r.col === "cash" && r.id === "current") d.cash = x as Data["cash"];
    else if (r.col === "cashlog") d.cashlog.push(x as CashRec);
    else if (r.col === "templates") d.templates.push({ ...(x as Template), id: r.id });
    else if (r.col === "bc") d.bc.push({ ...(x as BcDoc), id: r.id });
    else if (r.col === "settings" && r.id === "sales") { const p = (x as { points?: string[] }).points; if (Array.isArray(p) && p.length) d.points = p; }
  }
  return d;
}

// демо: таблица в памяти
let mem: Row[] | null = null;
const listeners = new Set<() => void>();
const memRows = async () => (mem ??= await loadRows());

export async function loadData(): Promise<Data> { return toData(isDemo ? await memRows() : await loadRows()); }

// ошибка серверной функции: текст сообщения (на русском) как есть, без кода и подсказок
async function rpc(fn: string, args: Record<string, unknown>) {
  const { data, error } = await client().rpc(fn, args);
  if (error) throw new Error(error.message || "Не удалось сохранить");
  return data;
}
const NO_WRITE = "Только просмотр: эту запись может менять владелец";

export async function setDoc(col: string, id: string, data: object) {
  const clean = JSON.parse(JSON.stringify(data));
  if (isDemo) { const m = await memRows(); const i = m.findIndex((r) => r.col === col && r.id === id); const row = { col, id, data: clean }; if (i >= 0) m[i] = row; else m.push(row); listeners.forEach((f) => f()); return; }
  // ограниченная роль: прямую запись в docs RLS запрещает — только серверные функции (как на рабочем сайте)
  if (limited) {
    if (col === "sales") { await rpc("cashier_put_sale", { p_id: id, p_data: clean }); return; }
    if (col === "entries") { await rpc("cashier_put_entry", { p_id: id, p_data: clean }); return; }
    throw new Error(NO_WRITE);
  }
  const { error } = await client().from("docs").upsert({ col, id, data: clean }); if (error) throw error;
}
export async function delDoc(col: string, id: string) {
  if (isDemo) { const m = await memRows(); const i = m.findIndex((r) => r.col === col && r.id === id); if (i >= 0) m.splice(i, 1); listeners.forEach((f) => f()); return; }
  if (limited) {
    if (col === "sales") { await rpc("cashier_del_sale", { p_id: id }); return; }
    if (col === "entries") { await rpc("cashier_del_entry", { p_id: id }); return; }
    throw new Error(NO_WRITE);
  }
  const { error } = await client().from("docs").delete().eq("col", col).eq("id", id); if (error) throw error;
}
/** продавец с правом exp_add без exp_edit: расход своей точки через seller_add_expense; возвращает id записи */
export async function addExpenseLimited(name: string, amount: number, date: string): Promise<string> {
  if (isDemo) {
    const pt = demoPoint || "Премиум", id = "e" + date.slice(5).replace("-", "") + "s" + Math.random().toString(36).slice(2, 10);
    await setDoc("entries", id, { type: "exp", cat: "op", branch: pt, name: `${pt} за ${name.charAt(0).toLowerCase()}${name.slice(1)}`, amount, date, source: "day", createdAt: Date.now() });
    return id;
  }
  return String(await rpc("seller_add_expense", { p_name: name, p_amount: amount, p_date: date }));
}
/** ограниченная ли роль (после входа) */
export const isLimited = () => limited;

/** живые обновления: изменения с рабочего сайта и других устройств */
export function subscribe(onChange: () => void): () => void {
  if (isDemo) { listeners.add(onChange); return () => listeners.delete(onChange); }
  if (limited) return () => {};
  const c = client();
  const ch = c.channel("kassa-web-live").on("postgres_changes", { event: "*", schema: "public", table: "docs" }, (p) => {
    const col = ((p.new as Row)?.col || (p.old as Row)?.col) as string | undefined;
    if (col !== undefined) onChange();
  }).subscribe();
  return () => { c.removeChannel(ch); };
}

/** таблицы Billz (bz_check, bz_stock, bz_product, bz_transfer, billz_log): запрос с фильтрами; в демо — данные раздела или пусто */
const demoTables: Record<string, Record<string, unknown>[]> = {};
export function setDemoTable(table: string, rows: Record<string, unknown>[]) { demoTables[table] = rows; }
export async function bzSelect<T = Record<string, unknown>>(table: string, build?: (q: any) => any): Promise<T[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (isDemo) return (demoTables[table] || []) as T[];
  const out: T[] = [], N = 1000;
  for (let from = 0; ; from += N) {
    let q = client().from(table).select("*"); if (build) q = build(q);
    const { data, error } = await q.range(from, from + N - 1); if (error) throw error; out.push(...(data as T[])); if (data.length < N) break;
  }
  return out;
}

// вход
export async function getSession(): Promise<Session | null> { if (isDemo) return { user: { email: "demo@saif-optics" } } as unknown as Session; return (await client().auth.getSession()).data.session; }
export async function signIn(email: string, password: string) { const { error } = await client().auth.signInWithPassword({ email, password }); if (error) throw error; }
export async function signOut() { if (!isDemo) await client().auth.signOut(); }
export function onAuth(cb: (s: Session | null) => void) { if (isDemo) return () => {}; const { data } = client().auth.onAuthStateChange((_e, s) => cb(s)); return () => data.subscription.unsubscribe(); }
