// Расчёты и работа с базой раздела «Задания» (перенос dev/tasks/tasks.js + календарь).
// Админ (owner/admin) читает и пишет таблицы tasks / task_comments / cal_events напрямую (RLS), ограниченная роль — только через RPC
// tasks_visible / cal_events_visible / tasks_comment / tasks_problem. Пока миграция 20261128_15 не применена, раздел работает
// по старой схеме: задания — «на точку», событий нет. В демо данные берутся из demo.ts (в памяти).
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { canPerm, type Access } from "@/lib/access";
import { client, isDemo } from "@/lib/source";
import { gridRange, lc, visibleTo } from "./calendar";

export const TASK_POINTS = ["Премиум", "Яшнабад", "Сергели", "C1"];
export type Priority = "low" | "normal" | "high";
export type Status = "new" | "work" | "done";
/** кому видно: все сотрудники с правом «Задания», сотрудники одной точки, один человек (и админы) */
export type Scope = "all" | "point" | "person";
export interface Task {
  id: string; scope: Scope; point: string | null; title: string; body: string; priority: Priority; due: string | null; due_time?: string | null; assignee: string | null; assignee_email?: string | null;
  status: Status; source: "owner" | "seller"; created_by?: string | null; created_label?: string;
  created_at: string; updated_at: string; done_at: string | null;
}
export interface CalEvent {
  id: string; title: string; body: string; starts_on: string; start_time: string | null; ends_on: string | null; end_time: string | null; all_day: boolean;
  scope: Scope; point: string | null; assignee_email?: string | null; kind: string | null; color?: string | null; created_at?: string;
}
export interface TaskComment { id: string; task_id: string; author_email?: string | null; author_label: string | null; kind: "comment" | "problem"; body: string; created_at: string }
export interface TasksData { tasks: Task[]; comments: TaskComment[] }
export interface EventsData { events: CalEvent[]; ok: boolean }

export const PRI: Record<Priority, string> = { high: "Срочно", normal: "Обычное", low: "Не горит" };
export const ST: Record<Status, string> = { new: "Новая", work: "В работе", done: "Сделано" };
export const SCOPE_NAME: Record<Scope, string> = { all: "Все", point: "Точка", person: "Человек" };
export const KINDS: Record<string, string> = { meeting: "Собрание", delivery: "Поставка", salary: "Зарплата", other: "Другое" };
export const MAXLEN = { title: 200, body: 4000, assignee: 80, comment: 2000 };

export const todayTash = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);
export const fmtD = (d: string | null) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : "");
export const fmtT = (t: string) => { const d = new Date(t); return isNaN(+d) ? "" : d.toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); };
export const isOverdue = (t: Task, today: string) => t.status !== "done" && !!t.due && String(t.due).slice(0, 10) < today;

/** строка из базы → задание: старая схема (без scope) — «на точку» */
const normTask = (r: Record<string, unknown>): Task => {
  const t = r as unknown as Task;
  return { ...t, scope: t.scope === "all" || t.scope === "person" ? t.scope : "point", due: t.due ? String(t.due).slice(0, 10) : null, due_time: t.due_time ? String(t.due_time).slice(0, 5) : null, point: t.point || null };
};
const normEvent = (r: Record<string, unknown>): CalEvent => {
  const e = r as unknown as CalEvent;
  return { ...e, starts_on: String(e.starts_on).slice(0, 10), ends_on: e.ends_on ? String(e.ends_on).slice(0, 10) : null, start_time: e.start_time ? String(e.start_time).slice(0, 5) : null, end_time: e.end_time ? String(e.end_time).slice(0, 5) : null, all_day: !!e.all_day };
};

/** итоги для плиток: открыто, новые/в работе, просрочено (с названиями), срок сегодня, сделано за неделю */
export function taskStats(tasks: Task[], today: string, now = Date.now()) {
  const open = tasks.filter((t) => t.status !== "done"), over = open.filter((t) => isOverdue(t, today));
  const dueToday = open.filter((t) => t.due === today), doneWeek = tasks.filter((t) => t.status === "done" && t.done_at && now - +new Date(t.done_at) <= 7 * 864e5).length;
  // «из N»: сделанные за неделю + открытые, срок которых уже наступил
  const base = doneWeek + open.filter((t) => t.due && t.due <= today).length;
  return {
    open: open.length, news: open.filter((t) => t.status === "new").length, work: open.filter((t) => t.status === "work").length,
    overdue: over.length, overNames: over.map((t) => t.title), dueToday: dueToday.length, dueTodayHigh: dueToday.filter((t) => t.priority === "high").length,
    doneWeek, base, pct: base ? Math.round((doneWeek / base) * 100) : 0,
  };
}

