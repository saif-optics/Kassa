// Отметки прихода: типы, расчёт смен и загрузка/запись. Запросы — те же, что в smena/admin.html:
// таблицы att_points, att_employees, att_events (админ читает и пишет напрямую, доступ ограничен политиками базы).
import { client, isDemo } from "@/lib/source";
import { demoEvents, demoMem, demoPhoto } from "./demo";

export type AttPoint = { point: string; start_time: string | null; code: string };
export type AttEmp = { id: string; name: string; point: string; active: boolean; descriptors: number[][] | null; created_at?: string };
export type AttEvent = { id: number | string; employee_id: string; point: string; kind: "in" | "out"; ts: string; score: number | null; lat: number | null; lng: number | null; acc: number | null; device?: string | null };

/** публичный адрес киоска (CLAUDE.md); ссылка точки — этот адрес + ?code=КОД */
export const KIOSK_URL = "https://saif-optics.github.io/Kassa/smena/";

const TZ = "Asia/Tashkent";
export const dayOf = (d: Date | string | number) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(d));
export const todayStr = () => dayOf(Date.now());
export const hm = (d: Date | string | number) => new Intl.DateTimeFormat("ru-RU", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(d));
export const mins = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
export const fmtMin = (n: number) => (n >= 60 ? `${Math.floor(n / 60)} ч ${n % 60} мин` : `${n} мин`);
/** минуты → «7:48» */
export const fmtH = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
/** день ± n дней */
export const addDays = (day: string, n: number) => dayOf(new Date(day + "T12:00:00+05:00").getTime() + n * 86400_000);
export const dm = (day: string) => day.slice(8, 10) + "." + day.slice(5, 7);
const WD = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
export const wdOf = (day: string) => WD[new Date(day + "T12:00:00+05:00").getUTCDay()];
/** подпись дня: «Сегодня, 28.11», «Вчера, 27.11», «пн, 23.11» */
export const dayLabel = (day: string) => { const t = todayStr(); return `${day === t ? "Сегодня" : day === addDays(t, -1) ? "Вчера" : wdOf(day)}, ${dm(day)}`; };

export const startOf = (points: AttPoint[]) => (pt: string) => points.find((p) => p.point === pt)?.start_time?.slice(0, 5) || "10:00";

/** тип устройства по строке браузера: телефон, iMac (Mac), компьютер; без данных — null */
export function deviceKind(ua?: string | null): { kind: "phone" | "desk"; label: string } | null {
  if (!ua) return null;
  if (/iPhone|Android|Mobile|iPad/i.test(ua)) return { kind: "phone", label: "телефон" };
  if (/Macintosh|Mac OS/i.test(ua)) return { kind: "desk", label: "iMac" };
  return { kind: "desk", label: "компьютер" };
}
/** совпадение лица, %: киоск пишет score = 1 − расстояние до снимка */
export const pct = (score?: number | null) => (score == null ? null : Math.max(0, Math.min(100, Math.round(score * 100))));

export type Shift = { emp: string; day: string; point: string; in: AttEvent | null; out: AttEvent | null; last: AttEvent; evs: AttEvent[]; late: number; work: number; ongoing: number };

/** день сотрудника: первый приход, последний уход, опоздание от начала работы точки, часы (идущая смена сегодня — по текущему времени) */
export function shifts(evs: AttEvent[], start: (pt: string) => string, now = Date.now()): Shift[] {
  const m = new Map<string, Shift>();
  for (const e of evs) {
    const k = e.employee_id + "|" + dayOf(e.ts);
    const s = m.get(k) || ({ emp: e.employee_id, day: dayOf(e.ts), in: null, out: null, evs: [] } as unknown as Shift);
    s.evs.push(e);
    if (e.kind === "in" && !s.in) s.in = e;
    if (e.kind === "out") s.out = e;
    s.last = e;
    m.set(k, s);
  }
  const today = dayOf(now);
  for (const s of m.values()) {
    s.point = (s.in || s.evs[0]).point;
    s.late = s.in ? Math.max(0, mins(hm(s.in.ts)) - mins(start(s.point))) : 0;
    s.work = s.in && s.out && s.out.ts > s.in.ts ? Math.round((+new Date(s.out.ts) - +new Date(s.in.ts)) / 60000) : 0;
    s.ongoing = s.in && s.last.kind === "in" && s.day === today ? Math.max(0, Math.round((now - +new Date(s.in.ts)) / 60000)) : 0;
  }
  return [...m.values()];
}

