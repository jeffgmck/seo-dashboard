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
          model: 'claude-sonnet-4-20250514',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      return NextResponse.json({ success: res.ok });
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
