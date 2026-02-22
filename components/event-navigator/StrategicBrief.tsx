'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Lightbulb, Clock } from 'lucide-react';
import { AIResult } from '@/lib/event-navigator/types';

interface StrategicBriefProps {
  result: AIResult;
  objective: string;
}

export default function StrategicBrief({ result, objective }: StrategicBriefProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-evn-card border border-evn-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div>
          <h3 className="text-sm font-semibold text-evn-text-primary">Strategic Brief</h3>
          <p className="text-xs text-evn-text-muted mt-0.5 line-clamp-1">{objective}</p>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-evn-text-muted shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-evn-text-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-evn-border/50 pt-3">
          <p className="text-sm text-evn-text-secondary leading-relaxed">{result.strategicBrief}</p>

          {result.keyInsight && (
            <div className="flex gap-2 p-3 rounded-xl bg-evn-amber/10 border border-evn-amber/20">
              <Lightbulb size={16} className="text-evn-amber shrink-0 mt-0.5" />
              <p className="text-xs text-evn-amber leading-relaxed">{result.keyInsight}</p>
            </div>
          )}

          {result.competitiveAlert && (
            <div className="flex gap-2 p-3 rounded-xl bg-evn-alert/10 border border-evn-alert/20">
              <AlertTriangle size={16} className="text-evn-alert shrink-0 mt-0.5" />
              <p className="text-xs text-evn-alert leading-relaxed">{result.competitiveAlert}</p>
            </div>
          )}

          {result.timeline.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-evn-text-secondary">
                <Clock size={12} />
                <span>Timeline</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.timeline.map((t, i) => (
                  <span
                    key={i}
                    className={`text-[11px] px-2 py-1 rounded-full border ${
                      t.type === 'confirmed'
                        ? 'bg-evn-tier1/10 border-evn-tier1/20 text-evn-tier1'
                        : t.type === 'deadline'
                        ? 'bg-evn-alert/10 border-evn-alert/20 text-evn-alert'
                        : 'bg-evn-amber/10 border-evn-amber/20 text-evn-amber'
                    }`}
                  >
                    {t.date}: {t.event}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
