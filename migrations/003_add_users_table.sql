-- =====================================================
-- MIGRATION: Add Users Table for Role Management
-- =====================================================
-- Purpose: Store user roles (user, seller, admin) linked to Supabase auth.users
-- Run this migration after initial schema setup

-- =====================================================
-- 1. CREATE USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- =====================================================
-- 2. UPDATE FUNCTION FOR TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at for users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own record" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Users can view their own record
CREATE POLICY "Users can view their own record" 
    ON public.users FOR SELECT 
    USING (auth.uid() = user_id);

-- Admins can view all users (when implemented)
CREATE POLICY "Admins can view all users" 
    ON public.users FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.user_id = auth.uid() AND u.role = 'admin'
        )
    );

-- =====================================================
-- 4. HELPFUL QUERIES
-- =====================================================
-- Get user role:
-- SELECT role FROM public.users WHERE user_id = auth.uid();

-- Get all admins:
-- SELECT user_id FROM public.users WHERE role = 'admin';

-- Get all sellers:
-- SELECT user_id FROM public.users WHERE role = 'seller';
