'use client';

import { ScoredEvent, AIResult } from '@/lib/event-navigator/types';
import StrategicBrief from './StrategicBrief';
import EventCard from './EventCard';
import { List, CalendarCheck } from 'lucide-react';

interface ResultsListProps {
  aiResult: AIResult;
  objective: string;
  lineupCount: number;
  isInLineup: (id: string) => boolean;
  onToggleLineup: (id: string) => void;
  onEventClick: (id: string) => void;
  onBrowseClick: () => void;
  onPlanClick: () => void;
  getEventById: (id: string) => ScoredEvent | null;
}

export default function ResultsList({
  aiResult,
  objective,
  lineupCount,
  isInLineup,
  onToggleLineup,
  onEventClick,
  onBrowseClick,
  onPlanClick,
  getEventById,
}: ResultsListProps) {
  // Build ranked event list from AI recommendations
  const recommendedEvents = aiResult.recommendations
    .map(rec => {
      const event = getEventById(rec.eventId);
      if (!event) return null;
      return { event, recommendation: rec };
    })
    .filter((item): item is { event: ScoredEvent; recommendation: typeof aiResult.recommendations[0] } => item !== null);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <StrategicBrief result={aiResult} objective={objective} />

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-evn-text-primary">
            Top {recommendedEvents.length} Recommended Events
          </span>
          {lineupCount > 0 && (
            <span className="text-xs bg-evn-tier1/15 text-evn-tier1 px-2 py-0.5 rounded-full font-medium">
              {lineupCount} in lineup
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBrowseClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-evn-text-secondary border border-evn-border hover:border-evn-amber/30 hover:text-evn-amber transition-colors"
          >
            <List size={14} />
            Browse All Events
          </button>
          {lineupCount > 0 && (
            <button
              onClick={onPlanClick}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-evn-tier1/15 text-evn-tier1 border border-evn-tier1/30 hover:bg-evn-tier1/25 transition-colors"
            >
              <CalendarCheck size={14} />
              View Event Plan ({lineupCount})
            </button>
          )}
        </div>
      </div>

      {/* Event cards */}
      <div className="space-y-3">
        {recommendedEvents.map(({ event, recommendation }, i) => (
          <EventCard
            key={event.id}
            event={event}
            rank={i + 1}
            recommendation={recommendation}
            isInLineup={isInLineup(event.id)}
            onToggleLineup={onToggleLineup}
            onClick={onEventClick}
          />
        ))}
      </div>

      {recommendedEvents.length === 0 && (
        <div className="text-center py-12 text-evn-text-muted text-sm">
          No recommendations generated. Try adjusting your objective.
        </div>
      )}
    </div>
  );
}
