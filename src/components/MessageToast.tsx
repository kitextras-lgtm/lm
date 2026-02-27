import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ELEVATE_ADMIN_AVATAR_URL } from './DefaultAvatar';
import { themeTokens } from '../lib/themeTokens';
import type { Theme } from '../lib/themeTokens';

interface ToastMessage {
  id: string;
  conversationId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  timestamp: number;
}

interface MessageToastProps {
  userId: string | null;
  activeSection: string;
  onNavigateToMessages: () => void;
  theme?: Theme;
  enabled?: boolean;
  playSound?: boolean;
  showFaviconBadge?: boolean;
  unreadCount?: number;
}

export function MessageToast({ userId, activeSection, onNavigateToMessages, theme = 'dark', enabled = true, playSound = false, showFaviconBadge = false, unreadCount = 0 }: MessageToastProps) {
  const t = themeTokens[theme];
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set());
  const dismissTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const exitTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const seenMessageIds = useRef<Set<string>>(new Set());
  // Use a ref so the realtime callback always reads the latest value (avoids stale closure)
  const enabledRef = useRef(enabled);
  const playSoundRef = useRef(playSound);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { playSoundRef.current = playSound; }, [playSound]);
  // Also clear any visible toasts immediately when disabled
  useEffect(() => { if (!enabled) { setToasts([]); setDismissingIds(new Set()); } }, [enabled]);

  // Favicon badge effect
  const faviconLinkRef = useRef<HTMLLinkElement | null>(null);
  useEffect(() => {
    if (!showFaviconBadge) {
      // Restore original favicon
      const link = faviconLinkRef.current || (document.querySelector("link[rel~='icon']") as HTMLLinkElement | null);
      if (link) link.href = '/favicon.ico';
      return;
    }
    if (unreadCount <= 0) {
      const link = faviconLinkRef.current || (document.querySelector("link[rel~='icon']") as HTMLLinkElement | null);
      if (link) link.href = '/favicon.ico';
      return;
    }
    // Draw badge on canvas
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.src = '/favicon.ico';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 32, 32);
      // Badge circle
      const badgeSize = 13;
      const x = 32 - badgeSize;
      const y = 0;
      ctx.beginPath();
      ctx.arc(x, y + badgeSize, badgeSize / 1.3, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      // Badge count
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(unreadCount > 99 ? '99+' : String(unreadCount), x, y + badgeSize);
      // Apply to favicon
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = canvas.toDataURL('image/png');
      faviconLinkRef.current = link;
    };
    img.onerror = () => {
      // Fallback: draw plain red circle if favicon fails to load
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(unreadCount > 99 ? '99+' : String(unreadCount), 16, 16);
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = canvas.toDataURL('image/png');
      faviconLinkRef.current = link;
    };
  }, [showFaviconBadge, unreadCount]);

  const dismissToast = useCallback((id: string) => {
    // Clear auto-dismiss timer
    const timer = dismissTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      dismissTimers.current.delete(id);
    }
    // Mark as dismissing to trigger exit animation
    setDismissingIds(prev => new Set(prev).add(id));
    // Remove from DOM after animation completes (350ms)
    const exitTimer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      setDismissingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      exitTimers.current.delete(id);
    }, 350);
    exitTimers.current.set(id, exitTimer);
  }, []);

  const scheduleAutoDismiss = useCallback((id: string) => {
    // Clear ALL existing timers before setting a new one (only 1 toast at a time)
    dismissTimers.current.forEach((timer) => clearTimeout(timer));
    dismissTimers.current.clear();
    const timer = setTimeout(() => {
      dismissToast(id);
    }, 5000);
    dismissTimers.current.set(id, timer);
  }, [dismissToast]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`message-toast-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const msg = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
            type: string;
          };

          // Don't show toast for own messages
          if (msg.sender_id === userId) return;
          // Don't show duplicate toasts
          if (seenMessageIds.current.has(msg.id)) return;
          // Don't show if already in messages section
          if (activeSection === 'messages') return;
          // Don't show if user has disabled message notifications
          if (!enabledRef.current) return;

          // Verify this message belongs to a conversation the user is part of
          const { data: conv } = await supabase
            .from('conversations')
            .select('id, customer_id, admin_id')
            .eq('id', msg.conversation_id)
            .or(`customer_id.eq.${userId},admin_id.eq.${userId}`)
            .maybeSingle();

          if (!conv) return;

          seenMessageIds.current.add(msg.id);

          // Play notification sound if enabled
          if (playSoundRef.current) {
            try {
              const audio = new Audio('/elevate notification ping v1.wav');
              audio.volume = 0.7;
              audio.play().catch(() => {});
            } catch {}
          }

          // Fetch sender info — try unified_users first (covers all user types + avatar)
          let senderName = 'Someone';
          let senderAvatar: string | null = null;

          const { data: unifiedUser } = await supabase
            .from('unified_users')
            .select('display_name, first_name, last_name, username, avatar_url, is_admin')
            .eq('id', msg.sender_id)
            .maybeSingle();

          if (unifiedUser) {
            if (unifiedUser.is_admin) {
              senderName = unifiedUser.display_name || 'Elevate';
              senderAvatar = unifiedUser.avatar_url || ELEVATE_ADMIN_AVATAR_URL;
            } else {
              const fullName = unifiedUser.display_name ||
                [unifiedUser.first_name, unifiedUser.last_name].filter(Boolean).join(' ');
              senderName = fullName || unifiedUser.username || 'Someone';
              senderAvatar = unifiedUser.avatar_url || null;
            }
          } else {
            // Fallback: check profiles table (admin-only profiles)
            const { data: adminProfile } = await supabase
              .from('profiles')
              .select('name, avatar_url, is_admin')
              .eq('id', msg.sender_id)
              .maybeSingle();
            if (adminProfile?.is_admin) {
              senderName = adminProfile.name || 'Elevate';
              senderAvatar = adminProfile.avatar_url || ELEVATE_ADMIN_AVATAR_URL;
            }
          }

          const toast: ToastMessage = {
            id: msg.id,
            conversationId: msg.conversation_id,
            senderName,
            senderAvatar,
            content: msg.type === 'image' ? '📷 Photo' : msg.content,
            timestamp: Date.now(),
          };

          // Replace any existing toast — only show 1 at a time
          setToasts([toast]);
          scheduleAutoDismiss(msg.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, activeSection, scheduleAutoDismiss]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      dismissTimers.current.forEach(t => clearTimeout(t));
      exitTimers.current.forEach(t => clearTimeout(t));
    };
  }, []);

  if (toasts.length === 0) return null;

  // Derive a slightly elevated background from the theme's active/elevated token
  const toastBg = theme === 'dark'
    ? 'rgba(15, 15, 19, 0.95)'
    : theme === 'grey'
    ? 'rgba(30, 30, 36, 0.95)'
    : theme === 'rose'
    ? 'rgba(28, 10, 22, 0.95)'
    : theme === 'white'
    ? 'rgba(255, 255, 255, 0.97)'
    : 'rgba(20, 30, 50, 0.95)';

  const toastBorder = theme === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : theme === 'grey'
    ? 'rgba(255,255,255,0.1)'
    : theme === 'rose'
    ? 'rgba(180,80,140,0.25)'
    : theme === 'white'
    ? 'rgba(15,23,42,0.15)'
    : 'rgba(255,255,255,0.15)';

  const avatarFallbackBg = t.bg.active;
  const dismissBtnBg = theme === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : theme === 'grey'
    ? 'rgba(255,255,255,0.08)'
    : theme === 'rose'
    ? 'rgba(255,255,255,0.08)'
    : theme === 'white'
    ? 'rgba(15,23,42,0.08)'
    : 'rgba(255,255,255,0.1)';

  return (
    <div
      className="fixed top-4 left-1/2 z-[9999] flex flex-col gap-2 pointer-events-none"
      style={{ transform: 'translateX(-50%)', width: 'min(360px, calc(100vw - 32px))' }}
    >
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            animation: dismissingIds.has(toast.id)
              ? 'messageToastSlideUp 0.35s cubic-bezier(0.4, 0, 1, 1) forwards'
              : 'messageToastSlideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            opacity: 0,
            animationDelay: dismissingIds.has(toast.id) ? '0ms' : `${index * 60}ms`,
            animationFillMode: 'forwards',
          }}
        >
          <div
            onClick={() => {
              dismissToast(toast.id);
              onNavigateToMessages();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer select-none"
            style={{
              backgroundColor: toastBg,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${toastBorder}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden" style={{ border: `1.5px solid ${toastBorder}` }}>
              {toast.senderAvatar ? (
                <img src={toast.senderAvatar} alt={toast.senderName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: avatarFallbackBg, color: t.text.secondary }}>
                  {toast.senderName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-xs font-semibold truncate" style={{ color: t.text.primary }}>
                  {toast.senderName}
                </p>
                <p className="text-[10px] flex-shrink-0" style={{ color: t.text.muted }}>now</p>
              </div>
              <p className="text-xs truncate" style={{ color: t.text.secondary }}>
                {toast.content}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(toast.id);
              }}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:brightness-110"
              style={{ backgroundColor: dismissBtnBg, color: t.text.muted }}
            >
              <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes messageToastSlideDown {
          from {
            opacity: 0;
            transform: translateY(-24px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes messageToastSlideUp {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