// частые ошибки базы — по-русски, остальное как есть
export function errMsg(e: unknown) {
  const x = e as { message?: string; code?: string } | null, m = x?.message || "", c = x?.code;
  if (c === "42501" || /row-level security|permission denied/i.test(m)) return /[А-Яа-я]/.test(m) && c === "42501" ? m : "Нет прав на это действие";
  if (c === "23514" || /violates check constraint/i.test(m)) return "Слишком длинный текст или неверное значение";
  if (c === "23502") return "Заполните обязательное поле";
  return m || "Не получилось, попробуйте ещё раз";
}

/** нет такой таблицы / функции / колонки — база ещё на старой схеме */
const missing = (e: unknown) => { const x = e as { code?: string; message?: string } | null; return /^(PGRST20[245]|42P01|42883|42703)$/.test(String(x?.code || "")) || /schema cache|does not exist|could not find/i.test(String(x?.message || "")); };
const NEED_DB = "Эта возможность появится после обновления базы";

/** окно [from, to] — для событий и сделанных заданий ограниченной роли */
export interface Win { from: string; to: string }
let newRpc: boolean | null = null; // есть ли tasks_visible (null — ещё не проверяли)

async function fetchTasks(a: Access, w: Win): Promise<TasksData> {
  if (isDemo) {
    const { demoStore } = await import("./demo"), s = demoStore(), me = { email: a.email, point: a.point };
    const tasks = s.tasks.filter((t) => a.isAdmin || (visibleTo(t, me) && (t.status !== "done" || (t.done_at && Date.now() - +new Date(t.done_at) < 14 * 864e5) || (!!t.due && t.due >= w.from && t.due <= w.to))));
    const ids = new Set(tasks.map((t) => t.id));
    return { tasks: [...tasks].sort((x, y) => y.created_at.localeCompare(x.created_at)), comments: s.comments.filter((c) => ids.has(c.task_id)) };
  }
  const c = client();
  if (a.isAdmin) {
    const t = await c.from("tasks").select("*").order("created_at", { ascending: false }); if (t.error) throw t.error;
    const k = await c.from("task_comments").select("*").order("created_at", { ascending: true }); if (k.error) throw k.error;
    return { tasks: (t.data || []).map(normTask), comments: (k.data || []) as TaskComment[] };
  }
  let r = newRpc === false ? null : await c.rpc("tasks_visible", { p_from: w.from, p_to: w.to });
  if (r && r.error && missing(r.error)) { newRpc = false; r = null; } else if (r && !r.error) newRpc = true;
  if (!r) r = await c.rpc("tasks_my_list");
  if (r.error) throw r.error;
  const d = (r.data || {}) as { tasks?: Record<string, unknown>[]; comments?: TaskComment[] };
  return { tasks: (d.tasks || []).map(normTask), comments: d.comments || [] };
}

async function fetchEvents(a: Access, w: Win): Promise<EventsData> {
  if (isDemo) {
    const { demoStore } = await import("./demo"), me = { email: a.email, point: a.point };
    return { ok: true, events: demoStore().events.filter((e) => (a.isAdmin || visibleTo(e, me)) && e.starts_on <= w.to && (e.ends_on || e.starts_on) >= w.from) };
  }
  const c = client();
  if (a.isAdmin) {
    const r = await c.from("cal_events").select("*").lte("starts_on", w.to).or(`ends_on.gte.${w.from},starts_on.gte.${w.from}`).order("starts_on", { ascending: true });
    if (r.error) { if (missing(r.error)) return { events: [], ok: false }; throw r.error; }
    return { events: (r.data || []).map(normEvent), ok: true };
  }
  const r = await c.rpc("cal_events_visible", { p_from: w.from, p_to: w.to });
  if (r.error) { if (missing(r.error)) return { events: [], ok: false }; throw r.error; }
  return { events: ((r.data || []) as Record<string, unknown>[]).map(normEvent), ok: true };
}

const KEY = "kassa-tasks";
/** задания и комментарии; enabled=false — запрос не идёт (нет права «Задания») */
export function useTasks(a: Access, win?: Win, enabled = true) {
  const w = win || gridRange(todayTash().slice(0, 7)); // без окна (Главная) — текущий месяц
  return useQuery({ queryKey: [KEY, "tasks", a.role, a.point, a.email, w.from, w.to], queryFn: () => fetchTasks(a, w), enabled: enabled && canPerm(a, "tasks"), staleTime: 30_000, placeholderData: keepPreviousData });
}
/** события календаря в окне; ok=false — таблицы ещё нет (старая схема) */
export function useEvents(a: Access, w: Win, enabled = true) {
  return useQuery({ queryKey: [KEY, "events", a.role, a.point, a.email, w.from, w.to], queryFn: () => fetchEvents(a, w), enabled: enabled && canPerm(a, "tasks"), staleTime: 30_000, placeholderData: keepPreviousData });
}

export interface NewTask { scope: Scope; point: string; person: string; personLabel?: string; title: string; body: string; priority: Priority; due: string; time: string }
export interface NewEvent { scope: Scope; point: string; person: string; title: string; body: string; kind: string; date: string; allDay: boolean; startTime: string; endDate: string; endTime: string }

