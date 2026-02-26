import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/config';

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

export function LoginPage({ forceArtist = false }: { forceArtist?: boolean }) {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailWarning, setEmailWarning] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendSent, setResendSent] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [showToS, setShowToS] = useState(false);
  const [showArtistToS, setShowArtistToS] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isFromArtistPage = forceArtist || (location.state as any)?.from === '/learn/artist' || document.referrer.includes('/learn/artist') || searchParams.get('source') === 'artist';
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
        const apiUrl = `${SUPABASE_URL}/functions/v1/send-otp`;
        console.log('🔐 Sending OTP request to:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email, isLogin: true }),
        });

        console.log('📨 OTP response status:', response.status);
        
        // Parse response
        const responseText = await response.text();
        console.log('📝 OTP response text:', responseText);
        
        if (!responseText) {
          throw new Error('Empty response from server');
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          console.error('❌ Failed to parse response:', responseText);
          throw new Error('Invalid response from server');
        }
        
        // Check if response is OK
        if (!response.ok) {
          console.error('❌ OTP request failed:', response.status, responseText);
          throw new Error(data.message || `Server error: ${response.status}`);
        }
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
    setOtpError(false);

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
      const apiUrl = `${SUPABASE_URL}/functions/v1/verify-otp`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
            case 'freelancer':
              navigate('/dashboard/freelancer');
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
      setOtpError(true);
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
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
      setResendSent(true);
      setTimeout(() => setResendSent(false), 4000);
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
            <div className="w-full flex justify-center mb-6">
              <img 
                src="/elevate solid white logo ver.jpeg" 
                alt="Elevate Logo"
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-1">Log in to Elevate</h1>
            <p 
              className="text-base mb-6"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                color: 'rgb(204, 204, 204)',
                fontWeight: 400
              }}
            >
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
              <div className="relative">
                <input
                  type="email"
                  id="email-input"
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
                  htmlFor="email-input"
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
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <p className="text-neutral-400 text-xs text-center">
              By signing in, you agree to our{" "}
              <button className="text-white underline hover:no-underline" onClick={() => isFromArtistPage ? setShowArtistToS(true) : setShowToS(true)}>
                Terms
              </button>
              {" "}and{" "}
              <button className="text-white underline hover:no-underline" onClick={() => setShowPrivacyPolicy(true)}>
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
                        background: otpError ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: otpError
                          ? 'inset 0 0 0 1.5px rgba(239, 68, 68, 0.7)'
                          : 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)'
                      }}
                      onFocus={(e) => {
                        if (!otpError) e.target.style.boxShadow = 'inset 0 0 0 2px #ffffff';
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = otpError
                          ? 'inset 0 0 0 1.5px rgba(239, 68, 68, 0.7)'
                          : 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)';
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
                  {resendSent ? (
                    <p className="font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>New code sent — check your inbox.</p>
                  ) : (
                    <>
                      <p className="mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Didn't get anything?</p>
                      <p style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Check your spam or{' '}
                        <button
                          onClick={handleResendCode}
                          disabled={loading}
                          className="font-medium transition-colors disabled:opacity-50"
                          style={{ color: '#FFFFFF' }}
                          onMouseEnter={(e) => !loading && (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                          onMouseLeave={(e) => !loading && (e.currentTarget.style.color = '#FFFFFF')}
                        >
                          send a new one
                        </button>
                        .
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowPrivacyPolicy(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl flex flex-col"
            style={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.7)', maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-base font-semibold text-white">Privacy Policy</p>
              <button onClick={() => setShowPrivacyPolicy(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:brightness-125" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Effective Date: March 10, 2025</p>
              <p>Elevate ("Elevate," "we," "us," or "our") operates an online marketplace located at https://sayelevate.com and related applications and services (collectively, the "Services"). Elevate provides a platform that enables Buyers to purchase digital goods, memberships, and services offered by independent Sellers.</p>
              {[
                { h: '1. Information We Collect', b: 'We collect information you provide directly (name, email, payment info, profile data, messages), information collected automatically (IP address, device identifiers, browser type, usage data, cookies), and information from third parties (payment processors, identity verification providers, social platforms you connect).' },
                { h: '2. How We Use Your Information', b: 'We use your information to provide and improve the Services, process transactions, verify identity, communicate with you, personalize your experience, enforce our Terms, prevent fraud, comply with legal obligations, and send marketing communications (which you may opt out of).' },
                { h: '3. Sharing Your Information', b: 'We may share your information with service providers who assist in operating the Services, payment processors and financial partners, identity verification providers, analytics providers, law enforcement or government agencies when required by law, and other users to the extent necessary to facilitate transactions. We do not sell your personal information.' },
                { h: '4. Cookies and Tracking Technologies', b: 'We use cookies, web beacons, and similar technologies to operate and improve the Services, remember your preferences, analyze traffic, and serve relevant content. You may control cookies through your browser settings, though disabling them may affect functionality.' },
                { h: '5. Data Retention', b: 'We retain your information for as long as your account is active, as needed to provide the Services, or as required by law. You may request deletion of your account and associated data, subject to legal and operational retention requirements.' },
                { h: '6. Security', b: 'We implement reasonable technical and organizational measures to protect your information. However, no method of transmission over the internet or electronic storage is completely secure. We cannot guarantee absolute security.' },
                { h: '7. Children\'s Privacy', b: 'The Services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided personal information, we will delete it.' },
                { h: '8. International Data Transfers', b: 'Your information may be transferred to and processed in countries other than your own. We take steps to ensure such transfers comply with applicable law and that your information receives adequate protection.' },
                { h: '9. Your Rights and Choices', b: 'Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing of your personal information, and to data portability. To exercise these rights, contact us at privacy@sayelevate.com. We will respond within applicable legal timeframes.' },
                { h: '10. Third-Party Links', b: 'The Services may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties and encourage you to review their privacy policies.' },
                { h: '11. Changes to This Policy', b: 'We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy and updating the effective date. Continued use of the Services after changes constitutes acceptance.' },
                { h: '12. California Privacy Rights', b: 'California residents may have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete it, and the right to opt out of sale. We do not sell personal information. To exercise your rights, contact privacy@sayelevate.com.' },
              ].map(({ h, b }) => (
                <div key={h}>
                  <p className="font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.92)' }}>{h}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>{b}</p>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <p className="font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.92)' }}>Contact</p>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Privacy / Legal: privacy@sayelevate.com<br />Support: support@sayelevate.com</p>
              </div>
            </div>
            <div className="flex-shrink-0 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setShowPrivacyPolicy(false)} className="w-full h-10 rounded-xl text-sm font-semibold transition-all hover:brightness-110" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Artist Distribution Agreement Modal */}
      {showArtistToS && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowArtistToS(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl flex flex-col"
            style={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.7)', maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-base font-semibold text-white">Elevate Artist Distribution Agreement</p>
              <button onClick={() => setShowArtistToS(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:brightness-125" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Effective Date: November 21, 2025</p>
              <p>This Artist Distribution Agreement ("Agreement") is entered into between Elevate ("Elevate," "we," "us," or "our"), operating at https://sayelevate.com and [Artist Name / Legal Entity] ("Artist," "you," or "your"). This Agreement governs the submission and digital distribution of musical compositions, sound recordings, artwork, metadata, and related materials submitted by you for distribution and related services.</p>
              {[
                { h: '1. Services', b: 'Elevate provides digital music distribution and related services that may include delivery of Works to digital service providers (DSPs), metadata processing and release management, royalty collection and reporting, optional rights administration services, and additional services selected at time of purchase. Elevate operates solely as a distribution and services provider — not as the creator, publisher, or record label of the Works.' },
                { h: '2.1 Distribution License', b: 'In exchange for applicable fees and/or revenue participation, you grant Elevate a non-exclusive, worldwide license during the term of this Agreement to reproduce, distribute, digitally transmit, publicly perform, display, promote, and make available the Works in all media formats now known or later developed. You also grant Elevate the right to use your artist name, likeness, biographical materials, artwork, and logos solely in connection with distribution and promotion. You retain full ownership of all copyrights at all times.' },
                { h: '2.2 Optional Rights Administration Services', b: 'If you enroll in optional rights administration services (e.g., neighboring rights, performance rights, or other collection services), you grant Elevate the necessary non-exclusive rights to administer and register the Works on your behalf. This authority is administrative only and does not transfer copyright ownership.' },
                { h: '2.3 Synchronization Rights (If Applicable)', b: 'If you opt into synchronization services, you grant Elevate a non-exclusive right to license the Works for synchronization in timed relation with audiovisual media. All synchronization placements remain subject to separate approval and agreement where required.' },
                { h: '3. Ownership and Consents', b: 'You represent and warrant that you own or control all rights necessary to distribute the Works; the Works are original or properly licensed; all required mechanical licenses for cover songs have been secured; and all performers, producers, and contributors have granted necessary permissions. Elevate is not responsible for securing underlying rights unless expressly agreed in writing.' },
                { h: '4.1 Service Fees', b: 'Fees are listed on sayelevate.com at time of purchase or agreed in writing. Additional services may require separate written agreement and full payment prior to commencement. Elevate is not obligated to provide services beyond those purchased.' },
                { h: '4.2 Royalties', b: 'Royalty payments are payable only after funds are received from DSPs or licensees, may be subject to transaction or processing fees, will be paid once minimum payout thresholds are met, and require completed and verified identity and tax documentation before release. Elevate may withhold or delay payments where fraud or artificial streaming is suspected, a compliance review is pending, required documentation has not been provided, or DSP penalties or clawbacks occur.' },
                { h: '5. Artificial Streaming & Fraud', b: 'You agree not to purchase artificial streams, followers, or engagement; use bots or automated traffic; or participate in streaming manipulation networks. If fraudulent activity is detected, royalties may be withheld, releases removed, accounts terminated, and fees forfeited. Elevate is not liable for DSP-imposed penalties resulting from artificial activity.' },
                { h: '6. Warranties', b: 'You represent and warrant that the Works do not infringe any third-party rights; contain no defamatory, unlawful, or obscene material; contain no malicious code or harmful software; and you are not restricted from entering this Agreement.' },
                { h: '7. Indemnification', b: 'You agree to indemnify and hold Elevate harmless from any claims, damages, losses, liabilities, or expenses (including legal fees) arising from breach of this Agreement, infringement claims, ownership disputes, fraudulent activity, or third-party claims relating to the Works. Elevate may offset amounts owed against your royalty balance.' },
                { h: '8.1 Termination by Artist', b: 'You may terminate this Agreement with written notice, provided no outstanding balances are owed and subscription obligations are satisfied. Elevate will instruct DSPs to remove content within 30 days. Elevate is not responsible for third-party delays after removal instructions.' },
                { h: '8.2 Termination by Elevate', b: 'Elevate may immediately terminate this Agreement if fraud or illegal conduct is suspected, artificial streaming is detected, you breach this Agreement, or you engage in threatening or abusive conduct toward Elevate staff. Termination may result in forfeiture of unpaid royalties.' },
                { h: '8.3 Refunds', b: 'Refunds are only available if Elevate materially breaches this Agreement.' },
                { h: '9. Content Delivery', b: 'You must provide all required materials (audio, artwork, metadata) in agreed formats. Elevate is not obligated to begin Services until all required materials are received. Elevate is not responsible for DSP delays, removal decisions, or policy enforcement.' },
                { h: '10. Use of Support Resources', b: 'You agree to review available documentation before contacting support. Abusive or repeated misuse of support channels may result in termination.' },
                { h: '11. Confidentiality', b: 'Each party shall keep confidential non-public information disclosed under this Agreement for two (2) years following termination.' },
                { h: '12. Accurate Information', b: 'You must provide accurate contact and payment details. Elevate is not responsible for losses caused by incorrect payment information provided by you.' },
                { h: '13. Privacy', b: 'Your personal data is processed in accordance with Elevate\'s Privacy Policy available at sayelevate.com.' },
                { h: '14. Administrative Registrations', b: 'Where required for rights administration services, you authorize Elevate to act as administrative representative solely for registration and reporting purposes. Copyright ownership remains with you.' },
                { h: '15. Fair Usage Policy', b: '"Unlimited Distribution" or similar packages are intended for individual artists. Elevate may enforce reasonable usage limits to prevent abuse or bulk-label usage.' },
                { h: '16. Force Majeure', b: 'Neither party shall be liable for failure or delay caused by events beyond reasonable control, including acts of God, war, government action, DSP policy changes, regulatory intervention, or infrastructure outages.' },
                { h: '17. Entire Agreement', b: 'This Agreement constitutes the entire agreement between the parties and supersedes prior discussions. If any provision is unenforceable, the remainder remains valid.' },
                { h: '18. Governing Law & Dispute Resolution', b: 'This Agreement shall be governed in accordance with Elevate\'s Terms of Service. The parties agree to attempt good-faith resolution prior to formal legal proceedings.' },
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
              <button onClick={() => setShowArtistToS(false)} className="w-full h-10 rounded-xl text-sm font-semibold transition-all hover:brightness-110" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Terms of Service Modal */}
      {showToS && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowToS(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl flex flex-col"
            style={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.7)', maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-base font-semibold text-white">Terms of Service</p>
              <button onClick={() => setShowToS(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:brightness-125" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Effective Date: November 17, 2025</p>
              <p>These Terms of Service ("Terms") govern your access to and use of the websites, applications, platforms, and services operated by Elevate ("Elevate," "we," "us," or "our"). By accessing or using the Service, you agree to these Terms and our Privacy Policy.</p>
              {[
                { h: '1. Acceptance of Terms', b: 'By accessing or using the Service in any manner — including creating an account, connecting financial accounts, posting content, or receiving payments — you agree to comply with all applicable laws and be bound by these Terms and the dispute resolution and arbitration provisions. Electronic communications satisfy any written requirement.' },
                { h: '2. Changes to Terms or Service', b: 'Elevate may update these Terms at any time. Changes become effective when posted. Continued use constitutes acceptance. Elevate may modify, suspend, or discontinue any portion of the Service at any time without liability.' },
                { h: '3.1 Account Registration', b: 'You must provide accurate and complete information when creating an account and keep it updated. You are responsible for maintaining login confidentiality and all activity conducted through your account. Notify us immediately at support@sayelevate.com if your account is compromised.' },
                { h: '3.2 Linked Accounts & Revenue Ownership', b: 'By linking a payment account you confirm you own or control it. The owner of the first Linked Account connected with a valid payment method is deemed the owner of all associated revenue. Elevate does not mediate ownership disputes.' },
                { h: '3.3 Identity Verification (KYC)', b: 'To receive payouts you must complete all required identity verification. Failure may result in inability to receive payouts, suspension, or termination.' },
                { h: '4. Intellectual Property', b: 'All Elevate Content — including logos, software, design, trademarks, and code — is owned by Elevate or its licensors and protected by law. You may not copy, reproduce, distribute, modify, or commercially exploit Elevate Content without written permission.' },
                { h: '5. Your Use of the Service', b: 'You agree not to use the Service for illegal purposes, harass or harm others, upload malicious code, scrape or reverse engineer, engage in fraud, manipulate reviews, or violate intellectual property rights. Elevate may suspend or terminate accounts for violations.' },
                { h: '6. User Content', b: 'You retain ownership of your content. By posting, you grant Elevate a worldwide, non-exclusive, royalty-free, sublicensable, perpetual license to host, display, promote, and distribute your content. You represent you have the rights to post it. Elevate may remove content at its discretion.' },
                { h: '7. Transactions, Buying, Selling, and Fees', b: 'Elevate facilitates transactions between users but does not guarantee product quality, delivery, or seller performance. Fees may apply and may be updated. Sellers must accurately describe products and have legal rights to sell them.' },
                { h: '8. Elevate Balance and Payment Processing', b: 'Funds received may be reflected in your Elevate Balance held by Financial Partners. You may use your Balance to purchase products or withdraw to a linked bank account. Elevate may deduct fees, chargebacks, refunds, fines, and legal obligations. Report transaction errors within seven (7) days.' },
                { h: '9. Force Majeure', b: 'Elevate shall not be liable for delays or failure in performance resulting from events beyond its reasonable control, including acts of God, war, government action, bank failures, Financial Partner insolvency, cybersecurity incidents, fraud investigations, or compliance reviews.' },
                { h: '10. Payment Partner Disclaimer', b: 'Payments are processed by independent Financial Partners. Financial Partners may freeze, delay, reverse, or restrict funds. Elevate does not control Financial Partner decisions and is not liable for payment delays caused by them. Payout obligations may be suspended without liability during partner failures or regulatory issues.' },
                { h: '11. No Fiduciary Relationship', b: 'Nothing in these Terms creates a fiduciary, escrow, trustee, agency, or financial advisory relationship. Elevate is a technology platform, not a bank, broker-dealer, investment advisor, or financial custodian.' },
                { h: '12. No Guarantee of Earnings', b: 'Elevate makes no guarantees regarding income, profitability, sales, or business success. You acknowledge that using the Service involves business and financial risk. Elevate does not provide financial, tax, or investment advice.' },
                { h: '13. Regulatory and Compliance Changes', b: 'Elevate may suspend, restrict, or modify features if required by law, regulation, court order, or Financial Partner policy. Elevate shall not be liable for service limitations resulting from regulatory action.' },
                { h: '14. Communications', b: 'You consent to receive electronic communications including receipts, security notices, and policy updates. Marketing emails may be unsubscribed from. Keep contact information updated.' },
                { h: '15. Termination', b: 'You may delete your account at any time. Elevate may suspend or terminate accounts at its discretion. Upon termination: access is revoked, fees remain due, content may be deleted, balances may be applied to obligations. You may not create a new account to evade termination.' },
                { h: '16. Disclaimer of Warranties', b: 'The Service is provided "AS IS" and "AS AVAILABLE." Elevate disclaims all warranties, express or implied, and does not guarantee uninterrupted or error-free operation.' },
                { h: '17. Limitation of Liability', b: 'To the fullest extent permitted by law, Elevate is not liable for indirect, incidental, consequential, or punitive damages. Total liability is limited to the greater of the amount paid in the previous 12 months or $100. Claims must be brought within one (1) year.' },
                { h: '18. Dispute Resolution & Arbitration', b: 'Before filing legal action you must attempt informal resolution by contacting support@sayelevate.com. Unresolved disputes are subject to binding individual arbitration under the Federal Arbitration Act. Class actions and jury trials are waived.' },
                { h: '19. Copyright (DMCA)', b: 'Copyright complaints must be sent to privacy@sayelevate.com. Elevate may remove infringing content and terminate repeat infringers.' },
                { h: '20. Miscellaneous', b: 'New York law governs. Terms are severable. No waiver by delay. Elevate may assign Terms. No partnership created.' },
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
              <button onClick={() => setShowToS(false)} className="w-full h-10 rounded-xl text-sm font-semibold transition-all hover:brightness-110" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
