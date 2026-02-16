// ============================================
// Content Generator Engine - Type Definitions
// ============================================

export type ContentIntent = 'launch' | 'promote' | 'update' | 'communicate';

export type OutputCategory = 'linkedin_social' | 'email' | 'ads' | 'blog' | 'sales_internal' | 'website';

export type SupplementaryDocType =
  | 'messaging_framework'
  | 'pid'
  | 'competitor_analysis'
  | 'brand_guidelines'
  | 'customer_research'
  | 'previous_campaign'
  | 'gtm_plan'
  | 'sales_enablement'
  | 'website_copy'
  | 'industry_report'
  | 'internal_comms'
  | 'product_roadmap'
  | 'other';

export type ToneEmphasis = 'purposeful' | 'balanced' | 'energizer';

export type TargetAudience = 'existing_customers' | 'prospects' | 'trade_industry' | 'internal_colleagues';

// --- Data structures ---

export interface OutputType {
  id: string;
  label: string;
  category: OutputCategory;
  charLimit?: { min: number; max: number };
  wordLimit?: { min: number; max: number };
  formatNotes: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  fullName: string;
  category: string;
  subcategory: string | null;
  regions: string[];
  tagline?: string;
  keyBenefits?: string[];
  targetPersonas: string[];
  valueProposition: string;
  notes?: string;
}

export interface Persona {
  id: string;
  name: string;
  painPoints: string[];
  motivations: string[];
  language: string;
  decisionFactors: string[];
  contentAngle: string;
  regionalNote?: string;
}

export interface Region {
  id: string;
  name: string;
  spelling: string;
  legalContext: string;
  marketReferences: string;
  currency: string;
  keyProducts: string;
  compliance: string;
  competitorLandscape: string;
}

export interface SupplementaryDoc {
  id: string;
  name: string;
  typeLabel: SupplementaryDocType;
  content: string;
  filename?: string;
}

export interface SupplementaryDocTypeInfo {
  id: SupplementaryDocType;
  label: string;
  description: string;
  aiUsage: string;
}

// --- Input / Form State ---

export interface CGEInput {
  sourceContent: string;
  supplementaryDocs: SupplementaryDoc[];
  contentIntent: ContentIntent | null;
  targetAudience: TargetAudience[];
  selectedProducts: string[];
  selectedPersonas: string[];
  selectedRegions: string[];
  selectedOutputTypes: string[];
  toneEmphasis: ToneEmphasis;
  campaignContext: string;
  outputMode: 'generate' | 'export_prompt';
}

// --- Smart Defaults ---

export interface SmartDefaults {
  intent: ContentIntent;
  products: string[];
  personas: string[];
  regions: string[];
  category: string;
  confidence: {
    intent: 'high' | 'medium' | 'low';
    products: 'high' | 'medium' | 'low';
    personas: 'high' | 'medium' | 'low';
    regions: 'high' | 'medium' | 'low';
  };
}

// --- Generated Output ---

export interface GeneratedOutput {
  outputTypeId: string;
  outputTypeLabel: string;
  category: OutputCategory;
  content: string;
  reviewerNotes: string;
  guardrailWarnings: string[];
}

export interface ChannelGroupResult {
  channelGroup: OutputCategory;
  outputs: GeneratedOutput[];
  status: 'pending' | 'generating' | 'complete' | 'error';
  error?: string;
}

// --- Session ---

export interface CGESession {
  id: string;
  input: CGEInput;
  results: Record<string, ChannelGroupResult>;
  createdAt: string;
}

// --- Intent Configuration ---

export interface IntentConfig {
  id: ContentIntent;
  label: string;
  description: string;
  whenToUse: string;
  preSelectedOutputs: string[];
  suggestedDocs: Record<SupplementaryDocType, 'critical' | 'helpful' | null>;
  toneInfluence: {
    purposeful: 'HIGH' | 'MEDIUM' | 'LOW';
    changemaker: 'HIGH' | 'MEDIUM' | 'LOW';
    energizer: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  toneCharacter: string;
}
