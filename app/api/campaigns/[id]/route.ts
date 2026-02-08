import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Campaign data is managed client-side in localStorage.',
  });
}
