import { NextRequest, NextResponse } from "next/server";
import {
  enrichWithNvidia,
  VALID_ACCOUNT_KEY,
} from "@/app/api/enrich/route";

// Server Metadata
const SERVER_INFO = {
  name: "vynter-north",
  version: "1.0.0",
};

const PROTOCOL_VERSION = "2024-11-05";

// Tool Definitions
const TOOLS = [
  {
    name: "verify_character",
    description:
      "Checks if the account key is valid and if that character is active on the account with credits remaining.",
    inputSchema: {
      type: "object",
      properties: {
        accountKey: {
          type: "string",
          description: "Vynter North account key (e.g. vn-test-key-001)",
        },
        characterName: {
          type: "string",
          description: "Name of the character to verify (e.g. Cairo)",
        },
      },
      required: ["accountKey", "characterName"],
    },
  },
  {
    name: "get_scene_instruction",
    description:
      "Calls the character enrichment intelligence layer to rewrite a scene into detailed behavioral cinematic direction.",
    inputSchema: {
      type: "object",
      properties: {
        accountKey: {
          type: "string",
          description: "Vynter North account key",
        },
        characterName: {
          type: "string",
          description: "Name of the character (e.g. Cairo)",
        },
        scene: {
          type: "string",
          description: "The raw scene description to enrich",
        },
      },
      required: ["accountKey", "characterName", "scene"],
    },
  },
  {
    name: "get_character_status",
    description:
      "Returns list of active characters on this account.",
    inputSchema: {
      type: "object",
      properties: {
        accountKey: {
          type: "string",
          description: "Vynter North account key",
        },
      },
      required: ["accountKey"],
    },
  },
];

// In-memory session store across warm serverless invocations
interface MCPSession {
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
  createdAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __mcp_sse_sessions: Map<string, MCPSession> | undefined;
}

const sessions: Map<string, MCPSession> =
  globalThis.__mcp_sse_sessions ||
  (globalThis.__mcp_sse_sessions = new Map<string, MCPSession>());

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, X-Session-Id",
    "Access-Control-Expose-Headers": "Content-Type, Authorization",
  };
}

function getSearchParams(request: Request | NextRequest): URLSearchParams {
  if ("nextUrl" in request && request.nextUrl?.searchParams) {
    return request.nextUrl.searchParams;
  }
  try {
    return new URL(request.url).searchParams;
  } catch {
    return new URLSearchParams();
  }
}

// Authentication Helper
function validateAuth(request: Request | NextRequest, bodyKey?: string): boolean {
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token === VALID_ACCOUNT_KEY) return true;
  }

  const searchParams = getSearchParams(request);
  const queryToken =
    searchParams.get("token") ||
    searchParams.get("accountKey");
  if (queryToken && queryToken.trim() === VALID_ACCOUNT_KEY) {
    return true;
  }

  if (bodyKey && bodyKey.trim() === VALID_ACCOUNT_KEY) {
    return true;
  }

  return false;
}

// Tool 1: verify_character
function handleVerifyCharacter(args: {
  accountKey?: string;
  characterName?: string;
}) {
  const accountKey = args.accountKey?.trim() || "";
  const characterName = (args.characterName || "").trim();

  const isValidKey = accountKey === VALID_ACCOUNT_KEY;
  const isCairo = characterName.toLowerCase() === "cairo";

  if (isValidKey && isCairo) {
    return {
      valid: true,
      characterName: "Cairo",
      vibeSummary:
        "Overconfident but genuinely skilled. Sideways lean, plants feet wide, very deliberate stops. Gets louder and more performative when scared, but goes completely quiet and competent in crisis.",
      creditsRemaining: 500,
    };
  }

  return {
    valid: false,
    characterName: characterName || "Unknown",
    vibeSummary: "",
    creditsRemaining: 0,
  };
}

// Tool 2: get_scene_instruction
async function handleGetSceneInstruction(
  req: NextRequest,
  args: { accountKey?: string; characterName?: string; scene?: string }
) {
  const accountKey = args.accountKey?.trim() || VALID_ACCOUNT_KEY;
  const scene = (args.scene || "").trim();

  if (!scene) {
    throw new Error("Field 'scene' is required.");
  }

  try {
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      "http://localhost:3000";
    const enrichUrl = new URL("/api/enrich", origin).toString();

    const res = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scene,
        characterId: "cairo-001",
        accountKey,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        enrichedPrompt: data.enriched_prompt || data.enrichedPrompt || "",
        behaviorBreakdown: data.behaviorBreakdown || {
          facial_expression: data.facial_expression || "",
          body_language: data.body_language || "",
          emotional_state: data.emotional_state || "",
          dialogue_direction: data.dialogue_direction || "",
        },
      };
    }
  } catch (err) {
    console.warn("Internal fetch failed in SSE handler, falling back to direct logic:", err);
  }

  const result = await enrichWithNvidia({
    scene,
    characterId: "cairo-001",
    accountKey,
  });

  return {
    enrichedPrompt: result.enriched_prompt,
    behaviorBreakdown: result.behaviorBreakdown,
  };
}

// Tool 3: get_character_status
function handleGetCharacterStatus(args: { accountKey?: string }) {
  const accountKey = args.accountKey?.trim() || "";

  if (accountKey === VALID_ACCOUNT_KEY) {
    return {
      characters: [
        {
          name: "Cairo",
          characterName: "Cairo",
          status: "active",
          creditsRemaining: 500,
          expiresIn: "30 days",
          skillsSummary: "Overconfident but genuinely skilled",
        },
      ],
      creditsRemaining: 500,
      expiresIn: "30 days",
    };
  }

  return {
    characters: [],
    creditsRemaining: 0,
    error: "Invalid account key",
  };
}

