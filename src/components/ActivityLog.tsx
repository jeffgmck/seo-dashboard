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
    success: 'text-emerald-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
  };

  const statusDots = {
    info: 'bg-blue-400',
    success: 'bg-emerald-400',
    error: 'bg-red-400',
    warning: 'bg-yellow-400',
  };

  return (
    <aside className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full shrink-0 hidden xl:flex">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-white">Activity Log</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-xs text-gray-500">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-xs text-gray-500">No activity yet. Start by adding a client.</p>
        ) : (
          entries.slice().reverse().map((entry) => (
            <div key={entry.id} className="flex gap-3 text-xs">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${statusDots[entry.status]}`} />
              <div>
                <p className={statusColors[entry.status]}>{entry.action}</p>
                <p className="text-gray-500 mt-0.5">{entry.details}</p>
                <p className="text-gray-600 mt-0.5">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
