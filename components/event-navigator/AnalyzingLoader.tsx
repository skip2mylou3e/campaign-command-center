'use client';

import { useEffect, useState } from 'react';
import { Brain, Globe, BarChart3, Sparkles, Check, Loader2 } from 'lucide-react';

const steps = [
  { icon: Brain, label: 'Interpreting your objective...' },
  { icon: Globe, label: 'Matching against 104 events across Canada, UK & Australia...' },
  { icon: BarChart3, label: 'Scoring audience composition, competitive presence & timing...' },
  { icon: Sparkles, label: 'Generating strategic recommendations...' },
];

interface AnalyzingLoaderProps {
  onComplete?: () => void;
}

export default function AnalyzingLoader({ onComplete }: AnalyzingLoaderProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (activeStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 1200 + Math.random() * 800);
      return () => clearTimeout(timer);
    }
  }, [activeStep, onComplete]);

  return (
    <div className="max-w-lg mx-auto p-8 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-evn-text-primary">Analyzing Events</h2>
        <p className="text-sm text-evn-text-secondary">
          Our AI is reviewing the full event catalog for you
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          const isComplete = i < activeStep;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-500 ${
                isActive
                  ? 'bg-evn-amber/10 border-evn-amber/30'
                  : isComplete
                  ? 'bg-evn-tier1/5 border-evn-tier1/20'
                  : 'bg-evn-card/50 border-evn-border/50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-evn-amber/20 text-evn-amber'
                    : isComplete
                    ? 'bg-evn-tier1/20 text-evn-tier1'
                    : 'bg-evn-border/30 text-evn-text-muted'
                }`}
              >
                {isComplete ? (
                  <Check size={16} />
                ) : isActive ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Icon size={16} />
                )}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? 'text-evn-amber font-medium'
                    : isComplete
                    ? 'text-evn-tier1'
                    : 'text-evn-text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
