"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Profile, UserRole } from "./types";
import { DEMO_CREATOR, DEMO_STUDIO } from "./db";

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginAs: (role: UserRole) => void;
  setUserProfile: (profile: Profile) => void;
  setRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: DEMO_STUDIO,
  role: "studio",
  isAuthenticated: true,
  loginAs: () => {},
  setUserProfile: () => {},
  setRole: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(DEMO_STUDIO);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("vynter_active_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch {
        setUser(DEMO_STUDIO);
      }
    }
  }, []);

  const loginAs = (targetRole: UserRole) => {
    const selected = targetRole === "creator" ? DEMO_CREATOR : DEMO_STUDIO;
    setUser(selected);
    localStorage.setItem("vynter_active_profile", JSON.stringify(selected));
    document.cookie = `vynter_auth_token=active; path=/; max-age=86400`;
  };

  const setUserProfile = (profile: Profile) => {
    setUser(profile);
    localStorage.setItem("vynter_active_profile", JSON.stringify(profile));
    document.cookie = `vynter_auth_token=active; path=/; max-age=86400`;
  };

  const setRole = (newRole: UserRole) => {
    if (!user) {
      loginAs(newRole);
      return;
    }
    const updated: Profile = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem("vynter_active_profile", JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vynter_active_profile");
    document.cookie = `vynter_auth_token=; path=/; max-age=0`;
  };

  const role: UserRole = user?.role || "studio";
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user: mounted ? user : DEMO_STUDIO,
        role: mounted ? role : "studio",
        isAuthenticated: mounted ? isAuthenticated : true,
        loginAs,
        setUserProfile,
        setRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
