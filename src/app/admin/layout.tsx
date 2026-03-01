import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import AdminShell from '@/components/admin/AdminShell';
import { getUserRoleById } from '@/lib/supabaseServer';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    redirect('/login');
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Strict authentication check
  if (authError || !user) {
    redirect('/login?redirect=/admin/dashboard');
  }

  // Validate user ID format to prevent injection
  if (!user.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
    redirect('/login?redirect=/admin/dashboard');
  }

  // Get role from database (server-authoritative)
  const role = await getUserRoleById(user.id, supabase);

  // Enforce admin-only access
  if (role !== 'admin') {
    redirect('/');
  }

  return (
    <AdminShell>{children}</AdminShell>
  );
}
