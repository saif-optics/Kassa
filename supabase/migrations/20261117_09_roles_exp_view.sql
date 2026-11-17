-- Роли, часть 9 (17.11.2026), по ревью: расходы дня выдаются только при праве exp_view
-- (право exp_add само по себе даёт только форму и шаблоны; лимит 30 записей в день считается на сервере).

create or replace function public.role_docs()
returns table(col text, id text, data jsonb)
language plpgsql stable security definer set search_path = '' as $$
declare c record;
begin
  begin c := public.limited_ctx(); exception when insufficient_privilege then return; end;
  return query select d.col, d.id, d.data - 'plan' from public.docs d where d.col = 'settings' and d.id = 'sales';
  if public.perm_on(c.o_perms, 'sales_view') then
    return query select d.col, d.id, d.data - 'cost' - 'costEst' - 'costSrc' - 'photo'
      from public.docs d where d.col = 'sales' and (c.o_point is null or d.data->>'point' = c.o_point);
  end if;
  if public.perm_on(c.o_perms, 'exp_view') then
    return query select d.col, d.id, d.data from public.docs d
      where d.col = 'entries' and (c.o_point is null or d.data->>'branch' = c.o_point)
        and d.data->>'type' = 'exp' and d.data->>'source' = 'day';
  end if;
  if public.perm_on(c.o_perms, 'exp_add') then
    return query select d.col, d.id,
        case when c.o_point is null then d.data else jsonb_build_object(c.o_point, coalesce(d.data->c.o_point, '[]'::jsonb)) end
      from public.docs d where d.col = 'settings' and d.id = 'sellerTpl';
  end if;
end $$;
