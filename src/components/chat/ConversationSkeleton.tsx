// Skeleton loader for conversation list items
// Matches the exact layout of UserListItem to prevent layout shift

import { BackgroundTheme, getTheme } from '../../utils/chatTheme';

interface SkeletonProps {
  backgroundTheme?: BackgroundTheme;
}

export function ConversationSkeleton({ backgroundTheme = 'dark' }: SkeletonProps) {
  const theme = getTheme(backgroundTheme);
  
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      {/* Avatar skeleton */}
      <div
        className="w-12 h-12 rounded-full flex-shrink-0"
        style={{ backgroundColor: theme.skeletonPrimary }}
      />

      {/* Text content skeleton */}
      <div className="flex-1 min-w-0">
        {/* Name skeleton */}
        <div
          className="h-4 rounded mb-2"
          style={{
            backgroundColor: theme.skeletonPrimary,
            width: '60%'
          }}
        />
        {/* Message preview skeleton */}
        <div
          className="h-3 rounded"
          style={{
            backgroundColor: theme.skeletonSecondary,
            width: '85%'
          }}
        />
      </div>

      {/* Time skeleton */}
      <div
        className="h-3 rounded flex-shrink-0"
        style={{
          backgroundColor: theme.skeletonSecondary,
          width: '40px'
        }}
      />
    </div>
  );
}

export function ConversationListSkeleton({ count = 3, backgroundTheme = 'dark' }: { count?: number; backgroundTheme?: BackgroundTheme }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <ConversationSkeleton key={i} backgroundTheme={backgroundTheme} />
      ))}
    </div>
  );
}

// Skeleton for the chat window area
// Matches the exact layout of ChatWindow to prevent layout shift
export function ChatWindowSkeleton({ backgroundTheme = 'dark' }: SkeletonProps) {
  const theme = getTheme(backgroundTheme);
  
  return (
    <div className="flex flex-col h-full animate-pulse" style={{ backgroundColor: theme.background }}>
      {/* Header skeleton - matches ChatHeader layout */}
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: theme.border }}>
        <div
          className="w-10 h-10 rounded-full flex-shrink-0"
          style={{ backgroundColor: theme.skeletonPrimary }}
        />
        <div className="flex-1">
          <div
            className="h-4 rounded mb-1.5"
            style={{ backgroundColor: theme.skeletonPrimary, width: '120px' }}
          />
          <div
            className="h-3 rounded"
            style={{ backgroundColor: theme.skeletonSecondary, width: '80px' }}
          />
        </div>
      </div>

      {/* Messages area skeleton — alternating left/right with realistic widths */}
      <div className="flex-1 py-2 lg:py-4 flex flex-col justify-end">
        <div className="space-y-1 lg:space-y-1.5 px-2 lg:px-4">
          {/* Received (left) — short greeting */}
          <div className="flex justify-start px-2 lg:px-4 py-0.5">
            <div className="flex flex-col gap-1" style={{ width: '45%', minWidth: '120px', maxWidth: '260px' }}>
              <div className="rounded-2xl" style={{ backgroundColor: theme.skeletonSecondary, height: '2.5rem' }} />
              <div className="h-3 rounded" style={{ backgroundColor: theme.skeletonLight, width: '40px' }} />
            </div>
          </div>

          {/* Sent (right) — medium reply */}
          <div className="flex justify-end px-2 lg:px-4 py-0.5">
            <div className="flex flex-col gap-1 items-end" style={{ width: '55%', minWidth: '140px', maxWidth: '300px' }}>
              <div className="rounded-2xl w-full" style={{ backgroundColor: theme.skeletonPrimary, height: '2.5rem' }} />
              <div className="h-3 rounded" style={{ backgroundColor: theme.skeletonLight, width: '40px' }} />
            </div>
          </div>

          {/* Received (left) — longer message */}
          <div className="flex justify-start px-2 lg:px-4 py-0.5">
            <div className="flex flex-col gap-1" style={{ width: '65%', minWidth: '160px', maxWidth: '340px' }}>
              <div className="rounded-2xl" style={{ backgroundColor: theme.skeletonSecondary, height: '3.25rem' }} />
              <div className="h-3 rounded" style={{ backgroundColor: theme.skeletonLight, width: '40px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Input area skeleton - matches ChatInput layout */}
      <div className="p-4 border-t" style={{ borderColor: theme.border }}>
        <div
          className="h-12 rounded-xl"
          style={{ backgroundColor: theme.skeletonSecondary }}
        />
      </div>
    </div>
  );
}
