'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Sparkles, FileText, ChevronRight, ChevronLeft, Info, Loader2, MessageSquare } from 'lucide-react';
import { CampaignBrief, Campaign } from '@/lib/types';
import { saveCampaign, getTeamConfig } from '@/lib/storage';
import { buildExportablePrompt } from '@/lib/promptBuilder';
import CopyButton from '@/components/common/CopyButton';
import LoadingTips from '@/components/common/LoadingTips';

const objectives = [
  'Brand Awareness',
  'Thought Leadership',
  'Lead Generation',
  'Product Promotion',
  'Event Promotion',
  'Customer Retention/Upsell',
];

const productAreas = [
  'Conveyancing / Title Search',
  'Practice Management',
  'Corporate Services',
  'Due Diligence',
  'Payments & Fintech',
  'Platform (General)',
  'Other',
];

const geographyOptions = [
  'Canada (National)',
  'Canada (Province-specific)',
  'United Kingdom (National)',
  'UK (Region-specific)',
  'Australia (National)',
  'Australia (State-specific)',
];

const outcomeOptions = [
  'Website visits',
  'Content downloads',
  'Demo requests',
  'Webinar registrations',
  'Brand search volume',
  'Social engagement',
  'MQL generation',
  'SQL generation',
  'Pipeline influenced',
  'Deals closed',
];

const budgetOptions = [
  'Under $5K',
  '$5K-$15K',
  '$15K-$30K',
  '$30K-$50K',
  '$50K-$100K',
  '$100K+',
  'Not sure / need guidance',
];

const urgencyOptions = [
  'Planning ahead (2+ months)',
  'Standard (1-2 months)',
  'Urgent (< 1 month)',
];

