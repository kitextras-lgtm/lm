import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Message, Profile, Conversation, ReplyTo } from '../types/chat';
import { getCachedMessages, cacheMessages } from '../utils/messageCache';
import { getCachedConversations, cacheConversations } from '../utils/conversationCache';
import { getCachedAdminConversations, cacheAdminConversations } from '../utils/adminConversationCache';
import { preloadAndCacheImage } from '../utils/imageCache';
import { MessagingError, ErrorCodes, retry } from '../types/errors';

interface UseChatOptions {
  conversationId: string;
  currentUserId: string;
}

export function useChat({ conversationId, currentUserId }: UseChatOptions) {
  // Load cached messages immediately for instant display
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = getCachedMessages(conversationId);
      return cached || [];
    }
    return [];
  });
  // Start loading=true only if we don't have cached messages
  // This prevents showing "No messages yet" while fetching
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = getCachedMessages(conversationId);
      return !cached || cached.length === 0;
    }
    return true;
  });
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
        return;
      }

      if (data) {
        const fetchedMessages = data as Message[];
        setMessages(fetchedMessages);
        cacheMessages(conversationId, fetchedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    // Check cache and set loading state accordingly
    const cached = getCachedMessages(conversationId);
    if (cached && cached.length > 0) {
      setMessages(cached);
      setLoading(false);
    } else {
      setMessages([]);
      setLoading(true);
    }

    fetchMessages();

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
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            const updated = [...prev, newMessage];
            cacheMessages(conversationId, updated);
            return updated;
          });
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
          setMessages((prev) => {
            const updated = prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m));
            cacheMessages(conversationId, updated);
            return updated;
          });
        }
      )
      .subscribe();

    const typingChannel = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== currentUserId) {
          setOtherUserTyping(payload.isTyping);
        }
      })
      .subscribe();

    typingChannelRef.current = typingChannel;

    return () => {
      channel.unsubscribe();
      typingChannel.unsubscribe();
    };
  }, [conversationId, currentUserId, fetchMessages]);

  const sendMessage = useCallback(
    async (content: string, imageUrl?: string, replyTo?: ReplyTo) => {
      const messageType = imageUrl ? 'image' : 'text';

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          type: messageType,
          content: content || '',
          image_url: imageUrl || '',
          status: 'sent',
          reply_to_id: replyTo?.id || null,
          reply_to_sender_name: replyTo?.senderName || '',
          reply_to_content: replyTo?.content || '',
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return { data: null, error };
      }

      if (data) {
        const { data: convData } = await supabase
          .from('conversations')
          .select('customer_id, admin_id, unread_count_admin, unread_count_customer, is_ephemeral')
          .eq('id', conversationId)
          .single();

        if (convData) {
          const isCustomer = convData.customer_id === currentUserId;
          let lastMessageText = content || 'Sent an image';
          if (lastMessageText !== 'Sent an image') {
            lastMessageText = lastMessageText.replace(/\n/g, ' ').trim();
            if (lastMessageText.startsWith('Me: ')) {
              lastMessageText = lastMessageText.substring(4).trim();
            }
            if (lastMessageText.length > 80) {
              lastMessageText = lastMessageText.substring(0, 80) + '...';
            }
          }
          const updateData: Record<string, unknown> = {
            last_message: lastMessageText,
            last_message_at: new Date().toISOString(),
            last_message_sender_id: currentUserId,
            // Fix 2: Mark conversation as non-ephemeral when first message is sent
            is_ephemeral: false,
            has_messages: true,
          };

          if (isCustomer) {
            updateData.unread_count_customer = 0;
            updateData.unread_count_admin = (convData.unread_count_admin || 0) + 1;
          } else {
            updateData.unread_count_admin = 0;
            updateData.unread_count_customer = (convData.unread_count_customer || 0) + 1;
          }

          const { error: updateError } = await supabase
            .from('conversations')
            .update(updateData)
            .eq('id', conversationId);

          if (updateError) {
            console.error('Error updating conversation:', updateError);
          }
        }
      }

      return { data, error: null };
    },
    [conversationId, currentUserId]
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      typingChannelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId, isTyping },
      });
    },
    [currentUserId]
  );

  const markMessagesAsSeen = useCallback(async () => {
    const { data: convData } = await supabase
      .from('conversations')
      .select('customer_id, admin_id')
      .eq('id', conversationId)
      .single();

    if (convData) {
      const isCustomer = convData.customer_id === currentUserId;

      await supabase
        .from('messages')
        .update({ status: 'seen' })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)
        .neq('status', 'seen');

      const updateData: Record<string, number> = {};
      if (isCustomer) {
        updateData.unread_count_customer = 0;
      } else {
        updateData.unread_count_admin = 0;
      }

      const { error: updateError } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating unread count:', updateError);
      }
    }
  }, [conversationId, currentUserId]);

  return {
    messages,
    loading,
    otherUserTyping,
    sendMessage,
    setTyping,
    markMessagesAsSeen,
  };
}

