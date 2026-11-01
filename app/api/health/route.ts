import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseServer } from "@/lib/db";

export const dynamic = "force-dynamic";

let lastNimCheckTime = 0;
let lastNimCheckStatus = "healthy";

export async function GET() {
  const missing_env: string[] = [];

  const requiredEnvs = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SESSION_SECRET",
    "NVIDIA_API_KEY",
  ];

  for (const envKey of requiredEnvs) {
    if (!process.env[envKey] || process.env[envKey]?.trim() === "") {
      missing_env.push(envKey);
    }
  }

  // 1. Database check (real select 1 if configured, else memory store)
  let databaseStatus = "healthy (in-memory)";
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabaseServer.from("accounts").select("id").limit(1);
      if (error && error.code !== "PGRST116") {
        databaseStatus = `error: ${error.message}`;
      } else {
        databaseStatus = "connected";
      }
    } catch (e: any) {
      databaseStatus = `error: ${e.message}`;
    }
  }

  // 2. NIM check (cached for 5 minutes)
  const now = Date.now();
  if (now - lastNimCheckTime > 5 * 60 * 1000) {
    lastNimCheckTime = now;
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    if (nvidiaKey) {
      try {
        const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
          headers: { Authorization: `Bearer ${nvidiaKey}` },
          signal: AbortSignal.timeout(4000),
        });
        lastNimCheckStatus = res.ok ? "healthy" : `status ${res.status}`;
      } catch {
        lastNimCheckStatus = "simulated fallback active";
      }
    } else {
      lastNimCheckStatus = "missing API key";
    }
  }

  const isHealthy =
    databaseStatus !== "error" &&
    !lastNimCheckStatus.startsWith("error");

  return NextResponse.json({
    ok: isHealthy,
    version: "1.0.0",
    time: new Date().toISOString(),
    services: {
      database: databaseStatus,
      storage: isSupabaseConfigured ? "configured" : "local",
      nim: lastNimCheckStatus,
      session_secret: process.env.SESSION_SECRET ? "configured" : "fallback-active",
    },
    missing_env,
  });
}
