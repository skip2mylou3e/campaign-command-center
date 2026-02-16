'use client';

import { CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import { ChannelGroupResult } from '@/lib/content-generator/types';
import { outputCategories } from '@/lib/content-generator/data/outputTypes';

interface Props {
  results: Record<string, ChannelGroupResult>;
}

export default function GenerationProgress({ results }: Props) {
  const groups = Object.values(results);
  const completed = groups.filter(g => g.status === 'complete').length;
  const total = groups.length;

  return (
    <div className="max-w-lg mx-auto mt-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto mb-4 border-3 border-dd-teal border-t-transparent rounded-full animate-spin" />
        <h2 className="text-lg font-bold text-dd-slate">Generating your content...</h2>
        <p className="text-sm text-dd-gray mt-1">
          {completed} of {total} channel groups complete
        </p>
      </div>

      <div className="space-y-3">
        {groups.map((group) => {
          const catInfo = outputCategories.find(c => c.id === group.channelGroup);
          const label = catInfo?.label || group.channelGroup;

          return (
            <div
              key={group.channelGroup}
              className="flex items-center gap-3 bg-white rounded-lg border border-dd-border p-4"
            >
              {group.status === 'complete' && <CheckCircle size={20} className="text-green-500 shrink-0" />}
              {group.status === 'generating' && <Loader2 size={20} className="text-dd-teal animate-spin shrink-0" />}
              {group.status === 'error' && <AlertCircle size={20} className="text-red-500 shrink-0" />}
              {group.status === 'pending' && <Clock size={20} className="text-dd-gray shrink-0" />}

              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-dd-slate">{label}</span>
                {group.status === 'error' && group.error && (
                  <p className="text-xs text-red-500 mt-0.5">{group.error}</p>
                )}
                {group.status === 'complete' && (
                  <p className="text-xs text-dd-gray mt-0.5">
                    {group.outputs.length} output{group.outputs.length !== 1 ? 's' : ''} generated
                  </p>
                )}
              </div>

              {group.status === 'generating' && (
                <span className="text-xs text-dd-teal">Generating...</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
