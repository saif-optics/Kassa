-- Активные сессии (23.11.2026): владелец и админ видят сессии входа всех учётных записей, могут завершить
-- чужую сессию и погасить все сессии пользователя при отключении доступа. Иерархия как в users-admin:
-- owner — все, кроме своей текущей сессии и самого себя; admin — только cashier/seller/marketer и свои сессии.

create or replace function public.caller_role() returns text
language sql stable security definer set search_path = '' as $$
  select m.role from public.members m
  where lower(m.email) = lower(coalesce(auth.jwt()->>'email','')) and m.active and m.role in ('owner','admin')
$$;
revoke all on function public.caller_role() from public, anon, authenticated;

create or replace function public.admin_sessions()
returns table(id uuid, email text, role text, point text, label text, created_at timestamptz, last_at timestamptz,
              user_agent text, ip text, is_current boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if public.caller_role() is null then raise exception 'Только для владельца' using errcode = '42501'; end if;
  return query
    select s.id, lower(u.email), m.role, m.point, m.label, s.created_at,
           greatest(s.updated_at, (s.refreshed_at at time zone 'UTC')),
           s.user_agent, host(s.ip), s.id::text = coalesce(auth.jwt()->>'session_id','')
    from auth.sessions s
    join auth.users u on u.id = s.user_id
    left join public.members m on lower(m.email) = lower(u.email)
    where (s.not_after is null or s.not_after > now())
      and greatest(s.updated_at, (s.refreshed_at at time zone 'UTC')) > now() - interval '30 days'
    order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end, lower(u.email), s.created_at desc;
end $$;

-- Завершить одну сессию по id. Текущую сессию вызывающего — нельзя (для этого кнопка «Выйти»).
create or replace function public.admin_end_session(p_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare me text; my_email text; t_email text; t_role text;
begin
  me := public.caller_role();
  if me is null then raise exception 'Только для владельца' using errcode = '42501'; end if;
  my_email := lower(coalesce(auth.jwt()->>'email',''));
  select lower(u.email), m.role into t_email, t_role
    from auth.sessions s join auth.users u on u.id = s.user_id left join public.members m on lower(m.email) = lower(u.email)
    where s.id = p_id;
  if t_email is null then return; end if;
  if p_id::text = coalesce(auth.jwt()->>'session_id','') then
    raise exception 'Это ваша текущая сессия — выйдите кнопкой «Выйти»';
  end if;
  if t_email <> my_email then
    if me = 'admin' and (t_role is null or t_role not in ('cashier','seller','marketer')) then
      raise exception 'Недостаточно прав' using errcode = '42501';
    end if;
    if me = 'owner' and t_role = 'owner' then
      raise exception 'Недостаточно прав' using errcode = '42501';
    end if;
  end if;
  delete from auth.refresh_tokens r where r.session_id = p_id;
  delete from auth.sessions s where s.id = p_id;
end $$;

-- Погасить все сессии пользователя (при отключении доступа). Себя и владельца — нельзя.
create or replace function public.admin_kill_sessions(p_email text)
returns integer
language plpgsql security definer set search_path = '' as $$
declare me text; my_email text; t_role text; uid uuid; n integer;
begin
  me := public.caller_role();
  if me is null then raise exception 'Только для владельца' using errcode = '42501'; end if;
  my_email := lower(coalesce(auth.jwt()->>'email',''));
  if lower(coalesce(p_email,'')) = my_email then raise exception 'Свои сессии так не гасят' using errcode = '42501'; end if;
  select m.role into t_role from public.members m where lower(m.email) = lower(p_email);
  if t_role = 'owner' then raise exception 'Недостаточно прав' using errcode = '42501'; end if;
  if me = 'admin' and (t_role is null or t_role not in ('cashier','seller','marketer')) then
    raise exception 'Недостаточно прав' using errcode = '42501';
  end if;
  select u.id into uid from auth.users u where lower(u.email) = lower(p_email);
  if uid is null then return 0; end if;
  delete from auth.refresh_tokens r where r.session_id in (select s.id from auth.sessions s where s.user_id = uid);
  delete from auth.sessions s where s.user_id = uid;
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function public.admin_sessions() from public, anon;
revoke all on function public.admin_end_session(uuid) from public, anon;
revoke all on function public.admin_kill_sessions(text) from public, anon;
grant execute on function public.admin_sessions(), public.admin_end_session(uuid), public.admin_kill_sessions(text) to authenticated;
