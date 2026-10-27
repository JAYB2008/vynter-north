import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vynter North — The Character Intelligence Layer for AI Entertainment",
  description:
    "AI character identity registry and MCP intelligence layer. Register your AI characters with deep personality profiles. Rent or deploy them into Claude, ChatGPT, Runway, and Kling with automatic behavioral enrichment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <Suspense
              fallback={
                <div className="h-16 border-b border-app bg-card-app" />
              }
            >
              <Navbar />
            </Suspense>

            <main className="flex-1 flex flex-col">{children}</main>

            <Footer />

            <Toaster
              position="top-right"
              toastOptions={{
                className: "border border-app bg-card-app text-primary-app",
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
