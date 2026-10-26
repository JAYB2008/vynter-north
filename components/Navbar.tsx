"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Film, Sparkles, History, BrainCircuit, Bot } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/characters", label: "Characters", icon: Users },
    { href: "/studio", label: "Video Studio", icon: Film },
    { href: "/test", label: "Test Intelligence", icon: Sparkles },
    { href: "/connect", label: "MCP Connect", icon: Bot },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] flex items-center justify-center shadow-md shadow-[#7C3AED]/30 group-hover:scale-105 transition-transform duration-200">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-[#7C3AED] transition-colors">
              VYNTER NORTH
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-[#7C3AED] border border-purple-200">
              POC
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
