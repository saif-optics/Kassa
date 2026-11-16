-- Роли, часть 3 (16.11.2026): подпись и выключатель у учётной записи, список выданных логинов для владельца.
alter table public.members add column if not exists label text;
alter table public.members add column if not exists active boolean not null default true;

-- Выключенная запись (active = false) теряет роль: функции доступа её не видят.
create or replace function public.my_access()
returns table(role text, point text)
language sql stable security definer set search_path = '' as $$
  select m.role, m.point from public.members m
  where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members m
    where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.role = 'admin' and m.active)
$$;

create or replace function public.my_role()
returns text language sql stable security definer set search_path = '' as $$
  select m.role from public.members m where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active
$$;

create or replace function public.my_point()
returns text language sql stable security definer set search_path = '' as $$
  select m.point from public.members m where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active
$$;

create or replace function public.role_docs()
returns table(col text, id text, data jsonb)
language plpgsql stable security definer set search_path = '' as $$
declare r text; p text;
begin
  select m.role, m.point into r, p from public.members m
    where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active;
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

create or replace function public.seller_add_expense(p_name text, p_amount numeric, p_date date default null)
returns text
language plpgsql security definer set search_path = '' as $$
declare r text; p text; em text; nm text; d date; today date; nid text;
begin
  em := lower(coalesce(auth.jwt()->>'email',''));
  select m.role, m.point into r, p from public.members m where lower(m.email) = em and m.active;
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

create or replace function public.att_my_load(p_from timestamptz, p_to timestamptz)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare r text; p text;
begin
  select m.role, m.point into r, p from public.members m
    where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active;
  if r is distinct from 'seller' or p is null then
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

-- Список выданных логинов — только admin. last_sign_in_at из auth.users по email.
create or replace function public.access_list()
returns table(email text, role text, point text, label text, active boolean,
              created_at timestamptz, last_sign_in_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Только для владельца' using errcode = '42501';
  end if;
  return query
    select m.email, m.role, m.point, m.label, m.active, m.created_at, u.last_sign_in_at
    from public.members m
    left join auth.users u on lower(u.email) = lower(m.email)
    order by m.role, m.point, m.email;
end $$;

revoke all on function public.access_list() from public, anon;
grant execute on function public.access_list() to authenticated;
