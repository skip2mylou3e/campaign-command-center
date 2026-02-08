import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({
    message: 'Campaigns are saved client-side in localStorage.',
    received: body,
  });
}
