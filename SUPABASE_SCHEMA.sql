-- =====================================================
-- PRIME ESTATE - UPGRADED SUPABASE DATABASE SCHEMA
-- =====================================================
-- Project: Prime Estate Real Estate Platform
-- Supabase URL: https://locbexietiofpdstyljx.supabase.co
-- Created: January 2026
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. AGENTS TABLE
-- =====================================================
-- Stores real estate agent information
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    profile_image TEXT DEFAULT 'https://via.placeholder.com/150',
    bio TEXT,
    license_number TEXT UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for agents
CREATE INDEX IF NOT EXISTS idx_agents_email ON public.agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON public.agents(is_active);

-- =====================================================
-- 2. CITIES TABLE (Master Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    state TEXT,
    country TEXT DEFAULT 'India',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for cities
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_is_active ON public.cities(is_active);

-- =====================================================
-- 3. AREAS TABLE (Master Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
    pincode TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, city_id)
);

-- Indexes for areas
CREATE INDEX IF NOT EXISTS idx_areas_city_id ON public.areas(city_id);
CREATE INDEX IF NOT EXISTS idx_areas_name ON public.areas(name);
CREATE INDEX IF NOT EXISTS idx_areas_is_active ON public.areas(is_active);

-- =====================================================
-- 4. PROPERTY TYPES TABLE (Master Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.property_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for property types
CREATE INDEX IF NOT EXISTS idx_property_types_name ON public.property_types(name);

-- =====================================================
-- 5. PROJECTS TABLE (Master Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    developer TEXT NOT NULL,
    area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
    description TEXT,
    completion_year INTEGER,
    total_units INTEGER,
    amenities TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_area_id ON public.projects(area_id);
CREATE INDEX IF NOT EXISTS idx_projects_developer ON public.projects(developer);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON public.projects(is_active);

-- =====================================================
-- 6. PROPERTIES TABLE (Main Entity)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    price_numeric NUMERIC(15, 2) GENERATED ALWAYS AS (price) STORED,
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER NOT NULL DEFAULT 1,
    square_feet INTEGER NOT NULL,
    property_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Pending', 'Sold')),
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    features TEXT[] DEFAULT '{}',
    furnishing TEXT CHECK (furnishing IN ('Furnished', 'Semi-Furnished', 'Unfurnished')),
    parking_spaces INTEGER DEFAULT 0,
    floor_number INTEGER,
    total_floors INTEGER,
    facing TEXT,
    age_years INTEGER,
    
    -- Location details
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    
    -- Additional metadata
    views_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    available_from DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for properties
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON public.properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON public.properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON public.properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_properties_search ON public.properties 
    USING GIN(to_tsvector('english', title || ' ' || description));

-- =====================================================
-- 7. PROPERTY IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for property images
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_display_order ON public.property_images(display_order);
CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON public.property_images(is_primary);

-- =====================================================
-- 8. MEETING REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.meeting_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for meeting requests
CREATE INDEX IF NOT EXISTS idx_meeting_requests_property_id ON public.meeting_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_meeting_requests_status ON public.meeting_requests(status);
CREATE INDEX IF NOT EXISTS idx_meeting_requests_preferred_date ON public.meeting_requests(preferred_date);

-- =====================================================
-- 9. SITE VISIT REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.site_visit_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    number_of_people INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Scheduled', 'Completed', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for site visit requests
CREATE INDEX IF NOT EXISTS idx_site_visit_requests_property_id ON public.site_visit_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_site_visit_requests_status ON public.site_visit_requests(status);
CREATE INDEX IF NOT EXISTS idx_site_visit_requests_visit_date ON public.site_visit_requests(visit_date);

-- =====================================================
-- 10. FAVORITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Indexes for favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON public.favorites(property_id);

-- =====================================================
-- 11. PROPERTY VIEWS TABLE (Analytics)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.property_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for property views
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON public.property_views(viewed_at DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all relevant tables
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON public.areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_requests_updated_at BEFORE UPDATE ON public.meeting_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_visit_requests_updated_at BEFORE UPDATE ON public.site_visit_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Public read access for properties
CREATE POLICY "Properties are viewable by everyone" 
    ON public.properties FOR SELECT 
    USING (true);

-- Public read access for property images
CREATE POLICY "Property images are viewable by everyone" 
    ON public.property_images FOR SELECT 
    USING (true);

-- Public read access for agents
CREATE POLICY "Agents are viewable by everyone" 
    ON public.agents FOR SELECT 
    USING (is_active = true);

-- Authenticated users can create meeting requests
CREATE POLICY "Anyone can create meeting requests" 
    ON public.meeting_requests FOR INSERT 
    WITH CHECK (true);

-- Authenticated users can create site visit requests
CREATE POLICY "Anyone can create site visit requests" 
    ON public.site_visit_requests FOR INSERT 
    WITH CHECK (true);

-- Users can manage their own favorites
CREATE POLICY "Users can manage their favorites" 
    ON public.favorites FOR ALL 
    USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample cities
INSERT INTO public.cities (name, state, country) VALUES
    ('Mumbai', 'Maharashtra', 'India'),
    ('Bangalore', 'Karnataka', 'India'),
    ('Delhi', 'Delhi', 'India'),
    ('Pune', 'Maharashtra', 'India'),
    ('Hyderabad', 'Telangana', 'India')
ON CONFLICT (name) DO NOTHING;

-- Insert sample property types
INSERT INTO public.property_types (name, description) VALUES
    ('Apartment', 'Multi-story residential building with multiple units'),
    ('Villa', 'Standalone luxury home with garden'),
    ('Studio', 'Single room apartment with kitchen'),
    ('Penthouse', 'Luxury apartment on top floor'),
    ('Duplex', 'Two-story apartment'),
    ('Row House', 'Attached houses in a row')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get properties with agent details:
-- SELECT p.*, a.name as agent_name, a.phone as agent_phone, a.email as agent_email
-- FROM properties p
-- LEFT JOIN agents a ON p.agent_id = a.id
-- WHERE p.status = 'Available'
-- ORDER BY p.created_at DESC;

-- Get property with all images:
-- SELECT p.*, 
--        json_agg(json_build_object('url', pi.image_url, 'order', pi.display_order, 'is_primary', pi.is_primary)) as images
-- FROM properties p
-- LEFT JOIN property_images pi ON p.id = pi.property_id
-- WHERE p.id = 'property-uuid-here'
-- GROUP BY p.id;

-- Search properties by text:
-- SELECT * FROM properties
-- WHERE to_tsvector('english', title || ' ' || description) @@ to_tsquery('english', 'luxury & apartment');

-- Get property analytics:
-- SELECT p.title, p.views_count, 
--        COUNT(DISTINCT f.id) as favorites_count,
--        COUNT(DISTINCT mr.id) as meeting_requests_count
-- FROM properties p
-- LEFT JOIN favorites f ON p.id = f.property_id
-- LEFT JOIN meeting_requests mr ON p.id = mr.property_id
-- GROUP BY p.id;
