'use client';

import { useState } from 'react';
import { TierModelAssumptions, ScoredEvent } from '@/lib/event-navigator/types';
import { TierDistribution } from '@/lib/event-navigator/hooks/useTierScoring';
import CriteriaWeights from './CriteriaWeights';
import TierThresholds from './TierThresholds';
import TierDefinitions from './TierDefinitions';
import ScoreAnchors from './ScoreAnchors';
import LivePreview from './LivePreview';
import { X, RotateCcw, Settings2 } from 'lucide-react';

const tabs = [
  { id: 'weights', label: 'Criteria & Weights' },
  { id: 'thresholds', label: 'Thresholds' },
  { id: 'definitions', label: 'Tier Definitions' },
  { id: 'anchors', label: 'Score Anchors' },
] as const;

type Tab = typeof tabs[number]['id'];

interface TierModelPanelProps {
  assumptions: TierModelAssumptions;
  scoredEvents: ScoredEvent[];
  distribution: TierDistribution;
  maxScore: number;
  onWeightChange: (criterionId: string, weight: number) => void;
  onThresholdsChange: (thresholds: { tier1: number; tier2: number }) => void;
  onTierDefinitionChange: (tier: 'tier1' | 'tier2' | 'tier3', field: 'label' | 'description', value: string) => void;
  onAnchorChange: (criterionId: string, level: 'low' | 'mid' | 'high', value: string) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function TierModelPanel({
  assumptions,
  scoredEvents,
  distribution,
  maxScore,
  onWeightChange,
  onThresholdsChange,
  onTierDefinitionChange,
  onAnchorChange,
  onReset,
  onClose,
}: TierModelPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('weights');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-evn-card border-l border-evn-border shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-evn-border">
          <div className="flex items-center gap-2">
            <Settings2 size={16} className="text-evn-purple" />
            <h3 className="text-sm font-semibold text-evn-text-primary">Tier Model Configuration</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-evn-text-muted hover:text-evn-text-primary hover:bg-evn-border/30 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-evn-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-[11px] font-medium py-2.5 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-evn-purple text-evn-purple'
                  : 'border-transparent text-evn-text-muted hover:text-evn-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'weights' && (
            <CriteriaWeights criteria={assumptions.criteria} onWeightChange={onWeightChange} />
          )}
          {activeTab === 'thresholds' && (
            <TierThresholds
              thresholds={assumptions.thresholds}
              maxScore={maxScore}
              tierDefinitions={assumptions.tierDefinitions}
              onChange={onThresholdsChange}
            />
          )}
          {activeTab === 'definitions' && (
            <TierDefinitions tierDefinitions={assumptions.tierDefinitions} onUpdate={onTierDefinitionChange} />
          )}
          {activeTab === 'anchors' && (
            <ScoreAnchors criteria={assumptions.criteria} onUpdate={onAnchorChange} />
          )}
        </div>

        {/* Live preview */}
        <LivePreview scoredEvents={scoredEvents} distribution={distribution} maxScore={maxScore} />

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-evn-border">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-evn-text-secondary hover:text-evn-alert hover:bg-evn-alert/10 transition-colors"
          >
            <RotateCcw size={12} />
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-evn-purple text-white hover:bg-evn-purple/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
