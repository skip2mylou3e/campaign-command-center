'use client';

import { Competitor } from '@/lib/event-navigator/types';
import { Shield, AlertTriangle } from 'lucide-react';

interface CompetitorPresenceProps {
  eventId: string;
  competitors: Competitor[];
}

const threatColors: Record<string, string> = {
  'VERY HIGH': 'text-evn-alert',
  HIGH: 'text-evn-amber',
  'MEDIUM-HIGH': 'text-evn-tier2',
  MEDIUM: 'text-evn-text-secondary',
  'LOW-MEDIUM': 'text-evn-text-muted',
  LOW: 'text-evn-text-muted',
};

export default function CompetitorPresence({ eventId, competitors }: CompetitorPresenceProps) {
  const presentCompetitors = competitors
    .map(comp => {
      const presence = comp.knownEventPresence.find(p => p.eventId === eventId);
      if (!presence) return null;
      return { competitor: comp, presence };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (presentCompetitors.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-evn-tier1/5 border border-evn-tier1/20">
        <Shield size={14} className="text-evn-tier1" />
        <span className="text-xs text-evn-tier1">No known competitor presence — uncontested opportunity</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-evn-text-secondary uppercase tracking-wider flex items-center gap-1.5">
        <AlertTriangle size={12} />
        Competitive Landscape ({presentCompetitors.length})
      </h4>
      <div className="space-y-2">
        {presentCompetitors.map(({ competitor, presence }) => (
          <div
            key={competitor.name}
            className="flex items-start gap-3 p-3 rounded-xl bg-evn-base/50 border border-evn-border/50"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-evn-text-primary">{competitor.name}</span>
                <span className={`text-[10px] font-semibold ${threatColors[competitor.threatLevel]}`}>
                  {competitor.threatLevel}
                </span>
              </div>
              <p className="text-xs text-evn-text-secondary mt-0.5">
                {presence.role}
                {presence.confirmed ? '' : ' (unconfirmed)'}
              </p>
              {presence.notes && (
                <p className="text-xs text-evn-text-muted mt-1">{presence.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