// ---- чтение ----
export async function loadRefs(): Promise<{ points: AttPoint[]; emps: AttEmp[] }> {
  if (isDemo) return { points: structuredClone(demoMem.points), emps: structuredClone(demoMem.emps) };
  const c = client();
  const [p, e] = await Promise.all([c.from("att_points").select("*").order("point"), c.from("att_employees").select("id,name,point,active,descriptors,created_at").order("name")]);
  if (p.error) throw new Error(p.error.message);
  if (e.error) throw new Error(e.error.message);
  return { points: (p.data || []) as AttPoint[], emps: (e.data || []) as AttEmp[] };
}

let devCol = true; // есть ли в att_events колонка device; нет — читаем без неё
/** отметки за дни fromDay..toDay включительно (без фото — они тяжёлые) */
export async function loadEvents(fromDay: string, toDay: string): Promise<AttEvent[]> {
  if (isDemo) return demoEvents(fromDay, toDay, todayStr());
  const from = new Date(fromDay + "T00:00:00+05:00").toISOString();
  const to = new Date(new Date(toDay + "T00:00:00+05:00").getTime() + 86400_000).toISOString();
  const run = async (cols: string) => {
    const all: AttEvent[] = [];
    for (let off = 0; ; off += 1000) {
      const { data, error } = await client().from("att_events").select(cols).gte("ts", from).lt("ts", to).order("ts").range(off, off + 999);
      if (error) throw error;
      all.push(...(data as unknown as AttEvent[]));
      if (data.length < 1000) break;
    }
    return all;
  };
  const base = "id,employee_id,point,kind,ts,score,lat,lng,acc";
  try { return await run(devCol ? base + ",device" : base); } catch (e) {
    if (devCol && /device/i.test(String((e as Error)?.message || ""))) { devCol = false; return run(base); }
    throw new Error(String((e as Error)?.message || "Не удалось загрузить отметки"));
  }
}

/** фото отметок по номерам (для окна дня сотрудника) */
export async function loadPhotos(ids: (number | string)[]): Promise<Record<string, string>> {
  if (!ids.length) return {};
  if (isDemo) return Object.fromEntries(ids.map((i) => [String(i), demoPhoto(i)]));
  const { data, error } = await client().from("att_events").select("id,photo").in("id", ids);
  if (error) throw new Error(error.message);
  const out: Record<string, string> = {};
  for (const r of (data || []) as { id: number | string; photo: unknown }[]) if (typeof r.photo === "string" && r.photo.startsWith("data:image/")) out[String(r.id)] = r.photo;
  return out;
}

// ---- запись ----
const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message); };
export async function updateEmp(id: string, patch: Partial<Pick<AttEmp, "name" | "point" | "active" | "descriptors">>) {
  if (isDemo) { const e = demoMem.emps.find((x) => x.id === id); if (e) Object.assign(e, patch); return; }
  fail((await client().from("att_employees").update(patch).eq("id", id)).error);
}
export async function addEmp(v: { name: string; point: string; descriptors: number[][] }) {
  if (isDemo) { demoMem.emps.push({ id: "d" + (Date.now() % 1e9), name: v.name, point: v.point, active: true, descriptors: v.descriptors }); return; }
  fail((await client().from("att_employees").insert(v)).error);
}
export async function updatePoint(point: string, patch: Partial<Pick<AttPoint, "start_time" | "code">>) {
  if (isDemo) { const p = demoMem.points.find((x) => x.point === point); if (p) Object.assign(p, patch); return; }
  fail((await client().from("att_points").update(patch).eq("point", point)).error);
}
export const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
export async function addPoint(v: { point: string; start_time: string }) {
  const row = { ...v, code: newCode() };
  if (isDemo) { demoMem.points.push(row); return; }
  fail((await client().from("att_points").insert(row)).error);
}

/** период сводки: неделя — 7 дней до выбранного дня включительно, месяц — календарный месяц выбранного дня */
export function periodOf(day: string, per: "week" | "month"): { from: string; to: string; label: string } {
  if (per === "week") { const from = addDays(day, -6); return { from, to: day, label: `${dm(from)}–${dm(day)}` }; }
  const [y, m] = day.split("-").map(Number);
  const to = `${day.slice(0, 7)}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
  const label = new Date(`${day.slice(0, 7)}-15T12:00:00+05:00`).toLocaleDateString("ru-RU", { timeZone: TZ, month: "long", year: "numeric" });
  return { from: `${day.slice(0, 7)}-01`, to, label };
}
/** сдвиг периода: неделя ±7 дней, месяц ±1 месяц (день ставим в середину месяца) */
export function shiftPeriod(day: string, per: "week" | "month", n: number): string {
  if (per === "week") return addDays(day, n * 7);
  const [y, m] = day.split("-").map(Number), d = new Date(y, m - 1 + n, 15);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-15`;
}
