-- ─────────────────────── CUPONS FIXOS (escopo por item) ───────────────────────
-- Adiciona suporte a "cupom fixo": uma promoção automática (% ou R$) aplicada a
-- itens específicos do cardápio, em vez de um código digitado no carrinho.
--
--   scope = 'order'  → cupom de código clássico (carrinho inteiro).
--   scope = 'items'  → cupom fixo: desconto nos itens listados em target_item_ids.

alter table coupons
  add column if not exists scope text not null default 'order'
    check (scope in ('order', 'items')),
  add column if not exists target_item_ids uuid[] not null default '{}';

-- Índice para buscar rapidamente os cupons fixos ativos no storefront.
create index if not exists idx_coupons_fixed
  on coupons (scope)
  where active and scope = 'items';
