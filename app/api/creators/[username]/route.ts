import { NextRequest, NextResponse } from "next/server";
import { getAccountByUsername, getCharacters } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    if (!username) {
      return NextResponse.json(
        { ok: false, error: { code: "BAD_REQUEST", message: "Username is required." } },
        { status: 400 }
      );
    }

    const account = await getAccountByUsername(username);
    if (!account) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Creator not found." } },
        { status: 404 }
      );
    }

    // Get active characters for this creator
    const characters = await getCharacters({
      owner_id: account.id,
      status: "active",
    });

    // Strip sensitive fields
    const safeAccount = {
      id: account.id,
      username: account.username,
      display_name: account.display_name,
      bio: account.bio || null,
      avatar_url: account.avatar_url || null,
      website: account.website || null,
      creator_specialties: account.creator_specialties || [],
      verification_status: account.verification_status || "none",
      created_at: account.created_at,
    };

    return NextResponse.json({
      ok: true,
      data: {
        creator: safeAccount,
        characters,
      },
    });
  } catch (err: any) {
    console.error("GET /api/creators/[username] error:", err);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: err.message || "Failed to load creator profile" } },
      { status: 500 }
    );
  }
}
