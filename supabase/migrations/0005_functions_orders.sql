-- ============================================================================
-- 0005_functions_orders.sql — Débito atômico de cupom no fechamento do pedido
-- ============================================================================

-- Incrementa used_count respeitando max_uses (atômico). Retorna o novo total ou
-- NULL se o cupom não existir / esgotou.
create or replace function increment_coupon_use(p_code text)
returns integer language plpgsql security definer set search_path = public as $$
declare new_count integer;
begin
  update coupons
     set used_count = used_count + 1
   where upper(code) = upper(p_code)
     and active
     and (max_uses is null or used_count < max_uses)
  returning used_count into new_count;
  return new_count;
end; $$;

revoke all on function increment_coupon_use(text) from public;
-- Só a service_role (servidor) chama esta função.
