'use client';

import { TargetAudience } from '@/lib/content-generator/types';

interface Props {
  value: TargetAudience[];
  onChange: (audiences: TargetAudience[]) => void;
}

const audienceOptions: { id: TargetAudience; label: string; toneHint: string }[] = [
  { id: 'existing_customers', label: 'Existing Customers', toneHint: 'Excitement about what\'s new, emphasis on upgrade value and continuity' },
  { id: 'prospects', label: 'Prospects', toneHint: 'Productivity and efficiency, competitive alternative positioning' },
  { id: 'trade_industry', label: 'Trade & Industry', toneHint: 'Reinforce investment and leadership, demonstrate innovation' },
  { id: 'internal_colleagues', label: 'Internal Colleagues', toneHint: 'Educate and motivate, equip frontline staff, create brand ambassadors' },
];

export default function AudienceSelector({ value, onChange }: Props) {
  const toggle = (id: TargetAudience) => {
    onChange(
      value.includes(id)
        ? value.filter(a => a !== id)
        : [...value, id]
    );
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-dd-slate mb-1">
        Target Audience
      </label>
      <p className="text-xs text-dd-gray mb-3">
        Select all that apply. Influences tone and CTA.
      </p>
      <div className="space-y-2">
        {audienceOptions.map((opt) => {
          const isSelected = value.includes(opt.id);
          return (
            <label
              key={opt.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'border-dd-teal bg-dd-teal/5'
                  : 'border-dd-border hover:border-dd-teal/40'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(opt.id)}
                className="mt-0.5 accent-[#00A5B5]"
              />
              <div>
                <span className="text-sm font-medium text-dd-slate">{opt.label}</span>
                <p className="text-xs text-dd-gray mt-0.5">{opt.toneHint}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
