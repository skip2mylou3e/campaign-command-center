'use client';

import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChevronDown, ChevronUp, FileUp, Plus, Trash2, FileText, Loader2 } from 'lucide-react';
import { UploadedDocument, DocumentType } from '@/lib/types';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 100 * 1024; // 100KB
const ACCEPTED_EXTENSIONS = '.txt,.md,.csv,.pdf,.docx';
const TEXT_EXTENSIONS = ['txt', 'md', 'csv'];
const PARSED_EXTENSIONS = ['pdf', 'docx'];

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  brief: 'Brief',
  research: 'Research',
  brand_guidelines: 'Brand Guidelines',
  competitive_analysis: 'Competitive Analysis',
  creative_assets: 'Creative Assets',
  past_campaign: 'Past Campaign',
  other: 'Other',
};

interface DocumentUploadPanelProps {
  documents: UploadedDocument[];
  onChange: (documents: UploadedDocument[]) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function DocumentUploadPanel({
  documents,
  onChange,
  isCollapsed,
  onToggleCollapse,
}: DocumentUploadPanelProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [parsingIds, setParsingIds] = useState<Set<string>>(new Set());

  const addDocument = () => {
    if (documents.length >= MAX_FILES) return;
    const newDoc: UploadedDocument = {
      id: uuidv4(),
      name: '',
      filename: '',
      docType: 'other',
      content: '',
      charCount: 0,
    };
    onChange([...documents, newDoc]);
  };

  const removeDocument = (id: string) => {
    onChange(documents.filter(d => d.id !== id));
  };

  const updateDocument = (id: string, updates: Partial<UploadedDocument>) => {
    onChange(
      documents.map(d =>
        d.id === id ? { ...d, ...updates } : d
      )
    );
  };

  const handleFileUpload = async (id: string, file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert(`File "${file.name}" is too large. Maximum size is 100KB.`);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || ![...TEXT_EXTENSIONS, ...PARSED_EXTENSIONS].includes(ext)) {
      alert(`Unsupported file type ".${ext}". Supported types: .txt, .md, .csv, .pdf, .docx`);
      return;
    }

    const docName = documents.find(d => d.id === id)?.name || file.name.replace(/\.[^.]+$/, '');

    // PDF and DOCX: send to server for parsing
    if (PARSED_EXTENSIONS.includes(ext)) {
      setParsingIds(prev => new Set(prev).add(id));
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
        updateDocument(id, {
          filename: file.name,
          name: docName,
          content: text,
          charCount: text.length,
        });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to parse file');
      } finally {
        setParsingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
      return;
    }

    // Text files: read directly in browser
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      updateDocument(id, {
        filename: file.name,
        name: docName,
        content,
        charCount: content.length,
      });
    };
    reader.readAsText(file);
  };

  const handleTextareaChange = (id: string, content: string) => {
    updateDocument(id, {
      content,
      charCount: content.length,
    });
  };

  return (
    <div className="border border-dd-border rounded-lg overflow-hidden">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between px-4 py-3 bg-dd-gray-light hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <FileUp size={16} className="text-dd-teal" />
          <span className="text-sm font-medium text-dd-slate">
            Attach Reference Documents
          </span>
          {documents.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-dd-teal text-white text-xs font-bold">
              {documents.length}
            </span>
          )}
        </div>
        {isCollapsed ? <ChevronDown size={16} className="text-dd-gray" /> : <ChevronUp size={16} className="text-dd-gray" />}
      </button>

      {/* Panel content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          <p className="text-xs text-dd-gray">
            Upload briefs, research docs, or competitive analyses to help the AI produce a more accurate campaign plan.
            Supported: .txt, .md, .csv, .pdf, .docx (max 100KB each, up to 5 files).
          </p>

          {/* Document entries */}
          {documents.map((doc) => {
            const isParsing = parsingIds.has(doc.id);
            return (
              <div key={doc.id} className="border border-dd-border rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-start gap-3">
                  {/* Name + Type row */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-dd-slate mb-1">Document Name</label>
                      <input
                        type="text"
                        value={doc.name}
                        onChange={(e) => updateDocument(doc.id, { name: e.target.value })}
                        placeholder="e.g., Q4 Campaign Brief"
                        className="w-full rounded-md border border-dd-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-dd-slate mb-1">Document Type</label>
                      <select
                        value={doc.docType}
                        onChange={(e) => updateDocument(doc.id, { docType: e.target.value as DocumentType })}
                        className="w-full rounded-md border border-dd-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
                      >
                        {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className="mt-5 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Content area: textarea + file upload */}
                <div>
                  <label className="block text-xs font-medium text-dd-slate mb-1">Content</label>
                  {isParsing ? (
                    <div className="flex items-center justify-center gap-2 py-8 border border-dd-border rounded-md bg-dd-gray-light">
                      <Loader2 size={16} className="animate-spin text-dd-teal" />
                      <span className="text-sm text-dd-gray">Extracting text from {doc.filename}...</span>
                    </div>
                  ) : (
                    <textarea
                      value={doc.content}
                      onChange={(e) => handleTextareaChange(doc.id, e.target.value)}
                      placeholder="Paste document content here, or upload a file below..."
                      rows={4}
                      className="w-full rounded-md border border-dd-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none font-mono"
                    />
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[doc.id]?.click()}
                        disabled={isParsing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white text-dd-slate border border-dd-border hover:bg-dd-gray-light transition-colors disabled:opacity-50"
                      >
                        <FileText size={14} /> Upload File
                      </button>
                      <input
                        ref={(el) => { fileInputRefs.current[doc.id] = el; }}
                        type="file"
                        accept={ACCEPTED_EXTENSIONS}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.id, file);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      {doc.filename && !isParsing && (
                        <span className="text-xs text-dd-gray italic">
                          {doc.filename}
                        </span>
                      )}
                    </div>
                    {!isParsing && (
                      <span className={`text-xs ${doc.charCount > MAX_FILE_SIZE ? 'text-red-500 font-medium' : 'text-dd-gray'}`}>
                        {doc.charCount.toLocaleString()} chars
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add button */}
          {documents.length < MAX_FILES && (
            <button
              type="button"
              onClick={addDocument}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md text-dd-teal border border-dashed border-dd-teal/40 hover:bg-dd-teal/5 transition-colors w-full justify-center"
            >
              <Plus size={16} /> Add {documents.length === 0 ? 'a' : 'another'} document
            </button>
          )}

          {documents.length >= MAX_FILES && (
            <p className="text-xs text-dd-gray text-center italic">
              Maximum of {MAX_FILES} documents reached.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
