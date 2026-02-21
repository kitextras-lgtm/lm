import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileCreation } from '../contexts/ProfileCreationContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function FreelancerReviewProfile() {
  const navigate = useNavigate();
  const { profileData, clearProfileData } = useProfileCreation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      const userId = user?.id || verifiedUserId;

      if (!userId) {
        setError('Session expired. Please log in again.');
        return;
      }

      // Fetch user details for the application snapshot
      const { data: userData } = await supabase
        .from('users')
        .select('email, full_name, username')
        .eq('id', userId)
        .maybeSingle();

      const { error: appError } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
          application_type: 'freelancer_onboarding',
          status: 'pending',
          full_name: userData?.full_name || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || null,
          email: userData?.email || null,
          username: userData?.username || profileData.username || null,
          professional_title: profileData.professionalTitle || null,
          category: profileData.selectedCategoryName || profileData.selectedCategory || null,
          skills: profileData.selectedSkills && profileData.selectedSkills.length > 0 ? profileData.selectedSkills : null,
          hourly_rate: profileData.hourlyRate || null,
          bio: profileData.bio || null,
          country: profileData.country || null,
          city: profileData.city || null,
        });

      if (appError) throw appError;

      clearProfileData();
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ background: '#000000' }}
      >
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <CheckCircle className="w-10 h-10" style={{ color: '#10b981' }} />
          </div>
          <h1 className="text-3xl font-semibold mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#ffffff' }}>
            Application submitted!
          </h1>
          <p className="text-base mb-8" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--text-primary)' }}>
            Your freelancer application is under review. We'll notify you once it's been approved.
          </p>
          <button
            onClick={() => navigate('/dashboard/freelancer')}
            className="px-8 py-3 rounded-lg font-medium text-base transition-all duration-200 hover:brightness-95"
            style={{ backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: '#000000',
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
      }}
    >
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <p className="text-sm mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--text-primary)' }}>
            Final step
          </p>
          <div className="h-1 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="h-full rounded-full" style={{ backgroundColor: 'var(--text-primary)', width: '100%' }} />
          </div>
        </div>

        <h1
          className="text-4xl md:text-5xl font-normal mb-3"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#ffffff' }}
        >
          Review and submit your profile
        </h1>
        <p className="text-base mb-10" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--text-primary)' }}>
          Once submitted, our team will review your application. You'll be notified when it's approved.
        </p>

        {/* Summary */}
        <div
          className="rounded-xl p-6 mb-8 space-y-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {profileData.professionalTitle && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>TITLE</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{profileData.professionalTitle}</p>
            </div>
          )}
          {profileData.selectedCategoryName && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>CATEGORY</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{profileData.selectedCategoryName}</p>
            </div>
          )}
          {profileData.selectedSkills && profileData.selectedSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>SKILLS</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{profileData.selectedSkills.slice(0, 5).join(', ')}{profileData.selectedSkills.length > 5 ? ` +${profileData.selectedSkills.length - 5} more` : ''}</p>
            </div>
          )}
          {profileData.hourlyRate ? (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>HOURLY RATE</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>${profileData.hourlyRate}/hr</p>
            </div>
          ) : null}
          {profileData.country && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>LOCATION</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{[profileData.city, profileData.country].filter(Boolean).join(', ')}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#ef4444' }} />
            <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg font-medium text-base transition-all duration-200 hover:brightness-95"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-lg font-medium text-base transition-all duration-200 hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit application'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
