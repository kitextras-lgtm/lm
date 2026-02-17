import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import { useProfileCreation, PortfolioItem } from '../contexts/ProfileCreationContext';

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const emptyPortfolioItem: Omit<PortfolioItem, 'id'> = {
  title: '',
  description: '',
  type: 'image',
  url: '',
  fileUrl: '',
  thumbnailUrl: '',
};

export default function FreelancerPortfolio() {
  const navigate = useNavigate();
  const { profileData, updateProfileData } = useProfileCreation();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(profileData.portfolioItems || []);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);

  const handleAddNew = () => {
    setEditingItem({ id: generateId(), ...emptyPortfolioItem });
    setIsNewEntry(true);
    setShowModal(true);
  };


  const handleSaveModal = () => {
    if (!editingItem || !editingItem.title.trim()) return;

    if (isNewEntry) {
      setPortfolioItems(prev => [...prev, editingItem]);
    } else {
      setPortfolioItems(prev => prev.map(item => item.id === editingItem.id ? editingItem : item));
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleBack = () => navigate(-1);

  const handleContinue = () => {
    updateProfileData({ portfolioItems });
    navigate('/freelancer-onboarding');
  };

  const updateField = (field: keyof PortfolioItem, value: any) => {
    if (!editingItem) return;
    setEditingItem({ ...editingItem, [field]: value });
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
            8/10
          </p>
          <div
            className="h-1 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ backgroundColor: '#94A3B8', width: '80%' }}
            />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-normal mb-3"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#ffffff' }}
        >
          Let's add your portfolio
        </h1>

        <p
          className="text-lg mb-12"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: '#94A3B8',
          }}
        >
          Add your best work - images, documents, or links to external sites.
        </p>

        {/* Portfolio content section */}
        <div className="mb-12">
          <h2
            className="text-2xl font-semibold mb-4"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              color: '#ffffff',
            }}
          >
            Portfolio Content
          </h2>
          
          <div className="space-y-6">
            {/* Portfolio items with specific layout */}
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div className="flex items-start gap-4">
                {/* Left side - Image/Icon */}
                <div
                  className="w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)' }}
                >
                  <ImageIcon size={32} color="#94A3B8" />
                </div>
                
                {/* Right side - Content */}
                <div className="flex-1">
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      color: '#ffffff',
                    }}
                  >
                    Project Title
                  </h3>
                  <p
                    className="text-base mb-3"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      color: '#94A3B8',
                    }}
                  >
                    Brief description of the project, the challenge, and the solution. This is where you can showcase your work and explain what makes it special.
                  </p>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-sm px-3 py-1 rounded-full"
                      style={{
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        backgroundColor: 'rgba(148, 163, 184, 0.2)',
                        color: '#94A3B8',
                      }}
                    >
                      Web Design
                    </span>
                    <span
                      className="text-sm px-3 py-1 rounded-full"
                      style={{
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        backgroundColor: 'rgba(148, 163, 184, 0.2)',
                        color: '#94A3B8',
                      }}
                    >
                      2024
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add more portfolio items button */}
            <button
              onClick={handleAddNew}
              className="w-full rounded-xl p-6 flex items-center justify-center gap-3 transition-all duration-200 hover:brightness-110"
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
                Add portfolio item
              </span>
            </button>
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
            Complete profile
          </button>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showModal && editingItem && (
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
                {isNewEntry ? 'Add Portfolio Item' : 'Edit Portfolio Item'}
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
                  Title *
                </label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Website Redesign, Mobile App UI"
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
                  Description
                </label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your work, the challenge, and the outcome..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200 resize-none"
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
                  Type
                </label>
                <select
                  value={editingItem.type}
                  onChange={(e) => updateField('type', e.target.value as 'image' | 'document' | 'link')}
                  className="w-full px-4 py-3 rounded-lg text-base outline-none appearance-none transition-all duration-200"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                  }}
                >
                  <option value="image" style={{ backgroundColor: '#111111' }}>Image</option>
                  <option value="document" style={{ backgroundColor: '#111111' }}>Document</option>
                  <option value="link" style={{ backgroundColor: '#111111' }}>External Link</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#94A3B8',
                  }}
                >
                  {editingItem.type === 'link' ? 'URL' : 'File Upload'}
                </label>
                {editingItem.type === 'link' ? (
                  <input
                    type="url"
                    value={editingItem.url || ''}
                    onChange={(e) => updateField('url', e.target.value)}
                    placeholder="https://example.com/your-work"
                    className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                    }}
                  />
                ) : (
                  <div
                    className="w-full px-4 py-8 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <ImageIcon size={32} color="#94A3B8" />
                    <span
                      className="text-sm"
                      style={{
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        color: '#94A3B8',
                      }}
                    >
                      Click to upload or drag and drop
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        color: '#64748B',
                      }}
                    >
                      {editingItem.type === 'image' ? 'PNG, JPG, GIF up to 10MB' : 'PDF, DOC, DOCX up to 10MB'}
                    </span>
                  </div>
                )}
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
                disabled={!editingItem.title.trim()}
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