// Fix 1: Enhanced state with selection locking to prevent race conditions
interface CustomerConversationsState {
  conversations: (Conversation & { admin: Profile })[];
  selectedConversationId: string | null;
  isSelectionLocked: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  error: MessagingError | null;
}

// Instagram/X pattern: Pending conversation (not yet created in DB)
export interface PendingConversation {
  recipientId: string;
  recipientUser: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export function useCustomerConversations(customerId: string) {
  // Instagram/X pattern: Pending conversation state (local only, not in DB)
  const [pendingConversation, setPendingConversation] = useState<PendingConversation | null>(null);

  const [state, setState] = useState<CustomerConversationsState>(() => {
    const cached = typeof window !== 'undefined' && customerId
      ? getCachedConversations(customerId) as (Conversation & { admin: Profile })[] || []
      : [];
    return {
      conversations: cached,
      selectedConversationId: null,
      isSelectionLocked: false,
      connectionStatus: 'connecting',
      error: null,
    };
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && customerId) {
      const cached = getCachedConversations(customerId);
      return !cached || cached.length === 0;
    }
    return true;
  });

  // Expose conversations from state for backward compatibility
  const conversations = state.conversations;

  // Fix 1: Select conversation with optional lock to prevent race conditions
  const selectConversation = useCallback((conversationId: string, lock = false) => {
    setState(prev => ({
      ...prev,
      selectedConversationId: conversationId,
      isSelectionLocked: lock,
    }));

    // Unlock after a short delay to allow UI to stabilize
    if (lock) {
      setTimeout(() => {
        setState(prev => ({ ...prev, isSelectionLocked: false }));
      }, 1000);
    }

    // Persist to localStorage
    if (customerId) {
      localStorage.setItem(`lastConversation_${customerId}`, conversationId);
    }
  }, [customerId]);

