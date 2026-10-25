import { NextRequest, NextResponse } from "next/server";
import {
  enrichSceneWithNvidia,
  VALID_ACCOUNT_KEY,
} from "@/lib/enrichmentService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { scene, characterId, accountKey } = body as {
      scene?: string;
      characterId?: string;
      accountKey?: string;
    };

    // 1. Validate accountKey
    if (!accountKey || accountKey.trim() !== VALID_ACCOUNT_KEY) {
      return NextResponse.json(
        {
          error: "Unauthorized accountKey. Please provide a valid account key (e.g. 'vn-test-key-001').",
        },
        { status: 401 }
      );
    }

    // 2. Validate scene
    if (!scene || typeof scene !== "string" || !scene.trim()) {
      return NextResponse.json(
        { error: "Field 'scene' is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    // 3. Perform enrichment with NVIDIA NIM
    const result = await enrichSceneWithNvidia({
      scene: scene.trim(),
      characterId,
      accountKey: accountKey.trim(),
    });

    // Return the parsed JSON response
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error in /api/enrich:", error);
    const message =
      error instanceof Error ? error.message : "Character enrichment failed";
    const status = message.includes("Unauthorized") ? 401 : 500;

    return NextResponse.json(
      {
        error: message,
      },
      { status }
    );
  }
}
