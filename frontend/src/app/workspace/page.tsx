"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import { useClient } from "@/context/ClientContext";
import Link from "next/link";

export default function WorkspaceDashboard() {
  const { activeClient } = useClient();

  if (!activeClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] font-sans uppercase">
        <div className="text-center space-y-6">
           <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-3xl animate-float">🛡️</div>
           <h2 className="text-2xl font-black font-display tracking-tighter">Access Key Required</h2>
           <Link href="/" className="btn-premium bg-black text-white px-10">Return to Admin</Link>
        </div>
      </div>
    );
  }

  const scheduledCount = 0;
  const connectedCount = activeClient.tokens?.length || 0;

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] text-[#111] font-sans selection:bg-yellow-200 uppercase tracking-tight relative overflow-hidden">
      <Sidebar />
      
      {/* Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-400/5 rounded-full blur-[140px] pointer-events-none translate-x-1/4 -translate-y-1/4"></div>

      <main className="flex-1 p-16 overflow-y-auto relative z-10 no-scrollbar font-sans">
        <header className="mb-20">
           <div className="flex items-center gap-3 mb-10">
              <Link href="/" className="admin-label text-gray-300 hover:text-black transition-colors">&larr; Back to Portfolio</Link>
           </div>
           
           <div className="flex items-end justify-between border-b border-gray-100 pb-12">
              <div className="space-y-6">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-black text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl font-display uppercase">
                       {activeClient.name[0]}
                    </div>
                    <div>
                       <h1 className="text-7xl font-black font-display tracking-tight leading-[0.95] uppercase">
                          {activeClient.name}.<br/>
                          <span className="text-gray-300">Operations</span>
                       </h1>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 pl-2 opacity-60">
                    <span className="admin-label text-gray-400">Environment:</span>
                    <span className="admin-label text-yellow-600 tracking-[0.3em]">Operational Area Active</span>
                 </div>
              </div>

              <div className="pb-2">
                 <Link href="/posts/create" className="btn-premium bg-black text-white shadow-2xl hover:-translate-y-1">
                    🖋️ Create Campaign
                 </Link>
              </div>
           </div>
        </header>

        {/* Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
           <div className="glass-card p-10 bg-white group hover:border-black transition-all">
              <div className="admin-label mb-8 group-hover:text-black">Scheduled content</div>
              <div className="flex items-end justify-between">
                 <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black font-display leading-none">{scheduledCount < 10 ? `0${scheduledCount}` : scheduledCount}</span>
                    <span className="admin-label text-gray-300">Pipeline</span>
                 </div>
                 <Link href="/calendar" className="text-[10px] font-black uppercase text-gray-400 group-hover:text-black">Calendar &rarr;</Link>
              </div>
           </div>

           <div className="glass-card p-10 bg-white group hover:border-black transition-all">
              <div className="admin-label mb-8 group-hover:text-black">Social tokens</div>
              <div className="flex items-end justify-between">
                 <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black font-display leading-none">{connectedCount < 10 ? `0${connectedCount}` : connectedCount}</span>
                    <span className="admin-label text-gray-300">Active</span>
                 </div>
                 <Link href="/connections" className="text-[10px] font-black uppercase text-gray-400 group-hover:text-black">Manage &rarr;</Link>
              </div>
           </div>

           <div className="glass-card p-10 bg-black text-white relative overflow-hidden group shadow-2xl shadow-gray-900/10">
              <div className="absolute -right-6 -bottom-6 text-9xl opacity-20 pointer-events-none group-hover:rotate-12 transition-transform font-display">✨</div>
              <div className="admin-label text-gray-500 mb-8 tracking-[0.4em]">Optimization Engine</div>
              <div className="z-10 relative">
                 <p className="text-lg font-bold font-sans leading-tight mb-4 italic opacity-80">"Suggested window: 6:30 PM for high engagement."</p>
                 <Link href="/posts/create" className="text-[10px] font-black uppercase text-yellow-400">Apply Guidance &rarr;</Link>
              </div>
           </div>
        </div>

        {/* Activity Stream */}
        <section className="space-y-10">
           <div className="flex items-center justify-between">
              <h2 className="admin-label tracking-[0.4em] text-gray-400">Activity Stream Matrix</h2>
              <div className="h-[1px] flex-1 bg-gray-100 mx-10"></div>
              <button className="admin-label text-gray-300 hover:text-black">Live Update</button>
           </div>
           
           <div className="glass-card p-24 text-center space-y-6 border-dashed border-2 bg-gray-50/10">
              <div className="w-20 h-20 bg-gray-200/50 rounded-full flex items-center justify-center mx-auto text-3xl opacity-40 animate-float">🎛️</div>
              <div className="space-y-2">
                 <h4 className="text-3xl font-black font-display tracking-tight">Signal Latency.</h4>
                 <p className="admin-label text-gray-400 tracking-[0.2em] max-w-sm mx-auto leading-relaxed lowercase">
                    Establish platform connectivity to initialize the real-time activity stream for {activeClient.name}.
                 </p>
              </div>
              <Link href="/connections" className="inline-flex btn-premium bg-gray-100 text-gray-400 hover:bg-black hover:text-white transition-all scale-95 shadow-none hover:shadow-xl">
                 Establish Handshake
              </Link>
           </div>
        </section>
      </main>
    </div>
  );
}
