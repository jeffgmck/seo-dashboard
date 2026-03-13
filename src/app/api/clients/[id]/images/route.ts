import { NextResponse } from 'next/server';
import { getSettings, addActivityLog } from '@/lib/storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { prompt, style } = await request.json();
  const settings = getSettings();

  if (!settings.openaiApiKey) {
    return NextResponse.json({ error: 'OpenAI API key required for image generation' }, { status: 400 });
  }

  try {
    const fullPrompt = `${style}: ${prompt}. High quality, suitable for professional website.`;
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.error?.message || 'Image generation failed' }, { status: 500 });
    }

    const data = await res.json();
    const imageUrl = data.data[0]?.url;

    addActivityLog({
      action: 'Image Generated',
      details: `DALL-E: "${prompt.substring(0, 50)}..."`,
      clientId: id,
      status: 'success',
    });

    return NextResponse.json({
      url: imageUrl,
      prompt: fullPrompt,
      createdAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
