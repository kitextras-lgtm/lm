import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        url?: string;
        'mouse-controls'?: string;
      };
    }
  }
}

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailWarning, setEmailWarning] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [fromArtistPage, setFromArtistPage] = useState(false);
  const [fromFreelancerPage, setFromFreelancerPage] = useState(false);
  const [fromBrandPage, setFromBrandPage] = useState(false);
  const [isContinuation, setIsContinuation] = useState(false);
  const [showToS, setShowToS] = useState(false);
  const [showFreelancerToS, setShowFreelancerToS] = useState(false);
  const [showBrandToS, setShowBrandToS] = useState(false);
  const [showArtistToS, setShowArtistToS] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplineLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if user came from artist or freelancer page
  useEffect(() => {
    // Check URL parameter first
    const source = searchParams.get('source');
    
    if (source === 'artist') {
      setFromArtistPage(true);
      localStorage.setItem('signupSource', 'artist');
    } else if (source === 'freelancer') {
      setFromFreelancerPage(true);
      localStorage.setItem('signupSource', 'freelancer');
    } else if (source === 'brand') {
      setFromBrandPage(true);
      localStorage.setItem('signupSource', 'brand');
    } else {
      const signupSource = localStorage.getItem('signupSource');
      const sessionSource = sessionStorage.getItem('signupSource');
      
      if (signupSource === 'artist' || sessionSource === 'artist') {
        setFromArtistPage(true);
      } else if (signupSource === 'freelancer' || sessionSource === 'freelancer') {
        setFromFreelancerPage(true);
      } else if (signupSource === 'brand' || sessionSource === 'brand') {
        setFromBrandPage(true);
      }
    }
  }, [searchParams]);

  // Focus first input when code step is shown
  useEffect(() => {
    if (step === 'code') {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError('');
    if (value) {
      setIsValidEmail(validateEmail(value));
    } else {
      setIsValidEmail(true);
    }
  };

  const handleContinue = async () => {
    if (email && isValidEmail) {
      setLoading(true);
      setError('');

      try {
        const apiUrl = `${SUPABASE_URL}/functions/v1/send-otp`;
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, isSignup: true }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        
        // Check if this is a continuation of an incomplete signup
        if (data.isContinuation) {
          setIsContinuation(true);
        }

        // Check if email was actually sent
        if (!data.emailSent) {
          if (data.emailError) {
            setEmailWarning(`Email service error: ${data.emailError}. Please check your email configuration.`);
          } else {
            setEmailWarning('Email service is not configured. OTP code will be shown below for testing.');
          }
          // Show dev code in development mode
          if (data.devCode && import.meta.env.DEV) {
            setDevCode(data.devCode);
          }
        } else {
          setEmailWarning('');
          setDevCode(null);
        }

        setStep('code');
      } catch (err: any) {
        setError(err.message || 'Failed to send verification code');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '') && index === 5) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Submit on Enter when all digits are filled
    if (e.key === 'Enter' && code.every((digit) => digit !== '') && !loading) {
      verifyCode(code.join(''));
    }
  };

  const verifyCode = async (otp: string) => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = `${SUPABASE_URL}/functions/v1/verify-otp`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otp, isSignup: true }),
      });

      // Check if response is ok
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[ERROR] OTP verification failed - HTTP error:', res.status, errorText);
        let errorMessage = 'Failed to verify OTP';
        try {
          const errorData = JSON.parse(errorText);
          console.error('[ERROR] Parsed error data:', JSON.stringify(errorData, null, 2));
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseErr) {
          console.error('[ERROR] Failed to parse error response:', parseErr);
          errorMessage = errorText || `Server error (${res.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      
      console.log('✅ OTP verification response:', data);

      if (!data.success) {
        console.error('❌ OTP verification failed:', data);
        throw new Error(data.message || 'Invalid verification code');
      }
      
      console.log('✅ OTP verification successful');

      // Store userId and email immediately - this is critical for the next page
      if (data.userId) {
        localStorage.setItem('verifiedEmail', email);
        localStorage.setItem('verifiedUserId', data.userId);
        console.log('✅ Stored verifiedUserId:', data.userId);
        console.log('✅ Stored verifiedEmail:', email);
      } else {
        console.error('❌ Response data (no userId):', data);
        throw new Error(data.message || 'User ID not received from server. Please try again or contact support.');
      }

      // Navigate to profile page - userId is in localStorage
      // No need to call signInWithOtp - user is already created by verify-otp Edge Function
      console.log('✅ Navigating to /make-profile');
      if (fromArtistPage) {
        localStorage.removeItem('signupSource');
        navigate('/make-profile', { state: { userType: 'artist' } });
      } else if (fromFreelancerPage) {
        localStorage.removeItem('signupSource');
        navigate('/make-profile', { state: { userType: 'freelancer' } });
      } else if (fromBrandPage) {
        localStorage.removeItem('signupSource');
        navigate('/make-profile', { state: { userType: 'business' } });
      } else {
        navigate('/make-profile');
      }
    } catch (err: any) {
      console.error('[ERROR] OTP verification error:', err);
      console.error('[ERROR] Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        cause: err.cause
      });
      const errorMessage = err.message || err.toString() || 'Failed to verify OTP. Please try again.';
      setError(errorMessage);
      setCode(['', '', '', '', '', '']);
      // Focus first input after a small delay to ensure state is updated
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = `${SUPABASE_URL}/functions/v1/send-otp`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, isSignup: true }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Check if email was actually sent
      if (!data.emailSent) {
        if (data.emailError) {
          setEmailWarning(`Email service error: ${data.emailError}. Please check your email configuration.`);
        } else {
          setEmailWarning('Email service is not configured. OTP code will be shown below for testing.');
        }
        // Show dev code in development mode
        if (data.devCode && import.meta.env.DEV) {
          setDevCode(data.devCode);
        }
      } else {
        setEmailWarning('');
        setDevCode(null);
      }
    } catch (err: any) {
      setError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
  };

  if (step === 'code') {
    return (
      <div
        className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-8 sm:py-12 px-6"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
        }}
      >
        <button
          onClick={() => navigate(fromArtistPage ? '/learn/artist' : fromFreelancerPage ? '/learn/freelancer' : fromBrandPage ? '/learn/brands' : '/')}
          className="fixed top-6 left-6 z-50 flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-medium">{(fromArtistPage || fromFreelancerPage || fromBrandPage) ? 'Back' : 'Home'}</span>
        </button>

        {!isMobile && (
          <div
            className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ease-out overflow-hidden"
            style={{
              opacity: splineLoaded ? 1 : 0,
              transform: 'translateX(30%) scale(1.035)'
            }}
          >
            <spline-viewer
              url="https://prod.spline.design/hxB6DGH8u6Rcpq21/scene.splinecode"
              mouse-controls="false"
              className="spline-viewer-no-watermark"
            ></spline-viewer>
          </div>
        )}

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              We emailed you a code
            </h2>
            <p className="text-neutral-400 text-sm">
              Enter the verification code sent to
            </p>
            <p className="text-neutral-400 text-sm">
              <span className="text-white break-all">{email}</span>{' '}
              <button
                onClick={() => {
                  setStep('email');
                  setEmailWarning('');
                  setDevCode(null);
                }}
                className="text-white font-medium hover:text-neutral-300 transition-colors"
              >
                ×
              </button>
            </p>
          </div>

          <div
            className="w-full p-6 relative overflow-hidden"
            style={{
              background: 'rgba(10, 10, 15, 0.65)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '16px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
            }}
          >
            <div className="space-y-4 relative z-10">
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-11 text-center text-lg font-semibold focus:outline-none transition-all"
                    style={{
                      color: '#FFFFFF',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                      appearance: 'none'
                    }}
                    onFocus={(e) => { e.target.style.border = '1px solid #ffffff'; }}
                    onBlur={(e) => { e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'; }}
                    disabled={loading}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-xs text-center mt-3">{error}</p>
              )}

              {emailWarning && (
                <div className="mt-3 p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/50">
                  <p className="text-yellow-400 text-xs text-center mb-2">{emailWarning}</p>
                  {devCode && (
                    <div className="mt-2 p-2 rounded bg-black/50 border border-yellow-700/30">
                      <p className="text-yellow-300 text-xs text-center mb-1">Development Code:</p>
                      <p className="text-white text-lg font-mono text-center font-bold tracking-widest">{devCode}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center text-sm leading-snug pt-2">
                <p className="mb-2" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Didn't get anything?</p>
                <p style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                  Check your spam or{' '}
                  <button
                    onClick={handleResendCode}
                    disabled={loading}
                    className="font-medium transition-colors disabled:opacity-50"
                    style={{ color: '#FFFFFF' }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.color = '#C9CBD1')}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.color = '#FFFFFF')}
                  >
                    send a new one
                  </button>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-8 sm:py-12 px-6"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
      }}
    >
      <button
        onClick={() => navigate(fromArtistPage ? '/learn/artist' : fromFreelancerPage ? '/learn/freelancer' : fromBrandPage ? '/learn/brands' : '/')}
        className="fixed top-6 left-6 z-50 flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-xs font-medium">{(fromArtistPage || fromFreelancerPage || fromBrandPage) ? 'Back' : 'Home'}</span>
      </button>
      {!isMobile && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ease-out overflow-hidden"
          style={{
            opacity: splineLoaded ? 1 : 0,
            transform: 'translateX(30%) scale(1.035)'
          }}
        >
          <spline-viewer
            url="https://prod.spline.design/hxB6DGH8u6Rcpq21/scene.splinecode"
            mouse-controls="false"
            className="spline-viewer-no-watermark"
          ></spline-viewer>
        </div>
      )}

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <div className="w-full flex justify-center mb-6">
          <img 
            src="/elevate solid white logo ver.jpeg" 
            alt="Elevate Logo"
            className="h-16 w-auto"
          />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-1">
          {isContinuation ? 'Continue your signup' : 'Sign up for Elevate'}
        </h1>
        <p 
          className="text-base mb-6"
          style={{
            color: 'rgb(204, 204, 204)',
            fontWeight: 400
          }}
        >
          {isContinuation 
            ? "Pick up where you left off. We've saved your progress."
            : (
              <>
                {"Already have an account? "}
                <button
                  onClick={() => navigate('/login')}
                  className="text-white font-medium hover:underline"
                >
                  Log in
                </button>
                .
              </>
            )
          }
        </p>

        <button
          onClick={handleGoogleSignup}
          className="w-full h-11 bg-transparent border border-neutral-700 text-white hover:bg-neutral-800 rounded-lg mb-6 flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </button>

        <div className="w-full flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-neutral-700" />
          <span className="text-neutral-500 text-xs">or</span>
          <div className="flex-1 h-px bg-neutral-700" />
        </div>

        <div className="w-full mb-4">
          <div className="relative">
            <input
              type="email"
              id="signup-email-input"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && email && isValidEmail && !loading) {
                  handleContinue();
                }
              }}
              placeholder=" "
              className="peer h-11 w-full px-4 bg-transparent border border-neutral-700 text-white rounded-lg focus:border-neutral-500 focus:outline-none transition-colors"
            />
            <label
              htmlFor="signup-email-input"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm pointer-events-none transition-all duration-200 peer-focus:top-0 peer-focus:text-xs peer-focus:bg-black peer-focus:px-1 peer-focus:-translate-y-1/2 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:-translate-y-1/2"
            >
              Email address*
            </label>
          </div>
          {!isValidEmail && (
            <p className="text-red-500 text-xs mt-1.5">
              Please enter a valid email address
            </p>
          )}
          {error && (
            <p className="text-red-500 text-xs mt-1.5">{error}</p>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={!email || !isValidEmail || loading}
          className={`w-full h-11 rounded-lg mb-6 transition-all duration-300 ${
            email && isValidEmail
              ? 'text-black hover:opacity-95'
              : 'bg-neutral-800 text-neutral-500 border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neutral-800'
          }`}
          style={email && isValidEmail ? { background: '#E8E8E8' } : {}}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>

        <p className="text-neutral-400 text-xs text-center">
          By signing up, you agree to our{" "}
          <button className="text-white underline hover:no-underline" onClick={() => fromArtistPage ? setShowArtistToS(true) : fromFreelancerPage ? setShowFreelancerToS(true) : fromBrandPage ? setShowBrandToS(true) : setShowToS(true)}>
            Terms
          </button>
          {" "}and{" "}
          <button className="text-white underline hover:no-underline" onClick={() => setShowPrivacyPolicy(true)}>
            Privacy Policy
          </button>
          .
        </p>
      </div>

      {/* General Terms of Service Modal */}
      {showToS && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} onClick={() => setShowToS(false)}>
          <div className="relative w-full max-w-2xl rounded-2xl flex flex-col" style={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.7)', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-base font-semibold text-white">Terms of Service</p>
              <button onClick={() => setShowToS(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:brightness-125" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Effective Date: November 17, 2025</p>
              <p>These Terms of Service govern your access to and use of the websites, applications, platforms, and services operated by Elevate. By accessing or using the Service, you agree to these Terms and our Privacy Policy.</p>
            </div>
            <div className="flex-shrink-0 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setShowToS(false)} className="w-full h-10 rounded-xl text-sm font-semibold transition-all hover:brightness-110" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Artist ToS Modal */}
      {showArtistToS && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} onClick={() => setShowArtistToS(false)}>
          <div className="relative w-full max-w-2xl rounded-2xl flex flex-col" style={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.7)', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-base font-semibold text-white">Elevate Artist Distribution Agreement</p>
              <button onClick={() => setShowArtistToS(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:brightness-125" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Effective Date: November 21, 2025</p>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>This Artist Distribution Agreement ("Agreement") is entered into between <span style={{ color: 'rgba(255,255,255,0.85)' }}>Elevate</span> ("Elevate," "we," "us," or "our"), operating at https://sayelevate.com and <span style={{ color: 'rgba(255,255,255,0.85)' }}>[Artist Name / Legal Entity]</span> ("Artist," "you," or "your"). This Agreement governs the submission and digital distribution of musical compositions, sound recordings, artwork, metadata, and related materials (collectively, the "Works") submitted by you for distribution and related services (the "Services").</p>

              <div>
                <p className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.92)' }}>1. Services</p>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Elevate provides digital music distribution and related services that may include:</p>
                <ul className="space-y-1 mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['Delivery of Works to digital service providers (DSPs)', 'Metadata processing and release management', 'Royalty collection and reporting', 'Optional rights administration services', 'Additional services selected at time of purchase'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Services are those listed on sayelevate.com at the time of purchase or otherwise agreed in writing. Elevate operates solely as a distribution and services provider. Elevate is not the creator, publisher, or record label of the Works.</p>
              </div>

              <div>
                <p className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.92)' }}>2. Grant of Rights</p>
                <p className="font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>2.1 Distribution License</p>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>In exchange for applicable fees and/or revenue participation, you grant Elevate a non-exclusive, worldwide license during the term of this Agreement to:</p>
                <ul className="space-y-1 mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['Reproduce', 'Distribute', 'Digitally transmit', 'Publicly perform', 'Display', 'Promote', 'Make available'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>the Works in all media formats now known or later developed. You also grant Elevate the right to use:</p>
                <ul className="space-y-1 mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['Your artist name', 'Likeness', 'Biographical materials', 'Artwork', 'Logos and trademarks'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>solely in connection with distribution and promotion of the Works. You retain full ownership of all copyrights at all times.</p>
              </div>

              <div>
                <p className="font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>2.2 Optional Rights Administration Services</p>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>If you enroll in optional rights administration services (e.g., neighboring rights, performance rights, or other collection services), you grant Elevate the necessary non-exclusive rights to administer and register the Works on your behalf. This authority is administrative only and does not transfer copyright ownership.</p>
              </div>

              <div>
                <p className="font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>2.3 Synchronization Rights (If Applicable)</p>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>If you opt into synchronization services, you grant Elevate a non-exclusive right to license the Works for synchronization in timed relation with audiovisual media (e.g., games, advertising, film, television). All synchronization placements remain subject to separate approval and agreement where required.</p>
              </div>

              <div>
                <p className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.92)' }}>3. Ownership and Consents</p>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>You represent and warrant that:</p>
                <ul className="space-y-1 mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['You own or control all rights necessary to distribute the Works.', 'The Works are original or properly licensed.', 'All required mechanical licenses for cover songs have been secured.', 'All performers, producers, and contributors have granted necessary permissions.'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Elevate is not responsible for securing underlying rights unless expressly agreed in writing.</p>
              </div>

              <div>
                <p className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.92)' }}>4. Fees and Payments</p>
                <p className="font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>4.1 Service Fees</p>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Fees are listed on sayelevate.com at time of purchase or agreed in writing. Additional services may require separate written agreement and full payment prior to commencement. Elevate is not obligated to provide services beyond those purchased.</p>
              </div>

              <div>
                <p className="font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>4.2 Royalties</p>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Royalty payments:</p>
                <ul className="space-y-1 mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['Are payable only after funds are received from DSPs or licensees.', 'May be subject to transaction or processing fees.', 'Will be paid once minimum payout thresholds are met.', 'Require completed and verified identity and tax documentation before release.'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Elevate may withhold or delay payments where:</p>
                <ul className="space-y-1 mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['Fraud or artificial streaming is suspected.', 'A compliance review is pending.', 'Required documentation has not been provided.', 'DSP penalties or clawbacks occur.'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Fraudulent activity may result in forfeiture of unpaid royalties.</p>
              </div>

              <div>
                <p className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.92)' }}>5. Artificial Streaming &amp; Fraud</p>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>You agree not to:</p>
                <ul className="space-y-1 mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['Purchase artificial streams, followers, or engagement.', 'Use bots or automated traffic.', 'Participate in streaming manipulation networks.'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>If fraudulent activity is detected:</p>
                <ul className="space-y-1 mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['Royalties may be withheld.', 'Releases may be removed.', 'Accounts may be terminated.', 'Fees may be forfeited.'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Elevate is not liable for DSP-imposed penalties resulting from artificial activity.</p>
              </div>

              <div>
                <p className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.92)' }}>6. Warranties</p>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>You represent and warrant that:</p>
                <ul className="space-y-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['The Works do not infringe any third-party rights.', 'The Works contain no defamatory, unlawful, or obscene material.', 'The Works contain no malicious code or harmful software.', 'You are not restricted from entering this Agreement.'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.92)' }}>7. Indemnification</p>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>You agree to indemnify and hold Elevate harmless from any claims, damages, losses, liabilities, or expenses (including legal fees) arising from:</p>
                <ul className="space-y-1 mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['Breach of this Agreement.', 'Infringement claims.', 'Ownership disputes.', 'Fraudulent activity.', 'Third-party claims relating to the Works.'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Elevate may offset amounts owed against your royalty balance.</p>
              </div>

              <div>
                <p className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.92)' }}>8. Termination</p>
                <p className="font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>8.1 Termination by Artist</p>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>You may terminate this Agreement with written notice, provided:</p>
                <ul className="space-y-1 mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['No outstanding balances are owed.', 'Subscription obligations are satisfied.'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Elevate will instruct DSPs to remove content within 30 days. Elevate is not responsible for third-party delays after removal instructions.</p>
              </div>

              <div>
                <p className="font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>8.2 Termination by Elevate</p>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Elevate may immediately terminate this Agreement if:</p>
                <ul className="space-y-1 mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['Fraud or illegal conduct is suspected.', 'Artificial streaming is detected.', 'You breach this Agreement.', 'You engage in threatening or abusive conduct toward Elevate staff.'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Termination may result in forfeiture of unpaid royalties.</p>
              </div>

              <div>
                <p className="font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>8.3 Refunds</p>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Refunds are only available if Elevate materially breaches this Agreement.</p>
              </div>

              {[
                { h: '9. Content Delivery', b: 'You must provide all required materials (audio, artwork, metadata) in agreed formats. Elevate is not obligated to begin Services until all required materials are received. Elevate is not responsible for DSP delays, removal decisions, or policy enforcement.' },
                { h: '10. Use of Support Resources', b: 'You agree to review available documentation before contacting support. Abusive or repeated misuse of support channels may result in termination.' },
                { h: '11. Confidentiality', b: 'Each party shall keep confidential non-public information disclosed under this Agreement for two (2) years following termination.' },
                { h: '12. Accurate Information', b: 'You must provide accurate contact and payment details. Elevate is not responsible for losses caused by incorrect payment information provided by you.' },
                { h: '13. Privacy', b: "Your personal data is processed in accordance with Elevate's Privacy Policy available at sayelevate.com." },
                { h: '14. Administrative Registrations', b: 'Where required for rights administration services, you authorize Elevate to act as administrative representative solely for registration and reporting purposes. Copyright ownership remains with you.' },
                { h: '15. Fair Usage Policy', b: '"Unlimited Distribution" or similar packages are intended for individual artists. Elevate may enforce reasonable usage limits to prevent abuse or bulk-label usage.' },
              ].map(({ h, b }) => (
                <div key={h}>
                  <p className="font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.92)' }}>{h}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>{b}</p>
                </div>
              ))}

              <div>
                <p className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.92)' }}>16. Force Majeure</p>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Neither party shall be liable for failure or delay caused by events beyond reasonable control, including:</p>
                <ul className="space-y-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {['Acts of God', 'War', 'Government action', 'DSP policy changes', 'Regulatory intervention', 'Infrastructure outages'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span style={{ opacity: 0.5, flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>

              {[
                { h: '17. Entire Agreement', b: 'This Agreement constitutes the entire agreement between the parties and supersedes prior discussions. If any provision is unenforceable, the remainder remains valid.' },
                { h: '18. Governing Law & Dispute Resolution', b: "This Agreement shall be governed in accordance with Elevate's Terms of Service. The parties agree to attempt good-faith resolution prior to formal legal proceedings." },
                { h: '19. Term', b: 'This Agreement begins on November 21, 2025 and continues for one (1) year. It automatically renews for successive one-year periods unless either party provides written notice at least thirty (30) days prior to renewal.' },
                { h: '20. No Third-Party Rights', b: 'No third party shall acquire rights under this Agreement.' },
              ].map(({ h, b }) => (
                <div key={h}>
                  <p className="font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.92)' }}>{h}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>{b}</p>
                </div>
              ))}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <p className="font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.92)' }}>Contact</p>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Support: support@sayelevate.com<br />Privacy / Legal: privacy@sayelevate.com</p>
              </div>
            </div>
            <div className="flex-shrink-0 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setShowArtistToS(false)} className="w-full h-10 rounded-xl text-sm font-semibold transition-all hover:brightness-110" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Freelancer ToS Modal */}
      {showFreelancerToS && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} onClick={() => setShowFreelancerToS(false)}>
          <div className="relative w-full max-w-2xl rounded-2xl flex flex-col" style={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.7)', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-base font-semibold text-white">Elevate Freelancer Agreement</p>
              <button onClick={() => setShowFreelancerToS(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:brightness-125" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Effective Date: November 21, 2025</p>
              <p>This Freelancer Agreement governs your participation as an independent service provider on the Elevate marketplace. You are an independent contractor, not an employee, agent, or partner of Elevate.</p>
            </div>
            <div className="flex-shrink-0 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setShowFreelancerToS(false)} className="w-full h-10 rounded-xl text-sm font-semibold transition-all hover:brightness-110" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Brand ToS Modal */}
      {showBrandToS && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} onClick={() => setShowBrandToS(false)}>
          <div className="relative w-full max-w-2xl rounded-2xl flex flex-col" style={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.7)', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-base font-semibold text-white">Elevate Brand Partnership Agreement</p>
              <button onClick={() => setShowBrandToS(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:brightness-125" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Effective Date: November 21, 2025</p>
              <p>This Brand Partnership Agreement governs the relationship between Elevate and any brand, business, or corporate entity accessing the Elevate platform for the purpose of connecting with creators and talent.</p>
            </div>
            <div className="flex-shrink-0 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setShowBrandToS(false)} className="w-full h-10 rounded-xl text-sm font-semibold transition-all hover:brightness-110" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} onClick={() => setShowPrivacyPolicy(false)}>
          <div className="relative w-full max-w-2xl rounded-2xl flex flex-col" style={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.7)', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-base font-semibold text-white">Privacy Policy</p>
              <button onClick={() => setShowPrivacyPolicy(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:brightness-125" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Effective Date: November 17, 2025</p>
              <p>Elevate respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform and services.</p>
            </div>
            <div className="flex-shrink-0 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setShowPrivacyPolicy(false)} className="w-full h-10 rounded-xl text-sm font-semibold transition-all hover:brightness-110" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
