// Управление пользователями Кассы: список, создание, правка, пароль, удаление.
// Выкладывается с --no-verify-jwt, поэтому права проверяем сами: Bearer-токен вызывающего + rpc is_admin(),
// затем строка вызывающего в public.members (роль owner или admin, активен).
// Иерархия: owner — всё над всеми, кроме роли/активности/удаления своей записи (имя, телефон, должность, заметку можно);
// admin — только над cashier/seller/marketer, админов и владельца не создаёт и не трогает; второго owner создать нельзя.
// Учётные записи — Supabase Auth, роли, точки и права — таблица public.members (perms хранит только переопределения).
// Ошибки базы (например триггер members_guard) возвращаются текстом как есть.
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const ROLES = ["admin", "cashier", "seller", "marketer"]; // owner назначить нельзя
const LOW_ROLES = ["cashier", "seller", "marketer"]; // роли, которыми управляет admin
const PERM_KEYS = ["sales_view", "sales_write", "sales_edit", "exp_view", "exp_add", "exp_edit", "cash_view", "debts_view", "att_view", "analytics", "export"];
// Набор прав по умолчанию — как SQL-функция role_perms(role)
const ROLE_ON: Record<string, string[]> = {
  admin: PERM_KEYS,
  cashier: PERM_KEYS.filter((k) => k !== "analytics" && k !== "export"),
  seller: ["sales_view", "exp_view", "exp_add", "att_view"],
  marketer: ["sales_view", "analytics"],
};
// В members.perms пишем только отличия от набора роли; у admin права всегда полные
const permsDiff = (role: string, perms: Record<string, boolean>) => {
  if (role === "admin" || role === "owner") return {};
  const on = ROLE_ON[role] || [];
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(perms)) if (v !== on.includes(k)) out[k] = v;
  return out;
};
const MIN_PASS = 10;
const NO_RIGHTS = "Недостаточно прав";

const reply = (o: unknown, status = 200) => Response.json(o, { status, headers: CORS });
const fail = (error: string) => reply({ error });

