'use client';

import { regions } from '@/lib/content-generator/data/regions';

interface Props {
  value: string[];
  onChange: (regionIds: string[]) => void;
  aiSuggested?: string[];
}

export default function RegionSelector({ value, onChange, aiSuggested }: Props) {
  const toggle = (id: string) => {
    onChange(
      value.includes(id)
        ? value.filter(r => r !== id)
        : [...value, id]
    );
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-dd-slate mb-1">
        Target Region
      </label>
      <p className="text-xs text-dd-gray mb-3">
        Select the regions this content targets.
        {value.length > 0 && <span className="ml-1 text-dd-teal font-medium">({value.length} selected)</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {regions.map((region) => {
          const isSelected = value.includes(region.id);
          const isSuggested = aiSuggested?.includes(region.id);
          return (
            <label
              key={region.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'border-dd-teal bg-dd-teal/5'
                  : 'border-dd-border hover:border-dd-teal/40'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(region.id)}
                className="accent-[#00A5B5]"
              />
              <span className="text-sm text-dd-slate">{region.name}</span>
              {isSuggested && (
                <span className="text-[10px] text-dd-teal bg-dd-teal/10 px-1.5 py-0.5 rounded-full">
                  AI
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
