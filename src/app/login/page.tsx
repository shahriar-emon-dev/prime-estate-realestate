'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Role type definition
type UserRole = 'admin' | 'seller' | 'agent' | 'user';

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  // Get redirect URL from query params (only used if role-based redirect doesn't apply)
  const redirectParam = searchParams.get('redirect');
  const confirmed = searchParams.get('confirmed');
  const registered = searchParams.get('registered');

  useEffect(() => {
    // Show message if coming from email confirmation
    if (confirmed === 'true') {
      setInfoMessage('Email confirmed! You can now log in.');
    }
    // Show message if just registered
    if (registered === 'true') {
      setInfoMessage('Registration successful! Please check your email to confirm your account.');
    }
  }, [confirmed, registered]);

  /**
   * Handle post-login redirect via server-side API
   * 
   * This is critical:
   * 1. Server fetches actual role from database (source of truth)
   * 2. Ensures user record exists before redirecting
   * 3. Prevents race conditions
   * 4. Bypasses RLS policies correctly
   */
  const handlePostLoginRedirect = async (): Promise<string> => {
    try {
      const response = await fetch('/api/auth/handle-redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.error('Redirect API error:', response.statusText);
        return '/'; // Fallback
      }

      const data = await response.json();
      return data.redirectUrl || '/';
    } catch (error) {
      console.error('Failed to get redirect URL:', error);
      return '/'; // Fallback
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      // Sign in with email/password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        console.error('Login error:', signInError);
        
        // Handle specific error cases
        if (signInError.message.includes('Email not confirmed')) {
          setError('Please confirm your email before logging in. Check your inbox for the confirmation link.');
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (data.user && data.session) {
        setSuccess(true);

        // Step 1: Create user record in database (if not exists)
        // This must complete before we redirect
        const createResponse = await fetch('/api/auth/create-user-record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            role: data.user.user_metadata?.role ?? 'user',
            fullName: data.user.user_metadata?.full_name ?? '',
          }),
        });

        if (!createResponse.ok) {
          console.error('Failed to create user record');
        }

        // Step 2: Get server-side redirect URL (based on actual database role)
        const redirectUrl = await handlePostLoginRedirect();

        // Step 3: Redirect to appropriate dashboard/homepage
        // Use setTimeout to ensure session cookie is set
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 300);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login catch error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });

      if (error) {
        setError(error.message);
      } else {
        setInfoMessage('Confirmation email sent! Please check your inbox.');
      }
    } catch (err) {
      setError('Failed to resend confirmation email.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Signing in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <span className="text-3xl">🏠</span>
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Sign in to Prime Estate
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/register"
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {/* Info Message */}
          {infoMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {infoMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              <p>{error}</p>
              {error.includes('confirm your email') && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="mt-2 text-sm font-medium text-red-700 underline hover:no-underline"
                >
                  Resend confirmation email
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              disabled={loading || !email.trim() || !password}
            >
              Sign In
            </Button>
          </form>

          {/* Role info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-gray-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-gray-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}