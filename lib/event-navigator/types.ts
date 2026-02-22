// ============================================
// Event Navigator - Type Definitions
// ============================================

export type Country = 'Canada' | 'UK' | 'Australia' | 'N. America';
export type EventType = 'catalog' | 'intel';
export type TierLabel = 'Tier 1' | 'Tier 2' | 'Tier 3';
export type BudgetTier = 'low' | 'medium' | 'high' | 'premium';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type ThreatLevel = 'VERY HIGH' | 'HIGH' | 'MEDIUM-HIGH' | 'MEDIUM' | 'LOW-MEDIUM' | 'LOW';

// --- Scoring ---

export interface EventScores {
  core_fit: number;
  competitive: number;
  track_record: number;
  scale_relevance: number;
  timing: number;
}

export interface CriterionConfig {
  id: keyof EventScores;
  label: string;
  weight: number;
  description: string;
  anchors: {
    low: string;
    mid: string;
    high: string;
  };
}

export interface TierThresholds {
  tier1: number;
  tier2: number;
}

export interface TierDefinition {
  label: string;
  description: string;
  color: string;
}

export interface TierModelAssumptions {
  criteria: CriterionConfig[];
  thresholds: TierThresholds;
  tierDefinitions: {
    tier1: TierDefinition;
    tier2: TierDefinition;
    tier3: TierDefinition;
  };
}

// --- Event ---

export interface Event {
  id: string;
  country: Country;
  name: string;
  city: string;
  dates: string;
  month: number | null;
  quarter: Quarter | null;
  organizer: string;
  focus: string;
  audienceComposition: string;
  estimatedAttendees: string;
  attendeesNumeric: number;
  vendorOptions: string;
  estimatedCosts: string;
  relevantProducts: string[];
  thoughtLeadership: string;
  website: string;
  notes: string;
  type: EventType;
  scores: EventScores;

  // Derived (computed client-side)
  tierScore?: number;
  tier?: TierLabel;

  // Enrichment
  competitorsPresent: string[];
  competitorNotes: string;
}

// --- Computed Event (with tier score) ---

export interface ScoredEvent extends Event {
  tierScore: number;
  tier: TierLabel;
  percentScore: number;
}

// --- Competitor ---

export interface CompetitorEventPresence {
  eventId: string;
  role: string;
  confirmed: boolean;
  notes: string;
}

export interface CompetitorOwnedEvent {
  name: string;
  dates: string;
  description: string;
  counterStrategy: string;
}

export interface Competitor {
  name: string;
  type: string;
  markets: string[];
  threatLevel: ThreatLevel;
  description: string;
  knownEventPresence: CompetitorEventPresence[];
  ownedEvents: CompetitorOwnedEvent[];
}

// --- History ---

export interface HistoryEntry {
  id: string;
  eventId: string;
  eventName: string;
  country: string;
  dates: string;
  role: string;
  confirmed: boolean;
  details: string;
  teamMembers?: string[];
}

// --- Saved Plan ---

export interface SavedPlan {
  id: number;
  name: string;
  created: string;
  eventIds: string[];
  objective: string;
  params?: ObjectiveParams;
  assumptions: TierModelAssumptions;
}

// --- AI Recommendation ---

export interface AITimelineEntry {
  date: string;
  event: string;
  type: 'confirmed' | 'target' | 'deadline';
}

export interface AIRecommendation {
  eventId: string;
  matchScore: number;
  whyThisEvent: string;
  recommendedApproach: string[];
  productsToShowcase: string[];
  thoughtLeadershipAngle: string;
  competitorsToWatch: string[];
  timingNote: string | null;
  draftOutreachEmail?: string;
}

export interface AIResult {
  strategicBrief: string;
  keyInsight: string;
  competitiveAlert: string;
  timeline: AITimelineEntry[];
  recommendations: AIRecommendation[];
}

// --- Page State ---

export type Phase = 'objective' | 'analyzing' | 'results' | 'detail' | 'plan';

export interface ObjectiveParams {
  objective: string;
  markets: Country[];
  canadaProvinces: string[];
  products: string[];
  audiences: string[];
  timeframe: ('q1' | 'q2' | 'q3' | 'q4')[];
  budget: 'lean' | 'moderate' | 'premium';
  participation: string[];
}

export interface EventNavigatorState {
  phase: Phase;
  params: ObjectiveParams;
  selectedEventId: string | null;
  aiResult: AIResult | null;
  tierModel: TierModelAssumptions;
  lineupIds: Set<string>;
  showTierPanel: boolean;
  showBrowsePanel: boolean;
}

// --- Strategic Context ---

export interface StrategicTheme {
  id: string;
  name: string;
  description: string;
  relevantEvents: string[];
  keyDeadlines: string[];
}

export interface TimingDeadline {
  name: string;
  date: string;
  impact: string;
  relatedEvents: string[];
}

export interface StrategicContext {
  themes: StrategicTheme[];
  deadlines: TimingDeadline[];
  counterProgramming: {
    threat: string;
    counterAt: string[];
  }[];
}
