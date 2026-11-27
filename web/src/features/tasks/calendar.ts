// Календарь раздела «Задания»: сетка месяца (неделя с понедельника), метки дней, видимость и фильтры.
// Все даты — строки YYYY-MM-DD по Ташкенту, считаем в UTC, чтобы не зависеть от часового пояса браузера.
import type { CalEvent, Scope, Task } from "./logic";

export const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
export const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
export const MON_SHORT = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
export const WD = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
export const WD_FULL = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

const ms = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
const key = (t: number) => new Date(t).toISOString().slice(0, 10);
export const addDays = (d: string, n: number) => key(ms(d) + n * 864e5);
export const diffDays = (a: string, b: string) => Math.round((ms(a) - ms(b)) / 864e5);
/** день недели с понедельника: 0 — пн … 6 — вс */
export const dow = (d: string) => (new Date(ms(d)).getUTCDay() + 6) % 7;
export const ymOf = (d: string) => d.slice(0, 7);
export const addMonths = (ym: string, n: number) => { const t = +ym.slice(0, 4) * 12 + (+ym.slice(5, 7) - 1) + n; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`; };
export const monthTitle = (ym: string) => `${MONTHS[+ym.slice(5, 7) - 1]} ${ym.slice(0, 4)}`;
export const ddmm = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}`;
const lastDay = (ym: string) => key(Date.UTC(+ym.slice(0, 4), +ym.slice(5, 7), 0));

/** недели месяца: по 7 дней с понедельника, дни чужих месяцев — null */
export function monthWeeks(ym: string): (string | null)[][] {
  const first = ym + "-01", last = lastDay(ym), weeks: (string | null)[][] = [];
  let d = addDays(first, -dow(first));
  while (d <= last) {
    weeks.push(Array.from({ length: 7 }, (_, i) => { const x = addDays(d, i); return x >= first && x <= last ? x : null; }));
    d = addDays(d, 7);
  }
  return weeks;
}
/** окно загрузки для месяца: от понедельника первой недели до воскресенья последней */
export function gridRange(ym: string) { const f = ym + "-01", l = lastDay(ym); return { from: addDays(f, -dow(f)), to: addDays(l, 6 - dow(l)) }; }

// ===== видимость =====
export interface Scoped { scope: Scope; point: string | null; assignee_email?: string | null }
export interface Viewer { email: string; point: string | null }
export const lc = (s?: string | null) => String(s || "").trim().toLowerCase();
/** видит ли пользователь запись: «на всех» — все, «на точку» — у кого эта точка, «на человека» — только он */
export const visibleTo = (s: Scoped, w: Viewer) => s.scope === "all" || (s.scope === "point" && !!w.point && s.point === w.point) || (s.scope === "person" && !!s.assignee_email && lc(s.assignee_email) === lc(w.email));

export interface Filt { point: string; user: string }
/** фильтры админа: точка (общие «на всех» остаются) и исполнитель («как видит этот человек») */
export function passFilter(s: Scoped, f: Filt, users: { email: string; point: string | null }[]): boolean {
  const u = f.user !== "all" ? users.find((x) => lc(x.email) === lc(f.user)) : null;
  if (f.user !== "all" && (!u || !visibleTo(s, { email: u.email, point: u.point }))) return false;
  if (f.point === "all" || s.scope === "all") return true;
  if (s.scope === "point") return s.point === f.point;
  return users.find((x) => lc(x.email) === lc(s.assignee_email))?.point === f.point;
}

// ===== метки дня =====
export type Tone = "coral" | "brand" | "muted" | "violet" | "green";
/** цвета меток — только переменные темы */
export const TONE_COL: Record<Tone, string> = { coral: "var(--minus)", brand: "var(--chart-1)", muted: "var(--chart-5)", violet: "var(--chart-2)", green: "var(--plus)" };
export interface CalItem { key: string; kind: "task" | "event"; title: string; tone: Tone; done: boolean; time: string | null; task?: Task; event?: CalEvent }

export const isOver = (t: Task, today: string) => t.status !== "done" && !!t.due && t.due < today;
export const taskTone = (t: Task, today: string): Tone => (t.status === "done" ? "green" : isOver(t, today) || t.priority === "high" ? "coral" : t.priority === "low" ? "muted" : "brand");
const eventTime = (e: CalEvent) => (e.all_day ? "весь день" : e.start_time ? e.start_time + (e.end_time && (!e.ends_on || e.ends_on === e.starts_on) ? "–" + e.end_time : "") : null);
const taskItem = (t: Task, today: string): CalItem => ({ key: "t" + t.id, kind: "task", title: t.title, tone: taskTone(t, today), done: t.status === "done", time: t.due_time || null, task: t });
const eventItem = (e: CalEvent): CalItem => ({ key: "e" + e.id, kind: "event", title: e.title, tone: "violet", done: false, time: eventTime(e), event: e });
const rank = (c: CalItem) => (c.kind === "event" ? 1 : c.done ? 2 : 0);
const order = (a: CalItem, b: CalItem) => rank(a) - rank(b) || (a.time || "99").localeCompare(b.time || "99") || a.title.localeCompare(b.title, "ru");

/** метки по дням в окне [from, to]: задания по сроку, события — на каждый день их длины */
export function itemsByDay(tasks: Task[], events: CalEvent[], from: string, to: string, today: string) {
  const m = new Map<string, CalItem[]>(), add = (d: string, c: CalItem) => { const a = m.get(d); if (a) a.push(c); else m.set(d, [c]); };
  for (const t of tasks) if (t.due && t.due >= from && t.due <= to) add(t.due, taskItem(t, today));
  for (const e of events) {
    const end = e.ends_on && e.ends_on > e.starts_on ? e.ends_on : e.starts_on;
    for (let d = e.starts_on < from ? from : e.starts_on, n = 0; d <= end && d <= to && n < 400; d = addDays(d, 1), n++) add(d, eventItem(e));
  }
  m.forEach((a) => a.sort(order));
  return m;
}

/** список выбранного дня: задания со сроком в этот день (для сегодня — ещё просроченные), потом события */
export function dayList(tasks: Task[], events: CalEvent[], day: string, today: string): CalItem[] {
  const ts = tasks.filter((t) => t.due === day || (day === today && isOver(t, today)));
  const over = (t: Task) => (isOver(t, today) ? 0 : 1);
  ts.sort((a, b) => over(a) - over(b) || +(a.status === "done") - +(b.status === "done") || (a.due_time || "99").localeCompare(b.due_time || "99") || a.title.localeCompare(b.title, "ru"));
  const es = events.filter((e) => e.starts_on <= day && (e.ends_on || e.starts_on) >= day).map(eventItem).sort(order);
  return [...ts.map((t) => taskItem(t, today)), ...es];
}

/** ближайшие события: с сегодняшнего дня, по возрастанию даты и времени */
export const upcoming = (events: CalEvent[], today: string) => events.filter((e) => (e.ends_on || e.starts_on) >= today)
  .sort((a, b) => a.starts_on.localeCompare(b.starts_on) || (a.start_time || "").localeCompare(b.start_time || "") || a.title.localeCompare(b.title, "ru"));
export const eventWhen = (e: CalEvent) => eventTime(e) || "";
