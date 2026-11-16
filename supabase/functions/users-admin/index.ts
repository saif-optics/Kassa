// Управление пользователями Кассы для владельца: список, создание, правка, пароль, удаление.
// Выкладывается с --no-verify-jwt, поэтому права проверяем сами: Bearer-токен вызывающего + rpc is_admin().
// Учётные записи — Supabase Auth, роли и точки — таблица public.members.
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const ROLES = ["admin", "cashier", "seller", "marketer"];
const NEED_POINT = ["cashier", "seller"];
const MIN_PASS = 10;

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
    const checkLabel = (v: unknown) => {
      const l = String(v ?? "").trim();
      if (l.length > 60) bad("Имя — не длиннее 60 знаков");
      return l || null;
    };
    const checkPoint = async (v: unknown) => {
      const p = String(v ?? "").trim();
      if (!p) return bad("Укажите точку");
      const { data, error } = await sb.from("docs").select("data").eq("col", "settings").eq("id", "sales").maybeSingle();
      if (error) throw error;
      const pts: unknown = data?.data?.points;
      if (!Array.isArray(pts) || !pts.includes(p)) bad("Такой точки нет");
      return p;
    };
    const findAuth = async (email: string) => {
      const { data, error } = await sb.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;
      return data.users.find((x) => String(x.email || "").toLowerCase() === email) || null;
    };
    const getMember = async (email: string) => {
      const { data, error } = await sb.from("members").select("email, role, active").eq("email", email).maybeSingle();
      if (error) throw error;
      return data as { email: string; role: string; active: boolean } | null;
    };
    // Сколько активных админов останется, если исключить email
    const otherAdmins = async (email: string) => {
      const { data, error } = await sb.from("members").select("email").eq("role", "admin").eq("active", true).neq("email", email);
      if (error) throw error;
      return (data || []).length;
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
      const label = checkLabel(body.label);
      const point = NEED_POINT.includes(role) ? await checkPoint(body.point) : null;
      if (await getMember(email)) return fail("Такой пользователь уже есть");
      const { data: cu, error: ce } = await sb.auth.admin.createUser({ email, password, email_confirm: true });
      if (ce || !cu?.user) return fail(ce?.message || "Не удалось создать учётную запись");
      const { error: ie } = await sb.from("members").insert({ email, role, point, label, active: true });
      if (ie) {
        await sb.auth.admin.deleteUser(cu.user.id);
        return fail(ie.message);
      }
      return reply({ ok: true });
    }

    if (action === "update") {
      const email = normEmail(body.email);
      if (email === myEmail) return fail("Свою запись менять нельзя");
      const cur = await getMember(email);
      if (!cur) return fail("Пользователь не найден");
      const patch: Record<string, unknown> = {};
      const role = body.role !== undefined ? checkRole(body.role) : cur.role;
      if (body.role !== undefined) patch.role = role;
      if (body.role !== undefined || body.point !== undefined) {
        patch.point = NEED_POINT.includes(role) ? await checkPoint(body.point) : null;
      }
      if (body.label !== undefined) patch.label = checkLabel(body.label);
      if (body.active !== undefined) patch.active = !!body.active;
      const newActive = body.active !== undefined ? !!body.active : cur.active;
      // Нельзя оставить базу без активного админа
      if (cur.role === "admin" && cur.active && (role !== "admin" || !newActive) && (await otherAdmins(email)) < 1) {
        return fail("Должен остаться хотя бы один админ");
      }
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
      if (error) throw error;
      return reply({ ok: true });
    }

    if (action === "password") {
      const email = normEmail(body.email);
      const password = checkPass(body.password);
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
      if (cur && cur.role === "admin" && cur.active && (await otherAdmins(email)) < 1) return fail("Должен остаться хотя бы один админ");
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
