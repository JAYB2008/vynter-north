import { NextResponse } from "next/server";
import { updateAccount } from "@/lib/db";

/**
 * Testing-mode profile sync.
 * Name-based accounts live in the browser; this mirrors them into the
 * server profile store so MCP account keys and rentals resolve.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.id || typeof body.id !== "string") {
      return NextResponse.json({ error: "Profile id is required." }, { status: 400 });
    }
    if (body.account_key && !/^vn-[a-f0-9]{20,64}$/.test(body.account_key)) {
      return NextResponse.json({ error: "Invalid account key format." }, { status: 400 });
    }

    const profile = await updateAccount(body.id, {
      display_name: String(body.display_name || "").slice(0, 80),
      bio: body.bio ?? null,
      avatar_url: body.avatar_url ?? null,
    });

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to sync profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
