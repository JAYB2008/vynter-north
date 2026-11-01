import { NextRequest, NextResponse } from "next/server";
import {
  getAccountByKey,
  getRentalsByStudio,
  getAccess,
  createGeneration,
  updateGeneration,
  getGenerationById,
  countSceneGroupGenerations,
  updateRental,
  logMcpCall,
  getCharacters,
} from "@/lib/db";
import { enrichScene } from "@/lib/enrichment";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      name: "vynter-north",
      version: "1.0.0",
      description: "Vynter North Character Intelligence Layer Remote MCP Server",
      transport: "Streamable HTTP (JSON-RPC 2.0)",
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  const startTime = Date.now();
  const { key } = await context.params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error: Invalid JSON." },
      },
      { headers: CORS_HEADERS }
    );
  }

  const { jsonrpc = "2.0", id = 1, method, params } = body;

  // Verify account key
  const account = await getAccountByKey(key);
  if (!account) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32602,
          message:
            "This Vynter North link is invalid or was regenerated. Get a new one in Dashboard → Connect.",
        },
      },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    // 1. Initialize
    if (method === "initialize") {
      const clientVersion = params?.protocolVersion || "2025-06-18";
      await logMcpCall({
        account_id: account.id,
        method: "initialize",
        ok: true,
        ms: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: clientVersion,
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: "vynter-north",
              version: "1.0.0",
            },
          },
        },
        { headers: CORS_HEADERS }
      );
    }

    // 2. Initialized notification
    if (method === "notifications/initialized") {
      return new NextResponse(null, { status: 202, headers: CORS_HEADERS });
    }

    // 3. Ping
    if (method === "ping") {
      return NextResponse.json(
        { jsonrpc: "2.0", id, result: {} },
        { headers: CORS_HEADERS }
      );
    }

    // 4. Tools List (Section 12.3: 6 tools)
    if (method === "tools/list") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id,
          result: {
            tools: [
              {
                name: "list_my_characters",
                description:
                  "Lists the characters this studio can use right now, with status, credits and expiry.",
                inputSchema: {
                  type: "object",
                  properties: {},
                },
              },
              {
                name: "check_character",
                description:
                  "Input character name or CVR ID. Returns access type, credits, expiry, and a short vibe line.",
                inputSchema: {
                  type: "object",
                  properties: {
                    character: {
                      type: "string",
                      description: "Character name (e.g. Cairo) or CVR ID (e.g. CVR-2026-00001)",
                    },
                  },
                  required: ["character"],
                },
              },
              {
                name: "enrich_scene",
                description:
                  "Use this whenever the user wants a scene involving one of their Vynter North characters. Pass only the part of the user's request that describes what happens. Do not add feelings, personality or acting notes — Vynter North's server adds the character's real behaviour from a private profile. Call once per character. Return the enriched_prompt to the user exactly as given, then ask whether to keep it, retry, or discard.",
                inputSchema: {
                  type: "object",
                  properties: {
                    character: {
                      type: "string",
                      description: "Character name or CVR ID",
                    },
                    scene: {
                      type: "string",
                      description: "The scene describing only what physically happens",
                    },
                    scene_group: {
                      type: "string",
                      description: "Optional UUID to group retries together for free previews",
                    },
                    also_present: {
                      type: "array",
                      items: { type: "string" },
                      description: "Optional list of other characters present in the scene",
                    },
                  },
                  required: ["character", "scene"],
                },
              },
              {
                name: "keep_generation",
                description:
                  "Accepts and saves a generated scene, charging one generation credit.",
                inputSchema: {
                  type: "object",
                  properties: {
                    generation_id: {
                      type: "string",
                      description: "The UUID of the generation to keep",
                    },
                  },
                  required: ["generation_id"],
                },
              },
              {
                name: "discard_generation",
                description:
                  "Discards a preview generation without charging any generation credit.",
                inputSchema: {
                  type: "object",
                  properties: {
                    generation_id: {
                      type: "string",
                      description: "The UUID of the generation to discard",
                    },
                  },
                  required: ["generation_id"],
                },
              },
              {
                name: "account_status",
                description:
                  "Returns credits across rentals, active leases, and upcoming expiries for this studio account.",
                inputSchema: {
                  type: "object",
                  properties: {},
                },
              },
            ],
          },
        },
        { headers: CORS_HEADERS }
      );
    }

    // 5. Tools Call
    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};

      // 1) list_my_characters
      if (toolName === "list_my_characters") {
        const rentals = await getRentalsByStudio(account.id);
        const characters = await getCharacters({ status: "active" });

        if (rentals.length === 0) {
          const text =
            "You have no active character rentals yet.\n\nBrowse available talent in the marketplace: /marketplace\nOr try our free demo characters: /demo";
          await logMcpCall({
            account_id: account.id,
            tool: toolName,
            ok: true,
            ms: Date.now() - startTime,
          });
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              result: { content: [{ type: "text", text }] },
            },
            { headers: CORS_HEADERS }
          );
        }

        const lines: string[] = ["YOUR ACCESSIBLE CHARACTERS:"];
        for (const r of rentals) {
          const char = characters.find((c) => c.id === r.character_id);
          if (!char) continue;
          const creditsLeft = Math.max(0, r.credits_total - r.credits_used);
          const expiry = r.expires_at
            ? new Date(r.expires_at).toLocaleDateString()
            : "Unlimited";
          lines.push(
            `• ${char.name} (${char.id}) — ${char.vibe_summary || "Active"}\n  Status: ${r.kind.toUpperCase()} | Credits left: ${creditsLeft} | Expiry: ${expiry}`
          );
        }

        await logMcpCall({
          account_id: account.id,
          tool: toolName,
          ok: true,
          ms: Date.now() - startTime,
        });

        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: { content: [{ type: "text", text: lines.join("\n\n") }] },
          },
          { headers: CORS_HEADERS }
        );
      }

      // 2) check_character
      if (toolName === "check_character") {
        const query = (args.character || "").trim();
        const accessCheck = await getAccess(account.id, query);

        if ("denied" in accessCheck) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              result: {
                content: [{ type: "text", text: accessCheck.message }],
              },
            },
            { headers: CORS_HEADERS }
          );
        }

        const char = accessCheck.character;
        const rental = accessCheck.rental;
        const credits = rental ? rental.credits_total - rental.credits_used : "Unlimited";
        const expiry = rental?.expires_at ? new Date(rental.expires_at).toLocaleDateString() : "Active";

        const text = `CHARACTER: ${char.name} (${char.id})\nVibe: ${char.vibe_summary || "Active"}\nAccess: ${accessCheck.access.toUpperCase()}\nCredits remaining: ${credits}\nExpiry: ${expiry}`;

        await logMcpCall({
          account_id: account.id,
          tool: toolName,
          character_id: char.id,
          ok: true,
          ms: Date.now() - startTime,
        });

        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: { content: [{ type: "text", text }] },
          },
          { headers: CORS_HEADERS }
        );
      }

      // 3) enrich_scene
      if (toolName === "enrich_scene") {
        const charQuery = (args.character || "").trim();
        const sceneText = (args.scene || "").trim();
        const sceneGroup = args.scene_group || crypto.randomUUID();

        const accessCheck = await getAccess(account.id, charQuery);
        if ("denied" in accessCheck) {
          await logMcpCall({
            account_id: account.id,
            tool: toolName,
            ok: false,
            error: accessCheck.message,
            ms: Date.now() - startTime,
          });
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              result: {
                content: [{ type: "text", text: accessCheck.message }],
              },
            },
            { headers: CORS_HEADERS }
          );
        }

        const char = accessCheck.character;
        const rental = accessCheck.rental;

        // Check retries count in this scene group (Section 9.2: up to 10 free previews per group)
        const previewsInGroup = await countSceneGroupGenerations(sceneGroup);
        const shouldChargeNow = previewsInGroup >= 10;

        if (shouldChargeNow && rental) {
          await updateRental(rental.id, {
            credits_used: rental.credits_used + 1,
          });
        }

        const enriched = await enrichScene({
          character: char,
          scene: sceneText,
          settings: rental?.settings,
        });

        // Create generation record with status: 'preview'
        const generation = await createGeneration({
          rental_id: rental?.id || null,
          character_id: char.id,
          account_id: account.id,
          scene_group: sceneGroup,
          source: "mcp",
          scene_text: sceneText,
          enriched_prompt: enriched.enriched_prompt,
          breakdown: enriched.behavior_breakdown,
          analysis: enriched.scene_analysis,
          status: "preview",
          charged: shouldChargeNow,
        });

        const creditsRemaining = rental
          ? Math.max(0, rental.credits_total - rental.credits_used - (shouldChargeNow ? 1 : 0))
          : "Unlimited";
        const retriesRemaining = Math.max(0, 10 - previewsInGroup);

        const responseText = `CHARACTER: ${char.name} (${char.id}) | SCENE TYPE: ${enriched.scene_analysis.primary_category.toUpperCase()}
Credits remaining: ${creditsRemaining} | Free retries left in this scene: ${retriesRemaining}
Generation ID: ${generation.id}

ENRICHED PROMPT:
━━━━━━━━━━━━━
${enriched.enriched_prompt}
━━━━━━━━━━━━━

BEHAVIOUR NOTES:
• Face: ${enriched.facial_expression}
• Posture: ${enriched.body_language}
• Internal: ${enriched.emotional_state}
• Delivery: ${enriched.dialogue_direction}

(To accept this generation and use 1 credit, tell Claude: "Keep generation ${generation.id}". To try another variation for free, say "Retry".)`;

        await logMcpCall({
          account_id: account.id,
          tool: toolName,
          character_id: char.id,
          ok: true,
          ms: Date.now() - startTime,
        });

        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: responseText }],
            },
          },
          { headers: CORS_HEADERS }
        );
      }

      // 4) keep_generation
      if (toolName === "keep_generation") {
        const genId = (args.generation_id || "").trim();
        const gen = await getGenerationById(genId);

        if (!gen) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              result: { content: [{ type: "text", text: "Generation not found." }] },
            },
            { headers: CORS_HEADERS }
          );
        }

        if (gen.status === "kept") {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              result: { content: [{ type: "text", text: "Generation already accepted." }] },
            },
            { headers: CORS_HEADERS }
          );
        }

        await updateGeneration(gen.id, { status: "kept", charged: true });
        if (gen.rental_id && !gen.charged) {
          const rental = (await getRentalsByStudio(account.id)).find((r) => r.id === gen.rental_id);
          if (rental) {
            await updateRental(rental.id, { credits_used: rental.credits_used + 1 });
          }
        }

        await logMcpCall({
          account_id: account.id,
          tool: toolName,
          character_id: gen.character_id,
          ok: true,
          ms: Date.now() - startTime,
        });

        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: "Generation accepted. 1 credit charged." }],
            },
          },
          { headers: CORS_HEADERS }
        );
      }

      // 5) discard_generation
      if (toolName === "discard_generation") {
        const genId = (args.generation_id || "").trim();
        const gen = await getGenerationById(genId);
        if (gen) {
          await updateGeneration(gen.id, { status: "discarded" });
        }

        await logMcpCall({
          account_id: account.id,
          tool: toolName,
          ok: true,
          ms: Date.now() - startTime,
        });

        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: "Generation discarded. No credits charged." }],
            },
          },
          { headers: CORS_HEADERS }
        );
      }

      // 6) account_status
      if (toolName === "account_status") {
        const rentals = await getRentalsByStudio(account.id);
        const characters = await getCharacters();

        const totalCredits = rentals.reduce((acc, r) => acc + (r.credits_total - r.credits_used), 0);
        const lines = [
          `STUDIO ACCOUNT: @${account.username}`,
          `Total active generation credits: ${totalCredits}`,
          `Active rented characters: ${rentals.length}`,
        ];

        for (const r of rentals) {
          const char = characters.find((c) => c.id === r.character_id);
          lines.push(
            `• ${char?.name || r.character_id}: ${r.credits_total - r.credits_used} credits | Exp: ${
              r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "Permanent"
            }`
          );
        }

        await logMcpCall({
          account_id: account.id,
          tool: toolName,
          ok: true,
          ms: Date.now() - startTime,
        });

        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: { content: [{ type: "text", text: lines.join("\n") }] },
          },
          { headers: CORS_HEADERS }
        );
      }

      // Unknown tool
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${toolName}` },
        },
        { headers: CORS_HEADERS }
      );
    }

    // Default unknown RPC method
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Procedure not found: ${method}` },
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("MCP RPC error:", err);
    await logMcpCall({
      account_id: account.id,
      ok: false,
      error: err.message,
      ms: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id,
        error: { code: -32603, message: `Internal error: ${err.message}` },
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
