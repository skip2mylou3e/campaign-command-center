'use client';

import { useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X, Upload, Star } from 'lucide-react';
import { SupplementaryDoc, SupplementaryDocType, ContentIntent } from '@/lib/content-generator/types';
import { supplementaryDocTypes, intentConfigs } from '@/lib/content-generator/data/intentConfig';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  docs: SupplementaryDoc[];
  onChange: (docs: SupplementaryDoc[]) => void;
  contentIntent: ContentIntent | null;
}

export default function SupplementaryDocsPanel({ docs, onChange, contentIntent }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const intentConfig = contentIntent ? intentConfigs.find(i => i.id === contentIntent) : null;

  const addDoc = () => {
    const newDoc: SupplementaryDoc = {
      id: uuidv4(),
      name: '',
      typeLabel: 'other',
      content: '',
    };
    onChange([...docs, newDoc]);
  };

  const removeDoc = (id: string) => {
    onChange(docs.filter(d => d.id !== id));
  };

  const updateDoc = (id: string, field: keyof SupplementaryDoc, value: string) => {
    onChange(docs.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      onChange(docs.map(d => d.id === docId ? { ...d, content: text, filename: file.name, name: d.name || file.name } : d));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getDocSuggestionLevel = (docType: SupplementaryDocType): 'critical' | 'helpful' | null => {
    if (!intentConfig) return null;
    return intentConfig.suggestedDocs[docType] || null;
  };

  // Get critical and helpful docs for suggestion bar
  const criticalDocs = intentConfig
    ? supplementaryDocTypes.filter(d => intentConfig.suggestedDocs[d.id] === 'critical')
    : [];
  const helpfulDocs = intentConfig
    ? supplementaryDocTypes.filter(d => intentConfig.suggestedDocs[d.id] === 'helpful')
    : [];

  return (
    <div className="border border-dd-border rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown size={16} className="text-dd-gray" /> : <ChevronRight size={16} className="text-dd-gray" />}
          <span className="text-sm font-medium text-dd-slate">
            + Add supporting documents to enrich content
          </span>
          {docs.length > 0 && (
            <span className="text-xs bg-dd-teal/10 text-dd-teal px-2 py-0.5 rounded-full">
              {docs.length}
            </span>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-dd-border pt-3">
          {/* Suggestion bar based on intent */}
          {intentConfig && (criticalDocs.length > 0 || helpfulDocs.length > 0) && (
            <div className="bg-dd-teal/5 border border-dd-teal/20 rounded-lg p-3">
              <p className="text-xs font-medium text-dd-slate mb-2">
                Recommended for {intentConfig.label}:
              </p>
              {criticalDocs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {criticalDocs.map(d => (
                    <span key={d.id} className="inline-flex items-center gap-1 text-[10px] bg-dd-teal/10 text-dd-teal px-2 py-1 rounded-full">
                      <Star size={10} />
                      {d.label}
                    </span>
                  ))}
                </div>
              )}
              {helpfulDocs.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {helpfulDocs.map(d => (
                    <span key={d.id} className="text-[10px] bg-gray-100 text-dd-gray px-2 py-1 rounded-full">
                      {d.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Document slots */}
          {docs.map((doc) => {
            const suggestionLevel = getDocSuggestionLevel(doc.typeLabel);
            return (
              <div key={doc.id} className="border border-dd-border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={doc.name}
                    onChange={(e) => updateDoc(doc.id, 'name', e.target.value)}
                    placeholder="Document name"
                    className="flex-1 text-sm rounded border border-dd-border px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-dd-teal"
                  />
                  <select
                    value={doc.typeLabel}
                    onChange={(e) => updateDoc(doc.id, 'typeLabel', e.target.value)}
                    className="text-xs rounded border border-dd-border px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-dd-teal"
                  >
                    {supplementaryDocTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  {suggestionLevel === 'critical' && (
                    <span className="text-[10px] text-dd-teal bg-dd-teal/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      Critical
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeDoc(doc.id)}
                    className="text-dd-gray hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <textarea
                  value={doc.content}
                  onChange={(e) => updateDoc(doc.id, 'content', e.target.value)}
                  rows={4}
                  placeholder="Paste document content here..."
                  className="w-full text-sm rounded border border-dd-border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-dd-teal resize-y"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[doc.id]?.click()}
                    className="flex items-center gap-1 text-xs text-dd-teal hover:text-dd-teal-dark transition-colors"
                  >
                    <Upload size={12} />
                    Upload .txt
                  </button>
                  <input
                    ref={(el) => { fileInputRefs.current[doc.id] = el; }}
                    type="file"
                    accept=".txt"
                    onChange={(e) => handleFileUpload(doc.id, e)}
                    className="hidden"
                  />
                  <span className="text-[10px] text-dd-gray">
                    {doc.content.length > 0 ? `${doc.content.length.toLocaleString()} chars` : ''}
                    {doc.filename ? ` | ${doc.filename}` : ''}
                  </span>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addDoc}
            className="flex items-center gap-1.5 text-sm text-dd-teal hover:text-dd-teal-dark transition-colors"
          >
            <Plus size={16} />
            Add another document
          </button>
        </div>
      )}
    </div>
  );
}
