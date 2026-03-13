'use client';

import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ActivityLog from './ActivityLog';
import { useClients } from './ClientProvider';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { activeClient } = useClients();

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <Sidebar
        activeClientId={activeClient?.id || null}
        activeClientName={activeClient?.name || null}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar activeClientName={activeClient?.name || null} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <ActivityLog />
    </div>
  );
}
