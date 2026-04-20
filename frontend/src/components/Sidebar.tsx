"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClient } from "@/context/ClientContext";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeClient, setActiveClient, clients } = useClient();
  const { adminName, logout, updateAdminName } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempName, setTempName] = useState(adminName);
  const [clientSearch, setClientSearch] = useState("");

  const isAdminPath = pathname === "/";
  const isClientPath = !isAdminPath && activeClient;

  // Search logic for dropdown
  const filteredClients = useMemo(() => {
    return clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));
  }, [clients, clientSearch]);
  
  const clientItems = (activeClient && !isAdminPath) ? [
    { name: "Stats", href: "/workspace", icon: "📊" },
    { name: "Create Post", href: "/posts/create", icon: "🖋️" },
    { name: "Calendar", href: "/calendar", icon: "📅" },
    { name: "Accounts", href: "/connections", icon: "🔌" },
  ] : [];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminName(tempName);
    setIsProfileModalOpen(false);
  };

  return (
    <>
      <aside className="sidebar-container font-sans flex flex-col justify-between">
        <div>
          {/* Selector - Scaled for 100+ Clients */}
          <div className="p-6 pb-2">
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-yellow-400 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center font-black text-xs uppercase text-black">
                      {isAdminPath ? "A" : (activeClient?.name?.[0] || "A")}
                   </div>
                   <div className="text-left leading-tight">
                      <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{isAdminPath ? "Admin" : "Client"}</div>
                      <div className="text-xs font-bold text-gray-900 truncate max-w-[120px]">
                        {isAdminPath ? "Portfolio" : activeClient?.name}
                      </div>
                   </div>
                </div>
                <span className="text-[8px] transform">▼</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col max-h-[400px]">
                   <div className="p-3 bg-gray-50/50 border-b border-gray-100 space-y-2">
                      <div className="flex justify-between items-center px-2">
                         <span className="text-[9px] font-black text-gray-400 uppercase">Select Client</span>
                         <Link href="/" onClick={() => setActiveClient(null as any)} className="text-[9px] font-bold text-yellow-600 hover:underline">Exit to Admin</Link>
                      </div>
                      <input 
                         type="text" 
                         autoFocus
                         value={clientSearch}
                         onChange={(e) => setClientSearch(e.target.value)}
                         placeholder="Search 100+ clients..."
                         className="w-full p-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold outline-none focus:border-yellow-400 transition-all"
                      />
                   </div>
                   <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                     {filteredClients.length > 0 ? (
                       filteredClients.map(c => (
                         <button
                           key={c.id}
                           onClick={() => { setActiveClient(c); setIsDropdownOpen(false); setClientSearch(""); router.push("/workspace"); }}
                           className="w-full text-left p-3 px-4 hover:bg-yellow-50 flex items-center gap-3 cursor-pointer transition-colors"
                         >
                           <div className={`w-2 h-2 rounded-full ${activeClient?.id === c.id ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
                           <span className={`text-[11px] font-bold ${activeClient?.id === c.id ? 'text-black' : 'text-gray-500'}`}>{c.name}</span>
                         </button>
                       ))
                     ) : (
                       <div className="p-4 text-center text-[10px] text-gray-400 font-bold uppercase">No brands found</div>
                     )}
                   </div>
                </div>
              )}
            </div>
          </div>

          <nav className="p-6 space-y-1">
            {clientItems.length > 0 ? (
              <div className="space-y-1">
                <div className="admin-label mb-4 px-3 opacity-60">Control</div>
                {clientItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            ) : isAdminPath ? (
               <div className="p-4 bg-white border border-dashed border-gray-200 rounded-2xl mb-8">
                  <p className="text-[9px] font-bold text-gray-300 uppercase text-center leading-relaxed italic">Select workspace<br/>from the list above</p>
               </div>
            ) : null}

            {isAdminPath && (
                <div className="pt-8 space-y-1">
                    <div className="admin-label mb-4 px-3 opacity-60">Admin</div>
                    <Link
                        href="/"
                        className="sidebar-nav-item bg-black text-white active"
                        style={{ background: 'black', color: 'white' }}
                    >
                        <span>🌍</span> Dashboard
                    </Link>
                    
                    <Link href="/?action=add_client" className="sidebar-nav-item hover:text-green-600 hover:bg-green-50">
                        <span>➕</span> Add Client
                    </Link>
                    
                    <Link href="/?action=delete_mode" className="sidebar-nav-item hover:text-red-600 hover:bg-red-50">
                        <span>🗑️</span> Delete Client
                    </Link>
                </div>
            )}
            
            {isClientPath && (
                <div className="pt-8 border-t border-gray-50 mt-8">
                     <Link
                        href="/"
                        onClick={() => setActiveClient(null as any)}
                        className="sidebar-nav-item hover:text-red-600 hover:bg-red-50"
                        style={{ fontSize: '9px', letterSpacing: '0.1em' }}
                    >
                        <span>🚪</span> Back to Admin
                     </Link>
                </div>
            )}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white">
           <div className="flex items-center justify-between group mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black shadow-xl group-hover:scale-110 transition-transform cursor-pointer" onClick={() => { setTempName(adminName); setIsProfileModalOpen(true); }}>
                    {adminName[0]}
                 </div>
                 <div className="max-w-[70px]">
                    <div className="text-[9px] font-black uppercase tracking-tight truncate">{adminName}</div>
                    <button 
                      onClick={() => { setTempName(adminName); setIsProfileModalOpen(true); }}
                      className="text-[7px] font-bold text-blue-500 uppercase tracking-widest hover:underline cursor-pointer"
                    >
                      Profile
                    </button>
                 </div>
              </div>
              <button 
                 onClick={logout}
                 title="Logout"
                 className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all text-xs cursor-pointer"
              >
                 🔌
              </button>
           </div>
           <div className="px-2">
              <div className="text-[7px] font-black text-gray-300 uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden">Enterprise Node v3.0</div>
           </div>
        </div>
      </aside>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-200">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProfileModalOpen(false)}></div>
           <div className="w-full max-w-sm bg-black text-white rounded-[2.5rem] p-10 shadow-3xl relative z-10 animate-in zoom-in-95 border border-white/5">
              <h3 className="text-2xl font-black font-display mb-2 uppercase">Identify Admin.</h3>
              <p className="admin-label text-gray-500 mb-8 lowercase">update display name</p>
              
              <form onSubmit={handleSaveProfile} className="space-y-6">
                 <input 
                   type="text" 
                   autoFocus
                   value={tempName}
                   onChange={(e) => setTempName(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-black focus:border-yellow-400 outline-none transition-all"
                 />
                 <div className="flex gap-4 pt-4">
                   <button type="submit" className="flex-1 btn-premium bg-yellow-400 text-black">Update</button>
                   <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-8 btn-premium bg-white/5 text-gray-400">Cancel</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </>
  );
}
