-- =====================================================
-- ADMIN SEED + RLS FIX — Prime Estate
-- =====================================================
-- This script does THREE things:
--   1. Fixes RLS infinite recursion on public.users
--   2. Promotes shahriar19645@gmail.com to admin
--   3. Adds proper insert/update policies
--
-- Run this ONCE in Supabase SQL Editor.
-- =====================================================

-- =====================================================
-- STEP 1: Fix RLS infinite recursion
-- =====================================================
-- The old "Admins can view all users" policy queries the
-- same table it protects, causing infinite recursion.
-- Fix: use a SECURITY DEFINER function that bypasses RLS.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop the broken policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own record" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own record" ON public.users;
DROP POLICY IF EXISTS "Users can update their own record" ON public.users;

-- Recreate policies correctly
CREATE POLICY "Users can view their own record"
  ON public.users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can insert their own record"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own record"
  ON public.users FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- STEP 2: Promote shahriar19645@gmail.com to admin
-- =====================================================

DO $$
DECLARE
  target_user_id uuid;
  existing_record_id uuid;
BEGIN
  -- Find the auth user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE lower(email) = 'shahriar19645@gmail.com'
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User shahriar19645@gmail.com not found in auth.users.';
  END IF;

  -- Check if user record already exists
  SELECT user_id INTO existing_record_id
  FROM public.users
  WHERE user_id = target_user_id;

  IF existing_record_id IS NOT NULL THEN
    UPDATE public.users
    SET role = 'admin', updated_at = NOW()
    WHERE user_id = target_user_id;
    RAISE NOTICE 'Updated existing user to admin (user_id: %)', target_user_id;
  ELSE
    INSERT INTO public.users (user_id, role)
    VALUES (target_user_id, 'admin');
    RAISE NOTICE 'Created admin record (user_id: %)', target_user_id;
  END IF;
END $$;
