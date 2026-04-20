"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Client {
  id: number;
  name: str;
}

interface ClientContextType {
  activeClient: Client | null;
  setActiveClient: (client: Client) => void;
  clients: Client[];
  isLoading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [activeClient, setActiveClientState] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl = "https://unbiased-sponge-workable.ngrok-free.app";

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/clients/`, {
           headers: { "ngrok-skip-browser-warning": "true" }
        });
        const data = await res.json();
        setClients(data);
        
        // Load from localStorage or pick first
        const saved = localStorage.getItem("activeClient");
        if (saved) {
           setActiveClientState(JSON.parse(saved));
        } else if (data.length > 0) {
           setActiveClientState(data[0]);
        }
      } catch (err) {
        console.error("Failed to load clients");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  const setActiveClient = (client: Client) => {
    setActiveClientState(client);
    localStorage.setItem("activeClient", JSON.stringify(client));
  };

  return (
    <ClientContext.Provider value={{ activeClient, setActiveClient, clients, isLoading }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context;
}
