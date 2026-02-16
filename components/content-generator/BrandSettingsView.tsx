'use client';

import { Shield, Check, X } from 'lucide-react';
import { brandVoice } from '@/lib/content-generator/data/brandVoice';

export default function BrandSettingsView() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Shield size={20} className="text-dd-teal" />
        <h2 className="text-lg font-bold text-dd-slate">Brand Voice Settings</h2>
      </div>
      <p className="text-sm text-dd-gray mb-6">
        These brand guidelines are automatically applied to all generated content. This is a read-only reference.
      </p>

      {/* Company Identity */}
      <div className="bg-white rounded-xl border border-dd-border p-5 mb-4">
        <h3 className="text-sm font-semibold text-dd-slate mb-3">Company Identity</h3>
        <div className="text-sm text-dd-gray whitespace-pre-line leading-relaxed">
          {brandVoice.companyIdentity}
        </div>
      </div>

      {/* Tone Pillars */}
      <div className="bg-white rounded-xl border border-dd-border p-5 mb-4">
        <h3 className="text-sm font-semibold text-dd-slate mb-3">Three Tone Pillars</h3>
        <div className="space-y-4">
          {brandVoice.tonePillars.map((pillar) => (
            <div key={pillar.name} className="border-l-2 border-dd-teal pl-4">
              <div className="text-sm font-semibold text-dd-slate">{pillar.name}</div>
              <p className="text-xs text-dd-gray mt-0.5 mb-2">{pillar.description}</p>
              <ul className="space-y-1">
                {pillar.rules.map((rule, i) => (
                  <li key={i} className="text-xs text-dd-gray flex items-start gap-2">
                    <Check size={12} className="text-dd-teal shrink-0 mt-0.5" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Writing Rules */}
      <div className="bg-white rounded-xl border border-dd-border p-5 mb-4">
        <h3 className="text-sm font-semibold text-dd-slate mb-3">13 Writing Rules</h3>
        <ol className="space-y-2">
          {brandVoice.writingRules.map((rule, i) => (
            <li key={i} className="text-xs text-dd-gray flex items-start gap-2">
              <span className="text-dd-teal font-mono font-bold shrink-0 w-5 text-right">{i + 1}.</span>
              {rule}
            </li>
          ))}
        </ol>
      </div>

      {/* Do / Don't */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-dd-border p-5">
          <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-1.5">
            <Check size={16} />
            Do
          </h3>
          <ul className="space-y-1.5">
            {[
              'Use "Dye & Durham" (with ampersand)',
              'Lead with customer outcomes',
              'Use active voice throughout',
              'Include clear calls to action',
              'Use data and statistics',
              'Write short paragraphs (2-4 sentences)',
              'Match regional spelling conventions',
            ].map((item, i) => (
              <li key={i} className="text-xs text-dd-gray flex items-start gap-2">
                <Check size={12} className="text-green-600 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-dd-border p-5">
          <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-1.5">
            <X size={16} />
            Don&apos;t
          </h3>
          <ul className="space-y-1.5">
            {[
              'Write "Dye and Durham" or "D&D"',
              'Use exclamation marks',
              'Say "cutting-edge" or "game-changing"',
              'Start with "In today\'s rapidly..."',
              'Use "solution" as a standalone noun',
              'Be condescending to professionals',
              'Lead with features over outcomes',
            ].map((item, i) => (
              <li key={i} className="text-xs text-dd-gray flex items-start gap-2">
                <X size={12} className="text-red-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
