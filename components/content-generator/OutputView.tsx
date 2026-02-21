'use client';

import { useState } from 'react';
import { Linkedin, Mail, Megaphone, FileText, Briefcase, Globe, Download, Copy, RefreshCw } from 'lucide-react';
import { ChannelGroupResult, OutputCategory } from '@/lib/content-generator/types';
import { outputCategories } from '@/lib/content-generator/data/outputTypes';
import OutputCard from './OutputCard';
import FeedbackPanel from './FeedbackPanel';

interface Props {
  results: Record<string, ChannelGroupResult>;
  onRegenerate: (channelGroup: string, feedback: string) => void;
}

const categoryIcons: Record<OutputCategory, typeof Linkedin> = {
  linkedin_social: Linkedin,
  email: Mail,
  ads: Megaphone,
  blog: FileText,
  sales_internal: Briefcase,
  website: Globe,
};

export default function OutputView({ results, onRegenerate }: Props) {
  // Include groups that are complete OR currently regenerating (so the tab stays visible)
  const visibleGroups = Object.values(results).filter(
    r => (r.status === 'complete' && r.outputs.length > 0) || r.status === 'generating'
  );
  const [activeTab, setActiveTab] = useState<string>(visibleGroups[0]?.channelGroup || '');

  const currentGroup = results[activeTab];

  // For copy/download, only use completed groups
  const completedGroups = Object.values(results).filter(r => r.status === 'complete' && r.outputs.length > 0);

  const handleCopyAll = async () => {
    const allContent = completedGroups
      .flatMap(g => g.outputs.map(o => `## ${o.outputTypeLabel}\n\n${o.content}`))
      .join('\n\n---\n\n');
    await navigator.clipboard.writeText(allContent);
  };

  const handleDownload = (format: 'md' | 'txt') => {
    const ext = format;
    const separator = format === 'md' ? '\n\n---\n\n' : '\n\n========================================\n\n';
    const content = completedGroups
      .map(g => {
        const catLabel = outputCategories.find(c => c.id === g.channelGroup)?.label || g.channelGroup;
        const header = format === 'md' ? `# ${catLabel}` : catLabel.toUpperCase();
        const outputs = g.outputs
          .map(o => {
            const outHeader = format === 'md' ? `## ${o.outputTypeLabel}` : o.outputTypeLabel;
            return `${outHeader}\n\n${o.content}${o.reviewerNotes ? `\n\n${format === 'md' ? '### ' : ''}Reviewer Notes:\n${o.reviewerNotes}` : ''}`;
          })
          .join(separator);
        return `${header}\n\n${outputs}`;
      })
      .join(`\n\n${'='.repeat(60)}\n\n`);

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dye-durham-content-${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (visibleGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-dd-gray">No content was generated. Try again with different settings.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Export bar */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-dd-teal border border-dd-teal rounded-lg hover:bg-dd-teal/5 transition-colors"
        >
          <Copy size={14} />
          Copy All
        </button>
        <button
          onClick={() => handleDownload('md')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-dd-gray border border-dd-border rounded-lg hover:border-dd-teal hover:text-dd-teal transition-colors"
        >
          <Download size={14} />
          .md
        </button>
        <button
          onClick={() => handleDownload('txt')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-dd-gray border border-dd-border rounded-lg hover:border-dd-teal hover:text-dd-teal transition-colors"
        >
          <Download size={14} />
          .txt
        </button>
        <span className="text-xs text-dd-gray ml-auto">
          {completedGroups.reduce((sum, g) => sum + g.outputs.length, 0)} content assets generated
        </span>
      </div>

      {/* Tabs + Content */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Tab sidebar */}
        <div className="md:w-56 shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {visibleGroups.map((group) => {
              const catInfo = outputCategories.find(c => c.id === group.channelGroup);
              const Icon = categoryIcons[group.channelGroup as OutputCategory] || FileText;
              const isActive = activeTab === group.channelGroup;
              const isRegenerating = group.status === 'generating';

              return (
                <button
                  key={group.channelGroup}
                  onClick={() => setActiveTab(group.channelGroup)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-dd-teal/10 text-dd-teal font-medium border-l-2 border-dd-teal'
                      : 'text-dd-gray hover:text-dd-slate hover:bg-gray-50 border-l-2 border-transparent'
                  }`}
                >
                  {isRegenerating ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Icon size={16} />
                  )}
                  <span>{catInfo?.label || group.channelGroup}</span>
                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full ml-auto">
                    {group.outputs.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 space-y-4">
          {currentGroup?.status === 'generating' ? (
            <div className="flex flex-col items-center justify-center py-16 text-dd-teal">
              <RefreshCw size={28} className="animate-spin mb-3" />
              <p className="text-sm font-medium">Regenerating content...</p>
              <p className="text-xs text-dd-gray mt-1">Applying your feedback</p>
            </div>
          ) : (
            <>
              {currentGroup?.outputs.map((output, i) => (
                <OutputCard key={`${output.outputTypeId}-${i}`} output={output} />
              ))}
              {currentGroup?.status === 'complete' && (
                <FeedbackPanel
                  channelGroup={currentGroup.channelGroup}
                  isRegenerating={false}
                  feedbackHistory={currentGroup.feedbackHistory}
                  onRegenerate={onRegenerate}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
