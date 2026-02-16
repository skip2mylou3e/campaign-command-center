'use client';

import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

const PARSED_EXTENSIONS = ['pdf', 'docx'];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SourceContentInput({ value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext && PARSED_EXTENSIONS.includes(ext)) {
      setIsParsing(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload/parse', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to parse file');
        }
        const { text } = await response.json();
        onChange(text);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to parse file');
      } finally {
        setIsParsing(false);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      onChange(text);
    };
    reader.readAsText(file);
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
            disabled={isParsing}
            className="flex items-center gap-1.5 text-xs text-dd-teal hover:text-dd-teal-dark transition-colors disabled:opacity-50"
          >
            {isParsing ? (
              <><Loader2 size={14} className="animate-spin" /> Extracting text...</>
            ) : (
              <><Upload size={14} /> Upload file (.txt, .pdf, .docx)</>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx"
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
