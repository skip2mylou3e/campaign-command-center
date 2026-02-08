'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Campaign } from '@/lib/types';
import { getCampaign, saveCampaign } from '@/lib/storage';
import CopyButton from '@/components/common/CopyButton';
import {
  Download, ArrowLeft, Send,
  ChevronDown, ChevronUp, Star, TrendingUp, Users, Palette,
  DollarSign, Calendar, BarChart3, AlertTriangle, CheckCircle, Zap,
  Shield, Globe
} from 'lucide-react';

const tabs = [
  { id: 'summary', label: 'Executive Summary', icon: Star },
  { id: 'channels', label: 'Channel Strategy', icon: TrendingUp },
  { id: 'audience', label: 'Audience', icon: Users },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'measurement', label: 'Measurement', icon: BarChart3 },
  { id: 'risks', label: 'Risks', icon: AlertTriangle },
  { id: 'readiness', label: 'Readiness', icon: CheckCircle },
  { id: 'quickstart', label: 'Quick Start', icon: Zap },
];

export default function PlanViewPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isPdfExporting, setIsPdfExporting] = useState(false);

  useEffect(() => {
    const c = getCampaign(params.id as string);
    if (c) setCampaign(c);
  }, [params.id]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRefine = async () => {
    if (!refinementInput.trim() || !campaign?.plan) return;
    setIsRefining(true);

    try {
      const response = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: {
            ...campaign.brief,
            additionalContext: `${campaign.brief.additionalContext || ''}\n\nREFINEMENT REQUEST: ${refinementInput}`,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to refine');
      const data = await response.json();

      const updated = { ...campaign, plan: data.plan, updatedAt: new Date().toISOString() };
      saveCampaign(updated);
      setCampaign(updated);
      setRefinementInput('');
    } catch {
      alert('Failed to refine plan. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleExportPDF = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    setIsPdfExporting(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const element = document.getElementById('plan-content');
    if (!element) {
      setIsPdfExporting(false);
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const headerHeight = 18;
      const footerHeight = 10;
      const contentWidthMm = pdfWidth - margin * 2;
      const canvasScale = 2;
      const titleBlockMm = 14; // space reserved for native PDF title

      const addHeader = () => {
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text('Campaign Command Center — Dye & Durham', margin, margin);
        pdf.text(campaign?.name || 'Campaign Plan', pdfWidth - margin, margin, { align: 'right' });
        pdf.setDrawColor(0, 165, 181);
        pdf.line(margin, margin + 4, pdfWidth - margin, margin + 4);
      };

      const tabSections = Array.from(element.querySelectorAll(':scope > div'));
      let isFirstPage = true;

      for (const section of tabSections) {
        const sectionEl = section as HTMLElement;

        // Extract the h1 title text, then hide it so html2canvas skips it
        const titleEl = sectionEl.querySelector('h1');
        const titleText = titleEl?.textContent || '';
        if (titleEl) titleEl.style.display = 'none';
        await new Promise(resolve => setTimeout(resolve, 50));

        // Capture section content (without h1)
        const canvas = await html2canvas(sectionEl, {
          scale: canvasScale,
          useCORS: true,
          scrollY: -window.scrollY,
        });

        // Calculate break points while h1 is still hidden (layout matches canvas)
        const sectionRect = sectionEl.getBoundingClientRect();
        const breakPointsPx = new Set<number>();
        breakPointsPx.add(0);
        Array.from(sectionEl.children).forEach(child => {
          if (child !== titleEl) {
            const childRect = child.getBoundingClientRect();
            breakPointsPx.add(Math.round((childRect.top - sectionRect.top) * canvasScale));
          }
        });
        breakPointsPx.add(canvas.height);
        const sortedBreaks = Array.from(breakPointsPx).sort((a, b) => a - b);

        // Restore h1
        if (titleEl) titleEl.style.display = '';

        const pxPerMm = canvas.width / contentWidthMm;
        let pageStart = 0;
        let isFirstPageOfSection = true;

        while (pageStart < canvas.height) {
          if (!isFirstPage) pdf.addPage();
          isFirstPage = false;

          addHeader();

          // On the first page of each tab, draw the title as native PDF text
          let contentTopMm = headerHeight;
          if (isFirstPageOfSection && titleText) {
            pdf.setFontSize(16);
            pdf.setTextColor(30, 41, 59);
            pdf.setFont('helvetica', 'bold');
            pdf.text(titleText, margin, contentTopMm + 6);
            pdf.setFont('helvetica', 'normal');
            contentTopMm += titleBlockMm;
          }
          isFirstPageOfSection = false;

          const availableHeightPx = (pdfHeight - contentTopMm - footerHeight) * pxPerMm;
          const maxEnd = pageStart + availableHeightPx;
          let pageEnd: number;

          if (maxEnd >= canvas.height) {
            pageEnd = canvas.height;
          } else {
            let bestBreak = pageStart;
            for (const bp of sortedBreaks) {
              if (bp > pageStart && bp <= maxEnd) bestBreak = bp;
            }
            pageEnd = bestBreak > pageStart ? bestBreak : Math.min(maxEnd, canvas.height);
          }

          const sliceHeight = pageEnd - pageStart;
          if (sliceHeight > 0) {
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = Math.ceil(sliceHeight);
            const ctx = sliceCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(canvas, 0, pageStart, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
              const sliceImg = sliceCanvas.toDataURL('image/png');
              const sliceHeightMm = sliceHeight / pxPerMm;
              pdf.addImage(sliceImg, 'PNG', margin, contentTopMm, contentWidthMm, sliceHeightMm);
            }
          }

          pageStart = pageEnd;
        }
      }

      // Add page numbers
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`${campaign?.name || 'Campaign Plan'} — Page ${i} of ${totalPages}`, margin, pdfHeight - 5);
      }

      pdf.save(`${campaign?.name || 'campaign-plan'}.pdf`);
    } finally {
      setIsPdfExporting(false);
    }
  };

  if (!campaign) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-dd-gray">Campaign not found.</p>
      </div>
    );
  }

  if (!campaign.plan) {
    return (
      <div className="p-6">
        <p className="text-dd-gray">No plan generated yet.</p>
        <button onClick={() => router.push('/plan')} className="mt-4 text-dd-teal hover:underline">
          Go to Plan Builder
        </button>
      </div>
    );
  }

  const plan = campaign.plan;

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Mobile header */}
      <div className="md:hidden bg-white border-b border-dd-border px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.push('/campaigns')}
            className="flex items-center gap-1 text-sm text-dd-gray hover:text-dd-teal"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isPdfExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-dd-navy text-white rounded-lg disabled:opacity-50"
          >
            <Download size={12} /> {isPdfExporting ? 'Generating...' : 'PDF'}
          </button>
        </div>
        <h2 className="font-semibold text-dd-slate text-sm truncate">{campaign.name}</h2>
      </div>

      {/* Mobile horizontal tab bar */}
      <div className="md:hidden bg-white border-b border-dd-border overflow-x-auto">
        <div className="flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs whitespace-nowrap shrink-0 transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-dd-teal border-dd-teal bg-dd-teal/5'
                    : 'text-dd-gray border-transparent'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop tab sidebar */}
      <div className="hidden md:flex md:flex-col w-56 bg-white border-r border-dd-border shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-dd-border">
          <button
            onClick={() => router.push('/campaigns')}
            className="flex items-center gap-1 text-sm text-dd-gray hover:text-dd-teal mb-3"
          >
            <ArrowLeft size={14} /> My Campaigns
          </button>
          <h2 className="font-semibold text-dd-slate text-sm truncate">{campaign.name}</h2>
          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
            campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {campaign.status}
          </span>
        </div>
        <nav className="py-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-all ${
                  activeTab === tab.id
                    ? 'text-dd-teal border-l-2 border-dd-teal bg-dd-teal/5'
                    : 'text-dd-gray hover:text-dd-slate border-l-2 border-transparent'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-dd-border space-y-2">
          <button
            onClick={handleExportPDF}
            disabled={isPdfExporting}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-dd-navy text-white rounded-lg hover:bg-dd-navy-light disabled:opacity-50"
          >
            <Download size={14} /> {isPdfExporting ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div id="plan-content" className={`p-4 md:p-6 max-w-4xl ${isPdfExporting ? 'space-y-12' : ''}`}>
          {/* Executive Summary */}
          {(activeTab === 'summary' || isPdfExporting) && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-dd-slate">Executive Summary</h1>

              <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6">
                <div className="prose prose-sm max-w-none text-dd-slate whitespace-pre-wrap">
                  {plan.executive_summary.overview}
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <div className="text-xs text-dd-gray mb-1">Brief Quality</div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className={i < plan.executive_summary.brief_quality_score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-xs text-dd-gray mt-2">{plan.executive_summary.brief_quality_detail}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <div className="text-xs text-dd-gray mb-1">Confidence Level</div>
                  <div className={`text-lg font-bold ${
                    plan.executive_summary.confidence_level === 'high' ? 'text-green-600' :
                    plan.executive_summary.confidence_level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {plan.executive_summary.confidence_level?.charAt(0).toUpperCase() + plan.executive_summary.confidence_level?.slice(1)}
                  </div>
                  <p className="text-xs text-dd-gray mt-1">{plan.executive_summary.confidence_explanation}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <div className="text-xs text-dd-gray mb-1">Estimated Investment</div>
                  <div className="text-lg font-bold text-dd-teal">{plan.executive_summary.total_estimated_investment}</div>
                  <p className="text-xs text-dd-gray mt-1">{plan.executive_summary.benchmarks_source}</p>
                </div>
              </div>

              {/* Plain English bullets */}
              {plan.executive_summary.plain_english_bullets?.length > 0 && (
                <div className="bg-dd-gray-light rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-dd-navy mb-2">In Plain English</h3>
                  <ul className="space-y-2">
                    {plan.executive_summary.plain_english_bullets.map((bullet, i) => (
                      <li key={i} className="text-sm text-dd-slate flex gap-2">
                        <span className="text-dd-teal mt-0.5">&#8226;</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Channel Strategy */}
          {(activeTab === 'channels' || isPdfExporting) && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-dd-slate">Channel Strategy</h1>
              {plan.channel_mix?.map((channel, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-dd-border">
                  <button
                    onClick={() => toggleSection(`channel-${i}`)}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        channel.funnel_role === 'awareness' ? 'bg-blue-100 text-blue-600' :
                        channel.funnel_role === 'consideration' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <TrendingUp size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-dd-slate">{channel.channel}</div>
                        <div className="text-xs text-dd-gray">{channel.funnel_role} | {channel.budget_range} | DIY: {channel.diy_difficulty}</div>
                      </div>
                    </div>
                    {expandedSections[`channel-${i}`] ? <ChevronUp size={18} className="text-dd-gray" /> : <ChevronDown size={18} className="text-dd-gray" />}
                  </button>

                  {(expandedSections[`channel-${i}`] || isPdfExporting) && (
                    <div className="px-4 pb-4 space-y-4 border-t border-dd-border pt-4">
                      <div>
                        <h4 className="text-sm font-semibold text-dd-navy mb-1">Why this channel</h4>
                        <p className="text-sm text-dd-slate">{channel.why_this_channel}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-dd-navy mb-1">Performance Benchmarks</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-dd-gray-light rounded p-2">
                            <div className="text-xs text-dd-gray">CPC</div>
                            <div className="text-sm font-semibold text-dd-slate">{channel.benchmarks?.cpc_range}</div>
                          </div>
                          <div className="bg-dd-gray-light rounded p-2">
                            <div className="text-xs text-dd-gray">CPM</div>
                            <div className="text-sm font-semibold text-dd-slate">{channel.benchmarks?.cpm_range}</div>
                          </div>
                          <div className="bg-dd-gray-light rounded p-2">
                            <div className="text-xs text-dd-gray">CTR</div>
                            <div className="text-sm font-semibold text-dd-slate">{channel.benchmarks?.ctr_range}</div>
                          </div>
                          <div className="bg-dd-gray-light rounded p-2">
                            <div className="text-xs text-dd-gray">Conv. Rate</div>
                            <div className="text-sm font-semibold text-dd-slate">{channel.benchmarks?.conversion_rate_range}</div>
                          </div>
                        </div>
                        {channel.benchmarks?.context && (
                          <p className="text-xs text-dd-gray mt-2 italic">{channel.benchmarks.context}</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-dd-navy">Targeting Parameters</h4>
                          <CopyButton text={channel.targeting_parameters} label="Copy" />
                        </div>
                        <pre className="text-xs bg-dd-gray-light rounded p-3 whitespace-pre-wrap font-mono overflow-x-auto">{channel.targeting_parameters}</pre>
                      </div>

                      {channel.example_ad_copy?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-dd-navy mb-2">Example Ad Copy</h4>
                          {channel.example_ad_copy.map((ad, j) => (
                            <div key={j} className="bg-dd-gray-light rounded p-3 mb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-semibold text-dd-slate">{ad.headline}</p>
                                  <p className="text-sm text-dd-gray mt-1">{ad.body}</p>
                                  <p className="text-xs text-dd-teal mt-1 font-medium">{ad.cta}</p>
                                </div>
                                <CopyButton text={`${ad.headline}\n${ad.body}\n${ad.cta}`} label="Copy" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {channel.utm_parameters && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-dd-navy">UTM Parameters</h4>
                            <CopyButton text={channel.utm_parameters} label="Copy" />
                          </div>
                          <pre className="text-xs bg-dd-gray-light rounded p-3 whitespace-pre-wrap font-mono">{channel.utm_parameters}</pre>
                        </div>
                      )}

                      {channel.setup_instructions?.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleSection(`setup-${i}`)}
                            className="flex items-center gap-1 text-sm font-semibold text-dd-teal hover:text-dd-teal-dark"
                          >
                            {expandedSections[`setup-${i}`] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            How to set this up
                          </button>
                          {(expandedSections[`setup-${i}`] || isPdfExporting) && (
                            <ol className="mt-2 space-y-2">
                              {channel.setup_instructions.map((step, k) => (
                                <li key={k} className="text-sm text-dd-slate flex gap-2">
                                  <span className="text-dd-teal font-semibold shrink-0">{k + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      )}

                      {channel.diy_difficulty_explanation && (
                        <div className="bg-yellow-50 rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              channel.diy_difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                              channel.diy_difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {channel.diy_difficulty?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-dd-gray">{channel.diy_difficulty_explanation}</p>
                          {channel.outsource_recommendation && (
                            <p className="text-xs text-dd-gray mt-2 italic">{channel.outsource_recommendation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Audience Strategy */}
          {(activeTab === 'audience' || isPdfExporting) && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-dd-slate">Audience Strategy</h1>

              {plan.audience_strategy?.segments?.map((seg, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${seg.priority === 'primary' ? 'bg-dd-teal/10 text-dd-teal' : 'bg-gray-100 text-gray-600'}`}>
                      {seg.priority}
                    </span>
                    <h3 className="font-semibold text-dd-slate">{seg.name}</h3>
                  </div>
                  <p className="text-sm text-dd-gray mb-3">{seg.description}</p>
                  <p className="text-xs text-dd-gray mb-3">Est. size: {seg.estimated_size}</p>

                  {Object.entries(seg.targeting_parameters_by_platform || {}).map(([platform, params]) => (
                    params && (
                      <div key={platform} className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-dd-navy uppercase">{platform}</span>
                          <CopyButton text={params} label="Copy" />
                        </div>
                        <pre className="text-xs bg-dd-gray-light rounded p-2 whitespace-pre-wrap font-mono">{params}</pre>
                      </div>
                    )
                  ))}
                </div>
              ))}

              {plan.audience_strategy?.retargeting_strategy && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-2">Retargeting Strategy</h3>
                  <p className="text-sm text-dd-slate whitespace-pre-wrap">{plan.audience_strategy.retargeting_strategy}</p>
                </div>
              )}

              {plan.audience_strategy?.lookalike_audiences && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-2">Lookalike Audiences</h3>
                  <p className="text-sm text-dd-slate whitespace-pre-wrap">{plan.audience_strategy.lookalike_audiences}</p>
                </div>
              )}

              {plan.audience_strategy?.negative_targeting && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-2">Negative Targeting (Exclusions)</h3>
                  <p className="text-sm text-dd-slate whitespace-pre-wrap">{plan.audience_strategy.negative_targeting}</p>
                </div>
              )}
            </div>
          )}

          {/* Creative */}
          {(activeTab === 'creative' || isPdfExporting) && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-dd-slate">Creative & Content</h1>

              {plan.creative_requirements?.assets_needed?.map((asset, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-dd-slate">{asset.channel} — {asset.format}</h3>
                      <p className="text-xs text-dd-gray">{asset.dimensions} | {asset.file_requirements}</p>
                    </div>
                    <span className="text-xs bg-dd-gray-light px-2 py-1 rounded">x{asset.quantity_recommended}</span>
                  </div>

                  {asset.example_headlines?.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-dd-navy mb-1">Headlines</h4>
                      {asset.example_headlines.map((h, j) => (
                        <div key={j} className="flex justify-between items-center bg-dd-gray-light rounded px-3 py-1.5 mb-1">
                          <span className="text-sm">{h}</span>
                          <CopyButton text={h} label="Copy" className="ml-2" />
                        </div>
                      ))}
                    </div>
                  )}

                  {asset.example_body_copy?.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-dd-navy mb-1">Body Copy</h4>
                      {asset.example_body_copy.map((b, j) => (
                        <div key={j} className="flex justify-between items-start bg-dd-gray-light rounded px-3 py-1.5 mb-1">
                          <span className="text-sm">{b}</span>
                          <CopyButton text={b} label="Copy" className="ml-2 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {asset.canva_search_term && (
                    <p className="text-xs text-dd-gray">Canva template: search &quot;{asset.canva_search_term}&quot;</p>
                  )}
                </div>
              ))}

              {/* UTM Parameters */}
              {plan.creative_requirements?.utm_parameters_all_channels?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-3">UTM Parameters</h3>
                  {plan.creative_requirements.utm_parameters_all_channels.map((utm, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-dd-slate">{utm.channel}</span>
                        <CopyButton text={utm.utm_string} label="Copy" />
                      </div>
                      <pre className="text-xs bg-dd-gray-light rounded p-2 font-mono break-all">{utm.utm_string}</pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Landing Page Checklist */}
              {plan.creative_requirements?.landing_page_checklist?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-3">Landing Page Checklist</h3>
                  <ul className="space-y-2">
                    {plan.creative_requirements.landing_page_checklist.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-dd-slate">
                        <input type="checkbox" className="mt-0.5 rounded border-dd-border text-dd-teal focus:ring-dd-teal" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Budget */}
          {(activeTab === 'budget' || isPdfExporting) && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-dd-slate">Budget & Resources</h1>

              <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6">
                <div className="text-center mb-6">
                  <div className="text-xs text-dd-gray mb-1">Total Recommended Budget</div>
                  <div className="text-3xl font-bold text-dd-teal">{plan.budget_and_resources?.total_recommended_budget}</div>
                  <div className="text-sm text-dd-gray">{plan.budget_and_resources?.currency} | {plan.budget_and_resources?.campaign_duration}</div>
                </div>

                {plan.budget_and_resources?.channel_breakdown?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-dd-navy mb-3">Channel Breakdown</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-dd-border">
                          <th className="text-left py-2 text-dd-gray font-medium">Channel</th>
                          <th className="text-right py-2 text-dd-gray font-medium">Amount</th>
                          <th className="text-right py-2 text-dd-gray font-medium">%</th>
                          <th className="text-left py-2 pl-4 text-dd-gray font-medium">Rationale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.budget_and_resources.channel_breakdown.map((row, i) => (
                          <tr key={i} className="border-b border-dd-border/50">
                            <td className="py-2 text-dd-slate font-medium">{row.channel}</td>
                            <td className="py-2 text-right text-dd-slate">{row.amount}</td>
                            <td className="py-2 text-right text-dd-gray">{row.percentage}%</td>
                            <td className="py-2 pl-4 text-dd-gray text-xs">{row.rationale}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Cost Comparison */}
              {plan.budget_and_resources?.cost_comparison && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-3">Cost Comparison</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center border-2 border-green-200">
                      <div className="text-xs text-green-600 font-semibold mb-1">Full DIY</div>
                      <div className="text-lg font-bold text-green-700">{plan.budget_and_resources.cost_comparison.diy_total}</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center border-2 border-yellow-200">
                      <div className="text-xs text-yellow-600 font-semibold mb-1">DIY + Freelancer</div>
                      <div className="text-lg font-bold text-yellow-700">{plan.budget_and_resources.cost_comparison.diy_with_freelancer_total}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center border-2 border-red-200">
                      <div className="text-xs text-red-600 font-semibold mb-1">Agency</div>
                      <div className="text-lg font-bold text-red-700">{plan.budget_and_resources.cost_comparison.agency_equivalent}</div>
                    </div>
                  </div>
                  <p className="text-sm text-dd-gray mt-3">{plan.budget_and_resources.cost_comparison.recommendation}</p>
                </div>
              )}

              {/* Labor Estimate */}
              {plan.budget_and_resources?.internal_labor_estimate && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-2">Internal Labor: {plan.budget_and_resources.internal_labor_estimate.hours_per_week}</h3>
                  <ul className="space-y-1 mb-3">
                    {plan.budget_and_resources.internal_labor_estimate.breakdown?.map((item, i) => (
                      <li key={i} className="text-sm text-dd-slate">{item}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-dd-gray italic">{plan.budget_and_resources.internal_labor_estimate.feasibility_note}</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          {(activeTab === 'timeline' || isPdfExporting) && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-dd-slate">Timeline & Execution</h1>
              <p className="text-sm text-dd-gray">Total duration: {plan.timeline?.total_duration}</p>

              {plan.timeline?.phases?.map((phase, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-dd-teal/10 flex items-center justify-center text-dd-teal font-bold text-sm">{i + 1}</div>
                    <div>
                      <h3 className="font-semibold text-dd-slate">{phase.name}</h3>
                      <p className="text-xs text-dd-gray">{phase.duration}</p>
                    </div>
                  </div>
                  <div className="space-y-2 ml-11">
                    {phase.tasks?.map((task, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm">
                        <input type="checkbox" className="mt-0.5 rounded border-dd-border text-dd-teal focus:ring-dd-teal" />
                        <div className="flex-1">
                          <span className="text-dd-slate">{task.task}</span>
                          <div className="flex gap-3 mt-0.5 text-xs text-dd-gray">
                            <span>Owner: {task.owner}</span>
                            <span>{task.effort_hours}</span>
                            {task.dependencies && <span>Depends on: {task.dependencies}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Milestones */}
              {plan.timeline?.key_milestones?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-3">Key Milestones</h3>
                  <div className="space-y-3">
                    {plan.timeline.key_milestones.map((ms, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="bg-dd-teal text-white text-xs px-2 py-1 rounded font-medium shrink-0">{ms.date_offset}</div>
                        <div>
                          <p className="text-sm font-medium text-dd-slate">{ms.milestone}</p>
                          <p className="text-xs text-dd-gray">{ms.why_it_matters}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Measurement */}
          {(activeTab === 'measurement' || isPdfExporting) && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-dd-slate">Measurement & Reporting</h1>

              {plan.measurement_framework?.kpis?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4 overflow-x-auto">
                  <h3 className="font-semibold text-dd-navy mb-3">KPIs</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-dd-border">
                        <th className="text-left py-2 text-dd-gray font-medium">Metric</th>
                        <th className="text-left py-2 text-dd-gray font-medium">Target</th>
                        <th className="text-left py-2 text-dd-gray font-medium">Channel</th>
                        <th className="text-left py-2 text-dd-gray font-medium">Good</th>
                        <th className="text-left py-2 text-dd-gray font-medium">Needs Attention</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.measurement_framework.kpis.map((kpi, i) => (
                        <tr key={i} className="border-b border-dd-border/50">
                          <td className="py-2 text-dd-slate font-medium">{kpi.metric}</td>
                          <td className="py-2 text-dd-teal font-semibold">{kpi.target}</td>
                          <td className="py-2 text-dd-gray">{kpi.channel}</td>
                          <td className="py-2 text-green-600 text-xs">{kpi.what_good_looks_like}</td>
                          <td className="py-2 text-red-600 text-xs">{kpi.what_needs_attention}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {plan.measurement_framework?.reporting_cadence && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-2">Reporting Cadence</h3>
                  <p className="text-sm text-dd-slate whitespace-pre-wrap">{plan.measurement_framework.reporting_cadence}</p>
                </div>
              )}

              {plan.measurement_framework?.attribution_model && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-2">Attribution Model</h3>
                  <p className="text-sm text-dd-slate whitespace-pre-wrap">{plan.measurement_framework.attribution_model}</p>
                </div>
              )}

              {plan.measurement_framework?.tracking_setup?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-3">Tracking Setup</h3>
                  <div className="space-y-3">
                    {plan.measurement_framework.tracking_setup.map((task, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5 rounded border-dd-border text-dd-teal focus:ring-dd-teal" />
                        <div>
                          <p className="text-sm font-medium text-dd-slate">{task.task}</p>
                          <p className="text-xs text-dd-gray mt-0.5">{task.instructions}</p>
                          <p className="text-xs text-dd-teal mt-0.5">Owner: {task.who}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Risks */}
          {(activeTab === 'risks' || isPdfExporting) && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-dd-slate">Risks & Considerations</h1>

              {plan.risks_and_considerations?.map((risk, i) => (
                <div key={i} className={`bg-white rounded-lg shadow-sm border-l-4 p-4 ${
                  risk.severity === 'high' ? 'border-red-400' :
                  risk.severity === 'medium' ? 'border-yellow-400' :
                  'border-blue-400'
                } border border-dd-border`}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={16} className={
                      risk.severity === 'high' ? 'text-red-500' :
                      risk.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    } />
                    <h3 className="font-semibold text-dd-slate text-sm">{risk.risk}</h3>
                  </div>
                  <p className="text-sm text-dd-gray ml-6">{risk.mitigation}</p>
                  <p className="text-xs text-dd-teal ml-6 mt-1">Owner: {risk.owner}</p>
                </div>
              ))}

              {plan.compliance_by_geography?.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-dd-navy mt-8">Compliance by Geography</h2>
                  {plan.compliance_by_geography.map((c, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe size={16} className="text-dd-teal" />
                        <h3 className="font-semibold text-dd-slate">{c.geography}</h3>
                      </div>
                      <p className="text-sm text-dd-gray mb-2">{c.regulations}</p>
                      <div className="bg-dd-gray-light rounded p-3">
                        <p className="text-sm text-dd-slate"><strong>Action Required:</strong> {c.action_required}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Readiness */}
          {(activeTab === 'readiness' || isPdfExporting) && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-dd-slate">Readiness Check</h1>

              {plan.readiness_check && (
                <div className={`p-4 rounded-lg font-semibold text-sm ${
                  plan.readiness_check.overall_readiness === 'ready_to_launch' ? 'bg-green-100 text-green-800' :
                  plan.readiness_check.overall_readiness === 'some_setup_needed' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {plan.readiness_check.overall_readiness === 'ready_to_launch' ? 'Ready to launch!' :
                   plan.readiness_check.overall_readiness === 'some_setup_needed' ? 'Some setup needed before launch' :
                   'Significant setup needed'}
                </div>
              )}

              {/* Blockers first */}
              {plan.readiness_check?.items?.filter(i => i.status === 'blocker').map((item, i) => (
                <ReadinessCard key={`b-${i}`} item={item} expanded={expandedSections} toggle={toggleSection} index={`blocker-${i}`} forceExpand={isPdfExporting} />
              ))}
              {plan.readiness_check?.items?.filter(i => i.status === 'needs_setup').map((item, i) => (
                <ReadinessCard key={`n-${i}`} item={item} expanded={expandedSections} toggle={toggleSection} index={`setup-${i}`} forceExpand={isPdfExporting} />
              ))}
              {plan.readiness_check?.items?.filter(i => i.status === 'ready').map((item, i) => (
                <ReadinessCard key={`r-${i}`} item={item} expanded={expandedSections} toggle={toggleSection} index={`ready-${i}`} forceExpand={isPdfExporting} />
              ))}
            </div>
          )}

          {/* Quick Start */}
          {(activeTab === 'quickstart' || isPdfExporting) && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-dd-slate">Quick-Start Priorities</h1>

              {plan.quick_start?.top_three_actions?.map((action, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-dd-teal text-white flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</div>
                    <div>
                      <h3 className="font-semibold text-dd-slate">{action.action}</h3>
                      <p className="text-sm text-dd-gray mt-1">{action.why}</p>
                      <div className="flex gap-4 mt-2 text-xs text-dd-gray">
                        <span>Effort: {action.effort}</span>
                        <span>Impact: {action.impact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {plan.quick_start?.minimum_viable_campaign && (
                <div className="bg-dd-teal/5 rounded-lg border-2 border-dd-teal/20 p-4">
                  <h3 className="font-semibold text-dd-navy mb-2">Minimum Viable Campaign</h3>
                  <p className="text-sm text-dd-slate mb-2">{plan.quick_start.minimum_viable_campaign.description}</p>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div><strong>Channel:</strong> {plan.quick_start.minimum_viable_campaign.channel}</div>
                    <div><strong>Budget:</strong> {plan.quick_start.minimum_viable_campaign.budget}</div>
                    <div><strong>Duration:</strong> {plan.quick_start.minimum_viable_campaign.duration}</div>
                  </div>
                  <p className="text-xs text-dd-gray mt-2">Expected: {plan.quick_start.minimum_viable_campaign.expected_outcome}</p>
                </div>
              )}

              {plan.quick_start?.half_budget_version && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-2">Half-Budget Version</h3>
                  <p className="text-sm text-dd-slate whitespace-pre-wrap">{plan.quick_start.half_budget_version}</p>
                </div>
              )}

              {plan.quick_start?.two_hours_per_week_version && (
                <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
                  <h3 className="font-semibold text-dd-navy mb-2">2 Hours Per Week Version</h3>
                  <p className="text-sm text-dd-slate whitespace-pre-wrap">{plan.quick_start.two_hours_per_week_version}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Refinement input */}
        <div className="sticky bottom-0 bg-white border-t border-dd-border p-4">
          <div className="max-w-4xl flex gap-3">
            <input
              type="text"
              value={refinementInput}
              onChange={(e) => setRefinementInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
              placeholder="Refine this plan... e.g., 'Remove Meta and put all budget into LinkedIn'"
              className="flex-1 rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              disabled={isRefining}
            />
            <button
              onClick={handleRefine}
              disabled={!refinementInput.trim() || isRefining}
              className="bg-dd-teal text-white px-4 py-2.5 rounded-lg hover:bg-dd-teal-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadinessCard({ item, expanded, toggle, index, forceExpand }: {
  item: { item: string; status: string; why_it_matters: string; how_to_do_it: string; estimated_time: string; who_does_it: string };
  expanded: Record<string, boolean>;
  toggle: (key: string) => void;
  index: string;
  forceExpand?: boolean;
}) {
  const statusIcon = item.status === 'ready' ? <CheckCircle size={18} className="text-green-500" /> :
    item.status === 'needs_setup' ? <AlertTriangle size={18} className="text-yellow-500" /> :
    <Shield size={18} className="text-red-500" />;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-dd-border p-4">
      <div className="flex items-start gap-3">
        {statusIcon}
        <div className="flex-1">
          <h3 className="font-semibold text-dd-slate text-sm">{item.item}</h3>
          <p className="text-xs text-dd-gray mt-1">{item.why_it_matters}</p>
          <div className="flex gap-3 mt-2 text-xs text-dd-gray">
            <span>Time: {item.estimated_time}</span>
            <span>Owner: {item.who_does_it}</span>
          </div>
          {item.how_to_do_it && (
            <>
              <button
                onClick={() => toggle(`readiness-${index}`)}
                className="flex items-center gap-1 text-xs text-dd-teal hover:text-dd-teal-dark mt-2 font-medium"
              >
                {expanded[`readiness-${index}`] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                How to do this
              </button>
              {(expanded[`readiness-${index}`] || forceExpand) && (
                <div className="mt-2 p-3 bg-dd-gray-light rounded text-sm text-dd-slate whitespace-pre-wrap">{item.how_to_do_it}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
