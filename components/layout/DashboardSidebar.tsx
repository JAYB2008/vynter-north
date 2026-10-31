"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  PlusCircle,
  DollarSign,
  Link as LinkIcon,
  Settings,
  Search,
  Bookmark,
  Clock,
  Sparkles,
  Clapperboard,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, role } = useAuth();

  // CREATOR SIDEBAR:
  // - Dashboard (home icon)
  // - My Characters (users icon)
  // - Create Character (plus icon, purple)
  // - Earnings (dollar icon)
  // - Connect (link icon)
  // - Settings (gear icon)
  interface NavItem {
    href: string;
    label: string;
    icon: any;
    highlight?: boolean;
  }

  const creatorItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/characters", label: "My Characters", icon: Users },
    {
      href: "/dashboard/characters/new",
      label: "Create Character",
      icon: PlusCircle,
      highlight: true,
    },
    { href: "/dashboard/earnings", label: "Earnings", icon: DollarSign },
    { href: "/dashboard/connect", label: "Connect", icon: LinkIcon },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const studioItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/marketplace", label: "Browse Characters", icon: Search },
    { href: "/dashboard/rentals", label: "My Rentals", icon: Bookmark },
    { href: "/history", label: "Generation History", icon: Clock },
    { href: "/dashboard/connect", label: "Connect", icon: LinkIcon },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const navItems = role === "studio" ? studioItems : creatorItems;

  return (
    <aside className="w-16 md:w-64 border-r border-[#1E1E3A] bg-[#0F0F1A] flex flex-col justify-between shrink-0 transition-all duration-200">
      <div className="p-3 md:p-5 space-y-6">
        {/* Role Workspace Badge */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#14142A] border border-[#1E1E3A]">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center shrink-0">
            {role === "studio" ? (
              <Clapperboard className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white capitalize truncate">
              {role === "studio" ? "Studio Workspace" : "Creator Studio"}
            </p>
            <p className="text-[11px] text-[#94A3B8] truncate">
              {user?.display_name || (role === "studio" ? "Studio Lead" : "Creator")}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30"
                      : "bg-[#7C3AED]/15 hover:bg-[#7C3AED]/25 text-[#A78BFA] hover:text-white border border-[#7C3AED]/30"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0 text-[#A78BFA]" />
                  <span className="hidden md:inline truncate">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25 font-semibold"
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

      {/* Protocol Badge Footer */}
      <div className="p-3 md:p-5 border-t border-[#1E1E3A] hidden md:block">
        <div className="p-3 rounded-xl bg-[#14142A] border border-[#1E1E3A] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A78BFA]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>MCP Protocol Active</span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-tight">
            v2024-11-05 JSON-RPC Layer
          </p>
        </div>
      </div>
    </aside>
  );
}
