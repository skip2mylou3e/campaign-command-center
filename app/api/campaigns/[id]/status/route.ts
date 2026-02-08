import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({
    message: 'Campaign status is managed client-side in localStorage.',
    received: body,
  });
}
