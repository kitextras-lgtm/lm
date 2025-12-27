import { ArrowLeft } from 'lucide-react';
import type { Profile } from '../../types/chat';
import { DEFAULT_AVATAR_DATA_URI } from '../DefaultAvatar';

interface ChatHeaderProps {
  user: Profile;
  isTyping?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatHeader({ user, isTyping, onBack, showBackButton }: ChatHeaderProps) {
  console.log('🎯 ChatHeader rendering with user:', user?.name, user);
  
  return (
    <div className="h-14 lg:h-16 px-3 lg:px-4 flex items-center justify-between min-w-0" style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)', backgroundColor: '#111111' }}>
      <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-1.5 lg:p-2 -ml-1 lg:-ml-2 rounded-full hover:brightness-110 transition-colors lg:hidden"
            style={{ color: '#64748B' }}
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        )}
        <div className="relative flex-shrink-0">
          <img
            src={user.avatar_url || DEFAULT_AVATAR_DATA_URI}
            alt={user.name}
            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover default-avatar-shake"
            style={{ backgroundColor: '#0f0f13' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm lg:text-base font-medium truncate" style={{ color: '#F8FAFC' }}>{user.name}</h2>
          {isTyping && (
            <p className="text-[10px] lg:text-xs" style={{ color: '#64748B' }}>typing...</p>
          )}
        </div>
      </div>
    </div>
  );
}


