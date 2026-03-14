'use client';

import { useClients } from '@/components/ClientProvider';
import Link from 'next/link';

export default function Dashboard() {
  const { clients, activeClient } = useClients();

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-8">Local SEO automation overview</p>

      {!activeClient ? (
        <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-white mb-2">No Client Selected</h2>
          <p className="text-gray-400 mb-6">Select or create a client to get started with the SEO workflow.</p>
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Manage Clients
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="GBP Categories" value="--" subtitle="Run GBP Audit to populate" />
            <StatCard title="Pages Crawled" value="--" subtitle="Run Site Crawl to populate" />
            <StatCard title="Content Generated" value="--" subtitle="No content yet" />
            <StatCard title="Published Pages" value="--" subtitle="No pages published" />
          </div>

          {/* Workflow Steps */}
          <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">SEO Workflow</h2>
            <div className="space-y-3">
              <WorkflowStep
                step={1}
                title="Client Settings"
                description="Configure GBP data, business info, voice/tone, and WordPress connection"
                href={`/clients/${activeClient.id}/client-settings`}
                status="pending"
              />
              <WorkflowStep
                step={2}
                title="GBP Audit & Entity Research"
                description="Audit categories, analyze service entity overlap"
                href={`/clients/${activeClient.id}/gbp-audit`}
                status="pending"
              />
              <WorkflowStep
                step={3}
                title="Site Crawl & Analysis"
                description="Crawl website, assign pages to services, run gap analysis"
                href={`/clients/${activeClient.id}/site-crawl`}
                status="pending"
              />
              <WorkflowStep
                step={4}
                title="Content Production"
                description="Generate humanized SEO content with 8-pass pipeline"
                href={`/clients/${activeClient.id}/content-production`}
                status="pending"
              />
              <WorkflowStep
                step={5}
                title="WordPress Publish"
                description="Review and publish content to WordPress"
                href={`/clients/${activeClient.id}/wordpress`}
                status="pending"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/clients/${activeClient.id}/client-settings`}
              className="bg-[#131720] border border-gray-800/60 rounded-xl p-4 hover:border-gray-700/60 transition-colors group"
            >
              <h3 className="text-sm font-semibold text-white group-hover:text-teal-400 transition-colors">Configure Client</h3>
              <p className="text-xs text-gray-500 mt-1">Set up GBP data and preferences</p>
            </Link>
            <Link
              href={`/clients/${activeClient.id}/content-production`}
              className="bg-[#131720] border border-gray-800/60 rounded-xl p-4 hover:border-gray-700/60 transition-colors group"
            >
              <h3 className="text-sm font-semibold text-white group-hover:text-teal-400 transition-colors">Generate Content</h3>
              <p className="text-xs text-gray-500 mt-1">Start the content pipeline</p>
            </Link>
            <Link
              href={`/clients/${activeClient.id}/content-library`}
              className="bg-[#131720] border border-gray-800/60 rounded-xl p-4 hover:border-gray-700/60 transition-colors group"
            >
              <h3 className="text-sm font-semibold text-white group-hover:text-teal-400 transition-colors">Content Library</h3>
              <p className="text-xs text-gray-500 mt-1">View all generated content</p>
            </Link>
          </div>
        </div>
      )}

      {/* Clients Overview */}
      {clients.length > 0 && (
        <div className="mt-8 bg-[#131720] border border-gray-800/60 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">All Clients ({clients.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {clients.map(client => (
              <div
                key={client.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  client.id === activeClient?.id
                    ? 'border-teal-500/50 bg-teal-600/10'
                    : 'border-gray-800/60 hover:border-gray-700/60'
                }`}
              >
                <p className="text-sm font-medium text-white">{client.name}</p>
                <p className="text-xs text-gray-500">{client.businessName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="bg-[#131720] border border-gray-800/60 rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function WorkflowStep({ step, title, description, href, status }: {
  step: number;
  title: string;
  description: string;
  href: string;
  status: 'pending' | 'complete' | 'active';
}) {
  return (
    <Link href={href} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#1a1f2e]/50 transition-colors group">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
        status === 'complete' ? 'bg-teal-600 text-white' :
        status === 'active' ? 'bg-teal-600 text-white' :
        'bg-[#1a1f2e] text-gray-400 border border-gray-700/60'
      }`}>
        {status === 'complete' ? '\u2713' : step}
      </div>
      <div>
        <p className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
