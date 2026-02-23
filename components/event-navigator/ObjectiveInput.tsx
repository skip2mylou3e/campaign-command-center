'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Sparkles, Loader2, List } from 'lucide-react';
import { ObjectiveParams, Country } from '@/lib/event-navigator/types';

const placeholders = [
  'Find the best events to launch Unity BC across Western Canada...',
  'Which UK events should we sponsor to compete with Landmark and InfoTrack?',
  'Plan our Australian AML/CTF compliance event strategy before July 1...',
  'Identify high-ROI events for mortgage lending tech across all markets...',
  'Build a Q1 2026 UK conveyancing conference circuit...',
];

const markets: Country[] = ['Canada', 'UK', 'Australia'];

const canadaProvinces = [
  'Ontario', 'British Columbia', 'Alberta', 'Quebec',
  'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick',
  'Newfoundland & Labrador', 'Prince Edward Island',
  'Northwest Territories', 'Nunavut', 'Yukon',
];

// Products mirroring Content Generator module, segmented by country then category
const productsByCountry: {
  country: Country;
  categories: { category: string; products: { id: string; label: string }[] }[];
}[] = [
  {
    country: 'Canada',
    categories: [
      {
        category: 'Conveyancing',
        products: [
          { id: 'unity', label: 'Unity' },
          { id: 'prosuite', label: 'ProSuite' },
          { id: 'econvey', label: 'eConvey' },
          { id: 'brief_convey', label: 'Brief Convey' },
        ],
      },
      {
        category: 'Entity Management',
        products: [
          { id: 'uem', label: 'UEM' },
          { id: 'corplink', label: 'CorpLink' },
          { id: 'fast_company', label: 'Fast Company' },
          { id: 'ecorp', label: 'eCorp' },
        ],
      },
      {
        category: 'Practice Applications',
        products: [
          { id: 'emergent', label: 'Emergent' },
          { id: 'will_builder', label: 'Will Builder' },
          { id: 'estate_a_base', label: 'Estate-a-Base' },
          { id: 'acl', label: 'ACL' },
        ],
      },
      {
        category: 'Practice Management',
        products: [
          { id: 'ghost_practice', label: 'Ghost Practice' },
          { id: 'esilaw', label: 'EsiLaw' },
        ],
      },
      {
        category: 'Due Diligence & Legal Services',
        products: [
          { id: 'ecore', label: 'eCore' },
          { id: 'apic', label: 'APIC' },
          { id: 'notice_connect', label: 'Notice Connect' },
          { id: 'mdo', label: 'MDO' },
          { id: 'etray', label: 'eTray' },
        ],
      },
      {
        category: 'Other Solutions',
        products: [
          { id: 'lending_tech', label: 'Lending Tech' },
          { id: 'corporate_search', label: 'Corporate Search' },
        ],
      },
    ],
  },
  {
    country: 'UK',
    categories: [
      {
        category: 'Conveyancing',
        products: [
          { id: 'casa', label: 'CASA' },
        ],
      },
      {
        category: 'Practice Management',
        products: [
          { id: 'quill', label: 'Quill' },
          { id: 'insight', label: 'Insight' },
          { id: 'indigo', label: 'Indigo' },
          { id: 'affinity', label: 'Affinity' },
        ],
      },
      {
        category: 'Due Diligence & Legal Services',
        products: [
          { id: 'pie_spider', label: 'PIE / Spider' },
          { id: 'index', label: 'Index' },
          { id: 'lawyer_checker', label: 'Lawyer Checker' },
          { id: 'sm22', label: 'SM22' },
          { id: 'smc', label: 'SMC' },
        ],
      },
      {
        category: 'Other Solutions',
        products: [
          { id: 'aml_ctf_uk', label: 'AML/CTF Compliance' },
          { id: 'lending_tech_uk', label: 'Lending Tech' },
          { id: 'corporate_search_uk', label: 'Corporate Search' },
        ],
      },
    ],
  },
  {
    country: 'Australia',
    categories: [
      {
        category: 'Conveyancing',
        products: [
          { id: 'matter_center', label: 'Matter Center' },
          { id: 'cats_settsplus', label: 'CATS / SettsPlus' },
          { id: 'conveyancing_manager', label: 'Conveyancing Manager' },
          { id: 'conveyancer', label: 'Conveyancer' },
        ],
      },
      {
        category: 'Practice Management',
        products: [
          { id: 'open_practice', label: 'Open Practice' },
          { id: 'atom', label: 'ATOM' },
          { id: 'nebulaw', label: 'Nebulaw' },
        ],
      },
      {
        category: 'Due Diligence & Legal Services',
        products: [
          { id: 'globalx', label: 'GlobalX' },
          { id: 'fci', label: 'FCI' },
          { id: 'terra_firma', label: 'Terra Firma' },
          { id: 'terrain', label: 'Terrain' },
        ],
      },
      {
        category: 'Other Solutions',
        products: [
          { id: 'aml_ctf_au', label: 'AML/CTF Compliance' },
          { id: 'lending_tech_au', label: 'Lending Tech' },
          { id: 'corporate_search_au', label: 'Corporate Search' },
        ],
      },
    ],
  },
];

