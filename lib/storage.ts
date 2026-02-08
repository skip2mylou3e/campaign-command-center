// Local storage-based persistence layer
// This provides a working app without requiring a database connection.
// Can be replaced with Drizzle + Postgres when DATABASE_URL is configured.

import { Campaign, QuickAskMessage, TeamConfig } from './types';

const CAMPAIGNS_KEY = 'ccc_campaigns';
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

// Campaign operations
export function getCampaigns(): Campaign[] {
  return getFromStorage<Campaign[]>(CAMPAIGNS_KEY, []);
}

export function getCampaign(id: string): Campaign | undefined {
  return getCampaigns().find(c => c.id === id);
}

export function saveCampaign(campaign: Campaign): Campaign {
  const campaigns = getCampaigns();
  const idx = campaigns.findIndex(c => c.id === campaign.id);
  if (idx >= 0) {
    campaigns[idx] = { ...campaign, updatedAt: new Date().toISOString() };
  } else {
    campaigns.unshift(campaign);
  }
  setToStorage(CAMPAIGNS_KEY, campaigns);
  return campaign;
}

export function updateCampaignStatus(id: string, status: Campaign['status']): Campaign | undefined {
  const campaigns = getCampaigns();
  const campaign = campaigns.find(c => c.id === id);
  if (campaign) {
    campaign.status = status;
    campaign.updatedAt = new Date().toISOString();
    setToStorage(CAMPAIGNS_KEY, campaigns);
  }
  return campaign;
}

export function deleteCampaign(id: string): void {
  const campaigns = getCampaigns().filter(c => c.id !== id);
  setToStorage(CAMPAIGNS_KEY, campaigns);
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
