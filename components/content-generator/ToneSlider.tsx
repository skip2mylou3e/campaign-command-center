'use client';

import { ToneEmphasis } from '@/lib/content-generator/types';

interface Props {
  value: ToneEmphasis;
  onChange: (tone: ToneEmphasis) => void;
}

const options: { id: ToneEmphasis; label: string }[] = [
  { id: 'purposeful', label: 'More Purposeful' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'energizer', label: 'More Energizer' },
];

export default function ToneSlider({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-dd-slate mb-1">
        Content Tone Emphasis
      </label>
      <p className="text-xs text-dd-gray mb-3">
        Adjust the overall tone balance across generated content.
      </p>
      <div className="flex rounded-lg border border-dd-border overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex-1 py-2 px-3 text-sm transition-colors ${
              value === opt.id
                ? 'bg-dd-teal text-white font-medium'
                : 'bg-white text-dd-gray hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
