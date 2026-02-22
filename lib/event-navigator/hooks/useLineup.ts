'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'evn-lineup';

function loadLineup(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const arr = JSON.parse(stored) as string[];
      return new Set(arr);
    }
  } catch {
    // Fall through
  }
  return new Set();
}

export function useLineup() {
  const [lineupIds, setLineupIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLineupIds(loadLineup());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(lineupIds)));
    } catch {
      // Silently fail
    }
  }, [lineupIds, loaded]);

  const toggle = useCallback((eventId: string) => {
    setLineupIds(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  }, []);

  const add = useCallback((eventId: string) => {
    setLineupIds(prev => {
      if (prev.has(eventId)) return prev;
      const next = new Set(prev);
      next.add(eventId);
      return next;
    });
  }, []);

  const remove = useCallback((eventId: string) => {
    setLineupIds(prev => {
      if (!prev.has(eventId)) return prev;
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setLineupIds(new Set());
  }, []);

  const loadFromPlan = useCallback((eventIds: string[]) => {
    setLineupIds(new Set(eventIds));
  }, []);

  return {
    lineupIds,
    lineupCount: lineupIds.size,
    toggle,
    add,
    remove,
    clear,
    loadFromPlan,
    isInLineup: (id: string) => lineupIds.has(id),
  };
}
