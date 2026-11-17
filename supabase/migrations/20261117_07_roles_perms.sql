-- Роли, часть 7 (17.11.2026): статус «владелец», права-переключатели у каждого пользователя, точка у любого статуса,
-- анкета (телефон, должность, заметка). Доступ к данным и запись проверяются по правам, а не по статусу.
--
-- Права (ключи perms): sales_view, sales_write, sales_edit, exp_view, exp_add, exp_edit, cash_view, debts_view,
--   att_view, analytics, export. Статус задаёт набор по умолчанию (role_perms), members.perms — переопределения владельца.
-- Владелец (owner) и админ (admin) читают таблицы напрямую (is_admin), их права не ограничиваются.

alter table public.members add column if not exists perms jsonb not null default '{}'::jsonb;
alter table public.members add column if not exists phone text;
alter table public.members add column if not exists "position" text;
alter table public.members add column if not exists note text;
alter table public.members drop constraint if exists members_role_chk;
alter table public.members add constraint members_role_chk check (role in ('owner','admin','cashier','seller','marketer'));
alter table public.members drop constraint if exists members_point_chk;
alter table public.members add constraint members_point_chk check (role in ('owner','admin') or point is not null);

-- Единственный admin на момент миграции — владелец.
update public.members set role = 'owner' where role = 'admin'
  and (select count(*) from public.members where role in ('owner','admin')) = 1;

-- Владельца нельзя удалить или понизить (страховка на уровне базы; остальное — users-admin).
create or replace function public.members_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    if old.role = 'owner' then raise exception 'Владельца удалить нельзя'; end if;
    return old;
  end if;
  if tg_op = 'UPDATE' and old.role = 'owner' and (new.role <> 'owner' or not new.active or lower(new.email) <> lower(old.email)) then
    raise exception 'Владельца изменить нельзя';
  end if;
  new.email := lower(new.email);
  return new;
end $$;
drop trigger if exists members_guard_tg on public.members;
create trigger members_guard_tg before update or delete on public.members
  for each row execute function public.members_guard();

create or replace function public.role_perms(p_role text) returns jsonb
language sql immutable set search_path = '' as $$
  select case p_role
    when 'owner' then '{"sales_view":true,"sales_write":true,"sales_edit":true,"exp_view":true,"exp_add":true,"exp_edit":true,"cash_view":true,"debts_view":true,"att_view":true,"analytics":true,"export":true}'::jsonb
    when 'admin' then '{"sales_view":true,"sales_write":true,"sales_edit":true,"exp_view":true,"exp_add":true,"exp_edit":true,"cash_view":true,"debts_view":true,"att_view":true,"analytics":true,"export":true}'::jsonb
    when 'cashier' then '{"sales_view":true,"sales_write":true,"sales_edit":true,"exp_view":true,"exp_add":true,"exp_edit":true,"cash_view":true,"debts_view":true,"att_view":true,"analytics":false,"export":false}'::jsonb
    when 'seller' then '{"sales_view":true,"sales_write":false,"sales_edit":false,"exp_view":true,"exp_add":true,"exp_edit":false,"cash_view":false,"debts_view":false,"att_view":true,"analytics":false,"export":false}'::jsonb
    when 'marketer' then '{"sales_view":true,"sales_write":false,"sales_edit":false,"exp_view":false,"exp_add":false,"exp_edit":false,"cash_view":false,"debts_view":false,"att_view":false,"analytics":true,"export":false}'::jsonb
    else '{}'::jsonb end
$$;

-- Текущий пользователь: роль, точка, итоговые права (по умолчанию + переопределения), подпись.
drop function if exists public.my_access();
create function public.my_access()
returns table(role text, point text, perms jsonb, label text)
language sql stable security definer set search_path = '' as $$
  select m.role, m.point, public.role_perms(m.role) || coalesce(m.perms, '{}'::jsonb), m.label
  from public.members m
  where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members m
    where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.role in ('owner','admin') and m.active)
$$;

create or replace function public.my_role()
returns text language sql stable security definer set search_path = '' as $$
  select m.role from public.members m where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active
$$;

create or replace function public.my_point()
returns text language sql stable security definer set search_path = '' as $$
  select m.point from public.members m where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active
$$;

