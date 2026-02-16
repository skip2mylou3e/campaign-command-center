'use client';

import { ContentIntent } from '@/lib/content-generator/types';
import { intentConfigs } from '@/lib/content-generator/data/intentConfig';
import { Rocket, Megaphone, RefreshCw, MessageCircle } from 'lucide-react';

interface Props {
  value: ContentIntent | null;
  onChange: (intent: ContentIntent) => void;
}

const intentIcons: Record<ContentIntent, typeof Rocket> = {
  launch: Rocket,
  promote: Megaphone,
  update: RefreshCw,
  communicate: MessageCircle,
};

export default function ContentIntentSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-dd-slate mb-1">
        Content Intent
      </label>
      <p className="text-xs text-dd-gray mb-3">
        What is the strategic purpose of this content?
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {intentConfigs.map((intent) => {
          const Icon = intentIcons[intent.id];
          const isSelected = value === intent.id;
          return (
            <button
              key={intent.id}
              type="button"
              onClick={() => onChange(intent.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-dd-teal bg-dd-teal/5'
                  : 'border-dd-border hover:border-dd-teal/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className={isSelected ? 'text-dd-teal' : 'text-dd-gray'} />
                <span className={`text-sm font-semibold ${isSelected ? 'text-dd-teal' : 'text-dd-slate'}`}>
                  {intent.label}
                </span>
              </div>
              <p className="text-xs text-dd-gray leading-relaxed">
                {intent.description}
              </p>
            </button>
          );
        })}
      </div>
      {value && (
        <p className="mt-2 text-xs text-dd-gray italic">
          {intentConfigs.find(i => i.id === value)?.toneCharacter}
        </p>
      )}
    </div>
  );
}
