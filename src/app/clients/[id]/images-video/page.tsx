'use client';

import { useState, use } from 'react';

export default function ImagesVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('professional photography');
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<{ url: string; prompt: string; createdAt: string }[]>([]);
  const [error, setError] = useState('');

  async function generateImage() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError('');
    try {
      const res = await fetch(`/api/clients/${id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), style }),
      });
      if (res.ok) {
        const data = await res.json();
        setImages(prev => [data, ...prev]);
        setPrompt('');
      } else {
        const data = await res.json();
        setError(data.error || 'Image generation failed');
      }
    } catch {
      setError('Failed to connect to API');
    }
    setGenerating(false);
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Images & Video</h1>
        <p className="text-gray-400 mt-1">Generate images with DALL-E for your content</p>
        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-yellow-600/20 text-yellow-400 border border-yellow-500/30">
          Optional
        </span>
      </div>

      {/* Image Generation */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-4">Generate Image</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Image Description</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., A professional plumber repairing a water heater in a modern kitchen"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Style</label>
            <select
              value={style}
              onChange={e => setStyle(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="professional photography">Professional Photography</option>
              <option value="illustration">Illustration</option>
              <option value="realistic 3d render">Realistic 3D Render</option>
              <option value="clean modern graphic">Clean Modern Graphic</option>
              <option value="watercolor style">Watercolor Style</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={generateImage}
            disabled={generating || !prompt.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {generating ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      </div>

      {/* Generated Images */}
      {images.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Generated Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div key={i} className="border border-gray-800 rounded-lg overflow-hidden">
                <div className="aspect-square bg-gray-800 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400 line-clamp-2">{img.prompt}</p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(img.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">No images generated yet. Enter a prompt above to get started.</p>
        </div>
      )}

      {/* Video Section */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-base font-semibold text-white">Video Generation</h2>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-500 border border-gray-700">Coming Soon</span>
        </div>
        <p className="text-sm text-gray-500">Video generation via YouTube Data API is optional and can be configured later.</p>
      </div>
    </div>
  );
}
