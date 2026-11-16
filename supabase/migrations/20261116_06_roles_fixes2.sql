-- Роли, часть 6 (16.11.2026), по второму ревью.
-- 1) email в members всегда в нижнем регистре (users-admin и функции Billz ищут по lower).
-- 2) Кассир пишет только белый список полей; править и удалять расходы может только «расходы дня» (source day).
-- 3) Окончательный текст att_my_load (продавец и кассир, только активные).

update public.members set email = lower(email) where email <> lower(email);
create unique index if not exists members_email_lower_uq on public.members (lower(email));

create or replace function public.att_my_load(p_from timestamptz, p_to timestamptz)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare r text; p text;
begin
  select m.role, m.point into r, p from public.members m
    where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active;
  if r not in ('seller','cashier') or p is null then
    raise exception 'Нет доступа к журналу прихода' using errcode = '42501';
  end if;
  if p_to > p_from + interval '35 days' then raise exception 'Период не больше 35 дней'; end if;
  return jsonb_build_object(
    'point', p,
    'start_time', (select to_char(ap.start_time, 'HH24:MI') from public.att_points ap where ap.point = p limit 1),
    'employees', coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'name', e.name, 'point', e.point, 'active', e.active) order by e.name)
                   from public.att_employees e where e.point = p), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(jsonb_build_object('id', v.id, 'employee_id', v.employee_id, 'point', v.point,
                   'kind', v.kind, 'ts', v.ts, 'score', v.score) order by v.ts)
                   from public.att_events v where v.point = p and v.ts >= p_from and v.ts < p_to), '[]'::jsonb));
end $$;

-- Продажа кассира: только поля формы продажи; служебные поля (cost*, photo, billz, src) берутся из старой строки.
create or replace function public.cashier_put_sale(p_id text, p_data jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
declare c record; d date; old jsonb; nd jsonb; k text;
begin
  c := public.cashier_ctx();
  if p_id is null or length(p_id) < 3 or length(p_id) > 40 or p_id like 'bz%' then raise exception 'Неверный номер продажи'; end if;
  if jsonb_typeof(p_data) <> 'object' then raise exception 'Неверные данные продажи'; end if;
  if p_data->>'point' is distinct from c.o_point then raise exception 'Можно вносить продажи только своей точки (%)', c.o_point; end if;
  begin d := (p_data->>'date')::date; exception when others then raise exception 'Неверная дата продажи'; end;
  if d > c.o_today or d < c.o_today - 1 then raise exception 'Продажу можно вносить только за сегодня или вчера'; end if;
  if coalesce((p_data->>'sum')::numeric, 0) < 0 or coalesce((p_data->>'sum')::numeric, 0) > 500000000 then raise exception 'Неверная сумма'; end if;
  select x.data into old from public.docs x where x.col = 'sales' and x.id = p_id;
  if old is not null then
    if old->>'point' is distinct from c.o_point or p_id like 'bz%' or old ? 'billz' then raise exception 'Это продажа другой точки или из Billz'; end if;
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
  c := public.cashier_ctx();
  select x.data into old from public.docs x where x.col = 'sales' and x.id = p_id;
  if old is null then return; end if;
  if p_id like 'bz%' or old ? 'billz' or old->>'point' is distinct from c.o_point then raise exception 'Это продажа другой точки или из Billz'; end if;
  if (old->>'date')::date < c.o_today - 1 then raise exception 'Старые продажи удалять нельзя'; end if;
  delete from public.docs x where x.col = 'sales' and x.id = p_id;
end $$;

-- Расход кассира: только расходы дня (source day), белый список полей.
create or replace function public.cashier_put_entry(p_id text, p_data jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
declare c record; d date; old jsonb; nd jsonb; amt numeric; k text;
begin
  c := public.cashier_ctx();
  if p_id is null or length(p_id) < 3 or length(p_id) > 40 then raise exception 'Неверный номер расхода'; end if;
  if jsonb_typeof(p_data) <> 'object' then raise exception 'Неверные данные расхода'; end if;
  if p_data->>'branch' is distinct from c.o_point then raise exception 'Можно вносить расходы только своей точки (%)', c.o_point; end if;
  if p_data->>'type' is distinct from 'exp' or p_data->>'cat' is distinct from 'op' then raise exception 'Кассир вносит только операционные расходы'; end if;
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
  c := public.cashier_ctx();
  select x.data into old from public.docs x where x.col = 'entries' and x.id = p_id;
  if old is null then return; end if;
  if old->>'branch' is distinct from c.o_point or old->>'type' is distinct from 'exp' or old->>'source' is distinct from 'day' then
    raise exception 'Эту запись удалять нельзя';
  end if;
  if (old->>'date')::date < c.o_today - 1 then raise exception 'Старые расходы удалять нельзя'; end if;
  delete from public.docs x where x.col = 'entries' and x.id = p_id;
end $$;
