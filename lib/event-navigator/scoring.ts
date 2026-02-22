import { EventScores, CriterionConfig, TierThresholds, TierLabel } from './types';

export function computeTierScore(
  eventScores: EventScores,
  criteria: CriterionConfig[]
): number {
  return criteria.reduce(
    (sum, c) => sum + (eventScores[c.id] || 0) * c.weight,
    0
  );
}

export function getMaxScore(criteria: CriterionConfig[]): number {
  return 5 * criteria.reduce((sum, c) => sum + c.weight, 0);
}

export function getTier(
  score: number,
  thresholds: TierThresholds
): TierLabel {
  if (score >= thresholds.tier1) return 'Tier 1';
  if (score >= thresholds.tier2) return 'Tier 2';
  return 'Tier 3';
}

export function getPercentScore(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}
