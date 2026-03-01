-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional if user is logged in
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    lead_type TEXT DEFAULT 'inquiry', -- 'inquiry', 'viewing_request', etc.
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'closed'
    ip_address TEXT,
    user_agent TEXT,
    owner_notified_at TIMESTAMP WITH TIME ZONE,
    user_confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Leads policies
-- Admins/Agents can view all
CREATE POLICY "Admins can view all leads" ON public.leads
    FOR SELECT USING (auth.role() = 'authenticated'); 
    -- Refine this to checking specific role if you have one, e.g. auth.jwt()->>'role' = 'admin'

-- Users can insert (public submission)
CREATE POLICY "Public can insert leads" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Agents table (If not already relying on auth.users directly, usually allows extended profile)
-- Based on codebase inspection, there seems to be an 'agents' table expected.
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    profile_image TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active agents" ON public.agents
    FOR SELECT USING (is_active = true);
    
-- Update properties to reference agents table if needed, or ensure the relation exists.
-- If properties.agent_id references auth.users, and agents.id references auth.users, they are 1:1.
-- However, Supabase joins usually require explicit FK.
-- If properties.agent_id references agents(id), then we are good.
-- My previous script referenced auth.users(id). 
-- Use this to fix/ensure compatibility if needed:
-- ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_agent_id_fkey;
-- ALTER TABLE public.properties ADD CONSTRAINT properties_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id);
