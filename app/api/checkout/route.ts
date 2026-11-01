import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/auth";
import {
  getCharacterById,
  updateCharacter,
  createRental,
  getRentalsByStudio,
  createTransaction,
  createNotification,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const account = await requireAccount();
    const body = await req.json();
    const {
      character_id,
      kind = "rental",
      period = "1d",
      price_cents = 0,
    } = body;

    const character = await getCharacterById(character_id);
    if (!character) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Character not found." } },
        { status: 404 }
      );
    }

    if (character.status !== "active" && kind !== "trial") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AVAILABLE",
            message: `This character is currently ${character.status} and cannot be rented.`,
          },
        },
        { status: 409 }
      );
    }

    // 1. Trial Check: Once per studio per character
    if (kind === "trial") {
      const existingRentals = await getRentalsByStudio(account.id);
      const usedTrial = existingRentals.some(
        (r) => r.character_id.toUpperCase() === character.id.toUpperCase() && r.kind === "trial"
      );
      if (usedTrial) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "TRIAL_ALREADY_USED",
              message: "You have already used your 3-day free trial on this character.",
            },
          },
          { status: 409 }
        );
      }

      // 3 days, 15 credits
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const graceEndsAt = new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000).toISOString();

      const rental = await createRental({
        character_id: character.id,
        studio_id: account.id,
        kind: "trial",
        period: "3d",
        starts_at: now.toISOString(),
        expires_at: expiresAt,
        grace_ends_at: graceEndsAt,
        credits_total: 15,
        price_cents: 0,
      });

      await createNotification({
        account_id: character.owner_id,
        type: "trial_started",
        title: "New Character Trial",
        body: `@${account.username} started a 3-day trial on ${character.name}.`,
        link: `/dashboard/characters/${character.id}`,
      });

      return NextResponse.json({
        ok: true,
        data: { rental_id: rental.id, rental, kind: "trial" },
      });
    }

    // 2. Paid Rental or Free or Purchase
    const now = new Date();
    let credits = 50;
    let durationDays = 1;

    if (kind === "free") {
      credits = 100;
      durationDays = 3650; // 10 years
    } else if (kind === "purchase") {
      credits = 99999;
      durationDays = 36500; // lifetime
    } else if (period === "7d") {
      credits = 200;
      durationDays = 7;
    } else if (period === "30d") {
      credits = 500;
      durationDays = 30;
    }

    const expiresAt =
      kind === "purchase" || kind === "free"
        ? null
        : new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const graceEndsAt = expiresAt
      ? new Date(new Date(expiresAt).getTime() + 10 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const rental = await createRental({
      character_id: character.id,
      studio_id: account.id,
      kind: kind as any,
      period: period as any,
      starts_at: now.toISOString(),
      expires_at: expiresAt,
      grace_ends_at: graceEndsAt,
      credits_total: credits,
      price_cents,
    });

    // If purchase: mark character sold and assign buyer_id
    if (kind === "purchase") {
      await updateCharacter(character.id, {
        status: "sold",
        buyer_id: account.id,
        sale_enabled: false,
      });
    }

    // Log transaction with 20% platform fee
    const platformFee = Math.round(price_cents * 0.20);
    await createTransaction({
      payer_id: account.id,
      payee_id: character.owner_id,
      character_id: character.id,
      kind: kind === "purchase" ? "purchase" : "rental",
      amount_cents: price_cents,
      platform_fee_cents: platformFee,
      mode: "test",
    });

    // Notify creator
    await createNotification({
      account_id: character.owner_id,
      type: kind === "purchase" ? "character_sold" : "character_rented",
      title: kind === "purchase" ? "Character Purchased!" : "Character Rented",
      body: `@${account.username} ${kind === "purchase" ? "purchased" : `rented (${period})`} ${character.name} for $${(price_cents / 100).toFixed(2)}.`,
      link: `/dashboard/characters/${character.id}`,
    });

    return NextResponse.json({
      ok: true,
      data: { rental_id: rental.id, rental, kind },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "CHECKOUT_FAILED", message: error.message || "Checkout failed." },
      },
      { status: 500 }
    );
  }
}
