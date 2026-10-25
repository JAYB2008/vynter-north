import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vynter North — Character Intelligence POC",
  description: "Proof-of-Concept for the AI Character Intelligence Layer & Talent Registry",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#7C3AED] selection:text-white">
        <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster
          position="top-right"
          theme="light"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              color: "#0F172A",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
