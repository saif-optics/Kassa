-- Роли доступа: admin (владелец, всё), seller (продавец своей точки, просмотр + расход дня),
-- marketer (маркетолог, продажи всех точек без себестоимости). 16.11.2026.
-- Таблица public.members(email pk, role, created_at) уже существует; is_member() = любой участник.

alter table public.members add column if not exists point text;
alter table public.members drop constraint if exists members_role_chk;
alter table public.members add constraint members_role_chk check (role in ('admin','seller','marketer'));
alter table public.members drop constraint if exists members_point_chk;
alter table public.members add constraint members_point_chk check (role <> 'seller' or point is not null);

create or replace function public.my_access()
returns table(role text, point text)
language sql stable security definer set search_path = '' as $$
  select m.role, m.point from public.members m
  where lower(m.email) = lower(coalesce(auth.jwt()->>'email',''))
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members m
    where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.role = 'admin')
$$;

create or replace function public.my_role()
returns text language sql stable security definer set search_path = '' as $$
  select m.role from public.members m where lower(m.email) = lower(coalesce(auth.jwt()->>'email',''))
$$;

create or replace function public.my_point()
returns text language sql stable security definer set search_path = '' as $$
  select m.point from public.members m where lower(m.email) = lower(coalesce(auth.jwt()->>'email',''))
$$;

-- Полный доступ к docs, att_*, bz_* — только admin (раньше любой участник).
alter policy docs_select on public.docs using (public.is_admin());
alter policy docs_insert on public.docs with check (public.is_admin());
alter policy docs_update on public.docs using (public.is_admin()) with check (public.is_admin());
alter policy docs_delete on public.docs using (public.is_admin());
alter policy att_points_m on public.att_points using (public.is_admin()) with check (public.is_admin());
alter policy att_employees_m on public.att_employees using (public.is_admin()) with check (public.is_admin());
alter policy att_events_m on public.att_events using (public.is_admin()) with check (public.is_admin());
alter policy bz_check_read on public.bz_check using (public.is_admin());
alter policy bz_stock_read on public.bz_stock using (public.is_admin());
alter policy bz_product_read on public.bz_product using (public.is_admin());
alter policy bz_transfer_read on public.bz_transfer using (public.is_admin());

-- Документы для ограниченных ролей. Продажи — без себестоимости (cost, costEst, costSrc) и фото.
-- seller: продажи и расходы своей точки, остаток нала точки (kind=bc), настройки точек/категорий без плана,
--         шаблоны расходов settings/sellerTpl. marketer: продажи всех точек, настройки без плана.
create or replace function public.role_docs()
returns table(col text, id text, data jsonb)
language plpgsql stable security definer set search_path = '' as $$
declare r text; p text;
begin
  select m.role, m.point into r, p from public.members m
    where lower(m.email) = lower(coalesce(auth.jwt()->>'email',''));
  if r is null or r = 'admin' then return; end if;
  return query select d.col, d.id, d.data - 'plan' from public.docs d where d.col = 'settings' and d.id = 'sales';
  if r = 'seller' then
    return query select d.col, d.id, d.data - 'cost' - 'costEst' - 'costSrc' - 'photo'
      from public.docs d where d.col = 'sales' and d.data->>'point' = p;
    return query select d.col, d.id, d.data from public.docs d
      where d.col = 'entries' and d.data->>'branch' = p
        and (d.data->>'type' = 'exp' or d.data->>'kind' = 'bc');
    return query select d.col, d.id, d.data from public.docs d where d.col = 'settings' and d.id = 'sellerTpl';
  elsif r = 'marketer' then
    return query select d.col, d.id, d.data - 'cost' - 'costEst' - 'costSrc' - 'photo'
      from public.docs d where d.col = 'sales';
  end if;
end $$;

-- Продавец добавляет расход дня своей точки: только entries, type exp, cat op, source day, дата не раньше позавчера.
create or replace function public.seller_add_expense(p_name text, p_amount numeric, p_date date default null)
returns text
language plpgsql security definer set search_path = '' as $$
declare r text; p text; em text; nm text; d date; today date; nid text;
begin
  em := lower(coalesce(auth.jwt()->>'email',''));
  select m.role, m.point into r, p from public.members m where lower(m.email) = em;
  if r is distinct from 'seller' or p is null then
    raise exception 'Нет права добавлять расход' using errcode = '42501';
  end if;
  nm := btrim(coalesce(p_name, ''));
  if length(nm) < 2 or length(nm) > 80 then raise exception 'Название расхода: от 2 до 80 знаков'; end if;
  if p_amount is null or p_amount <= 0 or p_amount > 50000000 or p_amount <> floor(p_amount) then
    raise exception 'Сумма: целое число от 1 до 50 000 000';
  end if;
  today := (now() at time zone 'Asia/Tashkent')::date;
  d := coalesce(p_date, today);
  if d > today or d < today - 2 then raise exception 'Дата: сегодня или два прошлых дня'; end if;
  nid := 'e' || to_char(d, 'MMDD') || 's' || substr(md5(random()::text || clock_timestamp()::text), 1, 5);
  insert into public.docs (col, id, data) values ('entries', nid, jsonb_build_object(
    'type', 'exp', 'cat', 'op', 'branch', p,
    'name', p || ' за ' || lower(left(nm, 1)) || substr(nm, 2),
    'amount', p_amount, 'date', to_char(d, 'YYYY-MM-DD'),
    'source', 'day', 'by', em,
    'createdAt', (extract(epoch from now()) * 1000)::bigint));
  return nid;
end $$;

revoke all on function public.my_access() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.my_role() from public, anon;
revoke all on function public.my_point() from public, anon;
revoke all on function public.role_docs() from public, anon;
revoke all on function public.seller_add_expense(text, numeric, date) from public, anon;
grant execute on function public.my_access(), public.is_admin(), public.my_role(), public.my_point(),
  public.role_docs(), public.seller_add_expense(text, numeric, date) to authenticated;
