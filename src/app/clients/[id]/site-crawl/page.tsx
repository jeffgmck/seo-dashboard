'use client';

import { useState, useEffect, use } from 'react';
import { CrawledPage, GBPService } from '@/lib/types';

export default function SiteCrawlPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [url, setUrl] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [progress, setProgress] = useState('');
  const [pages, setPages] = useState<CrawledPage[]>([]);
  const [services, setServices] = useState<GBPService[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<{ missingServices: string[]; missingCategories: string[] } | null>(null);
  const [runningGap, setRunningGap] = useState(false);

  useEffect(() => {
    // Load existing crawl data
    fetch(`/api/clients/${id}/site-crawl`).then(r => r.json()).then(data => {
      if (data?.pages) {
        setPages(data.pages);
        setUrl(data.url || '');
      }
    });
    // Load services
    fetch(`/api/clients/${id}/settings`).then(r => r.json()).then(data => {
      setServices(data.gbpServices || []);
      if (data.website) setUrl(data.website);
    });
    // Load gap analysis
    fetch(`/api/clients/${id}/gap-analysis`).then(r => r.json()).then(data => {
      if (data?.missingServices) setGapAnalysis(data);
    });
  }, [id]);

  async function startCrawl() {
    if (!url) return;
    setCrawling(true);
    setProgress('Starting crawl...');

    try {
      const res = await fetch(`/api/clients/${id}/site-crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
        setProgress(`Crawl complete - found ${data.pages?.length || 0} pages`);
      } else {
        setProgress('Crawl failed');
      }
    } catch {
      setProgress('Crawl failed');
    }
    setCrawling(false);
  }

  async function runGapAnalysis() {
    setRunningGap(true);
    try {
      const res = await fetch(`/api/clients/${id}/gap-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages, services }),
      });
      if (res.ok) {
        const data = await res.json();
        setGapAnalysis(data);
      }
    } catch {
      // fail silently
    }
    setRunningGap(false);
  }

  function updatePageAssignment(pageIndex: number, field: 'assignedService' | 'assignedCategory', value: string) {
    const updated = [...pages];
    updated[pageIndex] = { ...updated[pageIndex], [field]: value, manualOverride: true };
    setPages(updated);
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-2">Site Crawl & Analysis</h1>
      <p className="text-gray-400 mb-8">Crawl website, assign pages to services, and identify content gaps</p>

      {/* Crawl Input */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-4">Crawl Website</h2>
        <div className="flex gap-3">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={startCrawl}
            disabled={crawling || !url}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            {crawling ? 'Crawling...' : 'Start Crawl'}
          </button>
        </div>
        {progress && <p className="text-sm text-gray-400 mt-3">{progress}</p>}
      </div>

      {/* Crawled Pages */}
      {pages.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Crawled Pages ({pages.length})</h2>
            <button
              onClick={runGapAnalysis}
              disabled={runningGap}
              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              {runningGap ? 'Analyzing...' : 'Run Gap Analysis'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500">
                  <th className="text-left py-2 pr-4 font-medium">URL</th>
                  <th className="text-left py-2 pr-4 font-medium">Title</th>
                  <th className="text-left py-2 pr-4 font-medium">Words</th>
                  <th className="text-left py-2 pr-4 font-medium">Assigned Service</th>
                  <th className="text-left py-2 font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="py-2 pr-4">
                      <span className="text-blue-400 text-xs truncate block max-w-48" title={page.url}>
                        {page.url.replace(/^https?:\/\/[^/]+/, '')}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="text-gray-300 text-xs truncate block max-w-40">{page.title}</span>
                    </td>
                    <td className="py-2 pr-4 text-gray-400 text-xs">{page.wordCount}</td>
                    <td className="py-2 pr-4">
                      <select
                        value={page.assignedService}
                        onChange={e => updatePageAssignment(i, 'assignedService', e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300"
                      >
                        <option value="">Unassigned</option>
                        {services.map(s => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <span className="text-xs text-gray-500">{page.assignedCategory || '--'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gap Analysis Results */}
      {gapAnalysis && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Gap Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-red-400 mb-3">
                Missing Service Pages ({gapAnalysis.missingServices.length})
              </h3>
              {gapAnalysis.missingServices.length === 0 ? (
                <p className="text-xs text-gray-500">All services have pages</p>
              ) : (
                <ul className="space-y-1">
                  {gapAnalysis.missingServices.map((svc, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      {svc}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-400 mb-3">
                Missing Category Pages ({gapAnalysis.missingCategories.length})
              </h3>
              {gapAnalysis.missingCategories.length === 0 ? (
                <p className="text-xs text-gray-500">All categories have pages</p>
              ) : (
                <ul className="space-y-1">
                  {gapAnalysis.missingCategories.map((cat, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                      {cat}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
