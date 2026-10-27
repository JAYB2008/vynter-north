import {
  getProfileByAccountKey,
  getRentalsByStudioId,
  getCharacterByName,
  getAllCharacters,
  DEMO_STUDIO,
} from "./db";
import { enrichScene } from "./enrichment";

export const MCP_SERVER_INFO = {
  name: "vynter-north",
  version: "1.0.0",
  description:
    "AI Character Intelligence Layer — transforms scene descriptions into character-specific behavioral prompts using registered character personality profiles",
};

export const MCP_TOOLS = [
  {
    name: "list_characters",
    description:
      "List all AI characters available on your Vynter North account. Shows character names, personality summaries, and rental status.",
    inputSchema: {
      type: "object",
      properties: {
        account_key: {
          type: "string",
          description:
            "Your personal Vynter North account key found in Dashboard > Connect",
        },
      },
      required: ["account_key"],
    },
  },
  {
    name: "enrich_scene",
    description: `Transform a simple scene description into a full character-specific behavioral prompt for AI video generation.

HOW TO USE: Simply describe what happens in the scene. Do NOT describe how the character acts or feels — the system reads the character's complete personality profile automatically and adds all of that behavioral detail for you.

EXAMPLE: Instead of writing 'James nervously walks into the interview, fidgeting because he is anxious' just write 'James walks into a job interview'. The character's personality does the rest.`,
    inputSchema: {
      type: "object",
      properties: {
        account_key: {
          type: "string",
          description: "Your personal Vynter North account key",
        },
        character_name: {
          type: "string",
          description:
            "Name of the character to use. Must be a character you have rented or own.",
        },
        scene: {
          type: "string",
          description:
            "Describe ONLY what happens — the event, the location, who is present. Do not describe emotions or behavior. The character intelligence system adds all of that automatically.",
        },
      },
      required: ["account_key", "character_name", "scene"],
    },
  },
  {
    name: "check_character",
    description:
      "Check if a specific character is active and available for use on your account.",
    inputSchema: {
      type: "object",
      properties: {
        account_key: {
          type: "string",
          description: "Your personal Vynter North account key",
        },
        character_name: {
          type: "string",
          description: "Name of the character to verify",
        },
      },
      required: ["account_key", "character_name"],
    },
  },
];

export async function handleMcpRpc(body: any) {
  const { id = 1, method, params } = body || {};

  // 1. initialize
  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: MCP_SERVER_INFO,
      },
    };
  }

  // 2. tools/list
  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: MCP_TOOLS,
      },
    };
  }

  // 3. tools/call
  if (method === "tools/call") {
    const toolName = params?.name;
    const args = params?.arguments || {};
    const accountKey = args.account_key || args.accountKey || "vn-test-key-001";

    // Validate account
    const profile =
      (await getProfileByAccountKey(accountKey)) ||
      (accountKey === "vn-test-key-001" ? DEMO_STUDIO : null);

    if (!profile) {
      return {
        jsonrpc: "2.0",
        id,
        isError: true,
        error: {
          code: -32001,
          message:
            "Invalid account_key. Check your key in Vynter North Dashboard > Connect.",
        },
      };
    }

    if (toolName === "list_characters") {
      const rentals = await getRentalsByStudioId(profile.id);
      let characterListText = "";

      if (rentals.length > 0) {
        characterListText = rentals
          .map((r) => {
            const char = r.character;
            const creditsLeft = r.generation_credits - r.credits_used;
            return `• ${char?.name || "Character"} (${char?.id || "CVR"})\n  Vibe: ${
              char?.vibe_summary || "Active"
            }\n  Status: ${r.status} | Credits: ${creditsLeft} remaining | Expires: ${
              r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "Permanent/Free"
            }`;
          })
          .join("\n\n");
      } else {
        const allChars = await getAllCharacters();
        characterListText = allChars
          .map(
            (c) =>
              `• ${c.name} (${c.id})\n  Vibe: ${c.vibe_summary}\n  Price: ${
                c.is_free ? "Free" : `$${c.rental_price_daily}/day`
              }`
          )
          .join("\n\n");
      }

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: `VYNTER NORTH CHARACTERS (Account: ${profile.display_name})\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${characterListText}\n\nTo enrich a scene, use: enrich_scene(character_name, scene)`,
            },
          ],
        },
      };
    }

    if (toolName === "check_character") {
      const charName = args.character_name;
      if (!charName) {
        return {
          jsonrpc: "2.0",
          id,
          isError: true,
          error: { code: -32602, message: "Missing character_name" },
        };
      }

      const character = await getCharacterByName(charName);
      if (!character) {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: `Character '${charName}' was not found in the Vynter North registry.`,
              },
            ],
          },
        };
      }

      const rentals = await getRentalsByStudioId(profile.id);
      const rental = rentals.find(
        (r) =>
          r.character_id === character.id ||
          r.character?.name.toLowerCase() === character.name.toLowerCase()
      );

      const credits = rental
        ? rental.generation_credits - rental.credits_used
        : "N/A (Not rented)";
      const status = rental ? rental.status : "Available in Marketplace";

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: `CHARACTER VERIFICATION: ${character.name}\nID: ${character.id}\nVibe: ${character.vibe_summary}\nStatus: ${status}\nCredits Remaining: ${credits}\nAllowed Uses: ${character.allowed_uses.join(
                ", "
              )}`,
            },
          ],
        },
      };
    }

    if (toolName === "enrich_scene") {
      const charName = args.character_name;
      const scene = args.scene;

      if (!charName || !scene) {
        return {
          jsonrpc: "2.0",
          id,
          isError: true,
          error: {
            code: -32602,
            message: "Both character_name and scene are required.",
          },
        };
      }

      const character = await getCharacterByName(charName);
      if (!character) {
        return {
          jsonrpc: "2.0",
          id,
          isError: true,
          error: {
            code: -32004,
            message: `Character '${charName}' not found. Please verify the name using list_characters.`,
          },
        };
      }

      // Perform Character Intelligence Enrichment
      const enriched = await enrichScene({ character, scene });
      const b = enriched.behavior_breakdown;

      const outputText = `CHARACTER INTELLIGENCE COMPLETE

Character: ${character.name} (${character.id})
Vibe: ${character.vibe_summary}

ENRICHED PROMPT FOR VIDEO GENERATOR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${enriched.enriched_prompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEHAVIOR BREAKDOWN:
Face: ${b.facial_expression}
Body: ${b.body_language}
Internal: ${b.emotional_state}
Speech: ${b.dialogue_direction}

Word count: ${enriched.word_count.original} → ${enriched.word_count.enriched} (${enriched.word_count.multiplier}x enrichment)`;

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: outputText,
            },
          ],
        },
      };
    }

    return {
      jsonrpc: "2.0",
      id,
      isError: true,
      error: { code: -32601, message: `Tool not found: ${toolName}` },
    };
  }

  return {
    jsonrpc: "2.0",
    id,
    isError: true,
    error: { code: -32601, message: `Method not found: ${method}` },
  };
}
