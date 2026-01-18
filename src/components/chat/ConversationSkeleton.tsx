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

      {/* Messages area skeleton - matches actual message layout */}
      <div className="flex-1 py-2 lg:py-4 flex flex-col justify-end">
        <div className="space-y-0.5 lg:space-y-1 px-2 lg:px-4">
          {/* Received message - matches MessageBubble layout */}
          <div className="flex justify-start px-2 lg:px-4 py-0.5">
            <div className="flex items-center gap-1.5 lg:gap-2 max-w-[85%] lg:max-w-[70%]">
              <div className="flex flex-col gap-1">
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{ backgroundColor: theme.skeletonSecondary, minHeight: '2.5rem', width: '180px' }}
                />
                <div
                  className="h-3 rounded px-1"
                  style={{ backgroundColor: theme.skeletonLight, width: '40px' }}
                />
              </div>
            </div>
          </div>

          {/* Sent message - matches MessageBubble layout */}
          <div className="flex justify-end px-2 lg:px-4 py-0.5">
            <div className="flex items-center gap-1.5 lg:gap-2 max-w-[85%] lg:max-w-[70%] flex-row-reverse">
              <div className="flex flex-col gap-1">
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{ backgroundColor: theme.skeletonPrimary, minHeight: '2.5rem', width: '140px' }}
                />
                <div
                  className="h-3 rounded px-1 ml-auto"
                  style={{ backgroundColor: theme.skeletonLight, width: '40px' }}
                />
              </div>
            </div>
          </div>

          {/* Received message with longer content */}
          <div className="flex justify-start px-2 lg:px-4 py-0.5">
            <div className="flex items-center gap-1.5 lg:gap-2 max-w-[85%] lg:max-w-[70%]">
              <div className="flex flex-col gap-1">
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{ backgroundColor: theme.skeletonSecondary, minHeight: '3.5rem', width: '220px' }}
                />
                <div
                  className="h-3 rounded px-1"
                  style={{ backgroundColor: theme.skeletonLight, width: '40px' }}
                />
              </div>
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
