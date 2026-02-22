'use client';

import { useState, useEffect, useCallback } from 'react';
import { SavedContentDraft, CGEInput, ChannelGroupResult } from '../types';

const STORAGE_KEY = 'cge-saved-content';

function loadDrafts(): SavedContentDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as SavedContentDraft[];
    }
  } catch {
    // Fall through
  }
  return [];
}

export function useSavedContent() {
  const [drafts, setDrafts] = useState<SavedContentDraft[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDrafts(loadDrafts());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // Silently fail
    }
  }, [drafts, loaded]);

  const saveDraft = useCallback(
    (name: string, input: CGEInput, results: Record<string, ChannelGroupResult>) => {
      const draft: SavedContentDraft = {
        id: String(Date.now()),
        name,
        input,
        results,
        createdAt: new Date().toISOString(),
      };
      setDrafts(prev => [draft, ...prev]);
      return draft;
    },
    []
  );

  const deleteDraft = useCallback((id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  }, []);

  return { drafts, saveDraft, deleteDraft };
}
