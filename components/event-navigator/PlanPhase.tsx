'use client';

import { ScoredEvent, SavedPlan } from '@/lib/event-navigator/types';
import CountryFlag from './CountryFlag';
import TierBadge from './TierBadge';
import SavePlanForm from './SavePlanForm';
import SavedPlansList from './SavedPlansList';
import { CalendarCheck, X, MapPin, Calendar, Users, Plus } from 'lucide-react';

interface PlanPhaseProps {
  lineupIds: Set<string>;
  getEventById: (id: string) => ScoredEvent | null;
  plans: SavedPlan[];
  onRemove: (id: string) => void;
  onEventClick: (id: string) => void;
  onBrowseClick: () => void;
  onSavePlan: (name: string) => void;
  onLoadPlan: (plan: SavedPlan) => void;
  onDeletePlan: (planId: number) => void;
}

export default function PlanPhase({
  lineupIds,
  getEventById,
  plans,
  onRemove,
  onEventClick,
  onBrowseClick,
  onSavePlan,
  onLoadPlan,
  onDeletePlan,
}: PlanPhaseProps) {
  const lineupEvents = Array.from(lineupIds)
    .map(id => getEventById(id))
    .filter((e): e is ScoredEvent => e !== null)
    .sort((a, b) => b.tierScore - a.tierScore);

  const countByCountry = lineupEvents.reduce(
    (acc, e) => {
      acc[e.country] = (acc[e.country] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const countByTier = lineupEvents.reduce(
    (acc, e) => {
      acc[e.tier] = (acc[e.tier] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Plan header card */}
      <div className="bg-gradient-to-br from-evn-tier1/10 to-evn-tier1/5 border border-evn-tier1/20 rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck size={16} className="text-evn-tier1" />
              <h3 className="text-sm font-semibold text-evn-tier1">Event Plan</h3>
            </div>
            <h2 className="text-lg font-bold text-evn-text-primary">Your Curated Event Lineup</h2>
          </div>
          <button
            onClick={onBrowseClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-evn-tier1 border border-evn-tier1/30 hover:bg-evn-tier1/10 transition-colors"
          >
            <Plus size={12} />
            Add More Events
          </button>
        </div>

        {lineupEvents.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-evn-text-secondary">
            <span className="font-semibold text-evn-text-primary">{lineupEvents.length} events</span>
            {Object.entries(countByCountry).map(([c, n]) => (
              <span key={c}>{c}: {n}</span>
            ))}
            <span className="text-evn-border">|</span>
            {Object.entries(countByTier).map(([t, n]) => (
              <span key={t}>{t}: {n}</span>
            ))}
          </div>
        )}
      </div>

      {/* Lineup list */}
      {lineupEvents.length > 0 ? (
        <div className="space-y-2">
          {lineupEvents.map(event => (
            <div
              key={event.id}
              className="flex items-center gap-3 bg-evn-card border border-evn-border rounded-xl px-4 py-3"
            >
              <CountryFlag country={event.country} />
              <span className="text-[10px] font-mono text-evn-text-muted">{event.id}</span>
              <TierBadge tier={event.tier} small />

              <button
                onClick={() => onEventClick(event.id)}
                className="flex-1 text-left min-w-0"
              >
                <span className="text-sm font-medium text-evn-text-primary hover:text-evn-amber transition-colors truncate block">
                  {event.name}
                </span>
                <div className="flex items-center gap-3 text-[11px] text-evn-text-muted mt-0.5">
                  <span className="flex items-center gap-0.5"><MapPin size={9} />{event.city}</span>
                  <span className="flex items-center gap-0.5"><Calendar size={9} />{event.dates}</span>
                  <span className="flex items-center gap-0.5"><Users size={9} />{event.estimatedAttendees}</span>
                </div>
              </button>

              <div className="flex flex-wrap gap-1 shrink-0 max-w-[120px]">
                {event.relevantProducts.slice(0, 3).map(p => (
                  <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-evn-border/50 text-evn-text-muted">
                    {p}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onRemove(event.id)}
                className="p-1 rounded hover:bg-evn-alert/10 text-evn-text-muted hover:text-evn-alert transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <CalendarCheck size={32} className="mx-auto text-evn-text-muted" />
          <p className="text-sm text-evn-text-muted">No events in your lineup yet</p>
          <button
            onClick={onBrowseClick}
            className="text-xs text-evn-amber hover:underline"
          >
            Browse all events to get started
          </button>
        </div>
      )}

      {/* Save plan */}
      {lineupEvents.length > 0 && (
        <div className="bg-evn-card border border-evn-border rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-semibold text-evn-text-secondary uppercase tracking-wider">Save Plan</h4>
          <SavePlanForm onSave={onSavePlan} />
        </div>
      )}

      {/* Saved plans */}
      <SavedPlansList plans={plans} onLoad={onLoadPlan} onDelete={onDeletePlan} />
    </div>
  );
}
