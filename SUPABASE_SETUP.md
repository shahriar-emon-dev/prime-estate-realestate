# Supabase Setup Guide for Prime Estate

## Project Information
- **Supabase URL**: https://locbexietiofpdstyljx.supabase.co
- **Publishable Key**: `sb_publishable_U4D2oI_zeYWpv8Ft6jKsXw_z80aL4aS`

## Quick Setup Steps

### 1. Database Schema Setup

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/locbexietiofpdstyljx
2. Navigate to **SQL Editor** in the left sidebar
3. Copy the entire contents of `SUPABASE_SCHEMA.sql`
4. Paste into the SQL Editor and click **Run**
5. Wait for all tables, indexes, and triggers to be created

### 2. Environment Variables

The credentials are already configured in:
- `.env.local` (created automatically)
- `src/lib/supabaseClient.js` (with fallback values)

### 3. Switch from Mock Data to Real Database

Update `.env.local`:
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Then restart your development server:
```bash
npm run dev
```

## Database Schema Overview

### Core Tables
1. **agents** - Real estate agent profiles
2. **properties** - Property listings (main entity)
3. **property_images** - Multiple images per property
4. **meeting_requests** - Client meeting bookings
5. **site_visit_requests** - Property site visit bookings

### Master Data Tables
6. **cities** - City master data
7. **areas** - Area/neighborhood master data
8. **property_types** - Property type classifications
9. **projects** - Real estate projects/buildings

### Additional Tables
10. **favorites** - User favorite properties
11. **property_views** - Property view analytics

## Features Included

### ✅ Database Features
- **UUID Primary Keys** for all tables
- **Foreign Key Relationships** with CASCADE options
- **Indexes** on frequently queried columns
- **Full-Text Search** on property title and description
- **Automatic Timestamps** with triggers for updated_at
- **Row Level Security (RLS)** policies
- **Check Constraints** for data validation

### ✅ Advanced Features
- Location tracking (latitude/longitude)
- Property view counting
- Featured properties flag
- Furnishing status
- Parking spaces tracking
- Floor details
- Age of property
- Amenities arrays

## Sample Queries

### Get All Available Properties with Agent Info
```sql
SELECT 
    p.*,
    json_build_object(
        'id', a.id,
        'name', a.name,
        'email', a.email,
        'phone', a.phone,
        'profile_image', a.profile_image
    ) as agent
FROM properties p
LEFT JOIN agents a ON p.agent_id = a.id
WHERE p.status = 'Available'
ORDER BY p.created_at DESC;
```

### Get Property with All Images
```sql
SELECT 
    p.*,
    json_agg(
        json_build_object(
            'url', pi.image_url,
            'display_order', pi.display_order,
            'is_primary', pi.is_primary
        ) ORDER BY pi.display_order
    ) as images
FROM properties p
LEFT JOIN property_images pi ON p.id = pi.property_id
WHERE p.id = 'your-property-uuid'
GROUP BY p.id;
```

### Search Properties by Text
```sql
SELECT * 
FROM properties
WHERE to_tsvector('english', title || ' ' || description) 
      @@ to_tsquery('english', 'luxury & apartment')
ORDER BY views_count DESC;
```

### Filter Properties
```sql
SELECT p.*, a.name as agent_name
FROM properties p
LEFT JOIN agents a ON p.agent_id = a.id
WHERE 
    p.city = 'Mumbai'
    AND p.bedrooms >= 2
    AND p.price BETWEEN 2000000 AND 5000000
    AND p.status = 'Available'
ORDER BY p.price ASC;
```

## Using with dataService.ts

The `dataService.ts` file automatically switches between mock data and real Supabase data based on `NEXT_PUBLIC_USE_MOCK_DATA` environment variable.

### Example Usage in Components

```typescript
import { getAllProperties } from '@/lib/dataService';

// This will automatically use Supabase when USE_MOCK_DATA=false
const { data: properties, error } = await getAllProperties();

if (error) {
  console.error('Error fetching properties:', error);
} else {
  console.log('Properties:', properties);
}
```

## Next Steps

1. ✅ Run the SQL schema (SUPABASE_SCHEMA.sql)
2. ✅ Verify tables created in Supabase Dashboard → Table Editor
3. ✅ Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local`
4. ✅ Restart dev server
5. ✅ Test property listing page
6. 🔄 Add real data through admin panel
7. 🔄 Test all CRUD operations
8. 🔄 Set up authentication (optional)

## Troubleshooting

### Issue: "relation does not exist"
**Solution**: Make sure you ran the entire `SUPABASE_SCHEMA.sql` file in SQL Editor.

### Issue: "permission denied"
**Solution**: Check RLS policies are correctly set up. For development, you can temporarily disable RLS:
```sql
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
```

### Issue: Data not showing
**Solution**: 
1. Check `.env.local` has correct credentials
2. Verify `NEXT_PUBLIC_USE_MOCK_DATA=false`
3. Check browser console for errors
4. Verify data exists in Supabase Table Editor

### Issue: Images not loading
**Solution**: 
1. Upload images to Supabase Storage
2. Make bucket public
3. Use correct storage URL format:
   ```
   https://locbexietiofpdstyljx.supabase.co/storage/v1/object/public/properties/image.jpg
   ```

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use RLS policies** for production data
3. **Validate user input** before database operations
4. **Use prepared statements** (Supabase handles this)
5. **Limit API key exposure** (use environment variables)

## Support

For Supabase documentation: https://supabase.com/docs
For project issues: Check the DEVELOPMENT.md file
