import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileCreation } from '../contexts/ProfileCreationContext';

export default function FreelancerSetRate() {
  const navigate = useNavigate();
  const { profileData, updateProfileData } = useProfileCreation();
  const [hourlyRate, setHourlyRate] = useState(profileData.hourlyRate || 0);
  const serviceFeePercentage = 0.20; // 20% service fee
  const serviceFee = hourlyRate * serviceFeePercentage;
  const youllGet = hourlyRate - serviceFee;

  const handleBack = () => navigate(-1);

  const handleContinue = () => {
    updateProfileData({ hourlyRate });
    navigate('/freelancer-photo-location');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: '#000000',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
      }}
    >
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <p
            className="text-sm mb-2"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              color: '#94A3B8',
            }}
          >
            9/10
          </p>
          <div
            className="h-1 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ backgroundColor: '#94A3B8', width: '90%' }}
            />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-normal mb-3"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#ffffff' }}
        >
          Now, let's set your hourly rate.
        </h1>

        <p
          className="text-base mb-12"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: '#94A3B8',
          }}
        >
          Clients will see this rate on your profile and in search results once you publish your profile. You can adjust your rate every time you submit a proposal.
        </p>

        {/* Hourly rate section */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2
                className="text-xl font-semibold mb-1"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#ffffff',
                }}
              >
                Hourly rate
              </h2>
              <p
                className="text-sm"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#94A3B8',
                }}
              >
                Total amount the client will see.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={hourlyRate || ''}
                onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-32 px-4 py-2 rounded-lg text-right text-base outline-none transition-all duration-200"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                }}
              />
              <span
                className="text-base"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#94A3B8',
                }}
              >
                /hr
              </span>
            </div>
          </div>
        </div>

        {/* Service fee section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2
                  className="text-xl font-semibold"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#ffffff',
                  }}
                >
                  Service fee
                </h2>
                <a
                  href="#"
                  className="text-sm underline"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#94A3B8',
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  Learn more
                </a>
              </div>
              <p
                className="text-sm max-w-md"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#94A3B8',
                }}
              >
                This helps us run the platform and provide services like payment protection and customer support. Fees vary and are shown before contract acceptance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-32 px-4 py-2 rounded-lg text-right text-base"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#94A3B8',
                }}
              >
                ${serviceFee.toFixed(2)}
              </div>
              <span
                className="text-base"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#94A3B8',
                }}
              >
                /hr
              </span>
            </div>
          </div>
        </div>

        {/* You'll get section */}
        <div className="mb-12">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2
                className="text-xl font-semibold mb-1"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#ffffff',
                }}
              >
                You'll get
              </h2>
              <p
                className="text-sm"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#94A3B8',
                }}
              >
                The estimated amount you'll receive after service fees
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-32 px-4 py-2 rounded-lg text-right text-base"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                }}
              >
                ${youllGet.toFixed(2)}
              </div>
              <span
                className="text-base"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#94A3B8',
                }}
              >
                /hr
              </span>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
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
            Next, add your photo and location
          </button>
        </div>
      </div>
    </div>
  );
}
