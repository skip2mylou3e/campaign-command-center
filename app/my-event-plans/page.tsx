'use client';

import { useState, useEffect } from 'react';
import { CalendarCheck, ChevronLeft, Trash2, MapPin, Calendar, Users, Tag } from 'lucide-react';
import { SavedPlan, ScoredEvent } from '@/lib/event-navigator/types';
import { events } from '@/lib/event-navigator/data/events';
import { competitors } from '@/lib/event-navigator/data/competitors';
import { useAssumptions } from '@/lib/event-navigator/hooks/useAssumptions';
import { useTierScoring } from '@/lib/event-navigator/hooks/useTierScoring';
import { useSavedPlans } from '@/lib/event-navigator/hooks/useSavedPlans';
import CountryFlag from '@/components/event-navigator/CountryFlag';
import TierBadge from '@/components/event-navigator/TierBadge';
import EventDetail from '@/components/event-navigator/EventDetail';

// Product ID -> label lookup (mirrors ObjectiveInput)
const productLabels: Record<string, string> = {
  unity: 'Unity', prosuite: 'ProSuite', econvey: 'eConvey', brief_convey: 'Brief Convey',
  uem: 'UEM', corplink: 'CorpLink', fast_company: 'Fast Company', ecorp: 'eCorp',
  emergent: 'Emergent', will_builder: 'Will Builder', estate_a_base: 'Estate-a-Base', acl: 'ACL',
  ghost_practice: 'Ghost Practice', esilaw: 'EsiLaw',
  ecore: 'eCore', apic: 'APIC', notice_connect: 'Notice Connect', mdo: 'MDO', etray: 'eTray',
  lending_tech: 'Lending Tech', corporate_search: 'Corporate Search',
  casa: 'CASA', quill: 'Quill', insight: 'Insight', indigo: 'Indigo', affinity: 'Affinity',
  pie_spider: 'PIE / Spider', index: 'Index', lawyer_checker: 'Lawyer Checker', sm22: 'SM22', smc: 'SMC',
  aml_ctf_uk: 'AML/CTF Compliance', lending_tech_uk: 'Lending Tech', corporate_search_uk: 'Corporate Search',
  matter_center: 'Matter Center', cats_settsplus: 'CATS / SettsPlus',
  conveyancing_manager: 'Conveyancing Manager', conveyancer: 'Conveyancer',
  open_practice: 'Open Practice', atom: 'ATOM', nebulaw: 'Nebulaw',
  globalx: 'GlobalX', fci: 'FCI', terra_firma: 'Terra Firma', terrain: 'Terrain',
  aml_ctf_au: 'AML/CTF Compliance', lending_tech_au: 'Lending Tech', corporate_search_au: 'Corporate Search',
};

const budgetLabels: Record<string, string> = {
  lean: 'Lean', moderate: 'Moderate', premium: 'Premium',
};

const quarterLabels: Record<string, string> = {
  q1: 'Q1 (Jan-Mar)', q2: 'Q2 (Apr-Jun)', q3: 'Q3 (Jul-Sep)', q4: 'Q4 (Oct-Dec)',
};

