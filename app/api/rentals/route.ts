import { NextRequest, NextResponse } from "next/server";
import { getRentalsByStudio, getCharacterById } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } },
        { status: 401 }
      );
    }

    const rawRentals = await getRentalsByStudio(session.id);
    const rentals = await Promise.all(
      rawRentals.map(async (r) => {
        const character = await getCharacterById(r.character_id);
        return {
          ...r,
          character: character || undefined,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      data: { rentals },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "FETCH_FAILED", message: err.message || "Failed to fetch studio rentals." },
      },
      { status: 500 }
    );
  }
}
