import { NextRequest, NextResponse } from "next/server";
import { getRentalById, updateRental, getCharacterById } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rental = await getRentalById(id);
    if (!rental) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Rental record not found." } },
        { status: 404 }
      );
    }
    const character = await getCharacterById(rental.character_id);

    return NextResponse.json({
      ok: true,
      data: { rental, character },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "FETCH_FAILED", message: err.message || "Failed to fetch rental." },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const rental = await getRentalById(id);
    if (!rental) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Rental not found." } },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const updates: any = {};

    // Behavior controls update (Section 9.4)
    if (body.settings) {
      updates.settings = { ...rental.settings, ...body.settings };
    }

    // "End rental now" test helper (Section 9.3)
    if (body.end_early) {
      const now = new Date().toISOString();
      updates.expires_at = now;
      updates.ended_early = true;
    }

    const updated = await updateRental(id, updates);

    return NextResponse.json({
      ok: true,
      data: { rental: updated },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "UPDATE_FAILED", message: err.message || "Failed to update rental." },
      },
      { status: 500 }
    );
  }
}
