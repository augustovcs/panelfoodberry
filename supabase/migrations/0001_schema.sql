-- ============================================================================
-- 0001_schema.sql — Estrutura de dados do AnotaBem (negócio único)
-- Ver ARCHITECTURE.md §6. Dinheiro em numeric(10,2); datas em timestamptz.
-- ============================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ─────────────────────── NEGÓCIO (singleton) ───────────────────────
create table if not exists business_settings (
  id               smallint primary key default 1 check (id = 1),
  name             text not null,
  tagline          text,
  cover_url        text,
  logo_url         text,
  phone_whatsapp   text not null,              -- destino do wa.me (E.164: 5511...)
  address          text,
  categories_label text,                        -- "Lanches · Pizza · Brasileira"
  rating           numeric(2,1) default 0,
  reviews          integer default 0,
  delivery_time    text,                        -- "30–45 min"
  distance         text,                        -- "2,4 km"
  min_order        numeric(10,2) not null default 0,
  delivery_fee     numeric(10,2) not null default 0,
  is_open          boolean not null default true,
  closes_at        text,                        -- "23:00"
  opening_hours    jsonb not null default '{}', -- { "mon": ["18:00","23:00"], ... }
  updated_at       timestamptz not null default now()
);

-- ─────────────────────────── CATEGORIAS ───────────────────────────
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  icon       text not null default 'UtensilsCrossed', -- nome do glyph lucide
  sort       integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ───────────────────────────── ITENS ─────────────────────────────
-- type='produto' | 'combo'. Combo agrega outros itens via combo_items.
create table if not exists items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references categories(id) on delete cascade,
  type         text not null default 'produto' check (type in ('produto','combo')),
  name         text not null,
  description  text,
  price        numeric(10,2) not null check (price >= 0),
  old_price    numeric(10,2),                   -- preço riscado (promoção)
  image_url    text,
  gradient     text,                            -- fallback CSS gradient
  badge        text,                            -- "Mais pedido", "Promo"
  featured     boolean not null default false,  -- carrossel "Destaques"
  active       boolean not null default true,
  sort         integer not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists idx_items_category on items(category_id) where active;
create index if not exists idx_items_featured on items(featured)   where active and featured;

-- Composição de combos (auto-relação).
create table if not exists combo_items (
  combo_id     uuid not null references items(id) on delete cascade,
  component_id uuid not null references items(id) on delete restrict,
  qty          integer not null default 1 check (qty > 0),
  primary key (combo_id, component_id)
);

-- ──────────── COMPLEMENTOS / EXTRAS (grupos de opções) ────────────
create table if not exists option_groups (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid not null references items(id) on delete cascade,
  name       text not null,                     -- "Adicionais", "Borda"
  required   boolean not null default false,
  min_select integer not null default 0,
  max_select integer not null default 1,
  sort       integer not null default 0
);
create index if not exists idx_optgroups_item on option_groups(item_id);

create table if not exists options (
  id        uuid primary key default gen_random_uuid(),
  group_id  uuid not null references option_groups(id) on delete cascade,
  name      text not null,                      -- "Bacon crocante"
  price     numeric(10,2) not null default 0,
  active    boolean not null default true,
  sort      integer not null default 0
);

-- ─────────────────────────── CUPONS ───────────────────────────
create table if not exists coupons (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,          -- "PRIMEIRA10"
  kind            text not null check (kind in ('percent','fixed','free_delivery')),
  value           numeric(10,2) not null default 0, -- % ou R$ conforme kind
  min_order       numeric(10,2) not null default 0,
  max_uses        integer,                       -- null = ilimitado
  used_count      integer not null default 0,
  per_phone_limit integer not null default 1,    -- usos por telefone
  starts_at       timestamptz,
  expires_at      timestamptz,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists idx_coupons_active on coupons(active) where active;

-- ─────────────────────────── CLIENTES ───────────────────────────
create table if not exists customers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text not null unique,            -- E.164
  created_at    timestamptz not null default now(),
  last_order_at timestamptz
);

create table if not exists addresses (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references customers(id) on delete cascade,
  cep          text,
  street       text,
  number       text,
  complement   text,
  neighborhood text,
  city         text,
  is_default   boolean not null default false
);
create index if not exists idx_addresses_customer on addresses(customer_id);

-- ─────────────────────────── PEDIDOS ───────────────────────────
-- Itens como SNAPSHOT jsonb (economia de linhas + histórico imutável). Ver §8.
-- items: [{ name, qty, unit_price, options:[{name,price}], notes, line_total }]
create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,           -- nanoid curto, ex "A7K2P"
  customer_id    uuid references customers(id) on delete set null,
  customer_name  text not null,                  -- snapshot
  customer_phone text not null,                  -- snapshot
  delivery_type  text not null check (delivery_type in ('delivery','pickup')),
  address        jsonb,                          -- snapshot do endereço
  payment_method text not null,                  -- 'pix_entrega'|'dinheiro'|'cartao_maquina'
  change_for     numeric(10,2),                  -- troco para (dinheiro)
  items          jsonb not null,                 -- snapshot das linhas
  subtotal       numeric(10,2) not null,
  delivery_fee   numeric(10,2) not null default 0,
  discount       numeric(10,2) not null default 0,
  coupon_code    text,
  total          numeric(10,2) not null,
  notes          text,
  status         text not null default 'queue'
                 check (status in ('queue','production','sent','done','cancelled')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_orders_open    on orders(status) where status not in ('done','cancelled');
create index if not exists idx_orders_created on orders(created_at desc);

-- ──────────── VENDAS AGREGADAS (relatórios baratos) ────────────
create table if not exists daily_sales (
  day          date primary key,
  orders_count integer not null default 0,
  gross        numeric(12,2) not null default 0,
  discounts    numeric(12,2) not null default 0,
  net          numeric(12,2) not null default 0
);

-- ──────────── LOG LEVE (retenção 90 dias — ver 0003) ────────────
create table if not exists audit_log (
  id         bigint generated always as identity primary key,
  actor      text,
  action     text not null,
  entity     text,
  entity_id  text,
  meta       jsonb,
  ip         inet,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_created on audit_log(created_at);

-- ──────────── SEGURANÇA ADMIN (2FA / device / tentativas) ────────────
create table if not exists admin_trusted_devices (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  device_hash text not null,
  last_ip     inet,
  geo         text,                              -- "BR-SP" (país-região)
  trusted_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  unique (user_id, device_hash)
);

create table if not exists admin_login_codes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  code_hash   text not null,                     -- OTP hasheado (nunca em claro)
  expires_at  timestamptz not null,
  attempts    integer not null default 0,
  consumed_at timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists admin_login_attempts (
  id         bigint generated always as identity primary key,
  email      text,
  ip         inet,
  success    boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_login_attempts on admin_login_attempts(ip, created_at);
