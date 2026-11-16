-- Роли, часть 4 (16.11.2026): статус «кассир» (cashier) — своя точка, вносит продажи и расходы дня,
-- остальное как у продавца. Запись кассира только через RPC: точка и дата проверяются на сервере,
-- себестоимость существующей строки (cost, costEst, costSrc, photo, billz) сохраняется.
-- (role_docs, seller_add_expense, att_my_load переопределены с учётом cashier — окончательный текст в части 5.)

alter table public.members drop constraint if exists members_role_chk;
alter table public.members add constraint members_role_chk check (role in ('admin','cashier','seller','marketer'));
alter table public.members drop constraint if exists members_point_chk;
alter table public.members add constraint members_point_chk check (role not in ('seller','cashier') or point is not null);

-- Проверки кассира: активная роль cashier со своей точкой; дата — сегодня или вчера по Ташкенту.
create or replace function public.cashier_ctx(out o_email text, out o_point text, out o_today date)
language plpgsql stable security definer set search_path = '' as $$
declare r text;
begin
  o_email := lower(coalesce(auth.jwt()->>'email',''));
  select m.role, m.point into r, o_point from public.members m where lower(m.email) = o_email and m.active;
  if r is distinct from 'cashier' or o_point is null then
    raise exception 'Запись доступна только кассиру своей точки' using errcode = '42501';
  end if;
  o_today := (now() at time zone 'Asia/Tashkent')::date;
end $$;

create or replace function public.cashier_put_sale(p_id text, p_data jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
declare c record; d date; old jsonb; nd jsonb;
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
    if old->>'point' is distinct from c.o_point then raise exception 'Это продажа другой точки'; end if;
    if (old->>'date')::date < c.o_today - 1 then raise exception 'Старые продажи менять нельзя'; end if;
  end if;
  nd := (p_data - 'cost' - 'costEst' - 'costSrc' - 'photo' - 'billz')
        || coalesce(jsonb_strip_nulls(jsonb_build_object('cost', old->'cost', 'costEst', old->'costEst', 'costSrc', old->'costSrc',
             'photo', old->'photo', 'billz', old->'billz')), '{}'::jsonb)
        || jsonb_build_object('by', c.o_email);
  if old is null and not (nd ? 'createdAt') then nd := nd || jsonb_build_object('createdAt', (extract(epoch from now()) * 1000)::bigint); end if;
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
  if p_id like 'bz%' or old->>'point' is distinct from c.o_point then raise exception 'Это продажа другой точки или из Billz'; end if;
  if (old->>'date')::date < c.o_today - 1 then raise exception 'Старые продажи удалять нельзя'; end if;
  delete from public.docs x where x.col = 'sales' and x.id = p_id;
end $$;

create or replace function public.cashier_put_entry(p_id text, p_data jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
declare c record; d date; old jsonb; nd jsonb; amt numeric;
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
    if old->>'branch' is distinct from c.o_point or old->>'type' is distinct from 'exp' then raise exception 'Эту запись менять нельзя'; end if;
    if (old->>'date')::date < c.o_today - 1 then raise exception 'Старые расходы менять нельзя'; end if;
  end if;
  nd := p_data || jsonb_build_object('source', 'day', 'by', c.o_email);
  if old is null and not (nd ? 'createdAt') then nd := nd || jsonb_build_object('createdAt', (extract(epoch from now()) * 1000)::bigint); end if;
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
  if old->>'branch' is distinct from c.o_point or old->>'type' is distinct from 'exp' then raise exception 'Эту запись удалять нельзя'; end if;
  if (old->>'date')::date < c.o_today - 1 then raise exception 'Старые расходы удалять нельзя'; end if;
  delete from public.docs x where x.col = 'entries' and x.id = p_id;
end $$;

revoke all on function public.cashier_ctx() from public, anon, authenticated;
revoke all on function public.cashier_put_sale(text, jsonb) from public, anon;
revoke all on function public.cashier_del_sale(text) from public, anon;
revoke all on function public.cashier_put_entry(text, jsonb) from public, anon;
revoke all on function public.cashier_del_entry(text) from public, anon;
grant execute on function public.cashier_put_sale(text, jsonb), public.cashier_del_sale(text),
  public.cashier_put_entry(text, jsonb), public.cashier_del_entry(text) to authenticated;
