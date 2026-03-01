// src/app/admin/register/page.tsx
// Secure admin registration route
// Protected by ADMIN_REGISTRATION_TOKEN environment variable

import { redirect } from 'next/navigation';
import Link from 'next/link';

type SearchParams = Promise<{ token?: string }>;

export default async function AdminRegisterPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const adminToken = searchParams?.token;
  const validToken = process.env.ADMIN_REGISTRATION_TOKEN;

  // Verify admin registration token - must match environment variable
  if (!validToken || adminToken !== validToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Invalid or missing admin registration token. Contact your administrator.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Token is valid, show the form
  return (
    <AdminRegisterForm />
  );
}

function AdminRegisterForm() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Create Admin Account
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Register a new administrator account.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> This account will have full platform access. Use strong credentials.
            </p>
          </div>

          <form className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="admin@example.com"
                className="mt-1 block w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="mt-1 block w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">At least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="mt-1 block w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Admin Account
            </button>

            <p className="text-center text-sm text-gray-600">
              This feature is server-side only. Use Supabase Dashboard or API instead.
            </p>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              <strong>Note:</strong> Admin accounts must be created via Supabase Dashboard or this secure endpoint with a valid token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
