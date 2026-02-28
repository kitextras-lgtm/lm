import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, X } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown';
import { useProfileCreation, Education } from '../contexts/ProfileCreationContext';

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDateRange(edu: Education): string {
  const startStr = edu.startMonth && edu.startYear
    ? `${MONTHS[edu.startMonth]} ${edu.startYear}`
    : edu.startYear
      ? `${edu.startYear}`
      : '';
  const endStr = edu.isCurrent
    ? 'Present'
    : edu.endMonth && edu.endYear
      ? `${MONTHS[edu.endMonth]} ${edu.endYear}`
      : edu.endYear
        ? `${edu.endYear}`
        : '';
  if (!startStr && !endStr) return '';
  if (!endStr) return startStr;
  return `${startStr} - ${endStr}`;
}

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const emptyEducation: Omit<Education, 'id'> = {
  school: '',
  degree: '',
  fieldOfStudy: '',
  startMonth: undefined,
  startYear: undefined,
  endMonth: undefined,
  endYear: undefined,
  isCurrent: false,
  description: '',
};

export default function FreelancerEducation() {
  const navigate = useNavigate();
  const { profileData, updateProfileData } = useProfileCreation();
  const [educations, setEducations] = useState<Education[]>(profileData.educations || []);
  const [showModal, setShowModal] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
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
  }, [educations]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 340;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  const handleAddNew = () => {
    setEditingEdu({ id: generateId(), ...emptyEducation });
    setIsNewEntry(true);
    setShowModal(true);
  };

  const handleEdit = (edu: Education) => {
    setEditingEdu({ ...edu });
    setIsNewEntry(false);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setEducations(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveModal = () => {
    if (!editingEdu || !editingEdu.school.trim() || !editingEdu.degree.trim()) return;

    if (isNewEntry) {
      setEducations(prev => [...prev, editingEdu]);
    } else {
      setEducations(prev => prev.map(e => e.id === editingEdu.id ? editingEdu : e));
    }
    setShowModal(false);
    setEditingEdu(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEdu(null);
  };

  const handleBack = () => navigate(-1);

  const handleContinue = () => {
    updateProfileData({ educations });
    navigate('/freelancer-languages');
  };

  const updateField = (field: keyof Education, value: any) => {
    if (!editingEdu) return;
    setEditingEdu({ ...editingEdu, [field]: value });
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
            6/10
          </p>
          <div
            className="h-1 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ backgroundColor: 'var(--text-primary)', width: '60%' }}
            />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-normal mb-3"
          style={{ color: '#ffffff' }}
        >
          And here's what we picked up on your education — is it right?
        </h1>

        <p
          className="text-lg mb-12"
          style={{
            color: 'var(--text-primary)',
          }}
        >
          Again, this is worth taking a moment on. People who include their education get seen three times more.
        </p>

        {/* Education cards */}
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
                  color: '#ffffff',
                }}
              >
                Add education
              </span>
            </button>

            {/* Education cards */}
            {educations.map((edu) => (
              <div
                key={edu.id}
                className="flex-shrink-0 w-80 rounded-xl p-6 relative"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(edu)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:brightness-110"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Pencil size={14} color="#94A3B8" />
                  </button>
                  <button
                    onClick={() => handleDelete(edu.id)}
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
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-lg font-semibold mb-1 truncate"
                      style={{
                        color: '#ffffff',
                      }}
                    >
                      {edu.school}
                    </h3>
                    <p
                      className="text-sm truncate"
                      style={{
                        color: 'var(--text-primary)',
                      }}
                    >
                      {edu.degree}
                      {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                    </p>
                  </div>
                </div>

                {formatDateRange(edu) && (
                  <p
                    className="text-sm mb-3"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                  >
                    {formatDateRange(edu)}
                  </p>
                )}

                {edu.description && (
                  <p
                    className="text-sm line-clamp-3"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                  >
                    {edu.description}
                  </p>
                )}
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
              }}
          >
            Next, add languages
          </button>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showModal && editingEdu && (
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
                  color: '#ffffff',
                }}
              >
                {isNewEntry ? 'Add Education' : 'Edit Education'}
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
                    color: 'var(--text-primary)',
                  }}
                >
                  School *
                </label>
                <input
                  type="text"
                  value={editingEdu.school}
                  onChange={(e) => updateField('school', e.target.value)}
                  placeholder="e.g. University of Mindanao"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
                  style={{
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
                    color: 'var(--text-primary)',
                  }}
                >
                  Degree *
                </label>
                <input
                  type="text"
                  value={editingEdu.degree}
                  onChange={(e) => updateField('degree', e.target.value)}
                  placeholder="e.g. Bachelor of Science"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
                  style={{
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
                    color: 'var(--text-primary)',
                  }}
                >
                  Field of Study
                </label>
                <input
                  type="text"
                  value={editingEdu.fieldOfStudy || ''}
                  onChange={(e) => updateField('fieldOfStudy', e.target.value)}
                  placeholder="e.g. Computer Applications"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                  >
                    Start Month
                  </label>
                  <CustomDropdown
                    value={editingEdu.startMonth}
                    onChange={(val) => updateField('startMonth', val ? Number(val) : undefined)}
                    options={[
                      { value: undefined, label: 'Month' },
                      ...MONTHS.slice(1).map((m, i) => ({ value: i + 1, label: m }))
                    ]}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                  >
                    Start Year
                  </label>
                  <CustomDropdown
                    value={editingEdu.startYear}
                    onChange={(val) => updateField('startYear', val ? Number(val) : undefined)}
                    options={[
                      { value: undefined, label: 'Year' },
                      ...yearOptions.map((y) => ({ value: y, label: y.toString() }))
                    ]}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingEdu.isCurrent}
                  onChange={(e) => updateField('isCurrent', e.target.checked)}
                  className="w-4 h-4"
                />
                <label
                  className="text-sm"
                  style={{
                    color: 'var(--text-primary)',
                  }}
                >
                  I currently study here
                </label>
              </div>

              {!editingEdu.isCurrent && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: 'var(--text-primary)',
                      }}
                    >
                      End Month
                    </label>
                    <CustomDropdown
                      value={editingEdu.endMonth}
                      onChange={(val) => updateField('endMonth', val ? Number(val) : undefined)}
                      options={[
                        { value: undefined, label: 'Month' },
                        ...MONTHS.slice(1).map((m, i) => ({ value: i + 1, label: m }))
                      ]}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: 'var(--text-primary)',
                      }}
                    >
                      End Year
                    </label>
                    <CustomDropdown
                      value={editingEdu.endYear}
                      onChange={(val) => updateField('endYear', val ? Number(val) : undefined)}
                      options={[
                        { value: undefined, label: 'Year' },
                        ...yearOptions.map((y) => ({ value: y, label: y.toString() }))
                      ]}
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    color: 'var(--text-primary)',
                  }}
                >
                  Description
                </label>
                <textarea
                  value={editingEdu.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your studies, achievements, or activities..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200 resize-none"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-6 py-3 rounded-lg font-medium text-base transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                disabled={!editingEdu.school.trim() || !editingEdu.degree.trim()}
                className="flex-1 px-6 py-3 rounded-lg font-medium text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
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
