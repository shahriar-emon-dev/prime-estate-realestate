-- =====================================================
-- MIGRATION: Performance Indexes for Prime Estate
-- =====================================================
-- Purpose:
--   Improve query performance for frequent storefront/admin filters and sorting.

-- Properties: location filters and sort by recency/price
CREATE INDEX IF NOT EXISTS idx_properties_city_area ON public.properties(city, area);
CREATE INDEX IF NOT EXISTS idx_properties_price_numeric ON public.properties(price_numeric);
CREATE INDEX IF NOT EXISTS idx_properties_created_at_desc ON public.properties(created_at DESC);

-- Requests: faster admin pending/recency views
CREATE INDEX IF NOT EXISTS idx_meeting_requests_status_created_at
  ON public.meeting_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visit_requests_status_created_at
  ON public.site_visit_requests(status, created_at DESC);

-- Users: role lookups for RBAC checks
CREATE INDEX IF NOT EXISTS idx_users_role_lookup ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_user_id_role ON public.users(user_id, role);
