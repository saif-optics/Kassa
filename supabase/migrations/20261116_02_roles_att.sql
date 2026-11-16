-- Роли, часть 2 (16.11.2026): выдача документов ограниченной роли одним JSON (без лимита строк PostgREST)
-- и журнал прихода своей точки для продавца (без кодов киосков, образцов лиц и фото).

create or replace function public.role_docs_all()
returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('col', r.col, 'id', r.id, 'data', r.data)), '[]'::jsonb)
  from public.role_docs() r
$$;

create or replace function public.att_my_load(p_from timestamptz, p_to timestamptz)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare r text; p text;
begin
  select m.role, m.point into r, p from public.members m
    where lower(m.email) = lower(coalesce(auth.jwt()->>'email',''));
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

revoke all on function public.role_docs_all() from public, anon;
revoke all on function public.att_my_load(timestamptz, timestamptz) from public, anon;
grant execute on function public.role_docs_all(), public.att_my_load(timestamptz, timestamptz) to authenticated;
