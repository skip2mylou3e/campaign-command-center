'use client';

import { useState, useEffect, useCallback } from 'react';
import { SavedPlan, TierModelAssumptions, ObjectiveParams } from '../types';

const STORAGE_KEY = 'evn-saved-plans';

function loadPlans(): SavedPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as SavedPlan[];
    }
  } catch {
    // Fall through
  }
  return [];
}

export function useSavedPlans() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPlans(loadPlans());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // Silently fail
    }
  }, [plans, loaded]);

  const savePlan = useCallback(
    (name: string, eventIds: string[], objective: string, assumptions: TierModelAssumptions, params?: ObjectiveParams) => {
      const plan: SavedPlan = {
        id: Date.now(),
        name,
        created: new Date().toISOString(),
        eventIds,
        objective,
        params,
        assumptions,
      };
      setPlans(prev => [plan, ...prev]);
      return plan;
    },
    []
  );

  const deletePlan = useCallback((planId: number) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
  }, []);

  return { plans, savePlan, deletePlan };
}
