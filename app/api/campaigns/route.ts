import { NextRequest, NextResponse } from 'next/server';
import { kvSaveCampaign, kvGetCampaignsByIds } from '@/lib/kv';

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get('ids');
  if (!idsParam) return NextResponse.json({ campaigns: [] });
  const ids = idsParam.split(',').filter(Boolean);
  const campaigns = await kvGetCampaignsByIds(ids);
  return NextResponse.json({ campaigns });
}

export async function POST(request: NextRequest) {
  const campaign = await request.json();
  await kvSaveCampaign(campaign);
  return NextResponse.json({ campaign });
}
