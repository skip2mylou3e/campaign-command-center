'use client';

import { HistoryEntry } from '@/lib/event-navigator/types';
import { History, Check } from 'lucide-react';

interface DDHistoryDisplayProps {
  eventId: string;
  history: HistoryEntry[];
}

export default function DDHistoryDisplay({ eventId, history }: DDHistoryDisplayProps) {
  const entries = history.filter(h => h.eventId === eventId);

  if (entries.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-evn-card border border-evn-border/50">
        <History size={14} className="text-evn-text-muted" />
        <span className="text-xs text-evn-text-muted">No previous D&amp;D attendance recorded</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-evn-text-secondary uppercase tracking-wider flex items-center gap-1.5">
        <History size={12} />
        D&amp;D History ({entries.length})
      </h4>
      <div className="space-y-2">
        {entries.map(entry => (
          <div
            key={entry.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-evn-base/50 border border-evn-border/50"
          >
            <Check size={14} className="text-evn-tier1 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-evn-text-primary">{entry.eventName}</span>
                <span className="text-[10px] text-evn-text-muted">{entry.dates}</span>
              </div>
              <p className="text-xs text-evn-text-secondary mt-0.5">{entry.role}</p>
              <p className="text-xs text-evn-text-muted mt-1">{entry.details}</p>
              {entry.teamMembers && entry.teamMembers.length > 0 && (
                <p className="text-[10px] text-evn-text-muted mt-1">
                  Team: {entry.teamMembers.join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
