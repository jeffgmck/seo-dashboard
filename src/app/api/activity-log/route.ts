import { NextResponse } from 'next/server';
import { getActivityLog, addActivityLog } from '@/lib/storage';

export async function GET() {
  return NextResponse.json(getActivityLog());
}

export async function POST(request: Request) {
  const body = await request.json();
  addActivityLog({
    action: body.action,
    details: body.details,
    clientId: body.clientId,
    status: body.status || 'info',
  });
  return NextResponse.json({ success: true });
}
