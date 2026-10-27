"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  BrainCircuit,
  Sun,
  Moon,
  Sparkles,
  ShoppingBag,
  Layers,
  Bot,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  SwitchCamera,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, role, isAuthenticated, setRole, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/skills", label: "Skills", icon: Layers },
    { href: "/demo", label: "Demo", icon: Sparkles },
    { href: "/connect", label: "Connect", icon: Bot },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleRole = () => {
    const nextRole = role === "studio" ? "creator" : "studio";
    setRole(nextRole);
    if (pathname.startsWith("/dashboard")) {
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-app bg-card-app/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] flex items-center justify-center shadow-md shadow-[#7C3AED]/30 group-hover:scale-105 transition-transform duration-200">
            <span className="font-black text-white text-base tracking-tighter">VN</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-primary-app group-hover:text-[#A78BFA] transition-colors leading-tight">
              VYNTER <span className="accent-purple">NORTH</span>
            </span>
            <span className="text-[10px] tracking-wider text-muted-app font-medium -mt-1 hidden sm:inline">
              Character Registry & MCP Layer
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#7C3AED] text-white shadow-sm shadow-[#7C3AED]/30 font-semibold"
                    : "text-secondary-app hover:text-primary-app hover:bg-elevated-app"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle, Quick Role Switcher, User Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher pill */}
          {isAuthenticated && (
            <button
              onClick={toggleRole}
              title={`Currently acting as ${role}. Click to switch to ${
                role === "studio" ? "creator" : "studio"
              }.`}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-app bg-elevated-app hover:border-[#7C3AED] transition-colors text-secondary-app"
            >
              <SwitchCamera className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span className="capitalize">{role} Mode</span>
            </button>
          )}

          {/* Theme Toggle (Dark / Light) */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg border border-app bg-elevated-app text-secondary-app hover:text-primary-app transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          )}

          {/* Auth State */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-app bg-elevated-app hover:border-[#7C3AED] transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white text-xs font-bold">
                  {user.display_name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-primary-app hidden sm:inline max-w-[100px] truncate">
                  {user.display_name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-app" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-app bg-card-app shadow-xl z-50 p-2 text-sm text-primary-app">
                    <div className="px-3 py-2 border-b border-app mb-1">
                      <p className="font-bold text-xs text-primary-app">
                        {user.display_name}
                      </p>
                      <p className="text-[11px] text-muted-app capitalize">
                        {user.role} Account • {user.verified ? "Verified" : "Active"}
                      </p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-elevated-app text-secondary-app hover:text-primary-app"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#7C3AED]" />
                      <span>Dashboard</span>
                    </Link>

                    {role === "creator" ? (
                      <Link
                        href="/dashboard/characters"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-elevated-app text-secondary-app hover:text-primary-app"
                      >
                        <User className="w-4 h-4 text-[#7C3AED]" />
                        <span>My Characters</span>
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard/rentals"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-elevated-app text-secondary-app hover:text-primary-app"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                        <span>My Rentals</span>
                      </Link>
                    )}

                    <Link
                      href="/dashboard/connect"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-elevated-app text-secondary-app hover:text-primary-app"
                    >
                      <Bot className="w-4 h-4 text-[#7C3AED]" />
                      <span>MCP Connect Key</span>
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-elevated-app text-secondary-app hover:text-primary-app"
                    >
                      <User className="w-4 h-4 text-[#7C3AED]" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-app my-1" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-500 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium text-secondary-app hover:text-primary-app transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold shadow-md shadow-[#7C3AED]/25 transition-all cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