  const updateConversationUnreadCount = useCallback((conversationId: string, unreadCount: number) => {
    if (!customerId) return;
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map((conv) => {
        if (conv.id !== conversationId) return conv;
        // Update the correct unread field based on which side of the conversation the user is on
        if (conv.customer_id === customerId) {
          return { ...conv, unread_count_customer: unreadCount };
        } else {
          return { ...conv, unread_count_admin: unreadCount };
        }
      }),
    }));
  }, [customerId]);

  // Fix 3: Use unified_users view for user data
  const fetchConversations = useCallback(async () => {
    if (!customerId) {
      setState(prev => ({ ...prev, conversations: [] }));
      setLoading(false);
      return;
    }

    try {

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          admin:profiles!conversations_admin_id_fkey(*)
        `)
        .or(`customer_id.eq.${customerId},admin_id.eq.${customerId}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        setState(prev => ({
          ...prev,
          error: new MessagingError('Failed to load conversations', ErrorCodes.NETWORK_ERROR, true, error),
        }));
        setLoading(false);
        return;
      }

      if (data) {
        let conversationsData = data as (Conversation & { admin: Profile })[];

        // Instagram/X pattern: No ephemeral filtering needed
        // Conversations only exist in DB when they have messages

        // Fix 3: Fetch up-to-date profile data from unified_users view
        const otherUserIds = conversationsData.map(conv => 
          conv.customer_id === customerId ? conv.admin_id : conv.customer_id
        ).filter(Boolean);

        if (otherUserIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from('unified_users')
            .select('id, first_name, last_name, username, avatar_url, display_name, is_admin, is_online, last_seen')
            .in('id', otherUserIds);

          // Also fetch from profiles as fallback (for admin profiles that might not be in unified_users)
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, name, username, avatar_url, is_admin, is_online, last_seen')
            .in('id', otherUserIds);

          const usersMap = new Map((usersData || []).map(u => [u.id, u]));
          const profilesMap = new Map((profilesData || []).map(p => [p.id, p]));

          // Enrich conversations with up-to-date user data
          conversationsData = conversationsData.map(conv => {
            const otherUserId = conv.customer_id === customerId ? conv.admin_id : conv.customer_id;
            const userData = usersMap.get(otherUserId || '');
            const profileData = profilesMap.get(otherUserId || '');

            if (userData) {
              return {
                ...conv,
                admin: {
                  id: userData.id,
                  name: userData.display_name || [userData.first_name, userData.last_name].filter(Boolean).join(' ') || 'User',
                  username: userData.username || '',
                  avatar_url: userData.avatar_url || '',
                  is_admin: userData.is_admin || false,
                  is_online: userData.is_online || false,
                  last_seen: userData.last_seen,
                } as Profile,
              };
            } else if (profileData) {
              // Fallback to profiles table data (for admin profiles like Team Elevate)
              return {
                ...conv,
                admin: {
                  id: profileData.id,
                  name: profileData.name || 'User',
                  username: profileData.username || '',
                  avatar_url: profileData.avatar_url || '',
                  is_admin: profileData.is_admin || false,
                  is_online: profileData.is_online || false,
                  last_seen: profileData.last_seen,
                } as Profile,
              };
            } else if (conv.admin) {
              // Keep existing admin data from FK join if available
              return conv;
            }

            // Last resort: create placeholder admin to prevent filtering
            return {
              ...conv,
              admin: {
                id: otherUserId || '',
                name: 'User',
                username: '',
                avatar_url: '',
                is_admin: false,
                is_online: false,
              } as Profile,
            };
          });
        }

        // Fix 17: Sort conversations - pinned first, then by last_message_at
        conversationsData.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
        });

        setState(prev => ({
          ...prev,
          conversations: conversationsData,
          error: null,
        }));
        cacheConversations(customerId, conversationsData);

        // Preload avatar images
        conversationsData.forEach((conv) => {
          if (conv.admin?.avatar_url) {
            preloadAndCacheImage(conv.admin.avatar_url);
          }
        });
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setState(prev => ({
        ...prev,
        error: new MessagingError('Failed to load conversations', ErrorCodes.NETWORK_ERROR, true, err),
      }));
    }
    setLoading(false);
  }, [customerId]);

  // Fix 8: Real-time subscription with proper handling
  useEffect(() => {
    if (!customerId) {
      setState(prev => ({ ...prev, conversations: [] }));
      setLoading(false);
      return;
    }

    // Track session start for ephemeral filtering
    if (!sessionStorage.getItem('session_start')) {
      sessionStorage.setItem('session_start', new Date().toISOString());
    }

    const cached = getCachedConversations(customerId);
    if (cached && cached.length > 0) {
      setState(prev => ({
        ...prev,
        conversations: cached as (Conversation & { admin: Profile })[],
      }));
      setLoading(false);
    }

    fetchConversations();

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const channel = supabase
      .channel(`customer-conversations:${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          const newData = payload.new as Conversation | null;

          // Fix 1: Respect selection lock during real-time updates
          if (payload.eventType === 'UPDATE' && newData?.id) {
            const updatedConv = newData as Conversation;
            setState(prev => {
              // ✅ CHECK: If selection is locked, don't change selectedConversationId
              // Only update the conversations array
              const existingIndex = prev.conversations.findIndex(c => c.id === updatedConv.id);
              if (existingIndex >= 0) {
                const updated = [...prev.conversations];
                const adminProfile = prev.conversations[existingIndex].admin;
                updated[existingIndex] = { ...updatedConv, admin: adminProfile } as Conversation & { admin: Profile };

                // Fix 17: Re-sort after update
                updated.sort((a, b) => {
                  if (a.is_pinned && !b.is_pinned) return -1;
                  if (!a.is_pinned && b.is_pinned) return 1;
                  return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
                });

                // ✅ IMPORTANT: Only update conversations, NOT selectedConversationId
                return { ...prev, conversations: updated };
              }
              return prev;
            });
            return;
          }

          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `admin_id=eq.${customerId}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setState(prev => ({ ...prev, connectionStatus: 'connected' }));
          reconnectAttempts = 0;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
          // Attempt reconnection with exponential backoff
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            reconnectAttempts++;
            setTimeout(() => {
              channel.subscribe();
            }, delay);
          }
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [customerId, fetchConversations]);

  // Instagram/X pattern: Start conversation with user (no DB write until first message)
  const startConversationWith = useCallback(async (otherUser: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  }): Promise<{ type: 'existing' | 'pending'; conversation?: Conversation & { admin: Profile }; recipientId?: string }> => {
    // First check if conversation already exists in our loaded conversations
    const existing = state.conversations.find(c => 
      (c.customer_id === customerId && c.admin_id === otherUser.id) ||
      (c.customer_id === otherUser.id && c.admin_id === customerId)
    );
    
    if (existing) {
      // Conversation exists, select it and clear any pending
      selectConversation(existing.id, true);
      setPendingConversation(null);
      return { type: 'existing', conversation: existing };
    }
    
    // Also check database for existing conversation (in case not loaded yet)
    const { data: existingConv } = await supabase
      .from('conversations')
      .select(`*, admin:profiles!conversations_admin_id_fkey(*)`)
      .or(`and(customer_id.eq.${customerId},admin_id.eq.${otherUser.id}),and(customer_id.eq.${otherUser.id},admin_id.eq.${customerId})`)
      .maybeSingle();
    
    if (existingConv) {
      // Found in DB, add to state and select
      const enrichedConv = existingConv as Conversation & { admin: Profile };
      setState(prev => ({
        ...prev,
        conversations: [enrichedConv, ...prev.conversations.filter(c => c.id !== enrichedConv.id)],
        selectedConversationId: enrichedConv.id,
        isSelectionLocked: true,
      }));
      setPendingConversation(null);
      setTimeout(() => setState(prev => ({ ...prev, isSelectionLocked: false })), 1000);
      return { type: 'existing', conversation: enrichedConv };
    }
    
    // NO DATABASE WRITE - just set pending state
    setPendingConversation({
      recipientId: otherUser.id,
      recipientUser: otherUser,
    });
    
    // Clear selected conversation so UI shows pending
    setState(prev => ({
      ...prev,
      selectedConversationId: null,
    }));
    
    return { type: 'pending', recipientId: otherUser.id };
  }, [state.conversations, customerId, selectConversation]);

  // Instagram/X pattern: Send message (creates conversation if pending)
  const sendMessageToConversation = useCallback(async (
    conversationId: string | null,
    content: string,
    type: 'text' | 'image' = 'text',
    imageUrl?: string,
    replyTo?: ReplyTo
  ) => {
    // If we have a pending conversation (no conversationId), create it now
    if (!conversationId && pendingConversation) {
      try {
        // Create conversation AND message together
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            customer_id: customerId,
            admin_id: pendingConversation.recipientId,
            last_message: content.length > 80 ? content.substring(0, 80) + '...' : content,
            last_message_at: new Date().toISOString(),
            last_message_sender_id: customerId,
            unread_count_admin: 1,
            unread_count_customer: 0,
            is_ephemeral: false,  // NOT ephemeral - has message from start
            has_messages: true,
          })
          .select()
          .single();
        
        if (convError) throw convError;
        
        // Insert the message
        const { data: newMessage, error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: newConversation.id,
            sender_id: customerId,
            content,
            type,
            image_url: imageUrl || null,
            status: 'sent',
            reply_to_id: replyTo?.id || null,
            reply_to_sender_name: replyTo?.senderName || '',
            reply_to_content: replyTo?.content || '',
          })
          .select()
          .single();
        
        if (msgError) throw msgError;
        
        // Enrich conversation with recipient user data as Profile
        const enrichedConversation = {
          ...newConversation,
          admin: {
            id: pendingConversation.recipientUser.id,
            name: pendingConversation.recipientUser.display_name,
            username: pendingConversation.recipientUser.username,
            avatar_url: pendingConversation.recipientUser.avatar_url || '',
            is_admin: false,
            is_online: false,
          } as Profile,
        } as Conversation & { admin: Profile };
        
        // Clear pending, add to conversations, select it
        setPendingConversation(null);
        setState(prev => ({
          ...prev,
          conversations: [enrichedConversation, ...prev.conversations],
          selectedConversationId: newConversation.id,
          isSelectionLocked: true,
        }));
        
        setTimeout(() => setState(prev => ({ ...prev, isSelectionLocked: false })), 1000);
        
        return { data: newMessage, error: null, newConversationId: newConversation.id, newConversation: enrichedConversation };
      } catch (error) {
        console.error('Failed to create conversation with message:', error);
        return { data: null, error, newConversationId: null, newConversation: null };
      }
    }

    // Normal flow - conversation already exists (handled by useChat hook)
    return { data: null, error: new Error('Use useChat hook for existing conversations'), newConversationId: null, newConversation: null };
  }, [pendingConversation, customerId]);

  // Clear pending conversation
  const clearPendingConversation = useCallback(() => {
    setPendingConversation(null);
  }, []);

  return {
    conversations,
    loading,
    updateConversationUnreadCount,
    refetch: fetchConversations,
    selectConversation,
    selectedConversationId: state.selectedConversationId,
    isSelectionLocked: state.isSelectionLocked,
    connectionStatus: state.connectionStatus,
    error: state.error,
    // Instagram/X pattern exports
    pendingConversation,
    setPendingConversation,
    startConversationWith,
    sendMessageToConversation,
    clearPendingConversation,
  };
}

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as Profile);
      }
      setLoading(false);
    };

    fetchProfile();

    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  return { profile, loading };
}

