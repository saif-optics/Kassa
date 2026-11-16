-- Роли, часть 5 (16.11.2026), по ревью: продавцу и кассиру — только расходы дня своей точки (source day),
-- без остатков Б/Ч и расходов владельца; шаблоны только своей точки; лимиты расхода продавца;
-- TRUNCATE отозван у anon/authenticated (RLS на него не действует).

create or replace function public.role_docs()
returns table(col text, id text, data jsonb)
language plpgsql stable security definer set search_path = '' as $$
declare r text; p text;
begin
  select m.role, m.point into r, p from public.members m
    where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active;
  if r is null or r = 'admin' then return; end if;
  return query select d.col, d.id, d.data - 'plan' from public.docs d where d.col = 'settings' and d.id = 'sales';
  if r in ('seller','cashier') then
    return query select d.col, d.id, d.data - 'cost' - 'costEst' - 'costSrc' - 'photo'
      from public.docs d where d.col = 'sales' and d.data->>'point' = p;
    return query select d.col, d.id, d.data from public.docs d
      where d.col = 'entries' and d.data->>'branch' = p
        and d.data->>'type' = 'exp' and d.data->>'source' = 'day';
    return query select d.col, d.id, jsonb_build_object(p, coalesce(d.data->p, '[]'::jsonb))
      from public.docs d where d.col = 'settings' and d.id = 'sellerTpl';
  elsif r = 'marketer' then
    return query select d.col, d.id, d.data - 'cost' - 'costEst' - 'costSrc' - 'photo'
      from public.docs d where d.col = 'sales';
  end if;
end $$;

-- Расход продавца/кассира: не больше 3 000 000 за запись и не больше 30 записей в день на точку.
create or replace function public.seller_add_expense(p_name text, p_amount numeric, p_date date default null)
returns text
language plpgsql security definer set search_path = '' as $$
declare r text; p text; em text; nm text; d date; today date; nid text; n int;
begin
  em := lower(coalesce(auth.jwt()->>'email',''));
  select m.role, m.point into r, p from public.members m where lower(m.email) = em and m.active;
  if r not in ('seller','cashier') or p is null then
    raise exception 'Нет права добавлять расход' using errcode = '42501';
  end if;
  nm := btrim(coalesce(p_name, ''));
  if length(nm) < 2 or length(nm) > 80 then raise exception 'Название расхода: от 2 до 80 знаков'; end if;
  if p_amount is null or p_amount <= 0 or p_amount <> floor(p_amount) then
    raise exception 'Сумма: целое число больше нуля';
  end if;
  if p_amount > 3000000 then raise exception 'Расход больше 3 000 000 вносит владелец'; end if;
  today := (now() at time zone 'Asia/Tashkent')::date;
  d := coalesce(p_date, today);
  if d > today or d < today - 2 then raise exception 'Дата: сегодня или два прошлых дня'; end if;
  select count(*) into n from public.docs x where x.col = 'entries' and x.data->>'branch' = p
    and x.data->>'source' = 'day' and x.data->>'date' = to_char(d, 'YYYY-MM-DD');
  if n >= 30 then raise exception 'За день уже 30 расходов, дальше вносит владелец'; end if;
  nid := 'e' || to_char(d, 'MMDD') || 's' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
  insert into public.docs (col, id, data) values ('entries', nid, jsonb_build_object(
    'type', 'exp', 'cat', 'op', 'branch', p,
    'name', p || ' за ' || lower(left(nm, 1)) || substr(nm, 2),
    'amount', p_amount, 'date', to_char(d, 'YYYY-MM-DD'),
    'source', 'day', 'by', em,
    'createdAt', (extract(epoch from now()) * 1000)::bigint));
  return nid;
end $$;

revoke truncate on all tables in schema public from anon, authenticated;
