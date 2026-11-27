// Пользователи: роли, права, вызов серверной функции users-admin, группировка по точкам.
import { client, isDemo } from "@/lib/source";
import { pl } from "@/features/pay/logic";
import { demoRows } from "./demo";

export type Role = "owner" | "admin" | "cashier" | "seller" | "marketer";
export type Perms = Record<string, boolean>;
// что отдаёт access_list: итоговые права в perms, личные отличия в perms_own, вход — last_sign_in_at
export type UserRow = { email: string; role: Role; point: string | null; label: string | null; phone: string | null; position: string | null; note: string | null; perms: Perms | null; perms_own?: Perms | null; active: boolean; created_at?: string; last_sign_in_at: string | null };

export const ROLES: Record<Role, string> = { owner: "Владелец", admin: "Админ", cashier: "Кассир", seller: "Продавец", marketer: "Гость" };
const ROLE_PL: Record<Role, [string, string, string]> = { owner: ["владелец", "владельца", "владельцев"], admin: ["админ", "админа", "админов"], cashier: ["кассир", "кассира", "кассиров"], seller: ["продавец", "продавца", "продавцов"], marketer: ["гость", "гостя", "гостей"] };
export const MIN_PASS = 10;
const NOFN = "Серверная функция не выложена";

export const PERMS: [string, string][] = [["sales_view", "Видеть продажи"], ["sales_write", "Вносить продажи"], ["sales_edit", "Править и удалять продажи за сегодня и вчера"],
  ["exp_view", "Видеть расходы дня"], ["exp_add", "Добавлять расход дня"], ["exp_edit", "Править и удалять расходы дня"],
  ["cash_view", "Видеть кассу дня"], ["debts_view", "Видеть долги"], ["att_view", "Журнал прихода"], ["analytics", "Аналитика продаж"], ["export", "Экспорт в Excel"], ["tasks", "Задания своей точки"]];
const KEYS = PERMS.map((p) => p[0]);
// стартовый набор по роли (как ROLE_ON в функции); admin и owner — полный доступ
export const DEF: Record<string, string[]> = { cashier: KEYS.filter((k) => k !== "analytics" && k !== "export"), seller: ["sales_view", "exp_view", "exp_add", "att_view", "tasks"], marketer: ["sales_view", "analytics"] };
export const defPerms = (role: string): Perms => Object.fromEntries(KEYS.map((k) => [k, (DEF[role] || []).includes(k)]));
export const fullPerms = (): Perms => Object.fromEntries(KEYS.map((k) => [k, true]));
/** права для формы: у admin/owner все включены, иначе итоговые из списка или набор по роли */
export const permsOf = (u: Pick<UserRow, "role" | "perms">): Perms => (u.role === "admin" || u.role === "owner" ? fullPerms() : { ...defPerms(u.role), ...(u.perms || {}) });

/** пароль из n знаков: латиница и цифры без похожих (0/O, 1/l/I) */
export function genPass(n = 12): string {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789", b = new Uint32Array(n);
  crypto.getRandomValues(b);
  return [...b].map((x) => A[x % A.length]).join("");
}

