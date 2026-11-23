-- Задания и проблемы по точкам: таблицы, RLS (только админ), RPC для продавцов/кассиров.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  point text not null check (point in ('Премиум','Яшнабад','Сергели','C1')),
  title text not null check (length(title) between 1 and 200),
  body text not null default '' check (length(body) <= 4000),
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  due date,
  assignee text check (length(assignee) <= 80),
  status text not null default 'new' check (status in ('new','work','done')),
  source text not null default 'owner' check (source in ('owner','seller')),
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  done_at timestamptz
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_email text,
  author_label text,
  kind text not null default 'comment' check (kind in ('comment','problem')),
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz default now()
);

create index if not exists tasks_point_status_idx on public.tasks (point, status);
create index if not exists task_comments_task_idx on public.task_comments (task_id);

-- Метки времени: updated_at всегда, done_at — при переходе в «Сделано»
create or replace function public.tasks_touch()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if new.status = 'done' then
    if tg_op = 'INSERT' or old.status is distinct from 'done' then new.done_at := now(); end if;
  else
    new.done_at := null;
  end if;
  return new;
end $$;

drop trigger if exists tasks_touch_trg on public.tasks;
create trigger tasks_touch_trg before insert or update on public.tasks
  for each row execute function public.tasks_touch();

alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;

-- Политики: всё только для владельца и администратора
do $$
declare t text; c text;
begin
  foreach t in array array['tasks','task_comments'] loop
    foreach c in array array['select','insert','update','delete'] loop
      execute format('drop policy if exists %I on public.%I', t || '_' || c || '_admin', t);
    end loop;
    execute format('create policy %I on public.%I for select to authenticated using (public.is_admin())', t || '_select_admin', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_admin())', t || '_insert_admin', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t || '_update_admin', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_admin())', t || '_delete_admin', t);
  end loop;
end $$;

-- Таблицы закрыты от anon и public явно; доступ только по политикам выше
revoke all on public.tasks from anon, public;
revoke all on public.task_comments from anon, public;

-- Список для ограниченной роли: задания своей точки (сделанные старше 14 дней скрыты) и комментарии к ним.
-- Email не отдаём: автор задания — «Владелец» или «Вы», автор комментария — только подпись.
create or replace function public.tasks_my_list()
returns json language plpgsql stable security definer set search_path = '' as $$
declare c record; tk json; cm json;
begin
  c := public.limited_ctx();
  if not public.perm_on(c.o_perms, 'tasks') then
    raise exception 'Нет доступа к заданиям' using errcode = '42501';
  end if;
  if c.o_point is null then raise exception 'У пользователя не задана точка' using errcode = '42501'; end if;
  select coalesce(json_agg(json_build_object(
      'id', t.id, 'point', t.point, 'title', t.title, 'body', t.body, 'priority', t.priority,
      'due', t.due, 'assignee', t.assignee, 'status', t.status, 'source', t.source,
      'created_label', case when lower(coalesce(t.created_by, '')) = c.o_email then 'Вы' else 'Владелец' end,
      'created_at', t.created_at, 'updated_at', t.updated_at, 'done_at', t.done_at
    ) order by t.created_at desc), '[]'::json) into tk
    from public.tasks t
    where t.point = c.o_point and (t.status <> 'done' or t.done_at > now() - interval '14 days');
  select coalesce(json_agg(json_build_object(
      'id', k.id, 'task_id', k.task_id, 'author_label', k.author_label, 'kind', k.kind,
      'body', k.body, 'created_at', k.created_at
    ) order by k.created_at), '[]'::json) into cm
    from public.task_comments k
    where k.task_id in (select t.id from public.tasks t
      where t.point = c.o_point and (t.status <> 'done' or t.done_at > now() - interval '14 days'));
  return json_build_object('tasks', tk, 'comments', cm);
end $$;

-- Комментарий к заданию своей точки; общий лимит 20 записей (комментарии + проблемы) в сутки с одного email
create or replace function public.tasks_comment(p_task uuid, p_body text)
returns void language plpgsql security definer set search_path = '' as $$
declare c record; b text; tp text; n int;
begin
  c := public.limited_ctx();
  if not public.perm_on(c.o_perms, 'tasks') then
    raise exception 'Нет доступа к заданиям' using errcode = '42501';
  end if;
  if c.o_point is null then raise exception 'У пользователя не задана точка' using errcode = '42501'; end if;
  b := btrim(coalesce(p_body, ''));
  if length(b) < 1 or length(b) > 2000 then raise exception 'Комментарий: от 1 до 2000 знаков'; end if;
  select t.point into tp from public.tasks t where t.id = p_task;
  if tp is null or tp is distinct from c.o_point then
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

-- Проблема или предложение от продавца: новое задание своей точки, тот же лимит
create or replace function public.tasks_problem(p_title text, p_body text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare c record; ti text; b text; n int; nid uuid;
begin
  c := public.limited_ctx();
  if not public.perm_on(c.o_perms, 'tasks') then
    raise exception 'Нет доступа к заданиям' using errcode = '42501';
  end if;
  if c.o_point is null then raise exception 'У пользователя не задана точка' using errcode = '42501'; end if;
  ti := btrim(coalesce(p_title, ''));
  b := btrim(coalesce(p_body, ''));
  if length(ti) < 1 or length(ti) > 200 then raise exception 'Заголовок: от 1 до 200 знаков'; end if;
  if length(b) > 4000 then raise exception 'Текст: не больше 4000 знаков'; end if;
  perform pg_advisory_xact_lock(hashtext(c.o_email));
  select (select count(*) from public.tasks t where t.created_by = c.o_email and t.source = 'seller' and t.created_at > now() - interval '1 day')
       + (select count(*) from public.task_comments k where k.author_email = c.o_email and k.created_at > now() - interval '1 day')
    into n;
  if n >= 20 then raise exception 'Сегодня уже 20 записей, остальное напишите владельцу'; end if;
  insert into public.tasks (point, title, body, source, created_by)
    values (c.o_point, ti, b, 'seller', c.o_email) returning id into nid;
  return nid;
end $$;

revoke all on function public.tasks_my_list() from public, anon;
revoke all on function public.tasks_comment(uuid, text) from public, anon;
revoke all on function public.tasks_problem(text, text) from public, anon;
grant execute on function public.tasks_my_list() to authenticated;
grant execute on function public.tasks_comment(uuid, text) to authenticated;
grant execute on function public.tasks_problem(text, text) to authenticated;
