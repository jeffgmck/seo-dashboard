'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TopBarProps {
  activeClientName: string | null;
  showLog: boolean;
  onToggleLog: () => void;
}

export default function TopBar({ activeClientName, showLog, onToggleLog }: TopBarProps) {
  const pathname = usePathname();

  function getBreadcrumb() {
    if (pathname === '/') return 'Dashboard';
    if (pathname === '/settings') return 'Settings';
    if (pathname === '/clients') return 'Manage Clients';
    if (pathname.includes('/client-settings')) return 'Client Settings';
    if (pathname.includes('/gbp-audit')) return 'GBP Audit & Entity Research';
    if (pathname.includes('/gbp-management')) return 'GBP Management';
    if (pathname.includes('/site-crawl')) return 'Site Crawl & Analysis';
    if (pathname.includes('/content-production')) return 'Content Production';
    if (pathname.includes('/images-video')) return 'Images & Video';
    if (pathname.includes('/wordpress')) return 'WordPress Publish';
    if (pathname.includes('/content-library')) return 'Content Library';
    return 'Dashboard';
  }

  return (
    <header className="h-12 bg-[#0f1219] border-b border-gray-800/60 flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">Dashboard</span>
        {activeClientName && (
          <>
            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">{activeClientName}</span>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLog}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {showLog ? 'Hide Log' : 'Show Log'}
        </button>
        <Link
          href="/settings"
          className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          title="Settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
