-- ============================================================================
-- 0002_rls.sql — Row Level Security (default deny) + leitura pública do cardápio
-- Ver ARCHITECTURE.md §7. Toda ESCRITA passa pela service_role no servidor.
-- ============================================================================

alter table business_settings     enable row level security;
alter table categories            enable row level security;
alter table items                 enable row level security;
alter table combo_items           enable row level security;
alter table option_groups         enable row level security;
alter table options               enable row level security;
alter table coupons               enable row level security;
alter table customers             enable row level security;
alter table addresses             enable row level security;
alter table orders                enable row level security;
alter table daily_sales           enable row level security;
alter table audit_log             enable row level security;
alter table admin_trusted_devices enable row level security;
alter table admin_login_codes     enable row level security;
alter table admin_login_attempts  enable row level security;

-- ── LEITURA PÚBLICA do cardápio (somente conteúdo ativo) ──
drop policy if exists pub_settings on business_settings;
create policy pub_settings on business_settings for select to anon, authenticated using (true);

drop policy if exists pub_categories on categories;
create policy pub_categories on categories for select to anon, authenticated using (active);

drop policy if exists pub_items on items;
create policy pub_items on items for select to anon, authenticated using (active);

drop policy if exists pub_combo_items on combo_items;
create policy pub_combo_items on combo_items for select to anon, authenticated using (true);

drop policy if exists pub_option_groups on option_groups;
create policy pub_option_groups on option_groups for select to anon, authenticated
  using (exists (select 1 from items i where i.id = item_id and i.active));

drop policy if exists pub_options on options;
create policy pub_options on options for select to anon, authenticated using (active);

-- Cupom: NÃO expor a tabela ao anon (evita enumerar códigos). Validação via RPC abaixo.
-- Demais tabelas (orders, customers, addresses, coupons, daily_sales, audit_log,
-- admin_*) ficam SEM policy p/ anon/authenticated → acesso só pela service_role.

-- ── RPC pública e segura para validar cupom sem expor a tabela ──
create or replace function validate_coupon(p_code text, p_subtotal numeric)
returns table (code text, kind text, value numeric, discount numeric)
language plpgsql security definer set search_path = public as $$
declare c coupons%rowtype;
begin
  select * into c from coupons
   where upper(code) = upper(p_code) and active
     and (starts_at is null or starts_at <= now())
     and (expires_at is null or expires_at > now())
     and (max_uses is null or used_count < max_uses)
     and p_subtotal >= min_order
   limit 1;
  if not found then return; end if;
  return query select c.code, c.kind, c.value,
    case c.kind
      when 'percent' then round(p_subtotal * c.value / 100, 2)
      when 'fixed'   then least(c.value, p_subtotal)
      else 0::numeric end;
end; $$;

revoke all on function validate_coupon(text, numeric) from public;
grant execute on function validate_coupon(text, numeric) to anon, authenticated;
