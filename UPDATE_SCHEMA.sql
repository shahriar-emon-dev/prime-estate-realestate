-- FINAL ROBUST MIGRATION SCRIPT
-- Usage: Run this to remove all legacy blockers (constraints, checks, not-nulls)

-- 1. AGENTS
CREATE TABLE IF NOT EXISTS agents (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
ALTER TABLE agents ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;


-- 2. MEETING REQUESTS
CREATE TABLE IF NOT EXISTS meeting_requests (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
ALTER TABLE meeting_requests ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE meeting_requests ADD COLUMN IF NOT EXISTS buyer_name TEXT;
ALTER TABLE meeting_requests ADD COLUMN IF NOT EXISTS buyer_email TEXT;
ALTER TABLE meeting_requests ADD COLUMN IF NOT EXISTS buyer_phone TEXT;
ALTER TABLE meeting_requests ADD COLUMN IF NOT EXISTS preferred_date DATE;
ALTER TABLE meeting_requests ADD COLUMN IF NOT EXISTS preferred_time TIME;
ALTER TABLE meeting_requests ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE meeting_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'New';

-- REMOVE BLOCKING CONSTRAINTS
ALTER TABLE meeting_requests DROP CONSTRAINT IF EXISTS meeting_requests_status_check;

-- FIX LEGACY COLUMNS
DO $$
BEGIN
    -- Relax 'client_*'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_requests' AND column_name = 'client_name') THEN
        ALTER TABLE meeting_requests ALTER COLUMN client_name DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_requests' AND column_name = 'client_email') THEN
        ALTER TABLE meeting_requests ALTER COLUMN client_email DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_requests' AND column_name = 'client_phone') THEN
        ALTER TABLE meeting_requests ALTER COLUMN client_phone DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_requests' AND column_name = 'meeting_date') THEN
        ALTER TABLE meeting_requests ALTER COLUMN meeting_date DROP NOT NULL;
    END IF;
END $$;


-- 3. SITE VISIT REQUESTS
CREATE TABLE IF NOT EXISTS site_visit_requests (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
ALTER TABLE site_visit_requests ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE site_visit_requests ADD COLUMN IF NOT EXISTS buyer_name TEXT;
ALTER TABLE site_visit_requests ADD COLUMN IF NOT EXISTS buyer_email TEXT;
ALTER TABLE site_visit_requests ADD COLUMN IF NOT EXISTS buyer_phone TEXT;
ALTER TABLE site_visit_requests ADD COLUMN IF NOT EXISTS preferred_date DATE;
ALTER TABLE site_visit_requests ADD COLUMN IF NOT EXISTS preferred_time TIME;
ALTER TABLE site_visit_requests ADD COLUMN IF NOT EXISTS attendees INTEGER DEFAULT 1;
ALTER TABLE site_visit_requests ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE site_visit_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'New';

-- REMOVE BLOCKING CONSTRAINTS (THIS FIXES THE LATEST ERROR)
ALTER TABLE site_visit_requests DROP CONSTRAINT IF EXISTS site_visit_requests_status_check;

-- FIX LEGACY COLUMNS
DO $$
BEGIN
    -- Relax 'client_*'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_visit_requests' AND column_name = 'client_name') THEN
        ALTER TABLE site_visit_requests ALTER COLUMN client_name DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_visit_requests' AND column_name = 'client_email') THEN
        ALTER TABLE site_visit_requests ALTER COLUMN client_email DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_visit_requests' AND column_name = 'client_phone') THEN
        ALTER TABLE site_visit_requests ALTER COLUMN client_phone DROP NOT NULL;
    END IF;
    -- Relax 'visit_*'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_visit_requests' AND column_name = 'visit_date') THEN
        ALTER TABLE site_visit_requests ALTER COLUMN visit_date DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_visit_requests' AND column_name = 'visit_time') THEN
        ALTER TABLE site_visit_requests ALTER COLUMN visit_time DROP NOT NULL;
    END IF;
END $$;


-- 4. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS reference_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- 5. POLICIES (Make Public)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public agents are viewable by everyone" ON agents;
CREATE POLICY "Public agents are viewable by everyone" ON agents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Agents are insertable by all" ON agents;
CREATE POLICY "Agents are insertable by all" ON agents FOR INSERT WITH CHECK (true);

ALTER TABLE meeting_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Meeting requests public all" ON meeting_requests;
CREATE POLICY "Meeting requests public all" ON meeting_requests USING (true) WITH CHECK (true);

ALTER TABLE site_visit_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Site visits public all" ON site_visit_requests;
CREATE POLICY "Site visits public all" ON site_visit_requests USING (true) WITH CHECK (true);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notifications public all" ON notifications;
CREATE POLICY "Notifications public all" ON notifications USING (true) WITH CHECK (true);

-- 6. AGENT RELATION
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'agent_id') THEN
        ALTER TABLE properties ADD COLUMN agent_id UUID REFERENCES agents(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 7. MASTER DATA TABLES
-- Cities
CREATE TABLE IF NOT EXISTS cities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Areas
CREATE TABLE IF NOT EXISTS areas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, city_id)
);

-- Property Types
CREATE TABLE IF NOT EXISTS property_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    developer TEXT,
    area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. MASTER DATA POLICIES
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public cities are viewable by everyone" ON cities FOR SELECT USING (true);
CREATE POLICY "Cities are maintainable by all" ON cities USING (true) WITH CHECK (true);

ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public areas are viewable by everyone" ON areas FOR SELECT USING (true);
CREATE POLICY "Areas are maintainable by all" ON areas USING (true) WITH CHECK (true);

ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public property_types are viewable by everyone" ON property_types FOR SELECT USING (true);
CREATE POLICY "Property types are maintainable by all" ON property_types USING (true) WITH CHECK (true);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Projects are maintainable by all" ON projects USING (true) WITH CHECK (true);