/** запись: после каждого действия список перечитывается; ошибки бросаются наверх (экран показывает toast) */
export function useTaskActions(a: Access) {
  const qc = useQueryClient();
  const done = async () => { await qc.invalidateQueries({ queryKey: [KEY] }); };
  const demo = async () => (await import("./demo")).demoStore();
  const now = () => new Date().toISOString();
  return {
    async create(v: NewTask) {
      if (!a.isAdmin) return;
      const person = lc(v.person), assignee = v.scope === "person" ? (v.personLabel || person).slice(0, MAXLEN.assignee) : null, point = v.scope === "point" ? v.point : null;
      if (isDemo) { (await demo()).tasks.push({ id: "n" + Date.now(), scope: v.scope, point, title: v.title, body: v.body, priority: v.priority, due: v.due || null, due_time: v.due && v.time ? v.time : null, assignee, assignee_email: v.scope === "person" ? person : null, status: "new", source: "owner", created_label: "Владелец", created_at: now(), updated_at: now(), done_at: null }); return done(); }
      const row = { scope: v.scope, point, assignee_email: v.scope === "person" ? person : null, due_time: v.due && v.time ? v.time : null, title: v.title, body: v.body, priority: v.priority, due: v.due || null, assignee, source: "owner", created_by: a.email || null };
      let r = await client().from("tasks").insert(row);
      if (r.error && missing(r.error)) {
        // старая схема: «на точку» без времени пишем как раньше, остальное — после миграции
        if (v.scope !== "point") throw new Error(NEED_DB);
        const { scope: _s, assignee_email: _e, due_time: _t, ...old } = row; void _s; void _e; void _t;
        r = await client().from("tasks").insert(old);
      }
      if (r.error) throw r.error; await done();
    },
    async createEvent(v: NewEvent) {
      if (!a.isAdmin) return;
      const person = lc(v.person), point = v.scope === "point" ? v.point : null, endDate = v.endDate && v.endDate > v.date ? v.endDate : null;
      const row = { title: v.title, body: v.body, kind: v.kind || null, starts_on: v.date, start_time: v.allDay ? null : v.startTime || null, ends_on: endDate, end_time: v.allDay ? null : v.endTime || null, all_day: v.allDay, scope: v.scope, point, assignee_email: v.scope === "person" ? person : null };
      if (isDemo) { (await demo()).events.push({ id: "ne" + Date.now(), ...row, created_at: now() }); return done(); }
      const r = await client().from("cal_events").insert({ ...row, created_by: a.email || null });
      if (r.error) throw missing(r.error) ? new Error("События появятся после обновления базы") : r.error;
      await done();
    },
    async removeEvent(id: string) {
      if (!a.isAdmin) throw new Error("Только владелец или админ");
      if (isDemo) { const s = await demo(); s.events = s.events.filter((x) => x.id !== id); return done(); }
      const r = await client().from("cal_events").delete().eq("id", id); if (r.error) throw r.error; await done();
    },
    async setStatus(id: string, status: Status) {
      if (!a.isAdmin) throw new Error("Только владелец или админ");
      if (isDemo) { const t = (await demo()).tasks.find((x) => x.id === id); if (t) { t.status = status; t.done_at = status === "done" ? now() : null; } return done(); }
      const r = await client().from("tasks").update({ status }).eq("id", id); if (r.error) throw r.error; await done();
    },
    async remove(id: string) {
      if (!a.isAdmin) throw new Error("Только владелец или админ");
      if (isDemo) { const s = await demo(); s.tasks = s.tasks.filter((x) => x.id !== id); s.comments = s.comments.filter((x) => x.task_id !== id); return done(); }
      const r = await client().from("tasks").delete().eq("id", id); if (r.error) throw r.error; await done();
    },
    async comment(id: string, body: string) {
      if (isDemo) { (await demo()).comments.push({ id: "k" + Date.now(), task_id: id, author_email: null, author_label: a.isAdmin ? "Владелец" : "Сотрудник точки", kind: "comment", body, created_at: now() }); return done(); }
      if (a.isAdmin) { const r = await client().from("task_comments").insert({ task_id: id, author_email: a.email || null, author_label: "Владелец", kind: "comment", body }); if (r.error) throw r.error; }
      else { const r = await client().rpc("tasks_comment", { p_task: id, p_body: body }); if (r.error) throw r.error; }
      await done();
    },
    async problem(title: string, body: string) {
      if (isDemo) { (await demo()).tasks.push({ id: "p" + Date.now(), scope: "point", point: a.point || TASK_POINTS[0], title, body, priority: "normal", due: null, assignee: null, status: "new", source: "seller", created_label: "Вы", created_at: now(), updated_at: now(), done_at: null }); return done(); }
      const r = await client().rpc("tasks_problem", { p_title: title, p_body: body }); if (r.error) throw r.error; await done();
    },
  };
}
