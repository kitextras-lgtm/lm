// Fix 22: Input State Preservation (Drafts)

import { useState, useEffect, useCallback } from 'react';

export function useDrafts(userId: string) {
  const [drafts, setDrafts] = useState<Map<string, string>>(new Map());

  // Load drafts from localStorage on mount
  useEffect(() => {
    if (!userId) return;

    const stored = localStorage.getItem(`drafts_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDrafts(new Map(Object.entries(parsed)));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [userId]);

  // Save drafts to localStorage
  const persistDrafts = useCallback((newDrafts: Map<string, string>) => {
    if (!userId) return;
    const obj = Object.fromEntries(newDrafts);
    localStorage.setItem(`drafts_${userId}`, JSON.stringify(obj));
  }, [userId]);

  const setDraft = useCallback((conversationId: string, content: string) => {
    setDrafts(prev => {
      const newDrafts = new Map(prev);

      if (content.trim()) {
        newDrafts.set(conversationId, content);
      } else {
        newDrafts.delete(conversationId);
      }

      persistDrafts(newDrafts);
      return newDrafts;
    });
  }, [persistDrafts]);

  const getDraft = useCallback((conversationId: string) => {
    return drafts.get(conversationId) || '';
  }, [drafts]);

  const clearDraft = useCallback((conversationId: string) => {
    setDrafts(prev => {
      const newDrafts = new Map(prev);
      newDrafts.delete(conversationId);
      persistDrafts(newDrafts);
      return newDrafts;
    });
  }, [persistDrafts]);

  return { getDraft, setDraft, clearDraft };
}