-- Контекст ограниченной роли: email, точка, права, сегодня по Ташкенту. Для owner/admin — ошибка (они не ходят через RPC).
create or replace function public.limited_ctx(out o_email text, out o_point text, out o_perms jsonb, out o_today date)
language plpgsql stable security definer set search_path = '' as $$
declare r text;
begin
  o_email := lower(coalesce(auth.jwt()->>'email',''));
  select m.role, m.point, public.role_perms(m.role) || coalesce(m.perms, '{}'::jsonb)
    into r, o_point, o_perms from public.members m where lower(m.email) = o_email and m.active;
  if r is null or r in ('owner','admin') then
    raise exception 'Нет доступа' using errcode = '42501';
  end if;
  o_today := (now() at time zone 'Asia/Tashkent')::date;
end $$;

-- Документы ограниченной роли по правам. Точка null = все точки (только если так завёл владелец).
create or replace function public.role_docs()
returns table(col text, id text, data jsonb)
language plpgsql stable security definer set search_path = '' as $$
declare c record;
begin
  begin c := public.limited_ctx(); exception when others then return; end;
  return query select d.col, d.id, d.data - 'plan' from public.docs d where d.col = 'settings' and d.id = 'sales';
  if (c.o_perms->>'sales_view')::boolean then
    return query select d.col, d.id, d.data - 'cost' - 'costEst' - 'costSrc' - 'photo'
      from public.docs d where d.col = 'sales' and (c.o_point is null or d.data->>'point' = c.o_point);
  end if;
  if (c.o_perms->>'exp_view')::boolean or (c.o_perms->>'exp_add')::boolean then
    return query select d.col, d.id, d.data from public.docs d
      where d.col = 'entries' and (c.o_point is null or d.data->>'branch' = c.o_point)
        and d.data->>'type' = 'exp' and d.data->>'source' = 'day';
  end if;
  if (c.o_perms->>'exp_add')::boolean then
    return query select d.col, d.id,
        case when c.o_point is null then d.data else jsonb_build_object(c.o_point, coalesce(d.data->c.o_point, '[]'::jsonb)) end
      from public.docs d where d.col = 'settings' and d.id = 'sellerTpl';
  end if;
end $$;

-- Расход дня по шаблону (право exp_add): лимиты продавца.
create or replace function public.seller_add_expense(p_name text, p_amount numeric, p_date date default null)
returns text
language plpgsql security definer set search_path = '' as $$
declare c record; nm text; d date; nid text; n int;
begin
  c := public.limited_ctx();
  if not (c.o_perms->>'exp_add')::boolean or c.o_point is null then
    raise exception 'Нет права добавлять расход' using errcode = '42501';
  end if;
  nm := btrim(coalesce(p_name, ''));
  if length(nm) < 2 or length(nm) > 80 then raise exception 'Название расхода: от 2 до 80 знаков'; end if;
  if p_amount is null or p_amount <= 0 or p_amount <> floor(p_amount) then raise exception 'Сумма: целое число больше нуля'; end if;
  if p_amount > 3000000 then raise exception 'Расход больше 3 000 000 вносит владелец'; end if;
  d := coalesce(p_date, c.o_today);
  if d > c.o_today or d < c.o_today - 2 then raise exception 'Дата: сегодня или два прошлых дня'; end if;
  select count(*) into n from public.docs x where x.col = 'entries' and x.data->>'branch' = c.o_point
    and x.data->>'source' = 'day' and x.data->>'date' = to_char(d, 'YYYY-MM-DD');
  if n >= 30 then raise exception 'За день уже 30 расходов, дальше вносит владелец'; end if;
  nid := 'e' || to_char(d, 'MMDD') || 's' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
  insert into public.docs (col, id, data) values ('entries', nid, jsonb_build_object(
    'type', 'exp', 'cat', 'op', 'branch', c.o_point,
    'name', c.o_point || ' за ' || lower(left(nm, 1)) || substr(nm, 2),
    'amount', p_amount, 'date', to_char(d, 'YYYY-MM-DD'),
    'source', 'day', 'by', c.o_email,
    'createdAt', (extract(epoch from now()) * 1000)::bigint));
  return nid;
end $$;

-- Журнал прихода своей точки (право att_view).
create or replace function public.att_my_load(p_from timestamptz, p_to timestamptz)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare c record;
begin
  c := public.limited_ctx();
  if not (c.o_perms->>'att_view')::boolean or c.o_point is null then
    raise exception 'Нет доступа к журналу прихода' using errcode = '42501';
  end if;
  if p_to > p_from + interval '35 days' then raise exception 'Период не больше 35 дней'; end if;
  return jsonb_build_object(
    'point', c.o_point,
    'start_time', (select to_char(ap.start_time, 'HH24:MI') from public.att_points ap where ap.point = c.o_point limit 1),
    'employees', coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'name', e.name, 'point', e.point, 'active', e.active) order by e.name)
                   from public.att_employees e where e.point = c.o_point), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(jsonb_build_object('id', v.id, 'employee_id', v.employee_id, 'point', v.point,
                   'kind', v.kind, 'ts', v.ts, 'score', v.score) order by v.ts)
                   from public.att_events v where v.point = c.o_point and v.ts >= p_from and v.ts < p_to), '[]'::jsonb));
