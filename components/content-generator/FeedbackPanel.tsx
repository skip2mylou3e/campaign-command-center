'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, RefreshCw } from 'lucide-react';
import { OutputCategory, RegenerationFeedback } from '@/lib/content-generator/types';
import { outputCategories } from '@/lib/content-generator/data/outputTypes';

interface Props {
  channelGroup: OutputCategory;
  isRegenerating: boolean;
  feedbackHistory?: RegenerationFeedback[];
  onRegenerate: (channelGroup: string, feedback: string) => void;
}

export default function FeedbackPanel({ channelGroup, isRegenerating, feedbackHistory, onRegenerate }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const channelLabel = outputCategories.find(c => c.id === channelGroup)?.label || channelGroup;
  const iterationCount = (feedbackHistory?.length || 0) + 1;

  const handleRegenerate = () => {
    if (!feedback.trim() || isRegenerating) return;
    onRegenerate(channelGroup, feedback.trim());
    setFeedback('');
  };

  return (
    <div className="bg-white rounded-lg border border-dd-border mt-4">
      {/* Toggle header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-dd-gray hover:text-dd-teal transition-colors"
      >
        <MessageSquare size={16} />
        <span className="font-medium">Refine this content</span>
        {feedbackHistory && feedbackHistory.length > 0 && (
          <span className="text-xs bg-dd-teal/10 text-dd-teal px-2 py-0.5 rounded-full">
            Revision {iterationCount}
          </span>
        )}
        <span className="ml-auto">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-dd-border pt-3">
          {/* Feedback input */}
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Describe what you'd like changed — e.g., 'Make the tone more casual' or 'Add a statistic about market growth' or 'Shorten the email body by 30%'"
            className="w-full px-3 py-2.5 text-sm border border-dd-border rounded-lg focus:ring-2 focus:ring-dd-teal/20 focus:border-dd-teal outline-none resize-y min-h-[80px] text-dd-slate placeholder:text-dd-gray/60"
            disabled={isRegenerating}
          />

          {/* Regenerate button */}
          <button
            onClick={handleRegenerate}
            disabled={!feedback.trim() || isRegenerating}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              feedback.trim() && !isRegenerating
                ? 'bg-dd-teal text-white hover:bg-dd-teal-dark'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
            Regenerate {channelLabel}
          </button>

          {/* Feedback history */}
          {feedbackHistory && feedbackHistory.length > 0 && (
            <div className="pt-1">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1.5 text-xs text-dd-gray hover:text-dd-teal transition-colors"
              >
                {showHistory ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Previous feedback ({feedbackHistory.length})
              </button>
              {showHistory && (
                <div className="mt-2 space-y-2">
                  {feedbackHistory.map((entry, i) => (
                    <div key={i} className="text-xs bg-gray-50 px-3 py-2 rounded border border-gray-100">
                      <span className="text-dd-gray font-medium">Revision {entry.iterationNumber}:</span>{' '}
                      <span className="text-dd-slate">{entry.feedback}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
