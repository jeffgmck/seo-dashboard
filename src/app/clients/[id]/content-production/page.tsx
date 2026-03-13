'use client';

import { useState, useEffect, use } from 'react';
import { ClientSettings, ContentPlanItem, GeneratedContent } from '@/lib/types';

const PASS_NAMES = [
  'Outline Generation',
  'Section-by-Section Writing',
  'Tonal Consistency Review',
  'Burst Analysis & Sentence Variation',
  'Perplexity Injection',
  'Opening/Closing Rewrite',
  'Conversion Optimization',
  'Final Review & Polish',
];

export default function ContentProductionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [clientSettings, setClientSettings] = useState<ClientSettings | null>(null);
  const [contentPlan, setContentPlan] = useState<ContentPlanItem[]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [city, setCity] = useState('');
  const [imagesPerPage, setImagesPerPage] = useState(4);
  const [videoEveryNth, setVideoEveryNth] = useState(0);
  const [autoHumanize, setAutoHumanize] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);
  const [approveOutlines, setApproveOutlines] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentPass, setCurrentPass] = useState(0);
  const [currentItem, setCurrentItem] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/clients/${id}/settings`).then(r => r.json()).then(data => {
      setClientSettings(data);
      setCity(data.city);
    });
    fetch(`/api/clients/${id}/gap-analysis`).then(r => r.json()).then(data => {
      if (data?.contentPlan) setContentPlan(data.contentPlan);
    });
    fetch(`/api/clients/${id}/content`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setGeneratedContent(data);
    });
  }, [id]);

  function toggleService(service: string) {
    const next = new Set(selectedServices);
    if (next.has(service)) next.delete(service);
    else next.add(service);
    setSelectedServices(next);
  }

  function selectAll() {
    setSelectedServices(new Set(contentPlan.map(p => p.service)));
  }

  function addLog(msg: string) {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  async function startGeneration() {
    if (selectedServices.size === 0 || !city) return;
    setGenerating(true);
    setLogs([]);
    addLog('Starting content generation pipeline...');

    const servicesToGenerate = Array.from(selectedServices);

    for (let i = 0; i < servicesToGenerate.length; i++) {
      const service = servicesToGenerate[i];
      const planItem = contentPlan.find(p => p.service === service);
      setCurrentItem(service);
      addLog(`\n--- Generating: ${service} (${i + 1}/${servicesToGenerate.length}) ---`);

      try {
        const res = await fetch(`/api/clients/${id}/content/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service,
            category: planItem?.category || '',
            city,
            imagesPerPage,
            autoHumanize,
            approveOutlines,
          }),
        });

        if (res.ok) {
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const text = decoder.decode(value);
              const lines = text.split('\n').filter(Boolean);
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.pass !== undefined) {
                      setCurrentPass(data.pass);
                      addLog(`Pass ${data.pass + 1}/8: ${PASS_NAMES[data.pass]}`);
                    }
                    if (data.log) addLog(data.log);
                    if (data.content) {
                      setGeneratedContent(prev => [...prev, data.content]);
                      addLog(`Content generated: ${data.content.title} (${data.content.wordCount} words)`);
                    }
                    if (data.error) addLog(`Error: ${data.error}`);
                  } catch {
                    // not JSON, just a log line
                    addLog(line.slice(6));
                  }
                }
              }
            }
          }
        } else {
          addLog(`Failed to generate content for ${service}`);
        }
      } catch {
        addLog(`Error generating content for ${service}`);
      }
    }

    setGenerating(false);
    setCurrentItem('');
    setCurrentPass(0);
    addLog('\nContent generation complete!');
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-2">Content Production</h1>
      <p className="text-gray-400 mb-8">Generate SEO content using the 8-pass humanization pipeline</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Selection */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Select Services</h2>
              <button onClick={selectAll} className="text-xs text-blue-400 hover:text-blue-300">Select All</button>
            </div>
            {contentPlan.length === 0 ? (
              <p className="text-sm text-gray-500">No content plan available. Run a gap analysis first from Site Crawl & Analysis.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {contentPlan.map((item, i) => (
                  <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedServices.has(item.service)}
                      onChange={() => toggleService(item.service)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-white">{item.service}</span>
                      <span className="text-xs text-gray-500 ml-2">{item.category}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      item.status === 'generated' ? 'bg-emerald-600/20 text-emerald-400' :
                      item.status === 'in_progress' ? 'bg-blue-600/20 text-blue-400' :
                      'bg-gray-800 text-gray-500'
                    }`}>
                      {item.status}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Generation Options</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target City</label>
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Images per Page</label>
                <input
                  type="number"
                  value={imagesPerPage}
                  onChange={e => setImagesPerPage(parseInt(e.target.value) || 0)}
                  min={0}
                  max={10}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Video every Nth item (0 = off)</label>
                <input
                  type="number"
                  value={videoEveryNth}
                  onChange={e => setVideoEveryNth(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={autoHumanize} onChange={e => setAutoHumanize(e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-blue-600" />
                <span className="text-sm text-gray-300">Auto-humanize (run all 8 passes)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={approveOutlines} onChange={e => setApproveOutlines(e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-blue-600" />
                <span className="text-sm text-gray-300">Approve outlines before full generation</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={autoPublish} onChange={e => setAutoPublish(e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-blue-600" />
                <span className="text-sm text-gray-300">Auto-publish to WordPress</span>
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={startGeneration}
            disabled={generating || selectedServices.size === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition-colors"
          >
            {generating
              ? `Generating: ${currentItem} (Pass ${currentPass + 1}/8 - ${PASS_NAMES[currentPass]})`
              : `Generate Content for ${selectedServices.size} Service${selectedServices.size !== 1 ? 's' : ''}`}
          </button>

          {/* Progress */}
          {generating && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex gap-1 mb-2">
                {PASS_NAMES.map((name, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      i < currentPass ? 'bg-emerald-500' :
                      i === currentPass ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-800'
                    }`}
                    title={name}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Pass {currentPass + 1} of 8: {PASS_NAMES[currentPass]}
              </p>
            </div>
          )}
        </div>

        {/* Right - Activity Log */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-fit max-h-[600px] overflow-y-auto">
          <h2 className="text-sm font-semibold text-white mb-3">Generation Log</h2>
          {logs.length === 0 ? (
            <p className="text-xs text-gray-500">Select services and click Generate to start.</p>
          ) : (
            <div className="space-y-1 font-mono">
              {logs.map((log, i) => (
                <p key={i} className="text-xs text-gray-400 break-words">{log}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Generated Content Preview */}
      {generatedContent.length > 0 && (
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Generated Content ({generatedContent.length})</h2>
          <div className="space-y-3">
            {generatedContent.map((content) => (
              <div key={content.id} className="p-4 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-white">{content.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    content.status === 'published' ? 'bg-emerald-600/20 text-emerald-400' :
                    content.status === 'final' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-gray-800 text-gray-500'
                  }`}>
                    {content.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {content.wordCount} words | {content.images.length} images | {content.passesCompleted}/8 passes
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