export default function MyEventPlansPage() {
  const { plans, deletePlan } = useSavedPlans();
  const { assumptions, loaded: assumptionsLoaded } = useAssumptions();
  const { getEventById, maxScore } = useTierScoring(events, assumptions);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || null;

  // Reset selection if plan was deleted
  useEffect(() => {
    if (selectedPlanId && !plans.find(p => p.id === selectedPlanId)) {
      setSelectedPlanId(null);
    }
  }, [plans, selectedPlanId]);

  if (!assumptionsLoaded) {
    return (
      <div className="min-h-screen bg-evn-base flex items-center justify-center">
        <div className="text-evn-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  // Plan detail view
  if (selectedPlan) {
    return <PlanDetail plan={selectedPlan} getEventById={getEventById} assumptions={assumptions} maxScore={maxScore} onBack={() => setSelectedPlanId(null)} />;
  }

  // Plan list view
  return (
    <div className="min-h-screen bg-evn-base">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-evn-text-primary">My Event Plans</h1>
          <p className="text-evn-text-secondary text-sm">
            Saved event strategies from the Event Navigator
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <CalendarCheck size={36} className="mx-auto text-evn-text-muted" />
            <p className="text-sm text-evn-text-muted">No saved plans yet</p>
            <p className="text-xs text-evn-text-muted">
              Use the Event Navigator to build and save an event plan
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {plans.map(plan => {
              const eventCount = plan.eventIds.length;
              const created = new Date(plan.created).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              });
              const isConfirming = confirmDeleteId === plan.id;

              return (
                <div
                  key={plan.id}
                  className="bg-evn-card border border-evn-border rounded-xl px-5 py-4 flex items-center gap-4 hover:border-evn-amber/30 transition-colors"
                >
                  <button
                    onClick={() => setSelectedPlanId(plan.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="text-sm font-semibold text-evn-text-primary hover:text-evn-amber transition-colors truncate">
                      {plan.name}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-evn-text-muted">
                      <span>{eventCount} event{eventCount !== 1 ? 's' : ''}</span>
                      <span>Saved {created}</span>
                      {plan.params?.markets && plan.params.markets.length > 0 && (
                        <span>{plan.params.markets.join(', ')}</span>
                      )}
                    </div>
                    {plan.objective && (
                      <p className="text-[11px] text-evn-text-secondary mt-1 truncate">{plan.objective}</p>
                    )}
                  </button>

                  {isConfirming ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { deletePlan(plan.id); setConfirmDeleteId(null); }}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-evn-alert/15 text-evn-alert border border-evn-alert/30 hover:bg-evn-alert/25 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[11px] px-2.5 py-1 rounded-lg border border-evn-border text-evn-text-muted hover:border-evn-text-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(plan.id)}
                      className="p-1.5 rounded hover:bg-evn-alert/10 text-evn-text-muted hover:text-evn-alert transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Plan Detail View ---

function PlanDetail({
  plan,
  getEventById,
  assumptions,
  maxScore,
  onBack,
}: {
  plan: SavedPlan;
  getEventById: (id: string) => ScoredEvent | null;
  assumptions: import('@/lib/event-navigator/types').TierModelAssumptions;
  maxScore: number;
  onBack: () => void;
}) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const planEvents = plan.eventIds
    .map(id => getEventById(id))
    .filter((e): e is ScoredEvent => e !== null)
    .sort((a, b) => b.tierScore - a.tierScore);

  const params = plan.params;

  // Summary stats
  const countByCountry = planEvents.reduce((acc, e) => {
    acc[e.country] = (acc[e.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countByTier = planEvents.reduce((acc, e) => {
    acc[e.tier] = (acc[e.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalAttendees = planEvents.reduce((sum, e) => sum + (e.attendeesNumeric || 0), 0);

  const avgScore = planEvents.length > 0
    ? Math.round(planEvents.reduce((sum, e) => sum + e.percentScore, 0) / planEvents.length)
    : 0;

  const allProducts = Array.from(new Set(planEvents.flatMap(e => e.relevantProducts)));

  // Quarters covered
  const quartersCovered = new Set<string>();
  planEvents.forEach(e => { if (e.quarter) quartersCovered.add(e.quarter); });

  // Estimated cost ranges per tier (CAD)
  const tierCostRanges: Record<string, { low: number; high: number }> = {
    'Tier 1': { low: 15000, high: 40000 },
    'Tier 2': { low: 5000, high: 20000 },
    'Tier 3': { low: 2000, high: 8000 },
  };
  const budgetMultiplier: Record<string, number> = { lean: 0.6, moderate: 1, premium: 1.5 };
  const mult = budgetMultiplier[params?.budget || 'moderate'] || 1;
  const costLow = planEvents.reduce((sum, e) => sum + (tierCostRanges[e.tier]?.low || 5000) * mult, 0);
  const costHigh = planEvents.reduce((sum, e) => sum + (tierCostRanges[e.tier]?.high || 20000) * mult, 0);
  const formatCost = (n: number) => `$${Math.round(n / 1000)}K`;

  const created = new Date(plan.created).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

  // Show event detail view
  const selectedEvent = selectedEventId ? getEventById(selectedEventId) : null;
  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-evn-base">
        <EventDetail
          event={selectedEvent}
          assumptions={assumptions}
          maxScore={maxScore}
          competitors={competitors}
          isInLineup={false}
          onToggleLineup={() => {}}
          onBack={() => setSelectedEventId(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-evn-base">
      <div className="max-w-3xl mx-auto p-6 space-y-5">
        {/* Back + header */}
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-evn-text-muted hover:text-evn-amber transition-colors mb-3"
          >
            <ChevronLeft size={14} />
            Back to My Event Plans
          </button>
          <h1 className="text-xl font-bold text-evn-text-primary">{plan.name}</h1>
          <p className="text-xs text-evn-text-muted mt-0.5">Saved {created}</p>
        </div>

        {/* Objective */}
        {plan.objective && (
          <div className="bg-evn-card border border-evn-border rounded-xl p-4 space-y-1.5">
            <h3 className="text-[11px] font-semibold text-evn-text-secondary uppercase tracking-wider">Objective</h3>
            <p className="text-sm text-evn-text-primary leading-relaxed">{plan.objective}</p>
          </div>
        )}

        {/* Scoping parameters */}
        {params && (
          <div className="bg-evn-card border border-evn-border rounded-xl p-4 space-y-3">
            <h3 className="text-[11px] font-semibold text-evn-text-secondary uppercase tracking-wider">Scoping</h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Markets */}
              {params.markets.length > 0 && (
                <ScopeRow label="Markets">
                  {params.markets.map(m => (
                    <ScopePill key={m} text={m} />
                  ))}
                  {params.canadaProvinces && params.canadaProvinces.length > 0 && (
                    <>
                      <span className="text-evn-border text-[10px]">|</span>
                      {params.canadaProvinces.map(p => (
                        <ScopePill key={p} text={p} subtle />
                      ))}
                    </>
                  )}
                </ScopeRow>
              )}

              {/* Products */}
              {params.products.length > 0 && (
                <ScopeRow label="Products">
                  {params.products.map(p => (
                    <ScopePill key={p} text={productLabels[p] || p} />
                  ))}
                </ScopeRow>
              )}

              {/* Audiences */}
              {params.audiences.length > 0 && (
                <ScopeRow label="Audiences">
                  {params.audiences.map(a => (
                    <ScopePill key={a} text={a} />
                  ))}
                </ScopeRow>
              )}

              {/* Timeframe */}
              {params.timeframe.length > 0 && (
                <ScopeRow label="Timeframe">
                  {params.timeframe.map(q => (
                    <ScopePill key={q} text={quarterLabels[q] || q.toUpperCase()} />
                  ))}
                </ScopeRow>
              )}

              {/* Budget */}
              <ScopeRow label="Budget">
                <ScopePill text={budgetLabels[params.budget] || params.budget} />
              </ScopeRow>

              {/* Participation */}
              {params.participation.length > 0 && (
                <ScopeRow label="Participation">
                  {params.participation.map(p => (
                    <ScopePill key={p} text={p} />
                  ))}
                </ScopeRow>
              )}
            </div>
          </div>
        )}

        {/* Event summary stats */}
        <div className="bg-gradient-to-br from-evn-tier1/10 to-evn-tier1/5 border border-evn-tier1/20 rounded-xl p-4 space-y-3">
          <h3 className="text-[11px] font-semibold text-evn-tier1 uppercase tracking-wider">Plan Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatBlock label="Events" value={String(planEvents.length)} />
            <StatBlock label="Total Attendees" value={totalAttendees.toLocaleString()} />
            <StatBlock label="Avg. Score" value={`${avgScore}%`} />
            <StatBlock label="Quarters" value={quartersCovered.size > 0 ? Array.from(quartersCovered).sort().join(', ') : 'N/A'} />
            <StatBlock label="Est. Cost" value={planEvents.length > 0 ? `${formatCost(costLow)}-${formatCost(costHigh)}` : 'N/A'} />
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-evn-text-secondary">
            {Object.entries(countByCountry).map(([c, n]) => (
              <span key={c}>{c}: {n}</span>
            ))}
            <span className="text-evn-border">|</span>
            {Object.entries(countByTier).map(([t, n]) => (
              <span key={t}>{t}: {n}</span>
            ))}
          </div>
          {allProducts.length > 0 && (
            <div className="pt-1">
              <div className="text-[10px] text-evn-text-muted uppercase tracking-wider mb-1">Products Across Events</div>
              <div className="flex flex-wrap gap-1">
                {allProducts.map(p => (
                  <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-evn-border/50 text-evn-text-secondary">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Event list */}
        <div className="space-y-1.5">
          <h3 className="text-[11px] font-semibold text-evn-text-secondary uppercase tracking-wider">Events ({planEvents.length})</h3>
          {planEvents.map(event => (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className="w-full flex items-center gap-3 bg-evn-card border border-evn-border rounded-xl px-4 py-3 hover:border-evn-amber/30 transition-colors text-left"
            >
              <CountryFlag country={event.country} />
              <span className="text-[10px] font-mono text-evn-text-muted">{event.id}</span>
              <TierBadge tier={event.tier} small />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-evn-text-primary hover:text-evn-amber transition-colors truncate block">
                  {event.name}
                </span>
                <div className="flex items-center gap-3 text-[11px] text-evn-text-muted mt-0.5">
                  <span className="flex items-center gap-0.5"><MapPin size={9} />{event.city}</span>
                  <span className="flex items-center gap-0.5"><Calendar size={9} />{event.dates}</span>
                  <span className="flex items-center gap-0.5"><Users size={9} />{event.estimatedAttendees}</span>
                  <span className="flex items-center gap-0.5"><Tag size={9} />{event.percentScore}%</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 shrink-0 max-w-[120px]">
                {event.relevantProducts.slice(0, 3).map(p => (
                  <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-evn-border/50 text-evn-text-muted">
                    {p}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Reusable small components ---

function ScopeRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 col-span-2 sm:col-span-1">
      <div className="text-[10px] text-evn-text-muted uppercase tracking-wider">{label}</div>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function ScopePill({ text, subtle }: { text: string; subtle?: boolean }) {
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-lg border ${
      subtle
        ? 'border-evn-border/60 text-evn-text-muted'
        : 'border-evn-amber/25 bg-evn-amber/10 text-evn-amber'
    }`}>
      {text}
    </span>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-evn-text-primary">{value}</div>
      <div className="text-[10px] text-evn-text-muted uppercase tracking-wider">{label}</div>
    </div>
  );
}
