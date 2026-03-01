// src/app/seller/page.tsx
// Redirect to dashboard
import { redirect } from 'next/navigation';

export default function SellerIndexPage() {
  redirect('/seller/dashboard');
}
