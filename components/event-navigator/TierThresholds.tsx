'use client';

import { TierThresholds as TierThresholdsType, TierModelAssumptions } from '@/lib/event-navigator/types';

interface TierThresholdsProps {
  thresholds: TierThresholdsType;
  maxScore: number;
  tierDefinitions: TierModelAssumptions['tierDefinitions'];
  onChange: (thresholds: TierThresholdsType) => void;
}

export default function TierThresholds({ thresholds, maxScore, tierDefinitions, onChange }: TierThresholdsProps) {
  const t1Pct = maxScore > 0 ? (thresholds.tier1 / maxScore) * 100 : 0;
  const t2Pct = maxScore > 0 ? (thresholds.tier2 / maxScore) * 100 : 0;

  return (
    <div className="space-y-4">
      <p className="text-xs text-evn-text-muted">
        Set the score thresholds that define each tier. Events are classified based on where their score falls.
      </p>

      {/* Visual zone bar */}
      <div className="relative h-8 rounded-lg overflow-hidden flex">
        <div
          className="h-full flex items-center justify-center text-[10px] font-bold"
          style={{ width: `${100 - t1Pct}%`, backgroundColor: '#34D39930' }}
        >
          <span className="text-evn-tier1">{tierDefinitions.tier1.label}</span>
        </div>
        <div
          className="h-full flex items-center justify-center text-[10px] font-bold"
          style={{ width: `${t1Pct - t2Pct}%`, backgroundColor: '#FBBF2430' }}
        >
          <span className="text-evn-tier2">{tierDefinitions.tier2.label}</span>
        </div>
        <div
          className="h-full flex items-center justify-center text-[10px] font-bold"
          style={{ width: `${t2Pct}%`, backgroundColor: '#9CA3AF30' }}
        >
          <span className="text-evn-tier3">{tierDefinitions.tier3.label}</span>
        </div>
      </div>

      {/* Tier 1 threshold */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-evn-tier1 font-medium">Tier 1 minimum score</span>
          <span className="text-evn-text-primary font-mono">{thresholds.tier1} / {maxScore}</span>
        </div>
        <input
          type="range"
          min={thresholds.tier2 + 1}
          max={maxScore}
          value={thresholds.tier1}
          onChange={e => onChange({ ...thresholds, tier1: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-evn-border/30 rounded-full appearance-none cursor-pointer accent-evn-tier1"
        />
      </div>

      {/* Tier 2 threshold */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-evn-tier2 font-medium">Tier 2 minimum score</span>
          <span className="text-evn-text-primary font-mono">{thresholds.tier2} / {maxScore}</span>
        </div>
        <input
          type="range"
          min={1}
          max={thresholds.tier1 - 1}
          value={thresholds.tier2}
          onChange={e => onChange({ ...thresholds, tier2: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-evn-border/30 rounded-full appearance-none cursor-pointer accent-evn-tier2"
        />
      </div>

      <div className="text-[11px] text-evn-text-muted pt-2 border-t border-evn-border/50">
        <p>Tier 1: score &ge; {thresholds.tier1} ({Math.round(t1Pct)}%+)</p>
        <p>Tier 2: score {thresholds.tier2}–{thresholds.tier1 - 1} ({Math.round(t2Pct)}%–{Math.round(t1Pct - 1)}%)</p>
        <p>Tier 3: score &lt; {thresholds.tier2} (&lt;{Math.round(t2Pct)}%)</p>
      </div>
    </div>
  );
}
