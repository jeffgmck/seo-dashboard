import { NextResponse } from 'next/server';
import { getSettings, getClientSettings, saveGeneratedContent, addActivityLog } from '@/lib/storage';

async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const settings = getSettings();

  if (settings.defaultModel === 'anthropic' && settings.anthropicApiKey) {
    const messages = [{ role: 'user' as const, content: prompt }];
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': settings.anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt || '',
        messages,
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
    const data = await res.json();
    return data.content[0].text;
  }

  if (settings.openaiApiKey) {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 4000,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
  }

  throw new Error('No AI API key configured');
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { service, category, city, imagesPerPage, autoHumanize } = await request.json();
  const clientSettings = getClientSettings(id);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const targetKeyword = `${service} ${city}`;
        const systemPrompt = `You are an expert local SEO content writer. Write content for a ${clientSettings.gbpPrimaryCategory} business in ${city}.
Business: ${clientSettings.businessName}
Voice/Tone: ${clientSettings.voiceTone || 'Professional but conversational'}
Target Audience: ${clientSettings.targetAudience || 'Local homeowners'}
Words to use: ${clientSettings.wordsToUse.join(', ') || 'N/A'}
Words to avoid: ${clientSettings.wordsToAvoid.join(', ') || 'N/A'}
Local details: ${clientSettings.localDetails || 'N/A'}
Rating: ${clientSettings.averageRating} stars (${clientSettings.reviewCount} reviews)`;

        // Pass 1: Outline
        send({ pass: 0, log: 'Generating detailed outline...' });
        const outline = await callAI(
          `Create a detailed content outline for a service page targeting "${targetKeyword}".
Include: H1, H2 sections (at least 6), H3 subsections, FAQ section (5+ questions targeting AI overview snippets), and key points for each section.
Make it distinct from typical ranking content. Include local angles and real-world scenarios.
Category: ${category}
Target word count: 1500-2000 words`,
          systemPrompt
        );
        send({ pass: 0, log: 'Outline complete' });

        let content = '';

        if (autoHumanize) {
          // Pass 2: Section-by-section writing
          send({ pass: 1, log: 'Writing sections individually with varied tones...' });
          content = await callAI(
            `Using this outline, write the complete content. Write each H2 section in a slightly different conversational tone to mimic natural human writing variation. Target 1500-2000 words.

Outline:
${outline}

Write the full content now in HTML format with proper heading tags.`,
            systemPrompt
          );
          send({ pass: 1, log: 'Initial draft complete' });

          // Pass 3: Tonal consistency
          send({ pass: 2, log: 'Reviewing tonal consistency...' });
          content = await callAI(
            `Review this content for tonal consistency. Keep the slight variations between sections but smooth out any jarring transitions. Fix any sections that feel disconnected. Return the improved content.

${content}`,
            systemPrompt
          );
          send({ pass: 2, log: 'Tonal review complete' });

          // Pass 4: Burst analysis
          send({ pass: 3, log: 'Running burst analysis - varying sentence structure...' });
          content = await callAI(
            `Perform a "burst analysis" on this content. Vary sentence lengths dramatically - mix very short punchy sentences (3-5 words) with longer complex ones. Break up any patterns where consecutive sentences have similar structure. Remove any robotic rhythm. Return the improved content.

${content}`,
            systemPrompt
          );
          send({ pass: 3, log: 'Burst analysis complete' });

          // Pass 5: Perplexity injection
          send({ pass: 4, log: 'Injecting perplexity - replacing AI patterns...' });
          content = await callAI(
            `Replace predictable AI phrases with natural human alternatives throughout this content. Examples:
- "significant improvements" → "results that surprised even us"
- "it's important to note" → drop it entirely
- "comprehensive solution" → "the fix that actually works"
- "ensure optimal" → "get the best"
- "wide range of" → specific examples instead
Also remove any of these words: embark, navigate, unlock, unveil, leverage, comprehensive, crucial, delve, optimal, furthermore, moreover.
Return the improved content.

${content}`,
            systemPrompt
          );
          send({ pass: 4, log: 'Perplexity injection complete' });

          // Pass 6: Opening/closing rewrite
          send({ pass: 5, log: 'Rewriting opening and closing in conversational voice...' });
          content = await callAI(
            `Rewrite ONLY the opening paragraph and closing paragraph of this content in a highly conversational, opinionated human voice. Start with a relatable local scenario or common problem, not a generic intro. End with a strong, personal call to action. Keep everything in between the same. Return the full content.

${content}`,
            systemPrompt
          );
          send({ pass: 5, log: 'Opening/closing rewrite complete' });

          // Pass 7: Conversion optimization
          send({ pass: 6, log: 'Adding conversion elements...' });
          content = await callAI(
            `Add conversion optimization elements to this content:
- Natural CTAs throughout (not just at the end)
- Phone number mention: ${clientSettings.businessPhone || '[PHONE]'}
- Trust signals (years in business, reviews: ${clientSettings.averageRating} stars from ${clientSettings.reviewCount} reviews)
- "What makes ${clientSettings.businessName} worth calling" angle
- Address any objections a homeowner might have
Do NOT make it salesy. Keep it helpful and authoritative. Return the full content.

${content}`,
            systemPrompt
          );
          send({ pass: 6, log: 'Conversion optimization complete' });

          // Pass 8: Final review
          send({ pass: 7, log: 'Final review - smoothing transitions, fact-checking...' });
          content = await callAI(
            `Final review pass on this content:
1. Smooth any rough transitions between sections
2. Verify all CTAs are strong and natural
3. Check that the target keyword "${targetKeyword}" appears naturally 3-5 times
4. Ensure nothing is broken from previous editing passes
5. Verify heading hierarchy is correct (H1 > H2 > H3)
6. Make sure the content flows naturally from start to finish
Return the final polished content.

${content}`,
            systemPrompt
          );
          send({ pass: 7, log: 'Final review complete' });
        } else {
          // Single-pass generation
          send({ pass: 1, log: 'Generating content (single pass)...' });
          content = await callAI(
            `Write a complete service page for "${targetKeyword}" based on this outline. Target 1500-2000 words. Use HTML formatting.

${outline}`,
            systemPrompt
          );
        }

        // Generate schema markup
        send({ log: 'Generating schema markup...' });
        const schema = await callAI(
          `Generate JSON-LD schema markup for this service page. Include:
- LocalBusiness schema for ${clientSettings.businessName} at ${clientSettings.businessAddress}, ${city}, ${clientSettings.state} ${clientSettings.zip}
- Article schema
- FAQPage schema (extract FAQs from the content)
${clientSettings.averageRating ? `- AggregateRating: ${clientSettings.averageRating} stars, ${clientSettings.reviewCount} reviews` : ''}

Return ONLY the JSON-LD script tags, nothing else.

Content:
${content.substring(0, 2000)}...`
        );

        // Count words
        const wordCount = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;

        // Create title from H1 or service name
        const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
        const title = h1Match ? h1Match[1].replace(/<[^>]+>/g, '') : `${service} ${city}`;

        const generatedContent = {
          id: crypto.randomUUID(),
          clientId: id,
          service,
          category,
          targetKeyword,
          city,
          title,
          content,
          outline,
          schemaMarkup: schema,
          images: [] as { id: string; prompt: string; url: string; altText: string; createdAt: string }[],
          wordCount,
          status: (autoHumanize ? 'final' : 'draft') as 'final' | 'draft',
          passesCompleted: autoHumanize ? 8 : 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        saveGeneratedContent(generatedContent);
        addActivityLog({
          action: 'Content Generated',
          details: `"${title}" - ${wordCount} words, ${autoHumanize ? '8' : '1'} passes`,
          clientId: id,
          status: 'success',
        });

        send({ content: generatedContent });
      } catch (error) {
        send({ error: error instanceof Error ? error.message : 'Generation failed' });
      }

      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
