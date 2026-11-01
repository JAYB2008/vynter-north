import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getReviews,
  createReview,
  getRentalById,
  getCharacterById,
  recalculateCharacterFame,
  createNotification,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get("character_id");

    if (!characterId) {
      return NextResponse.json(
        { ok: false, error: { code: "BAD_REQUEST", message: "character_id is required" } },
        { status: 400 }
      );
    }

    const reviews = await getReviews(characterId);
    return NextResponse.json({ ok: true, data: reviews });
  } catch (err: any) {
    console.error("GET /api/reviews error:", err);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: err.message || "Failed to load reviews" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to submit a review." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      rental_id,
      rating_consistency,
      rating_depth,
      rating_value,
      rating_overall,
      review_body,
      production_type,
      would_rent_again,
    } = body;

    if (!rental_id) {
      return NextResponse.json(
        { ok: false, error: { code: "BAD_REQUEST", message: "rental_id is required." } },
        { status: 400 }
      );
    }

    const rental = await getRentalById(rental_id);
    if (!rental) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Rental not found." } },
        { status: 404 }
      );
    }

    if (rental.studio_id !== session.id) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "You can only review rentals from your studio." } },
        { status: 403 }
      );
    }

    // Eligibility check per Section 9.5: eligible only after rental has ended (expired, grace, or ended_early)
    const now = new Date();
    const isExpired = rental.expires_at ? new Date(rental.expires_at) < now : false;
    const isEligible = isExpired || rental.ended_early;

    if (!isEligible) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_ELIGIBLE",
            message: "Reviews are available once the rental period has concluded.",
          },
        },
        { status: 400 }
      );
    }

    if (
      !rating_consistency ||
      !rating_depth ||
      !rating_value ||
      !rating_overall ||
      rating_consistency < 1 || rating_consistency > 5 ||
      rating_depth < 1 || rating_depth > 5 ||
      rating_value < 1 || rating_value > 5 ||
      rating_overall < 1 || rating_overall > 5
    ) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_RATINGS", message: "All 4 ratings must be between 1 and 5 stars." } },
        { status: 400 }
      );
    }

    const text = (review_body || "").trim();
    if (text.length < 50) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "REVIEW_TOO_SHORT",
            message: "Please write at least 50 characters describing your experience with the character.",
          },
        },
        { status: 400 }
      );
    }

    const validWouldRent = ["yes", "no", "maybe"].includes(would_rent_again) ? would_rent_again : "yes";

    const newReview = await createReview({
      rental_id,
      character_id: rental.character_id,
      studio_id: session.id,
      rating_consistency,
      rating_depth,
      rating_value,
      rating_overall,
      body: text,
      production_type: production_type || "Film / Short",
      would_rent_again: validWouldRent,
    });

    // Recompute character fame score
    await recalculateCharacterFame(rental.character_id);

    // Notify character owner
    const char = await getCharacterById(rental.character_id);
    if (char && char.owner_id !== session.id) {
      await createNotification({
        account_id: char.owner_id,
        type: "new_review",
        title: "New review received",
        body: `${session.display_name} reviewed ${char.name} (${rating_overall}★): "${text.slice(0, 80)}..."`,
        link: `/dashboard/characters/${char.id}`,
      });
    }

    return NextResponse.json({ ok: true, data: newReview });
  } catch (err: any) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: err.message || "Failed to submit review" } },
      { status: 500 }
    );
  }
}
