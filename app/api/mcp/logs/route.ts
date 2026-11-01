import { NextResponse } from "next/server";
import { requireAccount } from "@/lib/auth";
import { getRecentMcpLogs } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const account = await requireAccount();
    const logs = await getRecentMcpLogs(account.id, 10);
    return NextResponse.json({ ok: true, data: logs });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "LOGS_ERROR", message: error.message || "Failed to fetch logs" },
      },
      { status: 500 }
    );
  }
}
