import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileCreation } from '../contexts/ProfileCreationContext';

export default function FreelancerProfileTitle() {
  const navigate = useNavigate();
  const { profileData, updateProfileData } = useProfileCreation();
  const [title, setTitle] = useState(profileData.professionalTitle || '');
  const [touched, setTouched] = useState(false);

  const isValid = title.trim().length >= 4;
  const showError = touched && !isValid;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!touched) setTouched(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    if (isValid) {
      updateProfileData({ professionalTitle: title.trim() });
      navigate('/freelancer-experience');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: '#000000',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <p
            className="text-sm mb-2"
            style={{
              color: 'var(--text-primary)',
            }}
          >
            4/10
          </p>
          <div
            className="h-1 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'var(--text-primary)',
                width: '40%',
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-normal mb-3"
          style={{
            fontFamily: 'Fraunces, serif',
            color: '#ffffff',
          }}
        >
          Got it. Now, add a title to tell the world what you do.
        </h1>

        <p
          className="text-base mb-10"
          style={{
            color: '#cccccc',
          }}
        >
          This is your professional title. It's what clients will see first, so make it count.
        </p>

        {/* Input Section */}
        <div className="mb-12">
          <label
            className="block text-sm font-medium mb-3"
            style={{
              color: '#ffffff',
            }}
          >
            Your professional role
          </label>

          <input
            type="text"
            value={title}
            onChange={handleInputChange}
            onBlur={() => setTouched(true)}
            placeholder="Example: Design & Creative"
            maxLength={100}
            className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: showError
                ? '1px solid #ef4444'
                : '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              }}
          />

          {/* Validation Message */}
          {showError && (
            <p
              className="text-sm mt-2 flex items-center gap-2"
              style={{
                color: '#ef4444',
              }}
            >
              <span style={{ fontSize: '16px' }}>⚠</span>
              Your professional role must be at least 4 characters.
            </p>
          )}

          {/* Character count helper */}
          {title.length > 0 && (
            <p
              className="text-sm mt-2"
              style={{
                color: 'var(--text-primary)',
                textAlign: 'right',
              }}
            >
              {title.length}/100
            </p>
          )}
        </div>

        {/* Bottom buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-lg font-medium text-base transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Back
          </button>

          <button
            onClick={handleContinue}
            disabled={!isValid}
            className="px-8 py-3 rounded-lg font-medium text-base transition-all duration-200"
            style={{
              backgroundColor: isValid ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
              color: isValid ? '#000000' : '#666666',
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}
          >
            Next, add your experience
          </button>
        </div>
      </div>
    </div>
  );
}
