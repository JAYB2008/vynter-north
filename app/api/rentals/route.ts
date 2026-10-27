import { NextRequest, NextResponse } from "next/server";
import {
  createRental,
  getRentalsByStudioId,
  getProfileByAccountKey,
  DEMO_STUDIO,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studioId = searchParams.get("studioId") || DEMO_STUDIO.id;
    const rentals = await getRentalsByStudioId(studioId);
    return NextResponse.json({ rentals });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch rentals" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { character_id, rental_type = "monthly", studio_id, account_key } = body;

    if (!character_id) {
      return NextResponse.json(
        { error: "character_id is required" },
        { status: 400 }
      );
    }

    let studioUser = null;
    if (account_key) {
      studioUser = await getProfileByAccountKey(account_key);
    }
    const finalStudioId = studioUser?.id || studio_id || DEMO_STUDIO.id;

    // Credit allocation tiers
    let credits = 100;
    let pricePaid = 0;
    if (rental_type === "free" || rental_type === "trial") {
      credits = 15;
      pricePaid = 0;
    } else if (rental_type === "daily") {
      credits = 50;
      pricePaid = 15;
    } else if (rental_type === "weekly") {
      credits = 200;
      pricePaid = 65;
    } else if (rental_type === "monthly") {
      credits = 500;
      pricePaid = 200;
    } else if (rental_type === "purchase") {
      credits = 99999;
      pricePaid = 2500;
    }

    const rental = await createRental({
      character_id,
      studio_id: finalStudioId,
      rental_type: rental_type === "trial" ? "free" : rental_type,
      price_paid: pricePaid,
      generation_credits: credits,
    });

    return NextResponse.json({
      success: true,
      rental,
      message: `Rental activated. Your MCP token is ready.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to activate rental" },
      { status: 500 }
    );
  }
}
