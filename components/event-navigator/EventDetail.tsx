'use client';

import { ScoredEvent, AIRecommendation, TierModelAssumptions, Competitor } from '@/lib/event-navigator/types';
import { ddHistory } from '@/lib/event-navigator/data/history';
import CountryFlag from './CountryFlag';
import TierBadge from './TierBadge';
import MatchScoreRing from './MatchScoreRing';
import TierScoreBreakdown from './TierScoreBreakdown';
import CompetitorPresence from './CompetitorPresence';
import DDHistoryDisplay from './DDHistoryDisplay';
import { ArrowLeft, MapPin, Calendar, Users, Globe, Building2, Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface EventDetailProps {
  event: ScoredEvent;
  recommendation?: AIRecommendation;
  assumptions: TierModelAssumptions;
  maxScore: number;
  competitors: Competitor[];
  isInLineup: boolean;
  onToggleLineup: (id: string) => void;
  onBack: () => void;
}

export default function EventDetail({
  event,
  recommendation,
  assumptions,
  maxScore,
  competitors,
  isInLineup,
  onToggleLineup,
  onBack,
}: EventDetailProps) {
  const [showEmail, setShowEmail] = useState(false);
  const matchScore = recommendation?.matchScore ?? event.percentScore;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-evn-text-secondary hover:text-evn-amber transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Results
      </button>

      {/* Header */}
      <div className="bg-evn-card border border-evn-border rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CountryFlag country={event.country} />
              <span className="text-xs font-mono text-evn-text-muted">{event.id}</span>
              <TierBadge tier={event.tier} />
            </div>
            <h2 className="text-xl font-bold text-evn-text-primary">{event.name}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-evn-text-secondary">
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {event.city}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {event.dates}
              </span>
              <span className="flex items-center gap-1">
                <Users size={13} />
                {event.estimatedAttendees}
              </span>
              <span className="flex items-center gap-1">
                <Building2 size={13} />
                {event.organizer}
              </span>
            </div>
            <p className="text-sm text-evn-text-secondary mt-3 leading-relaxed">{event.focus}</p>
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0">
            <MatchScoreRing score={matchScore} size={64} strokeWidth={5} />
            <button
              onClick={() => onToggleLineup(event.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isInLineup
                  ? 'bg-evn-tier1/15 text-evn-tier1 border border-evn-tier1/30'
                  : 'bg-evn-border/30 text-evn-text-secondary border border-evn-border hover:border-evn-tier1/30 hover:text-evn-tier1'
              }`}
            >
              {isInLineup ? <><Check size={12} /> In Lineup</> : <><Plus size={12} /> Add</>}
            </button>
          </div>
        </div>

        {/* Meta details */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-evn-border/50">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-evn-text-muted">Audience</span>
            <p className="text-xs text-evn-text-secondary mt-0.5">{event.audienceComposition}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-evn-text-muted">Vendor Options</span>
            <p className="text-xs text-evn-text-secondary mt-0.5">{event.vendorOptions || 'See organizer'}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-evn-text-muted">Est. Costs</span>
            <p className="text-xs text-evn-text-secondary mt-0.5">{event.estimatedCosts || 'On inquiry'}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-evn-text-muted">Website</span>
            {event.website ? (
              <a
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-evn-info hover:underline mt-0.5"
              >
                <Globe size={10} />
                Visit website
              </a>
            ) : (
              <p className="text-xs text-evn-text-muted mt-0.5">N/A</p>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="mt-3 pt-3 border-t border-evn-border/50">
          <span className="text-[10px] uppercase tracking-wider text-evn-text-muted">Relevant Products</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {event.relevantProducts.map(p => (
              <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-evn-amber/10 text-evn-amber border border-evn-amber/20">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tier Score Breakdown */}
      <div className="bg-evn-card border border-evn-border rounded-2xl p-5">
        <TierScoreBreakdown event={event} assumptions={assumptions} maxScore={maxScore} />
      </div>

      {/* Why This Event (AI) */}
      {recommendation?.whyThisEvent && (
        <div className="bg-evn-card border border-evn-border rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-semibold text-evn-amber uppercase tracking-wider">Why This Event</h4>
          <p className="text-sm text-evn-text-secondary leading-relaxed">{recommendation.whyThisEvent}</p>
        </div>
      )}

      {/* Competitive Landscape */}
      <div className="bg-evn-card border border-evn-border rounded-2xl p-5">
        <CompetitorPresence eventId={event.id} competitors={competitors} />
      </div>

      {/* Recommended Approach */}
      {recommendation?.recommendedApproach && recommendation.recommendedApproach.length > 0 && (
        <div className="bg-evn-card border border-evn-border rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-semibold text-evn-text-secondary uppercase tracking-wider">
            Recommended Approach
          </h4>
          <ol className="space-y-2">
            {recommendation.recommendedApproach.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-evn-text-secondary">
                <span className="text-evn-amber font-bold shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* D&D History */}
      <div className="bg-evn-card border border-evn-border rounded-2xl p-5">
        <DDHistoryDisplay eventId={event.id} history={ddHistory} />
      </div>

      {/* Draft Outreach Email */}
      {recommendation?.draftOutreachEmail && (
        <div className="bg-evn-card border border-evn-border rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowEmail(!showEmail)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
          >
            <h4 className="text-xs font-semibold text-evn-text-secondary uppercase tracking-wider">
              Draft Outreach Email
            </h4>
            {showEmail ? <ChevronUp size={14} className="text-evn-text-muted" /> : <ChevronDown size={14} className="text-evn-text-muted" />}
          </button>
          {showEmail && (
            <div className="px-4 pb-4 border-t border-evn-border/50 pt-3">
              <pre className="text-xs text-evn-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                {recommendation.draftOutreachEmail}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {event.notes && (
        <div className="bg-evn-card border border-evn-border rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-semibold text-evn-text-secondary uppercase tracking-wider">Notes</h4>
          <p className="text-sm text-evn-text-secondary">{event.notes}</p>
        </div>
      )}
    </div>
  );
}
