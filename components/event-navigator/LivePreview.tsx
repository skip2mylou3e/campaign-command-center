'use client';

import { useState } from 'react';
import { ScoredEvent } from '@/lib/event-navigator/types';
import { TierDistribution } from '@/lib/event-navigator/hooks/useTierScoring';
import CountryFlag from './CountryFlag';
import TierBadge from './TierBadge';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';

interface LivePreviewProps {
  scoredEvents: ScoredEvent[];
  distribution: TierDistribution;
  maxScore: number;
}

export default function LivePreview({ scoredEvents, distribution }: LivePreviewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-evn-border/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-evn-purple" />
          <span className="text-xs font-medium text-evn-purple">Live Preview</span>
          <span className="text-[10px] text-evn-text-muted">
            T1: {distribution['Tier 1']} \u00b7 T2: {distribution['Tier 2']} \u00b7 T3: {distribution['Tier 3']}
          </span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-evn-text-muted" /> : <ChevronDown size={14} className="text-evn-text-muted" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 max-h-60 overflow-y-auto space-y-1">
          {scoredEvents.map(event => (
            <div key={event.id} className="flex items-center gap-2 py-1">
              <CountryFlag country={event.country} />
              <span className="text-[10px] font-mono text-evn-text-muted w-8">{event.id}</span>
              <span className="text-[11px] text-evn-text-secondary flex-1 truncate">{event.name}</span>
              <div className="w-16 h-1 bg-evn-border/30 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${event.percentScore}%`,
                    backgroundColor: event.tier === 'Tier 1' ? '#34D399' : event.tier === 'Tier 2' ? '#FBBF24' : '#9CA3AF',
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-evn-text-secondary w-6 text-right">{event.tierScore}</span>
              <TierBadge tier={event.tier} small />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
