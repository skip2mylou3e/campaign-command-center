'use client';

import { useState, useCallback, useRef } from 'react';
import { Sparkles, FileText, ArrowLeft, BookOpen } from 'lucide-react';
import {
  CGEInput,
  ContentIntent,
  TargetAudience,
  ToneEmphasis,
  SupplementaryDoc,
  ChannelGroupResult,
  OutputCategory,
  GeneratedOutput,
  SmartDefaults,
} from '@/lib/content-generator/types';
import { intentConfigs } from '@/lib/content-generator/data/intentConfig';
import { outputTypes, outputCategories } from '@/lib/content-generator/data/outputTypes';
import { runGuardrailChecks } from '@/lib/content-generator/guardrails';

import SourceContentInput from '@/components/content-generator/SourceContentInput';
import SupplementaryDocsPanel from '@/components/content-generator/SupplementaryDocsPanel';
import ContentIntentSelector from '@/components/content-generator/ContentIntentSelector';
import AudienceSelector from '@/components/content-generator/AudienceSelector';
import ProductSelector from '@/components/content-generator/ProductSelector';
import PersonaSelector from '@/components/content-generator/PersonaSelector';
import RegionSelector from '@/components/content-generator/RegionSelector';
import OutputTypeSelector from '@/components/content-generator/OutputTypeSelector';
import OutputModeToggle from '@/components/content-generator/OutputModeToggle';
import ToneSlider from '@/components/content-generator/ToneSlider';
import CampaignContextInput from '@/components/content-generator/CampaignContextInput';
import GenerationProgress from '@/components/content-generator/GenerationProgress';
import OutputView from '@/components/content-generator/OutputView';
import ExportPromptView from '@/components/content-generator/ExportPromptView';
import BrandSettingsView from '@/components/content-generator/BrandSettingsView';

type ViewState = 'input' | 'generating' | 'output' | 'export_prompt' | 'brand_settings';

const initialInput: CGEInput = {
  sourceContent: '',
  supplementaryDocs: [],
  contentIntent: null,
  targetAudience: [],
  selectedProducts: [],
  selectedPersonas: [],
  selectedRegions: [],
  selectedOutputTypes: [],
  toneEmphasis: 'balanced',
  campaignContext: '',
  outputMode: 'generate',
};

