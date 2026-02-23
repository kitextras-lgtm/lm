import { useState } from 'react';
import { Bell, Mail, Send, Loader2 } from 'lucide-react';

interface NotificationSenderProps {
  onClose?: () => void;
}

export function NotificationSender({ onClose }: NotificationSenderProps) {
  const [notificationType, setNotificationType] = useState<'new_features' | 'platform_updates'>('new_features');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; sent?: number; failed?: number; total?: number } | null>(null);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      setSendResult({ success: false, message: 'Please fill in both subject and content' });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-notification-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          notificationType,
          subject: subject.trim(),
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSendResult({
          success: true,
          message: data.message || 'Emails sent successfully',
          sent: data.sent,
          failed: data.failed,
          total: data.total,
        });
        // Clear form on success
        setSubject('');
        setContent('');
      } else {
        setSendResult({
          success: false,
          message: data.message || 'Failed to send emails',
        });
      }
    } catch (error: any) {
      setSendResult({
        success: false,
        message: error.message || 'An error occurred while sending emails',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)' }}>
            <Bell className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Send Notifications</h2>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
              Send emails to users who have opted in for notifications
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Notification Type Selection */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
          <label className="block text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            Notification Type
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setNotificationType('new_features')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                notificationType === 'new_features' ? '' : 'hover:brightness-110'
              }`}
              style={{
                backgroundColor: notificationType === 'new_features' ? 'var(--bg-elevated)' : 'transparent',
                color: 'var(--text-primary)',
                border: notificationType === 'new_features' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)',
              }}
            >
              New Features
            </button>
            <button
              onClick={() => setNotificationType('platform_updates')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                notificationType === 'platform_updates' ? '' : 'hover:brightness-110'
              }`}
              style={{
                backgroundColor: notificationType === 'platform_updates' ? 'var(--bg-elevated)' : 'transparent',
                color: 'var(--text-primary)',
                border: notificationType === 'platform_updates' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)',
              }}
            >
              Platform Updates
            </button>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text-primary)' }}>
            Only users who have opted in for {notificationType === 'new_features' ? 'New Features' : 'Platform Updates'} will receive this email.
          </p>
        </div>

        {/* Subject Input */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Subject Line
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., 🎉 New Feature: Enhanced Dashboard"
            className="w-full h-12 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
            style={{
              color: 'var(--text-primary)',
              background: 'var(--bg-elevated)',
              border: '1px solid rgba(75, 85, 99, 0.2)',
            }}
            disabled={isSending}
          />
        </div>

        {/* Content Textarea */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Email Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your notification message here. You can use line breaks for formatting."
            rows={10}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all resize-none"
            style={{
              color: 'var(--text-primary)',
              background: 'var(--bg-elevated)',
              border: '1px solid rgba(75, 85, 99, 0.2)',
            }}
            disabled={isSending}
          />
          <p className="text-xs mt-3" style={{ color: 'var(--text-primary)' }}>
            The email will be styled consistently with Elevate branding (black background, white text).
          </p>
        </div>

        {/* Send Result */}
        {sendResult && (
          <div
            className={`rounded-2xl p-4 border ${
              sendResult.success ? 'border-green-500/30' : 'border-red-500/30'
            }`}
            style={{
              backgroundColor: sendResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <div className="flex items-start gap-3">
              {sendResult.success ? (
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
              ) : (
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium mb-1" style={{ color: sendResult.success ? '#10b981' : '#ef4444' }}>
                  {sendResult.message}
                </p>
                {sendResult.success && sendResult.total !== undefined && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-primary)' }}>
                    {sendResult.sent} sent, {sendResult.failed} failed out of {sendResult.total} recipients
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Send Button */}
        <div className="flex gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(75, 85, 99, 0.2)',
              }}
              disabled={isSending}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={isSending || !subject.trim() || !content.trim()}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-primary)',
            }}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Notifications
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

