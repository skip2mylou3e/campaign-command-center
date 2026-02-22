'use client';

import { Phase } from '@/lib/event-navigator/types';
import { Search, Loader2, BarChart3, FileText, CalendarCheck, Settings2 } from 'lucide-react';

const phases: { id: Phase; label: string; icon: typeof Search }[] = [
  { id: 'objective', label: 'Objective', icon: Search },
  { id: 'analyzing', label: 'Analyzing', icon: Loader2 },
  { id: 'results', label: 'Results', icon: BarChart3 },
  { id: 'detail', label: 'Detail', icon: FileText },
  { id: 'plan', label: 'Event Plan', icon: CalendarCheck },
];

interface PhaseBarProps {
  currentPhase: Phase;
  completedPhases: Phase[];
  lineupCount: number;
  onPhaseClick: (phase: Phase) => void;
  onGearClick: () => void;
}

export default function PhaseBar({
  currentPhase,
  completedPhases,
  lineupCount,
  onPhaseClick,
  onGearClick,
}: PhaseBarProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-evn-card border-b border-evn-border">
      {phases.map((phase, i) => {
        const isCurrent = currentPhase === phase.id;
        const isCompleted = completedPhases.includes(phase.id);
        const isClickable = isCompleted || isCurrent ||
          (phase.id === 'plan' && lineupCount > 0) ||
          (phase.id === 'objective');
        const Icon = phase.icon;

        return (
          <div key={phase.id} className="flex items-center">
            {i > 0 && (
              <div
                className={`w-6 h-px mx-1 ${
                  isCompleted ? 'bg-evn-amber' : 'bg-evn-border'
                }`}
              />
            )}
            <button
              onClick={() => isClickable && onPhaseClick(phase.id)}
              disabled={!isClickable}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isCurrent
                  ? 'bg-evn-amber/15 text-evn-amber border border-evn-amber/30'
                  : isCompleted
                  ? 'text-evn-amber/70 hover:bg-evn-amber/10'
                  : isClickable
                  ? 'text-evn-text-secondary hover:text-evn-text-primary hover:bg-white/5'
                  : 'text-evn-text-muted cursor-not-allowed'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{phase.label}</span>
              {phase.id === 'plan' && lineupCount > 0 && (
                <span className="ml-0.5 bg-evn-tier1 text-evn-base text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {lineupCount}
                </span>
              )}
            </button>
          </div>
        );
      })}

      <div className="ml-auto">
        <button
          onClick={onGearClick}
          className="p-2 rounded-lg text-evn-text-secondary hover:text-evn-purple hover:bg-evn-purple/10 transition-colors"
          title="Tier Model Configuration"
        >
          <Settings2 size={18} />
        </button>
      </div>
    </div>
  );
}