// Бизнес-ошибка: попадает в ответ 200 {error}
class Biz extends Error {}
const bad = (m: string): never => { throw new Biz(m); };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const auth = req.headers.get("Authorization") || "";
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return reply({ error: "Нужен вход" }, 401);
    const jwt = m[1].trim();

    const me = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: u, error: ue } = await me.auth.getUser(jwt);
    const myEmail = String(u?.user?.email || "").toLowerCase();
    if (ue || !myEmail) return reply({ error: "Нужен вход" }, 401);
    const { data: isAdm, error: ae } = await me.rpc("is_admin");
    if (ae || isAdm !== true) return reply({ error: "Только для владельца" }, 403);

    const sb = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    // Вызывающий: строка members, роль owner/admin, активен
    const { data: meRow, error: me2 } = await sb.from("members").select("role, active").eq("email", myEmail).maybeSingle();
    if (me2) throw me2;
    const myRole = String(meRow?.role || "");
    if (!meRow || meRow.active !== true || (myRole !== "owner" && myRole !== "admin")) return reply({ error: NO_RIGHTS }, 403);
    const isOwner = myRole === "owner";
    // Может ли вызывающий управлять пользователем с такой ролью
    const canManage = (r: string) => isOwner || LOW_ROLES.includes(r);

    let body: any = {};
    try { body = await req.json(); } catch { /* пустое тело */ }
    const action = String(body?.action || "");

    const normEmail = (v: unknown) => {
      const e = String(v || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) bad("Некорректный email");
      return e;
    };
    const checkPass = (v: unknown) => {
      const p = String(v || "");
      if (p.length < MIN_PASS) bad(`Пароль — не короче ${MIN_PASS} знаков`);
      return p;
    };
    const checkRole = (v: unknown) => {
      const r = String(v || "");
      if (!ROLES.includes(r)) bad("Неизвестная роль");
      return r;
    };
    const checkText = (v: unknown, max: number, name: string) => {
      const t = String(v ?? "").trim();
      if (t.length > max) bad(`${name} — не длиннее ${max} знаков`);
      return t || null;
    };
    // Права: только известные ключи и boolean-значения
    const checkPerms = (v: unknown) => {
      if (v === undefined || v === null) return {};
      if (typeof v !== "object" || Array.isArray(v)) bad("Неверные права");
      const out: Record<string, boolean> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (!PERM_KEYS.includes(k)) bad("Неизвестное право");
        if (typeof val !== "boolean") bad("Неверное значение права");
        out[k] = val as boolean;
      }
      return out;
    };
    // Точка из списка настроек; пустая — ошибка
    const checkPoint = async (v: unknown) => {
      const p = String(v ?? "").trim();
      if (!p) return bad("Укажите точку");
      const { data, error } = await sb.from("docs").select("data").eq("col", "settings").eq("id", "sales").maybeSingle();
      if (error) throw error;
      const pts: unknown = data?.data?.points;
      if (!Array.isArray(pts) || !pts.includes(p)) bad("Такой точки нет");
      return p;
    };
    // Для admin точка необязательна: пусто = все точки
    const checkPointFor = async (role: string, v: unknown) => {
      if (role === "admin" && (v === null || v === undefined || String(v).trim() === "")) return null;
      return await checkPoint(v);
    };
    const findAuth = async (email: string) => {
      const { data, error } = await sb.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;
      return data.users.find((x) => String(x.email || "").toLowerCase() === email) || null;
    };
    const getMember = async (email: string) => {
      const { data, error } = await sb.from("members").select("email, role, point, active").eq("email", email).maybeSingle();
      if (error) throw error;
      return data as { email: string; role: string; point: string | null; active: boolean } | null;
    };

    if (action === "list") {
      const { data, error } = await me.rpc("access_list");
      if (error) throw error;
      return reply({ ok: true, users: data || [] });
    }

    if (action === "create") {
      const email = normEmail(body.email);
      const password = checkPass(body.password);
      const role = checkRole(body.role);
      if (!canManage(role)) return fail(NO_RIGHTS);
      const label = checkText(body.label, 60, "Имя");
      const phone = checkText(body.phone, 30, "Телефон");
      const position = checkText(body.position, 40, "Должность");
      const note = checkText(body.note, 200, "Заметка");
      const perms = permsDiff(role, checkPerms(body.perms));
      const point = await checkPointFor(role, body.point);
      if (await getMember(email)) return fail("Такой пользователь уже есть");
      const { data: cu, error: ce } = await sb.auth.admin.createUser({ email, password, email_confirm: true });
      if (ce || !cu?.user) return fail(ce?.message || "Не удалось создать учётную запись");
      const { error: ie } = await sb.from("members").insert({ email, role, point, label, phone, position, note, perms, active: true });
      if (ie) {
        await sb.auth.admin.deleteUser(cu.user.id);
        return fail(ie.message);
      }
      return reply({ ok: true });
    }

    if (action === "update") {
      const email = normEmail(body.email);
      const self = email === myEmail;
      const cur = await getMember(email);
      if (!cur) return fail("Пользователь не найден");
      // admin трогает только cashier/seller/marketer; owner — всех (и себя в безопасных полях)
      if (!self && !canManage(cur.role)) return fail(NO_RIGHTS);
      // Свою роль, точку, права и активность не меняем: эти поля молча игнорируются (форма шлёт всё)
      if (self) {
        body = { email: body.email, label: body.label, phone: body.phone, position: body.position, note: body.note };
      }
      if (body.active !== undefined && typeof body.active !== "boolean") return fail("Неверное значение active");
      const patch: Record<string, unknown> = {};
      let role = cur.role;
      if (body.role !== undefined) {
        role = checkRole(body.role);
        if (!canManage(role)) return fail(NO_RIGHTS);
        patch.role = role;
      }
      if (body.role !== undefined || body.point !== undefined) {
        const pv = body.point !== undefined ? body.point : cur.point;
        patch.point = await checkPointFor(role, pv);
      }
      if (body.label !== undefined) patch.label = checkText(body.label, 60, "Имя");
      if (body.phone !== undefined) patch.phone = checkText(body.phone, 30, "Телефон");
      if (body.position !== undefined) patch.position = checkText(body.position, 40, "Должность");
      if (body.note !== undefined) patch.note = checkText(body.note, 200, "Заметка");
      if (body.perms !== undefined) patch.perms = permsDiff(role, checkPerms(body.perms));
      else if (body.role !== undefined && role !== cur.role) patch.perms = {}; // смена роли — сброс переопределений
      if (role === "admin") patch.perms = {};
      if (body.active !== undefined) patch.active = body.active;
      const newActive: boolean = body.active !== undefined ? body.active : cur.active;
      if (!Object.keys(patch).length) return reply({ ok: true });
      // сначала бан в Auth, потом members: если бан не прошёл, запись не расходится с Auth
      if (body.active !== undefined) {
        const au = await findAuth(email);
        if (au) {
          const { error: be } = await sb.auth.admin.updateUserById(au.id, { ban_duration: newActive ? "none" : "876000h" });
          if (be) throw be;
        }
      }
      const { error } = await sb.from("members").update(patch).eq("email", email);
      if (error) {
        // откат бана в Auth к прежнему состоянию
        if (body.active !== undefined && newActive !== cur.active) {
          const au = await findAuth(email);
          if (au) await sb.auth.admin.updateUserById(au.id, { ban_duration: cur.active ? "none" : "876000h" });
        }
        throw error;
      }
      return reply({ ok: true });
    }

    if (action === "password") {
      const email = normEmail(body.email);
      const password = checkPass(body.password);
      const cur = await getMember(email);
      if (cur && !canManage(cur.role)) return fail(NO_RIGHTS);
      if (!cur && !isOwner) return fail(NO_RIGHTS);
      const au = await findAuth(email);
      if (!au) return fail("Пользователь не найден");
      const { error } = await sb.auth.admin.updateUserById(au.id, { password });
      if (error) throw error;
      return reply({ ok: true });
    }

    if (action === "delete") {
      const email = normEmail(body.email);
      if (email === myEmail) return fail("Свою запись менять нельзя");
      const cur = await getMember(email);
      if (cur && cur.role === "owner") return fail("Владельца удалить нельзя");
      if (cur && !canManage(cur.role)) return fail(NO_RIGHTS);
      if (!cur && !isOwner) return fail(NO_RIGHTS);
      const au = await findAuth(email);
      if (au) {
        const { error } = await sb.auth.admin.deleteUser(au.id);
        if (error) throw error;
      }
      const { error } = await sb.from("members").delete().eq("email", email);
      if (error) throw error;
      return reply({ ok: true });
    }

    return fail("Неизвестное действие");
  } catch (e) {
    return fail((e && typeof e === "object" && "message" in e && String((e as { message: unknown }).message)) || JSON.stringify(e));
  }
});