export function usePresence(userId: string) {
  useEffect(() => {
    const updatePresence = async (isOnline: boolean) => {
      await supabase
        .from('profiles')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        })
        .eq('id', userId);
    };

    updatePresence(true);

    const handleVisibilityChange = () => {
      updatePresence(!document.hidden);
    };

    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updatePresence(false);
    };
  }, [userId]);
}

// Get the first admin profile ID
export async function getAdminId(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, is_admin')
      .eq('is_admin', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching admin:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error in getAdminId:', error);
    return null;
  }
}

// Get or create a conversation with admin for a customer
export async function getOrCreateAdminConversation(customerId: string): Promise<Conversation & { admin: Profile } | null> {
  try {
    console.log('🔍 getOrCreateAdminConversation called for customerId:', customerId);
    
    // Ensure customer profile exists before creating conversation
    const { data: customerProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', customerId)
      .maybeSingle();

    console.log('🔍 Customer profile check:', { data: customerProfile, error: profileCheckError });

    if (profileCheckError) {
      console.error('Error checking customer profile:', profileCheckError);
      return null;
    }

    if (!customerProfile) {
      console.log('🔍 Customer profile does not exist, creating...');
      
      // Get user data to populate profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, first_name, last_name, full_name')
        .eq('id', customerId)
        .maybeSingle();

      console.log('🔍 User data for profile:', { data: userData, error: userError });

      if (userError) {
        console.error('Error fetching user data:', userError);
        return null;
      }

      const profileName = userData?.full_name ||
                         (userData?.first_name && userData?.last_name ? `${userData.first_name} ${userData.last_name}`.trim() : null) ||
                         userData?.email?.split('@')[0] ||
                         'User';

      console.log('🔍 Creating profile with name:', profileName);

      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: customerId,
          name: profileName,
          avatar_url: '',
          is_admin: false,
          is_online: false,
        });

      console.log('🔍 Profile creation result:', { error: createProfileError });

      if (createProfileError) {
        console.error('Error creating customer profile:', createProfileError);
        return null;
      }
    }

    const adminId = await getAdminId();
    if (!adminId) {
      console.error('No admin profile found');
      return null;
    }

    // Check if conversation already exists
    const { data: existingConv, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('customer_id', customerId)
      .eq('admin_id', adminId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching conversation:', fetchError);
      return null;
    }

    if (existingConv) {
      const { data: adminProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminId)
        .single();

      if (profileError) {
        console.error('Error fetching admin profile:', profileError);
        return null;
      }

      if (adminProfile) {
        return { ...existingConv, admin: adminProfile } as Conversation & { admin: Profile };
      }
      return null;
    }

    // Create new conversation
    console.log('🔍 Creating conversation with:', { customerId, adminId });
    
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        customer_id: customerId,
        admin_id: adminId,
        last_message: '',
        unread_count_admin: 0,
        unread_count_customer: 0,
      })
      .select('*')
      .single();

    console.log('🔍 Conversation creation result:', { data: newConv, error: createError });

    if (createError) {
      console.error('Error creating conversation:', createError);

      // Handle conflict - conversation already exists
      const isConflictError =
        createError.code === '23505' ||
        createError.code === '409' ||
        createError.code === 'PGRST204' ||
        createError.message?.toLowerCase().includes('duplicate') ||
        createError.message?.toLowerCase().includes('unique') ||
        createError.message?.toLowerCase().includes('conflict') ||
        createError.message?.toLowerCase().includes('already exists');

      if (isConflictError) {
        const { data: existingConv, error: fetchError } = await supabase
          .from('conversations')
          .select('*')
          .eq('customer_id', customerId)
          .eq('admin_id', adminId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching existing conversation after conflict:', fetchError);
          return null;
        }

        if (existingConv) {
          const { data: adminProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', adminId)
            .single();

          if (profileError) {
            console.error('Error fetching admin profile:', profileError);
            return null;
          }

          if (adminProfile) {
            return { ...existingConv, admin: adminProfile } as Conversation & { admin: Profile };
          }
        }
      }

      return null;
    }

    // Get user's first name for welcome message
    const { data: userData } = await supabase
      .from('users')
      .select('first_name')
      .eq('id', customerId)
      .maybeSingle();

    const firstName = userData?.first_name?.trim() || '';
    const welcomeMessage = `Hi${firstName ? ` ${firstName},` : ''} welcome to Elevate! 👋\n\nIf you have any questions, feel free to ask.\n\nHave suggestions or feedback? You can submit them here. We review everything and are always working to give you the best experience on Elevate.`;

    // Send welcome message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: newConv.id,
        sender_id: adminId,
        type: 'text',
        content: welcomeMessage,
        status: 'sent',
      });

    if (messageError) {
      console.error('Error sending welcome message:', messageError);
    } else {
      const welcomeMessagePreview = welcomeMessage.split('\n')[0];
      await supabase
        .from('conversations')
        .update({
          last_message: welcomeMessagePreview,
          last_message_at: new Date().toISOString(),
          last_message_sender_id: adminId,
          unread_count_customer: 1,
        })
        .eq('id', newConv.id);
    }

    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminId)
      .single();

    if (profileError) {
      console.error('Error fetching admin profile after creation:', profileError);
      return null;
    }

    if (adminProfile && newConv) {
      return { ...newConv, admin: adminProfile } as Conversation & { admin: Profile };
    }

    return null;
  } catch (error) {
    console.error('Error in getOrCreateAdminConversation:', error);
    return null;
  }
}

