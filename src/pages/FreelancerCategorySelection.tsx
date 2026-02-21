import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useProfileCreation } from '../contexts/ProfileCreationContext';

interface Specialty {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  specialties: Specialty[];
}

const CATEGORIES: Category[] = [
  {
    id: 'social-strategy',
    name: 'Social Media Strategy & Growth',
    specialties: [
      { id: 'social-strategy-1', name: 'Social Media Strategy' },
      { id: 'social-strategy-2', name: 'Growth Strategy (Organic)' },
      { id: 'social-strategy-3', name: 'Content Planning & Calendars' },
      { id: 'social-strategy-4', name: 'Audience Research' },
      { id: 'social-strategy-5', name: 'Brand Positioning for Creators' },
      { id: 'social-strategy-6', name: 'Competitive Analysis' },
      { id: 'social-strategy-7', name: 'Channel Audits (IG/TikTok/YouTube)' },
      { id: 'social-strategy-8', name: 'Hashtag + SEO Strategy (IG/TikTok)' },
    ],
  },
  {
    id: 'short-form',
    name: 'Short-Form Content (Reels/TikTok/Shorts)',
    specialties: [
      { id: 'short-form-1', name: 'TikTok Content Creation' },
      { id: 'short-form-2', name: 'Instagram Reels Creation' },
      { id: 'short-form-3', name: 'YouTube Shorts Creation' },
      { id: 'short-form-4', name: 'Short-Form Scriptwriting' },
      { id: 'short-form-5', name: 'Hook Writing (First 1–3 seconds)' },
      { id: 'short-form-6', name: 'UGC-Style Content' },
      { id: 'short-form-7', name: 'Trend Research & Adaptation' },
      { id: 'short-form-8', name: 'Short-Form Editing' },
    ],
  },
  {
    id: 'long-form',
    name: 'YouTube & Long-Form Content',
    specialties: [
      { id: 'long-form-1', name: 'YouTube Video Editing' },
      { id: 'long-form-2', name: 'YouTube Scriptwriting' },
      { id: 'long-form-3', name: 'YouTube Packaging (Title + Thumbnail)' },
      { id: 'long-form-4', name: 'YouTube Channel Management' },
      { id: 'long-form-5', name: 'Podcast Editing' },
      { id: 'long-form-6', name: 'Podcast Production' },
      { id: 'long-form-7', name: 'YouTube SEO (Search + Suggested)' },
      { id: 'long-form-8', name: 'Video Repurposing (Long → Short)' },
    ],
  },
  {
    id: 'editing',
    name: 'Video Editing & Post-Production',
    specialties: [
      { id: 'editing-1', name: 'CapCut Editing' },
      { id: 'editing-2', name: 'Premiere Pro Editing' },
      { id: 'editing-3', name: 'Final Cut Editing' },
      { id: 'editing-4', name: 'Motion Graphics' },
      { id: 'editing-5', name: 'Color Grading' },
      { id: 'editing-6', name: 'Subtitles + Captions (Stylized)' },
      { id: 'editing-7', name: 'Sound Design' },
      { id: 'editing-8', name: 'Audio Cleanup' },
    ],
  },
  {
    id: 'design',
    name: 'Creator Branding & Design',
    specialties: [
      { id: 'design-1', name: 'Creator Brand Identity' },
      { id: 'design-2', name: 'YouTube Thumbnails' },
      { id: 'design-3', name: 'Instagram Carousel Design' },
      { id: 'design-4', name: 'Post Templates' },
      { id: 'design-5', name: 'Stream Overlays + Alerts' },
      { id: 'design-6', name: 'Logo + Visual Identity' },
      { id: 'design-7', name: 'Media Kit Design' },
      { id: 'design-8', name: 'Brand Guidelines' },
    ],
  },
  {
    id: 'community',
    name: 'Community Management',
    specialties: [
      { id: 'community-1', name: 'Community Management' },
      { id: 'community-2', name: 'Discord Setup + Moderation' },
      { id: 'community-3', name: 'Telegram / WhatsApp Community' },
      { id: 'community-4', name: 'Comment + DM Management' },
      { id: 'community-5', name: 'Fan Engagement Strategy' },
      { id: 'community-6', name: 'Membership Programs (Patreon)' },
      { id: 'community-7', name: 'Customer Support for Creators' },
    ],
  },
  {
    id: 'influencer',
    name: 'Influencer Marketing & Brand Deals',
    specialties: [
      { id: 'influencer-1', name: 'Brand Deal Outreach' },
      { id: 'influencer-2', name: 'Sponsorship Negotiation' },
      { id: 'influencer-3', name: 'Influencer Campaign Management' },
      { id: 'influencer-4', name: 'Media Kit Optimization' },
      { id: 'influencer-5', name: 'Rate Card Strategy' },
      { id: 'influencer-6', name: 'Deliverables + Contract Help' },
      { id: 'influencer-7', name: 'Creator Partnership Management' },
    ],
  },
  {
    id: 'operations',
    name: 'Creator Assistants & Operations',
    specialties: [
      { id: 'operations-1', name: 'Creator Virtual Assistant' },
      { id: 'operations-2', name: 'Upload + Scheduling' },
      { id: 'operations-3', name: 'Workflow Setup (Notion/Airtable)' },
      { id: 'operations-4', name: 'Content Calendar Management' },
      { id: 'operations-5', name: 'Admin + Inbox Management' },
      { id: 'operations-6', name: 'Research Assistant' },
      { id: 'operations-7', name: 'Lead Management for Creators' },
    ],
  },
  {
    id: 'social-management',
    name: 'Social Media Management',
    specialties: [
      { id: 'social-management-1', name: 'Instagram Management' },
      { id: 'social-management-2', name: 'TikTok Management' },
      { id: 'social-management-3', name: 'YouTube Channel Management' },
      { id: 'social-management-4', name: 'LinkedIn Content Management' },
      { id: 'social-management-5', name: 'Pinterest Management' },
      { id: 'social-management-6', name: 'Cross-Posting + Scheduling' },
      { id: 'social-management-7', name: 'Social Media Reporting' },
    ],
  },
  {
    id: 'copywriting',
    name: 'Social Copywriting',
    specialties: [
      { id: 'copywriting-1', name: 'Caption Writing' },
      { id: 'copywriting-2', name: 'Tweet/Thread Writing' },
      { id: 'copywriting-3', name: 'LinkedIn Ghostwriting' },
      { id: 'copywriting-4', name: 'Hook + CTA Writing' },
      { id: 'copywriting-5', name: 'Storytelling Posts' },
      { id: 'copywriting-6', name: 'Newsletter Writing (Creator)' },
      { id: 'copywriting-7', name: 'Landing Page Copy (for creator offers)' },
    ],
  },
  {
    id: 'monetization',
    name: 'Creator Monetization',
    specialties: [
      { id: 'monetization-1', name: 'Offer Creation (for creators)' },
      { id: 'monetization-2', name: 'Digital Products Setup' },
      { id: 'monetization-3', name: 'Course + Funnel Setup' },
      { id: 'monetization-4', name: 'Affiliate Strategy' },
      { id: 'monetization-5', name: 'Shopify Setup for Creators' },
      { id: 'monetization-6', name: 'Newsletter Monetization' },
      { id: 'monetization-7', name: 'Pricing Strategy' },
      { id: 'monetization-8', name: 'AI Specialist' },
    ],
  },
];

