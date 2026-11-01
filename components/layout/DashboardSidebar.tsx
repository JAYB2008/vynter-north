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
  Bookmark,
  Clock,
  Sparkles,
  Clapperboard,
  Heart,
  Handshake,
  Layers,
  Star,
  Bell,
  Film,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  highlight?: boolean;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, role, activeMode } = useAuth();
  const mode = activeMode || role;

  const creatorItems: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: Home },
    { href: "/dashboard/characters", label: "My Characters", icon: Users },
    {
      href: "/dashboard/characters/new",
      label: "Register Character",
      icon: PlusCircle,
      highlight: true,
    },
    { href: "/dashboard/offers", label: "Buyout Offers", icon: Handshake },
    { href: "/dashboard/earnings", label: "Earnings", icon: DollarSign },
    { href: "/dashboard/skills", label: "Skill Templates", icon: Layers },
    { href: "/dashboard/reviews", label: "Reviews", icon: Star },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const studioItems: NavItem[] = [
    { href: "/studio/overview", label: "Overview", icon: Home },
    { href: "/studio/library", label: "Library & Rentals", icon: Bookmark },
    { href: "/studio/workspace", label: "Prompt Workspace", icon: Film, highlight: true },
    { href: "/studio/history", label: "Enrichment History", icon: Clock },
    { href: "/studio/saved", label: "Saved Characters", icon: Heart },
    { href: "/studio/offers", label: "Buyout Offers", icon: Handshake },
    { href: "/studio/casting", label: "Casting Calls", icon: Users },
    { href: "/studio/reviews", label: "My Reviews", icon: Star },
    { href: "/studio/connect", label: "Connect MCP", icon: LinkIcon },
    { href: "/studio/notifications", label: "Notifications", icon: Bell },
  ];

  const navItems = mode === "studio" ? studioItems : creatorItems;

  return (
    <aside className="w-16 md:w-64 border-r border-[var(--line)] bg-[var(--panel)] flex flex-col justify-between shrink-0 transition-all duration-200">
      <div className="p-3 md:p-5 space-y-6">
        {/* Role Workspace Badge */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[var(--panel-raised)] border border-[var(--line)]">
          <div className="w-8 h-8 rounded bg-[var(--glacier)]/15 text-[var(--glacier)] flex items-center justify-center shrink-0">
            {mode === "studio" ? (
              <Clapperboard className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--glacier)] block">
              {mode === "studio" ? "Studio Workspace" : "Creator Studio"}
            </span>
            <span className="text-xs text-[var(--text)] font-medium truncate block">
              {user?.display_name || user?.username || "Account"}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard" || item.href === "/studio/overview"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[var(--panel-raised)] text-[var(--glacier)] border border-[var(--line)]"
                    : item.highlight
                    ? "bg-[var(--glacier)] text-[var(--glacier-ink)] font-semibold hover:brightness-110"
                    : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--panel-raised)]/60"
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    item.highlight && !isActive ? "text-[var(--glacier-ink)]" : ""
                  }`}
                />
                <span className="hidden md:inline truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Mini Summary */}
      {user && (
        <div className="p-3 md:p-4 border-t border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[var(--panel-raised)] border border-[var(--line)] flex items-center justify-center text-xs font-bold text-[var(--glacier)] shrink-0 overflow-hidden">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.display_name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="hidden md:block overflow-hidden">
              <div className="text-xs font-semibold text-[var(--text)] truncate">
                {user.display_name}
              </div>
              <div className="text-[11px] text-[var(--text-dim)] font-mono truncate">
                @{user.username}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
