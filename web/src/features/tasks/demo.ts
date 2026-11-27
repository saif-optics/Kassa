// Тестовые задания, события и комментарии для ?demo (выдуманные). Хранятся в памяти: правки в демо видны до перезагрузки.
// Даты — от сегодняшнего дня (+N вперёд, −N назад), чтобы календарь всегда был «живой».
import type { CalEvent, Task, TaskComment } from "./logic";

const dd = (n: number) => new Date(Date.now() + 5 * 3600e3 + n * 864e5).toISOString().slice(0, 10);
const ts = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600e3).toISOString();

let store: { tasks: Task[]; events: CalEvent[]; comments: TaskComment[] } | null = null;
export function demoStore() {
  if (store) return store;
  const T = (id: string, p: Partial<Task> & Pick<Task, "title">, hours: number): Task => ({
    id, scope: "point", point: null, body: "", priority: "normal", due: null, due_time: null, assignee: null, assignee_email: null, status: "new", source: "owner", created_by: null, created_label: "Владелец",
    created_at: ts(hours), updated_at: ts(hours), done_at: null, ...p,
  });
  const ALL = { scope: "all" as const, point: null };
  const P = (point: string) => ({ scope: "point" as const, point });
  const U = (email: string, name: string) => ({ scope: "person" as const, point: null, assignee_email: email, assignee: name });
  const done = (h: number) => ({ status: "done" as const, done_at: ts(h), updated_at: ts(h) });
  const tasks: Task[] = [
    T("t1", { ...P("Премиум"), title: "Протереть витрины перед открытием", body: "Каждое утро: витрины с оправами и стекло у входа.", priority: "high", due: dd(-2), assignee: "Продавец смены", status: "work" }, 90),
    T("t2", { ...P("Премиум"), title: "Пересчитать оправы на стенде у окна", body: "Сверить с остатком в Billz и написать расхождения в комментарии.", due: dd(3), due_time: "12:00", assignee: "Продавец смены" }, 30),
    T("t3", { ...P("Яшнабад"), title: "Не печатается чек на терминале", body: "С утра терминал просит бумагу, хотя рулон новый.", priority: "high", source: "seller", status: "new" }, 5),
    T("t4", { ...P("Яшнабад"), title: "Предложение: повесить ценники на солнцезащитные", body: "Клиенты часто спрашивают цену, а ценников нет.", priority: "low", source: "seller", status: "work" }, 50),
    T("t5", { ...P("Яшнабад"), title: "Заказать салфетки и растворы", due: dd(1), assignee: "Администратор" }, 20),
    T("t6", { ...P("Сергели"), title: "Выкладка солнцезащитных", due: dd(0), due_time: "18:00", status: "new" }, 70),
    T("t7", { ...P("Сергели"), title: "Заменить лампу над примерочной", due: dd(-4), ...done(48) }, 120),
    T("t8", { ...P("C1"), title: "Отчёт по C1", priority: "normal", due: dd(-2), assignee: "Курьер", status: "work" }, 40),
    T("t9", { ...P("C1"), title: "Нет ключа от шкафа с линзами", body: "Ключ остался у предыдущей смены.", source: "seller", status: "new" }, 3),
    T("t10", { ...P("Премиум"), title: "Обновить афишу акции", due: dd(-3), ...done(24 * 3) }, 24 * 6),
    T("t11", { ...ALL, title: "Пересчёт кассы", body: "Пересчитать наличные и записать итог в «Кассу».", priority: "high", due: dd(0), due_time: "20:00", status: "new" }, 26),
    T("t12", { ...ALL, title: "Закрыть месяц", body: "Проверить расходы дня и отметить платежи.", due: dd(2), status: "new" }, 60),
    T("t13", { ...U("demo@saif-optics", "Вы"), title: "Позвонить клиентам по заказам", body: "Сообщить, что заказы линз пришли.", due: dd(0), due_time: "19:00", status: "new" }, 8),
    T("t14", { ...U("madina@example.invalid", "Мадина Саидова"), title: "Позвонить поставщику линз", due: dd(0), due_time: "15:00", status: "new" }, 8),
    T("t15", { ...U("dilnoza@example.invalid", "Дилноза Юсупова"), title: "Фото новинок для Instagram", priority: "low", due: dd(-6), ...done(24 * 5) }, 24 * 8),
    T("t16", { ...ALL, title: "Налог с оборота", priority: "high", due: dd(-12), ...done(24 * 11) }, 24 * 15),
    T("t17", { ...ALL, title: "Сверка Billz", due: dd(-3), ...done(24 * 2) }, 24 * 6),
    T("t18", { ...P("Яшнабад"), title: "Чистка витрин", due: dd(-5), ...done(24 * 4) }, 24 * 8),
    T("t19", { ...P("Премиум"), title: "Инвентаризация оправ", due: dd(5), status: "new" }, 24),
    T("t20", { ...U("farrukh@example.invalid", "Фаррух Тошев"), title: "Починить оправу клиента", priority: "high", due: dd(1), due_time: "11:00", status: "work" }, 12),
  ];
  const E = (id: string, p: Partial<CalEvent> & Pick<CalEvent, "title" | "starts_on">): CalEvent => ({
    id, body: "", start_time: null, ends_on: null, end_time: null, all_day: false, scope: "all", point: null, assignee_email: null, kind: "other", ...p,
  });
  const events: CalEvent[] = [
    E("e1", { title: "Собрание", starts_on: dd(0), start_time: "18:00", kind: "meeting", body: "Итоги недели и планы." }),
    E("e2", { title: "Зарплата", starts_on: dd(2), all_day: true, kind: "salary" }),
    E("e3", { title: "Поставка Essilor", starts_on: dd(6), start_time: "11:00", kind: "delivery", scope: "point", point: "Премиум" }),
    E("e4", { title: "Обучение: линзы MiyoSmart", starts_on: dd(10), ends_on: dd(11), start_time: "10:00", end_time: "13:00", kind: "meeting" }),
    E("e5", { title: "Инвентаризация склада", starts_on: dd(-6), all_day: true, scope: "point", point: "Яшнабад" }),
    E("e6", { title: "День рождения Мадины", starts_on: dd(4), all_day: true, scope: "person", assignee_email: "madina@example.invalid" }),
  ];
  const C = (id: string, task_id: string, author_label: string, body: string, hours: number, kind: TaskComment["kind"] = "comment"): TaskComment =>
    ({ id, task_id, author_email: null, author_label, kind, body, created_at: ts(hours) });
  const comments: TaskComment[] = [
    C("c1", "t1", "Владелец", "Проверьте, пожалуйста, и отпишитесь, когда сделаете.", 80),
    C("c2", "t1", "Сотрудник точки", "Сделали сегодня утром, осталось стекло у входа.", 20),
    C("c3", "t3", "Сотрудник точки", "Терминал просит бумагу уже второй раз за неделю.", 4, "problem"),
    C("c4", "t4", "Владелец", "Хорошая идея, подготовим ценники на этой неделе.", 30),
  ];
  return (store = { tasks, events, comments });
}
