'use client';

import { useState, useEffect, use } from 'react';
import { ClientSettings, GBPAuditResult, EntityAnalysis } from '@/lib/types';

export default function GBPAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [clientSettings, setClientSettings] = useState<ClientSettings | null>(null);
  const [audit, setAudit] = useState<GBPAuditResult | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    fetch(`/api/clients/${id}/settings`).then(r => r.json()).then(data => {
      setClientSettings(data);
      setCity(data.city);
    });
    fetch(`/api/clients/${id}/gbp-audit`).then(r => r.json()).then(data => {
      if (data && data.clientId) setAudit(data);
    });
  }, [id]);

  async function runCategoryAudit() {
    if (!clientSettings?.gbpPrimaryCategory || !city) return;
    setRunning(true);
    setProgress('Analyzing GBP categories for ' + city + '...');

    try {
      const res = await fetch(`/api/clients/${id}/gbp-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryCategory: clientSettings.gbpPrimaryCategory,
          secondaryCategories: clientSettings.gbpSecondaryCategories,
          services: clientSettings.gbpServices.map(s => s.name),
          city,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAudit(data);
        setProgress('Audit complete');
      } else {
        setProgress('Audit failed - check API keys in Settings');
      }
    } catch {
      setProgress('Audit failed');
    }
    setRunning(false);
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-2">GBP Audit & Entity Research</h1>
      <p className="text-gray-400 mb-8">Audit categories and analyze service entity overlap</p>

      {/* Audit Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-4">Category Audit</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Primary GBP Category</label>
            <input
              value={clientSettings?.gbpPrimaryCategory || ''}
              readOnly
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Target City</label>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g., Houston"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={runCategoryAudit}
            disabled={running || !clientSettings?.gbpPrimaryCategory || !city}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {running ? 'Running Audit...' : 'Run Category Audit'}
          </button>
          {progress && <span className="text-sm text-gray-400">{progress}</span>}
        </div>
      </div>

      {/* Current Categories */}
      {clientSettings && clientSettings.gbpSecondaryCategories.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-white mb-4">Current Categories</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-sm">
              {clientSettings.gbpPrimaryCategory} (Primary)
            </span>
            {clientSettings.gbpSecondaryCategories.map((cat, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 border border-gray-700 text-sm">
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Audit Results */}
      {audit && (
        <>
          {audit.suggestedCategories.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-base font-semibold text-white mb-4">Suggested Additional Categories</h2>
              <div className="space-y-2">
                {audit.suggestedCategories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <span className="text-sm text-emerald-400">{cat}</span>
                    <span className="text-xs text-gray-500">Suggested</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {audit.entityAnalysis.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-4">Service Entity Overlap Analysis</h2>
              <p className="text-xs text-gray-500 mb-4">Determines if Google sees each service as a distinct entity or overlapping with the primary category.</p>
              <div className="space-y-3">
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
    <div className={`p-4 rounded-lg border ${
      entity.isDistinctEntity
        ? 'bg-emerald-600/10 border-emerald-500/30'
        : 'bg-yellow-600/10 border-yellow-500/30'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-white">{entity.service}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${
          entity.isDistinctEntity
            ? 'bg-emerald-600/20 text-emerald-400'
            : 'bg-yellow-600/20 text-yellow-400'
        }`}>
          {entity.isDistinctEntity ? 'Distinct Entity' : 'Overlapping'}
        </span>
      </div>
      {entity.overlapsWith.length > 0 && (
        <p className="text-xs text-gray-500">Overlaps with: {entity.overlapsWith.join(', ')}</p>
      )}
      <p className="text-xs text-gray-400 mt-1">{entity.recommendation}</p>
    </div>
  );
}
