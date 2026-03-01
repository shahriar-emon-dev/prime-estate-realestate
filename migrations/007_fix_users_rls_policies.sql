-- =====================================================
-- MIGRATION: Fix RLS Policies for Users Table
-- =====================================================
-- Purpose: Add INSERT and UPDATE policies to allow users to create/update their own records
-- This fix is needed because the previous migration only had SELECT policies

-- Drop old incomplete SELECT policies if they exist
DROP POLICY IF EXISTS "Users can view their own record" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- =====================================================
-- SELECT: Users can view their own record
-- =====================================================
CREATE POLICY "Users can view their own record" 
    ON public.users
    FOR SELECT 
    USING (auth.uid() = user_id);

-- =====================================================
-- SELECT: Admins can view all users
-- =====================================================
CREATE POLICY "Admins can view all users" 
    ON public.users
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.user_id = auth.uid() AND u.role = 'admin'
        )
    );

-- =====================================================
-- INSERT: Users can create their own record
-- =====================================================
CREATE POLICY "Users can create their own record"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- UPDATE: Users can update their own record
-- =====================================================
CREATE POLICY "Users can update their own record"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- DELETE: Service role / Cascade handles this
-- =====================================================
-- Note: DELETE is handled by CASCADE on auth.users foreign key
-- Users cannot delete their own records directly (security design)

COMMENT ON POLICY "Users can create their own record" ON public.users
    IS 'Allows authenticated users to create their own user record';

COMMENT ON POLICY "Users can update their own record" ON public.users
    IS 'Allows authenticated users to update their own user record';
