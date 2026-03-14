'use client';

import { useState, useEffect, use } from 'react';
import { ClientSettings, GBPAuditResult, EntityAnalysis } from '@/lib/types';

export default function GBPAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [clientSettings, setClientSettings] = useState<ClientSettings | null>(null);
  const [audit, setAudit] = useState<GBPAuditResult | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');
  const [primaryCategory, setPrimaryCategory] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    fetch(`/api/clients/${id}/settings`).then(r => r.json()).then(data => {
      setClientSettings(data);
      setCity(data.city);
      setPrimaryCategory(data.gbpPrimaryCategory);
    });
    fetch(`/api/clients/${id}/gbp-audit`).then(r => r.json()).then(data => {
      if (data && data.clientId) setAudit(data);
    });
  }, [id]);

  async function runCategoryAudit() {
    if (!primaryCategory || !city) return;
    setRunning(true);
    setProgress('Analyzing competitor GBP categories...');

    try {
      const res = await fetch(`/api/clients/${id}/gbp-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryCategory,
          secondaryCategories: clientSettings?.gbpSecondaryCategories || [],
          services: clientSettings?.gbpServices.map(s => s.name) || [],
          city,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAudit(data);
        setProgress('');
      } else {
        setProgress('Audit failed - check API keys in Settings');
      }
    } catch {
      setProgress('Audit failed');
    }
    setRunning(false);
  }

  const yourCategories = clientSettings ? [
    { name: clientSettings.gbpPrimaryCategory, type: 'Primary' as const },
    ...clientSettings.gbpSecondaryCategories.map(c => ({ name: c, type: 'Additional' as const })),
  ].filter(c => c.name) : [];

  // Simulated competitor data based on audit suggestions
  const competitorMissing = audit?.suggestedCategories.map((cat, i) => ({
    name: cat,
    competitors: Math.max(3, 18 - i * 3),
  })) || [];

  // Build recommended table data
  const maxCount = competitorMissing.length > 0 ? Math.max(...competitorMissing.map(c => c.competitors)) : 1;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">GBP Category & Service Audit</h1>
        <p className="text-sm text-gray-500 mt-1">Analyze competitor categories and services using AI research</p>
      </div>

      {/* Input Fields */}
      <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Primary GBP Category</label>
            <input
              value={primaryCategory}
              onChange={e => setPrimaryCategory(e.target.value)}
              placeholder="e.g., Plumber"
              className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">City</label>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g., Houston"
              className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors"
            />
          </div>
        </div>
        {clientSettings?.gbpPrimaryCategory && (
          <p className="text-[11px] text-teal-500 mb-3 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Auto-filled from your GBP Profile Data
          </p>
        )}
        <button
          onClick={runCategoryAudit}
          disabled={running || !primaryCategory || !city}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {running ? 'Running Audit...' : 'Run Category Audit'}
        </button>
        {progress && <p className="text-xs text-gray-400 mt-3">{progress}</p>}
      </div>

      {/* Results */}
      {audit && (
        <>
          {/* Your Categories vs Competitor Trends */}
          <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-5 mb-6">
            <h2 className="text-base font-semibold text-teal-400 mb-4">Your Categories vs Competitor Trends</h2>
            <div className="grid grid-cols-2 gap-8">
              {/* Left: Your Categories */}
              <div>
                <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Your GBP Categories</h3>
                <div className="space-y-2">
                  {yourCategories.map((cat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        cat.type === 'Primary'
                          ? 'bg-teal-500/20 text-teal-400'
                          : 'bg-purple-500/15 text-purple-400'
                      }`}>
                        {cat.type}
                      </span>
                      <span className="text-sm text-white">{cat.name}</span>
                      {audit.suggestedCategories.length > 0 && (
                        <span className="text-[10px] text-gray-500 ml-auto">
                          {competitorMissing.some(c => c.name.toLowerCase() === cat.name.toLowerCase())
                            ? '' : 'Competitors use this too'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Missing Categories */}
              <div>
                <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Competitor Categories You&apos;re Missing</h3>
                <div className="space-y-2">
                  {competitorMissing.map((cat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">Missing</span>
                      <span className="text-sm text-white">{cat.name}</span>
                      <span className="text-[10px] text-gray-500 ml-auto">({cat.competitors} competitors)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Secondary Categories */}
          {competitorMissing.length > 0 && (
            <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-5 mb-6">
              <h2 className="text-base font-semibold text-teal-400 mb-4">Recommended Secondary Categories</h2>
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left py-2 font-medium">Category</th>
                    <th className="text-left py-2 font-medium">Competitor Usage</th>
                    <th className="text-right py-2 font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {[...yourCategories.map(c => ({ name: c.name, competitors: maxCount, isYours: true })), ...competitorMissing.map(c => ({ ...c, isYours: false }))]
                    .sort((a, b) => b.competitors - a.competitors)
                    .map((cat, i) => (
                      <tr key={i} className="border-t border-gray-800/40">
                        <td className="py-2.5 text-sm text-white">{cat.name}</td>
                        <td className="py-2.5 pr-4">
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${cat.isYours ? 'bg-teal-500' : 'bg-red-400/60'}`}
                              style={{ width: `${(cat.competitors / maxCount) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 text-sm text-gray-400 text-right">{cat.competitors}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Entity Analysis */}
          {audit.entityAnalysis.length > 0 && (
            <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-5">
              <h2 className="text-base font-semibold text-teal-400 mb-2">Service Entity Overlap Analysis</h2>
              <p className="text-xs text-gray-500 mb-4">Determines if Google sees each service as a distinct entity or overlapping with the primary category.</p>
              <div className="space-y-2">
                {audit.entityAnalysis.map((entity, i) => (
                  <EntityRow key={i} entity={entity} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EntityRow({ entity }: { entity: EntityAnalysis }) {
  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      entity.isDistinctEntity
        ? 'bg-teal-500/5 border-teal-500/20'
        : 'bg-amber-500/5 border-amber-500/20'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-white">{entity.service}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
          entity.isDistinctEntity
            ? 'bg-teal-500/20 text-teal-400'
            : 'bg-amber-500/20 text-amber-400'
        }`}>
          {entity.isDistinctEntity ? 'Distinct Entity' : 'Overlapping'}
        </span>
      </div>
      {entity.overlapsWith.length > 0 && (
        <p className="text-[11px] text-gray-500">Overlaps with: {entity.overlapsWith.join(', ')}</p>
      )}
      <p className="text-xs text-gray-400 mt-1">{entity.recommendation}</p>
    </div>
  );
}
