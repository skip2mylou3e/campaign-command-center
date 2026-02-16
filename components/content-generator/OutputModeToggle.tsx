'use client';

import { Sparkles, FileText } from 'lucide-react';

interface Props {
  value: 'generate' | 'export_prompt';
  onChange: (mode: 'generate' | 'export_prompt') => void;
}

export default function OutputModeToggle({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-dd-slate mb-1">
        Generation Mode
      </label>
      <p className="text-xs text-dd-gray mb-3">
        Generate content directly or export a prompt for another AI tool.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('generate')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            value === 'generate'
              ? 'border-dd-teal bg-dd-teal/5'
              : 'border-dd-border hover:border-dd-teal/40'
          }`}
        >
          <Sparkles size={20} className={value === 'generate' ? 'text-dd-teal' : 'text-dd-gray'} />
          <div className="mt-2">
            <span className={`text-sm font-semibold block ${value === 'generate' ? 'text-dd-teal' : 'text-dd-slate'}`}>
              Generate content now
            </span>
            <p className="text-xs text-dd-gray mt-1">
              AI generates all selected content types using the Anthropic API
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onChange('export_prompt')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            value === 'export_prompt'
              ? 'border-dd-teal bg-dd-teal/5'
              : 'border-dd-border hover:border-dd-teal/40'
          }`}
        >
          <FileText size={20} className={value === 'export_prompt' ? 'text-dd-teal' : 'text-dd-gray'} />
          <div className="mt-2">
            <span className={`text-sm font-semibold block ${value === 'export_prompt' ? 'text-dd-teal' : 'text-dd-slate'}`}>
              Export prompt for another AI
            </span>
            <p className="text-xs text-dd-gray mt-1">
              Get a complete prompt to paste into ChatGPT, Claude, Gemini, etc.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
