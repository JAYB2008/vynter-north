"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import {
  Sun,
  Moon,
  Bell,
  ChevronDown,
  LayoutDashboard,
  RefreshCw,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShoppingBag,
  Layers,
  Bot,
  Trophy,
  Clapperboard,
  Tag,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, activeMode, isAuthenticated, switchMode, signOut } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/skills", label: "Skills", icon: Layers },
    { href: "/demo", label: "Demo", icon: Sparkles },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/casting", label: "Casting", icon: Clapperboard },
    { href: "/connect", label: "Connect", icon: Bot },
    { href: "/pricing", label: "Pricing", icon: Tag },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSwitchMode = async (target: "creator" | "studio") => {
    setDropdownOpen(false);
    const ok = await switchMode(target);
    if (ok) {
      if (target === "creator") {
        router.push("/dashboard");
      } else {
        router.push("/studio/overview");
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-panel/95 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Universal Logo */}
        <div className="flex items-center gap-6">
          <Logo size="md" />

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-[6px] text-sm font-medium transition-colors ${
                    isActive
                      ? "text-text bg-panel-raised font-semibold border border-line"
                      : "text-dim hover:text-text hover:bg-panel-raised/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-[6px] border border-line bg-panel-raised text-dim hover:text-text focus-ring transition-colors cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-marquee" />
              ) : (
                <Moon className="w-4 h-4 text-glacier" />
              )}
            </button>
          )}

          {/* Authenticated State */}
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Notification Bell */}
              <Link
                href={activeMode === "creator" ? "/dashboard/notifications" : "/studio/notifications"}
                aria-label="Notifications"
                className="p-2 rounded-[6px] border border-line bg-panel-raised text-dim hover:text-text relative focus-ring transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-glacier absolute top-1.5 right-1.5 ring-2 ring-night" />
              </Link>

              {/* Mode Chip */}
              <span
                className={`text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-[4px] border ${
                  activeMode === "creator"
                    ? "bg-glacier/10 text-glacier border-glacier/30"
                    : "bg-marquee/10 text-marquee border-marquee/30"
                }`}
              >
                {activeMode === "creator" ? "Creator" : "Studio"}
              </span>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-[6px] border border-line bg-panel-raised hover:border-glacier transition-all cursor-pointer focus-ring"
                >
                  <div className="w-7 h-7 rounded-full bg-glacier/20 text-glacier flex items-center justify-center text-xs font-semibold uppercase">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.display_name.slice(0, 2)
                    )}
                  </div>
                  <span className="text-xs font-medium text-text max-w-[120px] truncate">
                    {user.display_name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-dim" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 rounded-[8px] border border-line bg-panel shadow-2xl z-50 p-1.5 text-sm">
                      <div className="px-3 py-2 border-b border-line mb-1">
                        <p className="font-semibold text-xs text-text truncate">
                          {user.display_name}
                        </p>
                        <p className="text-[11px] text-dim font-mono">
                          @{user.username}
                        </p>
                      </div>

                      <Link
                        href={activeMode === "creator" ? "/dashboard" : "/studio/overview"}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] hover:bg-panel-raised text-dim hover:text-text transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-glacier" />
                        <span>{activeMode === "creator" ? "Creator dashboard" : "Studio workspace"}</span>
                      </Link>

                      {/* Switch Mode Option */}
                      {user.has_creator && user.has_studio ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleSwitchMode(activeMode === "creator" ? "studio" : "creator")
                          }
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] hover:bg-panel-raised text-dim hover:text-text transition-colors text-left"
                        >
                          <RefreshCw className="w-4 h-4 text-marquee" />
                          <span>
                            Switch to {activeMode === "creator" ? "Studio" : "Creator"} mode
                          </span>
                        </button>
                      ) : !user.has_studio ? (
                        <Link
                          href="/onboarding?add=studio"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] hover:bg-panel-raised text-dim hover:text-text transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-marquee" />
                          <span>Add Studio profile</span>
                        </Link>
                      ) : (
                        <Link
                          href="/onboarding?add=creator"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] hover:bg-panel-raised text-dim hover:text-text transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-glacier" />
                          <span>Add Creator profile</span>
                        </Link>
                      )}

                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] hover:bg-panel-raised text-dim hover:text-text transition-colors"
                      >
                        <Settings className="w-4 h-4 text-dim" />
                        <span>Account settings</span>
                      </Link>

                      <div className="border-t border-line my-1" />

                      <button
                        type="button"
                        onClick={signOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] hover:bg-bad/10 text-bad transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/signin"
                className="px-3.5 py-1.5 text-sm font-medium text-dim hover:text-text transition-colors"
              >
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary text-xs !min-h-[36px] py-1">
                Get started
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-[6px] border border-line bg-panel-raised text-dim hover:text-text focus-ring"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-line bg-panel px-4 py-4 space-y-4">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-[6px] text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-panel-raised text-text font-semibold"
                      : "text-dim hover:text-text hover:bg-panel-raised/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-line pt-3">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-panel-raised rounded-[6px] border border-line">
                  <p className="text-sm font-semibold text-text truncate">
                    {user.display_name}
                  </p>
                  <p className="text-xs text-dim font-mono">@{user.username}</p>
                </div>

                <Link
                  href={activeMode === "creator" ? "/dashboard" : "/studio/overview"}
                  className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-sm text-dim hover:text-text hover:bg-panel-raised"
                >
                  <LayoutDashboard className="w-4 h-4 text-glacier" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-sm text-dim hover:text-text hover:bg-panel-raised"
                >
                  <Settings className="w-4 h-4 text-dim" />
                  <span>Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[6px] text-sm text-bad hover:bg-bad/10 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/signin"
                  className="btn-secondary text-center text-sm !min-h-[40px]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-center text-sm !min-h-[40px]"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
