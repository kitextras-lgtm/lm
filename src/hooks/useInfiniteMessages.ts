// Fix 14: Infinite Scroll Messages Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Message } from '../types/chat';
import { getCachedMessages, cacheMessages } from '../utils/messageCache';

const MESSAGES_PAGE_SIZE = 50;

export function useInfiniteMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messageIdsRef = useRef<Set<string>>(new Set());

  // Fetch messages with cursor-based pagination
  const fetchMessages = useCallback(async (cursorValue?: string) => {
    if (!conversationId) return;

    setIsLoading(true);

    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null) // Exclude soft-deleted messages
      .order('created_at', { ascending: false })
      .limit(MESSAGES_PAGE_SIZE + 1);

    if (cursorValue) {
      query = query.lt('created_at', cursorValue);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      setIsLoading(false);
      return;
    }

    if (data) {
      const hasMoreData = data.length > MESSAGES_PAGE_SIZE;
      const messageData = hasMoreData ? data.slice(0, -1) : data;
      const nextCursor = hasMoreData ? messageData[messageData.length - 1].created_at : null;

      // Messages are fetched newest first, but displayed oldest first
      const orderedMessages = [...messageData].reverse();

      // Deduplicate
      const newMessages = orderedMessages.filter(m => !messageIdsRef.current.has(m.id));
      newMessages.forEach(m => messageIdsRef.current.add(m.id));

      setMessages(prev => cursorValue ? [...newMessages, ...prev] : newMessages);
      setCursor(nextCursor);
      setHasMore(hasMoreData);

      // Cache messages
      if (!cursorValue) {
        cacheMessages(conversationId, orderedMessages);
      }
    }

    setIsLoading(false);
    setIsInitialLoad(false);
  }, [conversationId]);

  // Load more (older) messages
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !cursor) return;
    await fetchMessages(cursor);
  }, [cursor, hasMore, isLoading, fetchMessages]);

  // Add new message (for real-time updates)
  const addMessage = useCallback((newMessage: Message) => {
    if (messageIdsRef.current.has(newMessage.id)) {
      // Update existing message
      setMessages(prev => prev.map(m => m.id === newMessage.id ? newMessage : m));
      return;
    }

    messageIdsRef.current.add(newMessage.id);
    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Sort by created_at to handle out-of-order delivery
      updated.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      return updated;
    });
  }, []);

  // Update message (for status changes, edits, deletes)
  const updateMessage = useCallback((updatedMessage: Message) => {
    setMessages(prev => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
  }, []);

  // Remove message (for soft deletes)
  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    messageIdsRef.current.delete(messageId);
  }, []);

  // Initial load and subscription
  useEffect(() => {
    if (!conversationId) return;

    // Reset state when conversation changes
    setMessages([]);
    setCursor(null);
    setHasMore(true);
    setIsInitialLoad(true);
    messageIdsRef.current.clear();

    // Check cache first
    const cached = getCachedMessages(conversationId);
    if (cached && cached.length > 0) {
      setMessages(cached);
      cached.forEach(m => messageIdsRef.current.add(m.id));
      setIsInitialLoad(false);
    }

    // Fetch fresh data
    fetchMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          addMessage(payload.new as Message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          if (updatedMessage.deleted_at) {
            removeMessage(updatedMessage.id);
          } else {
            updateMessage(updatedMessage);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, fetchMessages, addMessage, updateMessage, removeMessage]);

  return {
    messages,
    loadMore,
    hasMore,
    isLoading,
    isInitialLoad,
    addMessage,
    updateMessage,
    removeMessage,
  };
}
