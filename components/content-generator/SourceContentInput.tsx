'use client';

import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SourceContentInput({ value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      onChange(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-dd-slate mb-1">
        Paste your source content
      </label>
      <p className="text-xs text-dd-gray mb-2">
        Product brief, press release, PID, messaging framework, or corporate announcement
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal resize-y"
        placeholder="Paste a Product Information Document (PID), product brief, press release, feature sheet, messaging framework, or corporate announcement here..."
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-dd-teal hover:text-dd-teal-dark transition-colors"
          >
            <Upload size={14} />
            Upload .txt file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1 text-xs text-dd-gray hover:text-red-500 transition-colors"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
        <span className="text-xs text-dd-gray">
          {value.length.toLocaleString()} characters
        </span>
      </div>
    </div>
  );
}
