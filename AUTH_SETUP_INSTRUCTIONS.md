# Prime Estate - Authentication System Setup

## Architecture Overview

The authentication system now supports **4 user roles** with proper role-based routing and secure access control:

- **Admin** → Full platform management access (`/admin/dashboard`)
- **Seller** → Property listing management (`/seller/dashboard`)
- **Agent** → Client and property management (`/agent/dashboard`)
- **User (Buyer)** → Browse properties and submit requests (`/` homepage)

---

## 1️⃣ Database Setup

### Step 1: Apply Migrations

Run these migrations in order in **Supabase SQL Editor**:

#### Migration 1: Users Table with Roles
```sql
-- File: migrations/003_add_users_table.sql
-- Creates the users table with role-based access control
-- Copy and paste the entire file content into Supabase SQL Editor
```

#### Migration 2: Add Agent Role
```sql
-- File: migrations/006_add_agent_role.sql
ALTER TABLE public.users 
DROP CONSTRAINT users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'seller', 'admin', 'agent'));

COMMENT ON COLUMN public.users.role IS 'User role: user (buyer), seller (property seller), agent (real estate agent), admin (platform administrator)';
```

#### Migration 3: Admin Role Setup (Optional)
```sql
-- File: migrations/005_set_admin_shahriar.sql
-- Automatically creates admin account after email signup
```

---

## 2️⃣ Creating User Accounts

### Admin Account Creation

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to **Authentication > Users**
2. Click **Add User**
3. Email: `shahriar19645@gmail.com` (or your admin email)
4. Password: `Emon@223071044` (or your secure password)
5. Click **Create User**
6. Run migration `005_set_admin_shahriar.sql` to assign admin role

**Option B: Via API (Requires ADMIN_REGISTRATION_TOKEN)**
```bash
curl -X POST http://localhost:3001/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "name": "Admin Name"
  }'
```

Set `ADMIN_REGISTRATION_TOKEN` in `.env.local` to enable this endpoint.

### Seller Account Creation
1. Go to `/register`
2. Select "Property Seller" as account type
3. Complete registration and confirm email
4. After login, redirects to `/seller/dashboard`

### Agent Account Creation
Creates an agent account manually in database:
```sql
INSERT INTO auth.users (email, password, email_confirmed_at)
VALUES ('agent@example.com', 'hashed_password', NOW());

-- Then get the user ID and create user record
INSERT INTO public.users (user_id, role)
VALUES ('user-id-from-above', 'agent');
```

Or contact an admin to create the account.

### Buyer (User) Account Creation
1. Go to `/register`
2. Select "Property Buyer" as account type
3. Complete registration and confirm email
4. After login, redirects to homepage `/`

---

## 3️⃣ Environment Variables

Add these to `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Registration Protection (optional)
ADMIN_REGISTRATION_TOKEN=your-secure-token-here

# Example: For secure admin account creation via `/api/admin/create-admin`
# Set a strong token and distribute only to authorized admins
```

---

## 4️⃣ Login Flow & Redirects

| Role | Login URL | Redirect After Login |
|------|-----------|----------------------|
| Admin | `/login` | `/admin/dashboard` |
| Seller | `/login` | `/seller/dashboard` |
| Agent | `/login` | `/agent/dashboard` |
| Buyer (User) | `/login` | `/` (homepage) |

**Session Validation:**
- All dashboards are protected by middleware
- Role is fetched from database, not client-side metadata
- Unauthorized access redirects to homepage `/`

---

## 5️⃣ Secure Routes

### Protected Routes by Role

```
/admin/*          → Requires role = "admin"
/seller/*         → Requires role = "seller"  
/agent/*          → Requires role = "agent"
/login            → Public, but redirects authenticated users to their dashboard
/register         → Public, allows "user" and "seller" registration
/properties, /    → Public, accessible to all
```

### Authentication Check
All protected routes use server-side session validation:
1. Middleware intercepts request
2. Fetches session from Supabase SSR client
3. Validates user exists in database
4. Checks role from `public.users` table
5. Grants or denies access

---

## 6️⃣ Session Management

- **Sessions:** Supabase cookie-based authentication
- **Session Refresh:** Automatic via middleware
- **Role Storage:** Database (`public.users` table), not frontend metadata
- **Security:** Server-side validation, no client-side trust

---

## 7️⃣ Testing the System

### Test Admin Login
```
Email: shahriar19645@gmail.com
Password: Emon@223071044
Expected Redirect: /admin/dashboard
```

### Test Seller Login
1. Register new account at `/register`
2. Select "Property Seller"
3. Confirm email
4. Login and verify redirect to `/seller/dashboard`

### Test Agent Login (if account created)
1. Login with agent credentials
2. Should redirect to `/agent/dashboard`

### Test Access Control
1. Login as Admin
2. Visit `/seller/dashboard` in URL bar
3. Should redirect to `/` (unauthorized)

---

## 8️⃣ Troubleshooting

### "Invalid login credentials"
- Ensure user account exists in Supabase `auth.users`
- Check email is confirmed
- Verify password is correct

### Redirect to home instead of dashboard
- User role may not exist in `public.users` table
- Run `005_set_admin_shahriar.sql` or manually insert role
- Check user role with:
  ```sql
  SELECT user_id, role FROM public.users WHERE user_id = 'user-id-here';
  ```

### Can't access /admin dashboard
- Verify role is 'admin' in `public.users`
- Check middleware is running: `npm run dev`
- Clear browser cookies and try again

### API endpoints returning 401/403
- Ensure SUPABASE_SERVICE_ROLE_KEY is set in `.env.local`
- Check user is authenticated before calling protected APIs
- Verify role permissions for the endpoint

---

## 9️⃣ File Structure

```
src/
├── middleware.ts                    # Route protection & role-based redirect
├── lib/supabaseServer.ts           # Server-side Supabase helpers
├── app/
│   ├── login/page.tsx              # Login for all roles
│   ├── register/page.tsx            # Public registration (user/seller)
│   ├── admin/
│   │   ├── register/page.tsx        # Protected admin creation
│   │   ├── dashboard/page.tsx       # Admin dashboard
│   │   └── layout.tsx               # Admin auth guard
│   ├── seller/
│   │   ├── dashboard/page.tsx       # Seller dashboard
│   │   └── layout.tsx               # Seller auth guard
│   ├── agent/
│   │   ├── dashboard/page.tsx       # Agent dashboard
│   │   └── layout.tsx               # Agent auth guard
│   └── api/
│       └── admin/create-admin/route.ts  # Secure admin creation API
migrations/
├── 003_add_users_table.sql         # Users table with roles
├── 005_set_admin_shahriar.sql      # Admin account setup
└── 006_add_agent_role.sql          # Add agent role support
```

---

## 🔟 Security Best Practices

✅ **Implemented:**
- Server-side role validation in middleware
- Role stored in database, not client-side
- Protected API routes with role checks
- Secure admin registration with token-based protection
- Session-based authentication with Supabase SSR

❌ **DO NOT:**
- Store roles in browser storage
- Bypass middleware checks
- Allow public admin registration
- Trust client-supplied user IDs in APIs
- Use unencrypted passwords in database

---

## Next Steps

1. **Run Migrations:** Execute all 3 migration files in Supabase SQL Editor
2. **Set Environment Variables:** Update `.env.local` with Supabase credentials
3. **Create Accounts:** Register test accounts for each role
4. **Test Login Flow:** Verify redirects work for all roles
5. **Deploy:** Push to production with same environment setup
