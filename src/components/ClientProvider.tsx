'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client } from '@/lib/types';

interface ClientContextType {
  clients: Client[];
  activeClient: Client | null;
  setActiveClientId: (id: string | null) => void;
  refreshClients: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType>({
  clients: [],
  activeClient: null,
  setActiveClientId: () => {},
  refreshClients: async () => {},
});

export function useClients() {
  return useContext(ClientContext);
}

export default function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  useEffect(() => {
    refreshClients();
    // Restore active client from localStorage
    const saved = localStorage.getItem('activeClientId');
    if (saved) setActiveClientId(saved);
  }, []);

  async function refreshClients() {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch {
      // silently fail
    }
  }

  function handleSetActiveClient(id: string | null) {
    setActiveClientId(id);
    if (id) {
      localStorage.setItem('activeClientId', id);
    } else {
      localStorage.removeItem('activeClientId');
    }
  }

  const activeClient = clients.find(c => c.id === activeClientId) || null;

  return (
    <ClientContext.Provider value={{
      clients,
      activeClient,
      setActiveClientId: handleSetActiveClient,
      refreshClients,
    }}>
      {children}
    </ClientContext.Provider>
  );
}
