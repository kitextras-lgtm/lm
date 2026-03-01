import { useState, useRef, useEffect } from 'react';
import { useFriends, FriendRelationship, SearchedUser } from '../../hooks/useFriends';

interface FriendsPanelProps {
  currentUserId: string;
  onStartChat?: (userId: string, user: { id: string; username: string | null; first_name: string | null; last_name: string | null; profile_picture_url: string | null }) => void;
}

type Tab = 'all' | 'pending' | 'blocked' | 'add';

function Avatar({ user, size = 36 }: { user: { first_name?: string | null; last_name?: string | null; username?: string | null; profile_picture_url?: string | null }; size?: number }) {
  const initials = user.first_name?.[0] || user.username?.[0] || '?';
  if (user.profile_picture_url) {
    return (
      <img
        src={user.profile_picture_url}
        alt={user.username || ''}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.38, fontWeight: 600, color: 'var(--text-primary)',
      }}
    >
      {initials.toUpperCase()}
    </div>
  );
}

function displayName(user: { first_name?: string | null; last_name?: string | null; username?: string | null }) {
  if (user.first_name) return [user.first_name, user.last_name].filter(Boolean).join(' ');
  return user.username || 'Unknown';
}

function FriendRow({ rel, onRemove, onBlock, onChat }: {
  rel: FriendRelationship;
  currentUserId?: string;
  onRemove: () => void;
  onBlock: () => void;
  onChat?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:brightness-110 group" style={{ backgroundColor: 'var(--bg-elevated)' }}>
      <Avatar user={rel.user} size={38} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{displayName(rel.user)}</p>
        {rel.user.username && <p className="text-xs truncate" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>@{rel.user.username}</p>}
      </div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {onChat && (
          <button onClick={onChat} title="Message" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:brightness-110" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </button>
        )}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(v => !v)} title="More" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:brightness-110" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
              <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 rounded-xl z-50 py-1 min-w-[140px]" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              <button onClick={() => { onRemove(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm transition-all hover:brightness-110" style={{ color: 'var(--text-primary)', backgroundColor: 'transparent' }}>Remove Friend</button>
              <button onClick={() => { onBlock(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm transition-all hover:brightness-110" style={{ color: 'var(--text-primary)', opacity: 0.7, backgroundColor: 'transparent' }}>Block</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PendingRow({ rel, currentUserId, onAccept, onDecline, onCancel }: {
  rel: FriendRelationship;
  currentUserId: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
}) {
  const isIncoming = rel.addressee_id === currentUserId;
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
      <Avatar user={rel.user} size={38} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{displayName(rel.user)}</p>
        <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>{isIncoming ? 'Incoming request' : 'Outgoing request'}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {isIncoming && onAccept && (
          <button onClick={onAccept} title="Accept" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:brightness-110" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </button>
        )}
        {isIncoming && onDecline && (
          <button onClick={onDecline} title="Decline" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:brightness-110" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', opacity: 0.6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
        {!isIncoming && onCancel && (
          <button onClick={onCancel} title="Cancel request" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:brightness-110" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', opacity: 0.6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function BlockedRow({ rel, onUnblock }: { rel: FriendRelationship; onUnblock: () => void }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
      <Avatar user={rel.user} size={38} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{displayName(rel.user)}</p>
        {rel.user.username && <p className="text-xs truncate" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>@{rel.user.username}</p>}
      </div>
      <button onClick={onUnblock} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>Unblock</button>
    </div>
  );
}

function AddFriendTab({ currentUserId, onRequestSent }: { currentUserId: string; onRequestSent: () => void }) {
  const { searchUsers, sendRequest } = useFriends(currentUserId);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const r = await searchUsers(q);
      setResults(r);
    } finally {
      setSearching(false);
    }
  };

  const handleInput = (v: string) => {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(v), 350);
  };

  const handleSend = async (user: SearchedUser) => {
    setSending(user.id);
    try {
      await sendRequest(user.id);
      setSentIds(prev => new Set([...prev, user.id]));
      onRequestSent();
      // Update result in place
      setResults(prev => prev.map(u => u.id === user.id ? { ...u, relationship: { id: '', status: 'pending', requester_id: currentUserId } } : u));
    } finally {
      setSending(null);
    }
  };

  const getActionLabel = (user: SearchedUser) => {
    if (sentIds.has(user.id)) return 'Sent';
    if (!user.relationship) return 'Add Friend';
    if (user.relationship.status === 'accepted') return 'Friends';
    if (user.relationship.status === 'pending') {
      return user.relationship.requester_id === currentUserId ? 'Pending' : 'Accept';
    }
    if (user.relationship.status === 'blocked') return 'Blocked';
    return 'Add Friend';
  };

  const canSend = (user: SearchedUser) => {
    if (sentIds.has(user.id)) return false;
    if (!user.relationship) return true;
    if (user.relationship.status === 'declined') return true;
    return false;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-3">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>Add Friend</p>
        <div
          className="flex items-center h-10 px-3 rounded-xl transition-all"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'var(--text-primary)')}
          onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15, flexShrink: 0, color: 'var(--text-primary)', opacity: 0.45, marginRight: 8 }}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search by username…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {searching && (
            <div className="w-3.5 h-3.5 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--text-primary)' }} />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5" style={{ scrollbarWidth: 'thin' }}>
        {results.length === 0 && query.trim() && !searching && (
          <p className="text-center text-sm py-8" style={{ color: 'var(--text-primary)', opacity: 0.4 }}>No users found for "{query}"</p>
        )}
        {results.map(user => (
          <div key={user.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <Avatar user={user} size={38} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{displayName(user)}</p>
              {user.username && <p className="text-xs truncate" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>@{user.username}</p>}
            </div>
            <button
              onClick={() => canSend(user) ? handleSend(user) : undefined}
              disabled={!canSend(user) || sending === user.id}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', minWidth: 80 }}
            >
              {sending === user.id ? '…' : getActionLabel(user)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FriendsPanel({ currentUserId, onStartChat }: FriendsPanelProps) {
  const [tab, setTab] = useState<Tab>('all');
  const {
    friends, incoming, outgoing, blocked, loading,
    acceptRequest, declineRequest, cancelRequest,
    removeFriend, blockUser, unblockUser,
    refetch,
  } = useFriends(currentUserId);

  const pendingCount = incoming.length + outgoing.length;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'all', label: 'All Friends', badge: friends.length || undefined },
    { id: 'pending', label: 'Pending', badge: pendingCount || undefined },
    { id: 'blocked', label: 'Blocked' },
    { id: 'add', label: 'Add Friend' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
            style={{
              backgroundColor: tab === t.id ? 'var(--bg-elevated)' : 'transparent',
              color: 'var(--text-primary)',
              opacity: tab === t.id ? 1 : 0.55,
              border: tab === t.id ? '1px solid var(--border-subtle)' : '1px solid transparent',
            }}
          >
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: 10, lineHeight: 1, minWidth: 18, textAlign: 'center' }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin' }}>
        {tab === 'add' ? (
          <AddFriendTab currentUserId={currentUserId} onRequestSent={refetch} />
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--text-primary)' }} />
          </div>
        ) : (
          <div className="p-4 space-y-1.5">
            {/* ALL FRIENDS */}
            {tab === 'all' && (
              <>
                {friends.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24, color: 'var(--text-primary)', opacity: 0.4 }}>
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No friends yet</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>Search for users to send a friend request.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>
                      All Friends — {friends.length}
                    </p>
                    {friends.map(rel => (
                      <FriendRow
                        key={rel.id}
                        rel={rel}
                        currentUserId={currentUserId}
                        onRemove={() => removeFriend(rel.user.id)}
                        onBlock={() => blockUser(rel.user.id)}
                        onChat={onStartChat ? () => onStartChat(rel.user.id, rel.user as any) : undefined}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {/* PENDING */}
            {tab === 'pending' && (
              <>
                {pendingCount === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No pending requests</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>Friend requests you send and receive appear here.</p>
                  </div>
                ) : (
                  <>
                    {incoming.length > 0 && (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>Incoming — {incoming.length}</p>
                        {incoming.map(rel => (
                          <PendingRow
                            key={rel.id}
                            rel={rel}
                            currentUserId={currentUserId}
                            onAccept={() => acceptRequest(rel.id)}
                            onDecline={() => declineRequest(rel.id)}
                          />
                        ))}
                        {outgoing.length > 0 && <div className="my-3" style={{ borderTop: '1px solid var(--border-subtle)' }} />}
                      </>
                    )}
                    {outgoing.length > 0 && (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>Outgoing — {outgoing.length}</p>
                        {outgoing.map(rel => (
                          <PendingRow
                            key={rel.id}
                            rel={rel}
                            currentUserId={currentUserId}
                            onCancel={() => cancelRequest(rel.id)}
                          />
                        ))}
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {/* BLOCKED */}
            {tab === 'blocked' && (
              <>
                {blocked.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No blocked users</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>Blocked — {blocked.length}</p>
                    {blocked.map(rel => (
                      <BlockedRow key={rel.id} rel={rel} onUnblock={() => unblockUser(rel.user.id)} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
