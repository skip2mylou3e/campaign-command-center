import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Quick Ask history is managed client-side in localStorage.',
    history: [],
  });
}
