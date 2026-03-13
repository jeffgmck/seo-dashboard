import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/storage';
import { AppSettings } from '@/lib/types';

export async function GET() {
  const settings = getSettings();
  // Mask API keys for security - only show last 4 chars
  return NextResponse.json({
    ...settings,
    openaiApiKey: settings.openaiApiKey ? `...${settings.openaiApiKey.slice(-4)}` : '',
    anthropicApiKey: settings.anthropicApiKey ? `...${settings.anthropicApiKey.slice(-4)}` : '',
    youtubeApiKey: settings.youtubeApiKey ? `...${settings.youtubeApiKey.slice(-4)}` : '',
  });
}

export async function PUT(request: Request) {
  const body = await request.json() as Partial<AppSettings>;
  const current = getSettings();

  // Only update keys that are provided and not masked
  const updated: AppSettings = {
    openaiApiKey: body.openaiApiKey && !body.openaiApiKey.startsWith('...')
      ? body.openaiApiKey : current.openaiApiKey,
    anthropicApiKey: body.anthropicApiKey && !body.anthropicApiKey.startsWith('...')
      ? body.anthropicApiKey : current.anthropicApiKey,
    youtubeApiKey: body.youtubeApiKey && !body.youtubeApiKey.startsWith('...')
      ? body.youtubeApiKey : current.youtubeApiKey,
    defaultModel: body.defaultModel || current.defaultModel,
  };

  saveSettings(updated);
  return NextResponse.json({ success: true });
}
