import { Campaign } from './types';
import { addOwnedCampaignId } from './campaignApi';

const MIGRATION_KEY = 'ccc_kv_migrated';
const OLD_CAMPAIGNS_KEY = 'ccc_campaigns';

export async function migrateLocalCampaigns(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(MIGRATION_KEY)) return;

  const stored = localStorage.getItem(OLD_CAMPAIGNS_KEY);
  if (!stored) {
    localStorage.setItem(MIGRATION_KEY, 'true');
    return;
  }

  try {
    const campaigns: Campaign[] = JSON.parse(stored);
    for (const campaign of campaigns) {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      });
      addOwnedCampaignId(campaign.id);
    }
    localStorage.setItem(MIGRATION_KEY, 'true');
  } catch (e) {
    console.error('Campaign migration failed:', e);
  }
}
