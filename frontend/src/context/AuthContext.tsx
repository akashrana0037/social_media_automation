"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  adminName: string;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  updateAdminName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState("Vyom S.");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = localStorage.getItem("isAuth");
    const storedName = localStorage.getItem("adminName");
    
    if (auth === "true") {
      setIsAuthenticated(true);
    } else if (pathname !== "/login" && pathname !== "/register") {
      router.push("/login");
    }

    if (storedName) {
      setAdminName(storedName);
    }
  }, [pathname, router]);

  const login = (u: string, p: string) => {
    if (u === "akash" && p === "1234") {
      setIsAuthenticated(true);
      localStorage.setItem("isAuth", "true");
      router.push("/");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuth");
    router.push("/login");
  };

  const updateAdminName = (name: string) => {
    setAdminName(name);
    localStorage.setItem("adminName", name);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminName, login, logout, updateAdminName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
