# 🏠 Prime Estate - Real Estate Platform

A modern, full-stack real estate platform built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

### 🌐 Public Features
- **Property Listings** - Browse properties with advanced filtering
- **Advanced Search** - Filter by price, location, size, type, bedrooms/bathrooms
- **Property Details** - High-quality images, detailed information, agent contact
- **Similar Properties** - AI-powered property recommendations
- **Responsive Design** - Works seamlessly on all devices
- **Contact Forms** - Get in touch with agents

### 🔐 Admin Panel
- **Dashboard** - Real-time statistics and analytics
- **Property Management** - Full CRUD operations for properties
- **Master Data** - Manage cities, areas, projects, property types
- **Request Management** - Handle meeting and site visit requests
- **Analytics** - Track views, performance metrics
- **Bulk Operations** - Export data, bulk status updates

### 🚀 Technical Features
- **Dual-Mode Development** - Mock data for offline development
- **Type-Safe** - Full TypeScript implementation
- **Form Validation** - Zod validation schemas
- **Error Handling** - Error boundaries and toast notifications
- **Authentication** - Supabase Auth integration
- **Image Upload** - Supabase Storage integration
- **SEO Optimized** - Meta tags and structured data ready

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4.1.10
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Icons**: React Icons
- **Validation**: Zod (to be installed)
- **State**: React Context API

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn or pnpm
- Supabase account (optional for development)

### 1. Clone & Install
```bash
git clone <repository-url>
cd prime-estate
npm install
```

### 2. Install Additional Dependencies
```bash
npm install zod react-hook-form
```

### 3. Environment Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# For development with mock data (no database required)
NEXT_PUBLIC_USE_MOCK_DATA=true

# For production with real database
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 4. Database Setup (Optional)

If using real Supabase database:

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor
3. Run the schema from `SUPABASE_SCHEMA.sql`
4. Update `.env.local` with your credentials
5. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions.

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Project Structure

```
prime-estate/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (public)/           # Public routes
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── properties/     # Property listings
│   │   │   ├── about/          # About page
│   │   │   └── contact/        # Contact page
│   │   ├── admin/              # Admin panel
│   │   │   ├── dashboard/      # Admin dashboard
│   │   │   ├── properties/     # Property management
│   │   │   ├── master-data/    # Master data management
│   │   │   └── requests/       # Request management
│   │   ├── api/                # API routes
│   │   │   └── contact/        # Contact form endpoint
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── admin/              # Admin components
│   │   ├── filters/            # Filter components
│   │   ├── layout/             # Layout components
│   │   ├── ui/                 # UI components
│   │   ├── ErrorBoundary.tsx   # Error boundary
│   │   └── ToastContainer.tsx  # Toast notifications
│   ├── contexts/
│   │   └── FilterContext.tsx   # Filter state management
│   ├── lib/
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── usePagination.tsx
│   │   │   └── useToast.ts
│   │   ├── analyticsService.ts # Analytics functions
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── dataService.ts      # Data fetching layer
│   │   ├── filterUtils.ts      # Filter utilities
│   │   ├── mockData.ts         # Mock data for development
│   │   ├── propertyService.ts  # Property CRUD operations
│   │   ├── supabaseClient.js   # Supabase client
│   │   ├── types.ts            # TypeScript types
│   │   └── validators.ts       # Zod validation schemas
│   └── middleware.ts           # Auth middleware
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── SUPABASE_SCHEMA.sql         # Database schema
├── SUPABASE_SETUP.md           # Database setup guide
└── README.md                   # This file
```

---

## 🔑 Key Features Implementation

### Authentication
```typescript
import { login, signup, logout } from '@/lib/auth';

// Login
const { user, error } = await login(email, password);

// Signup
const { user, error } = await signup({ email, password, fullName, phone });

// Logout
await logout();
```

### Property CRUD
```typescript
import { createProperty, updateProperty, deleteProperty } from '@/lib/propertyService';

// Create
const { data, error } = await createProperty(propertyData);

// Update
const { data, error } = await updateProperty(id, updates);

// Delete
await deleteProperty(id);
```

### Toast Notifications
```typescript
import { toast } from '@/lib/hooks/useToast';

toast.success('Property created successfully!');
toast.error('Failed to save property');
toast.info('Processing your request...');
toast.warning('Please review the changes');
```

### Form Validation
```typescript
import { propertySchema } from '@/lib/validators';

const result = propertySchema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
  console.log(result.error.issues);
}
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Environment Variables
Set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_USE_MOCK_DATA=false`

---

## 📝 Development Workflow

### Development Mode (Mock Data)
Perfect for UI development without database:
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### Production Mode (Real Database)
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```

---

## 🔮 Future Enhancements

See the complete roadmap in the improvement report. Priority features:

### Phase 1 (Completed ✅)
- [x] Remove hardcoded credentials
- [x] Add environment validation
- [x] Fix TypeScript errors
- [x] Implement authentication structure
- [x] Create API routes
- [x] Add error boundaries
- [x] Toast notifications
- [x] Form validation schemas
- [x] CRUD operations
- [x] Analytics tracking
- [x] Pagination system

### Phase 2 (Next Steps)
- [ ] Complete image upload UI
- [ ] Implement search with maps
- [ ] Add real-time chat
- [ ] Property comparison tool
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] PDF report generation
- [ ] Bulk import/export

### Phase 3 (Future)
- [ ] AI-powered recommendations
- [ ] Voice search
- [ ] Mobile app (React Native)
- [ ] Virtual tours
- [ ] Blockchain property verification
- [ ] Multi-language support

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 👥 Team

- **Developer**: Your Name
- **Institution**: University, 8th Semester
- **Course**: Web Lab

---

## 🆘 Support & Issues

For issues and questions:
1. Check existing issues on GitHub
2. Review documentation
3. Create new issue with detailed description

---

## 🎯 Quick Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
# See SUPABASE_SETUP.md for database commands
```

---

**Built with ❤️ using Next.js and Supabase**
