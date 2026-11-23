-- Стресс-тест вкладки «Задания» на стороне базы (23.11.2026). Запуск: Supabase MCP execute_sql одним блоком,
-- транзакция с rollback: тестовые участники, задания и комментарии не остаются. Норма: во всех строках v — текст
-- отказа или пометка «норма» с ожидаемым значением; любое «ПРОШЛО!» — дыра, закрывать до коммита.
-- Email участников вымышленные (*.invalid). Прогон 23.11.2026: все 20 строк в норме.
begin;
insert into public.members(email, role, point) values ('stress-seller@example.invalid','seller','C1'), ('stress-seller-b@example.invalid','seller','Яшнабад'), ('stress-mkt@example.invalid','marketer','C1');
insert into public.tasks(point,title,body,created_by) values ('C1','Задание C1','тело','owner@example.invalid'),('Яшнабад','Задание Яшнабад','тело','owner@example.invalid');
insert into public.tasks(point,title,status,created_by) values ('C1','Старое сделанное','done','owner@example.invalid');
update public.tasks set done_at = now() - interval '20 days' where title='Старое сделанное';
select set_config('st.c1', (select id::text from public.tasks where title='Задание C1'), true);
select set_config('st.y', (select id::text from public.tasks where title='Задание Яшнабад'), true);
create temp table r(t text, v text) on commit drop; grant all on r to authenticated, anon;
set local role authenticated;
select set_config('request.jwt.claims', '{"email":"stress-seller@example.invalid","role":"authenticated"}', true);
do $$
declare j json; e text; n int := 0; i int; nid uuid;
begin
  begin j := public.tasks_my_list(); insert into r values('seller_list (норма: 1 задание C1, без старого done)', (json_array_length(j->'tasks'))::text || ' заданий: ' || (select string_agg(x->>'title', ', ') from json_array_elements(j->'tasks') x)); exception when others then insert into r values('seller_list', sqlerrm); end;
  begin perform public.tasks_comment(current_setting('st.y')::uuid, 'чужая точка'); insert into r values('comment_other_point','ПРОШЛО!'); exception when others then insert into r values('comment_other_point', sqlerrm); end;
  begin perform public.tasks_comment(gen_random_uuid(), 'нет такого'); insert into r values('comment_missing','ПРОШЛО!'); exception when others then insert into r values('comment_missing', sqlerrm); end;
  begin perform public.tasks_comment(current_setting('st.c1')::uuid, '   '); insert into r values('comment_empty','ПРОШЛО!'); exception when others then insert into r values('comment_empty', sqlerrm); end;
  begin perform public.tasks_comment(current_setting('st.c1')::uuid, repeat('а',2001)); insert into r values('comment_2001','ПРОШЛО!'); exception when others then insert into r values('comment_2001', sqlerrm); end;
  begin perform public.tasks_problem(repeat('а',201), 'x'); insert into r values('problem_title_201','ПРОШЛО!'); exception when others then insert into r values('problem_title_201', sqlerrm); end;
  begin perform public.tasks_problem('x', repeat('а',4001)); insert into r values('problem_body_4001','ПРОШЛО!'); exception when others then insert into r values('problem_body_4001', sqlerrm); end;
  begin perform public.tasks_problem(null, null); insert into r values('problem_null','ПРОШЛО!'); exception when others then insert into r values('problem_null', sqlerrm); end;
  for i in 1..22 loop
    begin if i % 2 = 0 then perform public.tasks_comment(current_setting('st.c1')::uuid, 'к '||i); else nid := public.tasks_problem('проблема '||i, 'текст'); end if; n := n + 1;
    exception when others then e := sqlerrm; end;
  end loop;
  insert into r values('limit_20 (норма: 20 записей и отказ)', n::text || ' записей, последняя ошибка: ' || coalesce(e,'-'));
  begin j := public.tasks_my_list(); insert into r values('seller_list_after (норма: метки Вы/Владелец, email нет)', (json_array_length(j->'tasks'))::text || ' заданий; метки: ' || (select string_agg(distinct x->>'created_label', ',') from json_array_elements(j->'tasks') x) || '; email в json: ' || (position('@' in j::text) > 0)::text); exception when others then insert into r values('seller_list_after', sqlerrm); end;
  begin perform 1 from public.tasks; insert into r values('direct_select_tasks (норма: строк 0)', 'строк: '||(select count(*) from public.tasks)); exception when others then insert into r values('direct_select_tasks', sqlerrm); end;
  begin insert into public.tasks(point,title) values ('C1','взлом'); insert into r values('direct_insert_tasks','ПРОШЛО!'); exception when others then insert into r values('direct_insert_tasks', sqlerrm); end;
  begin update public.tasks set status='done' where point='C1'; insert into r values('direct_update_tasks (норма: не изменилось)', 'done у Задание C1: '||(select count(*) from public.tasks where status='done' and title='Задание C1')); exception when others then insert into r values('direct_update_tasks', sqlerrm); end;
  begin delete from public.task_comments; insert into r values('direct_delete_comments (норма: 0 видно)', 'видно строк: '||(select count(*) from public.task_comments)); exception when others then insert into r values('direct_delete_comments', sqlerrm); end;
end $$;
select set_config('request.jwt.claims', '{"email":"stress-mkt@example.invalid","role":"authenticated"}', true);
do $$ begin
  begin perform public.tasks_my_list(); insert into r values('marketer_list','ПРОШЛО!'); exception when others then insert into r values('marketer_list', sqlerrm); end;
  begin perform public.tasks_problem('x','y'); insert into r values('marketer_problem','ПРОШЛО!'); exception when others then insert into r values('marketer_problem', sqlerrm); end;
end $$;
-- владелец: RPC для ограниченных ролей отказывает, прямой доступ по RLS есть (подставьте email владельца из members)
-- select set_config('request.jwt.claims', '{"email":"<owner email>","role":"authenticated"}', true);
reset role; set local role anon;
do $$ begin
  begin perform public.tasks_my_list(); insert into r values('anon_rpc','ПРОШЛО!'); exception when others then insert into r values('anon_rpc', sqlerrm); end;
  begin perform 1 from public.tasks; insert into r values('anon_select','ПРОШЛО!'); exception when others then insert into r values('anon_select', sqlerrm); end;
end $$;
reset role;
select * from r;
rollback;
