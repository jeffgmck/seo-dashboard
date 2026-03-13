import { NextResponse } from 'next/server';
import { getClient, saveClient } from '@/lib/storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  return NextResponse.json(client);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  const body = await request.json();
  const updated = {
    ...client,
    name: body.name || client.name,
    businessName: body.businessName || client.businessName,
    updatedAt: new Date().toISOString(),
  };
  saveClient(updated);
  return NextResponse.json(updated);
}
