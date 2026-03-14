'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ActivityLog from './ActivityLog';
import { useClients } from './ClientProvider';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { activeClient } = useClients();
  const [showLog, setShowLog] = useState(true);

  return (
    <div className="flex h-screen bg-[#0a0d14] text-gray-100">
      <Sidebar
        activeClientId={activeClient?.id || null}
        activeClientName={activeClient?.name || null}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          activeClientName={activeClient?.name || null}
          showLog={showLog}
          onToggleLog={() => setShowLog(!showLog)}
        />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
          {showLog && <ActivityLog />}
        </div>
      </div>
    </div>
  );
}
