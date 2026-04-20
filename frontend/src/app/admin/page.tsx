"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useClient } from "@/context/ClientContext";

export default function AdminDashboard() {
  const { clients, setActiveClient } = useClient();
  const [newClientName, setNewClientName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const backendUrl = "https://unbiased-sponge-workable.ngrok-free.app";

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;

    try {
      const res = await fetch(`${backendUrl}/api/clients/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClientName })
      });
      if (res.ok) {
        window.location.reload(); // Refresh to get new client
      }
    } catch (err) {
      console.error("Failed to add client");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
           <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">Agency Portfolio</h1>
              <p className="text-sm text-gray-500 font-medium">Manage workspaces and clients across your organization.</p>
           </div>
           <button 
             onClick={() => setIsAdding(true)}
             className="btn-simple btn-yellow px-8 py-3 font-black uppercase text-[11px] shadow-xl shadow-yellow-500/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
           >
             + Onboard New Client
           </button>
        </header>

        {isAdding && (
          <div className="mb-12 animate-in slide-in-from-top-4 duration-500">
             <div className="simple-card p-8 bg-yellow-50/30 border-yellow-100 flex items-center justify-between">
                <form onSubmit={handleAddClient} className="flex gap-4 flex-1 max-w-xl">
                   <input 
                     type="text" 
                     value={newClientName}
                     onChange={(e) => setNewClientName(e.target.value)}
                     placeholder="Enter Brand Name (e.g. Nike, Starbucks)"
                     className="flex-1 bg-white border border-yellow-200 rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400/10 transition-all"
                   />
                   <button type="submit" className="btn-simple btn-black px-6 text-xs uppercase">Create Workspace</button>
                </form>
                <button onClick={() => setIsAdding(false)} className="text-xs font-bold text-gray-400 hover:text-black">Cancel</button>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {clients.map(client => (
             <div key={client.id} className="simple-card p-8 flex flex-col group hover:shadow-2xl hover:shadow-gray-200/50 transition-all">
                <div className="flex justify-between items-start mb-10">
                   <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl font-black group-hover:bg-yellow-400 group-hover:border-yellow-400 transition-colors">
                      {client.name[0].toUpperCase()}
                   </div>
                   <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[8px] font-black uppercase tracking-widest">Active</div>
                </div>

                <h3 className="text-xl font-black tracking-tight mb-2 uppercase">{client.name}</h3>
                <div className="space-y-4 mb-10">
                   <div className="flex items-center justify-between text-[10px] border-b border-gray-50 pb-2">
                      <span className="text-gray-400 font-bold uppercase tracking-widest">Active Tokens</span>
                      <span className="font-black text-gray-900">2 Platforms</span>
                   </div>
                   <div className="flex items-center justify-between text-[10px] border-b border-gray-50 pb-2">
                      <span className="text-gray-400 font-bold uppercase tracking-widest">Sch. Posts</span>
                      <span className="font-black text-gray-900">14 pending</span>
                   </div>
                </div>

                <div className="mt-auto flex gap-2">
                   <button 
                     onClick={() => { setActiveClient(client); window.location.href = "/"; }}
                     className="flex-1 btn-simple btn-white py-3 text-[10px] uppercase font-black"
                   >
                     Enter Workspace
                   </button>
                   <button 
                     onClick={async () => {
                       if (confirm(`Are you sure you want to delete ${client.name}? All posts and tokens will be permanently removed.`)) {
                          try {
                            const res = await fetch(`${backendUrl}/api/clients/${client.id}`, { method: 'DELETE' });
                            if (res.ok) window.location.reload();
                          } catch (err) {
                            console.error("Delete failed");
                          }
                       }
                     }}
                     className="p-3 border border-gray-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                   >
                     🗑️
                   </button>
                </div>
             </div>
           ))}
        </div>
      </main>
    </div>
  );
}
