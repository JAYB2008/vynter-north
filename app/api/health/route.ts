import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasNvidiaKey = Boolean(
    process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY.trim() !== ""
  );

  return NextResponse.json({
    status: "ok",
    timestamp: Date.now(),
    services: {
      database: isSupabaseServerConfigured() ? "connected" : "ready (local cache)",
      nvidia_api: hasNvidiaKey,
      mcp_server: "active",
    },
    version: "1.0.0",
  });
}
