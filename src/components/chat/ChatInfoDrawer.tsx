import { useState, useEffect, useRef, useMemo } from 'react';
import { DEFAULT_AVATAR_DATA_URI, ELEVATE_ADMIN_AVATAR_URL } from '../DefaultAvatar';
import type { Profile, Message } from '../../types/chat';

interface ChatInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
  messages?: Message[];
  currentUserId?: string;
  currentUserProfile?: { name: string; avatar_url?: string | null; username?: string; user_type?: string };
  contractUrl?: string;
}

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, isOpen, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round"
          style={{ color: 'var(--text-primary)', opacity: 0.5 }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '600px' : '0' }}
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
  messages = [],
  currentUserId,
  currentUserProfile,
  contractUrl,
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
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
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

  // Reset search when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

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

  // Real message search
  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const results = messages.filter(m =>
      !m.deleted_at && m.content && m.content.toLowerCase().includes(q)
    );
    setSearchResults(results);
    setHasSearched(true);
  };

  // Real files/links extracted from messages
  const sharedMedia = useMemo(() => {
    const items: { id: string; type: 'image' | 'link'; url: string; content?: string; date: string }[] = [];
    for (const m of messages) {
      if (m.deleted_at) continue;
      if (m.type === 'image' && m.image_url) {
        items.push({ id: m.id, type: 'image', url: m.image_url, date: m.created_at });
      } else if (m.type === 'text' && m.content) {
        const urlMatch = m.content.match(/https?:\/\/[^\s]+/g);
        if (urlMatch) {
          urlMatch.forEach(url => {
            items.push({ id: `${m.id}-${url}`, type: 'link', url, content: url.replace(/^https?:\/\//i, ''), date: m.created_at });
          });
        }
      }
    }
    return items.slice().reverse();
  }, [messages]);

  const formatMsgDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  };

  // Participants: current user (self) + other user
  const participants = useMemo(() => {
    const list = [];
    // Self
    if (currentUserProfile) {
      list.push({
        id: currentUserId || 'self',
        name: currentUserProfile.name,
        avatar_url: currentUserProfile.avatar_url || null,
        role: currentUserProfile.user_type ? (currentUserProfile.user_type.charAt(0).toUpperCase() + currentUserProfile.user_type.slice(1)) : 'You',
        isSelf: true,
      });
    }
    // Other user
    list.push({
      id: user.id,
      name: user.name,
      avatar_url: user.is_admin ? ELEVATE_ADMIN_AVATAR_URL : (user.avatar_url || null),
      role: user.user_type ? (user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)) : (user.is_admin ? 'Support' : 'User'),
      isSelf: false,
    });
    return list;
  }, [user, currentUserId, currentUserProfile]);

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
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Details</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.6 }}><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(75, 85, 99, 0.3) transparent' }}>
            {/* User Profile (Fixed, not collapsible) */}
            <div className="px-4 py-6 text-center" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <img
                src={user.is_admin ? ELEVATE_ADMIN_AVATAR_URL : (user.avatar_url || DEFAULT_AVATAR_DATA_URI)}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                style={{ backgroundColor: 'var(--bg-elevated)' }}
              />
              <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{user.name}</h3>
              {user.username && (
                <p className="text-sm mb-1" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>@{user.username}</p>
              )}
              {user.user_type && !user.is_admin && (
                <p className="text-xs mb-3 capitalize" style={{ color: 'var(--text-primary)', opacity: 0.4 }}>{user.user_type}</p>
              )}
              {/* Only show View Contract if contractUrl is provided */}
              {contractUrl && (
                <a
                  href={contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:brightness-110"
                  style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  View Contract
                </a>
              )}
            </div>

            {/* Activity Timeline */}
            <CollapsibleSection
              title="Activity Timeline"
              isOpen={openSections.activity}
              onToggle={() => toggleSection('activity')}
            >
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.4 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>No Activity</p>
                <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.4 }}>Activity will appear here when actions are taken.</p>
              </div>
            </CollapsibleSection>

            {/* Search Messages */}
            <CollapsibleSection
              title="Search Messages"
              isOpen={openSections.search}
              onToggle={() => toggleSection('search')}
            >
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" style={{ color: 'var(--text-primary)', opacity: 0.4 }}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); if (!e.target.value.trim()) { setSearchResults([]); setHasSearched(false); } }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search in conversation..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                    style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                  >
                    Search
                  </button>
                </div>
                {hasSearched && searchResults.length === 0 && (
                  <p className="text-sm text-center py-3" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>No messages found for "{searchQuery}"</p>
                )}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {searchResults.map(msg => (
                      <div key={msg.id} className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>
                          {msg.sender_id === currentUserId ? 'You' : user.name} · {formatMsgDate(msg.created_at)}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Meeting Recaps */}
            <CollapsibleSection
              title="Meeting Recaps"
              isOpen={openSections.meetings}
              onToggle={() => toggleSection('meetings')}
            >
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.4 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>No Activity</p>
                <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.4 }}>Meeting recaps will appear here once meetings are scheduled.</p>
              </div>
            </CollapsibleSection>

            {/* People */}
            <CollapsibleSection
              title="People"
              isOpen={openSections.people}
              onToggle={() => toggleSection('people')}
            >
              <div className="space-y-2">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <img
                      src={participant.avatar_url || DEFAULT_AVATAR_DATA_URI}
                      alt={participant.name}
                      className="w-9 h-9 rounded-full object-cover"
                      style={{ backgroundColor: 'var(--bg-elevated)' }}
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{participant.name}</p>
                      {participant.role && (
                        <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>{participant.role}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Files and Links */}
            <CollapsibleSection
              title="Files & Links"
              isOpen={openSections.files}
              onToggle={() => toggleSection('files')}
            >
              {sharedMedia.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.4 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  </div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>No Activity</p>
                  <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.4 }}>Images and links shared in this conversation will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sharedMedia.map(item => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      {item.type === 'image' ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                          <img src={item.url} alt="shared" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.5 }}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate font-medium" style={{ color: 'var(--text-primary)' }}>{item.content || item.url.replace(/^https?:\/\//i, '')}</p>
                        <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.4 }}>{formatMsgDate(item.date)}</p>
                      </div>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.4 }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  ))}
                </div>
              )}
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
                className="w-full h-32 p-3 rounded-lg text-sm resize-none focus:outline-none"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-primary)', opacity: 0.4 }}>
                Notes are saved automatically and only visible to you.
              </p>
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </>
  );
}
