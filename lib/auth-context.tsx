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
  setUserProfile: () => {},
  setRole: () => {},
  refreshProfile: async () => null,
  logout: async () => {},
});

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
    localStorage.setItem("vynter_active_profile", JSON.stringify(selected));
    document.cookie = `vynter_auth_token=active; path=/; max-age=86400`;
  };

  const setUserProfile = (profile: Profile) => {
    setUser(profile);
    localStorage.setItem("vynter_active_profile", JSON.stringify(profile));
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
