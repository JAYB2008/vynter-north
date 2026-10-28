"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Star,
  PlusCircle,
  DollarSign,
  Link as LinkIcon,
  Settings,
  Search,
  Bookmark,
  Sparkles,
  Clapperboard,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, role } = useAuth();

  // Sidebar items FOR CREATORS
  const creatorItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/characters", label: "My Characters", icon: Star },
    { href: "/characters/new", label: "Create Character", icon: PlusCircle },
    { href: "/dashboard/earnings", label: "Earnings", icon: DollarSign },
    { href: "/connect", label: "Connect", icon: LinkIcon },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  // Sidebar items FOR STUDIOS
  const studioItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/marketplace", label: "Browse Characters", icon: Search },
    { href: "/dashboard/rentals", label: "My Rentals", icon: Bookmark },
    { href: "/connect", label: "Connect", icon: LinkIcon },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const navItems = role === "studio" ? studioItems : creatorItems;

  return (
    <div className="flex flex-1 w-full min-h-[calc(100vh-4rem)] bg-[#08080F]">
      {/* Left Sidebar Navigation (collapses to icons on mobile) */}
      <aside className="w-16 md:w-64 border-r border-[#1E1E3A] bg-[#0F0F1A] flex flex-col justify-between shrink-0 transition-all duration-200">
        <div className="p-3 md:p-5 space-y-6">
          {/* Role Badge Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14142A] border border-[#1E1E3A]">
            <div className="w-7 h-7 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center shrink-0">
              {role === "studio" ? (
                <Clapperboard className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white capitalize truncate">
                {role} Workspace
              </p>
              <p className="text-[10px] text-[#94A3B8] truncate">
                {user?.display_name || "Vynter User"}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20 font-semibold"
                      : "text-[#94A3B8] hover:text-white hover:bg-[#14142A]"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer in Sidebar */}
        <div className="p-3 md:p-5 border-t border-[#1E1E3A] hidden md:block">
          <div className="p-3 rounded-xl bg-[#14142A] border border-[#1E1E3A] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A78BFA]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MCP Protocol</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-tight">
              Active v2024-11-05
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 bg-[#08080F] min-w-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
