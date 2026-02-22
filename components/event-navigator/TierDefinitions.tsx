'use client';

import { TierModelAssumptions } from '@/lib/event-navigator/types';

interface TierDefinitionsProps {
  tierDefinitions: TierModelAssumptions['tierDefinitions'];
  onUpdate: (tier: 'tier1' | 'tier2' | 'tier3', field: 'label' | 'description', value: string) => void;
}

const tiers: { key: 'tier1' | 'tier2' | 'tier3'; borderColor: string }[] = [
  { key: 'tier1', borderColor: 'border-evn-tier1' },
  { key: 'tier2', borderColor: 'border-evn-tier2' },
  { key: 'tier3', borderColor: 'border-evn-tier3' },
];

export default function TierDefinitions({ tierDefinitions, onUpdate }: TierDefinitionsProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-evn-text-muted">
        Customize the label and description for each tier level.
      </p>
      {tiers.map(({ key, borderColor }) => {
        const def = tierDefinitions[key];
        return (
          <div
            key={key}
            className={`border-l-4 ${borderColor} bg-evn-base/50 rounded-r-xl p-4 space-y-2`}
          >
            <input
              type="text"
              value={def.label}
              onChange={e => onUpdate(key, 'label', e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-evn-text-primary focus:outline-none border-b border-evn-border/30 pb-1 focus:border-evn-purple/50"
            />
            <textarea
              value={def.description}
              onChange={e => onUpdate(key, 'description', e.target.value)}
              rows={2}
              className="w-full bg-transparent text-xs text-evn-text-secondary focus:outline-none resize-none leading-relaxed"
            />
          </div>
        );
      })}
    </div>
  );
}
