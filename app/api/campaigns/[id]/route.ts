import { NextRequest, NextResponse } from 'next/server';
import { kvGetCampaign, kvDeleteCampaign } from '@/lib/kv';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const campaign = await kvGetCampaign(params.id);
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }
  return NextResponse.json({ campaign });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await kvDeleteCampaign(params.id);
  return NextResponse.json({ success: true });
}
