-- Роли, часть 8 (17.11.2026), по ревью части 7:
-- 1) права с null не считаются выданными (jsonb_strip_nulls + coalesce(...,false)); CHECK: значения perms только boolean;
-- 2) createdAt никогда не берётся с клиента: новая запись — now(), правка — старое значение;
-- 3) новую запись расхода через cashier_put_entry делает только право exp_edit (кассир); продавец (exp_add) — только seller_add_expense с лимитами;
-- 4) триггер members_guard и на insert: второго владельца не завести, email в нижнем регистре;
-- 5) права execute для пересозданной my_access; role_docs глотает только «нет доступа»; записи без даты считаются старыми.

create or replace function public.perms_ok(p jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select p is null or (jsonb_typeof(p) = 'object' and not exists (select 1 from jsonb_each(p) where jsonb_typeof(value) <> 'boolean'))
$$;
alter table public.members drop constraint if exists members_perms_chk;
alter table public.members add constraint members_perms_chk check (public.perms_ok(perms));

create or replace function public.members_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    if old.role = 'owner' then raise exception 'Владельца удалить нельзя'; end if;
    return old;
  end if;
  if tg_op = 'INSERT' and new.role = 'owner' and exists (select 1 from public.members m where m.role = 'owner') then
    raise exception 'Владелец уже есть';
  end if;
  if tg_op = 'UPDATE' and old.role = 'owner' and (new.role <> 'owner' or not new.active or lower(new.email) <> lower(old.email)) then
    raise exception 'Владельца изменить нельзя';
  end if;
  if tg_op = 'UPDATE' and old.role <> 'owner' and new.role = 'owner' then
    raise exception 'Владелец уже есть';
  end if;
  new.email := lower(new.email);
  return new;
end $$;
drop trigger if exists members_guard_tg on public.members;
create trigger members_guard_tg before insert or update or delete on public.members
  for each row execute function public.members_guard();

drop function if exists public.my_access();
create function public.my_access()
returns table(role text, point text, perms jsonb, label text)
language sql stable security definer set search_path = '' as $$
  select m.role, m.point, public.role_perms(m.role) || jsonb_strip_nulls(coalesce(m.perms, '{}'::jsonb)), m.label
  from public.members m
  where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active
$$;
revoke all on function public.my_access() from public, anon;
grant execute on function public.my_access() to authenticated;

create or replace function public.limited_ctx(out o_email text, out o_point text, out o_perms jsonb, out o_today date)
language plpgsql stable security definer set search_path = '' as $$
declare r text;
begin
  o_email := lower(coalesce(auth.jwt()->>'email',''));
  select m.role, m.point, public.role_perms(m.role) || jsonb_strip_nulls(coalesce(m.perms, '{}'::jsonb))
    into r, o_point, o_perms from public.members m where lower(m.email) = o_email and m.active;
  if r is null or r in ('owner','admin') then
    raise exception 'Нет доступа' using errcode = '42501';
  end if;
  o_today := (now() at time zone 'Asia/Tashkent')::date;
end $$;

-- Право из контекста: null/отсутствие = false.
create or replace function public.perm_on(p jsonb, k text) returns boolean
language sql immutable set search_path = '' as $$ select coalesce((p->>k)::boolean, false) $$;

create or replace function public.role_docs()
returns table(col text, id text, data jsonb)
language plpgsql stable security definer set search_path = '' as $$
declare c record;
begin
  begin c := public.limited_ctx(); exception when insufficient_privilege then return; end;
  return query select d.col, d.id, d.data - 'plan' from public.docs d where d.col = 'settings' and d.id = 'sales';
  if public.perm_on(c.o_perms, 'sales_view') then
    return query select d.col, d.id, d.data - 'cost' - 'costEst' - 'costSrc' - 'photo'
      from public.docs d where d.col = 'sales' and (c.o_point is null or d.data->>'point' = c.o_point);
  end if;
  if public.perm_on(c.o_perms, 'exp_view') or public.perm_on(c.o_perms, 'exp_add') then
    return query select d.col, d.id, d.data from public.docs d
      where d.col = 'entries' and (c.o_point is null or d.data->>'branch' = c.o_point)
        and d.data->>'type' = 'exp' and d.data->>'source' = 'day';
  end if;
  if public.perm_on(c.o_perms, 'exp_add') then
    return query select d.col, d.id,
        case when c.o_point is null then d.data else jsonb_build_object(c.o_point, coalesce(d.data->c.o_point, '[]'::jsonb)) end
      from public.docs d where d.col = 'settings' and d.id = 'sellerTpl';
  end if;
end $$;

create or replace function public.seller_add_expense(p_name text, p_amount numeric, p_date date default null)
returns text
language plpgsql security definer set search_path = '' as $$
declare c record; nm text; d date; nid text; n int;
begin
  c := public.limited_ctx();
  if not public.perm_on(c.o_perms, 'exp_add') or c.o_point is null then
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

create or replace function public.att_my_load(p_from timestamptz, p_to timestamptz)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare c record;
begin
  c := public.limited_ctx();
  if not public.perm_on(c.o_perms, 'att_view') or c.o_point is null then
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
    if not public.perm_on(c.o_perms, 'sales_write') then raise exception 'Нет права вносить продажи' using errcode = '42501'; end if;
  else
    if not public.perm_on(c.o_perms, 'sales_edit') then raise exception 'Нет права править продажи' using errcode = '42501'; end if;
    if old->>'point' is distinct from c.o_point or old ? 'billz' then raise exception 'Это продажа другой точки или из Billz'; end if;
    if coalesce((old->>'date')::date, c.o_today - 2) < c.o_today - 1 then raise exception 'Старые продажи менять нельзя'; end if;
  end if;
  nd := '{}'::jsonb;
  foreach k in array array['point','date','check','cat','product','qty','price','sum','pay','pays','note','debt'] loop
    if p_data ? k then nd := nd || jsonb_build_object(k, p_data->k); end if;
  end loop;
  nd := nd || coalesce(jsonb_strip_nulls(jsonb_build_object('cost', old->'cost', 'costEst', old->'costEst', 'costSrc', old->'costSrc',
             'photo', old->'photo', 'billz', old->'billz', 'src', old->'src')), '{}'::jsonb)
        || jsonb_build_object('by', c.o_email,
             'createdAt', coalesce(old->'createdAt', to_jsonb((extract(epoch from now()) * 1000)::bigint)));
  insert into public.docs (col, id, data) values ('sales', p_id, nd)
    on conflict (col, id) do update set data = excluded.data, updated_at = now();
end $$;

create or replace function public.cashier_del_sale(p_id text)
returns void
language plpgsql security definer set search_path = '' as $$
declare c record; old jsonb;
begin
  c := public.limited_ctx();
  if not public.perm_on(c.o_perms, 'sales_edit') or c.o_point is null then raise exception 'Нет права удалять продажи' using errcode = '42501'; end if;
  select x.data into old from public.docs x where x.col = 'sales' and x.id = p_id;
  if old is null then return; end if;
  if p_id like 'bz%' or old ? 'billz' or old->>'point' is distinct from c.o_point then raise exception 'Это продажа другой точки или из Billz'; end if;
  if coalesce((old->>'date')::date, c.o_today - 2) < c.o_today - 1 then raise exception 'Старые продажи удалять нельзя'; end if;
  delete from public.docs x where x.col = 'sales' and x.id = p_id;
end $$;

-- Расход через форму: новая запись и правка — только право exp_edit (кассир). Продавец добавляет через seller_add_expense.
create or replace function public.cashier_put_entry(p_id text, p_data jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
declare c record; d date; old jsonb; nd jsonb; amt numeric; k text;
begin
  c := public.limited_ctx();
  if not public.perm_on(c.o_perms, 'exp_edit') or c.o_point is null then
    raise exception 'Нет права вносить расходы через форму' using errcode = '42501';
  end if;
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
  if old is not null then
    if old->>'branch' is distinct from c.o_point or old->>'type' is distinct from 'exp' or old->>'source' is distinct from 'day' then
      raise exception 'Эту запись менять нельзя';
    end if;
    if coalesce((old->>'date')::date, c.o_today - 2) < c.o_today - 1 then raise exception 'Старые расходы менять нельзя'; end if;
  end if;
  nd := '{}'::jsonb;
  foreach k in array array['type','cat','name','amount','date','branch','note'] loop
    if p_data ? k then nd := nd || jsonb_build_object(k, p_data->k); end if;
  end loop;
  nd := nd || jsonb_build_object('source', 'day', 'by', c.o_email,
          'createdAt', coalesce(old->'createdAt', to_jsonb((extract(epoch from now()) * 1000)::bigint)));
  insert into public.docs (col, id, data) values ('entries', p_id, nd)
    on conflict (col, id) do update set data = excluded.data, updated_at = now();
end $$;

create or replace function public.cashier_del_entry(p_id text)
returns void
language plpgsql security definer set search_path = '' as $$
declare c record; old jsonb;
begin
  c := public.limited_ctx();
  if not public.perm_on(c.o_perms, 'exp_edit') or c.o_point is null then raise exception 'Нет права удалять расходы' using errcode = '42501'; end if;
  select x.data into old from public.docs x where x.col = 'entries' and x.id = p_id;
  if old is null then return; end if;
  if old->>'branch' is distinct from c.o_point or old->>'type' is distinct from 'exp' or old->>'source' is distinct from 'day' then
    raise exception 'Эту запись удалять нельзя';
  end if;
  if coalesce((old->>'date')::date, c.o_today - 2) < c.o_today - 1 then raise exception 'Старые расходы удалять нельзя'; end if;
  delete from public.docs x where x.col = 'entries' and x.id = p_id;
end $$;

revoke all on function public.perms_ok(jsonb) from public, anon, authenticated;
revoke all on function public.perm_on(jsonb, text) from public, anon, authenticated;

-- Совместимость со старым клиентом: my_access отдаёт владельцу role = 'admin' и отдельный признак is_owner.
drop function if exists public.my_access();
create function public.my_access()
returns table(role text, point text, perms jsonb, label text, is_owner boolean)
language sql stable security definer set search_path = '' as $$
  select case when m.role = 'owner' then 'admin' else m.role end, m.point,
         public.role_perms(m.role) || jsonb_strip_nulls(coalesce(m.perms, '{}'::jsonb)), m.label, m.role = 'owner'
  from public.members m
  where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active
$$;
revoke all on function public.my_access() from public, anon;
grant execute on function public.my_access() to authenticated;
