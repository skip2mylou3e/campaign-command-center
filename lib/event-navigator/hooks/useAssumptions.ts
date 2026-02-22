'use client';

import { useState, useEffect, useCallback } from 'react';
import { TierModelAssumptions } from '../types';
import { tierModelDefaults } from '../data/tierModelDefaults';

const STORAGE_KEY = 'evn-tier-model-assumptions';

function loadAssumptions(): TierModelAssumptions {
  if (typeof window === 'undefined') return tierModelDefaults;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as TierModelAssumptions;
      // Validate structure
      if (parsed.criteria?.length === 5 && parsed.thresholds && parsed.tierDefinitions) {
        return parsed;
      }
    }
  } catch {
    // Fall through to defaults
  }
  return tierModelDefaults;
}

export function useAssumptions() {
  const [assumptions, setAssumptions] = useState<TierModelAssumptions>(tierModelDefaults);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setAssumptions(loadAssumptions());
    setLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assumptions));
    } catch {
      // Silently fail if storage is full
    }
  }, [assumptions, loaded]);

  const updateCriterionWeight = useCallback((criterionId: string, weight: number) => {
    setAssumptions(prev => ({
      ...prev,
      criteria: prev.criteria.map(c =>
        c.id === criterionId ? { ...c, weight: Math.max(0, Math.min(10, weight)) } : c
      ),
    }));
  }, []);

  const updateThresholds = useCallback((thresholds: { tier1: number; tier2: number }) => {
    setAssumptions(prev => ({
      ...prev,
      thresholds: {
        tier1: Math.max(thresholds.tier2 + 1, thresholds.tier1),
        tier2: Math.max(1, thresholds.tier2),
      },
    }));
  }, []);

  const updateTierDefinition = useCallback(
    (tier: 'tier1' | 'tier2' | 'tier3', field: 'label' | 'description', value: string) => {
      setAssumptions(prev => ({
        ...prev,
        tierDefinitions: {
          ...prev.tierDefinitions,
          [tier]: { ...prev.tierDefinitions[tier], [field]: value },
        },
      }));
    },
    []
  );

  const updateAnchor = useCallback(
    (criterionId: string, level: 'low' | 'mid' | 'high', value: string) => {
      setAssumptions(prev => ({
        ...prev,
        criteria: prev.criteria.map(c =>
          c.id === criterionId ? { ...c, anchors: { ...c.anchors, [level]: value } } : c
        ),
      }));
    },
    []
  );

  const resetToDefaults = useCallback(() => {
    setAssumptions(tierModelDefaults);
  }, []);

  return {
    assumptions,
    loaded,
    updateCriterionWeight,
    updateThresholds,
    updateTierDefinition,
    updateAnchor,
    resetToDefaults,
  };
}
