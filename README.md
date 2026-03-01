This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## Project Structure

```
prime-estate/
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.js
├── package.json
├── postcss.config.mjs
├── PROJECT_SETUP.md
├── README.md
├── SUPABASE_SCHEMA.sql
├── SUPABASE_SETUP.md
├── tsconfig.json
├── public/
│   └── ...
├── src/
│   ├── middleware.ts
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── access_control/
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── master-data/
│   │   │   │   ├── areas/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── cities/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── projects/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── property-types/
│   │   │   │   │   └── page.tsx
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── add/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── edit/
│   │   │   ├── requests/
│   │   │   │   ├── meeting-requests/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── site-visit-requests/
│   │   │   │       └── page.tsx
│   │   ├── api/
│   │   │   └── contact/
│   │   │       └── route.ts
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── properties/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   ├── components/
│   │   ├── ErrorBoundary.tsx
│   │   ├── ToastContainer.tsx
│   │   ├── admin/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── dashboard/
│   │   │       ├── MeetingOverview.tsx
│   │   │       ├── SiteVisitOverview.tsx
│   │   │       └── StatCard.tsx
│   │   ├── filters/
│   │   │   ├── BedroomBathroomFilter.tsx
│   │   │   ├── FilterTags.tsx
│   │   │   ├── LocationFilter.tsx
│   │   │   ├── PriceRangeFilter.tsx
│   │   │   ├── PropertyFilters.tsx
│   │   │   ├── PropertyTypeFilter.tsx
│   │   │   └── SquareFeetFilter.tsx
│   │   ├── layout/
│   │   │   ├── Footer.tsx
│   │   │   ├── LayoutWrapper.tsx
│   │   │   └── Navbar.tsx
│   │   ├── ui/
│   │   │   ├── FeaturedProperties.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── PropertyDetailsSection.tsx
│   │   │   ├── PropertyImageGallery.tsx
│   │   │   ├── RecentListings.tsx
│   │   │   ├── RecentSales.tsx
│   │   │   ├── SimilarProperties.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── WhyPrimeEstate.tsx
│   ├── contexts/
│   │   └── FilterContext.tsx
│   ├── lib/
│   │   ├── analyticsService.ts
│   │   ├── auth.ts
│   │   ├── dataService.ts
│   │   ├── filterUtils.ts
│   │   ├── mockData.ts
│   │   ├── propertyService.ts
│   │   ├── supabaseClient.js
│   │   ├── types.ts
│   │   ├── validators.ts
│   │   └── hooks/
│   │       ├── usePagination.tsx
│   │       └── useToast.ts
```

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
