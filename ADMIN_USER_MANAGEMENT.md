# Admin User Management System

## Overview

Complete admin-only user creation and management system for Prime Estate. Admins can create sellers, agents, and manage all users in the system.

## New Files Created

### 1. **Admin Users Page** - `/admin/users`
- **File**: [src/app/admin/users/page.tsx](src/app/admin/users/page.tsx)
- **Purpose**: Central dashboard for viewing and managing all users
- **Features**:
  - ✅ List all users with role badges
  - ✅ Search by name or email
  - ✅ Filter by role (Admin, Seller, Agent, Buyer)
  - ✅ View creation dates
  - ✅ Delete users (with confirmation)
  - ✅ Link to create new user form

### 2. **Create User Form** - `/admin/users/create`
- **File**: [src/app/admin/users/create/page.tsx](src/app/admin/users/create/page.tsx)
- **Purpose**: Admin-only form to create new sellers and agents
- **Features**:
  - ✅ Full name input
  - ✅ Email address input
  - ✅ Password input with validation
  - ✅ Role selector (Seller or Agent only)
  - ✅ Success confirmation with auto-redirect to users list
  - ✅ Error handling with user-friendly messages

### 3. **Create User API** - `/api/admin/create-user`
- **File**: [src/app/api/admin/create-user/route.ts](src/app/api/admin/create-user/route.ts)
- **Endpoint**: `POST /api/admin/create-user`
- **Access Control**: Admin only (verified before operation)
- **Request Body**:
  ```json
  {
    "name": "John Seller",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "role": "seller" | "agent"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "userId": "uuid",
    "email": "john@example.com",
    "role": "seller"
  }
  ```
- **Security**:
  - Verifies user is authenticated
  - Checks user has admin role in database
  - Creates auth user with Supabase Admin API
  - Auto-confirms email (admin-created accounts)
  - Creates corresponding user database record
  - Cleans up auth user if database insert fails

### 4. **Users List API** - `/api/admin/users` (GET)
- **File**: [src/app/api/admin/users/route.ts](src/app/api/admin/users/route.ts)
- **Endpoint**: `GET /api/admin/users`
- **Access Control**: Admin only
- **Response**:
  ```json
  {
    "users": [
      {
        "user_id": "uuid",
        "email": "seller@example.com",
        "full_name": "John Seller",
        "role": "seller",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
  ```

### 5. **Delete User API** - `/api/admin/users/[userId]` (DELETE)
- **File**: [src/app/api/admin/users/[userId]/route.ts](src/app/api/admin/users/[userId]/route.ts)
- **Endpoint**: `DELETE /api/admin/users/[userId]`
- **Access Control**: Admin only
- **Security**:
  - Verifies user is authenticated
  - Checks user has admin role
  - Prevents self-deletion
  - Deletes both auth user and database record
  - Returns error if user doesn't exist

## Updated Files

### 1. **Admin Sidebar** - Added Users Menu
- **File**: [src/components/admin/Sidebar.tsx](src/components/admin/Sidebar.tsx)
- **Added**:
  ```typescript
  {
    label: 'Users',
    icon: '👥',
    submenu: [
      { label: 'All Users', href: '/admin/users' },
      { label: 'Create User', href: '/admin/users/create' },
    ],
  }
  ```
- **Position**: Right after Dashboard, before Properties

### 2. **Public Registration Page** - Simplified
- **File**: [src/app/register/page.tsx](src/app/register/page.tsx)
- **Changed**:
  - Removed complex role selection form
  - Removed seller-specific fields
  - Now collects: Name, Email, Password (4 fields total)
  - Default role: `'user'` (regular buyer)
  - Simplified success message

## Architecture

### User Creation Flow

```
┌─ PUBLIC REGISTRATION (register/page.tsx)
│  └─ Creates: Users with role='user' (buyers)
│     └─ Requires: Email confirmation
│     └─ Automatic: No admin required
│
├─ ADMIN USER CREATION (admin/users/create/page.tsx)
│  ├─ Creates: Sellers, Agents
│  ├─ Endpoint: POST /api/admin/create-user
│  ├─ Auth: Admin-only (middleware + API check)
│  ├─ Features:
│  │  ├─ Email auto-confirmed
│  │  ├─ Password set by admin
│  │  ├─ Role selection (seller/agent)
│  │  └─ Creates both Auth + DB record atomically
│  │
│  └─ Response:
│     └─ Redirect to /admin/users (user list)
│
└─ ADMIN USER MANAGEMENT (admin/users/page.tsx)
   ├─ List all users
   ├─ Search/filter by role
   ├─ Delete users
   └─ Create new users (link to create form)
```

### Security Model

**Multi-Layer Access Control:**

1. **Middleware Check** (`src/middleware.ts`)
   - Blocks unauthenticated access to `/admin/*`
   - Verifies auth before route execution

2. **API Authentication** (Route Handlers)
   - `requireAuthenticatedUser()` - Verifies session
   - Database role check - Admin status verified in DB
   - Only after both checks pass do operations proceed

3. **Database Validation**
   - RLS policies protect users table
   - Only authenticated users can read/modify own records
   - Admin users can see all records

4. **Operational Safety**
   - User records created atomically (Auth + DB sync)
   - Self-deletion prevented
   - Confirmation prompts for destructive operations
   - Detailed error logging for auditing