const audiences = [
  'Lawyers/Solicitors',
  'Conveyancers',
  'Mortgage Brokers',
  'In-House Counsel',
  'Practice Managers',
  'PropTech/RE Professionals',
];

const quarters = [
  { id: 'q1' as const, label: 'Q1', desc: 'Jan-Mar' },
  { id: 'q2' as const, label: 'Q2', desc: 'Apr-Jun' },
  { id: 'q3' as const, label: 'Q3', desc: 'Jul-Sep' },
  { id: 'q4' as const, label: 'Q4', desc: 'Oct-Dec' },
];

const budgets = [
  { id: 'lean' as const, label: 'Lean' },
  { id: 'moderate' as const, label: 'Moderate' },
  { id: 'premium' as const, label: 'Premium' },
];

const participationTypes = [
  'Exhibition Booth',
  'Sponsorship',
  'Speaking Slot',
  'Awards Entry',
  'Networking Only',
  'Intelligence Gathering',
];

// Keyword mapping for smart auto-selection from objective text
const marketKeywords: Record<string, Country[]> = {
  canada: ['Canada'], canadian: ['Canada'], ontario: ['Canada'], bc: ['Canada'], alberta: ['Canada'],
  quebec: ['Canada'], vancouver: ['Canada'], toronto: ['Canada'], calgary: ['Canada'],
  kananaskis: ['Canada'], montreal: ['Canada'],
  uk: ['UK'], 'united kingdom': ['UK'], british: ['UK'], london: ['UK'], england: ['UK'], scotland: ['UK'],
  australia: ['Australia'], australian: ['Australia'], sydney: ['Australia'], melbourne: ['Australia'],
  queensland: ['Australia'], perth: ['Australia'], brisbane: ['Australia'],
};

// Province auto-detection from objective text
const provinceKeywords: Record<string, string[]> = {
  ontario: ['Ontario'], toronto: ['Ontario'], ottawa: ['Ontario'], mississauga: ['Ontario'], hamilton: ['Ontario'],
  'british columbia': ['British Columbia'], vancouver: ['British Columbia'], bc: ['British Columbia'], victoria: ['British Columbia'], kelowna: ['British Columbia'],
  alberta: ['Alberta'], calgary: ['Alberta'], edmonton: ['Alberta'], kananaskis: ['Alberta'],
  quebec: ['Quebec'], montreal: ['Quebec'], 'quebec city': ['Quebec'], laval: ['Quebec'],
  manitoba: ['Manitoba'], winnipeg: ['Manitoba'],
  saskatchewan: ['Saskatchewan'], saskatoon: ['Saskatchewan'], regina: ['Saskatchewan'],
  'nova scotia': ['Nova Scotia'], halifax: ['Nova Scotia'],
  'new brunswick': ['New Brunswick'], fredericton: ['New Brunswick'], moncton: ['New Brunswick'],
  newfoundland: ['Newfoundland & Labrador'], labrador: ['Newfoundland & Labrador'], 'st. john': ['Newfoundland & Labrador'],
  'prince edward island': ['Prince Edward Island'], pei: ['Prince Edward Island'], charlottetown: ['Prince Edward Island'],
  'northwest territories': ['Northwest Territories'], yellowknife: ['Northwest Territories'],
  nunavut: ['Nunavut'], iqaluit: ['Nunavut'],
  yukon: ['Yukon'], whitehorse: ['Yukon'],
};

