import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Refinement is handled by calling the generate endpoint with updated brief
  const body = await request.json();
  return NextResponse.json({
    message: 'Use /api/campaigns/generate with updated brief for refinement.',
    received: body,
  });
}
