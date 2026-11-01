"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Account, UserMode } from "./types";
import { apiFetch } from "./api";

interface AuthContextType {
  user: Account | null;
  activeMode: UserMode;
  role: UserMode;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  refreshUser: () => Promise<Account | null>;
  switchMode: (targetMode: UserMode) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  activeMode: "creator",
  role: "creator",
  isAuthenticated: false,
  isLoading: true,
  loading: true,
  refreshUser: async () => null,
  switchMode: async () => false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<Account | null> => {
    try {
      const res = await apiFetch<Account>("/api/auth/me");
      if (res.ok && res.data) {
        setUser(res.data);
        return res.data;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const switchMode = async (targetMode: UserMode): Promise<boolean> => {
    if (!user) return false;
    const res = await apiFetch<Account>("/api/auth/switch-mode", {
      method: "POST",
      body: JSON.stringify({ mode: targetMode }),
    });
    if (res.ok && res.data) {
      setUser(res.data);
      return true;
    }
    return false;
  };

  const signOut = async (): Promise<void> => {
    await apiFetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  // Derive activeMode
  const activeMode: UserMode =
    user?.active_mode ||
    (user?.has_studio && !user?.has_creator ? "studio" : "creator");

  return (
    <AuthContext.Provider
      value={{
        user,
        activeMode,
        role: activeMode,
        isAuthenticated: Boolean(user),
        isLoading,
        loading: isLoading,
        refreshUser,
        switchMode,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
