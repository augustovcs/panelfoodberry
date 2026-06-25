-- ============================================================================
-- 0004_storage.sql — Bucket público `menu` para fotos de itens/capa/logo
-- Ver ARCHITECTURE.md §6/§8. Leitura pública; escrita só pela service_role.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('menu', 'menu', true)
on conflict (id) do nothing;

-- Leitura pública dos arquivos do bucket.
drop policy if exists "menu public read" on storage.objects;
create policy "menu public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'menu');

-- Upload/edição/remoção ficam exclusivamente com a service_role (server),
-- que ignora RLS. Não criamos policy de insert/update/delete para anon/auth.
