'use client';

import { useMemo } from 'react';
import { Event, TierModelAssumptions, ScoredEvent, TierLabel } from '../types';
import { computeTierScore, getMaxScore, getTier, getPercentScore } from '../scoring';

export interface TierDistribution {
  'Tier 1': number;
  'Tier 2': number;
  'Tier 3': number;
}

export function useTierScoring(
  events: Event[],
  assumptions: TierModelAssumptions
) {
  const maxScore = useMemo(() => getMaxScore(assumptions.criteria), [assumptions.criteria]);

  const scoredEvents = useMemo(() => {
    return events
      .filter(e => e.type === 'catalog')
      .map((event): ScoredEvent => {
        const tierScore = computeTierScore(event.scores, assumptions.criteria);
        const tier = getTier(tierScore, assumptions.thresholds);
        const percentScore = getPercentScore(tierScore, maxScore);
        return { ...event, tierScore, tier, percentScore };
      })
      .sort((a, b) => b.tierScore - a.tierScore);
  }, [events, assumptions, maxScore]);

  const distribution = useMemo((): TierDistribution => {
    const dist: TierDistribution = { 'Tier 1': 0, 'Tier 2': 0, 'Tier 3': 0 };
    for (const e of scoredEvents) {
      dist[e.tier]++;
    }
    return dist;
  }, [scoredEvents]);

  const getEventById = useMemo(() => {
    const map = new Map<string, ScoredEvent>();
    for (const e of scoredEvents) {
      map.set(e.id, e);
    }
    // Also add intel events (unscored)
    for (const e of events) {
      if (e.type === 'intel' && !map.has(e.id)) {
        map.set(e.id, { ...e, tierScore: 0, tier: 'Tier 3' as TierLabel, percentScore: 0 });
      }
    }
    return (id: string) => map.get(id) || null;
  }, [scoredEvents, events]);

  return { scoredEvents, distribution, maxScore, getEventById };
}
