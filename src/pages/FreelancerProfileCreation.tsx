import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, Upload } from 'lucide-react';
import LinkedInImportModal from '../components/LinkedInImportModal';
import ResumeUploadModal from '../components/ResumeUploadModal';

export function FreelancerProfileCreation() {
  const navigate = useNavigate();
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{
          background: '#000000',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        }}
      >
        <div className="max-w-2xl w-full">
          {/* Progress indicator */}
          <div className="mb-8">
            <p
              className="text-sm mb-2"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                color: '#94A3B8',
              }}
            >
              1/10
            </p>
            <div
              className="h-1 rounded-full"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  backgroundColor: '#94A3B8',
                  width: '10%',
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
            How would you like to tell us about yourself?
          </h1>

          <p
            className="text-base mb-12"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              color: '#cccccc',
            }}
          >
            We need to get a sense of your education, experience and skills. It's quickest to import your information — you can edit it before your profile goes live.
          </p>

          {/* Options */}
          <div>

            <div className="space-y-3 mb-12">
                {/* Import from LinkedIn */}
                <button
                  onClick={() => setShowLinkedInModal(true)}
                  className="w-full px-6 py-4 rounded-lg text-left flex items-center gap-3 transition-all duration-200 hover:brightness-95"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  }}
                >
                  <Linkedin className="w-5 h-5" style={{ color: '#94A3B8' }} />
                  <span
                    className="font-medium"
                    style={{
                      color: '#94A3B8',
                      fontSize: '16px',
                    }}
                  >
                    Import from LinkedIn
                  </span>
                </button>

                {/* Upload your resume */}
                <button
                  onClick={() => setShowResumeModal(true)}
                  className="w-full px-6 py-4 rounded-lg text-left flex items-center gap-3 transition-all duration-200 hover:brightness-95"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  }}
                >
                  <Upload className="w-5 h-5" style={{ color: '#94A3B8' }} />
                  <span
                    className="font-medium"
                    style={{
                      color: '#94A3B8',
                      fontSize: '16px',
                    }}
                  >
                    Upload your resume
                  </span>
                </button>

            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-lg font-medium text-base transition-all duration-200"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
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
          </div>
        </div>
      </div>

      {/* Modals */}
      {showLinkedInModal && (
        <LinkedInImportModal onClose={() => setShowLinkedInModal(false)} />
      )}
      {showResumeModal && (
        <ResumeUploadModal onClose={() => setShowResumeModal(false)} />
      )}
    </>
  );
}
