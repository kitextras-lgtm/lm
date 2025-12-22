import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export function LoginPage() {
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
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplineLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email, isLogin: true }),
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to send OTP');
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

    if (newCode.every(digit => digit !== '') && index === 5) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Submit on Enter when all digits are filled
    if (e.key === 'Enter' && code.every(digit => digit !== '') && !loading) {
      verifyCode(code.join(''));
    }
  };

  const verifyCode = async (otp: string) => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, code: otp, isSignup: false }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Invalid code');
      }

      // Sign in the user - store both email and userId
      if (data.userId) {
        localStorage.setItem('verifiedEmail', email);
        localStorage.setItem('verifiedUserId', data.userId);
        console.log('Stored verifiedUserId during login:', data.userId);
      }

      if (data.hasProfile && data.userType) {
        // User has completed onboarding - go to their dashboard
        switch (data.userType) {
          case 'artist':
            navigate('/dashboard/artist');
            break;
          case 'creator':
            navigate('/dashboard/creator');
            break;
          case 'business':
            navigate('/dashboard/business');
            break;
          default:
            navigate('/dashboard/artist');
        }
      } else {
        // User hasn't completed onboarding - send to profile creation
        console.log('User has no profile, redirecting to make-profile page');
        navigate('/make-profile');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, isLogin: true }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to resend OTP');
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
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep('email');
    setCode(['', '', '', '', '', '']);
    setError('');
    setEmailWarning('');
    setDevCode(null);
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-8 sm:py-12 px-6"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
      }}
    >
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-xs font-medium">Home</span>
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
        {step === 'email' ? (
          <>
            <h1 className="text-2xl font-semibold text-white mb-1">Log in to Elevate</h1>
            <p className="text-neutral-400 text-sm mb-6">
              {"Don't have an account? "}
              <button
                onClick={() => navigate('/signup')}
                className="text-white font-medium hover:underline"
              >
                Sign up
              </button>
              .
            </p>

            <button
              onClick={handleGoogleLogin}
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
              Login with Google
            </button>

            <div className="w-full flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-neutral-700" />
              <span className="text-neutral-500 text-xs">or</span>
              <div className="flex-1 h-px bg-neutral-700" />
            </div>

            <div className="w-full mb-4">
              <label className="block text-neutral-400 text-xs mb-1.5">Email</label>
              <input
                type="email"
                placeholder="alan.turing@example.com"
                value={email}
                onChange={handleEmailChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && email && isValidEmail && !loading) {
                    handleContinue();
                  }
                }}
                className="h-11 w-full px-4 bg-transparent border border-neutral-700 text-white placeholder:text-neutral-500 rounded-lg focus:border-neutral-500 focus:outline-none"
              />
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
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <p className="text-neutral-400 text-xs text-center">
              By signing in, you agree to our{" "}
              <button className="text-white underline hover:no-underline">
                Terms
              </button>
              {" "}and{" "}
              <button className="text-white underline hover:no-underline">
                Privacy Policy
              </button>
              .
            </p>
          </>
        ) : (
          <>
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
                  onClick={handleChangeEmail}
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
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleCodeChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      className="w-11 h-11 text-center text-lg font-semibold focus:outline-none transition-all"
                      style={{
                        color: '#F2F4F7',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)'
                      }}
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
          </>
        )}
      </div>
    </div>
  );
}
