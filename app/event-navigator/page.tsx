'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Phase,
  ObjectiveParams,
  AIResult,
  SavedPlan,
} from '@/lib/event-navigator/types';
import { events } from '@/lib/event-navigator/data/events';
import { competitors } from '@/lib/event-navigator/data/competitors';
import { useAssumptions } from '@/lib/event-navigator/hooks/useAssumptions';
import { useTierScoring } from '@/lib/event-navigator/hooks/useTierScoring';
import { useLineup } from '@/lib/event-navigator/hooks/useLineup';
import { useSavedPlans } from '@/lib/event-navigator/hooks/useSavedPlans';

import PhaseBar from '@/components/event-navigator/PhaseBar';
import ObjectiveInput from '@/components/event-navigator/ObjectiveInput';
import AnalyzingLoader from '@/components/event-navigator/AnalyzingLoader';
import ResultsList from '@/components/event-navigator/ResultsList';
import EventDetail from '@/components/event-navigator/EventDetail';
import PlanPhase from '@/components/event-navigator/PlanPhase';
import BrowsePanel from '@/components/event-navigator/BrowsePanel';
import TierModelPanel from '@/components/event-navigator/TierModelPanel';

const initialParams: ObjectiveParams = {
  objective: '',
  markets: [],
  canadaProvinces: [],
  products: [],
  audiences: [],
  timeframe: [],
  budget: 'moderate',
  participation: [],
};

