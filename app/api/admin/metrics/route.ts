import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import {
  getCharacters,
  getRentalsList,
  getGenerationsList,
  getMcpLogs,
  getAllAccounts,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Admin privileges required." } },
        { status: 403 }
      );
    }

    const accounts = await getAllAccounts();
    const characters = await getCharacters({ status: undefined });
    const rentals = await getRentalsList();
    const generations = await getGenerationsList();
    const mcpLogs = await getMcpLogs();

    const mcpErrors = mcpLogs.filter((l) => !l.ok).length;

    return NextResponse.json({
      ok: true,
      data: {
        accounts_count: accounts.length,
        characters_count: characters.filter((c) => c.status !== "deleted").length,
        rentals_count: rentals.length,
        enrichments_count: generations.length,
        mcp_calls_count: mcpLogs.length,
        mcp_errors_count: mcpErrors,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "METRICS_FAILED", message: err.message || "Failed to load admin metrics." } },
      { status: 500 }
    );
  }
}
