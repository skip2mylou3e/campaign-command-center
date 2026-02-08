import { NextRequest, NextResponse } from 'next/server';

// Team config is stored client-side in localStorage for now
// This route provides a REST interface for future database migration

export async function GET() {
  return NextResponse.json({
    message: 'Team config is managed client-side. Use the Settings page to configure.',
  });
}

export async function PUT(request: NextRequest) {
  const config = await request.json();
  return NextResponse.json({ config, message: 'Config received. Currently managed client-side.' });
}
