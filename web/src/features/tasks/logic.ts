// Расчёты и работа с базой раздела «Задания» (перенос dev/tasks/tasks.js).
// Админ (owner/admin) читает и пишет таблицы tasks / task_comments напрямую (RLS), ограниченная роль — только через RPC
// tasks_my_list / tasks_comment / tasks_problem. В демо данные берутся из demo.ts (в памяти).
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { canPerm, type Access } from "@/lib/access";
import { client, isDemo } from "@/lib/source";

export const TASK_POINTS = ["Премиум", "Яшнабад", "Сергели", "C1"];
export type Priority = "low" | "normal" | "high";
export type Status = "new" | "work" | "done";
export interface Task {
  id: string; point: string; title: string; body: string; priority: Priority; due: string | null; assignee: string | null;
  status: Status; source: "owner" | "seller"; created_by?: string | null; created_label?: string;
  created_at: string; updated_at: string; done_at: string | null;
}
export interface TaskComment { id: string; task_id: string; author_email?: string | null; author_label: string | null; kind: "comment" | "problem"; body: string; created_at: string }
export interface TasksData { tasks: Task[]; comments: TaskComment[] }

export const PRI: Record<Priority, string> = { high: "Срочно", normal: "Обычное", low: "Не горит" };
export const ST: Record<Status, string> = { new: "Новая", work: "В работе", done: "Сделано" };
export const MAXLEN = { title: 200, body: 4000, assignee: 80, comment: 2000 };

export const todayTash = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);
export const fmtD = (d: string | null) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : "");
export const fmtT = (t: string) => { const d = new Date(t); return isNaN(+d) ? "" : d.toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); };
export const isOverdue = (t: Task, today: string) => t.status !== "done" && !!t.due && String(t.due).slice(0, 10) < today;

/** итоги для плиток: открыто, просрочено, от продавцов (новые), сделано за 14 дней */
export function taskStats(tasks: Task[], today: string, now = Date.now()) {
  const open = tasks.filter((t) => t.status !== "done");
  return {
    open: open.length, news: open.filter((t) => t.status === "new").length, work: open.filter((t) => t.status === "work").length,
    overdue: open.filter((t) => isOverdue(t, today)).length,
    sellers: tasks.filter((t) => t.source === "seller" && t.status === "new").length,
    done14: tasks.filter((t) => t.status === "done" && t.done_at && now - +new Date(t.done_at) <= 14 * 864e5).length,
  };
}

/** задания от продавцов без ответа владельца: статус «Новая» и нет комментария владельца */
export const unanswered = (tasks: Task[], comments: TaskComment[]) => {
  const answered = new Set(comments.filter((c) => c.author_label === "Владелец").map((c) => c.task_id));
  return tasks.filter((t) => t.source === "seller" && t.status === "new" && !answered.has(t.id));
};

// частые ошибки базы — по-русски, остальное как есть
export function errMsg(e: unknown) {
  const x = e as { message?: string; code?: string } | null, m = x?.message || "", c = x?.code;
  if (c === "42501" || /row-level security|permission denied/i.test(m)) return /[А-Яа-я]/.test(m) && c === "42501" ? m : "Нет прав на это действие";
  if (c === "23514" || /violates check constraint/i.test(m)) return "Слишком длинный текст или неверное значение";
  if (c === "23502") return "Заполните обязательное поле";
  return m || "Не получилось, попробуйте ещё раз";
}

async function fetchTasks(a: Access): Promise<TasksData> {
  if (isDemo) {
    const { demoStore } = await import("./demo"), s = demoStore();
    const tasks = s.tasks.filter((t) => a.isAdmin || (t.point === a.point && (t.status !== "done" || (t.done_at && Date.now() - +new Date(t.done_at) < 14 * 864e5))));
    const ids = new Set(tasks.map((t) => t.id));
    return { tasks: [...tasks].sort((x, y) => y.created_at.localeCompare(x.created_at)), comments: s.comments.filter((c) => ids.has(c.task_id)) };
  }
  const c = client();
  if (a.isAdmin) {
    const t = await c.from("tasks").select("*").order("created_at", { ascending: false }); if (t.error) throw t.error;
    const k = await c.from("task_comments").select("*").order("created_at", { ascending: true }); if (k.error) throw k.error;
    return { tasks: (t.data || []) as Task[], comments: (k.data || []) as TaskComment[] };
  }
  const r = await c.rpc("tasks_my_list"); if (r.error) throw r.error;
  const d = (r.data || {}) as Partial<TasksData>;
  return { tasks: d.tasks || [], comments: d.comments || [] };
}

const KEY = "kassa-tasks";
/** задания и комментарии; enabled=false — запрос не идёт (нет права «Задания») */
export function useTasks(a: Access, enabled = true) {
  return useQuery({ queryKey: [KEY, a.role, a.point, a.email], queryFn: () => fetchTasks(a), enabled: enabled && canPerm(a, "tasks"), staleTime: 30_000 });
}

export interface NewTask { point: string; title: string; body: string; priority: Priority; due: string; assignee: string }

/** запись: после каждого действия список перечитывается; ошибки бросаются наверх (экран показывает toast) */
export function useTaskActions(a: Access) {
  const qc = useQueryClient();
  const done = async () => { await qc.invalidateQueries({ queryKey: [KEY] }); };
  const demo = async () => (await import("./demo")).demoStore();
  const now = () => new Date().toISOString();
  return {
    async create(v: NewTask) {
      if (!a.isAdmin) return;
      if (isDemo) { (await demo()).tasks.push({ id: "n" + Date.now(), point: v.point, title: v.title, body: v.body, priority: v.priority, due: v.due || null, assignee: v.assignee || null, status: "new", source: "owner", created_label: "Владелец", created_at: now(), updated_at: now(), done_at: null }); return done(); }
      const r = await client().from("tasks").insert({ point: v.point, title: v.title, body: v.body, priority: v.priority, due: v.due || null, assignee: v.assignee || null, source: "owner", created_by: a.email || null });
      if (r.error) throw r.error; await done();
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
      if (isDemo) { (await demo()).tasks.push({ id: "p" + Date.now(), point: a.point || TASK_POINTS[0], title, body, priority: "normal", due: null, assignee: null, status: "new", source: "seller", created_label: "Вы", created_at: now(), updated_at: now(), done_at: null }); return done(); }
      const r = await client().rpc("tasks_problem", { p_title: title, p_body: body }); if (r.error) throw r.error; await done();
    },
  };
}
