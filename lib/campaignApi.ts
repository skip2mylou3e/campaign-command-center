import { Campaign } from './types';

const OWNED_IDS_KEY = 'ccc_owned_campaign_ids';

// --- Ownership tracking (localStorage) ---

export function getOwnedCampaignIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(OWNED_IDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addOwnedCampaignId(id: string): void {
  const ids = getOwnedCampaignIds();
  if (!ids.includes(id)) {
    ids.unshift(id);
    localStorage.setItem(OWNED_IDS_KEY, JSON.stringify(ids));
  }
}

export function removeOwnedCampaignId(id: string): void {
  const ids = getOwnedCampaignIds().filter(i => i !== id);
  localStorage.setItem(OWNED_IDS_KEY, JSON.stringify(ids));
}

// --- KV API calls ---

export async function apiSaveCampaign(campaign: Campaign): Promise<Campaign> {
  const res = await fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaign),
  });
  if (!res.ok) throw new Error('Failed to save campaign');
  addOwnedCampaignId(campaign.id);
  const data = await res.json();
  return data.campaign;
}

export async function apiGetCampaign(id: string): Promise<Campaign | null> {
  const res = await fetch(`/api/campaigns/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch campaign');
  const data = await res.json();
  return data.campaign;
}

export async function apiGetOwnedCampaigns(): Promise<Campaign[]> {
  const ids = getOwnedCampaignIds();
  if (ids.length === 0) return [];
  const res = await fetch(`/api/campaigns?ids=${ids.join(',')}`);
  if (!res.ok) throw new Error('Failed to fetch campaigns');
  const data = await res.json();
  // Clean up stale ownership IDs (campaigns deleted from another device)
  const fetchedIds = new Set((data.campaigns as Campaign[]).map(c => c.id));
  const staleIds = ids.filter(id => !fetchedIds.has(id));
  staleIds.forEach(removeOwnedCampaignId);
  return data.campaigns;
}

export async function apiDeleteCampaign(id: string): Promise<void> {
  const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete campaign');
  removeOwnedCampaignId(id);
}

export async function apiUpdateCampaignStatus(
  id: string,
  status: Campaign['status']
): Promise<Campaign> {
  const res = await fetch(`/api/campaigns/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  const data = await res.json();
  return data.campaign;
}

export async function apiSaveRefinedCampaign(campaign: Campaign): Promise<Campaign> {
  const res = await fetch(`/api/campaigns/${campaign.id}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaign),
  });
  if (!res.ok) throw new Error('Failed to save refined campaign');
  const data = await res.json();
  return data.campaign;
}
