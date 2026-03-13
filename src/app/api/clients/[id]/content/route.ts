import { NextResponse } from 'next/server';
import { getGeneratedContent } from '@/lib/storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(getGeneratedContent(id));
}
