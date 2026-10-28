"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
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
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, role, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/skills", label: "Skills", icon: Layers },
    { href: "/demo", label: "Demo", icon: Sparkles },
    { href: "/connect", label: "Connect", icon: Bot },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-app bg-card-app/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo: "VN" in purple square + "Vynter North" text */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center shadow-md shadow-[#7C3AED]/30 group-hover:bg-[#6D28D9] transition-all duration-200">
            <span className="font-black text-white text-base tracking-tighter">VN</span>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-primary-app group-hover:text-[#7C3AED] transition-colors leading-tight">
            Vynter <span className="accent-purple">North</span>
          </span>
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

        {/* Right Actions: Dark/Light toggle + Login OR Avatar Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg border border-app bg-elevated-app text-secondary-app hover:text-primary-app transition-colors cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#7C3AED]" />
              )}
            </button>
          )}

          {/* Desktop Auth State */}
          <div className="hidden sm:flex items-center">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-app bg-elevated-app hover:border-[#7C3AED] transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white text-xs font-bold">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.display_name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-semibold text-primary-app max-w-[120px] truncate">
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
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-app bg-card-app shadow-2xl z-50 p-2 text-sm text-primary-app">
                      <div className="px-3 py-2 border-b border-app mb-1">
                        <p className="font-bold text-xs text-primary-app truncate">
                          {user.display_name}
                        </p>
                        <p className="text-[11px] text-muted-app capitalize">
                          {user.role} Account {user.onboarding_completed ? "• Active" : "• Setup Needed"}
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

                      <Link
                        href="/dashboard/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-elevated-app text-secondary-app hover:text-primary-app"
                      >
                        <Settings className="w-4 h-4 text-[#7C3AED]" />
                        <span>Settings</span>
                      </Link>

                      <div className="border-t border-app my-1" />

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-500 text-left cursor-pointer"
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
                  className="px-4 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold shadow-md shadow-[#7C3AED]/25 transition-all cursor-pointer"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-app bg-elevated-app text-secondary-app hover:text-primary-app"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-app bg-card-app px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-[#7C3AED] text-white"
                      : "text-secondary-app hover:text-primary-app hover:bg-elevated-app"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-app pt-3">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 bg-elevated-app rounded-xl border border-app">
                  <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-primary-app truncate">
                      {user.display_name}
                    </p>
                    <p className="text-xs text-muted-app capitalize">
                      {user.role} role
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-elevated-app text-sm font-medium text-secondary-app"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#7C3AED]" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-elevated-app text-sm font-medium text-secondary-app"
                >
                  <Settings className="w-4 h-4 text-[#7C3AED]" />
                  <span>Settings</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  className="w-full py-2 text-center rounded-lg border border-app bg-elevated-app text-sm font-semibold text-primary-app hover:border-[#7C3AED]"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="w-full py-2 text-center rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-sm font-semibold text-white shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
