'use client';

import { CriterionConfig } from '@/lib/event-navigator/types';

interface ScoreAnchorsProps {
  criteria: CriterionConfig[];
  onUpdate: (criterionId: string, level: 'low' | 'mid' | 'high', value: string) => void;
}

const levels: { key: 'low' | 'mid' | 'high'; label: string; score: string; color: string }[] = [
  { key: 'low', label: 'Low', score: '1', color: 'text-evn-alert' },
  { key: 'mid', label: 'Medium', score: '3', color: 'text-evn-tier2' },
  { key: 'high', label: 'High', score: '5', color: 'text-evn-tier1' },
];

export default function ScoreAnchors({ criteria, onUpdate }: ScoreAnchorsProps) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-evn-text-muted">
        Define what each score level means for each criterion.
      </p>
      {criteria.map(c => (
        <div key={c.id} className="space-y-2">
          <h5 className="text-sm font-medium text-evn-text-primary">{c.label}</h5>
          <div className="space-y-1.5">
            {levels.map(level => (
              <div key={level.key} className="flex items-start gap-2">
                <span className={`text-[10px] font-bold ${level.color} w-12 shrink-0 pt-1`}>
                  {level.label} ({level.score})
                </span>
                <input
                  type="text"
                  value={c.anchors[level.key]}
                  onChange={e => onUpdate(c.id, level.key, e.target.value)}
                  className="flex-1 bg-evn-base/50 border border-evn-border/30 rounded px-2 py-1 text-xs text-evn-text-secondary focus:outline-none focus:border-evn-purple/50"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
