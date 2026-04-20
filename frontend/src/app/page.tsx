"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import { useClient } from "@/context/ClientContext";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";

function DashboardContent() {
  const { clients, setActiveClient } = useClient();
  const { adminName } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  const backendUrl = "https://unbiased-sponge-workable.ngrok-free.app";

  useEffect(() => {
    const action = searchParams.get("action");
    setIsAdding(action === "add_client");
    setIsDeleting(action === "delete_mode");
  }, [searchParams]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === "all" || (filter === "offline" && c.token_status === "critical") || (filter === "active" && c.token_status === "healthy");
      return matchesSearch && matchesFilter;
    });
  }, [clients, searchTerm, filter]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;
    try {
      const res = await fetch(`${backendUrl}/api/clients/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClientName, industry: newIndustry })
      });
      if (res.ok) window.location.href = "/";
    } catch (err) { console.error("Add failed"); }
  };

  const handleDeleteClient = async (clientId: number) => {
    if (!confirm("Delete this client?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/clients/${clientId}`, { method: "DELETE" });
      if (res.ok) window.location.reload();
    } catch (err) { console.error("Remove failed"); }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] text-[#111] font-sans selection:bg-yellow-200 uppercase tracking-tight relative overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-12 overflow-y-auto relative z-10 no-scrollbar">
        
        <header className="mb-16">
           <div className="flex justify-between items-start mb-12">
              <div className="space-y-4">
                 <div className="admin-label text-gray-400 underline">System Admin: {adminName}</div>
                 <h1 className="text-7xl font-black font-display tracking-tight leading-none">Clients.</h1>
              </div>
              <button onClick={() => router.push("/?action=add_client")} className="btn-premium bg-black text-white shadow-xl">
                + Add Client
              </button>
           </div>

           <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative group">
                 <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20">🔍</span>
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search Brands..." 
                   className="w-full bg-[#F3F4F6]/50 border-none rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-4 focus:ring-yellow-400/10 transition-all outline-none"
                 />
              </div>
              <div className="flex bg-[#F3F4F6]/50 rounded-2xl p-1 font-black text-[9px] tracking-widest uppercase">
                 {['all', 'active', 'offline'].map(f => (
                   <button 
                    key={f} 
                    onClick={() => setFilter(f)}
                    className={`px-6 py-3 rounded-xl transition-all ${filter === f ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-black'}`}
                   >
                     {f}
                   </button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Total Clients", val: clients.length },
                { label: "Active Connections", val: "08" },
                { label: "Monthly Activity", val: "1.4k" },
                { label: "Platform Status", val: "Ready" }
              ].map((s, i) => (
                <div key={i} className="glass-card p-6 flex flex-col items-center">
                   <div className="admin-label opacity-40 mb-1">{s.label}</div>
                   <div className="text-xl font-black font-display">{s.val}</div>
                </div>
              ))}
           </div>
        </header>

        {isAdding && (
          <div className="mb-12 animate-in slide-in-from-top-4 duration-500">
             <div className="glass-card p-12 bg-black text-white">
                <h3 className="text-4xl font-black font-display mb-8">Add Brand.</h3>
                <form onSubmit={handleAddClient} className="space-y-4 max-w-xl">
                   <input type="text" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Brand Name" className="premium-input bg-white/5 text-white" />
                   <div className="flex gap-4">
                      <button type="submit" className="flex-1 btn-premium bg-yellow-400 text-black">Create</button>
                      <button type="button" onClick={() => router.push("/")} className="px-10 btn-premium bg-white/5 text-gray-400">Cancel</button>
                   </div>
                </form>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
           {filteredClients.map(client => (
             <div 
               key={client.id} 
               onClick={() => { if (!isDeleting) { setActiveClient(client); router.push("/workspace"); }}}
               className={`glass-card p-6 flex flex-col h-48 cursor-pointer hover:border-yellow-400 hover:-translate-y-1 transition-all relative overflow-hidden group ${client.token_status === 'critical' ? 'border-red-100' : ''}`}
             >
                <div className="absolute -right-6 -bottom-6 text-7xl font-black text-gray-100 font-display opacity-10 group-hover:text-yellow-400 group-hover:opacity-20 transition-all">
                   {client.name[0]}
                </div>
                
                <div className="flex justify-between items-start mb-auto relative z-10">
                   <div className={`w-2.5 h-2.5 rounded-full ${client.token_status === 'critical' ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'bg-green-500 shadow-lg shadow-green-500/20'}`}></div>
                   {isDeleting && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id); }} className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-black shadow-xl">✕</button>
                   )}
                </div>

                <div className="relative z-10">
                   <h3 className="text-lg font-black font-display leading-tight uppercase truncate">{client.name}</h3>
                   <p className="admin-label text-gray-300 lowercase mt-0.5">{client.industry || "General"}</p>
                </div>
             </div>
           ))}
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div>Establishing Terminal...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
