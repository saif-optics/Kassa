-- Киоск отметок: необязательное исходное время отметки (p_at) для отметок,
-- отправленных из очереди без связи. Принимается, только если не старше суток
-- и не из будущего (допуск 2 мин на расхождение часов), иначе — now().
-- Защита от повтора: такая же отметка того же сотрудника в пределах ±3 мин
-- от времени отметки не пишется (покрывает и повтор из очереди).
-- Решение владельца 28.11.2026.

drop function if exists public.att_kiosk_mark(text, uuid, text, real, text, double precision, double precision, real, text);

create function public.att_kiosk_mark(
  p_code text, p_emp uuid, p_kind text, p_score real, p_photo text,
  p_lat double precision default null, p_lng double precision default null,
  p_acc real default null, p_device text default null, p_at timestamptz default null)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_point text; v_dup public.att_events; v_id bigint; v_ts timestamptz;
begin
  select point into v_point from public.att_points where code = p_code;
  if v_point is null then raise exception 'bad_code'; end if;
  if p_kind not in ('in','out') then raise exception 'bad_kind'; end if;
  if not exists (select 1 from public.att_employees where id = p_emp and active) then raise exception 'bad_employee'; end if;
  if p_photo is not null and length(p_photo) > 300000 then raise exception 'photo_too_big'; end if;
  v_ts := case when p_at is not null and p_at >= now() - interval '1 day' and p_at <= now() + interval '2 minutes'
               then least(p_at, now()) else now() end;
  select * into v_dup from public.att_events
   where employee_id = p_emp and kind = p_kind
     and ts between v_ts - interval '3 minutes' and v_ts + interval '3 minutes'
   order by ts desc limit 1;
  if found then
    return jsonb_build_object('id', v_dup.id, 'kind', v_dup.kind, 'ts', v_dup.ts, 'dup', true);
  end if;
  insert into public.att_events (employee_id, point, kind, ts, score, photo, lat, lng, acc, device)
  values (p_emp, v_point, p_kind, v_ts, p_score, p_photo, p_lat, p_lng, p_acc, left(p_device, 200))
  returning id into v_id;
  return jsonb_build_object('id', v_id, 'kind', p_kind, 'ts', v_ts, 'dup', false);
end $function$;

revoke all on function public.att_kiosk_mark(text, uuid, text, real, text, double precision, double precision, real, text, timestamptz) from public;
grant execute on function public.att_kiosk_mark(text, uuid, text, real, text, double precision, double precision, real, text, timestamptz) to anon, authenticated, service_role;