// Process JSON-RPC Request
async function processJsonRpc(request: NextRequest, body: any): Promise<any> {
  const { jsonrpc, id, method, params } = body;

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id: id ?? null,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: {},
          },
          serverInfo: SERVER_INFO,
        },
      };

    case "notifications/initialized":
      return null;

    case "ping":
      return { jsonrpc: "2.0", id: id ?? null, result: {} };

    case "tools/list":
      return {
        jsonrpc: "2.0",
        id: id ?? null,
        result: {
          tools: TOOLS,
        },
      };

    case "tools/call": {
      const toolName = params?.name;
      const toolArgs = params?.arguments || params?.input || params || {};

      let toolOutput: any;
      if (toolName === "verify_character") {
        toolOutput = handleVerifyCharacter(toolArgs);
      } else if (toolName === "get_scene_instruction") {
        toolOutput = await handleGetSceneInstruction(request, toolArgs);
      } else if (toolName === "get_character_status") {
        toolOutput = handleGetCharacterStatus(toolArgs);
      } else {
        return {
          jsonrpc: "2.0",
          id: id ?? null,
          error: {
            code: -32601,
            message: `Tool '${toolName}' not found`,
          },
        };
      }

      return {
        jsonrpc: "2.0",
        id: id ?? null,
        result: {
          content: [
            {
              type: "text",
              text:
                typeof toolOutput === "string"
                  ? toolOutput
                  : JSON.stringify(toolOutput, null, 2),
            },
          ],
          isError: false,
          ...toolOutput,
        },
      };
    }

    // Direct tool methods
    case "verify_character":
      return {
        jsonrpc: "2.0",
        id: id ?? null,
        result: handleVerifyCharacter(params || {}),
      };

    case "get_scene_instruction":
      return {
        jsonrpc: "2.0",
        id: id ?? null,
        result: await handleGetSceneInstruction(request, params || {}),
      };

    case "get_character_status":
      return {
        jsonrpc: "2.0",
        id: id ?? null,
        result: handleGetCharacterStatus(params || {}),
      };

    default:
      return {
        jsonrpc: "2.0",
        id: id ?? null,
        error: {
          code: -32601,
          message: `Method '${method}' not found`,
        },
      };
  }
}

// 1. OPTIONS Handler (CORS Preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

// 2. GET Handler (Establish SSE Connection)
export async function GET(request: NextRequest) {
  // Check Authentication
  if (!validateAuth(request)) {
    return NextResponse.json(
      {
        error:
          "Unauthorized. Please provide 'Authorization: Bearer vn-test-key-001' header or '?token=vn-test-key-001'.",
      },
      {
        status: 401,
        headers: {
          ...getCorsHeaders(),
          "WWW-Authenticate": 'Bearer realm="vynter-north"',
        },
      }
    );
  }

  const sessionId = crypto.randomUUID();
  const encoder = new TextEncoder();

  // Create SSE stream
  let pingInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Register session
      sessions.set(sessionId, {
        controller,
        encoder,
        createdAt: Date.now(),
      });

      // Send initial 'endpoint' event per MCP SSE spec
      const endpointUri = `/api/mcp/sse?sessionId=${sessionId}`;
      const endpointEvent = `event: endpoint\ndata: ${endpointUri}\n\n`;
      controller.enqueue(encoder.encode(endpointEvent));

      // Periodic keep-alive ping every 15 seconds
      pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          if (pingInterval) clearInterval(pingInterval);
          sessions.delete(sessionId);
        }
      }, 15000);
    },
    cancel() {
      if (pingInterval) clearInterval(pingInterval);
      sessions.delete(sessionId);
    },
  });

  request.signal.addEventListener("abort", () => {
    if (pingInterval) clearInterval(pingInterval);
    sessions.delete(sessionId);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      ...getCorsHeaders(),
    },
  });
}

// 3. POST Handler (Incoming JSON-RPC from client)
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error: Invalid JSON" },
      },
      { status: 400, headers: getCorsHeaders() }
    );
  }

  // Check Authentication
  const bodyAccountKey =
    body?.params?.arguments?.accountKey ||
    body?.params?.input?.accountKey ||
    body?.params?.accountKey;

  if (!validateAuth(request, bodyAccountKey)) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: body?.id ?? null,
        error: {
          code: -32000,
          message:
            "Unauthorized. Please provide 'Authorization: Bearer vn-test-key-001' header or accountKey in params.",
        },
      },
      {
        status: 401,
        headers: {
          ...getCorsHeaders(),
          "WWW-Authenticate": 'Bearer realm="vynter-north"',
        },
      }
    );
  }

  try {
    const jsonRpcResponse = await processJsonRpc(request, body);

    // If notification (e.g. notifications/initialized), return 204
    if (!jsonRpcResponse) {
      return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(),
      });
    }

    // If an active SSE session exists for this sessionId, send over SSE stream
    const searchParams = getSearchParams(request);
    const sessionId = searchParams.get("sessionId");
    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId)!;
      try {
        const sseMessage = `event: message\ndata: ${JSON.stringify(
          jsonRpcResponse
        )}\n\n`;
        session.controller.enqueue(session.encoder.encode(sseMessage));
      } catch (err) {
        console.warn("Failed to push message to SSE stream:", err);
      }
    }

    // Also return response body in HTTP POST response for maximum client compatibility
    return NextResponse.json(jsonRpcResponse, {
      status: 200,
      headers: getCorsHeaders(),
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Internal MCP server error";

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: body?.id ?? null,
        error: {
          code: -32603,
          message: errorMsg,
        },
      },
      { status: 200, headers: getCorsHeaders() }
    );
  }
}
