// Доступ по ролям (как на рабочем сайте, dev/role/role.js): статус, точка и права из RPC my_access.
// owner и admin — всё; кассир, продавец и гость — только разделы, которые открывают их права.
import { createContext, createElement, useContext, type ReactNode } from "react";
import { client, demoPoint, demoRole, isDemo, setLimited } from "./source";

export type Role = "owner" | "admin" | "cashier" | "seller" | "marketer";
export interface Access { role: Role; isOwner: boolean; isAdmin: boolean; point: string | null; perms: Record<string, boolean>; email: string }

export const ROLE_LABEL: Record<Role, string> = { owner: "Владелец", admin: "Админ", cashier: "Кассир", seller: "Продавец", marketer: "Гость" };
const ROLES = Object.keys(ROLE_LABEL) as Role[];
// право, которое открывает раздел (остальные разделы — только owner/admin); «Главная» открыта всем
const TABP: Record<string, string> = { sales: "sales_view", analytics: "analytics", tasks: "tasks" };
// все права (ключи perms) — для набора по умолчанию
const PERMS = ["sales_view", "sales_write", "sales_edit", "exp_view", "exp_add", "exp_edit", "cash_view", "debts_view", "att_view", "analytics", "export", "tasks"];
// набор по умолчанию для статуса (как role_perms и DEF в dev/role/users.js)
const DEF: Record<string, string[]> = {
  cashier: PERMS.filter((k) => k !== "analytics" && k !== "export"),
  seller: ["sales_view", "exp_view", "exp_add", "att_view", "tasks"],
  marketer: ["sales_view", "analytics"],
};
const toPerms = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, true]));
const make = (role: Role, point: string | null, perms: Record<string, boolean>, email: string): Access =>
  ({ role, isOwner: role === "owner", isAdmin: role === "owner" || role === "admin", point, perms, email });

/** Права после входа. null — доступа нет (нет строки в members, отключён). Нет функции my_access (старая база) — владелец. */
export async function loadAccess(email: string): Promise<Access | null> {
  if (isDemo) {
    const r = ROLES.includes(demoRole as Role) ? (demoRole as Role) : "owner", lim = r !== "owner" && r !== "admin";
    const a = make(r, lim ? demoPoint || "Премиум" : null, toPerms(DEF[r] || []), email);
    setLimited(!a.isAdmin);
    return a;
  }
  const c = client();
  const mem = await c.from("members").select("email").limit(1);
  if (mem.error || !mem.data || !mem.data.length) return null;
  try {
    const r = await c.rpc("my_access");
    if (r.error) {
      if (/PGRST202|schema cache|could not find/i.test(String(r.error.code || "") + " " + String(r.error.message || ""))) { setLimited(false); return make("owner", null, {}, email); }
      return null;
    }
    const a = Array.isArray(r.data) ? r.data[0] : r.data;
    if (!a || !ROLES.includes(a.role)) return null;
    const out = make(a.is_owner === true ? "owner" : a.role, a.point || null, a.perms && typeof a.perms === "object" ? a.perms : {}, email);
    setLimited(!out.isAdmin);
    return out;
  } catch { return null; }
}

/** есть ли право (владелец и админ — все) */
export const canPerm = (a: Access, k: string) => a.isAdmin || !!a.perms[k];
/** можно ли открыть раздел: «Главная» — всем, «Пользователи» — owner/admin, остальные по правам */
export function canTab(a: Access, id: string) {
  if (a.isAdmin || id === "home") return true;
  return !!TABP[id] && !!a.perms[TABP[id]];
}

const Ctx = createContext<Access | null>(null);
export const AccessProvider = ({ value, children }: { value: Access; children: ReactNode }) => createElement(Ctx.Provider, { value }, children);
export function useAccess(): Access {
  const a = useContext(Ctx);
  if (!a) throw new Error("useAccess вне AccessProvider");
  return a;
}
