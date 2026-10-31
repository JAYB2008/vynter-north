"use client";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 w-full min-h-[calc(100vh-4rem)] bg-primary-app">
      {/* Left Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Dashboard Content Area */}
      <main className="flex-1 p-4 sm:p-8 bg-primary-app min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
