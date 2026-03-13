import { NextResponse } from 'next/server';
import { getClients, saveClient, deleteClient } from '@/lib/storage';
import { Client } from '@/lib/types';

export async function GET() {
  return NextResponse.json(getClients());
}

export async function POST(request: Request) {
  const body = await request.json();
  const client: Client = {
    id: crypto.randomUUID(),
    name: body.name,
    businessName: body.businessName || body.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveClient(client);
  return NextResponse.json(client, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  deleteClient(id);
  return NextResponse.json({ success: true });
}
