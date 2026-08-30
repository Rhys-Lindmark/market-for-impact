import { NextResponse } from 'next/server';
import snapshot from '@/data/san-francisco/candidate-universe-v1.json';

export async function GET() {
  return NextResponse.json(snapshot);
}
