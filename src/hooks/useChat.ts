import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Message, Profile, Conversation, ReplyTo } from '../types/chat';
import { getCachedMessages, cacheMessages } from '../utils/messageCache';
import { getCachedConversations, cacheConversations } from '../utils/conversationCache';
import { getCachedAdminConversations, cacheAdminConversations } from '../utils/adminConversationCache';
import { preloadAndCacheImage } from '../utils/imageCache';

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
          .select('customer_id, admin_id, unread_count_admin, unread_count_customer')
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

export function useCustomerConversations(customerId: string) {
  const [conversations, setConversations] = useState<(Conversation & { admin: Profile })[]>(() => {
    if (typeof window !== 'undefined' && customerId) {
      const cached = getCachedConversations(customerId);
      return (cached as (Conversation & { admin: Profile })[]) || [];
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && customerId) {
      const cached = getCachedConversations(customerId);
      return !cached || cached.length === 0;
    }
    return true;
  });

  const updateConversationUnreadCount = useCallback((conversationId: string, unreadCount: number) => {
    setConversations((prev) => {
      return prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unread_count_customer: unreadCount } : conv
      );
    });
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!customerId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        admin:profiles!conversations_admin_id_fkey(*)
      `)
      .eq('customer_id', customerId)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
    }

    if (!error && data) {
      const conversationsData = data as (Conversation & { admin: Profile })[];
      setConversations([...conversationsData]);
      cacheConversations(customerId, conversationsData);

      // Preload avatar images
      conversationsData.forEach((conv) => {
        if (conv.admin?.avatar_url) {
          preloadAndCacheImage(conv.admin.avatar_url);
        }
      });
    }
    setLoading(false);
  }, [customerId]);

  useEffect(() => {
    if (!customerId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const cached = getCachedConversations(customerId);
    if (cached && cached.length > 0) {
      setConversations(cached as (Conversation & { admin: Profile })[]);
      setLoading(false);
    }

    fetchConversations();

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

          if (payload.eventType === 'UPDATE' && newData?.id) {
            const updatedConv = newData as Conversation;
            setConversations((prev) => {
              const existingIndex = prev.findIndex(c => c.id === updatedConv.id);
              if (existingIndex >= 0) {
                const updated = [...prev];
                const adminProfile = prev[existingIndex].admin;
                updated[existingIndex] = { ...updatedConv, admin: adminProfile } as Conversation & { admin: Profile };
                return updated;
              }
              return prev;
            });
            return;
          }

          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [customerId, fetchConversations]);

  return { conversations, loading, updateConversationUnreadCount, refetch: fetchConversations };
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
    // Ensure customer profile exists before creating conversation
    const { data: customerProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', customerId)
      .maybeSingle();

    if (profileCheckError) {
      console.error('Error checking customer profile:', profileCheckError);
      return null;
    }

    if (!customerProfile) {
      // Get user data to populate profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, first_name, last_name, full_name')
        .eq('id', customerId)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return null;
      }

      const profileName = userData?.full_name ||
                         (userData?.first_name && userData?.last_name ? `${userData.first_name} ${userData.last_name}`.trim() : null) ||
                         userData?.email?.split('@')[0] ||
                         'User';

      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: customerId,
          name: profileName,
          avatar_url: '',
          is_admin: false,
          is_online: false,
        });

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

      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('admin_id', adminId);

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
          filter: `admin_id=eq.${adminId}`,
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
