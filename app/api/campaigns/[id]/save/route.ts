import { NextRequest, NextResponse } from 'next/server';
import { kvSaveCampaign } from '@/lib/kv';

export async function POST(request: NextRequest) {
  const campaign = await request.json();
  campaign.updatedAt = new Date().toISOString();
  await kvSaveCampaign(campaign);
  return NextResponse.json({ campaign });
}
