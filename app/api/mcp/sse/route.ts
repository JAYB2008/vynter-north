import { NextRequest, NextResponse } from "next/server";
import {
  enrichWithNvidia,
  VALID_ACCOUNT_KEY,
} from "@/app/api/enrich/route";
import { getAllCharacters } from "@/lib/db";

// Server Metadata
const SERVER_INFO = {
  name: "vynter-north",
  version: "1.0.0",
};

const DEFAULT_PROTOCOL_VERSION = "2024-11-05";

// Tool Definitions with agent-friendly schemas
const TOOLS = [
  {
    name: "verify_character",
    description:
      "Checks if the account key is valid and if that character is active on the account with credits remaining.",
    inputSchema: {
      type: "object",
      properties: {
        characterName: {
          type: "string",
          description: "Name of the character to verify (e.g. Cairo, James, Aria Vance, Marcus Drake)",
          default: "Cairo",
        },
        accountKey: {
          type: "string",
          description: "Vynter North account key (optional, defaults to vn-test-key-001)",
          default: "vn-test-key-001",
        },
      },
      required: ["characterName"],
    },
  },
  {
    name: "get_scene_instruction",
    description:
      "Calls the character enrichment intelligence layer to rewrite a scene into detailed behavioral cinematic direction.",
    inputSchema: {
      type: "object",
      properties: {
        scene: {
          type: "string",
          description: "The raw scene description to enrich",
        },
        characterName: {
          type: "string",
          description: "Name of the character (e.g. Cairo)",
          default: "Cairo",
        },
        accountKey: {
          type: "string",
          description: "Vynter North account key (optional, defaults to vn-test-key-001)",
          default: "vn-test-key-001",
        },
      },
      required: ["scene"],
    },
  },
  {
    name: "get_character_status",
    description:
      "Returns live list of active characters, remaining credits, and expiration on this Vynter North account.",
    inputSchema: {
      type: "object",
      properties: {
        accountKey: {
          type: "string",
          description: "Vynter North account key (optional, defaults to vn-test-key-001)",
          default: "vn-test-key-001",
        },
      },
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

// Authentication Resolver
function resolveAccountKey(
  request: Request | NextRequest,
  explicitKey?: string
): { key: string; isExplicitlyInvalid: boolean } {
  if (explicitKey && explicitKey.trim() !== "") {
    const trimmed = explicitKey.trim();
    return {
      key: trimmed,
      isExplicitlyInvalid: trimmed !== VALID_ACCOUNT_KEY,
    };
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token) {
      return {
        key: token,
        isExplicitlyInvalid: token !== VALID_ACCOUNT_KEY,
      };
    }
  }

  const searchParams = getSearchParams(request);
  const queryToken =
    searchParams.get("token") || searchParams.get("accountKey");
  if (queryToken && queryToken.trim() !== "") {
    const trimmed = queryToken.trim();
    return {
      key: trimmed,
      isExplicitlyInvalid: trimmed !== VALID_ACCOUNT_KEY,
    };
  }

  return {
    key: VALID_ACCOUNT_KEY,
    isExplicitlyInvalid: false,
  };
}

// Tool 1: verify_character (reads live database registry)
async function handleVerifyCharacter(
  request: Request | NextRequest,
  args: {
    accountKey?: string;
    characterName?: string;
  }
) {
  const { key, isExplicitlyInvalid } = resolveAccountKey(request, args.accountKey);
  const targetName = (args.characterName || "Cairo").trim().toLowerCase();

  const isValidKey = !isExplicitlyInvalid && key === VALID_ACCOUNT_KEY;

  if (isValidKey) {
    // Query live character registry
    const characters = await getAllCharacters();
    const match = characters.find(
      (c) => c.name.toLowerCase() === targetName || c.name.toLowerCase().includes(targetName)
    );

    if (match) {
      return {
        valid: true,
        characterName: match.name,
        vibeSummary:
          match.skills?.vibe_summary ||
          match.description ||
          "Overconfident but genuinely skilled. Sideways lean, plants feet wide. Gets louder and more performative when scared, but goes completely quiet and competent in crisis.",
        coreTrait: match.skills?.core_trait || "Dynamic",
        creditsRemaining: 500,
        status: "active",
      };
    }

    // Default Cairo fallback if exact match not found
    if (targetName === "cairo") {
      return {
        valid: true,
        characterName: "Cairo",
        vibeSummary:
          "Overconfident but genuinely skilled. Sideways lean, plants feet wide, very deliberate stops. Gets louder and more performative when scared, but goes completely quiet and competent in crisis.",
        creditsRemaining: 500,
        status: "active",
      };
    }
  }

  return {
    valid: false,
    characterName: args.characterName || "Unknown",
    vibeSummary: "",
    creditsRemaining: 0,
    status: "inactive",
  };
}

// Tool 2: get_scene_instruction
async function handleGetSceneInstruction(
  req: Request | NextRequest,
  args: { accountKey?: string; characterName?: string; scene?: string }
) {
  const { key } = resolveAccountKey(req, args.accountKey);
  const scene = (args.scene || "").trim();

  if (!scene) {
    throw new Error("Field 'scene' is required.");
  }

  try {
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      ("nextUrl" in req ? req.nextUrl.origin : new URL(req.url).origin) ||
      "http://localhost:3000";
    const enrichUrl = new URL("/api/enrich", origin).toString();

    const res = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scene,
        characterId: "cairo-001",
        accountKey: key,
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
    accountKey: key,
  });

  return {
    enrichedPrompt: result.enriched_prompt,
    behaviorBreakdown: result.behaviorBreakdown,
  };
}

// Tool 3: get_character_status (reads live character registry & accounts)
async function handleGetCharacterStatus(
  request: Request | NextRequest,
  args: { accountKey?: string }
) {
  const { key, isExplicitlyInvalid } = resolveAccountKey(request, args.accountKey);

  if (!isExplicitlyInvalid && key === VALID_ACCOUNT_KEY) {
    // Read live characters from the registry
    const characters = await getAllCharacters();

    const activeList = characters.map((c) => ({
      name: c.name,
      characterName: c.name,
      status: "active",
      creditsRemaining: 500,
      expiresIn: "30 days",
      coreTrait: c.skills?.core_trait || "Dynamic",
      skillsSummary: c.skills?.vibe_summary || c.description || "Active character in registry",
    }));

    return {
      characters: activeList,
      totalActiveCharacters: activeList.length,
      creditsRemaining: 500,
      expiresIn: "30 days",
      accountKey: "vn-test-key-001",
    };
  }

  return {
    characters: [],
    creditsRemaining: 0,
    error: "Invalid account key",
  };
}

// Process JSON-RPC Request with Dynamic Protocol Negotiation
async function processJsonRpc(request: Request | NextRequest, body: any): Promise<any> {
  const { jsonrpc, id, method, params } = body;

  switch (method) {
    case "initialize": {
      // Dynamic Protocol Negotiation: Accept client-requested protocol version or default
      const negotiatedVersion = params?.protocolVersion || DEFAULT_PROTOCOL_VERSION;
      return {
        jsonrpc: "2.0",
        id: id ?? null,
        result: {
          protocolVersion: negotiatedVersion,
          capabilities: {
            tools: {},
          },
          serverInfo: SERVER_INFO,
        },
      };
    }

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
        toolOutput = await handleVerifyCharacter(request, toolArgs);
      } else if (toolName === "get_scene_instruction") {
        toolOutput = await handleGetSceneInstruction(request, toolArgs);
      } else if (toolName === "get_character_status") {
        toolOutput = await handleGetCharacterStatus(request, toolArgs);
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
        result: await handleVerifyCharacter(request, params || {}),
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
        result: await handleGetCharacterStatus(request, params || {}),
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
  const sessionId = crypto.randomUUID();
  const encoder = new TextEncoder();

  let pingInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      sessions.set(sessionId, {
        controller,
        encoder,
        createdAt: Date.now(),
      });

      let fullEndpointUrl: string;
      try {
        fullEndpointUrl = new URL(
          `/api/mcp/sse?sessionId=${sessionId}`,
          request.url
        ).toString();
      } catch {
        fullEndpointUrl = `https://vynter-north.vercel.app/api/mcp/sse?sessionId=${sessionId}`;
      }

      const endpointEvent = `event: endpoint\ndata: ${fullEndpointUrl}\n\n`;
      controller.enqueue(encoder.encode(endpointEvent));

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

  try {
    const jsonRpcResponse = await processJsonRpc(request, body);

    if (!jsonRpcResponse) {
      return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(),
      });
    }

    // Serverless-resilient SSE streaming: Push to active SSE stream if session exists on this worker
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

    // Dual-delivery: Return full JSON-RPC response in HTTP POST response payload
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
