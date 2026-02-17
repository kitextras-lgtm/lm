import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Testimonial {
  name: string;
  title: string;
  avatar: string;
  rating: number;
  rate: string;
  jobs: number;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Holly M.',
    title: 'Social Media Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    rating: 5.0,
    rate: '$50k earned',
    jobs: 14,
    quote: 'Elevate has given me opportunities I couldn\'t find anywhere else. I\'m grateful to work with clients I\'m genuinely excited about and who align with my goals',
  },
  {
    name: 'Marcus T.',
    title: 'Video Editor & Motion Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    rating: 5.0,
    rate: '$85k earned',
    jobs: 28,
    quote: 'The platform makes it easy to connect with quality clients who value professional work. My income has doubled since joining.',
  },
  {
    name: 'Georgina S.',
    title: 'Short Form Specialist',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    rating: 5.0,
    rate: '$95k earned',
    jobs: 42,
    quote: 'I appreciate how Elevate handles the business side so I can focus on delivering exceptional results for my clients.',
  },
];

export function FreelancerOnboarding() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      const userId = user?.id || verifiedUserId;

      console.log('👤 FreelancerOnboarding - userId:', userId);

      if (!userId) {
        navigate('/login');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('👤 FreelancerOnboarding - userData:', userData);
      console.log('👤 FreelancerOnboarding - userError:', userError);

      if (userData) {
        console.log('✅ User found, first_name:', userData.first_name);
        setCurrentUser(userData);
      } else {
        console.log('⚠️ No user found in DB, checking localStorage...');
        // Fallback: try to get name from localStorage tempProfile
        const tempProfile = localStorage.getItem('tempProfile');
        console.log('📦 tempProfile from localStorage:', tempProfile);
        if (tempProfile) {
          try {
            const profile = JSON.parse(tempProfile);
            console.log('📦 Parsed tempProfile:', profile);
            if (profile.firstName) {
              console.log('✅ Using firstName from localStorage:', profile.firstName);
              setCurrentUser({ first_name: profile.firstName });
            }
          } catch (_) {}
        } else {
          // Last resort: check if there's a cached first name
          const cachedFirstName = localStorage.getItem('userFirstName');
          if (cachedFirstName) {
            console.log('✅ Using cached firstName:', cachedFirstName);
            setCurrentUser({ first_name: cachedFirstName });
          }
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const handleGetStarted = () => {
    navigate('/freelancer-profile-creation');
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const testimonial = testimonials[currentTestimonial];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: '#000000',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
      }}
    >
      <div className="max-w-6xl w-full">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left Side - Steps */}
          <div className="flex flex-col justify-center space-y-12">
            <div>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-normal mb-2"
                style={{
                  fontFamily: 'Fraunces, serif',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                Hey {currentUser?.first_name || 'there'}. Your next big opportunity starts here.
              </h1>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div>
                  <p
                    className="text-base md:text-lg"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      color: '#ffffff',
                      fontWeight: 400,
                    }}
                  >
                    Answer a few quick questions to start building your profile.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div>
                  <p
                    className="text-base md:text-lg"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      color: '#ffffff',
                      fontWeight: 400,
                    }}
                  >
                    Apply to open roles, or list your services for clients to purchase.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div>
                  <p
                    className="text-base md:text-lg"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      color: '#ffffff',
                      fontWeight: 400,
                    }}
                  >
                    Get paid securely, with support whenever you need it.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <button
                onClick={handleGetStarted}
                className="px-8 py-3 rounded-lg font-medium text-base transition-all duration-200 hover:brightness-110"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                }}
              >
                Get started
              </button>
              <p
                className="mt-6 text-sm"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#cccccc',
                }}
              >
                It takes just 5-10 minutes to complete. You can update it anytime and we'll save your progress automatically.
              </p>
            </div>
          </div>

          {/* Right Side - Testimonial Carousel */}
          <div
            className="rounded-2xl p-8 md:p-10 relative"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:brightness-110 z-10"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: '#ffffff' }} />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:brightness-110 z-10"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <ChevronRight className="w-4 h-4" style={{ color: '#ffffff' }} />
            </button>

            {/* Profile Image */}
            <div className="flex justify-center mb-6">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-24 h-24 rounded-full object-cover"
                style={{
                  border: '3px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>

            {/* Name & Title */}
            <div className="text-center mb-4">
              <h3
                className="text-xl font-semibold mb-1"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#ffffff',
                }}
              >
                {testimonial.name}
              </h3>
              <p
                className="text-sm"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#cccccc',
                }}
              >
                {testimonial.title}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400" style={{ color: '#facc15' }} />
                <span
                  className="text-sm font-medium"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#ffffff',
                  }}
                >
                  {testimonial.rating}
                </span>
              </div>
              <div
                className="text-sm font-medium"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#ffffff',
                }}
              >
                {testimonial.rate}
              </div>
              <div className="flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  style={{ color: '#cccccc' }}
                >
                  <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span
                  className="text-sm font-medium"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#ffffff',
                  }}
                >
                  {testimonial.jobs} jobs
                </span>
              </div>
            </div>

            {/* Quote */}
            <blockquote
              className="text-center text-base leading-relaxed"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                color: '#ffffff',
              }}
            >
              "{testimonial.quote}"
            </blockquote>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: index === currentTestimonial ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
