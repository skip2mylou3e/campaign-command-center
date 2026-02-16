'use client';

import { useState } from 'react';
import { Copy, Download, Check, AlertTriangle } from 'lucide-react';

interface Props {
  prompt: string;
}

export default function ExportPromptView({ prompt }: Props) {
  const [copied, setCopied] = useState(false);

  const wordCount = prompt.split(/\s+/).filter(Boolean).length;
  const charCount = prompt.length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'txt' | 'md') => {
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dye-durham-prompt-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <p className="text-sm text-dd-gray mb-4">
        Paste this prompt into any AI assistant (ChatGPT, Claude, Gemini, Copilot, etc.) to generate your content.
      </p>

      {/* Size warning */}
      {wordCount > 8000 && (
        <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700">
            <p className="font-medium">This prompt is quite long ({wordCount.toLocaleString()} words).</p>
            <p className="mt-1">Some AI assistants may truncate long inputs. Consider generating in two batches — select fewer outputs, export the prompt, then repeat for the remaining outputs.</p>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 bg-dd-teal text-white rounded-lg text-sm font-medium hover:bg-dd-teal-dark transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy to Clipboard'}
        </button>
        <button
          onClick={() => handleDownload('txt')}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-dd-gray border border-dd-border rounded-lg hover:border-dd-teal hover:text-dd-teal transition-colors"
        >
          <Download size={14} />
          .txt
        </button>
        <button
          onClick={() => handleDownload('md')}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-dd-gray border border-dd-border rounded-lg hover:border-dd-teal hover:text-dd-teal transition-colors"
        >
          <Download size={14} />
          .md
        </button>
        <span className="text-xs text-dd-gray ml-auto">
          {wordCount.toLocaleString()} words / {charCount.toLocaleString()} characters
        </span>
      </div>

      {/* Prompt display */}
      <div className="bg-white border border-dd-border rounded-lg">
        <textarea
          readOnly
          value={prompt}
          className="w-full h-[60vh] p-4 text-xs font-mono text-dd-slate bg-transparent resize-none focus:outline-none"
        />
      </div>
    </div>
  );
}
