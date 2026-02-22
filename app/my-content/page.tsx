'use client';

import { useState } from 'react';
import { ArrowLeft, Trash2, FileText, Clock, Layers, ChevronRight } from 'lucide-react';
import { useSavedContent } from '@/lib/content-generator/hooks/useSavedContent';
import { SavedContentDraft, OutputCategory } from '@/lib/content-generator/types';
import { products } from '@/lib/content-generator/data/products';
import { personas } from '@/lib/content-generator/data/personas';
import { regions } from '@/lib/content-generator/data/regions';
import { outputTypes, outputCategories } from '@/lib/content-generator/data/outputTypes';
import { intentConfigs } from '@/lib/content-generator/data/intentConfig';
import OutputView from '@/components/content-generator/OutputView';

const intentLabels: Record<string, string> = Object.fromEntries(
  intentConfigs.map(c => [c.id, c.label])
);

const toneLabels: Record<string, string> = {
  purposeful: 'Purposeful',
  balanced: 'Balanced',
  energizer: 'Energizer',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getCategoryLabel(cat: OutputCategory): string {
  return outputCategories.find(c => c.id === cat)?.label || cat;
}

function getOutputCount(draft: SavedContentDraft): number {
  return Object.values(draft.results).reduce(
    (sum, r) => sum + (r.outputs?.length || 0),
    0
  );
}

function getChannelGroups(draft: SavedContentDraft): string[] {
  return Object.values(draft.results)
    .filter(r => r.status === 'complete' && r.outputs?.length > 0)
    .map(r => getCategoryLabel(r.channelGroup));
}

export default function MyContentPage() {
  const { drafts, deleteDraft } = useSavedContent();
  const [selectedDraft, setSelectedDraft] = useState<SavedContentDraft | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteDraft(id);
    setDeleteConfirm(null);
    if (selectedDraft?.id === id) setSelectedDraft(null);
  };

  // Detail view
  if (selectedDraft) {
    const { input } = selectedDraft;
    const selectedProductNames = input.selectedProducts
      .map(id => products.find(p => p.id === id)?.name || id)
      .join(', ');
    const selectedPersonaNames = input.selectedPersonas
      .map(id => personas.find(p => p.id === id)?.name || id)
      .join(', ');
    const selectedRegionNames = input.selectedRegions
      .map(id => regions.find(r => r.id === id)?.name || id)
      .join(', ');
    const selectedOutputNames = input.selectedOutputTypes
      .map(id => outputTypes.find(o => o.id === id)?.label || id)
      .join(', ');

    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => setSelectedDraft(null)}
              className="flex items-center gap-1.5 text-sm text-dd-teal hover:text-dd-teal-dark mb-2 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to My Content
            </button>
            <h1 className="text-xl font-bold text-dd-slate">{selectedDraft.name}</h1>
            <p className="text-sm text-dd-gray mt-0.5">
              Saved {formatDate(selectedDraft.createdAt)}
            </p>
          </div>
        </div>

        {/* Original Instructions */}
        <div className="bg-white rounded-xl border border-dd-border p-5 mb-6">
          <h2 className="text-sm font-semibold text-dd-slate mb-4">Original Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {input.contentIntent && (
              <div>
                <span className="text-dd-gray">Intent:</span>{' '}
                <span className="text-dd-slate font-medium">{intentLabels[input.contentIntent] || input.contentIntent}</span>
              </div>
            )}
            <div>
              <span className="text-dd-gray">Tone:</span>{' '}
              <span className="text-dd-slate font-medium">{toneLabels[input.toneEmphasis] || input.toneEmphasis}</span>
            </div>
            {selectedProductNames && (
              <div>
                <span className="text-dd-gray">Products:</span>{' '}
                <span className="text-dd-slate font-medium">{selectedProductNames}</span>
              </div>
            )}
            {selectedPersonaNames && (
              <div>
                <span className="text-dd-gray">Personas:</span>{' '}
                <span className="text-dd-slate font-medium">{selectedPersonaNames}</span>
              </div>
            )}
            {selectedRegionNames && (
              <div>
                <span className="text-dd-gray">Regions:</span>{' '}
                <span className="text-dd-slate font-medium">{selectedRegionNames}</span>
              </div>
            )}
            {selectedOutputNames && (
              <div className="md:col-span-2">
                <span className="text-dd-gray">Output Types:</span>{' '}
                <span className="text-dd-slate font-medium">{selectedOutputNames}</span>
              </div>
            )}
          </div>

          {/* Source content preview */}
          {input.sourceContent && (
            <div className="mt-4 pt-4 border-t border-dd-border">
              <span className="text-dd-gray text-sm">Source Content:</span>
              <p className="text-sm text-dd-slate mt-1 whitespace-pre-wrap line-clamp-6">
                {input.sourceContent}
              </p>
            </div>
          )}

          {/* Campaign context */}
          {input.campaignContext && (
            <div className="mt-4 pt-4 border-t border-dd-border">
              <span className="text-dd-gray text-sm">Campaign Context:</span>
              <p className="text-sm text-dd-slate mt-1 whitespace-pre-wrap line-clamp-4">
                {input.campaignContext}
              </p>
            </div>
          )}
        </div>

        {/* Generated Outputs (read-only) */}
        <h2 className="text-sm font-semibold text-dd-slate mb-3">Generated Outputs</h2>
        <OutputView results={selectedDraft.results} onRegenerate={() => {}} />
      </div>
    );
  }

  // List view
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-dd-slate">My Content</h1>
        <p className="text-sm text-dd-gray mt-1">
          Saved content drafts from the Content Generator
        </p>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dd-border p-12 text-center">
          <FileText size={40} className="mx-auto text-dd-gray/40 mb-3" />
          <p className="text-dd-gray text-sm">No saved content yet.</p>
          <p className="text-dd-gray/60 text-xs mt-1">
            Generate content and click &quot;Save Draft&quot; to save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map(draft => {
            const channelGroups = getChannelGroups(draft);
            const outputCount = getOutputCount(draft);

            return (
              <div
                key={draft.id}
                className="bg-white rounded-xl border border-dd-border p-4 hover:border-dd-teal/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setSelectedDraft(draft)}
                    className="flex-1 text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-dd-slate group-hover:text-dd-teal transition-colors">
                        {draft.name}
                      </h3>
                      <ChevronRight size={14} className="text-dd-gray/40 group-hover:text-dd-teal transition-colors" />
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-dd-gray">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(draft.createdAt)}
                      </span>
                      {draft.input.contentIntent && (
                        <span className="flex items-center gap-1">
                          {intentLabels[draft.input.contentIntent] || draft.input.contentIntent}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Layers size={12} />
                        {outputCount} output{outputCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {channelGroups.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {channelGroups.map(label => (
                          <span
                            key={label}
                            className="text-[11px] px-2 py-0.5 bg-dd-teal/10 text-dd-teal rounded-full"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>

                  {/* Delete */}
                  <div className="shrink-0">
                    {deleteConfirm === draft.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(draft.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-dd-gray hover:text-dd-slate"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(draft.id)}
                        className="p-1.5 text-dd-gray/40 hover:text-red-500 transition-colors"
                        title="Delete draft"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
