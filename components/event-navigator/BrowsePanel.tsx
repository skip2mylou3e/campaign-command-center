'use client';

import { useState, useMemo } from 'react';
import { ScoredEvent, Country, TierLabel } from '@/lib/event-navigator/types';
import CountryFlag from './CountryFlag';
import TierBadge from './TierBadge';
import { X, Search } from 'lucide-react';

interface BrowsePanelProps {
  scoredEvents: ScoredEvent[];
  isInLineup: (id: string) => boolean;
  onToggleLineup: (id: string) => void;
  onEventClick: (id: string) => void;
  onClose: () => void;
}

const marketFilters: { id: Country | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Canada', label: 'Canada' },
  { id: 'UK', label: 'UK' },
  { id: 'Australia', label: 'Australia' },
];

const tierFilters: { id: TierLabel | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Tier 1', label: 'Tier 1' },
  { id: 'Tier 2', label: 'Tier 2' },
  { id: 'Tier 3', label: 'Tier 3' },
];

export default function BrowsePanel({
  scoredEvents,
  isInLineup,
  onToggleLineup,
  onEventClick,
  onClose,
}: BrowsePanelProps) {
  const [search, setSearch] = useState('');
  const [marketFilter, setMarketFilter] = useState<Country | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<TierLabel | 'all'>('all');

  const filteredEvents = useMemo(() => {
    return scoredEvents.filter(e => {
      if (marketFilter !== 'all' && e.country !== marketFilter) return false;
      if (tierFilter !== 'all' && e.tier !== tierFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [scoredEvents, marketFilter, tierFilter, search]);

  const lineupCount = scoredEvents.filter(e => isInLineup(e.id)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-evn-card border border-evn-border rounded-2xl shadow-2xl flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-evn-border">
          <div>
            <h3 className="text-sm font-semibold text-evn-text-primary">Browse All Events</h3>
            <p className="text-xs text-evn-text-muted mt-0.5">
              {filteredEvents.length} events shown{lineupCount > 0 && ` \u00b7 ${lineupCount} in lineup`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-evn-text-muted hover:text-evn-text-primary hover:bg-evn-border/30 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-evn-border/50 space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-evn-text-muted" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-evn-base border border-evn-border rounded-lg pl-9 pr-3 py-2 text-xs text-evn-text-primary placeholder:text-evn-text-muted focus:outline-none focus:border-evn-amber/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {marketFilters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setMarketFilter(f.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                    marketFilter === f.id
                      ? 'bg-evn-amber/15 text-evn-amber border border-evn-amber/30'
                      : 'text-evn-text-secondary border border-evn-border hover:border-evn-text-muted'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-evn-border" />
            <div className="flex gap-1">
              {tierFilters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setTierFilter(f.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                    tierFilter === f.id
                      ? 'bg-evn-amber/15 text-evn-amber border border-evn-amber/30'
                      : 'text-evn-text-secondary border border-evn-border hover:border-evn-text-muted'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Event rows */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-evn-base/50 transition-colors ${
                isInLineup(event.id) ? 'bg-evn-tier1/5' : ''
              }`}
            >
              <button
                onClick={() => onToggleLineup(event.id)}
                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  isInLineup(event.id)
                    ? 'bg-evn-tier1 border-evn-tier1 text-evn-base'
                    : 'border-evn-border hover:border-evn-tier1/50'
                }`}
              >
                {isInLineup(event.id) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <CountryFlag country={event.country} />
              <span className="text-[10px] font-mono text-evn-text-muted w-8">{event.id}</span>
              <button
                onClick={() => onEventClick(event.id)}
                className="flex-1 text-left text-xs text-evn-text-primary hover:text-evn-amber transition-colors truncate"
              >
                {event.name}
              </button>
              <span className="text-[10px] text-evn-text-muted shrink-0 hidden sm:inline">
                {event.city} \u00b7 {event.dates}
              </span>
              <TierBadge tier={event.tier} small />
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-sm text-evn-text-muted">
              No events match your filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
