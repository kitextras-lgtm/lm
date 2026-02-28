import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, X, AlertTriangle, Folder } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown';
import { useProfileCreation, WorkExperience } from '../contexts/ProfileCreationContext';
import { supabase } from '../lib/supabase';

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDateRange(exp: WorkExperience): string {
  const startStr = exp.startMonth && exp.startYear
    ? `${MONTHS[exp.startMonth]} ${exp.startYear}`
    : exp.startYear
      ? `${exp.startYear}`
      : '';
  const endStr = exp.isCurrent
    ? 'Present'
    : exp.endMonth && exp.endYear
      ? `${MONTHS[exp.endMonth]} ${exp.endYear}`
      : exp.endYear
        ? `${exp.endYear}`
        : '';
  if (!startStr && !endStr) return '';
  if (!endStr) return startStr;
  return `${startStr} - ${endStr}`;
}

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const emptyExperience: Omit<WorkExperience, 'id'> = {
  title: '',
  company: '',
  locationCity: '',
  locationCountry: '',
  employmentType: '',
  startMonth: undefined,
  startYear: undefined,
  endMonth: undefined,
  endYear: undefined,
  isCurrent: false,
  description: '',
  needsReview: false,
};

export default function FreelancerExperience() {
  const navigate = useNavigate();
  const { profileData, updateProfileData } = useProfileCreation();
  const [experiences, setExperiences] = useState<WorkExperience[]>(
    profileData.workExperiences || []
  );
  const [editingExp, setEditingExp] = useState<WorkExperience | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch parsed experiences from database
  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const userId = localStorage.getItem('verifiedUserId');
        if (!userId) {
          throw new Error('User not authenticated');
        }

        let activeDraftId = profileData.draftId;
        console.log('🔍 FreelancerExperience - Initial state:', { 
          resumeId: profileData.resumeId, 
          draftId: profileData.draftId,
          userId 
        });

        // First, check if user has uploaded a resume (for persistence)
        if (!profileData.resumeId || !activeDraftId) {
          console.log('📋 No resumeId/draftId in context, checking users table...');
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('resume_url')
            .eq('id', userId)
            .maybeSingle();

          console.log('👤 User data:', { userData, userError });

          if (userError) {
            console.error('Failed to fetch user data:', userError);
          } else if (userData?.resume_url) {
            console.log('📄 Found resume_url, fetching resume record...');
            // User has a resume, fetch the resume record
            const { data: resumeData, error: resumeError } = await supabase
              .from('resumes')
              .select('id')
              .eq('user_id', userId)
              .eq('file_key', userData.resume_url)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            console.log('📑 Resume data:', { resumeData, resumeError });

            if (!resumeError && resumeData) {
              console.log('✅ Found resume, fetching draft...');
              // Fetch the draft associated with this resume
              const { data: draftData, error: draftError } = await supabase
                .from('profile_drafts')
                .select('id')
                .eq('source_resume_id', resumeData.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              console.log('📝 Draft data:', { draftData, draftError });

              if (!draftError && draftData) {
                activeDraftId = draftData.id;
                console.log('✅ Setting activeDraftId:', activeDraftId);
                updateProfileData({
                  resumeId: resumeData.id,
                  draftId: draftData.id,
                });
              } else {
                console.warn('⚠️ No draft found for resume');
              }
            } else {
              console.warn('⚠️ No resume found with file_key:', userData.resume_url);
            }
          } else {
            console.warn('⚠️ No resume_url in users table');
          }
        }

        // Only fetch if we have a draftId from parsing
        if (!activeDraftId) {
          console.warn('⚠️ No activeDraftId, skipping experience fetch');
          setIsLoading(false);
          return;
        }

        console.log('🔄 Fetching experiences for draftId:', activeDraftId);

        const { data, error } = await supabase
          .from('draft_work_experiences')
          .select('*')
          .eq('draft_id', activeDraftId)
          .order('sort_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedExperiences: WorkExperience[] = data.map((exp) => ({
            id: exp.id,
            title: exp.title,
            company: exp.company,
            locationCity: exp.location_city,
            locationCountry: exp.location_country,
            employmentType: exp.employment_type,
            startMonth: exp.start_month,
            startYear: exp.start_year,
            endMonth: exp.end_month,
            endYear: exp.end_year,
            isCurrent: exp.is_current,
            description: exp.description,
            sourceSnippet: exp.source_snippet,
            confidenceJson: exp.confidence_json,
            needsReview: exp.needs_review,
          }));

          setExperiences(mappedExperiences);
          updateProfileData({ workExperiences: mappedExperiences });
        }
      } catch (err) {
        console.error('Failed to fetch experiences:', err);
        setLoadError(err instanceof Error ? err.message : 'Failed to load experiences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, [profileData.draftId]);

  // Check scroll state
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [experiences]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 340;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  // CRUD
  const handleAddNew = () => {
    setEditingExp({ id: generateId(), ...emptyExperience });
    setIsNewEntry(true);
    setShowModal(true);
  };

  const handleEdit = (exp: WorkExperience) => {
    setEditingExp({ ...exp });
    setIsNewEntry(false);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveModal = () => {
    if (!editingExp || !editingExp.title.trim() || !editingExp.company.trim()) return;

    if (isNewEntry) {
      setExperiences(prev => [...prev, editingExp]);
    } else {
      setExperiences(prev => prev.map(e => e.id === editingExp.id ? editingExp : e));
    }
    setShowModal(false);
    setEditingExp(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExp(null);
  };

  // Navigation
  const handleBack = () => navigate(-1);

  const handleContinue = () => {
    updateProfileData({ workExperiences: experiences });
    navigate('/freelancer-education');
  };

  // Modal field updater
  const updateField = (field: keyof WorkExperience, value: any) => {
    if (!editingExp) return;
    setEditingExp({ ...editingExp, [field]: value });
  };

  const yearOptions = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

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
            5/10
          </p>
          <div
            className="h-1 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ backgroundColor: 'var(--text-primary)', width: '50%' }}
            />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-normal mb-3"
          style={{ color: '#ffffff' }}
        >
          Here's what you've told us about your experience — any more to add?
        </h1>

        <p
          className="text-base mb-10"
          style={{
            color: '#cccccc',
          }}
        >
          The more you tell us, the better: freelancers who've added their work experience are twice as likely to win work.
        </p>

        {/* Experience Cards Carousel */}
        <div className="relative mb-12">
          {/* Scroll buttons + Add button */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleAddNew}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: 'transparent',
                color: '#ffffff',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Plus className="w-5 h-5" />
            </button>

            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Cards container */}
          {isLoading ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--text-primary)', borderTopColor: 'transparent' }} />
                <p
                  className="text-base"
                  style={{
                    color: '#cccccc',
                  }}
                >
                  Loading your experience from resume...
                </p>
              </div>
            </div>
          ) : loadError ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <p
                className="text-base mb-4"
                style={{
                  color: '#fca5a5',
                }}
              >
                {loadError}
              </p>
              <button
                onClick={handleAddNew}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  }}
              >
                Add manually
              </button>
            </div>
          ) : experiences.length === 0 ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
              }}
            >
              <p
                className="text-base mb-4"
                style={{
                  color: '#cccccc',
                }}
              >
                No experience added yet. Click the + button to add your work experience.
              </p>
            </div>
          ) : (
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-4 overflow-x-auto pb-2"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="flex-shrink-0 rounded-xl p-5 relative"
                  style={{
                    width: '320px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: exp.needsReview
                      ? '1px solid rgba(239, 68, 68, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)' }}
                      >
                        <Folder className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-base leading-tight"
                          style={{
                            color: '#ffffff',
                          }}
                        >
                          {exp.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <Pencil className="w-3.5 h-3.5" style={{ color: 'var(--text-primary)' }} />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--text-primary)' }} />
                      </button>
                    </div>
                  </div>

                  {/* Company & dates */}
                  <p
                    className="text-sm mb-2"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                  >
                    {exp.company}
                    {formatDateRange(exp) && ` | ${formatDateRange(exp)}`}
                  </p>

                  {/* Description */}
                  {exp.description && (
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: 'var(--text-primary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {exp.description}
                    </p>
                  )}

                  {/* Needs review warning */}
                  {exp.needsReview && (
                    <div
                      className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    >
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#ef4444' }} />
                      <p
                        className="text-xs"
                        style={{
                          color: '#ef4444',
                        }}
                      >
                        We only got part of that. Check we're not missing anything.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Back
          </button>

          <button
            onClick={handleContinue}
            className="px-8 py-3 rounded-lg font-medium text-base transition-all duration-200"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              }}
          >
            Next, add your education
          </button>
        </div>
      </div>

      {/* ─── Edit / Add Modal ─── */}
      {showModal && editingExp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-lg rounded-xl p-6 relative"
            style={{
              backgroundColor: '#111111',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-semibold"
                style={{
                  color: '#ffffff',
                }}
              >
                {isNewEntry ? 'Add experience' : 'Edit experience'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
              >
                <X className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
              </button>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#ffffff' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={editingExp.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Junior Product Designer"
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: !editingExp.title.trim() ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    }}
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#ffffff' }}>
                  Company *
                </label>
                <input
                  type="text"
                  value={editingExp.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  placeholder="e.g. IBial Corporation"
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: !editingExp.company.trim() ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    }}
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#ffffff' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={editingExp.locationCity || ''}
                    onChange={(e) => updateField('locationCity', e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#ffffff' }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={editingExp.locationCountry || ''}
                    onChange={(e) => updateField('locationCountry', e.target.value)}
                    placeholder="Country"
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      }}
                  />
                </div>
              </div>

              {/* Start date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#ffffff' }}>
                    Start month
                  </label>
                  <CustomDropdown
                    value={editingExp.startMonth}
                    onChange={(val) => updateField('startMonth', val ? Number(val) : undefined)}
                    options={[
                      { value: undefined, label: 'Month' },
                      ...MONTHS.slice(1).map((m, i) => ({ value: i + 1, label: m }))
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#ffffff' }}>
                    Start year
                  </label>
                  <CustomDropdown
                    value={editingExp.startYear}
                    onChange={(val) => updateField('startYear', val ? Number(val) : undefined)}
                    options={[
                      { value: undefined, label: 'Year' },
                      ...yearOptions.map((y) => ({ value: y, label: y.toString() }))
                    ]}
                  />
                </div>
              </div>

              {/* Currently working here */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateField('isCurrent', !editingExp.isCurrent)}
                  className="w-5 h-5 rounded flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: editingExp.isCurrent ? 'var(--text-primary)' : 'transparent',
                    border: editingExp.isCurrent ? '1px solid var(--border-subtle)' : '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {editingExp.isCurrent && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#000" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span
                  className="text-sm"
                  style={{
                    color: '#ffffff',
                  }}
                >
                  I currently work here
                </span>
              </div>

              {/* End date (hidden if current) */}
              {!editingExp.isCurrent && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#ffffff' }}>
                      End month
                    </label>
                    <CustomDropdown
                      value={editingExp.endMonth}
                      onChange={(val) => updateField('endMonth', val ? Number(val) : undefined)}
                      options={[
                        { value: undefined, label: 'Month' },
                        ...MONTHS.slice(1).map((m, i) => ({ value: i + 1, label: m }))
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#ffffff' }}>
                      End year
                    </label>
                    <CustomDropdown
                      value={editingExp.endYear}
                      onChange={(val) => updateField('endYear', val ? Number(val) : undefined)}
                      options={[
                        { value: undefined, label: 'Year' },
                        ...yearOptions.map((y) => ({ value: y, label: y.toString() }))
                      ]}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#ffffff' }}>
                  Description
                </label>
                <textarea
                  value={editingExp.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    }}
                />
              </div>
            </div>

            {/* Modal buttons */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                disabled={!editingExp.title.trim() || !editingExp.company.trim()}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: editingExp.title.trim() && editingExp.company.trim() ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
                  color: editingExp.title.trim() && editingExp.company.trim() ? '#000000' : '#666666',
                  cursor: editingExp.title.trim() && editingExp.company.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {isNewEntry ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide scrollbar CSS */}
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
