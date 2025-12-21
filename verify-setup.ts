/**
 * Verification Script for OTP System Setup
 * 
 * This script checks:
 * 1. Edge Functions deployment status
 * 2. Environment variables configuration
 * 3. End-to-end flow test
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cihirmtgbwyxhxmcseog.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaGlybXRnYnd5eGh4bWNzZW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NDQ2OTgsImV4cCI6MjA4MDEyMDY5OH0.S3pd-D5cBh7r0v5MQsOr2aFFfrnA7P3MCiEFzkKxtI8';

interface VerificationResult {
  check: string;
  status: '✅ PASS' | '❌ FAIL' | '⚠️  WARNING';
  message: string;
  details?: string;
}

const results: VerificationResult[] = [];

// Check 1: Edge Functions Deployment
async function checkEdgeFunctions() {
  console.log('\n🔍 Checking Edge Functions Deployment...\n');
  
  const functions = ['send-otp', 'verify-otp'];
  
  for (const funcName of functions) {
    try {
      const url = `${SUPABASE_URL}/functions/v1/${funcName}`;
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      
      if (response.ok || response.status === 405) {
        results.push({
          check: `Edge Function: ${funcName}`,
          status: '✅ PASS',
          message: 'Function is accessible',
          details: `Status: ${response.status}`
        });
      } else {
        results.push({
          check: `Edge Function: ${funcName}`,
          status: '❌ FAIL',
          message: 'Function not accessible',
          details: `Status: ${response.status} - ${response.statusText}`
        });
      }
    } catch (error: any) {
      results.push({
        check: `Edge Function: ${funcName}`,
        status: '❌ FAIL',
        message: 'Function check failed',
        details: error.message
      });
    }
  }
}

// Check 2: Environment Variables
async function checkEnvironmentVariables() {
  console.log('\n🔍 Checking Environment Variables...\n');
  
  // Check frontend env vars
  const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
  const hasSupabaseKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  results.push({
    check: 'VITE_SUPABASE_URL',
    status: hasSupabaseUrl ? '✅ PASS' : '⚠️  WARNING',
    message: hasSupabaseUrl ? 'Configured' : 'Using fallback value',
    details: hasSupabaseUrl 
      ? `Value: ${import.meta.env.VITE_SUPABASE_URL?.substring(0, 30)}...`
      : 'Using hardcoded fallback in supabase.ts'
  });
  
  results.push({
    check: 'VITE_SUPABASE_ANON_KEY',
    status: hasSupabaseKey ? '✅ PASS' : '⚠️  WARNING',
    message: hasSupabaseKey ? 'Configured' : 'Using fallback value',
    details: hasSupabaseKey 
      ? 'Key is set'
      : 'Using hardcoded fallback in supabase.ts'
  });
  
  // Note: Backend env vars (RESEND_API_KEY, FROM_EMAIL) can't be checked from frontend
  // They need to be verified in Supabase Dashboard
  results.push({
    check: 'Backend Secrets (RESEND_API_KEY, FROM_EMAIL)',
    status: '⚠️  WARNING',
    message: 'Cannot verify from frontend',
    details: 'Please verify in Supabase Dashboard → Edge Functions → Settings → Secrets'
  });
}

// Check 3: Test Flow (Dry Run)
async function testFlow() {
  console.log('\n🔍 Testing OTP Flow (Dry Run)...\n');
  
  // Test 1: Check if send-otp endpoint accepts requests
  try {
    const testEmail = 'test@example.com';
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email: testEmail, isSignup: true }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success !== undefined) {
      results.push({
        check: 'send-otp endpoint',
        status: '✅ PASS',
        message: 'Endpoint is working',
        details: data.devCode ? `Dev mode: Code returned in response` : 'Email sent (or would be sent)'
      });
    } else {
      results.push({
        check: 'send-otp endpoint',
        status: '❌ FAIL',
        message: 'Endpoint returned error',
        details: data.message || `Status: ${response.status}`
      });
    }
  } catch (error: any) {
    results.push({
      check: 'send-otp endpoint',
      status: '❌ FAIL',
      message: 'Request failed',
      details: error.message
    });
  }
  
  // Test 2: Check database tables exist (via Supabase client)
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Check users table
    const { error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    results.push({
      check: 'users table',
      status: usersError ? '❌ FAIL' : '✅ PASS',
      message: usersError ? 'Table not accessible' : 'Table exists and accessible',
      details: usersError?.message
    });
    
    // Check otp_codes table
    const { error: otpError } = await supabase
      .from('otp_codes')
      .select('id')
      .limit(1);
    
    results.push({
      check: 'otp_codes table',
      status: otpError ? '❌ FAIL' : '✅ PASS',
      message: otpError ? 'Table not accessible' : 'Table exists and accessible',
      details: otpError?.message
    });
    
    // Check user_profiles table
    const { error: profilesError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    results.push({
      check: 'user_profiles table',
      status: profilesError ? '❌ FAIL' : '✅ PASS',
      message: profilesError ? 'Table not accessible' : 'Table exists and accessible',
      details: profilesError?.message
    });
    
  } catch (error: any) {
    results.push({
      check: 'Database tables',
      status: '❌ FAIL',
      message: 'Could not verify tables',
      details: error.message
    });
  }
}

// Run all checks
async function runVerification() {
  console.log('🚀 Starting Verification...\n');
  console.log('='.repeat(50));
  
  await checkEdgeFunctions();
  await checkEnvironmentVariables();
  await testFlow();
  
  // Print results
  console.log('\n📊 Verification Results:\n');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    console.log(`${result.status} ${result.check}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    console.log('');
  });
  
  // Summary
  const passed = results.filter(r => r.status === '✅ PASS').length;
  const failed = results.filter(r => r.status === '❌ FAIL').length;
  const warnings = results.filter(r => r.status === '⚠️  WARNING').length;
  
  console.log('='.repeat(50));
  console.log(`\n📈 Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  console.log('');
  
  if (failed === 0) {
    console.log('🎉 All critical checks passed!');
  } else {
    console.log('⚠️  Some checks failed. Please review the results above.');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('   1. If Edge Functions failed: Deploy them using Supabase CLI');
  console.log('   2. If backend secrets warning: Add RESEND_API_KEY and FROM_EMAIL in Supabase Dashboard');
  console.log('   3. Test the full flow by signing up with a real email');
  console.log('');
}

// Export for use in browser console or as a script
if (typeof window !== 'undefined') {
  (window as any).verifySetup = runVerification;
}

export { runVerification };
