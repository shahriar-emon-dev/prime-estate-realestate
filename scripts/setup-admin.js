#!/usr/bin/env node

/**
 * Admin Setup Script - Manual Guide
 * 
 * This script guides you through setting up the admin account manually.
 * (Requires the Service Role Key from Supabase dashboard)
 * 
 * Usage: node scripts/setup-admin.js
 */

// Use proper CommonJS imports
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: '.env.local' });

const ADMIN_EMAIL = 'shahriar19645@gmail.com';
const ADMIN_PASSWORD = 'Emon@223071044';
const SUPABASE_PROJECT_ID = 'locbexietiofpdstyljx';

async function setupAdmin() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 PRIME ESTATE - Admin Account Setup');
  console.log('='.repeat(60) + '\n');

  // Get credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  // Check if we have the service role key
  if (!supabaseServiceKey) {
    console.log('ℹ️  MANUAL SETUP REQUIRED\n');
    console.log('Please follow these steps:\n');
    
    console.log('📍 STEP 1: Get Service Role Key');
    console.log(`   Visit: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/api`);
    console.log('   Copy the "Service Role Secret" (the long one, not Anon Key)\n');
    
    console.log('📍 STEP 2: Add to .env.local');
    console.log('   Add this line to your .env.local file:');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here\n');
    
    console.log('📍 STEP 3: Create Admin User');
    console.log('   Option A - Automatic (after adding key):');
    console.log('   $ node scripts/setup-admin.js\n');
    
    console.log('   Option B - Manual via Dashboard:');
    console.log(`   1. Go to: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/auth/users`);
    console.log('   2. Click "Add User"');
    console.log(`   3. Email: ${ADMIN_EMAIL}`);
    console.log(`   4. Password: ${ADMIN_PASSWORD}`);
    console.log('   5. ✅ Check "Auto Confirm User"');
    console.log('   6. Click "Create User"\n');
    
    console.log('📍 STEP 4: Assign Admin Role');
    console.log('   Run SQL migration in Supabase:');
    console.log('   1. Go to SQL Editor');
    console.log('   2. Copy migrations/005_set_admin_shahriar.sql');
    console.log('   3. Paste & click "Run"\n');
    
    console.log('📍 STEP 5: Test Login');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Visit: http://localhost:3000/admin/');
    console.log(`   3. Email: ${ADMIN_EMAIL}`);
    console.log(`   4. Password: ${ADMIN_PASSWORD}\n`);
    
    console.log('='.repeat(60) + '\n');
    process.exit(0);
  }

  // If service key exists, proceed with automatic setup
  console.log('✅ Service Role Key found!\n');
  await automaticSetup(supabaseUrl, supabaseServiceKey, supabaseAnonKey);
}

async function automaticSetup(supabaseUrl, serviceKey, anonKey) {
  try {

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Step 1: Create or update user
    console.log('📧 Setting up admin user...');
    
    const { data: listData, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      process.exit(1);
    }

    let adminUser = listData?.users?.find(
      (u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    );

    if (!adminUser) {
      console.log('   Creating new user...');
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
      });

      if (createError) {
        console.error('❌ Error creating user:', createError.message);
        process.exit(1);
      }

      adminUser = newUser.user;
      console.log(`   ✅ User created: ${adminUser.id}`);
    } else {
      console.log('   User exists, updating password...');
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        adminUser.id,
        { password: ADMIN_PASSWORD }
      );

      if (updateError) {
        console.error('❌ Error updating password:', updateError.message);
        process.exit(1);
      }
      console.log(`   ✅ Password updated`);
    }

    // Step 2: Assign admin role
    console.log('\n👤 Assigning admin role in database...');
    
    const regularClient = createClient(supabaseUrl, anonKey);
    
    const { data: existingRole } = await regularClient
      .from('users')
      .select('*')
      .eq('user_id', adminUser.id)
      .single();

    let roleResult;
    if (existingRole) {
      roleResult = await regularClient
        .from('users')
        .update({ role: 'admin' })
        .eq('user_id', adminUser.id);
    } else {
      roleResult = await regularClient
        .from('users')
        .insert([{ user_id: adminUser.id, role: 'admin' }]);
    }

    if (roleResult.error) {
      console.error('❌ Error setting role:', roleResult.error.message);
      process.exit(1);
    }

    console.log('   ✅ Admin role assigned');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ ADMIN SETUP COMPLETE!\n');
    console.log('📋 Account Details:');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     admin\n`);
    console.log('🌐 Test Login:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Visit: http://localhost:3000/admin/');
    console.log('   3. You should be redirected to login');
    console.log('   4. Enter credentials above');
    console.log('   5. Then redirected to /admin/dashboard\n');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
