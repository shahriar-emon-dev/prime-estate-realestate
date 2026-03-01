-- =====================================================
-- PRIME ESTATE - EMAIL OTP CHALLENGES & USERS TABLE
-- =====================================================
-- Purpose: Tables required for OTP-based registration
-- Run this in Supabase SQL Editor BEFORE using registration
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. EMAIL OTP CHALLENGES TABLE
-- =====================================================
-- Stores OTP challenges for email verification during registration
CREATE TABLE IF NOT EXISTS public.email_otp_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempt_count INTEGER DEFAULT 0,
    verified_at TIMESTAMP WITH TIME ZONE,
    last_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for email_otp_challenges
CREATE INDEX IF NOT EXISTS idx_email_otp_challenges_email ON public.email_otp_challenges(email);
CREATE INDEX IF NOT EXISTS idx_email_otp_challenges_expires_at ON public.email_otp_challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_otp_challenges_verified_at ON public.email_otp_challenges(verified_at);
CREATE INDEX IF NOT EXISTS idx_email_otp_challenges_created_at ON public.email_otp_challenges(created_at DESC);

-- Enable RLS on email_otp_challenges
ALTER TABLE public.email_otp_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can access (via SUPABASE_SERVICE_ROLE_KEY)
-- No public access policies - all access is server-side only

-- =====================================================
-- 2. USERS TABLE (Role Mapping)
-- =====================================================
-- Maps Supabase auth.users to application roles
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Trigger for updated_at on users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
-- Users can read their own profile
CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = user_id);

-- Service role can insert (via registration API)
-- No public insert policy - handled by service role key

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running, verify tables exist:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('email_otp_challenges', 'users');
