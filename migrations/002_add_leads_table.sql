-- =====================================================
-- PRIME ESTATE - LEADS TABLE MIGRATION
-- =====================================================
-- Purpose: Generic lead capture for property inquiries
-- Run this in Supabase SQL Editor
-- =====================================================

-- 12. LEADS TABLE (Generic Lead Capture)
-- =====================================================
-- Unified lead table for all types of inquiries
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Property reference (optional - leads can be general inquiries)
    listing_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    
    -- Contact information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Lead details
    message TEXT NOT NULL,
    lead_type TEXT NOT NULL DEFAULT 'inquiry' CHECK (lead_type IN ('inquiry', 'site_visit', 'meeting', 'callback')),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    
    -- Email notification tracking
    owner_notified_at TIMESTAMP WITH TIME ZONE,
    user_confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    source TEXT DEFAULT 'website',
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_listing_id ON public.leads(listing_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_type ON public.leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can create leads (for contact forms)
CREATE POLICY "Anyone can create leads" 
    ON public.leads FOR INSERT 
    WITH CHECK (true);

-- Users can view their own leads
CREATE POLICY "Users can view their own leads" 
    ON public.leads FOR SELECT 
    USING (auth.uid() = user_id);

-- Admins/Agents can view leads for their properties (handled via service role key)

-- =====================================================
-- VERIFY/UPDATE USERS TABLE
-- =====================================================
-- Ensure users table has proper role enum and constraints
-- (already exists in your schema, just verifying)

-- Add check constraint for role if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT users_role_check 
        CHECK (role IN ('user', 'admin', 'agent'));
    END IF;
END $$;

-- Add index on role for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
