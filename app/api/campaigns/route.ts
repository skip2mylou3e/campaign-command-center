import { NextResponse } from 'next/server';

// Campaigns are stored client-side in localStorage for now
// This route provides a REST interface for future database migration

export async function GET() {
  return NextResponse.json({
    message: 'Campaigns are managed client-side. Use the My Campaigns page to view.',
    campaigns: [],
  });
}
