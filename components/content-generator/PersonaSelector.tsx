'use client';

import { personas } from '@/lib/content-generator/data/personas';

interface Props {
  value: string[];
  onChange: (personaIds: string[]) => void;
  aiSuggested?: string[];
}

export default function PersonaSelector({ value, onChange, aiSuggested }: Props) {
  const toggle = (id: string) => {
    onChange(
      value.includes(id)
        ? value.filter(p => p !== id)
        : [...value, id]
    );
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-dd-slate mb-1">
        Target Persona
      </label>
      <p className="text-xs text-dd-gray mb-3">
        Who is this content for?
        {value.length > 0 && <span className="ml-1 text-dd-teal font-medium">({value.length} selected)</span>}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {personas.map((persona) => {
          const isSelected = value.includes(persona.id);
          const isSuggested = aiSuggested?.includes(persona.id);
          return (
            <label
              key={persona.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'border-dd-teal bg-dd-teal/5'
                  : 'border-dd-border hover:border-dd-teal/40'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(persona.id)}
                className="mt-0.5 accent-[#00A5B5]"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-dd-slate">{persona.name}</span>
                  {isSuggested && (
                    <span className="text-[10px] text-dd-teal bg-dd-teal/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      AI suggested
                    </span>
                  )}
                </div>
                <p className="text-xs text-dd-gray mt-0.5 line-clamp-2">{persona.contentAngle}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
