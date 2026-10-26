import { NextRequest, NextResponse } from "next/server";
import {
  enrichWithNvidia,
  VALID_ACCOUNT_KEY,
} from "@/app/api/enrich/route";

// MCP Server Metadata
const SERVER_INFO = {
  name: "vynter-north",
  version: "1.0.0",
};

const PROTOCOL_VERSION = "2024-11-05";

// Tool Definitions for Model Context Protocol
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
          description: "Name of the character to verify (e.g. Cairo)",
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
      "Returns list of active characters on this account.",
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

// Helper to resolve accountKey from arguments or environment
function resolveAccountKey(argsKey?: string): string {
  if (argsKey && argsKey.trim() !== "") return argsKey.trim();
  if (process.env.ACCOUNT_KEY && process.env.ACCOUNT_KEY.trim() !== "") {
    return process.env.ACCOUNT_KEY.trim();
  }
  return VALID_ACCOUNT_KEY;
}

// Tool 1: verify_character
// Returns: { valid: boolean, characterName: string, vibeSummary: string, creditsRemaining: number }
function handleVerifyCharacter(args: {
  accountKey?: string;
  characterName?: string;
}) {
  const accountKey = resolveAccountKey(args.accountKey);
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
// Calls /api/enrich internally and returns: { enrichedPrompt: string, behaviorBreakdown: object }
async function handleGetSceneInstruction(
  req: NextRequest,
  args: { accountKey?: string; characterName?: string; scene?: string }
) {
  const accountKey = resolveAccountKey(args.accountKey);
  const scene = (args.scene || "").trim();

  if (!scene) {
    throw new Error("Field 'scene' is required.");
  }

  // Attempt internal HTTP call to /api/enrich
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
    console.warn("Internal fetch to /api/enrich failed, falling back to direct function invocation:", err);
  }

  // Fallback to direct library execution if self-HTTP request cannot resolve
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
// Returns list of active characters on this account
// For now: returns Cairo with 500 credits, expires in 30 days
function handleGetCharacterStatus(args: { accountKey?: string }) {
  const accountKey = resolveAccountKey(args.accountKey);

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

// CORS headers helper
function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export async function GET() {
  return NextResponse.json(
    {
      server: SERVER_INFO,
      protocolVersion: PROTOCOL_VERSION,
      status: "online",
      tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
    },
    { headers: getCorsHeaders() }
  );
}

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

  const { jsonrpc, id, method, params } = body;

  try {
    switch (method) {
      // 1. Handshake / Initialize
      case "initialize":
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id ?? null,
            result: {
              protocolVersion: PROTOCOL_VERSION,
              capabilities: {
                tools: {},
              },
              serverInfo: SERVER_INFO,
            },
          },
          { headers: getCorsHeaders() }
        );

      case "notifications/initialized":
        return new NextResponse(null, {
          status: 204,
          headers: getCorsHeaders(),
        });

      case "ping":
        return NextResponse.json(
          { jsonrpc: "2.0", id: id ?? null, result: {} },
          { headers: getCorsHeaders() }
        );

      // 2. Tools Discovery
      case "tools/list":
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id ?? null,
            result: {
              tools: TOOLS,
            },
          },
          { headers: getCorsHeaders() }
        );

      // 3. Tool Execution via tools/call
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
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id: id ?? null,
              error: {
                code: -32601,
                message: `Tool '${toolName}' not found`,
              },
            },
            { status: 404, headers: getCorsHeaders() }
          );
        }

        return NextResponse.json(
          {
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
          },
          { headers: getCorsHeaders() }
        );
      }

      // Direct method shortcuts
      case "verify_character": {
        const out = handleVerifyCharacter(params || {});
        return NextResponse.json(
          { jsonrpc: "2.0", id: id ?? null, result: out },
          { headers: getCorsHeaders() }
        );
      }

      case "get_scene_instruction": {
        const out = await handleGetSceneInstruction(request, params || {});
        return NextResponse.json(
          { jsonrpc: "2.0", id: id ?? null, result: out },
          { headers: getCorsHeaders() }
        );
      }

      case "get_character_status": {
        const out = handleGetCharacterStatus(params || {});
        return NextResponse.json(
          { jsonrpc: "2.0", id: id ?? null, result: out },
          { headers: getCorsHeaders() }
        );
      }

      default:
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id ?? null,
            error: {
              code: -32601,
              message: `Method '${method}' not found`,
            },
          },
          { status: 404, headers: getCorsHeaders() }
        );
    }
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Internal MCP server error";
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: id ?? null,
        result: {
          content: [
            {
              type: "text",
              text: `Error executing MCP tool: ${errorMsg}`,
            },
          ],
          isError: true,
          error: errorMsg,
        },
      },
      { status: 200, headers: getCorsHeaders() }
    );
  }
}