const productKeywords: Record<string, string[]> = {
  unity: ['unity'], conveyancing: ['unity', 'casa', 'matter_center', 'cats_settsplus', 'conveyancing_manager', 'conveyancer'],
  'practice management': ['ghost_practice', 'esilaw', 'quill', 'open_practice', 'atom'],
  'practice mgmt': ['ghost_practice', 'esilaw', 'quill', 'open_practice', 'atom'],
  entity: ['uem', 'corplink', 'fast_company', 'ecorp'],
  corporate: ['corporate_search', 'uem', 'corplink'],
  'due diligence': ['ecore', 'pie_spider', 'globalx', 'terra_firma'],
  lending: ['lending_tech'], mortgage: ['lending_tech'],
  aml: ['aml_ctf'], 'anti-money': ['aml_ctf'], compliance: ['aml_ctf'],
  search: ['corporate_search', 'ecore', 'pie_spider', 'globalx'],
  quill: ['quill'], globalx: ['globalx'], casa: ['casa'],
  prosuite: ['prosuite'], econvey: ['econvey'],
};

const audienceKeywords: Record<string, string[]> = {
  lawyer: ['Lawyers/Solicitors'], solicitor: ['Lawyers/Solicitors'], legal: ['Lawyers/Solicitors'],
  conveyancer: ['Conveyancers'], conveyancing: ['Conveyancers'],
  mortgage: ['Mortgage Brokers'], broker: ['Mortgage Brokers'], lending: ['Mortgage Brokers'],
  'in-house': ['In-House Counsel'], counsel: ['In-House Counsel'], corporate: ['In-House Counsel'],
  'practice manager': ['Practice Managers'], managing: ['Practice Managers'],
  proptech: ['PropTech/RE Professionals'], 'real estate': ['PropTech/RE Professionals'],
  property: ['PropTech/RE Professionals'],
};

type Quarter = 'q1' | 'q2' | 'q3' | 'q4';
const timeframeKeywords: Record<string, Quarter[]> = {
  'q1': ['q1'], 'first quarter': ['q1'], january: ['q1'], february: ['q1'], march: ['q1'],
  'q2': ['q2'], 'second quarter': ['q2'], april: ['q2'], may: ['q2'], june: ['q2'],
  'q3': ['q3'], 'third quarter': ['q3'], july: ['q3'], august: ['q3'], september: ['q3'],
  'q4': ['q4'], 'fourth quarter': ['q4'], october: ['q4'], november: ['q4'], december: ['q4'],
  'first half': ['q1', 'q2'], 'h1': ['q1', 'q2'],
  'second half': ['q3', 'q4'], 'h2': ['q3', 'q4'],
};

interface ObjectiveInputProps {
  params: ObjectiveParams;
  onParamsChange: (params: ObjectiveParams) => void;
  onSubmit: () => void;
  onBrowseClick: () => void;
}

