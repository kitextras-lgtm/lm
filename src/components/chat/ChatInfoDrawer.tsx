import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronRight, Search, FileText, Link2, Calendar, Download } from 'lucide-react';
import { DEFAULT_AVATAR_DATA_URI, ELEVATE_ADMIN_AVATAR_URL } from '../DefaultAvatar';
import type { Profile } from '../../types/chat';

interface Activity {
  id: string;
  type: 'contract' | 'payment' | 'update' | 'milestone';
  title: string;
  description?: string;
  date: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  summary?: string;
}

interface SharedFile {
  id: string;
  name: string;
  type: 'file' | 'link';
  size?: string;
  url: string;
  date: string;
}

interface Participant {
  id: string;
  name: string;
  avatar_url: string | null;
  role?: string;
}

interface ChatInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
  activities?: Activity[];
  meetings?: Meeting[];
  files?: SharedFile[];
  participants?: Participant[];
  onSearchMessages?: (query: string) => void;
}

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, isOpen, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div style={{ borderBottom: '1px solid #2a2a2a' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4" style={{ color: '#64748B' }} />
        ) : (
          <ChevronRight className="w-4 h-4" style={{ color: '#64748B' }} />
        )}
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '500px' : '0' }}
      >
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ChatInfoDrawer({
  isOpen,
  onClose,
  user,
  activities = [],
  meetings = [],
  files = [],
  participants = [],
  onSearchMessages
}: ChatInfoDrawerProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    activity: false,
    search: false,
    meetings: false,
    people: false,
    files: false,
    notes: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`chat_notes_${user.id}`);
    if (savedNotes) setNotes(savedNotes);
  }, [user.id]);

  // Auto-save notes
  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
    notesTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(`chat_notes_${user.id}`, value);
    }, 500);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSearch = () => {
    if (onSearchMessages && searchQuery.trim()) {
      onSearchMessages(searchQuery);
    }
  };

  // Mock data for demo
  const mockActivities: Activity[] = activities.length > 0 ? activities : [
    { id: '1', type: 'contract', title: 'Contract signed', date: '2024-01-15' },
    { id: '2', type: 'milestone', title: 'First deliverable completed', date: '2024-01-20' },
    { id: '3', type: 'payment', title: 'Payment received', description: '$500', date: '2024-01-25' }
  ];

  const mockMeetings: Meeting[] = meetings.length > 0 ? meetings : [
    { id: '1', title: 'Kickoff call', date: '2024-01-10', summary: 'Discussed project scope and timeline' },
    { id: '2', title: 'Progress review', date: '2024-01-18', summary: 'Reviewed first draft, minor revisions needed' }
  ];

  const mockFiles: SharedFile[] = files.length > 0 ? files : [
    { id: '1', name: 'Contract.pdf', type: 'file', size: '245 KB', url: '#', date: '2024-01-15' },
    { id: '2', name: 'Brand Guidelines', type: 'link', url: '#', date: '2024-01-12' }
  ];

  const mockParticipants: Participant[] = participants.length > 0 ? participants : [
    { id: user.id, name: user.name, avatar_url: user.avatar_url, role: 'Creator' }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[360px] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
            <h2 className="text-base font-semibold" style={{ color: '#F8FAFC' }}>Details</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" style={{ color: '#94A3B8' }} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(75, 85, 99, 0.3) transparent' }}>
            {/* User Profile (Fixed, not collapsible) */}
            <div className="px-4 py-6 text-center" style={{ borderBottom: '1px solid #2a2a2a' }}>
              <img
                src={user.is_admin ? ELEVATE_ADMIN_AVATAR_URL : (user.avatar_url || DEFAULT_AVATAR_DATA_URI)}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                style={{ backgroundColor: '#0f0f13' }}
              />
              <h3 className="text-lg font-semibold mb-1" style={{ color: '#F8FAFC' }}>{user.name}</h3>
              <p className="text-sm mb-1" style={{ color: '#64748B' }}>Creator</p>
              <p className="text-xs mb-4" style={{ color: '#64748B' }}>PST (UTC-8)</p>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.3)' }}
              >
                View Contract
              </button>
            </div>

            {/* Activity Timeline */}
            <CollapsibleSection
              title="Activity Timeline"
              isOpen={openSections.activity}
              onToggle={() => toggleSection('activity')}
            >
              <div className="space-y-3">
                {mockActivities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: activity.type === 'payment' ? '#22C55E' :
                            activity.type === 'milestone' ? '#3B82F6' : '#64748B'
                        }}
                      />
                      {index < mockActivities.length - 1 && (
                        <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: '#2a2a2a' }} />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm" style={{ color: '#F8FAFC' }}>{activity.title}</p>
                      {activity.description && (
                        <p className="text-xs" style={{ color: '#64748B' }}>{activity.description}</p>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Search Messages */}
            <CollapsibleSection
              title="Search Messages"
              isOpen={openSections.search}
              onToggle={() => toggleSection('search')}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748B' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search in conversation..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    color: '#F8FAFC'
                  }}
                />
              </div>
            </CollapsibleSection>

            {/* Meeting Recaps */}
            <CollapsibleSection
              title="Meeting Recaps"
              isOpen={openSections.meetings}
              onToggle={() => toggleSection('meetings')}
            >
              <div className="space-y-3">
                {mockMeetings.map(meeting => (
                  <div
                    key={meeting.id}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: '#1a1a1a' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5" style={{ color: '#64748B' }} />
                      <span className="text-xs" style={{ color: '#64748B' }}>{meeting.date}</span>
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#F8FAFC' }}>{meeting.title}</p>
                    {meeting.summary && (
                      <p className="text-xs" style={{ color: '#94A3B8' }}>{meeting.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* People */}
            <CollapsibleSection
              title="People"
              isOpen={openSections.people}
              onToggle={() => toggleSection('people')}
            >
              <div className="space-y-2">
                {mockParticipants.map(participant => (
                  <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <img
                      src={participant.avatar_url || DEFAULT_AVATAR_DATA_URI}
                      alt={participant.name}
                      className="w-9 h-9 rounded-full object-cover"
                      style={{ backgroundColor: '#0f0f13' }}
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{participant.name}</p>
                      {participant.role && (
                        <p className="text-xs" style={{ color: '#64748B' }}>{participant.role}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Files and Links */}
            <CollapsibleSection
              title="Files and Links"
              isOpen={openSections.files}
              onToggle={() => toggleSection('files')}
            >
              <div className="space-y-2">
                {mockFiles.map(file => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {file.type === 'file' ? (
                      <FileText className="w-5 h-5" style={{ color: '#64748B' }} />
                    ) : (
                      <Link2 className="w-5 h-5" style={{ color: '#64748B' }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: '#F8FAFC' }}>{file.name}</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>
                        {file.size ? `${file.size} • ` : ''}{file.date}
                      </p>
                    </div>
                    {file.type === 'file' && (
                      <Download className="w-4 h-4 flex-shrink-0" style={{ color: '#64748B' }} />
                    )}
                  </a>
                ))}
              </div>
            </CollapsibleSection>

            {/* Personal Notepad */}
            <CollapsibleSection
              title="Personal Notepad"
              isOpen={openSections.notes}
              onToggle={() => toggleSection('notes')}
            >
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add private notes about this conversation..."
                className="w-full h-32 p-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-1"
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  color: '#F8FAFC'
                }}
              />
              <p className="text-xs mt-2" style={{ color: '#64748B' }}>
                Notes are saved automatically and only visible to you.
              </p>
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </>
  );
}
