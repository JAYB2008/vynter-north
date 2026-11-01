import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getOfferById,
  updateOfferStatus,
  getCharacterById,
  updateCharacter,
  createTransaction,
  createNotification,
} from "@/lib/db";

export const dynamic = "force-dynamic";

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
    const body = await req.json().catch(() => ({}));
    const { action, counter_amount_cents, counter_message } = body; // 'accept' | 'decline' | 'counter'

    const offer = await getOfferById(id);
    if (!offer) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Offer not found." } },
        { status: 404 }
      );
    }

    const character = await getCharacterById(offer.character_id);
    if (!character) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Associated character not found." } },
        { status: 404 }
      );
    }

    if (action === "accept") {
      // Mark offer accepted
      await updateOfferStatus(id, "accepted");

      // Mark character sold to buyer (Section 8.3 & 9.1)
      await updateCharacter(character.id, {
        status: "sold",
        buyer_id: offer.studio_id,
        sale_enabled: false,
      });

      // Log transaction with 20% fee
      const platformFee = Math.round(offer.amount_cents * 0.2);
      await createTransaction({
        payer_id: offer.studio_id,
        payee_id: character.owner_id,
        character_id: character.id,
        kind: "purchase",
        amount_cents: offer.amount_cents,
        platform_fee_cents: platformFee,
        mode: "test",
      });

      // Notify studio
      await createNotification({
        account_id: offer.studio_id,
        type: "offer_accepted",
        title: "Offer Accepted! Character Acquired",
        body: `Your buyout offer of $${(offer.amount_cents / 100).toFixed(0)} for ${character.name} was accepted. The character is now in your library permanently.`,
        link: `/studio/library`,
      });

      return NextResponse.json({
        ok: true,
        data: { message: "Offer accepted. Character sold and transferred." },
      });
    } else if (action === "decline") {
      await updateOfferStatus(id, "declined");
      await createNotification({
        account_id: offer.studio_id,
        type: "offer_declined",
        title: "Offer Declined",
        body: `The creator declined your offer for ${character.name}.`,
        link: `/characters/${character.id}`,
      });
      return NextResponse.json({
        ok: true,
        data: { message: "Offer declined." },
      });
    } else if (action === "counter") {
      await updateOfferStatus(
        id,
        "countered",
        counter_amount_cents,
        counter_message,
        session.id
      );
      await createNotification({
        account_id: offer.studio_id,
        type: "offer_countered",
        title: "Counter-Offer Received",
        body: `The creator countered with $${((counter_amount_cents || 0) / 100).toFixed(0)} for ${character.name}.`,
        link: `/studio/offers`,
      });
      return NextResponse.json({
        ok: true,
        data: { message: "Counter-offer sent." },
      });
    }

    return NextResponse.json(
      { ok: false, error: { code: "INVALID_ACTION", message: "Invalid action." } },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "ACTION_FAILED", message: err.message || "Failed to update offer." } },
      { status: 500 }
    );
  }
}
