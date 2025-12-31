import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Message, Profile, Conversation, ReplyTo } from '../types/chat';
import { getCachedMessages, cacheMessages } from '../utils/messageCache';
import { getCachedConversations, cacheConversations } from '../utils/conversationCache';

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
      console.warn('⚠️ fetchMessages: No conversationId provided');
      setLoading(false);
      return;
    }
    
    console.log('📥 Fetching messages for conversation:', conversationId);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setLoading(false);
        return;
      }

      console.log('✅ Fetched messages:', data?.length || 0, 'messages');
      
      if (data) {
        const fetchedMessages = data as Message[];
        setMessages(fetchedMessages);
        
        // Cache messages for instant loading next time
        cacheMessages(conversationId, fetchedMessages);
      } else {
        console.warn('⚠️ No messages data returned');
      }
    } catch (error) {
      console.error('❌ Exception fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      console.warn('⚠️ useChat: No conversationId, skipping message fetch');
      return;
    }
    
    console.log('🔄 useChat effect running for conversation:', conversationId, 'currentUserId:', currentUserId);
    
    // Check cache and set loading state accordingly
    const cached = getCachedMessages(conversationId);
    if (cached && cached.length > 0) {
      // We have cached messages - use them immediately, no loading state
      setMessages(cached);
      setLoading(false);
    } else {
      // No cache - show loading state while fetching
      setMessages([]);
      setLoading(true);
    }
    
    // Fetch fresh messages from server
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
            // Update cache with new message
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
            // Update cache with updated message
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
        // Get the conversation to check who the other user is
        const { data: convData } = await supabase
          .from('conversations')
          .select('customer_id, admin_id, unread_count_admin, unread_count_customer')
          .eq('id', conversationId)
          .single();

        if (convData) {
          const isCustomer = convData.customer_id === currentUserId;
          // Format last message: remove newlines, trim, and truncate if too long
          // Store plain message without "Me: " prefix (we'll add it in the UI)
          let lastMessageText = content || 'Sent an image';
          if (lastMessageText !== 'Sent an image') {
            lastMessageText = lastMessageText.replace(/\n/g, ' ').trim();
            // Strip any existing "Me: " prefix (in case of old data or edge cases)
            if (lastMessageText.startsWith('Me: ')) {
              lastMessageText = lastMessageText.substring(4).trim();
            }
            // Truncate to 80 characters for preview
            if (lastMessageText.length > 80) {
              lastMessageText = lastMessageText.substring(0, 80) + '...';
            }
          }
          const updateData: any = {
            last_message: lastMessageText,
            last_message_at: new Date().toISOString(),
            last_message_sender_id: currentUserId, // Store who sent the last message
          };

          // When user sends a message, mark their own unread count as 0 (they're viewing the conversation)
          // And increment unread count for the other user
          if (isCustomer) {
            // Customer sent message - mark their own unread as 0, increment admin unread count
            updateData.unread_count_customer = 0;
            updateData.unread_count_admin = (convData.unread_count_admin || 0) + 1;
          } else {
            // Admin sent message - mark their own unread as 0, increment customer unread count
            updateData.unread_count_admin = 0;
            const previousCount = convData.unread_count_customer || 0;
            updateData.unread_count_customer = previousCount + 1;
            console.log('Admin sent message - incrementing customer unread count:', {
              conversationId,
              previousCount,
              newCount: updateData.unread_count_customer,
              isCustomer
            });
          }

          const { error: updateError } = await supabase
            .from('conversations')
            .update(updateData)
            .eq('id', conversationId);
          
          if (updateError) {
            console.error('Error updating conversation:', updateError);
          } else {
            console.log('Successfully updated conversation unread count:', updateData);
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
    // Mark messages as seen
    const { data: convData } = await supabase
      .from('conversations')
      .select('customer_id, admin_id')
      .eq('id', conversationId)
      .single();

    if (convData) {
      const isCustomer = convData.customer_id === currentUserId;
      
      // Update message status
      await supabase
        .from('messages')
        .update({ status: 'seen' })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)
        .neq('status', 'seen');

      // Reset unread count for the current user
      const updateData: any = {};
      if (isCustomer) {
        updateData.unread_count_customer = 0;
      } else {
        updateData.unread_count_admin = 0;
      }

      const { data: updatedData, error: updateError } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating unread count:', updateError);
      } else {
        console.log('✅ Successfully updated unread count to 0:', {
          conversationId,
          isCustomer,
          updateData,
          updatedConversation: updatedData
        });
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
  // Initialize with cached data for instant display
  const [conversations, setConversations] = useState<(Conversation & { admin: Profile })[]>(() => {
    if (typeof window !== 'undefined' && customerId) {
      const cached = getCachedConversations(customerId);
      return (cached as (Conversation & { admin: Profile })[]) || [];
    }
    return [];
  });
  // Only show loading if we don't have cached data
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && customerId) {
      const cached = getCachedConversations(customerId);
      return !cached || cached.length === 0;
    }
    return true;
  });
  
  // Function to optimistically update a conversation's unread count
  const updateConversationUnreadCount = useCallback((conversationId: string, unreadCount: number) => {
    setConversations((prev) => {
      const updated = prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unread_count_customer: unreadCount } : conv
      );
      console.log('Optimistically updated conversation unread count:', {
        conversationId,
        unreadCount,
        conversations: updated.map(c => ({ id: c.id, unread: c.unread_count_customer }))
      });
      return updated;
    });
  }, []);

  // Define fetchConversations outside useEffect using useCallback to avoid closure issues
  const fetchConversations = useCallback(async () => {
    if (!customerId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    console.log('📥 [useCustomerConversations] Fetching conversations for customer:', customerId);
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        admin:profiles!conversations_admin_id_fkey(*)
      `)
      .eq('customer_id', customerId)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('❌ [useCustomerConversations] Error fetching conversations:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    }

    if (!error && data) {
      const conversationsData = data as (Conversation & { admin: Profile })[];
      
      // Log which conversations have admin profiles
      conversationsData.forEach((conv, index) => {
        if (!conv.admin) {
          console.warn(`⚠️ [useCustomerConversations] Conversation ${conv.id} (index ${index}) has no admin profile!`, {
            conversationId: conv.id,
            adminId: conv.admin_id,
            hasAdmin: !!conv.admin
          });
        }
      });
      
      const totalUnread = conversationsData.reduce((sum, c) => sum + (c.unread_count_customer || 0), 0);
      console.log('📦 [useCustomerConversations] Fetched conversations:', {
        customerId,
        count: conversationsData.length,
        totalUnread,
        conversationsWithAdmin: conversationsData.filter(c => !!c.admin).length,
        conversationsWithoutAdmin: conversationsData.filter(c => !c.admin).length,
        unreadCounts: conversationsData.map(c => ({ 
          id: c.id, 
          unread: c.unread_count_customer,
          hasAdmin: !!c.admin,
          adminName: c.admin?.name 
        }))
      });
      // Always create a new array reference to ensure React detects the change
      setConversations([...conversationsData]);
      
      // Cache conversations for instant loading next time
      cacheConversations(customerId, conversationsData);
      
      // Preload and cache all avatar images in the background
      conversationsData.forEach((conv) => {
        if (conv.admin?.avatar_url) {
          // Dynamic import to avoid circular dependency
          import('../utils/imageCache').then(({ preloadAndCacheImage }) => {
            preloadAndCacheImage(conv.admin.avatar_url);
          });
        }
      });
    } else if (error) {
      console.error('❌ Error fetching customer conversations:', error);
    }
    setLoading(false);
  }, [customerId]);

  useEffect(() => {
    // Don't fetch if customerId is empty
    if (!customerId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Check cache first and use it immediately if available
    const cached = getCachedConversations(customerId);
    if (cached && cached.length > 0) {
      setConversations(cached as (Conversation & { admin: Profile })[]);
      setLoading(false);
    }

    // Always fetch fresh data in the background (stale-while-revalidate)
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
          const oldData = payload.old as Partial<Conversation> | null;
          
          console.log('🔔 Real-time conversation update received:', {
            event: payload.eventType,
            conversationId: newData?.id,
            unread_count_customer: newData?.unread_count_customer,
            old_unread_count: oldData?.unread_count_customer,
            customerId,
            fullPayload: payload
          });
          
          // If this is an UPDATE event, optimistically update immediately
          if (payload.eventType === 'UPDATE' && newData?.id) {
            const updatedConv = newData as Conversation;
            setConversations((prev) => {
              const existingIndex = prev.findIndex(c => c.id === updatedConv.id);
              if (existingIndex >= 0) {
                // Update the conversation with new unread count immediately
                const updated = [...prev];
                const adminProfile = prev[existingIndex].admin;
                updated[existingIndex] = { ...updatedConv, admin: adminProfile } as Conversation & { admin: Profile };
                const totalUnread = updated.reduce((sum, c) => sum + (c.unread_count_customer || 0), 0);
                console.log('✅ Optimistically updated conversation from real-time:', {
                  conversationId: updatedConv.id,
                  unread_count_customer: updatedConv.unread_count_customer,
                  totalUnread,
                  allUnreadCounts: updated.map(c => ({ id: c.id, unread: c.unread_count_customer }))
                });
                return updated;
              }
              return prev;
            });
            // Don't refetch after optimistic update - the optimistic update is sufficient
            // This prevents flickering of the badge
            return;
          }
          
          // Only refetch for INSERT events or if optimistic update didn't apply
          // This ensures the badge counter updates correctly in real-time without flickering
          console.log(`🔄 [useCustomerConversations:${customerId.substring(0, 8)}] Refetching conversations after real-time update...`);
          fetchConversations();
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status changed:', status, 'for customer:', customerId);
      });

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
    console.log('🔍 [getAdminId] Searching for admin profile...');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, is_admin')
      .eq('is_admin', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ [getAdminId] Error fetching admin:', error);
      console.error('❌ [getAdminId] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return null;
    }

    if (!data) {
      console.warn('⚠️ [getAdminId] No admin profile found. Make sure at least one profile has is_admin = true');
      // List all profiles for debugging
      const { data: allProfiles, error: listError } = await supabase
        .from('profiles')
        .select('id, name, is_admin, email')
        .limit(10);
      
      if (listError) {
        console.error('❌ [getAdminId] Error listing profiles:', listError);
      } else {
        console.log('📋 [getAdminId] Available profiles:', allProfiles);
        const adminProfiles = allProfiles?.filter(p => p.is_admin === true) || [];
        if (adminProfiles.length === 0) {
          console.error('❌ [getAdminId] NO ADMIN PROFILES FOUND! Please create an admin profile with is_admin = true');
        }
      }
      return null;
    }

    console.log('✅ [getAdminId] Admin profile ID found:', data.id, 'Name:', data.name);
    return data.id;
  } catch (error) {
    console.error('❌ [getAdminId] Exception:', error);
    return null;
  }
}

// Get or create a conversation with admin for a customer
export async function getOrCreateAdminConversation(customerId: string): Promise<Conversation & { admin: Profile } | null> {
  try {
    console.log('💬 [getOrCreateAdminConversation] Starting for customer:', customerId);
    
    // CRITICAL: Ensure customer profile exists before creating conversation
    // The foreign key constraint requires the customer_id to exist in profiles table
    console.log('🔍 [getOrCreateAdminConversation] Checking if customer profile exists...');
    const { data: customerProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', customerId)
      .maybeSingle();
    
    if (profileCheckError) {
      console.error('❌ [getOrCreateAdminConversation] Error checking customer profile:', profileCheckError);
      return null;
    }
    
    if (!customerProfile) {
      console.log('⚠️ [getOrCreateAdminConversation] Customer profile does not exist, creating it...');
      
      // Get user data to populate profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, first_name, last_name, full_name')
        .eq('id', customerId)
        .maybeSingle();
      
      if (userError) {
        console.error('❌ [getOrCreateAdminConversation] Error fetching user data:', userError);
        return null;
      }
      
      // Create profile with user data
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
        console.error('❌ [getOrCreateAdminConversation] Error creating customer profile:', createProfileError);
        console.error('❌ [getOrCreateAdminConversation] This will prevent conversation creation due to foreign key constraint');
        return null;
      }
      
      console.log('✅ [getOrCreateAdminConversation] Customer profile created successfully');
    } else {
      console.log('✅ [getOrCreateAdminConversation] Customer profile exists');
    }
    
    // First, get the admin ID
    const adminId = await getAdminId();
    if (!adminId) {
      console.error('❌ [getOrCreateAdminConversation] No admin profile found. Please ensure at least one profile has is_admin = true');
      console.error('❌ [getOrCreateAdminConversation] This means the admin conversation cannot be created');
      return null;
    }

    console.log('✅ [getOrCreateAdminConversation] Admin ID found:', adminId);

    // Check if conversation already exists
    console.log('🔍 [getOrCreateAdminConversation] Checking for existing conversation...');
    const { data: existingConv, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('customer_id', customerId)
      .eq('admin_id', adminId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ [getOrCreateAdminConversation] Error fetching conversation:', fetchError);
      console.error('❌ [getOrCreateAdminConversation] Error details:', {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details
      });
      return null;
    }

    if (existingConv) {
      console.log('✅ [getOrCreateAdminConversation] Existing conversation found:', existingConv.id);
      // Fetch admin profile
      const { data: adminProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminId)
        .single();

      if (profileError) {
        console.error('❌ [getOrCreateAdminConversation] Error fetching admin profile:', profileError);
        return null;
      }

      if (adminProfile) {
        console.log('✅ [getOrCreateAdminConversation] Admin profile loaded:', adminProfile.name);
        console.log('✅ [getOrCreateAdminConversation] Returning existing conversation with admin');
        return { ...existingConv, admin: adminProfile } as Conversation & { admin: Profile };
      }
      console.warn('⚠️ [getOrCreateAdminConversation] Admin profile is null');
      return null;
    }
    
    console.log('ℹ️ [getOrCreateAdminConversation] No existing conversation found, will create new one');

    // Create new conversation
    console.log('Creating new conversation with admin...');
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
      
      // Handle 409 conflict - conversation already exists (race condition or duplicate)
      // Check for various error codes and messages that indicate a duplicate/conflict
      const isConflictError = 
        createError.code === '23505' || // PostgreSQL unique violation
        createError.code === '409' || // HTTP 409 Conflict
        createError.code === 'PGRST204' || // PostgREST conflict
        createError.message?.toLowerCase().includes('duplicate') ||
        createError.message?.toLowerCase().includes('unique') ||
        createError.message?.toLowerCase().includes('conflict') ||
        createError.message?.toLowerCase().includes('already exists');
      
      if (isConflictError) {
        console.log('⚠️ Conversation already exists (conflict detected), fetching existing conversation...', {
          errorCode: createError.code,
          errorMessage: createError.message
        });
        
        // Fetch the existing conversation
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
          console.log('✅ Found existing conversation after conflict:', existingConv.id);
          // Fetch admin profile
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
            console.log('✅ Admin profile loaded after conflict:', adminProfile.name);
            return { ...existingConv, admin: adminProfile } as Conversation & { admin: Profile };
          }
        }
      }
      
      return null;
    }

    console.log('New conversation created:', newConv.id);

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
      // Update conversation with last message
      const welcomeMessagePreview = welcomeMessage.split('\n')[0]; // First line only
      await supabase
        .from('conversations')
        .update({
          last_message: welcomeMessagePreview,
          last_message_at: new Date().toISOString(),
          last_message_sender_id: adminId, // Admin sent the welcome message
          unread_count_customer: 1,
        })
        .eq('id', newConv.id);
    }

    // Fetch admin profile
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
      const result = { ...newConv, admin: adminProfile } as Conversation & { admin: Profile };
      console.log('Conversation ready:', result);
      return result;
    }

    return null;
  } catch (error) {
    console.error('Exception in getOrCreateAdminConversation:', error);
    return null;
  }
}

// Hook for admin to see all customer conversations
export function useAdminConversations(adminId: string) {
  const [conversations, setConversations] = useState<(Conversation & { customer: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const hasInitiallyLoadedRef = useRef(false);

  useEffect(() => {
    // Don't fetch if adminId is empty
    if (!adminId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      // Only set loading on initial fetch, not on subsequent real-time updates
      if (!hasInitiallyLoadedRef.current) {
        setLoading(true);
      }
      // First get conversations
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

      // Get all unique customer IDs and conversation IDs
      const customerIds = [...new Set(convData.map(c => c.customer_id))];
      const conversationIds = convData.map(c => c.id);
      
      // Fetch customer profiles
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

      // Get the most recent message from each customer (where sender_id = customer_id)
      // This will help us sort conversations by most recent user message
      const { data: lastCustomerMessages, error: messagesError } = await supabase
        .from('messages')
        .select('conversation_id, created_at, sender_id')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching last customer messages:', messagesError);
      }

      // Create a map of conversation_id -> most recent customer message timestamp
      const lastCustomerMessageMap = new Map<string, string>();
      if (lastCustomerMessages) {
        for (const msg of lastCustomerMessages) {
          const conv = convData.find(c => c.id === msg.conversation_id);
          // Only consider messages from the customer (not admin)
          if (conv && msg.sender_id === conv.customer_id) {
            if (!lastCustomerMessageMap.has(msg.conversation_id)) {
              lastCustomerMessageMap.set(msg.conversation_id, msg.created_at);
            }
          }
        }
      }

      // Map profiles to conversations
      const profileMap = new Map((profileData || []).map(p => [p.id, p]));
      const conversationsWithCustomers = convData.map(conv => ({
        ...conv,
        customer: profileMap.get(conv.customer_id) || null,
        last_customer_message_at: lastCustomerMessageMap.get(conv.id) || conv.last_message_at,
      })).filter(conv => conv.customer !== null) as (Conversation & { customer: Profile; last_customer_message_at?: string })[];

      // Preload and cache all customer avatar images in the background
      conversationsWithCustomers.forEach((conv) => {
        if (conv.customer?.avatar_url) {
          // Dynamic import to avoid circular dependency
          import('../utils/imageCache').then(({ preloadAndCacheImage }) => {
            preloadAndCacheImage(conv.customer.avatar_url);
          });
        }
      });

      // Sort by most recent customer message
      // Conversations with customer messages are prioritized over those without
      conversationsWithCustomers.sort((a, b) => {
        const hasCustomerMsgA = lastCustomerMessageMap.has(a.id);
        const hasCustomerMsgB = lastCustomerMessageMap.has(b.id);
        
        // If one has customer message and the other doesn't, prioritize the one with customer message
        if (hasCustomerMsgA && !hasCustomerMsgB) return -1;
        if (!hasCustomerMsgA && hasCustomerMsgB) return 1;
        
        // Both have or both don't have customer messages - sort by timestamp
        const timeA = a.last_customer_message_at ? new Date(a.last_customer_message_at).getTime() : (a.last_message_at ? new Date(a.last_message_at).getTime() : 0);
        const timeB = b.last_customer_message_at ? new Date(b.last_customer_message_at).getTime() : (b.last_message_at ? new Date(b.last_message_at).getTime() : 0);
        return timeB - timeA; // Descending order (most recent first)
      });

      setConversations(conversationsWithCustomers);
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
          // Silently refresh on real-time updates (don't show loading)
          // hasInitiallyLoadedRef ensures we don't set loading to true
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

