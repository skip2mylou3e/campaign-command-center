'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { GlossaryTerm } from '@/lib/types';

export default function GlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetch('/api/glossary')
      .then(res => res.json())
      .then(data => setTerms(data))
      .catch(() => setTerms([]));
  }, []);

  const categories = ['All', ...Array.from(new Set(terms.map(t => t.category)))].sort();

  const filtered = terms.filter(term => {
    const matchesSearch = !search ||
      term.term.toLowerCase().includes(search.toLowerCase()) ||
      term.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-dd-slate">Glossary</h1>
        <p className="text-sm text-dd-gray mt-1">
          Digital advertising terms explained in plain language.
        </p>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dd-gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms..."
            className="w-full rounded-lg border border-dd-border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Terms */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-dd-border p-12 text-center">
          <BookOpen className="w-12 h-12 text-dd-gray mx-auto mb-4" />
          <p className="text-dd-gray">No terms found matching your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((term, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-dd-slate">{term.term}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-dd-gray-light text-dd-gray">
                  {term.category}
                </span>
              </div>
              <p className="text-sm text-dd-gray leading-relaxed">{term.definition}</p>
              {term.relatedTerms?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-xs text-dd-gray">Related:</span>
                  {term.relatedTerms.map((rt, j) => (
                    <button
                      key={j}
                      onClick={() => setSearch(rt)}
                      className="text-xs text-dd-teal hover:underline"
                    >
                      {rt}{j < term.relatedTerms.length - 1 ? ',' : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
