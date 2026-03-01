/**
 * Authentication utilities using Supabase Auth
 * 
 * This module provides authentication functions for user login, signup,
 * logout, and session management.
 */

import { supabase } from './supabaseClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  fullName?: string;
  phone?: string;
}

/**
 * Sign in a user with email and password
 */
export async function login(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    return { 
      user: null, 
      session: null, 
      error: error instanceof Error ? error.message : 'Login failed' 
    };
  }
}

/**
 * Sign up a new user
 */
export async function signup(data: SignupData) {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return { user: authData.user, error: null };
  } catch (error) {
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Signup failed' 
    };
  }
}

/**
 * Sign out the current user
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }

    return { error: null };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Logout failed' 
    };
  }
}

/**
 * Get the current user session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }

    return { session, error: null };
  } catch (error) {
    return { 
      session: null, 
      error: error instanceof Error ? error.message : 'Failed to get session' 
    };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }

    return { user, error: null };
  } catch (error) {
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Failed to get user' 
    };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { error: null };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Password reset failed' 
    };
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { error: null };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Password update failed' 
    };
  }
}
