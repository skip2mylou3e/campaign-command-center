import { NextResponse } from 'next/server';
import glossaryData from '@/data/glossary.json';

export async function GET() {
  return NextResponse.json(glossaryData);
}
