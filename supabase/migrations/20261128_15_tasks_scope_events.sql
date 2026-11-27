-- Задания: видимость «на всех / на точку / на человека», время запланированной задачи, события календаря (cal_events).
-- НЕ ПРИМЕНЯТЬ без проверки: применяет главная сессия. Откат — закомментирован в конце файла.
--
-- Решения:
--  * Пользователь в members ключуется почтой (members.email, lower), uuid там нет — поэтому исполнитель хранится как
--    assignee_email (lower), как и created_by. Старый текст assignee остаётся для совместимости.
--  * Прямой доступ к таблицам — только is_admin() (как сейчас): в created_by лежит почта, прямое чтение другими её бы раскрыло.
--    Остальные читают только видимое им через security definer RPC tasks_visible / cal_events_visible (почты скрыты).
--  * Запись, смена статуса и удаление — только админ (как сейчас). Остальным — tasks_comment и tasks_problem (обновлены).

-- ===== tasks: видимость, исполнитель-пользователь, время =====
alter table public.tasks add column if not exists scope text not null default 'point';
alter table public.tasks add column if not exists assignee_email text;
alter table public.tasks add column if not exists due_time time;
alter table public.tasks alter column point drop not null;

alter table public.tasks drop constraint if exists tasks_scope_chk;
alter table public.tasks add constraint tasks_scope_chk check (scope in ('all','point','person'));
alter table public.tasks drop constraint if exists tasks_scope_fields_chk;
alter table public.tasks add constraint tasks_scope_fields_chk check (
  (scope = 'all' and point is null)
  or (scope = 'point' and point is not null)
  or (scope = 'person' and assignee_email is not null));
alter table public.tasks drop constraint if exists tasks_assignee_email_chk;
alter table public.tasks add constraint tasks_assignee_email_chk check (assignee_email is null or (assignee_email = lower(assignee_email) and length(assignee_email) <= 200));

create index if not exists tasks_scope_due_idx on public.tasks (scope, due);
create index if not exists tasks_assignee_email_idx on public.tasks (assignee_email) where assignee_email is not null;

-- ===== cal_events: события календаря =====
create table if not exists public.cal_events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 200),
  body text not null default '' check (length(body) <= 4000),
  starts_on date not null,
  start_time time,
  ends_on date,
  end_time time,
  all_day boolean not null default false,
  scope text not null default 'all' check (scope in ('all','point','person')),
  point text check (point in ('Премиум','Яшнабад','Сергели','C1')),
  assignee_email text check (assignee_email is null or (assignee_email = lower(assignee_email) and length(assignee_email) <= 200)),
  kind text check (kind is null or length(kind) <= 30),
  color text check (color is null or length(color) <= 30),
  created_by text,
  created_at timestamptz default now(),
  constraint cal_events_scope_fields_chk check (
    (scope = 'all' and point is null)
    or (scope = 'point' and point is not null)
    or (scope = 'person' and assignee_email is not null)),
  constraint cal_events_dates_chk check (ends_on is null or ends_on >= starts_on),
  constraint cal_events_allday_chk check (not all_day or (start_time is null and end_time is null))
);
create index if not exists cal_events_starts_idx on public.cal_events (starts_on);
create index if not exists cal_events_ends_idx on public.cal_events (ends_on);

alter table public.cal_events enable row level security;
do $$
declare c text;
begin
  foreach c in array array['select','insert','update','delete'] loop
    execute format('drop policy if exists %I on public.cal_events', 'cal_events_' || c || '_admin');
  end loop;
  create policy cal_events_select_admin on public.cal_events for select to authenticated using (public.is_admin());
  create policy cal_events_insert_admin on public.cal_events for insert to authenticated with check (public.is_admin());
  create policy cal_events_update_admin on public.cal_events for update to authenticated using (public.is_admin()) with check (public.is_admin());
  create policy cal_events_delete_admin on public.cal_events for delete to authenticated using (public.is_admin());
end $$;
revoke all on public.cal_events from anon, public;

