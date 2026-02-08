import { Redis } from '@upstash/redis';
import { Campaign } from './types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function kvGetCampaign(id: string): Promise<Campaign | null> {
  return await redis.get<Campaign>(`campaign:${id}`);
}

export async function kvSaveCampaign(campaign: Campaign): Promise<void> {
  await redis.set(`campaign:${campaign.id}`, JSON.stringify(campaign));
  await redis.sadd('campaign_ids', campaign.id);
}

export async function kvDeleteCampaign(id: string): Promise<void> {
  await redis.del(`campaign:${id}`);
  await redis.srem('campaign_ids', id);
}

export async function kvGetCampaignsByIds(ids: string[]): Promise<Campaign[]> {
  if (ids.length === 0) return [];
  const pipeline = redis.pipeline();
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
  await redis.set(`campaign:${id}`, JSON.stringify(campaign));
  return campaign;
}
