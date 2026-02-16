'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { outputTypes, outputCategories, getOutputTypesByCategory } from '@/lib/content-generator/data/outputTypes';

interface Props {
  value: string[];
  onChange: (outputTypeIds: string[]) => void;
}

export default function OutputTypeSelector({ value, onChange }: Props) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(outputCategories.map(c => c.id))
  );
  const grouped = getOutputTypesByCategory();

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const toggleOutput = (id: string) => {
    onChange(
      value.includes(id)
        ? value.filter(o => o !== id)
        : [...value, id]
    );
  };

  const selectAllInCategory = (catId: string) => {
    const catOutputIds = (grouped[catId as keyof typeof grouped] || []).map(o => o.id);
    const allSelected = catOutputIds.every(id => value.includes(id));
    if (allSelected) {
      onChange(value.filter(id => !catOutputIds.includes(id)));
    } else {
      const newIds = catOutputIds.filter(id => !value.includes(id));
      onChange([...value, ...newIds]);
    }
  };

  const selectAll = () => {
    const allIds = outputTypes.map(o => o.id);
    if (value.length === allIds.length) {
      onChange([]);
    } else {
      onChange(allIds);
    }
  };

  const formatLimit = (ot: typeof outputTypes[0]): string => {
    if (ot.wordLimit) return `${ot.wordLimit.min}-${ot.wordLimit.max} words`;
    if (ot.charLimit) return `${ot.charLimit.min}-${ot.charLimit.max} chars`;
    return '';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-semibold text-dd-slate">
          Output Types
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-dd-teal font-medium">
            {value.length} of {outputTypes.length} selected
          </span>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-dd-teal hover:text-dd-teal-dark transition-colors"
          >
            {value.length === outputTypes.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>
      <p className="text-xs text-dd-gray mb-3">
        Choose which content pieces to generate.
      </p>

      <div className="border border-dd-border rounded-lg divide-y divide-dd-border">
        {outputCategories.map((cat) => {
          const catOutputs = grouped[cat.id as keyof typeof grouped] || [];
          const isExpanded = expandedCategories.has(cat.id);
          const selectedInCat = catOutputs.filter(o => value.includes(o.id)).length;

          return (
            <div key={cat.id}>
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCategory(cat.id)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown size={16} className="text-dd-gray" /> : <ChevronRight size={16} className="text-dd-gray" />}
                  <span className="text-sm font-medium text-dd-slate">{cat.label}</span>
                  {selectedInCat > 0 && (
                    <span className="text-xs bg-dd-teal/10 text-dd-teal px-2 py-0.5 rounded-full">
                      {selectedInCat}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); selectAllInCategory(cat.id); }}
                  className="text-xs text-dd-teal hover:text-dd-teal-dark transition-colors"
                >
                  {selectedInCat === catOutputs.length ? 'Deselect' : 'Select All'}
                </button>
              </div>
              {isExpanded && (
                <div className="px-4 pb-3 space-y-1">
                  {catOutputs.map((ot) => {
                    const isSelected = value.includes(ot.id);
                    const limit = formatLimit(ot);
                    return (
                      <label
                        key={ot.id}
                        className={`flex items-start gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${
                          isSelected ? 'bg-dd-teal/5' : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOutput(ot.id)}
                          className="mt-0.5 accent-[#00A5B5]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-dd-slate">{ot.label}</span>
                            {limit && (
                              <span className="text-[10px] text-dd-gray bg-gray-100 px-1.5 py-0.5 rounded">
                                {limit}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