export default function FreelancerCategorySelection() {
  const navigate = useNavigate();
  const { profileData, updateProfileData } = useProfileCreation();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(profileData.selectedSpecialties || []);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSpecialties([]);
  };

  const handleSpecialtyToggle = (specialtyId: string) => {
    if (selectedSpecialties.includes(specialtyId)) {
      setSelectedSpecialties(selectedSpecialties.filter(id => id !== specialtyId));
    } else {
      if (selectedSpecialties.length < 3) {
        setSelectedSpecialties([...selectedSpecialties, specialtyId]);
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    if (selectedSpecialties.length >= 1 && selectedCategory) {
      // Save selected category and specialties to context
      const specialtyNames = selectedSpecialties
        .map(id => selectedCategory.specialties.find(s => s.id === id)?.name)
        .filter(Boolean) as string[];
      
      updateProfileData({
        selectedCategory: selectedCategory.id,
        selectedCategoryName: selectedCategory.name,
        selectedSpecialties,
        selectedSpecialtyNames: specialtyNames,
      });
      
      navigate('/freelancer-skills-selection');
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
            2/10
          </p>
          <div
            className="h-1 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'var(--text-primary)',
                width: '20%',
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
          Great, so what kind of work are you here to do?
        </h1>

        <p
          className="text-base mb-12"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: '#cccccc',
          }}
        >
          Don't worry, you can change these choices later on.
        </p>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Categories */}
          <div>
            <h2
              className="text-sm font-medium mb-4"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                color: 'var(--text-primary)',
              }}
            >
              Select 1 category
            </h2>
            <div className="space-y-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group"
                  style={{
                    backgroundColor:
                      selectedCategory?.id === category.id
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'transparent',
                    border:
                      selectedCategory?.id === category.id
                        ? '1px solid rgba(255, 255, 255, 0.2)'
                        : '1px solid transparent',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color:
                      selectedCategory?.id === category.id ? '#ffffff' : 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory?.id !== category.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory?.id !== category.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span className="text-sm">{category.name}</span>
                  <ChevronRight
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      color: selectedCategory?.id === category.id ? '#ffffff' : 'var(--text-primary)',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Specialties */}
          <div className="lg:col-span-2">
            {selectedCategory ? (
              <>
                <h2
                  className="text-sm font-medium mb-4"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: 'var(--text-primary)',
                  }}
                >
                  Now, select 1 to 3 specialties
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCategory.specialties.map((specialty) => {
                    const isSelected = selectedSpecialties.includes(specialty.id);
                    const isDisabled =
                      !isSelected && selectedSpecialties.length >= 3;

                    return (
                      <button
                        key={specialty.id}
                        onClick={() => handleSpecialtyToggle(specialty.id)}
                        disabled={isDisabled}
                        className="text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3"
                        style={{
                          backgroundColor: isSelected
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected
                            ? '1px solid rgba(255, 255, 255, 0.2)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          color: isDisabled ? '#666666' : isSelected ? '#ffffff' : '#cccccc',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          opacity: isDisabled ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isDisabled && !isSelected) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDisabled && !isSelected) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                          }
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            border: isSelected
                              ? '2px solid #ffffff'
                              : '2px solid rgba(255, 255, 255, 0.3)',
                            backgroundColor: isSelected ? '#ffffff' : 'transparent',
                          }}
                        >
                          {isSelected && (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3 h-3"
                            >
                              <path
                                d="M5 13l4 4L19 7"
                                stroke="#000000"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm">{specialty.name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div
                className="h-full flex items-center justify-center rounded-lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <p
                  className="text-center"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#666666',
                  }}
                >
                  Select a category to view specialties
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex items-center justify-between mt-12">
          <button
            onClick={handleBack}
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

          <button
            onClick={handleContinue}
            disabled={selectedSpecialties.length === 0}
            className="px-8 py-3 rounded-lg font-medium text-base transition-all duration-200"
            style={{
              backgroundColor:
                selectedSpecialties.length > 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
              color: selectedSpecialties.length > 0 ? '#000000' : '#666666',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              cursor: selectedSpecialties.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            Next, add your skills
          </button>
        </div>
      </div>
    </div>
  );
}
