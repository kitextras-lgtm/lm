import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useProfileCreation } from '../contexts/ProfileCreationContext';
import { MASTER_SKILLS_LIST, SUGGESTED_SKILLS_MAP } from '../data/skills';

export default function FreelancerSkillsSelection() {
  const navigate = useNavigate();
  const { profileData, updateProfileData } = useProfileCreation();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profileData.selectedSkills || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate suggested skills based on selected specialties
  const suggestedSkills = useMemo(() => {
    if (!profileData.selectedSpecialties || profileData.selectedSpecialties.length === 0) {
      return [];
    }

    const suggestions = new Set<string>();
    profileData.selectedSpecialties.forEach(specialtyId => {
      const skills = SUGGESTED_SKILLS_MAP[specialtyId] || [];
      skills.forEach(skill => suggestions.add(skill));
    });

    return Array.from(suggestions).filter(skill => !selectedSkills.includes(skill)).slice(0, 8);
  }, [profileData.selectedSpecialties, selectedSkills]);

  // Smart skill search with ranking
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const results: Array<{ skill: string; score: number }> = [];

    MASTER_SKILLS_LIST.forEach(skill => {
      if (selectedSkills.includes(skill)) return; // Skip already selected

      const skillLower = skill.toLowerCase();
      let score = 0;

      // Exact match (highest priority)
      if (skillLower === query) {
        score = 1000;
      }
      // Starts with query (high priority)
      else if (skillLower.startsWith(query)) {
        score = 500 - query.length; // Shorter queries rank higher
      }
      // Word boundary match (medium-high priority)
      else if (new RegExp(`\\b${query}`, 'i').test(skill)) {
        score = 300;
      }
      // Contains query (medium priority)
      else if (skillLower.includes(query)) {
        score = 200 - skillLower.indexOf(query); // Earlier matches rank higher
      }

      if (score > 0) {
        // Boost shorter skill names (tie-breaker)
        score += (100 - skill.length) * 0.1;
        results.push({ skill, score });
      }
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Return top 15 results
    return results.slice(0, 15).map(r => r.skill);
  }, [searchQuery, selectedSkills]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddSkill = (skill: string) => {
    if (selectedSkills.length < 15 && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setSearchQuery('');
      setShowDropdown(false);
      inputRef.current?.focus();
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setShowDropdown(true);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    if (selectedSkills.length >= 1) {
      updateProfileData({ selectedSkills });
      navigate('/freelancer-profile-title');
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
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <p
            className="text-sm mb-2"
            style={{
              color: 'var(--text-primary)',
            }}
          >
            3/10
          </p>
          <div
            className="h-1 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'var(--text-primary)',
                width: '30%',
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
          Nearly there! What work are you here to do?
        </h1>

        <p
          className="text-base mb-10"
          style={{
            color: '#cccccc',
          }}
        >
          The more skills you list, the more likely you are to get hired. Your skills show clients what you can offer, and help us choose which jobs to recommend to you. Add or remove the ones we've suggested, or start typing to pick more. It's up to you.
        </p>

        {/* Skills Input Section */}
        <div className="mb-8">
          <label
            className="block text-sm font-medium mb-3"
            style={{
              color: '#ffffff',
            }}
          >
            Your skills
          </label>

          {/* Search Input with Dropdown */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="Enter skills here"
              className="w-full px-4 py-3 rounded-lg text-base outline-none"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                }}
            />

            {/* Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-2 rounded-lg overflow-hidden z-10"
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {searchResults.map((skill, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddSkill(skill)}
                    className="w-full text-left px-4 py-3 transition-colors duration-150"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      borderBottom: index < searchResults.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p
            className="text-sm mt-2"
            style={{
              color: 'var(--text-primary)',
              textAlign: 'right',
            }}
          >
            Max 15 skills
          </p>

          {/* Validation Message */}
          {selectedSkills.length === 0 && (
            <p
              className="text-sm mt-2 flex items-center gap-2"
              style={{
                color: '#ef4444',
              }}
            >
              <span style={{ fontSize: '16px' }}>⚠</span>
              At least one skill is required.
            </p>
          )}

          {/* Selected Skills Tags */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedSkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 rounded-full"
                  style={{
                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                    border: '1px solid rgba(148, 163, 184, 0.4)',
                    color: '#ffffff',
                  }}
                >
                  <span className="text-sm">{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="flex items-center justify-center transition-opacity hover:opacity-70"
                    style={{
                      width: '16px',
                      height: '16px',
                    }}
                  >
                    <X className="w-3 h-3" style={{ color: 'var(--text-primary)' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Skills */}
        {suggestedSkills.length > 0 && (
          <div className="mb-12">
            <h2
              className="text-sm font-medium mb-3"
              style={{
                color: 'var(--text-primary)',
              }}
            >
              Suggested skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {suggestedSkills.map((skill, index) => (
                <button
                  key={index}
                  onClick={() => handleAddSkill(skill)}
                  disabled={selectedSkills.length >= 15}
                  className="px-4 py-2 rounded-full text-sm transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: selectedSkills.length >= 15 ? '#666666' : '#ffffff',
                    cursor: selectedSkills.length >= 15 ? 'not-allowed' : 'pointer',
                    opacity: selectedSkills.length >= 15 ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSkills.length < 15) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        )}

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
            disabled={selectedSkills.length === 0}
            className="px-8 py-3 rounded-lg font-medium text-base transition-all duration-200"
            style={{
              backgroundColor: selectedSkills.length > 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
              color: selectedSkills.length > 0 ? '#000000' : '#666666',
              cursor: selectedSkills.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            Next, your profile title
          </button>
        </div>
      </div>
    </div>
  );
}
