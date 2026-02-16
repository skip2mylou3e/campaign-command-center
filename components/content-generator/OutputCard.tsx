'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { GeneratedOutput } from '@/lib/content-generator/types';
import { outputTypes } from '@/lib/content-generator/data/outputTypes';
import CopyButton from '@/components/common/CopyButton';

interface Props {
  output: GeneratedOutput;
}

export default function OutputCard({ output }: Props) {
  const [showReviewerNotes, setShowReviewerNotes] = useState(false);
  const ot = outputTypes.find(o => o.id === output.outputTypeId);
  const wordCount = output.content.split(/\s+/).filter(Boolean).length;
  const charCount = output.content.length;

  // Check if within limits
  const getCountColor = (): string => {
    if (ot?.charLimit) {
      if (charCount > ot.charLimit.max) return 'text-red-500';
      if (charCount > ot.charLimit.max * 0.9) return 'text-amber-500';
    }
    if (ot?.wordLimit) {
      if (wordCount > ot.wordLimit.max) return 'text-red-500';
      if (wordCount > ot.wordLimit.max * 0.9) return 'text-amber-500';
    }
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg border border-dd-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dd-border">
        <h3 className="text-sm font-semibold text-dd-slate">{output.outputTypeLabel}</h3>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${getCountColor()}`}>
            {wordCount} words / {charCount.toLocaleString()} chars
          </span>
          <CopyButton text={output.content} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="text-sm text-dd-slate whitespace-pre-wrap leading-relaxed">
          {output.content}
        </div>
      </div>

      {/* Guardrail Warnings */}
      {output.guardrailWarnings.length > 0 && (
        <div className="px-4 pb-3 space-y-1.5">
          {output.guardrailWarnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* Reviewer Notes */}
      {output.reviewerNotes && (
        <div className="border-t border-dd-border">
          <button
            onClick={() => setShowReviewerNotes(!showReviewerNotes)}
            className="flex items-center gap-2 w-full px-4 py-2 text-xs text-dd-gray hover:bg-gray-50 transition-colors"
          >
            {showReviewerNotes ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Reviewer Notes
          </button>
          {showReviewerNotes && (
            <div className="px-4 pb-3 text-xs text-dd-gray bg-gray-50 leading-relaxed whitespace-pre-wrap">
              {output.reviewerNotes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
