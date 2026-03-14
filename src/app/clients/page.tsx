'use client';

import { useState } from 'react';
import { useClients } from '@/components/ClientProvider';
import { useRouter } from 'next/navigation';

export default function ClientsPage() {
  const { clients, activeClient, setActiveClientId, refreshClients } = useClients();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleAdd() {
    if (!name.trim()) return;
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), businessName: businessName.trim() || name.trim() }),
    });
    if (res.ok) {
      const client = await res.json();
      await refreshClients();
      setActiveClientId(client.id);
      setName('');
      setBusinessName('');
      setShowAddForm(false);
      await fetch('/api/activity-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'Client Created',
          details: `Added client "${client.name}"`,
          clientId: client.id,
          status: 'success',
        }),
      });
    }
  }

  async function handleEdit(id: string) {
    if (!name.trim()) return;
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), businessName: businessName.trim() }),
    });
    if (res.ok) {
      await refreshClients();
      setEditingId(null);
      setName('');
      setBusinessName('');
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (activeClient?.id === id) {
        setActiveClientId(null);
      }
      await refreshClients();
    }
    setDeleting(null);
  }

  function startEdit(client: { id: string; name: string; businessName: string }) {
    setEditingId(client.id);
    setName(client.name);
    setBusinessName(client.businessName);
    setShowAddForm(false);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Manager</h1>
          <p className="text-gray-400 mt-1">Manage your SEO clients</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); setName(''); setBusinessName(''); }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-white mb-4">
            {editingId ? 'Edit Client' : 'Add New Client'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Client Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., John's Plumbing"
                className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
                onKeyDown={e => e.key === 'Enter' && (editingId ? handleEdit(editingId) : handleAdd())}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Business Name</label>
              <input
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g., John's Plumbing LLC"
                className="w-full bg-[#1a1f2e] border border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
                onKeyDown={e => e.key === 'Enter' && (editingId ? handleEdit(editingId) : handleAdd())}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => editingId ? handleEdit(editingId) : handleAdd()}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {editingId ? 'Save Changes' : 'Add Client'}
              </button>
              <button
                onClick={() => { setShowAddForm(false); setEditingId(null); }}
                className="bg-[#1a1f2e] hover:bg-gray-700 text-gray-400 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client List */}
      {clients.length === 0 ? (
        <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-8 text-center">
          <p className="text-gray-400">No clients yet. Add your first client to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(client => (
            <div
              key={client.id}
              className={`bg-[#131720] border rounded-xl p-4 transition-colors ${
                client.id === activeClient?.id ? 'border-teal-500/50' : 'border-gray-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">{client.name}</h3>
                    {client.id === activeClient?.id && (
                      <span className="text-xs px-2 py-0.5 rounded bg-teal-600/20 text-teal-400 border border-teal-500/30">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{client.businessName}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Created {new Date(client.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {client.id !== activeClient?.id ? (
                    <button
                      onClick={() => setActiveClientId(client.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-teal-600/20 text-teal-400 border border-teal-500/30 hover:bg-teal-600/30 transition-colors"
                    >
                      Set Active
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/clients/${client.id}/client-settings`)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#1a1f2e] text-gray-400 border border-gray-700/60 hover:border-gray-600 transition-colors"
                    >
                      Configure
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(client)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#1a1f2e] transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    disabled={deleting === client.id}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-[#1a1f2e] transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