-- ===== контекст читателя: админ или активный сотрудник с правом tasks =====
create or replace function public.tasks_ctx(out o_admin boolean, out o_email text, out o_point text)
language plpgsql stable security definer set search_path = '' as $$
declare r text; pr jsonb;
begin
  o_email := lower(coalesce(auth.jwt()->>'email', ''));
  select m.role, m.point, public.role_perms(m.role) || jsonb_strip_nulls(coalesce(m.perms, '{}'::jsonb))
    into r, o_point, pr from public.members m where lower(m.email) = o_email and m.active;
  if r is null then raise exception 'Нет доступа к заданиям' using errcode = '42501'; end if;
  o_admin := r in ('owner', 'admin');
  if not o_admin and not public.perm_on(pr, 'tasks') then
    raise exception 'Нет доступа к заданиям' using errcode = '42501';
  end if;
end $$;
revoke all on function public.tasks_ctx() from public, anon, authenticated;

-- ===== задания, видимые читателю, и комментарии к ним =====
-- Открытые — все видимые; сделанные — за 14 дней или со сроком в окне [p_from, p_to]. Почты не отдаём:
-- исполнитель-человек у не-админа — только он сам (в интерфейсе «Вы»), автор — «Владелец» / «Вы».
create or replace function public.tasks_visible(p_from date default null, p_to date default null)
returns json language plpgsql stable security definer set search_path = '' as $$
declare c record; res json;
begin
  c := public.tasks_ctx();
  if p_from is not null and p_to is not null and p_to > p_from + 400 then raise exception 'Окно не больше 400 дней'; end if;
  with v as (
    select t.* from public.tasks t
    where (c.o_admin
        or t.scope = 'all'
        or (t.scope = 'point' and t.point is not null and t.point = c.o_point)
        or (t.scope = 'person' and t.assignee_email = c.o_email))
      and (t.status <> 'done'
        or t.done_at > now() - interval '14 days'
        or (p_from is not null and p_to is not null and t.due between p_from and p_to))
  ), tk as (
    select coalesce(json_agg(json_build_object(
      'id', t.id, 'scope', t.scope, 'point', t.point, 'title', t.title, 'body', t.body, 'priority', t.priority,
      'due', t.due, 'due_time', to_char(t.due_time, 'HH24:MI'), 'assignee', t.assignee,
      'assignee_email', case when c.o_admin then t.assignee_email else null end,
      'status', t.status, 'source', t.source,
      'created_label', case when lower(coalesce(t.created_by, '')) = c.o_email then 'Вы' else 'Владелец' end,
      'created_at', t.created_at, 'updated_at', t.updated_at, 'done_at', t.done_at
    ) order by t.created_at desc), '[]'::json) as j from v t
  ), cm as (
    select coalesce(json_agg(json_build_object(
      'id', k.id, 'task_id', k.task_id, 'author_label', k.author_label, 'kind', k.kind,
      'body', k.body, 'created_at', k.created_at
    ) order by k.created_at), '[]'::json) as j from public.task_comments k where k.task_id in (select id from v)
  )
  select json_build_object('tasks', tk.j, 'comments', cm.j) into res from tk, cm;
  return res;
end $$;

-- ===== события, видимые читателю, в окне дат =====
create or replace function public.cal_events_visible(p_from date, p_to date)
returns json language plpgsql stable security definer set search_path = '' as $$
declare c record; r json;
begin
  c := public.tasks_ctx();
  if p_from is null or p_to is null or p_to < p_from then raise exception 'Укажите окно дат'; end if;
  if p_to > p_from + 400 then raise exception 'Окно не больше 400 дней'; end if;
  select coalesce(json_agg(json_build_object(
      'id', e.id, 'title', e.title, 'body', e.body, 'starts_on', e.starts_on,
      'start_time', to_char(e.start_time, 'HH24:MI'), 'ends_on', e.ends_on, 'end_time', to_char(e.end_time, 'HH24:MI'),
      'all_day', e.all_day, 'scope', e.scope, 'point', e.point,
      'assignee_email', case when c.o_admin then e.assignee_email else null end,
      'kind', e.kind, 'color', e.color, 'created_at', e.created_at
    ) order by e.starts_on, e.start_time nulls first), '[]'::json) into r
    from public.cal_events e
    where e.starts_on <= p_to and coalesce(e.ends_on, e.starts_on) >= p_from
      and (c.o_admin
        or e.scope = 'all'
        or (e.scope = 'point' and e.point is not null and e.point = c.o_point)
        or (e.scope = 'person' and e.assignee_email = c.o_email));
  return r;
