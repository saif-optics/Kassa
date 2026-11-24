// Тестовые задания и комментарии для ?demo (выдуманные). Хранятся в памяти: правки в демо видны до перезагрузки.
import type { Task, TaskComment } from "./logic";

const day = (back: number) => new Date(Date.now() + 5 * 3600e3 - back * 864e5).toISOString().slice(0, 10);
const ts = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600e3).toISOString();

let store: { tasks: Task[]; comments: TaskComment[] } | null = null;
export function demoStore() {
  if (store) return store;
  const T = (id: string, p: Partial<Task> & Pick<Task, "point" | "title">, hours: number): Task => ({
    id, body: "", priority: "normal", due: null, assignee: null, status: "new", source: "owner", created_by: null, created_label: "Владелец",
    created_at: ts(hours), updated_at: ts(hours), done_at: null, ...p,
  });
  const tasks: Task[] = [
    T("t1", { point: "Премиум", title: "Протереть витрины перед открытием", body: "Каждое утро: витрины с оправами и стекло у входа.", priority: "high", due: day(2), assignee: "Продавец смены", status: "work" }, 90),
    T("t2", { point: "Премиум", title: "Пересчитать оправы на стенде у окна", body: "Сверить с остатком в Billz и написать расхождения в комментарии.", due: day(-3), assignee: "Продавец смены" }, 30),
    T("t3", { point: "Яшнабад", title: "Не печатается чек на терминале", body: "С утра терминал просит бумагу, хотя рулон новый.", priority: "high", source: "seller", status: "new" }, 5),
    T("t4", { point: "Яшнабад", title: "Предложение: повесить ценники на солнцезащитные", body: "Клиенты часто спрашивают цену, а ценников нет.", priority: "low", source: "seller", status: "work" }, 50),
    T("t5", { point: "Яшнабад", title: "Заказать салфетки и растворы", priority: "normal", due: day(-1), assignee: "Администратор" }, 20),
    T("t6", { point: "Сергели", title: "Сверить цены в Billz с ценниками", due: day(1), assignee: "Продавец", status: "new" }, 70),
    T("t7", { point: "Сергели", title: "Заменить лампу над примерочной", status: "done", done_at: ts(48), updated_at: ts(48) }, 120),
    T("t8", { point: "C1", title: "Привезти заказ линз мастеру", priority: "high", due: day(0), assignee: "Курьер", status: "work" }, 40),
    T("t9", { point: "C1", title: "Нет ключа от шкафа с линзами", body: "Ключ остался у предыдущей смены.", source: "seller", status: "new" }, 3),
    T("t10", { point: "Премиум", title: "Обновить афишу акции", status: "done", done_at: ts(24 * 3), updated_at: ts(24 * 3) }, 24 * 6),
  ];
  const C = (id: string, task_id: string, author_label: string, body: string, hours: number, kind: TaskComment["kind"] = "comment"): TaskComment =>
    ({ id, task_id, author_email: null, author_label, kind, body, created_at: ts(hours) });
  const comments: TaskComment[] = [
    C("c1", "t1", "Владелец", "Проверьте, пожалуйста, и отпишитесь, когда сделаете.", 80),
    C("c2", "t1", "Сотрудник точки", "Сделали сегодня утром, осталось стекло у входа.", 20),
    C("c3", "t3", "Сотрудник точки", "Терминал просит бумагу уже второй раз за неделю.", 4, "problem"),
    C("c4", "t4", "Владелец", "Хорошая идея, подготовим ценники на этой неделе.", 30),
  ];
  return (store = { tasks, comments });
}
