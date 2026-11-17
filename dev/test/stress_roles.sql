-- Стресс-тест ролей на стороне базы (17.11.2026). Запуск: Supabase MCP execute_sql блоками, каждый блок —
-- транзакция с rollback: тестовые участники и записи не остаются. Ожидание: во всех строках v — текст отказа,
-- кроме строк с пометкой «норма». Любое «ПРОШЛО!» — дыра, закрывать до коммита.
-- Реальных данных здесь нет: email тестовых участников вымышленные (*.invalid).

-- ===== Блок 1. Продавец (seller, точка C1): лимиты расхода дня и попытки обхода =====
begin;
insert into public.members(email, role, point) values ('stress-seller@example.invalid','seller','C1');
create temp table r(t text, v text) on commit drop; grant all on r to authenticated;
set local role authenticated;
select set_config('request.jwt.claims', '{"email":"stress-seller@example.invalid","role":"authenticated"}', true);
do $$
declare i int; e text; n int := 0;
begin
  for i in 1..32 loop
    begin perform public.seller_add_expense('такси '||i, 1000, null); n := n + 1;
    exception when others then e := sqlerrm; end;
  end loop;
  insert into r values ('seller_30_limit (норма: 30 записей и отказ)', n::text || ' записей, последняя ошибка: ' || coalesce(e,'-'));
  begin perform public.seller_add_expense('x', 1000, null); insert into r values('name_1char','ПРОШЛО!'); exception when others then insert into r values('name_1char', sqlerrm); end;
  begin perform public.seller_add_expense(repeat('а',81), 1000, null); insert into r values('name_81','ПРОШЛО!'); exception when others then insert into r values('name_81', sqlerrm); end;
  begin perform public.seller_add_expense('вода', 0, null); insert into r values('amount_0','ПРОШЛО!'); exception when others then insert into r values('amount_0', sqlerrm); end;
  begin perform public.seller_add_expense('вода', 3000001, null); insert into r values('amount_3M+1','ПРОШЛО!'); exception when others then insert into r values('amount_3M+1', sqlerrm); end;
  begin perform public.seller_add_expense('вода', 10.5, null); insert into r values('amount_frac','ПРОШЛО!'); exception when others then insert into r values('amount_frac', sqlerrm); end;
  begin perform public.seller_add_expense('вода', 1000, current_date - 3); insert into r values('date_old','ПРОШЛО!'); exception when others then insert into r values('date_old', sqlerrm); end;
  begin perform public.seller_add_expense('вода', 1000, current_date + 1); insert into r values('date_future','ПРОШЛО!'); exception when others then insert into r values('date_future', sqlerrm); end;
  begin perform public.cashier_put_sale('stress1', '{"point":"C1","date":"2026-11-17","sum":1}'); insert into r values('seller_put_sale','ПРОШЛО!'); exception when others then insert into r values('seller_put_sale', sqlerrm); end;
  begin perform public.cashier_put_entry('stress2', '{"branch":"C1","type":"exp","cat":"op","name":"x y","amount":1,"date":"2026-11-17"}'); insert into r values('seller_put_entry','ПРОШЛО!'); exception when others then insert into r values('seller_put_entry', sqlerrm); end;
  begin perform public.att_my_load(now()-interval '40 days', now()); insert into r values('att_40days','ПРОШЛО!'); exception when others then insert into r values('att_40days', sqlerrm); end;
  begin perform public.access_list(); insert into r values('seller_access_list','ПРОШЛО!'); exception when others then insert into r values('seller_access_list', sqlerrm); end;
  begin insert into public.members(email,role,point) values ('x@example.invalid','admin',null); insert into r values('seller_insert_member','ПРОШЛО!'); exception when others then insert into r values('seller_insert_member', sqlerrm); end;
  begin update public.members set role='admin' where email='stress-seller@example.invalid'; insert into r values('seller_self_promote (норма: строк 0)', 'строк: '||(select count(*) from public.members where email='stress-seller@example.invalid' and role='admin')); exception when others then insert into r values('seller_self_promote', sqlerrm); end;
end $$;
select * from r;
rollback;

