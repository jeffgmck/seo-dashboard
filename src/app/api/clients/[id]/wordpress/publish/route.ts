import { NextResponse } from 'next/server';
import { getClientSettings, getContentById, saveGeneratedContent, addActivityLog } from '@/lib/storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { contentId } = await request.json();
  const clientSettings = getClientSettings(id);
  const content = getContentById(id, contentId);

  if (!content) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  if (!clientSettings.wpSiteUrl || !clientSettings.wpUsername || !clientSettings.wpAppPassword) {
    return NextResponse.json({ error: 'WordPress not configured' }, { status: 400 });
  }

  try {
    const url = `${clientSettings.wpSiteUrl.replace(/\/$/, '')}/wp-json/wp/v2/pages`;
    const auth = Buffer.from(`${clientSettings.wpUsername}:${clientSettings.wpAppPassword}`).toString('base64');

    // Build full HTML with schema
    const fullContent = `${content.content}\n\n${content.schemaMarkup || ''}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: content.title,
        content: fullContent,
        status: 'draft',
        slug: content.targetKeyword.toLowerCase().replace(/\s+/g, '-'),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
      return NextResponse.json({ error: err.message || 'WordPress publish failed' }, { status: 500 });
    }

    const wpData = await res.json();

    // Update content status
    const updated = {
      ...content,
      status: 'published' as const,
      wpPostId: wpData.id,
      wpUrl: wpData.link,
      updatedAt: new Date().toISOString(),
    };
    saveGeneratedContent(updated);

    addActivityLog({
      action: 'Content Published',
      details: `"${content.title}" published to WordPress as draft`,
      clientId: id,
      status: 'success',
    });

    return NextResponse.json({
      postId: wpData.id,
      url: wpData.link,
    });
  } catch {
    return NextResponse.json({ error: 'WordPress publish failed' }, { status: 500 });
  }
}