export default function EventNavigatorPage() {
  // Phase state machine
  const [phase, setPhase] = useState<Phase>('objective');
  const [completedPhases, setCompletedPhases] = useState<Phase[]>([]);
  const [params, setParams] = useState<ObjectiveParams>(initialParams);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [showTierPanel, setShowTierPanel] = useState(false);
  const [showBrowsePanel, setShowBrowsePanel] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Hooks
  const {
    assumptions,
    loaded: assumptionsLoaded,
    updateCriterionWeight,
    updateThresholds,
    updateTierDefinition,
    updateAnchor,
    resetToDefaults,
  } = useAssumptions();

  const { scoredEvents, distribution, maxScore, getEventById } = useTierScoring(events, assumptions);
  const { lineupIds, lineupCount, toggle, remove, loadFromPlan, isInLineup } = useLineup();
  const { plans, savePlan, deletePlan } = useSavedPlans();

  const streamRef = useRef<AbortController | null>(null);

  // Mark phase as completed and navigate
  const goToPhase = useCallback((nextPhase: Phase) => {
    setCompletedPhases(prev => {
      const currentIdx = ['objective', 'analyzing', 'results', 'detail', 'plan'].indexOf(phase);
      const phases: Phase[] = ['objective', 'analyzing', 'results', 'detail', 'plan'];
      const toComplete = phases.slice(0, currentIdx + 1);
      const merged = Array.from(new Set([...prev, ...toComplete]));
      return merged;
    });
    setPhase(nextPhase);
  }, [phase]);

  // Submit objective -> analyze
  const handleSubmit = useCallback(async () => {
    goToPhase('analyzing');
    setAiError(null);

    // Abort any existing stream
    if (streamRef.current) {
      streamRef.current.abort();
    }
    const controller = new AbortController();
    streamRef.current = controller;

    try {
      const response = await fetch('/api/event-navigator/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params,
          assumptions,
          scoredEvents,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || 'Request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        if (chunk.includes('__STREAM_ERROR__')) {
          const errMsg = chunk.split('__STREAM_ERROR__')[1];
          throw new Error(errMsg);
        }

        fullText += chunk;
      }

      // Parse JSON response
      // Try to extract JSON from the text (handle potential markdown wrapping)
      let jsonStr = fullText.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const result: AIResult = JSON.parse(jsonStr);
      setAiResult(result);
      goToPhase('results');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error('AI recommendation error:', err);
      setAiError((err as Error).message);

      // Fallback: use tier scoring as client-side recommendations
      const fallbackResult: AIResult = {
        strategicBrief: 'AI recommendations unavailable. Showing events ranked by tier score.',
        keyInsight: '',
        competitiveAlert: '',
        timeline: [],
        recommendations: scoredEvents.slice(0, 15).map((e) => ({
          eventId: e.id,
          matchScore: e.percentScore,
          whyThisEvent: `${e.tier} event with a score of ${e.tierScore}/${maxScore} (${e.percentScore}%). ${e.focus}`,
          recommendedApproach: [],
          productsToShowcase: e.relevantProducts.slice(0, 3),
          thoughtLeadershipAngle: e.thoughtLeadership || '',
          competitorsToWatch: e.competitorsPresent,
          timingNote: null,
        })),
      };
      setAiResult(fallbackResult);
      goToPhase('results');
    }
  }, [params, assumptions, scoredEvents, maxScore, goToPhase]);

  // Event click -> detail
  const handleEventClick = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
    goToPhase('detail');
  }, [goToPhase]);

  // Phase bar navigation
  const handlePhaseClick = useCallback((targetPhase: Phase) => {
    if (targetPhase === 'analyzing') return; // Can't navigate to analyzing
    setPhase(targetPhase);
  }, []);

  // Save plan
  const handleSavePlan = useCallback((name: string) => {
    savePlan(name, Array.from(lineupIds), params.objective, assumptions, params);
  }, [savePlan, lineupIds, params, assumptions]);

  // Load plan
  const handleLoadPlan = useCallback((plan: SavedPlan) => {
    loadFromPlan(plan.eventIds);
    setParams(prev => ({ ...prev, objective: plan.objective }));
    setPhase('plan');
  }, [loadFromPlan]);

  // Get selected event for detail view
  const selectedEvent = selectedEventId ? getEventById(selectedEventId) : null;
  const selectedRecommendation = aiResult?.recommendations.find(r => r.eventId === selectedEventId);

  if (!assumptionsLoaded) {
    return (
      <div className="min-h-screen bg-evn-base flex items-center justify-center">
        <div className="text-evn-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-evn-base">
      <PhaseBar
        currentPhase={phase}
        completedPhases={completedPhases}
        lineupCount={lineupCount}
        onPhaseClick={handlePhaseClick}
        onGearClick={() => setShowTierPanel(true)}
      />

      <div className="pb-8">
        {/* Screen 1: Objective Input */}
        {phase === 'objective' && (
          <ObjectiveInput
            params={params}
            onParamsChange={setParams}
            onSubmit={handleSubmit}
          />
        )}

        {/* Screen 2: Analyzing */}
        {phase === 'analyzing' && (
          <AnalyzingLoader />
        )}

        {/* Screen 3: Results */}
        {phase === 'results' && aiResult && (
          <>
            {aiError && (
              <div className="max-w-3xl mx-auto px-4 pt-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-evn-amber/10 border border-evn-amber/20 text-xs text-evn-amber">
                  AI unavailable — showing scored results based on tier model.
                </div>
              </div>
            )}
            <ResultsList
              aiResult={aiResult}
              objective={params.objective}
              lineupCount={lineupCount}
              isInLineup={isInLineup}
              onToggleLineup={toggle}
              onEventClick={handleEventClick}
              onBrowseClick={() => setShowBrowsePanel(true)}
              onPlanClick={() => goToPhase('plan')}
              getEventById={getEventById}
            />
          </>
        )}

        {/* Screen 4: Event Detail */}
        {phase === 'detail' && selectedEvent && (
          <EventDetail
            event={selectedEvent}
            recommendation={selectedRecommendation}
            assumptions={assumptions}
            maxScore={maxScore}
            competitors={competitors}
            isInLineup={isInLineup(selectedEvent.id)}
            onToggleLineup={toggle}
            onBack={() => setPhase(aiResult ? 'results' : 'objective')}
          />
        )}

        {/* Screen 5: Event Plan */}
        {phase === 'plan' && (
          <PlanPhase
            lineupIds={lineupIds}
            getEventById={getEventById}
            plans={plans}
            onRemove={remove}
            onEventClick={handleEventClick}
            onBrowseClick={() => setShowBrowsePanel(true)}
            onSavePlan={handleSavePlan}
            onLoadPlan={handleLoadPlan}
            onDeletePlan={deletePlan}
          />
        )}
      </div>

      {/* Browse All Events Overlay */}
      {showBrowsePanel && (
        <BrowsePanel
          scoredEvents={scoredEvents}
          isInLineup={isInLineup}
          onToggleLineup={toggle}
          onEventClick={(id) => {
            setShowBrowsePanel(false);
            handleEventClick(id);
          }}
          onClose={() => setShowBrowsePanel(false)}
        />
      )}

      {/* Tier Model Configuration Panel */}
      {showTierPanel && (
        <TierModelPanel
          assumptions={assumptions}
          scoredEvents={scoredEvents}
          distribution={distribution}
          maxScore={maxScore}
          onWeightChange={updateCriterionWeight}
          onThresholdsChange={updateThresholds}
          onTierDefinitionChange={updateTierDefinition}
          onAnchorChange={updateAnchor}
          onReset={resetToDefaults}
          onClose={() => setShowTierPanel(false)}
        />
      )}
    </div>
  );
}
