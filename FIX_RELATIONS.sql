
-- This script fixes the relationship between Properties and Agents, and ensures the Agents table exists.
-- Run this in your Supabase SQL Editor.

-- 1. Create agents table if it doesn't exist
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

-- 2. Enable RLS on agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- 3. Policies for agents
DROP POLICY IF EXISTS "Public can view active agents" ON public.agents;
CREATE POLICY "Public can view active agents" ON public.agents
    FOR SELECT USING (is_active = true);

-- 4. Update properties table to reference agents instead of auth.users
-- This is required for the application to join 'agents' when fetching properties.

DO $$
BEGIN
    -- Drop potential existing Foreign Key constraints to auth.users
    -- We try multiple names just in case
    ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_agent_id_fkey;
    ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_agent_id_fkey1;
    
    -- Now add the correct Foreign Key to public.agents
    -- Note: This assumes current agent_ids in properties are valid in agents table, or are NULL.
    -- If this step fails, it means there is an agent_id in properties that isn't in agents table.
    -- In that case, we set invalid agent_ids to NULL first:
    UPDATE public.properties 
    SET agent_id = NULL 
    WHERE agent_id IS NOT NULL 
    AND agent_id NOT IN (SELECT id FROM public.agents);

    ALTER TABLE public.properties 
    ADD CONSTRAINT properties_agent_id_fkey 
    FOREIGN KEY (agent_id) 
    REFERENCES public.agents(id)
    ON DELETE SET NULL;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating constraints: %', SQLERRM;
END $$;