end $$;

-- ===== старый список — теперь с новой видимостью (рабочий сайт читает его без изменений) =====
create or replace function public.tasks_my_list()
returns json language plpgsql stable security definer set search_path = '' as $$
declare c record;
begin
  c := public.limited_ctx();
  if not public.perm_on(c.o_perms, 'tasks') then
    raise exception 'Нет доступа к заданиям' using errcode = '42501';
  end if;
  return public.tasks_visible(null, null);
end $$;

-- ===== комментарий: к любому видимому заданию (было — только своей точки) =====
create or replace function public.tasks_comment(p_task uuid, p_body text)
returns void language plpgsql security definer set search_path = '' as $$
declare c record; b text; ok boolean; n int;
begin
  c := public.limited_ctx();
  if not public.perm_on(c.o_perms, 'tasks') then
    raise exception 'Нет доступа к заданиям' using errcode = '42501';
  end if;
  b := btrim(coalesce(p_body, ''));
  if length(b) < 1 or length(b) > 2000 then raise exception 'Комментарий: от 1 до 2000 знаков'; end if;
  select (t.scope = 'all'
       or (t.scope = 'point' and t.point is not null and t.point = c.o_point)
       or (t.scope = 'person' and t.assignee_email = c.o_email)) into ok
    from public.tasks t where t.id = p_task;
  if ok is not true then
    raise exception 'Задание не найдено' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtext(c.o_email));
  select (select count(*) from public.tasks t where t.created_by = c.o_email and t.source = 'seller' and t.created_at > now() - interval '1 day')
       + (select count(*) from public.task_comments k where k.author_email = c.o_email and k.created_at > now() - interval '1 day')
    into n;
  if n >= 20 then raise exception 'Сегодня уже 20 записей, остальное напишите владельцу'; end if;
  insert into public.task_comments (task_id, author_email, author_label, kind, body)
    values (p_task, c.o_email, 'Сотрудник точки', 'comment', b);
end $$;

-- tasks_problem не меняется: вставляет задание своей точки (scope по умолчанию 'point').

revoke all on function public.tasks_visible(date, date) from public, anon;
revoke all on function public.cal_events_visible(date, date) from public, anon;
revoke all on function public.tasks_my_list() from public, anon;
revoke all on function public.tasks_comment(uuid, text) from public, anon;
grant execute on function public.tasks_visible(date, date) to authenticated;
grant execute on function public.cal_events_visible(date, date) to authenticated;
grant execute on function public.tasks_my_list() to authenticated;
grant execute on function public.tasks_comment(uuid, text) to authenticated;

-- ===== ОТКАТ (выполнять вручную, по порядку) =====
-- 1) вернуть прежние tasks_my_list и tasks_comment: выполнить их create or replace из 20261123_13_tasks.sql;
-- 2) drop function if exists public.tasks_visible(date, date);
--    drop function if exists public.cal_events_visible(date, date);
--    drop function if exists public.tasks_ctx();
-- 3) задания «на всех / на человека» сначала перенести в точку или удалить (иначе вернуть not null на point не выйдет):
--    delete from public.tasks where scope <> 'point';   -- осторожно: удаляет и их комментарии
-- 4) alter table public.tasks drop constraint if exists tasks_scope_fields_chk, drop constraint if exists tasks_scope_chk,
--      drop constraint if exists tasks_assignee_email_chk;
--    alter table public.tasks drop column if exists scope, drop column if exists assignee_email, drop column if exists due_time;
--    alter table public.tasks alter column point set not null;
--    drop index if exists public.tasks_scope_due_idx; drop index if exists public.tasks_assignee_email_idx;
-- 5) drop table if exists public.cal_events;
