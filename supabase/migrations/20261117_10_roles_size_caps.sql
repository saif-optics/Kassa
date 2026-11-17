-- Роли, часть 10 (17.11.2026), по стресс-тесту: потолок размера записи кассира
-- (вся запись ≤ 4 000 знаков, note ≤ 500, product ≤ 200, check ≤ 40, pays — массив не больше 6 элементов).

create or replace function public.doc_size_ok(p jsonb, p_max int) returns boolean
language sql immutable set search_path = '' as $$
  select length(p::text) <= p_max
    and length(coalesce(p->>'note','')) <= 500
    and length(coalesce(p->>'product','')) <= 200
    and length(coalesce(p->>'name','')) <= 200
    and length(coalesce(p->>'check','')) <= 40
    and (not (p ? 'pays') or (jsonb_typeof(p->'pays') = 'array' and jsonb_array_length(p->'pays') <= 6))
$$;
revoke all on function public.doc_size_ok(jsonb, int) from public, anon, authenticated;

create or replace function public.cashier_put_sale(p_id text, p_data jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
declare c record; d date; old jsonb; nd jsonb; k text;
begin
  c := public.limited_ctx();
  if c.o_point is null then raise exception 'Запись продаж доступна только пользователю одной точки' using errcode = '42501'; end if;
  if p_id is null or length(p_id) < 3 or length(p_id) > 40 or p_id like 'bz%' then raise exception 'Неверный номер продажи'; end if;
  if jsonb_typeof(p_data) <> 'object' then raise exception 'Неверные данные продажи'; end if;
  if not public.doc_size_ok(p_data, 4000) then raise exception 'Слишком длинная запись продажи'; end if;
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
  if not public.doc_size_ok(p_data, 2000) then raise exception 'Слишком длинная запись расхода'; end if;
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
