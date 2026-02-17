import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, X, Globe } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown';
import { useProfileCreation, Language } from '../contexts/ProfileCreationContext';

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const emptyLanguage: Omit<Language, 'id'> = {
  language: '',
  proficiency: '',
};

const PROFICIENCY_LEVELS = [
  'Basic',
  'Conversational',
  'Professional',
  'Fluent',
  'Native',
];

export default function FreelancerLanguages() {
  const navigate = useNavigate();
  const { profileData, updateProfileData } = useProfileCreation();
  const [languages, setLanguages] = useState<Language[]>(() => {
    // Start with existing languages or empty array
    const existingLanguages = profileData.languages || [];
    
    // If we have a primaryLanguage from signup and no languages yet, add it as Native
    if (profileData.primaryLanguage && existingLanguages.length === 0) {
      return [{
        id: generateId(),
        language: profileData.primaryLanguage,
        proficiency: 'Native'
      }];
    }
    
    return existingLanguages;
  });
  const [showModal, setShowModal] = useState(false);
  const [editingLang, setEditingLang] = useState<Language | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [languages]);

  // Sync languages with profileData when primaryLanguage changes
  useEffect(() => {
    if (profileData.primaryLanguage && languages.length === 0) {
      const primaryLang = {
        id: generateId(),
        language: profileData.primaryLanguage,
        proficiency: 'Native'
      };
      setLanguages([primaryLang]);
    }
  }, [profileData.primaryLanguage]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 340;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  const handleAddNew = () => {
    setEditingLang({ id: generateId(), ...emptyLanguage });
    setIsNewEntry(true);
    setShowModal(true);
  };

  const handleEdit = (lang: Language) => {
    setEditingLang({ ...lang });
    setIsNewEntry(false);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setLanguages(prev => prev.filter(l => l.id !== id));
  };

  const handleSaveModal = () => {
    if (!editingLang || !editingLang.language.trim() || !editingLang.proficiency.trim()) return;

    if (isNewEntry) {
      setLanguages(prev => [...prev, editingLang]);
    } else {
      setLanguages(prev => prev.map(l => l.id === editingLang.id ? editingLang : l));
    }
    setShowModal(false);
    setEditingLang(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLang(null);
  };

  const handleBack = () => navigate(-1);

  const handleContinue = () => {
    updateProfileData({ languages });
    navigate('/freelancer-bio');
  };

  const updateField = (field: keyof Language, value: any) => {
    if (!editingLang) return;
    setEditingLang({ ...editingLang, [field]: value });
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
            7/10
          </p>
          <div
            className="h-1 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ backgroundColor: '#94A3B8', width: '70%' }}
            />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-normal mb-3"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#ffffff' }}
        >
          Let's add your languages
        </h1>

        <p
          className="text-lg mb-12"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: '#94A3B8',
          }}
        >
          Add any languages you speak, even if you're not completely fluent.
        </p>

        {/* Language cards */}
        <div className="relative mb-12">
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <ChevronLeft size={20} color="#ffffff" />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Add button */}
            <button
              onClick={handleAddNew}
              className="flex-shrink-0 w-80 h-48 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:brightness-110"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)' }}
              >
                <Plus size={24} color="#94A3B8" />
              </div>
              <span
                className="text-base font-medium"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#ffffff',
                }}
              >
                Add language
              </span>
            </button>

            {/* Language cards */}
            {languages.map((lang) => (
              <div
                key={lang.id}
                className="flex-shrink-0 w-80 rounded-xl p-6 relative"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(lang)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:brightness-110"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Pencil size={14} color="#94A3B8" />
                  </button>
                  <button
                    onClick={() => handleDelete(lang.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:brightness-110"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Trash2 size={14} color="#EF4444" />
                  </button>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)' }}
                  >
                    <Globe size={24} color="#94A3B8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-lg font-semibold mb-1 truncate"
                      style={{
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        color: '#ffffff',
                      }}
                    >
                      {lang.language}
                    </h3>
                    <p
                      className="text-sm truncate"
                      style={{
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        color: '#94A3B8',
                      }}
                    >
                      {lang.proficiency}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <ChevronRight size={20} color="#ffffff" />
            </button>
          )}
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
            Next, add portfolio
          </button>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showModal && editingLang && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-2xl font-semibold"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#ffffff',
                }}
              >
                {isNewEntry ? 'Add Language' : 'Edit Language'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <X size={18} color="#ffffff" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#94A3B8',
                  }}
                >
                  Language *
                </label>
                <input
                  type="text"
                  value={editingLang.language}
                  onChange={(e) => updateField('language', e.target.value)}
                  placeholder="e.g. English, Spanish, French"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#94A3B8',
                  }}
                >
                  Proficiency *
                </label>
                <CustomDropdown
                  value={editingLang.proficiency}
                  onChange={(val) => updateField('proficiency', val || '')}
                  options={[
                    { value: undefined, label: 'Select proficiency' },
                    ...PROFICIENCY_LEVELS.map((level) => ({ value: level, label: level }))
                  ]}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-6 py-3 rounded-lg font-medium text-base transition-all duration-200"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                disabled={!editingLang.language.trim() || !editingLang.proficiency.trim()}
                className="flex-1 px-6 py-3 rounded-lg font-medium text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
