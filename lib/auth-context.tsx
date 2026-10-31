"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Profile, UserRole } from "./types";
import { DEMO_CREATOR, DEMO_STUDIO } from "./db";
import { createClient } from "./supabase/client";

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAs: (role: UserRole) => void;
  loginWithName: (name: string) => { profile: Profile; isNew: boolean };
  updateProfile: (updates: Partial<Profile>) => Profile | null;
  setUserProfile: (profile: Profile) => void;
  setRole: (role: UserRole) => void;
  refreshProfile: () => Promise<Profile | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "studio",
  isAuthenticated: false,
  isLoading: true,
  loginAs: () => {},
  loginWithName: () => {
    throw new Error("AuthProvider missing");
  },
  updateProfile: () => null,
  setUserProfile: () => {},
  setRole: () => {},
  refreshProfile: async () => null,
  logout: async () => {},
});

/* ------------------------------------------------------------------ */
/* Testing-mode name accounts                                          */
/* ------------------------------------------------------------------ */

const ACTIVE_KEY = "vynter_active_profile";
const ACCOUNTS_KEY = "vynter_name_accounts";

export function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Deterministic hex string derived from a seed (FNV-1a, chained). */
function hashHex(seed: string, length: number) {
  let out = "";
  let h = 0x811c9dc5;
  let round = 0;
  while (out.length < length) {
    const input = `${seed}:${round++}`;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    out += h.toString(16).padStart(8, "0");
  }
  return out.slice(0, length);
}

function nameToId(norm: string) {
  const h = hashHex(`id:${norm}`, 32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function readAccounts(): Record<string, Profile> {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAccount(profile: Profile) {
  const accounts = readAccounts();
  // Refresh every alias (original login name, renamed display name) for this id
  for (const key of Object.keys(accounts)) {
    if (accounts[key]?.id === profile.id) accounts[key] = profile;
  }
  accounts[normalizeName(profile.display_name)] = profile;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

/** Best-effort sync to the server profile store (used by MCP account keys). */
function syncProfileToServer(profile: Profile) {
  fetch("/api/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  }).catch(() => {});
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  const fetchProfile = async (userId: string, email?: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        return data as Profile;
      }

      // If user exists in auth but no profile row yet, create fallback profile object
      if (error && error.code === "PGRST116") {
        const fallbackProfile: Profile = {
          id: userId,
          display_name: email ? email.split("@")[0] : "Vynter User",
          role: "creator",
          bio: "",
          avatar_url: null,
          account_key: `vn-${userId.replace(/-/g, "").slice(0, 20)}`,
          total_earnings: 0,
          onboarding_completed: false,
          verified: false,
          created_at: new Date().toISOString(),
        };
        return fallbackProfile;
      }
    } catch (err) {
      console.warn("Error loading profile from Supabase:", err);
    }
    return null;
  };

  const refreshProfile = async (): Promise<Profile | null> => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const profile = await fetchProfile(authUser.id, authUser.email);
        if (profile) {
          setUser(profile);
          return profile;
        }
      }
    } catch (e) {
      console.warn("refreshProfile error:", e);
    }
    return null;
  };

  useEffect(() => {
    setMounted(true);

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await fetchProfile(
            session.user.id,
            session.user.email
          );
          if (profile) {
            setUser(profile);
          }
        } else {
          // Check local storage for demo/cached session
          const saved = localStorage.getItem("vynter_active_profile");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setUser(parsed);
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.warn("Auth initialization warning:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(
          session.user.id,
          session.user.email
        );
        setUser(profile);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("vynter_active_profile");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginAs = (targetRole: UserRole) => {
    const selected = targetRole === "creator" ? DEMO_CREATOR : DEMO_STUDIO;
    setUser(selected);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(selected));
    document.cookie = `vynter_auth_token=active; path=/; max-age=86400`;
  };

  /** Testing mode: type a name to create an account or log back into it. */
  const loginWithName = (name: string) => {
    const display = name.trim().replace(/\s+/g, " ");
    const norm = normalizeName(display);
    if (norm.length < 2) throw new Error("Please enter at least 2 characters.");

    const existing = readAccounts()[norm];
    const profile: Profile = existing || {
      id: nameToId(norm),
      display_name: display,
      username: norm.replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || null,
      role: "creator",
      bio: null,
      avatar_url: null,
      account_key: `vn-${hashHex(`key:${norm}`, 40)}`,
      total_earnings: 0,
      total_spent: 0,
      onboarding_completed: false,
      verified: false,
      created_at: new Date().toISOString(),
    };

    writeAccount(profile);
    setUser(profile);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(profile));
    document.cookie = `vynter_auth_token=active; path=/; max-age=2592000`;
    syncProfileToServer(profile);
    return { profile, isNew: !existing };
  };

  const updateProfile = (updates: Partial<Profile>) => {
    if (!user) return null;
    const updated: Profile = {
      ...user,
      ...updates,
      id: user.id,
      updated_at: new Date().toISOString(),
    };
    setUser(updated);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(updated));
    writeAccount(updated);
    syncProfileToServer(updated);
    return updated;
  };

  const setUserProfile = (profile: Profile) => {
    setUser(profile);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(profile));
    writeAccount(profile);
    syncProfileToServer(profile);
  };

  const setRole = (newRole: UserRole) => {
    if (!user) {
      loginAs(newRole);
      return;
    }
    updateProfile({ role: newRole });
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut error:", e);
    }
    setUser(null);
    localStorage.removeItem("vynter_active_profile");
    document.cookie = `vynter_auth_token=; path=/; max-age=0`;
  };

  const role: UserRole = user?.role || "creator";
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user: mounted ? user : null,
        role: mounted ? role : "creator",
        isAuthenticated: mounted ? isAuthenticated : false,
        isLoading,
        loginAs,
        loginWithName,
        updateProfile,
        setUserProfile,
        setRole,
        refreshProfile,
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
