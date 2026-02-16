'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { products, getProductsByCategory } from '@/lib/content-generator/data/products';

interface Props {
  value: string[];
  onChange: (productIds: string[]) => void;
  aiSuggested?: string[];
}

const allRegions = ['Canada', 'United Kingdom', 'Australia', 'South Africa', 'Global'];

export default function ProductSelector({ value, onChange, aiSuggested }: Props) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);

  const grouped = getProductsByCategory();

  const toggle = (id: string) => {
    onChange(
      value.includes(id)
        ? value.filter(p => p !== id)
        : [...value, id]
    );
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = !regionFilter || p.regions.includes(regionFilter);
    return matchesSearch && matchesRegion;
  });

  const filteredIds = new Set(filteredProducts.map(p => p.id));

  return (
    <div>
      <label className="block text-sm font-semibold text-dd-slate mb-1">
        Target Product / Solution
      </label>
      <p className="text-xs text-dd-gray mb-2">
        Select the products this content relates to.
        {value.length > 0 && <span className="ml-1 text-dd-teal font-medium">({value.length} selected)</span>}
      </p>

      {/* Search + Region filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dd-gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-dd-border focus:outline-none focus:ring-2 focus:ring-dd-teal"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setRegionFilter(null)}
            className={`px-2 py-1 text-xs rounded-full border transition-colors ${
              !regionFilter ? 'bg-dd-teal text-white border-dd-teal' : 'border-dd-border text-dd-gray hover:border-dd-teal'
            }`}
          >
            All
          </button>
          {allRegions.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRegionFilter(regionFilter === r ? null : r)}
              className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                regionFilter === r ? 'bg-dd-teal text-white border-dd-teal' : 'border-dd-border text-dd-gray hover:border-dd-teal'
              }`}
            >
              {r === 'United Kingdom' ? 'UK' : r === 'South Africa' ? 'SA' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped checkboxes */}
      <div className="max-h-64 overflow-y-auto border border-dd-border rounded-lg p-3 space-y-4">
        {Object.entries(grouped).map(([category, prods]) => {
          const visibleProds = prods.filter(p => filteredIds.has(p.id));
          if (visibleProds.length === 0) return null;
          return (
            <div key={category}>
              <div className="text-xs font-semibold text-dd-gray uppercase tracking-wide mb-1.5">
                {category}
              </div>
              <div className="space-y-1">
                {visibleProds.map(p => {
                  const isSelected = value.includes(p.id);
                  const isSuggested = aiSuggested?.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm transition-colors ${
                        isSelected ? 'bg-dd-teal/10 text-dd-slate' : 'hover:bg-gray-50 text-dd-gray'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(p.id)}
                        className="accent-[#00A5B5]"
                      />
                      <span>{p.name}</span>
                      <span className="text-[10px] text-dd-gray">({p.regions.join(', ')})</span>
                      {isSuggested && (
                        <span className="text-[10px] text-dd-teal bg-dd-teal/10 px-1.5 py-0.5 rounded-full">
                          AI suggested
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
