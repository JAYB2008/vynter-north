import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "vynter-north.vercel.app";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const baseUrl = `${proto}://${host}`;

  return NextResponse.json(
    {
      name: "vynter-north",
      version: "1.0.0",
      description: "Vynter North Character Intelligence Layer Remote MCP Server",
      transport: "Streamable HTTP (JSON-RPC 2.0)",
      connection_format: `${baseUrl}/api/mcp/{your_account_key}`,
      documentation: `${baseUrl}/connect`,
      tools: [
        "list_my_characters",
        "check_character",
        "enrich_scene",
        "keep_generation",
        "discard_generation",
        "account_status",
      ],
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  // If called without key, provide clean instructions
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "vynter-north.vercel.app";
  const proto = req.headers.get("x-forwarded-proto") || "https";

  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32600,
        message: `Remote MCP server requires your personal account connector URL: ${proto}://${host}/api/mcp/{account_key}. Obtain your key at /studio/connect or /dashboard/settings.`,
      },
    },
    { status: 400, headers: CORS_HEADERS }
  );
}
