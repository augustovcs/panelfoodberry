-- ============================================================================
-- 0003_functions_cron.sql — Agregação de vendas e expurgo de log (pg_cron)
-- Ver ARCHITECTURE.md §8. Mantém o banco leve no Supabase Free.
-- ============================================================================

create extension if not exists pg_cron;

-- Recalcula o agregado de um dia (idempotente).
create or replace function refresh_daily_sales(target date)
returns void language sql as $$
  insert into daily_sales (day, orders_count, gross, discounts, net)
  select target,
         count(*),
         coalesce(sum(total), 0),
         coalesce(sum(discount), 0),
         coalesce(sum(total - discount), 0)
  from orders
  where status <> 'cancelled'
    and created_at >= target and created_at < target + 1
  on conflict (day) do update
    set orders_count = excluded.orders_count,
        gross        = excluded.gross,
        discounts    = excluded.discounts,
        net          = excluded.net;
$$;

-- Agrega hoje e ontem a cada hora (idempotente; remove agendamento anterior).
select cron.unschedule('agg-sales-today') where exists
  (select 1 from cron.job where jobname = 'agg-sales-today');
select cron.schedule('agg-sales-today', '5 * * * *',
  $$ select refresh_daily_sales(current_date);
     select refresh_daily_sales(current_date - 1); $$);

-- Expurga log antigo (audit 90d, tentativas de login 30d).
select cron.unschedule('purge-audit') where exists
  (select 1 from cron.job where jobname = 'purge-audit');
select cron.schedule('purge-audit', '30 3 * * *',
  $$ delete from audit_log where created_at < now() - interval '90 days';
     delete from admin_login_attempts where created_at < now() - interval '30 days'; $$);
