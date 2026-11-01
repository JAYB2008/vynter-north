import { NextRequest, NextResponse } from "next/server";
import { getCastingCalls, createCastingCall } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studio_id = searchParams.get("studio_id") || undefined;
    const calls = await getCastingCalls(studio_id);

    return NextResponse.json({
      ok: true,
      data: { calls },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "FETCH_FAILED", message: err.message || "Failed to fetch casting calls." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { title, description, genres = [], budget_cents = 0, deadline, min_tier = "newcomer" } = body;

    if (!title || !description) {
      return NextResponse.json(
        { ok: false, error: { code: "BAD_REQUEST", message: "Title and description are required." } },
        { status: 400 }
      );
    }

    const call = await createCastingCall({
      studio_id: session.id,
      title: title.trim(),
      description: description.trim(),
      genres,
      budget_cents: Math.max(0, parseInt(budget_cents) || 0),
      deadline: deadline || null,
      min_tier,
      status: "open",
    });

    return NextResponse.json({
      ok: true,
      data: { call },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "CREATION_FAILED", message: err.message || "Failed to post casting call." } },
      { status: 500 }
    );
  }
}
