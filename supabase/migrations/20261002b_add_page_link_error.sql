-- P0 follow-up #2: record WHY an external link probe failed, so a status-0
-- result shows a real reason (DNS not found / connection refused / timeout /
-- TLS error) instead of a bare "broken". Nullable, additive — safe on a live DB.

alter table public.page_links
  add column if not exists link_error text;

comment on column public.page_links.link_error is
  'Why a link probe failed when http_status is 0: dns_not_found | connection_refused | timeout | tls_error | network_error. Only dns_not_found/connection_refused are treated as broken.';
