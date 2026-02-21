import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileCreation } from '../contexts/ProfileCreationContext';

export default function FreelancerBio() {
  const navigate = useNavigate();
  const { profileData, updateProfileData } = useProfileCreation();
  const [bio, setBio] = useState(profileData.bio || '');
  const maxChars = 5000;

  const handleBack = () => navigate(-1);

  const handleContinue = () => {
    updateProfileData({ bio });
    navigate('/freelancer-set-rate');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: '#000000',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
      }}
    >
      <div className="w-full max-w-6xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <p
            className="text-sm mb-2"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              color: 'var(--text-primary)',
            }}
          >
            8/10
          </p>
          <div
            className="h-1 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ backgroundColor: 'var(--text-primary)', width: '80%' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Bio input */}
          <div>
            <h1
              className="text-4xl md:text-5xl font-normal mb-3"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#ffffff' }}
            >
              Great. Now write a bio to tell the world about yourself.
            </h1>

            <p
              className="text-base mb-8"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                color: 'var(--text-primary)',
              }}
            >
              Help people get to know you at a glance. What work do you do best? Tell them clearly, using paragraphs or bullet points. You can always edit later; just make sure you proofread now.
            </p>

            {/* Bio textarea */}
            <div className="relative mb-4">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, maxChars))}
                placeholder="I am a Marketing and Promotions Lead with 7 years of diverse experience in multimedia, product design, and higher education. I excel in crafting engaging marketing strategies that drive brand awareness and audience engagement. My background includes roles at various organizations where I honed my skills in product design and digital marketing, developing innovative campaigns that resonate with target audiences. I have effectively collaborated with teams to create compelling visual content and promotional materials..."
                rows={12}
                className="w-full px-4 py-3 rounded-lg text-base outline-none resize-none transition-all duration-200"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                }}
              />
              <div
                className="absolute bottom-3 right-3 text-sm"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: 'var(--text-primary)',
                }}
              >
                {bio.length}/{maxChars} characters left
              </div>
            </div>
          </div>

          {/* Right side - Profile preview */}
          <div className="flex items-start justify-center lg:justify-end">
            <div
              className="w-full max-w-sm rounded-2xl p-6"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Profile picture */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(148, 163, 184, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {profileData.profilePicture ? (
                      <img
                        src={profileData.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-3xl"
                        style={{
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {profileData.firstName?.[0] || 'U'}
                      </span>
                    )}
                  </div>
                  <div
                    className="absolute top-0 right-0 w-4 h-4 rounded-full"
                    style={{ backgroundColor: 'var(--text-primary)', border: '2px solid #000000' }}
                  />
                </div>
              </div>

              {/* Name */}
              <h2
                className="text-2xl font-semibold text-center mb-3"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#ffffff',
                }}
              >
                {profileData.firstName || 'Your'} {profileData.lastName?.[0] || 'N'}.
              </h2>

              {/* Stats */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span
                    className="text-sm font-medium"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      color: '#ffffff',
                    }}
                  >
                    5.0
                  </span>
                </div>
                <div
                  className="text-sm font-medium"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#ffffff',
                  }}
                >
                  $75.00/hr
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="text-sm font-medium"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      color: '#ffffff',
                    }}
                  >
                    📋 14 jobs
                  </span>
                </div>
              </div>

              {/* Bio preview */}
              <div
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: 'var(--text-primary)',
                }}
              >
                {bio || "I'm a developer experienced in building websites for small and medium-sized businesses. Whether you're trying to win work, list your services, or create a new online store, I can help.\n\n• Knows HTML and CSS3, PHP, jQuery, Wordpress, and SEO\n\n• Full project management from start to finish\n\n• Regular communication is important to me, so let's keep in touch."}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-lg font-medium text-base transition-all duration-200 hover:brightness-95"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
            }}
          >
            Back
          </button>

          <button
            onClick={handleContinue}
            className="px-8 py-3 rounded-lg font-medium text-base transition-all duration-200 hover:brightness-95"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            Next, set your rate
          </button>
        </div>
      </div>
    </div>
  );
}
