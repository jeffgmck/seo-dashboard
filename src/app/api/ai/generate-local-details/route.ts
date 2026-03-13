import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/storage';

export async function POST(request: Request) {
  const { city, state, businessType } = await request.json();
  const settings = getSettings();

  if (!city || !state) {
    return NextResponse.json({ error: 'City and state are required' }, { status: 400 });
  }

  const prompt = `Research and provide detailed local information for ${city}, ${state} relevant to a ${businessType || 'local service'} business. Include:

1. Local housing stock (common building types, age of homes, common materials)
2. Building codes and regulations specific to the area
3. Climate and weather patterns (temperature extremes, precipitation, seasonal issues)
4. Common issues homeowners face in this area
5. Local neighborhoods and demographics
6. Any unique environmental factors (soil type, water quality, elevation, flood zones)

Write this as a reference document that can be used to inject local details into service pages. Be specific with neighborhood names, local landmarks, and real local knowledge.`;

  try {
    if (settings.defaultModel === 'anthropic' && settings.anthropicApiKey) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': settings.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ content: data.content[0].text });
      }
    }

    if (settings.openaiApiKey) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ content: data.choices[0].message.content });
      }
    }

    return NextResponse.json({ error: 'No AI API key configured' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
