import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/storage';

export async function POST(request: Request) {
  const { provider } = await request.json();
  const settings = getSettings();

  try {
    if (provider === 'openai') {
      if (!settings.openaiApiKey) {
        return NextResponse.json({ success: false, error: 'No API key configured' });
      }
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${settings.openaiApiKey}` },
      });
      return NextResponse.json({ success: res.ok });
    }

    if (provider === 'anthropic') {
      if (!settings.anthropicApiKey) {
        return NextResponse.json({ success: false, error: 'No API key configured' });
      }
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': settings.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      // 200 = success, 401 = bad key, other errors may just be model access
      if (res.ok) return NextResponse.json({ success: true });
      const err = await res.json().catch(() => null);
      const status = res.status;
      if (status === 401) return NextResponse.json({ success: false, error: 'Invalid API key' });
      if (status === 403) return NextResponse.json({ success: false, error: 'API key lacks permission' });
      // 400/404 with valid auth means the key works but model may differ - still valid
      if (status === 400 || status === 404) return NextResponse.json({ success: true });
      return NextResponse.json({ success: false, error: err?.error?.message || `HTTP ${status}` });
    }

    if (provider === 'youtube') {
      if (!settings.youtubeApiKey) {
        return NextResponse.json({ success: false, error: 'No API key configured' });
      }
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&key=${settings.youtubeApiKey}`
      );
      // YouTube API returns 200 even with errors, but we check if the key is valid
      return NextResponse.json({ success: res.status !== 403 });
    }

    return NextResponse.json({ success: false, error: 'Unknown provider' });
  } catch {
    return NextResponse.json({ success: false, error: 'Connection failed' });
  }
}
