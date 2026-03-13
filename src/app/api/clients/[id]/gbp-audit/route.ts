import { NextResponse } from 'next/server';
import { getSettings, getGBPAudit, saveGBPAudit, addActivityLog } from '@/lib/storage';
import { GBPAuditResult } from '@/lib/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(getGBPAudit(id));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { primaryCategory, secondaryCategories, services, city } = await request.json();
  const settings = getSettings();

  const prompt = `You are a local SEO expert. Analyze the following GBP (Google Business Profile) data for a ${primaryCategory} in ${city}.

Current secondary categories: ${secondaryCategories.join(', ') || 'None'}
Current services: ${services.join(', ') || 'None'}

Tasks:
1. Suggest 3-5 additional secondary GBP categories that competitors likely use. Only suggest real GBP categories.
2. For each service listed, determine if Google treats it as a distinct entity (meaning searching "[service] [city]" shows different map pack results than searching "[primary category] [city]") or if it overlaps with the primary category. Explain your reasoning.

Respond in this exact JSON format:
{
  "suggestedCategories": ["Category 1", "Category 2"],
  "entityAnalysis": [
    {
      "service": "Service Name",
      "isDistinctEntity": true,
      "overlapsWith": [],
      "recommendation": "Brief recommendation"
    }
  ]
}`;

  try {
    let content = '';

    if (settings.defaultModel === 'anthropic' && settings.anthropicApiKey) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': settings.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        content = data.content[0].text;
      }
    } else if (settings.openaiApiKey) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        content = data.choices[0].message.content;
      }
    } else {
      return NextResponse.json({ error: 'No AI API key configured' }, { status: 400 });
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const audit: GBPAuditResult = {
      clientId: id,
      primaryCategory,
      city,
      suggestedCategories: parsed.suggestedCategories || [],
      entityAnalysis: parsed.entityAnalysis || [],
      createdAt: new Date().toISOString(),
    };

    saveGBPAudit(audit);
    addActivityLog({
      action: 'GBP Audit Complete',
      details: `Found ${audit.suggestedCategories.length} suggested categories, analyzed ${audit.entityAnalysis.length} services`,
      clientId: id,
      status: 'success',
    });

    return NextResponse.json(audit);
  } catch (error) {
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 });
  }
}
