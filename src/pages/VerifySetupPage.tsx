import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CheckResult {
  name: string;
  status: 'checking' | 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export function VerifySetupPage() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [checking, setChecking] = useState(false);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cihirmtgbwyxhxmcseog.supabase.co';
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaGlybXRnYnd5eGh4bWNzZW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NDQ2OTgsImV4cCI6MjA4MDEyMDY5OH0.S3pd-D5cBh7r0v5MQsOr2aFFfrnA7P3MCiEFzkKxtI8';

  const addResult = (name: string, status: CheckResult['status'], message: string, details?: string) => {
    setResults(prev => [...prev, { name, status, message, details }]);
  };

  const runChecks = async () => {
    setChecking(true);
    setResults([]);

    // Check 1: Edge Functions
    addResult('Edge Function: send-otp', 'checking', 'Checking...');
    try {
      const sendOtpResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
        method: 'OPTIONS',
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      });
      const sendOtpOk = sendOtpResponse.ok || sendOtpResponse.status === 405;
      setResults(prev => prev.map(r => 
        r.name === 'Edge Function: send-otp' 
          ? { ...r, status: sendOtpOk ? 'pass' : 'fail', message: sendOtpOk ? '✅ Accessible' : '❌ Not accessible', details: `Status: ${sendOtpResponse.status}` }
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.name === 'Edge Function: send-otp' 
          ? { ...r, status: 'fail', message: '❌ Error', details: error.message }
          : r
      ));
    }

    addResult('Edge Function: verify-otp', 'checking', 'Checking...');
    try {
      const verifyOtpResponse = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
        method: 'OPTIONS',
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      });
      const verifyOtpOk = verifyOtpResponse.ok || verifyOtpResponse.status === 405;
      setResults(prev => prev.map(r => 
        r.name === 'Edge Function: verify-otp' 
          ? { ...r, status: verifyOtpOk ? 'pass' : 'fail', message: verifyOtpOk ? '✅ Accessible' : '❌ Not accessible', details: `Status: ${verifyOtpResponse.status}` }
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.name === 'Edge Function: verify-otp' 
          ? { ...r, status: 'fail', message: '❌ Error', details: error.message }
          : r
      ));
    }

    // Check 2: Environment Variables
    addResult('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL ? 'pass' : 'warning', 
      import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '⚠️ Using fallback', 
      import.meta.env.VITE_SUPABASE_URL ? 'Environment variable is set' : 'Using hardcoded value in supabase.ts');
    
    addResult('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'pass' : 'warning',
      import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '⚠️ Using fallback',
      import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Environment variable is set' : 'Using hardcoded value in supabase.ts');

    addResult('Backend Secrets (RESEND_API_KEY, FROM_EMAIL)', 'warning',
      '⚠️ Cannot verify from frontend',
      'Please check in Supabase Dashboard → Edge Functions → Settings → Secrets');

    // Check 3: Database Tables
    addResult('users table', 'checking', 'Checking...');
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      setResults(prev => prev.map(r => 
        r.name === 'users table' 
          ? { ...r, status: error ? 'fail' : 'pass', message: error ? '❌ Not accessible' : '✅ Accessible', details: error?.message }
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.name === 'users table' 
          ? { ...r, status: 'fail', message: '❌ Error', details: error.message }
          : r
      ));
    }

    addResult('otp_codes table', 'checking', 'Checking...');
    try {
      const { error } = await supabase.from('otp_codes').select('id').limit(1);
      setResults(prev => prev.map(r => 
        r.name === 'otp_codes table' 
          ? { ...r, status: error ? 'fail' : 'pass', message: error ? '❌ Not accessible' : '✅ Accessible', details: error?.message }
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.name === 'otp_codes table' 
          ? { ...r, status: 'fail', message: '❌ Error', details: error.message }
          : r
      ));
    }

    // Note: user_profiles table was removed (redundant - use 'users' table instead)

    // Test send-otp endpoint
    addResult('send-otp endpoint test', 'checking', 'Testing...');
    try {
      const testResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email: 'test@example.com', isSignup: true }),
      });
      const testData = await testResponse.json();
      setResults(prev => prev.map(r => 
        r.name === 'send-otp endpoint test' 
          ? { 
              ...r, 
              status: testResponse.ok && testData.success !== undefined ? 'pass' : 'fail',
              message: testResponse.ok && testData.success !== undefined ? '✅ Working' : '❌ Error',
              details: testData.message || `Status: ${testResponse.status}`
            }
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.name === 'send-otp endpoint test' 
          ? { ...r, status: 'fail', message: '❌ Request failed', details: error.message }
          : r
      ));
    }

    setChecking(false);
  };

  const getStatusColor = (status: CheckResult['status']) => {
    switch (status) {
      case 'pass': return 'text-green-400';
      case 'fail': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'checking': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      case 'checking': return '⏳';
      default: return '○';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Setup Verification</h1>
        <p className="text-gray-400 mb-8">
          This page verifies your OTP system setup: Edge Functions, Environment Variables, and Database Tables.
        </p>

        <button
          onClick={runChecks}
          disabled={checking}
          className="mb-8 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? 'Running Checks...' : 'Run Verification'}
        </button>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-800 bg-gray-900"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{getStatusIcon(result.status)}</span>
                  <h3 className="font-semibold">{result.name}</h3>
                  <span className={getStatusColor(result.status)}>{result.message}</span>
                </div>
                {result.details && (
                  <p className="text-sm text-gray-400 ml-8">{result.details}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && !checking && (
          <div className="mt-8 p-6 rounded-lg border border-gray-800 bg-gray-900">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <p>✅ Passed: {results.filter(r => r.status === 'pass').length}</p>
              <p>❌ Failed: {results.filter(r => r.status === 'fail').length}</p>
              <p>⚠️ Warnings: {results.filter(r => r.status === 'warning').length}</p>
            </div>
            {results.filter(r => r.status === 'fail').length === 0 && (
              <p className="mt-4 text-green-400">🎉 All critical checks passed!</p>
            )}
          </div>
        )}

        <div className="mt-8 p-6 rounded-lg border border-gray-800 bg-gray-900">
          <h2 className="text-xl font-semibold mb-4">Manual Verification Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
            <li>Check Supabase Dashboard → Edge Functions → verify both functions are deployed</li>
            <li>Check Supabase Dashboard → Edge Functions → Settings → Secrets → verify RESEND_API_KEY and FROM_EMAIL are set</li>
            <li>Test signup flow with a real email address</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
