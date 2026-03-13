import { NextResponse } from 'next/server';
import { getCrawlResult, saveCrawlResult, addActivityLog, getClientSettings } from '@/lib/storage';
import { CrawlResult, CrawledPage } from '@/lib/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(getCrawlResult(id));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const baseUrl = url.replace(/\/$/, '');
    const pages: CrawledPage[] = [];
    const visited = new Set<string>();
    const toVisit = [baseUrl];
    const clientSettings = getClientSettings(id);
    const services = clientSettings.gbpServices.map(s => s.name.toLowerCase());
    const maxPages = 50;

    while (toVisit.length > 0 && pages.length < maxPages) {
      const currentUrl = toVisit.shift()!;
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      try {
        const res = await fetch(currentUrl, {
          headers: { 'User-Agent': 'SEODashboard/1.0' },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) continue;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) continue;

        const html = await res.text();

        // Parse title
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
        const title = titleMatch ? titleMatch[1].trim() : '';

        // Parse H1
        const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
        const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';

        // Parse meta description
        const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/is);
        const metaDescription = metaMatch ? metaMatch[1].trim() : '';

        // Word count (strip HTML)
        const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const wordCount = textContent.split(' ').filter(w => w.length > 0).length;

        // Find internal links
        const linkRegex = /href=["'](.*?)["']/gi;
        const internalLinks: string[] = [];
        let match;
        while ((match = linkRegex.exec(html)) !== null) {
          const href = match[1];
          if (href.startsWith('/') || href.startsWith(baseUrl)) {
            const fullUrl = href.startsWith('/') ? `${baseUrl}${href}` : href;
            const clean = fullUrl.split('#')[0].split('?')[0];
            if (!visited.has(clean) && clean.startsWith(baseUrl)) {
              internalLinks.push(clean);
              if (toVisit.length < 200) {
                toVisit.push(clean);
              }
            }
          }
        }

        // Auto-assign service based on title/h1 matching
        let assignedService = '';
        let assignedCategory = '';
        const titleLower = (title + ' ' + h1).toLowerCase();
        for (const svc of services) {
          if (titleLower.includes(svc)) {
            assignedService = clientSettings.gbpServices.find(s => s.name.toLowerCase() === svc)?.name || '';
            assignedCategory = clientSettings.gbpServices.find(s => s.name.toLowerCase() === svc)?.category || '';
            break;
          }
        }

        pages.push({
          url: currentUrl,
          title,
          h1,
          metaDescription,
          wordCount,
          assignedService,
          assignedCategory,
          manualOverride: false,
          internalLinks,
        });
      } catch {
        // Skip failed pages
        continue;
      }
    }

    const result: CrawlResult = {
      clientId: id,
      url: baseUrl,
      pages,
      crawledAt: new Date().toISOString(),
    };

    saveCrawlResult(result);
    addActivityLog({
      action: 'Site Crawl Complete',
      details: `Crawled ${pages.length} pages from ${baseUrl}`,
      clientId: id,
      status: 'success',
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Crawl failed' }, { status: 500 });
  }
}
