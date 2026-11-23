-- Право «Задания своей точки» (ключ tasks), 23.11.2026: по умолчанию у кассира и продавца, у гостя нет.
-- Вкладка «Задания» и её RPC — в 20261123_12_tasks.sql (другая сессия), проверка там: perm_on(o_perms, 'tasks').

create or replace function public.role_perms(p_role text) returns jsonb
language sql immutable set search_path = '' as $$
  select case p_role
    when 'owner' then '{"sales_view":true,"sales_write":true,"sales_edit":true,"exp_view":true,"exp_add":true,"exp_edit":true,"cash_view":true,"debts_view":true,"att_view":true,"analytics":true,"export":true,"tasks":true}'::jsonb
    when 'admin' then '{"sales_view":true,"sales_write":true,"sales_edit":true,"exp_view":true,"exp_add":true,"exp_edit":true,"cash_view":true,"debts_view":true,"att_view":true,"analytics":true,"export":true,"tasks":true}'::jsonb
    when 'cashier' then '{"sales_view":true,"sales_write":true,"sales_edit":true,"exp_view":true,"exp_add":true,"exp_edit":true,"cash_view":true,"debts_view":true,"att_view":true,"analytics":false,"export":false,"tasks":true}'::jsonb
    when 'seller' then '{"sales_view":true,"sales_write":false,"sales_edit":false,"exp_view":true,"exp_add":true,"exp_edit":false,"cash_view":false,"debts_view":false,"att_view":true,"analytics":false,"export":false,"tasks":true}'::jsonb
    when 'marketer' then '{"sales_view":true,"sales_write":false,"sales_edit":false,"exp_view":false,"exp_add":false,"exp_edit":false,"cash_view":false,"debts_view":false,"att_view":false,"analytics":true,"export":false,"tasks":false}'::jsonb
    else '{}'::jsonb end
$$;