export default function PlanPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0=mode select, 1-5=form steps
  const [outputMode, setOutputMode] = useState<'auto_generate' | 'give_me_prompt'>('auto_generate');
  const [entryPath, setEntryPath] = useState<'A' | 'B' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [suggestedName, setSuggestedName] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState<{id: string; question: string; hint: string; answer: string}[]>([]);

  const [brief, setBrief] = useState<CampaignBrief>({
    outputMode: 'auto_generate',
    freeText: '',
    campaignName: '',
    objective: '',
    objectiveDetail: '',
    promoting: '',
    targetAudience: '',
    geography: [],
    geographyDetail: '',
    productArea: '',
    timeframeStart: '',
    timeframeEnd: '',
    urgency: 'Standard (1-2 months)',
    budgetRange: '',
    currency: 'CAD',
    topicsThemes: '',
    desiredOutcomes: [],
    existingAssets: '',
    competitorContext: '',
    pastLearnings: '',
    internalConstraints: '',
    additionalContext: '',
  });

  const updateBrief = (field: keyof CampaignBrief, value: unknown) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const toggleGeography = (geo: string) => {
    setBrief(prev => ({
      ...prev,
      geography: prev.geography.includes(geo)
        ? prev.geography.filter(g => g !== geo)
        : [...prev.geography, geo],
    }));
  };

  const toggleOutcome = (outcome: string) => {
    setBrief(prev => ({
      ...prev,
      desiredOutcomes: prev.desiredOutcomes.includes(outcome)
        ? prev.desiredOutcomes.filter(o => o !== outcome)
        : [...prev.desiredOutcomes, outcome],
    }));
  };

  const handleAnalyzeBrief = async () => {
    if (!brief.freeText?.trim()) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/campaigns/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freeText: brief.freeText }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze brief');
      }

      const data = await response.json();
      setSuggestedName(data.suggestedName || '');
      setFollowUpQuestions(
        (data.questions || []).map((q: { id: string; question: string; hint: string }) => ({
          ...q,
          answer: '',
        }))
      );
      setShowFollowUp(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to analyze brief');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    let finalBrief = { ...brief, outputMode };

    // For Path A, use freeText as the primary input
    if (entryPath === 'A') {
      const name = suggestedName || brief.freeText?.slice(0, 50).trim() || 'Untitled Campaign';
      finalBrief = { ...finalBrief, campaignName: name };

      if (followUpQuestions.length > 0) {
        const qaPairs = followUpQuestions
          .filter(q => q.answer.trim())
          .map(q => `Q: ${q.question}\nA: ${q.answer}`)
          .join('\n\n');
        if (qaPairs) {
          finalBrief = {
            ...finalBrief,
            additionalContext: `Follow-up details provided by the team:\n\n${qaPairs}`,
          };
        }
      }
    }

    if (outputMode === 'give_me_prompt') {
      const config = getTeamConfig();
      const prompt = buildExportablePrompt(finalBrief, config);
      setGeneratedPrompt(prompt);

      // Save as campaign with prompt_generated status
      const campaign: Campaign = {
        id: uuidv4(),
        name: finalBrief.campaignName || 'Untitled Campaign',
        status: 'prompt_generated',
        objective: finalBrief.objective,
        brief: finalBrief,
        plan: null,
        generatedPrompt: prompt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveCampaign(campaign);
      return;
    }

    // Auto-generate path
    setIsGenerating(true);
    try {
      const response = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: finalBrief }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate plan');
      }

      const data = await response.json();

      const campaign: Campaign = {
        id: uuidv4(),
        name: finalBrief.campaignName || 'Untitled Campaign',
        status: 'draft',
        objective: finalBrief.objective,
        brief: finalBrief,
        plan: data.plan,
        generatedPrompt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveCampaign(campaign);
      router.push(`/plan/${campaign.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  // Show generated prompt view
  if (generatedPrompt) {
    const wordCount = generatedPrompt.split(/\s+/).length;
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-dd-border">
          <div className="p-6 border-b border-dd-border">
            <h2 className="text-xl font-bold text-dd-slate mb-2">Your Campaign Prompt</h2>
            <p className="text-sm text-dd-gray">
              Paste this prompt into Claude, ChatGPT, or any AI assistant. The prompt includes all the context needed to generate a comprehensive campaign plan.
            </p>
            <p className="text-xs text-dd-gray mt-2">
              Approximately {wordCount.toLocaleString()} words. Works well with Claude, ChatGPT-4, Gemini, or any modern AI assistant.
            </p>
          </div>
          <div className="p-4 flex gap-2 border-b border-dd-border bg-dd-gray-light">
            <CopyButton text={generatedPrompt} label="Copy to Clipboard" />
            <a
              href="https://claude.ai/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-dd-teal text-white hover:bg-dd-teal-light"
            >
              Open in Claude
            </a>
            <a
              href="https://chat.openai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white text-dd-slate border border-dd-border hover:bg-dd-gray-light"
            >
              Open in ChatGPT
            </a>
            <button
              onClick={() => {
                const blob = new Blob([generatedPrompt], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${brief.campaignName || 'campaign'}-prompt.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white text-dd-slate border border-dd-border hover:bg-dd-gray-light"
            >
              <FileText size={14} /> Download .txt
            </button>
          </div>
          <div className="p-4">
            <textarea
              readOnly
              value={generatedPrompt}
              className="w-full h-[60vh] text-sm font-mono bg-dd-gray-light rounded-lg p-4 border border-dd-border resize-none focus:outline-none"
            />
          </div>
          <div className="p-4 border-t border-dd-border flex gap-3">
            <button
              onClick={() => setGeneratedPrompt(null)}
              className="px-4 py-2 text-sm bg-white text-dd-slate border border-dd-border rounded-lg hover:bg-dd-gray-light"
            >
              Back to Brief
            </button>
            <button
              onClick={() => router.push('/campaigns')}
              className="px-4 py-2 text-sm bg-dd-teal text-white rounded-lg hover:bg-dd-teal-light"
            >
              View Saved Campaigns
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isGenerating) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-dd-border">
          <LoadingTips />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-dd-slate">Plan a Campaign</h1>
        <p className="text-sm text-dd-gray mt-1">
          Build a detailed advertising brief and get a comprehensive plan tailored to Dye & Durham.
        </p>
      </div>

      {/* Output Mode Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-dd-navy mb-4">How would you like your plan?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setOutputMode('auto_generate')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              outputMode === 'auto_generate'
                ? 'border-dd-teal bg-dd-teal/5'
                : 'border-dd-border hover:border-dd-teal/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-dd-teal" />
              <span className="font-semibold text-dd-slate">Generate my plan automatically</span>
            </div>
            <p className="text-xs text-dd-gray">
              The app will analyze your brief and produce a full campaign plan using AI. Results appear directly in the app.
            </p>
          </button>
          <button
            onClick={() => setOutputMode('give_me_prompt')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              outputMode === 'give_me_prompt'
                ? 'border-dd-teal bg-dd-teal/5'
                : 'border-dd-border hover:border-dd-teal/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText size={20} className="text-dd-teal" />
              <span className="font-semibold text-dd-slate">Give me a prompt</span>
            </div>
            <p className="text-xs text-dd-gray">
              Build a detailed prompt from your brief that you can copy and paste into any AI assistant. No API key needed.
            </p>
          </button>
        </div>
      </div>

      {/* Entry Path Selection */}
      {!entryPath && (
        <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-dd-navy mb-4">How would you like to start?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => { setEntryPath('A'); setStep(0); }}
              className="p-4 rounded-lg border-2 border-dd-border hover:border-dd-teal/50 text-left"
            >
              <span className="font-semibold text-dd-slate block mb-1">Just tell us about it</span>
              <p className="text-xs text-dd-gray">
                Describe your campaign in your own words and we&apos;ll build the brief from there.
              </p>
            </button>
            <button
              onClick={() => { setEntryPath('B'); setStep(1); }}
              className="p-4 rounded-lg border-2 border-dd-border hover:border-dd-teal/50 text-left"
            >
              <span className="font-semibold text-dd-slate block mb-1">Walk me through it</span>
              <p className="text-xs text-dd-gray">
                A step-by-step guided form that covers everything we need to know.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Path A: Free text */}
      {entryPath === 'A' && !showFollowUp && (
        <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-dd-navy mb-2">Describe your campaign</h2>
          <p className="text-sm text-dd-gray mb-4">
            Tell us what you&apos;re trying to achieve, who you want to reach, what you&apos;re promoting, and any constraints or preferences. Be as detailed or as brief as you like.
          </p>
          <textarea
            value={brief.freeText}
            onChange={(e) => updateBrief('freeText', e.target.value)}
            placeholder="e.g., We want to promote our new Unity conveyancing platform to notaries in British Columbia. We have about $10K budget and want to generate demo requests. We've never run digital ads before..."
            rows={8}
            className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none"
            disabled={isAnalyzing}
          />
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setEntryPath(null)}
              className="px-4 py-2 text-sm bg-white text-dd-slate border border-dd-border rounded-lg hover:bg-dd-gray-light"
              disabled={isAnalyzing}
            >
              Back
            </button>
            <button
              onClick={outputMode === 'give_me_prompt' ? handleGenerate : handleAnalyzeBrief}
              disabled={!brief.freeText?.trim() || isAnalyzing}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-dd-teal text-white rounded-lg hover:bg-dd-teal-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
              ) : outputMode === 'give_me_prompt' ? (
                <><FileText size={16} /> Generate Prompt</>
              ) : (
                <><MessageSquare size={16} /> Continue</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Path A: Follow-up questions */}
      {entryPath === 'A' && showFollowUp && (
        <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-dd-navy mb-1">A few quick follow-ups</h2>
          <p className="text-sm text-dd-gray mb-6">
            We&apos;ve got the gist. Just help us fill in a few gaps so we can build you a great plan.
          </p>

          {/* Campaign name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-dd-slate mb-1">Campaign Name</label>
            <input
              type="text"
              value={suggestedName}
              onChange={(e) => setSuggestedName(e.target.value)}
              className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
            />
            <p className="text-xs text-dd-gray italic mt-1">We suggested a name — feel free to change it.</p>
          </div>

          {/* Follow-up questions */}
          <div className="space-y-5">
            {followUpQuestions.map((q, i) => (
              <div key={q.id}>
                <label className="block text-sm font-medium text-dd-slate mb-1">{q.question}</label>
                <textarea
                  value={q.answer}
                  onChange={(e) => {
                    const updated = [...followUpQuestions];
                    updated[i] = { ...updated[i], answer: e.target.value };
                    setFollowUpQuestions(updated);
                  }}
                  placeholder={q.hint}
                  rows={2}
                  className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none"
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-dd-gray mt-5 italic">
            Skip any that don&apos;t apply — we&apos;ll work with what you give us.
          </p>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setShowFollowUp(false)}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-white text-dd-slate border border-dd-border rounded-lg hover:bg-dd-gray-light"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-dd-teal text-white rounded-lg hover:bg-dd-teal-light"
            >
              {outputMode === 'auto_generate' ? (
                <><Sparkles size={16} /> Generate Campaign Plan</>
              ) : (
                <><FileText size={16} /> Generate Prompt</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 1: The Basics */}
      {entryPath && step === 1 && !showFollowUp && (
        <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-dd-teal text-white text-xs font-bold">1</div>
            <h2 className="text-lg font-semibold text-dd-navy">The Basics</h2>
          </div>
          <p className="text-xs text-dd-gray mb-6 ml-8">Tell us what this campaign is about.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Campaign Name</label>
              <input
                type="text"
                value={brief.campaignName}
                onChange={(e) => updateBrief('campaignName', e.target.value)}
                placeholder="e.g., Unity BC Launch Q1"
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              />
              <p className="text-xs text-dd-gray italic mt-1">Give it a name your team will recognize.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Objective</label>
              <select
                value={brief.objective}
                onChange={(e) => updateBrief('objective', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                <option value="">Select primary goal...</option>
                {objectives.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <p className="text-xs text-dd-gray italic mt-1">What does success look like? More people knowing about us? More demo requests?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">What are you promoting?</label>
              <textarea
                value={brief.promoting}
                onChange={(e) => updateBrief('promoting', e.target.value)}
                placeholder="e.g., Unity, our new all-in-one conveyancing platform for BC notaries that reduces transaction time by 40%"
                rows={3}
                className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none"
              />
              <p className="text-xs text-dd-gray italic mt-1">Be specific. Instead of &quot;our conveyancing product,&quot; try describing the unique value.</p>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => entryPath === 'A' ? setStep(0) : setEntryPath(null)}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-white text-dd-slate border border-dd-border rounded-lg hover:bg-dd-gray-light"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-dd-teal text-white rounded-lg hover:bg-dd-teal-light"
            >
              Next: Your Audience <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Your Audience */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-dd-teal text-white text-xs font-bold">2</div>
            <h2 className="text-lg font-semibold text-dd-navy">Your Audience</h2>
          </div>
          <p className="text-xs text-dd-gray mb-6 ml-8">Who are you trying to reach and where are they?</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Target Audience</label>
              <textarea
                value={brief.targetAudience}
                onChange={(e) => updateBrief('targetAudience', e.target.value)}
                placeholder="e.g., Senior partners at mid-size law firms (10-50 lawyers) in Ontario who still use paper-based conveyancing processes"
                rows={3}
                className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none"
              />
              <p className="text-xs text-dd-gray italic mt-1">Think about job title, firm size, problems they face that your product solves.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dd-slate mb-2">Geography</label>
              <div className="grid grid-cols-2 gap-2">
                {geographyOptions.map(geo => (
                  <label key={geo} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={brief.geography.includes(geo)}
                      onChange={() => toggleGeography(geo)}
                      className="rounded border-dd-border text-dd-teal focus:ring-dd-teal"
                    />
                    {geo}
                  </label>
                ))}
              </div>
              <input
                type="text"
                value={brief.geographyDetail}
                onChange={(e) => updateBrief('geographyDetail', e.target.value)}
                placeholder="Specific regions, provinces, or cities..."
                className="w-full mt-2 rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              />
              <p className="text-xs text-dd-gray italic mt-1">Digital ads can target precisely by geography — even down to specific cities.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Product Area</label>
              <select
                value={brief.productArea}
                onChange={(e) => updateBrief('productArea', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                <option value="">Select product area...</option>
                {productAreas.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-white text-dd-slate border border-dd-border rounded-lg hover:bg-dd-gray-light"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-dd-teal text-white rounded-lg hover:bg-dd-teal-light"
            >
              Next: Budget & Timing <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Budget & Timing */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-dd-teal text-white text-xs font-bold">3</div>
            <h2 className="text-lg font-semibold text-dd-navy">Budget & Timing</h2>
          </div>
          <p className="text-xs text-dd-gray mb-6 ml-8">When should this run and what can you spend?</p>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dd-slate mb-1">Start Date</label>
                <input
                  type="date"
                  value={brief.timeframeStart}
                  onChange={(e) => updateBrief('timeframeStart', e.target.value)}
                  className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dd-slate mb-1">End Date</label>
                <input
                  type="date"
                  value={brief.timeframeEnd}
                  onChange={(e) => updateBrief('timeframeEnd', e.target.value)}
                  className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Urgency</label>
              <select
                value={brief.urgency}
                onChange={(e) => updateBrief('urgency', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                {urgencyOptions.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <p className="text-xs text-dd-gray italic mt-1">Most campaigns need 2-4 weeks to set up and 2-4 weeks for algorithms to optimize. Rushing usually wastes money.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Budget Range (Media Spend)</label>
              <select
                value={brief.budgetRange}
                onChange={(e) => updateBrief('budgetRange', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                <option value="">Select budget range...</option>
                {budgetOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <p className="text-xs text-dd-gray italic mt-1">Media spend only — what you pay to ad platforms. Not your team&apos;s time or creative costs.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Currency</label>
              <select
                value={brief.currency}
                onChange={(e) => updateBrief('currency', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                <option value="CAD">CAD (Canadian Dollar)</option>
                <option value="GBP">GBP (British Pound)</option>
                <option value="AUD">AUD (Australian Dollar)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-white text-dd-slate border border-dd-border rounded-lg hover:bg-dd-gray-light"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-dd-teal text-white rounded-lg hover:bg-dd-teal-light"
            >
              Next: Goals <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Goals & Measurement */}
      {step === 4 && (
        <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-dd-teal text-white text-xs font-bold">4</div>
            <h2 className="text-lg font-semibold text-dd-navy">Goals & Measurement</h2>
          </div>
          <p className="text-xs text-dd-gray mb-6 ml-8">What messages matter and how will you measure success?</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Key Topics / Themes</label>
              <textarea
                value={brief.topicsThemes}
                onChange={(e) => updateBrief('topicsThemes', e.target.value)}
                placeholder="e.g., speed of transaction, regulatory compliance, cost savings vs. manual process"
                rows={2}
                className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none"
              />
              <p className="text-xs text-dd-gray italic mt-1">What 2-3 things must this campaign communicate?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dd-slate mb-2">Desired Outcomes / KPIs</label>
              <div className="grid grid-cols-2 gap-2">
                {outcomeOptions.map(outcome => (
                  <label key={outcome} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={brief.desiredOutcomes.includes(outcome)}
                      onChange={() => toggleOutcome(outcome)}
                      className="rounded border-dd-border text-dd-teal focus:ring-dd-teal"
                    />
                    {outcome}
                  </label>
                ))}
              </div>
              <p className="text-xs text-dd-gray italic mt-2">Pick your top 1-3. Fewer, clearer goals are better than measuring everything.</p>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-white text-dd-slate border border-dd-border rounded-lg hover:bg-dd-gray-light"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-dd-teal text-white rounded-lg hover:bg-dd-teal-light"
            >
              Next: Context <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Context & Constraints */}
      {step === 5 && (
        <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-dd-teal text-white text-xs font-bold">5</div>
            <h2 className="text-lg font-semibold text-dd-navy">Context & Constraints</h2>
          </div>
          <p className="text-xs text-dd-gray mb-6 ml-8">Optional but helpful — the more context, the better the plan.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Existing Assets</label>
              <textarea
                value={brief.existingAssets}
                onChange={(e) => updateBrief('existingAssets', e.target.value)}
                placeholder="e.g., We have a 2-page PDF brochure, a product demo video (90 seconds), and a landing page..."
                rows={2}
                className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none"
              />
              <p className="text-xs text-dd-gray italic mt-1">List anything you already have that could be used — saves time and budget.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Competitor Context</label>
              <textarea
                value={brief.competitorContext}
                onChange={(e) => updateBrief('competitorContext', e.target.value)}
                placeholder="Are competitors advertising in this space? Messaging you need to differentiate from?"
                rows={2}
                className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Past Campaign Learnings</label>
              <textarea
                value={brief.pastLearnings}
                onChange={(e) => updateBrief('pastLearnings', e.target.value)}
                placeholder="e.g., LinkedIn got lots of impressions but low CTR, Google Ads worked well for Ontario launch..."
                rows={2}
                className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Internal Constraints</label>
              <textarea
                value={brief.internalConstraints}
                onChange={(e) => updateBrief('internalConstraints', e.target.value)}
                placeholder="e.g., No video capability, legal review takes 2 weeks, one person available..."
                rows={2}
                className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Additional Context</label>
              <textarea
                value={brief.additionalContext}
                onChange={(e) => updateBrief('additionalContext', e.target.value)}
                placeholder="Industry events, regulatory changes, seasonal patterns, executive priorities..."
                rows={2}
                className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none"
              />
            </div>
          </div>

          {/* Summary before submit */}
          <div className="mt-6 p-4 bg-dd-gray-light rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-dd-teal" />
              <h3 className="text-sm font-semibold text-dd-slate">Brief Summary</h3>
            </div>
            <div className="text-xs text-dd-gray space-y-1">
              {brief.campaignName && <p><strong>Campaign:</strong> {brief.campaignName}</p>}
              {brief.objective && <p><strong>Objective:</strong> {brief.objective}</p>}
              {brief.geography.length > 0 && <p><strong>Geography:</strong> {brief.geography.join(', ')}</p>}
              {brief.budgetRange && <p><strong>Budget:</strong> {brief.budgetRange} ({brief.currency})</p>}
              <p><strong>Output:</strong> {outputMode === 'auto_generate' ? 'Auto-Generate Plan' : 'Generate Prompt to Copy'}</p>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-white text-dd-slate border border-dd-border rounded-lg hover:bg-dd-gray-light"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-dd-teal text-white rounded-lg hover:bg-dd-teal-light"
            >
              {outputMode === 'auto_generate' ? (
                <><Sparkles size={16} /> Generate Campaign Plan</>
              ) : (
                <><FileText size={16} /> Generate Prompt</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step Progress */}
      {entryPath && !showFollowUp && step >= 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3, 4, 5].map(s => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                s <= step ? 'bg-dd-teal' : 'bg-dd-border'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
