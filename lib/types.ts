export type DocumentType = 'brief' | 'research' | 'brand_guidelines' | 'competitive_analysis' | 'creative_assets' | 'past_campaign' | 'other';

export interface UploadedDocument {
  id: string;
  name: string;
  filename: string;
  docType: DocumentType;
  content: string;
  charCount: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed' | 'archived' | 'prompt_generated';
  objective: string;
  brief: CampaignBrief;
  plan: CampaignPlan | null;
  generatedPrompt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignBrief {
  outputMode: 'auto_generate' | 'give_me_prompt';
  freeText?: string;
  campaignName: string;
  objective: string;
  objectiveDetail?: string;
  promoting: string;
  targetAudience: string;
  geography: string[];
  geographyDetail?: string;
  productArea: string;
  timeframeStart?: string;
  timeframeEnd?: string;
  urgency: string;
  budgetRange: string;
  currency: string;
  topicsThemes: string;
  desiredOutcomes: string[];
  existingAssets?: string;
  competitorContext?: string;
  pastLearnings?: string;
  internalConstraints?: string;
  additionalContext?: string;
  uploadedDocuments?: UploadedDocument[];
}

export interface CampaignPlan {
  executive_summary: {
    overview: string;
    plain_english_bullets: string[];
    brief_quality_score: number;
    brief_quality_detail: string;
    confidence_level: 'high' | 'medium' | 'low';
    confidence_explanation: string;
    total_estimated_investment: string;
    benchmarks_source: string;
  };
  channel_mix: ChannelRecommendation[];
  audience_strategy: {
    segments: AudienceSegment[];
    retargeting_strategy: string;
    lookalike_audiences: string;
    negative_targeting: string;
  };
  creative_requirements: {
    assets_needed: CreativeAsset[];
    messaging_angles: MessagingAngle[];
    landing_page_checklist: string[];
    utm_parameters_all_channels: UTMParam[];
    ab_testing_plan: ABTest[];
  };
  budget_and_resources: {
    total_recommended_budget: string;
    currency: string;
    channel_breakdown: BudgetBreakdown[];
    learning_phase_budget: string;
    campaign_duration: string;
    internal_labor_estimate: {
      hours_per_week: string;
      breakdown: string[];
      feasibility_note: string;
    };
    tools_needed: ToolNeeded[];
    cost_comparison: {
      diy_total: string;
      diy_with_freelancer_total: string;
      agency_equivalent: string;
      recommendation: string;
    };
    budget_not_sure_recommendation: string | null;
  };
  timeline: {
    total_duration: string;
    phases: TimelinePhase[];
    key_milestones: Milestone[];
  };
  measurement_framework: {
    kpis: KPI[];
    tracking_setup: TrackingTask[];
    hubspot_reporting_setup: string[];
    salesforce_pipeline_tracking: string | null;
    reporting_cadence: string;
    attribution_model: string;
  };
  risks_and_considerations: Risk[];
  compliance_by_geography: ComplianceItem[];
  readiness_check: {
    overall_readiness: 'ready_to_launch' | 'some_setup_needed' | 'significant_setup_needed';
    items: ReadinessItem[];
  };
  quick_start: {
    top_three_actions: QuickStartAction[];
    minimum_viable_campaign: {
      description: string;
      channel: string;
      budget: string;
      duration: string;
      expected_outcome: string;
    };
    half_budget_version: string;
    two_hours_per_week_version: string;
  };
}

export interface ChannelRecommendation {
  channel: string;
  platform: string;
  icon: string;
  why_this_channel: string;
  funnel_role: 'awareness' | 'consideration' | 'conversion';
  ad_formats: AdFormat[];
  budget_percentage: number;
  budget_range: string;
  benchmarks: {
    cpc_range: string;
    cpm_range: string;
    ctr_range: string;
    conversion_rate_range: string;
    context: string;
  };
  targeting_parameters: string;
  diy_difficulty: 'easy' | 'moderate' | 'advanced';
  diy_difficulty_explanation: string;
  outsource_recommendation: string | null;
  setup_instructions: string[];
  example_ad_copy: AdCopy[];
  utm_parameters: string;
}

export interface AdFormat {
  format_name: string;
  dimensions: string;
  file_requirements: string;
  character_limits: {
    headline: string;
    body: string;
    cta: string;
  };
}

export interface AdCopy {
  headline: string;
  body: string;
  cta: string;
}

export interface AudienceSegment {
  name: string;
  description: string;
  targeting_parameters_by_platform: {
    linkedin?: string | null;
    google?: string | null;
    meta?: string | null;
  };
  estimated_size: string;
  priority: 'primary' | 'secondary';
}

export interface CreativeAsset {
  channel: string;
  format: string;
  dimensions: string;
  file_requirements: string;
  quantity_recommended: number;
  example_headlines: string[];
  example_body_copy: string[];
  cta_text: string;
  canva_search_term: string;
  notes: string;
}

export interface MessagingAngle {
  angle: string;
  why: string;
  example: string;
}

export interface UTMParam {
  channel: string;
  utm_string: string;
}

export interface ABTest {
  test: string;
  why: string;
  how: string;
}

export interface BudgetBreakdown {
  channel: string;
  amount: string;
  percentage: number;
  rationale: string;
}

export interface ToolNeeded {
  tool: string;
  cost: string;
  why_needed: string;
  signup_url: string;
}

export interface TimelinePhase {
  name: string;
  duration: string;
  tasks: TimelineTask[];
}

export interface TimelineTask {
  task: string;
  owner: string;
  effort_hours: string;
  dependencies: string | null;
  how_to: string;
  platform_link: string | null;
}

export interface Milestone {
  milestone: string;
  date_offset: string;
  why_it_matters: string;
}

export interface KPI {
  metric: string;
  target: string;
  channel: string;
  measurement_method: string;
  what_good_looks_like: string;
  what_needs_attention: string;
}

export interface TrackingTask {
  task: string;
  instructions: string;
  who: string;
}

export interface Risk {
  risk: string;
  severity: 'high' | 'medium' | 'low';
  mitigation: string;
  owner: string;
}

export interface ComplianceItem {
  geography: string;
  regulations: string;
  action_required: string;
}

export interface ReadinessItem {
  item: string;
  status: 'ready' | 'needs_setup' | 'blocker';
  category: string;
  why_it_matters: string;
  how_to_do_it: string;
  estimated_time: string;
  who_does_it: string;
}

export interface QuickStartAction {
  action: string;
  why: string;
  effort: string;
  impact: string;
}

export interface TeamConfig {
  crmPlatform: string;
  hubspotTier: string;
  salesCrm: string;
  hubspotSalesforceSync: string;
  websitePlatform: string;
  analyticsPlatform: string;
  adAccountsActive: string[];
  creativeTools: string[];
  landingPageCapability: string;
  primaryBrandColors: string;
  brandToneOfVoice: string;
  defaultLegalReviewTime: string;
  teamSize: string;
  teamExperienceLevel: string;
  standardBudgetApproval: string;
}

export interface QuickAskMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  helpful?: boolean | null;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms: string[];
}
