'use client';

import { useState, useEffect, use } from 'react';
import { GeneratedContent } from '@/lib/types';

export default function ContentLibraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'final' | 'published'>('all');

  useEffect(() => {
    fetch(`/api/clients/${id}/content`).then(r => r.json()).then(data => {
      setContent(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="text-gray-400">Loading...</div>;

  const filtered = filter === 'all' ? content : content.filter(c => c.status === filter);
  const selected = selectedId ? content.find(c => c.id === selectedId) : null;

  const statusCounts = {
    all: content.length,
    draft: content.filter(c => c.status === 'draft').length,
    final: content.filter(c => c.status === 'final').length,
    published: content.filter(c => c.status === 'published').length,
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Content Library</h1>
        <p className="text-gray-400 mt-1">All generated content for this client</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase">Total Content</p>
          <p className="text-2xl font-bold text-white mt-1">{content.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase">Total Words</p>
          <p className="text-2xl font-bold text-white mt-1">{content.reduce((sum, c) => sum + c.wordCount, 0).toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase">Total Images</p>
          <p className="text-2xl font-bold text-white mt-1">{content.reduce((sum, c) => sum + c.images.length, 0)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase">Published</p>
          <p className="text-2xl font-bold text-white mt-1">{statusCounts.published}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-lg border border-gray-800">
        {(['all', 'draft', 'final', 'published'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === f ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({statusCounts[f]})
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Content List */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">No content yet. Generate content from the Content Production page.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    item.id === selectedId
                      ? 'border-blue-500/50 bg-gray-900'
                      : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded shrink-0 ml-2 ${
                      item.status === 'published' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' :
                      item.status === 'final' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' :
                      'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-500">{item.targetKeyword}</span>
                    <span className="text-xs text-gray-600">{item.wordCount} words</span>
                    <span className="text-xs text-gray-600">{item.images.length} images</span>
                    <span className="text-xs text-gray-600">{item.passesCompleted} passes</span>
                    {item.schemaMarkup && <span className="text-xs text-emerald-600">Schema</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {selected && (
          <div className="w-96 shrink-0">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-6">
              <h2 className="text-base font-semibold text-white mb-4">{selected.title}</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="text-white">{selected.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Word Count</span>
                  <span className="text-white">{selected.wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Passes</span>
                  <span className="text-white">{selected.passesCompleted}/8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Images</span>
                  <span className="text-white">{selected.images.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Schema</span>
                  <span className="text-white">{selected.schemaMarkup ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-white">{new Date(selected.createdAt).toLocaleDateString()}</span>
                </div>
                {selected.wpUrl && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">WordPress</span>
                    <a href={selected.wpUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View</a>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <h3 className="text-xs font-semibold text-gray-400 mb-2">Content Preview</h3>
                <div
                  className="text-xs text-gray-300 max-h-64 overflow-y-auto prose prose-invert prose-xs"
                  dangerouslySetInnerHTML={{ __html: selected.content.substring(0, 2000) }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
