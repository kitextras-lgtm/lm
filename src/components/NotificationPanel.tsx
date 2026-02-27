import { useState, useEffect, useRef } from 'react';

export interface AppNotification {
  id: string;
  type: 'approved_release' | 'declined_application' | 'message' | 'announcement' | 'campaign_assigned';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  action?: { label: string; onClick: () => void };
}

interface NotificationPanelProps {
  userId: string;
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onAction?: (id: string) => void;
}


// Panel notification item
function NotifItem({
  notif,
  onDismiss,
}: {
  notif: AppNotification;
  onDismiss: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const icon = notif.type === 'approved_release' ? (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
    </svg>
  ) : notif.type === 'declined_application' ? (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ) : notif.type === 'message' ? (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ) : (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="13" /><circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  );

  return (
    <div
      className="relative group px-4 py-3.5 transition-all duration-150"
      style={{
        backgroundColor: hovered ? 'var(--bg-elevated)' : 'transparent',
        borderBottom: '1px solid var(--border-subtle)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0 pr-6">
          <p className="text-sm font-semibold leading-snug mb-0.5" style={{ color: 'var(--text-primary)' }}>
            {notif.title}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)', opacity: 0.6 }}>
            {notif.body}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.4 }}>
              {new Date(notif.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {notif.action && (
              <button
                onClick={() => notif.action!.onClick()}
                className="text-xs font-semibold transition-all hover:opacity-70"
                style={{ color: 'var(--text-primary)' }}
              >
                {notif.action.label} →
              </button>
            )}
          </div>
        </div>
        {/* Dismiss X button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
          className="absolute top-3 right-3 w-5 h-5 rounded-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:brightness-110"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function NotificationBell({
  notifications,
  onDismiss,
  onDismissAll,
}: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:brightness-110"
        style={{
          backgroundColor: open ? 'var(--bg-elevated)' : 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <g style={{ transformOrigin: '12px 4px', animation: hovered ? 'bellRingNotif 0.6s ease-in-out' : 'none' }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          </g>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          {hasUnread && (
            <circle cx="18" cy="5" r="3.5" fill="currentColor" stroke="none" className="animate-pulse" />
          )}
        </svg>
        {hasUnread && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold px-1"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', lineHeight: 1 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out panel */}
      <div
        ref={panelRef}
        className="absolute right-0 top-12 z-50 rounded-2xl overflow-hidden"
        style={{
          width: '360px',
          maxWidth: 'calc(100vw - 24px)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.15)',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s cubic-bezier(0.4,0,0.2,1), transform 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</span>
            {hasUnread && (
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={onDismissAll}
              className="text-xs font-medium transition-all hover:opacity-70"
              style={{ color: 'var(--text-primary)', opacity: 0.5 }}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Notification list */}
        <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.3 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', opacity: 0.4 }}>No notifications</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-primary)', opacity: 0.3 }}>You're all caught up</p>
            </div>
          ) : (
            notifications.map(notif => (
              <NotifItem key={notif.id} notif={notif} onDismiss={onDismiss} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
