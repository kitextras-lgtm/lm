// Fix 20: Per-user Conversation Actions (archive, delete, pin)

import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useConversationActions(currentUserId: string) {
  const archiveConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from('conversation_user_state')
      .upsert({
        conversation_id: conversationId,
        user_id: currentUserId,
        archived_at: new Date().toISOString(),
      });

    return { error };
  }, [currentUserId]);

  const unarchiveConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from('conversation_user_state')
      .update({ archived_at: null })
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId);

    return { error };
  }, [currentUserId]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    // Soft delete - just hides for this user
    const { error } = await supabase
      .from('conversation_user_state')
      .upsert({
        conversation_id: conversationId,
        user_id: currentUserId,
        deleted_at: new Date().toISOString(),
      });

    return { error };
  }, [currentUserId]);

  const pinConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from('conversation_user_state')
      .upsert({
        conversation_id: conversationId,
        user_id: currentUserId,
        pinned_at: new Date().toISOString(),
      });

    return { error };
  }, [currentUserId]);

  const unpinConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from('conversation_user_state')
      .update({ pinned_at: null })
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId);

    return { error };
  }, [currentUserId]);

  return {
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    pinConversation,
    unpinConversation,
  };
}
