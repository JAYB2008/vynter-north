import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createOffer,
  getOffersByStudio,
  getOffersByCreator,
  getCharacterById,
  createNotification,
} from "@/lib/db";

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

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || session.active_mode || "studio";

    let offers = [];
    if (role === "creator") {
      offers = await getOffersByCreator(session.id);
    } else {
      offers = await getOffersByStudio(session.id);
    }

    return NextResponse.json({
      ok: true,
      data: { offers },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "FETCH_FAILED", message: err.message || "Failed to fetch offers." } },
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
    const { character_id, amount_cents, message } = body;

    if (!character_id || !amount_cents) {
      return NextResponse.json(
        { ok: false, error: { code: "BAD_REQUEST", message: "character_id and amount_cents are required." } },
        { status: 400 }
      );
    }

    const character = await getCharacterById(character_id);
    if (!character) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Character not found." } },
        { status: 404 }
      );
    }

    if (!character.sale_enabled && !character.accept_offers) {
      return NextResponse.json(
        { ok: false, error: { code: "OFFERS_CLOSED", message: "This character is not open for buyout offers." } },
        { status: 403 }
      );
    }

    const offer = await createOffer({
      character_id,
      studio_id: session.id,
      amount_cents,
      message,
    });

    // Notify creator
    await createNotification({
      account_id: character.owner_id,
      type: "offer_received",
      title: "New Buyout Offer",
      body: `@${session.username} submitted an offer of $${(amount_cents / 100).toFixed(0)} for ${character.name}.`,
      link: `/dashboard/offers`,
    });

    return NextResponse.json({
      ok: true,
      data: { offer },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "OFFER_FAILED", message: err.message || "Failed to submit offer." } },
      { status: 500 }
    );
  }
}
