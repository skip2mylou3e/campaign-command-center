// Local storage persistence for user preferences (team config, quick ask history).
// Campaign data is stored in Upstash Redis via API routes.

import { QuickAskMessage, TeamConfig } from './types';

const QUICK_ASK_KEY = 'ccc_quick_ask';
const CONFIG_KEY = 'ccc_team_config';

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Quick Ask operations
export function getQuickAskHistory(): QuickAskMessage[] {
  return getFromStorage<QuickAskMessage[]>(QUICK_ASK_KEY, []);
}

export function saveQuickAskMessage(message: QuickAskMessage): void {
  const history = getQuickAskHistory();
  history.push(message);
  setToStorage(QUICK_ASK_KEY, history);
}

export function clearQuickAskHistory(): void {
  setToStorage(QUICK_ASK_KEY, []);
}

// Team Configuration
export const DEFAULT_CONFIG: TeamConfig = {
  crmPlatform: 'HubSpot',
  hubspotTier: 'Professional',
  salesCrm: 'Salesforce',
  hubspotSalesforceSync: 'Active',
  websitePlatform: 'HubSpot CMS',
  analyticsPlatform: 'Google Analytics 4',
  adAccountsActive: [],
  creativeTools: ['Canva'],
  landingPageCapability: 'Can build in HubSpot',
  primaryBrandColors: '#0A1F3F, #00A5B5',
  brandToneOfVoice: 'Professional, trustworthy, clear. We speak to legal professionals as peers — knowledgeable but never condescending.',
  defaultLegalReviewTime: '2 weeks',
  teamSize: '2',
  teamExperienceLevel: 'Beginner',
  standardBudgetApproval: 'Manager approval required for spend over $5,000',
};

export function getTeamConfig(): TeamConfig {
  return getFromStorage<TeamConfig>(CONFIG_KEY, DEFAULT_CONFIG);
}

export function saveTeamConfig(config: TeamConfig): TeamConfig {
  setToStorage(CONFIG_KEY, config);
  return config;
}
