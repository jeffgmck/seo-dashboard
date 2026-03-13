import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { siteUrl, username, appPassword } = await request.json();

  if (!siteUrl || !username || !appPassword) {
    return NextResponse.json({ success: false, error: 'Missing credentials' });
  }

  try {
    const url = `${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/me`;
    const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');
    const res = await fetch(url, {
      headers: { 'Authorization': `Basic ${auth}` },
    });

    if (res.ok) {
      const user = await res.json();
      return NextResponse.json({ success: true, user: user.name });
    }
    return NextResponse.json({ success: false, error: `HTTP ${res.status}` });
  } catch {
    return NextResponse.json({ success: false, error: 'Connection failed' });
  }
}