export const dt = (v?: string | null) => {
  if (!v) return "ещё не входил";
  const d = new Date(v);
  return isNaN(+d) ? "ещё не входил" : d.toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

/** что можно делать со строкой: edit — правка (limited — только имя, телефон, должность, заметка), ops — выключить, пароль, удалить */
export function can(u: UserRow, me: { email: string; role: Role }) {
  const mine = u.email.toLowerCase() === me.email.toLowerCase();
  if (u.role === "owner") return { edit: mine, limited: true, ops: false };
  if (u.role === "admin") return me.role === "owner" ? { edit: true, limited: mine, ops: !mine } : { edit: mine, limited: true, ops: false };
  return { edit: true, limited: false, ops: !mine };
}
export const rolesFor = (me: Role): Role[] => (me === "owner" ? ["admin", "cashier", "seller", "marketer"] : ["cashier", "seller", "marketer"]);

/** группы по точкам: «все точки» первой, дальше в порядке настроек, потом прочие */
export function groups(rows: UserRow[], points: string[]) {
  const keys = [...new Set(rows.map((u) => u.point || ""))];
  const ord = (k: string) => (k === "" ? -1 : points.indexOf(k) >= 0 ? points.indexOf(k) : 1000);
  keys.sort((a, b) => ord(a) - ord(b) || a.localeCompare(b, "ru"));
  return keys.map((k) => ({ key: k, title: k || "Все точки", rows: rows.filter((u) => (u.point || "") === k) }));
}

export function byRoles(rows: UserRow[]) {
  const order: Role[] = ["owner", "admin", "cashier", "seller", "marketer"];
  return order.map((r) => [r, rows.filter((u) => u.role === r).length] as const).filter(([, n]) => n > 0).map(([r, n]) => `${n} ${pl(n, ...ROLE_PL[r])}`).join(" · ");
}
export const recent = (rows: UserRow[], days = 7) => rows.filter((u) => u.last_sign_in_at && Date.now() - +new Date(u.last_sign_in_at) < days * 86400_000).length;

// ---- демо: список в памяти, действия имитируются локально ----
let mem: UserRow[] | null = null;
const demoDo = (action: string, b: Record<string, unknown>): { error?: string } => {
  const rows = (mem ??= demoRows());
  const u = rows.find((x) => x.email === b.email);
  if (action === "create") {
    if (u) return { error: "Такой пользователь уже есть" };
    const role = b.role as Role;
    rows.push({ email: String(b.email), role, point: (b.point as string) || null, label: (b.label as string) || null, phone: (b.phone as string) || null, position: (b.position as string) || null, note: (b.note as string) || null, perms: role === "admin" ? null : (b.perms as Perms), active: true, last_sign_in_at: null });
  } else if (!u) return { error: "Пользователь не найден" };
  else if (action === "delete") mem = rows.filter((x) => x !== u);
  else if (action === "update") Object.assign(u, Object.fromEntries(Object.entries(b).filter(([k]) => k !== "email" && k !== "action")));
  return {};
};

/** вызов функции: успех — data.ok, бизнес-ошибка — data.error (статус 200), сбой HTTP — тело ответа */
export async function call(action: string, body: Record<string, unknown> = {}): Promise<{ error?: string; data?: Record<string, unknown> }> {
  if (isDemo) return demoDo(action, body);
  try {
    const r = await client().functions.invoke("users-admin", { body: { action, ...body } });
    if (r.error) {
      let m = "";
      try { const j = await (r.error as { context?: Response }).context?.json(); m = (j && j.error) || ""; } catch { /* тела нет */ }
      return { error: m || (/not found|404|Failed to send|fetch/i.test(String(r.error.message || "")) ? NOFN : "Не удалось выполнить запрос") };
    }
    const d = (r.data || {}) as Record<string, unknown>;
    if (d.error) return { error: String(d.error) };
    if (d.ok !== true) return { error: "Не удалось выполнить запрос" };
    return { data: d };
  } catch (e) { return { error: e && (e as Error).name === "FunctionsFetchError" ? "Нет связи с сервером" : NOFN }; }
}

/** список: сначала RPC access_list, если его нет — функция */
export async function listUsers(): Promise<UserRow[]> {
  if (isDemo) return structuredClone((mem ??= demoRows()));
  let why = "";
  try { const r = await client().rpc("access_list"); if (r && !r.error) return Array.isArray(r.data) ? (r.data as UserRow[]) : []; why = r?.error?.message || ""; } catch { /* пробуем функцию */ }
  const r = await call("list");
  if (r.error) throw new Error(why ? `Список не получен: ${why}. ${r.error}` : r.error);
  const d = r.data || {};
  return (Array.isArray(d.users) ? d.users : Array.isArray(d.list) ? d.list : []) as UserRow[];
}