-- ===== Блок 2. Кассир (cashier, точка Премиум): чужие записи, служебные поля, размер, нагрузка =====
begin;
insert into public.members(email, role, point) values ('stress-cash@example.invalid','cashier','Премиум');
select set_config('st.old_id', (select id from public.docs where col='sales' and data->>'point'='Премиум' and (data->>'date')::date < current_date - 5 limit 1), true);
select set_config('st.bz_id', (select id from public.docs where col='sales' and id like 'bz%' limit 1), true);
select set_config('st.other_id', (select id from public.docs where col='sales' and data->>'point'='Яшнабад' limit 1), true);
select set_config('st.manual_id', coalesce((select id from public.docs where col='entries' and data->>'branch'='Премиум' and data->>'source'='manual' limit 1),''), true);
create temp table r(t text, v text) on commit drop; grant all on r to authenticated;
set local role authenticated;
select set_config('request.jwt.claims', '{"email":"stress-cash@example.invalid","role":"authenticated"}', true);
do $$
declare big text := repeat('x', 200000); d text := to_char((now() at time zone 'Asia/Tashkent')::date,'YYYY-MM-DD'); t0 timestamptz; i int;
  old_id text := current_setting('st.old_id'); bz_id text := current_setting('st.bz_id'); other_id text := current_setting('st.other_id'); manual_id text := current_setting('st.manual_id');
begin
  begin perform public.cashier_put_sale('stressbig', jsonb_build_object('point','Премиум','date',d,'sum',1000,'note',big)); insert into r values('note_200kb','ПРОШЛО!'); exception when others then insert into r values('note_200kb', sqlerrm); end;
  begin perform public.cashier_put_sale('stress2', jsonb_build_object('point','Премиум','date',d,'sum',1000,'cost',1,'billz','x','createdAt',4102444800000,'by','hacker')); insert into r values('inject_fields (норма: принято, поля ниже)','принято'); exception when others then insert into r values('inject_fields', sqlerrm); end;
  begin perform public.cashier_put_sale(old_id, jsonb_build_object('point','Премиум','date',d,'sum',1)); insert into r values('edit_old_sale','ПРОШЛО!'); exception when others then insert into r values('edit_old_sale', sqlerrm); end;
  begin perform public.cashier_del_sale(bz_id); insert into r values('del_billz_sale','ПРОШЛО!'); exception when others then insert into r values('del_billz_sale', sqlerrm); end;
  begin perform public.cashier_put_sale(other_id, jsonb_build_object('point','Премиум','date',d,'sum',1)); insert into r values('overwrite_other_point','ПРОШЛО!'); exception when others then insert into r values('overwrite_other_point', sqlerrm); end;
  if manual_id <> '' then begin perform public.cashier_del_entry(manual_id); insert into r values('del_manual_entry','ПРОШЛО!'); exception when others then insert into r values('del_manual_entry', sqlerrm); end; end if;
  t0 := clock_timestamp();
  for i in 1..200 loop perform public.cashier_put_sale('stressN'||i, jsonb_build_object('point','Премиум','date',d,'sum',1000,'product','тест','qty',1,'price',1000,'pay','Наличные')); end loop;
  insert into r values('200_sales_ms (норма: < 2000)', round(extract(epoch from clock_timestamp()-t0)*1000)::text);
  t0 := clock_timestamp();
  insert into r values('role_docs_all (норма: ms < 2000)', 'rows='||jsonb_array_length(public.role_docs_all())||' bytes='||length(public.role_docs_all()::text)||' ms='||round(extract(epoch from clock_timestamp()-t0)*1000/2));
  begin perform public.cashier_put_sale(repeat('a',41), jsonb_build_object('point','Премиум','date',d,'sum',1)); insert into r values('id_41','ПРОШЛО!'); exception when others then insert into r values('id_41', sqlerrm); end;
  begin perform public.cashier_put_sale('stress3', '[1,2]'::jsonb); insert into r values('data_array','ПРОШЛО!'); exception when others then insert into r values('data_array', sqlerrm); end;
end $$;
reset role;
insert into r select 'stress2_keys (норма: by,createdAt,date,point,sum)', string_agg(k, ',' order by k) from public.docs x, jsonb_object_keys(x.data) k where x.col='sales' and x.id='stress2';
insert into r select 'stress2_createdAt_future (норма: false)', ((data->>'createdAt')::bigint > extract(epoch from now())*1000+60000)::text from public.docs where col='sales' and id='stress2';
select * from r;
rollback;

-- ===== Блок 3. Гость с выключенными правами: ничего, кроме настроек =====
begin;
insert into public.members(email, role, point, perms) values ('stress-mk@example.invalid','marketer','Премиум','{"sales_view":false,"analytics":false}');
set local role authenticated;
select set_config('request.jwt.claims', '{"email":"stress-mk@example.invalid","role":"authenticated"}', true);
select 'guest_all_off (норма: settings:1)' t, (select string_agg(col||':'||n, ', ') from (select col, count(*) n from public.role_docs() group by col) s) v;
rollback;
