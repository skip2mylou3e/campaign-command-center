'use client';

import { ScoredEvent, AIRecommendation } from '@/lib/event-navigator/types';
import CountryFlag from './CountryFlag';
import TierBadge from './TierBadge';
import MatchScoreRing from './MatchScoreRing';
import { MapPin, Calendar, Users, Plus, Check } from 'lucide-react';

interface EventCardProps {
  event: ScoredEvent;
  rank?: number;
  recommendation?: AIRecommendation;
  isInLineup: boolean;
  onToggleLineup: (eventId: string) => void;
  onClick: (eventId: string) => void;
}

export default function EventCard({
  event,
  rank,
  recommendation,
  isInLineup,
  onToggleLineup,
  onClick,
}: EventCardProps) {
  const matchScore = recommendation?.matchScore ?? event.percentScore;

  return (
    <div
      className={`bg-evn-card border rounded-xl p-4 transition-all hover:border-evn-amber/30 cursor-pointer ${
        isInLineup ? 'border-evn-tier1/40 ring-1 ring-evn-tier1/20' : 'border-evn-border'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Left: Rank + Flag + ID */}
        <div className="flex items-center gap-2 shrink-0">
          {rank && (
            <span className="text-xs font-bold text-evn-text-muted w-5 text-right">
              #{rank}
            </span>
          )}
          <CountryFlag country={event.country} />
          <span className="text-xs font-mono text-evn-text-muted">{event.id}</span>
          <TierBadge tier={event.tier} small />
        </div>

        {/* Center: Info */}
        <div
          className="flex-1 min-w-0"
          onClick={() => onClick(event.id)}
        >
          <h4 className="text-sm font-semibold text-evn-text-primary truncate">
            {event.name}
          </h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-evn-text-secondary">
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {event.city}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {event.dates}
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              {event.estimatedAttendees}
            </span>
          </div>
          {/* Product tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {event.relevantProducts.slice(0, 3).map(p => (
              <span
                key={p}
                className="text-[10px] px-1.5 py-0.5 rounded bg-evn-border/50 text-evn-text-muted"
              >
                {p}
              </span>
            ))}
            {event.relevantProducts.length > 3 && (
              <span className="text-[10px] text-evn-text-muted">
                +{event.relevantProducts.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Right: Score + Lineup toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <MatchScoreRing score={matchScore} />
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleLineup(event.id);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isInLineup
                ? 'bg-evn-tier1/15 text-evn-tier1 border border-evn-tier1/30'
                : 'bg-evn-border/30 text-evn-text-secondary border border-evn-border hover:border-evn-tier1/30 hover:text-evn-tier1'
            }`}
          >
            {isInLineup ? (
              <>
                <Check size={12} />
                <span className="hidden sm:inline">In Lineup</span>
              </>
            ) : (
              <>
                <Plus size={12} />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
