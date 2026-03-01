-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price TEXT NOT NULL,
    price_numeric NUMERIC,
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    square_feet INTEGER DEFAULT 0,
    property_type TEXT NOT NULL,
    status TEXT DEFAULT 'Available',
    features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    agent_id UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (safe to re-run)
DROP POLICY IF EXISTS "Public properties are viewable by everyone" ON public.properties;
DROP POLICY IF EXISTS "Users can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update properties" ON public.properties;

DROP POLICY IF EXISTS "Property images are viewable by everyone" ON public.property_images;
DROP POLICY IF EXISTS "Users can insert images" ON public.property_images;

-- Re-create policies
CREATE POLICY "Public properties are viewable by everyone" ON public.properties
    FOR SELECT USING (true);

CREATE POLICY "Users can insert properties" ON public.properties
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update properties" ON public.properties
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Property images are viewable by everyone" ON public.property_images
    FOR SELECT USING (true);

CREATE POLICY "Users can insert images" ON public.property_images
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Storage Bucket Setup (Idempotent)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Note: 'storage.objects' policies can be tricky to drop by name if names vary. 
-- We'll just try to create them, if they error it's likely they exist which is fine.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Properties'
    ) THEN
        CREATE POLICY "Public Access Properties" ON storage.objects
        FOR SELECT USING (bucket_id = 'properties');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Auth Upload Properties'
    ) THEN
        CREATE POLICY "Auth Upload Properties" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'properties' AND auth.role() = 'authenticated');
    END IF;
END
$$;

-- Fix for price_numeric column if it was erroneously created as a generated column
-- This ensures it is a standard NUMERIC column that we can write to.
DO $$
BEGIN
    -- We'll try to drop and re-create the column to ensure it has no hidden properties like GENERATED ALWAYS
    -- Warning: This clears data in this column, but it's derived data (and we are in setup mode).
    ALTER TABLE public.properties DROP COLUMN IF EXISTS price_numeric;
    ALTER TABLE public.properties ADD COLUMN price_numeric NUMERIC;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore errors if for some reason it fails (e.g. concurrently modified)
END $$;
