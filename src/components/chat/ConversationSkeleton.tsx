// Skeleton loader for conversation list items
// Matches the exact layout of UserListItem to prevent layout shift

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      {/* Avatar skeleton */}
      <div 
        className="w-12 h-12 rounded-full flex-shrink-0"
        style={{ backgroundColor: 'rgba(75, 85, 99, 0.2)' }}
      />
      
      {/* Text content skeleton */}
      <div className="flex-1 min-w-0">
        {/* Name skeleton */}
        <div 
          className="h-4 rounded mb-2"
          style={{ 
            backgroundColor: 'rgba(75, 85, 99, 0.2)',
            width: '60%'
          }}
        />
        {/* Message preview skeleton */}
        <div 
          className="h-3 rounded"
          style={{ 
            backgroundColor: 'rgba(75, 85, 99, 0.15)',
            width: '85%'
          }}
        />
      </div>
      
      {/* Time skeleton */}
      <div 
        className="h-3 rounded flex-shrink-0"
        style={{ 
          backgroundColor: 'rgba(75, 85, 99, 0.15)',
          width: '40px'
        }}
      />
    </div>
  );
}

export function ConversationListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton for the chat window area
export function ChatWindowSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse" style={{ backgroundColor: '#111111' }}>
      {/* Header skeleton */}
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(75, 85, 99, 0.2)' }}>
        <div 
          className="w-10 h-10 rounded-full"
          style={{ backgroundColor: 'rgba(75, 85, 99, 0.2)' }}
        />
        <div className="flex-1">
          <div 
            className="h-4 rounded mb-1.5"
            style={{ backgroundColor: 'rgba(75, 85, 99, 0.2)', width: '120px' }}
          />
          <div 
            className="h-3 rounded"
            style={{ backgroundColor: 'rgba(75, 85, 99, 0.15)', width: '80px' }}
          />
        </div>
      </div>
      
      {/* Messages area skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {/* Received message */}
        <div className="flex items-start gap-2">
          <div 
            className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: 'rgba(75, 85, 99, 0.2)' }}
          />
          <div 
            className="rounded-2xl px-4 py-3"
            style={{ backgroundColor: 'rgba(75, 85, 99, 0.15)', width: '60%', height: '60px' }}
          />
        </div>
        
        {/* Sent message */}
        <div className="flex items-start gap-2 justify-end">
          <div 
            className="rounded-2xl px-4 py-3"
            style={{ backgroundColor: 'rgba(75, 85, 99, 0.2)', width: '45%', height: '40px' }}
          />
        </div>
        
        {/* Received message */}
        <div className="flex items-start gap-2">
          <div 
            className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: 'rgba(75, 85, 99, 0.2)' }}
          />
          <div 
            className="rounded-2xl px-4 py-3"
            style={{ backgroundColor: 'rgba(75, 85, 99, 0.15)', width: '70%', height: '80px' }}
          />
        </div>
      </div>
      
      {/* Input area skeleton */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(75, 85, 99, 0.2)' }}>
        <div 
          className="h-12 rounded-xl"
          style={{ backgroundColor: 'rgba(75, 85, 99, 0.15)' }}
        />
      </div>
    </div>
  );
}
