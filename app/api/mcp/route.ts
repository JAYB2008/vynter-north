import { NextRequest, NextResponse } from "next/server";
import { MCP_SERVER_INFO, MCP_TOOLS, handleMcpRpc } from "@/lib/mcp-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    req.nextUrl.origin ||
    "http://localhost:3000";

  return NextResponse.json({
    name: MCP_SERVER_INFO.name,
    version: MCP_SERVER_INFO.version,
    description: MCP_SERVER_INFO.description,
    tools: MCP_TOOLS,
    connect: {
      claude_desktop: {
        config: {
          mcpServers: {
            "vynter-north": {
              command: "npx",
              args: ["-y", "@modelcontextprotocol/server-fetch"],
              env: {
                MCP_SERVER_URL: `${origin}/api/mcp`,
                ACCOUNT_KEY: "vn-test-key-001",
              },
            },
          },
        },
      },
      claude_web: {
        url: `${origin}/api/mcp/sse`,
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const response = await handleMcpRpc(body);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("MCP POST error:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: 1,
        error: { code: -32603, message: error.message || "Internal RPC Error" },
      },
      { status: 500 }
    );
  }
}
