"use client";

import React from "react";
import { useClient } from "@/context/ClientContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConnectionsPage() {
  const backendUrl = "https://unbiased-sponge-workable.ngrok-free.app";
  const { activeClient } = useClient();
  const router = useRouter();

  // Guard: Redirect if no active client
  React.useEffect(() => {
    if (!activeClient) {
      router.push("/");
    }
  }, [activeClient, router]);

  const [params, setParams] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedPlatform, setSelectedPlatform] = React.useState<any>(null);

  // Dynamic platforms with the correct client ID
  const platforms = [
    {
      id: "instagram",
      name: "Instagram",
      description: "Publish reels, stories, and posts with auto-tagging.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      ),
      color: "bg-pink-500/10 text-pink-500",
      connected: false,
      authUrl: `/api/social/meta/login?client_id=${activeClient?.id}`
    },
    {
      id: "facebook",
      name: "Facebook",
      description: "Manage agency pages and automated group posting.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      ),
      color: "bg-blue-600/10 text-blue-600",
      connected: false,
      authUrl: `/api/social/meta/login?client_id=${activeClient?.id}`
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      description: "Professional scheduling for companies and executives.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      ),
      color: "bg-blue-500/10 text-blue-500",
      connected: false,
      authUrl: "#"
    },
    {
      id: "youtube",
      name: "YouTube",
      description: "Upload shorts and videos with automated metadata.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path>
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
        </svg>
      ),
      color: "bg-red-500/10 text-red-500",
      connected: false,
      authUrl: "#"
    }
  ];

  const [platformState, setPlatformState] = React.useState(platforms);

  React.useEffect(() => {
    if (!activeClient) return;

    // 1. Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("status")) {
      setParams({
        status: urlParams.get("status"),
        message: urlParams.get("message") || (urlParams.get("status") === "success" ? "Platform connected successfully!" : "Failed to connect platform.")
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchStatus = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/social/status?client_id=${activeClient.id}`, {
          headers: {
            "ngrok-skip-browser-warning": "true"
          }
        });
        const data = await response.json();
        
        if (data.connected) {
          const updated = platforms.map(p => {
            const connection = data.connected.find((c: any) => 
               c.platform === p.id || (p.id === 'instagram' && c.platform === 'facebook')
            );
            return {
              ...p,
              connected: !!connection,
              accountName: connection?.account_name || null,
              details: connection || null
            };
          });
          setPlatformState(updated as any);
        }
      } catch (error) {
        console.error("Failed to fetch connection status", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [backendUrl, activeClient]);

  const maskToken = (token: string) => {
    if (!token) return "No token found";
    return `${token.substring(0, 8)}...${token.substring(token.length - 6)}`;
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-8 md:p-12 text-gray-900">
      <div className="max-w-5xl mx-auto">
        {params && (
          <div className={`mb-10 p-4 rounded-xl border flex items-center gap-4 ${
            params.status === 'success' 
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
            : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <span className="font-bold text-sm tracking-wide">{params.message}</span>
          </div>
        )}

        {/* Connection Inspector Modal */}
        {selectedPlatform && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">Connection Details</h2>
                <button onClick={() => setSelectedPlatform(null)} className="text-gray-400 hover:text-black text-2xl">&times;</button>
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                   <div className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Platform Context</div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center">{selectedPlatform.icon}</div>
                      <div>
                        <div className="font-black">{selectedPlatform.name}</div>
                        <div className="text-xs text-gray-500">{selectedPlatform.details?.account_name || 'Verification Pending'}</div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">Page / User ID</label>
                    <div className="p-3 bg-white border border-gray-100 rounded-xl text-sm font-mono font-bold text-gray-700 break-all">
                      {selectedPlatform.details?.platform_id || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">Live Access Token</label>
                    <div className="p-3 bg-white border border-gray-100 rounded-xl text-sm font-mono text-gray-500 break-all select-all">
                      {maskToken(selectedPlatform.details?.access_token)}
                    </div>
                    <p className="text-[10px] text-yellow-600 font-bold mt-1 uppercase tracking-tighter">Token is encrypted at rest (AES-256)</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">Last Sync Heartbeat</label>
                    <div className="text-xs font-medium text-gray-500">
                      {selectedPlatform.details?.updated_at ? new Date(selectedPlatform.details.updated_at).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                   <button onClick={() => setSelectedPlatform(null)} className="flex-1 btn-simple btn-white">Close</button>
                   <a href={`${backendUrl}${selectedPlatform.authUrl}`} className="flex-1 btn-simple btn-yellow text-center justify-center">Refresh Auth</a>
                </div>
              </div>
            </div>
          </div>
        )}

        <header className="mb-12">
          <Link href="/workspace" className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 inline-block hover:text-black transition-all">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black mb-3 tracking-tight">Social Accounts</h1>
          <p className="text-gray-500 max-w-xl text-md font-medium leading-relaxed">
            Connect your client's accounts to automate their posting.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {platformState.map((platform: any) => (
            <div key={platform.id} className="simple-card p-6 flex items-start gap-6 group">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                platform.connected ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-400'
              } transition-colors`}>
                {platform.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                   <h3 className="text-lg font-black">{platform.name}</h3>
                   <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                     platform.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                   }`}>
                     {isLoading ? "..." : (platform.connected ? "Connected" : "Offline")}
                   </span>
                </div>
                <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
                  {platform.description}
                  {platform.accountName && <span className="block mt-1 text-black font-bold">@{platform.accountName}</span>}
                </p>

                <div className="flex gap-2">
                  <a 
                    href={`${backendUrl}${platform.authUrl}`} 
                    className={`btn-simple text-[10px] uppercase font-black tracking-widest ${platform.connected ? 'btn-white hidden' : 'btn-yellow shadow-md shadow-yellow-500/10'}`}
                  >
                    Connect
                  </a>
                  {platform.connected && (
                    <button 
                      onClick={() => setSelectedPlatform(platform)}
                      className="btn-simple btn-white text-[10px] uppercase font-black tracking-widest"
                    >
                      Manage
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16 p-8 simple-card bg-gray-50/50 border-dashed border-2 flex flex-col items-center text-center">
          <h2 className="text-xs font-black uppercase tracking-widest mb-3">Api Status</h2>
          <p className="text-[11px] text-gray-400 max-w-sm mb-6 leading-normal font-medium">
            Tunnel connected to: <code>unbiased-sponge-workable.ngrok-free.app</code>. 
            OAuth and Webhooks are active.
          </p>
          <div className="px-4 py-1.5 bg-white border border-gray-100 text-green-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
            Operational
          </div>
        </section>
      </div>
    </div>
  );
}