end $$;

-- Запись продаж и расходов своей точки по правам sales_write / sales_edit / exp_add / exp_edit (сегодня или вчера).
create or replace function public.cashier_put_sale(p_id text, p_data jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
declare c record; d date; old jsonb; nd jsonb; k text;
begin
  c := public.limited_ctx();
  if c.o_point is null then raise exception 'Запись продаж доступна только пользователю одной точки' using errcode = '42501'; end if;
  if p_id is null or length(p_id) < 3 or length(p_id) > 40 or p_id like 'bz%' then raise exception 'Неверный номер продажи'; end if;
  if jsonb_typeof(p_data) <> 'object' then raise exception 'Неверные данные продажи'; end if;
  if p_data->>'point' is distinct from c.o_point then raise exception 'Можно вносить продажи только своей точки (%)', c.o_point; end if;
  begin d := (p_data->>'date')::date; exception when others then raise exception 'Неверная дата продажи'; end;
  if d > c.o_today or d < c.o_today - 1 then raise exception 'Продажу можно вносить только за сегодня или вчера'; end if;
  if coalesce((p_data->>'sum')::numeric, 0) < 0 or coalesce((p_data->>'sum')::numeric, 0) > 500000000 then raise exception 'Неверная сумма'; end if;
  select x.data into old from public.docs x where x.col = 'sales' and x.id = p_id;
  if old is null then
    if not (c.o_perms->>'sales_write')::boolean then raise exception 'Нет права вносить продажи' using errcode = '42501'; end if;
  else
    if not (c.o_perms->>'sales_edit')::boolean then raise exception 'Нет права править продажи' using errcode = '42501'; end if;
    if old->>'point' is distinct from c.o_point or old ? 'billz' then raise exception 'Это продажа другой точки или из Billz'; end if;
    if (old->>'date')::date < c.o_today - 1 then raise exception 'Старые продажи менять нельзя'; end if;
  end if;
  nd := '{}'::jsonb;
  foreach k in array array['point','date','check','cat','product','qty','price','sum','pay','pays','note','debt','createdAt'] loop
    if p_data ? k then nd := nd || jsonb_build_object(k, p_data->k); end if;
  end loop;
  nd := nd || coalesce(jsonb_strip_nulls(jsonb_build_object('cost', old->'cost', 'costEst', old->'costEst', 'costSrc', old->'costSrc',
             'photo', old->'photo', 'billz', old->'billz', 'src', old->'src')), '{}'::jsonb)
        || jsonb_build_object('by', c.o_email);
  if not (nd ? 'createdAt') then nd := nd || jsonb_build_object('createdAt', coalesce(old->'createdAt', to_jsonb((extract(epoch from now()) * 1000)::bigint))); end if;
  insert into public.docs (col, id, data) values ('sales', p_id, nd)
    on conflict (col, id) do update set data = excluded.data, updated_at = now();
end $$;

create or replace function public.cashier_del_sale(p_id text)
returns void
language plpgsql security definer set search_path = '' as $$
declare c record; old jsonb;
begin
  c := public.limited_ctx();
  if not (c.o_perms->>'sales_edit')::boolean or c.o_point is null then raise exception 'Нет права удалять продажи' using errcode = '42501'; end if;
  select x.data into old from public.docs x where x.col = 'sales' and x.id = p_id;
  if old is null then return; end if;
  if p_id like 'bz%' or old ? 'billz' or old->>'point' is distinct from c.o_point then raise exception 'Это продажа другой точки или из Billz'; end if;
  if (old->>'date')::date < c.o_today - 1 then raise exception 'Старые продажи удалять нельзя'; end if;
  delete from public.docs x where x.col = 'sales' and x.id = p_id;
end $$;

create or replace function public.cashier_put_entry(p_id text, p_data jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
declare c record; d date; old jsonb; nd jsonb; amt numeric; k text;
begin
  c := public.limited_ctx();
  if c.o_point is null then raise exception 'Запись расходов доступна только пользователю одной точки' using errcode = '42501'; end if;
  if p_id is null or length(p_id) < 3 or length(p_id) > 40 then raise exception 'Неверный номер расхода'; end if;
  if jsonb_typeof(p_data) <> 'object' then raise exception 'Неверные данные расхода'; end if;
  if p_data->>'branch' is distinct from c.o_point then raise exception 'Можно вносить расходы только своей точки (%)', c.o_point; end if;
  if p_data->>'type' is distinct from 'exp' or p_data->>'cat' is distinct from 'op' then raise exception 'Можно вносить только операционные расходы'; end if;
  begin d := (p_data->>'date')::date; exception when others then raise exception 'Неверная дата расхода'; end;
  if d > c.o_today or d < c.o_today - 1 then raise exception 'Расход можно вносить только за сегодня или вчера'; end if;
  begin amt := (p_data->>'amount')::numeric; exception when others then raise exception 'Неверная сумма'; end;
  if amt is null or amt <= 0 or amt > 50000000 then raise exception 'Сумма: от 1 до 50 000 000'; end if;
  if length(btrim(coalesce(p_data->>'name', ''))) < 2 then raise exception 'Впишите статью расхода'; end if;
  select x.data into old from public.docs x where x.col = 'entries' and x.id = p_id;
  if old is null then
    if not (c.o_perms->>'exp_add')::boolean then raise exception 'Нет права добавлять расходы' using errcode = '42501'; end if;
  else
    if not (c.o_perms->>'exp_edit')::boolean then raise exception 'Нет права править расходы' using errcode = '42501'; end if;
    if old->>'branch' is distinct from c.o_point or old->>'type' is distinct from 'exp' or old->>'source' is distinct from 'day' then
      raise exception 'Эту запись менять нельзя';
    end if;
    if (old->>'date')::date < c.o_today - 1 then raise exception 'Старые расходы менять нельзя'; end if;
  end if;
  nd := '{}'::jsonb;
  foreach k in array array['type','cat','name','amount','date','branch','note','createdAt'] loop
    if p_data ? k then nd := nd || jsonb_build_object(k, p_data->k); end if;
  end loop;
  nd := nd || jsonb_build_object('source', 'day', 'by', c.o_email);
  if not (nd ? 'createdAt') then nd := nd || jsonb_build_object('createdAt', coalesce(old->'createdAt', to_jsonb((extract(epoch from now()) * 1000)::bigint))); end if;
  insert into public.docs (col, id, data) values ('entries', p_id, nd)
    on conflict (col, id) do update set data = excluded.data, updated_at = now();
end $$;

create or replace function public.cashier_del_entry(p_id text)
returns void
language plpgsql security definer set search_path = '' as $$
declare c record; old jsonb;
begin
  c := public.limited_ctx();
  if not (c.o_perms->>'exp_edit')::boolean or c.o_point is null then raise exception 'Нет права удалять расходы' using errcode = '42501'; end if;
  select x.data into old from public.docs x where x.col = 'entries' and x.id = p_id;
  if old is null then return; end if;
  if old->>'branch' is distinct from c.o_point or old->>'type' is distinct from 'exp' or old->>'source' is distinct from 'day' then
    raise exception 'Эту запись удалять нельзя';
  end if;
  if (old->>'date')::date < c.o_today - 1 then raise exception 'Старые расходы удалять нельзя'; end if;
  delete from public.docs x where x.col = 'entries' and x.id = p_id;
end $$;

-- Список пользователей для владельца и админа: с анкетой и итоговыми правами.
drop function if exists public.access_list();
create function public.access_list()
returns table(email text, role text, point text, label text, phone text, "position" text, note text,
              perms jsonb, perms_own jsonb, active boolean, created_at timestamptz, last_sign_in_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Только для владельца' using errcode = '42501';
  end if;
  return query
    select m.email, m.role, m.point, m.label, m.phone, m."position", m.note,
           public.role_perms(m.role) || coalesce(m.perms, '{}'::jsonb), coalesce(m.perms, '{}'::jsonb),
           m.active, m.created_at, u.last_sign_in_at
    from public.members m
    left join auth.users u on lower(u.email) = lower(m.email)
    order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end, m.point nulls first, m.email;
end $$;

drop function if exists public.cashier_ctx();
revoke all on function public.limited_ctx() from public, anon, authenticated;
revoke all on function public.members_guard() from public, anon, authenticated;
revoke all on function public.role_perms(text) from public, anon;
revoke all on function public.access_list() from public, anon;
grant execute on function public.role_perms(text), public.access_list() to authenticated;
