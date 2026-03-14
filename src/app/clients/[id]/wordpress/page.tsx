'use client';

import { useState, useEffect, use } from 'react';
import { GeneratedContent } from '@/lib/types';

export default function WordPressPublishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [wpConnected, setWpConnected] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/clients/${id}/content`).then(r => r.json()),
      fetch(`/api/clients/${id}/settings`).then(r => r.json()),
    ]).then(([contentData, settings]) => {
      setContent(Array.isArray(contentData) ? contentData : []);
      setWpConnected(!!settings.wpSiteUrl && !!settings.wpUsername && !!settings.wpAppPassword);
      setLoading(false);
    });
  }, [id]);

  async function publishToWP(contentId: string) {
    setPublishing(contentId);
    try {
      const res = await fetch(`/api/clients/${id}/wordpress/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId }),
      });
      if (res.ok) {
        const data = await res.json();
        setContent(prev =>
          prev.map(c =>
            c.id === contentId
              ? { ...c, status: 'published' as const, wpPostId: data.postId, wpUrl: data.url }
              : c
          )
        );
      }
    } catch {
      // fail silently
    }
    setPublishing(null);
  }

  if (loading) return <div className="text-gray-400">Loading...</div>;

  const drafts = content.filter(c => c.status !== 'published');
  const published = content.filter(c => c.status === 'published');

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">WordPress Publish</h1>
        <p className="text-gray-400 mt-1">Review and publish content to WordPress</p>
      </div>

      {!wpConnected && (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-400">WordPress connection not configured. Go to Client Settings &rarr; WordPress tab to set it up.</p>
        </div>
      )}

      {/* Drafts */}
      <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-4">
          Draft Content ({drafts.length})
        </h2>
        {drafts.length === 0 ? (
          <p className="text-sm text-gray-500">No draft content. Generate content from the Content Production page first.</p>
        ) : (
          <div className="space-y-3">
            {drafts.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-800/60 rounded-lg">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{item.targetKeyword}</span>
                    <span className="text-xs text-gray-600">{item.wordCount} words</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      item.status === 'final'
                        ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                        : 'bg-[#1a1f2e] text-gray-400 border border-gray-700/60'
                    }`}>
                      {item.status === 'final' ? 'Ready' : item.status}
                    </span>
                    {item.images.length > 0 && (
                      <span className="text-xs text-gray-600">{item.images.length} images</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => window.open(`/clients/${id}/content-library?view=${item.id}`, '_self')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#1a1f2e] text-gray-400 border border-gray-700/60 hover:border-gray-600 transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => publishToWP(item.id)}
                    disabled={!wpConnected || publishing === item.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-teal-600/20 text-teal-400 border border-teal-500/30 hover:bg-teal-600/30 transition-colors disabled:opacity-50"
                  >
                    {publishing === item.id ? 'Publishing...' : 'Publish'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published */}
      <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">
          Published ({published.length})
        </h2>
        {published.length === 0 ? (
          <p className="text-sm text-gray-500">No published content yet.</p>
        ) : (
          <div className="space-y-3">
            {published.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-800/60 rounded-lg">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{item.targetKeyword}</span>
                    <span className="text-xs text-teal-400">{item.wordCount} words</span>
                    {item.wpUrl && (
                      <a href={item.wpUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-400 hover:underline">
                        View on WordPress
                      </a>
                    )}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-teal-500/15 text-teal-400 border border-teal-500/30">
                  Published
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
