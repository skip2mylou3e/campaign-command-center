'use client';

import { CriterionConfig } from '@/lib/event-navigator/types';
import { Minus, Plus } from 'lucide-react';

interface CriteriaWeightsProps {
  criteria: CriterionConfig[];
  onWeightChange: (criterionId: string, weight: number) => void;
}

export default function CriteriaWeights({ criteria, onWeightChange }: CriteriaWeightsProps) {
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);

  return (
    <div className="space-y-4">
      <p className="text-xs text-evn-text-muted">
        Adjust how much each criterion contributes to the tier score. Higher weight = more influence.
      </p>
      {criteria.map(c => {
        const pct = totalWeight > 0 ? Math.round((c.weight / totalWeight) * 100) : 0;
        return (
          <div key={c.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-evn-text-primary">{c.label}</span>
                <p className="text-[11px] text-evn-text-muted">{c.description}</p>
              </div>
              <span className="text-xs text-evn-purple font-mono ml-2 shrink-0">{pct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onWeightChange(c.id, c.weight - 1)}
                disabled={c.weight <= 0}
                className="w-6 h-6 rounded flex items-center justify-center bg-evn-border/30 text-evn-text-secondary hover:bg-evn-purple/20 hover:text-evn-purple disabled:opacity-30 transition-colors"
              >
                <Minus size={12} />
              </button>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={c.weight}
                  onChange={e => onWeightChange(c.id, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-evn-border/30 rounded-full appearance-none cursor-pointer accent-evn-purple"
                />
              </div>
              <button
                onClick={() => onWeightChange(c.id, c.weight + 1)}
                disabled={c.weight >= 10}
                className="w-6 h-6 rounded flex items-center justify-center bg-evn-border/30 text-evn-text-secondary hover:bg-evn-purple/20 hover:text-evn-purple disabled:opacity-30 transition-colors"
              >
                <Plus size={12} />
              </button>
              <span className="text-sm font-bold text-evn-purple w-6 text-center">{c.weight}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
