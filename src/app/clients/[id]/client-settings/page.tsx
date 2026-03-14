'use client';

import { useState, useEffect, use } from 'react';
import { ClientSettings, GBPService } from '@/lib/types';

export default function ClientSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [settings, setSettings] = useState<ClientSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'business' | 'gbp' | 'voice' | 'reviews' | 'local' | 'wordpress'>('business');
  const [generatingLocal, setGeneratingLocal] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${id}/settings`).then(r => r.json()).then(setSettings);
  }, [id]);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    const res = await fetch(`/api/clients/${id}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  function parseGBPData(raw: string) {
    if (!settings) return;
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const categories: string[] = [];
    const services: GBPService[] = [];
    let currentCategory = '';
    let inCategories = false;
    let inServices = false;
    let primaryCategory = settings.gbpPrimaryCategory;

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('primary category') || lower.includes('main category')) {
        const val = line.split(':').slice(1).join(':').trim();
        if (val) primaryCategory = val;
        inCategories = false;
        inServices = false;
        continue;
      }
      if (lower.includes('categories') || lower.includes('additional categories') || lower.includes('secondary categories')) {
        inCategories = true;
        inServices = false;
        continue;
      }
      if (lower.includes('services') || lower.includes('service list')) {
        inCategories = false;
        inServices = true;
        const val = line.split(':').slice(1).join(':').trim();
        if (val) currentCategory = val;
        continue;
      }
      if (inCategories) {
        const cat = line.replace(/^[-*•]\s*/, '').trim();
        if (cat) categories.push(cat);
      }
      if (inServices) {
        const svc = line.replace(/^[-*•]\s*/, '').trim();
        if (svc) {
          services.push({
            name: svc,
            category: currentCategory || primaryCategory,
            hasPage: false,
          });
        }
      }
    }

    // If nothing parsed with structure, treat each line as a service
    if (services.length === 0 && categories.length === 0) {
      for (const line of lines) {
        const clean = line.replace(/^[-*•]\s*/, '').trim();
        if (clean) {
          services.push({ name: clean, category: primaryCategory, hasPage: false });
        }
      }
    }

    setSettings({
      ...settings,
      gbpRawData: raw,
      gbpPrimaryCategory: primaryCategory,
      gbpSecondaryCategories: categories.length > 0 ? categories : settings.gbpSecondaryCategories,
      gbpServices: services.length > 0 ? services : settings.gbpServices,
    });
  }

  async function autoGenerateLocalDetails() {
    if (!settings) return;
    setGeneratingLocal(true);
    try {
      const res = await fetch('/api/ai/generate-local-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: settings.city,
          state: settings.state,
          businessType: settings.gbpPrimaryCategory,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings({ ...settings, localDetails: data.content });
      }
    } catch {
      // fail silently
    }
    setGeneratingLocal(false);
  }

  if (!settings) {
    return <div className="text-gray-400">Loading...</div>;
  }

  const tabs = [
    { key: 'business', label: 'Business Info' },
    { key: 'gbp', label: 'GBP Data' },
    { key: 'voice', label: 'Voice & Tone' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'local', label: 'Local Details' },
    { key: 'wordpress', label: 'WordPress' },
  ] as const;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Settings</h1>
          <p className="text-gray-400 mt-1">Configure client profile, GBP data, and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-teal-400">Saved</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#131720] p-1 rounded-lg border border-gray-800/60 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#1a1f2e] text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-6">
        {activeTab === 'business' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white mb-4">Business Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Business Name" value={settings.businessName} onChange={v => setSettings({ ...settings, businessName: v })} />
              <Field label="Phone" value={settings.businessPhone} onChange={v => setSettings({ ...settings, businessPhone: v })} />
              <Field label="Email" value={settings.businessEmail} onChange={v => setSettings({ ...settings, businessEmail: v })} />
              <Field label="Website" value={settings.website} onChange={v => setSettings({ ...settings, website: v })} />
            </div>
            <Field label="Address" value={settings.businessAddress} onChange={v => setSettings({ ...settings, businessAddress: v })} />
            <div className="grid grid-cols-3 gap-4">
              <Field label="City" value={settings.city} onChange={v => setSettings({ ...settings, city: v })} />
              <Field label="State" value={settings.state} onChange={v => setSettings({ ...settings, state: v })} />
              <Field label="ZIP" value={settings.zip} onChange={v => setSettings({ ...settings, zip: v })} />
            </div>
          </div>
        )}

        {activeTab === 'gbp' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-white mb-2">GBP Data Import</h2>
              <p className="text-xs text-gray-500 mb-3">Paste your Google Business Profile data below. The system will auto-parse categories and services.</p>
              <textarea
                value={settings.gbpRawData}
                onChange={e => {
                  setSettings({ ...settings, gbpRawData: e.target.value });
                }}
                placeholder={"Primary Category: Plumber\n\nAdditional Categories:\n- Drainage Service\n- Gas Installation Service\n\nServices:\n- Drain Cleaning\n- Water Heater Installation\n- Pipe Repair"}
                rows={8}
                className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 font-mono"
              />
              <button
                onClick={() => parseGBPData(settings.gbpRawData)}
                className="mt-2 bg-[#1a1f2e] hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors border border-gray-700/60"
              >
                Parse GBP Data
              </button>
            </div>

            <div>
              <Field label="Primary Category" value={settings.gbpPrimaryCategory} onChange={v => setSettings({ ...settings, gbpPrimaryCategory: v })} />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Secondary Categories</label>
              <div className="space-y-2">
                {settings.gbpSecondaryCategories.map((cat, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={cat}
                      onChange={e => {
                        const updated = [...settings.gbpSecondaryCategories];
                        updated[i] = e.target.value;
                        setSettings({ ...settings, gbpSecondaryCategories: updated });
                      }}
                      className="flex-1 bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50"
                    />
                    <button
                      onClick={() => {
                        const updated = settings.gbpSecondaryCategories.filter((_, j) => j !== i);
                        setSettings({ ...settings, gbpSecondaryCategories: updated });
                      }}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSettings({ ...settings, gbpSecondaryCategories: [...settings.gbpSecondaryCategories, ''] })}
                  className="text-xs text-teal-400 hover:text-blue-300 transition-colors"
                >
                  + Add Category
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Services ({settings.gbpServices.length})</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {settings.gbpServices.map((svc, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={svc.name}
                      onChange={e => {
                        const updated = [...settings.gbpServices];
                        updated[i] = { ...svc, name: e.target.value };
                        setSettings({ ...settings, gbpServices: updated });
                      }}
                      className="flex-1 bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50"
                    />
                    <select
                      value={svc.category}
                      onChange={e => {
                        const updated = [...settings.gbpServices];
                        updated[i] = { ...svc, category: e.target.value };
                        setSettings({ ...settings, gbpServices: updated });
                      }}
                      className="bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-2 py-2 text-xs text-gray-400 focus:outline-none focus:border-teal-500/50"
                    >
                      <option value={settings.gbpPrimaryCategory}>{settings.gbpPrimaryCategory || 'Primary'}</option>
                      {settings.gbpSecondaryCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const updated = settings.gbpServices.filter((_, j) => j !== i);
                        setSettings({ ...settings, gbpServices: updated });
                      }}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSettings({
                    ...settings,
                    gbpServices: [...settings.gbpServices, { name: '', category: settings.gbpPrimaryCategory, hasPage: false }],
                  })}
                  className="text-xs text-teal-400 hover:text-blue-300 transition-colors"
                >
                  + Add Service
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white mb-4">Voice & Tone Preferences</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Voice/Tone Description</label>
              <textarea
                value={settings.voiceTone}
                onChange={e => setSettings({ ...settings, voiceTone: e.target.value })}
                placeholder="e.g., Professional but friendly, conversational, uses humor occasionally..."
                rows={3}
                className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Audience</label>
              <textarea
                value={settings.targetAudience}
                onChange={e => setSettings({ ...settings, targetAudience: e.target.value })}
                placeholder="e.g., Homeowners aged 30-65 in suburban areas..."
                rows={2}
                className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Words to Use (comma-separated)</label>
              <input
                value={settings.wordsToUse.join(', ')}
                onChange={e => setSettings({ ...settings, wordsToUse: e.target.value.split(',').map(w => w.trim()).filter(Boolean) })}
                placeholder="reliable, trusted, experienced, local"
                className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Words to Avoid (comma-separated)</label>
              <input
                value={settings.wordsToAvoid.join(', ')}
                onChange={e => setSettings({ ...settings, wordsToAvoid: e.target.value.split(',').map(w => w.trim()).filter(Boolean) })}
                placeholder="cheap, discount, cutting-edge, leverage"
                className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Writing Samples</label>
              <textarea
                value={settings.writingSamples}
                onChange={e => setSettings({ ...settings, writingSamples: e.target.value })}
                placeholder="Paste examples of content in the desired voice/tone..."
                rows={5}
                className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Image Style Preference</label>
              <input
                value={settings.imageStylePreference}
                onChange={e => setSettings({ ...settings, imageStylePreference: e.target.value })}
                placeholder="e.g., Professional photography style, clean modern look..."
                className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white mb-4">Review Data</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Average Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={settings.averageRating}
                  onChange={e => setSettings({ ...settings, averageRating: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Review Count</label>
                <input
                  type="number"
                  value={settings.reviewCount}
                  onChange={e => setSettings({ ...settings, reviewCount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50"
                />
              </div>
            </div>
            <Field label="Review Source URL" value={settings.reviewSourceUrl} onChange={v => setSettings({ ...settings, reviewSourceUrl: v })} />
          </div>
        )}

        {activeTab === 'local' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Local Details</h2>
              <button
                onClick={autoGenerateLocalDetails}
                disabled={generatingLocal || !settings.city}
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {generatingLocal ? 'Generating...' : 'Auto-Generate'}
              </button>
            </div>
            <p className="text-xs text-gray-500">Local housing, building codes, climate, common issues for the service area. Used to inject local relevance into generated content.</p>
            <textarea
              value={settings.localDetails}
              onChange={e => setSettings({ ...settings, localDetails: e.target.value })}
              placeholder="e.g., Houston has clay soil that causes foundation issues. Most homes built in the 1970s-1990s have galvanized steel pipes. Summer temps exceed 100°F requiring heavy AC usage..."
              rows={10}
              className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>
        )}

        {activeTab === 'wordpress' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white mb-4">WordPress Connection</h2>
            <Field label="Site URL" value={settings.wpSiteUrl} onChange={v => setSettings({ ...settings, wpSiteUrl: v })} placeholder="https://example.com" />
            <Field label="Username" value={settings.wpUsername} onChange={v => setSettings({ ...settings, wpUsername: v })} />
            <div>
              <label className="block text-sm text-gray-400 mb-1">Application Password</label>
              <input
                type="password"
                value={settings.wpAppPassword}
                onChange={e => setSettings({ ...settings, wpAppPassword: e.target.value })}
                placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
              />
              <p className="text-xs text-gray-600 mt-1">Generate at WordPress Dashboard → Users → Application Passwords</p>
            </div>
            <button
              onClick={async () => {
                if (!settings.wpSiteUrl) return;
                try {
                  const res = await fetch('/api/wordpress/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      siteUrl: settings.wpSiteUrl,
                      username: settings.wpUsername,
                      appPassword: settings.wpAppPassword,
                    }),
                  });
                  const data = await res.json();
                  alert(data.success ? 'Connection successful!' : `Connection failed: ${data.error}`);
                } catch {
                  alert('Connection test failed');
                }
              }}
              className="bg-[#1a1f2e] hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors border border-gray-700/60"
            >
              Test WordPress Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
      />
    </div>
  );
}
