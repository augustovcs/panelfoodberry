# Supabase — banco do AnotaBem

Esquema, RLS, funções/cron e storage do projeto. Ver visão geral em `ARCHITECTURE.md` §6–8
e o detalhamento em `dbseed.md`.

## Migrations

| Arquivo                              | Conteúdo                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `migrations/0001_schema.sql`         | Tabelas, índices                                                         |
| `migrations/0002_rls.sql`            | RLS (default deny) + leitura pública do cardápio + RPC `validate_coupon` |
| `migrations/0003_functions_cron.sql` | `refresh_daily_sales` + jobs `pg_cron` (agregação/expurgo)               |
| `migrations/0004_storage.sql`        | Bucket público `menu`                                                    |

## Como aplicar

### Opção A — Supabase CLI (recomendado)

```bash
supabase link --project-ref <project-ref>
supabase db push          # aplica as migrations em ordem
```

### Opção B — SQL Editor (sem CLI)

Cole e rode, em ordem, o conteúdo de cada arquivo de `migrations/` no SQL Editor do
painel do Supabase.

> `pg_cron` e `pgcrypto` já são habilitados pelas migrations. Em alguns projetos é
> preciso habilitar `pg_cron` em **Database → Extensions** antes de rodar a 0003.

## Seed do cardápio

O seeder lê os fixtures (`src/lib/menu/fixtures.ts`) e popula `business_settings`,
`categories`, `items`, `option_groups` e `options`. É **idempotente** (limpa o
cardápio antes de inserir).

```bash
# variáveis necessárias (use as do projeto):
export NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="..."   # service_role (NUNCA commitar)

npm run db:seed
```

## Variáveis de ambiente

Ver `.env.example` na raiz. Resumo:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — públicas (browser).
- `SUPABASE_SERVICE_ROLE_KEY` — **só servidor**, usada pelo seeder e pelas escritas.