// Get or create a conversation between two users (for direct messaging)
export async function getOrCreateUserConversation(
  currentUserId: string, 
  otherUserId: string
): Promise<Conversation & { admin: Profile } | null> {
  try {
    // Ensure both profiles exist
    for (const userId of [currentUserId, otherUserId]) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error(`Error checking profile for ${userId}:`, profileError);
        return null;
      }

      if (!profile) {
        // Get user data to populate profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, first_name, last_name, full_name, username, profile_picture_url')
          .eq('id', userId)
          .maybeSingle();

        if (userError) {
          console.error(`Error fetching user data for ${userId}:`, userError);
          return null;
        }

        const profileName = userData?.full_name ||
          (userData?.first_name && userData?.last_name ? `${userData.first_name} ${userData.last_name}`.trim() : null) ||
          userData?.username ||
          userData?.email?.split('@')[0] ||
          'User';

        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: profileName,
            username: userData?.username || '',
            avatar_url: userData?.profile_picture_url || '',
            is_admin: false,
            is_online: false,
          });

        if (createProfileError) {
          console.error(`Error creating profile for ${userId}:`, createProfileError);
          // Continue anyway - profile might have been created by another process
        }
      }
    }

    // Check if conversation already exists (in either direction)
    // Convention: customer_id is the one who initiated, admin_id is the recipient
    const { data: existingConv, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(customer_id.eq.${currentUserId},admin_id.eq.${otherUserId}),and(customer_id.eq.${otherUserId},admin_id.eq.${currentUserId})`)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching conversation:', fetchError);
      return null;
    }

    if (existingConv) {
      // Get the other user's profile - prioritize users table for most up-to-date data
      const otherUserInConv = existingConv.customer_id === currentUserId ? existingConv.admin_id : existingConv.customer_id;
      
      // First try users table for most up-to-date info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, username, profile_picture_url')
        .eq('id', otherUserInConv)
        .single();

      if (!userError && userData) {
        const profile: Profile = {
          id: userData.id,
          name: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || 'User',
          username: userData.username || '',
          avatar_url: userData.profile_picture_url || '',
          is_admin: false,
          is_online: false,
        };
        return { ...existingConv, admin: profile } as Conversation & { admin: Profile };
      }

      // Fallback to profiles table
      const { data: otherProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserInConv)
        .single();

      if (profileError) {
        console.error('Error fetching other user profile:', profileError);
        return null;
      }

      if (otherProfile) {
        return { ...existingConv, admin: otherProfile } as Conversation & { admin: Profile };
      }
      return null;
    }

    // Create new conversation - current user is customer (initiator), other user is admin (recipient)
    // Fix 2: Mark as ephemeral until first message is sent
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        customer_id: currentUserId,
        admin_id: otherUserId,
        last_message: '',
        unread_count_admin: 0,
        unread_count_customer: 0,
        is_ephemeral: true,
        has_messages: false,
      })
      .select('*')
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);

      // Handle conflict - conversation already exists
      const isConflictError =
        createError.code === '23505' ||
        createError.code === '409' ||
        createError.message?.toLowerCase().includes('duplicate') ||
        createError.message?.toLowerCase().includes('conflict');

      if (isConflictError) {
        // Try fetching again
        const { data: existingConv } = await supabase
          .from('conversations')
          .select('*')
          .or(`and(customer_id.eq.${currentUserId},admin_id.eq.${otherUserId}),and(customer_id.eq.${otherUserId},admin_id.eq.${currentUserId})`)
          .maybeSingle();

        if (existingConv) {
          const otherUserInConv = existingConv.customer_id === currentUserId ? existingConv.admin_id : existingConv.customer_id;
          
          // Prioritize users table for up-to-date data
          const { data: userData } = await supabase
            .from('users')
            .select('id, first_name, last_name, username, profile_picture_url')
            .eq('id', otherUserInConv)
            .single();

          if (userData) {
            const profile: Profile = {
              id: userData.id,
              name: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || 'User',
              username: userData.username || '',
              avatar_url: userData.profile_picture_url || '',
              is_admin: false,
              is_online: false,
            };
            return { ...existingConv, admin: profile } as Conversation & { admin: Profile };
          }
        }
      }
      return null;
    }

    // Get the other user's profile from users table (most up-to-date)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, username, profile_picture_url')
      .eq('id', otherUserId)
      .single();

    if (!userError && userData && newConv) {
      const profile: Profile = {
        id: userData.id,
        name: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || 'User',
        username: userData.username || '',
        avatar_url: userData.profile_picture_url || '',
        is_admin: false,
        is_online: false,
      };
      return { ...newConv, admin: profile } as Conversation & { admin: Profile };
    }

    // Fallback to profiles table
    const { data: otherProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', otherUserId)
      .single();

    if (profileError) {
      console.error('Error fetching other user profile after creation:', profileError);
      return null;
    }

    if (otherProfile && newConv) {
      return { ...newConv, admin: otherProfile } as Conversation & { admin: Profile };
    }

    return null;
  } catch (error) {
    console.error('Error in getOrCreateUserConversation:', error);
    return null;
  }
}

// Hook for admin to see all customer conversations
export function useAdminConversations(adminId: string) {
  const [conversations, setConversations] = useState<(Conversation & { customer: Profile })[]>(() => {
    if (typeof window !== 'undefined' && adminId) {
      const cached = getCachedAdminConversations(adminId);
      return cached || [];
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && adminId) {
      const cached = getCachedAdminConversations(adminId);
      return !cached || cached.length === 0;
    }
    return true;
  });
  const hasInitiallyLoadedRef = useRef(false);

  useEffect(() => {
    if (!adminId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = getCachedAdminConversations(adminId);
    if (cached && cached.length > 0) {
      setConversations(cached);
      setLoading(false);
    }

    const fetchConversations = async () => {
      if (!hasInitiallyLoadedRef.current && !cached) {
        setLoading(true);
      }

      // Get all admin profile IDs so we fetch conversations regardless of which admin profile was used
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true);

      const adminIds = (adminProfiles || []).map(p => p.id);
      if (adminIds.length === 0) adminIds.push(adminId);

      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .in('admin_id', adminIds);

      if (convError) {
        console.error('Error fetching conversations:', convError);
        setConversations([]);
        setLoading(false);
        hasInitiallyLoadedRef.current = true;
        return;
      }

      if (!convData || convData.length === 0) {
        setConversations([]);
        setLoading(false);
        hasInitiallyLoadedRef.current = true;
        return;
      }

      const customerIds = [...new Set(convData.map(c => c.customer_id))];
      const conversationIds = convData.map(c => c.id);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', customerIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        setConversations([]);
        setLoading(false);
        hasInitiallyLoadedRef.current = true;
        return;
      }

      const { data: lastCustomerMessages, error: messagesError } = await supabase
        .from('messages')
        .select('conversation_id, created_at, sender_id')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching last customer messages:', messagesError);
      }

      const lastCustomerMessageMap = new Map<string, string>();
      if (lastCustomerMessages) {
        for (const msg of lastCustomerMessages) {
          const conv = convData.find(c => c.id === msg.conversation_id);
          if (conv && msg.sender_id === conv.customer_id) {
            if (!lastCustomerMessageMap.has(msg.conversation_id)) {
              lastCustomerMessageMap.set(msg.conversation_id, msg.created_at);
            }
          }
        }
      }

      const profileMap = new Map((profileData || []).map(p => [p.id, p]));
      const conversationsWithCustomers = convData.map(conv => ({
        ...conv,
        customer: profileMap.get(conv.customer_id) || null,
        last_customer_message_at: lastCustomerMessageMap.get(conv.id) || conv.last_message_at,
      })).filter(conv => conv.customer !== null) as (Conversation & { customer: Profile; last_customer_message_at?: string })[];

      // Preload avatar images
      conversationsWithCustomers.forEach((conv) => {
        if (conv.customer?.avatar_url) {
          preloadAndCacheImage(conv.customer.avatar_url);
        }
      });

      conversationsWithCustomers.sort((a, b) => {
        const hasCustomerMsgA = lastCustomerMessageMap.has(a.id);
        const hasCustomerMsgB = lastCustomerMessageMap.has(b.id);

        if (hasCustomerMsgA && !hasCustomerMsgB) return -1;
        if (!hasCustomerMsgA && hasCustomerMsgB) return 1;

        const timeA = a.last_customer_message_at ? new Date(a.last_customer_message_at).getTime() : (a.last_message_at ? new Date(a.last_message_at).getTime() : 0);
        const timeB = b.last_customer_message_at ? new Date(b.last_customer_message_at).getTime() : (b.last_message_at ? new Date(b.last_message_at).getTime() : 0);
        return timeB - timeA;
      });

      setConversations(conversationsWithCustomers);
      cacheAdminConversations(adminId, conversationsWithCustomers);
      setLoading(false);
      hasInitiallyLoadedRef.current = true;
    };

    fetchConversations();

    const channel = supabase
      .channel(`admin-conversations:${adminId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [adminId]);

  return { conversations, loading };
}
