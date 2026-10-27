"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  ShieldCheck,
  DollarSign,
  Bot,
  Settings,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  const creatorNav = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/characters", label: "My Characters", icon: Users },
    { href: "/dashboard/characters/new", label: "Create Character", icon: PlusCircle },
    { href: "/dashboard/earnings", label: "Earnings", icon: DollarSign },
    { href: "/dashboard/connect", label: "MCP Setup & Key", icon: Bot },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const studioNav = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/rentals", label: "Active Rentals", icon: ShieldCheck },
    { href: "/marketplace", label: "Browse Characters", icon: ShoppingBag },
    { href: "/demo", label: "Live Scene Demo", icon: Sparkles },
    { href: "/dashboard/connect", label: "MCP Setup & Key", icon: Bot },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const items = role === "creator" ? creatorNav : studioNav;

  return (
    <aside className="w-full md:w-64 border-r border-app bg-card-app flex flex-col p-4 shrink-0">
      <div className="mb-6 px-3 py-2 rounded-lg bg-elevated-app border border-app">
        <span className="text-[11px] font-bold text-muted-app uppercase tracking-wider block">
          Current Workspace
        </span>
        <span className="text-sm font-bold text-primary-app capitalize">
          {role} Portal
        </span>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#7C3AED] text-white shadow-sm shadow-[#7C3AED]/30 font-semibold"
                  : "text-secondary-app hover:text-primary-app hover:bg-elevated-app"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
