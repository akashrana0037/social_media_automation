"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError("Invalid credential details. Please check and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 selection:bg-yellow-200">
       <div className="w-full max-w-sm space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-4">
             <div className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-2xl shadow-yellow-400/20">🔑</div>
             <h1 className="text-4xl font-black tracking-tight text-black uppercase">Command <span className="text-yellow-500">Center.</span></h1>
             <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Social Sync v2.0 Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Username</label>
                   <input 
                     type="text" 
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     className="w-full h-14 bg-gray-50 border border-transparent rounded-2xl p-5 text-sm font-bold focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all outline-none"
                     placeholder="Enter username"
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Access Passphrase</label>
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full h-14 bg-gray-50 border border-transparent rounded-2xl p-5 text-sm font-bold focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all outline-none"
                     placeholder="••••••••"
                   />
                </div>
             </div>

             {error && (
               <div className="p-4 bg-red-50 rounded-xl text-red-600 text-[10px] font-black uppercase text-center animate-in zoom-in-95 duration-300">
                  {error}
               </div>
             )}

             <button 
               type="submit" 
               className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-[0.98] shadow-xl shadow-gray-200/50"
             >
               Authenticate &rarr;
             </button>
          </form>

          <footer className="text-center">
             <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.3em]">Encrypted Session Active</p>
          </footer>
       </div>
    </div>
  );
}
