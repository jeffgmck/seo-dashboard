'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  priority?: string;
  requiresClient?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Client Settings',
    href: '/client-settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    requiresClient: true,
  },
  {
    label: 'GBP Audit & Entity Research',
    href: '/gbp-audit',
    priority: 'P1',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    requiresClient: true,
  },
  {
    label: 'GBP Management',
    href: '/gbp-management',
    priority: 'P2',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    requiresClient: true,
  },
  {
    label: 'Site Crawl & Analysis',
    href: '/site-crawl',
    priority: 'P3',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    requiresClient: true,
  },
  {
    label: 'Content Production',
    href: '/content-production',
    priority: 'P4',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    requiresClient: true,
  },
  {
    label: 'Images & Video',
    href: '/images-video',
    priority: 'P5',
    badge: 'Optional',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    requiresClient: true,
  },
  {
    label: 'WordPress Publish',
    href: '/wordpress',
    priority: 'P6',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    requiresClient: true,
  },
  {
    label: 'Video Publishing',
    href: '/video-publishing',
    priority: 'P9',
    badge: 'Optional',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    requiresClient: true,
  },
  {
    label: 'Content Library',
    href: '/content-library',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    requiresClient: true,
  },
];

interface SidebarProps {
  activeClientId: string | null;
  activeClientName: string | null;
}

export default function Sidebar({ activeClientId, activeClientName }: SidebarProps) {
  const pathname = usePathname();

  function getHref(item: NavItem) {
    if (item.requiresClient && activeClientId) {
      return `/clients/${activeClientId}${item.href}`;
    }
    return item.href;
  }

  function isActive(item: NavItem) {
    const href = getHref(item);
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-56 bg-[#0f1219] border-r border-gray-800/60 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">SEO Dashboard</h1>
          </div>
        </div>
      </div>

      {/* Active Client */}
      {activeClientName && (
        <div className="px-4 py-3 border-b border-gray-800/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-teal-400 truncate">{activeClientName}</span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const disabled = item.requiresClient && !activeClientId;
            const active = isActive(item);
            return (
              <li key={item.label}>
                {disabled ? (
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 cursor-not-allowed text-[13px]">
                    <span className="w-5 h-5 flex items-center justify-center opacity-40">{item.icon}</span>
                    <span className="flex-1 truncate">{item.label}</span>
                  </div>
                ) : (
                  <Link
                    href={getHref(item)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[13px] group ${
                      active
                        ? 'bg-teal-500/10 text-teal-400'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                  >
                    <span className={`w-5 h-5 flex items-center justify-center ${active ? 'text-teal-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-medium">
                        {item.badge}
                      </span>
                    )}
                    {item.priority && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        active ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-800/80 text-gray-500'
                      }`}>
                        {item.priority}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-800/60">
        <Link
          href="/clients"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manage Clients
        </Link>
      </div>
    </aside>
  );
}