export default function ObjectiveInput({ params, onParamsChange, onSubmit, onBrowseClick }: ObjectiveInputProps) {
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const lastAnalyzed = useRef('');

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const update = <K extends keyof ObjectiveParams>(field: K, value: ObjectiveParams[K]) => {
    onParamsChange({ ...params, [field]: value });
  };

  const toggleInArray = (field: 'markets' | 'products' | 'audiences' | 'participation', value: string) => {
    const arr = params[field] as string[];
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    update(field, next as ObjectiveParams[typeof field]);
  };

  // Smart auto-selection from objective text
  const analyzeObjective = useCallback((text: string) => {
    if (text.length < 15 || text === lastAnalyzed.current) return;
    lastAnalyzed.current = text;
    setIsAnalyzing(true);

    const lower = text.toLowerCase();
    const newParams = { ...params, objective: text };
    let changed = false;

    // Detect markets
    if (params.markets.length === 0) {
      const detectedMarkets = new Set<Country>();
      for (const [keyword, mkts] of Object.entries(marketKeywords)) {
        if (lower.includes(keyword)) {
          mkts.forEach(m => detectedMarkets.add(m));
        }
      }
      if (detectedMarkets.size > 0) {
        newParams.markets = Array.from(detectedMarkets);
        changed = true;
      }
    }

    // Detect Canadian provinces (when Canada is or will be selected)
    if (params.canadaProvinces.length === 0 &&
        (params.markets.includes('Canada') || newParams.markets.includes('Canada'))) {
      const detectedProvinces = new Set<string>();
      for (const [keyword, provs] of Object.entries(provinceKeywords)) {
        if (lower.includes(keyword)) {
          provs.forEach(p => detectedProvinces.add(p));
        }
      }
      if (detectedProvinces.size > 0) {
        newParams.canadaProvinces = Array.from(detectedProvinces);
        changed = true;
      }
    }

    // Detect products
    if (params.products.length === 0) {
      const detectedProducts = new Set<string>();
      for (const [keyword, prods] of Object.entries(productKeywords)) {
        if (lower.includes(keyword)) {
          prods.forEach(p => detectedProducts.add(p));
        }
      }
      if (detectedProducts.size > 0) {
        newParams.products = Array.from(detectedProducts);
        changed = true;
      }
    }

    // Detect audiences
    if (params.audiences.length === 0) {
      const detectedAudiences = new Set<string>();
      for (const [keyword, auds] of Object.entries(audienceKeywords)) {
        if (lower.includes(keyword)) {
          auds.forEach(a => detectedAudiences.add(a));
        }
      }
      if (detectedAudiences.size > 0) {
        newParams.audiences = Array.from(detectedAudiences);
        changed = true;
      }
    }

    // Detect timeframe
    if (params.timeframe.length === 0) {
      const detectedQuarters = new Set<Quarter>();
      for (const [keyword, qs] of Object.entries(timeframeKeywords)) {
        if (lower.includes(keyword)) {
          qs.forEach(q => detectedQuarters.add(q));
        }
      }
      if (detectedQuarters.size > 0) {
        newParams.timeframe = Array.from(detectedQuarters).sort();
        changed = true;
      }
    }

    if (changed) {
      onParamsChange(newParams);
    }

    // Brief visual feedback
    setTimeout(() => setIsAnalyzing(false), 600);
  }, [params, onParamsChange]);

  const handleBlur = useCallback(() => {
    if (params.objective.trim().length >= 15) {
      analyzeObjective(params.objective);
    }
  }, [params.objective, analyzeObjective]);

  const canSubmit = params.objective.trim().length > 10;

  // Filter countries by selected markets (show all if none selected)
  const visibleCountries = params.markets.length === 0
    ? productsByCountry
    : productsByCountry.filter(c => params.markets.includes(c.country));

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-evn-text-primary">Event Navigator</h1>
        <p className="text-evn-text-secondary text-sm">
          Discover and score 104 industry events across Canada, UK &amp; Australia
        </p>
        <button
          onClick={onBrowseClick}
          className="inline-flex items-center gap-1.5 text-xs text-evn-amber hover:text-evn-amber-dark transition-colors mt-1"
        >
          <List size={14} />
          Browse all events
        </button>
      </div>

      {/* Objective textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-evn-text-secondary uppercase tracking-wider">
            What are you trying to achieve?
          </label>
          {isAnalyzing && (
            <span className="flex items-center gap-1 text-[10px] text-evn-amber">
              <Loader2 size={10} className="animate-spin" />
              Auto-detecting parameters...
            </span>
          )}
        </div>
        <textarea
          value={params.objective}
          onChange={e => update('objective', e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholders[placeholderIdx]}
          rows={3}
          className="w-full bg-evn-card border border-evn-border rounded-xl px-4 py-3 text-evn-text-primary placeholder:text-evn-text-muted focus:outline-none focus:border-evn-amber/50 focus:ring-1 focus:ring-evn-amber/20 resize-none transition-colors"
        />
      </div>

      {/* Parameters grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Markets */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-evn-text-secondary uppercase tracking-wider">Markets</label>
          <div className="flex flex-wrap gap-2">
            {markets.map(m => (
              <button
                key={m}
                onClick={() => {
                  const isSelected = params.markets.includes(m);
                  const nextMarkets = isSelected
                    ? params.markets.filter(v => v !== m)
                    : [...params.markets, m];
                  const nextProvinces = (m === 'Canada' && isSelected)
                    ? []
                    : params.canadaProvinces;
                  onParamsChange({ ...params, markets: nextMarkets, canadaProvinces: nextProvinces });
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  params.markets.includes(m)
                    ? 'bg-evn-amber/15 border-evn-amber/30 text-evn-amber'
                    : 'border-evn-border text-evn-text-secondary hover:border-evn-text-muted'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {/* Canadian province sub-options */}
          {params.markets.includes('Canada') && (
            <div className="space-y-1.5 ml-1 pl-2 border-l border-evn-amber/20">
              <span className="text-[10px] text-evn-text-secondary uppercase tracking-wider">Provinces</span>
              <div className="flex flex-wrap gap-1.5">
                {canadaProvinces.map(prov => {
                  const selected = params.canadaProvinces.includes(prov);
                  return (
                    <button
                      key={prov}
                      onClick={() => {
                        const next = selected
                          ? params.canadaProvinces.filter(p => p !== prov)
                          : [...params.canadaProvinces, prov];
                        update('canadaProvinces', next);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                        selected
                          ? 'bg-evn-amber/15 border-evn-amber/30 text-evn-amber'
                          : 'border-evn-border text-evn-text-secondary hover:border-evn-text-muted'
                      }`}
                    >
                      {prov}
                    </button>
                  );
                })}
              </div>
              {params.canadaProvinces.length === 0 && (
                <p className="text-[10px] text-evn-text-muted">None selected = all Canada</p>
              )}
            </div>
          )}
        </div>

        {/* Products - segmented by country then category */}
        <div className="space-y-3 md:col-span-2">
          <label className="text-xs font-medium text-evn-text-secondary uppercase tracking-wider">Products</label>
          {visibleCountries.map(countryGroup => (
            <div key={countryGroup.country} className="space-y-1.5">
              <div className="text-[11px] font-semibold text-evn-text-primary border-b border-evn-border/50 pb-1">
                {countryGroup.country}
              </div>
              {countryGroup.categories.map(cat => (
                <div key={`${countryGroup.country}-${cat.category}`}>
                  <span className="text-[10px] text-evn-text-muted uppercase tracking-wider">{cat.category}</span>
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {cat.products.map(p => (
                      <button
                        key={p.id}
                        onClick={() => toggleInArray('products', p.id)}
                        className={`text-[11px] px-2 py-1 rounded-lg border transition-colors ${
                          params.products.includes(p.id)
                            ? 'bg-evn-amber/15 border-evn-amber/30 text-evn-amber'
                            : 'border-evn-border text-evn-text-secondary hover:border-evn-text-muted'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Audiences row */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-evn-text-secondary uppercase tracking-wider">Audiences</label>
        <div className="flex flex-wrap gap-1.5">
          {audiences.map(a => (
            <button
              key={a}
              onClick={() => toggleInArray('audiences', a)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                params.audiences.includes(a)
                  ? 'bg-evn-amber/15 border-evn-amber/30 text-evn-amber'
                  : 'border-evn-border text-evn-text-secondary hover:border-evn-text-muted'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Timeframe */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-evn-text-secondary uppercase tracking-wider">Timeframe (2026)</label>
          <div className="flex gap-1.5">
            {quarters.map(q => {
              const selected = params.timeframe.includes(q.id);
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    const next = selected
                      ? params.timeframe.filter(t => t !== q.id)
                      : [...params.timeframe, q.id];
                    update('timeframe', next as ObjectiveParams['timeframe']);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex-1 ${
                    selected
                      ? 'bg-evn-amber/15 border-evn-amber/30 text-evn-amber'
                      : 'border-evn-border text-evn-text-secondary hover:border-evn-text-muted'
                  }`}
                  title={q.desc}
                >
                  {q.label}
                </button>
              );
            })}
          </div>
          {params.timeframe.length === 0 && (
            <p className="text-[10px] text-evn-text-muted">No quarters selected — all quarters will be considered</p>
          )}
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-evn-text-secondary uppercase tracking-wider">Budget Level</label>
          <div className="flex gap-2">
            {budgets.map(b => (
              <button
                key={b.id}
                onClick={() => update('budget', b.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex-1 ${
                  params.budget === b.id
                    ? 'bg-evn-amber/15 border-evn-amber/30 text-evn-amber'
                    : 'border-evn-border text-evn-text-secondary hover:border-evn-text-muted'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Participation */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-evn-text-secondary uppercase tracking-wider">Participation</label>
          <div className="flex flex-wrap gap-1.5">
            {participationTypes.map(p => (
              <button
                key={p}
                onClick={() => toggleInArray('participation', p)}
                className={`text-[11px] px-2 py-1 rounded-lg border transition-colors ${
                  params.participation.includes(p)
                    ? 'bg-evn-amber/15 border-evn-amber/30 text-evn-amber'
                    : 'border-evn-border text-evn-text-secondary hover:border-evn-text-muted'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model badge + CTA */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs text-evn-text-muted">
          <Sparkles size={14} className="text-evn-purple" />
          <span>Powered by Claude AI + Tier Scoring Model</span>
        </div>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            canSubmit
              ? 'bg-gradient-to-r from-evn-amber to-evn-amber-dark text-evn-base hover:shadow-lg hover:shadow-evn-amber/20'
              : 'bg-evn-border text-evn-text-muted cursor-not-allowed'
          }`}
        >
          <Search size={16} />
          Find My Events
        </button>
      </div>
    </div>
  );
}