## Usage Guide

### For Admins

#### Create a New Seller Account

1. Navigate to **Admin Panel** → **Users** → **Create User**
2. Fill in the form:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Password: `SecurePassword123` (at least 8 chars)
   - Role: Select **Seller**
3. Click **Create User**
4. Success! User is immediately available on the users list
5. Email is auto-confirmed (no email verification needed)

#### Create a New Agent Account

Same as Seller, but select **Agent** as the role.

#### View All Users

1. Navigate to **Admin Panel** → **Users** → **All Users**
2. See complete list with:
   - Full name, email, role, creation date
   - Color-coded role badges (Admin=Purple, Seller=Blue, Agent=Green, Buyer=Gray)

#### Search for a User

1. In Users list, use the search box
2. Type name or email
3. Results filter in real-time

#### Filter by Role

1. In Users list, use the role dropdown
2. Select: All Roles, Admin, Seller, Agent, Buyer
3. List updates to show only selected role

#### Delete a User

1. Find user in list
2. Click **Delete** button
3. Confirm in popup dialog
4. User is removed from both Auth and Database

### For Users (Self-Service Registration)

1. Navigate to [/register](/register)
2. Fill in simple form:
   - Full Name
   - Email
   - Password (8+ characters)
   - Confirm Password
3. Click **Register**
4. Email confirmation sent
5. Click link in email to confirm
6. Redirected to login page
7. Log in with credentials
8. Redirected to homepage (buyer dashboard coming soon)

## Role Permissions Summary

| Action | User | Seller | Agent | Admin |
|--------|------|--------|-------|-------|
| Register (self) | ✅ | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ | ✅ |
| Create listings | ❌ | ✅ | ✅ | ✅ |
| View all users | ❌ | ❌ | ❌ | ✅ |
| Create user accounts | ❌ | ❌ | ❌ | ✅ |
| Delete user accounts | ❌ | ❌ | ❌ | ✅ |
| Manage properties | ❌ | ✅ | ✅ | ✅ |
| Access admin dashboard | ❌ | ❌ | ❌ | ✅ |

## Database Schema

### Users Table

```sql
CREATE TABLE public.users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'seller', 'agent', 'admin')),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Role Values

- `'user'` - Regular buyer/customer
- `'seller'` - Property seller account
- `'agent'` - Real estate agent
- `'admin'` - System administrator

## Error Handling

### Common Errors

**"Email already registered"**
- Solution: Use a different email or ask user to login if they already have account

**"Password too short"**
- Fix: Password must be at least 8 characters

**"Invalid email format"**
- Fix: Use valid email like `user@example.com`

**"Admin access required"**
- Fix: Only admins can access user management
- Check: User has 'admin' role in database

**"Failed to create auth account"**
- Possible causes: Email already exists, network error
- Solution: Check email availability, retry

## Testing Checklist

- [ ] Create seller account via admin panel
- [ ] Create agent account via admin panel
- [ ] Verify user appears in "All Users" list
- [ ] Search for user by name
- [ ] Search for user by email
- [ ] Filter users by role (seller, agent, buyer)
- [ ] Delete user and verify removal
- [ ] Public registration creates 'user' role
- [ ] Email confirmation works for public users
- [ ] Non-admin cannot access `/admin/users`
- [ ] Admin cannot delete own account
- [ ] Admin can see all users across roles
- [ ] Seller can log in and redirect to seller dashboard
- [ ] Agent can log in and redirect to agent dashboard
- [ ] Buyer can log in and redirect to homepage

## Upcoming Features

- [ ] Bulk user import (.csv)
- [ ] User profile editing by admin
- [ ] Role change/upgrade capability
- [ ] Email notifications when accounts created
- [ ] Seller profile completion wizard
- [ ] Agent license verification
- [ ] Account activity logging
- [ ] Account status (active/suspended)
- [ ] Two-factor authentication option

## Troubleshooting

### Issue: `GET /api/admin/users` returns 401

**Cause**: User is not authenticated
- **Solution**: Log out and log in again, clear cookies

### Issue: API returns 403 "Admin access required"

**Cause**: User doesn't have admin role in database
- **Solution**: 
  1. Contact system administrator
  2. Verify user role in `public.users` table
  3. Update role to 'admin' if needed

### Issue: User created but can't login

**Cause**: Email not confirmed (for public registrations)
- **Solution**: Click confirmation link in email

### Issue: Cannot create user - "Failed to create auth account"

**Cause**: Email already exists in system
- **Solution**: Use different email or delete existing account first

### Issue: Forms not responding

**Cause**: JavaScript disabled or cache issue
- **Solution**: 
  1. Enable JavaScript
  2. Clear browser cache
  3. Try incognito/private mode
  4. Check browser console for errors

## API Examples

### Create User via cURL

```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "name": "Jane Seller",
    "email": "jane@example.com",
    "password": "SecurePass123",
    "role": "seller"
  }'
```

### Get All Users via cURL

```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

### Delete User via cURL

```bash
curl -X DELETE http://localhost:3000/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Support

For issues or questions:
1. Check error messages in browser console
2. Review server logs for detailed errors
3. Verify user role in database
4. Check middleware.ts for access control logic
5. Verify RLS policies in Supabase
