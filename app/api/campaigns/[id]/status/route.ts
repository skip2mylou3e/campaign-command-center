import { NextRequest, NextResponse } from 'next/server';
import { kvUpdateCampaignStatus } from '@/lib/kv';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { status } = await request.json();
  const campaign = await kvUpdateCampaignStatus(params.id, status);
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }
  return NextResponse.json({ campaign });
}
