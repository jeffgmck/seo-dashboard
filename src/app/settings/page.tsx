'use client';

import { useState, useEffect } from 'react';

interface SettingsForm {
  openaiApiKey: string;
  anthropicApiKey: string;
  youtubeApiKey: string;
  defaultModel: 'openai' | 'anthropic';
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsForm>({
    openaiApiKey: '',
    anthropicApiKey: '',
    youtubeApiKey: '',
    defaultModel: 'openai',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({
    openai: 'idle',
    anthropic: 'idle',
    youtube: 'idle',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        // Log activity
        await fetch('/api/activity-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'Settings Updated',
            details: 'API keys and model preferences saved',
            status: 'success',
          }),
        });
        setTimeout(() => setSaved(false), 3000);
        // Reload to get masked keys
        loadSettings();
      }
    } catch {
      // fail silently
    } finally {
      setSaving(false);
    }
  }

  async function testApiKey(provider: 'openai' | 'anthropic' | 'youtube') {
    setTestResults(prev => ({ ...prev, [provider]: 'testing' }));
    try {
      const res = await fetch('/api/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      setTestResults(prev => ({ ...prev, [provider]: data.success ? 'success' : 'error' }));
    } catch {
      setTestResults(prev => ({ ...prev, [provider]: 'error' }));
    }
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, [provider]: 'idle' }));
    }, 5000);
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
      <p className="text-gray-400 mb-8">Manage API keys and global preferences. Keys are stored locally — not in .env files.</p>

      <div className="space-y-6">
        {/* OpenAI API Key */}
        <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">OpenAI API Key</h2>
              <p className="text-xs text-gray-500 mt-1">Used for GPT-4o content generation and DALL-E image creation</p>
            </div>
            <TestButton status={testResults.openai} onClick={() => testApiKey('openai')} />
          </div>
          <input
            type="password"
            value={settings.openaiApiKey}
            onChange={e => setSettings(s => ({ ...s, openaiApiKey: e.target.value }))}
            placeholder="sk-..."
            className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 "
          />
        </div>

        {/* Anthropic API Key */}
        <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Anthropic API Key</h2>
              <p className="text-xs text-gray-500 mt-1">Used for Claude as alternative content generation model</p>
            </div>
            <TestButton status={testResults.anthropic} onClick={() => testApiKey('anthropic')} />
          </div>
          <input
            type="password"
            value={settings.anthropicApiKey}
            onChange={e => setSettings(s => ({ ...s, anthropicApiKey: e.target.value }))}
            placeholder="sk-ant-..."
            className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 "
          />
        </div>

        {/* YouTube API Key */}
        <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">YouTube Data API Key</h2>
              <p className="text-xs text-gray-500 mt-1">Optional — used for video upload functionality</p>
            </div>
            <TestButton status={testResults.youtube} onClick={() => testApiKey('youtube')} />
          </div>
          <input
            type="password"
            value={settings.youtubeApiKey}
            onChange={e => setSettings(s => ({ ...s, youtubeApiKey: e.target.value }))}
            placeholder="AIza..."
            className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 "
          />
        </div>

        {/* Default Model */}
        <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Default AI Model</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setSettings(s => ({ ...s, defaultModel: 'openai' }))}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors border ${
                settings.defaultModel === 'openai'
                  ? 'bg-teal-600/20 border-blue-500 text-teal-400'
                  : 'bg-[#1a1f2e] border-gray-700/60 text-gray-400 hover:border-gray-600'
              }`}
            >
              GPT-4o (OpenAI)
            </button>
            <button
              onClick={() => setSettings(s => ({ ...s, defaultModel: 'anthropic' }))}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors border ${
                settings.defaultModel === 'anthropic'
                  ? 'bg-teal-600/20 border-blue-500 text-teal-400'
                  : 'bg-[#1a1f2e] border-gray-700/60 text-gray-400 hover:border-gray-600'
              }`}
            >
              Claude (Anthropic)
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <span className="text-sm text-teal-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Settings saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TestButton({ status, onClick }: { status: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={status === 'testing'}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
        status === 'success' ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30' :
        status === 'error' ? 'bg-red-600/20 text-red-400 border border-red-500/30' :
        status === 'testing' ? 'bg-[#1a1f2e] text-gray-400 border border-gray-700/60' :
        'bg-[#1a1f2e] text-gray-400 border border-gray-700/60 hover:border-gray-600 hover:text-white'
      }`}
    >
      {status === 'testing' ? 'Testing...' :
       status === 'success' ? 'Connected' :
       status === 'error' ? 'Failed' :
       'Test Connection'}
    </button>
  );
}
