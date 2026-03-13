import { NextResponse } from 'next/server';
import { getClientSettings, saveClientSettings } from '@/lib/storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(getClientSettings(id));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const settings = { ...body, clientId: id };
  saveClientSettings(settings);
  return NextResponse.json({ success: true });
}