export default function ContentGeneratorPage() {
  const [view, setView] = useState<ViewState>('input');
  const [input, setInput] = useState<CGEInput>(initialInput);
  const [results, setResults] = useState<Record<string, ChannelGroupResult>>({});
  const [exportedPrompt, setExportedPrompt] = useState('');
  const [smartDefaults, setSmartDefaults] = useState<SmartDefaults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showBrandPanel, setShowBrandPanel] = useState(false);
  const analyzeTimeout = useRef<NodeJS.Timeout | null>(null);

  const updateInput = useCallback(<K extends keyof CGEInput>(field: K, value: CGEInput[K]) => {
    setInput(prev => ({ ...prev, [field]: value }));
  }, []);

  // When intent changes, pre-select output types
  const handleIntentChange = useCallback((intent: ContentIntent) => {
    const config = intentConfigs.find(i => i.id === intent);
    setInput(prev => ({
      ...prev,
      contentIntent: intent,
      selectedOutputTypes: config?.preSelectedOutputs || [],
    }));
  }, []);

  // Smart defaults: analyze source content
  const analyzeSourceContent = useCallback(async (content: string) => {
    if (content.length < 100) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/content-generator/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceContent: content }),
      });
      if (response.ok) {
        const data: SmartDefaults = await response.json();
        setSmartDefaults(data);
        // Pre-fill if user hasn't already made selections
        setInput(prev => ({
          ...prev,
          contentIntent: prev.contentIntent || data.intent,
          selectedProducts: prev.selectedProducts.length === 0 ? data.products : prev.selectedProducts,
          selectedPersonas: prev.selectedPersonas.length === 0 ? data.personas : prev.selectedPersonas,
          selectedRegions: prev.selectedRegions.length === 0 ? data.regions : prev.selectedRegions,
          selectedOutputTypes: prev.selectedOutputTypes.length === 0
            ? (intentConfigs.find(i => i.id === data.intent)?.preSelectedOutputs || [])
            : prev.selectedOutputTypes,
        }));
      }
    } catch {
      // Non-blocking - smart defaults are optional
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleSourceContentChange = useCallback((content: string) => {
    updateInput('sourceContent', content);
    // Debounced analysis
    if (analyzeTimeout.current) clearTimeout(analyzeTimeout.current);
    analyzeTimeout.current = setTimeout(() => analyzeSourceContent(content), 1500);
  }, [updateInput, analyzeSourceContent]);

  // Get active channel groups from selected outputs
  const getActiveChannelGroups = (): OutputCategory[] => {
    const groups = new Set<OutputCategory>();
    for (const otId of input.selectedOutputTypes) {
      const ot = outputTypes.find(o => o.id === otId);
      if (ot) groups.add(ot.category);
    }
    return Array.from(groups);
  };

  // Generate content
  const handleGenerate = async () => {
    if (input.outputMode === 'export_prompt') {
      // Build prompt client-side
      const { buildExportablePrompt } = await import('@/lib/content-generator/exportPromptBuilder');
      const prompt = buildExportablePrompt(input);
      setExportedPrompt(prompt);
      setView('export_prompt');
      return;
    }

    setView('generating');
    const activeGroups = getActiveChannelGroups();

    // Initialize results
    const initialResults: Record<string, ChannelGroupResult> = {};
    for (const group of activeGroups) {
      initialResults[group] = { channelGroup: group, outputs: [], status: 'pending' };
    }
    setResults(initialResults);

    // Generate per channel group sequentially
    for (const group of activeGroups) {
      setResults(prev => ({
        ...prev,
        [group]: { ...prev[group], status: 'generating' },
      }));

      try {
        const response = await fetch('/api/content-generator/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input, channelGroup: group }),
        });

        if (!response.ok) {
          throw new Error(`Generation failed: ${response.statusText}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }

        if (fullText.startsWith('__STREAM_ERROR__')) {
          throw new Error(fullText.replace('__STREAM_ERROR__', ''));
        }

        // Parse the generated outputs
        const parsedOutputs = parseChannelOutput(fullText, group);

        // Run guardrail checks
        const checkedOutputs = parsedOutputs.map(o => ({
          ...o,
          guardrailWarnings: runGuardrailChecks(o.content, o.outputTypeId),
        }));

        setResults(prev => ({
          ...prev,
          [group]: { channelGroup: group, outputs: checkedOutputs, status: 'complete' },
        }));
      } catch (error) {
        setResults(prev => ({
          ...prev,
          [group]: {
            channelGroup: group,
            outputs: [],
            status: 'error',
            error: error instanceof Error ? error.message : 'Generation failed',
          },
        }));
      }
    }

    setView('output');
  };

  const handleReset = () => {
    setInput(initialInput);
    setResults({});
    setExportedPrompt('');
    setSmartDefaults(null);
    setView('input');
  };

  const canGenerate = input.sourceContent.trim().length > 0 && input.selectedOutputTypes.length > 0;
  const selectedOutputCount = input.selectedOutputTypes.length;
  const actionLabel = input.outputMode === 'generate'
    ? `Generate ${selectedOutputCount} Content Asset${selectedOutputCount !== 1 ? 's' : ''}`
    : `Build Prompt for ${selectedOutputCount} Asset${selectedOutputCount !== 1 ? 's' : ''}`;

  if (showBrandPanel) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <button
          onClick={() => setShowBrandPanel(false)}
          className="flex items-center gap-1.5 text-sm text-dd-teal hover:text-dd-teal-dark mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <BrandSettingsView />
      </div>
    );
  }

  if (view === 'generating') {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <GenerationProgress results={results} />
      </div>
    );
  }

  if (view === 'output') {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-dd-slate">Generated Content</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('input')}
              className="flex items-center gap-1.5 text-sm text-dd-teal hover:text-dd-teal-dark transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Input
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-dd-gray hover:text-dd-slate transition-colors"
            >
              New Generation
            </button>
          </div>
        </div>
        <OutputView results={results} />
      </div>
    );
  }

  if (view === 'export_prompt') {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-dd-slate">Exported Prompt</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('input')}
              className="flex items-center gap-1.5 text-sm text-dd-teal hover:text-dd-teal-dark transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Input
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-dd-gray hover:text-dd-slate transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
        <ExportPromptView prompt={exportedPrompt} />
      </div>
    );
  }

  // Input View
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-dd-slate">Content Generator Engine</h1>
          <p className="text-sm text-dd-gray mt-1">
            Transform source content into marketing assets across channels
          </p>
        </div>
        <button
          onClick={() => setShowBrandPanel(true)}
          className="flex items-center gap-1.5 text-sm text-dd-teal hover:text-dd-teal-dark transition-colors"
        >
          <BookOpen size={16} />
          Brand Voice
        </button>
      </div>

      {/* Smart defaults indicator */}
      {isAnalyzing && (
        <div className="mb-4 flex items-center gap-2 text-xs text-dd-teal bg-dd-teal/5 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 border-2 border-dd-teal border-t-transparent rounded-full animate-spin" />
          Analyzing content to suggest settings...
        </div>
      )}
      {smartDefaults && !isAnalyzing && (
        <div className="mb-4 text-xs text-dd-teal bg-dd-teal/5 px-3 py-2 rounded-lg">
          AI-suggested settings applied. Adjust as needed.
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Source Content */}
        <div className="bg-white rounded-xl border border-dd-border p-5">
          <SourceContentInput
            value={input.sourceContent}
            onChange={handleSourceContentChange}
          />
        </div>

        {/* Supplementary Docs */}
        <SupplementaryDocsPanel
          docs={input.supplementaryDocs}
          onChange={(docs) => updateInput('supplementaryDocs', docs)}
          contentIntent={input.contentIntent}
        />

        {/* Content Intent */}
        <div className="bg-white rounded-xl border border-dd-border p-5">
          <ContentIntentSelector
            value={input.contentIntent}
            onChange={handleIntentChange}
          />
        </div>

        {/* Audience + Products + Personas + Regions */}
        <div className="bg-white rounded-xl border border-dd-border p-5 space-y-6">
          <AudienceSelector
            value={input.targetAudience}
            onChange={(v) => updateInput('targetAudience', v)}
          />
          <hr className="border-dd-border" />
          <ProductSelector
            value={input.selectedProducts}
            onChange={(v) => updateInput('selectedProducts', v)}
            aiSuggested={smartDefaults?.products}
          />
          <hr className="border-dd-border" />
          <PersonaSelector
            value={input.selectedPersonas}
            onChange={(v) => updateInput('selectedPersonas', v)}
            aiSuggested={smartDefaults?.personas}
          />
          <hr className="border-dd-border" />
          <RegionSelector
            value={input.selectedRegions}
            onChange={(v) => updateInput('selectedRegions', v)}
            aiSuggested={smartDefaults?.regions}
          />
        </div>

        {/* Output Types */}
        <div className="bg-white rounded-xl border border-dd-border p-5">
          <OutputTypeSelector
            value={input.selectedOutputTypes}
            onChange={(v) => updateInput('selectedOutputTypes', v)}
          />
        </div>

        {/* Tone + Campaign Context */}
        <div className="bg-white rounded-xl border border-dd-border p-5 space-y-6">
          <ToneSlider
            value={input.toneEmphasis}
            onChange={(v) => updateInput('toneEmphasis', v)}
          />
          <hr className="border-dd-border" />
          <CampaignContextInput
            value={input.campaignContext}
            onChange={(v) => updateInput('campaignContext', v)}
          />
        </div>

        {/* Mode Toggle + Action */}
        <div className="bg-white rounded-xl border border-dd-border p-5 space-y-6">
          <OutputModeToggle
            value={input.outputMode}
            onChange={(v) => updateInput('outputMode', v)}
          />

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`w-full py-3 px-6 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              canGenerate
                ? 'bg-dd-teal hover:bg-dd-teal-dark'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {input.outputMode === 'generate' ? <Sparkles size={18} /> : <FileText size={18} />}
            {actionLabel}
          </button>

          {!canGenerate && (
            <p className="text-xs text-center text-dd-gray">
              {!input.sourceContent.trim() ? 'Paste source content above to get started.' : 'Select at least one output type.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Parse the AI response into structured GeneratedOutput objects
function parseChannelOutput(text: string, channelGroup: OutputCategory): GeneratedOutput[] {
  const outputs: GeneratedOutput[] = [];
  // Split by output type delimiters
  const sections = text.split(/^={3,}\s*OUTPUT:\s*/gm).filter(Boolean);

  if (sections.length <= 1) {
    // Fallback: treat entire text as a single output
    const groupOutputTypes = outputTypes.filter(o => o.category === channelGroup);
    outputs.push({
      outputTypeId: groupOutputTypes[0]?.id || channelGroup,
      outputTypeLabel: groupOutputTypes[0]?.label || channelGroup,
      category: channelGroup,
      content: text,
      reviewerNotes: extractReviewerNotes(text),
      guardrailWarnings: [],
    });
    return outputs;
  }

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const headerLine = lines[0]?.trim() || '';

    // Try to match output type from header
    const matchedType = outputTypes.find(
      ot => ot.category === channelGroup &&
        (headerLine.toLowerCase().includes(ot.id.replace(/_/g, ' ')) ||
         headerLine.toLowerCase().includes(ot.label.toLowerCase()))
    );

    const content = lines.slice(1).join('\n').trim();

    outputs.push({
      outputTypeId: matchedType?.id || headerLine.toLowerCase().replace(/\s+/g, '_'),
      outputTypeLabel: matchedType?.label || headerLine,
      category: channelGroup,
      content: content || section,
      reviewerNotes: extractReviewerNotes(content || section),
      guardrailWarnings: [],
    });
  }

  return outputs;
}

function extractReviewerNotes(text: string): string {
  const match = text.match(/(?:REVIEWER NOTES|Reviewer Notes)[:\s]*\n?([\s\S]*?)(?:={3,}|$)/i);
  return match?.[1]?.trim() || '';
}
