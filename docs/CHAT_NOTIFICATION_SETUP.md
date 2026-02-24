# Chat Notification Badge Implementation Guide

This guide explains how to implement a visual red ping notification next to the messages icon when there are unread chat messages.

## Component Overview

The `AlertBadge` component provides a pulsing red notification indicator:

```tsx
export function AlertBadge() {
  return (
    <div className="relative inline-flex items-center justify-center w-6 h-6">
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
      <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
        !
      </span>
    </div>
  )
}
```

## Database Setup

### 1. Create Messages Table

```sql
-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages they sent or received
CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can insert messages they send
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can mark received messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Create index for faster unread message queries
CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread
  ON messages(recipient_id, read)
  WHERE read = false;
```

### 2. Apply Migration

Save the SQL above to a migration file and apply it using Supabase tools.

## Implementation Steps

### Step 1: Create the AlertBadge Component

Create `src/components/AlertBadge.tsx`:

```tsx
export function AlertBadge() {
  return (
    <div className="relative inline-flex items-center justify-center w-6 h-6">
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
      <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
        !
      </span>
    </div>
  )
}
```

### Step 2: Create Unread Messages Hook

Create `src/hooks/useUnreadMessages.ts`:

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useUnreadMessages(userId: string | undefined) {
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Initial check for unread messages
    const checkUnread = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('read', false);

      if (!error && count !== null) {
        setUnreadCount(count);
        setHasUnread(count > 0);
      }
    };

    checkUnread();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        () => {
          checkUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { hasUnread, unreadCount };
}
```

### Step 3: Integrate Badge with Messages Icon

Example integration in your Header or Navigation component:

```tsx
import { MessageCircle } from 'lucide-react';
import { AlertBadge } from './AlertBadge';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export function Header() {
  const [userId, setUserId] = useState<string>();
  const { hasUnread } = useUnreadMessages(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  return (
    <header>
      <nav>
        <button className="relative">
          <MessageCircle className="w-6 h-6" />
          {hasUnread && (
            <div className="absolute -top-2 -right-2">
              <AlertBadge />
            </div>
          )}
        </button>
      </nav>
    </header>
  );
}
```

### Step 4: Mark Messages as Read

When user opens the messages page, mark messages as read:

```tsx
// In your Messages component
useEffect(() => {
  const markAsRead = async () => {
    if (!userId) return;

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('read', false);
  };

  markAsRead();
}, [userId]);
```

## Alternative: Numeric Badge

If you prefer showing the count instead of an exclamation mark:

```tsx
export function AlertBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="relative inline-flex items-center justify-center w-6 h-6">
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
      <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
        {count > 9 ? '9+' : count}
      </span>
    </div>
  );
}
```

Then use it with:
```tsx
{hasUnread && (
  <div className="absolute -top-2 -right-2">
    <AlertBadge count={unreadCount} />
  </div>
)}
```

## Positioning Tips

Common positioning patterns for the badge:

```tsx
// Top-right corner of icon
<div className="absolute -top-2 -right-2">
  <AlertBadge />
</div>

// Top-right corner, no overflow
<div className="absolute top-0 right-0">
  <AlertBadge />
</div>

// Top-right with specific offset
<div className="absolute -top-1 -right-1">
  <AlertBadge />
</div>
```

## Testing

1. Send a message from one user to another
2. Verify the badge appears for the recipient
3. Open messages page
4. Verify the badge disappears after marking as read
5. Test real-time updates by sending messages while the app is open

## Customization Options

### Change Color
Replace `bg-red-500` with any Tailwind color:
- `bg-blue-500` for blue
- `bg-green-500` for green
- `bg-orange-500` for orange

### Change Size
Adjust the outer and inner div dimensions:
```tsx
<div className="relative inline-flex items-center justify-center w-8 h-8">
  <span className="...w-7 h-7..." />
</div>
```

### Remove Animation
Remove the pinging animation by deleting the first span:
```tsx
<div className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
  !
</div>
```

## Performance Considerations

1. The hook uses real-time subscriptions efficiently
2. Index on `recipient_id` and `read` improves query performance
3. Consider debouncing frequent updates if needed
4. Use `head: true` in count queries to avoid fetching data

## Security Notes

- RLS policies ensure users only see their own unread count
- Messages cannot be read by unauthorized users
- Only recipients can mark messages as read
