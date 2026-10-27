import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code && isSupabaseServerConfigured()) {
    try {
      await supabaseServer.auth.exchangeCodeForSession(code);
    } catch (e) {
      console.warn("Auth exchange code error:", e);
    }
  }

  // Redirect to onboarding or dashboard
  return NextResponse.redirect(new URL("/onboarding", request.url));
}
