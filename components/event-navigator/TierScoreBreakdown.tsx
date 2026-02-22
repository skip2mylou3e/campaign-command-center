'use client';

import { ScoredEvent, TierModelAssumptions } from '@/lib/event-navigator/types';

interface TierScoreBreakdownProps {
  event: ScoredEvent;
  assumptions: TierModelAssumptions;
  maxScore: number;
}

export default function TierScoreBreakdown({ event, assumptions, maxScore }: TierScoreBreakdownProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-evn-purple uppercase tracking-wider">
        Tier Score Breakdown
      </h4>
      <div className="space-y-2">
        {assumptions.criteria.map(criterion => {
          const raw = event.scores[criterion.id];
          const contribution = raw * criterion.weight;
          const maxContribution = 5 * criterion.weight;
          const pct = maxContribution > 0 ? (contribution / maxContribution) * 100 : 0;

          return (
            <div key={criterion.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-evn-text-secondary">{criterion.label}</span>
                <span className="text-evn-text-primary font-mono">
                  {raw} x {criterion.weight} = <span className="font-bold">{contribution}</span>
                </span>
              </div>
              <div className="h-1.5 bg-evn-border/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-evn-purple rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-evn-border/50 text-sm">
        <span className="text-evn-text-secondary font-medium">Total</span>
        <span className="font-bold text-evn-text-primary">
          {event.tierScore} / {maxScore}{' '}
          <span className="text-evn-text-muted font-normal">({event.percentScore}%)</span>
        </span>
      </div>
    </div>
  );
}
