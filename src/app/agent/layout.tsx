// src/app/agent/layout.tsx
// Server-side layout for agent dashboard with strict auth guard

import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getUserRoleById } from '@/lib/supabaseServer';
import AdminShell from '@/components/admin/AdminShell';

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  // Create server-side Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Strict authentication check
  if (authError || !user) {
    redirect('/login?redirect=/agent/dashboard');
  }

  // Validate user ID format to prevent injection
  if (!user.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
    redirect('/login?redirect=/agent/dashboard');
  }

  // Fetch user role from database (server-authoritative)
  const role = await getUserRoleById(user.id, supabase);

  // Enforce agent-only access
  if (role !== 'agent') {
    redirect('/');
  }

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
