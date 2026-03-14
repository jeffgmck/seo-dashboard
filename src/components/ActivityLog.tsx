'use client';

import { useEffect, useState } from 'react';
import { ActivityLogEntry } from '@/lib/types';

export default function ActivityLog() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLog();
    const interval = setInterval(fetchLog, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLog() {
    try {
      const res = await fetch('/api/activity-log');
      if (res.ok) {
        setEntries(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  const statusColors = {
    info: 'text-blue-400',
    success: 'text-teal-400',
    error: 'text-red-400',
    warning: 'text-amber-400',
  };

  const statusDots = {
    info: 'bg-blue-400',
    success: 'bg-teal-400',
    error: 'bg-red-400',
    warning: 'bg-amber-400',
  };

  return (
    <aside className="w-80 bg-[#0f1219] border-l border-gray-800/60 flex flex-col h-full shrink-0">
      <div className="px-4 py-3 border-b border-gray-800/60">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Activity Log</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <p className="text-xs text-gray-600">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-xs text-gray-600">No activity yet. Start by adding a client.</p>
        ) : (
          entries.slice().reverse().map((entry) => (
            <div key={entry.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${statusDots[entry.status]}`} />
                <div className="w-px flex-1 bg-gray-800/60 mt-1" />
              </div>
              <div className="pb-3">
                <p className="text-[11px] text-gray-500 font-medium">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase()}
                </p>
                <p className={`text-xs mt-0.5 ${statusColors[entry.status]}`}>{entry.action}</p>
                {entry.details && (
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{entry.details}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
