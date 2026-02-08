import { Redis } from '@upstash/redis';
import { Campaign } from './types';

// Lazy-init to avoid build-time errors when env vars aren't available
let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

export async function kvGetCampaign(id: string): Promise<Campaign | null> {
  return await getRedis().get<Campaign>(`campaign:${id}`);
}

export async function kvSaveCampaign(campaign: Campaign): Promise<void> {
  await getRedis().set(`campaign:${campaign.id}`, JSON.stringify(campaign));
  await getRedis().sadd('campaign_ids', campaign.id);
}

export async function kvDeleteCampaign(id: string): Promise<void> {
  await getRedis().del(`campaign:${id}`);
  await getRedis().srem('campaign_ids', id);
}

export async function kvGetCampaignsByIds(ids: string[]): Promise<Campaign[]> {
  if (ids.length === 0) return [];
  const pipeline = getRedis().pipeline();
  for (const id of ids) {
    pipeline.get(`campaign:${id}`);
  }
  const results = await pipeline.exec();
  return results.filter(Boolean) as Campaign[];
}

export async function kvUpdateCampaignStatus(
  id: string,
  status: Campaign['status']
): Promise<Campaign | null> {
  const campaign = await kvGetCampaign(id);
  if (!campaign) return null;
  campaign.status = status;
  campaign.updatedAt = new Date().toISOString();
  await getRedis().set(`campaign:${id}`, JSON.stringify(campaign));
  return campaign;
}
