import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const account = await requireAccount();
    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      "vynter-north.vercel.app";
    const proto = req.headers.get("x-forwarded-proto") || "https";

    const mcpUrl = `${proto}://${host}/api/mcp/${account.account_key}`;

    // Test tools/list
    const res = await fetch(mcpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "MCP_TEST_FAILED",
            message: `Remote MCP server returned status ${res.status}`,
          },
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    const tools = data.result?.tools?.map((t: any) => t.name) || [];

    return NextResponse.json({
      ok: true,
      data: {
        server_url: mcpUrl,
        tools_found: tools,
        count: tools.length,
        status: "active",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "TEST_FAILED", message: err.message || "Failed to reach MCP server." },
      },
      { status: 500 }
    );
  }
}
